const fs = require('fs');
const path = require('path');

// Copy electron folder to build directory
const electronSrc = path.join(__dirname, '../electron');
const electronDest = path.join(__dirname, '../build/electron');

if (!fs.existsSync(electronDest)) {
  fs.mkdirSync(electronDest, { recursive: true });
}

// Copy all files from electron folder
const copyRecursiveSync = (src, dest) => {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
};

copyRecursiveSync(electronSrc, electronDest);
console.log('✅ Electron files copied to build directory');

