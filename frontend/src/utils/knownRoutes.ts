import { matchPath } from "react-router-dom";

// Every path pattern that's actually registered in App.tsx's
// <Routes>. Kept here (rather than only inline in App.tsx) so
// Footer/ChatbotGate can independently tell "a real page" apart
// from "the catch-all 404 route" without duplicating this list.
export const KNOWN_ROUTE_PATTERNS = [
  "/",
  "/admin",
  "/add-medicine",
  "/add-medicine-manual",
  "/add-medicine-manual/medicine",
  "/add-medicine-manual/wellness",
  "/add-medicine-manual/cosmetics",
  "/add-medicine-manual/tools",
  "/signup",
  "/reset-password/:token",
  "/home",
  "/checkout",
  "/cart",
  "/wishlist",
  "/profile",
  "/settings",
  "/scan-barcode",
  "/addresses",
  "/first-aid",
  "/orders",
  "/medicines",
  "/faq",
  "/contact-us",
  "/about-us",
  "/terms-and-conditions",
  "/payment-success",
  "/medicine/:id",
  "/owner-dashboard",
  "/inventory-dashboard",
  "/billing-dashboard",
  "/low-stock-dashboard",
  "/owner/expiry-alerts",
  "/owner/orders",
  "/owner/feedback",
];

export function isKnownRoute(pathname: string): boolean {
  return KNOWN_ROUTE_PATTERNS.some((pattern) =>
    matchPath({ path: pattern, end: true }, pathname)
  );
}
