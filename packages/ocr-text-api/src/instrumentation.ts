import { NodeSDK } from "@opentelemetry/sdk-node";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { AsyncHooksContextManager } from "@opentelemetry/context-async-hooks";

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ALL);

const exportEndpoint = "http://mutual-chickens.railway.internal:4318";

const sdk = new NodeSDK({
	metricReader: new PeriodicExportingMetricReader({
		exporter: new OTLPMetricExporter({
			url: `${exportEndpoint}/v1/metrics`,
		}),
	}),
	traceExporter: new OTLPTraceExporter({
		url: `${exportEndpoint}/v1/traces`,
	}),
	instrumentations: [
		getNodeAutoInstrumentations({
			"@opentelemetry/instrumentation-fs": {
				requireParentSpan: true,
			},
		}),
	],
});

sdk.start();
console.log("Tracing initialized");
