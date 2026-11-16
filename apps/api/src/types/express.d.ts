// Adds the authenticated identity to Express requests (set by middleware/auth.ts).
import type { AuthIdentity } from '../middleware/auth.ts';

declare global {
  namespace Express {
    interface Request {
      auth?: AuthIdentity;
    }
  }
}
