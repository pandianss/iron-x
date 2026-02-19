import { singleton } from 'tsyringe';

@singleton()
export class ApiKeyService {
    async validateKey(key: string): Promise<boolean> {
        return false;
    }
}
