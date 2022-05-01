const express = require('express')
const Category = require('../categories/Category')
const router = express.Router()
const Article =require("./Article")
const Slugify = require("slugify")
const adminAuth = require("../middlewares/adminAuth")

router.get("/admin/articles", (req, res)=>{
    Article.findAll({
        include: [{model: Category}]             /* na busca de artigo inclua os dados do model category */
    }).then(articles =>{
        res.render("admin/article/index", {articles: articles})
    })
    
})

router.get("/admin/articles/new", adminAuth, (req, res)=>{
    Category.findAll().then((categories)=>{
        res.render("admin/article/new", {categories: categories})
    })
})

router.post("/articles/save", adminAuth, (req, res)=>{
    var title = req.body.title
    var body = req.body.body
    var category= req.body.category
    Article.create({
        title: title,
        slug: Slugify(title),
        body: body,
        categoryId: category
        }).then(() =>{
            res.redirect("/admin/articles")            
        })  
      
})

router.post("/articles/delete", adminAuth, (req, res)=>{
    var id = req.body.id
    if(id != undefined && !isNaN(id)){
        Article.destroy({
            where:{
                id: id
            }
        }).then(()=>{
            res.redirect("/admin/articles")
        })
    }
    else{
        res.redirect("/admin/categories")
    }
})

router.get("/admin/articles/edit/:id", adminAuth, (req, res)=>{
    var id = req.params.id
    if(isNaN(id)){                                              /* se id nao for um numero  entro no if*/
        res.redirect("/admin/articles")
    }
    Article.findByPk(id, 
        {include: [{model: Category}]                           /* finBypk faz busca mais rapida pelo id(chave primary) */
    }).then(articles =>{                      
        if(articles != undefined){
            Category.findAll().then(category =>{
                res.render("admin/article/edit",{articles: articles, category: category})
            })
        }else{
            res.redirect("/admin/articles")
        }
    })
})

router.post("/articles/update", adminAuth, (req, res)=>{
    var id = req.body.id
    var title = req.body.title
    var body = req.body.body
    var category = req.body.category
    Article.update({title: title,                                  /* atualiza o campo title pela variavel title */
                    body: body,
                    categoryId: category,
                    slug: Slugify(title, {lower: true})},             
                {where:{id: id}                                     /* onde o campo id seja igual a variavel id  */
    }).then(()=>{
        res.redirect("/admin/articles")
    })
})

router.get("/articles/page/:num?", (req, res)=>{
    var page = req.params.num
    if(isNaN(page)){
        page=0
    }
    var offset = 0
    if(!isNaN(page) && page >= 1){
        offset = (parseInt(page)-1)*4
    }

    Article.findAndCountAll({                                           /* me retorna todos os articos e com a contagem total deles */
        limit: 4,
        offset: offset,                                                 /* retorna apartir do dado informado  */
        order:[
            ['id', 'desc']]                                             
    }).then(articles =>{
        
        var next = false
        if(offset+4 < articles.count){
            next = true
        }

        var result = {
            page: parseInt(page),
            next: next,
            articles: articles
        }
        Category.findAll().then(categories =>{
            res.render("admin/article/page",{result: result, categories: categories})
        })
    })
})

module.exports = router