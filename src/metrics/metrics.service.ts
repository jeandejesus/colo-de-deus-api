import { Injectable } from '@nestjs/common';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class MetricsService {
  requestCounter = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
  });

  responseTime = new Histogram({
    name: 'http_response_time_seconds',
    help: 'HTTP response time in seconds',
    labelNames: ['method', 'route', 'status'],
  });

  incrementRequest(method: string, route: string, status: number) {
    this.requestCounter.labels(method, route, status.toString()).inc();
  }

  observeResponseTime(
    method: string,
    route: string,
    status: number,
    time: number,
  ) {
    this.responseTime.labels(method, route, status.toString()).observe(time);
  }
}
