import { singleton } from 'tsyringe';

@singleton()
export class ComplianceService {
    async getGapAnalysis(framework: string) {
        return { message: `Compliance analysis for ${framework} is currently unavailable.` };
    }

    async getControlsByFramework(framework: string) {
        return [];
    }
}
