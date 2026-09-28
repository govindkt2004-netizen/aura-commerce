import crypto from 'crypto';

export interface PhoneValidationResult {
  valid: boolean;
  e164: string; // e.g. +919876543210
  national: string; // e.g. 9876543210
  formatted: string; // e.g. +91 98765 43210
  masked: string; // e.g. +91 987•• ••210
  error?: string;
}

/**
 * Validates and normalizes Indian mobile numbers (+91)
 * Indian mobile numbers consist of 10 digits starting with 6, 7, 8, or 9.
 */
export function validateAndNormalizeIndianPhone(input: string): PhoneValidationResult {
  if (!input || typeof input !== 'string') {
    return {
      valid: false,
      e164: '',
      national: '',
      formatted: '',
      masked: '',
      error: 'Phone number is required.'
    };
  }

  // Remove non-digit characters except leading +
  let cleaned = input.trim().replace(/[\s\-()]/g, '');

  // Handle +91 or 91 or 0 prefixes
  let nationalNumber = cleaned;
  if (nationalNumber.startsWith('+91')) {
    nationalNumber = nationalNumber.slice(3);
  } else if (nationalNumber.startsWith('91') && nationalNumber.length === 12) {
    nationalNumber = nationalNumber.slice(2);
  } else if (nationalNumber.startsWith('0') && nationalNumber.length === 11) {
    nationalNumber = nationalNumber.slice(1);
  }

  // Check if exactly 10 digits and starts with 6, 7, 8, or 9
  const indianMobileRegex = /^[6-9]\d{9}$/;
  if (!indianMobileRegex.test(nationalNumber)) {
    return {
      valid: false,
      e164: '',
      national: '',
      formatted: '',
      masked: '',
      error: 'Please enter a valid 10-digit Indian mobile number (+91) starting with 6, 7, 8, or 9.'
    };
  }

  const e164 = `+91${nationalNumber}`;
  const formatted = `+91 ${nationalNumber.slice(0, 5)} ${nationalNumber.slice(5)}`;
  const masked = `+91 ${nationalNumber.slice(0, 3)}•• ••${nationalNumber.slice(8)}`;

  return {
    valid: true,
    e164,
    national: nationalNumber,
    formatted,
    masked
  };
}

export type SmsProviderName = 'twilio' | 'msg91' | 'twofactor' | 'fast2sms' | 'custom';

export interface SmsProviderConfig {
  name: SmsProviderName;
  displayName: string;
}

export class SmsService {
  /**
   * Identifies which SMS provider credentials are configured in environment variables
   */
  public static getActiveProvider(): SmsProviderConfig | null {
    // 1. Twilio
    if (
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      (process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_MESSAGING_SERVICE_SID)
    ) {
      return { name: 'twilio', displayName: 'Twilio' };
    }

    // 2. 2Factor.in
    if (process.env.TWO_FACTOR_API_KEY) {
      return { name: 'twofactor', displayName: '2Factor.in' };
    }

    // 3. MSG91
    if (process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID) {
      return { name: 'msg91', displayName: 'MSG91' };
    }

    // 4. Fast2SMS
    if (process.env.FAST2SMS_API_KEY) {
      return { name: 'fast2sms', displayName: 'Fast2SMS' };
    }

    // 5. Generic / Custom Gateway
    if (process.env.SMS_GATEWAY_URL) {
      return { name: 'custom', displayName: 'Custom SMS Gateway' };
    }

    return null;
  }

  /**
   * Sends an OTP via the configured SMS provider.
   * Throws descriptive configuration error if no provider credentials are found.
   */
  public static async sendOtp(phoneInfo: PhoneValidationResult, otp: string): Promise<{ success: boolean; provider: string; messageId?: string }> {
    const active = this.getActiveProvider();

    if (!active) {
      const errorMsg =
        'SMS provider credentials are not configured. To send real SMS OTPs to mobile devices, ' +
        'please configure an SMS provider in your environment variables. ' +
        'Supported: Twilio (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER), ' +
        '2Factor (TWO_FACTOR_API_KEY), MSG91 (MSG91_AUTH_KEY, MSG91_TEMPLATE_ID), or Fast2SMS (FAST2SMS_API_KEY).';
      const err: any = new Error(errorMsg);
      err.code = 'SMS_PROVIDER_NOT_CONFIGURED';
      err.isConfigError = true;
      throw err;
    }

    const messageText = `Your AURA verification code is: ${otp}. Valid for 5 minutes. Please do not share this OTP with anyone.`;

    switch (active.name) {
      case 'twilio':
        return await this.sendViaTwilio(phoneInfo.e164, messageText);
      case 'twofactor':
        return await this.sendVia2Factor(phoneInfo.national, otp);
      case 'msg91':
        return await this.sendViaMsg91(phoneInfo.national, otp);
      case 'fast2sms':
        return await this.sendViaFast2Sms(phoneInfo.national, otp, messageText);
      case 'custom':
        return await this.sendViaCustomGateway(phoneInfo.e164, phoneInfo.national, messageText, otp);
      default:
        throw new Error(`Unsupported SMS provider: ${active.name}`);
    }
  }

