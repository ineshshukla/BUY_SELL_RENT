const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User.js');
const Item = require('./models/Item.js'); // Import Item model
const cookieParser = require('cookie-parser');
const Order = require('./models/Order.js'); // Add this line
const session = require('express-session');
const CASAuthentication = require('cas-authentication');
const axios = require('axios');
require('dotenv').config();

const app = express();
const bcryptSalt = bcrypt.genSaltSync(8);
const jwtSecret = 'aiduiosahoc';

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));

mongoose.connect(process.env.MONGO_URL);

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const cas = new CASAuthentication({
    cas_url: 'https://login.iiit.ac.in/cas',
    service_url: 'http://localhost:4000',
    cas_version: '3.0'
});

const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: 'Access denied' });
    }

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

app.get('/test', (req, res) => {
    res.json('test ok');
});

app.post('/register', async (req, res) => {
    const { firstName, lastName, email, age, contactNumber, password } = req.body;

    try {
        if (!email.endsWith('@iiit.ac.in')) {
            return res.status(400).json({ error: 'Only IIIT emails are allowed.' });
        }

        const userDoc = await User.create({
            firstName,
            lastName,
            email,
            age,
            contactNumber,
            password: bcrypt.hashSync(password, bcryptSalt),
            cartItems: [],
            sellerReviews: []
        });

        res.status(201).json(userDoc);
    } catch (e) {
        res.status(422).json({ error: 'Registration failed. Email might already be in use.' });
    }
});

// Add this function to verify reCAPTCHA token
async function verifyRecaptcha(token) {
    try {
        const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
            params: {
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: token
            }
        });
        return response.data.success;
    } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        return false;
    }
}

// Modify the login route to include reCAPTCHA verification
app.post('/login', async (req, res) => {
    try {
        const { email, password, captchaToken } = req.body;

        // Verify reCAPTCHA
        const isVerified = await verifyRecaptcha(captchaToken);
        if (!isVerified) {
            return res.status(403).json({ error: 'reCAPTCHA verification failed' });
        }

        const userDoc = await User.findOne({ email });

        if (userDoc) {
            const passOK = bcrypt.compareSync(password, userDoc.password);
            if (passOK) {
                jwt.sign(
                    {
                        id: userDoc._id,
                        email: userDoc.email,
                    },
                    jwtSecret,
                    { expiresIn: '24h' },
                    (err, token) => {
                        if (err) throw err;
                        res.cookie('token', token, {
                            secure: true,
                            sameSite: 'none',
                            httpOnly: true,
                            maxAge: 24 * 60 * 60 * 1000
                        }).json(userDoc);
                    }
                );
            } else {
                res.status(422).json('password incorrect');
            }
        } else {
            res.status(400).json('not found');
        }
    } catch (err) {
        res.status(400).json('request error');
    }
});

app.get('/cas-login', cas.bounce, async (req, res) => {
    const email = req.session[cas.session_name];
    res.redirect(`http://localhost:5173/login?email=${email}`);
});

app.post('/cas-login-check', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            jwt.sign(
                { id: user._id, email: user.email },
                jwtSecret,
                { expiresIn: '24h' },
                (err, token) => {
                    if (err) throw err;
                    res.cookie('token', token, {
                        secure: true,
                        sameSite: 'none',
                        httpOnly: true,
                        maxAge: 24 * 60 * 60 * 1000
                    }).json({ exists: true, user });
                }
            );
        } else {
            res.json({ exists: false });
        }
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/cas-register', async (req, res) => {
    const { email, firstName, lastName, age, contactNumber, isCASUser } = req.body;
    console.log('Request received:', req.body);

    try {
        const userDoc = await User.create({
            firstName,
            lastName,
            email,
            age,
            contactNumber,
            isCASUser,
            cartItems: [],
            sellerReviews: []
        });

        jwt.sign(
            { id: userDoc._id, email: userDoc.email },
            jwtSecret,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.cookie('token', token, {
                    secure: true,
                    sameSite: 'none',
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000
                }).json(userDoc);
            }
        );
    } catch (e) {
        console.log(e);
        res.status(422).json({ error: 'Registration failed' });
    }
});

app.get('/logout', cas.logout);

