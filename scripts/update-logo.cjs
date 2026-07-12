const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace left side controls opening div
const oldLeftSide = `            {/* Left side controls (Hamburger Menu) */}
            <div className="flex-1 flex items-center z-[1001] relative">
              <button 
                className="text-muted-foreground hover:text-foreground transition-colors duration-300 outline-none select-none relative w-9 h-9 flex items-center justify-center cursor-pointer bg-card border border-border rounded-lg hover:border-ring"`;

const newLeftSide = `            {/* Left side controls (Hamburger Menu) */}
            <div className="flex-1 flex items-center z-[1001] relative gap-4">
              <button 
                className="text-muted-foreground hover:text-foreground transition-colors duration-300 outline-none select-none relative w-9 h-9 flex items-center justify-center cursor-pointer bg-card border border-border rounded-lg hover:border-ring shrink-0"`;

if (content.includes(oldLeftSide)) {
  content = content.replace(oldLeftSide, newLeftSide);
  console.log('Updated left side controls container');
}

// After button closing tag, add the logo
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

// Remove old centered logo
const oldLogoTarget = `            {/* Centered Logo with clean minimal border */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[1001]">
              <div 
                className="flex items-center cursor-pointer select-none group" 
                onClick={() => { setActiveView('home'); window.scrollTo(0,0); }}
              >
                <img 
                  src="https://img2.pic.in.th/IMG_7319.png" 
                  alt="nxyshop Logo" 
                  className="h-[40px] w-[40px] md:h-[44px] md:w-[44px] rounded-full object-cover border border-border transition-transform group-hover:scale-105" 
                />
              </div>
            </div>`;

if (content.includes(oldLogoTarget)) {
  content = content.replace(oldLogoTarget, '');
  console.log('Removed old centered logo');
}

// Update mobile menu logo
const oldMobileLogoTarget = `<img src="https://i.postimg.cc/3wDpxHPp/D7D8FA4A-524D-480E-9BF3-8451C296F760.png" alt="Logo" className="h-[28px] w-auto object-contain" />`;
const newMobileLogo = `<div className="flex items-center gap-2.5">
                    <img src="https://i.postimg.cc/J0rFVmMJ/file-00000000479471fab8f294ee09f67d3f.png" alt="Logo" className="h-[32px] w-[32px] rounded-full object-cover border border-border" />
                    <span className="font-bold text-lg tracking-tight font-display">nxyshop</span>
                  </div>`;

if (content.includes(oldMobileLogoTarget)) {
  content = content.replace(oldMobileLogoTarget, newMobileLogo);
  console.log('Updated mobile menu logo');
}

fs.writeFileSync(file, content);
