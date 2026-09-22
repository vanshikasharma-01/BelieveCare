import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/images/logo.png";
import { LanguageContext } from "../context/LanguageContext";
import translations from "../data/translations";
import { isKnownRoute } from "../utils/knownRoutes";
import "../styles/footer.css";

// Hidden on auth pages and the entire admin area — footer is a
// customer-facing element only.
const HIDDEN_PREFIXES = ["/login", "/signup", "/", "/owner", "/inventory-dashboard", "/low-stock-dashboard", "/scan-barcode", "/add-medicine", "/add-medicine-manual"];

function Footer() {

  const location = useLocation();
  const { language } = useContext(LanguageContext);
  const text = translations[language as keyof typeof translations];

  // Also hidden on any URL that doesn't match a real page (404) —
  // the footer shouldn't show up alongside a "Page Not Found" card.
  if (!isKnownRoute(location.pathname)) return null;

  const hide = HIDDEN_PREFIXES.some((prefix) => {
    if (prefix === "/") return location.pathname === "/";
    return location.pathname.startsWith(prefix);
  });

  if (hide) return null;

  return (
    <footer className="site-footer">

      <div className="footer-grid">

        <div className="footer-col">

          <div className="footer-logo">
            <img src={logo} alt="Believecare" />
            <span>Believecare</span>
          </div>

          <p className="footer-tagline">{text.footerTagline}</p>

        </div>

        <div className="footer-col">

          <h3>{text.footerCompany}</h3>

          <Link to="/about-us">{text.footerAboutUs}</Link>
          <Link to="/faq">{text.footerFaq}</Link>
          <Link to="/terms-and-conditions">{text.footerTerms}</Link>

        </div>

        <div className="footer-col">

          <h3>{text.footerGetInTouch}</h3>

          <Link to="/contact-us">{text.footerContactUs}</Link>
          <p>aggarwalmedicals@gmail.com</p>
          <p>+91 98765 43210</p>

        </div>

        <div className="footer-col footer-map-col">

          <h3>{text.footerVisitStore}</h3>

      <iframe
        title="Believecare Store Location"
        className="footer-map"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2353675.181540616!2d76.93491879817041!3d29.14406943361039!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5f5685df6e9%3A0x45c1643664aac792!2sAggarwal%20medical%20Store!5e0!3m2!1sen!2sin!4v1785163552932!5m2!1sen!2sin"
      />

        </div>

      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Believecare. {text.footerRights}
      </div>

    </footer>
  );
}

export default Footer;