import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

function isDocx(mimetype: string, filename: string): boolean {
  return (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    filename.toLowerCase().endsWith('.docx')
  );
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text.replace(/--\s*\d+\s*of\s*\d+\s*--/g, '').replace(/\n{3,}/g, '\n\n').trim();
  } finally {
    await parser.destroy();
  }
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

export async function extractResumeText(file: { buffer: Buffer; mimetype: string; originalname: string }): Promise<string> {
  return isDocx(file.mimetype, file.originalname) ? extractDocxText(file.buffer) : extractPdfText(file.buffer);
}
