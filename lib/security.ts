import crypto from 'crypto';

/**
 * Funções de criptografia para armazenar dados sensíveis (API keys, etc)
 * Usa AES-256-GCM que é seguro para produção
 */

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 16;

/**
 * Criptografa uma string sensível (API key, etc)
 * Retorna: <iv>:<authTag>:<encrypted> tudo em base64
 */
export function encryptSensitiveData(plaintext: string): string {
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);

        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        const result = `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
        return Buffer.from(result).toString('base64');
    } catch (error) {
        throw new Error('Erro ao criptografar dados');
    }
}

/**
 * Descriptografa uma string previamente criptografada
 */
export function decryptSensitiveData(encrypted: string): string {
    try {
        const decoded = Buffer.from(encrypted, 'base64').toString('utf-8');
        const [ivHex, authTagHex, encryptedData] = decoded.split(':');

        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        throw new Error('Erro ao descriptografar dados');
    }
}

/**
 * Gera um hash seguro de uma string (para senhas)
 */
export function hashPassword(password: string): string {
    const salt = crypto.randomBytes(16);
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
    return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

/**
 * Verifica se uma senha corresponde ao hash
 */
export function verifyPassword(password: string, hash: string): boolean {
    const [salt, key] = hash.split(':');
    const saltBuffer = Buffer.from(salt, 'hex');
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.pbkdf2Sync(password, saltBuffer, 100000, 64, 'sha512');

    return crypto.timingSafeEqual(keyBuffer, derivedKey);
}
