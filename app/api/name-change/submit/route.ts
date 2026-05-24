import { submitNameChangeCase } from "@/mocks/handlers/nameChangeStore";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    caseId?: string;
    proposedLegalName?: string;
    nativeScriptName?: string;
    transliteratedName?: string;
  };

  if (!body.caseId) {
    return Response.json({ message: "Missing caseId" }, { status: 400 });
  }

  const caseRecord = submitNameChangeCase(body.caseId, body);
  if (!caseRecord) {
    return Response.json({ message: "Case not found" }, { status: 404 });
  }

  return Response.json(caseRecord);
}
