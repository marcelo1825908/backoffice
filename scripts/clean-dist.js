const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist');

if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
  console.log('✅ Dist folder cleaned');
} else {
  console.log('ℹ️  Dist folder does not exist');
}

