import { ByteBuffer } from './byte-buffer.js'
import { DEFAULT_CHUNK_SIZE } from './defaults.js'
import { TooFewColumnsError, TooManyColumnsError } from './errors.js'
import { CsvStringify, CsvStringifyOptions } from './stringify.js'
import { ByteStream, CsvObjectShape, CsvString } from './types.js'
import { bytesToString } from './utils.js'

const UTF_8_BOM = [0xef, 0xbb, 0xbf]

/**
 * Map of character names to their byte values for CSV parsing.
 * Contains commonly used characters in CSV syntax.
 */
const BYTE_MAP = {
    quotes: 34,
    comma: 44,
    backslash: 92,
    space: 32,
    tab: 9,
    carriageReturn: 13,
    lineFeed: 10,
}

const isLineEnd = (byte: number | null): boolean => {
    return byte === BYTE_MAP.lineFeed || byte === BYTE_MAP.carriageReturn
}

/**
 * Options for configuring CSV entity parsing.
 */
export interface CsvEntityOptions {
    /** Character used to separate fields. Defaults to ',' */
    separator?: string
    /** Character used to escape special characters. Defaults to '"' */
    escapeChar?: string
    /** String used to denote new lines. Defaults to auto-detected '\r', '\n', or '\r\n' */
    newline?: string
    /** Whether to trim whitespace from fields. Defaults to false. NOTE: this option is not supported when streaming, as trimming requires buffering the entire field. */
    trim?: boolean
}

/**
 * Abstract base class for CSV entities that supports both synchronous and asynchronous parsing.
 * Provides common functionality for reading and streaming CSV data.
 *
 * @typeParam T - The type returned by read operations
 * @typeParam S - The type yielded by stream operations (defaults to T)
 */
export abstract class CsvEntity<T, S = T> {
    byteBuffer: ByteBuffer
    separator: string = ','
    escapeChar: string = '"'
    newline?: string
    trim: boolean = false
    consumed: boolean = false

    /**
     * Creates a new CSV entity.
     *
     * @param asyncIterable - Optional byte stream or buffer to parse
     * @param options - Configuration options for parsing
     */
    constructor(
        asyncIterable?: ByteStream | ByteBuffer,
        options?: CsvEntityOptions,
    ) {
        this.byteBuffer =
            asyncIterable instanceof ByteBuffer
                ? asyncIterable
                : new ByteBuffer(asyncIterable)

        if (options?.separator) {
            this.separator = options.separator
        }
        if (options?.escapeChar) {
            this.escapeChar = options.escapeChar
        }
        if (options?.trim !== undefined) {
            this.trim = options.trim
        }
        if (options?.newline !== undefined) {
            const newline = options.newline
            if (newline === '') {
                throw new Error(
                    'Invalid CSV newline: newline option must be a non-empty string.',
                )
            }
            if (newline.includes(this.separator)) {
                throw new Error(
                    'Invalid CSV newline: newline option must not contain the field separator character.',
                )
            }
            if (newline.includes(this.escapeChar)) {
                throw new Error(
                    'Invalid CSV newline: newline option must not contain the escape character.',
                )
            }
            this.newline = newline
        }
    }

    set maxBufferSize(size: number) {
        this.byteBuffer.maxBufferSize = size
    }

    get maxBufferSize(): number {
        return this.byteBuffer.maxBufferSize
    }

    set allowBufferToBeExceeded(value: boolean) {
        this.byteBuffer.allowBufferToBeExceeded = value
    }

    get allowBufferToBeExceeded(): boolean {
        return this.byteBuffer.allowBufferToBeExceeded
    }

    protected abstract parse(): T
    protected abstract parseAsync(): Promise<T>
    protected abstract streamImpl(): Generator<S>

    /**
     * Reads and parses the entire entity synchronously.
     * Marks the entity as consumed after reading.
     *
     * @returns The parsed result of type T
     */
    read(): T {
        const res = this.parse()
        this.consumed = true
        return res
    }

