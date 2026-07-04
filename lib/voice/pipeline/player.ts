/**
 * Wrapper class managing the HTMLAudioElement lifecycle, playback states,
 * and memory cleanup (revoking object URLs).
 */
export class AudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private currentObjectUrl: string | null = null;

  play(
    blob: Blob,
    onEnded: () => void,
    onError: (error: string) => void
  ) {
    this.stop();

    this.currentObjectUrl = URL.createObjectURL(blob);
    const audio = new Audio(this.currentObjectUrl);
    this.audio = audio;

    const handleEnded = () => {
      this.cleanup();
      onEnded();
    };

    const handleError = () => {
      this.cleanup();
      onError("Playback error");
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    audio.play().catch((err) => {
      this.cleanup();
      onError(err?.message || "Failed to start playback");
    });
  }

  pause() {
    this.audio?.pause();
  }

  resume() {
    if (this.audio && this.audio.paused) {
      this.audio.play().catch((err) => {
        console.error("AudioPlayer resume error:", err);
      });
    }
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
    }
    this.cleanup();
  }

  isPlaying(): boolean {
    return this.audio ? !this.audio.paused : false;
  }

  private cleanup() {
    if (this.audio) {
      this.audio = null;
    }
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }
  }
}
