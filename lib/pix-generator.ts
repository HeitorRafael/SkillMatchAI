/**
 * PIX Generator - Gera QR Code e código copia e cola para pagamentos PIX
 *
 * Baseado no padrão BR Code (Banco Central do Brasil)
 * Referência: https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf
 */

import { createHash, randomBytes } from 'crypto';

export interface PixPaymentData {
    pixKey: string;
    merchantName: string;
    merchantCity: string;
    amount: number;
    txId: string; // Transaction ID (25-35 chars)
    description?: string;
}

export interface PixQRCodeResult {
    payload: string; // Código copia e cola
    qrCodeBase64?: string; // QR Code em base64 (se biblioteca instalada)
    txId: string;
}

/**
 * Gera código PIX copia e cola (BR Code / EMV)
 */
export function generatePixPayload(data: PixPaymentData): string {
    const {
        pixKey,
        merchantName,
        merchantCity,
        amount,
        txId,
        description = 'SkillMatchAI - Pagamento'
    } = data;

    // Validações
    if (!pixKey || pixKey.length === 0) {
        throw new Error('PIX key é obrigatória');
    }
    if (amount <= 0) {
        throw new Error('Valor deve ser maior que zero');
    }
    if (!txId || txId.length < 25 || txId.length > 35) {
        throw new Error('Transaction ID deve ter entre 25 e 35 caracteres');
    }

    // Construir payload EMV (padrão BR Code)
    let payload = '';

    // [00] Payload Format Indicator
    payload += buildTLV('00', '01');

    // [26] Merchant Account Information (PIX)
    const merchantAccountInfo = buildMerchantAccountInfo(pixKey, description);
    payload += buildTLV('26', merchantAccountInfo);

    // [52] Merchant Category Code (0000 = não categorizado)
    payload += buildTLV('52', '0000');

    // [53] Transaction Currency (986 = BRL)
    payload += buildTLV('53', '986');

    // [54] Transaction Amount
    payload += buildTLV('54', amount.toFixed(2));

    // [58] Country Code
    payload += buildTLV('58', 'BR');

    // [59] Merchant Name
    payload += buildTLV('59', merchantName.substring(0, 25));

    // [60] Merchant City
    payload += buildTLV('60', merchantCity.substring(0, 15));

    // [62] Additional Data Field Template
    const additionalData = buildAdditionalData(txId);
    payload += buildTLV('62', additionalData);

    // [63] CRC16 (calculado no final)
    payload += '6304';

    // Calcular CRC16
    const crc = calculateCRC16(payload);
    payload += crc;

    return payload;
}

/**
 * Constrói TLV (Tag-Length-Value)
 */
function buildTLV(tag: string, value: string): string {
    const length = value.length.toString().padStart(2, '0');
    return `${tag}${length}${value}`;
}

/**
 * Constrói Merchant Account Information (tag 26)
 */
function buildMerchantAccountInfo(pixKey: string, description: string): string {
    let info = '';

    // [00] GUI (Global Unique Identifier) do arranjo de pagamento
    info += buildTLV('00', 'br.gov.bcb.pix');

    // [01] Chave PIX
    info += buildTLV('01', pixKey);

    // [02] Descrição (opcional)
    if (description) {
        info += buildTLV('02', description.substring(0, 72));
    }

    return info;
}

/**
 * Constrói Additional Data (tag 62)
 */
function buildAdditionalData(txId: string): string {
    let data = '';

    // [05] Reference Label (Transaction ID)
    data += buildTLV('05', txId);

    return data;
}

/**
 * Calcula CRC16-CCITT (padrão PIX)
 */
function calculateCRC16(payload: string): string {
    let crc = 0xFFFF;

    for (let i = 0; i < payload.length; i++) {
        crc ^= payload.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc = crc << 1;
            }
        }
    }

    crc &= 0xFFFF;
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Gera Transaction ID único (25-35 caracteres alfanuméricos)
 */
export function generateTxId(): string {
    const timestamp = Date.now().toString(36); // Base36 timestamp
    const random = randomBytes(8).toString('hex'); // 16 chars hex
    const txId = `SKILLMATCH${timestamp}${random}`.substring(0, 35);
    return txId.toUpperCase();
}

/**
 * Gera QR Code PIX completo
 *
 * Nota: Esta função retorna o código copia e cola. Para gerar a imagem do QR Code,
 * será necessário usar uma biblioteca como 'qrcode' no frontend ou backend.
 */
export async function generatePixQRCode(data: PixPaymentData): Promise<PixQRCodeResult> {
    const payload = generatePixPayload(data);

    return {
        payload,
        txId: data.txId,
        // qrCodeBase64 será gerado no frontend com biblioteca 'qrcode'
    };
}

/**
 * Valida chave PIX (formato básico)
 */
export function validatePixKey(pixKey: string): boolean {
    if (!pixKey) return false;

    // CPF: 11 dígitos
    if (/^\d{11}$/.test(pixKey)) return true;

    // CNPJ: 14 dígitos
    if (/^\d{14}$/.test(pixKey)) return true;

    // Email
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pixKey)) return true;

    // Telefone: +5511999999999
    if (/^\+55\d{10,11}$/.test(pixKey)) return true;

    // Chave aleatória: UUID v4
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(pixKey)) {
        return true;
    }

    return false;
}

/**
 * Gera chave PIX aleatória para testes (UUID v4)
 */
export function generateTestPixKey(): string {
    return 'teste-' + randomBytes(16).toString('hex');
}

/**
 * Dados de configuração PIX (para ser substituído pelos dados reais)
 */
export const PIX_CONFIG = {
    // ATENÇÃO: Substituir por chave PIX real em produção
    pixKey: process.env.PIX_KEY || generateTestPixKey(),
    merchantName: process.env.PIX_MERCHANT_NAME || 'SkillMatchAI',
    merchantCity: process.env.PIX_MERCHANT_CITY || 'Sao Paulo',
};

/**
 * Helper: Gera PIX para pagamento de assinatura
 */
export async function generateSubscriptionPixPayment(
    tier: 'BASIC' | 'PREMIUM',
    userId: string
): Promise<PixQRCodeResult> {
    const amounts = {
        BASIC: 10.00,
        PREMIUM: 20.00,
    };

    const txId = generateTxId();

    return generatePixQRCode({
        pixKey: PIX_CONFIG.pixKey,
        merchantName: PIX_CONFIG.merchantName,
        merchantCity: PIX_CONFIG.merchantCity,
        amount: amounts[tier],
        txId,
        description: `SkillMatchAI - Plano ${tier}`,
    });
}

/**
 * Helper: Gera PIX para doação (valor variável)
 */
export async function generateDonationPixPayment(
    amount: number,
    userEmail?: string
): Promise<PixQRCodeResult> {
    const txId = generateTxId();

    return generatePixQRCode({
        pixKey: PIX_CONFIG.pixKey,
        merchantName: PIX_CONFIG.merchantName,
        merchantCity: PIX_CONFIG.merchantCity,
        amount,
        txId,
        description: userEmail
            ? `Doacao - ${userEmail}`
            : 'Doacao - SkillMatchAI',
    });
}