    /**
     * Reads and parses the entire entity asynchronously.
     * Marks the entity as consumed after reading.
     *
     * @returns A promise that resolves to the parsed result of type T
     */
    async readAsync(): Promise<T> {
        const res = await this.parseAsync()
        this.consumed = true
        return res
    }

    /**
     * Returns a synchronous generator that yields chunks of type S.
     * Marks the entity as consumed when iteration completes.
     *
     * @returns A generator that yields values of type S
     */
    *stream(): Generator<S> {
        const res = yield* this.streamImpl()
        this.consumed = true
        return res
    }

    /**
     * Returns an asynchronous generator that yields chunks of type S.
     * Handles buffering and automatically reads more data as needed.
     *
     * @returns An async generator that yields values of type S
     */
    async *streamAsync(): AsyncGenerator<S> {
        while (true) {
            const stream = this.stream()
            let currentChunk: IteratorResult<S> | undefined = undefined

            while (true) {
                currentChunk = this.byteBuffer.resetOnFail(() => stream.next())
                if (currentChunk === undefined) {
                    break // Need more data
                }
                if (currentChunk.done) {
                    return // No more data
                }
                yield currentChunk.value
            }

            await this.byteBuffer.readStreamAsync()
        }
    }

    /**
     * Consumes the entity if it hasn't been consumed yet.
     * This ensures the buffer advances to the end of this entity.
     */
    consume(): void {
        if (!this.consumed) {
            this.read()
        }
    }

    /**
     * Asynchronously consumes the entity if it hasn't been consumed yet.
     * This ensures the buffer advances to the end of this entity.
     *
     * @returns A promise that resolves when consumption is complete
     */
    async consumeAsync(): Promise<void> {
        if (!this.consumed) {
            await this.readAsync()
        }
    }

    /**
     * Makes this entity iterable using the synchronous stream.
     *
     * @returns A generator that yields values of type S
     */
    [Symbol.iterator](): Generator<S> {
        return this.stream()
    }

    /**
     * Makes this entity async iterable using the asynchronous stream.
     *
     * @returns An async generator that yields values of type S
     */
    [Symbol.asyncIterator](): AsyncGenerator<S> {
        return this.streamAsync()
    }
}

/**
 * Represents a single CSV cell that can be read as a string or streamed in chunks.
 * Handles quoted cells and escape sequences according to CSV standards.
 */
export class CsvCell extends CsvEntity<string> {
    chunkSize: number = DEFAULT_CHUNK_SIZE
    endOfLineReached: boolean = false

    /**
     * Checks if the current buffer position starts with a line ending.
     * Supports both default line endings (\r, \n, \r\n) and custom newline strings.
     *
     * @returns true if at the start of a line ending, false otherwise
     */
    private isAtLineEnd(): boolean {
        if (this.newline !== undefined) {
            // Check for custom newline string
            for (let i = 0; i < this.newline.length; i++) {
                const expectedByte = this.newline.charCodeAt(i)
                const actualByte = this.byteBuffer.peek(i)
                if (actualByte === null || actualByte !== expectedByte) {
                    return false
                }
            }
            return true
        } else {
            // Default behavior: check for \r or \n
            return isLineEnd(this.byteBuffer.peek())
        }
    }

    /**
     * Consumes a line ending from the buffer.
     * Handles both default line endings (\r, \n, \r\n) and custom newline strings.
     * Should only be called after isAtLineEnd() returns true.
     */
    private consumeLineEnd(): void {
        if (this.newline !== undefined) {
            // Consume custom newline string - verify each byte matches
            for (let i = 0; i < this.newline.length; i++) {
                const expectedByte = this.newline.charCodeAt(i)
                const actualByte = this.byteBuffer.peek()
                if (actualByte === null || actualByte !== expectedByte) {
                    throw new Error(
                        'Invariant violation: consumeLineEnd called when not at line end',
                    )
                }
                this.byteBuffer.next()
            }
            this.endOfLineReached = true
        } else {
            // Default behavior: consume \r and/or \n
            while (isLineEnd(this.byteBuffer.peek())) {
                this.byteBuffer.next()
                this.endOfLineReached = true
            }
        }
    }

