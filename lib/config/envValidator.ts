export interface EnvConfig {
  azureEndpoint?: string;
  azureApiKey?: string;
  azureModel?: string;
  sttProvider: string;
  deepgramApiKey?: string;
  proctoringEnabled: boolean;
}

class EnvValidator {
  private errors: string[] = [];
  private warnings: string[] = [];

  validate(): EnvConfig {
    const sttProvider = process.env.STT_PROVIDER || 'web-speech';
    const proctoringEnabled = process.env.NEXT_PUBLIC_ENABLE_PROCTORING === 'true';

    this.validateSTTProvider(sttProvider);
    this.validateAzureProvider();

    if (this.errors.length > 0) {
      const errorMsg = `Configuration errors:\n${this.errors.join('\n')}`;
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    if (this.warnings.length > 0) {
      console.warn('⚠️ Configuration warnings:\n' + this.warnings.join('\n'));
    }

    return {
      sttProvider,
      proctoringEnabled,
      azureEndpoint: process.env.AZURE_ENDPOINT,
      azureApiKey: process.env.AZURE_API_KEY,
      azureModel: process.env.AZURE_MODEL,
      deepgramApiKey: process.env.DEEPGRAM_API_KEY || process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY,
    };
  }

  private validateAzureProvider(): void {
    if (!process.env.AZURE_ENDPOINT) {
      this.errors.push("AZURE_ENDPOINT is not set");
    }
    if (!process.env.AZURE_API_KEY) {
      this.errors.push("AZURE_API_KEY is not set");
    }
    if (!process.env.AZURE_MODEL) {
      this.errors.push("AZURE_MODEL is not set (must be your Azure deployment name)");
    }
  }

  private validateSTTProvider(provider: string): void {
    const validProviders = ['web-speech', 'deepgram'];
    if (!validProviders.includes(provider)) {
      this.warnings.push(
        `Unknown STT_PROVIDER: "${provider}". Will fall back to web-speech. Valid options: ${validProviders.join(', ')}`
      );
    }

    if (provider === 'deepgram' && !process.env.DEEPGRAM_API_KEY && !process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY) {
      this.warnings.push('Deepgram STT provider selected but DEEPGRAM_API_KEY is not set. Will fall back to Web Speech API');
    }
  }
}

export const envConfig = new EnvValidator().validate();
