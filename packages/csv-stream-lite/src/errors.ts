/**
 * Base error class for CSV Stream Lite errors.
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

/**
 * Error thrown when a CSV row has more columns than expected when `strictColumns` is enabled.
 */
export class TooManyColumnsError extends CsvStreamLiteError {}

/**
 * Error thrown when a CSV row has fewer columns than expected when `strictColumns` is enabled.
 */
export class TooFewColumnsError extends CsvStreamLiteError {}
