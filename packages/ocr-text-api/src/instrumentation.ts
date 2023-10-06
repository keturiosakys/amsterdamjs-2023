import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ALL);

const sdk = new NodeSDK({
	traceExporter: new OTLPTraceExporter({
		url: "http://mutual-chickens.railway.internal:4317/v1/traces",
	}),
	instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
console.log("Tracing initialized");
