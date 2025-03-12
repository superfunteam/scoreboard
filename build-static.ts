import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

// Build the static assets
console.log('Building static assets...');
exec('npx vite build', (error, stdout, stderr) => {
  if (error) {
    console.error(`Build error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  
  console.log('Static build complete!');
  console.log('You can deploy the "dist/public" directory to any static hosting provider like:');
  console.log('- GitHub Pages (upload the dist/public folder)');
  console.log('- Netlify (point to the dist/public directory)');
  console.log('- Vercel (configure the output directory as dist/public)');
});