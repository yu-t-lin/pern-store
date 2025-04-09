import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

//const used to create a connection to the database
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;


//creates function for SQL connection using environment variables
//this sql function we export is used as a tagged template literal, allows us to write sql queries safely
export const sql = neon(
    `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`
);



