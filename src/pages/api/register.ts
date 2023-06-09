import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import prisma from "@lib/prisma";
import { verifyApiKey } from "@lib/header";

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

export const config = {
  api: {
    bodyParser: false,
  },
};

// Parse the request body
const jsonParser = bodyParser.json();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  jsonParser(req, res, async () => {
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
    } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const profileURL: string =
        gender.toLowerCase() === "male"
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
  });
}
