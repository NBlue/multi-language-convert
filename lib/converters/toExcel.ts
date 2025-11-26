/**
 * Convert translation files to Excel format
 */

import * as XLSX from 'xlsx';

export interface ExcelRow {
  key: string;
  value: string;
  filename?: string;
}

export interface FileData {
  filename: string;
  rows: ExcelRow[];
}

/**
 * Convert translation data to Excel and download
 * @param filesData Array of file data with rows
 * @param outputFilename Output Excel filename (default: Multi-Language.xlsx)
 */
export function convertToExcel(
  filesData: FileData[],
  outputFilename = 'Multi-Language.xlsx',
): void {
  // Prepare worksheet data
  const worksheetData: any[][] = [];

  // Add header row
  worksheetData.push(['Key', 'Value']);

  // Add data from each file with separators
  filesData.forEach((fileData, fileIndex) => {
    // Add rows from this file
    fileData.rows.forEach((row) => {
      worksheetData.push([row.key, row.value]);
    });

    // Add 2 empty rows as separator between files (except after last file)
    if (fileIndex < filesData.length - 1) {
      worksheetData.push([]);
      worksheetData.push([]);
    }
  });

  // Create workbook and worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 40 }, // Key column
    { wch: 60 }, // Value column (wider since we removed Filename column)
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Translations');

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, outputFilename);
}
