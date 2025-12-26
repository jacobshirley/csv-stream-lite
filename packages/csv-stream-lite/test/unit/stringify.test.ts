import { describe, expect, it } from 'vitest'
import { CsvStringify } from '../../src'

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
            'Charlie,35,Chicago\n'

        const result = new CsvStringify(data)
        expect(result.toString()).toBe(expectedCsv)
    })

    it('should handle custom delimiters and newlines', () => {
        const data = [
            { name: 'Alice', age: 30, city: 'New York' },
            { name: 'Bob', age: 25, city: 'Los Angeles' },
        ]

        const expectedCsv =
            'name;age;city\r\n' +
            'Alice;30;New York\r\n' +
            'Bob;25;Los Angeles\r\n'

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
            'Charlie,"Line1\nLine2"\n'

        const result = new CsvStringify(data)
        expect(result.toString()).toBe(expectedCsv)
    })

    it('should write a UTF-8 BOM when specified', () => {
        const data = [
            { name: 'Alice', age: 30 },
            { name: 'Bob', age: 25 },
        ]

        const expectedCsv = '\uFEFFname,age\n' + 'Alice,30\n' + 'Bob,25\n'

        const result = new CsvStringify(data, { writeBom: true })
        expect(result.toString()).toBe(expectedCsv)
    })

    it('should stringify data from an async iterable', async () => {
        async function* asyncData() {
            yield { name: 'Alice', age: 30 }
            yield { name: 'Bob', age: 25 }
        }

        const expectedCsv = 'name,age\n' + 'Alice,30\n' + 'Bob,25\n'

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
            'name,age,city\n' +
            'Alice,30,\n' +
            'Bob,,\n' +
            'Charlie,35,Chicago\n'
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
            'fullName,age\n' + 'Alice Smith,30\n' + 'Bob Johnson,25\n'

        const result = new CsvStringify(data, {
            transform: (record) => ({
                fullName: `${record.fName} ${record.lName}`,
                age: record.age,
            }),
        })

        expect(result.toString()).toBe(expectedCsv)
    })
})
