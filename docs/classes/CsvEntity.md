[**csv-stream-lite**](../README.md)

---

[csv-stream-lite](../packages.md) / CsvEntity

# Abstract Class: CsvEntity\<T, S\>

Abstract base class for CSV entities that supports both synchronous and asynchronous parsing.
Provides common functionality for reading and streaming CSV data.

## Extended by

- [`CsvCell`](CsvCell.md)
- [`CsvRow`](CsvRow.md)
- [`Csv`](Csv.md)

## Type Parameters

### T

`T`

The type returned by read operations

### S

`S` = `T`

The type yielded by stream operations (defaults to T)

## Implements

- `Required`\<[`CsvEntityOptions`](../interfaces/CsvEntityOptions.md)\>

## Constructors

### Constructor

> **new CsvEntity**\<`T`, `S`\>(`asyncIterable?`, `options?`): `CsvEntity`\<`T`, `S`\>

Creates a new CSV entity.

#### Parameters

##### asyncIterable?

Optional byte stream or buffer to parse

`ByteBuffer` | [`ByteStream`](../type-aliases/ByteStream.md)

##### options?

[`CsvEntityOptions`](../interfaces/CsvEntityOptions.md)

Configuration options for parsing

#### Returns

`CsvEntity`\<`T`, `S`\>

## Properties

### byteBuffer

> **byteBuffer**: `ByteBuffer`

---

### consumed

> **consumed**: `boolean` = `false`

---

### escapeChar

> **escapeChar**: `string` = `'"'`

Character used to escape special characters. Defaults to '"'

#### Implementation of

[`CsvEntityOptions`](../interfaces/CsvEntityOptions.md).[`escapeChar`](../interfaces/CsvEntityOptions.md#escapechar)

---

### separator

> **separator**: `string` = `','`

Character used to separate fields. Defaults to ','

#### Implementation of

[`CsvEntityOptions`](../interfaces/CsvEntityOptions.md).[`separator`](../interfaces/CsvEntityOptions.md#separator)

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

## Methods

### \[asyncIterator\]()

> **\[asyncIterator\]**(): `AsyncGenerator`\<`S`\>

Makes this entity async iterable using the asynchronous stream.

#### Returns

`AsyncGenerator`\<`S`\>

An async generator that yields values of type S

---

### \[iterator\]()

> **\[iterator\]**(): `Generator`\<`S`\>

Makes this entity iterable using the synchronous stream.

#### Returns

`Generator`\<`S`\>

A generator that yields values of type S

---

### consume()

> **consume**(): `void`

Consumes the entity if it hasn't been consumed yet.
This ensures the buffer advances to the end of this entity.

#### Returns

`void`

---

### consumeAsync()

> **consumeAsync**(): `Promise`\<`void`\>

Asynchronously consumes the entity if it hasn't been consumed yet.
This ensures the buffer advances to the end of this entity.

#### Returns

`Promise`\<`void`\>

A promise that resolves when consumption is complete

---

### parse()

> `abstract` `protected` **parse**(): `T`

#### Returns

`T`

---

### parseAsync()

> `abstract` `protected` **parseAsync**(): `Promise`\<`T`\>

#### Returns

`Promise`\<`T`\>

---

### read()

> **read**(): `T`

Reads and parses the entire entity synchronously.
Marks the entity as consumed after reading.

#### Returns

`T`

The parsed result of type T

---

### readAsync()

> **readAsync**(): `Promise`\<`T`\>

Reads and parses the entire entity asynchronously.
Marks the entity as consumed after reading.

#### Returns

`Promise`\<`T`\>

A promise that resolves to the parsed result of type T

---

### stream()

> **stream**(): `Generator`\<`S`\>

Returns a synchronous generator that yields chunks of type S.
Marks the entity as consumed when iteration completes.

#### Returns

`Generator`\<`S`\>

A generator that yields values of type S

---

### streamAsync()

> **streamAsync**(): `AsyncGenerator`\<`S`\>

Returns an asynchronous generator that yields chunks of type S.
Handles buffering and automatically reads more data as needed.

#### Returns

`AsyncGenerator`\<`S`\>

An async generator that yields values of type S

---

### streamImpl()

> `abstract` `protected` **streamImpl**(): `Generator`\<`S`\>

#### Returns

`Generator`\<`S`\>
