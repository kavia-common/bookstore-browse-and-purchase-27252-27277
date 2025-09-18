const fs = require('fs');
const path = require('path');
// Load the swagger spec generated from JSDoc annotations in src/routes
const swaggerSpec = require('./swagger');

const outputDir = path.join(__dirname, 'interfaces');
const outputPath = path.join(outputDir, 'openapi.json');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write a deterministic, pretty-printed JSON file for downstream consumers (e.g., frontend codegen)
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
console.log(`OpenAPI spec generated at ${path.relative(process.cwd(), outputPath)}`);
