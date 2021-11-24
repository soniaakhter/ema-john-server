const express = require('express')
const { MongoClient } = require('mongodb');
// const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const cors = require('cors')


const app = express()
const port = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ywuva.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run() {
    try {
        await client.connect();
        console.log('connected')
        const database = client.db("emaJohn");
        const productsCollection = database.collection("products");
        const ordersCollection = database.collection('orders');

        // GET products API
        app.get('/products', async (req, res) => {
            // console.log(req.query)
            const cursor = productsCollection.find({})
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let products;
            const count = await cursor.count();
            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                products = await cursor.toArray();
            }
            res.send({
                count,
                products
            });
        })

        // Use POST to get data by keys
        app.post('/products/byKeys', async (req, res) => {
            const keys = req.body;
            const query = { key: { $in: keys } }
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        });

        // Add POST Orders API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        })


       



    } finally {
        // await client.close();
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('Running My CRUD Server')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})