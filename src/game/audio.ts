type ToneSpec = {
  duration: number;
  frequency: number;
  type: OscillatorType;
  volume: number;
  rampTo?: number;
};

export class SynthAudio {
  private context: AudioContext | null = null;
  private enabled = false;

  unlock(): void {
    const AudioCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioCtor) {
      return;
    }

    this.enabled = true;

    if (!this.context) {
      this.context = new AudioCtor();
    }

    if (this.context.state === "suspended") {
      void this.context.resume();
    }
  }

  fire(rateMs: number): void {
    const frequency = rateMs <= 200 ? 360 : rateMs >= 900 ? 180 : 240;
    const type: OscillatorType = rateMs <= 200 ? "square" : "triangle";

    this.playTone({ duration: 0.05, frequency, type, volume: 0.02, rampTo: frequency * 0.8 });
  }

  hit(): void {
    this.playTone({ duration: 0.07, frequency: 140, type: "sawtooth", volume: 0.025, rampTo: 80 });
  }

  pickup(): void {
    this.playTone({ duration: 0.12, frequency: 420, type: "triangle", volume: 0.03, rampTo: 620 });
  }

  boss(): void {
    this.playTone({ duration: 0.22, frequency: 110, type: "square", volume: 0.035, rampTo: 70 });
  }

  hurt(): void {
    this.playTone({ duration: 0.08, frequency: 95, type: "sawtooth", volume: 0.035, rampTo: 55 });
  }

  private playTone(spec: ToneSpec): void {
    if (!this.enabled) {
      return;
    }

    this.unlock();

    if (!this.context) {
      return;
    }

    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const now = this.context.currentTime;

    oscillator.type = spec.type;
    oscillator.frequency.setValueAtTime(spec.frequency, now);
    if (spec.rampTo) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, spec.rampTo), now + spec.duration);
    }

    gain.gain.setValueAtTime(spec.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + spec.duration);

    oscillator.connect(gain);
    gain.connect(this.context.destination);

    oscillator.start(now);
    oscillator.stop(now + spec.duration);
  }
}
