/**
 * Flatten nested object into dot notation
 * Example: { error: { unknown: 'text' } } => { 'error.unknown': 'text' }
 */

export function flattenObject(
  obj: Record<string, unknown>,
  prefix = '',
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively flatten nested objects
      Object.assign(
        result,
        flattenObject(value as Record<string, unknown>, newKey),
      );
    } else {
      // Leaf node - add to result
      result[newKey] = String(value);
    }
  }

  return result;
}
