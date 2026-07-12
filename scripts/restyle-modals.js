const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/components/modals/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace colors
  content = content.replace(/#364153/g, 'var(--color-accent)'); // Actually better to use Tailwind classes but they used hex directly in some places or bg-[#364153].
  // let's do it safely.
});
