"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signinrouter = void 0;
const express_1 = require("express");
const User_1 = require("../db/models/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.signinrouter = (0, express_1.Router)();
exports.signinrouter.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield req.body;
    console.log(data);
    let usersignedin;
    try {
        usersignedin = yield User_1.user.findOne({
            username: data.username,
            password: data.password
        });
    }
    catch (error) {
        console.log("User Not found");
    }
    const userSigntoken = jsonwebtoken_1.default.sign({
        username: usersignedin === null || usersignedin === void 0 ? void 0 : usersignedin.username,
        password: usersignedin === null || usersignedin === void 0 ? void 0 : usersignedin.password
    }, "nirvanjhasecret", { expiresIn: "1h" });
    res.send(userSigntoken);
}));
