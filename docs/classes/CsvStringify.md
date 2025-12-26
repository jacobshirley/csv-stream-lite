[**csv-stream-lite**](../README.md)

---

[csv-stream-lite](../packages.md) / CsvStringify

# Class: CsvStringify\<T, O\>

CSV stringifier class for converting JavaScript objects into CSV format.
Supports both synchronous and asynchronous streaming of CSV output.

## Example

```typescript
const data = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
]
const stringifier = new CsvStringify(data, { headers: ['name', 'age'] })
const csvString = stringifier.toString()
```

## Type Parameters

### T

`T` _extends_ `object` = `object`

The input object type

### O

`O` _extends_ `object` = `T`

The output object type after optional transformation (defaults to T)

## Constructors

### Constructor

> **new CsvStringify**\<`T`, `O`\>(`values`, `options?`): `CsvStringify`\<`T`, `O`\>

Creates a new CSV stringifier.

#### Parameters

##### values

Iterable or async iterable of objects to stringify

`Iterable`\<`T`, `any`, `any`\> | `AsyncIterable`\<`T`, `any`, `any`\>

##### options?

[`CsvStringifyOptions`](../interfaces/CsvStringifyOptions.md)\<`T`, `O`\>

Optional configuration for CSV stringification

#### Returns

`CsvStringify`\<`T`, `O`\>

## Properties

### alwaysWriteHeaders

> **alwaysWriteHeaders**: `boolean`

---

### delimiter

> **delimiter**: `string`

---

### escapeChar

> **escapeChar**: `string`

---

### headers?

> `optional` **headers**: `string`[]

---

### newline

> **newline**: `string`

---

### quoteChar

> **quoteChar**: `string`

---

### transform()?

> `optional` **transform**: (`row`) => `O`

#### Parameters

##### row

`T`

#### Returns

`O`

---

### writeBom

> **writeBom**: `boolean`

## Methods

### \[asyncIterator\]()

> **\[asyncIterator\]**(): `AsyncGenerator`\<[`CsvString`](../type-aliases/CsvString.md)\<`O`\>\>

Makes this stringifier async iterable using the asynchronous stream.

#### Returns

`AsyncGenerator`\<[`CsvString`](../type-aliases/CsvString.md)\<`O`\>\>

An async generator that yields CSV strings

---

### \[iterator\]()

> **\[iterator\]**(): `Generator`\<[`CsvString`](../type-aliases/CsvString.md)\<`O`\>\>

Makes this stringifier iterable using the synchronous stream.

#### Returns

`Generator`\<[`CsvString`](../type-aliases/CsvString.md)\<`O`\>\>

A generator that yields CSV strings

---

### toStream()

> **toStream**(): `Generator`\<[`CsvString`](../type-aliases/CsvString.md)\<`O`\>\>

Returns a synchronous generator that yields CSV string chunks.

#### Returns

`Generator`\<[`CsvString`](../type-aliases/CsvString.md)\<`O`\>\>

A generator that yields CSV strings

#### Throws

If values is not iterable

---

### toStreamAsync()

> **toStreamAsync**(): `AsyncGenerator`\<[`CsvString`](../type-aliases/CsvString.md)\<`O`\>\>

Returns an asynchronous generator that yields CSV string chunks.

#### Returns

`AsyncGenerator`\<[`CsvString`](../type-aliases/CsvString.md)\<`O`\>\>

An async generator that yields CSV strings

---

### toString()

> **toString**(): [`CsvString`](../type-aliases/CsvString.md)\<`O`\>

Converts all values to a single CSV string synchronously.

#### Returns

[`CsvString`](../type-aliases/CsvString.md)\<`O`\>

The complete CSV string

---

### toStringAsync()

> **toStringAsync**(): `Promise`\<[`CsvString`](../type-aliases/CsvString.md)\<`O`\>\>

Converts all values to a single CSV string asynchronously.

#### Returns

`Promise`\<[`CsvString`](../type-aliases/CsvString.md)\<`O`\>\>

A promise that resolves to the complete CSV string
