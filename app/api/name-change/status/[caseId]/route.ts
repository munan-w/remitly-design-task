import { getNameChangeCase } from "@/mocks/handlers/nameChangeStore";

type Params = {
  params: Promise<{
    caseId: string;
  }>;
};

export async function GET(_request: Request, context: Params) {
  const { caseId } = await context.params;
  const caseRecord = getNameChangeCase(caseId);

  if (!caseRecord) {
    return Response.json({ message: "Case not found" }, { status: 404 });
  }

  return Response.json(caseRecord);
}
