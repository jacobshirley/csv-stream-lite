import { describe, expect, it } from 'vitest'
import { Csv, CsvStringify } from '../../src'

describe('CSV Stringify', () => {
    it('should stringify an array of objects to CSV format', () => {
        const data = [
            { name: 'Alice', age: 30, city: 'New York' },
            { name: 'Bob', age: 25, city: 'Los Angeles' },
            { name: 'Charlie', age: 35, city: 'Chicago' },
        ]

        const expectedCsv =
            'name,age,city\n' +
            'Alice,30,New York\n' +
            'Bob,25,Los Angeles\n' +
            'Charlie,35,Chicago'

        const result = new CsvStringify(data)
        expect(result.toString()).toBe(expectedCsv)
    })

    it('should handle custom delimiters and newlines', () => {
        const data = [
            { name: 'Alice', age: 30, city: 'New York' },
            { name: 'Bob', age: 25, city: 'Los Angeles' },
        ]

        const expectedCsv =
            'name;age;city\r\n' + 'Alice;30;New York\r\n' + 'Bob;25;Los Angeles'

        const result = new CsvStringify(data, {
            delimiter: ';',
            newline: '\r\n',
        })
        expect(result.toString()).toBe(expectedCsv)
    })

    it('should escape fields containing special characters', () => {
        const data = [
            { name: 'Alice', comment: 'Hello, world!' },
            { name: 'Bob', comment: 'He said "Hi"' },
            { name: 'Charlie', comment: 'Line1\nLine2' },
        ]

        const expectedCsv =
            'name,comment\n' +
            'Alice,"Hello, world!"\n' +
            'Bob,"He said ""Hi"""\n' +
            'Charlie,"Line1\nLine2"'

        const result = new CsvStringify(data)
        expect(result.toString()).toBe(expectedCsv)
    })

    it('should write a UTF-8 BOM when specified', () => {
        const data = [
            { name: 'Alice', age: 30 },
            { name: 'Bob', age: 25 },
        ]

        const expectedCsv = '\uFEFFname,age\n' + 'Alice,30\n' + 'Bob,25'

        const result = new CsvStringify(data, { writeBom: true })
        expect(result.toString()).toBe(expectedCsv)
    })

    it('should stringify data from an async iterable', async () => {
        async function* asyncData() {
            yield { name: 'Alice', age: 30 }
            yield { name: 'Bob', age: 25 }
        }

        const expectedCsv = 'name,age\n' + 'Alice,30\n' + 'Bob,25'

        const result = new CsvStringify(asyncData())
        expect(await result.toStringAsync()).toBe(expectedCsv)
    })

    it('should handle empty input', () => {
        const data: object[] = []

        const expectedCsv = ''

        const result = new CsvStringify(data)
        expect(result.toString()).toBe(expectedCsv)
    })

    it('should handle objects with missing fields', () => {
        const data = [
            { name: 'Alice', age: 30 },
            { name: 'Bob' }, // Missing age
            { name: 'Charlie', age: 35, city: 'Chicago' },
        ]

        const expectedCsv =
            'name,age,city\n' + 'Alice,30,\n' + 'Bob,,\n' + 'Charlie,35,Chicago'
        const result = new CsvStringify(data, {
            headers: ['name', 'age', 'city'],
        })
        expect(result.toString()).toBe(expectedCsv)
    })

    it('should always write headers when specified', () => {
        const expectedCsv = 'name,age,city'

        const result = new CsvStringify([], {
            headers: ['name', 'age', 'city'],
            alwaysWriteHeaders: true,
        })
        expect(result.toString()).toBe(expectedCsv)
    })

    it('should transform records before stringifying', () => {
        const data = [
            { fName: 'Alice', lName: 'Smith', age: 30 },
            { fName: 'Bob', lName: 'Johnson', age: 25 },
        ]

        const expectedCsv =
            'fullName,age\n' + 'Alice Smith,30\n' + 'Bob Johnson,25'

        const result = new CsvStringify(data, {
            transform: (record) => ({
                fullName: `${record.fName} ${record.lName}`,
                age: record.age,
            }),
        })

        expect(result.toString()).toBe(expectedCsv)
    })

    describe('non-default quote, escape and newline options (#52)', () => {
        const str = (rows: object[], options?: object) =>
            [...Csv.stringify(rows, options)].join('')

        it.each(['*', '.', '|', '$', '^', '+', '?', '(', '[', '\\'])(
            'supports regex-special quote character %j',
            (q) => {
                const value = `x${q}y,z`
                const out = str([{ a: value }], { quoteChar: q })
                expect(out).toBe(`a\n${q}x${q}${q}y,z${q}`)
                expect(Csv.parse(out, { quoteChar: q, escapeChar: q })).toEqual(
                    [{ a: value }],
                )
            },
        )

        it('defaults the escape character to the quote character', () => {
            expect(str([{ a: "it's,x" }], { quoteChar: "'" })).toBe(
                "a\n'it''s,x'",
            )
        })

        it('escapes the escape character when it differs from the quote', () => {
            const value = 'back\\slash,"'
            const out = str([{ a: value }], { escapeChar: '\\' })
            expect(out).toBe('a\n"back\\\\slash,\\""')
            expect(
                Csv.parse(out, { escapeChar: '\\', quoteChar: '"' }),
            ).toEqual([{ a: value }])
        })

        it('quotes fields containing a custom newline', () => {
            const out = str([{ a: 'x|y' }, { a: 'z' }], { newline: '|' })
            expect(out).toBe('a|"x|y"|z')
        })
    })
})
