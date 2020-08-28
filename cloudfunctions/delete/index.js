// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database();
  const todoListDb = db.collection('todoList');
  const _ = db.command;
  todoListDb.where({
    _id: _.in(event.idList)
  }).remove()
  return {}
}