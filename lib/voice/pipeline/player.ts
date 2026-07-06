export class AudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private currentObjectUrl: string | null = null;
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;

  play(
    blob: Blob,
    onEnded: () => void,
    onError: (error: string) => void,
    speed: number = 1.0,
    pitch: "low" | "normal" | "high" = "normal"
  ) {
    this.stop();

    this.currentObjectUrl = URL.createObjectURL(blob);
    const audio = new Audio(this.currentObjectUrl);
    this.audio = audio;

    // Apply speed and pitch adjustments client-side
    let rate = speed;
    let preserves = true;
    if (pitch === "low") {
      rate = speed * 0.88;
      preserves = false;
    } else if (pitch === "high") {
      rate = speed * 1.12;
      preserves = false;
    }

    audio.defaultPlaybackRate = rate;
    audio.playbackRate = rate;
    if ("preservesPitch" in audio) {
      (audio as any).preservesPitch = preserves;
    }

    // Wire up Web Audio API for waveform
    try {
      if (!this.audioContext || this.audioContext.state === "closed") {
        this.audioContext = new AudioContext();
      }
      if (this.audioContext.state === "suspended") {
        this.audioContext.resume();
      }
      if (this.sourceNode) {
        this.sourceNode.disconnect();
        this.sourceNode = null;
      }
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 128;
      this.analyserNode.smoothingTimeConstant = 0.8;
      this.sourceNode = this.audioContext.createMediaElementSource(audio);
      this.sourceNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioContext.destination);
    } catch (err) {
      console.warn("Web Audio API setup failed:", err);
    }

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

  // NEW — used by WaveformVisualizer
  getAnalyser(): AnalyserNode | null {
    return this.analyserNode;
  }

  pause() {
    this.audio?.pause();
  }

  resume() {
    if (this.audio && this.audio.paused) {
      if (this.audioContext?.state === "suspended") {
        this.audioContext.resume();
      }
      this.audio.play().catch((err) => {
        console.error("AudioPlayer resume error:", err);
      });
    }
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    this.analyserNode = null;
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