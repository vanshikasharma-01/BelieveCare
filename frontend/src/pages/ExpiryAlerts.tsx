// import { useState } from "react";
// import Navbar from "../components/Navbar";
// import inventoryData from "../data/inventory";
// import "../styles/expiryAlerts.css";

// function ExpiryAlerts() {

//   const [filter, setFilter] = useState("All");

//   const today = new Date();

//   const medicines = inventoryData.map((medicine) => {

//     const expiryDate = new Date(medicine.expiry);

//     const difference = Math.ceil(
//       (expiryDate - today) /
//       (1000 * 60 * 60 * 24)
//     );

//     let status = "";

//     if (difference < 0) {

//       status = "Expired";

//     }

//     else if (difference <= 30) {

//       status = "Expiring Soon";

//     }

//     else {

//       status = "Safe";

//     }

//     return {

//       ...medicine,

//       difference,

//       status

//     };

//   });

//   const filteredMedicines = medicines.filter((medicine) => {

//     if (filter === "All") return true;

//     return medicine.status === filter;

//   });

//   return (

//     <>

//       <Navbar />

//       <div className="expiry-page">

//         <h1>Expiry Alerts</h1>

//         <p>

//           Monitor medicines that are expired or expiring soon.

//         </p>

//         <div className="expiry-filter">

//           <label>Filter :</label>

//           <select
//             value={filter}
//             onChange={(e) => setFilter(e.target.value)}
//           >

//             <option>All</option>

//             <option>Expired</option>

//             <option>Expiring Soon</option>

//             <option>Safe</option>

//           </select>

//         </div>

//         <div className="expiry-table-container">

//           <table className="expiry-table">

//             <thead>

//               <tr>

//                 <th>Image</th>

//                 <th>Medicine</th>

//                 <th>Brand</th>

//                 <th>Expiry Date</th>

//                 <th>Days Left</th>

//                 <th>Status</th>

//                 <th>Action</th>

//               </tr>

//             </thead>

//             <tbody>

//               {filteredMedicines.map((medicine) => {

//                 let color = "green";

//                 if (medicine.status === "Expired") {

//                   color = "red";

//                 }

//                 else if (medicine.status === "Expiring Soon") {

//                   color = "orange";

//                 }

//                 return (

//                   <tr key={medicine.id}>

//                     <td>

//                       {medicine.image ? (

//                         <img
//                           src={medicine.image}
//                           alt={medicine.name}
//                           className="medicine-image"
//                         />

//                       ) : (

//                         "📦"

//                       )}

//                     </td>

//                     <td>{medicine.name}</td>

//                     <td>{medicine.brand}</td>

//                     <td>{medicine.expiry}</td>

//                     <td>{medicine.difference}</td>

//                     <td
//                       style={{
//                         color: color,
//                         fontWeight: "bold"
//                       }}
//                     >

//                       {medicine.status}

//                     </td>

//                     <td>

//                       <button
//                         className="restock-btn"
//                         onClick={() =>
//                           alert(
//                             `${medicine.name} should be checked for replacement.`
//                           )
//                         }
//                       >

//                         View

//                       </button>

//                     </td>

//                   </tr>

//                 );

//               })}

//             </tbody>

//           </table>

//         </div>

//       </div>

//     </>

//   );

// }

// export default ExpiryAlerts;

import { useState, useEffect } from "react";
import AdminNavbar from "../components/owner/AdminNavbar";
import Sidebar from "../components/owner/Sidebar";
import { getExpiringMedicines } from "../api/medicineApi";
import { useToast } from "../context/ToastContext";
import "../styles/expiryAlerts.css";

function ExpiryAlerts() {

  const [filter, setFilter] = useState<string>("All");
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const { showToast } = useToast();

  useEffect(() => {
    const fetchExpiring = async () => {
      try {
        const data = await getExpiringMedicines(30);
        setMedicines(data.medicines);
      } catch (err) {
        console.error("Failed to load expiry alerts:", err);
        setError("Could not load expiry alerts. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchExpiring();
  }, []);

  const filteredMedicines = medicines.filter((medicine) => {

    if (filter === "All") {

      return true;

    }

    return medicine.status === filter;

  });

  return (

    <>

      <AdminNavbar title="Expiry Alerts" />

      <div className="owner-dashboard">
      <Sidebar />

      <div className="expiry-page owner-main">

        <h1>Expiry Alerts</h1>

        <p>

          Monitor medicines that are expired or expiring soon.

        </p>

        <div className="expiry-filter">

          <label>Filter :</label>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >

            <option>All</option>

            <option>Expired</option>

            <option>Expiring Soon</option>

          </select>

        </div>

        {loading && <p>Loading expiry alerts...</p>}

        {error && <p className="expiry-error">{error}</p>}

        {!loading && !error && (
        <div className="expiry-table-container">

          <table className="expiry-table">

            <thead>

              <tr>

                <th>Image</th>

                <th>Medicine</th>

                <th>Brand</th>

                <th>Expiry Date</th>

                <th>Days Left</th>

                <th>Status</th>

              </tr>

            </thead>

            <tbody>

              {filteredMedicines.map((medicine) => {

                let color = "green";

                if (medicine.status === "Expired") {

                  color = "red";

                }

                else if (
                  medicine.status === "Expiring Soon"
                ) {

                  color = "orange";

                }

                return (

                  <tr key={medicine._id}>

                    <td>

                      {medicine.image ? (

                        <img
                          src={medicine.image}
                          alt={medicine.name}
                          className="medicine-image"
                        />

                      ) : (

                        "📦"

                      )}

                    </td>

                    <td>{medicine.name}</td>

                    <td>{medicine.brand}</td>

                    <td>{medicine.expiry}</td>

                    <td>{medicine.daysLeft < 0 ? 0 : medicine.daysLeft}</td>

                    <td
                      style={{
                        color,
                        fontWeight: "bold"
                      }}
                    >

                      {medicine.status}

                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>
        )}

      </div>

      </div>

    </>

  );

}

export default ExpiryAlerts;