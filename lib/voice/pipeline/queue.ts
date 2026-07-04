export interface PlaybackItem {
  id: string; // Unique sentence identifier (e.g. messageId + "_" + index)
  sentence: string;
  blob: Blob | null;
  status: "pending" | "loading" | "ready" | "playing" | "ended" | "failed";
  retryCount: number;
  abortController: AbortController | null;
  errorMessage?: string;
}

export class PlaybackQueue {
  private items: PlaybackItem[] = [];
  private currentIndex = -1;

  enqueue(sentence: string, id: string) {
    this.items.push({
      id,
      sentence,
      blob: null,
      status: "pending",
      retryCount: 0,
      abortController: null,
    });
  }

  getCurrent(): PlaybackItem | undefined {
    if (this.currentIndex >= 0 && this.currentIndex < this.items.length) {
      return this.items[this.currentIndex];
    }
    return undefined;
  }

  getItemAt(index: number): PlaybackItem | undefined {
    if (index >= 0 && index < this.items.length) {
      return this.items[index];
    }
    return undefined;
  }

  next(): PlaybackItem | undefined {
    if (this.currentIndex < this.items.length - 1) {
      this.currentIndex++;
      const item = this.items[this.currentIndex];
      if (item && item.status === "pending") {
        item.status = "playing";
      }
      return item;
    }
    return undefined;
  }

  getItems(): PlaybackItem[] {
    return this.items;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  length(): number {
    return this.items.length;
  }

  clear() {
    this.cancelAllRequests();
    this.items = [];
    this.currentIndex = -1;
  }

  cancelAllRequests() {
    for (const item of this.items) {
      if (item.abortController) {
        item.abortController.abort();
        item.abortController = null;
      }
    }
  }
}
