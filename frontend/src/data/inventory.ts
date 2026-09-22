// const inventory = [

// {
// id:1,
// image:"💊",
// name:"Paracetamol",
// brand:"Dolo",
// category:"Medicines",
// stock:120,
// price:30,
// expiry:"12-08-2027"
// },

// {
// id:2,
// image:"💊",
// name:"Crocin",
// brand:"GSK",
// category:"Medicines",
// stock:25,
// price:40,
// expiry:"05-09-2026"
// },

// {
// id:3,
// image:"💊",
// name:"Vitamin C",
// brand:"Limcee",
// category:"Wellness",
// stock:8,
// price:95,
// expiry:"18-10-2026"
// },

// {
// id:4,
// image:"🧴",
// name:"Face Wash",
// brand:"Himalaya",
// category:"Cosmetics",
// stock:0,
// price:180,
// expiry:"15-01-2027"
// },

// {
// id:5,
// image:"🩹",
// name:"Bandage",
// brand:"Johnson",
// category:"First Aid",
// stock:70,
// price:55,
// expiry:"20-12-2028"
// }

// ];

// export default inventory;

export interface Inventory {
  id: number;
  image: string;
  name: string;
  brand: string;
  category: string;
  stock: number;
  price: number;
  expiry: string;
}

const inventory: Inventory[] = [

  {
    id: 1,
    image: "💊",
    name: "Paracetamol",
    brand: "Dolo",
    category: "Medicines",
    stock: 120,
    price: 30,
    expiry: "12-08-2027"
  },

  {
    id: 2,
    image: "💊",
    name: "Crocin",
    brand: "GSK",
    category: "Medicines",
    stock: 25,
    price: 40,
    expiry: "05-09-2026"
  },

  {
    id: 3,
    image: "💊",
    name: "Vitamin C",
    brand: "Limcee",
    category: "Wellness",
    stock: 8,
    price: 95,
    expiry: "18-10-2026"
  },

  {
    id: 4,
    image: "🧴",
    name: "Face Wash",
    brand: "Himalaya",
    category: "Cosmetics",
    stock: 0,
    price: 180,
    expiry: "15-01-2027"
  },

  {
    id: 5,
    image: "🩹",
    name: "Bandage",
    brand: "Johnson",
    category: "First Aid",
    stock: 70,
    price: 55,
    expiry: "20-12-2028"
  }

];

export default inventory;