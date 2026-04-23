const bwipjs = require('bwip-js');

const generateBarcode = async (text) => {
    return new Promise((resolve, reject) => {
        bwipjs.toBuffer({
            bcid: 'code128',       // Barcode type
            text: text,            // Text to encode
            scale: 3,              // 3x scaling factor
            height: 10,            // Bar height, in millimeters
            includetext: true,     // Show human-readable text
            textxalign: 'center',  // Always good to set this
        }, (err, png) => {
            if (err) {
                reject(err);
            } else {
                // Return base64 string
                resolve(`data:image/png;base64,${png.toString('base64')}`);
            }
        });
    });
};

module.exports = { generateBarcode };
