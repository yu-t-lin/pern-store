//configure third party libraries in this folder
import arcjet, { tokenBucket, shield, detectBot } from "@arcjet/node";

import "dotenv/config";

//init arcjet
export const aj = arcjet({
    key: process.env.ARCJET_KEY,
    characteristics:["ip.src"], //Track requests by IP
    rules: [
        //shield protects app from sql injections, xss, csrf etc
        shield({mode:"LIVE"}),
        detectBot({
            mode:"LIVE",
            //blocks all bots except for search engines
            allow:[
                "CATEGORY:SEARCH_ENGINE"
                // full list of bots https://arcjet.com/bot-list
            ]
        }),
        //rate limiting
        tokenBucket({
            mode: "LIVE",
            refillRate: 30,
            interval: 5,
            capacity: 20,
        }),

    ]

})
