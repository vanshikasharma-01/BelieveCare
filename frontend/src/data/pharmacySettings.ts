// const pharmacySettings = {

//   pharmacyName: "Believecare Pharmacy",

//   ownerName: "Admin",

//   email: "believecare@gmail.com",

//   phone: "9876543210",

//   address: "Sector 5, Rohini, Delhi",

//   gst: "07ABCDE1234F1Z5",

//   openingTime: "09:00",

//   closingTime: "22:00",

//   language: "English",

//   notifications: true

// };

// export default pharmacySettings;

export interface PharmacySettings {
  pharmacyName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  gst: string;
  openingTime: string;
  closingTime: string;
  language: string;
  notifications: boolean;
}

const pharmacySettings: PharmacySettings = {
  pharmacyName: "Believecare Pharmacy",
  ownerName: "Admin",
  email: "believecare@gmail.com",
  phone: "9876543210",
  address: "Sector 5, Rohini, Delhi",
  gst: "07ABCDE1234F1Z5",
  openingTime: "09:00",
  closingTime: "22:00",
  language: "English",
  notifications: true
};

export default pharmacySettings;