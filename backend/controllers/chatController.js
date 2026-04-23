const Chat = require('../models/Chat');
const Product = require('../models/Product');
const SalesOrder = require('../models/SalesOrder');
const Supplier = require('../models/Supplier');

const knowledgeBase = {
    'sku': 'Stock Keeping Unit (SKU) is a unique identifier for each distinct product and service that can be purchased.',
    'reorder point': 'The inventory level at which a new order should be placed to replenish stock before it runs out.',
    'lead time': 'The time between the initiation and completion of a production process or order.',
    'fifo': 'First-In, First-Out (FIFO) is an inventory management method where the oldest stock is sold first.',
    'lifo': 'Last-In, First-Out (LIFO) is an inventory management method where the newest stock is sold first.'
};

const processMessage = async (message) => {
    const msgLower = message.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    // 0. Conversational / Small Talk
    if (msgLower.match(/\b(hi|hello|hey|greetings|morning|evening|hi there|hello there)\b/)) {
        return "Hello! I am your AI Inventory Assistant. I'm here to help you manage your stock, track sales, and analyze suppliers. How can I assist you today?";
    }

    if (msgLower.match(/\b(how are you|how it going|how are things|everything ok)\b/)) {
        return "I'm functioning perfectly and ready to help you manage your inventory! What's on your mind?";
    }

    if (msgLower.match(/\b(thank you|thanks|thx|great|awesome|good job|perfect|solved|fixed)\b/)) {
        return "You're very welcome! I'm glad I could help. Is there anything else you'd like to check?";
    }

    if (msgLower.match(/\b(who are you|what is your name|what can you do|help me|what are you)\b/)) {
        return "I am the IMS Pro AI Assistant. I can answer questions about your stock levels, sales performance, revenue, and suppliers. Try asking 'which products are low?' or 'how many sales today?'.";
    }

    if (msgLower.match(/\b(i love you|you are smart|good bot)\b/)) {
        return "Thank you! I'm here to make your inventory management easier. ❤️";
    }

    // 1. Business Summary / Dashboard Stats
    if (msgLower.match(/\b(summary|stats|how is business|dashboard|overview)\b/)) {
        const totalProducts = await Product.countDocuments();
        const lowStock = await Product.countDocuments({ $expr: { $lte: ['$quantity', '$minStockLevel'] } });
        const recentSales = await SalesOrder.find({ status: 'completed' }).sort({ createdAt: -1 }).limit(5);
        const totalRevenue = recentSales.reduce((acc, s) => acc + s.totalAmount, 0);

        return `Here is a quick business overview:
- Total Product Types: ${totalProducts}
- Low Stock Alerts: ${lowStock}
- Revenue from last 5 sales: ₹${totalRevenue.toLocaleString()}
Check the Reports page for a more detailed analysis!`;
    }

    // 2. Knowledge Base Check
    for (const [term, definition] of Object.entries(knowledgeBase)) {
        if (msgLower.includes(term)) return definition;
    }

    // 3. Product Queries (Stock)
    if (msgLower.match(/\b(low in stock|low stock|restock|out of stock)\b/) || (msgLower.includes('low') && msgLower.includes('stock'))) {
        const products = await Product.find({
            $expr: { $lte: ['$quantity', '$minStockLevel'] }
        }).select('name quantity');

        if (products.length === 0) return "Excellent news! Your stock levels are healthy across all products.";
        return `Stock is low for: ${products.map(p => `${p.name} (only ${p.quantity} left)`).join(', ')}. You might want to create a purchase order!`;
    }

    if (msgLower.match(/\b(stock|many|quantity|items?|inventory|products?)\b/)) {
        const productMatch = await Product.find({}).select('name quantity');
        // Check if any product name is in the message
        let mentioned = null;
        for (const p of productMatch) {
            if (msgLower.includes(p.name.toLowerCase())) {
                mentioned = p;
                break;
            }
        }

        if (mentioned) {
            return `We currently have ${mentioned.quantity} units of ${mentioned.name} in stock.`;
        }

        if (msgLower.match(/\b(list|all|show|everything|catalog)\b/)) {
            if (productMatch.length === 0) return "Your product catalog is currently empty.";
            return `Here are some of your items: ${productMatch.slice(0, 10).map(p => `${p.name} (${p.quantity})`).join(', ')}${productMatch.length > 10 ? '... and many more.' : '.'}`;
        }
    }

    // 4. Sales/Orders Queries
    if (msgLower.match(/\b(sales?|selling|sold|revenue|income|orders?|transactions?)\b/)) {
        if (msgLower.match(/\b(top|best|popular|most)\b/)) {
            const topProduct = await Product.findOne().sort({ quantity: 1 });
            return `Based on current reports, ${topProduct ? topProduct.name : 'your catalog'} is a key performer. You can see full rankings on the Reports page!`;
        }

        if (msgLower.match(/\b(recent|last|latest|show|analyze)\b/)) {
            const lastSales = await SalesOrder.find({ status: 'completed' }).sort({ createdAt: -1 }).limit(3).populate('products.product');
            if (lastSales.length === 0) return "No completed sales recorded yet. Once you complete a sale, it will show up here!";

            const summary = lastSales.map(s => `₹${s.totalAmount.toLocaleString()} to ${s.customerName}`).join('; ');
            return `Here are the latest completed sales: ${summary}. You can manage all orders in the 'Sales Orders' section.`;
        }
        return "I can help you track sales. Try asking 'how much revenue did we make?' or 'show me recent orders'.";
    }

    // 5. Supplier Queries
    if (msgLower.match(/\b(suppliers?|supplies|who provides|source|analyze)\b/)) {
        const productMatch = await Product.find({}).populate('supplier');
        let mentioned = null;
        for (const p of productMatch) {
            if (msgLower.includes(p.name.toLowerCase())) {
                mentioned = p;
                break;
            }
        }

        if (mentioned && mentioned.supplier) {
            return `${mentioned.name} is provided by ${mentioned.supplier.name}. You can find more details in the 'Suppliers' tab.`;
        }

        if (msgLower.match(/\b(all|list|analyze|show)\b/)) {
            const suppliers = await Supplier.find({});
            if (suppliers.length === 0) return "You haven't added any suppliers to your database yet.";
            return `Your active suppliers include: ${suppliers.map(s => s.name).join(', ')}.`;
        }
        return "I can help find suppliers for specific products or list all of them. Try 'list all suppliers' or 'who supplies Coffee?'.";
    }

    // 6. Help / Fallback
    if (msgLower.includes('help') || msgLower.includes('can you do')) {
        return `I am your Inventory Assistant! Try asking me about:
- Stock levels: 'What is low in stock?' or 'How many Laptops?'
- Sales: 'Show me recent sales' or 'orders'
- Business Health: 'Give me a summary' or 'dashboard'
- Suppliers: 'Who supplies Coffee?' or 'analyze suppliers'`;
    }

    // 7. Fuzzy Search / Dynamic Discovery (The "Answer Every Question" Patch)
    // If no clear intent, try to find any product or supplier mentioned
    const allProducts = await Product.find({}).populate('supplier');
    const allSuppliers = await Supplier.find({});

    // Check for exact or partial product name match
    const foundProduct = allProducts.find(p =>
        msgLower.includes(p.name.toLowerCase()) ||
        p.name.toLowerCase().includes(msgLower) && msgLower.length > 3
    );

    if (foundProduct) {
        return `I found information on '${foundProduct.name}': 
- Current Stock: ${foundProduct.quantity} units
- Category: ${foundProduct.category}
- Price: ₹${foundProduct.price.toLocaleString()}
${(foundProduct.supplier ? `- Supplier: ${foundProduct.supplier.name} (${foundProduct.supplier.email})` : '- No supplier assigned.')}`;
    }

    // Check for supplier name match
    const foundSupplier = allSuppliers.find(s =>
        msgLower.includes(s.name.toLowerCase()) ||
        s.name.toLowerCase().includes(msgLower) && msgLower.length > 3
    );

    if (foundSupplier) {
        return `I found supplier details for '${foundSupplier.name}':
- Email: ${foundSupplier.email}
- Phone: ${foundSupplier.phone}
- Address: ${foundSupplier.address || 'Not specified'}
You can manage this supplier in the 'Suppliers' section.`;
    }

    // 8. Broad Category / Keyword matching for more flexibility
    if (msgLower.includes("how many") || msgLower.includes("count")) {
        if (msgLower.includes("product")) {
            const count = await Product.countDocuments();
            return `You have a total of ${count} different products in your inventory.`;
        }
        if (msgLower.includes("supplier")) {
            const count = await Supplier.countDocuments();
            return `You have ${count} registered suppliers.`;
        }
    }

    const fallbacks = [
        "I'm not exactly sure what you mean, but I can help you with stock levels, sales reports, or supplier info. Try asking 'what is low in stock?'",
        "I'm still learning! If you're asking about a product, try typing its name. Otherwise, you can ask for a 'summary' of the business.",
        "I couldn't find a direct answer to that. You might try checking the 'Reports' or 'Dashboard' pages for detailed stats!",
        "I'm best at answering questions about your products and sales. For example: 'Which supplier provides Coffee?' or 'Show me my products'."
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};

const sendMessage = async (req, res) => {
    const { message } = req.body;

    try {
        const userMsg = await Chat.create({
            user: req.user._id,
            message,
            isBotResponse: false
        });

        const botResponseText = await processMessage(message);

        const botMsg = await Chat.create({
            user: req.user._id,
            message: botResponseText,
            isBotResponse: true
        });

        res.json([userMsg, botMsg]);
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ message: "I'm having trouble processing that right now. Please try again in a moment." });
    }
};

const getChatHistory = async (req, res) => {
    try {
        const chats = await Chat.find({ user: req.user._id }).sort({ createdAt: 1 });
        res.json(chats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const clearChatHistory = async (req, res) => {
    try {
        await Chat.deleteMany({ user: req.user._id });
        res.json({ message: "Chat history cleared successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { sendMessage, getChatHistory, clearChatHistory };
