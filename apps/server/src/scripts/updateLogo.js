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
  
  const newStyle = "style={{ height: 'auto', maxHeight: 48, width: 'auto', maxWidth: '100%', objectFit: 'contain' }}";
  
  let updated = content.replace(
    /style=\{\{\s*height:\s*\d+,\s*width:\s*'auto'\s*\}\}/g,
    newStyle
  );

  if (updated !== content) {
    fs.writeFileSync(file, updated);
    count++;
  }
});

console.log('Updated logo in ' + count + ' files.');
