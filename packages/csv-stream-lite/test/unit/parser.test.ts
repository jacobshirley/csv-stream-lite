import { describe, expect, it } from 'vitest'
import { CsvCell, Csv, CsvRow } from '../../src'

describe('CSV parsing', () => {
    describe('Cell by cell parsing', () => {
        it('should parse cells individually to save memory', () => {
            const csv = `name,age,city\nAlice,30,New York\nBob,25,Los Angeles`
            const parser = new CsvCell(csv)

            expect(parser.read()).toBe('name')
            expect(parser.read()).toBe('age')
            expect(parser.read()).toBe('city')
            expect(parser.read()).toBe('Alice')
            expect(parser.read()).toBe('30')
            expect(parser.read()).toBe('New York')
            expect(parser.read()).toBe('Bob')
            expect(parser.read()).toBe('25')
            expect(parser.read()).toBe('Los Angeles')
        })

        it('should parse cells with leading and trailing whitespace', () => {
            const csv = `  name  ,  age  ,  city  \n  Alice  ,  30  ,  New York  \n  Bob  ,  25  ,  Los Angeles  `
            const parser = new CsvCell(csv)

            expect(parser.read()).toBe('  name  ')
            expect(parser.read()).toBe('  age  ')
            expect(parser.read()).toBe('  city  ')
            expect(parser.read()).toBe('  Alice  ')
            expect(parser.read()).toBe('  30  ')
            expect(parser.read()).toBe('  New York  ')
            expect(parser.read()).toBe('  Bob  ')
            expect(parser.read()).toBe('  25  ')
            expect(parser.read()).toBe('  Los Angeles  ')
        })

        it('should parse cells as different data types', () => {
            const csv = `name,age,isStudent,balance\nAlice,30,true,1000.50\nBob,25,false,500.75`
            const parser = new CsvCell(csv)

            expect(parser.read()).toBe('name')
            expect(parser.read()).toBe('age')
            expect(parser.read()).toBe('isStudent')
            expect(parser.read()).toBe('balance')
            expect(parser.read()).toBe('Alice')
            expect(parser.readAs(Number)).toBe(30)
            expect(parser.read()).toBe('true')
            expect(parser.readAs(Number)).toBe(1000.5)
            expect(parser.read()).toBe('Bob')
            expect(parser.readAs(Number)).toBe(25)
            expect(parser.readAs(Boolean)).toBe(false)
            expect(parser.readAs(Number)).toBe(500.75)
        })

        it('should parse quoted cells correctly', () => {
            const csv = `"name","age","city"\n"Alice","30","New York"\n"Bob","25","Somewhere,   Los Angeles"`
            const parser = new CsvCell(csv)

            expect(parser.read()).toBe('name')
            expect(parser.read()).toBe('age')
            expect(parser.read()).toBe('city')
            expect(parser.read()).toBe('Alice')
            expect(parser.read()).toBe('30')
            expect(parser.read()).toBe('New York')
            expect(parser.read()).toBe('Bob')
            expect(parser.read()).toBe('25')
            expect(parser.read()).toBe('Somewhere,   Los Angeles')
        })

        it('should handle escaped quotes within quoted cells', () => {
            const csv = `"name","quote"\n"Alice","She said, ""Hello!"""\n"Bob","He replied, ""Hi!"""`
            const parser = new CsvCell(csv)

            expect(parser.read()).toBe('name')
            expect(parser.read()).toBe('quote')
            expect(parser.read()).toBe('Alice')
            expect(parser.read()).toBe('She said, "Hello!"')
            expect(parser.read()).toBe('Bob')
            expect(parser.read()).toBe('He replied, "Hi!"')
        })

        it('should handle different line endings', () => {
            const csv = `name,age,city\r\nAlice,30,New York\r\nBob,25,Los Angeles`
            const parser = new CsvCell(csv)

            expect(parser.read()).toBe('name')
            expect(parser.read()).toBe('age')
            expect(parser.read()).toBe('city')
            expect(parser.read()).toBe('Alice')
            expect(parser.read()).toBe('30')
            expect(parser.read()).toBe('New York')
            expect(parser.read()).toBe('Bob')
            expect(parser.read()).toBe('25')
            expect(parser.read()).toBe('Los Angeles')
        })

        it('should handle custom newline strings - pipe', () => {
            const csv = `name,age,city|Alice,30,New York|Bob,25,Los Angeles`
            const parser = new CsvCell(csv, { newline: '|' })

            expect(parser.read()).toBe('name')
            expect(parser.read()).toBe('age')
            expect(parser.read()).toBe('city')
            expect(parser.read()).toBe('Alice')
            expect(parser.read()).toBe('30')
            expect(parser.read()).toBe('New York')
            expect(parser.read()).toBe('Bob')
            expect(parser.read()).toBe('25')
            expect(parser.read()).toBe('Los Angeles')
        })

        it('should handle custom newline strings - multi-character', () => {
            const csv = `name,age,city<EOL>Alice,30,New York<EOL>Bob,25,Los Angeles`
            const parser = new CsvCell(csv, { newline: '<EOL>' })

            expect(parser.read()).toBe('name')
            expect(parser.read()).toBe('age')
            expect(parser.read()).toBe('city')
            expect(parser.read()).toBe('Alice')
            expect(parser.read()).toBe('30')
            expect(parser.read()).toBe('New York')
            expect(parser.read()).toBe('Bob')
            expect(parser.read()).toBe('25')
            expect(parser.read()).toBe('Los Angeles')
        })

        it('should handle different separators', () => {
            const csv = `name;age;city\nAlice;30;New York\nBob;25;Los Angeles`
            const parser = new CsvCell(csv, { separator: ';' })

            expect(parser.read()).toBe('name')
            expect(parser.read()).toBe('age')
            expect(parser.read()).toBe('city')
            expect(parser.read()).toBe('Alice')
            expect(parser.read()).toBe('30')
            expect(parser.read()).toBe('New York')
            expect(parser.read()).toBe('Bob')
            expect(parser.read()).toBe('25')
            expect(parser.read()).toBe('Los Angeles')
        })

        it('should parse large cells in chunks', () => {
            const largeText = 'A'.repeat(10)
            const csv = `"${largeText}",123,Some City`
            const parser = new CsvCell(csv)
            parser.maxBufferSize = 1
            parser.chunkSize = 1

            const stream = parser.stream()
            expect(stream.next().value).toBe('A')
            expect(stream.next().value).toBe('A')
            expect(stream.next().value).toBe('A')
            expect(stream.next().value).toBe('A')
            expect(stream.next().value).toBe('A')
            expect(stream.next().value).toBe('A')
            expect(stream.next().value).toBe('A')
            expect(stream.next().value).toBe('A')
            expect(stream.next().value).toBe('A')
            expect(stream.next().value).toBe('A')
            expect(stream.next().done).toBe(true)
            expect(parser.read()).toBe('123')
            expect(parser.read()).toBe('Some City')
        })

        it('should parse large cells in chunks asynchronously', async () => {
            const largeText = 'B'.repeat(10)
            const csv = `"${largeText}",456,Another City`
            const parser = new CsvCell(csv)

            parser.maxBufferSize = 2
            parser.chunkSize = 2

            const stream = parser.streamAsync()
            const chunks: string[] = []

            for await (const chunk of stream) {
                chunks.push(chunk)
            }

            expect((await stream.next()).done).toBe(true)

            expect(chunks).toEqual(['BB', 'BB', 'BB', 'BB', 'BB'])
            expect(parser.read()).toBe('456')
            expect(parser.read()).toBe('Another City')
        })

        it('should read cells asynchronously', async () => {
            const csv = `name,age,city\nAlice,30,New York\nBob,25,Los Angeles`
            let parser = new CsvCell(csv)

            expect(await parser.readAsync()).toBe('name')
            expect(await parser.readAsync()).toBe('age')
            expect(await parser.readAsync()).toBe('city')
            expect(await parser.readAsync()).toBe('Alice')
            expect(await parser.readAsync()).toBe('30')
            expect(await parser.readAsync()).toBe('New York')
            expect(await parser.readAsync()).toBe('Bob')
            expect(await parser.readAsync()).toBe('25')
            expect(await parser.readAsync()).toBe('Los Angeles')
            await expect(() => parser.readAsync()).rejects.toThrowError(
                'No more data to read',
            )

            parser = new CsvCell(
                (async function* () {
                    yield csv
                })(),
            )

            expect(await parser.readAsync()).toBe('name')
            expect(await parser.readAsync()).toBe('age')
            expect(await parser.readAsync()).toBe('city')
            expect(await parser.readAsync()).toBe('Alice')
            expect(await parser.readAsync()).toBe('30')
            expect(await parser.readAsync()).toBe('New York')
            expect(await parser.readAsync()).toBe('Bob')
            expect(await parser.readAsync()).toBe('25')
            expect(await parser.readAsync()).toBe('Los Angeles')
            await expect(() => parser.readAsync()).rejects.toThrowError(
                'No more data to read',
            )
        })

        it('should handle multi-character custom newline split across buffer boundaries', async () => {
            const csv = `name,age<EOL>Alice,30<EOL>Bob,25`
            const parser = new CsvCell(
                (async function* () {
                    // Yield data in small chunks to force buffer boundaries
                    // that split the <EOL> newline sequence
                    yield 'name,age<E'
                    yield 'OL>Alice,3'
                    yield '0<EOL>Bob,'
                    yield '25'
                })(),
                { newline: '<EOL>' },
            )

            // Set a small buffer to force frequent refills
            parser.maxBufferSize = 5
            parser.chunkSize = 5

            expect(await parser.readAsync()).toBe('name')
            expect(await parser.readAsync()).toBe('age')
            expect(await parser.readAsync()).toBe('Alice')
            expect(await parser.readAsync()).toBe('30')
            expect(await parser.readAsync()).toBe('Bob')
            expect(await parser.readAsync()).toBe('25')
        })
    })

    describe('Row parsing', () => {
        it('should parse a full row into cells', () => {
            const csv = `name,age,city`
            const row = new CsvRow(csv)

            const cells = row.read()
            expect(cells).toEqual(['name', 'age', 'city'])
        })

        it('should parse a full row with quoted cells', () => {
            const csv = `"name 2","age","city"`
            const row = new CsvRow(csv)

            const cells = row.read()
            expect(cells).toEqual(['name 2', 'age', 'city'])
        })

        it('should parse a full row asynchronously', async () => {
            const csv = `"name 3","age","city"`
            const row = new CsvRow(csv)

            const cells = await row.readAsync()
            expect(cells).toEqual(['name 3', 'age', 'city'])
        })

        it('should stream cells from a row', () => {
            const csv = `name,age,city`
            const row = new CsvRow(csv)

            const cellValues: string[] = []
            for (const cell of row.stream()) {
                cellValues.push(cell.read())
            }

            expect(cellValues).toEqual(['name', 'age', 'city'])
        })

        it('should stream cells from a row asynchronously', async () => {
            const csv = `name,age,city`
            const row = new CsvRow(csv)

            const cellValues: string[] = []
            for await (const cell of row.streamAsync()) {
                cellValues.push(await cell.readAsync())
            }

            expect(cellValues).toEqual(['name', 'age', 'city'])
        })
    })

    describe('Full parsing', () => {
        it('should parse full CSV into array of rows', () => {
            const csv = `name,age,city\nAlice,30,New York\nBob,25,Los Angeles`
            const parser = new Csv<{
                name: string
                age: string
                city: string
            }>(csv)

            const rows = parser.read()
            expect(rows).toEqual([
                { name: 'Alice', age: '30', city: 'New York' },
                { name: 'Bob', age: '25', city: 'Los Angeles' },
            ])
        })

        it('should parse a CSV at a low level, cell by cell', async () => {
            const csv = `name,age,city\nAlice,30,New York\nBob,25,Los Angeles`
            const parser = new Csv<{
                name: string
                age: string
                city: string
            }>(csv)

            const cells: string[] = []

            for await (const row of parser) {
                for await (const cell of row) {
                    cells.push(await cell.readAsync())
                }
            }

            expect(cells).toEqual([
                'name',
                'age',
                'city',
                'Alice',
                '30',
                'New York',
                'Bob',
                '25',
                'Los Angeles',
            ])
        })

        it('should parse full CSV into array of rows asynchronously', async () => {
            const csv = `name,age,city\nAlice,30,New York\nBob,25,Los Angeles`
            const parser = new Csv<{
                name: string
                age: string
                city: string
            }>(csv)

            const rows = await parser.readAsync()
            expect(rows).toEqual([
                { name: 'Alice', age: '30', city: 'New York' },
                { name: 'Bob', age: '25', city: 'Los Angeles' },
            ])
        })

        it('should parse full CSV from async iterable into array of rows asynchronously', async () => {
            const csv = `name,age,city\nAlice,30,New York\nBob,25,Los Angeles`
            const parser = new Csv<{
                name: string
                age: string
                city: string
            }>(
                (async function* () {
                    yield csv
                })(),
            )

            const stream = await parser.streamObjectsAsync()
            expect(await stream.next()).toEqual({
                done: false,
                value: { name: 'Alice', age: '30', city: 'New York' },
            })
            expect(await stream.next()).toEqual({
                done: false,
                value: { name: 'Bob', age: '25', city: 'Los Angeles' },
            })
            expect(await stream.next()).toEqual({
                done: true,
                value: undefined,
            })
        })

        it('should stream rows from CSV', () => {
            const csv = `name,age,city\nAlice,30,New York\nBob,25,Los Angeles`
            const parser = new Csv<{
                name: string
                age: string
                city: string
            }>(csv)

            const rows: Array<{ name: string; age: string; city: string }> = []
            let headers: string[] = []

            for (const row of parser.stream()) {
                if (headers.length === 0) {
                    headers = row.read()
                } else {
                    rows.push(row.readObject({ headers }))
                }
            }

            expect(rows).toEqual([
                { name: 'Alice', age: '30', city: 'New York' },
                { name: 'Bob', age: '25', city: 'Los Angeles' },
            ])
        })

        it('should stream rows from CSV asynchronously', async () => {
            const csv = `name,age,city\nAlice,30,New York\nBob,25,Los Angeles`
            const parser = new Csv<{
                name: string
                age: string
                city: string
            }>(csv)

            const rows: Array<{ name: string; age: string; city: string }> = []
            let headers: string[] = []

            const stream = await parser.streamAsync()
            for await (const row of stream) {
                if (headers.length === 0) {
                    headers = await row.readAsync()
                } else {
                    rows.push(await row.readObjectAsync({ headers }))
                }
            }

            expect(rows).toEqual([
                { name: 'Alice', age: '30', city: 'New York' },
                { name: 'Bob', age: '25', city: 'Los Angeles' },
            ])
        })

        it('should be able to specify a custom shape for the CSV objects', () => {
            const csv = `name,age,city\nAlice,30,New York\nBob,25,Los Angeles`
            const parser = new Csv(csv, {
                shape: {
                    name: String,
                    age: Number,
                    city: String,
                },
            })

            const rows = parser.read()
            expect(rows).toEqual([
                { name: 'Alice', age: 30, city: 'New York' },
                { name: 'Bob', age: 25, city: 'Los Angeles' },
            ])
            //@ts-expect-error Verify that age is a number
            rows[0].age = '30'
        })

        it('should be able to transform CSV objects as they are read', () => {
            const csv = `name,age,city\nAlice,30,New York\nBob,25,Los Angeles`
            const parser = new Csv(csv, {
                shape: {
                    fullName: String,
                    isAdult: Boolean,
                    location: String,
                },
                transform: (obj: {
                    name: string
                    age: string
                    city: string
                }) => ({
                    fullName: obj.name.toUpperCase(),
                    isAdult: Number(obj.age) >= 18,
                    location: obj.city,
                }),
            })

            const rows = parser.read()
            expect(rows).toEqual([
                { fullName: 'ALICE', isAdult: true, location: 'New York' },
                { fullName: 'BOB', isAdult: true, location: 'Los Angeles' },
            ])

            rows[0].fullName = 'CHARLIE'
            rows[0].isAdult = false
            rows[0].location = 'Chicago'
            //@ts-expect-error Verify that fullName is a string
            rows[0].fullName = 123
            //@ts-expect-error Verify that isAdult is a boolean
            rows[0].isAdult = 'true'
            //@ts-expect-error Verify that location is a string
            rows[0].location = 456
            //@ts-expect-error Verify that age is not present
            rows[0].age = 30
        })
    })

    describe('Edge cases', () => {
        it('should handle empty cells', () => {
            const csv = `name,age,city\nAlice,,New York\n,Bob,25,Los Angeles`
            const parser = new Csv<{
                name: string
                age: string
                city: string
            }>(csv)

            const rows = parser.read()
            expect(rows).toEqual([
                { name: 'Alice', age: '', city: 'New York' },
                { name: '', age: 'Bob', city: '25' },
            ])
        })

        it('should handle rows with varying number of cells', () => {
            const csv = `name,age,city\nAlice,30\nBob,25,Los Angeles,ExtraData`
            const parser = new Csv<{
                name: string
                age: string
                city?: string
                extra?: string
            }>(csv)

            const rows = parser.read()
            expect(rows).toEqual([
                { name: 'Alice', age: '30', city: undefined },
                { name: 'Bob', age: '25', city: 'Los Angeles' },
            ])
        })

        it('should be able to include extra cells when configured', () => {
            const csv = `name,age,city\nAlice,30\nBob,25,Los Angeles,ExtraData`
            const parser = new Csv<{
                name: string
                age: string
                city?: string
                extra?: string
            }>(csv, {
                includeExtraCells: true,
            })

            const rows = parser.read()
            expect(rows).toEqual([
                { name: 'Alice', age: '30', city: undefined },
                {
                    name: 'Bob',
                    age: '25',
                    city: 'Los Angeles',
                    extra_cell_1: 'ExtraData',
                },
            ])
        })

        it('should handle files with only headers', () => {
            const csv = `name,age,city`
            const parser = new Csv<{
                name: string
                age: string
                city: string
            }>(csv)

            const rows = parser.read()
            expect(rows).toEqual([])
        })

        it('should handle empty files', () => {
            const csv = ``
            const parser = new Csv<{
                name: string
                age: string
                city: string
            }>(csv)

            const rows = parser.read()
            expect(rows).toEqual([])
        })

        it('should handle files with only newlines', () => {
            const csv = `\n\n\n`
            const parser = new Csv<{
                name: string
                age: string
                city: string
            }>(csv)

            const rows = parser.read()
            expect(rows).toEqual([])
        })

        it('should handle different escape characters', () => {
            const csv = `name,quote\nAlice,|She said, ||Hello!|||\nBob,|He replied, ||Hi!|||`
            const parser = new Csv<{ name: string; quote: string }>(csv, {
                escapeChar: '|',
            })

            const rows = parser.read()
            expect(rows).toEqual([
                { name: 'Alice', quote: 'She said, |Hello!|' },
                { name: 'Bob', quote: 'He replied, |Hi!|' },
            ])
        })

        it('should handle different separators in full parsing', () => {
            const csv = `name;age;city\nAlice;30;New York\nBob;25;Los Angeles`
            const parser = new Csv<{
                name: string
                age: string
                city: string
            }>(csv, { separator: ';' })

            const rows = parser.read()
            expect(rows).toEqual([
                { name: 'Alice', age: '30', city: 'New York' },
                { name: 'Bob', age: '25', city: 'Los Angeles' },
            ])
        })

        it('should handle trailing newlines at end of file', () => {
            const csv = `name,age,city\nAlice,30,New York\nBob,25,Los Angeles\n\n`
            const parser = new Csv<{
                name: string
                age: string
                city: string
            }>(csv)

            const rows = parser.read()
            expect(rows).toEqual([
                { name: 'Alice', age: '30', city: 'New York' },
                { name: 'Bob', age: '25', city: 'Los Angeles' },
            ])
        })

        it('should handle missing final newline at end of file', () => {
            const csv = `name,age,city\nAlice,30,New York\nBob,25,Los Angeles`
            const parser = new Csv<{
                name: string
                age: string
                city: string
            }>(csv)

            const rows = parser.read()
            expect(rows).toEqual([
                { name: 'Alice', age: '30', city: 'New York' },
                { name: 'Bob', age: '25', city: 'Los Angeles' },
            ])
        })

        it('should handle BOM markers at start of file', () => {
            const csv = `\uFEFF\uFEFFname,age,city\nAlice,30,New York\nBob,25,Los Angeles`
            const parser = new Csv<{
                name: string
                age: string
                city: string
            }>(csv, {
                ignoreUtf8Bom: true,
            })

            const rows = parser.read()
            expect(rows).toEqual([
                { name: 'Alice', age: '30', city: 'New York' },
                { name: 'Bob', age: '25', city: 'Los Angeles' },
            ])
        })

        it('should handle large files by streaming rows', async () => {
            const csvLines = ['name,age,city']
            for (let i = 0; i < 1000; i++) {
                csvLines.push(`User${i},${20 + (i % 30)},City${i}`)
            }
            const csv = csvLines.join('\n')
            const parser = new Csv<{
                name: string
                age: string
                city: string
            }>(csv)

            const stream = await parser.streamObjects()
            let count = 0
            for await (const row of stream) {
                expect(row).toEqual({
                    name: `User${count}`,
                    age: `${20 + (count % 30)}`,
                    city: `City${count}`,
                })
                count++
            }

            expect(count).toBe(1000)
        })

        it('should be able to use custom headers', () => {
            const csv = `header1,header2,header3\nAlice,30,New York\nBob,25,Los Angeles`
            const parser = new Csv<{
                name: string
                age: string
                city: string
            }>(csv, {
                headers: ['name', 'age', 'city'],
            })

            const rows = parser.read()
            expect(rows).toEqual([
                { name: 'Alice', age: '30', city: 'New York' },
                { name: 'Bob', age: '25', city: 'Los Angeles' },
            ])
        })

        it('should be able to skip reading headers', () => {
            const csv = `name,age,city\nAlice,30,New York\nBob,25,Los Angeles`
            const parser = new Csv<{
                name: string
                age: string
                city: string
            }>(csv, {
                readHeaders: false,
                headers: ['header1', 'header2', 'header3'],
            })

            const rows = parser.read()
            expect(rows).toEqual([
                { header1: 'name', header2: 'age', header3: 'city' },
                { header1: 'Alice', header2: '30', header3: 'New York' },
                { header1: 'Bob', header2: '25', header3: 'Los Angeles' },
            ])
        })

        it('should error if in strict mode and too many columns in a row', () => {
            const csv = `name,age,city\nAlice,30,New York,ExtraData`
            const parser = new Csv<{ name: string; age: string; city: string }>(
                csv,
                {
                    strictColumns: true,
                },
            )

            expect(() => parser.read()).toThrowError(
                'Extra cells found in row 2 but strictColumns is enabled',
            )
        })

        it('should error if in strict mode and too few columns in a row', () => {
            const csv = `name,age,city\nAlice,30`
            const parser = new Csv<{ name: string; age: string; city: string }>(
                csv,
                {
                    strictColumns: true,
                },
            )

            expect(() => parser.read()).toThrowError(
                'Not enough cells in row 2 to match headers when strictColumns is enabled',
            )
        })

        it('should parse CSV with custom newline - pipe', () => {
            const csv = `name,age,city|Alice,30,New York|Bob,25,Los Angeles`
            const parser = new Csv<{
                name: string
                age: string
                city: string
            }>(csv, { newline: '|' })

            const rows = parser.read()
            expect(rows).toEqual([
                { name: 'Alice', age: '30', city: 'New York' },
                { name: 'Bob', age: '25', city: 'Los Angeles' },
            ])
        })

        it('should parse CSV with custom newline - multi-character', () => {
            const csv = `name,age,city<EOL>Alice,30,New York<EOL>Bob,25,Los Angeles`
            const parser = new Csv<{
                name: string
                age: string
                city: string
            }>(csv, { newline: '<EOL>' })

            const rows = parser.read()
            expect(rows).toEqual([
                { name: 'Alice', age: '30', city: 'New York' },
                { name: 'Bob', age: '25', city: 'Los Angeles' },
            ])
        })

        it('should stream CSV with custom newline asynchronously', async () => {
            const csv = `name,age,city||Alice,30,New York||Bob,25,Los Angeles`
            const parser = new Csv<{
                name: string
                age: string
                city: string
            }>(csv, { newline: '||' })

            const rows: Array<{ name: string; age: string; city: string }> = []
            for await (const row of parser.streamObjectsAsync()) {
                rows.push(row)
            }

            expect(rows).toEqual([
                { name: 'Alice', age: '30', city: 'New York' },
                { name: 'Bob', age: '25', city: 'Los Angeles' },
            ])
        })

        it('should handle custom newline with quoted cells', () => {
            const csv = `name,age,city|"Alice",30,"New York"|"Bob",25,"Los Angeles"`
            const parser = new Csv<{
                name: string
                age: string
                city: string
            }>(csv, { newline: '|' })

            const rows = parser.read()
            expect(rows).toEqual([
                { name: 'Alice', age: '30', city: 'New York' },
                { name: 'Bob', age: '25', city: 'Los Angeles' },
            ])
        })
    })
})
