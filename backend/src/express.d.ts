import '@clerk/express';

declare global {
  namespace Express {
    interface Request {
      auth: {
        userId: string | null;
        sessionId: string | null;
      };
    }
  }
}