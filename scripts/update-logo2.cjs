const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const buttonClosingTarget = `                </div>
              </button>
              {/* Invisible Backdrop overlay`;

const buttonClosingReplace = `                </div>
              </button>

              <div 
                className="flex items-center gap-2.5 cursor-pointer select-none group" 
                onClick={() => { setActiveView('home'); window.scrollTo(0,0); }}
              >
                <img 
                  src="https://i.postimg.cc/J0rFVmMJ/file-00000000479471fab8f294ee09f67d3f.png" 
                  alt="nxyshop Logo" 
                  className="h-[36px] w-[36px] md:h-[40px] md:w-[40px] rounded-full object-cover border border-border transition-transform group-hover:scale-105" 
                />
                <span className="font-bold text-lg tracking-tight font-display hidden sm:block">nxyshop</span>
              </div>

              {/* Invisible Backdrop overlay`;

if (content.includes(buttonClosingTarget)) {
  content = content.replace(buttonClosingTarget, buttonClosingReplace);
  console.log('Added new logo next to hamburger');
}
fs.writeFileSync(file, content);
