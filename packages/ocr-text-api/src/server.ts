import "./instrumentation.js";
import { serve } from "@hono/node-server";
import { init } from "@autometrics/exporter-prometheus";
import {
	autometrics,
	Objective,
	ObjectiveLatency,
	ObjectivePercentile,
} from "@autometrics/autometrics";
import { logger } from "hono/logger";
import { handleImageOcr, handleRoot } from "./handlers.js";
import { Hono } from "hono";

const app = new Hono();

const OcrSLO: Objective = {
	name: "ocr_SLO",
	successRate: ObjectivePercentile.P99_9,
	latency: [ObjectiveLatency.Ms250, ObjectivePercentile.P99],
};

app.get("/", autometrics({ objective: OcrSLO }, handleRoot));
app.post("/api/image-ocr", autometrics({ objective: OcrSLO }, handleImageOcr));

app.use("*", logger());

const port = 8080;

serve({ port, fetch: app.fetch });
