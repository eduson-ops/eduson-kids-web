import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';

export interface RosterCard {
  firstName: string;
  lastName?: string | null;
  login: string;
  pin: string;
}

export interface RosterPdfMeta {
  className: string;
  schoolName?: string;
  teacherName?: string;
  brandName?: string;
}

/**
 * Generate an A4 PDF with one card per student that contains:
 *   - Student name (kid-friendly large font)
 *   - Login (monospace, large)
 *   - PIN (monospace, large)
 *   - QR code with deep-link `https://{baseDomain}/login?u=login&p=pin`
 *
 * Layout: 6 cards per A4 page (2 columns × 3 rows). Each card is ~99 × 90mm.
 */
@Injectable()
export class PdfRosterService {
  constructor(private readonly config: ConfigService) {}

  async generateRosterPdf(
    cards: RosterCard[],
    meta: RosterPdfMeta,
  ): Promise<Buffer> {
    const baseDomain =
      this.config.get<string>('app.publicBaseUrl') ?? 'https://kubik.school';

    // Pre-generate all QR code buffers BEFORE creating the PDF document.
    // PDFKit is synchronous; QRCode.toBuffer is async. Doing this in two
    // phases avoids the broken "two-pass" pattern where async work races
    // with the synchronous PDFKit stream.
    const qrBuffers = await Promise.all(
      cards.map((c) => {
        const qrUrl = `${baseDomain}/login?u=${encodeURIComponent(c.login)}&p=${encodeURIComponent(c.pin)}`;
        return QRCode.toBuffer(qrUrl, {
          errorCorrectionLevel: 'M',
          margin: 1,
          width: 160,
          color: { dark: '#0f1117', light: '#ffffff' },
        });
      }),
    );

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new (PDFDocument as any)({
        size: 'A4',
        margins: { top: 36, bottom: 36, left: 28, right: 28 },
        info: {
          Title: `Логины класса ${meta.className}`,
          Author: meta.brandName ?? 'KubiK',
          Subject: 'Раздаточный материал для учителя',
          CreationDate: new Date(),
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const PAGE_W = doc.page.width;
      const COLS = 2;
      const ROWS = 3;
      const PER_PAGE = COLS * ROWS;
      const MARGIN = 28;
      const GAP = 12;
      const cardW = (PAGE_W - 2 * MARGIN - (COLS - 1) * GAP) / COLS;
      const CARD_H = 240;
      const HEADER_H = 56;

      const drawHeader = () => {
        doc.fillColor('#0f1117').fontSize(13).font('Helvetica-Bold');
        doc.text(meta.brandName ?? 'KubiK', MARGIN, 16);
        doc.fontSize(10).font('Helvetica').fillColor('#666');
        const dateStr = new Date().toLocaleDateString('ru-RU');
        doc.text(
          `${meta.schoolName ? meta.schoolName + ' · ' : ''}${meta.className}` +
            (meta.teacherName ? ` · учитель: ${meta.teacherName}` : '') +
            `  ·  ${dateStr}`,
          MARGIN,
          32,
          { width: PAGE_W - 2 * MARGIN, align: 'left' },
        );
      };

      drawHeader();

      for (let i = 0; i < cards.length; i++) {
        const onPageIdx = i % PER_PAGE;

        if (i !== 0 && onPageIdx === 0) {
          doc.addPage();
          drawHeader();
        }

        const card = cards[i];
        const qrBuf = qrBuffers[i];
        const col = onPageIdx % COLS;
        const row = Math.floor(onPageIdx / COLS);
        const x = MARGIN + col * (cardW + GAP);
        const y = HEADER_H + row * (CARD_H + GAP);

        // Card border
        doc.roundedRect(x, y, cardW, CARD_H, 8).strokeColor('#d8deea').lineWidth(1).stroke();

        // Student name
        const fullName =
          [card.firstName, card.lastName].filter(Boolean).join(' ') || card.login;
        doc.fillColor('#0f1117').font('Helvetica-Bold').fontSize(16)
          .text(fullName, x + 14, y + 14, { width: cardW - 28 });

        // Login
        const labelY = y + 56;
        doc.fillColor('#666').font('Helvetica').fontSize(9).text('Логин', x + 14, labelY);
        doc.fillColor('#0f1117').font('Courier-Bold').fontSize(20)
          .text(card.login, x + 14, labelY + 11, { width: cardW - 28 });

        // PIN
        const pinY = labelY + 48;
        doc.fillColor('#666').font('Helvetica').fontSize(9).text('Пароль', x + 14, pinY);
        doc.fillColor('#c7a000').font('Courier-Bold').fontSize(22)
          .text(card.pin, x + 14, pinY + 11);

        // QR code (bottom-right)
        const qrSize = 80;
        doc.image(qrBuf, x + cardW - qrSize - 14, y + CARD_H - qrSize - 14, {
          width: qrSize,
          height: qrSize,
        });

        // Hint
        doc.fillColor('#999').font('Helvetica').fontSize(7).text(
          'Сохраните этот листок. Без логина и пароля войти в KubiK не получится. QR работает с телефона.',
          x + 14,
          y + CARD_H - 28,
          { width: cardW - qrSize - 28 },
        );
      }

      doc.end();
    });
  }
}
