require('dotenv').config();
const express = require('express');
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const mongoose = require('mongoose');
const MONGO_URL = process.env.MONGODB_URL;
const methodOverride = require('method-override');
const port = process.env.PORT || 5000;
const Expense = require("../backend/model/expense.js");
const Group = require("../backend/model/group.js");
const User = require("../backend/model/user.js");

app.engine("ejs", ejsMate);

app.use(express.json());  // To parse JSON data
app.use(express.urlencoded({ extended: true }));//to parse form data
app.use(methodOverride('_method'));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "view"));

main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log("Something went wrong", err); 
    });

async function main() { 
    await mongoose.connect(MONGO_URL);
}
//index
app.get("/user/index", (req, res) => {
    res.render("index.ejs");
});
//USER ROUTES
//signup CREATE
app.get("/user/signup", (req, res) => {
    res.render("signup.ejs");
});

app.post("/user/signup",async (req, res) => {
    try { 
        let { name, email, password } = req.body;
        console.log({ name, email, password });
        const trimmedName = name.trim();
        let newUser = await User.create({ name: trimmedName, email, password });
        console.log("saved");
        res.redirect("/user/show")
    } catch(e) {
        console.log(e);
     }
});

//Delete
app.get("/user/userDelete", (req, res) => {
    res.render("userDelete.ejs"); 
});

//DELETE
app.delete("/user/delete", async (req, res) => {
    try {
    let { email } = req.body;
    let delUser = await User.findOneAndDelete({email:`${email}` });
    console.log(` ${email} deleted`);
     } catch (e) { console.log(e); }
    
});

//show all users READ
app.get("/user/show", async(req, res) => {
    let users = await User.find();
    res.render("showUser.ejs", { users });
});

//UPDATE
app.get("/user/userUpdate",  (req, res) => {
    res.render("userUpdate.ejs");
});

app.put("/user/userUpdate", async (req, res) => {
    try {
    let { email, name } = req.body;           //filter                 update             option:returns the updated document (by default it returns the old one).
    let upUser = await User.findOneAndUpdate({ email: `${email}` }, { name: `${name}` }, { new: true });
    console.log("updated")
    res.redirect("/user/show");
     } catch (e) { console.log(e); }
   

});
//USER ROUTES ENDS HERE


//GROUP ROUTES
app.get("/group", (req, res) => { 
    res.render("createGroup.ejs");
});


app.post("/group/createGroup", async (req, res) => {
    const { name, members } = req.body;
    console.log(members);
    const usernames = Array.isArray(members) ? members : [members];
    const cleanNames = usernames.map(n => n.trim());
    const users = await User.find({ name: { $in: cleanNames } });
    const userIds = users.map(u => u._id);

    let group = await Group.create({
        name: name,
        members: userIds,
        expenses: [],
        balances: new Map(),
    });

    // Populate members to get actual user details
    group = await Group.findById(group._id).populate('members');

    res.render("grpDetails.ejs", { group: group });
});

//EDIT
// app.get("/group/:id/edit", async (req, res) => {
//     const group = await Group.findById(req.params.id).populate("members");
//     res.render("ediitGroup.ejs", { group });
// });

// app.get("/group/:id/edit", async (req, res) => {
//     const group = await Group.findById(req.params.id).populate("members");
//     res.render("ediitGroup.ejs", { group });
// });


// app.put("/group/:id", async (req, res) => {
//     const { name, members } = req.body;
//     const usernames = Array.isArray(members) ? members : [members];
//     const users = await User.find({ name: { $in: usernames } });
//     const userIds = users.map(u => u._id);

//     const group = await Group.findByIdAndUpdate(req.params.id, {
//         name: name,
//         members: userIds
//     }, { new: true });

//     res.render("grpDetails.ejs", { groups: [group] }); // Or render updated view
// });

// app.get("/group/grpDetails", async(req, res) => {
//     // let users = await Group.find();
//     const group = await Group.find({});
//     res.render("grpDetails.ejs", { groups: group });
// });

//EXPENSE ROUTE
//add 
// POST route to add an expense

app.post("/expenses", async (req, res) => {
  try {
    const { group, title, amount, paidBy, splitBetween, splitType } = req.body;

    let splitUsers = Array.isArray(splitBetween) ? splitBetween : [splitBetween];

    const expense = await Expense.create({
      title,
      amount,
      paidBy,
      group,
      splitBetween: splitUsers,
      splitType,
    });

    console.log("✅ Expense created:", expense);

    await Group.findByIdAndUpdate(group, {
      $push: { expenses: expense._id },
    });

    // 🔥 Populate the expenses manually — deeply!
    const updatedGroup = await Group.findById(group)
      .populate("members")
      .populate({
        path: "expenses",
        populate: [
          { path: "paidBy", model: "User" },
          { path: "splitBetween", model: "User" },
        ],
      });

    console.log("🧠 Updated group:", JSON.stringify(updatedGroup, null, 2));

    res.render("grpDetails", { group: updatedGroup });
  } catch (err) {
    console.error("💥 Error adding expense:", err);
    res.status(500).send("Something went wrong.");
  }
});



//root
app.get("/", (req, res) => {
    res.send("root is working");
});

app.listen(port, () => { 
    console.log(`Listening on ${port} ...`);
});