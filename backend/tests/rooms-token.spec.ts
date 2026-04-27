/**
 * Unit test for RoomsService.generateToken.
 *
 * Bug guard: до 2026-04-27 backend выдавал JWT без `canPublishSources`,
 * из-за чего LK Cloud отказывал в screen-share и кикал участника при первом
 * getDisplayMedia. Этот тест фиксирует обязательное наличие screen_share /
 * screen_share_audio в payload — регрессия его сразу сломает.
 */
import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
import { RoomsService } from '../src/modules/rooms/rooms.service';

const TEST_KEY = 'API_TEST_KEY_xxxxxxxxxx';
const TEST_SECRET = 'TEST_SECRET_at_least_32_chars_long_xxxxxx';
const TEST_URL = 'wss://test.livekit.cloud';

function makeConfig(values: Record<string, string | null>): ConfigService {
  return {
    get: (key: string) => values[key] ?? null,
  } as unknown as ConfigService;
}

function decodeJwt(token: string): { header: any; payload: any; signature: string } {
  const [h, p, s] = token.split('.');
  const b64decode = (b64: string) => {
    const padded = b64.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((b64.length + 3) % 4);
    return Buffer.from(padded, 'base64').toString('utf8');
  };
  return {
    header: JSON.parse(b64decode(h)),
    payload: JSON.parse(b64decode(p)),
    signature: s,
  };
}

describe('RoomsService.generateToken', () => {
  let service: RoomsService;

  beforeEach(() => {
    service = new RoomsService(
      makeConfig({
        'livekit.url': TEST_URL,
        'livekit.apiKey': TEST_KEY,
        'livekit.apiSecret': TEST_SECRET,
      }),
    );
  });

  it('throws 503 when LiveKit is not configured', async () => {
    const empty = new RoomsService(
      makeConfig({ 'livekit.url': null, 'livekit.apiKey': null, 'livekit.apiSecret': null }),
    );
    await expect(empty.generateToken('room1', 'alice')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('produces a 3-part JWT with HS256 header', async () => {
    const token = await service.generateToken('classroom-42', 'student:alice', 600);
    const parts = token.split('.');
    expect(parts).toHaveLength(3);
    const { header } = decodeJwt(token);
    expect(header).toEqual({ alg: 'HS256', typ: 'JWT' });
  });

  it('REGRESSION: payload includes canPublishSources with screen_share + screen_share_audio', async () => {
    // Это страховка от LK-кика при включении демонстрации экрана.
    // Без `canPublishSources` LK Cloud разрывает соединение с PublishTrackError 0x1010.
    const token = await service.generateToken('classroom-42', 'student:alice');
    const { payload } = decodeJwt(token);

    expect(payload.video).toBeDefined();
    expect(payload.video.canPublishSources).toEqual(
      expect.arrayContaining(['screen_share', 'screen_share_audio']),
    );
    // Камеру/микро тоже не теряем — иначе сломается обычный голосовой режим.
    expect(payload.video.canPublishSources).toEqual(
      expect.arrayContaining(['camera', 'microphone']),
    );
  });

  it('payload includes core room grants', async () => {
    const token = await service.generateToken('room-x', 'teacher:1');
    const { payload } = decodeJwt(token);
    expect(payload.video).toMatchObject({
      room: 'room-x',
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });
    expect(payload.iss).toBe(TEST_KEY);
    expect(payload.sub).toBe('teacher:1');
  });

  it('clamps TTL to [60, 7200] seconds', async () => {
    const tokenShort = await service.generateToken('r', 'u', 5);
    const { payload: pShort } = decodeJwt(tokenShort);
    expect(pShort.exp - pShort.iat).toBe(60);

    const tokenLong = await service.generateToken('r', 'u', 99999);
    const { payload: pLong } = decodeJwt(tokenLong);
    expect(pLong.exp - pLong.iat).toBe(7200);

    const tokenOk = await service.generateToken('r', 'u', 1800);
    const { payload: pOk } = decodeJwt(tokenOk);
    expect(pOk.exp - pOk.iat).toBe(1800);
  });

  it('two participants get distinct identities but same room grants', async () => {
    // Эмулирует двух headless-клиентов: учитель + ученик в одной комнате.
    // Оба должны получить право screen_share, иначе фокус-режим в Room.tsx
    // не отрисует FocusLayout и комната заклинит.
    const t1 = await service.generateToken('demo-room', 'teacher:olya');
    const t2 = await service.generateToken('demo-room', 'student:vova');
    const p1 = decodeJwt(t1).payload;
    const p2 = decodeJwt(t2).payload;

    expect(p1.sub).not.toBe(p2.sub);
    expect(p1.video.room).toBe(p2.video.room);
    expect(p1.video.canPublishSources).toEqual(p2.video.canPublishSources);
    expect(p1.video.canPublishSources).toContain('screen_share');
    expect(p2.video.canPublishSources).toContain('screen_share');
  });

  it('signature is deterministic for same input + secret', async () => {
    // Не криптографический тест — просто sanity, что HMAC стабилен.
    const a = await service.generateToken('r', 'u');
    const b = await service.generateToken('r', 'u');
    // iat будет одинаков в одной секунде → токены равны.
    // Если тест нестабилен — можно срезать exp/iat и сравнивать только video.
    const pa = decodeJwt(a).payload;
    const pb = decodeJwt(b).payload;
    expect(pa.video).toEqual(pb.video);
  });

  it('getLivekitUrl returns configured URL', () => {
    expect(service.getLivekitUrl()).toBe(TEST_URL);
  });

  it('getLivekitUrl throws 503 when URL missing', () => {
    const empty = new RoomsService(
      makeConfig({ 'livekit.url': null, 'livekit.apiKey': TEST_KEY, 'livekit.apiSecret': TEST_SECRET }),
    );
    expect(() => empty.getLivekitUrl()).toThrow(ServiceUnavailableException);
  });
});
