/**
 * Checks if a filename matches the query string.
 * @param {string} name - The filename to check.
 * @param {string} query - The search query.
 * @param {boolean} isRegex - Whether to treat the query as a regular expression.
 * @return {boolean} True if matches, false otherwise.
 */
export const checkMatch = (name: string, query: string, isRegex: boolean): boolean => {
  if (!query) return true;
  if (isRegex) {
    try {
      return new RegExp(query, 'i').test(name);
    } catch {
      // Fallback to simple includes if regex is invalid
      return name.toLowerCase().includes(query.toLowerCase());
    }
  } else {
    // Exact match (case sensitive per requirements for folders/right pane)
    // "Right pane active: Search filters folders (exact match, case-sensitive)"
    // Or we could make it strict or startsWith. Implementing strict equality as per previous logic.
    return name === query;
  }
};
