// import "../styles/stockBadge.css";

// function StockBadge({ stock }) {

//   let status = "";
//   let className = "";

//   if (stock > 20) {
//     status = "In Stock";
//     className = "green";
//   } else if (stock >= 10) {
//     status = "Low Stock";
//     className = "yellow";
//   } else if (stock > 0) {
//     status = "Very Low";
//     className = "red";
//   } else {
//     status = "Out of Stock";
//     className = "black";
//   }

//   return (
//     <span className={`stock-badge ${className}`}>
//       {status}
//     </span>
//   );
// }

// export default StockBadge;

import "../styles/stockBadge.css";

interface StockBadgeProps {
  stock: number;
}

function StockBadge({
  stock,
}: StockBadgeProps){

  let status = "";
  let className = "";

  if (stock > 20) {

    status = "In Stock";
    className = "green";

  }

  else if (stock >= 10) {

    status = "Low Stock";
    className = "yellow";

  }

  else if (stock > 0) {

    status = "Very Low";
    className = "red";

  }

  else {

    status = "Out of Stock";
    className = "black";

  }

  return (

    <span
      className={`stock-badge ${className}`}
    >

      {status}

    </span>

  );

}

export default StockBadge;