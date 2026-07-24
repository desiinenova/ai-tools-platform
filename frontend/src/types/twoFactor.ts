export interface TwoFactorEnrollment {
  secret: string;
  qr_code_url: string;
}

export interface TwoFactorRecoveryCodes {
  recovery_codes: string[];
}
