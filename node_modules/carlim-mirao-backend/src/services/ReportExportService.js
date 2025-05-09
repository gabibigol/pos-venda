const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

class ReportExportService {
  /**
   * Exportar relatório financeiro para PDF
   * @param {Object} reportData - Dados do relatório
   * @param {string} filename - Nome do arquivo
   * @returns {string} Caminho do arquivo gerado
   */
  static async exportFinancialReportToPDF(reportData, filename = 'financial_report') {
    const doc = new PDFDocument();
    const outputPath = path.join(process.cwd(), 'exports', `${filename}_${Date.now()}.pdf`);

    // Garantir que o diretório de exports exista
    if (!fs.existsSync(path.join(process.cwd(), 'exports'))) {
      fs.mkdirSync(path.join(process.cwd(), 'exports'));
    }

    const writeStream = fs.createWriteStream(outputPath);

    doc.pipe(writeStream);

    // Cabeçalho do relatório
    doc.fontSize(16).text('Relatório Financeiro', { align: 'center' });
    doc.moveDown();

    // Período do relatório
    doc.fontSize(12).text(`Período: ${reportData.period.startDate} - ${reportData.period.endDate}`);
    doc.moveDown();

    // Totais financeiros
    doc.fontSize(14).text('Resumo Financeiro', { underline: true });
    doc.fontSize(10)
      .text(`Receita Total: R$ ${reportData.totals.income.toFixed(2)}`)
      .text(`Despesas Totais: R$ ${reportData.totals.expense.toFixed(2)}`)
      .text(`Saldo: R$ ${reportData.totals.balance.toFixed(2)}`)
      .moveDown();

    // Detalhamento por categoria
    doc.fontSize(14).text('Detalhamento por Categoria', { underline: true });

    // Iterar sobre categorias de entrada
    if (reportData.categoryBreakdown.INCOME) {
      doc.fontSize(12).text('Entradas:', { underline: true });
      Object.entries(reportData.categoryBreakdown.INCOME).forEach(([category, data]) => {
        doc.fontSize(10)
          .text(`${category}: R$ ${data.totalAmount.toFixed(2)} (${data.transactionCount} transações)`);
      });
    }

    // Iterar sobre categorias de saída
    if (reportData.categoryBreakdown.EXPENSE) {
      doc.fontSize(12).text('Saídas:', { underline: true });
      Object.entries(reportData.categoryBreakdown.EXPENSE).forEach(([category, data]) => {
        doc.fontSize(10)
          .text(`${category}: R$ ${data.totalAmount.toFixed(2)} (${data.transactionCount} transações)`);
      });
    }

    doc.end();

    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => resolve(outputPath));
      writeStream.on('error', reject);
    });
  }

  /**
   * Exportar relatório financeiro para Excel
   * @param {Object} reportData - Dados do relatório
   * @param {string} filename - Nome do arquivo
   * @returns {string} Caminho do arquivo gerado
   */
  static async exportFinancialReportToExcel(reportData, filename = 'financial_report') {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Relatório Financeiro');

    // Garantir que o diretório de exports exista
    if (!fs.existsSync(path.join(process.cwd(), 'exports'))) {
      fs.mkdirSync(path.join(process.cwd(), 'exports'));
    }

    const outputPath = path.join(process.cwd(), 'exports', `${filename}_${Date.now()}.xlsx`);

    // Resumo financeiro
    worksheet.addRow(['Resumo Financeiro']);
    worksheet.addRow(['Receita Total', reportData.totals.income.toFixed(2)]);
    worksheet.addRow(['Despesas Totais', reportData.totals.expense.toFixed(2)]);
    worksheet.addRow(['Saldo', reportData.totals.balance.toFixed(2)]);
    worksheet.addRow([]); // Linha em branco

    // Detalhamento por categoria de Entrada
    worksheet.addRow(['Entradas por Categoria']);
    worksheet.addRow(['Categoria', 'Valor Total', 'Número de Transações']);

    if (reportData.categoryBreakdown.INCOME) {
      Object.entries(reportData.categoryBreakdown.INCOME).forEach(([category, data]) => {
        worksheet.addRow([
          category,
          data.totalAmount.toFixed(2),
          data.transactionCount
        ]);
      });
    }

    worksheet.addRow([]); // Linha em branco

    // Detalhamento por categoria de Saída
    worksheet.addRow(['Saídas por Categoria']);
    worksheet.addRow(['Categoria', 'Valor Total', 'Número de Transações']);

    if (reportData.categoryBreakdown.EXPENSE) {
      Object.entries(reportData.categoryBreakdown.EXPENSE).forEach(([category, data]) => {
        worksheet.addRow([
          category,
          data.totalAmount.toFixed(2),
          data.transactionCount
        ]);
      });
    }

    // Salvar arquivo
    await workbook.xlsx.writeFile(outputPath);

    return outputPath;
  }

  /**
   * Exportar transações para PDF
   * @param {Object} transactionsData - Dados das transações
   * @param {string} filename - Nome do arquivo
   * @returns {string} Caminho do arquivo gerado
   */
  static async exportTransactionsToPDF(transactionsData, filename = 'transactions') {
    const doc = new PDFDocument();
    const outputPath = path.join(process.cwd(), 'exports', `${filename}_${Date.now()}.pdf`);

    const writeStream = fs.createWriteStream(outputPath);

    doc.pipe(writeStream);

    // Cabeçalho
    doc.fontSize(16).text('Relatório de Transações', { align: 'center' });
    doc.moveDown();

    // Período
    doc.fontSize(12).text(`Período: ${transactionsData.period.startDate} - ${transactionsData.period.endDate}`);
    doc.moveDown();

    // Cabeçalho da tabela
    const tableTop = doc.y;

    doc.fontSize(10)
      .text('Data', 50, tableTop)
      .text('Tipo', 150, tableTop)
      .text('Categoria', 250, tableTop)
      .text('Valor', 400, tableTop)
      .text('Status', 500, tableTop);

    // Linha divisória
    doc.moveDown().strokeColor('#000').lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // Adicionar transações
    let yPosition = doc.y + 10;

    transactionsData.transactions.forEach(transaction => {
      doc.fontSize(8)
        .text(new Date(transaction.transactionDate).toLocaleDateString(), 50, yPosition)
        .text(transaction.type, 150, yPosition)
        .text(transaction.category, 250, yPosition)
        .text(`R$ ${transaction.amount.toFixed(2)}`, 400, yPosition)
        .text(transaction.status, 500, yPosition);

      yPosition += 20;
    });

    doc.end();

    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => resolve(outputPath));
      writeStream.on('error', reject);
    });
  }

  /**
   * Exportar transações para Excel
   * @param {Object} transactionsData - Dados das transações
   * @param {string} filename - Nome do arquivo
   * @returns {string} Caminho do arquivo gerado
   */
  static async exportTransactionsToExcel(transactionsData, filename = 'transactions') {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transações');

    const outputPath = path.join(process.cwd(), 'exports', `${filename}_${Date.now()}.xlsx`);

    // Definir colunas
    worksheet.columns = [
      { header: 'Data', key: 'date', width: 15 },
      { header: 'Tipo', key: 'type', width: 15 },
      { header: 'Categoria', key: 'category', width: 20 },
      { header: 'Valor', key: 'amount', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Descrição', key: 'description', width: 30 }
    ];

    // Adicionar dados das transações
    transactionsData.transactions.forEach(transaction => {
      worksheet.addRow({
        date: new Date(transaction.transactionDate).toLocaleDateString(),
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        status: transaction.status,
        description: transaction.description || ''
      });
    });

    // Salvar arquivo
    await workbook.xlsx.writeFile(outputPath);

    return outputPath;
  }
}

module.exports = ReportExportService;
