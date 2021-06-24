export interface remoteDownloadOptions {
  concurrency: number;
  chunkSize: number;
  step?: (total_transferred: number, chunk: number, total: number) => void;
}

export const remoteDownloadSettings: remoteDownloadOptions = {
  concurrency: 64, // integer. Number of concurrent reads to use
  chunkSize: 32768, // integer. Size of each read in bytes
};
