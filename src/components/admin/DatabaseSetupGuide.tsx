import React from 'react';
import { Terminal, Database, ShieldAlert, Cpu } from 'lucide-react';
export const DatabaseSetupGuide = ({ dbErrorDetail }: { dbErrorDetail?: string | null }) => (
  <div className="bg-[#09090b] border border-amber-500/20 p-8 max-w-2xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ">
    <div className="flex items-center gap-4 mb-8">
      <div className="p-4 bg-amber-500/20">
        <Database className="w-8 h-8 text-amber-500" />
      </div>
      <div>
        <h2 className="text-2xl font-medium text-white tracking-tight">System Offline / Database Connectivity Issue</h2>
        <p className="text-muted-foreground text-sm mt-1">The application backend or database is currently unreachable.</p>
      </div>
    </div>
    
    {dbErrorDetail && (
      <div className="mb-8 p-4 bg-primary text-primary-foreground border border-[#00e676]/20">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-4 h-4 text-[#00e676]" />
          <h4 className="text-[#00e676] text-[10px] font-semibold uppercase tracking-widest">สถานะปัจจุบัน (Status):</h4>
        </div>
        <p className="text-muted-foreground text-xs font-mono break-all bg-black/40 backdrop-blur-sm p-3 border border-[#1e1e1e] border">{dbErrorDetail}</p>
      </div>
    )}
    
    <div className="space-y-4">
      <div className="bg-black/40 backdrop-blur-sm border border-[#1e1e1e] border p-6">
        <h3 className="text-white font-medium mb-2">Troubleshooting Steps</h3>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
          <li>Ensure the backend server is running correctly.</li>
          <li>If hosted on Vercel, check the Serverless Function logs for errors.</li>
        </ul>
        <div className="mt-6 flex justify-end">
          <button 
           onClick={() => window.location.reload()}
           className="px-6 py-2 bg-[#00e676] hover:bg-[#00e676] text-white text-sm font-medium transition"
          >
           Refresh Application
          </button>
        </div>
      </div>
    </div>
  </div>
);