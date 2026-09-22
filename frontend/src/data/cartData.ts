// const cartData = [

//   {
//     id: 1,
//     name: "Dolo 650",
//     brand: "Micro Labs",
//     price: 35,
//     quantity: 2,
//     image: "https://via.placeholder.com/120"
//   },

//   {
//     id: 2,
//     name: "Vitamin C",
//     brand: "HealthVit",
//     price: 250,
//     quantity: 1,
//     image: "https://via.placeholder.com/120"
//   }

// ];

// export default cartData;

export interface CartData {
  id: number;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image: string;
}

const cartData: CartData[] = [

  {
    id: 1,
    name: "Dolo 650",
    brand: "Micro Labs",
    price: 35,
    quantity: 2,
    image: "https://via.placeholder.com/120"
  },

  {
    id: 2,
    name: "Vitamin C",
    brand: "HealthVit",
    price: 250,
    quantity: 1,
    image: "https://via.placeholder.com/120"
  }

];

export default cartData;