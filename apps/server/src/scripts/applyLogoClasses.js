const fs = require('fs');
const path = require('path');

function walk(d) {
  let list = fs.readdirSync(d);
  for (let f of list) {
    let p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.tsx')) {
      let c = fs.readFileSync(p, 'utf8');
      let nc = c.replace(/style=\{\{\s*height:\s*'auto',\s*maxHeight:\s*120,\s*width:\s*'auto',\s*maxWidth:\s*'100%',\s*objectFit:\s*'contain'\s*\}\}/g, 'className="logo-light"');
      if (c !== nc) fs.writeFileSync(p, nc);
    }
  }
}
walk('apps/web/src/app');
console.log('Replaced inline styles with className="logo-light"');
