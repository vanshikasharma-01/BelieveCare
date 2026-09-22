// 

import "../styles/expiryBadge.css";

interface ExpiryBadgeProps {
  expiry: string;
}

function ExpiryBadge({
  expiry
}: ExpiryBadgeProps) {

  const today = new Date();
  const expiryDate = new Date(expiry);

  const months =
    (expiryDate.getFullYear() - today.getFullYear()) * 12 +
    (expiryDate.getMonth() - today.getMonth());

  let status = "";
  let className = "";

  if (months < 0) {

    status = "Expired";
    className = "expired";

  } else if (months < 3) {

    status = "Expiring Soon";
    className = "red";

  } else if (months < 6) {

    status = "Medium";
    className = "yellow";

  } else {

    status = "Safe";
    className = "green";

  }

  return (

    <span className={`expiry-badge ${className}`}>

      {status}

    </span>

  );

}

export default ExpiryBadge;