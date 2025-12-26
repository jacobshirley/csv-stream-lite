// Low-level CSV streaming example

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
