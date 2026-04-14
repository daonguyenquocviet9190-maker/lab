import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DbComment = {
  id: number;
  productKey: string;
  productName: string;
  title: "Anh" | "Chị";
  name: string;
  email: string;
  content: string;
  createdAt: string;
};

type DbReview = {
  id: number;
  productKey: string;
  productName: string;
  name: string;
  email: string;
  content: string;
  rating: number;
  createdAt: string;
};

type DbShape = {
  comments: DbComment[];
  reviews: DbReview[];
};

const DB_PATH = path.join(process.cwd(), "src", "data", "db.json");

async function ensureDbFile() {
  try {
    await fs.access(DB_PATH);
  } catch {
    const initialData: DbShape = { comments: [], reviews: [] };
    await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2), "utf8");
  }
}

async function readDb(): Promise<DbShape> {
  await ensureDbFile();
  const raw = await fs.readFile(DB_PATH, "utf8");

  try {
    const parsed = JSON.parse(raw) as Partial<DbShape>;
    return {
      comments: Array.isArray(parsed.comments) ? parsed.comments : [],
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
    };
  } catch {
    return { comments: [], reviews: [] };
  }
}

async function writeDb(data: DbShape) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf8");
}

function getProductComments(data: DbShape, productKey: string) {
  return data.comments
    .filter((comment) => comment.productKey === productKey)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

function isValidGmail(value: string) {
  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(value.trim());
}

export async function GET(request: NextRequest) {
  const productKey = request.nextUrl.searchParams.get("productKey") ?? "";
  const data = await readDb();

  return NextResponse.json({
    comments: productKey ? getProductComments(data, productKey) : data.comments,
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<DbComment>;

  if (
    !body.productKey ||
    !body.productName ||
    !body.title ||
    !body.name ||
    !body.email ||
    !body.content
  ) {
    return NextResponse.json(
      { message: "Thiếu dữ liệu bình luận." },
      { status: 400 },
    );
  }

  if (!isValidGmail(body.email)) {
    return NextResponse.json(
      { message: "Email bắt buộc phải là địa chỉ Gmail." },
      { status: 400 },
    );
  }

  const data = await readDb();
  const nextComment: DbComment = {
    id: Date.now(),
    productKey: body.productKey,
    productName: body.productName,
    title: body.title,
    name: body.name,
    email: body.email,
    content: body.content,
    createdAt: new Date().toISOString(),
  };

  const nextData: DbShape = {
    comments: [nextComment, ...data.comments],
    reviews: data.reviews,
  };

  await writeDb(nextData);

  return NextResponse.json({
    comments: getProductComments(nextData, body.productKey),
  });
}

export async function DELETE(request: NextRequest) {
  const body = (await request.json()) as {
    id?: number;
    productKey?: string;
  };

  if (!body.id || !body.productKey) {
    return NextResponse.json(
      { message: "Thiếu id hoặc productKey." },
      { status: 400 },
    );
  }

  const data = await readDb();
  const nextData: DbShape = {
    comments: data.comments.filter((comment) => comment.id !== body.id),
    reviews: data.reviews,
  };

  await writeDb(nextData);

  return NextResponse.json({
    comments: getProductComments(nextData, body.productKey),
  });
}
