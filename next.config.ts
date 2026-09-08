import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs/config';

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  sentryUrl: 'https://errors.propulseo-site.com',
  org: 'propulseo',
  project: 'servicimmo',
  authToken: process.env.GLITCHTIP_AUTH_TOKEN,
  sourcemaps: { disable: !process.env.GLITCHTIP_AUTH_TOKEN },
  telemetry: false,
  silent: !process.env.CI,
});
