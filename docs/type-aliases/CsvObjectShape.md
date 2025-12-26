[**csv-stream-lite**](../README.md)

---

[csv-stream-lite](../packages.md) / CsvObjectShape

# Type Alias: CsvObjectShape\<T\>

> **CsvObjectShape**\<`T`\> = `{ [key in keyof T]: (cell: string) => T[key] }`

Defines the shape of a CSV object by mapping each property key to a transformer function.
The transformer function converts a cell string into the appropriate type for that property.

## Type Parameters

### T

`T` _extends_ `object`

The object type being defined

## Example

```typescript
const shape: CsvObjectShape<User> = {
    name: String,
    age: Number,
    active: Boolean,
}
```
