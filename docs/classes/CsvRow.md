[**csv-stream-lite**](../README.md)

---

[csv-stream-lite](../packages.md) / CsvRow

# Class: CsvRow\<T, I\>

Represents a single CSV row that can be read as an array of strings or streamed as individual cells.
Can also be parsed into an object using a shape definition.

## Type Param

The output type after optional transformation (defaults to T)

## Extends

- [`CsvEntity`](CsvEntity.md)\<`string`[], [`CsvCell`](CsvCell.md)\>

## Type Parameters

### T

`T` _extends_ `object` = `object`

The object type when reading as an object

### I

`I` = `unknown`

## Constructors

### Constructor

> **new CsvRow**\<`T`, `I`\>(`asyncIterable?`, `options?`): `CsvRow`\<`T`, `I`\>

Creates a new CSV entity.

#### Parameters

##### asyncIterable?

Optional byte stream or buffer to parse

`ByteBuffer` | [`ByteStream`](../type-aliases/ByteStream.md)

##### options?

[`CsvEntityOptions`](../interfaces/CsvEntityOptions.md)

Configuration options for parsing

#### Returns

`CsvRow`\<`T`, `I`\>

#### Inherited from

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

### newline?

> `optional` **newline**: `string`

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`newline`](CsvEntity.md#newline)

---

### quoteChar

> **quoteChar**: `string` = `'"'`

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`quoteChar`](CsvEntity.md#quotechar)

---

### separator

> **separator**: `string` = `','`

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`separator`](CsvEntity.md#separator)

---

### trim

> **trim**: `boolean` = `false`

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`trim`](CsvEntity.md#trim)

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

> **\[asyncIterator\]**(): `AsyncGenerator`\<[`CsvCell`](CsvCell.md)\>

Makes this entity async iterable using the asynchronous stream.

#### Returns

`AsyncGenerator`\<[`CsvCell`](CsvCell.md)\>

An async generator that yields values of type S

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`[asyncIterator]`](CsvEntity.md#asynciterator)

---

### \[iterator\]()

> **\[iterator\]**(): `Generator`\<[`CsvCell`](CsvCell.md)\>

Makes this entity iterable using the synchronous stream.

#### Returns

`Generator`\<[`CsvCell`](CsvCell.md)\>

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

> `protected` **parse**(): `string`[]

#### Returns

`string`[]

#### Overrides

[`CsvEntity`](CsvEntity.md).[`parse`](CsvEntity.md#parse)

---

### parseAsync()

> `protected` **parseAsync**(): `Promise`\<`string`[]\>

#### Returns

`Promise`\<`string`[]\>

#### Overrides

[`CsvEntity`](CsvEntity.md).[`parseAsync`](CsvEntity.md#parseasync)

---

### read()

> **read**(): `string`[]

Reads and parses the entire entity synchronously.
Marks the entity as consumed after reading.

#### Returns

`string`[]

The parsed result of type T

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`read`](CsvEntity.md#read)

---

### readAsync()

> **readAsync**(): `Promise`\<`string`[]\>

Reads and parses the entire entity asynchronously.
Marks the entity as consumed after reading.

#### Returns

`Promise`\<`string`[]\>

A promise that resolves to the parsed result of type T

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`readAsync`](CsvEntity.md#readasync)

---

### readObject()

> **readObject**(`options`): `T`

Reads the row as an object using the provided shape definition.
Handles column count validation and extra cells based on options.

#### Parameters

##### options

[`CsvRowObjectOptions`](../interfaces/CsvRowObjectOptions.md)\<`T`, `I`\>

Configuration for reading the row as an object

#### Returns

`T`

The parsed object of type O

#### Throws

If strictColumns is true and extra cells are found

#### Throws

If strictColumns is true and cells are missing

---

### readObjectAsync()

> **readObjectAsync**(`options`): `Promise`\<`T`\>

Asynchronously reads the row as an object using the provided shape definition.
Automatically handles buffer refills as needed.

#### Parameters

##### options

[`CsvRowObjectOptions`](../interfaces/CsvRowObjectOptions.md)\<`T`, `I`\>

Configuration for reading the row as an object

#### Returns

`Promise`\<`T`\>

A promise that resolves to the parsed object of type O

---

### stream()

> **stream**(): `Generator`\<[`CsvCell`](CsvCell.md)\>

Returns a synchronous generator that yields chunks of type S.
Marks the entity as consumed when iteration completes.

#### Returns

`Generator`\<[`CsvCell`](CsvCell.md)\>

A generator that yields values of type S

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`stream`](CsvEntity.md#stream)

---

### streamAsync()

> **streamAsync**(): `AsyncGenerator`\<[`CsvCell`](CsvCell.md)\>

Returns an asynchronous generator that yields chunks of type S.
Handles buffering and automatically reads more data as needed.

#### Returns

`AsyncGenerator`\<[`CsvCell`](CsvCell.md)\>

An async generator that yields values of type S

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`streamAsync`](CsvEntity.md#streamasync)

---

### streamImpl()

> `protected` **streamImpl**(): `Generator`\<[`CsvCell`](CsvCell.md)\>

#### Returns

`Generator`\<[`CsvCell`](CsvCell.md)\>

#### Overrides

[`CsvEntity`](CsvEntity.md).[`streamImpl`](CsvEntity.md#streamimpl)
