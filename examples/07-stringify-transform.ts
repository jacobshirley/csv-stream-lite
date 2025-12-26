// Transform CSV data during stringification

import { Csv } from 'csv-stream-lite'

const data = [
    { name: 'Alice', age: 30, city: 'New York' },
    { name: 'Bob', age: 25, city: 'Los Angeles' },
]

const csvStringifier = Csv.stringifier(data, {
    transform: (row: { name: string; age: number; city: string }) => ({
        fullName: row.name.toUpperCase(),
        ageInFiveYears: row.age + 5,
        city: row.city,
    }),
})
