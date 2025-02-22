import express from "express"
import cors from "cors"
import Routes from "./routes/index"
import cookieParser from "cookie-parser"

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "https://quick-serve-weld.vercel.app", // Frontend URL
    credentials: true
}))


app.use("/api/v1", Routes) 

app.get("/", (req, res) => {
    res.json({
        msg: "Hi There"
    })
})

app.listen(3000, () => {
    console.log("Sever is listening on port 3000")
})