  /**
   * Twilio REST API integration
   */
  private static async sendViaTwilio(toE164: string, body: string) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const params = new URLSearchParams();
    params.append('To', toE164);
    params.append('Body', body);

    if (messagingServiceSid) {
      params.append('MessagingServiceSid', messagingServiceSid);
    } else if (fromPhone) {
      params.append('From', fromPhone);
    }

    const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data: any = await res.json();
    if (!res.ok) {
      const errMessage = data?.message || 'Twilio SMS dispatch failed';
      throw new Error(`Twilio SMS delivery failed: ${errMessage}`);
    }

    return {
      success: true,
      provider: 'Twilio',
      messageId: data.sid
    };
  }

  /**
   * 2Factor.in SMS API integration (popular in India)
   */
  private static async sendVia2Factor(nationalPhone: string, otp: string) {
    const apiKey = process.env.TWO_FACTOR_API_KEY!;
    const url = `https://2factor.in/API/V1/${apiKey}/SMS/${nationalPhone}/${otp}/AURA_OTP`;

    const res = await fetch(url, { method: 'GET' });
    const data: any = await res.json();

    if (!res.ok || data?.Status !== 'Success') {
      const errMessage = data?.Details || '2Factor dispatch failed';
      throw new Error(`2Factor SMS delivery failed: ${errMessage}`);
    }

    return {
      success: true,
      provider: '2Factor',
      messageId: data?.Details
    };
  }

  /**
   * MSG91 OTP API integration
   */
  private static async sendViaMsg91(nationalPhone: string, otp: string) {
    const authKey = process.env.MSG91_AUTH_KEY!;
    const templateId = process.env.MSG91_TEMPLATE_ID!;
    const senderId = process.env.MSG91_SENDER_ID || 'AURAMS';

    const url = new URL('https://control.msg91.com/api/v5/otp');
    url.searchParams.append('template_id', templateId);
    url.searchParams.append('mobile', `91${nationalPhone}`);
    url.searchParams.append('authkey', authKey);
    url.searchParams.append('otp', otp);
    if (senderId) {
      url.searchParams.append('sender', senderId);
    }

    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data: any = await res.json();
    if (!res.ok || data?.type === 'error') {
      const errMessage = data?.message || 'MSG91 SMS dispatch failed';
      throw new Error(`MSG91 SMS delivery failed: ${errMessage}`);
    }

    return {
      success: true,
      provider: 'MSG91',
      messageId: data?.message
    };
  }

  /**
   * Fast2SMS OTP API integration
   */
  private static async sendViaFast2Sms(nationalPhone: string, otp: string, messageText: string) {
    const apiKey = process.env.FAST2SMS_API_KEY!;
    const url = 'https://www.fast2sms.com/dev/bulkV2';

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        authorization: apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: otp,
        numbers: nationalPhone
      })
    });

    const data: any = await res.json();
    if (!res.ok || data?.return === false) {
      const errMessage = (Array.isArray(data?.message) ? data.message.join(', ') : data?.message) || 'Fast2SMS dispatch failed';
      throw new Error(`Fast2SMS delivery failed: ${errMessage}`);
    }

    return {
      success: true,
      provider: 'Fast2SMS',
      messageId: data?.request_id
    };
  }

  /**
   * Generic Custom Webhook Gateway
   */
  private static async sendViaCustomGateway(
    e164: string,
    national: string,
    message: string,
    otp: string
  ) {
    const gatewayUrl = process.env.SMS_GATEWAY_URL!;
    const apiKey = process.env.SMS_GATEWAY_API_KEY || process.env.SMS_GATEWAY_TOKEN;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (apiKey) {
      headers['Authorization'] = apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`;
    }

    const res = await fetch(gatewayUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        to: e164,
        national,
        message,
        otp
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Custom SMS Gateway returned error ${res.status}: ${errText.slice(0, 100)}`);
    }

    return {
      success: true,
      provider: 'CustomGateway'
    };
  }
}
