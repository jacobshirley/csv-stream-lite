[**csv-stream-lite**](../README.md)

---

[csv-stream-lite](../packages.md) / CsvStreamLiteError

# Class: CsvStreamLiteError

Base error class for CSV Stream Lite errors.

## Extends

- `Error`

## Extended by

- [`NoMoreTokensError`](NoMoreTokensError.md)
- [`EofReachedError`](EofReachedError.md)
- [`BufferSizeExceededError`](BufferSizeExceededError.md)
- [`TooManyColumnsError`](TooManyColumnsError.md)
- [`TooFewColumnsError`](TooFewColumnsError.md)

## Constructors

### Constructor

> **new CsvStreamLiteError**(`message?`): `CsvStreamLiteError`

#### Parameters

##### message?

`string`

#### Returns

`CsvStreamLiteError`

#### Inherited from

`Error.constructor`

### Constructor

> **new CsvStreamLiteError**(`message?`, `options?`): `CsvStreamLiteError`

#### Parameters

##### message?

`string`

##### options?

`ErrorOptions`

#### Returns

`CsvStreamLiteError`

#### Inherited from

`Error.constructor`
