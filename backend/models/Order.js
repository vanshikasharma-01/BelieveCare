const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
{
    customer:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    medicines:[
        {
            medicine:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Inventory",
                required:true
            },

            name:{
                type:String,
                required:true
            },

            quantity:{
                type:Number,
                required:true
            },

            price:{
                type:Number,
                required:true
            }
        }
    ],


    totalAmount:{
        type:Number,
        required:true
    },


    address:{
        type:String,
        required:true
    },


    paymentMethod:{
        type:String,
        default:"Cash"
    },


    paymentStatus:{
        type:String,
        default:"Pending"
    },


    orderStatus:{
        type:String,
        enum:[
            "Placed",
            "Packed",
            "Shipped",
            "Out For Delivery",
            "Delivered",
            "Cancelled"
        ],
        default:"Placed"
    },

    // Tracks when each stage was reached so the customer-facing
    // delivery tracker can show a real timeline instead of just the
    // current status.
    statusHistory:[
        {
            status:{
                type:String,
                required:true
            },
            changedAt:{
                type:Date,
                default:Date.now
            }
        }
    ],

    estimatedDelivery:{
        type:Date
    }

},
{
    timestamps:true
});


module.exports =
mongoose.model("Order",orderSchema);