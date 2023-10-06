import "./instrumentation.js";
import { serve } from "@hono/node-server";
import { logger } from "hono/logger";
import { handleImageOcr, handleRoot } from "./handlers.js";
import { Hono } from "hono";

const app = new Hono();

app.get("/", handleRoot);

app.post("/api/image-ocr", handleImageOcr);

app.use("*", logger());

const port = 8080;

serve({ port, fetch: app.fetch });
