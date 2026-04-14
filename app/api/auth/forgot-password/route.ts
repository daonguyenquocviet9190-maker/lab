import { promises as fs } from "fs";
import path from "path";

import { NextResponse } from "next/server";

type StoredUser = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  password: string;
  createdAt: string;
};

const USERS_FILE_PATH = path.join(process.cwd(), "src", "data", "users.json");

async function readUsers() {
  try {
    const raw = await fs.readFile(USERS_FILE_PATH, "utf8");
    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? (parsed as StoredUser[]) : [];
  } catch {
    return [];
  }
}

async function writeUsers(users: StoredUser[]) {
  await fs.writeFile(USERS_FILE_PATH, `${JSON.stringify(users, null, 2)}\n`, "utf8");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const newPassword = String(body?.newPassword ?? "");
    const confirmPassword = String(body?.confirmPassword ?? "");

    if (!email || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "Vui lòng nhập email và mật khẩu mới." },
        { status: 400 },
      );
    }

    if (!email.endsWith("@gmail.com")) {
      return NextResponse.json(
        { error: "Email phải dùng đuôi @gmail.com." },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải có ít nhất 6 ký tự." },
        { status: 400 },
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Nhập lại mật khẩu mới chưa khớp." },
        { status: 400 },
      );
    }

    const users = await readUsers();
    const userIndex = users.findIndex(
      (item) => item.email.trim().toLowerCase() === email,
    );

    if (userIndex === -1) {
      return NextResponse.json(
        { error: "Không tìm thấy tài khoản với email này." },
        { status: 404 },
      );
    }

    users[userIndex] = {
      ...users[userIndex],
      password: newPassword,
    };

    await writeUsers(users);

    return NextResponse.json({
      success: true,
      message: "Đổi mật khẩu thành công.",
    });
  } catch {
    return NextResponse.json(
      { error: "Không thể đặt lại mật khẩu lúc này." },
      { status: 500 },
    );
  }
}
