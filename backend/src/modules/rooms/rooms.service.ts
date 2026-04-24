import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RoomsService {
  constructor(private readonly config: ConfigService) {}

  async generateToken(roomName: string, identity: string, ttl = 7200): Promise<string> {
    const apiKey = this.config.get<string>('livekit.apiKey') ?? '';
    const apiSecret = this.config.get<string>('livekit.apiSecret') ?? '';

    const now = Math.floor(Date.now() / 1000);
    const header = this.b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = this.b64url(
      JSON.stringify({
        iss: apiKey,
        sub: identity,
        iat: now,
        exp: now + ttl,
        video: {
          room: roomName,
          roomJoin: true,
          canPublish: true,
          canSubscribe: true,
          canPublishData: true,
        },
      }),
    );

    const signingInput = `${header}.${payload}`;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(apiSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput));
    return `${signingInput}.${this.b64url(Buffer.from(sig))}`;
  }

  private b64url(input: ArrayBuffer | string | Buffer): string {
    const buf =
      typeof input === 'string'
        ? Buffer.from(input)
        : Buffer.isBuffer(input)
          ? input
          : Buffer.from(input);
    return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  getLivekitUrl(): string {
    return this.config.get<string>('livekit.url') ?? '';
  }
}
