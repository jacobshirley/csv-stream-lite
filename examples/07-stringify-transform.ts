// Transform CSV data during stringification

import { Csv } from 'csv-stream-lite'

const data = [
    { name: 'Alice', age: 30, city: 'New York' },
    { name: 'Bob', age: 25, city: 'Los Angeles' },
]

const csvStringifier = Csv.stringifier(data, {
    transform: (row) => ({
        fullName: row.name.toUpperCase(),
        ageInFiveYears: row.age + 5,
        city: row.city,
        cityWithCountry: `${row.city}, USA`,
    }),
})

console.log(csvStringifier.toString())
// Expected output:
// fullName,ageInFiveYears,city,cityWithCountry
// ALICE,35,New York,"New York, USA"
// BOB,30,Los Angeles,"Los Angeles, USA"
