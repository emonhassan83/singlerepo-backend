class ApiError extends Error {
  code: number;
  traceId?: string;
  constructor(code: number, message: string | undefined, traceId?: string, stack = '') {
    super(message);
    this.code = code;
    this.traceId = traceId;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
