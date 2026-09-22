import { useEffect, useState } from "react";
import AdminNavbar from "../components/owner/AdminNavbar";
import Sidebar from "../components/owner/Sidebar";

import {
  getOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from "../api/orderApi";
import { useToast } from "../context/ToastContext";
import Pagination from "../components/Pagination";

import "../styles/ownerOrders.css";
import "../styles/pagination.css";

interface OrderItem {

  medicine:any;

  quantity:number;

  price:number;

}

interface Order{

  _id:string;

  customer:any;

  medicines:OrderItem[];

  totalAmount:number;

  paymentMethod:string;

  paymentStatus:string;

  orderStatus:string;

  createdAt:string;

}

function OwnerOrders(){

const [orders,setOrders]=
useState<Order[]>([]);

const [search,setSearch]=
useState("");

const [statusFilter,setStatusFilter]=
useState("All");

const [selectedOrder,setSelectedOrder]=
useState<Order | null>(null);

const [showPopup,setShowPopup]=
useState(false);

const [currentPage,setCurrentPage]=
useState(1);

const ORDERS_PAGE_SIZE = 10;

const { showToast } = useToast();


useEffect(()=>{

fetchOrders();

},[]);



const fetchOrders=async()=>{

try{

const data=
await getOrders();

// Most recent first — the API returns them in insertion order
// (oldest first), which buried new orders at the bottom of the list.
const sorted=[...data].sort(
  (a,b)=>
    new Date(b.createdAt).getTime()-
    new Date(a.createdAt).getTime()
);

setOrders(sorted);

}
catch(error){

console.log(error);

}

};



const filteredOrders=

orders.filter(order=>{

const matchesSearch=

order._id
.toLowerCase()
.includes(search.toLowerCase())

||

order.customer?.name
?.toLowerCase()
.includes(search.toLowerCase());



const matchesStatus=

statusFilter==="All"

||

order.orderStatus===statusFilter;



return matchesSearch &&
matchesStatus;

});

const totalOrderPages=
Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PAGE_SIZE));

const paginatedOrders=

filteredOrders.slice(

(currentPage-1)*ORDERS_PAGE_SIZE,

currentPage*ORDERS_PAGE_SIZE

);

// Any change to search/status filter should return to page 1 —
// otherwise the owner can land on a now-empty later page.
useEffect(()=>{

setCurrentPage(1);

},[search,statusFilter]);



// Revenue Collected only counts orders that have actually been
// paid — matches how the (now removed) Billing dashboard defined it.
const totalRevenue=

orders
.filter(order=>order.paymentStatus==="Paid")
.reduce(

(sum,order)=>

sum+order.totalAmount,

0

);

const pendingPaymentsCount=
orders.filter(
order=>order.paymentStatus!=="Paid"
).length;

const pendingAmount=

orders
.filter(order=>order.paymentStatus!=="Paid")
.reduce(

(sum,order)=>

sum+order.totalAmount,

0

);



const changeStatus=
async(
id:string,
status:string
)=>{

await updateOrderStatus(
id,
status
);

fetchOrders();

};

const togglePaymentStatus=
async(order:Order)=>{

const newStatus=
order.paymentStatus==="Paid" ? "Pending" : "Paid";

try{

await updatePaymentStatus(order._id,newStatus);

fetchOrders();

}
catch(error){

console.log(error);

showToast("Could not update payment status.","error");

}

};



