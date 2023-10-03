import { unlink, writeFile } from "fs/promises";
import { Context } from "hono";
import { runOcr } from "./ocr";
import { imageToText } from "@huggingface/inference";
import { FileUpload } from "./components";
import { Logger, accessToken, mode, model, ocrLogger } from "./util";


if (!accessToken) {
	throw new Error("Missing HF_TOKEN");
}

export async function handleRoot(ctx: Context) {
	return ctx.html(<FileUpload />);
}

export async function handleImageOcr(ctx: Context) {
	const body = await ctx.req.parseBody();
	const fullUrl = ctx.req.raw.url;
	const imageFile = body.image;

	if (!imageFile || !(imageFile instanceof File)) {
		return ctx.html("<h1>400 dawg, check your request</h1>", 400);
	}

	const imageName = `${Date.now()}-${imageFile.name}`;
	const tmpDir = mode === "production" ? "/tmp" : "./tmp";
	const tmpUploadedImage = `${tmpDir}/${imageName}`;
	const tmpUrl = `${fullUrl}/${imageName}`;

	const imageData = new Uint8Array(await imageFile.arrayBuffer());

	await writeFile(tmpUploadedImage, imageData);
	ocrLogger.log("Wrote image to tmp: ", tmpUploadedImage);

	const parsedText = await runOcr(tmpUrl, imageData);
	ocrLogger.log("Got parsed text, deleting image");
	await unlink(tmpUploadedImage);
	ocrLogger.log("Deleted image")

	return ctx.html(
		parsedText,
		200,
	);
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
