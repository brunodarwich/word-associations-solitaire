let audio: AudioContext | undefined;
export function chime(won: boolean) {
  try {
    audio ??= new AudioContext();
    void audio.resume();
    const notes = won ? [523.25, 659.25, 783.99] : [440];
    notes.forEach((frequency, i) => {
      const oscillator = audio!.createOscillator(),
        gain = audio!.createGain(),
        t = audio!.currentTime + i * 0.12;
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.045, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      oscillator.connect(gain);
      gain.connect(audio!.destination);
      oscillator.start(t);
      oscillator.stop(t + 0.25);
    });
  } catch {
    /* Sound is optional; gameplay remains available when audio is unsupported. */
  }
}
