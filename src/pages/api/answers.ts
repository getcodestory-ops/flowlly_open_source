import { NextApiRequest, NextApiResponse } from "next";

const Handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const context = req.body;
    const question = req.query.question;

    if (!token) {
      res.status(300).json({ message: "Not a valid token" });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/answers_next?question=${question}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: context,
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
