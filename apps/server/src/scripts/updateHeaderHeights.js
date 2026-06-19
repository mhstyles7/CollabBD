const fs = require('fs');
const path = require('path');

function walk(d) {
  let list = fs.readdirSync(d);
  for (let f of list) {
    let p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.tsx')) {
      let c = fs.readFileSync(p, 'utf8');
      
      // Target the common navbar header heights
      let nc = c.replace(/height:\s*72\s*\}/g, 'height: 100 }')
                .replace(/height:\s*76\s*\}/g, 'height: 100 }')
                .replace(/height:\s*72\s*,/g, 'height: 100,')
                .replace(/height:\s*76\s*,/g, 'height: 100,');
                
      if (c !== nc) fs.writeFileSync(p, nc);
    }
  }
}
walk('apps/web/src/app');
console.log('Replaced header heights to 100px');
