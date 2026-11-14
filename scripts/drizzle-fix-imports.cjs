const fs = require('node:fs');
const p = './src/db/relations.ts';

fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace(/\.\/schema(?!\.js)/g, './schema.js'));
