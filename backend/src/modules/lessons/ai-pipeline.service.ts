import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Lesson, LessonStatus, LessonUmk, LessonFocus } from './lesson.entity';
import { LessonVersion, LessonVersionSource } from './lesson-version.entity';
import { TenantContext } from '../../common/tenancy/tenant.context';
import { TenantsService } from '../tenants/tenants.service';
import { MockAiProvider } from './providers/mock.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import {
  AiProvider,
  LessonGenerationInput,
} from './providers/ai-provider.interface';

/**
 * AI Pipeline orchestrator.
 *
 * MVP scope (overnight Phase 7):
 *   - Run mock provider in-process (no BullMQ queue yet — Redis already
 *     available, but synchronous flow is simpler for first validation)
 *   - Persist Lesson + LessonVersion (ai_initial)
 *   - Status state machine: QUEUED → GENERATING → PENDING_REVIEW
 *   - Methodist review API: approve / reject / regenerate
 *   - Tenant AI-quota check (maxAiLessonsPerMonth)
 *
 * Production scope (next sprint):
 *   - BullMQ queue with 4 worker pools (text/image/video/3d)
 *   - Real Anthropic/OpenAI/YandexGPT providers with retries
 *   - Per-tenant cost tracking + budget alerts
 *   - Webhook notifications when lesson ready for review
 */

@Injectable()
export class AiPipelineService {
  private readonly logger = new Logger(AiPipelineService.name);

  constructor(
    @InjectRepository(Lesson) private readonly lessons: Repository<Lesson>,
    @InjectRepository(LessonVersion) private readonly versions: Repository<LessonVersion>,
    private readonly dataSource: DataSource,
    private readonly tenantContext: TenantContext,
    private readonly tenantsService: TenantsService,
    private readonly config: ConfigService,
    private readonly mockProvider: MockAiProvider,
    private readonly anthropicProvider: AnthropicProvider,
  ) {}

  /**
   * Submit a new lesson for AI generation. Returns the created Lesson row
   * with status=QUEUED. Generation runs immediately in-process for MVP.
   */
  async submit(
    requesterId: string,
    input: LessonGenerationInput,
  ): Promise<Lesson> {
    const ctx = this.tenantContext.require();

    // Quota check — count lessons created in current calendar month
    const tenant = await this.tenantsService.findById(ctx.tenantId);
    const monthlyQuota = tenant.quotas?.maxAiLessonsPerMonth ?? 0;
    if (monthlyQuota > 0) {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const used = await this.lessons
        .createQueryBuilder('l')
        .where('l.tenant_id = :tid', { tid: ctx.tenantId })
        .andWhere('l.created_at >= :since', { since: monthStart })
        .getCount();
      if (used >= monthlyQuota) {
        throw new BadRequestException(
          `Tenant AI quota exceeded: ${used}/${monthlyQuota} lessons this month`,
        );
      }
    }

    const lesson = this.lessons.create({
      tenantId: ctx.tenantId,
      topicCode: input.topicCode,
      grade: input.grade,
      umk: (input.umk as LessonUmk) ?? LessonUmk.GENERIC,
      focus: input.focus as LessonFocus,
      title: `Loading… (${input.topicCode})`,
      status: LessonStatus.QUEUED,
      reviewerId: requesterId,
    });
    const saved = await this.lessons.save(lesson);

    // Run synchronously for MVP — fire-and-forget, status updates via DB
    void this.runGeneration(saved.id, requesterId, input).catch((err) => {
      this.logger.error(`Generation failed for lesson ${saved.id}: ${err}`);
    });

    return saved;
  }

  private async runGeneration(
    lessonId: string,
    requesterId: string,
    input: LessonGenerationInput,
  ): Promise<void> {
    await this.lessons.update(lessonId, { status: LessonStatus.GENERATING });

    const provider = this.selectProvider();
    const start = Date.now();

    try {
      const out = await provider.generateLesson(input);
      const elapsedSec = (Date.now() - start) / 1000;

      // Persist version + update lesson
      await this.dataSource.transaction(async (manager) => {
        // tenant_id is populated by TenantSubscriber from current context.
        // We're inside a fire-and-forget callback so the AsyncLocalStorage
        // context may have unwound — fallback: read from lesson row.
        const lesson = await manager.findOne(Lesson, { where: { id: lessonId } });
        if (!lesson) return;

        const version = manager.create(LessonVersion, {
          tenantId: lesson.tenantId,
          lessonId,
          sequence: 1,
          payload: out.payload as Record<string, unknown>,
          source: LessonVersionSource.AI_INITIAL,
          createdBy: requesterId,
          note: null,
        });
        const savedVersion = await manager.save(LessonVersion, version);

        await manager.update(Lesson, lessonId, {
          status: LessonStatus.PENDING_REVIEW,
          title: out.title,
          currentVersionId: savedVersion.id,
          aiProvider: provider.name,
          aiCostKopecks: out.costKopecks,
          generationSeconds: Math.round(elapsedSec),
          lastMessage: 'Готово к review',
        });
      });
    } catch (err) {
      this.logger.error(`Provider ${provider.name} failed: ${err}`);
      await this.lessons.update(lessonId, {
        status: LessonStatus.FAILED,
        lastMessage: (err as Error).message,
        aiProvider: provider.name,
      });
    }
  }

