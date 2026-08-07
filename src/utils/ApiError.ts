class ApiError extends Error {
  statusCode: number;
  data: null;
  success: boolean;

  constructor(statusCode: number, message = "Something went wrong", stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
