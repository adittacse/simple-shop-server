const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.gkaujxr.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const db = client.db("simpleShopUserDB");
        const productsCollection = db.collection("products");

        // products related api's
        app.get("/products", async (req, res) => {
            const cursor = productsCollection.find().sort({ _id: -1 });
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productsCollection.findOne(query);
            res.send(result);
        });

        app.post("/products", async (req, res) => {
            const {
                title,
                shortDescription,
                fullDescription,
                price,
                date,
                priority,
                imageUrl,
            } = req.body;

            if (
                !title ||
                !shortDescription ||
                !fullDescription ||
                price == null
            ) {
                return res.status(400).json({
                    message:
                        "title, shortDescription, fullDescription, price are required",
                });
            }

            const newProduct = {
                title,
                shortDescription,
                fullDescription,
                price: Number(price),
                date: date || new Date().toISOString().slice(0, 10),
                priority: priority || "Medium",
                imageUrl:
                    imageUrl ||
                    "https://images.pexels.com/photos/196646/pexels-photo-196646.jpeg",
            };

            const result = await productsCollection.insertOne(newProduct);
            // const inserted = await productsCollection.findOne({ _id: result.insertedId });
            // res.status(201).json(formatProduct(inserted));
            res.send(result);
        });

        app.put("/products/:id", async (req, res) => {
            const id = req.params.id;
            const {
                title,
                shortDescription,
                fullDescription,
                price,
                date,
                priority,
                imageUrl,
            } = req.body;

            const update = {
                ...(title && { title }),
                ...(shortDescription && { shortDescription }),
                ...(fullDescription && { fullDescription }),
                ...(price != null && { price: Number(price) }),
                ...(date && { date }),
                ...(priority && { priority }),
                ...(imageUrl && { imageUrl }),
            };

            const result = await productsCollection.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: update },
                { returnDocument: "after" },
            );

            // if (!result.value) {
            //     return res.status(404).json({ message: "Product not found" });
            // }

            // res.json(formatProduct(result.value));
            res.send(result);
        });

        app.delete("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!",
        );
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
