/**
 * Arquivo de startup para validação de ambiente durante auth
 * Este arquivo é importado apenas em runtime, não durante build
 */

import { validateEnvironmentVariables, logEnvironmentStatus } from '@/lib/env-validation';

export function initializeAuth() {
    // Executar validações apenas em runtime
    if (process.env.NEXT_PHASE !== 'phase-production-build') {
        validateEnvironmentVariables();
        logEnvironmentStatus();
    }
}
