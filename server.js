const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
const mongoose = require('mongoose')
const Product = require ('./model/product')
var User = require('./model/User');
const jwt = require('jsonwebtoken')
const Joi = require ('@hapi/joi')
require('dotenv').config()
const {registerValidation,loginValidation} = require ('./validation')
const bcrypt = require('bcryptjs')
const auth = require ('./verifytoken');
const { response } = require('express');
const { findOneAndRemove } = require('./model/product');


const db = mongoose.connect(process.env.ACCESS_NAME, { useNewUrlParser: true ,useUnifiedTopology: true,useCreateIndex: true},()=>console.log("CONNECTED"));
mongoose.set('useFindAndModify', false);


app.use(cors())
app.use(express.static('build'))

    
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())





app.post('/product',(req,res)=>{
    console.log('posting product')
    let product = new Product();
    product.title = req.body.title;
    product.price = req.body.price;
    product.likes = req.body.likes;
    product.URL = req.body.URL;
    product.description = req.body.description;
    product.userId= req.body.userId;
    product.save((err,data)=>{
        if (err){
            res.status(500).send({error:"NOTSAVED"})
        }
        else{
            res.status(200).send(data)
        }})

})
app.get('/product',auth,(req,res)=>{
    Product.find({},function(err,data){
        if (err){
            res.status(500).send({error:"Could not Fetch"})
        }
        else{
            console.log(req.user._id)
            res.send(data);
        }
    })
})

app.put('/product',(req,res)=>{
    Product.findOneAndRemove({userId:req.body.userId},(err,data)=>{
        if(err){
            res.send({err:"could not remove"})
        }
        else{
            res.send("REMOVED")
        }
    })
})
app.post('/register',async(req,res)=>{
    const {error} = registerValidation(req.body)
    if (error){
        return res.status(400).send(error.details[0].message)
    }
    //checking for repetitive data
    const emailExist = await     User.findOne({email:req.body.email})
    if (emailExist){
        return res.status(401).send('Email Already Exist')
    }
    //Hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password,salt);

    //create a new user
    const user = new User({
        name:req.body.name,
        email: req.body.email,
        password: hashedPassword
    })
    try{
        const savedUser = await user.save()
        await user.save()
        res.send(savedUser)
    }catch(err){
        res.status(400).send(err)
    }
})

app.post ('/login',async(req,res)=>{
    const {error} = loginValidation(req.body)
    if (error){
        return res.status(401).send(error.details[0].message)
    }
   //checking for repetitive data
    const user = await User.findOne({email:req.body.email})
    if (!user){
    return res.status(401).send('Email Does Not Exist')
    }
    //password correct
    const validPass = await bcrypt.compare(req.body.password,user.password)

    if(!validPass){
        return res.status(400).send('Password is Incorrect')
    }
    //create and assign token
    const token = jwt.sign ({_id:user._id},process.env.ACCESS_TOKEN_SECRET)

   User.findOneAndUpdate({email:req.body.email},{token:token},function(err,data){
       if (err){
    res.status(500).send({error:"Could not Fetch"})
    }
})
    res.send([token,user.id,user.name])
})




app.get('/getcart',auth,async(req,res)=>{
    await User.findOne({_id: req.user._id}) .populate('products').exec(async(err,data)=>{
            res.send(data.products);
        })})







app.post('/getcart',auth,async(req,res)=>{
    await User.findOneAndUpdate({_id: req.user._id},{$pull:{products:req.body.data}}).then((response)=>{
        res.send(response)
    })
})


app.post('/shoppingcart',auth,(req,res)=>{//
    Product.findOne({_id: req.body.productId},(err,data)=>{
        if (err){
            res.status(500).send({err:"Product could not be added to the shoppingcart"})
        }
        else{
             User.updateOne({_id:req.body.user_id},{
                $addToSet:{products:req.body.productId}
            },{
                new: true
              },(err,data2)=>{
                     if (err){
                        res.status(500).send({error:"could not add item to shoppingcart"})
                    }
                    else{
                        console.log(data2)
                        res.send(data2)
                    }
                });
            }

        });})


app.listen(process.env.PORT || 3000,()=>{
    console.log("Server Started")
})
