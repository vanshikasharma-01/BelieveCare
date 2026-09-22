// const orders = [
//   {
//     id: 1001,
//     customer: "Rahul Sharma",
//     date: "10 July 2026",
//     status: "Pending",
//     total: 320,

//     items: [
//       {
//         id: 1,
//         name: "Dolo 650",
//         brand: "Micro Labs",
//         category: "Medicines",
//         price: 35,
//         stock: 40,
//         image: "https://via.placeholder.com/120",
//       },
//       {
//         id: 2,
//         name: "Vitamin C",
//         brand: "HealthVit",
//         category: "Wellness",
//         price: 250,
//         stock: 20,
//         image: "https://via.placeholder.com/120",
//       },
//     ],
//   },

//   {
//     id: 1002,
//     customer: "Priya Singh",
//     date: "18 June 2026",
//     status: "Delivered",
//     total: 240,

//     items: [
//       {
//         id: 3,
//         name: "Face Wash",
//         brand: "Himalaya",
//         category: "Cosmetics",
//         price: 120,
//         stock: 35,
//         image: "https://via.placeholder.com/120",
//       },
//       {
//         id: 4,
//         name: "Band Aid",
//         brand: "Johnson & Johnson",
//         category: "Medicines",
//         price: 120,
//         stock: 50,
//         image: "https://via.placeholder.com/120",
//       },
//     ],
//   },

//   {
//     id: 1003,
//     customer: "Amit Kumar",
//     date: "20 July 2026",
//     status: "Processing",
//     total: 780,

//     items: [
//       {
//         id: 5,
//         name: "Crocin 650",
//         brand: "GSK",
//         category: "Medicines",
//         price: 60,
//         stock: 18,
//         image: "https://via.placeholder.com/120",
//       }
//     ],
//   },

//   {
//     id: 1004,
//     customer: "Neha Gupta",
//     date: "22 July 2026",
//     status: "Cancelled",
//     total: 540,

//     items: [
//       {
//         id: 6,
//         name: "Cetirizine",
//         brand: "Cipla",
//         category: "Medicines",
//         price: 90,
//         stock: 30,
//         image: "https://via.placeholder.com/120",
//       }
//     ],
//   }
// ];

// export default orders;

export interface OrderItem {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  image: string;
}

export interface Order {
  id: number;
  customer: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
}

const orders: Order[] = [

  {
    id: 1001,
    customer: "Rahul Sharma",
    date: "10 July 2026",
    status: "Pending",
    total: 320,

    items: [

      {
        id: 1,
        name: "Dolo 650",
        brand: "Micro Labs",
        category: "Medicines",
        price: 35,
        stock: 40,
        image: "https://via.placeholder.com/120",
      },

      {
        id: 2,
        name: "Vitamin C",
        brand: "HealthVit",
        category: "Wellness",
        price: 250,
        stock: 20,
        image: "https://via.placeholder.com/120",
      },

    ],

  },

  {
    id: 1002,
    customer: "Priya Singh",
    date: "18 June 2026",
    status: "Delivered",
    total: 240,

    items: [

      {
        id: 3,
        name: "Face Wash",
        brand: "Himalaya",
        category: "Cosmetics",
        price: 120,
        stock: 35,
        image: "https://via.placeholder.com/120",
      },

      {
        id: 4,
        name: "Band Aid",
        brand: "Johnson & Johnson",
        category: "Medicines",
        price: 120,
        stock: 50,
        image: "https://via.placeholder.com/120",
      },

    ],

  },

  {
    id: 1003,
    customer: "Amit Kumar",
    date: "20 July 2026",
    status: "Processing",
    total: 780,

    items: [

      {
        id: 5,
        name: "Crocin 650",
        brand: "GSK",
        category: "Medicines",
        price: 60,
        stock: 18,
        image: "https://via.placeholder.com/120",
      }

    ],

  },

  {
    id: 1004,
    customer: "Neha Gupta",
    date: "22 July 2026",
    status: "Cancelled",
    total: 540,

    items: [

      {
        id: 6,
        name: "Cetirizine",
        brand: "Cipla",
        category: "Medicines",
        price: 90,
        stock: 30,
        image: "https://via.placeholder.com/120",
      }

    ],

  }

];

export default orders;