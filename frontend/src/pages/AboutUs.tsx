import { useContext } from "react";
import Navbar from "../components/Navbar";
import { LanguageContext } from "../context/LanguageContext";
import "../styles/infoPage.css";

const content = {
  en: {
    title: "About Believecare",
    intro: "We Believe In Care.",
    p1:
      "Believecare is a pharmacy management platform built to make " +
      "healthcare more accessible. For pharmacy owners, we simplify " +
      "inventory management — tracking stock, expiry dates, and " +
      "categories from a single dashboard. For customers, we make " +
      "finding and ordering medicines simple, whether that's browsing " +
      "our catalog, building a custom First Aid Kit for an upcoming " +
      "trip, or reordering something from your order history in one " +
      "click.",
    p2:
      "We started Believecare because we believe getting the medicine " +
      "you need shouldn't be complicated. Every feature we build is " +
      "guided by that idea — clear information, honest inventory, and " +
      "a smooth path from search to delivery.",
    offerTitle: "What We Offer",
    offers: [
      "A wide catalog of medicines, wellness products, medical tools, and cosmetics",
      "Fast Cash on Delivery ordering",
      "Personalized First Aid Kits for travel",
      "Transparent order tracking from placement to delivery",
    ],
  },
  hi: {
    title: "बिलीवकेयर के बारे में",
    intro: "हम देखभाल में विश्वास रखते हैं।",
    p1:
      "बिलीवकेयर एक फार्मेसी प्रबंधन प्लेटफ़ॉर्म है जो स्वास्थ्य सेवा " +
      "को अधिक सुलभ बनाने के लिए बनाया गया है। फार्मेसी मालिकों के लिए, " +
      "हम इन्वेंटरी प्रबंधन को आसान बनाते हैं — स्टॉक, एक्सपायरी तिथियों " +
      "और श्रेणियों को एक ही डैशबोर्ड से ट्रैक करना। ग्राहकों के लिए, हम " +
      "दवाइयाँ खोजना और ऑर्डर करना आसान बनाते हैं — चाहे वह हमारा कैटलॉग " +
      "देखना हो, यात्रा के लिए एक कस्टम प्राथमिक चिकित्सा किट बनाना हो, " +
      "या ऑर्डर इतिहास से एक क्लिक में फिर से ऑर्डर करना हो।",
    p2:
      "हमने बिलीवकेयर की शुरुआत इसलिए की क्योंकि हमारा मानना है कि " +
      "ज़रूरत की दवा पाना जटिल नहीं होना चाहिए। हम जो भी सुविधा बनाते " +
      "हैं, वह इसी विचार से प्रेरित है — स्पष्ट जानकारी, ईमानदार " +
      "इन्वेंटरी, और खोज से डिलीवरी तक का सहज मार्ग।",
    offerTitle: "हम क्या प्रदान करते हैं",
    offers: [
      "दवाइयों, वेलनेस उत्पादों, मेडिकल उपकरणों और कॉस्मेटिक्स का व्यापक कैटलॉग",
      "तेज़ कैश ऑन डिलीवरी ऑर्डरिंग",
      "यात्रा के लिए व्यक्तिगत प्राथमिक चिकित्सा किट",
      "ऑर्डर देने से डिलीवरी तक पारदर्शी ट्रैकिंग",
    ],
  },
};

function AboutUs() {

  const { language } = useContext(LanguageContext);
  const text = content[language as keyof typeof content];

  return (
    <>
      <Navbar />

      <div className="info-page">

        <h1>{text.title}</h1>

        <p className="info-intro">{text.intro}</p>

        <p>{text.p1}</p>

        <p>{text.p2}</p>

        <h2>{text.offerTitle}</h2>

        <ul className="info-list">
          {text.offers.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

      </div>
    </>
  );

}

export default AboutUs;
