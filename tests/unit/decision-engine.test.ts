import { describe, expect, it } from "vitest";
import { decideNameChange } from "@/mocks/decision-engine";
import type { DecisionInput } from "@/packages/types/name-change";

const baseInput: DecisionInput = {
  scenario: "happy-path",
  casePath: "standard_legal_change",
  evidence: {
    hasGovernmentId: true,
    hasLegalProof: true,
    hasSelfie: true,
    idQuality: "clear",
    selfieMatch: "match"
  },
  accountTakeoverRisk: false,
  sanctionsPotentialHit: false
};

describe("decideNameChange", () => {
  it("auto-approves happy path with complete evidence", () => {
    expect(decideNameChange(baseInput).outcome).toBe("approved");
  });

  it("requests more info when legal proof is missing", () => {
    const result = decideNameChange({
      ...baseInput,
      scenario: "needs-more-documents",
      evidence: { ...baseInput.evidence, hasLegalProof: false }
    });

    expect(result.outcome).toBe("needs_more_info");
    expect(result.reasonCodes).toContain("MISSING_NAME_CHANGE_PROOF");
  });

  it("routes similar names from routine safety checks to specialist review", () => {
    const result = decideNameChange({
      ...baseInput,
      scenario: "specialist-review",
      sanctionsPotentialHit: true
    });

    expect(result.outcome).toBe("manual_review");
    expect(result.reasonCodes).toContain("POTENTIAL_WATCHLIST_MATCH");
  });

  it("blocks account protection cases before document collection", () => {
    const result = decideNameChange({
      ...baseInput,
      scenario: "account-protection",
      accountTakeoverRisk: true
    });

    expect(result.outcome).toBe("blocked");
    expect(result.reasonCodes).toContain("STEP_UP_BLOCKED");
  });

  it("routes unclear two-written-form name cases to specialist review", () => {
    const result = decideNameChange({
      ...baseInput,
      scenario: "name-spelling-review",
      casePath: "written_name_review"
    });

    expect(result.outcome).toBe("manual_review");
    expect(result.reasonCodes).toContain("TRANSLITERATION_REVIEW");
  });
});
