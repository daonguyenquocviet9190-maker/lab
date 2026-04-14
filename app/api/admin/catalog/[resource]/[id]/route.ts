import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "products.json");

type RouteParams = Promise<{ resource: string; id: string }>;

// ===== READ =====
function readData() {
  try {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error("READ ERROR:", error);
    return [];
  }
}

// ===== WRITE =====
function writeData(data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("WRITE ERROR:", error);
  }
}

// ===== PATCH (EDIT) =====
export async function PATCH(
  request: Request,
  { params }: { params: RouteParams }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data = readData();

    const index = data.findIndex(
      (item: any) => String(item.id) === String(id)
    );

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

    return NextResponse.json({ ok: true, item: data[index] });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Không cập nhật được sản phẩm." },
      { status: 500 }
    );
  }
}

// ===== DELETE =====
export async function DELETE(
  _request: Request,
  { params }: { params: RouteParams }
) {
  try {
    const { id } = await params;

    const data = readData();

    const newData = data.filter(
      (item: any) => String(item.id) !== String(id)
    );

    if (newData.length === data.length) {
      return NextResponse.json(
        { message: "Không tìm thấy sản phẩm." },
        { status: 404 }
      );
    }

    writeData(newData);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Không xóa được sản phẩm." },
      { status: 500 }
    );
  }
}