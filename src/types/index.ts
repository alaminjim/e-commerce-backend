type SuccessResponse<T> = {
  success: true;
  statusCode: number;
  message: string;
  data: T;
};

type ErrorResponse = {
  success: false;
  statusCode: number;
  message: string;
  data: null;
  stack?: string;
};

export type { ErrorResponse, SuccessResponse };
