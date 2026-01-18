/**
 * Checks if a filename matches the query string.
 * Supports multi-file search by splitting the query by commas (OR condition).
 * @param {string} name - The filename to check.
 * @param {string} query - The search query.
 * @param {boolean} isRegex - Whether to treat the query as a regular expression.
 * @return {boolean} True if matches, false otherwise.
 */
export const checkMatch = (name: string, query: string, isRegex: boolean): boolean => {
  if (!query) return true;

  // Helper function for single query match
  const checkSingle = (targetName: string, singleQuery: string, useRegex: boolean): boolean => {
    if (!singleQuery) return true; // Or false? If part of OR is empty, ignore it? 
    // Actually if query was "A,,B", split gives ["A", "", "B"]. We should filter empty in the main logic.
    
    if (useRegex) {
      try {
        return new RegExp(singleQuery, 'i').test(targetName);
      } catch {
        // Fallback to simple includes if regex is invalid
        return targetName.toLowerCase().includes(singleQuery.toLowerCase());
      }
    } else {
      // Exact match (case sensitive per requirements for folders/right pane)
      // "Right pane active: Search filters folders (exact match, case-sensitive)"
      return targetName === singleQuery;
    }
  };

  // Split query by comma to support multi-value search (OR logic)
  const parts = query.split(',').map(part => part.trim()).filter(part => part.length > 0);
  
  if (parts.length === 0) return true; // Query was just commas or spaces? Treat as empty -> match all? Or match none?
  // Original logic: if (!query) return true. If query is "   ", it returns true.
  // So if parts is empty, return true.

  // Return true if ANY part matches
  return parts.some(part => checkSingle(name, part, isRegex));
};
