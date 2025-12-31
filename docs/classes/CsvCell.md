[**csv-stream-lite**](../README.md)

---

[csv-stream-lite](../packages.md) / CsvCell

# Class: CsvCell

Represents a single CSV cell that can be read as a string or streamed in chunks.
Handles quoted cells and escape sequences according to CSV standards.

## Extends

- [`CsvEntity`](CsvEntity.md)\<`string`\>

## Constructors

### Constructor

> **new CsvCell**(`asyncIterable?`, `options?`): `CsvCell`

Creates a new CSV entity.

#### Parameters

##### asyncIterable?

Optional byte stream or buffer to parse

`ByteBuffer` | [`ByteStream`](../type-aliases/ByteStream.md)

##### options?

[`CsvEntityOptions`](../interfaces/CsvEntityOptions.md)

Configuration options for parsing

#### Returns

`CsvCell`

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`constructor`](CsvEntity.md#constructor)

## Properties

### byteBuffer

> **byteBuffer**: `ByteBuffer`

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`byteBuffer`](CsvEntity.md#bytebuffer)

---

### chunkSize

> **chunkSize**: `number` = `DEFAULT_CHUNK_SIZE`

---

### consumed

> **consumed**: `boolean` = `false`

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`consumed`](CsvEntity.md#consumed)

---

### endOfLineReached

> **endOfLineReached**: `boolean` = `false`

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

> **\[asyncIterator\]**(): `AsyncGenerator`\<`string`\>

Makes this entity async iterable using the asynchronous stream.

#### Returns

`AsyncGenerator`\<`string`\>

An async generator that yields values of type S

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`[asyncIterator]`](CsvEntity.md#asynciterator)

---

### \[iterator\]()

> **\[iterator\]**(): `Generator`\<`string`\>

Makes this entity iterable using the synchronous stream.

#### Returns

`Generator`\<`string`\>

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

> `protected` **parse**(): `string`

#### Returns

`string`

#### Overrides

[`CsvEntity`](CsvEntity.md).[`parse`](CsvEntity.md#parse)

---

### parseAsync()

> `protected` **parseAsync**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[`CsvEntity`](CsvEntity.md).[`parseAsync`](CsvEntity.md#parseasync)

---

### read()

> **read**(): `string`

Reads and parses the entire entity synchronously.
Marks the entity as consumed after reading.

#### Returns

`string`

The parsed result of type T

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`read`](CsvEntity.md#read)

---

### readAs()

> **readAs**\<`T`\>(`transform`): `T`

Reads the cell value and transforms it using the provided function.
Special handling for Boolean transformer: converts 'true'/'false' strings to boolean.

#### Type Parameters

##### T

`T`

The type to transform the cell value into

#### Parameters

##### transform

(`cell`) => `T`

Function to transform the cell string into type T

#### Returns

`T`

The transformed value of type T

---

### readAsAsync()

> **readAsAsync**\<`T`\>(`transform`): `Promise`\<`T`\>

Asynchronously reads the cell value and transforms it using the provided function.
Special handling for Boolean transformer: converts 'true'/'false' strings to boolean.

#### Type Parameters

##### T

`T`

The type to transform the cell value into

#### Parameters

##### transform

(`cell`) => `T` \| `Promise`\<`T`\>

Function to transform the cell string into type T (can be async)

#### Returns

`Promise`\<`T`\>

A promise that resolves to the transformed value of type T

---

### readAsync()

> **readAsync**(): `Promise`\<`string`\>

Reads and parses the entire entity asynchronously.
Marks the entity as consumed after reading.

#### Returns

`Promise`\<`string`\>

A promise that resolves to the parsed result of type T

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`readAsync`](CsvEntity.md#readasync)

---

### stream()

> **stream**(): `Generator`\<`string`\>

Returns a synchronous generator that yields chunks of type S.
Marks the entity as consumed when iteration completes.

#### Returns

`Generator`\<`string`\>

A generator that yields values of type S

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`stream`](CsvEntity.md#stream)

---

### streamAsync()

> **streamAsync**(): `AsyncGenerator`\<`string`\>

Returns an asynchronous generator that yields chunks of type S.
Handles buffering and automatically reads more data as needed.

#### Returns

`AsyncGenerator`\<`string`\>

An async generator that yields values of type S

#### Inherited from

[`CsvEntity`](CsvEntity.md).[`streamAsync`](CsvEntity.md#streamasync)

---

### streamImpl()

> `protected` **streamImpl**(): `Generator`\<`string`\>

#### Returns

`Generator`\<`string`\>

#### Overrides

[`CsvEntity`](CsvEntity.md).[`streamImpl`](CsvEntity.md#streamimpl)
