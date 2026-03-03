import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const indexFile = path.join(distDir, 'index.html');
const notFoundFile = path.join(distDir, '404.html');

try {
  if (fs.existsSync(indexFile)) {
    fs.copyFileSync(indexFile, notFoundFile);
    console.log('✅ Successfully copied index.html to 404.html for SPA routing.');
  } else {
    console.warn('⚠️  Warning: index.html not found in dist/. Build might have failed.');
    process.exit(1);
  }
} catch (err) {
  console.error('❌ Error copying 404.html:', err);
  process.exit(1);
}
