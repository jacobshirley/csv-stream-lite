# csv-stream-Lite Examples

This directory contains example scripts demonstrating how to use the csv-stream-Lite library.

## Basic CSV streaming example

```typescript
import { Csv } from 'csv-stream-lite'

const csvData = `name,age,city
Alice,30,New York
Bob,25,Los Angeles
Charlie,35,Chicago`

for await (const row of new Csv(csvData).streamObjectsAsync()) {
    console.log(row)
}

// Output:
// { name: 'Alice', age: '30', city: 'New York' }
// { name: 'Bob', age: '25', city: 'Los Angeles' }
// { name: 'Charlie', age: '35', city: 'Chicago' }
```

## Low-level CSV streaming example

```typescript
import { Csv } from 'csv-stream-lite'

const csvData = `name,age,city
Alice,30,New York
Bob,25,Los Angeles
Charlie,35,Chicago`

let i = 0

const csvStream = new Csv(csvData)
for await (const row of csvStream) {
    for await (const cell of row) {
        if (i++ % 2 === 0) {
            continue
        }
        for await (const char of cell) {
            // Write each character to stdout as we read it
            process.stdout.write(char)
        }
        process.stdout.write('\n')
    }
}

// Output:
// age
// Alice
// New York
// 25
// Charlie
// Chicago

// Note: There are no delimiters or newlines in the output because we are
// writing each cell directly as we read it.
```

## Type Coercion Example

```typescript
import { Csv } from 'csv-stream-lite'

const csvData = `name,age,city
Alice,30,New York
Bob,25,Los Angeles
Charlie,35,Chicago`

// Define a schema for type coercion
const schema = {
    name: String,
    age: Number,
    city: String,
}

for await (const row of new Csv(csvData, {
    shape: schema,
}).streamObjectsAsync()) {
    console.log(row)
    // TypeScript infers the type of `row` as:
    // {
    //     name: string;
    //     age: number;
    //     city: string;
    // }
}

// Output:
// { name: 'Alice', age: 30, city: 'New York' }
// { name: 'Bob', age: 25, city: 'Los Angeles' }
// { name: 'Charlie', age: 35, city: 'Chicago' }
```

## Object to CSV stringification example

```typescript
import { Csv } from 'csv-stream-lite'

const data = [
    { name: 'Alice', age: 30, city: 'New York' },
    { name: 'Bob', age: 25, city: 'Los Angeles' },
    { name: 'Charlie', age: 35, city: 'Chicago' },
]

const csvString = Csv.stringifier(data).toString()
console.log(csvString)

// Output:
// name,age,city
// Alice,30,New York
// Bob,25,Los Angeles
// Charlie,35,Chicago
```

## Object to CSV stringification streaming example

```typescript
import { Csv } from 'csv-stream-lite'

const data = [
    { name: 'Alice', age: 30, city: 'New York' },
    { name: 'Bob', age: 25, city: 'Los Angeles' },
    { name: 'Charlie', age: 35, city: 'Chicago' },
]

const csvStream = Csv.stringify(data)
for (const chunk of csvStream) {
    process.stdout.write(chunk)
}

process.stdout.write('\n')

// Output:
// name,age,city
// Alice,30,New York
// Bob,25,Los Angeles
// Charlie,35,Chicago
```

## Transforming parsed CSV data before further processing

```typescript
import { Csv } from 'csv-stream-lite'

const csvData = `first_name,last_name,age
Alice,Smith,30
Bob,Johnson,25`

const csvStream = new Csv(csvData, {
    transform: (record: {
        first_name: string
        last_name: string
        age: string
    }) => ({
        fullName: `${record.first_name} ${record.last_name}`,
        age: Number(record.age),
    }),
})

for await (const row of csvStream.streamObjectsAsync()) {
    console.log(row)
}

// Output:
// { fullName: 'Alice Smith', age: 30 }
// { fullName: 'Bob Johnson', age: 25 }
```

## Transform CSV data during stringification

```typescript
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
```
