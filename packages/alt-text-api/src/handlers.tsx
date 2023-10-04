import { unlink, writeFile } from "fs/promises";
import { Context } from "hono";
import { runOcr } from "./ocr";
import { imageToText } from "@huggingface/inference";
import { FileUpload } from "./components";
import { accessToken, model } from "./util";

if (!accessToken) {
	throw new Error("Missing HF_TOKEN");
}

export async function handleRoot(ctx: Context) {
	return ctx.html(<FileUpload />);
}

export async function handleImageOcr(ctx: Context) {
	try {
		const body = await ctx.req.parseBody();
		const imageFile = body.image;

		if (!imageFile || !(imageFile instanceof File)) {
			return ctx.html("<h1>400 dawg, check your request</h1>", 400);
		}

		const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
		const parsedText = await runOcr(imageBuffer);

		return ctx.html(parsedText, 200);
	} catch (error) {
		console.error(error);
		return ctx.html("<h1>500 dawg, check your server</h1>", 500);
	}
}

export async function handleImageCaptioning(ctx: Context) {
	const body = await ctx.req.parseBody();
	const image = body.image;

	if (!image || !(image instanceof File)) {
		return ctx.json({ error: "Missing image or image invalid format" }, 400);
	}

	const imageData = await image.arrayBuffer();

	const { generated_text } = await imageToText({
		model,
		data: imageData,
		accessToken: accessToken,
	});

	return ctx.json(
		{
			image_caption: generated_text,
		},
		200,
	);
}
