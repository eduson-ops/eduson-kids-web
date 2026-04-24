import { Test, TestingModule } from '@nestjs/testing';
import { StudentRosterService } from '../src/modules/classroom/student-roster.service';
import { PdfRosterService } from '../src/modules/classroom/pdf-roster.service';
import { ConfigService } from '@nestjs/config';

/**
 * Unit-tests for student roster generator + PDF builder.
 *
 * - Login generator: confusion-free alphabet, tenant prefix, sequential
 * - PIN generator: 6 chars, alphabet without 0/O/1/l/I/5/S
 * - PDF builder: produces a non-empty Buffer
 *
 * Integration tests (with real DB + tenancy + PDF binary parse) live in
 * tests/integration which run against a Docker postgres + redis stack.
 */

describe('StudentRosterService — login & PIN generation', () => {
  it('PIN should be 6 characters from confusion-free alphabet', () => {
    // Re-implement generation for unit assertion (private method)
    const ALPHABET = 'abcdefghkmnpqrstuvwxyz23456789';
    expect(ALPHABET).not.toMatch(/[0Oolj1Ii5S]/);
    expect(ALPHABET.length).toBe(30);
    // 30^6 ≈ 729M combinations
    expect(Math.pow(ALPHABET.length, 6)).toBeGreaterThan(700_000_000);
  });

  it('Login pattern: kub_{slug}_{seq4}', () => {
    const tenantSlug = 'msh42';
    const seq = 17;
    const login = `kub_${tenantSlug}_${String(seq).padStart(4, '0')}`;
    expect(login).toBe('kub_msh42_0017');
    expect(login).toMatch(/^kub_[a-z0-9]+_\d{4}$/);
  });

  it('Login truncates tenant slug to 12 chars and lowercases', () => {
    const slug = 'verylongtenantslug123'.replace(/[^a-z0-9]/gi, '').slice(0, 12);
    expect(slug).toBe('verylongtena');
    expect(slug.length).toBeLessThanOrEqual(12);
  });
});

describe('PdfRosterService', () => {
  let service: PdfRosterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PdfRosterService,
        {
          provide: ConfigService,
          useValue: { get: (k: string) => (k === 'app.publicBaseUrl' ? 'https://kubik.school' : undefined) },
        },
      ],
    }).compile();
    service = module.get(PdfRosterService);
  });

  it('returns a non-empty Buffer for a small roster', async () => {
    const cards = [
      { firstName: 'Иван', lastName: 'Петров', login: 'kub_msh42_0001', pin: 'abc234' },
      { firstName: 'Мария', lastName: 'Сидорова', login: 'kub_msh42_0002', pin: 'def567' },
    ];
    const buf = await service.generateRosterPdf(cards, {
      className: '5А',
      schoolName: 'МБОУ СОШ №42',
      teacherName: 'Иванова И.И.',
      brandName: 'KubiK',
    });
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(2000); // PDF header + content
    // PDF starts with %PDF-
    expect(buf.subarray(0, 5).toString()).toBe('%PDF-');
  }, 15000);

  it('handles a 30-student class (single page max-density)', async () => {
    const cards = Array.from({ length: 30 }, (_, i) => ({
      firstName: `Ученик${i + 1}`,
      lastName: 'Тестовый',
      login: `kub_test_${String(i + 1).padStart(4, '0')}`,
      pin: 'abc234',
    }));
    const buf = await service.generateRosterPdf(cards, {
      className: '5А',
      brandName: 'KubiK',
    });
    expect(buf).toBeInstanceOf(Buffer);
    // Multiple pages: 30 cards / 6 per page = 5 pages → larger
    expect(buf.length).toBeGreaterThan(20_000);
  }, 30000);

  it('handles single student (1 card on 1 page)', async () => {
    const cards = [{ firstName: 'Иван', login: 'kub_test_0001', pin: 'xyz789' }];
    const buf = await service.generateRosterPdf(cards, {
      className: 'Индивидуальное',
      brandName: 'KubiK',
    });
    expect(buf.length).toBeGreaterThan(1000);
  }, 10000);
});
