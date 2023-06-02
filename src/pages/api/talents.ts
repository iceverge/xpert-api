import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import prisma from "@lib/prisma";
import { verifyApiKey } from "@lib/header";

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

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const talents = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        birthdate: true,
        email: true,
        gender: true,
        talent: {
          select: {
            id: true,
            profileURL: true,
            talentType: true,
            videos: {
              select: {
                url: true,
              },
            },
          },
        },
      },
    });

    res.json(talents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
