// import { useState, useContext } from "react";
// import { LanguageContext } from "../context/LanguageContext";
// import { SeniorModeContext } from "../context/SeniorModeContext";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import Navbar from "../components/Navbar";
// import "../styles/settings.css";

// function Settings() {

//     const { language, setLanguage } = useContext(LanguageContext);

//     const { seniorMode, setSeniorMode } = useContext(SeniorModeContext);

//    const [editing, setEditing] = useState(false);

//   // User Information
//   const [user, setUser] = useState({
//     name: "Siya Saji",
//     email: "siya@example.com",
//     phone: "+91 9876543210"
//   });

//   // Password States
//   const [currentPassword, setCurrentPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   const [showCurrent, setShowCurrent] = useState(false);
//   const [showNew, setShowNew] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);

//   // Address States
//   const [addresses, setAddresses] = useState([
//     {
//       id: 1,
//       name: "Home",
//       address: "House No. 24, Rohini Sector 5, Delhi",
//       default: true
//     }
//   ]);

//   const [newAddress, setNewAddress] = useState("");

//   const [orderNotification, setOrderNotification] = useState(true);

// const [stockNotification, setStockNotification] = useState(true);

// const [offerNotification, setOfferNotification] = useState(true);

//   // =========================
//   // Personal Information
//   // =========================

//   function handleChange(e) {

//     setUser({
//       ...user,
//       [e.target.name]: e.target.value
//     });

//   }

//   // =========================
//   // Address Functions
//   // =========================

//   function addAddress() {

//     if (newAddress.trim() === "") return;

//     const address = {

//       id: Date.now(),

//       name: "New Address",

//       address: newAddress,

//       default: false

//     };

//     setAddresses([...addresses, address]);

//     setNewAddress("");

//   }

//   function deleteAddress(id) {

//     setAddresses(

//       addresses.filter(

//         (address) => address.id !== id

//       )

//     );

//   }

//   function setDefault(id) {

//     setAddresses(

//       addresses.map((address) => ({

//         ...address,

//         default: address.id === id

//       }))

//     );

//   }

//   // =========================
//   // Change Password
//   // =========================

//   function changePassword() {

//     if (
//       currentPassword === "" ||
//       newPassword === "" ||
//       confirmPassword === ""
//     ) {

//       alert("Please fill all password fields.");

//       return;

//     }

//     if (newPassword.length < 8) {

//       alert("Password must be at least 8 characters.");

//       return;

//     }

//     if (newPassword !== confirmPassword) {

//       alert("Passwords do not match.");

//       return;

//     }


//     alert("Password updated successfully.");

//     setCurrentPassword("");

//     setNewPassword("");

//     setConfirmPassword("");

//   }

//   function savePreferences(){

//     alert("Preferences Saved Successfully.");

// }

//   return (

//     <>

//       <Navbar />

//       <div className="settings-page">

//         <h1>Settings</h1>

//         {/* Personal Information */}

//         <div className="settings-card">

//           <h2>Personal Information</h2>

//           {editing ? (

//             <>

//               <label>Full Name</label>

//               <input
//                 type="text"
//                 name="name"
//                 value={user.name}
//                 onChange={handleChange}
//               />

//               <label>Email</label>

//               <input
//                 type="email"
//                 name="email"
//                 value={user.email}
//                 onChange={handleChange}
//               />

//               <label>Phone Number</label>

//               <input
//                 type="text"
//                 name="phone"
//                 value={user.phone}
//                 onChange={handleChange}
//               />

//               <button
//                 className="save-btn"
//                 onClick={() => setEditing(false)}
//               >
//                 Save Changes
//               </button>

//             </>

//           ) : (

//             <>

//               <p>

//                 <strong>Name:</strong> {user.name}

//               </p>

//               <p>

//                 <strong>Email:</strong> {user.email}

//               </p>

//               <p>

//                 <strong>Phone:</strong> {user.phone}

//               </p>

//               <button
//                 className="edit-btn"
//                 onClick={() => setEditing(true)}
//               >
//                 Edit Information
//               </button>

//             </>

//           )}

//         </div>

//         {/* Security */}

//         <div className="settings-card">

//           <h2>Security</h2>

//           <label>Current Password</label>

//           <div className="password-box">

//             <input
//               type={showCurrent ? "text" : "password"}
//               value={currentPassword}
//               onChange={(e) =>
//                 setCurrentPassword(e.target.value)
//               }
//             />

//             <span
//               className="eye-icon"
//               onClick={() =>
//                 setShowCurrent(!showCurrent)
//               }
//             >

//               {showCurrent ? <FaEyeSlash /> : <FaEye />}

//             </span>

//           </div>

//           <label>New Password</label>

//           <div className="password-box">

//             <input
//               type={showNew ? "text" : "password"}
//               value={newPassword}
//               onChange={(e) =>
//                 setNewPassword(e.target.value)
//               }
//             />

//             <span
//               className="eye-icon"
//               onClick={() =>
//                 setShowNew(!showNew)
//               }
//             >

//               {showNew ? <FaEyeSlash /> : <FaEye />}

//             </span>

//           </div>

