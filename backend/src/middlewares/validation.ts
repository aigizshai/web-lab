import { Request, Response, NextFunction } from 'express';

interface ValidationError {
  missingFields?: string[];
  invalidFields?: string[];
}

interface SyntaxErrorWithStatus extends SyntaxError {
  status?: number;
  body?: unknown;
}

export const validateRequest = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingFields: string[] = [];
    const invalidFields: string[] = [];

    requiredFields.forEach((field: string) => {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0 || invalidFields.length > 0) {
      const errors: ValidationError = {};

      if (missingFields.length) errors.missingFields = missingFields;
      if (invalidFields.length) errors.invalidFields = invalidFields;

      res.status(400).json({
        error: 'Некорректные данные',
        errors: errors,
      });
      return;
    }

    next();
  };
};

export const valid = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (
    err instanceof SyntaxError &&
    'status' in err &&
    (err as SyntaxErrorWithStatus).status === 400 &&
    'body' in err
  ) {
    res.status(400).json({
      error: 'Некорректный JSON',
      details: 'Проверьте тело запроса',
    });
    return;
  }
  next();
};
