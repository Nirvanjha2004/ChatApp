import mongoose from "mongoose";

export default async function dbConnect(){
    await mongoose.connect(String("mongodb+srv://nirvanjha:nirvanjha2004@cluster0.7qgyv6i.mongodb.net/"))
    console.log("Mongo DB connected Successfully!");
}