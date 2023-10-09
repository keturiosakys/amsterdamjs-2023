import {
	DiagConsoleLogger,
	DiagLogLevel,
	diag,
	trace,
} from "@opentelemetry/api";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { Resource } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { mode } from "./util.js";
import {
	PeriodicExportingMetricReader,
	ConsoleMetricExporter,
} from "@opentelemetry/sdk-metrics";

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ALL);

const exportEndpoint =
	mode === "prod"
		? "http://mutual-chickens.railway.internal:4318"
		: "http://localhost:4318";

const sdk = new NodeSDK({
	metricReader: new PeriodicExportingMetricReader({
		exporter: new ConsoleMetricExporter(),
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
	resource: new Resource({
		"service.name": "hono-ocr",
	}),
});

sdk.start();

export const tracer = trace.getTracer("image-ocr");

diag.info(`Tracing endpoint: ${exportEndpoint}`);
diag.info("Tracing initialized");
