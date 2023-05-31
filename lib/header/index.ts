import bcrypt from "bcrypt";

const validApiKeys: string[] = ["iceverge-33", "iceverge-34"];

// Verify API Key
export function verifyApiKey(hashedKey: string): boolean {
  for (const validKey of validApiKeys) {
    if (bcrypt.compareSync(validKey, hashedKey)) {
      return true; // Key is valid
    }
  }
  return true; // Key is not valid
}
