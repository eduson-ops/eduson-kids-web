import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PiiCryptoService } from './pii-crypto.service';

const TEST_KEY_BASE64 = crypto.randomBytes(32).toString('base64');

describe('PiiCryptoService', () => {
  let service: PiiCryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PiiCryptoService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => (key === 'piiKey' ? TEST_KEY_BASE64 : undefined),
          },
        },
      ],
    }).compile();

    service = module.get<PiiCryptoService>(PiiCryptoService);
  });

  it('should encrypt and decrypt a string (round-trip)', () => {
    const plaintext = 'Иван Иванов, дата рождения: 2015-03-15';
    const encrypted = service.encrypt(plaintext);

    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.authTag).toBeDefined();
    expect(encrypted.ciphertext).not.toBe(plaintext);

    const decrypted = service.decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it('should produce different ciphertext each call (random IV)', () => {
    const plaintext = 'same text';
    const enc1 = service.encrypt(plaintext);
    const enc2 = service.encrypt(plaintext);

    expect(enc1.iv).not.toBe(enc2.iv);
    expect(enc1.ciphertext).not.toBe(enc2.ciphertext);
  });

  it('should throw on tampered authTag', () => {
    const encrypted = service.encrypt('sensitive data');
    const tampered = {
      ...encrypted,
      authTag: Buffer.from(crypto.randomBytes(16)).toString('base64'),
    };

    expect(() => service.decrypt(tampered)).toThrow(InternalServerErrorException);
    expect(() => service.decrypt(tampered)).toThrow('Decryption failed');
  });

  it('should throw on tampered ciphertext', () => {
    const encrypted = service.encrypt('sensitive data');
    const ciphertextBuf = Buffer.from(encrypted.ciphertext, 'base64');
    ciphertextBuf[0] ^= 0xff;

    const tampered = {
      ...encrypted,
      ciphertext: ciphertextBuf.toString('base64'),
    };

    expect(() => service.decrypt(tampered)).toThrow(InternalServerErrorException);
  });

  it('should encrypt and decrypt an object', () => {
    const obj = { firstName: 'Аня', lastName: 'Сидорова', birthYear: 2016 };
    const encrypted = service.encryptObject(obj);
    const decrypted = service.decryptObject(encrypted);

    expect(decrypted).toEqual(obj);
  });

  it('should throw if PII_KEY is not 32 bytes', () => {
    const badKey = Buffer.from('too-short').toString('base64');
    const module = Test.createTestingModule({
      providers: [
        PiiCryptoService,
        {
          provide: ConfigService,
          useValue: { get: () => badKey },
        },
      ],
    });

    expect(() =>
      module.compile().then((m) => m.get(PiiCryptoService)),
    ).rejects.toBeDefined();
  });
});
