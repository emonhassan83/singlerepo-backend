const fs = require('fs');
const path = require('path');

const moduleName = process.argv[2];

if (!moduleName) {
  console.error('❌ Please provide a module name.');
  process.exit(1);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const folderPath = path.join(
  process.cwd(),
  'src',
  'app',
  'modules',
  moduleName
);

const Cap = capitalize(moduleName);

const files = {
  [`${moduleName}.interface.ts`]: `export interface I${Cap} {\n  // define your types here\n}\n`,
  [`${moduleName}.helpers.ts`]: `// Shared DB operations and pure utility functions for ${moduleName} module\n`,
  [`${moduleName}.controllers.ts`]: '',
  [`${moduleName}.services.ts`]: '',
  [`${moduleName}.middlewares.ts`]: '',
  [`${moduleName}.routes.ts`]: '',
  [`${moduleName}.validation.ts`]: '',
};

if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
  console.log(`📁 Created folder: ${moduleName}`);
} else {
  console.log(`📁 Folder already exists: ${moduleName}`);
}

Object.entries(files).forEach(([fileName, content]) => {
  const filePath = path.join(folderPath, fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, { flag: 'w' });
    console.log(`📄 Created file: ${fileName}`);
  } else {
    console.log(`⚠️  File already exists: ${fileName}`);
  }
});

console.log(`✅ Module '${moduleName}' setup complete.`);
