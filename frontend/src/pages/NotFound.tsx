import { Link } from "react-router-dom";
import "../styles/notFound.css";

function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-text">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Link to="/home" className="not-found-home-btn">
          Go to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