app.post('/api/check-uniqueness', async (req, res) => {
    try {
        const { email, contactNumber, userId } = req.body;

        const query = {
            $or: [
                { email: email },
                { contactNumber: contactNumber }
            ]
        };

        if (userId) {
            query._id = { $ne: userId };
        }

        const existingUser = await User.findOne(query);

        res.json({
            emailExists: existingUser?.email === email,
            contactNumberExists: existingUser?.contactNumber === contactNumber
        });
    } catch (error) {
        console.error("Error checking uniqueness:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, age, contactNumber, password } = req.body;

    try {
        let updateFields = { firstName, lastName, email, age, contactNumber };

        if (password) {
            updateFields.password = bcrypt.hashSync(password, 8);
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateFields, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

app.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (dbError) {
        console.error("Database error:", dbError);
        res.status(500).json(null);
    }
});

app.post('/logout', (req, res) => {
    res.cookie('token', '', {
        secure: true,
        sameSite: 'none',
        httpOnly: true,
        expires: new Date(0)
    }).json({ message: 'Logged out successfully' });
});

app.get('/api/items', authenticateToken, async (req, res) => {
    const { seller } = req.query;
    try {
        const items = await Item.find({ seller });
        res.json(items);
    } catch (err) {
        console.error('Failed to fetch items:', err);
        res.status(500).json({ message: 'Failed to fetch items' });
    }
});

app.post('/api/items', authenticateToken, async (req, res) => {
    const { name, price, description, category, seller } = req.body;
    try {
        const newItem = new Item({ name, price, description, category, seller });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        console.error('Failed to add item:', err);
        res.status(500).json({ message: 'Failed to add item' });
    }
});

app.get('/api/items/search', authenticateToken, async (req, res) => {
    const { userId } = req.query;
    try {
        const user = await User.findById(userId);
        const items = await Item.find({
            seller: { $ne: userId },
            _id: { $nin: user.cartItems },
            status: 'available'
        });
        res.json(items);
    } catch (err) {
        console.error('Failed to fetch items:', err);
        res.status(500).json({ message: 'Failed to fetch items' });
    }
});

app.get('/api/cart/items', authenticateToken, async (req, res) => {
    const { userId } = req.query;
    try {
        const user = await User.findById(userId);
        const cartItems = await Item.find({
            _id: { $in: user.cartItems },
            status: 'available'
        });
        res.json(cartItems);
    } catch (err) {
        console.error('Failed to fetch cart items:', err);
        res.status(500).json({ message: 'Failed to fetch cart items' });
    }
});

app.post('/api/cart/add', authenticateToken, async (req, res) => {
    const { userId, itemId } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user.cartItems.includes(itemId)) {
            user.cartItems.push(itemId);
            await user.save();
            res.status(200).json({ message: 'Item added to cart successfully' });
        } else {
            res.status(400).json({ message: 'Item already in cart' });
        }
    } catch (err) {
        console.error('Failed to add item to cart:', err);
        res.status(500).json({ message: 'Failed to add item to cart' });
    }
});

app.post('/api/cart/remove', authenticateToken, async (req, res) => {
    const { userId, itemId } = req.body;
    try {
        const user = await User.findById(userId);
        user.cartItems = user.cartItems.filter(id => id.toString() !== itemId);
        await user.save();
        res.status(200).json({ message: 'Item removed from cart successfully' });
    } catch (err) {
        console.error('Failed to remove item from cart:', err);
        res.status(500).json({ message: 'Failed to remove item from cart' });
    }
});

app.get('/api/items/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ message: 'Invalid item ID' });
        }
        const item = await Item.findById(itemId).populate('seller', 'name');
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    } catch (err) {
        console.error('Error fetching item:', err);
        res.status(500).json({ message: 'Failed to fetch item' });
    }
});

app.post('/api/orders/create', authenticateToken, async (req, res) => {
    const { userId, items } = req.body;
    try {
        const itemIds = items.map(item => item._id);
        const availableItems = await Item.find({
            _id: { $in: itemIds },
            status: 'available'
        });

        if (availableItems.length !== items.length) {
            return res.status(400).json({ message: 'Some items are no longer available' });
        }

        await Item.updateMany(
            { _id: { $in: itemIds } },
            { status: 'sold' }
        );

        const itemsWithSellers = await Promise.all(items.map(async (item) => {
            const fullItem = await Item.findById(item._id)
                .populate('seller', 'firstName lastName email');
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            return {
                item: item._id,
                seller: fullItem.seller._id,
                status: 'pending',
                otp: otp
            };
        }));

        const order = new Order({
            buyer: userId,
            items: itemsWithSellers,
            total: items.reduce((sum, item) => sum + item.price, 0)
        });

        await order.save();
        await User.findByIdAndUpdate(userId, { $set: { cartItems: [] } });

        const populatedOrder = await Order.findById(order._id)
            .populate('buyer')
            .populate({
                path: 'items.item',
                select: 'name price description category'
            })
            .populate({
                path: 'items.seller',
                select: 'firstName lastName email'
            })
            .lean();

        res.json(populatedOrder);
    } catch (err) {
        console.error('Failed to create order:', err);
        res.status(500).json({ message: 'Failed to create order' });
    }
});

