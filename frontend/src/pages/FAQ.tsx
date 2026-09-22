import { useContext, useState } from "react";
import Navbar from "../components/Navbar";
import { LanguageContext } from "../context/LanguageContext";
import "../styles/infoPage.css";

const content = {
  en: {
    title: "Frequently Asked Questions",
    faqs: [
      {
        question: "How do I place an order?",
        answer:
          "Browse or search for a medicine, add it to your cart, and proceed to checkout. Select a saved delivery address and confirm your order — we currently support Cash on Delivery.",
      },
      {
        question: "Do I need a prescription to order medicines?",
        answer:
          "Some medicines require a valid prescription. You'll be notified on the product page if a prescription is needed for a specific item.",
      },
      {
        question: "How long does delivery take?",
        answer:
          "Most orders are delivered within 2-4 days depending on your location. You can track your order's status from the Order History page.",
      },
      {
        question: "Can I cancel my order?",
        answer:
          "You can request a cancellation before your order is marked as shipped by contacting our support team.",
      },
      {
        question: "What if I receive a damaged or wrong item?",
        answer:
          "Please contact us within 48 hours of delivery with photos of the item, and we'll arrange a replacement or refund.",
      },
      {
        question: "How do I create a custom First Aid Kit?",
        answer:
          "Visit the First Aid Kit page, tell us your destination, group size, and trip duration, and we'll suggest a kit of relevant items you can add to your cart in one click.",
      },
    ],
  },
  hi: {
    title: "अक्सर पूछे जाने वाले प्रश्न",
    faqs: [
      {
        question: "मैं ऑर्डर कैसे करूँ?",
        answer:
          "किसी दवा को खोजें या ब्राउज़ करें, उसे अपनी कार्ट में जोड़ें, और चेकआउट पर आगे बढ़ें। एक सहेजा गया डिलीवरी पता चुनें और अपने ऑर्डर की पुष्टि करें — फ़िलहाल हम केवल कैश ऑन डिलीवरी सुविधा देते हैं।",
      },
      {
        question: "क्या दवाइयाँ मंगवाने के लिए प्रिस्क्रिप्शन ज़रूरी है?",
        answer:
          "कुछ दवाइयों के लिए मान्य प्रिस्क्रिप्शन आवश्यक होता है। यदि किसी विशेष उत्पाद के लिए प्रिस्क्रिप्शन ज़रूरी है, तो आपको उत्पाद पेज पर सूचित किया जाएगा।",
      },
      {
        question: "डिलीवरी में कितना समय लगता है?",
        answer:
          "अधिकांश ऑर्डर आपके स्थान के आधार पर 2-4 दिनों के भीतर डिलीवर हो जाते हैं। आप ऑर्डर इतिहास पेज से अपने ऑर्डर की स्थिति ट्रैक कर सकते हैं।",
      },
      {
        question: "क्या मैं अपना ऑर्डर रद्द कर सकता/सकती हूँ?",
        answer:
          "आप अपने ऑर्डर के शिप होने से पहले हमारी सहायता टीम से संपर्क करके रद्द करने का अनुरोध कर सकते हैं।",
      },
      {
        question: "अगर मुझे क्षतिग्रस्त या गलत सामान मिले तो?",
        answer:
          "कृपया डिलीवरी के 48 घंटों के भीतर सामान की तस्वीरों के साथ हमसे संपर्क करें, और हम रिप्लेसमेंट या रिफंड की व्यवस्था करेंगे।",
      },
      {
        question: "मैं कस्टम प्राथमिक चिकित्सा किट कैसे बनाऊं?",
        answer:
          "प्राथमिक चिकित्सा किट पेज पर जाएं, हमें अपना गंतव्य, समूह का आकार, और यात्रा की अवधि बताएं, और हम आपको प्रासंगिक वस्तुओं की एक किट सुझाएंगे जिसे आप एक क्लिक में अपनी कार्ट में जोड़ सकते हैं।",
      },
    ],
  },
};

function FAQ() {

  const { language } = useContext(LanguageContext);
  const text = content[language as keyof typeof content];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <Navbar />

      <div className="info-page">

        <h1>{text.title}</h1>

        <div className="faq-list">

          {text.faqs.map((item, index) => (

            <div
              key={index}
              className={
                "faq-item" + (openIndex === index ? " open" : "")
              }
              onClick={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
            >

              <div className="faq-question">
                {item.question}
                <span>{openIndex === index ? "−" : "+"}</span>
              </div>

              {openIndex === index && (
                <p className="faq-answer">{item.answer}</p>
              )}

            </div>

          ))}

        </div>

      </div>
    </>
  );

}

export default FAQ;
