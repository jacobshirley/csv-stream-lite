const textEncoder = new TextEncoder()
// ignoreBOM: true keeps a leading U+FEFF in the decoded string. By default
// TextDecoder strips it on every decode() call, which would silently remove
// it from the start of any cell. A BOM is removed explicitly, and only at the
// start of the input, by the parser (see `ignoreUtf8Bom`).
const textDecoder = new TextDecoder('utf-8', { ignoreBOM: true })

/**
 * Converts a string to a Uint8Array of UTF-8 encoded bytes.
 *
 * @param str - The string to convert
 * @returns A Uint8Array containing the UTF-8 encoded bytes
 */
export function stringToBytes(str: string): Uint8Array {
    return textEncoder.encode(str)
}

/**
 * Converts a Uint8Array of UTF-8 encoded bytes to a string.
 *
 * @param bytes - The Uint8Array to decode
 * @returns The decoded string
 */
export function bytesToString(bytes: Uint8Array): string {
    return textDecoder.decode(bytes)
}
