/**
 * Path utility functions for cross-platform file path handling
 */

/**
 * Extract filename from a full path
 * Handles both Windows (\) and Unix (/) paths
 */
export function getFileName(path: string): string {
  if (!path) return ''
  const separator = path.includes('\\') ? '\\' : '/'
  return path.split(separator).pop() || path
}

/**
 * Get the parent directory of a path
 */
export function getParentDir(path: string): string {
  if (!path) return ''
  const separator = path.includes('\\') ? '\\' : '/'
  const parts = path.split(separator)
  parts.pop()
  return parts.join(separator) || separator
}

/**
 * Join path parts with the correct separator
 */
export function joinPath(...parts: string[]): string {
  // Simple join - in a real app, you might want more sophisticated logic
  return parts.filter(Boolean).join('/')
}

/**
 * Check if a path is absolute
 */
export function isAbsolutePath(path: string): boolean {
  if (!path) return false
  // Unix absolute path
  if (path.startsWith('/')) return true
  // Windows absolute path (e.g., C:\ or C:/)
  return /^[a-zA-Z]:[\\/]/.test(path)
}
