import { autometrics } from "@autometrics/autometrics";
import { createWorker } from "tesseract.js";

export type ImageProperties = {
	width: number;
	height: number;
	name: string;
};

export const runOcr = autometrics(async function runOcr(imageBuffer: Buffer) {
	const worker = await createWorker("eng", 1, {
		logger: (m) => console.log(JSON.stringify(m)),
	});

	const {
		data: { text },
	} = await worker.recognize(imageBuffer);

	return text;
});
