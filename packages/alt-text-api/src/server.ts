import {
	Objective,
	ObjectiveLatency,
	ObjectivePercentile,
	autometrics,
} from "@autometrics/autometrics";
import { init } from "@autometrics/exporter-prometheus";
import { serve } from "@hono/node-server";
import { logger } from "hono/logger";
import { handleImageCaptioning, handleImageOcr, handleRoot } from "./handlers";
import { Hono } from "hono";

const app = new Hono();

init();

const AltTextSLO: Objective = {
	name: "AltTextSLO",
	successRate: ObjectivePercentile.P95,
	latency: [ObjectiveLatency.Ms2500, ObjectivePercentile.P90],
};

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

app.use("*", logger());

const port = 8080;

serve({ port, fetch: app.fetch });
