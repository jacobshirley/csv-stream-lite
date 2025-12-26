import { ByteBuffer } from './byte-buffer.js'
import { DEFAULT_CHUNK_SIZE } from './defaults.js'
import { TooFewColumnsError, TooManyColumnsError } from './errors.js'
import { CsvStringify, CsvStringifyOptions } from './stringify.js'
import { ByteStream, CsvString } from './types.js'
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

export interface CsvEntityOptions {
    separator?: string
    escapeChar?: string
}

export abstract class CsvEntity<
    T,
    S = T,
> implements Required<CsvEntityOptions> {
    byteBuffer: ByteBuffer
    separator: string = ','
    escapeChar: string = '"'
    consumed: boolean = false

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

    read(): T {
        const res = this.parse()
        this.consumed = true
        return res
    }

    async readAsync(): Promise<T> {
        const res = await this.parseAsync()
        this.consumed = true
        return res
    }

    *stream(): Generator<S> {
        const res = yield* this.streamImpl()
        this.consumed = true
        return res
    }

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

    consume(): void {
        if (!this.consumed) {
            this.read()
        }
    }

    async consumeAsync(): Promise<void> {
        if (!this.consumed) {
            await this.readAsync()
        }
    }

    [Symbol.iterator](): Generator<S> {
        return this.stream()
    }

    [Symbol.asyncIterator](): AsyncGenerator<S> {
        return this.streamAsync()
    }
}

export class CsvCell extends CsvEntity<string> {
    chunkSize: number = DEFAULT_CHUNK_SIZE
    endOfLineReached: boolean = false

    protected parse(): string {
        let str = ''

        for (const part of this) {
            str += part
        }

        return str
    }

    protected async parseAsync(): Promise<string> {
        let str = ''

        for await (const part of this) {
            str += part
        }

        return str
    }

    readAs<T>(transform: (cell: string) => T): T {
        const cellStr = this.read()

        if ((transform as any) === Boolean) {
            return (cellStr.toLowerCase() === 'true') as any as T
        }

        return transform(cellStr)
    }

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
                if (next === separator || isLineEnd(next)) {
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

        while (isLineEnd(this.byteBuffer.peek())) {
            this.byteBuffer.next() // consume line ending
            this.endOfLineReached = true
        }

        if (!hadData || chunk.length > 0)
            yield bytesToString(new Uint8Array(chunk))
    }
}

export interface CsvRowObjectOptions<T extends object, O = T> {
    shape: CsvObjectShape<T> | string[]
    rowIndex?: number
    includeExtraCells?: boolean
    strictColumns?: boolean
    transform?: (row: T) => O
}

export class CsvRow<T extends object = object, O = T> extends CsvEntity<
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

    readObject(options: CsvRowObjectOptions<T, O>): O {
        let { shape } = options
        const obj: any = {}

        let i = 0
        const includeExtraCells = options?.includeExtraCells ?? false
        const strictColumns = options?.strictColumns ?? false
        if (Array.isArray(shape)) {
            shape = shape.reduce((acc, header) => {
                acc[header as keyof T] = String as any
                return acc
            }, {} as CsvObjectShape<T>)
        }
        const headers = Object.keys(shape)

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

                obj[header] = cell.readAs(shape[header as keyof T] ?? String)
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

        this.consumed = true

        if (options.transform) {
            return options.transform(obj)
        }

        return obj as O
    }

    async readObjectAsync(options: CsvRowObjectOptions<T, O>): Promise<O> {
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

export type CsvObjectShape<T extends object> = {
    [key in keyof T]: (cell: string) => T[key]
}

export class Csv<T extends object, O = T> extends CsvEntity<O[], CsvRow<T, O>> {
    includeExtraCells: boolean = false
    ignoreUtf8Bom: boolean = true
    headers?: string[]
    shape?: CsvObjectShape<T>
    readHeaders: boolean = true
    strictColumns: boolean = false
    transform?: (row: T) => O

    constructor(
        asyncIterable?: ByteStream<T> | ByteBuffer,
        options?: CsvEntityOptions & {
            includeExtraCells?: boolean
            ignoreUtf8Bom?: boolean
            readHeaders?: boolean
            headers?: string[]
            shape?: CsvObjectShape<T>
            strictColumns?: boolean
            transform?: (row: T) => O
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

    protected parse(): O[] {
        return Array.from(this.streamObjects())
    }

    protected async parseAsync(): Promise<O[]> {
        const results: O[] = []
        for await (const obj of this.streamObjectsAsync()) {
            results.push(obj)
        }
        return results
    }

    protected *streamImpl(): Generator<CsvRow<T, O>> {
        // Skip UTF-8 BOM if present
        this.readBom()

        while (this.byteBuffer.peek() !== null) {
            const row = new CsvRow<T, O>(this.byteBuffer, this)
            yield row
            row.consume() // Advance the buffer
        }

        this.consumed = true
    }

    *streamObjects(): Generator<O> {
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
        const shape = this.shape ?? headers

        while (true) {
            const currentRow = stream.next()

            if (currentRow.done) {
                return // No more data
            }

            yield currentRow.value.readObject({
                shape,
                includeExtraCells: this.includeExtraCells,
                strictColumns: this.strictColumns,
                rowIndex: rowIndex++,
                transform: this.transform,
            })
        }
    }

    async *streamObjectsAsync(): AsyncGenerator<O> {
        while (true) {
            const stream = this.streamObjects()
            let currentRow: IteratorResult<O> | undefined = undefined

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

    static stringify<T extends object, O extends object = T>(
        values: T[],
        options?: CsvStringifyOptions<T, T extends O ? T : O>,
    ): Generator<CsvString<T extends O ? T : O>> {
        return new CsvStringify(values, options).toStream()
    }

    static stringifyAsync<T extends object, O extends object = T>(
        values: T[],
        options?: CsvStringifyOptions<T, T extends O ? T : O>,
    ): AsyncGenerator<CsvString<T extends O ? T : O>> {
        return new CsvStringify(values, options).toStreamAsync()
    }
}
