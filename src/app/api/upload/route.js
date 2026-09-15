import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { isAdminRequest } from "@/lib/auth";

export async function POST(request) {
  if (!isAdminRequest(request)) return Response.json({ error: "غير مصرح" }, { status: 401 });
  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || typeof file.arrayBuffer !== "function") {
    return Response.json({ error: "لم يتم اختيار صورة" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "الملف يجب أن يكون صورة" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return Response.json({ error: "حجم الصورة يجب ألا يتجاوز 5MB" }, { status: 400 });
  }

  const extension = path.extname(file.name) || ".jpg";
  const fileName = `${crypto.randomUUID()}${extension}`;
  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDirectory, { recursive: true });
  await fs.writeFile(path.join(uploadDirectory, fileName), Buffer.from(await file.arrayBuffer()));
  return Response.json({ url: `/uploads/${fileName}` });
}
