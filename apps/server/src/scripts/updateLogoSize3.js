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

// Exclude login and register — handled separately with dark background filter
const excludeFiles = ['login', 'register'];

const files = getFiles(srcDir).filter(f => !excludeFiles.some(e => f.includes(`\\${e}\\`) || f.includes(`/${e}/`)));
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Increase maxHeight from 80 to 120 on all light-background pages
  content = content.replace(
    /style=\{\{\s*height:\s*'auto',\s*maxHeight:\s*80,\s*width:\s*'auto',\s*maxWidth:\s*'100%',\s*objectFit:\s*'contain'\s*\}\}/g,
    "style={{ height: 'auto', maxHeight: 120, width: 'auto', maxWidth: '100%', objectFit: 'contain' }}"
  );

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    count++;
  }
});

console.log('Increased logo to 120px in ' + count + ' light-background files.');
