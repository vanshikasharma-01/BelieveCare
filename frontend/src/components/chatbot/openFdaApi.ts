/**
 * Thin wrapper around the public openFDA Drug Label endpoint.
 * Docs: https://open.fda.gov/apis/drug/label/
 *
 * No API key is required for light usage. This is called
 * directly from the browser since openFDA allows CORS.
 */

export interface OpenFdaSummary {
  purpose?: string;
  indications?: string;
  warnings?: string;
  dosage?: string;
}

const OPENFDA_BASE = "https://api.fda.gov/drug/label.json";

/** Trims long FDA label text down to a short, chat-friendly snippet. */
function shorten(text: string | undefined, maxLen = 260): string | undefined {
  if (!text) return undefined;
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen).trim() + "…";
}

/**
 * Looks up a generic/active-ingredient name against openFDA and
 * returns a short summary, or null if nothing usable was found.
 */
export async function fetchOpenFdaSummary(
  genericTerm: string
): Promise<OpenFdaSummary | null> {
  const query = `openfda.generic_name:"${genericTerm}"`;
  const url = `${OPENFDA_BASE}?search=${encodeURIComponent(query)}&limit=1`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;

    const data = await res.json();
    const result = data?.results?.[0];
    if (!result) return null;

    return {
      purpose: shorten(result.purpose?.[0]),
      indications: shorten(result.indications_and_usage?.[0]),
      warnings: shorten(result.warnings?.[0] ?? result.warnings_and_cautions?.[0]),
      dosage: shorten(result.dosage_and_administration?.[0]),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
