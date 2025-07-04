/**
 * Database mock utilities for testing
 * Provides consistent mock response structures for Drizzle ORM db.execute() calls
 */

/**
 * Creates a complete mock database response with all required properties
 * @param rows - The data rows to return
 * @param options - Additional options for the mock response
 */
export function createMockDbResponse<T = Record<string, unknown>>(
  rows: T[],
  options: {
    command?: string;
    rowCount?: number;
    rowAsArray?: boolean;
    fields?: Record<string, unknown>[];
  } = {}
) {
  return {
    rows,
    fields: options.fields ?? [],
    command: options.command ?? "",
    rowCount: options.rowCount ?? rows.length,
    rowAsArray: options.rowAsArray ?? false,
  };
}

/**
 * Common mock responses for testing
 */
export const MockDbResponses = {
  /**
   * Single count response (e.g., for COUNT(*) queries)
   */
  count: (count: number) => createMockDbResponse([{ count }]),
  
  /**
   * Empty result set
   */
  empty: () => createMockDbResponse([]),
  
  /**
   * Single row response
   */
  single: <T>(data: T) => createMockDbResponse([data]),
  
  /**
   * Multiple rows response
   */
  multiple: <T>(data: T[]) => createMockDbResponse(data),
};
