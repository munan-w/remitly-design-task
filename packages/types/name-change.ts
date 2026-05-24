export const scenarioIds = [
  "happy-path",
  "needs-more-documents",
  "specialist-review",
  "account-protection",
  "preferred-only",
  "name-spelling-review"
] as const;

export type ScenarioId = (typeof scenarioIds)[number];

export type CasePath =
  | "standard_legal_change"
  | "written_name_review";

export type CaseStatus =
  | "draft"
  | "awaiting_step_up_auth"
  | "awaiting_id"
  | "awaiting_proof"
  | "awaiting_selfie"
  | "under_review_auto"
  | "under_review_manual"
  | "blocked"
  | "approved"
  | "needs_more_info"
  | "rejected"
  | "synced_partial"
  | "synced_complete";

export type DecisionOutcome =
  | "approved"
  | "manual_review"
  | "needs_more_info"
  | "blocked"
  | "rejected";

export type SyncStatus = "pending" | "complete" | "attention";

export interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  nameOnCard: string;
  status: "active" | "needs_name_check";
}

export interface CustomerProfile {
  customerId: string;
  legalNameCurrent: string;
  legalNameAliases: string[];
  preferredName: string;
  email: string;
  phone: string;
  addressLines: string[];
  language: string;
  sendingTo: string;
  sendingFrom: string;
  cardFundedUser: boolean;
  savedCards: SavedCard[];
}

export interface EvidenceState {
  hasGovernmentId: boolean;
  hasLegalProof: boolean;
  hasSelfie: boolean;
  idQuality: "unchecked" | "clear" | "blurry";
  selfieMatch: "unchecked" | "match" | "mismatch";
}

export interface DecisionResult {
  outcome: DecisionOutcome;
  status: CaseStatus;
  reasonCodes: string[];
  userMessage: string;
  reviewerNote?: string;
}

export interface AuditEvent {
  at: string;
  actor: "customer" | "system" | "reviewer";
  action: string;
  note: string;
}

export interface DownstreamSyncItem {
  system: string;
  status: SyncStatus;
  detail: string;
}

export interface NameChangeCase {
  caseId: string;
  customerId: string;
  scenario: ScenarioId;
  status: CaseStatus;
  casePath: CasePath;
  previousLegalName: string;
  proposedLegalName: string;
  nativeScriptName?: string;
  transliteratedName?: string;
  evidence: EvidenceState;
  decision?: DecisionResult;
  timeline: AuditEvent[];
  downstreamSync: DownstreamSyncItem[];
  needsPaymentNameCheck: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DecisionInput {
  scenario: ScenarioId;
  casePath: CasePath;
  evidence: EvidenceState;
  accountTakeoverRisk: boolean;
  sanctionsPotentialHit: boolean;
}
