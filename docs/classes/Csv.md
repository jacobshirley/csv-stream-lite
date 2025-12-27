[**csv-stream-lite**](../README.md)

---

[csv-stream-lite](../packages.md) / Csv

# Class: Csv\<T, I\>

Main CSV parser class for parsing complete CSV documents.
Supports reading headers, streaming rows, and converting rows to objects.

## Type Param

The output type after optional transformation (defaults to T)

## Example

```typescript
// Parse CSV with headers
const csv = new Csv(fileStream)
for await (const row of csv.streamObjectsAsync()) {
    console.log(row)
}
```

## Extends

- [`CsvEntity`](CsvEntity.md)\<`T`[], [`CsvRow`](CsvRow.md)\<`T`, `I`\>\>

## Type Parameters

### T

`T` _extends_ `object`

The object type for each row when reading as objects

### I

`I` = `unknown`

## Constructors

### Constructor

> **new Csv**\<`T`, `I`\>(`asyncIterable?`, `options?`): `Csv`\<`T`, `I`\>

Creates a new CSV parser.

#### Parameters

##### asyncIterable?

Optional byte stream or buffer containing CSV data

`ByteBuffer` | [`ByteStream`](../type-aliases/ByteStream.md)\<`T`\>

##### options?

[`CsvEntityOptions`](../interfaces/CsvEntityOptions.md) & `object`

Configuration options for CSV parsing

#### Returns

`Csv`\<`T`, `I`\>

#### Throws

If both headers and shape options are specified

#### Overrides

