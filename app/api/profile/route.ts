import { getProfile } from "@/mocks/handlers/nameChangeStore";

export async function GET() {
  return Response.json(getProfile());
}
