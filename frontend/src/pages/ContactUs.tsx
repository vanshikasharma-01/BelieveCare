import { useContext, useState } from "react";
import Navbar from "../components/Navbar";
import { LanguageContext } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import "../styles/infoPage.css";

const content = {
  en: {
    title: "Contact Us",
    intro:
      "Have a question or need help with an order? Reach out and our " +
      "support team will get back to you",
    storeAddress: "Store Address",
    addressValue: "Shop no.-16, Block 20, Part 2, Trilokpuri, Delhi, 110091",
    phoneLabel: "Phone",
    emailLabel: "Email",
    hoursLabel: "Store Hours",
    hoursWeekday: "Mon - Sat: 9:00 AM - 10:30 PM",
    hoursSunday: "Sunday: 10:00 AM - 6:00 PM",
    namePlaceholder: "Your Name",
    emailPlaceholder: "Your Email",
    messagePlaceholder: "How can we help?",
    sendButton: "Send Message",
    successMessage: "Thanks for reaching out! We'll get back to you soon.",
    fillAllFields: "Please fill all fields.",
  },
  hi: {
    title: "संपर्क करें",
    intro:
      "कोई सवाल है या ऑर्डर से जुड़ी मदद चाहिए? हमसे संपर्क करें, हमारी " +
      "सहायता टीम आपसे जल्द ही संपर्क करेगी।",
    storeAddress: "स्टोर का पता",
    addressValue: "123 वेलनेस स्ट्रीट, बिलीवकेयर प्लाज़ा, आपका शहर, 400001",
    phoneLabel: "फ़ोन",
    emailLabel: "ईमेल",
    hoursLabel: "स्टोर का समय",
    hoursWeekday: "सोम - शनि: सुबह 9:00 - रात 10:30",
    hoursSunday: "रविवार: सुबह 10:00 - शाम 6:00",
    namePlaceholder: "आपका नाम",
    emailPlaceholder: "आपका ईमेल",
    messagePlaceholder: "हम आपकी कैसे मदद कर सकते हैं?",
    sendButton: "संदेश भेजें",
    successMessage: "संपर्क करने के लिए धन्यवाद! हम जल्द ही आपसे संपर्क करेंगे।",
    fillAllFields: "कृपया सभी फ़ील्ड भरें।",
  },
};

function ContactUs() {

  const { language } = useContext(LanguageContext);
  const text = content[language as keyof typeof content];
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) {
      showToast(text.fillAllFields, "error");
      return;
    }

    // No backend endpoint exists yet for contact messages — this is a
    // frontend-only placeholder until one is built.
    setSubmitted(true);
  };

  return (
    <>
      <Navbar />

      <div className="info-page">

        <h1>{text.title}</h1>

        <p className="info-intro">{text.intro}</p>

        <div className="contact-layout">

          <div className="contact-details">

            <h3>{text.storeAddress}</h3>
            <p>{text.addressValue}</p>

            <h3>{text.phoneLabel}</h3>
            <p>+91 98765 43210</p>

            <h3>{text.emailLabel}</h3>
            <p>aggarwalmedicals@gmail.com</p>

            <h3>{text.hoursLabel}</h3>
            <p>{text.hoursWeekday}</p>
            <p>{text.hoursSunday}</p>

          </div>

          <div className="contact-form">

            {submitted ? (

              <p className="contact-success">
                {text.successMessage}
              </p>

            ) : (

              <>
                <input
                  type="text"
                  name="name"
                  placeholder={text.namePlaceholder}
                  value={form.name}
                  onChange={handleChange}
                />

                <input
                  type="email"
                  name="email"
                  placeholder={text.emailPlaceholder}
                  value={form.email}
                  onChange={handleChange}
                />

                <textarea
                  name="message"
                  placeholder={text.messagePlaceholder}
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                />

                <button onClick={handleSubmit}>{text.sendButton}</button>
              </>

            )}

          </div>

        </div>

      </div>
    </>
  );

}

export default ContactUs;