import { useState, useContext, useMemo } from "react";

import Navbar from "../components/Navbar";

import { CartContext } from "../context/CartContext";
import { SeniorModeContext } from "../context/SeniorModeContext";
import { LanguageContext } from "../context/LanguageContext";
import { getMedicinesByTrip } from "../api/medicineApi";
import { useToast } from "../context/ToastContext";
import { calculateFirstAidKitRecommendation, getQuantityForDosageForm } from "../utils/firstAidKitRules";

import "../styles/firstAidKit.css";

interface KitMedicine {
  _id: string;
  name: string;
  brand: string;
  category: string;
  dosageForm?: string;
  price: number;
  stock: number;
  image?: string;
  uses?: string[];
  usesHi?: string[];
}

const content = {
  en: {
    heading: "🩹 Customizable First Aid Kit",
    tripLabel: "Where are you going?",
    select: "Select",
    mountains: "Mountains",
    beach: "Beach",
    camping: "Camping",
    roadTrip: "Road Trip",
    peopleLabel: "Number of People",
    peoplePlaceholder: "Enter number",
    daysLabel: "Trip Duration (Days)",
    daysPlaceholder: "Enter days",
    loadingBtn: "Loading...",
    suggestBtn: "Suggest First Aid Kit",
    answerAll: "Please answer all the questions.",
    loadFailed: "Could not load kit suggestions. Please try again.",
    suggestedFor: "Suggested Items for your",
    trip: "trip",
    person: "person",
    people: "people",
    day: "day",
    days: "days",
    noItems:
      "No items are currently stocked for this destination. " +
      "Ask the pharmacy owner to add some, or run the seed script.",
    brand: "Brand",
    usesLabel: "Used for",
    addKitToCart: "Add Suggested Kit to Cart",
    addedToCart: (count: number, people: number) =>
      `Added ${count} item type(s) to your cart for ${people} ${
        people === 1 ? "person" : "people"
      }.`,
    recommendationHeading: "📋 Recommended Kit Quantities",
    recommendationSubtitle:
      "Calculated instantly from the number of travellers and trip length — updates as you type.",
    recommendationPrompt: "Enter the number of people and days above to see recommended quantities.",
    itemCol: "Item",
    quantityCol: "Recommended Quantity",
    multiplierNote: (multiplier: number) =>
      multiplier === 1
        ? "No trip-length multiplier applied."
        : `Includes a ×${multiplier} trip-length multiplier for medicines.`,
  },
  hi: {
    heading: "🩹 कस्टमाइज़ेबल प्राथमिक चिकित्सा किट",
    tripLabel: "आप कहाँ जा रहे हैं?",
    select: "चुनें",
    mountains: "पहाड़",
    beach: "समुद्र तट",
    camping: "कैंपिंग",
    roadTrip: "रोड ट्रिप",
    peopleLabel: "लोगों की संख्या",
    peoplePlaceholder: "संख्या दर्ज करें",
    daysLabel: "यात्रा की अवधि (दिन)",
    daysPlaceholder: "दिन दर्ज करें",
    loadingBtn: "लोड हो रहा है...",
    suggestBtn: "प्राथमिक चिकित्सा किट सुझाएं",
    answerAll: "कृपया सभी प्रश्नों के उत्तर दें।",
    loadFailed: "किट सुझाव लोड नहीं हो सके। कृपया पुनः प्रयास करें।",
    suggestedFor: "आपकी यात्रा के लिए सुझाई गई वस्तुएं",
    trip: "",
    person: "व्यक्ति",
    people: "लोग",
    day: "दिन",
    days: "दिन",
    noItems:
      "इस गंतव्य के लिए फ़िलहाल कोई वस्तु स्टॉक में नहीं है। फार्मेसी " +
      "मालिक से कुछ जोड़ने के लिए कहें, या सीड स्क्रिप्ट चलाएं।",
    brand: "ब्रांड",
    usesLabel: "किसके लिए उपयोगी",
    addKitToCart: "सुझाई गई किट कार्ट में जोड़ें",
    addedToCart: (count: number, people: number) =>
      `${people} ${people === 1 ? "व्यक्ति" : "लोगों"} के लिए ${count} वस्तु प्रकार आपकी कार्ट में जोड़ी गई।`,
    recommendationHeading: "📋 अनुशंसित किट मात्रा",
    recommendationSubtitle:
      "यात्रियों की संख्या और यात्रा की अवधि के आधार पर तुरंत गणना की जाती है — टाइप करते ही अपडेट होता है।",
    recommendationPrompt: "अनुशंसित मात्रा देखने के लिए ऊपर लोगों की संख्या और दिन दर्ज करें।",
    itemCol: "वस्तु",
    quantityCol: "अनुशंसित मात्रा",
    multiplierNote: (multiplier: number) =>
      multiplier === 1
        ? "कोई यात्रा-अवधि गुणक लागू नहीं किया गया।"
        : `दवाओं के लिए ×${multiplier} यात्रा-अवधि गुणक शामिल है।`,
  },
};

