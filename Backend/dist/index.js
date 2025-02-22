"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("./routes/index"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: "https://quick-serve-weld.vercel.app/", // Frontend URL
    credentials: true
}));
app.use("/api/v1", index_1.default);
app.get("/", (req, res) => {
    res.json({
        msg: "Hi There"
    });
});
app.listen(3000, () => {
    console.log("Sever is listening on port 3000");
});
