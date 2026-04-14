import { promises as fs } from "fs";
import path from "path";

export type StoredUser = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  password: string;
  createdAt: string;
};

const usersFilePath = path.join(process.cwd(), "src", "data", "users.json");

async function ensureUsersFile() {
  await fs.mkdir(path.dirname(usersFilePath), { recursive: true });

  try {
    await fs.access(usersFilePath);
  } catch {
    await fs.writeFile(usersFilePath, "[]", "utf8");
  }
}

export async function readUsers(): Promise<StoredUser[]> {
  await ensureUsersFile();

  const content = await fs.readFile(usersFilePath, "utf8");

  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeUsers(users: StoredUser[]) {
  await ensureUsersFile();
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), "utf8");
}

export function getUsersFilePathLabel() {
  return "src/data/users.json";
}
