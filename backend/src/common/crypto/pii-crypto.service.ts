import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  authTag: string;
}

@Injectable()
export class PiiCryptoService {
  private readonly key: Buffer;

  constructor(private readonly config: ConfigService) {
    const keyBase64 = this.config.get<string>('piiKey');
    if (!keyBase64) {
      throw new InternalServerErrorException('PII_KEY not configured');
    }
    const keyBuf = Buffer.from(keyBase64, 'base64');
    if (keyBuf.length !== 32) {
      throw new InternalServerErrorException('PII_KEY must decode to exactly 32 bytes');
    }
    this.key = keyBuf;
  }

  encrypt(plaintext: string): EncryptedPayload {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGO, this.key, iv);

    const ciphertext = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return {
      ciphertext: ciphertext.toString('base64'),
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
    };
  }

  decrypt(payload: EncryptedPayload): string {
    const iv = Buffer.from(payload.iv, 'base64');
    const ciphertext = Buffer.from(payload.ciphertext, 'base64');
    const authTag = Buffer.from(payload.authTag, 'base64');

    if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
      throw new InternalServerErrorException('Invalid encrypted payload dimensions');
    }

    const decipher = crypto.createDecipheriv(ALGO, this.key, iv);
    decipher.setAuthTag(authTag);

    try {
      const plaintext = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]);
      return plaintext.toString('utf8');
    } catch {
      throw new InternalServerErrorException('Decryption failed: data may be tampered');
    }
  }

  encryptObject(obj: Record<string, unknown>): EncryptedPayload {
    return this.encrypt(JSON.stringify(obj));
  }

  decryptObject(payload: EncryptedPayload): Record<string, unknown> {
    return JSON.parse(this.decrypt(payload)) as Record<string, unknown>;
  }
}
