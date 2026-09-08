import * as Sentry from '@sentry/nextjs';
import { glitchtipOptions } from './lib/monitoring/glitchtip';

Sentry.init(glitchtipOptions);
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
