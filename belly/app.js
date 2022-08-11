const express = require("express");
const models = require("./models");


const app = express();
app.use(express.json());  //server open



models.sequelize    //db연결
  .sync()
  .then(() => {
    console.log(" DB 연결 성공");
  })
  .catch((err) => {
    console.log("연결 실패");
    console.log(err);
  });

module.exports = app;