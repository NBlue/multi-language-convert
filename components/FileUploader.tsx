'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  onFilesAdded: (files: File[]) => void;
  acceptedFormats: string[];
}

export default function FileUploader({
  onFilesAdded,
  acceptedFormats,
}: FileUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (droppedFiles: File[]) => {
      setError(null);

      // Validate file extensions manually
      const validFiles: File[] = [];
      const invalidFiles: string[] = [];

      droppedFiles.forEach((file) => {
        const fileExtension = file.name
          .toLowerCase()
          .substring(file.name.lastIndexOf('.'));

        if (acceptedFormats.includes(fileExtension)) {
          validFiles.push(file);
        } else {
          invalidFiles.push(file.name);
        }
      });

      // Show error if any invalid files
      if (invalidFiles.length > 0) {
        setError(
          `Invalid file format: ${invalidFiles.join(
            ', ',
          )}. Only ${acceptedFormats.join(', ')} are supported.`,
        );
      }

      // Add valid files
      if (validFiles.length > 0) {
        onFilesAdded(validFiles);
      }
    },
    [onFilesAdded, acceptedFormats],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // Don't use MIME type validation - validate extension instead
    multiple: true,
    noClick: false,
    noKeyboard: false,
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-white'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isDragActive ? 'bg-blue-100' : 'bg-gray-100'
            }`}
          >
            <Upload
              className={`w-6 h-6 ${
                isDragActive ? 'text-blue-600' : 'text-gray-500'
              }`}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              {isDragActive ? (
                'Drop files here...'
              ) : (
                <>
                  Drag & drop files here, or{' '}
                  <span className="text-blue-600">browse</span>
                </>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: {acceptedFormats.join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}
