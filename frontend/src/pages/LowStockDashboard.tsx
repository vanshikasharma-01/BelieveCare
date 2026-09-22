// import { useState } from "react";
// import Navbar from "../components/Navbar";
// import medicines from "../data/medicines";
// import "../styles/lowStockDashboard.css";

// function LowStockDashboard() {

//   const [search, setSearch] = useState("");

//   const lowStockCount = medicines.filter(
//   (medicine) =>
//     medicine.stock > 10 &&
//     medicine.stock <= 50
// ).length;

//     const criticalCount = medicines.filter(
//     (medicine) =>
//         medicine.stock > 0 &&
//         medicine.stock <= 10
//     ).length;

//     const outOfStockCount = medicines.filter(
//     (medicine) =>
//         medicine.stock === 0
//     ).length;

//     const totalAlert =
//     lowStockCount +
//     criticalCount +
//     outOfStockCount;

//   const lowStockMedicines = medicines.filter((medicine) => {

//     const matchesSearch =
//       medicine.name
//         .toLowerCase()
//         .includes(search.toLowerCase()) ||
//       medicine.brand
//         .toLowerCase()
//         .includes(search.toLowerCase());

//     return matchesSearch && medicine.stock <= 50;

//   });

//   return (

//     <>

//       <Navbar />

//       <div className="low-stock-container">

//         <h1>Low Stock Dashboard</h1>

//         <p>

//           Monitor medicines that need to be reordered.

//         </p>

//         <div className="stock-summary">

//         <div className="stock-card">

//             <h3>Total Alerts</h3>

//             <h1>{totalAlert}</h1>

//         </div>

//         <div className="stock-card orange">

//             <h3>Low Stock</h3>

//             <h1>{lowStockCount}</h1>

//         </div>

//         <div className="stock-card red">

//             <h3>Critical</h3>

//             <h1>{criticalCount}</h1>

//         </div>

//         <div className="stock-card black">

//             <h3>Out of Stock</h3>

//             <h1>{outOfStockCount}</h1>

//         </div>

//         </div>

//         <input
//           type="text"
//           placeholder="Search Medicine..."
//           value={search}
//           onChange={(e) =>
//             setSearch(e.target.value)
//           }
//           className="search-box"
//         />

//         <table className="low-stock-table">

//           <thead>

//             <tr>

//               <th>Medicine</th>

//               <th>Brand</th>

//               <th>Category</th>

//               <th>Stock</th>

//               <th>Status</th>

//               <th>Action</th>

//             </tr>

//           </thead>

//           <tbody>

//             {lowStockMedicines.map((medicine) => {

//               let status = "";
//               let color = "";

//               if (medicine.stock === 0) {

//                 status = "Out of Stock";
//                 color = "red";

//               }

//               else if (medicine.stock <= 10) {

//                 status = "Critical";
//                 color = "darkred";

//               }

//               else {

//                 status = "Low Stock";
//                 color = "orange";

//               }

//               return (

//                 <tr key={medicine.id}>

//                   <td>{medicine.name}</td>

//                   <td>{medicine.brand}</td>

//                   <td>{medicine.category}</td>

//                   <td>{medicine.stock}</td>

//                   <td
//                     style={{
//                       color: color,
//                       fontWeight: "bold"
//                     }}
//                   >

//                     {status}

//                   </td>

//                   <td>

//                     <button
//                       className="reorder-btn"
//                       onClick={() =>
//                         alert(
//                           `${medicine.name} has been marked for reorder.`
//                         )
//                       }
//                     >

//                       Reorder

//                     </button>

//                   </td>

//                 </tr>

//               );

//             })}

//           </tbody>

//         </table>

//       </div>

//     </>

//   );

// }

// export default LowStockDashboard;

import { useState, useEffect } from "react";
import AdminNavbar from "../components/owner/AdminNavbar";
import Sidebar from "../components/owner/Sidebar";
import { getLowStockMedicines } from "../api/medicineApi";
import "../styles/lowStockDashboard.css";

function LowStockDashboard() {

  const [search, setSearch] = useState<string>("");
  const [medicines, setMedicines] = useState<any[]>([]);
  const [counts, setCounts] = useState({
    totalAlerts: 0,
    outOfStockCount: 0,
    criticalCount: 0,
    lowStockCount: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const data = await getLowStockMedicines(50);

        setMedicines(data.medicines);
        setCounts({
          totalAlerts: data.totalAlerts,
          outOfStockCount: data.outOfStockCount,
          criticalCount: data.criticalCount,
          lowStockCount: data.lowStockCount,
        });
      } catch (err) {
        console.error("Failed to load low stock alerts:", err);
        setError("Could not load low stock alerts. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchLowStock();
  }, []);

  const lowStockMedicines = medicines.filter((medicine) => {

    const matchesSearch =
      medicine.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||

      medicine.brand
        .toLowerCase()
        .includes(search.toLowerCase());


    return matchesSearch;

  });



  return (

    <>

      <AdminNavbar title="Low Stock" />

      <div className="owner-dashboard">
      <Sidebar />

      <div className="low-stock-container owner-main">


        <h1>
          Low Stock Dashboard
        </h1>


        <p>
          Monitor medicines that need to be reordered.
        </p>



        <div className="stock-summary">


          <div className="stock-card">

            <h3>
              Total Alerts
            </h3>

            <h1>
              {counts.totalAlerts}
            </h1>

          </div>



          <div className="stock-card orange">

            <h3>
              Low Stock
            </h3>

            <h1>
              {counts.lowStockCount}
            </h1>

          </div>




          <div className="stock-card red">

            <h3>
              Critical
            </h3>

            <h1>
              {counts.criticalCount}
            </h1>

          </div>




          <div className="stock-card black">

            <h3>
              Out of Stock
            </h3>

            <h1>
              {counts.outOfStockCount}
            </h1>

          </div>


        </div>




        <input

          type="text"

          placeholder="Search Medicine..."

          value={search}

          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }

          className="search-box"

        />

        {loading && <p>Loading alerts...</p>}

        {error && <p className="low-stock-error">{error}</p>}

        {!loading && !error && (
        <>
        {lowStockMedicines.length === 0 ? (
          <div className="low-stock-empty">
            No medicines match your search.
          </div>
        ) : (
        <table className="low-stock-table">


          <thead>

            <tr>

              <th>
                Medicine
              </th>


              <th>
                Brand
              </th>


              <th>
                Category
              </th>


              <th>
                Stock
              </th>


              <th>
                Status
              </th>


            </tr>

          </thead>



          <tbody>


            {lowStockMedicines.map((medicine) => {


              let status: string = "";

              let pillClass: string = "";



              if (medicine.stock === 0) {

                status = "Out of Stock";
                pillClass = "out";

              }


              else if (medicine.stock <= 10) {

                status = "Critical";
                pillClass = "critical";

              }


              else {

                status = "Low Stock";
                pillClass = "low";

              }



              return (

                <tr key={medicine._id}>


                  <td>
                    {medicine.name}
                  </td>


                  <td>
                    {medicine.brand}
                  </td>


                  <td>
                    {medicine.category}
                  </td>


                  <td className="stock-cell">
                    {medicine.stock}
                  </td>



                  <td>

                    <span className={`status-pill ${pillClass}`}>
                      {status}
                    </span>

                  </td>

                </tr>

              );


            })}


          </tbody>


        </table>
        )}
        </>
        )}


      </div>

      </div>

    </>

  );

}


export default LowStockDashboard;