    protected parse(): string {
        let str = ''

        for (const part of this) {
            str += part
        }

        return this.trim ? str.trim() : str
    }

    protected async parseAsync(): Promise<string> {
        let str = ''

        for await (const part of this) {
            str += part
        }

        return this.trim ? str.trim() : str
    }

    /**
     * Reads the cell value and transforms it using the provided function.
     * Special handling for Boolean transformer: converts 'true'/'false' strings to boolean.
     *
     * @typeParam T - The type to transform the cell value into
     * @param transform - Function to transform the cell string into type T
     * @returns The transformed value of type T
     */
    readAs<T>(transform: (cell: string) => T): T {
        const cellStr = this.read()

        if ((transform as any) === Boolean) {
            return (String(cellStr).toLowerCase() === 'true') as any as T
        }

        return transform(cellStr)
    }

    /**
     * Asynchronously reads the cell value and transforms it using the provided function.
     * Special handling for Boolean transformer: converts 'true'/'false' strings to boolean.
     *
     * @typeParam T - The type to transform the cell value into
     * @param transform - Function to transform the cell string into type T (can be async)
     * @returns A promise that resolves to the transformed value of type T
     */
    async readAsAsync<T>(
        transform: (cell: string) => Promise<T> | T,
    ): Promise<T> {
        const cellStr = await this.readAsync()
        if ((transform as any) === Boolean) {
            return (cellStr.toLowerCase() === 'true') as any as T
        }
        return await transform(cellStr)
    }

    protected *streamImpl(): Generator<string> {
        const separator = this.separator.charCodeAt(0)
        const escapeChar = this.escapeChar.charCodeAt(0)
        let chunk: number[] = []
        let hadData: boolean = false
        let isEscaped = false

        const next = this.byteBuffer.peek()
        if (next === null && this.byteBuffer.eof) {
            throw new Error('No more data to read')
        }

        if (next === escapeChar) {
            isEscaped = true
            this.byteBuffer.expect(escapeChar) // consume opening quote
        }

        while (this.byteBuffer.peek() !== null) {
            const next = this.byteBuffer.peek()
            if (isEscaped) {
                if (next === escapeChar) {
                    // Possible end of quoted cell
                    const lookahead = this.byteBuffer.peek(1)
                    if (lookahead === escapeChar) {
                        // Escaped quote
                        this.byteBuffer.expect(escapeChar) // consume first quote
                        this.byteBuffer.expect(escapeChar) // consume second quote
                        chunk.push(escapeChar)
                        continue
                    } else {
                        // End of quoted cell
                        break
                    }
                }
            } else {
                if (next === separator || this.isAtLineEnd()) {
                    break
                }
            }

            const nextByte = this.byteBuffer.next()
            chunk.push(nextByte)
            if (chunk.length >= this.chunkSize) {
                yield bytesToString(new Uint8Array(chunk))
                chunk = []
                hadData = true
            }
        }

        if (isEscaped) {
            this.byteBuffer.expect(escapeChar) // consume closing quote
        }

        if (this.byteBuffer.peek() === separator) {
            this.byteBuffer.expect(separator) // consume separator
        }

        if (this.isAtLineEnd()) {
            this.consumeLineEnd()
        }

        if (!hadData || chunk.length > 0)
            yield bytesToString(new Uint8Array(chunk))
    }
}

/**
 * Options for reading a CSV row as an object.
 *
 * @typeParam T - The object type with headers as keys
 * @typeParam O - The output type after optional transformation (defaults to T)
 */
