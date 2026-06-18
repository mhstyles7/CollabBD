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
  
  // Update the logo style to include mixBlendMode: 'multiply' to blend white backgrounds
  content = content.replace(
    /style=\{\{\s*height:\s*'auto',\s*maxHeight:\s*48,\s*width:\s*'auto',\s*maxWidth:\s*'100%',\s*objectFit:\s*'contain'\s*\}\}/g,
    "style={{ height: 'auto', maxHeight: 48, width: 'auto', maxWidth: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }}"
  );

  // Remove the text span next to the logo
  // Pattern 1: <span style={{...}}>Collab<span style={{...}}>BD</span></span>
  // We'll look for: <img src="/logo_web.png" ... /> followed by whitespace and a span containing "Collab<span...BD</span>"
  content = content.replace(
    /(<img src="\/logo_web\.png"[^>]*\/>)\s*<span[^>]*>\s*Collab\s*<span[^>]*>BD<\/span>\s*<\/span>/g,
    "$1"
  );
  
  // Sometimes it's just Collab<span...>BD</span> without an outer span wrapper in some places, or with classNames
  // Pattern 2: <img ... />\s*Collab<span className="gradient-text">BD</span>
  content = content.replace(
    /(<img src="\/logo_web\.png"[^>]*\/>)\s*Collab\s*<span[^>]*>BD<\/span>/g,
    "$1"
  );
  
  // In footer (page.tsx), it might be inside a div or something else
  content = content.replace(
    /(<img src="\/logo_web\.png"[^>]*\/>)\s*<span[^>]*>\s*Collab\s*<span[^>]*>BD<\/span>\s*<\/span>/g,
    "$1"
  );

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    count++;
  }
});

console.log('Processed logo text and style in ' + count + ' files.');
