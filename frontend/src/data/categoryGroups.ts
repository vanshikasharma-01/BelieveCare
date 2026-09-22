// Maps each top-level nav group to its subcategories. A medicine's
// `category` field is expected to store one of the subcategory values
// (e.g. "Tablets", "Men", "Skin") — this file is purely a frontend
// lookup so the navbar/mega-menu and filters can group them without
// needing any backend schema changes.

export interface CategoryGroup {
  label: string;
  subcategories: string[];
}

const categoryGroups: CategoryGroup[] = [
  {
    label: "Medicines",
    subcategories: [
      "Tablet",
      "Capsule",
      "Injection",
      "Tubes",
      "Spray",
      "Drops",
    ],
  },
  {
    label: "Wellness",
    subcategories: ["Men", "Women", "Senior Citizen", "Children"],
  },
  {
    label: "Medical Tools",
    subcategories: [],
  },
  {
    label: "Cosmetics",
    subcategories: ["Skin", "Hair", "Feet", "Hands", "Teeth"],
  },
  {
    label: "First Aid",
    subcategories: ["First Aid Supply"],
  },
];

export default categoryGroups;