export interface CsvRowObjectOptions<T extends object, I = unknown> {
    /** Headers for the CSV row */
    headers: string[]
    /** Shape definition mapping headers to type transformers, or an array of header names */
    shape?: CsvObjectShape<T>
    /** Optional row index for error messages */
    rowIndex?: number
    /** Whether to include extra cells beyond defined headers. Defaults to false */
    includeExtraCells?: boolean
    /** Whether to enforce exact column count matching headers. Defaults to false */
    strictColumns?: boolean
    /** Optional function to transform the parsed row object */
    transform?: (row: I) => T
}

/**
 * Represents a single CSV row that can be read as an array of strings or streamed as individual cells.
 * Can also be parsed into an object using a shape definition.
 *
 * @typeParam T - The object type when reading as an object
 * @typeParam O - The output type after optional transformation (defaults to T)
 */
export class CsvRow<T extends object = object, I = unknown> extends CsvEntity<
    string[],
    CsvCell
> {
    protected parse(): string[] {
        const cells: string[] = []
        for (const cell of this) {
            cells.push(cell.read())
        }
        return cells
    }

    protected async parseAsync(): Promise<string[]> {
        const cells: string[] = []
        for await (const cell of this) {
            cells.push(await cell.readAsync())
        }
        return cells
    }

    protected *streamImpl(): Generator<CsvCell> {
        while (this.byteBuffer.peek() !== null) {
            const cell = new CsvCell(this.byteBuffer, this)

            yield cell

            cell.consume() // Advance the buffer

            if (cell.endOfLineReached) {
                break
            }
        }
    }

    /**
     * Reads the row as an object using the provided shape definition.
     * Handles column count validation and extra cells based on options.
     *
     * @param options - Configuration for reading the row as an object
     * @returns The parsed object of type O
     * @throws {TooManyColumnsError} If strictColumns is true and extra cells are found
     * @throws {TooFewColumnsError} If strictColumns is true and cells are missing
     */
    readObject(options: CsvRowObjectOptions<T, I>): T {
        let { shape, headers } = options
        let obj: any = {}

        let i = 0
        const includeExtraCells = options?.includeExtraCells ?? false
        const strictColumns = options?.strictColumns ?? false

        if (Array.isArray(shape)) {
            shape = shape.reduce((acc, header) => {
                acc[header as keyof T] = String as any
                return acc
            }, {} as CsvObjectShape<T>)
        }

        for (const cell of this) {
            if (!includeExtraCells && i >= headers.length) {
                if (strictColumns) {
                    throw new TooManyColumnsError(
                        `Extra cells found${options?.rowIndex ? ` in row ${options.rowIndex}` : ''} but strictColumns is enabled`,
                    )
                }
                cell.consume()
            } else {
                const header =
                    i >= headers.length
                        ? `extra_cell_${i - headers.length + 1}`
                        : headers[i]

                obj[header] = cell.read()
            }

            i++

            if (cell.endOfLineReached) {
                break
            }
        }

        for (; i < headers.length; i++) {
            if (strictColumns) {
                throw new TooFewColumnsError(
                    `Not enough cells${options?.rowIndex ? ` in row ${options.rowIndex}` : ''} to match headers when strictColumns is enabled`,
                )
            }
            const header = headers[i]
            obj[header] = undefined
        }

        if (options.transform) {
            obj = options.transform(obj)
        }

        for (const transform in shape) {
            const transformer = shape[transform as keyof T]
            if (obj[transform] !== undefined) {
                if ((transformer as any) === Boolean) {
                    obj[transform] = String(obj[transform]) === 'true'
                } else {
                    obj[transform] = transformer(obj[transform])
                }
            }
        }

        this.consumed = true

        return obj as T
    }

    /**
     * Asynchronously reads the row as an object using the provided shape definition.
     * Automatically handles buffer refills as needed.
     *
     * @param options - Configuration for reading the row as an object
     * @returns A promise that resolves to the parsed object of type O
     */
    async readObjectAsync(options: CsvRowObjectOptions<T, I>): Promise<T> {
        while (true) {
            const value = this.byteBuffer.resetOnFail(() => {
                return this.readObject(options)
            })

            if (value !== undefined) {
                return value
            }

            await this.byteBuffer.readStreamAsync()
        }
    }
}