return(

<>

<AdminNavbar title="Orders" />

<div className="owner-dashboard">
<Sidebar />

<div className="owner-orders-page owner-main">

<h1>

Orders Management

</h1>



<div className="orders-summary">

<div className="summary-card">

<h3>

Total Orders

</h3>

<h1>

{orders.length}

</h1>

</div>



<div className="summary-card revenue">

<h3>

Revenue Collected

</h3>

<h1>

₹{totalRevenue}

</h1>

</div>

<div className="summary-card warning">

<h3>

Pending Payments

</h3>

<h1>

{pendingPaymentsCount}

</h1>

</div>

<div className="summary-card danger">

<h3>

Amount Pending

</h3>

<h1>

₹{pendingAmount}

</h1>

</div>

</div>



<div className="orders-controls">

<input

placeholder="Search"

value={search}

onChange={(e)=>

setSearch(
e.target.value
)

}

/>



<select

className="status-dropdown"

value={statusFilter}

onChange={(e)=>

setStatusFilter(
e.target.value
)

}

>

<option>

All

</option>

<option>

Placed

</option>

<option>

Processing

</option>

<option>

Delivered

</option>

<option>

Cancelled

</option>

</select>

</div>



{

showPopup &&

selectedOrder &&(

<div className="order-details-card">

<div className="order-details-card-header">

<h2>

Order #{selectedOrder._id.slice(-6)}

</h2>

<button

className="order-details-close-btn"

onClick={()=>{

setShowPopup(false);

}}

>

Close ✕

</button>

</div>

<div className="order-details-card-body">

<div className="order-details-meta">

<div className="order-details-meta-item">

<span className="order-details-label">Customer</span>

<span className="order-details-value">{selectedOrder.customer?.name}</span>

</div>

<div className="order-details-meta-item">

<span className="order-details-label">Order Status</span>

<span className={"order-details-status-pill status-" + selectedOrder.orderStatus.toLowerCase().replace(/\s+/g,"-")}>

{selectedOrder.orderStatus}

</span>

</div>

<div className="order-details-meta-item">

<span className="order-details-label">Payment Method</span>

<span className="order-details-value">{selectedOrder.paymentMethod}</span>

</div>

<div className="order-details-meta-item">

<span className="order-details-label">Payment Status</span>

<span
className={
"payment-badge " +
(selectedOrder.paymentStatus==="Paid" ? "paid" : "pending")
}
>

{selectedOrder.paymentStatus}

</span>

</div>

<div className="order-details-meta-item">

<span className="order-details-label">Placed On</span>

<span className="order-details-value">
{new Date(selectedOrder.createdAt).toLocaleDateString()}
</span>

</div>

</div>

<div className="order-details-items">

{

selectedOrder.medicines.map(

(item,index)=>(

<div className="order-details-item-row" key={index}>

<span className="order-details-item-name">

{item.medicine?.name}

</span>

<span className="order-details-item-qty">

Qty: {item.quantity}

</span>

<span className="order-details-item-price">

₹{item.price}

</span>

</div>

)

)

}

</div>

<div className="order-details-total">

<span>Total</span>

<span>₹{selectedOrder.totalAmount}</span>

</div>

</div>

</div>

)

}



<table className="orders-table">

<thead>

<tr>

<th>

Order ID

</th>

<th>

Customer

</th>

<th>

Date

</th>

<th>

Items

</th>

<th>

Total

</th>

<th>

Payment Status

</th>

<th>

Status

</th>

<th>

Actions

</th>

<th>

Payment Action

</th>

</tr>

</thead>



<tbody>

{

paginatedOrders.map(order=>(

<tr key={order._id}>

<td>

{order._id.slice(-6)}

</td>

<td>

{order.customer?.name}

</td>

<td>

{

new Date(

order.createdAt

).toLocaleDateString()

}

</td>

<td>

{

order.medicines.length

}

</td>

<td>

₹{order.totalAmount}

</td>

<td>

<span
className={
"payment-badge " +
(order.paymentStatus==="Paid" ? "paid" : "pending")
}
>

{order.paymentStatus}

</span>

</td>

<td>

{order.orderStatus}

</td>

<td>

<button
className="view-btn"
onClick={()=>{

setSelectedOrder(order);

setShowPopup(true);

}}

>

View

</button>



<select

className="status-dropdown"

value={order.orderStatus}

onChange={(e)=>

changeStatus(

order._id,

e.target.value

)

}

>

<option value="Placed">Placed</option>

<option value="Packed">Packed</option>

<option value="Shipped">Shipped</option>

<option value="Out For Delivery">Out For Delivery</option>

<option value="Delivered">Delivered</option>

</select>

</td>

<td>

<button
className="toggle-payment-btn"
onClick={()=>togglePaymentStatus(order)}
>

Mark as{" "}
{order.paymentStatus==="Paid" ? "Pending" : "Paid"}

</button>

</td>

</tr>

))

}

</tbody>

</table>

<Pagination
  currentPage={currentPage}
  totalPages={totalOrderPages}
  onPageChange={setCurrentPage}
/>

</div>

</div>

</>

);

}

export default OwnerOrders;