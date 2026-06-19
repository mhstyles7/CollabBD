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

const allFiles = getFiles(srcDir);

// Dark panels: login and register LEFT PANEL logo — use .logo-dark-wrap + .logo-dark
const darkFiles = allFiles.filter(f => f.includes('\\login\\') || f.includes('\\register\\'));
// Light pages: everything else
const lightFiles = allFiles.filter(f => !darkFiles.includes(f));

let totalCount = 0;

// ── 1. Fix DARK panel logos ──
darkFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace any existing logo img tag in the link with proper dark version
  // Match: <Link href="/" style={{ display: 'inline-flex', alignItems: 'center' }}>
  //          <img ... logo_web.png ... />
  //        </Link>
  content = content.replace(
    /<Link href="\/" style=\{\{[^}]*\}\}>\s*<img\s+src="\/logo_web\.png"[^>]*\/>\s*<\/Link>/gs,
    `<Link href="/" className="logo-dark-wrap">\n              <img src="/logo_web.png" alt="CollabBD" className="logo-dark" />\n            </Link>`
  );

  if (content !== original) {
    fs.writeFileSync(file, content);
    totalCount++;
    console.log('Updated DARK logo in:', path.basename(path.dirname(file)));
  }
});

// ── 2. Fix LIGHT page logos ──
lightFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Match the logo img tag with any inline style that includes maxHeight
  content = content.replace(
    /<img\s+src="\/logo_web\.png"\s+alt="CollabBD"\s+style=\{\{[^}]*\}\}\s*\/>/g,
    `<img src="/logo_web.png" alt="CollabBD" className="logo-light" />`
  );

  if (content !== original) {
    fs.writeFileSync(file, content);
    totalCount++;
    console.log('Updated LIGHT logo in:', path.basename(path.dirname(file)), '/', path.basename(file));
  }
});

console.log(`\nDone! Updated logo styling in ${totalCount} files.`);
