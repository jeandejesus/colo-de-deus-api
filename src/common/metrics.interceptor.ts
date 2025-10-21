import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Histogram, register } from 'prom-client';

const httpRequestDurationMilliseconds = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duração das requisições HTTP em segundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5], // segundos
});

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const route = req.route?.path || req.url;
    const method = req.method;

    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const durationInSeconds = (Date.now() - start) / 1000;
        const res = context.switchToHttp().getResponse();
        const statusCode = res.statusCode;

        httpRequestDurationMilliseconds
          .labels(method, route, statusCode.toString())
          .observe(durationInSeconds);
      }),
    );
  }
}
