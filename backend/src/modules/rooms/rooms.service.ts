import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RoomsService {
  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(
      this.config.get<string | null>('livekit.url') &&
        this.config.get<string | null>('livekit.apiKey') &&
        this.config.get<string | null>('livekit.apiSecret'),
    );
  }

  async generateToken(roomName: string, identity: string, ttl = 7200): Promise<string> {
    const apiKey = this.config.get<string | null>('livekit.apiKey');
    const apiSecret = this.config.get<string | null>('livekit.apiSecret');

    if (!apiKey || !apiSecret) {
      throw new ServiceUnavailableException('LiveKit is not configured on this server');
    }

    // Cap TTL to 1 hour for guest/short-lived use, 2h max for authed
    const effectiveTtl = Math.min(Math.max(60, ttl), 7200);

    const now = Math.floor(Date.now() / 1000);
    const header = this.b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = this.b64url(
      JSON.stringify({
        iss: apiKey,
        sub: identity,
        iat: now,
        exp: now + effectiveTtl,
        video: {
          room: roomName,
          roomJoin: true,
          canPublish: true,
          canSubscribe: true,
          canPublishData: true,
          // Без явного canPublishSources LK Cloud режет screen-share с 0x1010
          // и кикает участника при первом getDisplayMedia → вся комната ломается.
          canPublishSources: ['camera', 'microphone', 'screen_share', 'screen_share_audio'],
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
    const url = this.config.get<string | null>('livekit.url');
    if (!url) {
      throw new ServiceUnavailableException('LiveKit is not configured on this server');
    }
    return url;
  }
}
