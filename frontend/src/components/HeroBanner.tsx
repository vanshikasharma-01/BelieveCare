// import { Link } from "react-router-dom";
// import { useContext } from "react";

// import { LanguageContext } from "../context/LanguageContext";
// import translations from "../data/translations";

// import "../styles/heroBanner.css";

// function HeroBanner() {

//   const { language } = useContext(LanguageContext);

//   const text = translations[language];

//   return (

//     <section className="hero">

//       <div className="hero-content">

//         <h1>

//           {text.firstAid}

//         </h1>

//         <Link to="/first-aid">

//           <button className="hero-btn">

//             {text.startKit}

//           </button>

//         </Link>

//       </div>

//     </section>

//   );

// }

// export default HeroBanner;

import { Link } from "react-router-dom";
import { useContext } from "react";

import { LanguageContext } from "../context/LanguageContext";
import translations from "../data/translations";

import "../styles/heroBanner.css";

function HeroBanner() {

  const { language } = useContext(LanguageContext);

  const text = translations[language];

  return (

    <section className="hero">

      <div className="hero-content">

        <h1>

          {text.firstAid}

        </h1>

        <Link to="/first-aid">

          <button className="hero-btn">

            {text.startKit}

          </button>

        </Link>

      </div>

    </section>

  );

}

export default HeroBanner;