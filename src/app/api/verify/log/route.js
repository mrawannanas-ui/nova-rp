import { isAdminRequest } from "@/lib/auth";
import { listVerifications } from "@/lib/verifylog";

export const dynamic = "force-dynamic";

export async function GET(request) {
  if (!isAdminRequest(request)) {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }
  return Response.json({ records: listVerifications() });
}
