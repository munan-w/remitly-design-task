"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type {
  CustomerProfile,
  NameChangeCase,
  ScenarioId
} from "@/packages/types/name-change";

type Step =
  | "profile"
  | "preferred"
  | "disclosure"
  | "step-up"
  | "documents"
  | "selfie"
  | "review"
  | "status";

const scenarioOptions: Array<{
  id: ScenarioId;
  label: string;
  description: string;
  expectedResult: string;
  reviewFocus: string;
}> = [
  {
    id: "happy-path",
    label: "S1 Happy path: complete documents",
    description:
      "Customer has a new photo identification document, a name-change document, and a matching selfie.",
    expectedResult: "Approved, then saved-card reminder if a card is on file",
    reviewFocus:
      "Tests remote approval, downstream updates, and the saved-card check as part of the approved path."
  },
  {
    id: "needs-more-documents",
    label: "S2 Needs more documents",
    description:
      "Customer attaches new photo identification but not the document that connects the old and new legal names.",
    expectedResult: "More information needed",
    reviewFocus: "Tests the recovery path when one required document is missing."
  },
  {
    id: "specialist-review",
    label: "S3 Specialist review: similar name in safety check",
    description:
      "Documents are present, but a routine safety check finds a similar name. This does not mean the match is the customer.",
    expectedResult: "Specialist review",
    reviewFocus:
      "Tests clear customer messaging when a similar name must be reviewed before changing regulated identity data."
  },
  {
    id: "account-protection",
    label: "S4 Blocked: account check did not pass",
    description:
      "The account check fails before documents are collected, so the flow pauses and offers support review.",
    expectedResult: "Blocked with review request option",
    reviewFocus: "Tests the hard stop when the account may not be safe."
  },
  {
    id: "preferred-only",
    label: "S5 Preferred name only",
    description:
      "Customer changes the name used in greetings and support. Legal name stays the same.",
    expectedResult: "Saved immediately",
    reviewFocus: "Tests separation between preferred name and legal name."
  },
  {
    id: "name-spelling-review",
    label: "S6 Specialist review: two written forms",
    description:
      "Customer has a name shown in one writing system and a Latin spelling, but the documents do not line up clearly.",
    expectedResult: "Specialist review",
    reviewFocus:
      "Tests when a passport or photo ID may resolve the spelling, and when a specialist must confirm it."
  }
];

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = (await response.json()) as T & {
    caseRecord?: NameChangeCase;
    message?: string;
  };

  if (!response.ok && !data.caseRecord) {
    throw new Error(data.message ?? `Request failed: ${response.status}`);
  }

  return data;
}

function progressFor(step: Step) {
  const map: Record<Step, { current: number; total: number; label: string } | null> = {
    profile: null,
    preferred: null,
    disclosure: { current: 1, total: 6, label: "Preview" },
    "step-up": { current: 2, total: 6, label: "Account check" },
    documents: { current: 3, total: 6, label: "Documents" },
    selfie: { current: 4, total: 6, label: "Selfie check" },
    review: { current: 5, total: 6, label: "Review" },
    status: { current: 6, total: 6, label: "Result" }
  };
  return map[step];
}

function selectedScenarioCopy(scenario: ScenarioId) {
  return scenarioOptions.find((option) => option.id === scenario)?.description ?? "";
}

function selectedScenario(scenario: ScenarioId) {
  return scenarioOptions.find((option) => option.id === scenario) ?? scenarioOptions[0];
}

