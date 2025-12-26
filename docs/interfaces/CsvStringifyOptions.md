[**csv-stream-lite**](../README.md)

---

[csv-stream-lite](../packages.md) / CsvStringifyOptions

# Interface: CsvStringifyOptions\<T, O\>

## Type Parameters

### T

`T` _extends_ `object` = `object`

### O

`O` _extends_ `object` = `T`

## Properties

### alwaysWriteHeaders?

> `optional` **alwaysWriteHeaders**: `boolean`

Whether to always write headers, even if there are no records (default: false)

---

### delimiter?

> `optional` **delimiter**: `string`

Character to separate fields (default: ',')

---

### escapeChar?

> `optional` **escapeChar**: `string`

Character to escape special characters (default: '"')

---

### headers?

> `optional` **headers**: `string`[] \| [`CsvObjectShape`](../type-aliases/CsvObjectShape.md)\<`T`\>

Optional array of headers to use as the first row. Optionally, pass in a CsvObjectShape to be used as headers

---

### newline?

> `optional` **newline**: `string`

Newline character (default: '\n')

---

### quoteChar?

> `optional` **quoteChar**: `string`

Character to quote fields (default: '"')

---

### transform()?

> `optional` **transform**: (`row`) => `O`

Optional transform function to modify each record before stringifying

#### Parameters

##### row

`T`

#### Returns

`O`

---

### writeBom?

> `optional` **writeBom**: `boolean`

Whether to write a UTF-8 BOM at the start of the output (default: false)
