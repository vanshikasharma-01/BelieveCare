const bwipjs = require("bwip-js");
const generateBarcode = require("../utils/barcodeGenerator");
const Inventory = require("../models/Inventory");

exports.generateBarcode = async (req, res) => {
    try {

        const barcode = generateBarcode();

        const png = await bwipjs.toBuffer({
            bcid: "code128",
            text: barcode,
            scale: 3,
            height: 12,
            includetext: true,
            textxalign: "center"
        });

        res.json({
            success: true,
            barcode,
            image: png.toString("base64")
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

exports.saveBarcode = async (req, res) => {
    try {
        const {
            barcode,
            medicineId
        } = req.body;

        const medicine = await Inventory.findById(medicineId);

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        medicine.barcode = barcode;

        await medicine.save();

        res.status(200).json({
            success: true,
            message: "Barcode saved successfully",
            medicine
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
