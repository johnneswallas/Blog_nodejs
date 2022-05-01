const express =  require("express")
const router = express.Router()
const User = require("./User")
const bcrpt = require('bcryptjs')
const bcrypt = require("bcryptjs/dist/bcrypt")
const adminAuth = require("../middlewares/adminAuth")


router.get("/admin/users", adminAuth, (req, res)=>{
    User.findAll().then(users=>{
        res.render("admin/users/index", {users: users})
    })

})

router.get("/admin/user/create", adminAuth, (req, res)=>{
    res.render("admin/users/create")
})

router.post("/user/create", adminAuth, (req, res)=>{
    var password = req.body.password
    var email = req.body.email
    User.findOne({
        where:{email:email}
    }).then(user =>{
        if(user == undefined){
            var salt = bcrpt.genSaltSync(10)
            var hash = bcrpt.hashSync(password, salt)

            User.create({
                email: email,
                password: hash
            }).then(()=>{
                res.redirect("/admin/users")
            })
        }else{
            res.redirect("/admin/users")
            
        }
    })
    
})

router.post("/admin/user/delete", adminAuth, (req, res)=>{
    var id = req.body.id
    User.destroy({
        where:{id:id},
        limit: 1
    }).then(()=>{
        res.redirect("/admin/users")
    }).catch((erro)=>{
        res.send(erro)
    })

})

router.get("/admin/user/edit/:id", adminAuth, (req, res)=>{
    var id = req.params.id
    User.findByPk(id).then(user =>{
        if(user != undefined){
            res.render("admin/users/edit", {user: user})
        }else{
            res.render("/admin/users")
        }
    })
})

router.post("/users/update", adminAuth, (req, res)=>{
    var id = req.body.id
    var email = req.body.email
    var newPassword = req.body.newPassword
    
    User.findOne({
        where: {email: email}
    }).then(user=>{
        if(user == undefined || user.id == id ){
            var salt = bcrpt.genSaltSync(10)
            var hash = bcrpt.hashSync(newPassword, salt)
            User.update(
                {email: email,
                password: hash},
                {where: {id : id}
            }).then(()=>{
                res.redirect("/admin/users")
            })
        }else{
            res.redirect("/admin/user/edit/"+id)
        }
    })
})

router.get("/login", (req, res)=>{
    res.render("admin/users/login")
})

router.post("/authenticate", (req, res)=>{
    var email = req.body.email
    var password = req.body.password

    User.findOne({
        where:{email: email}
    }).then(user=>{
        if(user != undefined){
            var correct = bcrypt.compareSync(password, user.password)
            if (correct){
                req.session.user = {
                    id: user.id,
                    email: user.email 
                }
                res.redirect("/")
            }else{
                res.redirect("/login")}
        }else{
            res.redirect("/login")}
    })
})

router.get("/logout",(req, res)=>{
    req.session.user = undefined;
    res.redirect("/")
})


module.exports = router;