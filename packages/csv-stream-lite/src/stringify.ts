import { CsvString } from './types.js'

export interface CsvStringifyOptions<
    T extends object = object,
    O extends object = T,
> {
    /** Optional array of headers to use as the first row */
    headers?: string[]
    /** Character to separate fields (default: ',') */
    delimiter?: string
    /** Character to escape special characters (default: '"') */
    escapeChar?: string
    /** Character to quote fields (default: '"') */
    quoteChar?: string
    /** Newline character (default: '\n') */
    newline?: string
    /** Whether to write a UTF-8 BOM at the start of the output (default: false) */
    writeBom?: boolean
    /** Whether to always write headers, even if there are no records (default: false) */
    alwaysWriteHeaders?: boolean
    /** Optional transform function to modify each record before stringifying */
    transform?: (row: T) => O
}

const UTF_8_BOM = '\uFEFF'

export class CsvStringify<T extends object = object, O extends object = T> {
    private values: Iterable<T> | AsyncIterable<T>
    headers?: string[]
    delimiter: string
    escapeChar: string
    quoteChar: string
    newline: string
    writeBom: boolean
    alwaysWriteHeaders: boolean
    transform?: (row: T) => O

    constructor(
        values: Iterable<T> | AsyncIterable<T>,
        options?: CsvStringifyOptions<T, O>,
    ) {
        this.values = values
        this.headers = options?.headers
        this.delimiter = options?.delimiter ?? ','
        this.escapeChar = options?.escapeChar ?? '"'
        this.quoteChar = options?.quoteChar ?? '"'
        this.newline = options?.newline ?? '\n'
        this.writeBom = options?.writeBom ?? false
        this.alwaysWriteHeaders = options?.alwaysWriteHeaders ?? false
        this.transform = options?.transform
    }

    private formatField(field: string): string {
        const needsQuoting =
            field.includes(this.delimiter) ||
            field.includes('\n') ||
            field.includes('\r') ||
            field.includes(this.quoteChar)

        if (needsQuoting) {
            field = field.replace(
                new RegExp(this.quoteChar, 'g'),
                this.escapeChar + this.quoteChar,
            )
            field = this.quoteChar + field + this.quoteChar
        }

        return field
    }

    private *recordToString(record: T, firstRecord: boolean): Iterable<string> {
        let index = 0

        if (this.transform) {
            record = this.transform(record) as any
        }

        const recordKeys = Object.keys(record)
        const headers: string[] = this.headers ?? recordKeys

        if (firstRecord) {
            // Output header row
            for (const header of headers) {
                const fieldStr = this.formatField(header)
                if (index > 0) {
                    yield this.delimiter
                }
                yield fieldStr
                index++
            }
            yield this.newline
            index = 0
        }

        for (let i = 0; i < headers.length; i++) {
            const fieldStr = this.formatField(
                String(record[recordKeys[i] as keyof typeof record] ?? ''),
            )
            if (index > 0) {
                yield this.delimiter
            }
            yield fieldStr
            index++
        }
    }

    private *forceWriteHeaders(): Generator<string> {
        if (this.headers) {
            let index = 0

            for (const header of this.headers) {
                const fieldStr = this.formatField(header)
                if (index > 0) {
                    yield this.delimiter
                }
                yield fieldStr
                index++
            }
        }
    }

    *toStream(): Generator<CsvString<O>> {
        if (!(Symbol.iterator in this.values)) {
            throw new Error('Values is not iterable')
        }

        if (this.writeBom) {
            yield UTF_8_BOM
        }

        let firstRecord = true
        for (const record of this.values) {
            yield* this.recordToString(record, firstRecord)
            firstRecord = false
            yield this.newline
        }

        if (firstRecord && this.alwaysWriteHeaders) {
            yield* this.forceWriteHeaders()
        }
    }

    async *toStreamAsync(): AsyncGenerator<CsvString<O>> {
        if (this.writeBom) {
            yield UTF_8_BOM
        }

        let firstRecord = true
        let yieldedHeaders = false

        for await (const record of this.values) {
            yield* this.recordToString(record, firstRecord)
            firstRecord = false

            yield this.newline
            yieldedHeaders = true
        }

        if (firstRecord && this.alwaysWriteHeaders) {
            yield* this.forceWriteHeaders()
        }
    }

    toString(): CsvString<O> {
        let result = ''
        for (const chunk of this) {
            result += chunk
        }
        return result
    }

    async toStringAsync(): Promise<CsvString<O>> {
        let result = ''
        for await (const chunk of this) {
            result += chunk
        }
        return result
    }

    [Symbol.iterator](): Generator<CsvString<O>> {
        return this.toStream()
    }

    [Symbol.asyncIterator](): AsyncGenerator<CsvString<O>> {
        return this.toStreamAsync()
    }
}
