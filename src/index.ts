import { Client } from "pg";
import express from "express"


const app = express();
app.use(express.json());


const pgClient = new Client({
    connectionString: "postgresql://neondb_owner:npg_I5MEGm7VNAPd@ep-withered-wave-aed47q64-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
})


const pgClient2 = new Client({
    user: "neondb_owner",
    password: "npg_I5MEGm7VNAPd",
    port: 5432,
    host: "ep-withered-wave-aed47q64-pooler.c-2.us-east-2.aws.neon.tech",
    database: "neondb"
})

pgClient.connect();

app.post("/signup", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;


    const { city, country, street, pincode } = req.body

    try {
        let userSqlQuery = `INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING id`
        let addressSqlQuery = `INSERT INTO addresses (city, country, street, pincode, user_id) VALUES ($1, $2, $3, $4, $5)`


        await pgClient.query("BEGIN");

        const response = await pgClient.query(userSqlQuery, [username, password, email]);

        const userId = response.rows[0].id;

        const response2 = await pgClient.query(addressSqlQuery, [city, country, street, pincode, userId])


        await pgClient.query("COMMIT");

        res.json({
            message: "You have signed up",
            result: "Your userid is",
            userId: userId
        })

    } catch (e) {
        console.log(e);
        return res.json({
            message: "Some problem occured in signup endpoint"
        })
    }
})


app.get("/metadata", async (req, res) => {
    const id = req.query.id;
    const query = `SELECT users.id, users.username, users.email, addresses.id, addresses.city, addresses.street, addresses.country, addresses.pincode, addresses.user_id FROM users JOIN addresses ON users.id = addresses.user_id WHERE users.id = $1`


    const response = await pgClient.query(query, [id]);

    return res.json({
        response : response.rows
    })
})


app.listen(3000)