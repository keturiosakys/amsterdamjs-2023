import { File } from "node:buffer";
import {
	autometrics,
	Objective,
	ObjectivePercentile,
	ObjectiveLatency,
} from "@autometrics/autometrics";
import { init } from "@autometrics/exporter-prometheus";
import { serve } from "@hono/node-server";
import { imageToText } from "@huggingface/inference";
import { Context, Hono } from "hono";
import { logger } from "hono/logger";

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

async function handleImage(ctx: Context) {
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

app.get("/", (c) => c.text("Hello Hono!"));
app.get("/", autometrics(handleRoot));
app.post(
	"/api/image",
	autometrics({ objective: AltTextSLO, trackConcurrency: true }, handleImage),
);
app.use("*", logger());

const port = 8080;

serve({ port, fetch: app.fetch });
