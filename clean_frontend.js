const fs = require('fs');
let code = fs.readFileSync('frontend/src/App.jsx', 'utf-8');

// Remove ALL_MOCK_STORES array and getMockAddress
code = code.replace(/const ALL_MOCK_STORES = \[[\s\S]*?\];/g, '');
code = code.replace(/const getMockAddress = \([\s\S]*?return closest;\n\};/g, '');

// Remove Map quick-select buttons that map over ALL_MOCK_STORES
code = code.replace(/\{\[\.\.\.new Set\(ALL_MOCK_STORES[\s\S]*?<\/button>\s*\)\)\}/g, '');
// For the Store level
code = code.replace(/\{existingStores\.length > 0 && \([\s\S]*?\{existingStores\.map\(store => \([\s\S]*?<\/button>\s*\)\)\}/g, '');

// Save
fs.writeFileSync('frontend/src/App.jsx', code);
console.log("Cleaned frontend/src/App.jsx");
