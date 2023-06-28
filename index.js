const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const _ = require("lodash");

mongoose.connect("mongodb://127.0.0.1:27017/todoDB", { useNewUrlParser: true });

const itemsSchema = ({
  name: String
});

const ItemModel = mongoose.model("Item", itemsSchema);

const itemFood = new ItemModel({
  name: "Buy Food",
});

const cookFood = new ItemModel({
  name: "Cook Food",
});

const eatFood = new ItemModel({
  name: "Eat Food",
});

const listSchema = ({
  name: String,
  items: [itemsSchema],
});

const ListModel = mongoose.model("List", listSchema);

const app = express();
let workItems = [];

const defaultItem = [itemFood, cookFood, eatFood];

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let day = date();
app.get("/", (req, res) => {

  ItemModel.find()
    .then((items) => {
      if (items.length === 0) {
        ItemModel.insertMany([defaultItem])
          .then(() => {
            console.log("Successfully Inserted the Documents");
          })
          .catch((err) => {
            console.log(err);
          });
        res.redirect("/");
      } else {
        res.render("list", { listTitle: day, newListItems: items });
      }
    })
    .catch((error) => {
      console.log(error);
    });
});


app.get("/:list", (req, res) => {
  let reqParam = _.capitalize(req.params.list);


  ListModel.findOne({ name: reqParam })
    .then((foundList) => {
      console.log(foundList)
      if (!foundList) {
        const list = new ListModel({
          name: reqParam,
          items: defaultItem
        });
        list.save();
        res.redirect("/" + reqParam);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});


app.post("/", (req, res) => {

  const item = req.body.newItem;
  const listItem = req.body.button;

  const multipleItem = new ItemModel({
    name: item
  });

  if (listItem === day) {
    multipleItem.save();
    res.redirect("/");
  } else {
    ListModel.findOne({ name: listItem }).then((foundList) => {
      foundList.items.push(multipleItem);
      foundList.save();
      res.redirect("/" + listItem);
    }).catch((err) => {
      console.log(err);
    });
  }
});

app.post("/delete", (req, res) => {
  const check = req.body.checkbox;
  const listItem = req.body.listName;

  if(listItem === day){

    ItemModel.findByIdAndRemove(check)
      .then(() => {
        console.log("Deleted Successfully");
      })
      .catch((err) => {
        console.log("Posted error: "+err);
      });
    res.redirect("/");
  }else{
    ListModel.findOneAndUpdate({name:listItem},{$pull:{items:{_id:check}}}).then((err)=>{
      if(!err){
        res.redirect("/" + listItem);
      }  
    });
  }
});


app.post("/work", (req, res) => {
  let item = req.body.newWorkItem;
  workItems.push(item);
  res.redirect("/work");
});
app.get("/about", (req, res) => {
  res.render("about", { listTitle: "About Page" });
});
app.listen(3000, () => {
  console.log("Port started at localhost:3000");
});
