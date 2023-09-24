import express from "express";
import parser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";

const app=express();

app.use(express.static("public"))
app.use(parser.urlencoded({extended:true}));

mongoose.connect("mongodb+srv://theyaswanthkurapati:Yaswanth64@yaswanth.f5knhog.mongodb.net/ToDoDB?retryWrites=true&w=majority",{useNewUrlParser:true});

//TODAY LIST

const ItemSchema=new mongoose.Schema({
    name:String,
});

const Item=mongoose.model("Item",ItemSchema);

const item1=new Item({
    name:"Welcome to To-Do list",
})

const item2=new Item({
    name:"Hit the + button to add",
})

const item3=new Item({
    name:"<-- Hit this to delete an item",
})

//CUSTOM LIST

const customListSchema=new mongoose.Schema({
    name:String,
    listItems:[ItemSchema],
})

const List=mongoose.model("List",customListSchema);

app.get("/",async(req,res)=>{
    const items=await Item.find();
    if(items.length==0)
    {
        const err=Item.insertMany([item1,item2,item3]);
        res.redirect("/");
    }
    else
    {
        res.render("today.ejs",
        {
            title: "Today",
            content: items,
        });
    }
});

app.post("/", async(req,res)=>{
    const item=new Item({
        name:req.body.inputvalue,
    })
    if(req.body.button==="Today")
    {
        item.save();
        res.redirect("/");
    }
    else
    {
        const customListName=req.body.button;
        const foundList=await List.findOne({name:customListName});
        foundList.listItems.push(item);
        foundList.save();
        res.redirect("/"+customListName);
    }
})

app.post("/delete", async (req,res)=>{
    const itemID=req.body.checkbox;
    const customListName=req.body.hidden;
    if(customListName==="Today")
    {
        await Item.deleteOne({_id:itemID});
        res.redirect("/");
    }
    else
    {
        const foundList= await List.findOneAndUpdate({name:customListName},{ $pull:{listItems: {_id:itemID}} });
        res.redirect("/"+customListName);
    }
    
})

//FOR CUSTOM LISTS

app.get("/:customListName", async (req,res)=>{
    const customListName=_.capitalize(req.params.customListName);
    const foundList=await List.findOne({name:customListName});
    if(!foundList)
    {
        const list=new List({
            name:customListName,
            listItems: [item1,item2,item3],
        });
        list.save();
        res.redirect("/"+customListName);
    }
    else
    {
        res.render("today.ejs",{
            title:customListName,
            content:foundList.listItems,
        })
    }
})

app.post("/newList",(req,res)=>{
    const ListName=req.body.ListName;
    res.redirect(`/${ListName}`);
})

var port=process.env.PORT;
if(port==null || port=="")
{
    port=3000;
}

app.listen(port,()=>{
    console.log(`Listening on port ${port}`);
})
