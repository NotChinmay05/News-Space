import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

// create express backend
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Variables
// ****** Enter your news api key inside the "" below ******
const API_KEY = "";

// default query parameters
let endpoint = "everything";   // select between "top-headlines" or "everything"
let keywordParam = "";
let language = "en";

// param options for everything -- q, sortBy, sources
// param options for top-headlines -- category

// default param for everything- from,to: past 2 days, q=trending
// default param for top-headlines from,to: past 2 days, language=en 


let queryParamsOptions = {
    // query for everything req.body returns -
    "everything":{
        sortBy: "popularity",      // select between sorting type  
        sources: "allSource",      // select between country list
    },

    // query for top-headlines
    "top-headlines":{
        category: "allCategory",   // select between category list
    }
}

// setting date two days back, from which the news should be shown
// let todayDate = new Date()
let past2Date = new Date()
past2Date.setDate(past2Date.getDate() - 2)
past2Date = past2Date.toISOString().slice(0,10)
// console.log(past2Date)

let pageSize = 15
let pageNum = 1

const API_URL = `https://newsapi.org/v2/`

async function setApiUrl(){
    let url = `${endpoint}?pageSize=${pageSize}&page=${pageNum}`

    // setting the url as per the query choices provided by the user
    for (const key in queryParamsOptions[endpoint]) {
        if (!queryParamsOptions[endpoint][key].includes("all")){
            // console.log(key, queryParamsOptions[endpoint][key])
            url = url + `&${key}=${queryParamsOptions[endpoint][key]}`
        }
    }

    // this is to set a default query, if no essential choice (sources, q, category) is provided
    if (endpoint === "everything"){
        // if keyword given execute this
        if (keywordParam !== ""){
            url = url + `&q=${keywordParam}`
        } 
        // if keyword not given and also sources not given
        else if (!url.includes("sources=")) {
            url = url + `&q=trending&from=${past2Date}`
        }
    }
    else if (endpoint === "top-headlines"){
        url = url + `&from=${past2Date}`
        if (!url.includes("category=")){
            url = url + "&language=en"
        }
    }
    
    return url
}

// GET Home Page
app.get("/", async (req, res) => {
    let url = await setApiUrl()
    
    // console.log(API_URL + url)
    try {
        let response = await axios.get(API_URL + url, {
            headers: {
                "X-Api-Key":API_KEY
            }
        })
        
        let articles = response.data.articles
        res.render("index.ejs", {
            endpoint:endpoint,
            options:Object.values(queryParamsOptions[endpoint]).join(","),  // sending the options selected by user as a string
            keyword:keywordParam,
            data:articles,
        })
    } catch (error) {
        console.log(error.message)
        res.render("index.ejs", {
            endpoint:endpoint,
            options:Object.values(queryParamsOptions[endpoint]).join(","),  // sending the options selected by user as a string
            keyword:keywordParam,
        })
    }
})


app.post("/news-type", (req, res)=>{
    endpoint = req.body.newsType

    res.redirect("/")
})

app.post("/search", (req,res)=>{
    keywordParam = req.body.keyword.trim()

    res.redirect("/")
})

app.post("/option", (req,res)=>{
    queryParamsOptions[endpoint] = req.body

    res.redirect("/")
})

app.post("/clearKeyword", (req,res)=>{
    keywordParam = ""

    res.redirect("/")
})

// run the server on port
app.listen(port, () => {
    console.log(`Server running on https://localhost:${port}`)
})