import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import prisma from "@lib/prisma";
import { verifyApiKey } from "@lib/header";

type Body = {
  userId: string;
  profileURL: string;
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

  const { userId, profileURL }: Body = req.body;
  try {
    const talent = await prisma.talent.upsert({
      where: { userId },
      update: {
        profileURL,
        updatedAt: new Date(),
      },
      create: {
        userId,
        profileURL,
        createdAt: new Date(),
      },
    });

    return res
      .status(201)
      .json({ message: "Profile created successfully", talent });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creating talent" });
  }
}
