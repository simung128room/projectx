const fs = require('fs');

let code = fs.readFileSync('src/components/CategoryProductsView.tsx', 'utf-8');

// Insert limit state
if (!code.includes('const [displayLimit, setDisplayLimit]')) {
  code = code.replace(
    /const filteredProducts = products\.filter\(\(p\) => p\.category === category\.name\);/,
    `const filteredProducts = products.filter((p) => p.category === category.name);
  const [displayLimit, setDisplayLimit] = useState(20);`
  );
  
  // also need to import useState if missing
  // assuming useState is already imported because of activeTab or similar, wait let's check
  // let's do safe replace
  code = code.replace(
    /\{filteredProducts\.map\(/,
    `{filteredProducts.slice(0, displayLimit).map(`
  );
  
  code = code.replace(
    /<\/div>\s*<\/div>\s*<\/div>\s*\)$/,
    `  {filteredProducts.length > displayLimit && (
          <div className="mt-12 flex justify-center pb-8">
            <button
              onClick={() => setDisplayLimit((prev) => prev + 20)}
              className="px-8 py-3 bg-[#1a1d24] hover:bg-[#2a2d35] text-white rounded-2xl font-bold transition-all shadow-md active:scale-95"
            >
              โหลดเพิ่มเติม
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
  );`
  );
  fs.writeFileSync('src/components/CategoryProductsView.tsx', code);
}
