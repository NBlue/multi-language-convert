/**
 * Unflatten dot notation back to nested object
 * Example: { 'error.unknown': 'text' } => { error: { unknown: 'text' } }
 */

export function unflattenObject(
  flattened: Record<string, string>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(flattened)) {
    const keys = key.split('.');
    let current: any = result;

    try {
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];

        // Check if current[k] exists and is not an object
        if (current[k] !== undefined && typeof current[k] !== 'object') {
          throw new Error(
            `Key conflict: Cannot create nested path "${key}" because "${keys
              .slice(0, i + 1)
              .join('.')}" already exists as a value (not an object). ` +
              `This usually happens when you have both "a.b.c" and "a.b" as keys in your Excel.`,
          );
        }

        if (!current[k]) {
          current[k] = {};
        }

        // Check if it's actually an object
        if (typeof current[k] !== 'object' || current[k] === null) {
          throw new Error(
            `Key conflict: Path "${keys
              .slice(0, i + 1)
              .join(
                '.',
              )}" is not an object. Cannot set nested property for key "${key}".`,
          );
        }

        current = current[k];
      }

      // Set final value
      const finalKey = keys[keys.length - 1];

      // Check if final key already exists as an object (would conflict)
      if (
        current[finalKey] !== undefined &&
        typeof current[finalKey] === 'object'
      ) {
        throw new Error(
          `Key conflict: Cannot set "${key}" as a value because it already exists as an object with nested properties. ` +
            `Check if you have keys like both "${key}" and "${key}.something" in your Excel.`,
        );
      }

      current[finalKey] = value;
    } catch (error) {
      // Re-throw with more context
      if (error instanceof Error) {
        throw new Error(`Unflatten error for key "${key}": ${error.message}`);
      }
      throw error;
    }
  }

  return result;
}
