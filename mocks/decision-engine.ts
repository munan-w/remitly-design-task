import type {
  CaseStatus,
  DecisionInput,
  DecisionOutcome,
  DecisionResult
} from "@/packages/types/name-change";

const outcomeToStatus: Record<DecisionOutcome, CaseStatus> = {
  approved: "approved",
  manual_review: "under_review_manual",
  needs_more_info: "needs_more_info",
  blocked: "blocked",
  rejected: "rejected"
};

function result(
  outcome: DecisionOutcome,
  reasonCodes: string[],
  userMessage: string,
  reviewerNote?: string
): DecisionResult {
  return {
    outcome,
    status: outcomeToStatus[outcome],
    reasonCodes,
    userMessage,
    reviewerNote
  };
}

export function decideNameChange(input: DecisionInput): DecisionResult {
  if (input.accountTakeoverRisk) {
    return result(
      "blocked",
      ["STEP_UP_BLOCKED", "RECENT_ACCOUNT_RISK"],
      "We paused this request because the account check did not pass. You can ask support to review it.",
      "The account check suggested someone else may be using the account."
    );
  }

  if (!input.evidence.hasGovernmentId) {
    return result(
      "needs_more_info",
      ["MISSING_GOVERNMENT_ID"],
      "Add a new photo identification document before we can continue."
    );
  }

  if (!input.evidence.hasLegalProof || input.scenario === "needs-more-documents") {
    return result(
      "needs_more_info",
      ["MISSING_NAME_CHANGE_PROOF"],
      "Add a name-change document that shows both your old legal name and your new legal name."
    );
  }

  if (!input.evidence.hasSelfie) {
    return result(
      "needs_more_info",
      ["MISSING_SELFIE_CHECK"],
      "Complete the selfie check so we can confirm this request came from you."
    );
  }

  if (input.evidence.selfieMatch === "mismatch") {
    return result(
      "rejected",
      ["SELFIE_MISMATCH"],
      "We could not match the selfie to the photo identification document. Try again or contact support."
    );
  }

  if (input.sanctionsPotentialHit || input.scenario === "specialist-review") {
    return result(
      "manual_review",
      ["POTENTIAL_WATCHLIST_MATCH", "ALIAS_RESCREEN_REQUIRED"],
      "A routine safety check found a similar name. A specialist needs to review it before we can update your legal name.",
      "This does not mean the match is you. A specialist will compare your documents and account details before any update."
    );
  }

  if (input.casePath === "written_name_review" || input.scenario === "name-spelling-review") {
    return result(
      "manual_review",
      ["TRANSLITERATION_REVIEW", "DOCUMENT_NAME_MISMATCH"],
      "A specialist needs to confirm how your name should be written before approval.",
      "A passport can resolve this when both written forms are clear. This demo routes to review because the ID, proof, and Latin spelling do not line up clearly."
    );
  }

  return result(
    "approved",
    ["LOW_RISK", "DOCUMENTS_MATCH", "SELFIE_MATCH"],
    "Your legal name change was approved. We are updating your name across Remitly."
  );
}
