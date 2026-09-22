// 

import { Link } from "react-router-dom";

interface SummaryCardsProps {

  totalMedicines: number;

  lowStock: number;

  criticalStock: number;

  outOfStock: number;

}

function SummaryCards({

  totalMedicines,

  lowStock,

  criticalStock,

  outOfStock

}: SummaryCardsProps) {

  return (

    <div className="summary-cards">

      <div className="summary-card">

        <h3>Total Medicines</h3>

        <h1>{totalMedicines}</h1>

      </div>

      <div className="summary-card warning">

        <h3>Low Stock</h3>

        <h1>{lowStock}</h1>

      </div>

      <Link
        to="/owner/expiry-alerts"
        className="dashboard-link"
      >

        <div className="summary-card danger">

          <h3>Critical Stock</h3>

          <h1>{criticalStock}</h1>

        </div>

      </Link>

      <div className="summary-card dark">

        <h3>Out Of Stock</h3>

        <h1>{outOfStock}</h1>

      </div>

      <div className="summary-card info">

        <h3>Today's Orders</h3>

        <h1>37</h1>

      </div>

      <div className="summary-card success">

        <h3>Revenue</h3>

        <h1>₹18,450</h1>

      </div>

    </div>

  );

}

export default SummaryCards;