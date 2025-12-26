[**csv-stream-lite**](../README.md)

---

[csv-stream-lite](../packages.md) / ByteStream

# Type Alias: ByteStream\<T\>

> **ByteStream**\<`T`\> = `AsyncIterable`\<[`StreamInput`](StreamInput.md)\<`T`\>\> \| `Iterable`\<[`StreamInput`](StreamInput.md)\<`T`\>\> \| `ReadableStream`\<[`StreamInput`](StreamInput.md)\<`T`\>\>

An async iterable stream of JSON input that can be consumed incrementally.
Supports strings, numbers, arrays of numbers, or Uint8Arrays as stream items.

## Type Parameters

### T

`T` = `unknown`
