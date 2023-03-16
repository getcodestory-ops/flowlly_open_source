import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import FormData from "form-data";

const Handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(300).json({ message: "Not a valid token" });
    }

    const folderName = req.query.folderName;
    console.log(req.body);

    const response = await fetch(
      `http://3.145.17.29:8443/text?folderName=${folderName}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: req.body,
      }
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default Handler;
