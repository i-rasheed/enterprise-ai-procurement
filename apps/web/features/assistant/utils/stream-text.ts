type StreamTextOptions = {
  chunkSize?: number;
  delayMs?: number;
  signal?: AbortSignal;
};

export async function streamText(
  text: string,
  onChunk: (partial: string) => void,
  options: StreamTextOptions = {},
): Promise<void> {
  const { chunkSize = 3, delayMs = 16, signal } = options;
  let index = 0;

  while (index < text.length) {
    if (signal?.aborted) {
      return;
    }

    index = Math.min(index + chunkSize, text.length);
    onChunk(text.slice(0, index));

    if (index < text.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
