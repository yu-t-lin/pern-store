import express from "express";
import helmet from "helmet";
import morgan from "morgan"; 
import cors from "cors";
import dotenv from "dotenv";
import path from "path"; 

import productRoutes from "./routes/productRoutes.js"
import { sql } from "./config/db.js";
import { aj } from "./lib/arcjet.js";


dotenv.config(); //to use .env file

//new way of using packages
const app = express();
const PORT = process.env.PORT || 3000; //if PORT is not defined in .env file then use 3000 
const __dirname = path.resolve(); //keep track of directory

app.use(express.json()); //extract json data
app.use(cors());

app.use(helmet({
    contentSecurityPolicy: false,
})); //helmet is a security middleware that helps you protect your app by setting various HTTP headers

app.use(morgan("dev")); //logs the requests is middleware

//apply arcjet rate limiting to all routes
app.use( async (req, res, next) => {
    try {
        const decision = await aj.protect(req, {
            requested: 1, // specifies that each request consume 1 token
        });

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                res.status(429).json({ error: "Too Many Requests" });
            } else if (decision.reason.isBot()) {
                res.status(403).json({ error: "Bot access denied" });
            } else {
                res.status(403).json({ error: "Forbidden" });
            }
            return
        }

        //check for spoofed bots
        if (decision.results.some((result) => result.reason.isBot() && result.reason.isSpoofed())) {
            res.status(403).json({ error: "Spoofed bot detected" });
            return;
        }


        next();
    } catch (error) {
        console.log("Arcjet error", error);
        next(error); 
    }
});

app.use("/api/products", productRoutes);

if (process.env.NODE_ENV === "production") {
    //serve react app
    app.use(express.static(path.join(__dirname, "/frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html")); 
    })
}

//function to initialize our database, in try we want to create a table
async function initDB() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                image VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log("Database initialized successfully");
    } catch(error) {
    console.log("Error initializing database", error);
    }
};


initDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server started on port " + PORT);
    });
})