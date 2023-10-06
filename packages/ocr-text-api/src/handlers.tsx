import { Context } from "hono";
import { runOcr } from "./ocr.js";
import { FileUpload } from "./components.js";
import { trace } from "@opentelemetry/api";

const tracer = trace.getTracer("image-ocr");

export async function handleRoot(ctx: Context) {
	return ctx.html(<FileUpload />);
}

export async function handleImageOcr(ctx: Context) {
	let activeSpan = trace.getActiveSpan();
	if (!activeSpan) {
		activeSpan = tracer.startSpan("handleImageOcr");
	}
	try {
		const body = await ctx.req.parseBody();
		const imageFile = body.image;

		if (!imageFile || !(imageFile instanceof File)) {
			return ctx.html("<h1>400 dawg, check your request</h1>", 400);
		}

		activeSpan.setAttribute("file.size", body.image.length);

		const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
		const parsedText = await runOcr(imageBuffer);

		if (activeSpan) activeSpan.end();
		return ctx.html(parsedText, 200);
	} catch (error) {
		console.error(error);
		if (activeSpan) activeSpan.end();
		return ctx.html("<h1>500 dawg, check your server</h1>", 500);
	}
}
