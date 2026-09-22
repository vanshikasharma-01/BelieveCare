// import "../styles/seniorMode.css";

// function SeniorModeToggle({ seniorMode = false, setSeniorMode }) {

//   return (

//     <div className="senior-toggle">

//       <label>Senior Mode</label>

//       <input
//         type="checkbox"
//         checked={seniorMode}
//         onChange={() => {
//           if (setSeniorMode) {
//             setSeniorMode(!seniorMode);
//           }
//         }}
//       />

//     </div>

//   );

// }

// export default SeniorModeToggle;


// // import "../styles/seniorMode.css";

// // function SeniorModeToggle({ seniorMode, setSeniorMode }) {

// //   return (

// //     <div className="senior-toggle">

// //       <label>

// //         Senior Mode

// //       </label>

// //       <input

// //         type="checkbox"

// //         checked={seniorMode}

// //         onChange={() => setSeniorMode(!seniorMode)}

// //       />

// //     </div>

// //   );

// // }

// // export default SeniorModeToggle;

import React from "react";
import "../styles/seniorMode.css";

interface SeniorModeToggleProps {
  seniorMode?: boolean;
  setSeniorMode?: React.Dispatch<React.SetStateAction<boolean>>;
  label?: string;
}

function SeniorModeToggle({
  seniorMode = false,
  setSeniorMode,
  label = "Senior Mode",
}: SeniorModeToggleProps) {

  return (

    <div className="senior-toggle">

      <label>

        {label}

      </label>

      <input
        type="checkbox"
        checked={seniorMode}
        onChange={() => {
          if (setSeniorMode) {
            setSeniorMode(!seniorMode);
          }
        }}
      />

    </div>

  );

}

export default SeniorModeToggle;