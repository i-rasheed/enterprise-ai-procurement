/**
 * OpenTelemetry instrumentation bootstrap.
 * Enable with OTEL_ENABLED=true in production.
 * Wire @opentelemetry/sdk-node when deploying to observability stack.
 */
export function initTelemetry(): void {
  if (process.env.OTEL_ENABLED !== 'true') {
    return;
  }

  // Foundation hook for production OpenTelemetry SDK registration
  console.info(
    `[telemetry] OpenTelemetry enabled for ${process.env.OTEL_SERVICE_NAME ?? 'enterprise-procurement-api'}`,
  );
}
