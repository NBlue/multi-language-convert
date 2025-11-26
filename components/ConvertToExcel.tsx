'use client';

import { useState } from 'react';
import { FileText, Download, Loader2, AlertCircle } from 'lucide-react';
import FileUploader from './FileUploader';
import FileList from './FileList';
import FilePreview from './FilePreview';
import { parseJsonFile } from '@/lib/parsers/jsonParser';
import { parseTsJsFile } from '@/lib/parsers/tsJsParser';
import { flattenObject } from '@/lib/utils/flatten';
import { convertToExcel, type FileData } from '@/lib/converters/toExcel';

export default function ConvertToExcel() {
  const [files, setFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setError(null);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;

    setIsConverting(true);
    setError(null);

    try {
      const filesData: FileData[] = [];

      // Process each file
      for (const file of files) {
        try {
          let data: Record<string, unknown>;

          // Parse based on file extension
          const fileExtension = file.name
            .toLowerCase()
            .substring(file.name.lastIndexOf('.'));

          if (fileExtension === '.json') {
            data = await parseJsonFile(file);
          } else if (fileExtension === '.ts' || fileExtension === '.js') {
            data = await parseTsJsFile(file);
          } else {
            throw new Error(`Unsupported file type: ${fileExtension}`);
          }

          // Flatten nested object
          const flattenedData = flattenObject(data);

          // Convert to rows
          const rows = Object.entries(flattenedData).map(([key, value]) => ({
            key,
            value,
            filename: file.name,
          }));

          filesData.push({
            filename: file.name,
            rows,
          });

          console.log(`✅ Processed ${file.name}: ${rows.length} keys`);
        } catch (err) {
          throw new Error(
            `Failed to process ${file.name}: ${
              err instanceof Error ? err.message : 'Unknown error'
            }`,
          );
        }
      }

      // Convert to Excel and download
      convertToExcel(filesData, 'Multi-Language.xlsx');

      console.log('✅ Successfully converted to Excel!');
    } catch (err) {
      console.error('Conversion error:', err);
      setError(err instanceof Error ? err.message : 'Failed to convert files');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How to use:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>
                Upload one or multiple translation files (.json, .ts, .js)
              </li>
              <li>Review the uploaded files</li>
              <li>
                {'Click "Convert to Excel" to generate a single Excel file'}
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* File Uploader */}
      <FileUploader
        onFilesAdded={handleFilesAdded}
        acceptedFormats={['.json', '.ts', '.js']}
      />

      {/* File List */}
      {files.length > 0 && (
        <FileList files={files} onRemove={handleRemoveFile} />
      )}

      {/* File Previews */}
      {files.length > 0 && files.length <= 3 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">File Formats:</h3>
          <div className="grid gap-3">
            {files.map((file, index) => (
              <FilePreview key={index} file={file} />
            ))}
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
      {files.length > 0 && (
        <div className="flex justify-end pt-4">
          <button
            onClick={handleConvert}
            disabled={isConverting}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isConverting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Convert to Excel
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
