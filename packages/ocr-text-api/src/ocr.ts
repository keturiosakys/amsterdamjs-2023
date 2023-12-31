import { createWorker } from "tesseract.js";
import { tracer } from "./instrumentation.js";
import { SpanStatusCode } from "@opentelemetry/api";

export type ImageProperties = {
	width: number;
	height: number;
	name: string;
};

export const runOcr = async function runOcr(imageBuffer: Buffer) {
	return tracer.startActiveSpan("runOcr", async (activeSpan) => {
		try {
			const worker = await createWorker("eng", 1);

			const {
				data: { text },
			} = await worker.recognize(imageBuffer);

			return text;
		} catch (error) {
			if (typeof error === "object" && error !== null) {
				const err = error as Error;
				activeSpan.setStatus({
					code: SpanStatusCode.ERROR,
					message: err.message,
				});
			}
		} finally {
			activeSpan.end();
		}
	});
};
