// import crypto from "node:crypto";
// import { NextResponse } from "next/server";
// import { getDb } from "@/lib/mongo";

// function isGmail(email: string) {
//   return email.toLowerCase().endsWith("@gmail.com");
// }

// export async function POST(request: Request) {
//   try {
//     const body = (await request.json()) as Record<string, string>;
//     const fullName = body.fullName?.trim();
//     const username = body.username?.trim();
//     const email = body.email?.trim().toLowerCase();
//     const phone = body.phone?.trim();
//     const password = body.password?.trim();

//     if (!fullName || !username || !email || !phone || !password) {
//       return NextResponse.json(
//         { message: "Vui lòng nhập đủ thông tin." },
//         { status: 400 },
//       );
//     }

//     if (!isGmail(email)) {
//       return NextResponse.json(
//         { message: "Email phải là @gmail.com." },
//         { status: 400 },
//       );
//     }

//     if (!/^\d{10}$/.test(phone)) {
//       return NextResponse.json(
//         { message: "Số điện thoại phải đủ 10 số." },
//         { status: 400 },
//       );
//     }

//     if (password.length < 6) {
//       return NextResponse.json(
//         { message: "Mật khẩu tối thiểu 6 ký tự." },
//         { status: 400 },
//       );
//     }

//     const db = await getDb();
//     const users = db.collection("users");

//     const existing = await users.findOne({
//       $or: [{ username }, { email }, { email: email?.toLowerCase() }],
//     });

//     if (existing) {
//       return NextResponse.json(
//         { message: "Tài khoản hoặc email đã tồn tại." },
//         { status: 409 },
//       );
//     }

//     const newUser = {
//       id: crypto.randomUUID(),
//       fullName,
//       username,
//       email,
//       phone,
//       password,
//       role: "user",
//       createdAt: new Date().toISOString(),
//     };

//     await users.insertOne(newUser);

//     const { password: _pw, ...safeUser } = newUser;
//     return NextResponse.json({ ok: true, user: safeUser });
//   } catch (error) {
//     const message =
//       error instanceof Error ? error.message : "Đăng ký thất bại.";
//     return NextResponse.json({ message }, { status: 500 });
//   }
// }




import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { readUsers, writeUsers } from "@/lib/userStore"; // ✅ dùng JSON

function isGmail(email: string) {
  return email.toLowerCase().endsWith("@gmail.com");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;

    const fullName = body.fullName?.trim();
    const username = body.username?.trim();
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim();
    const password = body.password?.trim();

    // validate
    if (!fullName || !username || !email || !phone || !password) {
      return NextResponse.json(
        { message: "Vui lòng nhập đủ thông tin." },
        { status: 400 }
      );
    }

    if (!isGmail(email)) {
      return NextResponse.json(
        { message: "Email phải là @gmail.com." },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { message: "Số điện thoại phải đủ 10 số." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Mật khẩu tối thiểu 6 ký tự." },
        { status: 400 }
      );
    }

    // ✅ ĐỌC FILE JSON
    const users = await readUsers();

    // check trùng
    const existing = users.find(
      (u) => u.email === email || u.username === username
    );

    if (existing) {
      return NextResponse.json(
        { message: "Tài khoản hoặc email đã tồn tại." },
        { status: 409 }
      );
    }

    // tạo user
    const newUser = {
      id: crypto.randomUUID(),
      fullName,
      username,
      email,
      phone,
      password,
      role: "user",
      createdAt: new Date().toISOString(),
    };

    // ✅ GHI FILE JSON
    users.push(newUser);
    await writeUsers(users);

    const { password: _pw, ...safeUser } = newUser;

    return NextResponse.json({ ok: true, user: safeUser });
  } catch (error) {
    return NextResponse.json(
      { message: "Đăng ký thất bại." },
      { status: 500 }
    );
  }
}