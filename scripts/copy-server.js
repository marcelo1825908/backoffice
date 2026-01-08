const fs = require('fs');
const path = require('path');

// Copy server folder to build directory
const serverSrc = path.join(__dirname, '../server');
const serverDest = path.join(__dirname, '../build/server');

if (!fs.existsSync(serverSrc)) {
  console.error('❌ Server folder not found at:', serverSrc);
  process.exit(1);
}

// Function to copy directory recursively
const copyRecursiveSync = (src, dest, options = {}) => {
  const { exclude = [] } = options;
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    // Check if this directory should be excluded
    const relativePath = path.relative(serverSrc, src);
    if (exclude.some(pattern => relativePath.includes(pattern))) {
      return;
    }
    
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    fs.readdirSync(src).forEach(childItemName => {
      const childSrc = path.join(src, childItemName);
      const childDest = path.join(dest, childItemName);
      
      // Skip excluded items
      const childRelativePath = path.relative(serverSrc, childSrc);
      if (exclude.some(pattern => childRelativePath.includes(pattern))) {
        return;
      }
      
      copyRecursiveSync(childSrc, childDest, options);
    });
  } else {
    // Check if this file should be excluded
    const relativePath = path.relative(serverSrc, src);
    const ext = path.extname(src).toLowerCase();
    
    if (exclude.some(pattern => relativePath.includes(pattern)) || 
        ['.rar', '.zip', '.map'].includes(ext)) {
      return;
    }
    
    fs.copyFileSync(src, dest);
  }
};

// Exclude patterns
const excludePatterns = [
  'node_modules',
  'uploads',
  '.git',
  '.env',
  '*.rar',
  '*.zip',
  '*.log'
];

console.log('📦 Copying server files to build directory...');
copyRecursiveSync(serverSrc, serverDest, { exclude: excludePatterns });
console.log('✅ Server files copied to build directory');

// Create uploads directory if it doesn't exist
const uploadsDest = path.join(serverDest, 'uploads');
if (!fs.existsSync(uploadsDest)) {
  fs.mkdirSync(uploadsDest, { recursive: true });
  console.log('✅ Created uploads directory');
}

// Install node_modules in build/server
const { execSync } = require('child_process');

console.log('📦 Installing server dependencies in build directory...');
try {
  execSync('npm install', {
    cwd: serverDest,
    stdio: 'inherit'
  });
  console.log('✅ Server dependencies installed in build directory');

  // Verify node_modules was created
  const nodeModulesPath = path.join(serverDest, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    console.log('✅ Verified: node_modules exists at', nodeModulesPath);

    // Check critical dependencies
    const criticalDeps = ['express', 'sql.js', 'cors', 'socket.io'];
    criticalDeps.forEach(dep => {
      const depPath = path.join(nodeModulesPath, dep);
      if (fs.existsSync(depPath)) {
        console.log(`   ✅ ${dep}`);
      } else {
        console.error(`   ❌ ${dep} - MISSING!`);
      }
    });

    // Check sql.js wasm file
    const wasmPath = path.join(nodeModulesPath, 'sql.js', 'dist', 'sql-wasm.wasm');
    if (fs.existsSync(wasmPath)) {
      console.log('✅ sql-wasm.wasm found');
    } else {
      console.error('❌ sql-wasm.wasm NOT FOUND at', wasmPath);
    }
  } else {
    console.error('❌ node_modules was NOT created!');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Failed to install server dependencies:', error.message);
  process.exit(1);
}

console.log('');
console.log('📋 Build Summary:');
console.log('   Server source:', serverSrc);
console.log('   Server dest:', serverDest);
console.log('   Server files: ✅ copied');
console.log('   Dependencies: ✅ installed');
console.log('');

