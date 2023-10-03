import { html } from "hono/html";

export const Layout = (props: { children: unknown }) => html`<!DOCTYPE html>
		<html>
			<head>
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<script src="https://unpkg.com/htmx.org@1.9.6"></script>
			<script src="https://cdn.tailwindcss.com"></script>
			<title>Image OCR and annotator</title>
			</head>
			<body>
			<main class="flex justify-center p-4">
				<div class="flex flex-col">
					<h1 class="text-4xl font-bold mb-4"><a href="/">OCR image</a></h1>
					${props.children}
				</div>
			</main>
			</body>
		</html>`;

export const FileUpload = () => {
	return (
		<Layout>
			<form
				id="form"
				hx-encoding="multipart/form-data"
				hx-post="/api/image-ocr"
				hx-target="#result"
			>
				<input type="file" name="image" accept="image/png, image/jpeg" />
				<button type="submit">Upload</button>
			</form>
			<div id="result" class="max-w-prose" />
		</Layout>
	);
};
