// Adds the authenticated identity to Express requests (set by middleware/auth.ts).
export {};

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string; credentialId: string };
    }
  }
}
