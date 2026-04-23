require('dotenv').config();
const mongoose = require('mongoose');
const PurchaseOrder = require('./models/PurchaseOrder');
const SalesOrder = require('./models/SalesOrder');

const cleanData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const pResult = await PurchaseOrder.updateMany(
            { status: { $exists: false } },
            { $set: { status: 'completed' } }
        );
        console.log(`Updated ${pResult.modifiedCount} purchase orders.`);

        const sResult = await SalesOrder.updateMany(
            { status: { $exists: false } },
            { $set: { status: 'completed' } }
        );
        console.log(`Updated ${sResult.modifiedCount} sales orders.`);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

cleanData();
