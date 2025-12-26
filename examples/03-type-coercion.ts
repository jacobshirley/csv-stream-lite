// Type Coercion Example

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