/**
 * Main CSV parser class for parsing complete CSV documents.
 * Supports reading headers, streaming rows, and converting rows to objects.
 *
 * @typeParam T - The object type for each row when reading as objects
 * @typeParam O - The output type after optional transformation (defaults to T)
 *
 * @example
 * ```typescript
 * // Parse CSV with headers
 * const csv = new Csv(fileStream)
 * for await (const row of csv.streamObjectsAsync()) {
 *   console.log(row)
 * }
 * ```
 */
export class Csv<T extends object, I = unknown> extends CsvEntity<
    T[],
    CsvRow<T, I>
> {
    includeExtraCells: boolean = false
    ignoreUtf8Bom: boolean = true
    headers?: string[]
    shape?: CsvObjectShape<T>
    readHeaders: boolean = true
    strictColumns: boolean = false
    transform?: (row: I) => T

    /**
     * Creates a new CSV parser.
     *
     * @param asyncIterable - Optional byte stream or buffer containing CSV data
     * @param options - Configuration options for CSV parsing
     * @throws {Error} If both headers and shape options are specified
     */
    constructor(
        asyncIterable?: ByteStream<T> | ByteBuffer,
        options?: CsvEntityOptions & {
            includeExtraCells?: boolean
            ignoreUtf8Bom?: boolean
            readHeaders?: boolean
            headers?: string[]
            shape?: CsvObjectShape<T>
            strictColumns?: boolean
            transform?: (row: I) => T
        },
    ) {
        super(asyncIterable, options)

        if (options?.includeExtraCells) {
            this.includeExtraCells = options.includeExtraCells
        }

        if (options?.ignoreUtf8Bom !== undefined) {
            this.ignoreUtf8Bom = options.ignoreUtf8Bom
        }

        if (options?.headers) {
            this.headers = options.headers
        }

        if (options?.readHeaders !== undefined) {
            this.readHeaders = options.readHeaders
        }

        if (options?.strictColumns !== undefined) {
            this.strictColumns = options.strictColumns
        }

        if (options?.shape && this.headers) {
            throw new Error('Cannot specify both headers and shape options')
        }

        this.shape = options?.shape
        this.transform = options?.transform
    }

    private readBom(): void {
        // Skip UTF-8 BOM if present
        while (
            this.ignoreUtf8Bom &&
            this.byteBuffer.peek() === UTF_8_BOM[0] &&
            this.byteBuffer.peek(1) === UTF_8_BOM[1] &&
            this.byteBuffer.peek(2) === UTF_8_BOM[2]
        ) {
            this.byteBuffer.next()
            this.byteBuffer.next()
            this.byteBuffer.next()
        }
    }

    protected parse(): T[] {
        return Array.from(this.streamObjects())
    }

    protected async parseAsync(): Promise<T[]> {
        const results: T[] = []
        for await (const obj of this.streamObjectsAsync()) {
            results.push(obj)
        }
        return results
    }

    protected *streamImpl(): Generator<CsvRow<T>> {
        // Skip UTF-8 BOM if present
        this.readBom()

        while (this.byteBuffer.peek() !== null) {
            const row = new CsvRow<T>(this.byteBuffer, this)
            yield row
            row.consume() // Advance the buffer
        }

        this.consumed = true
    }

    /**
     * Synchronously streams CSV rows as objects.
     * Reads headers from the first row if readHeaders is true.
     *
     * @returns A generator that yields parsed objects of type O
     *
     * @example
     * ```typescript
     * const csv = new Csv(csvString)
     * for (const row of csv.streamObjects()) {
     *   console.log(row)
     * }
     * ```
     */
    *streamObjects(): Generator<T> {
        const stream = this.stream()
        let headers: string[] = this.headers ?? []

        if (this.readHeaders) {
            const headerRow = stream.next()
            if (headerRow.done) {
                return // No data
            }
            const foundHeaders = headerRow.value.read()

            if (headers.length === 0) {
                headers = foundHeaders
            }
        }

        let rowIndex = this.readHeaders ? 2 : 1

        while (true) {
            const currentRow = stream.next()

            if (currentRow.done) {
                return // No more data
            }

            yield currentRow.value.readObject({
                headers: headers,
                shape: this.shape,
                includeExtraCells: this.includeExtraCells,
                strictColumns: this.strictColumns,
                rowIndex: rowIndex++,
                transform: this.transform,
            })
        }
    }

    /**
     * Asynchronously streams CSV rows as objects.
     * Automatically handles buffer refills as needed.
     *
     * @returns An async generator that yields parsed objects of type O
     *
     * @example
     * ```typescript
     * const csv = new Csv(fileStream)
     * for await (const row of csv.streamObjectsAsync()) {
     *   console.log(row)
     * }
     * ```
     */
    async *streamObjectsAsync(): AsyncGenerator<T> {
        while (true) {
            const stream = this.streamObjects()
            let currentRow: IteratorResult<T> | undefined = undefined

            while (true) {
                currentRow = this.byteBuffer.resetOnFail(() => stream.next())
                if (currentRow === undefined) {
                    break // Need more data
                }
                if (currentRow.done) {
                    return // No more data
                }
                yield currentRow.value
            }

            await this.byteBuffer.readStreamAsync()
        }
    }

    /**
     * Static method to stringify an array of objects into CSV format.
     * Returns a synchronous generator that yields CSV string chunks.
     *
     * @typeParam T - The input object type
     * @typeParam O - The output object type after optional transformation (defaults to T)
     * @param values - Array of objects to convert to CSV
     * @param options - Optional configuration for CSV stringification
     * @returns A generator that yields CSV string chunks
     *
     * @example
     * ```typescript
     * const data = [{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }]
     * for (const chunk of Csv.stringify(data, { headers: ['name', 'age'] })) {
     *   process.stdout.write(chunk)
     * }
     * ```
     */
    static stringify<T extends object, O extends object = T>(
        values: T[],
        options?: CsvStringifyOptions<T, T extends O ? T : O>,
    ): Generator<CsvString<T extends O ? T : O>> {
        return new CsvStringify(values, options).toStream()
    }

    /**
     * Static method to stringify an array of objects into CSV format asynchronously.
     * Returns an asynchronous generator that yields CSV string chunks.
     *
     * @typeParam T - The input object type
     * @typeParam O - The output object type after optional transformation (defaults to T)
     * @param values - Array of objects to convert to CSV
     * @param options - Optional configuration for CSV stringification
     * @returns An async generator that yields CSV string chunks
     *
     * @example
     * ```typescript
     * const data = [{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }]
     * for await (const chunk of Csv.stringifyAsync(data)) {
     *   process.stdout.write(chunk)
     * }
     * ```
     */
    static stringifyAsync<T extends object, O extends object = T>(
        values: T[],
        options?: CsvStringifyOptions<T, T extends O ? T : O>,
    ): AsyncGenerator<CsvString<T extends O ? T : O>> {
        return new CsvStringify(values, options).toStreamAsync()
    }

    /**
     * Static method to create a CsvStringify instance for advanced usage.
     *
     * @typeParam T - The input object type
     * @typeParam O - The output object type after optional transformation (defaults to T)
     * @param values - Array of objects to convert to CSV
     * @param options - Optional configuration for CSV stringification
     * @returns A CsvStringify instance
     */
    static stringifier<T extends object, O extends object = T>(
        values: T[],
        options?: CsvStringifyOptions<T, T extends O ? T : O>,
    ): CsvStringify<T, T extends O ? T : O> {
        return new CsvStringify(values, options)
    }
}
