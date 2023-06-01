import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import prisma from "@lib/prisma";
import { verifyApiKey } from "@lib/header";
import { table } from "console";

type Body = {
  firstName: string;
  middleName?: string;
  lastName: string;
  birthdate: string;
  gender: string;
  talent: string;
  email: string;
  password: string;
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

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    firstName,
    middleName,
    lastName,
    birthdate,
    gender,
    talent,
    email,
    password,
  }: Body = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const profileURL: string =
      gender === "male"
        ? "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg"
        : "https://static.vecteezy.com/system/resources/previews/006/898/692/non_2x/avatar-face-icon-female-social-profile-of-business-woman-woman-portrait-support-service-call-center-illustration-free-vector.jpg";

    const user = await prisma.user.create({
      data: {
        firstName,
        middleName,
        lastName,
        birthdate,
        gender,
        email,
        createdAt: new Date(),
        account: {
          create: {
            password: hashedPassword,
            createdAt: new Date(),
          },
        },
        talent: {
          create: {
            profileURL: profileURL,
            talentType: talent,
            createdAt: new Date(),
          },
        },
      },
    });

    return res
      .status(201)
      .json({ message: "User registered successfully", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error registering user" });
  }
}
