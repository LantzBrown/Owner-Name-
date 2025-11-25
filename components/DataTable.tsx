import React from 'react';
import { BusinessRow } from '../types';
import { User, CircleDashed, ExternalLink } from 'lucide-react';
import clsx from 'clsx';

interface DataTableProps {
  data: BusinessRow[];
  currentProcessingIds: string[];
}

const DataTable: React.FC<DataTableProps> = ({ data, currentProcessingIds }) => {
  if (data.length === 0) return null;

  return (
    <div className="flex-1 overflow-hidden flex flex-col border rounded-xl border-slate-200 bg-white shadow-sm">
      <div className="overflow-auto custom-scrollbar flex-1">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 sticky top-0 z-10 text-slate-500 font-medium shadow-sm">
            <tr>
              <th className="px-4 py-3 border-b border-slate-200 min-w-[180px] w-[15%] text-indigo-900 bg-indigo-50/50 font-semibold">Owner</th>
              <th className="px-4 py-3 border-b border-slate-200 min-w-[200px] w-[20%]">Name</th>
              <th className="px-4 py-3 border-b border-slate-200 min-w-[150px]">Profile</th>
              <th className="px-4 py-3 border-b border-slate-200 min-w-[150px]">Website</th>
              <th className="px-4 py-3 border-b border-slate-200">Phone</th>
              <th className="px-4 py-3 border-b border-slate-200 min-w-[150px]">Emails</th>
              <th className="px-4 py-3 border-b border-slate-200 min-w-[150px]">Source</th>
              <th className="px-4 py-3 border-b border-slate-200 w-[100px]">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => {
              const isProcessing = currentProcessingIds.includes(row.id);
              const hasResult = !!row.owner_name;
              
              return (
                <tr 
                  key={row.id} 
                  className={clsx(
                    "hover:bg-slate-50 transition-colors",
                    isProcessing && "bg-indigo-50/30"
                  )}
                >
                  {/* Owner Column */}
                  <td className="px-4 py-3 font-medium text-slate-900 border-r border-slate-100 bg-slate-50/30">
                    <div className="flex items-center gap-2">
                      {isProcessing ? (
                        <div className="flex items-center gap-2 text-indigo-600">
                          <CircleDashed size={14} className="animate-spin" />
                          <span className="text-xs">Finding...</span>
                        </div>
                      ) : hasResult ? (
                         row.owner_name === 'Not Found' ? (
                            <span className="text-slate-400 italic text-xs">Not Found</span>
                         ) : (
                            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                                <User size={14} />
                                <span>{row.owner_name}</span>
                            </div>
                         )
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-4 py-3 text-slate-700 truncate max-w-[200px]" title={row.business_name}>{row.business_name}</td>
                  
                  <td className="px-4 py-3 text-slate-500 truncate max-w-[150px]">
                     {row.google_my_business_url ? (
                        <a href={row.google_my_business_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-indigo-600 hover:underline">
                            Link <ExternalLink size={10} />
                        </a>
                     ) : '-'}
                  </td>

                  <td className="px-4 py-3 text-slate-500 truncate max-w-[150px]">
                    {row.website ? (
                        <a href={row.website.startsWith('http') ? row.website : `https://${row.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-indigo-600 hover:underline">
                            Link <ExternalLink size={10} />
                        </a>
                    ) : '-'}
                  </td>

                  <td className="px-4 py-3 text-slate-500">{row.phone_number || '-'}</td>
                  
                  <td className="px-4 py-3 text-slate-500 truncate max-w-[150px]" title={row.email}>
                    {row.email || '-'}
                  </td>

                  <td className="px-4 py-3 text-slate-500 truncate max-w-[200px] text-xs" title={row.source}>
                    {row.source || '-'}
                  </td>

                  <td className="px-4 py-3">
                    {row.confidence && (
                      <span className={clsx(
                        "text-xs px-2 py-0.5 rounded-full font-medium border",
                        row.confidence === 'High' && "bg-emerald-50 text-emerald-700 border-emerald-200",
                        row.confidence === 'Medium' && "bg-amber-50 text-amber-700 border-amber-200",
                        row.confidence === 'Low' && "bg-slate-100 text-slate-600 border-slate-200"
                      )}>
                        {row.confidence}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;