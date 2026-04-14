// import { NextResponse } from "next/server";
// import { getDb } from "@/lib/mongo";

// export async function POST(request: Request) {
//   try {
//     const body = (await request.json()) as Record<string, string>;
//     const identifier =
//       body.identifier?.trim() ||
//       body.email?.trim() ||
//       body.username?.trim();
//     const password = body.password?.trim();

//     if (!identifier || !password) {
//       return NextResponse.json(
//         { message: "Vui lòng nhập tài khoản và mật khẩu." },
//         { status: 400 },
//       );
//     }

//     const db = await getDb();
//     const users = db.collection("users");
//     const user = await users.findOne({
//       $or: [
//         { username: identifier },
//         { email: identifier?.toLowerCase() },
//         { email: identifier },
//       ],
//     });

//     if (!user || user.password !== password) {
//       return NextResponse.json(
//         { message: "Sai tài khoản hoặc mật khẩu." },
//         { status: 401 },
//       );
//     }

//     const { password: _pw, ...safeUser } = user as Record<string, unknown>;
//     return NextResponse.json({ ok: true, user: safeUser });
//   } catch (error) {
//     const message =
//       error instanceof Error ? error.message : "Đăng nhập thất bại.";
//     return NextResponse.json({ message }, { status: 500 });
//   }
// }




import { NextResponse } from "next/server";
import { readUsers } from "@/lib/userStore"; // ✅ dùng JSON

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;

    const identifier =
      body.identifier?.trim() ||
      body.email?.trim() ||
      body.username?.trim();

    const password = body.password?.trim();

    if (!identifier || !password) {
      return NextResponse.json(
        { message: "Vui lòng nhập tài khoản và mật khẩu." },
        { status: 400 }
      );
    }

    // ✅ đọc file JSON
    const users = await readUsers();

    // tìm user theo email hoặc username
    const user = users.find(
      (u) =>
        u.username === identifier ||
        u.email === identifier.toLowerCase()
    );

    if (!user || user.password !== password) {
      return NextResponse.json(
        { message: "Sai tài khoản hoặc mật khẩu." },
        { status: 401 }
      );
    }

    // bỏ password khi trả về
    const { password: _pw, ...safeUser } = user;

    return NextResponse.json({ ok: true, user: safeUser });
  } catch (error) {
    return NextResponse.json(
      { message: "Đăng nhập thất bại." },
      { status: 500 }
    );
  }
}