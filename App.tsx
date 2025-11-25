import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import Dropzone from './components/Dropzone';
import DataTable from './components/DataTable';
import ProcessControls from './components/ProcessControls';
import { BusinessRow, AppStatus } from './types';
import { parseCSV, generateCSV, downloadCSV } from './services/csvService';
import { findBusinessOwner } from './services/geminiService';

const CONCURRENCY_LIMIT = 3;

const App: React.FC = () => {
  const [data, setData] = useState<BusinessRow[]>([]);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [currentProcessingIds, setCurrentProcessingIds] = useState<string[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  
  // Refs for managing async loop control
  const shouldStopRef = useRef(false);
  const isPausedRef = useRef(false);
  const dataRef = useRef<BusinessRow[]>([]);

  // Keep dataRef in sync
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const handleFileAccepted = async (file: File) => {
    try {
      const parsedData = await parseCSV(file);
      setData(parsedData);
      setStatus(AppStatus.IDLE);
      setCompletedCount(0);
      setCurrentProcessingIds([]);
    } catch (error) {
      console.error("Failed to parse CSV", error);
      alert("Error parsing CSV file. Please check the format.");
    }
  };

  const processRows = async () => {
    setStatus(AppStatus.PROCESSING);
    shouldStopRef.current = false;
    isPausedRef.current = false;
    
    // We use a simple index tracker for the workers to pull from
    let nextIndex = 0;
    
    // Calculate already processed to skip
    const processedCount = data.filter(r => r.owner_name).length;
    setCompletedCount(processedCount);
    nextIndex = 0; // We iterate all, but skip inside worker

    const worker = async (workerId: number) => {
      while (nextIndex < dataRef.current.length) {
        // Stop check
        if (shouldStopRef.current) break;

        // Pause check
        while (isPausedRef.current) {
          if (shouldStopRef.current) break;
          await new Promise(r => setTimeout(r, 500));
        }
        if (shouldStopRef.current) break;

        // Grab next available index atomically (JS is single threaded for this part)
        const index = nextIndex++;
        
        if (index >= dataRef.current.length) break;
        
        const row = dataRef.current[index];

        // Skip if already has data (resume functionality)
        if (row.owner_name) {
           continue; 
        }

        // Add to processing UI
        setCurrentProcessingIds(prev => [...prev, row.id]);

        try {
          const result = await findBusinessOwner(row);
          
          // Update data atomically
          setData(prevData => {
            const newData = [...prevData];
            const rowIndex = newData.findIndex(r => r.id === row.id);
            if (rowIndex !== -1) {
                newData[rowIndex] = {
                    ...newData[rowIndex],
                    owner_name: result.name,
                    source: result.source,
                    confidence: result.confidence
                };
            }
            return newData;
          });
          
          setCompletedCount(prev => prev + 1);

        } catch (error) {
           console.error(`Error processing row ${index}`, error);
        } finally {
           setCurrentProcessingIds(prev => prev.filter(id => id !== row.id));
        }

        // Small random delay to be nice to API rate limits
        await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
      }
    };

    // Start workers
    const workers = Array(CONCURRENCY_LIMIT).fill(null).map((_, i) => worker(i));
    await Promise.all(workers);

    setStatus(prev => prev === AppStatus.PAUSED ? AppStatus.PAUSED : AppStatus.COMPLETED);
    setCurrentProcessingIds([]);
  };

  const handlePause = () => {
    isPausedRef.current = true;
    setStatus(AppStatus.PAUSED);
  };

  const handleResume = () => {
    isPausedRef.current = false;
    setStatus(AppStatus.PROCESSING);
    // processRows logic is still running in the background loops, it will pick up due to the while loop
  };

  const handleStop = () => {
    shouldStopRef.current = true;
    setCurrentProcessingIds([]);
    setStatus(AppStatus.COMPLETED); // Or IDLE depending on preference, COMPLETED allows download
  };

  const handleDownload = () => {
    const csvContent = generateCSV(data);
    downloadCSV(csvContent, 'businesses_with_owners.csv');
  };

  const handleReset = () => {
    shouldStopRef.current = true; // Ensure any running loops stop
    setData([]);
    setStatus(AppStatus.IDLE);
    setCompletedCount(0);
    setCurrentProcessingIds([]);
  };

  const progress = data.length > 0 ? (completedCount / data.length) * 100 : 0;

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 flex flex-col p-4 md:p-6 max-w-7xl mx-auto w-full gap-6 overflow-hidden">
        
        {/* Top: Upload Section */}
        {data.length === 0 && (
          <div className="flex-none animate-in fade-in slide-in-from-top-4 duration-500">
            <Dropzone onFileAccepted={handleFileAccepted} isLoading={status === AppStatus.PROCESSING} />
          </div>
        )}

        {/* Middle: Table Preview */}
        {data.length > 0 && (
           <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-500">
              <div className="mb-2 flex justify-between items-end">
                  <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Businesses ({data.length} rows)
                  </h2>
                  {status === AppStatus.IDLE && (
                      <button onClick={handleReset} className="text-xs text-red-500 hover:underline">
                          Remove File
                      </button>
                  )}
              </div>
              <DataTable data={data} currentProcessingIds={currentProcessingIds} />
           </div>
        )}
      </main>

      {/* Bottom: Controls */}
      <ProcessControls 
        status={status}
        progress={progress}
        totalRows={data.length}
        hasData={data.length > 0}
        onStart={processRows}
        onPause={handlePause}
        onResume={handleResume}
        onStop={handleStop}
        onDownload={handleDownload}
        onReset={handleReset}
      />
    </div>
  );
};

export default App;