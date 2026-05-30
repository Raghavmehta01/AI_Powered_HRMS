/**
 * Web Speech API - Free, browser-built-in speech recognition
 * No API key needed, works offline
 * Limitations: Language support varies by browser, less accurate than Deepgram
 */

export interface WebSpeechConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export class WebSpeechRecognizer {
  private recognition: any;
  private isListening = false;
  private transcript = "";
  private interimTranscript = "";
  private shouldRestart = false;
  private onTranscriptCallback: ((transcript: string, isFinal: boolean) => void) | undefined;
  private onErrorCallback: ((error: string) => void) | undefined;

  // Public callbacks for direct usage
  public onFinal: ((text: string) => void) | undefined;
  public onInterim: ((text: string) => void) | undefined;
  public onError: ((error: string) => void) | undefined;

  constructor(config: WebSpeechConfig = {}) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      throw new Error("Web Speech API not supported in this browser");
    }

    this.recognition = new SpeechRecognition();
    this.recognition.language = config.language || "en-US";
    this.recognition.continuous = config.continuous ?? true;
    this.recognition.interimResults = config.interimResults ?? true;
    this.recognition.maxAlternatives = config.maxAlternatives ?? 1;
  }

  /**
   * Start listening for speech
   */
  public start(
    onTranscript?: (transcript: string, isFinal: boolean) => void,
    onError?: (error: string) => void
  ): void {
    this.onTranscriptCallback = onTranscript;
    this.onErrorCallback = onError;
    this.shouldRestart = true;
    this.transcript = "";
    this.interimTranscript = "";

    const startListening = () => {
      if (!this.shouldRestart) return;

      this.isListening = true;
      console.log("🎤 Starting Web Speech API...");

      // Handle results
      this.recognition.onresult = (event: any) => {
        console.log("📍 Recognition result received", {
          resultIndex: event.resultIndex,
          resultsLength: event.results.length,
          hasOnFinal: !!this.onFinal,
          hasOnInterim: !!this.onInterim
        });

        let interimText = "";
        let finalText = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const isFinalResult = event.results[i].isFinal;
          console.log(`  Result ${i}: "${transcript}" (final: ${isFinalResult})`);

          if (isFinalResult) {
            finalText += transcript + " ";
            this.transcript += transcript + " ";
          } else {
            interimText += transcript;
          }
        }

        const isFinal = event.results[event.results.length - 1].isFinal;

        // Call public callbacks - ALWAYS call, even if empty
        if (isFinal) {
          const trimmedFinal = finalText.trim();
          console.log(`✅ Final result (${trimmedFinal.length} chars): "${trimmedFinal}"`);
          if (this.onFinal) {
            this.onFinal(trimmedFinal);
          }
        } else {
          console.log(`⏳ Interim result: "${interimText}"`);
          if (this.onInterim) {
            this.onInterim(interimText);
          }
        }

        if (this.onTranscriptCallback) {
          const textToPass = isFinal ? finalText.trim() : interimText;
          console.log(`✅ Passing to callback: "${textToPass}" (final: ${isFinal})`);
          this.onTranscriptCallback(textToPass, isFinal);
        }
      };

      // Handle errors
      this.recognition.onerror = (event: any) => {
        console.error("❌ Web Speech API error:", event.error);

        // Ignore "aborted" errors - they're normal when restarting
        if (event.error === "aborted") {
          console.log("ℹ️ Speech recognition aborted (normal on restart)");
          return;
        }

        if (this.onError) {
          this.onError(event.error);
        }
        if (this.onErrorCallback) {
          this.onErrorCallback(`Speech recognition error: ${event.error}`);
        }
      };

      // Handle end - restart after a short delay if still enabled
      this.recognition.onend = () => {
        console.log("⏹️ Web Speech API ended");
        this.isListening = false;
        if (this.shouldRestart) {
          console.log("🔄 Restarting Web Speech API after delay...");
          setTimeout(startListening, 1500);
        }
      };

      this.recognition.start();
      console.log("✅ Web Speech API listening...");
    };

    startListening();
  }

  /**
   * Stop listening
   */
  public stop(): string {
    if (!this.isListening) return this.transcript;

    this.recognition.stop();
    this.isListening = false;

    const result = this.transcript + this.interimTranscript;
    this.transcript = "";
    this.interimTranscript = "";

    return result;
  }

  /**
   * Abort recognition
   */
  public abort(): void {
    this.shouldRestart = false;
    this.recognition.abort();
    this.isListening = false;
    this.transcript = "";
    this.interimTranscript = "";
  }

  /**
   * Check if browser supports Web Speech API
   */
  public static isSupported(): boolean {
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  /**
   * Get list of supported languages
   */
  public static getSupportedLanguages(): { code: string; name: string }[] {
    return [
      { code: "en-US", name: "English (US)" },
      { code: "en-GB", name: "English (UK)" },
      { code: "es-ES", name: "Spanish" },
      { code: "fr-FR", name: "French" },
      { code: "de-DE", name: "German" },
      { code: "it-IT", name: "Italian" },
      { code: "ja-JP", name: "Japanese" },
      { code: "zh-CN", name: "Chinese (Simplified)" },
      { code: "zh-TW", name: "Chinese (Traditional)" },
      { code: "ko-KR", name: "Korean" },
      { code: "pt-BR", name: "Portuguese (Brazil)" },
      { code: "ru-RU", name: "Russian" },
    ];
  }
}

/**
 * Simple wrapper for one-shot speech recognition
 */
export async function recognizeSpeech(
  language: string = "en-US"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      reject(new Error("Web Speech API not supported"));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.language = language;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      resolve(transcript.trim());
    };

    recognition.onerror = (event: any) => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.start();
  });
}
