[**csv-stream-lite**](../README.md)

---

[csv-stream-lite](../packages.md) / CsvEntityOptions

# Interface: CsvEntityOptions

Options for configuring CSV entity parsing.

## Properties

### escapeChar?

> `optional` **escapeChar**: `string`

Character used to escape special characters. Defaults to '"'

---

### newline?

> `optional` **newline**: `string`

String used to denote new lines. Defaults to auto-detected '\r', '\n', or '\r\n'

---

### quoteChar?

> `optional` **quoteChar**: `string`

Character used to quote fields. Defaults to escapeChar value

---

### separator?

> `optional` **separator**: `string`

Character used to separate fields. Defaults to ','

---

### trim?

> `optional` **trim**: `boolean`

Whether to trim whitespace from fields. Defaults to false. NOTE: this option is not supported when streaming, as trimming requires buffering the entire field.
