'use client';

import { useState, useEffect } from 'react';
import FileUploader from './FileUploader';
import FileList from './FileList';
import FilePreview from './FilePreview';
import { FileSpreadsheet, Download, Loader2, AlertCircle } from 'lucide-react';
import {
  detectExcelSheets,
  detectExcelColumns,
  convertFromExcel,
  type ExcelColumn,
  type ExcelSheet,
  type ExcelStructure,
} from '@/lib/converters/fromExcel';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function ConvertFromExcel() {
  const [files, setFiles] = useState<File[]>([]);
  const [availableSheets, setAvailableSheets] = useState<ExcelSheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [keyColumnIndex, setKeyColumnIndex] = useState<number>(-1);
  const [availableLanguages, setAvailableLanguages] = useState<ExcelColumn[]>(
    [],
  );
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [isDetectingSheets, setIsDetectingSheets] = useState(false);
  const [isDetectingColumns, setIsDetectingColumns] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detect sheets when file is uploaded
  useEffect(() => {
    const detectSheets = async () => {
      if (files.length === 0) {
        setAvailableSheets([]);
        setSelectedSheet(null);
        setAvailableLanguages([]);
        setSelectedLanguages([]);
        return;
      }

      setIsDetectingSheets(true);
      setError(null);

      try {
        const sheets = await detectExcelSheets(files[0]);
        setAvailableSheets(sheets);

        // Auto-select first sheet
        if (sheets.length > 0) {
          setSelectedSheet(sheets[0].name);
        }

        console.log('✅ Detected sheets:', sheets);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to detect sheets',
        );
        setAvailableSheets([]);
        setSelectedSheet(null);
      } finally {
        setIsDetectingSheets(false);
      }
    };

    detectSheets();
  }, [files]);

  // Detect columns when sheet is selected
  useEffect(() => {
    const detectColumns = async () => {
      if (files.length === 0 || !selectedSheet) {
        setKeyColumnIndex(-1);
        setAvailableLanguages([]);
        setSelectedLanguages([]);
        return;
      }

      setIsDetectingColumns(true);
      setError(null);

      try {
        const structure: ExcelStructure = await detectExcelColumns(
          files[0],
          selectedSheet,
        );
        setKeyColumnIndex(structure.keyColumnIndex);
        setAvailableLanguages(structure.languageColumns);

        // Auto-select all languages by default
        setSelectedLanguages(structure.languageColumns.map((col) => col.name));

        console.log(
          '✅ Detected KEY column at index:',
          structure.keyColumnIndex,
        );
        console.log('✅ Detected language columns:', structure.languageColumns);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to detect columns',
        );
        setKeyColumnIndex(-1);
        setAvailableLanguages([]);
        setSelectedLanguages([]);
      } finally {
        setIsDetectingColumns(false);
      }
    };

    detectColumns();
  }, [files, selectedSheet]);

  const handleFilesAdded = (newFiles: File[]) => {
    // Only allow one Excel file at a time
    setFiles(newFiles.slice(0, 1));
    setError(null);
  };

  const handleRemoveFile = () => {
    setFiles([]);
    setAvailableSheets([]);
    setSelectedSheet(null);
    setKeyColumnIndex(-1);
    setAvailableLanguages([]);
    setSelectedLanguages([]);
    setError(null);
  };

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(language)
        ? prev.filter((lang) => lang !== language)
        : [...prev, language],
    );
  };

  const handleConvert = async () => {
    if (
      files.length === 0 ||
      !selectedSheet ||
      keyColumnIndex === -1 ||
      selectedLanguages.length === 0
    )
      return;

    setIsConverting(true);
    setError(null);

    try {
      const translationFiles = await convertFromExcel(
        files[0],
        selectedSheet,
        keyColumnIndex,
        selectedLanguages,
      );

      if (translationFiles.length === 0) {
        throw new Error('No translation files generated');
      }

      // If only one file, download directly
      if (translationFiles.length === 1) {
        const file = translationFiles[0];
        const blob = new Blob([file.content], {
          type: 'application/json',
        });
        saveAs(blob, file.filename);
        console.log(`✅ Downloaded ${file.filename}`);
      } else {
        // Multiple files - create ZIP
        const zip = new JSZip();

        translationFiles.forEach((file) => {
          zip.file(file.filename, file.content);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, 'translations.zip');
        console.log(
          `✅ Downloaded ${translationFiles.length} files as translations.zip`,
        );
      }

      console.log('✅ Successfully converted from Excel!');
    } catch (err) {
      console.error('Conversion error:', err);
      setError(err instanceof Error ? err.message : 'Failed to convert file');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileSpreadsheet className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
          <div className="text-sm text-green-800">
            <p className="font-medium mb-1">How to use:</p>
            <ol className="list-decimal list-inside space-y-1 text-green-700">
              <li>
                Upload an Excel file (.xlsx) with KEY column + language columns
              </li>
              <li>Select which sheet to convert (if multiple sheets)</li>
              <li>Select which languages to export</li>
              <li>Click "Convert from Excel" to generate JSON files</li>
            </ol>
          </div>
        </div>
      </div>

      {/* File Uploader */}
      <FileUploader
        onFilesAdded={handleFilesAdded}
        acceptedFormats={['.xlsx', '.xls']}
      />

      {/* File List */}
      {files.length > 0 && (
        <FileList files={files} onRemove={handleRemoveFile} />
      )}

      {/* File Preview */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">File Format:</h3>
          <FilePreview file={files[0]} />

          {/* Excel Info */}
          {availableSheets.length > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-medium text-blue-900">
                  Excel Structure
                </p>
              </div>
              <ul className="text-xs text-blue-800 space-y-1 ml-6">
                <li>
                  • <strong>{availableSheets.length}</strong> sheet(s) detected
                </li>
                {selectedSheet && (
                  <li>
                    • Current sheet: <strong>{selectedSheet}</strong>
                  </li>
                )}
                {availableLanguages.length > 0 && (
                  <li>
                    • <strong>{availableLanguages.length}</strong> language
                    column(s) found
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Detecting sheets loader */}
      {isDetectingSheets && (
        <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
          <p className="text-sm text-blue-800">Detecting sheets...</p>
        </div>
      )}

      {/* Sheet Selection */}
      {!isDetectingSheets && availableSheets.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Sheet:
          </label>
          <select
            value={selectedSheet || ''}
            onChange={(e) => setSelectedSheet(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm text-neutral-800"
          >
            {availableSheets.map((sheet) => (
              <option key={sheet.name} value={sheet.name}>
                {sheet.name}
                {availableSheets.length > 1 && ` (Sheet ${sheet.index + 1})`}
              </option>
            ))}
          </select>
          {availableSheets.length > 1 && (
            <p className="text-xs text-gray-500 mt-2">
              Found {availableSheets.length} sheets in this Excel file
            </p>
          )}
        </div>
      )}

      {/* Detecting columns loader */}
      {isDetectingColumns && (
        <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
          <p className="text-sm text-blue-800">Detecting columns...</p>
        </div>
      )}

      {/* Language Selection */}
      {!isDetectingColumns && availableLanguages.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Languages to Export:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {availableLanguages.map((col) => (
              <label
                key={col.name}
                className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedLanguages.includes(col.name)}
                  onChange={() => handleLanguageToggle(col.name)}
                  className="w-4 h-4 text-green-600 cursor-pointer rounded"
                />
                <span className="text-sm text-gray-700 font-medium">
                  {col.name}
                </span>
              </label>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              {selectedLanguages.length} language(s) selected
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">
              Conversion Failed
            </p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Convert Button */}
      {files.length > 0 &&
        selectedSheet &&
        selectedLanguages.length > 0 &&
        !isDetectingSheets &&
        !isDetectingColumns && (
          <div className="flex justify-end pt-4">
            <button
              onClick={handleConvert}
              disabled={isConverting}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Convert from Excel
                </>
              )}
            </button>
          </div>
        )}
    </div>
  );
}
