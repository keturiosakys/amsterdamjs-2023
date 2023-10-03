export const mode = process.env.NODE_ENV ?? "";
export const volumePath = process.env.RAILWAY_VOLUME_MOUNT_PATH ?? "";

export const accessToken = process.env.HF_TOKEN;
export const model = "Salesforce/blip-image-captioning-large";

export class Logger {
	public log(...args: unknown[]) {
		console.log(`[ImageOCR]: ${args}`);
	}

	public error(...args: unknown[]) {
		console.error(`[ImageOCR]: ${args}`);
	}
}

export const ocrLogger = new Logger();