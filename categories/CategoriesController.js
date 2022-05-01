const express = require('express')
const router = express.Router()
const Category = require("./Category")
const Slugify = require('slugify')
const { default: slugify } = require('slugify')
const adminAuth = require("../middlewares/adminAuth")


router.get("/admin/categories/new", adminAuth, (req, res)=>{
    res.render("./admin/categories/new")
})

router.post("/categories/save", adminAuth, (req, res)=>{
    var title = req.body.title
    if(title != undefined){
        Category.create({
            title:title,
            slug: Slugify(title, {lower: true})
        }).then(()=>{
            res.redirect("/admin/categories")
        })
    }
    else{
        res.redirect("/admin/categories/new")
    }
})

router.get("/admin/categories", (req, res)=>{
    Category.findAll().then(categories =>{
        res.render('./admin/categories/index', {
            category: categories
        })
    })
    
})

router.post("/categories/delete", adminAuth, (req, res)=>{
    var id = req.body.id
    if(id != undefined && !isNaN(id)){
        Category.destroy({
            where:{
                id: id
            }
        }).then(()=>{
            res.redirect("/admin/categories")
        })
    }
    else{
        res.redirect("/admin/categories")
    }
})

router.get("/admin/categories/edit/:id", adminAuth, (req, res)=>{
    var id = req.params.id
    if(isNaN(id)){
        res.redirect("/admin/categories")
    }
    Category.findByPk(id).then(category =>{                /* finBypk faz busca mais rapida pelo id(chave primary) */
        if(category != undefined){
            res.render("admin/categories/edit",{category: category})
        }else{
            res.redirect("/admin/categories")
        }
    })
})

router.post("/categories/update", adminAuth, (req, res)=>{
    var id = req.body.id
    var title = req.body.title
    Category.update({title: title,              /* atualiza o campo title pela variavel title */
            slug: slugify(title, {lower: true})},             
        {where:{id: id}                         /* onde o campo id seja igual a variavel id  */
    }).then(()=>{
        res.redirect("/admin/categories")
    })
})

module.exports = router