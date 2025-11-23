import { Request, Response, NextFunction } from 'express';

export const apiKeyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    res.status(401).json({ message: 'Требуется Api ключ' });
    return;
  }
  if (apiKey !== process.env.API_KEY) {
    res.status(401).json({ message: 'Неправильный ключ' });
    return;
  }
  next();
};