//           <label>Confirm Password</label>

//           <div className="password-box">

//             <input
//               type={showConfirm ? "text" : "password"}
//               value={confirmPassword}
//               onChange={(e) =>
//                 setConfirmPassword(e.target.value)
//               }
//             />

//             <span
//               className="eye-icon"
//               onClick={() =>
//                 setShowConfirm(!showConfirm)
//               }
//             >

//               {showConfirm ? <FaEyeSlash /> : <FaEye />}

//             </span>

//           </div>

//           <button
//             className="save-btn"
//             onClick={changePassword}
//           >
//             Update Password
//           </button>

//         </div>

//         {/* Saved Addresses */}

//         <div className="settings-card">

//           <h2>Saved Addresses</h2>

//           <input
//             type="text"
//             placeholder="Enter New Address"
//             value={newAddress}
//             onChange={(e) =>
//               setNewAddress(e.target.value)
//             }
//           />

//           <button
//             className="save-btn"
//             onClick={addAddress}
//           >
//             Add Address
//           </button>

//           {addresses.map((address) => (

//             <div
//               key={address.id}
//               className="address-box"
//             >

//               <h3>{address.name}</h3>

//               <p>{address.address}</p>

//               {address.default && (

//                 <span className="default-tag">

//                   Default

//                 </span>

//               )}

//               <div className="address-buttons">

//                 {!address.default && (

//                   <button
//                     className="default-btn"
//                     onClick={() =>
//                       setDefault(address.id)
//                     }
//                   >
//                     Make Default
//                   </button>

//                 )}

//                 <button
//                   className="delete-btn"
//                   onClick={() =>
//                     deleteAddress(address.id)
//                   }
//                 >
//                   Delete
//                 </button>

//               </div>

//             </div>

//           ))}

//         </div>

//         {/* Privacy */}
// <div className="settings-card">

// <h2>Preferences</h2>

// <h3>Language</h3>

// <label>

// <input
// type="radio"
// checked={language==="en"}
// onChange={()=>setLanguage("en")}
// />

// English

// </label>

// <label>

// <input
// type="radio"
// checked={language==="hi"}
// onChange={()=>setLanguage("hi")}
// />

// हिन्दी

// </label>

// <hr/>

// <h3>

// Senior Citizen Mode

// </h3>

// <label className="switch">

// <input
// type="checkbox"
// checked={seniorMode}
// onChange={()=>
// setSeniorMode(!seniorMode)
// }
// />

// Enable Senior Mode

// </label>

// <hr/>

// <h3>

// Notifications

// </h3>

// <label>

// <input
// type="checkbox"
// checked={orderNotification}
// onChange={()=>
// setOrderNotification(!orderNotification)
// }
// />

// Order Updates

// </label>

// <label>

// <input
// type="checkbox"
// checked={stockNotification}
// onChange={()=>
// setStockNotification(!stockNotification)
// }
// />

// Low Stock Alerts

// </label>

// <label>

// <input
// type="checkbox"
// checked={offerNotification}
// onChange={()=>
// setOfferNotification(!offerNotification)
// }
// />

// Offers & Discounts

// </label>

// <button
// className="save-btn"
// onClick={savePreferences}
// >

// Save Preferences

// </button>

// </div>

//       </div>

//     </>

//   );

// }

// export default Settings;

import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext";
import { SeniorModeContext } from "../context/SeniorModeContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";

import {
  getMyProfile,
  updateMyProfile,
  changePasswordApi,
} from "../api/authApi";

import "../styles/settings.css";


interface User {
  name: string;
  email: string;
  phone: string;
}




