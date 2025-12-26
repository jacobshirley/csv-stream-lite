// Transforming parsed CSV data before further processing

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
