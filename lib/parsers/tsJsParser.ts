/**
 * Parse .ts and .js files and extract translation object
 * Uses @babel/parser to parse code into AST
 */

import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Convert AST object expression to plain JavaScript object
 */
function astObjectToPlainObject(node: any): Record<string, unknown> | null {
  if (node.type === 'ObjectExpression') {
    const result: Record<string, unknown> = {};

    for (const prop of node.properties) {
      if (prop.type === 'ObjectProperty') {
        // Get key name
        let key: string;
        if (prop.key.type === 'Identifier') {
          key = prop.key.name;
        } else if (prop.key.type === 'StringLiteral') {
          key = prop.key.value;
        } else {
          continue; // Skip unsupported key types
        }

        // Get value
        const value = astValueToPlainValue(prop.value);
        result[key] = value;
      }
    }

    return result;
  }

  return null;
}

/**
 * Convert AST value to plain JavaScript value
 */
function astValueToPlainValue(node: any): unknown {
  switch (node.type) {
    case 'StringLiteral':
      return node.value;

    case 'NumericLiteral':
      return node.value;

    case 'BooleanLiteral':
      return node.value;

    case 'NullLiteral':
      return null;

    case 'ObjectExpression':
      return astObjectToPlainObject(node);

    case 'ArrayExpression':
      return node.elements.map((el: any) =>
        el ? astValueToPlainValue(el) : null,
      );

    case 'TemplateLiteral':
      // Simple template literal without expressions
      if (node.expressions.length === 0) {
        return node.quasis[0]?.value.cooked || '';
      }
      return '[Template Literal]';

    default:
      // For unsupported types, return a placeholder
      return `[${node.type}]`;
  }
}

export async function parseTsJsFile(
  file: File,
): Promise<Record<string, unknown>> {
  try {
    const content = await file.text();
    const isTypeScript = file.name.endsWith('.ts');

    // Parse code into AST
    const ast = parse(content, {
      sourceType: 'module',
      plugins: isTypeScript ? ['typescript'] : ['jsx'],
    });

    let extractedObject: Record<string, unknown> | null = null;

    // Traverse AST to find variable declarations
    traverse(ast, {
      VariableDeclarator(path) {
        // Look for patterns like: const vi = { ... }
        if (path.node.init && path.node.init.type === 'ObjectExpression') {
          const obj = astObjectToPlainObject(path.node.init);
          if (obj && Object.keys(obj).length > 0) {
            extractedObject = obj;
            // Stop traversing after finding first valid object
            path.stop();
          }
        }
      },

      // Also support: export const vi = { ... }
      ExportNamedDeclaration(path) {
        if (
          path.node.declaration &&
          path.node.declaration.type === 'VariableDeclaration'
        ) {
          const declarations = path.node.declaration.declarations;
          for (const decl of declarations) {
            if (decl.init && decl.init.type === 'ObjectExpression') {
              const obj = astObjectToPlainObject(decl.init);
              if (obj && Object.keys(obj).length > 0) {
                extractedObject = obj;
                path.stop();
                return;
              }
            }
          }
        }
      },

      // Also support: export default { ... }
      ExportDefaultDeclaration(path) {
        if (path.node.declaration.type === 'ObjectExpression') {
          const obj = astObjectToPlainObject(path.node.declaration);
          if (obj && Object.keys(obj).length > 0) {
            extractedObject = obj;
            path.stop();
          }
        }
      },
    });

    if (!extractedObject) {
      throw new Error(
        `No translation object found in ${file.name}. Expected format: const variableName = { ... }`,
      );
    }

    return extractedObject;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse ${file.name}: Invalid syntax`);
    }
    throw error;
  }
}
