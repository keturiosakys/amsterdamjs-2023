import {
	Objective,
	ObjectiveLatency,
	ObjectivePercentile,
	autometrics,
} from "@autometrics/autometrics";
import { init } from "@autometrics/exporter-prometheus";
import { serve } from "@hono/node-server";
import { logger } from "hono/logger";
import { handleImageOcr, handleRoot } from "./handlers";
import { Hono } from "hono";

const app = new Hono();

init();

const OcrTextSLO: Objective = {
	name: "OcrTextSLO",
	successRate: ObjectivePercentile.P95,
	latency: [ObjectiveLatency.Ms250, ObjectivePercentile.P90],
};

app.get("/", autometrics(handleRoot));

app.post(
	"/api/image-ocr",
	autometrics(
		{ objective: OcrTextSLO, trackConcurrency: true },
		handleImageOcr,
	),
);

app.use("*", logger());

const port = 8080;

serve({ port, fetch: app.fetch });
