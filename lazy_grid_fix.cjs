const fs = require('fs');
let code = fs.readFileSync('src/components/CategoryProductsView.tsx', 'utf-8');

if (!code.includes('useState')) {
  code = code.replace(/import React from "react";/, 'import React, { useState } from "react";');
  fs.writeFileSync('src/components/CategoryProductsView.tsx', code);
}
