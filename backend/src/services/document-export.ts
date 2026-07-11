import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import PDFDocument from 'pdfkit';

export interface ResumeFields {
  name: string;
  email: string;
  phone: string;
  summary: string;
  skills: string;
  experience: string;
  education: string;
}

function textParagraphs(text: string): Paragraph[] {
  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => new Paragraph({ children: [new TextRun(line)] }));
}

export async function buildResumeDocx(fields: ResumeFields): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(fields.name || 'Your Name')] }),
  ];

  const contact = [fields.email, fields.phone].filter(Boolean).join('  |  ');
  if (contact) {
    children.push(new Paragraph({ children: [new TextRun({ text: contact, color: '5B5F6B' })] }));
  }

  const section = (title: string, body: string) => {
    if (!body) return;
    children.push(
      new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 240 }, children: [new TextRun(title)] }),
    );
    children.push(...textParagraphs(body));
  };

  section('Summary', fields.summary);
  section('Skills', fields.skills);
  section('Experience', fields.experience);
  section('Education', fields.education);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children,
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

export function buildResumePdf(fields: ResumeFields): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(22).fillColor('#132C57').text(fields.name || 'Your Name');

    const contact = [fields.email, fields.phone].filter(Boolean).join('  |  ');
    if (contact) {
      doc.moveDown(0.2).fontSize(10).fillColor('#5B5F6B').text(contact);
    }

    const section = (title: string, body: string) => {
      if (!body) return;
      doc.moveDown(1).fontSize(14).fillColor('#132C57').text(title);
      doc.moveDown(0.3).fontSize(11).fillColor('#1A1A1E').text(body, { lineGap: 4 });
    };

    section('Summary', fields.summary);
    section('Skills', fields.skills);
    section('Experience', fields.experience);
    section('Education', fields.education);

    doc.end();
  });
}
