import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import prisma from "@lib/prisma";
import validApiKeys from "@lib/header";

type Body = {
  email: string;
  password: string;
};

type Account = {
  password: string | null;
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
  const validKey = await Promise.any(
    validApiKeys.map((key) => bcrypt.compare(apiKey, key))
  );

  if (!validKey) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ message: "Method not allowed", isLogin: false });
  }

  try {
    const { email, password }: Body = req.body;

    // Check if the required fields are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Missing email or password", isLogin: false });
    }

    // Retrieve the user by email
    const user = await prisma.user.findUnique({ where: { email } });

    // Check if the user exists
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid email or password", isLogin: false });
    }

    // Retrieve the user account by userId
    const account: Account | null = await prisma.account.findUnique({
      where: { userId: user.id },
    });

    // Compare the provided password with the hashed password
    const passwordMatch = await bcrypt.compare(
      password,
      account?.password ?? ""
    );

    // Check if the passwords match
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ message: "Invalid email or password", isLogin: false });
    }

    return res
      .status(200)
      .json({ message: "Login successful", isLogin: true, user });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error logging in", isLogin: false });
  }
}
