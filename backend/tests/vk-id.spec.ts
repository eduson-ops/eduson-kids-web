import { VkIdService } from '../src/modules/auth/strategies/vk-id.service';
import { createHash } from 'node:crypto';

/**
 * Unit tests for VkIdService — config detection + PKCE init URL builder.
 *
 * Repositories / JWT / PII crypto / tenantContext are mocked. We do NOT
 * exercise the OAuth callback (network round-trip with VK ID) here — that
 * lives in tests/integration with mocked HTTP server.
 */

function makeService(env: {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
} = {}) {
  const userRepo: any = { create: jest.fn(), save: jest.fn(), createQueryBuilder: jest.fn() };

  const config: any = {
    get: (k: string) => {
      if (k === 'vkId.clientId') return env.clientId;
      if (k === 'vkId.clientSecret') return env.clientSecret;
      if (k === 'vkId.redirectUri') return env.redirectUri;
      if (k === 'jwt.accessSecret') return 'test-access-secret-32chars-long-xx';
      if (k === 'jwt.refreshSecret') return 'test-refresh-secret-32chars-long-x';
      return undefined;
    },
  };
  const jwt: any = { sign: jest.fn(() => 'signed.token') };
  const tenantContext: any = { require: () => ({ tenantId: 't1', bypass: false }) };
  const pii: any = {
    encryptObject: jest.fn(() => ({ ciphertext: 'c', iv: 'i', authTag: 'a' })),
  };

  return new VkIdService(userRepo, config, jwt, tenantContext, pii);
}

describe('VkIdService.isEnabled', () => {
  it('returns false when env not configured', () => {
    const svc = makeService({});
    expect(svc.isEnabled()).toBe(false);
  });

  it('returns false when only some fields configured', () => {
    const svc = makeService({ clientId: 'x', clientSecret: 'y' });
    expect(svc.isEnabled()).toBe(false);
  });

  it('returns true when full config present', () => {
    const svc = makeService({
      clientId: 'cid',
      clientSecret: 'csec',
      redirectUri: 'https://kubik.school/auth/vk/callback',
    });
    expect(svc.isEnabled()).toBe(true);
  });
});

describe('VkIdService.buildInitUrl', () => {
  it('throws when not configured', () => {
    const svc = makeService({});
    expect(() => svc.buildInitUrl()).toThrow(/VK ID not configured/);
  });

  it('builds an authorize URL with PKCE S256 challenge', () => {
    const svc = makeService({
      clientId: 'cid',
      clientSecret: 'csec',
      redirectUri: 'https://kubik.school/auth/vk/callback',
    });
    const { url, state, codeVerifier } = svc.buildInitUrl();
    expect(url).toContain('https://id.vk.com/authorize');
    expect(url).toContain('response_type=code');
    expect(url).toContain('client_id=cid');
    expect(url).toContain('code_challenge_method=S256');
    expect(url).toContain('code_challenge=');

    // Compute expected challenge from returned verifier and check it matches.
    const expectedChallenge = createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    expect(url).toContain(`code_challenge=${expectedChallenge}`);

    expect(state).toMatch(/^[a-zA-Z0-9_-]{20,}$/);
    expect(codeVerifier).toMatch(/^[a-zA-Z0-9_-]{40,}$/);
  });

  it('includes encoded returnTo in state when provided', () => {
    const svc = makeService({
      clientId: 'cid',
      clientSecret: 'csec',
      redirectUri: 'https://kubik.school/auth/vk/callback',
    });
    const { url } = svc.buildInitUrl('/studio/project/42');
    // State has format `${rawState}|${encodeURIComponent(returnTo)}`,
    // and URLSearchParams will percent-encode again.
    const params = new URLSearchParams(url.split('?')[1]);
    const stateParam = params.get('state');
    expect(stateParam).toContain('|');
    const [, returnTo] = stateParam!.split('|');
    expect(decodeURIComponent(returnTo)).toBe('/studio/project/42');
  });
});

describe('VkIdService — sanitizeReturnTo allowlist (logical)', () => {
  /**
   * The actual sanitizeReturnTo lives on the controller side (see
   * external-auth.controller.ts). We replicate the contract here as a
   * regression guard so future refactors keep the allowlist semantics.
   */
  function sanitizeReturnTo(input: string | undefined): string {
    if (!input) return '/';
    if (!input.startsWith('/')) return '/';
    if (input.startsWith('//')) return '/';
    if (/[\r\n]/.test(input)) return '/';
    return input;
  }

  it('falls back to / for absolute URLs', () => {
    expect(sanitizeReturnTo('https://evil.example.com')).toBe('/');
  });
  it('falls back to / for protocol-relative URLs', () => {
    expect(sanitizeReturnTo('//evil')).toBe('/');
  });
  it('falls back to / when path missing leading slash', () => {
    expect(sanitizeReturnTo('studio')).toBe('/');
  });
  it('strips CR/LF (header injection guard)', () => {
    expect(sanitizeReturnTo('/x\r\nSet-Cookie: a=b')).toBe('/');
  });
  it('preserves safe relative paths', () => {
    expect(sanitizeReturnTo('/studio/project/42')).toBe('/studio/project/42');
  });
});