app.get('/api/orders/pending', authenticateToken, async (req, res) => {
    const { userId } = req.query;
    try {
        const orders = await Order.find({
            buyer: userId,
            'items.status': 'pending'
        })
            .populate('buyer', 'firstName lastName email')
            .populate({
                path: 'items.item',
                model: 'Item',
                select: 'name price description category'
            })
            .populate({
                path: 'items.seller',
                model: 'User',
                select: 'firstName lastName email'
            })
            .lean();

        console.log('Pending orders for buyer:', orders);
        res.json(orders);
    } catch (err) {
        console.error('Error fetching pending orders:', err);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
});

app.get('/api/orders/bought', authenticateToken, async (req, res) => {
    const { userId } = req.query;
    try {
        const orders = await Order.find({
            buyer: userId,
            'items.status': 'completed'
        })
            .populate('buyer')
            .populate({
                path: 'items.item',
                model: 'Item',
                select: 'name price description category'
            })
            .populate({
                path: 'items.seller',
                model: 'User',
                select: 'firstName lastName email'
            })
            .lean();

        const processedOrders = orders.map(order => ({
            ...order,
            items: order.items.filter(item => item.status === 'completed')
        })).filter(order => order.items.length > 0);

        res.json(processedOrders);
    } catch (err) {
        console.error('Error fetching bought orders:', err);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
});

app.get('/api/orders/sold', authenticateToken, async (req, res) => {
    const { userId } = req.query;
    try {
        const orders = await Order.find({
            'items.seller': userId
        })
            .populate('buyer', 'email firstName lastName')
            .populate({
                path: 'items.item',
                model: 'Item',
                select: 'name price description category'
            })
            .lean();

        const filteredOrders = orders.map(order => ({
            ...order,
            items: order.items.filter(item => item.seller.toString() === userId)
        }));

        console.log('Sold orders:', JSON.stringify(filteredOrders, null, 2));
        res.json(filteredOrders);
    } catch (err) {
        console.error('Error fetching sold orders:', err);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
});

app.post('/api/orders/verify', authenticateToken, async (req, res) => {
    const { orderId, itemId, sellerId, otp } = req.body;
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const itemToUpdate = order.items.find(
            item => item.item.toString() === itemId &&
                item.seller.toString() === sellerId &&
                item.status === 'pending'
        );

        if (!itemToUpdate) {
            return res.status(404).json({ message: 'Item not found in order or already completed' });
        }

        if (itemToUpdate.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        itemToUpdate.status = 'completed';
        await order.save();

        const allItemsCompleted = order.items.every(item => item.status === 'completed');
        if (allItemsCompleted) {
            await Item.findByIdAndUpdate(itemId, { status: 'sold' });
        }

        res.json({
            message: 'Delivery verified successfully',
            orderStatus: allItemsCompleted ? 'completed' : 'pending'
        });
    } catch (err) {
        console.error('Error verifying delivery:', err);
        res.status(500).json({ message: 'Failed to verify delivery' });
    }
});

app.get('/api/orders/pending-deliveries', authenticateToken, async (req, res) => {
    const { sellerId } = req.query;
    try {
        const orders = await Order.find({
            'items': {
                $elemMatch: {
                    seller: sellerId,
                    status: 'pending'
                }
            }
        })
            .populate('buyer', 'email firstName lastName')
            .populate({
                path: 'items.item',
                model: 'Item',
                select: 'name price description category'
            })
            .lean();

        const filteredOrders = orders.map(order => ({
            ...order,
            items: order.items.filter(
                item => item.seller.toString() === sellerId &&
                item.status === 'pending'
            )
        })).filter(order => order.items.length > 0);

        if (filteredOrders.length === 0) {
            return res.status(200).json([]);
        }

        console.log('Pending deliveries for seller:', filteredOrders);
        res.json(filteredOrders);
    } catch (err) {
        console.error('Failed to fetch pending deliveries:', err);
        res.status(500).json({ message: 'Failed to fetch deliveries' });
    }
});

app.listen(4000);