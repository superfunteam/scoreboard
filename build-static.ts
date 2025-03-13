import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

// Ensure public directory exists with assets
const copyAssets = () => {
  console.log('Ensuring assets are available...');
  
  // Define source and destination paths
  const assetsPaths = [
    { 
      src: 'attached_assets/ZenDots-Regular.ttf', 
      dest: 'public/attached_assets/ZenDots-Regular.ttf' 
    },
    { 
      src: 'attached_assets/plus.mp3', 
      dest: 'public/attached_assets/plus.mp3' 
    },
    { 
      src: 'attached_assets/minus.mp3', 
      dest: 'public/attached_assets/minus.mp3' 
    }
  ];
  
  // Create directories if they don't exist
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
  }
  
  if (!fs.existsSync('public/attached_assets')) {
    fs.mkdirSync('public/attached_assets');
  }
  
  // Copy each asset
  assetsPaths.forEach(({ src, dest }) => {
    try {
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`Copied ${src} to ${dest}`);
      } else {
        console.warn(`Warning: Source file ${src} does not exist`);
      }
    } catch (err) {
      console.error(`Error copying ${src} to ${dest}:`, err);
    }
  });
};

// Run the asset copy process
copyAssets();

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