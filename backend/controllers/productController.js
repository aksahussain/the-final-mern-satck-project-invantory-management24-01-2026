const Product = require('../models/Product');
const { generateBarcode } = require('../utils/barcodeGenerator');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({}).populate('supplier', 'name');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('supplier', 'name');
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin/Manager
const createProduct = async (req, res) => {
    const { name, sku, category, price, supplier, minStockLevel } = req.body;

    try {
        // Generate barcode if not provided
        const barcode = await generateBarcode(sku);

        const product = new Product({
            name,
            sku,
            category,
            price,
            supplier,
            minStockLevel,
            barcode,
            quantity: 0 // Initial stock is 0, use Purchase Order to add stock
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Product with this SKU alre          ady exists' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin/Manager
const updateProduct = async (req, res) => {
    const { name, category, price, minStockLevel } = req.body;

    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name || product.name;
            product.category = category || product.category;
            product.price = price || product.price;
            product.minStockLevel = minStockLevel || product.minStockLevel;
            // Note: Quantity is not updated here, strictly through orders
            // Note: SKU not updated to maintain data integrity

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await product.deleteOne(); // Use deleteOne() for newer Mongoose
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
