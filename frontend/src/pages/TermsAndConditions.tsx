import { useContext } from "react";
import Navbar from "../components/Navbar";
import { LanguageContext } from "../context/LanguageContext";
import "../styles/infoPage.css";

const content = {
  en: {
    title: "Terms & Conditions",
    intro: "Please read these terms carefully before using Believecare.",
    sections: [
      {
        heading: "1. Orders & Payment",
        body:
          "All orders are subject to availability. We currently support " +
          "Cash on Delivery — payment is collected at the time of delivery.",
      },
      {
        heading: "2. Prescription Medicines",
        body:
          "Certain medicines require a valid prescription. Believecare " +
          "reserves the right to cancel any order where a required " +
          "prescription cannot be verified.",
      },
      {
        heading: "3. Delivery",
        body:
          "Delivery timelines are estimates and may vary based on your " +
          "location and product availability.",
      },
      {
        heading: "4. Returns & Refunds",
        body:
          "Damaged, incorrect, or expired items may be reported within 48 " +
          "hours of delivery for a replacement or refund. For safety " +
          "reasons, opened medicine packaging cannot be returned unless " +
          "defective.",
      },
      {
        heading: "5. Account Responsibility",
        body:
          "You are responsible for maintaining the confidentiality of your " +
          "account credentials and for all activity under your account.",
      },
      {
        heading: "6. Changes to These Terms",
        body:
          "We may update these terms from time to time. Continued use of " +
          "Believecare after changes constitutes acceptance of the revised " +
          "terms.",
      },
    ],
  },
  hi: {
    title: "नियम एवं शर्तें",
    intro: "बिलीवकेयर का उपयोग करने से पहले कृपया इन शर्तों को ध्यान से पढ़ें।",
    sections: [
      {
        heading: "1. ऑर्डर और भुगतान",
        body:
          "सभी ऑर्डर उपलब्धता के अधीन हैं। फ़िलहाल हम केवल कैश ऑन डिलीवरी " +
          "सुविधा देते हैं — भुगतान डिलीवरी के समय लिया जाता है।",
      },
      {
        heading: "2. प्रिस्क्रिप्शन दवाइयाँ",
        body:
          "कुछ दवाइयों के लिए मान्य प्रिस्क्रिप्शन आवश्यक है। यदि आवश्यक " +
          "प्रिस्क्रिप्शन सत्यापित नहीं किया जा सकता है, तो बिलीवकेयर " +
          "किसी भी ऑर्डर को रद्द करने का अधिकार सुरक्षित रखता है।",
      },
      {
        heading: "3. डिलीवरी",
        body:
          "डिलीवरी की समय-सीमा अनुमानित है और आपके स्थान और उत्पाद की " +
          "उपलब्धता के आधार पर भिन्न हो सकती है।",
      },
      {
        heading: "4. रिटर्न और रिफंड",
        body:
          "क्षतिग्रस्त, गलत, या एक्सपायर्ड वस्तुओं की सूचना डिलीवरी के 48 " +
          "घंटों के भीतर रिप्लेसमेंट या रिफंड के लिए दी जा सकती है। सुरक्षा " +
          "कारणों से, खोली गई दवा की पैकेजिंग तब तक वापस नहीं की जा सकती " +
          "जब तक वह दोषपूर्ण न हो।",
      },
      {
        heading: "5. खाते की ज़िम्मेदारी",
        body:
          "आप अपने खाते की साख (credentials) को गोपनीय रखने और अपने खाते " +
          "के तहत होने वाली सभी गतिविधियों के लिए ज़िम्मेदार हैं।",
      },
      {
        heading: "6. इन शर्तों में बदलाव",
        body:
          "हम समय-समय पर इन शर्तों को अपडेट कर सकते हैं। बदलावों के बाद " +
          "बिलीवकेयर का निरंतर उपयोग संशोधित शर्तों की स्वीकृति माना जाएगा।",
      },
    ],
  },
};

function TermsAndConditions() {

  const { language } = useContext(LanguageContext);
  const text = content[language as keyof typeof content];

  return (
    <>
      <Navbar />

      <div className="info-page">

        <h1>{text.title}</h1>

        <p className="info-intro">{text.intro}</p>

        {text.sections.map((section, index) => (
          <div key={index}>
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
          </div>
        ))}

      </div>
    </>
  );

}

export default TermsAndConditions;
