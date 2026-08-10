// Csv.parse and Csv.stream static helpers

import { Csv } from 'csv-stream-lite'

const csvData = `name,age,city
Alice,30,New York
Bob,25,Los Angeles
Charlie,35,Chicago`

// Csv.parse() takes a string (or any ByteStream) and returns a typed array
// directly, without needing to construct a Csv instance yourself.
const rows = Csv.parse<{ name: string; age: number; city: string }>(csvData, {
    shape: { name: String, age: Number, city: String },
})
console.log(rows)

// Csv.stream() is a shorthand for `new Csv(...)`, useful when you want to
// stream rows instead of collecting them all into an array.
for (const row of Csv.stream<{ name: string; age: number; city: string }>(
    csvData,
    { shape: { name: String, age: Number, city: String } },
).streamObjects()) {
    console.log(row)
}

// Both also have async counterparts for use with async byte streams.
const asyncRows = await Csv.parseAsync<{
    name: string
    age: number
    city: string
}>(csvData, { shape: { name: String, age: Number, city: String } })
console.log(asyncRows)

// Output:
// [
//   { name: 'Alice', age: 30, city: 'New York' },
//   { name: 'Bob', age: 25, city: 'Los Angeles' },
//   { name: 'Charlie', age: 35, city: 'Chicago' }
// ]
