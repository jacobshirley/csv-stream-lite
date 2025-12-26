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
