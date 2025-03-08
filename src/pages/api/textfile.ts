import { NextApiRequest, NextApiResponse } from "next";
import httpProxyMiddleware from "next-http-proxy-middleware";

export const config = {
	api: {
		bodyParser: false,
	},
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
	httpProxyMiddleware(req, res, {
		target: process.env.NEXT_PUBLIC_DEVELOPMENT_SERVER_URL,
	});
};

export default handler;
