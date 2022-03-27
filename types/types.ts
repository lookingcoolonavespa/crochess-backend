import { Request, Response, NextFunction } from 'express';

export type Board = Map<string, Record<string, unknown>>;

export type MiddleWare = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;
