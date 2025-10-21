import { Cron } from '@nestjs/schedule';
import { Counter, Gauge } from 'prom-client';

const cronSuccessCounter = new Counter({
  name: 'cronjob_success_total',
  help: 'Número total de execuções bem-sucedidas de cron jobs',
  labelNames: ['job'],
});

const cronFailureCounter = new Counter({
  name: 'cronjob_failure_total',
  help: 'Número total de falhas em cron jobs',
  labelNames: ['job'],
});

const cronLastExecution = new Gauge({
  name: 'cronjob_last_execution_timestamp',
  help: 'Timestamp da última execução de cron jobs',
  labelNames: ['job'],
});

export function MonitoredCron(cronTime: string, options?: any) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    Cron(cronTime, options)(target, propertyKey, descriptor);

    descriptor.value = async function (...args: any[]) {
      const jobName = propertyKey; // pega o nome do método como nome do job
      try {
        const result = await originalMethod.apply(this, args);
        cronSuccessCounter.inc({ job: jobName });
        cronLastExecution.set({ job: jobName }, Math.floor(Date.now() / 1000));
        return result;
      } catch (error) {
        cronFailureCounter.inc({ job: jobName });
        throw error;
      }
    };
  };
}
