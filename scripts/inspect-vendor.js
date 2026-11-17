const fs = require('fs');
const code = fs.readFileSync('public/assets/react-widget-uv.js', 'utf8');
console.log('Code length:', code.length);
const matches = code.match(/https?:\/\/[^\s"'<>]+/g) || [];
console.log('URLs:', [...new Set(matches)].slice(0, 30));

// Check what custom elements or text it has
const buttonTexts = code.match(/["'][^"']*(?:Talk|Maya|Riya|Call|Connect|Mic)[^"']*["']/gi) || [];
console.log('Possible button texts:', [...new Set(buttonTexts)].slice(0, 30));
