import { updatePreferredName } from "@/mocks/handlers/nameChangeStore";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    preferredName?: string;
  };
  const result = updatePreferredName(body.preferredName ?? "");

  return Response.json(result, { status: result.ok ? 200 : 400 });
}
