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

/**
 * Defines the shape of a CSV object by mapping each property key to a transformer function.
 * The transformer function converts a cell string into the appropriate type for that property.
 *
 * @typeParam T - The object type being defined
 *
 * @example
 * ```typescript
 * const shape: CsvObjectShape<User> = {
 *   name: String,
 *   age: Number,
 *   active: Boolean
 * }
 * ```
 */
export type CsvObjectShape<T extends object> = {
    [key in keyof T]: (cell: string) => T[key]
}
