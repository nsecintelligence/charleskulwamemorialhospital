/**
 * Security logging utilities for tracking suspicious activity
 */

export type SecurityEventType =
  | 'LOGIN_FAILED'
  | 'LOGIN_SUCCESS'
  | 'LOGOUT'
  | 'CSRF_VIOLATION'
  | 'RATE_LIMIT_EXCEEDED'
  | 'SUSPICIOUS_REQUEST'
  | 'SQL_INJECTION_ATTEMPT'
  | 'XSS_ATTEMPT'
  | 'PATH_TRAVERSAL_ATTEMPT'
  | 'UNAUTHORIZED_ACCESS'
  | 'FORBIDDEN_ACCESS'
  | 'INVALID_INPUT'
  | 'FILE_UPLOAD_REJECTED'
  | 'PASSWORD_RESET_REQUESTED'
  | 'ACCOUNT_LOCKED'
  | 'SUSPICIOUS_USER_AGENT';

interface SecurityLogEntry {
  timestamp: string;
  type: SecurityEventType;
  ip?: string;
  userAgent: string;
  path: string;
  details: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// In-memory log for client-side (limited to last 100 entries)
const securityLogs: SecurityLogEntry[] = [];
const MAX_LOG_ENTRIES = 100;

/**
 * Log a security event
 */
export function logSecurityEvent(
  type: SecurityEventType,
  details: Record<string, unknown> = {},
  severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
): void {
  const entry: SecurityLogEntry = {
    timestamp: new Date().toISOString(),
    type,
    userAgent: navigator.userAgent,
    path: window.location.pathname,
    details,
    severity,
  };

  // Add to in-memory log
  securityLogs.unshift(entry);
  if (securityLogs.length > MAX_LOG_ENTRIES) {
    securityLogs.pop();
  }

  // Log to console in development
  if (import.meta.env.DEV) {
    console.warn(`[Security] ${type}:`, details);
  }

  // In production, send to logging endpoint (if implemented)
  if (import.meta.env.PROD && (severity === 'high' || severity === 'critical')) {
    // Could send to Supabase edge function for server-side logging
    sendToLoggingEndpoint(entry);
  }
}

/**
 * Send high-severity events to a logging endpoint
 */
async function sendToLoggingEndpoint(entry: SecurityLogEntry): Promise<void> {
  try {
    // This would ideally go to a Supabase edge function or similar
    // For now, we just log to console in development
    if (!import.meta.env.PROD) {
      console.error('[Security Alert]', entry);
    }
  } catch {
    // Silently fail to avoid leaking information
  }
}

/**
 * Get recent security logs (for admin monitoring)
 */
export function getSecurityLogs(limit: number = 50): SecurityLogEntry[] {
  return securityLogs.slice(0, limit);
}

/**
 * Clear security logs
 */
export function clearSecurityLogs(): void {
  securityLogs.length = 0;
}

/**
 * Log failed login attempt
 */
export function logFailedLogin(identifier: string, reason: string): void {
  logSecurityEvent(
    'LOGIN_FAILED',
    { identifier: maskSensitive(identifier), reason },
    'medium'
  );
}

/**
 * Log successful login
 */
export function logSuccessfulLogin(identifier: string): void {
  logSecurityEvent(
    'LOGIN_SUCCESS',
    { identifier: maskSensitive(identifier) },
    'low'
  );
}

/**
 * Log rate limit exceeded
 */
export function logRateLimitExceeded(endpoint: string): void {
  logSecurityEvent(
    'RATE_LIMIT_EXCEEDED',
    { endpoint },
    'high'
  );
}

/**
 * Log suspicious request
 */
export function logSuspiciousRequest(reason: string, details: Record<string, unknown> = {}): void {
  logSecurityEvent(
    'SUSPICIOUS_REQUEST',
    { reason, ...details },
    'high'
  );
}

/**
 * Log SQL injection attempt
 */
export function logSQLInjectionAttempt(input: string): void {
  logSecurityEvent(
    'SQL_INJECTION_ATTEMPT',
    { input: maskSensitive(input) },
    'critical'
  );
}

/**
 * Log XSS attempt
 */
export function logXSSAttempt(input: string): void {
  logSecurityEvent(
    'XSS_ATTEMPT',
    { input: maskSensitive(input) },
    'critical'
  );
}

/**
 * Log unauthorized access attempt
 */
export function logUnauthorizedAccess(resource: string): void {
  logSecurityEvent(
    'UNAUTHORIZED_ACCESS',
    { resource },
    'high'
  );
}

/**
 * Log invalid input
 */
export function logInvalidInput(field: string, value: string, reason: string): void {
  logSecurityEvent(
    'INVALID_INPUT',
    { field, value: maskSensitive(value), reason },
    'low'
  );
}

/**
 * Log file upload rejection
 */
export function logFileUploadRejection(filename: string, reason: string): void {
  logSecurityEvent(
    'FILE_UPLOAD_REJECTED',
    { filename: maskSensitive(filename), reason },
    'medium'
  );
}

/**
 * Detect suspicious user agent
 */
export function detectSuspiciousUserAgent(): void {
  const ua = navigator.userAgent.toLowerCase();

  const suspiciousPatterns = [
    'sqlmap',
    'nikto',
    'nmap',
    'masscan',
    'dirbuster',
    'gobuster',
    'burp',
    'zap',
    'metasploit',
    'curl/',
    'wget/',
    'python-requests',
    'go-http-client',
  ];

  const isSuspicious = suspiciousPatterns.some((pattern) => ua.includes(pattern));

  if (isSuspicious) {
    logSecurityEvent(
      'SUSPICIOUS_USER_AGENT',
      { userAgent: navigator.userAgent },
      'high'
    );
  }
}

/**
 * Mask sensitive information for logging
 */
function maskSensitive(value: string): string {
  if (value.length <= 4) return '****';

  // Show first 2 and last 2 characters
  return value.substring(0, 2) + '****' + value.substring(value.length - 2);
}

/**
 * Check for potential attacks in input
 */
export function analyzeInputSecurity(input: string): {
  hasSQLInjection: boolean;
  hasXSS: boolean;
  hasPathTraversal: boolean;
  riskLevel: 'low' | 'medium' | 'high';
} {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/i,
    /(--)/,
    /(;\s*)/,
    /('|")\s*(OR|AND)\s*('|")/i,
  ];

  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /on\w+\s*=/i,
    /javascript:/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];

  const pathTraversalPatterns = [
    /\.\.\//,
    /\.\.\\/,
    /%2e%2e%2f/i,
    /%2e%2e\//i,
  ];

  const hasSQLInjection = sqlPatterns.some((p) => p.test(input));
  const hasXSS = xssPatterns.some((p) => p.test(input));
  const hasPathTraversal = pathTraversalPatterns.some((p) => p.test(input));

  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  const risks = [hasSQLInjection, hasXSS, hasPathTraversal].filter(Boolean).length;

  if (risks >= 2) riskLevel = 'high';
  else if (risks === 1) riskLevel = 'medium';

  // Log if high risk
  if (hasSQLInjection) {
    logSQLInjectionAttempt(input);
  }
  if (hasXSS) {
    logXSSAttempt(input);
  }
  if (hasPathTraversal) {
    logSecurityEvent('PATH_TRAVERSAL_ATTEMPT', { input: maskSensitive(input) }, 'high');
  }

  return { hasSQLInjection, hasXSS, hasPathTraversal, riskLevel };
}

// Run user agent detection on load
if (typeof window !== 'undefined') {
  detectSuspiciousUserAgent();
}