export function ProfilePrototype() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [step, setStep] = useState<Step>("profile");
  const [scenario, setScenario] = useState<ScenarioId>("happy-path");
  const [caseRecord, setCaseRecord] = useState<NameChangeCase | null>(null);
  const [proposedLegalName, setProposedLegalName] = useState("Alex Chen-Rivera");
  const [nativeScriptName, setNativeScriptName] = useState("李薇");
  const [transliteratedName, setTransliteratedName] = useState("Li Wei");
  const [idUploaded, setIdUploaded] = useState(false);
  const [proofUploaded, setProofUploaded] = useState(false);
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [preferredName, setPreferredName] = useState("Alex");
  const [preferredSuccess, setPreferredSuccess] = useState("");
  const [supportReviewRequested, setSupportReviewRequested] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((response) => response.json())
      .then((data: CustomerProfile) => {
        setProfile(data);
        setPreferredName(data.preferredName);
      })
      .catch(() => {
        setError("Profile could not load. Refresh the prototype.");
      });
  }, []);

  const statusClass = useMemo(() => {
    if (!caseRecord) {
      return "status-pill";
    }
    if (caseRecord.status === "approved") {
      return "status-pill success";
    }
    if (caseRecord.status === "blocked" || caseRecord.status === "rejected") {
      return "status-pill danger";
    }
    if (
      caseRecord.status === "needs_more_info" ||
      caseRecord.status === "under_review_manual"
    ) {
      return "status-pill warning";
    }
    return "status-pill";
  }, [caseRecord]);

  function handleScenarioChange(nextScenario: ScenarioId) {
    setScenario(nextScenario);
    if (nextScenario === "name-spelling-review") {
      setProposedLegalName("Li Wei");
    } else {
      setProposedLegalName("Alex Chen-Rivera");
    }
    setPreferredSuccess("");
    setSupportReviewRequested(false);
  }

  async function refreshProfile() {
    const response = await fetch("/api/profile");
    const data = (await response.json()) as CustomerProfile;
    setProfile(data);
    setPreferredName(data.preferredName);
  }

  async function beginLegalNameFlow() {
    setError("");
    setIdUploaded(false);
    setProofUploaded(false);
    setSelfieCaptured(false);
    setPreferredSuccess("");
    setSupportReviewRequested(false);

    const started = await postJson<NameChangeCase>("/api/name-change/start", {
      scenario
    });
    setCaseRecord(started);
    setStep("disclosure");
  }

  async function completeStepUpAuth() {
    if (!caseRecord) {
      return;
    }

    const result = await postJson<{
      ok: boolean;
      caseRecord: NameChangeCase;
      message?: string;
    }>("/api/name-change/step-up-auth", {
      caseId: caseRecord.caseId,
      code: scenario === "account-protection" ? "0000" : "2486"
    });

    setCaseRecord(result.caseRecord);
    setStep(result.ok ? "documents" : "status");
  }

  async function continueAfterDocuments() {
    if (!caseRecord) {
      return;
    }

    let updated = caseRecord;
    if (idUploaded) {
      updated = await postJson<NameChangeCase>("/api/name-change/upload-id", {
        caseId: caseRecord.caseId
      });
    }
    if (proofUploaded) {
      updated = await postJson<NameChangeCase>("/api/name-change/upload-proof", {
        caseId: caseRecord.caseId
      });
    }
    setCaseRecord(updated);
    setStep("selfie");
  }

  async function completeSelfieCheck() {
    if (!caseRecord) {
      return;
    }

    const updated = await postJson<NameChangeCase>("/api/name-change/selfie-check", {
      caseId: caseRecord.caseId
    });
    setCaseRecord(updated);
    setSelfieCaptured(true);
  }

  async function submitCase() {
    if (!caseRecord) {
      return;
    }

    const updated = await postJson<NameChangeCase>("/api/name-change/submit", {
      caseId: caseRecord.caseId,
      proposedLegalName,
      nativeScriptName: scenario === "name-spelling-review" ? nativeScriptName : undefined,
      transliteratedName: scenario === "name-spelling-review" ? transliteratedName : undefined
    });
    setCaseRecord(updated);
    await refreshProfile();
    setStep("status");
  }

  async function savePreferredName() {
    setError("");
    const result = await postJson<{
      ok: boolean;
      profile: CustomerProfile;
      message: string;
    }>("/api/preferred-name/update", {
      preferredName
    });

    setProfile(result.profile);
    setPreferredSuccess(result.message);
  }

  if (!profile) {
    return (
      <div className="app-shell">
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <Header />
        <main id="main" className="settings-shell">
          <section className="flow-panel" aria-live="polite">
            <h1 className="panel-title">Profile information</h1>
            <p>Loading profile prototype...</p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <Header />
      <CorridorBar />
      <main id="main" className="settings-shell">
        <SettingsNav />
        <section aria-label="Profile information workspace">
          {error ? (
            <div className="alert danger" role="alert">
              {error}
            </div>
          ) : null}
          {step === "profile" ? (
            <ProfilePanel
              profile={profile}
              scenario={scenario}
              onScenarioChange={handleScenarioChange}
              onStartLegalFlow={beginLegalNameFlow}
              onOpenPreferred={() => setStep("preferred")}
            />
          ) : null}
          {step === "preferred" ? (
            <PreferredNamePanel
              legalName={profile.legalNameCurrent}
              preferredName={preferredName}
              success={preferredSuccess}
              onPreferredNameChange={setPreferredName}
              onSave={savePreferredName}
              onBack={() => setStep("profile")}
            />
          ) : null}
          {step === "disclosure" ? (
            <FlowPanel
              step={step}
              kicker="Legal name change"
              title="We need to verify your identity again"
              copy="Your legal name helps keep transfers, payments, and support records accurate. To change it, we ask for a few sample checks instead of letting the name be edited directly."
            >
              <div className="alert info">
                <strong>{selectedScenario(scenario).label}</strong>
                <span>{selectedScenarioCopy(scenario)}</span>
                <span>
                  Expected result: {selectedScenario(scenario).expectedResult}
                </span>
              </div>
              <ul className="step-list" aria-label="Documents and checks needed">
                <li>
                  <span className="step-index">1</span>
                  <span>
                    <strong>Confirm this is your account</strong>
                    <br />
                    Use a demo code to show that the request is coming from you.
                  </span>
                </li>
                <li>
                  <span className="step-index">2</span>
                  <span>
                    <strong>Photo identification with the new name</strong>
                    <br />
                    Use a sample driver&apos;s license, state ID, passport, or other government photo ID.
                  </span>
                </li>
                <li>
                  <span className="step-index">3</span>
                  <span>
                    <strong>Document that connects old and new names</strong>
                    <br />
                    Use a sample court order, marriage certificate, divorce decree, or legal name-change certificate.
                  </span>
                </li>
                <li>
                  <span className="step-index">4</span>
                  <span>
                    <strong>Selfie check</strong>
                    <br />
                    Confirm the person making the request matches the sample photo identification.
                  </span>
                </li>
                <li>
                  <span className="step-index">5</span>
                  <span>
                    <strong>Saved-card check after approval</strong>
                    <br />
                    If a saved card is on file, Remitly should remind the customer to check the card name.
                  </span>
                </li>
              </ul>
              <div className="button-row">
                <button className="rmt-button primary" type="button" onClick={() => setStep("step-up")}>
                  Continue
                </button>
                <button className="rmt-button ghost" type="button" onClick={() => setStep("profile")}>
                  Back to profile
                </button>
              </div>
            </FlowPanel>
          ) : null}
          {step === "step-up" ? (
            <FlowPanel
              step={step}
              kicker="Account protection"
              title="Confirm it is you"
              copy="For this prototype, the security code is already filled in. In the account protection scenario, the code fails to show how the flow stops when an account may not be safe."
            >
              <div className="field">
                <label htmlFor="auth-code">Security code</label>
                <input
                  id="auth-code"
                  inputMode="numeric"
                  value={scenario === "account-protection" ? "0000" : "2486"}
                  readOnly
                  aria-describedby="auth-code-help"
                />
                <p id="auth-code-help" className="helper-text">
                  Demo code only. No real sign-in service is connected.
                </p>
              </div>
              <div className="button-row">
                <button className="rmt-button primary" type="button" onClick={completeStepUpAuth}>
                  Verify and continue
                </button>
                <button className="rmt-button ghost" type="button" onClick={() => setStep("disclosure")}>
                  Back
                </button>
              </div>
            </FlowPanel>
          ) : null}
          {step === "documents" ? (
            <FlowPanel
              step={step}
              kicker="Documents"
              title="Add sample documents"
              copy="Use documents that prove the name connection. We do not ask why the name changed. This prototype only uses fake sample files."
            >
              <div className="upload-grid">
                <UploadCard
                  title="Photo identification"
                  copy="Use a current document that shows the new legal name. A passport is allowed in this prototype."
                  examples="Driver's license, state ID, passport, or other government photo ID."
                  done={idUploaded}
                  buttonLabel={idUploaded ? "Sample ID attached" : "Use sample photo ID"}
                  onClick={() => setIdUploaded(true)}
                />
                <UploadCard
                  title="Name-change document"
                  copy="Use an official document that shows the old legal name and the new legal name together."
                  examples="Court order, marriage certificate, divorce decree, certificate of naturalization, or legal name-change certificate."
                  done={proofUploaded}
                  buttonLabel={proofUploaded ? "Sample name-change document attached" : "Use sample name-change document"}
                  onClick={() => setProofUploaded(true)}
                />
              </div>
              {scenario === "needs-more-documents" ? (
                <p className="helper-text" role="note">
                  S2 path: attach the photo ID, leave the name-change document unattached, then continue.
                </p>
              ) : null}
              {scenario === "name-spelling-review" ? (
                <p className="helper-text" role="note">
                  S6 path: a passport can resolve this when both written forms are clear. This demo routes to review because the ID, proof, and Latin spelling do not line up clearly.
                </p>
              ) : null}
              <div className="button-row">
                <button
                  className="rmt-button primary"
                  type="button"
                  disabled={!idUploaded}
                  onClick={continueAfterDocuments}
                >
                  Continue to selfie check
                </button>
                <button className="rmt-button ghost" type="button" onClick={() => setStep("step-up")}>
                  Back
                </button>
              </div>
            </FlowPanel>
          ) : null}
          {step === "selfie" ? (
            <FlowPanel
              step={step}
              kicker="Selfie check"
              title="Match the person to the photo identification"
              copy="The prototype uses a sample selfie. It does not turn on the camera."
            >
              <div className={selfieCaptured ? "alert success" : "alert info"} aria-live="polite">
                <strong>{selfieCaptured ? "Selfie match complete" : "Camera simulation ready"}</strong>
                <span>
                  {selfieCaptured
                    ? "The sample selfie matched the sample photo identification."
                    : "Use the sample selfie to continue."}
                </span>
              </div>
              <div className="button-row">
                <button className="rmt-button secondary" type="button" onClick={completeSelfieCheck}>
                  Capture sample selfie
                </button>
                <button
                  className="rmt-button primary"
                  type="button"
                  disabled={!selfieCaptured}
                  onClick={() => setStep("review")}
                >
                  Review request
                </button>
                <button className="rmt-button ghost" type="button" onClick={() => setStep("documents")}>
                  Back
                </button>
              </div>
            </FlowPanel>
          ) : null}
          {step === "review" ? (
            <FlowPanel
              step={step}
              kicker="Review"
              title="Confirm what changes"
              copy="The previous legal name stays in the case history for safety checks. Past transfers do not change."
            >
              <div className="field">
                <label htmlFor="proposed-name">Proposed legal name</label>
                <input
                  id="proposed-name"
                  value={proposedLegalName}
                  onChange={(event) => setProposedLegalName(event.target.value)}
                />
              </div>
              {scenario === "name-spelling-review" ? (
                <div className="upload-grid">
                  <div className="field">
                    <label htmlFor="native-script-name">Name in original writing system</label>
                    <input
                      id="native-script-name"
                      value={nativeScriptName}
                      onChange={(event) => setNativeScriptName(event.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="transliterated-name">Latin spelling</label>
                    <input
                      id="transliterated-name"
                      value={transliteratedName}
                      onChange={(event) => setTransliteratedName(event.target.value)}
                    />
                  </div>
                </div>
              ) : null}
              <div className="review-table" aria-label="Legal-name change review summary">
                <ReviewRow label="Current legal name" value={caseRecord?.previousLegalName ?? profile.legalNameCurrent} />
                <ReviewRow label="New legal name" value={proposedLegalName} />
                <ReviewRow label="Documents attached" value={evidenceSummary(caseRecord)} />
                <ReviewRow label="Preferred name" value={`${profile.preferredName} (unchanged)`} />
                <ReviewRow label="Case history" value="Previous legal names stay attached to the case for safety checks and support review." />
              </div>
              <div className="button-row">
                <button className="rmt-button primary" type="button" onClick={submitCase}>
                  Submit for review
                </button>
                <button className="rmt-button ghost" type="button" onClick={() => setStep("selfie")}>
                  Back
                </button>
              </div>
            </FlowPanel>
          ) : null}
          {step === "status" && caseRecord ? (
            <FlowPanel
              step={step}
              kicker="Case status"
              title={statusTitle(caseRecord)}
              copy={caseRecord.decision?.userMessage ?? "Case status updated."}
            >
              <div className={statusClass} aria-live="polite">
                {statusLabel(caseRecord.status)}
              </div>
              <StatusBody
                caseRecord={caseRecord}
                supportReviewRequested={supportReviewRequested}
              />
              <div className="button-row">
                {caseRecord.status === "blocked" ? (
                  <button
                    className="rmt-button secondary"
                    type="button"
                    onClick={() => setSupportReviewRequested(true)}
                  >
                    Request support review
                  </button>
                ) : null}
                <button className="rmt-button primary" type="button" onClick={() => setStep("profile")}>
                  Back to profile
                </button>
                <button className="rmt-button ghost" type="button" onClick={beginLegalNameFlow}>
                  Restart demo
                </button>
              </div>
            </FlowPanel>
          ) : null}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="top-nav">
      <a className="logo-lockup" href="/us/en/users/settings/profile" aria-label="Remitly home">
        <Image
          className="logo-image"
          src="/remitly-horizontal-blue.png"
          alt=""
          aria-hidden="true"
          width="232"
          height="55"
          priority
        />
      </a>
      <nav className="desktop-nav" aria-label="Primary">
        <a href="/us/en/users/settings/profile">Send money</a>
        <a href="/us/en/users/settings/profile">Transfer history</a>
        <a href="/us/en/users/settings/profile">Refer friends</a>
      </nav>
      <div className="nav-actions">
        <span>English</span>
        <span>Hi, Alex</span>
        <button className="menu-button" type="button" aria-label="Open account menu">
          Menu
        </button>
      </div>
    </header>
  );
}

function CorridorBar() {
  return (
    <div className="corridor-bar on-dark" role="region" aria-label="Current sending destination">
      <span>Country</span>
    </div>
  );
}

function SettingsNav() {
  return (
    <aside className="settings-nav" aria-label="Settings sections">
      <h2>Settings</h2>
      <nav className="settings-nav-list">
        <a className="settings-nav-item active" href="/us/en/users/settings/profile" aria-current="page">
          Profile information
        </a>
        <a className="settings-nav-item" href="/us/en/users/settings/profile">
          Notifications
        </a>
        <a className="settings-nav-item" href="/us/en/users/settings/profile">
          Contacts
        </a>
        <a className="settings-nav-item" href="/us/en/users/settings/profile">
          Payment methods
        </a>
        <a className="settings-nav-item" href="/us/en/users/settings/profile">
          Your privacy choices
        </a>
        <a className="settings-nav-item" href="/us/en/users/settings/profile">
          Legal resources
        </a>
        <a className="settings-nav-item" href="/us/en/users/settings/profile">
          <span>Get Remitly Business</span>
          <span className="new-badge">NEW</span>
        </a>
      </nav>
    </aside>
  );
}

function ScenarioCard({
  scenario,
  onScenarioChange
}: {
  scenario: ScenarioId;
  onScenarioChange: (scenario: ScenarioId) => void;
}) {
  return (
    <div className="scenario-card">
      <div className="field">
        <label htmlFor="scenario-select">Choose a team-review scenario</label>
        <select
          id="scenario-select"
          value={scenario}
          onChange={(event) => onScenarioChange(event.target.value as ScenarioId)}
        >
          {scenarioOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="scenario-summary">
        <p>{selectedScenarioCopy(scenario)}</p>
        <p>
          <strong>Expected result:</strong> {selectedScenario(scenario).expectedResult}
        </p>
        <p>
          <strong>Review focus:</strong> {selectedScenario(scenario).reviewFocus}
        </p>
      </div>
    </div>
  );
}

function ProfilePanel({
  profile,
  scenario,
  onScenarioChange,
  onStartLegalFlow,
  onOpenPreferred
}: {
  profile: CustomerProfile;
  scenario: ScenarioId;
  onScenarioChange: (scenario: ScenarioId) => void;
  onStartLegalFlow: () => void;
  onOpenPreferred: () => void;
}) {
  return (
    <section className="profile-panel" aria-labelledby="profile-title">
      <h1 className="panel-title" id="profile-title">
        Profile information
      </h1>
      <ScenarioCard scenario={scenario} onScenarioChange={onScenarioChange} />
      <ProfileRow
        label="Name"
        value={profile.legalNameCurrent}
        helper="Legal name is used for identity verification, transfer security, and payment checks."
        actionLabel="Request change"
        onAction={onStartLegalFlow}
      />
      <ProfileRow
        label="Preferred name"
        value={profile.preferredName}
        helper="Used in greetings and support. Legal name stays unchanged."
        actionLabel="Edit preferred name"
        onAction={onOpenPreferred}
      />
      <ProfileRow label="Address" value={profile.addressLines.join("\n")} actionLabel="Edit address" />
      <ProfileRow label="Phone number" value={profile.phone} actionLabel="Edit phone number" />
      <ProfileRow label="Email address" value={profile.email} />
      <ProfileRow label="Password" value="••••••••••••" actionLabel="Edit password" />
      <ProfileRow label="Language" value={profile.language} actionLabel="Edit language" />
      <ProfileRow label="Sending to" value={profile.sendingTo} actionLabel="Edit sending destination" />
      <ProfileRow
        label="Sending from"
        value={profile.sendingFrom}
        helper="Learn how to change where you are sending from"
      />
      <div className="profile-row">
        <div className="row-label">My Remitly</div>
        <button className="text-link danger-link" type="button">
          Close my profile
        </button>
      </div>
    </section>
  );
}

function ProfileRow({
  label,
  value,
  helper,
  actionLabel,
  onAction
}: {
  label: string;
  value: string;
  helper?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="profile-row">
      <div className="row-head">
        <div className="row-label">{label}</div>
        {actionLabel ? (
          <button className="text-link" type="button" onClick={onAction} aria-label={actionLabel}>
            {actionLabel}
          </button>
        ) : null}
      </div>
      <div className="row-value">
        {value.split("\n").map((line) => (
          <span key={line}>
            {line}
            <br />
          </span>
        ))}
      </div>
      {helper ? <div className="helper-text">{helper}</div> : null}
    </div>
  );
}

function PreferredNamePanel({
  legalName,
  preferredName,
  success,
  onPreferredNameChange,
  onSave,
  onBack
}: {
  legalName: string;
  preferredName: string;
  success: string;
  onPreferredNameChange: (value: string) => void;
  onSave: () => void;
  onBack: () => void;
}) {
  return (
    <FlowPanel
      step="preferred"
      kicker="Preferred name"
      title="Use a preferred name in the app"
      copy="Preferred name changes greetings and support conversations. It does not change your legal name, past transfers, saved payment information, or identity checks."
    >
      <div className="field">
        <label htmlFor="preferred-name">Preferred name</label>
        <input
          id="preferred-name"
          value={preferredName}
          onChange={(event) => onPreferredNameChange(event.target.value)}
        />
      </div>
      <div className="review-table" aria-label="Preferred-name safety summary">
        <ReviewRow label="Legal name" value={`${legalName} (unchanged)`} />
        <ReviewRow label="Preferred name" value={preferredName || "Not set"} />
        <ReviewRow label="Used for" value="Greeting, profile header, and support conversations." />
      </div>
      {success ? (
        <div className="alert success" role="status">
          <strong>{success}</strong>
          <span>Legal name unchanged.</span>
        </div>
      ) : null}
      <div className="button-row">
        <button className="rmt-button primary" type="button" onClick={onSave}>
          Save preferred name
        </button>
        <button className="rmt-button ghost" type="button" onClick={onBack}>
          Back to profile
        </button>
      </div>
    </FlowPanel>
  );
}

function FlowPanel({
  step,
  kicker,
  title,
  copy,
  children
}: {
  step: Step;
  kicker: string;
  title: string;
  copy: string;
  children: React.ReactNode;
}) {
  const progress = progressFor(step);

  return (
    <section className="flow-panel" aria-labelledby="flow-title">
      <div className="flow-header">
        <div className="flow-kicker">{kicker}</div>
        <h1 className="flow-title" id="flow-title">
          {title}
        </h1>
        <p className="flow-copy">{copy}</p>
      </div>
      {progress ? (
        <div
          className="progress"
          aria-label={`Step ${progress.current} of ${progress.total}: ${progress.label}`}
        >
          <div className="helper-text">
            Step {progress.current} of {progress.total}: {progress.label}
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      ) : null}
      {children}
    </section>
  );
}

function UploadCard({
  title,
  copy,
  examples,
  done,
  buttonLabel,
  onClick
}: {
  title: string;
  copy: string;
  examples: string;
  done: boolean;
  buttonLabel: string;
  onClick: () => void;
}) {
  return (
    <div className={done ? "upload-card done" : "upload-card"}>
      <div className="upload-title">{title}</div>
      <div className="helper-text">{copy}</div>
      <div className="helper-text">
        <strong>Accepted examples:</strong> {examples}
      </div>
      <button className="rmt-button secondary" type="button" onClick={onClick}>
        {buttonLabel}
      </button>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="review-row">
      <div className="review-label">{label}</div>
      <div>{value}</div>
    </div>
  );
}

function statusTitle(caseRecord: NameChangeCase) {
  if (caseRecord.status === "approved") {
    return "Legal name change approved";
  }
  if (caseRecord.status === "under_review_manual") {
    return "Specialist review needed";
  }
  if (caseRecord.status === "needs_more_info") {
    return "One more document needed";
  }
  if (caseRecord.status === "blocked") {
    return "Request paused for account protection";
  }
  if (caseRecord.status === "rejected") {
    return "Request could not be approved";
  }
  return "Request submitted";
}

function statusLabel(status: NameChangeCase["status"]) {
  const labels: Record<NameChangeCase["status"], string> = {
    draft: "Draft",
    awaiting_step_up_auth: "Waiting for account check",
    awaiting_id: "Waiting for photo identification",
    awaiting_proof: "Waiting for name-change document",
    awaiting_selfie: "Awaiting selfie",
    under_review_auto: "Reviewing",
    under_review_manual: "Specialist review",
    blocked: "Blocked",
    approved: "Approved",
    needs_more_info: "More information needed",
    rejected: "Rejected",
    synced_partial: "Updated in some places",
    synced_complete: "Update complete"
  };
  return labels[status];
}

function evidenceSummary(caseRecord: NameChangeCase | null) {
  if (!caseRecord) {
    return "Not attached yet";
  }

  const attached = [
    caseRecord.evidence.hasGovernmentId ? "photo identification" : "",
    caseRecord.evidence.hasLegalProof ? "name-change document" : "",
    caseRecord.evidence.hasSelfie ? "selfie check" : ""
  ].filter(Boolean);

  return attached.length ? attached.join(", ") : "No documents attached";
}

function StatusBody({
  caseRecord,
  supportReviewRequested
}: {
  caseRecord: NameChangeCase;
  supportReviewRequested: boolean;
}) {
  if (caseRecord.status === "approved") {
    return (
      <div className="upload-grid">
        <div className="alert success">
          <strong>What changed</strong>
          <span>
            Legal name changed from {caseRecord.previousLegalName} to{" "}
            {caseRecord.proposedLegalName}. The previous name stays in the case
            history for safety checks and support.
          </span>
        </div>
        {caseRecord.needsPaymentNameCheck ? (
          <div className="alert warning">
            <strong>Check the name on your saved card</strong>
            <span>
              Some card payments work best when the name on the card matches
              the name in Remitly. Check your saved card before sending money.
            </span>
          </div>
        ) : null}
        <SyncList caseRecord={caseRecord} />
      </div>
    );
  }

  if (caseRecord.status === "under_review_manual") {
    return (
      <div className="alert warning">
        <strong>Specialist review</strong>
        <span>
          {caseRecord.decision?.reviewerNote ??
            "A specialist will compare the prior and proposed names before any account update."}
        </span>
      </div>
    );
  }

  if (caseRecord.status === "needs_more_info") {
    return (
      <div className="alert warning">
        <strong>More information needed</strong>
        <span>
          Add a new photo identification document and a name-change document
          before this request can be approved.
        </span>
      </div>
    );
  }

  if (caseRecord.status === "blocked") {
    return (
      <div className="upload-grid">
        <div className="alert danger">
          <strong>Request paused</strong>
          <span>
            The account check did not pass, so the prototype stopped before
            collecting identity documents.
          </span>
        </div>
        <div className={supportReviewRequested ? "alert success" : "alert info"}>
          <strong>
            {supportReviewRequested ? "Support review requested" : "Support can review this"}
          </strong>
          <span>
            {supportReviewRequested
              ? "Support would use the case history and account signals to decide the next safe step."
              : "The customer can ask support to review the block without emailing identity documents."}
          </span>
        </div>
      </div>
    );
  }

  if (caseRecord.status === "rejected") {
    return (
      <div className="alert danger">
        <strong>Request not approved</strong>
        <span>Contact support for the next safe step.</span>
      </div>
    );
  }

  return (
    <div className="alert info">
      <strong>Submitted</strong>
      <span>Review is in progress.</span>
    </div>
  );
}

function SyncList({ caseRecord }: { caseRecord: NameChangeCase }) {
  return (
    <div className="sync-list" aria-label="Where the name update is saved">
      {caseRecord.downstreamSync.map((item) => (
        <div className="sync-row" key={item.system}>
          <div className={item.status === "complete" ? "status-pill success" : "status-pill warning"}>
            {item.status === "complete" ? "Complete" : "Needs attention"}
          </div>
          <strong>{systemDisplayName(item.system)}</strong>
          <span className="helper-text">{item.detail}</span>
        </div>
      ))}
    </div>
  );
}

function systemDisplayName(system: string) {
  const labels: Record<string, string> = {
    "identity-service": "Identity record",
    "screening-service": "Safety checks",
    "payments-profile-service": "Payment profile",
    "support-case-service": "Support case"
  };

  return labels[system] ?? system;
}

function Footer() {
  return (
    <footer className="footer on-dark">
      <div className="footer-grid">
        <section>
          <h2>Company</h2>
          <a href="/us/en/users/settings/profile">About</a>
          <a href="/us/en/users/settings/profile">Blog</a>
          <a href="/us/en/users/settings/profile">Careers</a>
        </section>
        <section>
          <h2>Products</h2>
          <a href="/us/en/users/settings/profile">Send Money</a>
          <a href="/us/en/users/settings/profile">Remitly One</a>
          <a href="/us/en/users/settings/profile">Remitly Business</a>
        </section>
        <section>
          <h2>Resources</h2>
          <a href="/us/en/users/settings/profile">Rates and Fees</a>
          <a href="/us/en/users/settings/profile">Fraud and Scam Resources</a>
          <a href="/us/en/users/settings/profile">Currency Converter</a>
        </section>
        <section>
          <h2>Support</h2>
          <a href="/us/en/users/settings/profile">Help</a>
          <a href="/us/en/users/settings/profile">File a complaint</a>
          <h3>Connect</h3>
          <span aria-label="Social links">f x</span>
        </section>
      </div>
      <div className="footer-bottom">
        <strong>Remitly</strong>
        <p>
          Prototype only. No real personal information, vendor keys, document
          scanning, or production identity services are used.
        </p>
      </div>
    </footer>
  );
}
