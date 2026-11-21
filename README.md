**[Examples](./EXAMPLES.md)** | **[Documentation](https://jacobshirley.github.io/csv-stream-lite/v1)**

# csv-stream-lite

A lightweight, memory-efficient, zero-dependency streaming CSV parser and stringifier written in TypeScript. Process large CSV files without loading them entirely into memory.

[![npm version](https://img.shields.io/npm/v/csv-stream-lite.svg)](https://www.npmjs.com/package/csv-stream-lite)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Zero Dependencies** - No external dependencies
- 💪 **TypeScript First** - Written in TypeScript with full type safety
- 🌊 **Streaming Support** - Process large CSV files without loading them into memory
- ⚡ **High Performance** - Efficient byte-level parsing
- 🔄 **Dual Mode** - Both synchronous and asynchronous APIs
- 🌐 **Universal** - Works in Node.js and browser environments
- 📝 **Flexible** - Support for custom delimiters, escape characters, and transformers
- ✅ **Well Tested** - Comprehensive test coverage

## Installation

```bash
npm install csv-stream-lite
```

```bash
yarn add csv-stream-lite
```

```bash
pnpm add csv-stream-lite
```

## Quick Start

### Parsing CSV

```typescript
import { Csv } from 'csv-stream-lite'

// Parse CSV string
const csvData = `name,age,city
Alice,30,New York
Bob,25,Los Angeles`

const csv = new Csv(csvData, { readHeaders: true })

// Sync streaming
for (const row of csv.streamObjects()) {
    console.log(row) // { name: 'Alice', age: '30', city: 'New York' }
}

// Async streaming (for large files)
for await (const row of csv.streamObjectsAsync()) {
    console.log(row)
}
```

### Parsing with Type Transformers

```typescript
import { Csv, CsvObjectShape } from 'csv-stream-lite'

interface User {
    name: string
    age: number
    active: boolean
}

const shape: CsvObjectShape<User> = {
    name: String,
    age: Number,
    active: Boolean,
}

const csv = new Csv<User>(fileStream, { shape })

for await (const user of csv.streamObjectsAsync()) {
    console.log(user.age) // Typed as number
}
```

### Stringifying to CSV

```typescript
import { Csv } from 'csv-stream-lite'

const data = [
    { name: 'Alice', age: 30, city: 'New York' },
    { name: 'Bob', age: 25, city: 'Los Angeles' },
]

// Sync
for (const chunk of Csv.stringify(data, { headers: ['name', 'age', 'city'] })) {
    process.stdout.write(chunk)
}

// Async
for await (const chunk of Csv.stringifyAsync(data)) {
    process.stdout.write(chunk)
}

// Or get complete string
const csvString = new CsvStringify(data).toString()
```

## API Documentation

Full API documentation is available at [https://jacobshirley.github.io/csv-stream-lite/v1](https://jacobshirley.github.io/csv-stream-lite/v1)

## Advanced Usage

### Reading from File Stream (Node.js)

```typescript
import { createReadStream } from 'fs'
import { Csv } from 'csv-stream-lite'

const fileStream = createReadStream('large-file.csv')

const csv = new Csv(fileStream, { readHeaders: true })

for await (const row of csv.streamObjectsAsync()) {
    // Process each row without loading entire file into memory
    console.log(row)
}
```

### Custom Delimiters

```typescript
// Tab-separated values
const csv = new Csv(tsvData, {
    separator: '\t',
    readHeaders: true,
})

// Semicolon-separated values
const csv = new Csv(csvData, {
    separator: ';',
    readHeaders: true,
})
```

### Strict Column Validation

```typescript
import { Csv, TooManyColumnsError, TooFewColumnsError } from 'csv-stream-lite'

const csvData = `name,age,city
Alice,30,New York
Bob,25,Los Angeles,ExtraColumn`

const csv = new Csv(csvData, {
    headers: ['name', 'age', 'city'],
    strictColumns: true, // Throws error if column count doesn't match
})

try {
    for await (const row of csv.streamObjectsAsync()) {
        console.log(row)
    }
} catch (error) {
    if (error instanceof TooManyColumnsError) {
        console.error('Row has too many columns')
    } else if (error instanceof TooFewColumnsError) {
        console.error('Row has too few columns')
    }
}
```

### Row Transformation

```typescript
const csv = new Csv(csvData, {
    readHeaders: true,
    transform: (row) => ({
        ...row,
        fullName: `${row.firstName} ${row.lastName}`,
        age: Number(row.age),
    }),
})
```

### Writing to File Stream (Node.js)

```typescript
import { createWriteStream } from 'fs'
import { CsvStringify } from 'csv-stream-lite'

const writeStream = createWriteStream('output.csv')

const data = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
]

const stringifier = new CsvStringify(data, {
    headers: ['name', 'age'],
})

for await (const chunk of stringifier) {
    writeStream.write(chunk)
}

writeStream.end()
```

## RFC 4180 Conformance Notes

csv-stream-lite follows [RFC 4180](https://www.rfc-editor.org/rfc/rfc4180) but is deliberately lenient in some places on read, and has a few writer defaults worth knowing about.

### Parser leniencies

- **Line endings**: bare `CR`, bare `LF`, `CRLF`, mixed endings and `LF CR` are all accepted as record separators (the RFC specifies `CRLF`). A run of consecutive line endings is treated as a single record separator, so blank lines are skipped. Use the `newline` option to force a specific (ASCII) line ending.
- **Quotes in unquoted fields**: a double quote inside an unquoted field is kept literally (`x"y` is read as `x"y`); the RFC does not allow this.
- **Rows with a different number of fields**: missing cells are `undefined` in object mode and extra cells are dropped by default (the RFC says every line should have the same number of fields). Use `strictColumns: true` to throw `TooFewColumnsError` / `TooManyColumnsError`, or `includeExtraCells: true` to keep extra cells as `extra_cell_N`.
- **Empty input lines**: `\r\n` on its own gives a single row `['']` from the row API (`CsvRow`) and no rows from the object API (`Csv`).
- **Duplicate header names**: the last column with that name wins.

### Writer defaults

- **Line ending**: `\n`, not `CRLF`. Pass `newline: '\r\n'` for strict RFC output.
- **Final line break**: none is written after the last record (`[{ a: 1 }, { a: 2 }]` gives `a\n1\n2`). RFC 4180 section 2.2 allows this, but some tools expect a trailing newline.
- **Leading and trailing spaces**: fields with leading or trailing spaces are written unquoted. The RFC does not require quoting and they round-trip.
- **Formula injection**: values starting with `=`, `+`, `-` or `@` are written as-is. If you export untrusted data for use in spreadsheet software, sanitise those values yourself (for example with the `transform` option).

## Error Handling

The library provides specific error types for different scenarios:

- `CsvStreamLiteError` - Base error class
- `NoMoreTokensError` - Buffer is empty and more input is needed
- `EofReachedError` - End of file reached
- `BufferSizeExceededError` - Buffer size limit exceeded
- `TooManyColumnsError` - Row has more columns than expected (when `strictColumns: true`)
- `TooFewColumnsError` - Row has fewer columns than expected (when `strictColumns: true`)

## Performance

csv-stream-lite is designed for memory efficiency and high performance:

- **Streaming Architecture**: Process files of any size with constant memory usage
- **Lazy Evaluation**: Data is only parsed as it's consumed
- **Byte-Level Parsing**: Efficient low-level parsing without intermediate string allocations
- **Chunked Processing**: Configurable chunk sizes for optimal performance

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import { Csv, CsvObjectShape } from 'csv-stream-lite'

interface User {
    id: number
    name: string
    email: string
    active: boolean
}

const shape: CsvObjectShape<User> = {
    id: Number,
    name: String,
    email: String,
    active: Boolean,
}

const csv = new Csv<User>(data, { shape })

// Type-safe iteration
for await (const user of csv.streamObjectsAsync()) {
    console.log(user.id) // TypeScript knows this is a number
}
```

## Browser Support

csv-stream-lite works in modern browsers with support for:

- `ReadableStream` API
- `AsyncIterable` protocol
- ES2018+ features

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

## License

MIT © [Jacob Shirley](https://github.com/jacobshirley)
