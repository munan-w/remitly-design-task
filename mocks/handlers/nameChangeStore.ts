import { decideNameChange } from "@/mocks/decision-engine";
import { initialProfile } from "@/mocks/fixtures/profile";
import type {
  CaseStatus,
  CasePath,
  CustomerProfile,
  DownstreamSyncItem,
  NameChangeCase,
  ScenarioId
} from "@/packages/types/name-change";

interface Store {
  profile: CustomerProfile;
  cases: Record<string, NameChangeCase>;
  counter: number;
}

declare global {
  var __remitlyNameChangeStore: Store | undefined;
}

function cloneProfile(): CustomerProfile {
  return JSON.parse(JSON.stringify(initialProfile)) as CustomerProfile;
}

function now() {
  return new Date().toISOString();
}

function getStore(): Store {
  if (!globalThis.__remitlyNameChangeStore) {
    globalThis.__remitlyNameChangeStore = {
      profile: cloneProfile(),
      cases: {},
      counter: 1
    };
  }

  return globalThis.__remitlyNameChangeStore;
}

export function resetStore() {
  globalThis.__remitlyNameChangeStore = {
    profile: cloneProfile(),
    cases: {},
    counter: 1
  };

  return globalThis.__remitlyNameChangeStore;
}

function event(action: string, note: string, actor: "customer" | "system" | "reviewer" = "system") {
  return {
    at: now(),
    actor,
    action,
    note
  };
}

function nextCaseId(store: Store) {
  const id = `NCR-${String(store.counter).padStart(4, "0")}`;
  store.counter += 1;
  return id;
}

function casePathForScenario(scenario: ScenarioId): CasePath {
  if (scenario === "name-spelling-review") {
    return "written_name_review";
  }
  return "standard_legal_change";
}

function buildSync(caseRecord: NameChangeCase): DownstreamSyncItem[] {
  if (caseRecord.status !== "approved") {
    return [];
  }

  return [
    {
      system: "identity-service",
      status: "complete",
      detail: "Legal name updated. Previous legal name kept in the case history."
    },
    {
      system: "screening-service",
      status: "complete",
      detail: "Old and new names checked for safety."
    },
    {
      system: "payments-profile-service",
      status: caseRecord.needsPaymentNameCheck ? "attention" : "complete",
      detail: caseRecord.needsPaymentNameCheck
        ? "Customer may need to check the name on their saved card before sending money."
        : "Payment profile updated."
    },
    {
      system: "support-case-service",
      status: "complete",
      detail: "Support can see the case history without full document images."
    }
  ];
}

export function getProfile() {
  return getStore().profile;
}

export function updatePreferredName(preferredName: string) {
  const store = getStore();
  const clean = preferredName.trim();

  if (clean.length < 2 || clean.length > 40) {
    return {
      ok: false,
      message: "Preferred name must be 2 to 40 characters."
    };
  }

  store.profile.preferredName = clean;

  return {
    ok: true,
    profile: store.profile,
    message: "Preferred name updated. Legal name was not changed."
  };
}

export function createNameChangeCase(scenario: ScenarioId = "happy-path") {
  const store = getStore();
  const createdAt = now();
  const caseRecord: NameChangeCase = {
    caseId: nextCaseId(store),
    customerId: store.profile.customerId,
    scenario,
    status: "awaiting_step_up_auth",
    casePath: casePathForScenario(scenario),
    previousLegalName: store.profile.legalNameCurrent,
    proposedLegalName:
      scenario === "name-spelling-review"
        ? "Li Wei"
        : "Alex Chen-Rivera",
    nativeScriptName: scenario === "name-spelling-review" ? "李薇" : undefined,
    transliteratedName: scenario === "name-spelling-review" ? "Li Wei" : undefined,
    evidence: {
      hasGovernmentId: false,
      hasLegalProof: false,
      hasSelfie: false,
      idQuality: "unchecked",
      selfieMatch: "unchecked"
    },
    timeline: [
      event(
        "case_created",
        "Customer opened a legal-name change request that verifies identity again.",
        "customer"
      )
    ],
    downstreamSync: [],
    needsPaymentNameCheck: store.profile.cardFundedUser,
    createdAt,
    updatedAt: createdAt
  };

  store.cases[caseRecord.caseId] = caseRecord;
  return caseRecord;
}

export function getNameChangeCase(caseId: string) {
  return getStore().cases[caseId];
}

