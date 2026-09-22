const { v4: uuidv4 } = require("uuid");

const generateBarcode = () => {
    const id = uuidv4()
        .replace(/-/g, "")
        .substring(0, 8)
        .toUpperCase();

    return `${id}`;
};

module.exports = generateBarcode;