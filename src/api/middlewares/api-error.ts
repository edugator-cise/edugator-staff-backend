export default class APIError extends Error {
  status: number;
  stack: string;
  errors: string;
  //eslint-disable @typescript-eslint/explicit-module-boundary-types
  constructor({ message, status, stack, errors }) {
    super(message);
    this.message = message;
    this.status = status;
    this.stack = stack;
    this.errors = errors;
  }
}
