import {
	autometrics,
	Objective,
	ObjectivePercentile,
	ObjectiveLatency,
} from "@autometrics/autometrics";
import { init } from "@autometrics/exporter-prometheus";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { imageToText } from "@huggingface/inference";
import { Context, Hono } from "hono";
import { logger } from "hono/logger";
import { runOcr } from "./ocr";
import { unlink, writeFile } from "fs/promises";
import { File } from "buffer";

const app = new Hono();

init();

const accessToken = process.env.HF_TOKEN;

const model = "Salesforce/blip-image-captioning-large";

if (!accessToken) {
	throw new Error("Missing HF_TOKEN");
}

const AltTextSLO: Objective = {
	name: "AltTextSLO",
	successRate: ObjectivePercentile.P95,
	latency: [ObjectiveLatency.Ms2500, ObjectivePercentile.P90],
};

function handleRoot(ctx: Context) {
	return ctx.text("Hello Hono!");
}

async function handleImageCaptioning(ctx: Context) {
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

async function handleImageOcr(ctx: Context) {
	const body = await ctx.req.parseBody();
	const fullUrl = ctx.req.raw.url;
	const imageFile = body.image;

	if (!imageFile || !(imageFile instanceof File)) {
		return ctx.json({ error: "Missing image or image invalid format" }, 400);
	}

	const imageName = `${Date.now()}-${imageFile.name}`;
	const tmpUploadedImage = `tmp/${imageName}`;
	const tmpUrl = `${fullUrl}/${imageName}`;

	const imageData = new Uint8Array(await imageFile.arrayBuffer());

	await writeFile(tmpUploadedImage, imageData);

	const parsedText = await runOcr(tmpUrl, imageData);
	await unlink(tmpUploadedImage);

	return ctx.json(
		{
			ocr_text: parsedText,
		},
		200,
	);
}

app.get("/", (c) => c.text("Hello Hono!"));
app.get("/", autometrics(handleRoot));
app.post(
	"/api/image-captioning",
	autometrics(
		{ objective: AltTextSLO, trackConcurrency: true },
		handleImageCaptioning,
	),
);

app.post(
	"/api/image-ocr",
	autometrics(
		{ objective: AltTextSLO, trackConcurrency: true },
		handleImageOcr,
	),
);

app.use(
	"/api/image-ocr/*",
	serveStatic({
		root: "./tmp",
		rewriteRequestPath: (path) => path.replace("/api/image-ocr", ""),
	}),
);

app.use("*", logger());

const port = 8080;

serve({ port, fetch: app.fetch });
