import { promises as fs } from "fs";
import path from "path";
import { isAdminRequest } from "@/lib/auth";

const productsPath = path.join(process.cwd(), "src", "data", "products.json");

async function readProducts() {
  return JSON.parse(await fs.readFile(productsPath, "utf8"));
}

export async function GET() {
  return Response.json(await readProducts());
}

export async function POST(request) {
  if (!isAdminRequest(request)) return Response.json({ error: "غير مصرح" }, { status: 401 });
  const product = await request.json();
  const products = await readProducts();
  const nextProduct = {
    id: Date.now(),
    name: String(product.name || "منتج جديد").trim(),
    price: Number(product.price || 0),
    category: String(product.category || "أخرى").trim(),
    description: String(product.description || "").trim(),
    icon: String(product.icon || "🛒"),
    image: product.image || "",
  };
  products.push(nextProduct);
  await fs.writeFile(productsPath, JSON.stringify(products, null, 2) + "\n");
  return Response.json(nextProduct, { status: 201 });
}

export async function DELETE(request) {
  if (!isAdminRequest(request)) return Response.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await request.json();
  const products = await readProducts();
  const nextProducts = products.filter((product) => String(product.id) !== String(id));
  await fs.writeFile(productsPath, JSON.stringify(nextProducts, null, 2) + "\n");
  return Response.json({ ok: true });
}
