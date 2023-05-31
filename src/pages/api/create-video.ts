import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import prisma from "@lib/prisma";
import { verifyApiKey } from "@lib/header";

type Body = {
  talentId: string;
  urls: string[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check if the API key is provided in the request headers
  const apiKey: string | undefined = req.headers["x-api-key"]?.toString();

  // Verify if the API key is valid
  if (!apiKey) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Verify if the provided apiKey matches any of the bcrypt hashed keys
  const isKeyValid = verifyApiKey(apiKey);
  if (!isKeyValid) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "POST") {
    const { talentId, urls }: Body = req.body;

    try {
      // Delete existing videos for the Talent
      await prisma.video.deleteMany({
        where: {
          talentId,
        },
      });

      // Create new videos with the updated URLs
      const videos = await Promise.all(
        urls.map(async (url: string) => {
          const video = await prisma.video.create({
            data: {
              talentId,
              url,
              createdAt: new Date(),
            },
          });
          return video;
        })
      );

      return res
        .status(201)
        .json({ message: "Videos created successfully", videos });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error creating videos" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
