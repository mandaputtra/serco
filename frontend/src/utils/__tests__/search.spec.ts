import { describe, it, expect } from 'vitest'
import { checkMatch } from '../search'

describe('checkMatch', () => {
  it('should return true if query is empty', () => {
    expect(checkMatch('file.txt', '', false)).toBe(true)
    expect(checkMatch('file.txt', '', true)).toBe(true)
  })

  describe('Regex Mode', () => {
    it('should match valid regex', () => {
      expect(checkMatch('image.jpg', '\\.jpg$', true)).toBe(true)
      expect(checkMatch('image.png', '\\.jpg$', true)).toBe(false)
      expect(checkMatch('report_2024.pdf', '^report', true)).toBe(true)
    })

    it('should be case insensitive for regex', () => {
      expect(checkMatch('IMAGE.JPG', '\\.jpg$', true)).toBe(true)
    })

    it('should fallback to includes if regex is invalid', () => {
      // '[' is an invalid regex
      expect(checkMatch('file[1].txt', '[', true)).toBe(true)
      expect(checkMatch('other.txt', '[', true)).toBe(false)
    })

    it('should support multi-file regex search (OR logic)', () => {
      expect(checkMatch('image.jpg', '\\.jpg$,\\.png$', true)).toBe(true)
      expect(checkMatch('image.png', '\\.jpg$,\\.png$', true)).toBe(true)
      expect(checkMatch('image.gif', '\\.jpg$,\\.png$', true)).toBe(false)
    })
  })

  describe('Exact/Normal Mode', () => {
    it('should match exact string', () => {
      expect(checkMatch('Documents', 'Documents', false)).toBe(true)
    })

    it('should fail if not exact match', () => {
      expect(checkMatch('MyDocuments', 'Documents', false)).toBe(false)
      expect(checkMatch('documents', 'Documents', false)).toBe(false) // Case sensitive per current logic
    })

    it('should support multi-file exact search (OR logic)', () => {
      expect(checkMatch('Documents', 'Documents,Photos', false)).toBe(true)
      expect(checkMatch('Photos', 'Documents,Photos', false)).toBe(true)
      expect(checkMatch('Music', 'Documents,Photos', false)).toBe(false)
    })

    it('should handle whitespace in multi-value query', () => {
      expect(checkMatch('Documents', 'Documents , Photos', false)).toBe(true)
      expect(checkMatch('Photos', ' Documents, Photos ', false)).toBe(true)
    })
  })
})
