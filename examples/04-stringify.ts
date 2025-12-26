// Object to CSV stringification example

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