  private selectProvider(): AiProvider {
    const envProvider =
      this.config.get<string>('ai.provider') ??
      process.env['AI_PROVIDER'] ??
      'mock';

    if (envProvider === 'anthropic') {
      const hasKey = !!(
        this.config.get<string>('ANTHROPIC_API_KEY') ??
        process.env['ANTHROPIC_API_KEY']
      );
      if (hasKey) {
        return this.anthropicProvider;
      }
      this.logger.warn(
        `AI_PROVIDER=anthropic but ANTHROPIC_API_KEY missing — falling back to mock`,
      );
      return this.mockProvider;
    }

    if (envProvider !== 'mock') {
      this.logger.warn(
        `Provider '${envProvider}' not implemented yet — falling back to mock`,
      );
    }
    return this.mockProvider;
  }

  // ===== Methodist review API =====

  async list(opts: { status?: LessonStatus } = {}): Promise<Lesson[]> {
    const ctx = this.tenantContext.require();
    const where: Record<string, unknown> = { tenantId: ctx.tenantId };
    if (opts.status) where.status = opts.status;
    return this.lessons.find({ where, order: { updatedAt: 'DESC' }, take: 100 });
  }

  async get(id: string): Promise<{ lesson: Lesson; version: LessonVersion | null }> {
    const ctx = this.tenantContext.require();
    const lesson = await this.lessons.findOne({ where: { id, tenantId: ctx.tenantId } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    let version: LessonVersion | null = null;
    if (lesson.currentVersionId) {
      version = await this.versions.findOne({
        where: { id: lesson.currentVersionId, tenantId: ctx.tenantId },
      });
    }
    return { lesson, version };
  }

  async approve(lessonId: string, reviewerId: string, note?: string): Promise<Lesson> {
    const ctx = this.tenantContext.require();
    const lesson = await this.lessons.findOne({ where: { id: lessonId, tenantId: ctx.tenantId } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    if (lesson.status !== LessonStatus.PENDING_REVIEW) {
      throw new BadRequestException(`Lesson not in review (status=${lesson.status})`);
    }
    lesson.status = LessonStatus.PUBLISHED;
    lesson.reviewerId = reviewerId;
    lesson.lastMessage = note ?? 'Утверждено';
    return this.lessons.save(lesson);
  }

  async reject(lessonId: string, reviewerId: string, feedback: string): Promise<Lesson> {
    const ctx = this.tenantContext.require();
    const lesson = await this.lessons.findOne({ where: { id: lessonId, tenantId: ctx.tenantId } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    lesson.status = LessonStatus.REJECTED;
    lesson.reviewerId = reviewerId;
    lesson.lastMessage = feedback;
    return this.lessons.save(lesson);
  }

  async editVersion(
    lessonId: string,
    requesterId: string,
    payload: Record<string, unknown>,
    note?: string,
  ): Promise<LessonVersion> {
    const ctx = this.tenantContext.require();
    const lesson = await this.lessons.findOne({ where: { id: lessonId, tenantId: ctx.tenantId } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    if (lesson.reviewerId !== requesterId) throw new ForbiddenException();

    return this.dataSource.transaction(async (manager) => {
      const last = await manager.findOne(LessonVersion, {
        where: { lessonId, tenantId: ctx.tenantId },
        order: { sequence: 'DESC' },
      });
      const sequence = (last?.sequence ?? 0) + 1;
      const v = manager.create(LessonVersion, {
        tenantId: ctx.tenantId,
        lessonId,
        sequence,
        payload,
        source: LessonVersionSource.METHODIST_EDIT,
        createdBy: requesterId,
        note: note ?? null,
      });
      const saved = await manager.save(LessonVersion, v);
      await manager.update(Lesson, lessonId, { currentVersionId: saved.id });
      return saved;
    });
  }
}
