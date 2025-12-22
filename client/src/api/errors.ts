// Types for ASP.NET Core Identity errors
export type IdentityError = {
  code: string;
  description: string;
};

// Types for structured error responses
export type ErrorResponse = {
  errors?: IdentityError[];
  title?: string;
  status?: number;
  detail?: string;
};

/**
 * Extracts a user-friendly error message from an HTTP response.
 * Handles various response formats including:
 * - ASP.NET Core Identity validation errors
 * - Simple text error messages
 * - Structured error responses
 */
export async function parseErrorResponse(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type");
  
  // Try to parse JSON responses
  if (contentType?.includes("application/json")) {
    try {
      const data = await response.json();
      
      // Handle ASP.NET Core Identity errors (array of {code, description})
      if (Array.isArray(data)) {
        const descriptions = data
          .map((err: IdentityError) => err.description)
          .filter(Boolean);
        if (descriptions.length > 0) {
          return descriptions.join(" ");
        }
      }
      
      // Handle ASP.NET Core ProblemDetails format
      if (data.title || data.detail) {
        return data.detail || data.title;
      }
      
      // Handle generic error object with message
      if (data.message) {
        return data.message;
      }
      
      // Handle errors property with Identity errors
      if (data.errors && Array.isArray(data.errors)) {
        const descriptions = data.errors
          .map((err: IdentityError) => err.description)
          .filter(Boolean);
        if (descriptions.length > 0) {
          return descriptions.join(" ");
        }
      }
      
      // If we got JSON but couldn't extract a message, stringify it
      return JSON.stringify(data);
    } catch {
      // Fall through to text parsing if JSON parsing fails
    }
  }
  
  // Try to parse as plain text
  try {
    const text = await response.text();
    if (text) {
      return text;
    }
  } catch {
    // If text parsing fails, fall through
  }
  
  // Fallback to generic error message based on status
  return getDefaultErrorMessage(response.status);
}

/**
 * Returns a generic error message based on HTTP status code
 */
function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return "Invalid request. Please check your input.";
    case 401:
      return "Authentication failed. Please check your credentials.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 409:
      return "This resource already exists.";
    case 500:
      return "An internal server error occurred. Please try again later.";
    default:
      return `Request failed with status ${status}.`;
  }
}
