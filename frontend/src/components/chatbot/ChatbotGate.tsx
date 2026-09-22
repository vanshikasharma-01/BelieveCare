import { useLocation } from "react-router-dom";
import ChatbotWidget from "./ChatbotWidget";
import { isKnownRoute } from "../../utils/knownRoutes";

// Pages where the chatbot should stay hidden: login/signup screens
// and every owner/admin-only route.
const HIDDEN_PREFIXES = [
  "/signup",
  "/admin",
  "/owner",
  "/add-medicine",
  "/scan-barcode",
  "/inventory-dashboard",
  "/low-stock-dashboard",
  "/billing-dashboard",
];

function isCustomerPage(pathname: string): boolean {
  if (pathname === "/") return false; // login page
  // Any URL that doesn't match a real page (404) shouldn't show the
  // chatbot alongside the "Page Not Found" card.
  if (!isKnownRoute(pathname)) return false;
  return !HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default function ChatbotGate() {
  const { pathname } = useLocation();

  if (!isCustomerPage(pathname)) return null;

  return <ChatbotWidget />;
}
