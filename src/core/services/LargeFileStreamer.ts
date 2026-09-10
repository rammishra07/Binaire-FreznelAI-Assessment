export interface StreamingProgress {
  bytesLoaded: number;
  totalBytes: number;
  percentage: number;
  status: 'connecting' | 'downloading' | 'verifying' | 'completed' | 'corrupted';
  hashMatches?: boolean;
}

/**
 * OOP LargeFileStreamer Service
 * Addresses Task 2.9 (2): "If the JSON file is large, how will you assure its safety
 * and prevent corruption during download of file?"
 */
export class LargeFileStreamer {
  /**
   * Helper to calculate SHA-256 hash of Uint8Array buffer.
   */
  public async computeSHA256(buffer: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Downloads a large file via ReadableStream chunks, tracking progress,
   * validating total Content-Length, and performing SHA-256 integrity check.
   */
  public streamAndValidateJSON<T>(
    url: string,
    expectedChecksumSHA256?: string,
    onProgress?: (progress: StreamingProgress) => void
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }
          if (!response.body) {
            throw new Error('ReadableStream not supported by server response');
          }

          const contentLength = response.headers.get('Content-Length');
          const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
          const reader = response.body.getReader();
          const chunks: Uint8Array[] = [];
          let loadedBytes = 0;

          if (onProgress) {
            onProgress({
              bytesLoaded: 0,
              totalBytes,
              percentage: 0,
              status: 'downloading',
            });
          }

          const readChunk = (): void => {
            reader
              .read()
              .then(({ done, value }) => {
                if (done) {
                  // Assembly phase
                  if (onProgress) {
                    onProgress({
                      bytesLoaded: loadedBytes,
                      totalBytes: totalBytes || loadedBytes,
                      percentage: 95,
                      status: 'verifying',
                    });
                  }

                  // Combine Uint8Array chunks into single Uint8Array
                  const combined = new Uint8Array(loadedBytes);
                  let offset = 0;
                  for (const chunk of chunks) {
                    combined.set(chunk, offset);
                    offset += chunk.length;
                  }

                  // 1. Verify Byte length integrity if Content-Length provided
                  if (totalBytes > 0 && loadedBytes !== totalBytes) {
                    if (onProgress) {
                      onProgress({
                        bytesLoaded: loadedBytes,
                        totalBytes,
                        percentage: 100,
                        status: 'corrupted',
                      });
                    }
                    throw new Error(
                      `File length mismatch! Expected ${totalBytes} bytes, received ${loadedBytes} bytes.`
                    );
                  }

                  // 2. Perform Checksum Validation if hash provided
                  this.computeSHA256(combined.buffer)
                    .then((computedHash) => {
                      let hashValid = true;
                      if (
                        expectedChecksumSHA256 &&
                        expectedChecksumSHA256.trim() !== ''
                      ) {
                        hashValid =
                          computedHash.toLowerCase() ===
                          expectedChecksumSHA256.toLowerCase();
                      }

                      if (!hashValid) {
                        if (onProgress) {
                          onProgress({
                            bytesLoaded: loadedBytes,
                            totalBytes: totalBytes || loadedBytes,
                            percentage: 100,
                            status: 'corrupted',
                            hashMatches: false,
                          });
                        }
                        throw new Error(
                          `Checksum verification failed! Expected: ${expectedChecksumSHA256}, Computed: ${computedHash}`
                        );
                      }

                      // 3. Safe JSON parsing
                      const textDecoder = new TextDecoder('utf-8');
                      const jsonText = textDecoder.decode(combined);
                      const parsedData = JSON.parse(jsonText);

                      if (onProgress) {
                        onProgress({
                          bytesLoaded: loadedBytes,
                          totalBytes: totalBytes || loadedBytes,
                          percentage: 100,
                          status: 'completed',
                          hashMatches: true,
                        });
                      }

                      resolve(parsedData as T);
                    })
                    .catch(reject);

                  return;
                }

                // Accumulate chunk
                chunks.push(value);
                loadedBytes += value.length;

                if (onProgress) {
                  const pct = totalBytes
                    ? Math.round((loadedBytes / totalBytes) * 90)
                    : 50;
                  onProgress({
                    bytesLoaded: loadedBytes,
                    totalBytes: totalBytes || loadedBytes,
                    percentage: pct,
                    status: 'downloading',
                  });
                }

                // Read next chunk recursively
                readChunk();
              })
              .catch(reject);
          };

          readChunk();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
