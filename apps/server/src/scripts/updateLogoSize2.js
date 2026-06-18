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
  
  content = content.replace(
    /style=\{\{\s*height:\s*'auto',\s*maxHeight:\s*64,\s*width:\s*'auto',\s*maxWidth:\s*'100%',\s*objectFit:\s*'contain'\s*\}\}/g,
    "style={{ height: 'auto', maxHeight: 80, width: 'auto', maxWidth: '100%', objectFit: 'contain' }}"
  );

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    count++;
  }
});

console.log('Updated logo size in ' + count + ' files.');
