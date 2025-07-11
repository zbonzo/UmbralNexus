/**
 * Input sanitization utilities to prevent XSS and other injection attacks.
 * These functions should be used on all user-provided input before processing.
 */

/**
 * Sanitizes a string to prevent XSS attacks by removing/escaping dangerous content.
 * 
 * Removes:
 * - Script tags and their content
 * - HTML tags
 * - JavaScript event handlers
 * - Dangerous characters like <, >, ", '
 * 
 * @param input - Raw user input string
 * @param options - Sanitization options
 * @returns Sanitized string safe for display and storage
 * 
 * @example
 * ```ts
 * const userInput = '<script>alert("xss")</script>Hello';
 * const safe = sanitizeString(userInput);
 * // Result: "Hello"
 * ```
 */
export function sanitizeString(
  input: string, 
  options: {
    /** Maximum length to truncate to */
    maxLength?: number;
    /** Whether to allow basic formatting (bold, italic) */
    allowBasicFormatting?: boolean;
  } = {}
): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // Remove script tags and their content (case-insensitive)
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
  
  // Remove JavaScript event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  if (!options.allowBasicFormatting) {
    // Remove all HTML tags
    sanitized = sanitized.replace(/<[^>]+>/g, '');
  } else {
    // Only allow safe formatting tags (b, i, em, strong)
    sanitized = sanitized.replace(/<(?!\/?(?:b|i|em|strong)\b)[^>]*>/gi, '');
  }
  
  // Escape remaining dangerous characters
  sanitized = sanitized
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/["']/g, '') // Remove quotes
    .replace(/&(?!#?\w+;)/g, '&amp;'); // Escape unescaped ampersands
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Apply length limit if specified
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }
  
  return sanitized;
}

/**
 * Sanitizes a player name according to game rules.
 * 
 * @param name - Raw player name input
 * @returns Sanitized player name (max 20 chars, no HTML/scripts)
 */
export function sanitizePlayerName(name: string): string {
  return sanitizeString(name, { 
    maxLength: 20,
    allowBasicFormatting: false 
  });
}

/**
 * Sanitizes a game name according to game rules.
 * 
 * @param name - Raw game name input
 * @returns Sanitized game name (max 50 chars, no HTML/scripts)
 */
export function sanitizeGameName(name: string): string {
  return sanitizeString(name, { 
    maxLength: 50,
    allowBasicFormatting: false 
  });
}

/**
 * Sanitizes a chat message, allowing basic formatting but preventing XSS.
 * 
 * @param message - Raw chat message
 * @returns Sanitized message (max 200 chars, basic formatting allowed)
 */
export function sanitizeChatMessage(message: string): string {
  return sanitizeString(message, { 
    maxLength: 200,
    allowBasicFormatting: true 
  });
}

/**
 * Validates and sanitizes a game ID.
 * Game IDs should be exactly 6 characters, alphanumeric only.
 * 
 * @param gameId - Raw game ID input
 * @returns Sanitized game ID or null if invalid
 */
export function sanitizeGameId(gameId: string): string | null {
  if (!gameId || typeof gameId !== 'string') {
    return null;
  }
  
  // Remove any non-alphanumeric characters
  const cleaned = gameId.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  
  // Must be exactly 6 characters
  if (cleaned.length !== 6) {
    return null;
  }
  
  return cleaned;
}

/**
 * Validates if a string contains only safe characters for user input.
 * Used as a pre-check before more expensive sanitization.
 * 
 * @param input - String to validate
 * @returns True if string appears safe (no obvious XSS attempts)
 */
export function isStringSafe(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }
  
  // Check for obvious XSS patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /vbscript:/i,
    /data:/i
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(input));
}

/**
 * Rate limiting helper - tracks request counts per identifier.
 * Used to prevent spam and DoS attacks.
 */
export class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();
  
  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}
  
  /**
   * Checks if a request is allowed under rate limiting rules.
   * 
   * @param identifier - Unique identifier (IP, user ID, etc.)
   * @returns True if request is allowed, false if rate limited
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);
    
    if (!record || now > record.resetTime) {
      // First request or window expired
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }
    
    if (record.count >= this.maxRequests) {
      return false; // Rate limited
    }
    
    record.count++;
    return true;
  }
  
  /**
   * Gets remaining requests in current window.
   * 
   * @param identifier - Unique identifier
   * @returns Number of requests remaining
   */
  getRemainingRequests(identifier: string): number {
    const record = this.requests.get(identifier);
    if (!record || Date.now() > record.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - record.count);
  }
  
  /**
   * Manually reset rate limit for an identifier.
   * 
   * @param identifier - Identifier to reset
   */
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
  
  /**
   * Clean up expired entries to prevent memory leaks.
   * Should be called periodically.
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}