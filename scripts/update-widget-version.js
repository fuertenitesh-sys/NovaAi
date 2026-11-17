const fs = require('fs');
const path = require('path');

['public', '.'].forEach(dir => {
  const dirPath = path.resolve(__dirname, '..', dir);
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));
  files.forEach(f => {
    const p = path.join(dirPath, f);
    let content = fs.readFileSync(p, 'utf8');
    let changed = false;
    if (content.includes('nova-enhancements.css')) {
      content = content.replace(/nova-enhancements\.css(\?v=[^"']*)?/g, 'nova-enhancements.css?v=responsive-v12');
      changed = true;
    }
    if (changed) {
      fs.writeFileSync(p, content, 'utf8');
      console.log('Bumped CSS:', p);
    }
  });
});
