export class CustomError extends Error {
  public status: number = 500;

  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
  }
}

export class BadRequest extends CustomError {
  constructor(message?: string) {
    super(message || "Invalid email/password", 400);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message?: string) {
    super(message || "Unauthorized", 401);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message?: string) {
    super(message || "Forbidden", 403);
  }
}

export class NotFoundError extends CustomError {
  constructor(message?: string) {
    super(message || "NotFound", 404);
  }
}
