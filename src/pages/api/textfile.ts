import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import FormData from "form-data";
import httpProxyMiddleware from "next-http-proxy-middleware";

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  httpProxyMiddleware(req, res, {
    target: "http://3.145.17.29:8443/",
  });
};

export default handler;
//`http://3.145.17.29:8443/text?folderName=${folderName}
