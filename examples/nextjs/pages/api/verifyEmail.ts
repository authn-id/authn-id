// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const API_SECRET = process.env.AUTHNID_API_SECRET || "<your-api-secret>";
    const apiUrl = "https://api.authnid.dev/v1";

    const { token } = req.query as { token: string };

    const response = await fetch(apiUrl + "/verify/token", {
      method: "POST",
      body: token,
      headers: {
        "x-authnid-api-secret": API_SECRET,
        "Content-Type": "text/plain",
      },
    });

    var result = await response.json();
    if (result.success) {
      console.log("Success!");
    }

    return res.status(200).json(result);
  } catch (error) {
    res.status(200).json({ success: false });
  }
}
