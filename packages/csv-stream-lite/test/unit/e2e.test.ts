import { describe, expect, it } from 'vitest'
import { Csv } from '../../src'

describe('CSV stringify and parser', () => {
    it('should parse and then stringify CSV data correctly', async () => {
        const objects = [
            {
                name: 'Alice',
                age: '30',
                city: 'New York',
            },
            {
                name: 'Bob',
                age: '25',
                city: 'Los Angeles',
            },
            {
                name: 'Charlie',
                age: '35',
                city: 'Chicago',
            },
        ]

        const parser = new Csv<{ name: string; age: string; city: string }>(
            Csv.stringify(objects),
        )
        const parsedObjects = []
        for await (const record of parser.streamObjects()) {
            parsedObjects.push(record)
        }

        expect(parsedObjects).toEqual(objects)
    })

    it('should escape fields with commas and quotes correctly', async () => {
        const objects = [
            {
                name: 'Alice, the "Great"',
                age: '30',
                city: 'New York',
            },
            {
                name: 'Bob',
                age: '25',
                city: 'Los Angeles, CA',
            },
        ]

        const parser = new Csv(
            Csv.stringify(objects, {
                transform(row) {
                    return { ...row, age: Number(row.age), test: true }
                },
            }),
        )
        const parsedObjects = parser.read()

        expect(parsedObjects).toEqual(
            objects.map((obj) => ({
                ...obj,
                test: 'true',
            })),
        )

        parsedObjects[0].test = true
        parsedObjects[0].age = 10
        parsedObjects[0].name = 'New Name'

        //@ts-expect-error Type 'test' does not exist on type
        parsedObjects[0].test2 = true

        //@ts-expect-error Type 'age' has a type of 'number'
        parsedObjects[0].age = true
    })
})
