/**
 * Convert Excel file back to translation files
 */

import * as XLSX from 'xlsx';
import { unflattenObject } from '@/lib/utils/unflatten';

export interface TranslationFile {
  filename: string;
  content: string;
  language: string;
}

export interface ExcelColumn {
  index: number;
  name: string;
  isKey: boolean;
}

export interface ExcelStructure {
  keyColumnIndex: number;
  languageColumns: ExcelColumn[];
}

export interface ExcelSheet {
  name: string;
  index: number;
}

/**
 * Detect all sheets in Excel file
 */
export async function detectExcelSheets(file: File): Promise<ExcelSheet[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        const sheets: ExcelSheet[] = workbook.SheetNames.map((name, index) => ({
          name,
          index,
        }));

        resolve(sheets);
      } catch (error) {
        reject(
          error instanceof Error
            ? error
            : new Error('Failed to read Excel file'),
        );
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsBinaryString(file);
  });
}

/**
 * Read Excel file and detect columns from specific sheet
 * Returns KEY column index and available language columns
 */
export async function detectExcelColumns(
  file: File,
  sheetName: string,
): Promise<ExcelStructure> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Check if sheet exists
        if (!workbook.SheetNames.includes(sheetName)) {
          throw new Error(`Sheet "${sheetName}" not found in Excel file`);
        }

        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON to get headers
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length === 0) {
          throw new Error(`Sheet "${sheetName}" is empty`);
        }

        // First row is headers
        const headers = jsonData[0] as string[];

        // Find KEY column (case-insensitive) - can be at any position
        let keyColumnIndex = -1;
        for (let i = 0; i < headers.length; i++) {
          const columnName = headers[i]?.toString().trim().toUpperCase();
          if (columnName === 'KEY') {
            keyColumnIndex = i;
            break;
          }
        }

        // If no KEY column found, show helpful error
        if (keyColumnIndex === -1) {
          const availableColumns = headers
            .filter((h) => h && h.toString().trim())
            .map((h) => `"${h}"`)
            .join(', ');
          throw new Error(
            `Sheet "${sheetName}": No column named "KEY" found. Available columns: ${
              availableColumns || 'none'
            }`,
          );
        }

        // Map headers to columns
        const allColumns: ExcelColumn[] = headers.map((header, index) => ({
          index,
          name: header?.toString().trim() || `Column ${index + 1}`,
          isKey: index === keyColumnIndex,
        }));

        // Filter out KEY column and empty columns, return only language columns
        const languageColumns = allColumns.filter(
          (col) =>
            !col.isKey && col.name && col.name !== `Column ${col.index + 1}`,
        );

        resolve({
          keyColumnIndex,
          languageColumns,
        });
      } catch (error) {
        reject(
          error instanceof Error
            ? error
            : new Error('Failed to read Excel file'),
        );
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsBinaryString(file);
  });
}

/**
 * Convert Excel to JSON files for selected languages from specific sheet
 */
export async function convertFromExcel(
  file: File,
  sheetName: string,
  keyColumnIndex: number,
  selectedLanguages: string[],
): Promise<TranslationFile[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Check if sheet exists
        if (!workbook.SheetNames.includes(sheetName)) {
          throw new Error(`Sheet "${sheetName}" not found in Excel file`);
        }

        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
        }) as string[][];

        if (jsonData.length < 2) {
          throw new Error('Excel file must have headers and at least one row');
        }

        // First row is headers
        const headers = jsonData[0].map((h) => h?.toString().trim() || '');

        // Create result files for each selected language
        const resultFiles: TranslationFile[] = [];

        for (const language of selectedLanguages) {
          // Find column index for this language
          const langIndex = headers.findIndex(
            (h) => h.toUpperCase() === language.toUpperCase(),
          );

          if (langIndex === -1) {
            console.warn(`Language column "${language}" not found, skipping`);
            continue;
          }

          // Extract key-value pairs for this language
          const flatData: Record<string, string> = {};

          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            const key = row[keyColumnIndex]?.toString().trim();
            const value = row[langIndex]?.toString().trim() || '';

            // Skip empty rows or rows without keys
            if (!key) continue;

            flatData[key] = value;
          }

          // Validate for key conflicts before unflatten
          const keys = Object.keys(flatData);
          for (let i = 0; i < keys.length; i++) {
            for (let j = i + 1; j < keys.length; j++) {
              const key1 = keys[i];
              const key2 = keys[j];

              // Check if one key is a prefix of another (with dot)
              if (key1.startsWith(key2 + '.') || key2.startsWith(key1 + '.')) {
                throw new Error(
                  `Key conflict detected in language "${language}": ` +
                    `Keys "${key1}" and "${key2}" conflict because one is a nested path of the other. ` +
                    `You cannot have both "a" and "a.b" as keys in the same file. ` +
                    `Please fix your Excel data.`,
                );
              }
            }
          }

          // Unflatten to nested object
          const nestedData = unflattenObject(flatData);

          // Generate JSON content
          const jsonContent = JSON.stringify(nestedData, null, 2);

          resultFiles.push({
            filename: `${language.toLowerCase()}.json`,
            content: jsonContent,
            language,
          });
        }

        resolve(resultFiles);
      } catch (error) {
        reject(
          error instanceof Error
            ? error
            : new Error('Failed to convert Excel file'),
        );
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsBinaryString(file);
  });
}
