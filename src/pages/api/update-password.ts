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

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { userId, password }: { userId: string; password: string } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedAccount = await prisma.account.update({
      where: { userId },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    return res
      .status(200)
      .json({ message: "Password updated successfully", updatedAccount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating account" });
  }
}
