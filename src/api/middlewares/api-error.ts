export default class APIError extends Error {
  status: number
  stack: string
  errors: string
  constructor({
    message,
    status,
    stack,
    errors
  }) {
    super(message);
    this.status = status;
    this.message = message;
    this.stack = stack;
    this.errors = errors;
  }
}