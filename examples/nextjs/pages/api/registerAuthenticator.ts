// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  try {
    const API_SECRET = process.env.AUTHNID_API_SECRET || "<your-api-secret>";
    const apiUrl = "https://api.authnid.dev/v1";

    const body = {
      userId: getRandomInt(999999999).toString(),
      username: req.query.username as string,
      displayName: "John Doe",
    };

    const response = await fetch(apiUrl + "/register/authenticator", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "x-authnid-api-secret": API_SECRET,
        "Content-Type": "application/json",
      },
    });

    const token = await response.text();

    return res.status(200).send(token);
  } catch (error) {
    res.status(500).send("");
  }
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}
