/**
 * Extrator de texto de PDF
 * Compatível com serverless (Vercel)
 * Usa require() dinâmico para evitar problemas de bundle
 */

import { Buffer } from 'buffer';

export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
    try {
        // Import dinâmico para evitar problemas com serverless
        const pdfParse = require('pdf-parse');
        
        const nodeBuffer = Buffer.from(buffer);
        const pdfData = await pdfParse(nodeBuffer);
        
        const text = pdfData.text || '';

        // Validação: PDF precisa ter texto
        if (!text || text.trim().length === 0) {
            throw new Error('PDF_NO_TEXT');
        }

        // Limpar texto: remover linhas vazias, normalizar espaços
        const cleanedText = text
            .split('\n')
            .map((line: string) => line.trim())
            .filter((line: string) => line.length > 0)
            .join('\n')
            .replace(/\n{3,}/g, '\n\n'); // Remover múltiplas quebras de linha

        return cleanedText;
    } catch (error: any) {
        // Tratar erros específicos
        const message = error.message || String(error);

        if (message.includes('PDF_NO_TEXT')) {
            throw new Error('O PDF não contém texto extraível. Certifique-se de que o PDF não é apenas imagens.');
        }

        if (message.includes('file header') || message.includes('header') || message.includes('EOF')) {
            throw new Error('O arquivo não é um PDF válido ou está corrompido.');
        }

        if (message.includes('permission') || message.includes('encrypted')) {
            throw new Error('O PDF está protegido ou criptografado. Use um PDF sem proteção.');
        }

        // Erro genérico
        throw new Error('Erro ao processar PDF. Tente novamente com outro arquivo.');
    }
}
