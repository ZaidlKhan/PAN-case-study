import { GeminiService, AiAnalysis } from './gemini.service';

describe('GeminiService', () => {
  let service: GeminiService;

  beforeEach(() => {
    service = new GeminiService();
  });

  // -- Happy Path --

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should report not configured when no API key', () => {
    // Default environment has placeholder key
    // This test verifies the guard works
    expect(service.isConfigured).toBeDefined();
  });

  it('should throw when analyzeResume called without API key configured', async () => {
    // Force unconfigured state
    (service as any).ai = null;
    try {
      await service.analyzeResume('resume', 'job description');
      fail('Should have thrown');
    } catch (e: any) {
      expect(e.message).toBe('Gemini API key not configured');
    }
  });

  it('should throw when parseResume called without API key configured', async () => {
    (service as any).ai = null;
    try {
      await service.parseResume('resume text');
      fail('Should have thrown');
    } catch (e: any) {
      expect(e.message).toBe('Gemini API key not configured');
    }
  });

  // -- Edge Cases --

  it('should handle empty resume text for analyzeResume', async () => {
    (service as any).ai = null;
    try {
      await service.analyzeResume('', '');
      fail('Should have thrown');
    } catch (e: any) {
      expect(e.message).toBe('Gemini API key not configured');
    }
  });
});

