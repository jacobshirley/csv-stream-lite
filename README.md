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

### Core Classes

#### `Csv<T, O>`

Main CSV parser class for parsing complete CSV documents.

**Constructor Options:**

- `separator?: string` - Field separator character (default: `,`)
- `escapeChar?: string` - Escape character (default: `"`)
- `readHeaders?: boolean` - Read first row as headers (default: `true`)
- `headers?: string[]` - Explicit headers to use
- `shape?: CsvObjectShape<T>` - Type transformers for each field
- `strictColumns?: boolean` - Enforce exact column count (default: `false`)
- `includeExtraCells?: boolean` - Include extra cells beyond headers (default: `false`)
- `ignoreUtf8Bom?: boolean` - Ignore UTF-8 BOM if present (default: `true`)
- `transform?: (row: T) => O` - Transform function for each row

**Methods:**

- `read(): O[]` - Read all rows synchronously
- `readAsync(): Promise<O[]>` - Read all rows asynchronously
- `stream(): Generator<CsvRow>` - Stream rows synchronously
- `streamAsync(): AsyncGenerator<CsvRow>` - Stream rows asynchronously
- `streamObjects(): Generator<O>` - Stream parsed objects synchronously
- `streamObjectsAsync(): AsyncGenerator<O>` - Stream parsed objects asynchronously

**Static Methods:**

- `Csv.stringify<T>(values: T[], options?): Generator<string>` - Stringify objects to CSV
- `Csv.stringifyAsync<T>(values: T[], options?): AsyncGenerator<string>` - Stringify objects to CSV asynchronously

#### `CsvStringify<T, O>`

CSV stringifier class for converting objects to CSV format.

**Constructor Options:**

- `headers?: string[]` - Array of headers
- `delimiter?: string` - Field delimiter (default: `,`)
- `escapeChar?: string` - Escape character (default: `"`)
- `quoteChar?: string` - Quote character (default: `"`)
- `newline?: string` - Newline character (default: `\n`)
- `writeBom?: boolean` - Write UTF-8 BOM (default: `false`)
- `alwaysWriteHeaders?: boolean` - Write headers even if no records (default: `false`)
- `transform?: (row: T) => O` - Transform function for each row

**Methods:**

- `toString(): string` - Get complete CSV string synchronously
- `toStringAsync(): Promise<string>` - Get complete CSV string asynchronously
- `toStream(): Generator<string>` - Stream CSV chunks synchronously
- `toStreamAsync(): AsyncGenerator<string>` - Stream CSV chunks asynchronously

#### `CsvRow<T, O>`

Represents a single CSV row.

**Methods:**

- `read(): string[]` - Read row as array of strings
- `readAsync(): Promise<string[]>` - Read row as array of strings asynchronously
- `readObject(options): O` - Read row as typed object
- `readObjectAsync(options): Promise<O>` - Read row as typed object asynchronously

#### `CsvCell`

Represents a single CSV cell.

**Methods:**

- `read(): string` - Read cell as string
- `readAsync(): Promise<string>` - Read cell as string asynchronously
- `readAs<T>(transform: (cell: string) => T): T` - Read and transform cell
- `readAsAsync<T>(transform): Promise<T>` - Read and transform cell asynchronously

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

## Links

- [Documentation](https://jacobshirley.github.io/csv-stream-lite/v1)
- [GitHub Repository](https://github.com/jacobshirley/csv-stream-lite)
- [npm Package](https://www.npmjs.com/package/csv-stream-lite)
- [Issue Tracker](https://github.com/jacobshirley/csv-stream-lite/issues)
