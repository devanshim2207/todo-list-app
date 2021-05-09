const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
var date = require(__dirname+"/date.js");
const _ = require("lodash");

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser: true}, { useUnifiedTopology: true });

const itemsSchema = {
	name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
	name: "welcome to your todolist! "
});
const item2 = new Item({
	name: "Hit the + button to add new item"
});
const item3 = new Item({
	name: "<-- Hit this to delete an item"
});
const defaultItems = [item1, item2,item3];

const listSchema = {
	name: String,
	items : [itemsSchema]
};
const List = mongoose.model("List",listSchema)

app.listen(3000,function(){
	console.log("server is listening on port 3000")
})

app.get("/",function(req,res){
	
	let day = date();
	Item.find({},function(err, foundItems){
		if(foundItems.length === 0){
			Item.insertMany(defaultItems, function(err){
		if(err)
		console.log(err);
		else
		console.log("success");
			});
		res.redirect("/")
		}
		else
		res.render("list", {listTitle: "Today",newListItems: foundItems
	});
	});
	
});

app.post("/",function(req,res){
	const itemName = req.body.newItem;
	const listName = req.body.list;
	const item = new Item({
		name: itemName
	});
	if(listName === "Today"){
		item.save();
		res.redirect("/");
	}else{
		List.findOne({name: listName},function(err,foundList){
			foundList.items.push(item);
			foundList.save();
			res.redirect("/"+listName);
		})
	}
	
});
app.post("/delete",function(req,res){
	const checkedItemId = req.body.checkbox;
	const listName = req.body.listName;
	if(listName === "Today"){
		Item.findByIdAndRemove(checkedItemId,function(err){
		if(err)
			console.log(err);
		else
			res.redirect("/")
	});
	} else{
		List.findOneAndUpdate({name: listName},{$pull :{items: {_id: checkedItemId}}},function(err,foundList){
			if(!err){
				res.redirect("/"+listName);
			}
		});
	}
	
});


app.get("/:customListName",function(req,res){
	const customListName = _.capitalize(req.params.customListName);
	List.findOne({name: customListName},function(err,foundList){
		if(!err){
			if(!foundList){
				//create a new list
				const list = new List({
				name: customListName,
				items: defaultItems
				});
				list.save();
				res.redirect("/"+customListName);
			}
			else{
				//show an existing list
				res.render("list",{listTitle: foundList.name,newListItems: foundList.items});
			}
		}
	});
	
	
});
