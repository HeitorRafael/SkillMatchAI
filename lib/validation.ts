/**
 * Funções de validação e sanitização de entrada
 * Protege contra SQL injection, XSS, etc
 */

export function sanitizeString(input: any): string {
    if (typeof input !== 'string') return '';
    
    return input
        // Remove caracteres nulos
        .replace(/\0/g, '')
        // Remove scripts e tags HTML perigosas
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/on\w+\s*=/gi, '')
        // Trim
        .trim();
}

export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Senha deve ter pelo menos 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Senha deve conter pelo menos uma letra minúscula');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Senha deve conter pelo menos um número');
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
        errors.push('Senha deve conter pelo menos um caractere especial');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

export function validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

export function validateUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

export function sanitizeJson(input: any): any {
    if (typeof input === 'string') {
        return sanitizeString(input);
    }

    if (Array.isArray(input)) {
        return input.map(sanitizeJson);
    }

    if (typeof input === 'object' && input !== null) {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(input)) {
            if (typeof key === 'string' && key.length <= 100) {
                sanitized[key] = sanitizeJson(value);
            }
        }
        return sanitized;
    }

    return input;
}

/**
 * Valida que um objeto contém apenas campos esperados
 */
export function validateFields(input: any, expectedFields: string[]): boolean {
    if (typeof input !== 'object' || input === null) {
        return false;
    }

    const keys = Object.keys(input);
    return keys.every(key => expectedFields.includes(key));
}
