import { createNameChangeCase } from "@/mocks/handlers/nameChangeStore";
import type { ScenarioId } from "@/packages/types/name-change";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    scenario?: ScenarioId;
  };

  return Response.json(createNameChangeCase(body.scenario ?? "happy-path"));
}
