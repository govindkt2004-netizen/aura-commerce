import crypto from 'crypto';

interface OtpRecord {
  phone: string; // normalized E.164 (e.g. +919876543210)
  otpHash: string; // HMAC-SHA256 hash of the 6-digit code
  salt: string; // unique cryptographic salt
  createdAt: number;
  expiresAt: number; // 5 minutes validity
  attempts: number; // max 5 attempts allowed
  lastSentAt: number; // cooldown timestamp
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export class OtpManager {
  private static otpStore = new Map<string, OtpRecord>();
  private static phoneRateLimits = new Map<string, RateLimitRecord>();
  private static ipRateLimits = new Map<string, RateLimitRecord>();

  // Configuration constants
  public static readonly OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
  public static readonly RESEND_COOLDOWN_SECONDS = 45; // 45 seconds cooldown
  public static readonly MAX_VERIFICATION_ATTEMPTS = 5;
  public static readonly MAX_SENDS_PER_PHONE_HOUR = 5;
  public static readonly MAX_SENDS_PER_IP_15MIN = 10;

  /**
   * Hashes a 6-digit OTP with a salt using HMAC-SHA256
   */
  private static hashOtp(otp: string, salt: string): string {
    return crypto.createHmac('sha256', salt).update(otp).digest('hex');
  }

  /**
   * Generates a cryptographically secure 6-digit OTP
   * Uses crypto.randomInt which is backed by system CSPRNG
   */
  public static generateSecureOtp(): string {
    const num = crypto.randomInt(100000, 1000000);
    return num.toString();
  }

  /**
   * Validates rate limits for sending OTP by phone and IP
   */
  public static checkSendRateLimit(phone: string, ip: string): { allowed: boolean; error?: string; remainingSeconds?: number } {
    const now = Date.now();

    // 1. Check existing record cooldown (30-60s)
    const existing = this.otpStore.get(phone);
    if (existing) {
      const elapsedSeconds = Math.floor((now - existing.lastSentAt) / 1000);
      if (elapsedSeconds < this.RESEND_COOLDOWN_SECONDS) {
        const remaining = this.RESEND_COOLDOWN_SECONDS - elapsedSeconds;
        return {
          allowed: false,
          error: `Please wait ${remaining} second${remaining === 1 ? '' : 's'} before requesting another code.`,
          remainingSeconds: remaining
        };
      }
    }

    // 2. Check Hourly Phone Rate Limit
    const phoneLimit = this.phoneRateLimits.get(phone);
    if (phoneLimit) {
      if (now > phoneLimit.resetAt) {
        this.phoneRateLimits.set(phone, { count: 1, resetAt: now + 60 * 60 * 1000 });
      } else if (phoneLimit.count >= this.MAX_SENDS_PER_PHONE_HOUR) {
        const minutesLeft = Math.ceil((phoneLimit.resetAt - now) / (60 * 1000));
        return {
          allowed: false,
          error: `Too many OTP requests for this phone number. Please try again in ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}.`
        };
      } else {
        phoneLimit.count += 1;
      }
    } else {
      this.phoneRateLimits.set(phone, { count: 1, resetAt: now + 60 * 60 * 1000 });
    }

    // 3. Check IP Rate Limit
    if (ip) {
      const ipLimit = this.ipRateLimits.get(ip);
      if (ipLimit) {
        if (now > ipLimit.resetAt) {
          this.ipRateLimits.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
        } else if (ipLimit.count >= this.MAX_SENDS_PER_IP_15MIN) {
          const minutesLeft = Math.ceil((ipLimit.resetAt - now) / (60 * 1000));
          return {
            allowed: false,
            error: `Too many requests from your network. Please wait ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'} before trying again.`
          };
        } else {
          ipLimit.count += 1;
        }
      } else {
        this.ipRateLimits.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
      }
    }

    return { allowed: true };
  }

  /**
   * Stores the generated OTP as a secure salted hash.
   * Plaintext OTP is NEVER stored in database or memory records!
   */
  public static storeOtp(phone: string, otp: string): void {
    const salt = crypto.randomBytes(16).toString('hex');
    const otpHash = this.hashOtp(otp, salt);
    const now = Date.now();

    this.otpStore.set(phone, {
      phone,
      otpHash,
      salt,
      createdAt: now,
      expiresAt: now + this.OTP_EXPIRY_MS,
      attempts: 0,
      lastSentAt: now
    });
  }

  /**
   * Verifies an entered OTP using constant-time comparison against the stored hash.
   */
  public static verifyOtp(
    phone: string,
    enteredOtp: string
  ): { valid: boolean; error?: string; attemptsLeft?: number } {
    const record = this.otpStore.get(phone);

    if (!record) {
      return {
        valid: false,
        error: 'No active verification code found for this phone number. Please request a new code.'
      };
    }

    const now = Date.now();

    // Check expiration
    if (now > record.expiresAt) {
      this.otpStore.delete(phone);
      return {
        valid: false,
        error: 'Verification code expired. Please request a new code.'
      };
    }

    // Check maximum attempts
    if (record.attempts >= this.MAX_VERIFICATION_ATTEMPTS) {
      this.otpStore.delete(phone);
      return {
        valid: false,
        error: 'Too many attempts. Please request a new code.'
      };
    }

    record.attempts += 1;

    // Validate format
    const cleanCode = (enteredOtp || '').trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      const attemptsLeft = this.MAX_VERIFICATION_ATTEMPTS - record.attempts;
      return {
        valid: false,
        error: 'Invalid verification code. Please enter the 6-digit code sent to your phone.',
        attemptsLeft
      };
    }

    // Compute hash with recorded salt
    const candidateHash = this.hashOtp(cleanCode, record.salt);

    // Constant-time comparison to prevent timing attacks
    const recordBuffer = Buffer.from(record.otpHash, 'hex');
    const candidateBuffer = Buffer.from(candidateHash, 'hex');

    let isMatch = false;
    if (recordBuffer.length === candidateBuffer.length) {
      isMatch = crypto.timingSafeEqual(recordBuffer, candidateBuffer);
    }

    if (!isMatch) {
      const attemptsLeft = this.MAX_VERIFICATION_ATTEMPTS - record.attempts;
      if (attemptsLeft <= 0) {
        this.otpStore.delete(phone);
        return {
          valid: false,
          error: 'Too many attempts. Please request a new code.',
          attemptsLeft: 0
        };
      }
      return {
        valid: false,
        error: `Invalid verification code. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining.`,
        attemptsLeft
      };
    }

    // Success! Immediately invalidate consumed OTP
    this.otpStore.delete(phone);
    return { valid: true };
  }

  /**
   * Cleanup expired OTP records periodically
   */
  public static purgeExpired(): void {
    const now = Date.now();
    for (const [phone, record] of this.otpStore.entries()) {
      if (now > record.expiresAt) {
        this.otpStore.delete(phone);
      }
    }
  }
}

// Automatically purge expired records every 5 minutes
setInterval(() => {
  OtpManager.purgeExpired();
}, 5 * 60 * 1000);
