// miniprogram/pages/index/index.js
const db = wx.cloud.database();
const todoListDb = db.collection('todoList');
const _ = db.command;
let userId
let startX = 0;
let endX = 0;
let disX = 0
let moveFlag = true; //可实施滑动事件
Page({
  /**
   * 页面的初始数据
   */
  data: {
    iptVal: '',
    todoList: [],
    // 控制新建事项输入框的显隐
    isHidden: true,
    // moreChangeList: [],
  },

  // 获取输入框内数据
  getIptVal(e) {
    this.data.iptVal = e.detail.value;
  },

  // 点击添加图标显示输入框
  imgAdd() {
    this.setData({
      isHidden: !this.data.isHidden
    })
  },

  // 添加数据（点击输入框右侧的添加按钮 将数据添加到数据库中）
  add() {
    todoListDb.add({
      data: {
        title: this.data.iptVal,
        isToDo: true,
        isDone: false,
        right: 0
      },
    }).then(res => {
      // 显示list
      this.showToDoList();
      // 清空输入框并隐藏
      this.setData({
        iptVal: '',
        isHidden: true
      })
    })
  },
  // 显示页面 刷新todoList
  showToDoList() {
    todoListDb.where({
        isToDo: true,
        _openid: userId,
        // isDone: false,
      }).get()
      .then(res => {
        this.setData({
          todoList: res.data,
        })
      }).catch(err => {
        console.log(err);
      })
  },

  // 切换完成/未完成
  changeIsDone(e) {
    let tempIsDone
    todoListDb.doc(e.currentTarget.dataset.id).get()
      .then(res => {
        tempIsDone = res.data.isDone;
        // console.log(tempIsDone);
      })

    // 遇到问题：无法更新数据库的数据 解决： 设置数据库权限为全体可读
    todoListDb.doc(e.currentTarget.dataset.id).update({
      data: {
        isDone: !tempIsDone,
      },
      success: function (res) {
        // console.log(res)
        this.showToDoList()
      }

    })
  },

  // 左滑显示删除键 
  myTouchStart(e) {
    startX = e.touches[0].pageX;
    // console.log(e);
    moveFlag = true;
  },
  myTouchMove(e) {
    // console.log(e);
    // console.log(this);
    // console.log(e.currentTarget.dataset.index);
    // console.log(e.touches[0].clientX,e.touches[0].pageX);
    let item = this.data.todoList[e.currentTarget.dataset.index]
    endX = e.touches[0].pageX;
    disX = startX - endX
    if (moveFlag) {
      item.right = disX
      this.setData({
        todoList: this.data.todoList
      })
      if (disX > 70) {
        console.log("move left");
        // this.move2left();
        moveFlag = false;
      } else if (disX <= 0) {
        console.log("nono");
        moveFlag = false

      }
    }
  },
  myTouchEnd(e) {
    moveFlag = true;
    let item = this.data.todoList[e.currentTarget.dataset.index]

    if (item.right >= 35) {
      item.right = 70
      this.setData({
        todoList: this.data.todoList,
      })
    } else {
      item.right = 0
      this.setData({
        todoList: this.data.todoList
      })
    }
  },
  // 从数据库中删除
  delete(e) {
    todoListDb.doc(e.currentTarget.dataset.id).remove()
      .then(res => {
        // 显示列表
        console.log(this.data);

        this.showToDoList()
      })
  },

  // 一键显示所有删除键
  // imgDel() {
  //   this.setData({
  //     delIsHidden: !this.data.delIsHidden
  //   })
  // },

  // 批量操作
  // getMoreChange(e) {
  //   // this.data.todoList.forEach(obj => {
  //   //   todoListDb.doc(obj._id).update({
  //   //     data:{
  //   //       isDone: false,
  //   //     }
  //   //   })
  //   // })

  //   e.detail.value.forEach(id => {
  //     todoListDb.doc(id).update({
  //       data:{
  //         isDone: true,
  //       }
  //     })
  //   })
  //   todoListDb.where({

  //   })
  //   todoListDb.where({
  //       isDone: true
  //     }).get()
  //     .then(res => {
  //       console.log(res)
  //       // this.setData({
  //       //   todoList: res.data
  //       // })
  //     })
  //   },

  // 显示已完成（isDone = true)页面
  // showIsDoneList() {
  //   todoListDb.where({
  //       isDone: true,
  //     }).get()
  //     .then(res => {
  //       this.setData({
  //         todoList: res.data,
  //         btnType: "warn",
  //         btnText: "删除",
  //         btnMoreText: "批量删除"
  //       })
  //     })
  // },
  // 点击小按钮完成/删除
  // addIsDone(e) {
  //   // 点击完成  修改该条记录的isDone为true
  //   if (e.target.dataset.type == "primary") {
  //     todoListDb.doc(e.target.dataset.id).update({
  //       data: {
  //         isDone: true,
  //       }
  //     }).then(res => {
  //       // 显示列表
  //       this.showToDoList();
  //     })
  //   } else { //点击删除 删除该条记录
  //     todoListDb.doc(e.target.dataset.id).remove()
  //       .then(res => {
  //         // 显示列表
  //         this.showIsDoneList();
  //       })
  //   }
  // },

  // 点击开关选择器switch 切换显示列表
  // showChangeList(e) {
  //   if (e.detail.value) {
  //     this.showIsDoneList();
  //   } else {
  //     this.showToDoList();
  //   }
  // },

  // 获取需要批量操作的id
  // getMoreChange(e) {
  //   this.data.moreChangeList = e.detail.value;
  // },

  // 批量操作
  // moreChange(e) {
  //   let fnName = e.target.dataset.type == 'primary' ? 'finish' : 'delete';
  //   wx.cloud.callFunction({
  //     name: fnName,
  //     data: {
  //       idList: this.data.moreChangeList,
  //     },
  //     complete: res => {
  //       if (fnName == 'finish') {
  //         this.showToDoList();
  //       } else {
  //         this.showIsDoneList();
  //       }
  //     },
  //   })
  // },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
        wx.cloud.callFunction({
          name: 'getUserid',
          complete: res => {
            userId = res.result.openid;
          }
        })

        // 问题：首次进入时显示出数据库中所有数据 
        // 原因：小程序的代码同步执行 导致未获取到openid时就showList 
        // 解决：设置延时 
        setTimeout(()=>{
          this.showToDoList();
        },2000)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})