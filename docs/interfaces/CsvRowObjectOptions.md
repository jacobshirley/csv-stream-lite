[**csv-stream-lite**](../README.md)

---

[csv-stream-lite](../packages.md) / CsvRowObjectOptions

# Interface: CsvRowObjectOptions\<T, I\>

Options for reading a CSV row as an object.

## Type Param

The output type after optional transformation (defaults to T)

## Type Parameters

### T

`T` _extends_ `object`

The object type with headers as keys

### I

`I` = `unknown`

## Properties

### headers

> **headers**: `string`[]

Headers for the CSV row

---

### includeExtraCells?

> `optional` **includeExtraCells**: `boolean`

Whether to include extra cells beyond defined headers. Defaults to false

---

### rowIndex?

> `optional` **rowIndex**: `number`

Optional row index for error messages

---

### shape?

> `optional` **shape**: [`CsvObjectShape`](../type-aliases/CsvObjectShape.md)\<`T`\>

Shape definition mapping headers to type transformers, or an array of header names

---

### strictColumns?

> `optional` **strictColumns**: `boolean`

Whether to enforce exact column count matching headers. Defaults to false

---

### transform()?

> `optional` **transform**: (`row`) => `T`

Optional function to transform the parsed row object

#### Parameters

##### row

`I`

#### Returns

`T`
