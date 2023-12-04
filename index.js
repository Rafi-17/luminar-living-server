const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r9pshpu.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect(); 

    const apartmentCollection=client.db("luminarDb").collection("apartment");
    const requestedAgreementCollection=client.db("luminarDb").collection("requestedAgreement");
    const acceptedAgreementCollection=client.db("luminarDb").collection("acceptedAgreement");
    const userCollection=client.db("luminarDb").collection("user");

    app.get('/apartments', async (req, res) => {
        const page=parseInt(req.query.page);
        const size=6;
        console.log(req.query);
        const result = await apartmentCollection.find()
        .skip((page-1)*size)
        .limit(size)
        .toArray();
        res.send(result)
    })
    app.get('/apartmentsCount', async (req, res) => {
        const count= await apartmentCollection.estimatedDocumentCount();
        res.send({count});
    })

    //requestedAgreementCollection
    app.get('/requestedAgreements', async (req, res) => {
        
        const result = await requestedAgreementCollection.find().toArray();
        res.send(result);
    })
    app.post('/requestedAgreements', async (req, res) => {
        const newAgreement = req.body;
        const result = await requestedAgreementCollection.insertOne(newAgreement);
        res.send(result);
    })

    //acceptedAgreementCollection

    //usersCollection
    app.get('/users',async (req, res) =>{
        const role=req.query.role;
        const query={role: role}
        const result=await userCollection.find(query).toArray();
        res.send(result);
    })
    app.post('/users',async(req,res)=>{
        const user= req.body;
        const query= {email: user.email}
        const existingUser= await userCollection.findOne(query);
        if(existingUser){
            return res.send({message:'user already exists', insertedId:null})
        }
        const result= await userCollection.insertOne(user);
        res.send(result);
    })

    app.put('/users/:email',async(req,res)=>{
        const email=req.params.email;
        console.log(email);
        const filter={email: email}
        const change=req.body;
        const updatedUser={
            $set:{
                role:change.role
            }
        }
        const result= await userCollection.updateOne(filter,updatedUser)
        res.send(result);
    })








    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('luminiar living is sleeping')
})

app.listen(port, () => {
    console.log(`Luminiar living Server is running on port ${port}`)
})
