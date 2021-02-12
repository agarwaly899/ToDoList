//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-yash:Yash.0007@cluster0.apokm.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const itemsSchema = {
  name: String
};

const item_Model = mongoose.model("item", itemsSchema);

const item1 = new item_Model({
  name: "random text 1"
});

const item2 = new item_Model({
  name: "random text 2"
});

const item3 = new item_Model({
  name: "random text 3"
});



const listSchema = {
  name: String,
  items: [itemsSchema]
};

const list_Model = mongoose.model("list", listSchema);



const defaultItems = [item1, item2, item3];


app.get("/", function(req, res) {

  const day = date.getDate();

  item_Model.find({}, function(err, foundItems) {
    if (err) {
      console.log(err);
    }
    if (foundItems.length === 0) {
      item_Model.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("success in entry of items");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: day,
        newListItems: foundItems
      });
    }
  });


});

app.get("/:customList", function(req, res){
    const customListName = _.capitalize(req.params.customList);

    list_Model.find({name: customListName}, function(err, results){
      if(!err){
        if(results.length == 0){
          const list = new list_Model({
            name: customListName,
            items: defaultItems
          });

          list.save();
          res.redirect("/"+customListName);
        }
        else{
          res.render("list", {listTitle: results[0].name, newListItems: results[0].items});
        }
      }
    });


});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item_temp = new item_Model({
    name: itemName
  });

  if(listName === date.getDate()){
    item_temp.save();

    res.redirect("/");
  }
  else{
    list_Model.findOne({name: listName}, function(err, result){
      if(!err){
        if(result){
          result.items.push(item_temp);
          result.save();
          res.redirect("/"+listName);
        }
      }
    });
  }
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function(req, res) {
  const IDtobeDeleted = req.body.checkbox;
  const listDelete = req.body.listName;

  if(listDelete === date.getDate()){
    item_Model.deleteOne({
      _id: IDtobeDeleted
    }, function(err) {
      if (!err) {
        console.log("success in deletion");
      }
    });

    res.redirect("/");
  }
  else{
    list_Model.findOneAndUpdate({name: listDelete}, {$pull: {items: {_id: IDtobeDeleted}}}, function(err, result){
      if(!err){
        res.redirect("/"+listDelete);
      }
    });
  }

});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
