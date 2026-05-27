const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('c:/Users/emret/OneDrive/Masaüstü/expressAndReact/frontend/src', function(filePath) {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('<img ')) {
      // Avoid duplicating lazy if already there
      let newContent = content.replace(/<img (?!(?:[^>]*?\bloading=['"]lazy['"]))/g, '<img loading="lazy" decoding="async" ');
      if (newContent !== content) {
         fs.writeFileSync(filePath, newContent);
         console.log('Updated:', filePath);
      }
    }
  }
});
console.log('Finished image optimization.');
