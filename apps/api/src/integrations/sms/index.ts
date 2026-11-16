/**
 * SMS delivery behind one interface, so a real provider (e.g. MSG91 or Twilio, after TRAI DLT
 * registration) can be added without touching the authentication logic.
 *
 * - "console": DEVELOPMENT ONLY — writes the code to the server log. Refused in production by the
 *   configuration check, and refuses to send outside NODE_ENV=development as a second guard.
 * - "none": no sender; phone sign-in answers 503 OTP_UNAVAILABLE.
 * Tests inject their own sender through createApp({ smsSender }).
 */
import type { AppConfig } from '../../config/env.ts';
import type { Logger } from '../../config/logger.ts';

export type OtpMessage = {
  /** E.164 phone number. */
  to: string;
  code: string;
  purpose: 'REGISTRATION' | 'LOGIN';
  language: 'en' | 'kn' | 'hi';
  expiresInMinutes: number;
};

export interface SmsSender {
  readonly name: string;
  sendOtp(message: OtpMessage): Promise<void>;
}

/** Message text. Kannada/Hindi are DRAFT translations; real providers need DLT-approved templates. */
export function otpText(m: OtpMessage): string {
  const texts = {
    en: `${m.code} is your KrishiSutra code. It expires in ${m.expiresInMinutes} minutes. Do not share it with anyone.`,
    kn: `${m.code} ನಿಮ್ಮ ಕೃಷಿಸೂತ್ರ ಕೋಡ್. ಇದು ${m.expiresInMinutes} ನಿಮಿಷಗಳಲ್ಲಿ ಅವಧಿ ಮೀರುತ್ತದೆ. ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ.`,
    hi: `${m.code} आपका कृषिसूत्र कोड है। यह ${m.expiresInMinutes} मिनट में समाप्त हो जाएगा। इसे किसी के साथ साझा न करें।`,
  };
  return texts[m.language];
}

export class ConsoleSmsSender implements SmsSender {
  readonly name = 'console';
  constructor(
    private readonly logger: Logger,
    private readonly nodeEnv: AppConfig['nodeEnv'],
  ) {}
  async sendOtp(m: OtpMessage): Promise<void> {
    if (this.nodeEnv !== 'development') throw new Error('The console SMS sender only works in development.');
    // Development only: the code is printed so a developer can sign in without a real SMS.
    this.logger.warn({ devSms: { to: m.to, purpose: m.purpose, text: otpText(m) } }, 'DEVELOPMENT SMS (not sent)');
  }
}

/** Returns the configured sender, or null when phone sign-in is disabled. */
export function createSmsSender(config: AppConfig, logger: Logger): SmsSender | null {
  if (config.auth.smsProvider === 'console' && config.nodeEnv === 'development') return new ConsoleSmsSender(logger, config.nodeEnv);
  return null;
}
