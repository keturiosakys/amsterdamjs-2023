import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ALL);

const exportEndpoint = "http://mutual-chickens.railway.internal:4318";

const sdk = new NodeSDK({
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
