export class AudioStreamPlayer {
  private audioContext: AudioContext;
  private nextStartTime: number = 0;
  private queue: Float32Array[] = [];
  private isPlaying: boolean = false;
  private sampleRate: number = 24000;

  constructor(sampleRate: number = 24000) {
    this.sampleRate = sampleRate;
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: this.sampleRate,
    });
  }

  add16BitPCM(arrayBuffer: ArrayBuffer) {
    const float32 = this.convert16BitPCMToFloat32(arrayBuffer);
    this.queue.push(float32);
    this.scheduleNextBuffer();
  }

  private convert16BitPCMToFloat32(arrayBuffer: ArrayBuffer): Float32Array {
    const dataView = new DataView(arrayBuffer);
    const float32 = new Float32Array(arrayBuffer.byteLength / 2);
    for (let i = 0; i < float32.length; i++) {
      const int16 = dataView.getInt16(i * 2, true);
      float32[i] = int16 / 32768;
    }
    return float32;
  }

  private scheduleNextBuffer() {
    if (this.queue.length === 0) {
      return;
    }

    const currentTime = this.audioContext.currentTime;
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime + 0.05;
    }

    while (this.queue.length > 0) {
      const bufferData = this.queue.shift()!;
      const buffer = this.audioContext.createBuffer(1, bufferData.length, this.sampleRate);
      buffer.getChannelData(0).set(bufferData);

      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      source.start(this.nextStartTime);
      this.nextStartTime += buffer.duration;
    }
    
    this.isPlaying = true;
  }

  async close() {
    if (this.audioContext.state !== 'closed') {
      await this.audioContext.close();
    }
  }
}

export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private onDataAvailable: (data: string) => void;

  constructor(onDataAvailable: (data: string) => void) {
    this.onDataAvailable = onDataAvailable;
  }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext({ sampleRate: 16000 });
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = this.floatTo16BitPCM(inputData);
        const base64 = this.arrayBufferToBase64(pcm16);
        this.onDataAvailable(base64);
      };

      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Error starting audio recording:', error);
      throw error;
    }
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.processor && this.source) {
      this.source.disconnect();
      this.processor.disconnect();
      this.source = null;
      this.processor = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  private floatTo16BitPCM(input: Float32Array): ArrayBuffer {
    const output = new DataView(new ArrayBuffer(input.length * 2));
    for (let i = 0; i < input.length; i++) {
      let s = Math.max(-1, Math.min(1, input[i]));
      s = s < 0 ? s * 0x8000 : s * 0x7FFF;
      output.setInt16(i * 2, s, true);
    }
    return output.buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}
