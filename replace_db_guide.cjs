const fs = require('fs');

let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const startStr = "const DatabaseSetupGuide = ({ dbErrorDetail }: { dbErrorDetail?: string | null }) => (";
const endStr = "import { AdminUserManagement } from './AdminUserManagement';";

let startIndex = content.indexOf(startStr);
let endIndex = content.indexOf(endStr);

if (startIndex > -1 && endIndex > -1) {
  let newComponent = `const DatabaseSetupGuide = ({ dbErrorDetail }: { dbErrorDetail?: string | null }) => (
  <div className="bg-zinc-900/50 border border-amber-500/20 rounded-2xl p-8 max-w-2xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500 backdrop-blur-xl shadow-xl">
    <div className="flex items-center gap-4 mb-8">
      <div className="p-4 bg-amber-500/20 rounded-2xl">
        <Database className="w-8 h-8 text-amber-500" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">System Offline / Database Connectivity Issue</h2>
        <p className="text-zinc-500 text-sm mt-1">The application backend or database is currently unreachable.</p>
      </div>
    </div>
    
    {dbErrorDetail && (
      <div className="mb-8 p-4 bg-red-600/10 border border-red-600/20 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-4 h-4 text-red-500" />
          <h4 className="text-red-500 text-[10px] font-black uppercase tracking-widest">สถานะปัจจุบัน (Status):</h4>
        </div>
        <p className="text-red-200/80 text-xs font-mono break-all bg-black/40 p-3 rounded-xl border border-white/5">{dbErrorDetail}</p>
      </div>
    )}
    
    <div className="space-y-4">
      <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-2">Troubleshooting Steps</h3>
        <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2">
          <li>Ensure the backend server is running correctly.</li>
          <li>If hosted on Vercel, check the Serverless Function logs for errors.</li>
        </ul>
        <div className="mt-6 flex justify-end">
          <button 
           onClick={() => window.location.reload()}
           className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition"
          >
           Refresh Application
          </button>
        </div>
      </div>
    </div>
  </div>
);

`;
  let finalContent = content.substring(0, startIndex) + newComponent + content.substring(endIndex);
  fs.writeFileSync('src/components/AdminDashboard.tsx', finalContent);
}
