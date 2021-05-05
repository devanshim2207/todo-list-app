const express = require("express");
const bodyParser = require("body-parser");
const app = express();
var date = require(__dirname+"/date.js");
var items = ["Buy Food","Cook Food","Eat Food"];
var workItems=[];

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.listen(3000,function(){
	console.log("server is listening on port 3000")
})

app.get("/",function(req,res){
	
	let day = date();
	res.render("list", {listTitle: day,newListItems: items
	});
});

app.post("/",function(req,res){
	var item = req.body.newItem;
	
	if(req.body.list === "Work"){
	 workItems.push(item);
	 res.redirect("/work");
	}
	else{
		items.push(item);
		res.redirect("/");
	}
	
});

app.get("/work",function(req,res){
	res.render("list",{listTitle: "Work List",newListItems: workItems});
})