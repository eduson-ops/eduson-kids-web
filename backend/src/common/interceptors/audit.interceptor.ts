import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { AuditService } from '../../modules/audit/audit.service';

interface AuthenticatedRequest extends Request {
  user?: { sub: string; role: string };
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (req.method === 'GET') {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        const userId = req.user?.sub;
        const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip ?? '';
        const userAgent = req.headers['user-agent'] ?? '';
        const [, , resourceType, resourceId] = req.path.split('/').filter(Boolean);

        void this.auditService.log({
          userId: userId ?? null,
          action: `${req.method} ${req.path}`,
          resourceType: resourceType ?? req.path,
          resourceId: resourceId ?? null,
          ip,
          userAgent,
        });
      }),
    );
  }
}
