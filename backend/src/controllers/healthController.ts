import { Request, Response } from 'express';

export const getRoot = (req: Request, res: Response) => {
  res.send("Arkom API is running!");
};

export const getHealth = (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
};