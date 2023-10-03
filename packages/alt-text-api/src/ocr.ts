import { autometrics } from "@autometrics/autometrics";
import sharp from "sharp";
import { createWorker } from "tesseract.js";

export type ImageProperties = {
	width: number;
	height: number;
	name: string;
};

export const runOcr = autometrics(async function runOcr(
	imageFilePath: string,
	imageData: Uint8Array,
) {
	const image = sharp(imageData);
	const { width, height } = await image.metadata();

	if (!width || !height) throw new Error("Couldn't get image metadata");

	const worker = await createWorker("eng", 1, {
		logger: (m) => console.log(m),
	});

	const {
		data: { text },
	} = await worker.recognize(imageFilePath);

	return text;
});
