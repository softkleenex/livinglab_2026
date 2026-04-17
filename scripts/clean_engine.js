const fs = require('fs');
let code = fs.readFileSync('backend/app/core/engine.py', 'utf-8');
code = code.replace(/def seed_initial_data\([\s\S]*?seed_initial_data\(engine\)/g, '');
fs.writeFileSync('backend/app/core/engine.py', code);
console.log("Cleaned backend/app/core/engine.py");
