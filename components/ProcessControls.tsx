import React from 'react';
import { Search, Download, Play, Pause, Square } from 'lucide-react';
import { AppStatus } from '../types';
import clsx from 'clsx';

interface ProcessControlsProps {
  status: AppStatus;
  progress: number;
  totalRows: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onDownload: () => void;
  onReset: () => void;
  hasData: boolean;
}

const ProcessControls: React.FC<ProcessControlsProps> = ({
  status,
  progress,
  totalRows,
  onStart,
  onPause,
  onResume,
  onStop,
  onDownload,
  onReset,
  hasData
}) => {
  const isProcessing = status === AppStatus.PROCESSING;
  const isPaused = status === AppStatus.PAUSED;
  const isCompleted = status === AppStatus.COMPLETED;
  const isRunning = isProcessing || isPaused;

  return (
    <div className="bg-white border-t border-slate-200 p-4 md:p-6 shadow-up-sm z-20">
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center gap-4 justify-between">
        
        {/* Left: Status / Progress */}
        <div className="w-full md:w-1/2">
          {isRunning || isCompleted ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-600 font-medium">
                <span className="flex items-center gap-2">
                   {isPaused ? "Paused" : isCompleted ? "Completed" : "Investigating..."}
                   {isProcessing && <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"/>}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={clsx(
                    "h-full rounded-full transition-all duration-300",
                    isCompleted ? "bg-emerald-500" : isPaused ? "bg-amber-400" : "bg-indigo-600"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-sm">
              {hasData ? `${totalRows} businesses ready to process.` : "Upload a CSV to begin."}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          
          {/* Controls while running */}
          {isRunning && (
            <>
              {isPaused ? (
                <button
                  onClick={onResume}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  <Play size={18} fill="currentColor" /> Resume
                </button>
              ) : (
                <button
                  onClick={onPause}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <Pause size={18} fill="currentColor" /> Pause
                </button>
              )}
              
              <button
                onClick={onStop}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <Square size={18} fill="currentColor" /> Stop
              </button>
            </>
          )}

          {/* Controls when IDLE */}
          {status === AppStatus.IDLE && hasData && (
             <button
                onClick={onReset}
                className="px-4 py-2.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
             >
                Clear Data
             </button>
          )}

          {status === AppStatus.IDLE && (
            <button
              onClick={onStart}
              disabled={!hasData}
              className={clsx(
                "flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white shadow-md transition-all",
                hasData 
                  ? "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg active:scale-95" 
                  : "bg-slate-300 cursor-not-allowed"
              )}
            >
              <Search size={18} />
              Start Findings
            </button>
          )}

          {/* Controls when Completed or Stopped */}
          {(isCompleted || (status === AppStatus.IDLE && progress > 0)) && (
            <>
              {!isRunning && status !== AppStatus.IDLE && (
                <button
                    onClick={onReset}
                    className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                    Start Over
                </button>
              )}
              {isCompleted && (
                  <button
                    onClick={onDownload}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all active:scale-95"
                  >
                    <Download size={18} />
                    Download CSV
                  </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessControls;