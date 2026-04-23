const Supplier = require('../models/Supplier');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private/Admin/Manager
const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find({});
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a supplier
// @route   POST /api/suppliers
// @access  Private/Admin/Manager
const createSupplier = async (req, res) => {
    const { name, email, phone, address } = req.body;

    try {
        const supplier = new Supplier({
            name,
            email,
            phone,
            address
        });
        const createdSupplier = await supplier.save();
        res.status(201).json(createdSupplier);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private/Admin/Manager
const updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (supplier) {
            supplier.name = req.body.name || supplier.name;
            supplier.email = req.body.email || supplier.email;
            supplier.phone = req.body.phone || supplier.phone;
            supplier.address = req.body.address || supplier.address;

            const updatedSupplier = await supplier.save();
            res.json(updatedSupplier);
        } else {
            res.status(404).json({ message: 'Supplier not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private/Admin
const deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (supplier) {
            await supplier.deleteOne();
            res.json({ message: 'Supplier removed' });
        } else {
            res.status(404).json({ message: 'Supplier not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { getSuppliers, createSupplier, updateSupplier, deleteSupplier };
