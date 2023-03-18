import { NextApiRequest, NextApiResponse } from "next";

const Handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const chatInput = req.query.chatInput;
    const selectedContext = req.query.selectedContext;

    if (!token) {
      res.status(300).json({ message: "Not a valid token" });
    }

    const response = await fetch(
      `http://3.145.17.29/context?question=${chatInput}&spacename=${selectedContext}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
