import { completeStepUp } from "@/mocks/handlers/nameChangeStore";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    caseId?: string;
    code?: string;
  };

  if (!body.caseId) {
    return Response.json({ message: "Missing caseId" }, { status: 400 });
  }

  const result = completeStepUp(body.caseId, body.code ?? "");
  return Response.json(result, { status: result.status ?? 200 });
}
