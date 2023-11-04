import express from 'express';
import mongoose, { Model, Schema } from 'mongoose';
import path from "path";
import cookieParser from 'cookie-parser';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const app=express();

// const user=[];

// app.get("/",(req,res)=>{
//     res.json({
//         "success": true,
//         "products": []
//     })
// })

// app.get("/",(req,res)=>{
//     const pathloc=path.resolve()
//     const file=path.join(pathloc,"./index.html")
//     res.sendFile(file)
// })


// Using middleware
app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())

//mongoose connect
mongoose.connect("mongodb://127.0.0.1:27017",{
    dbName: "backend",
}).then(()=>console.log("Database Connected.."))
.catch((e)=>console.log(e))

// const messageSchema = new mongoose.Schema({
//     name: String,
//     email: String,
// }) 

const userSchema =new mongoose.Schema({
    name: String,
    email: String,
    password: String,
})

// const message = new mongoose.model("Message",messageSchema)

const User = new mongoose.model("User",userSchema);

// app.get("/",(req,res)=>{
//     res.render("index.ejs", {name:"temp"});
//     // res.sendFile("index");
// })

// add user data to array user

// app.post("/",(req,res)=>{
    // res.render("index.ejs", {name:"temp"});
    // res.sendFile("index");
    // console.log(req.body.name)
    // user.push({username:req.body.name,useremail:req.body.email});
    // res.render("sucess.ejs");
// })

// app.get("/user",(req,res)=>{
//     res.json({
//         user,
//     })
// })

//adding data to mongoDB

// app.get("/add",async(req,res)=>{
//     // await message.create({name: "iil2",email:"nikhil2@gys.com"})
//     res.send("Nice")    
// })


// adding form data to database

// app.post("/",async (req,res)=>{
//     // const MessageData = {username:req.body.name,useremail:req.body.email};
//     // console.log(MessageData);
//     // await message.create({name:req.body.name,email:req.body.email})
//     // res.render("sucess.ejs");

//     //More Clean 

//     const {name,email} = req.body;  // destructuring
//     await message.create({name,email});
//     res.render("sucess.ejs")
// })


// app.get("/login",(req,res)=>{
//     res.render("index.ejs")
// })


// for login and logout:
app.post("/register",async (req,res)=>{

    const {name,email,password}=req.body;
    

    let user = await User.findOne({email});

    if(user){
        return res.redirect("/login")
    }


       const incrytedpassword = await bcrypt.hash(password,10);
    
        user =  await User.create({
        name,
        email,
        password: incrytedpassword,
    })

    const token = jwt.sign({_id:user._id},"ngjakifi")

    res.cookie("token",token,{
        httpOnly:true, expires: new Date(Date.now()+60*1000)
    })
    res.redirect("/")
})


app.post("/login",async (req,res)=>{
    
    const {email,password}=req.body;
    let user = await User.findOne({email});
    if(!user) return res.redirect("/register")

    let isMatch = await bcrypt.compare(password,user.password)//password===user.password;

    if(!isMatch) return res.render("login.ejs",{ email: email,message: "Incorrect Password" })

    const token = jwt.sign({_id:user._id},"ngjakifi")

    res.cookie("token",token,{
        httpOnly:true, expires: new Date(Date.now()+60*1000)
    })
    res.redirect("/")


})

app.post("/logout",(req,res)=>{
    res.cookie("token",null,{
        httpOnly:true, expires: new Date(Date.now())
    })
    res.redirect("/")
})

const isAuthenticated = async (req,res,next)=>{
    const  {token} = req.cookies;
    if(token){
        const decoded = jwt.verify(token,"ngjakifi");

        req.user = await User.findById(decoded._id)
        
        next()
    }
    else{
        res.render("register.ejs");
    }
}

app.get("/",isAuthenticated,(req,res)=>{
    // console.log(req.user);
    res.render("logout.ejs",{name:req.user.name});
    })

    app.get("/login",(req,res)=>{        
        res.render("login.ejs");
        })    



app.listen(5000,()=>{
    console.log("Server is working");
})


