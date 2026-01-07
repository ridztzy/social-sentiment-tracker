"use client";

import { useState } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
}

export default function FileUpload({
  onFileSelect,
  accept = '.csv',
  maxSize = 10,
  disabled = false
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    setError(null);

    // Check file type
    if (accept && !file.name.endsWith(accept.replace('*', ''))) {
      setError(`File type tidak valid. Harus berformat ${accept}`);
      return false;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (maxSize && fileSizeMB > maxSize) {
      setError(`File terlalu besar. Maksimal ${maxSize}MB`);
      return false;
    }

    return true;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all
          ${dragActive 
            ? 'border-green-500 bg-green-50 dark:bg-green-900/10' 
            : 'border-gray-300 dark:border-slate-600 hover:border-green-400 dark:hover:border-green-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center gap-3">
          <div className={`
            p-4 rounded-full
            ${dragActive 
              ? 'bg-green-100 dark:bg-green-900/20' 
              : 'bg-gray-100 dark:bg-slate-700'
            }
          `}>
            <Upload 
              size={32} 
              className={dragActive ? 'text-green-600' : 'text-gray-400 dark:text-gray-500'}
            />
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              <span className="text-green-600 dark:text-green-400 font-semibold">
                Click to upload
              </span>
              {' '}or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {accept.toUpperCase()} file (max {maxSize}MB)
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
