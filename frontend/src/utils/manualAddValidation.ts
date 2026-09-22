// Shared validation helpers for the category-specific "Add Manually"
// product forms (Medicine / Wellness / Cosmetics / Medical Tools).

// A name-like field (product name, brand, manufacturer, generic name)
// must start with a letter — catches accidental barcode/number paste
// and keeps catalog names readable.
export const NAME_LIKE_PATTERN = /^[A-Za-z]/;

export const BARCODE_PATTERN = /^\d{8,14}$/;

export const STRENGTH_PATTERN = /^\d+(\.\d+)?\s?(mg|mcg|g|kg|ml|l|iu|%)$/i;

export const IMAGE_URL_PATTERN = /^https?:\/\/.+/i;

export function getCurrentMonthValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// Turns "Fever, Headache,  Body Ache" into ["Fever", "Headache", "Body Ache"]
export const toList = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

// Validates a "name-like" field: required, min length, must not start
// with a digit. Returns an error message, or "" if valid.
export function validateNameLike(value: string, label: string, minLength = 2): string {
  const trimmed = value.trim();

  if (!trimmed) return `${label} is required.`;
  if (/^\d/.test(trimmed)) return `${label} cannot start with a number.`;
  if (trimmed.length < minLength) return `${label} must be at least ${minLength} characters.`;

  return "";
}

// Barcode is optional. If left blank, no error. If provided, it must
// still match the expected format.
export function validateBarcode(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) return "";
  if (!BARCODE_PATTERN.test(trimmed)) return "Barcode must be 8–14 digits.";

  return "";
}

export function validatePrice(value: string): string {
  if (!value.trim()) return "Price is required.";

  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return "Price must be a number greater than 0.";

  return "";
}

export function validateStock(value: string): string {
  if (!value.trim()) return "Stock quantity is required.";

  const num = Number(value);
  if (!Number.isFinite(num) || num < 0 || !Number.isInteger(num)) {
    return "Stock must be a whole number of 0 or more.";
  }

  return "";
}

export function validateExpiry(value: string): string {
  if (!value.trim()) return "Expiry date is required.";
  if (value < getCurrentMonthValue()) return "Expiry date can't be in the past.";

  return "";
}

export function validateImageUrl(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) return "Image URL is required.";
  if (!IMAGE_URL_PATTERN.test(trimmed)) return "Enter a valid image URL starting with http:// or https://.";

  return "";
}

export function validateCommaList(value: string, label: string): string {
  if (toList(value).length === 0) return `Enter at least one ${label}.`;

  return "";
}

export function validateRequiredText(value: string, label: string, minLength = 5): string {
  const trimmed = value.trim();

  if (!trimmed) return `${label} is required.`;
  if (trimmed.length < minLength) return `${label} must be at least ${minLength} characters.`;

  return "";
}
