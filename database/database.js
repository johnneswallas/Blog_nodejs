const Sequelize = require("sequelize")

const connection = new Sequelize('blog', 'root', '1234567',{
    host: "127.0.0.1",
    dialect: "mysql",
    timezone: "-03:00",
    logging: false
})

module.exports = connection