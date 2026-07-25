/**
 * Telemetry domain barrel (TDD Part 5 §7.1). Pure mapping plus the TelemetryAdapter port. Nothing
 * here imports the data layer or a vendor SDK (dependency direction, TDD Part 1 §5); the adapter
 * singleton is composed in `src/data/telemetryAdapter.ts`.
 */
export {
  CLIENT_ERROR_EVENT_ID,
  isErrorCode,
  toClientErrorEvent,
  toErrorCode,
  type ClientErrorEvent,
  type ClientErrorEventProps,
} from './telemetry';
export {
  NullTelemetryAdapter,
  type TelemetryAdapter,
  type TelemetryBreadcrumb,
  type TelemetryErrorReport,
  type TelemetrySurface,
} from './TelemetryAdapter';
