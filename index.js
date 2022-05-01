const express = require("express")
const app = express()
const session = require("express-session")
const connection = require("./database/database")

//controller
const categoriesController = require("./categories/CategoriesController")
const articlesController = require("./articles/ArticlesController")
const usersController = require("./users/UsersController")

//models
const Category = require('./categories/Category')
const Article = require('./articles/Article')
const User = require('./users/User')

//view wbgubw
app.set('view engine', 'ejs')

//Session
app.use(session({
    secret:"fwqfasfwqg23f56",                         //aumenta a segurasança 
    cookie:{maxAge:30000}                            // como o tempo maximo de 30mil mili segundos e depois deslogo altomaticamente 

}))


//by parser
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

//Static css
app.use(express.static('public'))

//database
connection.authenticate().then(()=>{
    console.log('Conectado ao banco de dados')
}).catch((erro)=>{
    console.log('erro ao conectar ao banco de dados '+ erro)
})

app.use("/", categoriesController)
app.use("/", articlesController)
app.use("/", usersController)




app.get("/", (req, res)=>{
    Article.findAll({
        order:[
        ['id', 'desc']],
        limit: 4
    }).then(articles =>{
        Category.findAll().then(category =>{
            res.render("index", {articles: articles, categories: category})
        })
                
    })
})

app.get("/:slug",(req, res)=>{
    var slug = req.params.slug
    Article.findOne({
        where:{slug: slug}
    }).then(article =>{
        if(article != undefined){
            Category.findAll().then(category =>{
                res.render("article", {article: article, categories: category})
            })
        }else{
            res.redirect("/")
        }
    }).catch(()=>{
        res.redirect("/")
    })    
})

app.get("/category/:slug", (req, res)=>{
    var slug = req.params.slug
    Category.findOne({
        where:{slug: slug},
        include: [{model: Article}]
    }).then(category =>{
        if(category != undefined){
            Category.findAll().then(categories =>{
                res.render("index",{articles: category.articles, categories: categories})
            })
        }else{
            res.redirect("/")
        }
    }).catch(()=>{
        res.redirect("/")
    })
})

app.listen(80, ()=>{
    console.log("o servidor esta rodadndo")
})