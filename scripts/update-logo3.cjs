const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `                </div>
              </button>
              {/* Invisible Backdrop overlay`;

const replace = `                </div>
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

// let's do a regex replace
const regex = /<\/div>\s*<\/button>\s*\{\/\* Invisible Backdrop overlay/g;

if (regex.test(content)) {
  content = content.replace(/<\/div>\s*<\/button>\s*\{\/\* Invisible Backdrop overlay/, `</div>
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
                <span className="font-bold text-[17px] tracking-tight font-display hidden sm:block pt-0.5">nxyshop</span>
              </div>

              {/* Invisible Backdrop overlay`);
  console.log('Regex replace succeeded!');
} else {
  console.log('Regex target not found');
}
fs.writeFileSync(file, content);
