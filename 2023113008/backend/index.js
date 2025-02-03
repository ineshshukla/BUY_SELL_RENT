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
    credentials:true,
    origin: 'http://localhost:5173',
}));

mongoose.connect(process.env.MONGO_URL);

app.get('/test', (req,res)=>{
    res.json('test ok');
});


app.post('/register', async (req,res)=> {
    const {name,email,password}= req.body;
    try{
        const userDoc = await User.create({
            name,
            email,
            password:bcrypt.hashSync(password,bcryptSalt), 
        })
        res.json(userDoc);
    }catch(e){
        res.status(422).json(e);
    }
    
    
})

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
                    res.cookie('token', token).status(200).json('pass ok');
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


app.listen(4000);