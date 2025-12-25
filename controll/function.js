import express from "express"
import path from "path"
import fs from "fs/promises"

const app = express()
const PORT = process.env.PORT



const __dirname = path.resolve()

const PATHuser = path.join(__dirname)
console.log(PATHuser)



app.use(express.json())

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`)
    next()
})



















app.listen(PORT,() => {
    console.log(`The server is run ${PORT}`)
})