import { Router } from "express";
import { user } from "../db/models/User";
import jwt from "jsonwebtoken";


export const signinrouter= Router();


signinrouter.post('/signin', async(req, res)=>{
    const data = await req.body;
    console.log(data);
    let usersignedin;
    try {
        usersignedin = await user.findOne({
            username: data.username,
            password: data.password
        })
    } catch (error) {
        console.log("User Not found");
    }
    
    const userSigntoken= jwt.sign({
        username: usersignedin?.username,
        password: usersignedin?.password
    }, "nirvanjhasecret", { expiresIn: "1h" });


    res.send(userSigntoken);
})