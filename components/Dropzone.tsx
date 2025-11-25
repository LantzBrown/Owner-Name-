import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface DropzoneProps {
  onFileAccepted: (file: File) => void;
  isLoading: boolean;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFileAccepted, isLoading }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!isLoading) setIsDragOver(true);
  }, [isLoading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const validateAndAccept = (file: File) => {
    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      setError("Please upload a valid CSV file.");
      return;
    }
    setError(null);
    onFileAccepted(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAccept(e.dataTransfer.files[0]);
    }
  }, [isLoading, onFileAccepted]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAccept(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={clsx(
        "relative group cursor-pointer flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed transition-all duration-300 ease-in-out bg-white",
        isDragOver ? "border-indigo-500 bg-indigo-50" : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50",
        isLoading && "opacity-50 pointer-events-none"
      )}
    >
      <input
        type="file"
        accept=".csv"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileInput}
        disabled={isLoading}
      />
      
      <div className="flex flex-col items-center space-y-3 text-center p-4">
        <div className={clsx(
          "p-3 rounded-full transition-colors",
          isDragOver ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-500"
        )}>
          <UploadCloud size={32} />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-700">
            <span className="text-indigo-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-slate-500">CSV files only (up to 5000 rows)</p>
        </div>
      </div>

      {error && (
        <div className="absolute bottom-4 flex items-center gap-2 text-xs text-red-500 bg-red-50 px-3 py-1 rounded-full animate-in fade-in slide-in-from-bottom-2">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  );
};

export default Dropzone;