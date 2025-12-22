/**
 * Decodes a JWT token without verifying the signature.
 * This is safe for reading claims on the client side since the server validates the token.
 * 
 * Note: Uses browser's native atob() for base64 decoding, which is supported in all modern browsers.
 * 
 * @param token - The JWT token string
 * @returns The decoded payload or null if invalid
 */
export function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    
    // Replace URL-safe characters and pad if necessary
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    
    // Decode base64 and parse JSON
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Extracts the email claim from a JWT token.
 * 
 * @param token - The JWT token string
 * @returns The email address or null if not found
 */
export function getEmailFromToken(token: string | null): string | null {
  if (!token) return null;
  
  const payload = decodeJwt(token);
  if (!payload) return null;
  
  // Try common email claim names
  // ASP.NET Core uses "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
  const email = 
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
    payload['email'];
  
  return typeof email === 'string' ? email : null;
}
