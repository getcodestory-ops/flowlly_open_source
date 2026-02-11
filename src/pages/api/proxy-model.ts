import { NextApiRequest, NextApiResponse } from "next";

export const config = {
	api: {
		responseLimit: "100mb",
	},
};

/**
 * Proxy route for fetching 3D model files (GLB/GLTF) from GCS.
 * 
 * Three.js uses fetch() internally to load models, which triggers CORS.
 * GCS signed URLs may not have CORS headers configured for the app's origin.
 * This proxy fetches the file server-side (no CORS) and returns it to the client.
 *
 * Usage: GET /api/proxy-model?url=<encoded-gcs-signed-url>
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	const { url } = req.query;

	if (!url || typeof url !== "string") {
		return res.status(400).json({ error: "Missing url parameter" });
	}

	// Only allow proxying from trusted GCS domains
	try {
		const parsedUrl = new URL(url);
		const allowedHosts = ["storage.googleapis.com", "storage.cloud.google.com"];
		if (!allowedHosts.includes(parsedUrl.hostname)) {
			return res.status(403).json({ error: "URL host not allowed" });
		}
	} catch {
		return res.status(400).json({ error: "Invalid URL" });
	}

	try {
		const response = await fetch(url);

		if (!response.ok) {
			return res.status(response.status).json({ 
				error: `Upstream returned ${response.status}` 
			});
		}

		const contentType = response.headers.get("content-type") || "application/octet-stream";
		const buffer = await response.arrayBuffer();

		res.setHeader("Content-Type", contentType);
		res.setHeader("Cache-Control", "public, max-age=3600");
		res.send(Buffer.from(buffer));
	} catch (error) {
		console.error("Proxy model fetch error:", error);
		res.status(502).json({ error: "Failed to fetch model from storage" });
	}
};

export default handler;
