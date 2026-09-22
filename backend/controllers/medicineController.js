const Inventory=require("../models/Inventory");

// Whitelist of fields an Owner is allowed to set on a medicine.
// Using an explicit whitelist (instead of passing req.body straight
// through) stops stray/unexpected fields — like _id, createdAt, or
// anything not defined on the schema — from being written.
const MEDICINE_FIELDS = [
  "catalogId",
  "barcode",
  "name",
  "genericName",
  "brand",
  "manufacturer",
  "category",
  "subcategory",
  "dosageForm",
  "strength",
  "salt",
  "saltComposition",
  "description",
  "descriptionHi",
  "uses",
  "usesHi",
  "dosage",
  "dosageHi",
  "sideEffects",
  "sideEffectsHi",
  "warnings",
  "warningsHi",
  "suitableFor",
  "prescriptionRequired",
  "price",
  "stock",
  "expiry",
  "image",
  "substitutes",
  "tripTags",
];

function pickMedicineFields(body) {
  const picked = {};
  for (const field of MEDICINE_FIELDS) {
    if (body[field] !== undefined) {
      picked[field] = body[field];
    }
  }
  return picked;
}

const addMedicine=async(req,res)=>{

try{

const medicine=new Inventory(pickMedicineFields(req.body));

await medicine.save();

res.status(201).json(medicine);

}
catch(error){
console.log(error)
res.status(500).json({
message:error.message
});

}

};


const getMedicines=async(req,res)=>{

try{

const medicines=await Inventory.find();

res.json(medicines);

}
catch(error){

res.status(500).json({
message:error.message
});

}

};


const getMedicineById=async(req,res)=>{

try{

const medicine=await Inventory.findById(req.params.id);

if(!medicine){

return res.status(404).json({
message:"Product not found"
});

}

res.json(medicine);

}
catch(error){

res.status(500).json({
message:error.message
});

}

};


const updateMedicine=async(req,res)=>{

try{

const medicine=await Inventory.findByIdAndUpdate(

req.params.id,

pickMedicineFields(req.body),

{
new:true,
runValidators:true
}

);

res.json(medicine);

}
catch(error){

res.status(500).json({
message:error.message
});

}

};


const deleteMedicine=async(req,res)=>{

try{

await Inventory.findByIdAndDelete(req.params.id);

res.json({
message:"Inventory Deleted Successfully"
});

}
catch(error){
console.log(error)
res.status(500).json({
message:error.message

});

}

};


// ===============================
// LOW STOCK ALERTS
// Stock buckets: Out of Stock (0), Critical (1-10), Low (11-50)
// ===============================
const getLowStockMedicines = async (req, res) => {

  try {

    const threshold = Number(req.query.threshold) || 50;

    const medicines = await Inventory.find({
      stock: { $lte: threshold }
    }).sort({ stock: 1 });

    const outOfStockCount = medicines.filter(
      (m) => m.stock === 0
    ).length;

    const criticalCount = medicines.filter(
      (m) => m.stock > 0 && m.stock <= 10
    ).length;

    const lowStockCount = medicines.filter(
      (m) => m.stock > 10 && m.stock <= threshold
    ).length;

    res.json({
      totalAlerts: medicines.length,
      outOfStockCount,
      criticalCount,
      lowStockCount,
      medicines
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


// ===============================
// EXPIRY ALERTS
// Status: Expired (<0 days), Expiring Soon (<=30 days), Safe (>30 days)
// ===============================
const getExpiringMedicines = async (req, res) => {

  try {

    const windowDays = Number(req.query.days) || 30;

    const medicines = await Inventory.find();

    const today = new Date();

    const withStatus = medicines
      .filter((medicine) => medicine.expiry)
      .map((medicine) => {

        const expiryDate = new Date(medicine.expiry);

        const daysLeft = Math.ceil(
          (expiryDate.getTime() - today.getTime()) /
          (1000 * 60 * 60 * 24)
        );

        let status = "Safe";

        if (daysLeft < 0) {
          status = "Expired";
        } else if (daysLeft <= windowDays) {
          status = "Expiring Soon";
        }

        return {
          ...medicine.toObject(),
          daysLeft,
          status
        };

      })
      .filter((medicine) => medicine.status !== "Safe")
      .sort((a, b) => a.daysLeft - b.daysLeft);

    const expiredCount = withStatus.filter(
      (m) => m.status === "Expired"
    ).length;

    const expiringSoonCount = withStatus.filter(
      (m) => m.status === "Expiring Soon"
    ).length;

    res.json({
      totalAlerts: withStatus.length,
      expiredCount,
      expiringSoonCount,
      medicines: withStatus
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


// ===============================
// OWNER DASHBOARD SUMMARY
// ===============================
const getInventorySummary = async (req, res) => {

  try {

    const medicines = await Inventory.find();

    const today = new Date();

    const totalMedicines = medicines.length;

    const outOfStockCount = medicines.filter(
      (m) => m.stock === 0
    ).length;

    const criticalStockCount = medicines.filter(
      (m) => m.stock > 0 && m.stock <= 10
    ).length;

    const lowStockCount = medicines.filter(
      (m) => m.stock > 10 && m.stock <= 50
    ).length;

    const expiringSoonCount = medicines.filter((m) => {

      if (!m.expiry) return false;

      const daysLeft = Math.ceil(
        (new Date(m.expiry).getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
      );

      return daysLeft >= 0 && daysLeft <= 30;

    }).length;

    const expiredCount = medicines.filter((m) => {

      if (!m.expiry) return false;

      return new Date(m.expiry).getTime() < today.getTime();

    }).length;

    const totalStockValue = medicines.reduce(
      (sum, m) => sum + (m.price * m.stock),
      0
    );

    res.json({
      totalMedicines,
      outOfStockCount,
      criticalStockCount,
      lowStockCount,
      expiringSoonCount,
      expiredCount,
      totalStockValue
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


// ===============================
// LOOKUP MEDICINE BY BARCODE
// Used by the "scan barcode first" add-medicine flow:
// if a medicine with this barcode already exists, the frontend
// auto-fills its static details (name/brand/category/salt) and only
// asks the owner for the dynamic per-batch fields (stock, expiry, price).
// ===============================
const getMedicineByBarcode = async (req, res) => {

  try {

    const medicine = await Inventory.findOne({
      barcode: req.params.barcode
    });

    if (!medicine) {

      return res.status(404).json({
        exists: false,
        message: "No medicine found for this barcode"
      });

    }

    res.json({
      exists: true,
      medicine
    });

  } catch (error) {

    // Happens if the scanned code can't be cast to the barcode field's type
    res.status(400).json({
      exists: false,
      message: "Invalid barcode format"
    });

  }

};


// ===============================
// GET MEDICINES BY TRIP TAG (First Aid Kit)
// ===============================
const getMedicinesByTripTag = async (req, res) => {

  try {

    const { tag } = req.params;

    const medicines = await Inventory.find({
      tripTags: tag
    });

    res.json(medicines);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


module.exports={

addMedicine,

getMedicines,

getMedicineById,

updateMedicine,

deleteMedicine,

getLowStockMedicines,

getExpiringMedicines,

getInventorySummary,

getMedicineByBarcode,

getMedicinesByTripTag

};