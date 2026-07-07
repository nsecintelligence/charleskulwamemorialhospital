/**
 * Security utilities for input validation, sanitization, and protection
 */

// HTML entity encoding map
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Sanitize HTML content while preserving safe formatting
 */
export function sanitizeHTML(input: string): string {
  if (typeof input !== 'string') return '';

  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, '');

  // Remove data: URLs (potential XSS vector)
  sanitized = sanitized.replace(/data:\s*text\/html/gi, '');

  return sanitized;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate phone number (allows international formats)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-()]{7,20}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate URL format
 */
export function isValidURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Validate password strength
 * Returns an object with validation results
 */
export function validatePassword(password: string): {
  valid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  errors: string[];
} {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Calculate strength
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isLongEnough = password.length >= 12;

  const strengthScore = [hasUppercase, hasLowercase, hasNumber, hasSpecial, isLongEnough].filter(Boolean).length;

  if (strengthScore >= 4) {
    strength = 'strong';
  } else if (strengthScore >= 3) {
    strength = 'medium';
  }

  return {
    valid: errors.length === 0,
    strength,
    errors,
  };
}

/**
 * Strip potentially dangerous characters from filenames
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string') return '';

  // Remove path traversal attempts
  let sanitized = filename.replace(/\.\./g, '');

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*]/g, '');

  // Limit length
  return sanitized.substring(0, 255);
}

/**
 * Validate and sanitize numeric input
 */
export function sanitizeNumber(value: string | number, min?: number, max?: number): number | null {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) return null;
  if (min !== undefined && num < min) return null;
  if (max !== undefined && num > max) return null;

  return num;
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Rate limiting tracker (client-side for UI feedback)
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  canProceed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Filter out old attempts
    const recentAttempts = attempts.filter((time) => now - time < this.windowMs);

    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

    return true;
  }

  recordAttempt(key: string): void {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    attempts.push(now);
    this.attempts.set(key, attempts);
  }

  getRemainingAttempts(key: string): number {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    const recentAttempts = attempts.filter((time) => now - time < this.windowMs);

    return Math.max(0, this.maxAttempts - recentAttempts.length);
  }

  getResetTime(key: string): number {
    const attempts = this.attempts.get(key) || [];
    if (attempts.length === 0) return 0;

    const oldestAttempt = Math.min(...attempts);
    return Math.max(0, oldestAttempt + this.windowMs - Date.now());
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

/**
 * Create a secure error message that doesn't expose internals
 */
export function createSecureError(error: unknown, fallbackMessage = 'An error occurred'): string {
  // In production, return generic message
  if (import.meta.env.PROD) {
    return fallbackMessage;
  }

  // In development, show more details
  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

/**
 * Check if a string contains potential SQL injection patterns
 */
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/i,
    /(--)/,
    /(;.*)(SELECT|INSERT|UPDATE|DELETE|DROP)/i,
    /(\bOR\b\s+\d+\s*=\s*\d+)/i,
    /(\bAND\b\s+\d+\s*=\s*\d+)/i,
    /('|")\s*(OR|AND)\s*('|")/i,
    /(EXEC\s*\()/i,
    /(EXECUTE\s*\()/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Validate text input for common patterns
 */
export function validateTextInput(
  input: string,
  options: {
    maxLength?: number;
    minLength?: number;
    required?: boolean;
    pattern?: RegExp;
  } = {}
): { valid: boolean; error?: string; sanitized: string } {
  const { maxLength = 1000, minLength = 0, required = false, pattern } = options;

  if (!input && required) {
    return { valid: false, error: 'This field is required', sanitized: '' };
  }

  if (input.length < minLength) {
    return { valid: false, error: `Minimum ${minLength} characters required`, sanitized: input };
  }

  if (input.length > maxLength) {
    return { valid: false, error: `Maximum ${maxLength} characters allowed`, sanitized: input.substring(0, maxLength) };
  }

  if (pattern && !pattern.test(input)) {
    return { valid: false, error: 'Invalid format', sanitized: input };
  }

  // Check for potential injection attacks
  if (detectSQLInjection(input)) {
    return { valid: false, error: 'Invalid characters detected', sanitized: sanitizeInput(input) };
  }

  return { valid: true, sanitized: sanitizeInput(input) };
}

/**
 * Generate CSRF token (for form submissions)
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Content type validation for file uploads
 */
const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

export function isValidFileType(file: File, type: 'image' | 'document'): boolean {
  const allowedTypes = ALLOWED_MIME_TYPES[type] || [];
  return allowedTypes.includes(file.type);
}

export function isAllowedFileSize(file: File, maxSizeMB: number = 5): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}
