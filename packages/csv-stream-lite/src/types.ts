/**
 * A utility type to prevent TypeScript from inferring a type parameter.
 */
export type CsvString<T = unknown> = string & { __csvStringBrand?: T }

/**
 * Union type representing valid stream input formats.
 */
export type StreamInput<T = unknown> =
    | CsvString<T>
    | number
    | number[]
    | Uint8Array

/**
 * An async iterable stream of JSON input that can be consumed incrementally.
 * Supports strings, numbers, arrays of numbers, or Uint8Arrays as stream items.
 */
export type ByteStream<T = unknown> =
    | AsyncIterable<StreamInput<T>>
    | Iterable<StreamInput<T>>
    | ReadableStream<StreamInput<T>>
