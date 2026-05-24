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

  return Response.json({
    caseId,
    status:
      caseRecord.downstreamSync.length > 0 &&
      caseRecord.downstreamSync.every((item) => item.status === "complete")
        ? "synced_complete"
        : "synced_partial",
    systems: caseRecord.downstreamSync
  });
}
