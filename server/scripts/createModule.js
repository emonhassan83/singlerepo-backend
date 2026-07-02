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
  [`${moduleName}.constant.ts`]: `export const ${moduleName.toUpperCase()}_CONSTANT = {} as const;\n`,
  [`${moduleName}.interface.ts`]: `import { Model } from 'mongoose';\n\nexport interface I${Cap} {\n  // define your types here\n}\n\nexport type I${Cap}Model = Model<I${Cap}, Record<string, unknown>>;\n`,
  [`${moduleName}.model.ts`]: `import { Schema, model } from 'mongoose';\nimport { I${Cap}, I${Cap}Model } from './${moduleName}.interface';\n\nconst ${moduleName}Schema = new Schema<I${Cap}, I${Cap}Model>(\n  {\n    // Define your schema properties here\n  },\n  {\n    timestamps: true,\n  }\n);\n\nexport const ${Cap} = model<I${Cap}, I${Cap}Model>('${Cap}', ${moduleName}Schema);\n`,
  [`${moduleName}.helpers.ts`]: `// Shared DB operations and pure utility functions for ${moduleName} module\n`,
  [`${moduleName}.controllers.ts`]: `// Controllers for ${moduleName} module\n`,
  [`${moduleName}.services.ts`]: `// Services for ${moduleName} module\n`,
  [`${moduleName}.middlewares.ts`]: `// Middlewares for ${moduleName} module\n`,
  [`${moduleName}.routes.ts`]: `// Routes for ${moduleName} module\n`,
  [`${moduleName}.validation.ts`]: `// Validations for ${moduleName} module\n`,
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
