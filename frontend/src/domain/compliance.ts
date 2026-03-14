import { api } from './api';

export const ComplianceClient = {
  generateEvidencePack: (params: {
    period: 'LAST_30' | 'LAST_90' | 'LAST_180' | 'CUSTOM';
    format: 'PDF' | 'JSON' | 'BOTH';
    scope: 'USER' | 'ORG';
    start_date?: string;
    end_date?: string;
  }): Promise<{
    packId: string;
    signature: string;
    generated_at: string;
    period: { start: string; end: string };
    jsonData?: any;
    pdfBase64?: string;
  }> => api.post('/compliance/evidence-pack', params).then(r => r.data),
};