function FirstAidKit() {

  const { addMultipleToCart } = useContext(CartContext);
  const { seniorMode } = useContext(SeniorModeContext);
  const { language } = useContext(LanguageContext);
  const text = content[language as keyof typeof content];
  const { showToast } = useToast();

  const [answers, setAnswers] = useState({
    trip: "",
    people: "",
    days: "",
  });

  const [suggestedItems, setSuggestedItems] = useState<KitMedicine[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  // Pure, deterministic, hardcoded rule-based engine — no AI/ML/API.
  // Recalculates on every render where people/days changed, so the
  // panel updates live as the person types, with no button needed.
  const kitRecommendation = useMemo(
    () =>
      calculateFirstAidKitRecommendation(
        Number(answers.people) || 0,
        Number(answers.days) || 0
      ),
    [answers.people, answers.days]
  );

  // The default quantity for a suggested item — driven by the same
  // dosage-form formula + travel-days multiplier as the recommendation
  // panel above, instead of a flat "1 per person". The +/- stepper
  // still lets the customer override this per item.
  const getRecommendedQuantity = (item: KitMedicine) =>
    getQuantityForDosageForm(
      item.dosageForm || "",
      Number(answers.people) || 0,
      Number(answers.days) || 0
    );

  const getItemQuantity = (item: KitMedicine) =>
    itemQuantities[item._id] ?? getRecommendedQuantity(item);

  const incrementItemQuantity = (item: KitMedicine) => {
    setItemQuantities((current) => ({
      ...current,
      [item._id]: getItemQuantity(item) + 1,
    }));
  };

  const decrementItemQuantity = (item: KitMedicine) => {
    setItemQuantities((current) => ({
      ...current,
      [item._id]: Math.max(1, getItemQuantity(item) - 1),
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setAnswers({
      ...answers,
      [e.target.name]: e.target.value,
    });
  };

  const handleSuggest = async () => {
    if (
      answers.trip === "" ||
      answers.people === "" ||
      answers.days === ""
    ) {
      showToast(text.answerAll, "error");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Personalize the kit to the destination — only real, purchasable
      // medicines tagged for this trip type.
      const matches = await getMedicinesByTrip(answers.trip);

      setSuggestedItems(matches);
      setItemQuantities({});
      setShowSuggestions(true);
    } catch (err) {
      console.error("Failed to load first aid kit:", err);
      setError(text.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItemToCart = (item: KitMedicine) => {
    const quantity = getItemQuantity(item);

    const { addedCount } = addMultipleToCart([
      { product: item as any, quantity },
    ]);

    if (addedCount > 0) {
      showToast(`Added ${addedCount} × "${item.name}" to cart`, "success");
    }
  };

  const handleAddKitToCart = () => {
    const people = Number(answers.people) || 1;

    // Use each item's own recommended quantity — driven by its dosage
    // form and the travel-days multiplier (via getItemQuantity, which
    // falls back to getRecommendedQuantity) — instead of a flat
    // "people" count for every item. Also respects any manual +/-
    // adjustments the customer made to a specific item beforehand.
    const requests = suggestedItems.map(item => ({
      product: item as any,
      quantity: getItemQuantity(item),
    }));

    const { addedCount } = addMultipleToCart(requests);

    if (addedCount > 0) {
      showToast(text.addedToCart(suggestedItems.length, people), "success");
    }
  };

  return (

    <div className={seniorMode ? "senior" : ""}>

      <Navbar />

      <div className="first-aid-container">

        <h1>{text.heading}</h1>

        <div className="question-box">

          <label>{text.tripLabel}</label>

          <select
            name="trip"
            value={answers.trip}
            onChange={handleChange}
          >
            <option value="">{text.select}</option>
            <option value="Mountains">{text.mountains}</option>
            <option value="Beach">{text.beach}</option>
            <option value="Camping">{text.camping}</option>
            <option value="Road Trip">{text.roadTrip}</option>
          </select>

          <label>{text.peopleLabel}</label>

          <input
            type="number"
            name="people"
            min={1}
            value={answers.people}
            onChange={handleChange}
            placeholder={text.peoplePlaceholder}
          />

          <label>{text.daysLabel}</label>

          <input
            type="number"
            name="days"
            min={1}
            value={answers.days}
            onChange={handleChange}
            placeholder={text.daysPlaceholder}
          />

          <button
            className="suggest-btn"
            onClick={handleSuggest}
            disabled={loading}
          >
            {loading ? text.loadingBtn : text.suggestBtn}
          </button>

        </div>

        <div className="kit-recommendation-panel">

          <h2>{text.recommendationHeading}</h2>
          <p className="kit-recommendation-subtitle">{text.recommendationSubtitle}</p>

          {kitRecommendation.people === 0 ? (

            <p className="kit-recommendation-prompt">{text.recommendationPrompt}</p>

          ) : (

            <>
              <table className="kit-recommendation-table">
                <thead>
                  <tr>
                    <th>{text.itemCol}</th>
                    <th>{text.quantityCol}</th>
                  </tr>
                </thead>

                <tbody>
                  {kitRecommendation.items.map((item) => (
                    <tr key={item.key}>
                      <td>{item.label}</td>
                      <td>{item.finalQuantity} {item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="kit-recommendation-multiplier-note">
                {text.multiplierNote(kitRecommendation.travelDaysMultiplier)}
              </p>
            </>

          )}

        </div>

        {error && <p className="first-aid-error">{error}</p>}

        {showSuggestions && (

          <div className="suggestions">

            <h2>
              {text.suggestedFor} {answers.trip} {text.trip}
              {" "}({answers.people} {Number(answers.people) === 1 ? text.person : text.people}, {answers.days} {Number(answers.days) === 1 ? text.day : text.days})
            </h2>

            {suggestedItems.length === 0 ? (

              <p>{text.noItems}</p>

            ) : (

              suggestedItems.map((item) => (

                <div
                  className="suggest-item"
                  key={item._id}
                >

                  <img
                    src={item.image || "https://via.placeholder.com/120"}
                    alt={item.name}
                  />

                  <div>

                    <h3>{item.name}</h3>

                    <p>{text.brand}: {item.brand}</p>

                    {(() => {
                      const uses =
                        language === "hi" && item.usesHi && item.usesHi.length > 0
                          ? item.usesHi
                          : item.uses;

                      return (
                        uses &&
                        uses.length > 0 && (
                          <p className="suggest-item-uses">
                            <strong>{text.usesLabel}:</strong> {uses.join(", ")}
                          </p>
                        )
                      );
                    })()}

                    <p>₹ {item.price}</p>

                    <div className="suggest-item-qty">

                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => decrementItemQuantity(item)}
                      >
                        −
                      </button>

                      <span>{getItemQuantity(item)}</span>

                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => incrementItemQuantity(item)}
                      >
                        +
                      </button>

                    </div>

                    <button
                      type="button"
                      className="suggest-item-add-btn"
                      onClick={() => handleAddItemToCart(item)}
                      disabled={item.stock === 0}
                    >
                      🛒 Add to Cart
                    </button>

                  </div>

                </div>

              ))

            )}

            {suggestedItems.length > 0 && (
              <button
                className="kit-btn"
                onClick={handleAddKitToCart}
              >
                {text.addKitToCart}
              </button>
            )}

          </div>

        )}

      </div>

    </div>

  );

}

export default FirstAidKit;