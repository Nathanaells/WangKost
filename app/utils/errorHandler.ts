import { showErrorToast, showValidationErrors } from './toast';

// Client-side error classes that mirror server-side
export class CustomError extends Error {
  public status: number = 500;

  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message?: string) {
    super(message || "Unauthorized", 401);
  }
}

export class BadRequest extends CustomError {
  constructor(message?: string) {
    super(message || "Invalid email/password", 400);
  }
}

export class NotFoundError extends CustomError {
  constructor(message?: string) {
    super(message || "NotFound", 404);
  }
}

export class ValidationError extends CustomError {
  public errors: { [key: string]: string };

  constructor(errors: { [key: string]: string }) {
    super("Validation Error", 400);
    this.errors = errors;
  }
}

// Error response interface
interface IErrorResponse {
  message: string | string[];
  status: number;
}

// Client error handler that mirrors server-side customError
export function handleClientError(err: unknown): IErrorResponse {
  if (err instanceof ValidationError) {
    return {
      message: Object.values(err.errors),
      status: 400
    };
  } else if (err instanceof UnauthorizedError) {
    return {
      message: err.message,
      status: err.status
    };
  } else if (err instanceof CustomError) {
    return {
      message: err.message,
      status: err.status
    };
  } else if (err instanceof Error) {
    return {
      message: err.message,
      status: 500
    };
  } else {
    return {
      message: "Internal client Error",
      status: 500
    };
  }
}

// Form validation utility that throws consistent errors
export function validateFormFields(formData: any, validationRules: any): void {
  const errors: { [key: string]: string } = {};

  // Name validation
  if (validationRules.name && !formData.name?.trim()) {
    errors.name = 'Name wajib diisi';
  }

  // Email validation
  if (validationRules.email) {
    if (!formData.email?.trim()) {
      errors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }
  }

  // Password validation
  if (validationRules.password) {
    if (!formData.password) {
      errors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      errors.password = 'Password minimal 6 karakter';
    }
  }

  // Phone number validation
  if (validationRules.phoneNumber) {
    if (!formData.phoneNumber?.trim()) {
      errors.phoneNumber = 'No. HP wajib diisi';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Format nomor HP tidak valid';
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
}

// API error handler for fetch responses
export async function handleApiError(response: Response): Promise<never> {
  try {
    const errorData = await response.json();
    const message = Array.isArray(errorData.message) 
      ? errorData.message.join(', ') 
      : errorData.message || 'Terjadi kesalahan';

    switch (response.status) {
      case 400:
        throw new BadRequest(message);
      case 401:
        throw new UnauthorizedError(message);
      case 404:
        throw new NotFoundError(message);
      default:
        throw new CustomError(message, response.status);
    }
  } catch (parseError) {
    // If we can't parse the response, create a generic error
    throw new CustomError(
      `Server error: ${response.status} ${response.statusText}`,
      response.status
    );
  }
}

// Main error display function - mirrors server error handling
export function displayError(error: unknown): void {
  const errorResponse = handleClientError(error);
  
  if (error instanceof ValidationError) {
    // Show validation errors with icons like server validation
    showValidationErrors(error.errors);
  } else {
    // Show single error message
    const message = Array.isArray(errorResponse.message) 
      ? errorResponse.message.join(', ')
      : errorResponse.message;
    
    showErrorToast(message);
  }
}

// Utility for handling async operations with consistent error handling
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: unknown) => void
): Promise<void> {
  try {
    const result = await operation();
    if (onSuccess) {
      onSuccess(result);
    }
  } catch (error) {
    if (onError) {
      onError(error);
    } else {
      displayError(error);
    }
  }
}

// Export all error types
export {
  type IErrorResponse
};
