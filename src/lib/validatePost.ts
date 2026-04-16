export type ValidationError = 'whitespace-only' | 'too-short' | 'too-long';

export type ValidationResult =
  | { valid: true }
  | { valid: false; error: ValidationError; message: string };

export function validatePost(text: string): ValidationResult {
  const trimmedLength = text.trim().length;

  if (trimmedLength === 0) {
    return {
      valid: false,
      error: 'whitespace-only',
      message: 'Text cannot be empty or whitespace only.',
    };
  }

  if (trimmedLength < 10) {
    return {
      valid: false,
      error: 'too-short',
      message: 'Text must be between 10 and 300 characters.',
    };
  }

  if (trimmedLength > 300) {
    return {
      valid: false,
      error: 'too-long',
      message: 'Text must be between 10 and 300 characters.',
    };
  }

  return { valid: true };
}