export function setCaseStatus(caseId: string, status: CaseStatus, note: string) {
  const caseRecord = getNameChangeCase(caseId);
  if (!caseRecord) {
    return undefined;
  }

  caseRecord.status = status;
  caseRecord.updatedAt = now();
  caseRecord.timeline.push(event(status, note));
  return caseRecord;
}

export function completeStepUp(caseId: string, code: string) {
  const caseRecord = getNameChangeCase(caseId);
  if (!caseRecord) {
    return { ok: false, status: 404, message: "Case not found" };
  }

  if (caseRecord.scenario === "account-protection" || code === "0000") {
    caseRecord.status = "blocked";
    caseRecord.decision = decideNameChange({
      scenario: caseRecord.scenario,
      casePath: caseRecord.casePath,
      evidence: caseRecord.evidence,
      accountTakeoverRisk: true,
      sanctionsPotentialHit: false
    });
    caseRecord.timeline.push(
      event("step_up_blocked", "Account protection blocked this request.")
    );
    caseRecord.updatedAt = now();
    return {
      ok: false,
      status: 423,
      caseRecord,
      message: caseRecord.decision.userMessage
    };
  }

  return {
    ok: true,
    caseRecord: setCaseStatus(
      caseId,
      "awaiting_id",
      "Account check completed."
    )
  };
}

export function uploadGovernmentId(caseId: string) {
  const caseRecord = getNameChangeCase(caseId);
  if (!caseRecord) {
    return undefined;
  }

  caseRecord.evidence.hasGovernmentId = true;
  caseRecord.evidence.idQuality = "clear";
  caseRecord.status = "awaiting_proof";
  caseRecord.updatedAt = now();
  caseRecord.timeline.push(event("id_uploaded", "Sample photo identification accepted."));
  return caseRecord;
}

export function uploadLegalProof(caseId: string) {
  const caseRecord = getNameChangeCase(caseId);
  if (!caseRecord) {
    return undefined;
  }

  caseRecord.evidence.hasLegalProof = true;
  caseRecord.status = "awaiting_selfie";
  caseRecord.updatedAt = now();
  caseRecord.timeline.push(
    event("proof_uploaded", "Sample legal name-change proof accepted.")
  );
  return caseRecord;
}

export function completeSelfie(caseId: string) {
  const caseRecord = getNameChangeCase(caseId);
  if (!caseRecord) {
    return undefined;
  }

  caseRecord.evidence.hasSelfie = true;
  caseRecord.evidence.selfieMatch = "match";
  caseRecord.status = "under_review_auto";
  caseRecord.updatedAt = now();
  caseRecord.timeline.push(event("selfie_complete", "Selfie match completed."));
  return caseRecord;
}

export function submitNameChangeCase(
  caseId: string,
  input: {
    proposedLegalName?: string;
    nativeScriptName?: string;
    transliteratedName?: string;
  }
) {
  const store = getStore();
  const caseRecord = getNameChangeCase(caseId);
  if (!caseRecord) {
    return undefined;
  }

  caseRecord.proposedLegalName =
    input.proposedLegalName?.trim() || caseRecord.proposedLegalName;
  caseRecord.nativeScriptName = input.nativeScriptName ?? caseRecord.nativeScriptName;
  caseRecord.transliteratedName =
    input.transliteratedName ?? caseRecord.transliteratedName;

  const decision = decideNameChange({
    scenario: caseRecord.scenario,
    casePath: caseRecord.casePath,
    evidence: caseRecord.evidence,
    accountTakeoverRisk: caseRecord.scenario === "account-protection",
    sanctionsPotentialHit: caseRecord.scenario === "specialist-review"
  });

  caseRecord.decision = decision;
  caseRecord.status = decision.status;
  caseRecord.updatedAt = now();
  caseRecord.timeline.push(
    event("decision", `${decision.outcome}: ${decision.reasonCodes.join(", ")}`)
  );

  if (decision.outcome === "approved") {
    store.profile.legalNameAliases = [
      caseRecord.previousLegalName,
      ...store.profile.legalNameAliases.filter(
        (name) => name !== caseRecord.previousLegalName
      )
    ];
    store.profile.legalNameCurrent = caseRecord.proposedLegalName;
    store.profile.savedCards = store.profile.savedCards.map((card) => ({
      ...card,
      status: caseRecord.needsPaymentNameCheck ? "needs_name_check" : card.status
    }));
    caseRecord.downstreamSync = buildSync(caseRecord);
    caseRecord.timeline.push(
      event("identity_updated", "Canonical legal name updated prospectively.")
    );
  }

  return caseRecord;
}
