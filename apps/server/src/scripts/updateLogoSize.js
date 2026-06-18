const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../../../../apps/web/src/app');

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else if (name.endsWith('.tsx')) {
      files.push(name);
    }
  }
  return files;
}

const files = getFiles(srcDir);
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Replace the old style that had maxHeight 48 and mixBlendMode: 'multiply'
  // with a larger maxHeight and no mixBlendMode.
  content = content.replace(
    /style=\{\{\s*height:\s*'auto',\s*maxHeight:\s*48,\s*width:\s*'auto',\s*maxWidth:\s*'100%',\s*objectFit:\s*'contain',\s*mixBlendMode:\s*'multiply'\s*\}\}/g,
    "style={{ height: 'auto', maxHeight: 64, width: 'auto', maxWidth: '100%', objectFit: 'contain' }}"
  );

  // In case there are some that didn't have mixBlendMode or had a different match
  content = content.replace(
    /style=\{\{\s*height:\s*'auto',\s*maxHeight:\s*48,\s*width:\s*'auto',\s*maxWidth:\s*'100%',\s*objectFit:\s*'contain'\s*\}\}/g,
    "style={{ height: 'auto', maxHeight: 64, width: 'auto', maxWidth: '100%', objectFit: 'contain' }}"
  );

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    count++;
  }
});

console.log('Updated logo size and removed mixBlendMode in ' + count + ' files.');