function Settings() {


  const { language, setLanguage } =
    useContext(LanguageContext);


  const { seniorMode, setSeniorMode } =
    useContext(SeniorModeContext);

  const { showToast } = useToast();



  const [editing, setEditing] =
    useState<boolean>(false);



  const [user, setUser] =
    useState<User>({

      name: "",

      email: "",

      phone: ""

    });


  const [profileLoading, setProfileLoading] =
    useState<boolean>(true);


  useEffect(() => {

    const fetchProfile = async () => {

      try {

        const response = await getMyProfile();

        setUser(response.data.user);

      } catch (err) {

        console.error("Failed to load profile:", err);

      } finally {

        setProfileLoading(false);

      }

    };

    fetchProfile();

  }, []);


  const [currentPassword, setCurrentPassword] =
    useState<string>("");


  const [newPassword, setNewPassword] =
    useState<string>("");


  const [confirmPassword, setConfirmPassword] =
    useState<string>("");



  const [showCurrent, setShowCurrent] =
    useState<boolean>(false);


  const [showNew, setShowNew] =
    useState<boolean>(false);


  const [showConfirm, setShowConfirm] =
    useState<boolean>(false);








  const [orderNotification, setOrderNotification] =
    useState<boolean>(true);


  const [stockNotification, setStockNotification] =
    useState<boolean>(true);


  const [offerNotification, setOfferNotification] =
    useState<boolean>(true);


  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {

    setUser({
      ...user,
      [e.target.name]: e.target.value
    });

  }


  async function handleSaveProfile(){

    try {

      const response = await updateMyProfile({
        name: user.name,
        phone: user.phone,
      });

      setUser(response.data.user);

      setEditing(false);

    } catch (err) {

      console.error("Failed to update profile:", err);

      showToast("Could not save your changes. Please try again.", "error");

    }

  }


  async function changePassword(){


    if(
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ){

      showToast(
        "Please fill all password fields.",
        "error"
      );

      return;

    }




    if(newPassword.length < 8){

      showToast(
        "Password must be at least 8 characters.",
        "error"
      );

      return;

    }




    if(newPassword !== confirmPassword){

      showToast(
        "Passwords do not match.",
        "error"
      );

      return;

    }


    try {

      await changePasswordApi({
        currentPassword,
        newPassword,
      });

      showToast(
        "Password updated successfully.",
        "success"
      );

      setCurrentPassword("");

      setNewPassword("");

      setConfirmPassword("");

    } catch (err: any) {

      showToast(
        err.response?.data?.message ||
        "Could not update password. Please check your current password.",
        "error"
      );

    }

  }






  function savePreferences(){

    showToast(
      "Preferences Saved Successfully.",
      "success"
    );

  }






return (

<>

<Navbar />


<div className="settings-page">


<h1>
Settings
</h1>



<div className="settings-card">


<h2>
Personal Information
</h2>



{
editing ? (

<>


<label>
Full Name
</label>


<input

type="text"

name="name"

value={user.name}

onChange={handleChange}

/>



<label>
Email
</label>


<input

type="email"

name="email"

value={user.email}

disabled

title="Email cannot be changed"

/>



<label>
Phone Number
</label>


<input

type="text"

name="phone"

value={user.phone}

onChange={handleChange}

/>



<button

className="save-btn"

onClick={handleSaveProfile}

>

Save Changes

</button>


</>


) : (

<>


<p>
<strong>Name:</strong> {user.name}
</p>


<p>
<strong>Email:</strong> {user.email}
</p>


<p>
<strong>Phone:</strong> {user.phone}
</p>



<button

className="edit-btn"

onClick={()=>
setEditing(true)
}

>

Edit Information

</button>


</>

)

}


</div>





<div className="settings-card">


<h2>
Security
</h2>


{/* Password section remains same logic */}


<label>
Current Password
</label>


<div className="password-box">


<input

type={
showCurrent ? "text" : "password"
}

value={currentPassword}

onChange={(e)=>
setCurrentPassword(e.target.value)
}

/>


<span

className="eye-icon"

onClick={()=>
setShowCurrent(!showCurrent)
}

>

{
showCurrent
?
<FaEyeSlash/>
:
<FaEye/>
}

</span>


</div>





<label>
New Password
</label>


<div className="password-box">


<input

type={
showNew ? "text" : "password"
}

value={newPassword}

onChange={(e)=>
setNewPassword(e.target.value)
}

/>


<span

className="eye-icon"

onClick={()=>
setShowNew(!showNew)
}

>

{
showNew
?
<FaEyeSlash/>
:
<FaEye/>
}

</span>


</div>





<label>
Confirm Password
</label>


<div className="password-box">


<input

type={
showConfirm ? "text" : "password"
}

value={confirmPassword}

onChange={(e)=>
setConfirmPassword(e.target.value)
}

/>


<span

className="eye-icon"

onClick={()=>
setShowConfirm(!showConfirm)
}

>

{
showConfirm
?
<FaEyeSlash/>
:
<FaEye/>
}

</span>


</div>



<button

className="save-btn"

onClick={changePassword}

>

Update Password

</button>


</div>






<div className="settings-card">

<h2>
Saved Addresses
</h2>

<p className="settings-address-note">
  Manage your saved delivery addresses on the dedicated Addresses page.
</p>

<Link to="/addresses" className="save-btn settings-address-link">
  Manage Addresses
</Link>

</div>








<div className="settings-card">


<h2>
Preferences
</h2>


<h3>
Language
</h3>



<label>

<input

type="radio"

checked={language==="en"}

onChange={()=>
setLanguage("en")
}

/>

English

</label>




<label>

<input

type="radio"

checked={language==="hi"}

onChange={()=>
setLanguage("hi")
}

/>

हिन्दी

</label>





<hr/>


<h3>
Senior Citizen Mode
</h3>


<label className="switch">


<input

type="checkbox"

checked={seniorMode}

onChange={()=>
setSeniorMode(!seniorMode)
}

/>


Enable Senior Mode


</label>




<hr/>


<h3>
Notifications
</h3>




<label>

<input

type="checkbox"

checked={orderNotification}

onChange={()=>
setOrderNotification(!orderNotification)
}

/>


Order Updates

</label>



<label>

<input

type="checkbox"

checked={stockNotification}

onChange={()=>
setStockNotification(!stockNotification)
}

/>


Low Stock Alerts

</label>




<label>

<input

type="checkbox"

checked={offerNotification}

onChange={()=>
setOfferNotification(!offerNotification)
}

/>


Offers & Discounts

</label>




<button

className="save-btn"

onClick={savePreferences}

>

Save Preferences

</button>


</div>



</div>


</>

);


}


export default Settings;