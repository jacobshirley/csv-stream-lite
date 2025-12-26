// Object to CSV stringification streaming example

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
