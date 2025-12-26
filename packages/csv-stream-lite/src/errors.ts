/**
 * Base error class for JSON Stream Lite errors.
 */
export class CsvStreamLiteError extends Error {}

/**
 * Error thrown when the buffer is empty and more input is needed.
 */
export class NoMoreTokensError extends CsvStreamLiteError {}

/**
 * Error thrown when the end of file has been reached and no more items are available.
 */
export class EofReachedError extends CsvStreamLiteError {}

/**
 * Error thrown when the buffer size limit is exceeded.
 */
export class BufferSizeExceededError extends CsvStreamLiteError {}

export class TooManyColumnsError extends CsvStreamLiteError {}
export class TooFewColumnsError extends CsvStreamLiteError {}
