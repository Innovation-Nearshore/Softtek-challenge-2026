'use strict';

/**
 * Reporte Service (SRP: PDF generation logic only).
 * Depends on MetricasRepository through composition (DIP).
 * Does NOT handle HTTP request/response concerns.
 */

const PDFDocument = require('pdfkit');
const MetricasRepository = require('../repositories/metricasRepository');

const ReporteService = {
  /**
   * Generates a PDF report of metrics for the given filters and pipes it
   * directly into the provided Express response stream.
   * @param {{ periodo_id?, anio?, trimestre?, categoria_id? }} filters
   * @param {import('express').Response} res - Express response (writable stream)
   * @returns {Promise<void>}
   */
  async generarPDF(filters, res) {
    const metricas = await MetricasRepository.findAll(filters);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte_metricas.pdf"');
    doc.pipe(res);

    // ── Title ──────────────────────────────────────────────────────────────
    doc
      .fontSize(20)
      .fillColor('#1e40af')
      .text('Reporte de Métricas Mensuales', { align: 'center' })
      .moveDown(0.3);

    // Subtitle — applied filters
    const subtitleParts = [];
    if (filters.anio)        subtitleParts.push(`Año: ${filters.anio}`);
    if (filters.trimestre)   subtitleParts.push(`Trimestre: ${filters.trimestre}`);
    if (filters.categoria_id) subtitleParts.push(`Categoría ID: ${filters.categoria_id}`);
    if (subtitleParts.length) {
      doc.fontSize(11).fillColor('#374151').text(subtitleParts.join('  |  '), { align: 'center' });
    }

    doc
      .fontSize(9)
      .fillColor('#6b7280')
      .text(`Generado: ${new Date().toLocaleString('es-CO')}`, { align: 'center' })
      .moveDown(1);

    if (metricas.length === 0) {
      doc
        .fontSize(12)
        .fillColor('#ef4444')
        .text('No se encontraron métricas con los filtros aplicados.', { align: 'center' });
      doc.end();
      return;
    }

    // ── Group by category ──────────────────────────────────────────────────
    const grouped = {};
    metricas.forEach((m) => {
      const key = m.categoria_nombre;
      if (!grouped[key]) grouped[key] = { color: m.categoria_color, rows: [] };
      grouped[key].rows.push(m);
    });

    const COL = { metrica: 150, periodo: 90, valor: 80, objetivo: 80, unidad: 70, cumple: 60 };
    const tableLeft  = doc.page.margins.left;
    const tableWidth = Object.values(COL).reduce((a, b) => a + b, 0);

    for (const [categoria, data] of Object.entries(grouped)) {
      // Category header
      doc
        .fontSize(13)
        .fillColor(data.color || '#1e40af')
        .text(`▶  ${categoria}`, tableLeft)
        .moveDown(0.4);

      // Table header row
      const headerY = doc.y;
      doc.rect(tableLeft, headerY, tableWidth, 18).fillColor('#1e40af').fill();
      doc.fillColor('#ffffff').fontSize(8);

      let x = tableLeft;
      ['Métrica', 'Período', 'Valor Actual', 'Objetivo', 'Unidad', 'Cumple'].forEach((h, i) => {
        const w = Object.values(COL)[i];
        doc.text(h, x + 3, headerY + 5, { width: w - 6, align: 'left' });
        x += w;
      });

      doc.y = headerY + 20;

      // Data rows
      data.rows.forEach((row, idx) => {
        const rowY  = doc.y;
        const cumple = row.valor_objetivo !== null && row.valor_actual >= row.valor_objetivo;

        // Alternating background
        if (idx % 2 === 0) {
          doc.rect(tableLeft, rowY, tableWidth, 16).fillColor('#f1f5f9').fill();
        }

        doc.fillColor('#1f2937').fontSize(8);
        let rx = tableLeft;

        const cells = [
          row.nombre_metrica,
          `${row.nombre_mes} ${row.anio}`,
          String(row.valor_actual),
          row.valor_objetivo !== null ? String(row.valor_objetivo) : '-',
          row.unidad || '-',
          row.valor_objetivo !== null ? (cumple ? '✓' : '✗') : '-',
        ];

        cells.forEach((cell, i) => {
          const w = Object.values(COL)[i];
          if (i === 5 && row.valor_objetivo !== null) {
            doc.fillColor(cumple ? '#16a34a' : '#dc2626');
          } else {
            doc.fillColor('#1f2937');
          }
          doc.text(cell, rx + 3, rowY + 4, { width: w - 6, align: 'left', lineBreak: false });
          rx += w;
        });

        doc.y = rowY + 18;

        // Page break guard
        if (doc.y > doc.page.height - doc.page.margins.bottom - 60) {
          doc.addPage();
        }
      });

      // Per-category summary line
      const totalRows   = data.rows.length;
      const conObjetivo = data.rows.filter((r) => r.valor_objetivo !== null);
      const enObjetivo  = conObjetivo.filter((r) => r.valor_actual >= r.valor_objetivo).length;

      doc
        .moveDown(0.3)
        .fontSize(8)
        .fillColor('#374151')
        .text(
          `Total: ${totalRows} métricas | Con objetivo: ${conObjetivo.length} | Cumplidas: ${enObjetivo}`,
          tableLeft,
          doc.y,
          { align: 'left' }
        )
        .moveDown(1.2);
    }

    // ── Global summary ──────────────────────────────────────────────────────
    const total    = metricas.length;
    const conObj   = metricas.filter((m) => m.valor_objetivo !== null);
    const cumplidas = conObj.filter((m) => m.valor_actual >= m.valor_objetivo).length;
    const pct      = conObj.length ? ((cumplidas / conObj.length) * 100).toFixed(1) : 'N/A';

    doc
      .moveDown(0.5)
      .fontSize(11)
      .fillColor('#1e40af')
      .text('Resumen Global', tableLeft)
      .moveDown(0.2)
      .fontSize(9)
      .fillColor('#374151')
      .text(`Total de métricas: ${total}`)
      .text(`Métricas con objetivo definido: ${conObj.length}`)
      .text(`Métricas que cumplen objetivo: ${cumplidas}`)
      .text(`Porcentaje de cumplimiento: ${pct}%`);

    doc.end();
  },
};

module.exports = ReporteService;
