const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { glob } = require('glob');

// Configuration
const EXTENSIONS = ['js', 'jsx', 'ts', 'tsx'];
const TARGET_DIRS = ['app', 'components', 'lib', 'src', 'hooks']; // Include hooks directory

async function analyzeFiles() {
  try {
    const files = await glob(`{${TARGET_DIRS.join(',')}}/**/*.{${EXTENSIONS.join(',')}}`);
    
    const summary = {
      components: [],
      hooks: [],
      layouts: [],
      libraries: new Set(),
      utilities: [],
      projectStructure: {}
    };

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const ast = parse(content, {
          sourceType: 'module',
          plugins: [
            'jsx',
            'typescript',
            'decorators-legacy' // If using decorators
          ]
        });

        // Extract imports
        traverse(ast, {
          ImportDeclaration(path) {
            path.node.specifiers.forEach(specifier => {
              summary.libraries.add(path.node.source.value);
            });
          }
        });

        // Extract components (default exports)
        traverse(ast, {
          ExportDefaultDeclaration(path) {
            if (path.node.declaration.type === 'Identifier') {
              summary.components.push({
                name: path.node.declaration.name,
                file: file,
                type: 'default export'
              });
            } else if (path.node.declaration.type === 'FunctionDeclaration') {
              summary.components.push({
                name: path.node.declaration.id.name,
                file: file,
                type: 'default export function'
              });
            }
          }
        });

        // Extract named components
        traverse(ast, {
          ExportNamedDeclaration(path) {
            if (path.node.declaration && 
                path.node.declaration.type === 'FunctionDeclaration') {
              summary.components.push({
                name: path.node.declaration.id.name,
                file: file,
                type: 'named export'
              });
            }
          }
        });

        // Extract custom hooks
        traverse(ast, {
          VariableDeclarator(path) {
            if (
              path.node.id &&
              path.node.id.type === "Identifier" &&
              path.node.id.name.startsWith('use') &&
              path.init?.type === 'ArrowFunctionExpression'
            ) {
              summary.hooks.push({
                name: path.node.id.name,
                file: file
              });
            }
          },
          FunctionDeclaration(path) {
            if (path.node.id?.name.startsWith('use')) {
              summary.hooks.push({
                name: path.node.id.name,
                file: file
              });
            }
          }
        });

        // Detect layouts based on file name
        if (file.includes('layout') || file.includes('Layout')) {
          summary.layouts.push({
            name: path.basename(file, path.extname(file)),
            file: file
          });
        }

        // Detect utility files
        if (file.includes('utils') || file.includes('lib')) {
          summary.utilities.push(path.basename(file));
        }

      } catch (error) {
        console.error(`Error processing file ${file}:`, error.message);
      }
    }

    // Convert Set to Array and filter out local imports
    summary.libraries = [...summary.libraries].filter(lib => 
      !lib.startsWith('.') && !lib.startsWith('@/') && !lib.startsWith('~/')
    );

    return summary;
  } catch (error) {
    console.error('Error in analyzeFiles:', error);
    throw error;
  }
}

// Generate and save summary
analyzeFiles()
  .then(summary => {
    fs.writeFileSync('project-summary.json', JSON.stringify(summary, null, 2));
    console.log('Project summary generated successfully!');
  })
  .catch(error => {
    console.error('Failed to generate summary:', error);
    process.exit(1);
  });