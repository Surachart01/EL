/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Web Audio API Sound Effects Synthesizer
 * Generates playful and friendly audio feedback for kids without loading heavy audio assets.
 */

class AudioSynth {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    // Resume context if suspended (browser security autoplays)
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Plays a magical success chord arpeggio (C4 -> E4 -> G4 -> C5)
   */
  public playSuccess() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    const durations = [0.15, 0.15, 0.15, 0.6];
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      // Kid friendly instrument tone: sine/triangle wave blend
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      
      // Envelope
      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + durations[idx]);
      
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + durations[idx]);
    });
  }

  /**
   * Plays a gentle "try again" bouncing tone (slides down to sound soft and encouraging)
   */
  public playTryAgain() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // First bounce
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(330, now); // E4
    osc1.frequency.exponentialRampToValueAtTime(220, now + 0.15); // A3
    
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.2);

    // Second bounce (slightly lower, encouraging)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(261.63, now + 0.18); // C4
    osc2.frequency.exponentialRampToValueAtTime(174.61, now + 0.38); // F3
    
    gain2.gain.setValueAtTime(0.25, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    
    osc2.start(now + 0.18);
    osc2.stop(now + 0.45);
  }

  /**
   * Play a cute click/bubble pop sound for UI micro-interactions
   */
  public playPop() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08); // slides up rapidly for a pop
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.08);
  }
}

export const audioSynth = new AudioSynth();
