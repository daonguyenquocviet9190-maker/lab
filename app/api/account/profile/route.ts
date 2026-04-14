import { NextResponse } from "next/server";
import { repairVietnameseText } from "@/lib/repairVietnameseText";
import { promises as fs } from "fs";
import path from "path";

const usersPath = path.join(process.cwd(), "src", "data", "users.json");

type StoredUser = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  role?: "admin" | "user";
  createdAt: string;
};

function isValidPhone(value: string) {
  return /^\d{10}$/.test(value);
}

function isValidGmail(value: string) {
  return /^[^\s@]+@gmail\.com$/i.test(value);
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as Partial<StoredUser> & { id?: string };

  const id = body.id?.trim();
  const fullName = body.fullName?.trim() ?? "";
  const username = body.username?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const phone = body.phone?.trim() ?? "";
  const password = body.password?.trim() ?? "";

  if (!id) {
    return NextResponse.json({ message: "Thiếu id tài khoản." }, { status: 400 });
  }

  if (!fullName || !username || !email || !phone) {
    return NextResponse.json({ message: "Vui lòng nhập đầy đủ thông tin." }, { status: 400 });
  }

  if (!isValidGmail(email)) {
    return NextResponse.json({ message: "Email phải là địa chỉ @gmail.com." }, { status: 400 });
  }

  if (!isValidPhone(phone)) {
    return NextResponse.json({ message: "Số điện thoại phải đủ 10 số." }, { status: 400 });
  }

  if (password && password.length < 6) {
    return NextResponse.json({ message: "Mật khẩu phải từ 6 ký tự." }, { status: 400 });
  }

  const raw = await fs.readFile(usersPath, "utf8");
  const users = JSON.parse(raw) as StoredUser[];
  const index = users.findIndex((user) => user.id === id);

  if (index < 0) {
    return NextResponse.json({ message: "Không tìm thấy tài khoản." }, { status: 404 });
  }

  const duplicateUsername = users.find(
    (user) => user.id !== id && user.username.trim().toLowerCase() === username.toLowerCase(),
  );
  if (duplicateUsername) {
    return NextResponse.json({ message: "Tài khoản này đã tồn tại." }, { status: 409 });
  }

  const duplicateEmail = users.find(
    (user) => user.id !== id && user.email.trim().toLowerCase() === email,
  );
  if (duplicateEmail) {
    return NextResponse.json({ message: "Email này đã tồn tại." }, { status: 409 });
  }

  const current = users[index];
  const nextUser: StoredUser = {
    ...current,
    fullName,
    username,
    email,
    phone,
    password: password || current.password,
  };

  users[index] = nextUser;
  await fs.writeFile(usersPath, JSON.stringify(users, null, 2), "utf8");

  return NextResponse.json({
    message: "Đã cập nhật hồ sơ.",
    user: nextUser,
  });
}
