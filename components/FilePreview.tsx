'use client';

import { FileJson, FileCode, FileSpreadsheet } from 'lucide-react';

interface FilePreviewProps {
  file: File;
}

export default function FilePreview({ file }: FilePreviewProps) {
  const getFileType = (filename: string): string => {
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return ext;
  };

  const getFileIcon = (ext: string) => {
    switch (ext) {
      case '.json':
        return <FileJson className="w-8 h-8 text-blue-500" />;
      case '.ts':
      case '.js':
        return <FileCode className="w-8 h-8 text-yellow-500" />;
      case '.xlsx':
      case '.xls':
        return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
      default:
        return <FileJson className="w-8 h-8 text-gray-500" />;
    }
  };

  const getFileDescription = (ext: string) => {
    switch (ext) {
      case '.json':
        return {
          type: 'JSON File',
          description: 'JavaScript Object Notation format',
          example: `{
  "key": "value",
  "nested": {
    "key": "value"
  }
}`,
        };
      case '.ts':
        return {
          type: 'TypeScript File',
          description: 'TypeScript translation object',
          example: `const translations = {
  key: 'value',
  nested: {
    key: 'value'
  }
};

export default translations;`,
        };
      case '.js':
        return {
          type: 'JavaScript File',
          description: 'JavaScript translation object',
          example: `const translations = {
  key: 'value',
  nested: {
    key: 'value'
  }
};

module.exports = translations;`,
        };
      case '.xlsx':
      case '.xls':
        return {
          type: 'Excel File',
          description: 'Microsoft Excel Spreadsheet',
          example: `| KEY           | VI        | EN      |
|---------------|-----------|---------|
| save          | Lưu       | Save    |
| error.unknown | Lỗi       | Error   |`,
        };
      default:
        return {
          type: 'Unknown File',
          description: 'File format not recognized',
          example: '',
        };
    }
  };

  const ext = getFileType(file.name);
  const info = getFileDescription(ext);

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-linear-to-br from-gray-50 to-white">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="shrink-0 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
          {getFileIcon(ext)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {info.type}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{info.description}</p>
            </div>
            <span className="shrink-0 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
              {ext.toUpperCase()}
            </span>
          </div>

          {/* Example Preview */}
          {info.example && (
            <details className="mt-3">
              <summary className="text-xs font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none">
                View format example
              </summary>
              <pre className="mt-2 p-3 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto">
                {info.example}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
