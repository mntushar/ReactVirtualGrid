const fs = require('fs');
const path = require('path');

function copyFileSync(source, target) {
  let targetFile = target;

  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync(source, target) {
  let files = [];

  const targetFolder = path.join(target, path.basename(source));
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder);
  }

  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source);
    files.forEach(function (file) {
      const curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        copyFileSync(curSource, targetFolder);
      }
    });
  }
}

function copyAssets(sourceDir, destinationDir) {
  const srcDir = path.resolve(__dirname, sourceDir);
  const destDir = path.resolve(__dirname, destinationDir);

  try {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir);
    }
    copyFolderRecursiveSync(srcDir, destDir);
    console.log('Assets copied successfully!');
  } catch (err) {
    console.error('Error copying assets:', err);
  }
}

function copyFile(source, destination) {
    try {
      const srcPath = path.resolve(__dirname, source);
      const destPath = path.resolve(__dirname, destination);
  
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
  
      fs.copyFileSync(srcPath, destPath);
      console.log(`File copied successfully: ${source} -> ${destination}`);
    } catch (err) {
      console.error(`Error copying file: ${source} -> ${destination}`, err);
    }
  }

  copyFile('../src/virtual_grid.css', '../dist/virtual_grid.css');