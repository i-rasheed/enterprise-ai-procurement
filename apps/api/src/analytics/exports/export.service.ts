import { Injectable, StreamableFile } from '@nestjs/common';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

import { ReportResponseDto } from '../dto/analytics-response.dto';

@Injectable()
export class ExportService {
  toCsv(report: ReportResponseDto): StreamableFile {
    const rows: string[][] = [
      ['Report', report.title],
      ['Generated At', report.generatedAt],
      [''],
      ['Section', 'Key', 'Value'],
    ];

    for (const [key, value] of Object.entries(report.data)) {
      rows.push(['Summary', key, this.stringify(value)]);
    }

    for (const [key, value] of Object.entries(report.kpis)) {
      rows.push(['KPI', key, this.stringify(value)]);
    }

    for (const chart of report.charts) {
      const chartObj = chart as {
        title?: string;
        labels?: string[];
        datasets?: { label: string; data: number[] }[];
      };
      rows.push(['Chart', chartObj.title ?? 'Chart', '']);
      if (chartObj.labels && chartObj.datasets?.[0]) {
        chartObj.labels.forEach((label, idx) => {
          rows.push([
            'Chart Data',
            label,
            String(chartObj.datasets![0].data[idx] ?? ''),
          ]);
        });
      }
    }

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
      )
      .join('\n');

    const buffer = Buffer.from(csv, 'utf-8');
    return new StreamableFile(buffer, {
      type: 'text/csv',
      disposition: `attachment; filename="${report.id}-report.csv"`,
    });
  }

  async toExcel(report: ReportResponseDto): Promise<StreamableFile> {
    const workbook = new ExcelJS.Workbook();
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.addRow(['Report', report.title]);
    summarySheet.addRow(['Generated At', report.generatedAt]);
    summarySheet.addRow([]);
    summarySheet.addRow(['Key', 'Value']);
    for (const [key, value] of Object.entries(report.data)) {
      summarySheet.addRow([key, this.stringify(value)]);
    }

    const kpiSheet = workbook.addWorksheet('KPIs');
    kpiSheet.addRow(['KPI', 'Value']);
    for (const [key, value] of Object.entries(report.kpis)) {
      kpiSheet.addRow([key, this.stringify(value)]);
    }

    for (const chart of report.charts) {
      const chartObj = chart as {
        title?: string;
        labels?: string[];
        datasets?: { label: string; data: number[] }[];
      };
      const sheet = workbook.addWorksheet(
        (chartObj.title ?? 'Chart').slice(0, 31),
      );
      sheet.addRow(['Label', chartObj.datasets?.[0]?.label ?? 'Value']);
      chartObj.labels?.forEach((label, idx) => {
        sheet.addRow([label, chartObj.datasets?.[0]?.data[idx] ?? 0]);
      });
    }

    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: `attachment; filename="${report.id}-report.xlsx"`,
    });
  }

  async toPdf(report: ReportResponseDto): Promise<StreamableFile> {
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text(report.title, { underline: true });
      doc.moveDown();
      doc.fontSize(10).text(`Generated: ${report.generatedAt}`);
      doc.moveDown();

      doc.fontSize(14).text('Summary');
      doc.moveDown(0.5);
      doc.fontSize(10);
      for (const [key, value] of Object.entries(report.data)) {
        doc.text(`${key}: ${this.stringify(value)}`);
      }

      doc.moveDown();
      doc.fontSize(14).text('KPIs');
      doc.moveDown(0.5);
      doc.fontSize(10);
      for (const [key, value] of Object.entries(report.kpis)) {
        doc.text(`${key}: ${this.stringify(value)}`);
      }

      doc.moveDown();
      doc.fontSize(14).text('Charts');
      doc.moveDown(0.5);
      doc.fontSize(10);
      for (const chart of report.charts) {
        const chartObj = chart as {
          title?: string;
          labels?: string[];
          datasets?: { data: number[] }[];
        };
        doc.text(chartObj.title ?? 'Chart');
        chartObj.labels?.forEach((label, idx) => {
          doc.text(`  ${label}: ${chartObj.datasets?.[0]?.data[idx] ?? 0}`);
        });
        doc.moveDown(0.5);
      }

      doc.end();
    });

    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="${report.id}-report.pdf"`,
    });
  }

  private stringify(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean')
      return String(value);
    return JSON.stringify(value);
  }
}
