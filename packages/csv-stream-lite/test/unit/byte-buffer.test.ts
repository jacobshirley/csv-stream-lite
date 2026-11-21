import { describe, expect, it } from 'vitest'
import { ByteBuffer } from '../../src/byte-buffer'
import { Csv } from '../../src'

/** Drains a buffer, giving up after a bounded number of reads. */
function drain(b: ByteBuffer, maxReads = 20): number {
    let reads = 0
    while (!b.eof && reads++ < maxReads) {
        b.readStream()
    }
    return reads
}

describe('ByteBuffer re-iterable inputs (#46)', () => {
    it('does not restart a Uint8Array on every readStream()', () => {
        const b = new ByteBuffer(new Uint8Array(250000))
        // After the first read the buffer is over maxBufferSize, so each
        // further read only pulls one byte.
        drain(b, 300000)
        expect(b.eof).toBe(true)
        expect(b.length).toBe(250000)
    })

    it('does not restart an array of chunks on every readStream()', () => {
        const b = new ByteBuffer(Array(5).fill('x'.repeat(50000)))
        drain(b)
        expect(b.eof).toBe(true)
        expect(b.length).toBe(250000)
    })

    it('does not restart a re-iterable source in readStreamAsync()', async () => {
        const b = new ByteBuffer(Array(5).fill('x'.repeat(50000)))
        let reads = 0
        while (!b.eof && reads++ < 20) {
            await b.readStreamAsync()
        }
        expect(b.eof).toBe(true)
        expect(b.length).toBe(250000)
    })

    it('parses a large Uint8Array CSV synchronously', () => {
        let csv = 'id,name\n'
        for (let i = 0; i < 12000; i++) csv += `${i},n${i}\n`
        const bytes = new TextEncoder().encode(csv)
        expect(bytes.length).toBeGreaterThan(100 * 1024)

        const rows = Array.from(new Csv(bytes).streamObjects())
        expect(rows.length).toBe(12000)
        expect(rows[11999]).toEqual({ id: '11999', name: 'n11999' })
    })
})