[`CsvEntity`](CsvEntity.md).[`constructor`](CsvEntity.md#constructor)

## Properties

### byteBuffer

> **byteBuffer**: `ByteBuffer`

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`byteBuffer`](CsvEntity.md#bytebuffer)

---

### consumed

> **consumed**: `boolean` = `false`

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`consumed`](CsvEntity.md#consumed)

---

### escapeChar

> **escapeChar**: `string` = `'"'`

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`escapeChar`](CsvEntity.md#escapechar)

---

### headers?

> `optional` **headers**: `string`[]

---

### ignoreUtf8Bom

> **ignoreUtf8Bom**: `boolean` = `true`

---

### includeExtraCells

> **includeExtraCells**: `boolean` = `false`

---

### newline?

> `optional` **newline**: `string`

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`newline`](CsvEntity.md#newline)

---

### readHeaders

> **readHeaders**: `boolean` = `true`

---

### separator

> **separator**: `string` = `','`

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`separator`](CsvEntity.md#separator)

---

### shape?

> `optional` **shape**: [`CsvObjectShape`](../type-aliases/CsvObjectShape.md)\<`T`\>

---

### strictColumns

> **strictColumns**: `boolean` = `false`

---

### transform()?

> `optional` **transform**: (`row`) => `T`

#### Parameters

##### row

`I`

#### Returns

`T`

## Accessors

### allowBufferToBeExceeded

#### Get Signature

> **get** **allowBufferToBeExceeded**(): `boolean`

##### Returns

`boolean`

#### Set Signature

> **set** **allowBufferToBeExceeded**(`value`): `void`

##### Parameters

###### value

`boolean`

##### Returns

`void`

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`allowBufferToBeExceeded`](CsvEntity.md#allowbuffertobeexceeded)

---

### maxBufferSize

#### Get Signature

> **get** **maxBufferSize**(): `number`

##### Returns

`number`

#### Set Signature

> **set** **maxBufferSize**(`size`): `void`

##### Parameters

###### size

`number`

##### Returns

`void`

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`maxBufferSize`](CsvEntity.md#maxbuffersize)

## Methods

### \[asyncIterator\]()

> **\[asyncIterator\]**(): `AsyncGenerator`\<[`CsvRow`](CsvRow.md)\<`T`, `I`\>\>

Makes this entity async iterable using the asynchronous stream.

#### Returns

`AsyncGenerator`\<[`CsvRow`](CsvRow.md)\<`T`, `I`\>\>

An async generator that yields values of type S

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`[asyncIterator]`](CsvEntity.md#asynciterator)

---

### \[iterator\]()

> **\[iterator\]**(): `Generator`\<[`CsvRow`](CsvRow.md)\<`T`, `I`\>\>

Makes this entity iterable using the synchronous stream.

#### Returns

`Generator`\<[`CsvRow`](CsvRow.md)\<`T`, `I`\>\>

A generator that yields values of type S

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`[iterator]`](CsvEntity.md#iterator)

---

### consume()

> **consume**(): `void`

Consumes the entity if it hasn't been consumed yet.
This ensures the buffer advances to the end of this entity.

#### Returns

`void`

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`consume`](CsvEntity.md#consume)

---

### consumeAsync()

> **consumeAsync**(): `Promise`\<`void`\>

Asynchronously consumes the entity if it hasn't been consumed yet.
This ensures the buffer advances to the end of this entity.

#### Returns

`Promise`\<`void`\>

A promise that resolves when consumption is complete

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`consumeAsync`](CsvEntity.md#consumeasync)

---

### parse()

> `protected` **parse**(): `T`[]

#### Returns

`T`[]

#### Overrides

[`CsvEntity`](CsvEntity.md).[`parse`](CsvEntity.md#parse)

---

### parseAsync()

> `protected` **parseAsync**(): `Promise`\<`T`[]\>

#### Returns

`Promise`\<`T`[]\>

#### Overrides

[`CsvEntity`](CsvEntity.md).[`parseAsync`](CsvEntity.md#parseasync)

---

### read()

> **read**(): `T`[]

Reads and parses the entire entity synchronously.
Marks the entity as consumed after reading.

#### Returns

`T`[]

The parsed result of type T

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`read`](CsvEntity.md#read)

---

### readAsync()

> **readAsync**(): `Promise`\<`T`[]\>

Reads and parses the entire entity asynchronously.
Marks the entity as consumed after reading.

#### Returns

`Promise`\<`T`[]\>

A promise that resolves to the parsed result of type T

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`readAsync`](CsvEntity.md#readasync)

---

### stream()

> **stream**(): `Generator`\<[`CsvRow`](CsvRow.md)\<`T`, `I`\>\>

Returns a synchronous generator that yields chunks of type S.
Marks the entity as consumed when iteration completes.

#### Returns

`Generator`\<[`CsvRow`](CsvRow.md)\<`T`, `I`\>\>

A generator that yields values of type S

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`stream`](CsvEntity.md#stream)

---

### streamAsync()

> **streamAsync**(): `AsyncGenerator`\<[`CsvRow`](CsvRow.md)\<`T`, `I`\>\>

Returns an asynchronous generator that yields chunks of type S.
Handles buffering and automatically reads more data as needed.

#### Returns

`AsyncGenerator`\<[`CsvRow`](CsvRow.md)\<`T`, `I`\>\>

An async generator that yields values of type S

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`streamAsync`](CsvEntity.md#streamasync)

---

### streamImpl()

> `protected` **streamImpl**(): `Generator`\<[`CsvRow`](CsvRow.md)\<`T`, `unknown`\>\>

#### Returns

`Generator`\<[`CsvRow`](CsvRow.md)\<`T`, `unknown`\>\>

#### Overrides

[`CsvEntity`](CsvEntity.md).[`streamImpl`](CsvEntity.md#streamimpl)

---

### streamObjects()

> **streamObjects**(): `Generator`\<`T`\>

Synchronously streams CSV rows as objects.
Reads headers from the first row if readHeaders is true.

#### Returns

`Generator`\<`T`\>

A generator that yields parsed objects of type O

#### Example

```typescript
const csv = new Csv(csvString)
for (const row of csv.streamObjects()) {
    console.log(row)
}
```

---

### streamObjectsAsync()

> **streamObjectsAsync**(): `AsyncGenerator`\<`T`\>

Asynchronously streams CSV rows as objects.
Automatically handles buffer refills as needed.

#### Returns

`AsyncGenerator`\<`T`\>

An async generator that yields parsed objects of type O

#### Example

```typescript
const csv = new Csv(fileStream)
for await (const row of csv.streamObjectsAsync()) {
    console.log(row)
}
```

---

### stringifier()

> `static` **stringifier**\<`T`, `O`\>(`values`, `options?`): [`CsvStringify`](CsvStringify.md)\<`T`, `T` _extends_ `O` ? `T`\<`T`\> : `O`\>

Static method to create a CsvStringify instance for advanced usage.

#### Type Parameters

##### T

`T` _extends_ `object`

The input object type

##### O

`O` _extends_ `object` = `T`

The output object type after optional transformation (defaults to T)

#### Parameters

##### values

`T`[]

Array of objects to convert to CSV

##### options?

[`CsvStringifyOptions`](../interfaces/CsvStringifyOptions.md)\<`T`, `T` _extends_ `O` ? `T`\<`T`\> : `O`\>

Optional configuration for CSV stringification

#### Returns

[`CsvStringify`](CsvStringify.md)\<`T`, `T` _extends_ `O` ? `T`\<`T`\> : `O`\>

A CsvStringify instance

---

### stringify()

> `static` **stringify**\<`T`, `O`\>(`values`, `options?`): `Generator`\<[`CsvString`](../type-aliases/CsvString.md)\<`T` _extends_ `O` ? `T`\<`T`\> : `O`\>\>

Static method to stringify an array of objects into CSV format.
Returns a synchronous generator that yields CSV string chunks.

#### Type Parameters

##### T

`T` _extends_ `object`

The input object type

##### O

`O` _extends_ `object` = `T`

The output object type after optional transformation (defaults to T)

#### Parameters

##### values

`T`[]

Array of objects to convert to CSV

##### options?

[`CsvStringifyOptions`](../interfaces/CsvStringifyOptions.md)\<`T`, `T` _extends_ `O` ? `T`\<`T`\> : `O`\>

Optional configuration for CSV stringification

#### Returns

`Generator`\<[`CsvString`](../type-aliases/CsvString.md)\<`T` _extends_ `O` ? `T`\<`T`\> : `O`\>\>

A generator that yields CSV string chunks

#### Example

```typescript
const data = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
]
for (const chunk of Csv.stringify(data, { headers: ['name', 'age'] })) {
    process.stdout.write(chunk)
}
```

---

### stringifyAsync()

> `static` **stringifyAsync**\<`T`, `O`\>(`values`, `options?`): `AsyncGenerator`\<[`CsvString`](../type-aliases/CsvString.md)\<`T` _extends_ `O` ? `T`\<`T`\> : `O`\>\>

Static method to stringify an array of objects into CSV format asynchronously.
Returns an asynchronous generator that yields CSV string chunks.

#### Type Parameters

##### T

`T` _extends_ `object`

The input object type

##### O

`O` _extends_ `object` = `T`

The output object type after optional transformation (defaults to T)

#### Parameters

##### values

`T`[]

Array of objects to convert to CSV

##### options?

[`CsvStringifyOptions`](../interfaces/CsvStringifyOptions.md)\<`T`, `T` _extends_ `O` ? `T`\<`T`\> : `O`\>

Optional configuration for CSV stringification

#### Returns

`AsyncGenerator`\<[`CsvString`](../type-aliases/CsvString.md)\<`T` _extends_ `O` ? `T`\<`T`\> : `O`\>\>

An async generator that yields CSV string chunks

#### Example

```typescript
const data = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
]
for await (const chunk of Csv.stringifyAsync(data)) {
    process.stdout.write(chunk)
}
```
