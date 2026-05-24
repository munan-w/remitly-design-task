# Decisions

## Legal name is a case, not an inline profile edit

The profile keeps `Name` read-only and adds a contextual `Request change` action. The flow creates a `NameChangeCase` with an account check, sample documents, selfie check, review result, previous-name history, and system updates.

Constraint: Local research and Remitly public language tie legal name to verification, transfer security, payment checks, screening, and support records.
Rejected: Inline text input for legal name | it would imply a low-risk profile edit and violate the design brief.
Confidence: high
Scope-risk: narrow

## Preferred name is separate from legal name

Preferred name has its own flow and API endpoint. It updates only `preferredName`; it never sends or mutates `legalNameCurrent`.

Constraint: Preferred-name precedent from Wise/Citi style patterns and project rules.
Rejected: Reusing legal-name update state for preferred name | creates payload risk where display data could overwrite regulated identity data.
Confidence: high
Scope-risk: narrow

## Mock services stay deterministic

The scenario selector drives deterministic outputs for six review situations: happy path, needs more documents, routine-safety-check specialist review, blocked account check, preferred-name only, and two-written-form specialist review. Small spelling corrections are no longer a separate MVE branch because they should enter through the same legal-name request and be policy-routed after account and evidence checks.

Constraint: Prototype must show feasibility and practicality, not production integration.
Rejected: Randomized risk scoring | harder to demo and harder to test.
Rejected: Separate spelling-fix scenario | implied a bypass before the product proves account ownership and identity continuity.
Confidence: high
Scope-risk: narrow

## Specialist review scenarios use plain triggers

The specialist review branch now names the actual trigger in customer language: a routine safety check found a similar name, or the documents show two written forms that do not line up clearly. The copy avoids saying the customer "matched" a list. It explains that a similar name needs human review and does not mean the customer is the person on the list.

Constraint: Official sanctions search tools use approximate name matching; legal-name evidence can require more documents when it does not clearly connect the person across old and new names.
Rejected: "Possible name match" | too vague and sounds accusatory to the customer.
Confidence: high
Scope-risk: narrow

## User-facing reason step is omitted

The flow asks for evidence, not a personal explanation. After account check, legal-name cases move straight to document collection: photo identification plus an official document that connects the old and new legal names. The decision engine still keeps system decision codes for audit, but those are not framed as a customer reason.

Constraint: Compliance review needs evidence quality, identity continuity, risk signals, and a decision record; asking users why their name changed adds privacy burden and confused the IA.
Rejected: Marriage/divorce/court/gender reason picker | overlaps document types with private life events and makes the flow harder to understand.
Confidence: high
Scope-risk: narrow

## Remitly visual language uses reconstructed tokens

The app uses the local MCP token file and Figma token node: navy anchors, warm secondary surfaces, bordered profile panel, side settings nav, pill buttons, visible labels, and functional motion.

Constraint: User requested Remitly design and tech language alignment.
Rejected: Generic fintech dashboard or gradient-heavy UI | conflicts with authenticated profile screenshot and MCP anti-patterns.
Confidence: high
Scope-risk: narrow
