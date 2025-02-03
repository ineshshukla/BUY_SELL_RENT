const express= require('express');
const cors=require('cors');
const mongoose = require('mongoose')
const bcrypt= require('bcryptjs')
const jwt = require('jsonwebtoken');
const User= require('./models/User.js');
require('dotenv').config();


const app= express();
const bcryptSalt = bcrypt.genSaltSync(8);
const jwtSecret='aiduiosahoc';

app.use(express.json()); 
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], 
    credentials: true
}));

mongoose.connect(process.env.MONGO_URL);

app.get('/test', (req,res)=>{
    res.json('test ok');
});


app.post('/register', async (req, res) => {
    const { firstName, lastName, email, age, contactNumber, password } = req.body;
    
    try {
        // Ensure email is from IIIT domain
        if (!email.endsWith('@iiit.ac.in')) {
            return res.status(400).json({ error: 'Only IIIT emails are allowed.' });
        }

        // Create new user
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


app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Request received:', req.body);
        const userDoc = await User.findOne({ email });

        if (userDoc) {
            const passOK = bcrypt.compareSync(password, userDoc.password);
            if (passOK) {
                jwt.sign({ email: userDoc.email, id: userDoc._id }, jwtSecret, {}, (err, token) => {
                    if (err) throw err;
                    res.cookie('token', token).status(200).json(userDoc);
                });
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

// Update the check-uniqueness endpoint
app.post('/api/check-uniqueness', async (req, res) => {
    try {
        const { email, contactNumber, userId } = req.body;
        
        // Create query conditions
        const query = {
            $or: [
                { email: email },
                { contactNumber: contactNumber }
            ]
        };

        // Add userId check if provided
        if (userId) {
            query._id = { $ne: userId };
        }

        // Find any existing users with same email or contact
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

app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, age, contactNumber, password } = req.body;

    try {
        let updateFields = { firstName, lastName, email, age, contactNumber };

        // Hash password only if it's provided (not empty)
        if (password) {
            updateFields.password = bcrypt.hashSync(password, 8);
        }

        // Update user in the database
        const updatedUser = await User.findByIdAndUpdate(id, updateFields, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

app.listen(4000);