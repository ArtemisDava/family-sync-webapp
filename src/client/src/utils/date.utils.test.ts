import { describe, it, expect } from 'vitest';
import { formatDate } from './date.utils';

describe('date.utils', () => {
  describe('formatDate', () => {
    it('should format a date string correctly', () => {
      const dateString = '2024-03-15T10:30:00.000Z';
      const result = formatDate(dateString);
      expect(result).toBe('March 15, 2024');
    });

    it('should format a Date object correctly', () => {
      const date = new Date('2024-12-25T12:00:00.000Z');
      const result = formatDate(date);
      expect(result).toBe('December 25, 2024');
    });

    it('should handle invalid date strings gracefully', () => {
      const invalidDate = 'invalid-date';
      const result = formatDate(invalidDate);
      expect(result).toBe('invalid-date');
    });

    it('should handle empty strings', () => {
      const result = formatDate('');
      expect(result).toBe('Invalid date');
    });

    it('should format dates from different months', () => {
      const january = formatDate('2024-01-01T12:00:00.000Z');
      const june = formatDate('2024-06-15T12:00:00.000Z');
      const december = formatDate('2024-12-31T12:00:00.000Z');

      expect(january).toBe('January 1, 2024');
      expect(june).toBe('June 15, 2024');
      expect(december).toBe('December 31, 2024');
    });
  });
});
