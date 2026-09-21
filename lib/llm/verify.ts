/* ============================================================
   REPLY VERIFICATION

   The server decides what opens. The model only narrates that —
   and it has been caught narrating it wrongly: announcing
   "Record opened. Skills & certifications now visible beneath
   this panel." on a turn where nothing opened and no panel was
   rendered. The visitor then stares at a message describing a
   thing that is not on their screen and concludes the site is
   broken.

   Prompt instructions are guidance, not a guarantee. Any factual
   claim the server owns has to be enforced by the server, so a
   reply that contradicts what actually happened is discarded and
   the deterministic scripted reply is used instead.
   ============================================================ */

/** Phrases that assert access was granted. */
const CLAIMS_OPEN =
  /\b(record (is |now )?open(ed)?|now (visible|available|open|unlocked|accessible)|access granted|unlock(ed|ing)?|i have opened|has been (opened|granted|released)|you (now )?have access|released to you|opening the record|panel below|beneath this panel|in the panel)\b/i;

/** Phrases that deny having content the visitor can plainly see. */
const CLAIMS_UNAVAILABLE =
  /\b(not available|unavailable|cannot (show|display|provide|access)|can'?t (show|display|provide)|no (further )?details|details are not|not accessible|in this interface)\b/i;

export type RejectReason = "false-open" | "false-unavailable";

/**
 * Returns a reason when the model's reply contradicts reality, or null
 * when it is consistent with what the server actually did.
 */
export function replyContradictsState(
  reply: string,
  opened: string[],
): RejectReason | null {
  if (!reply) return null;

  // Nothing opened, but the reply says something did.
  if (opened.length === 0 && CLAIMS_OPEN.test(reply)) return "false-open";

  // Something DID open — the panel is on screen — but the reply denies it.
  if (opened.length > 0 && CLAIMS_UNAVAILABLE.test(reply)) {
    return "false-unavailable";
  }

  return null;
}
