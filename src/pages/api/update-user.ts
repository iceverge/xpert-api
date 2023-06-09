import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import prisma from "@lib/prisma";
import { verifyApiKey } from "@lib/header";

type Body = {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  birthdate: string;
  gender: string;
  email: string;
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

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    id,
    firstName,
    middleName,
    lastName,
    birthdate,
    gender,
    email,
  }: Body = req.body;

  try {
    const profileURL: string =
      gender === "male"
        ? "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg"
        : "https://static.vecteezy.com/system/resources/previews/006/898/692/non_2x/avatar-face-icon-female-social-profile-of-business-woman-woman-portrait-support-service-call-center-illustration-free-vector.jpg";

    const userProfile = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        middleName,
        lastName,
        birthdate,
        gender,
        email,
        updatedAt: new Date(),
        talent: {
          update: {
            profileURL: profileURL,
            updatedAt: new Date(),
          },
        },
      },
    });

    return res
      .status(200)
      .json({ message: "Profile updated successfully", userProfile });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating profile" });
  }
}
