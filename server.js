require("dotenv").config()
const express = require('express');
const app = express();
const path = require("path");
const logger = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");

const User = require("./models/user");
const Feed = require("./models/feed");
const feed = require("./models/feed");

app.use(express.static(path.join(__dirname, "public")));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: false}));


app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true
}))


app.set("view engine", "ejs");


mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => console.log("DB connected"))
  .catch(error => console.log(error))


app.get("/", (req,res) => {
    res.render("signup.ejs");
})


app.post("/signup", async (req, res) => {
    try {
        const user = new User({
            email: req.body.email,
            password: req.body.password
        })
        await user.save();
        console.log("User created")
        res.redirect("/login")
    } catch {
        res.redirect("/")
    }
})


app.get("/login", (req, res) => {
    res.render("login.ejs");
})



app.post("/signin", async (req, res) => {
   await User.find({ email: req.body.email}).then(data => {
       if(req.body.password == data[0].password){
           req.session.user = data[0]
           res.redirect("/homepage")
       }
   }).catch(e => {
    console.log(e)
    res.send("Error")
   })
})


app.get("/homepage", Auth, async (req, res) => {
    await Feed.find({ userId: req.session.user._id}).then(feed => {
        console.log(feed)
        res.render("homepage.ejs", {
            feeds: feed,
        })
    })
})

app.post("/newfeed", async (req, res) => {
    try {
        const feed = new Feed({
            userId: req.session.user._id,
            newpost: req.body.newpost
        })
        await feed.save()
        console.log("feed added");
        res.redirect("/homepage");
    } catch(error){
        console.log(error)
        res.send("error")
    } 
}) 


app.get("/feededit/:id", async (req, res) => {
    await Feed.findById(req.params.id).then(feed => {
        console.log(feed)
        if(req.session.user._id == feed.userId){
            res.render("FeedEdit.ejs", {
                feed: feed
            })
        } else {
            res.redirect("/homepage")
        }
    }).catch(err => {
        console.log(err)
        res.send("error")
    })
})

app.post("/updatefeed/:id", async (req, res) => {
    await Feed.findByIdAndUpdate({_id: req.params.id}, {
        $set: {
            newpost: req.body.newpost
        }
    }).then(result => {
        if(result){
            console.log("feed updated")
            res.redirect("/homepage")
        } else{
            res.send(error)
        }
    }).catch(err => {
        res.send("Error")
    })
})

app.post("/feedDelete/:id", async (req, res) => {
    await Feed.findByIdAndDelete({_id: req.params.id}).then(result => {
        if(result){
            console.log("feed deleted")
            res.redirect("/homepage")
        } else{
            res.send("error")
        }
    }).catch(e => {
        console.log(e)
        res.send("Error")
    })
})


app.post("/logout", (req, res) => {
    req.session.destroy()
    res.redirect("/")
})


function Auth(req, res, next){
    if(req.session.user){
        return next();
    }
    else {
        res.redirect("/")
    }
}

app.use( (req, res) => {
    res.send("Page not Found")
})

let port = process.env.PORT || 3000;

app.listen(3000, () => {
    console.log("Listening on port 3000");
});