/**
 * Parse .json files and extract translation object
 */

export async function parseJsonFile(
  file: File,
): Promise<Record<string, unknown>> {
  try {
    const content = await file.text();
    const data = JSON.parse(content) as unknown;

    // Validate that it's an object
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      throw new Error(
        `Invalid JSON structure in ${file.name}. Expected an object.`,
      );
    }

    return data as Record<string, unknown>;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse ${file.name}: Invalid JSON syntax`);
    }
    throw error;
  }
}
