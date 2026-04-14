import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "node:crypto";

const filePath = path.join(process.cwd(),"src", "data", "products.json");

// ================= READ =================
function readData() {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error("READ ERROR:", error);
    return [];
  }
}

// ================= WRITE =================
function writeData(data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("WRITE ERROR:", error);
  }
}

// ================= GET =================
export async function GET() {
  try {
    const products = readData();

    return NextResponse.json({
      products,
      lipsticks: [],
      perfumes: [],
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Không tải được sản phẩm." },
      { status: 500 }
    );
  }
}

// ================= POST =================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = readData();

    const newItem = {
      ...body,
      id: body.id ?? crypto.randomUUID(),
    };

    data.push(newItem);
    writeData(data);

    return NextResponse.json({ ok: true, item: newItem });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Không thêm được sản phẩm." },
      { status: 500 }
    );
  }
}

// ================= DELETE =================
// Trong file route.ts - Phần DELETE
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const data = readData();

    // Ép cả 2 về chuỗi để so sánh không bị lệch kiểu dữ liệu
    const newData = data.filter((item: any) => item.id.toString() !== id.toString());

    writeData(newData);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: "Không xóa được sản phẩm." }, { status: 500 });
  }
}

// ================= PATCH (EDIT) =================
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const data = readData();

    const index = data.findIndex((item: any) => item.id.toString() === body.id.toString());
    if (index === -1) {
      return NextResponse.json(
        { message: "Không tìm thấy sản phẩm." },
        { status: 404 }
      );
    }

    data[index] = {
      ...data[index],
      ...body,
    };

    writeData(data);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Không cập nhật được sản phẩm." },
      { status: 500 }
    );
  }
}