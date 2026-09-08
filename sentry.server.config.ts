import * as Sentry from '@sentry/nextjs';
import { glitchtipOptions } from './lib/monitoring/glitchtip';

Sentry.init({
  ...glitchtipOptions,
  dsn: process.env.GLITCHTIP_DSN ?? glitchtipOptions.dsn,
});
