import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import * as dotenv from "dotenv";

//APP CONFIG
dotenv.config();
const app = express();
const port = 5000;

//APP CONFIG
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.json());

//DB CONFIG
const passwordDb = process.env.DB_PASSWORD;
const url = `mongodb+srv://factpot:${passwordDb}@facts.6crimxi.mongodb.net/?retryWrites=true&w=majority`; //CHNAGE THIS
const localUrl = `mongodb://127.0.0.1:27017/FunFactsDB2`;

//Db Collections
const factsSchema = new mongoose.Schema({
  title: String,
  fact: String,
  moreInfo: String,
});

const Fact = mongoose.model("Fact", factsSchema);

//ROUTES
app.get("/", (req, res) => {
  res.send("working");
});

//SAVE FACT
app.post("/post/fact", (req, res) => {
  //accessing data from client
  const { title, fact, moreInfo } = req.body;
  //fetch the already existing links from the user submited fact title
  async function getLinks(title) {
    const facts = Fact.find({ title: title });
    return facts;
  }

  getLinks(title).then((foundFacts) => {
    if (foundFacts.length !== 0) {
      //Already existing links
      res.status(202).send("Fact Already Exist");
    } else {
      //no existing links

      const newFact = new Fact({
        title: title,
        fact: fact,
        moreInfo: moreInfo,
      });

      //save the new fact
      newFact.save().then(() => {
        res.status(201).send("Fact uploaded succesfully!");
      });
    }
    // mongoose.connection.close();
  });
});

//GET 10 RANDOM FACTS
app.get("/get/facts/random", (req, res) => {
  Fact.aggregate()
    .sample(5)
    .then((foundRandomFacts) => {
      res.status(201).send(foundRandomFacts);
    });
});

//SEARCH A REG FACT
app.get("/search/reg/fact/:query", (req, res) => {
  let query = new RegExp(req.params.query);

  //find Fact from the query user provided
  async function getFacts(title) {
    const fact = Fact.find({ title: title });

    return fact;
  }

  getFacts(query).then((foundFacts) => {
    if (foundFacts.length === 0) {
      //No Existing facts from that title
      res.status(202).send("No Results");
    } else {
      //send found fact to the user
      res.status(200).send(foundFacts);
    }
  });
});

//SEARCH A FACT
app.get("/get/fact/:title", (req, res) => {
  const { title } = req.params;

  //find Fact from the title user provided
  async function getFacts(title) {
    const fact = Fact.find({ title: title });
    return fact;
  }

  getFacts(title).then((foundFacts) => {
    if (foundFacts.length === 0) {
      //No Existing facts from that title
      res.status(202).send("No Existing facts from that name");
    } else {
      //send found fact to the user
      const dataToF = {
        title: foundFacts[0].title,
        fact: foundFacts[0].fact,
        moreInfo: foundFacts[0].moreInfo,
      };

      res.status(200).send(dataToF);
    }
  });
});

mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to the database");
    app.listen(port, () => {
      console.log(`server has started on port ${port}`);
    });
  });
