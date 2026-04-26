import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

let startIndex = content.indexOf('<AnimatePresence mode="wait">');
let endIndex = content.indexOf('// MAIN APP DASHBOARD');

if (startIndex !== -1 && endIndex !== -1) {
    let newAdminOverview = `
              <AnimatePresence mode="wait">
            {adminTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                 <div className="p-8 text-white text-center border border-white/5 rounded-3xl bg-zinc-900/10">
                     <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
                     <p className="text-zinc-500">Welcome to APEX STUDIO Admin overview</p>
                 </div>
              </motion.div>
            )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    );
  }

  `;

    content = content.substring(0, startIndex) + newAdminOverview + content.substring(endIndex);
    fs.writeFileSync('src/App.tsx', content);
    console.log("Fixed AnimatePresence area");
} else {
    console.log("Could not find start or end index");
}
