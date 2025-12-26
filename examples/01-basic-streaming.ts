// Basic CSV streaming example

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
