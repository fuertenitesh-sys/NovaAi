const fs = require('fs');
const path = require('path');

['public', '.'].forEach(dir => {
  const dirPath = path.resolve(__dirname, '..', dir);
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));
  files.forEach(f => {
    const p = path.join(dirPath, f);
    let content = fs.readFileSync(p, 'utf8');
    if (content.includes('nova-widget.js')) {
      content = content.replace(/nova-widget\.js(\?v=[^"']*)?/g, 'nova-widget.js?v=riya-voice-call-v4');
      fs.writeFileSync(p, content, 'utf8');
      console.log('Bumped widget:', p);
    }
  });
});
