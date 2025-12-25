import express from "express"
import fs from "fs/promises"
import path from "path"


const app = express()
const PORT = process.env.PORT || 3000
app.use(express.json())

const __dirname = path.resolve()

const PATHusers = path.join(__dirname, "data", "users.json")
const PATHevents = path.join(__dirname,"data","events.json")
const PATHreceipts = path.join(__dirname,"data","receipts.json")


async function readFilet(path){
    const data = await fs.readFile(path, "utf8")
    const posts = JSON.parse(data)
    return posts
}
async function writeFilet(path, data){
    await fs.writeFile(path, JSON.stringify(data, null, 2))
}


app.post("/user/register", async (req, res) => {
    const body = req.body
    const users = await readFilet(PATHusers)
    const findUser = users.some(u => u.username === body.username)
    if(findUser){
        return res.status(400).send("The user is created")
    }
    const newUser = {
        username:body.username,
        password :body.password
    }
    users.push(newUser)
    await writeFilet(PATHusers, users)
    res.status(201).json({"message": "User registered successfully"})


})


app.post("/creator/events", async (req, res) => {
    const body = req.body
    const events = await readFilet(PATHevents)
    const users = await readFilet(PATHusers)

    const findUser = users.some(u => u.username === body.username && u.password === body.password)
    if(!findUser){
        return res.status(400).send("The user is not exist or the password is not good")
    }
    const findEvent = events.some(e => e.eventName === body.eventName)
    if(findEvent){
        return  res.status(400).send("The event has already been created.")
    }

    const newEvents = {
    "eventName": body.eventName,
    "ticketsForSale": body.ticketsForSale,
    "username": body.username,
    "password": body.password
    }
    events.push(newEvents)
    await writeFilet(PATHevents, events)
    res.status(201).json({"message": "Event created successfully"})

})



app.post("/users/tickets/buy", async (req, res) => {
    const body = req.body
    const events = await readFilet(PATHevents)
    const users = await readFilet(PATHusers)
    const receipts = await readFilet(PATHreceipts)

    const findUser = users.some(u => u.username === body.username && u.password === body.password)
    if(!findUser){
        return res.status(400).send("The user is not exist or the password is not good")
    }
    const findEvent = events.some(e => e.eventName.toLowerCase() === body.eventName.toLowerCase())
    if(!findEvent){
         return  res.status(400).send("The event has not been created.")
    }
    const index = events.findIndex(e => e.username === body.username)
    if((events[index].ticketsForSale - body.quantity) < 0){
       return res.status(400).json({msg:"There are not enough tickets."})
    }
    events[index].ticketsForSale -= body.quantity
    const newReceipts = {
        username:body.username,
        eventName:body.eventName,
        ticketsBought:body.quantity
    }
    receipts.push(newReceipts)
    
    await writeFilet(PATHevents, events)
    await writeFilet(PATHreceipts, receipts)
    res.status(200).json({"message": "Tickets purchased successfully"})
})



app.get("/users/:username/summary", async (req, res) => {
    const userName = req.params.username
    const receipts = await readFilet(PATHreceipts)
    const user = receipts.some(r => r.username === userName)
    if(!user){
        return res.status(400).json({msg:"The username does not exist."})
    }
    const userReceipts = receipts.filter(r => r.username === userName);

    const responseOfUser = {
        totalTicketsBought:0,
        events:[],
        averageTicketsPerEvent:0
    }
    userReceipts.forEach((r) => {
        responseOfUser.totalTicketsBought += r.ticketsBought

        if(!responseOfUser.events.includes(r.eventName)){
            responseOfUser.events.push(r.eventName)
        }
    })
    responseOfUser.averageTicketsPerEvent = (responseOfUser.totalTicketsBought / responseOfUser.events.length)
    res.status(200).json({responseOfUser})
})









































app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`)
    next()
})



















app.listen(PORT,() => {
    console.log(`The server is run ${PORT}`)
})