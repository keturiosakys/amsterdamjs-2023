import {
	Objective,
	ObjectiveLatency,
	ObjectivePercentile,
	autometrics,
} from "@autometrics/autometrics";
import { init } from "@autometrics/exporter-prometheus";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Context, Hono } from "hono";
import { logger } from "hono/logger";
import { handleImageCaptioning, handleImageOcr, handleRoot } from "./handlers";
import { mode, volumePath } from "./util";

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

app.use(
	"/api/image-ocr/*",
	serveStatic({
		root: mode === "production" ? volumePath : "./tmp",
		rewriteRequestPath: (path) => path.replace("/api/image-ocr", ""),
	}),
);

app.use("*", logger());

const port = 8080;

serve({ port, fetch: app.fetch });
