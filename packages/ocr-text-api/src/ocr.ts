import { createWorker } from "tesseract.js";
import { tracer } from "./handlers.js";

export type ImageProperties = {
	width: number;
	height: number;
	name: string;
};

export const runOcr = async function runOcr(imageBuffer: Buffer) {
	return tracer.startActiveSpan("runOcr", async (activeSpan) => {
		const worker = await createWorker("eng", 1);

		const {
			data: { text },
			} = await worker.recognize(imageBuffer);

		return text;
	});
};
