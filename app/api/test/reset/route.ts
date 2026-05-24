import { resetStore } from "@/mocks/handlers/nameChangeStore";

export async function POST() {
  resetStore();
  return Response.json({ ok: true });
}
