import mongoose from "mongoose";

interface userSchemas {
    username: string;
    email: string;
    password: string;
}
const userSchema = new mongoose.Schema<userSchemas>({  
    username: String,
    email: String,
    password: String
})


export const user = mongoose.model('user', userSchema);