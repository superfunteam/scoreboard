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
  
  // Create an index.html in the project root that redirects to the static build
  console.log('Creating redirect index.html...');
  const redirectHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="refresh" content="0;url=dist/public/index.html">
  </head>
  <body>
    Redirecting to the static build...
  </body>
</html>`;
  
  fs.writeFileSync('index.html', redirectHtml);
  
  console.log('Static build complete!');
  console.log('You can now deploy the "dist/public" directory to any static hosting provider.');
  console.log('For local viewing, open index.html in your browser.');
});