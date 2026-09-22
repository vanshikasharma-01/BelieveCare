// 

export interface Medicine {
  id: number;
  name: string;
  brand: string;
  category: string;
  salt: string;
  price: number;
  stock: number;
  expiry: string;
  image: string;
}

const medicines: Medicine[] = [

  {
    id: 1,
    name: "Dolo 650",
    brand: "Micro Labs",
    category: "Medicines",
    salt: "Paracetamol 650mg",
    price: 35,
    stock: 40,
    expiry: "2027-12-31",
    image: "https://via.placeholder.com/170?text=Dolo"
  },

  {
    id: 2,
    name: "Calpol 650",
    brand: "GSK",
    category: "Medicines",
    salt: "Paracetamol 650mg",
    price: 38,
    stock: 20,
    expiry: "2026-11-10",
    image: "https://via.placeholder.com/170?text=Calpol"
  },

  {
    id: 3,
    name: "Crocin 650",
    brand: "GSK",
    category: "Medicines",
    salt: "Paracetamol 650mg",
    price: 36,
    stock: 15,
    expiry: "2026-08-20",
    image: "https://via.placeholder.com/170?text=Crocin"
  }

];

export default medicines;