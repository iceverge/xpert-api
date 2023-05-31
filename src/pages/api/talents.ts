import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import prisma from "@lib/prisma";
import validApiKeys from "@lib/header";

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
  const validKey = await Promise.any(
    validApiKeys.map((key) => bcrypt.compare(apiKey, key))
  );

  if (!validKey) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const talents = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        talent: {
          select: {
            id: true,
            profileURL: true,
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
