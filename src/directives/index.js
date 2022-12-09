// 全局指令 v-xxx
/*
 *  给elementUI的dialog上加上 v-dialogDrag 指令就能够实现弹窗的全屏和拉伸了。
 */
// v-dialogDrag: 弹窗拖拽+水平方向伸缩
import Vue from 'vue'

Vue.directive('dialogDrag', {
  bind(el, binding, vnode, oldVnode) {
    // 弹框可拉伸最小宽高
    const minWidth = 400
    const minHeight = 300
    // 初始非全屏
    let isFullScreen = false
    // 当前宽高
    let nowWidth = 0
    let nowHight = 0
    console.log(nowHight)
    // 当前顶部高度
    let nowMarginTop = 0
    // 获取弹框头部（这部分可双击全屏）
    const dialogHeaderEl = el.querySelector('.el-dialog__header')
    // 弹窗
    const dragDom = el.querySelector('.el-dialog')
    // 给弹窗加上overflow auto；否则缩小时框内的标签可能超出dialog；
    dragDom.style.overflow = 'auto'
    // 清除选择头部文字效果
    dialogHeaderEl.onselectstart = new Function('return false')
    // 头部加上可拖动cursor
    dialogHeaderEl.style.cursor = 'move'

    // 获取原有属性 ie dom元素.currentStyle 火狐谷歌 window.getComputedStyle(dom元素, null);
    const sty = dragDom.currentStyle || window.getComputedStyle(dragDom, null)

    const moveDown = (e) => {
      // 鼠标按下，计算当前元素距离可视区的距离
      const disX = e.clientX - dialogHeaderEl.offsetLeft
      const disY = e.clientY - dialogHeaderEl.offsetTop

      // 获取到的值带px 正则匹配替换
      let styL, styT

      // 注意在ie中 第一次获取到的值为组件自带50% 移动以后赋值为px
      if (sty.left.includes('%')) {
        styL = +document.body.clientWidth * (+sty.left.replace(/\%/g, '') / 100)
        styT = +document.body.clientHeight * (+sty.top.replace(/\%/g, '') / 100)
      } else {
        styL = +sty.left.replace(/\px/g, '')
        styT = +sty.top.replace(/\px/g, '')
      }

      document.onmousemove = function(e) {
        // 经过事件委托，计算移动的距离
        const l = e.clientX - disX
        const t = e.clientY - disY

        // 移动当前元素
        dragDom.style.left = `${l + styL}px`
        dragDom.style.top = `${t + styT}px`

        // 将此时的位置传出去
        // binding.value({x:e.pageX,y:e.pageY})
      }

      document.onmouseup = function(e) {
        // =======
        const dragDom = el.querySelector('.el-dialog')
        const offsetLeft = dragDom.offsetLeft
        const offsetTop = dragDom.offsetTop
        const left = Number(dragDom.style.left.replace('px', ''))
        const top = Number(dragDom.style.top.replace('px', ''))
        const windowWidth = window.innerWidth
        const windowHeight = window.innerHeight
        // const windowHeight = window.innerHeight - 50
        const offsetRight = offsetLeft + dragDom.offsetWidth - windowWidth
        const offsetBottom = offsetTop + dragDom.offsetHeight - windowHeight
        if (offsetLeft < 0) {
          dragDom.style.left = (left - offsetLeft) + 'px'
        }
        if (offsetTop < 0) {
          dragDom.style.top = (top - offsetTop) + 'px'
        }
        if (offsetRight > 0) {
          dragDom.style.left = (left - offsetRight) + 'px'
        }
        if (offsetBottom > 0) {
          dragDom.style.top = (top - offsetBottom) + 'px'
        }
        // =======
        document.onmousemove = null
        document.onmouseup = null
      }
    }
    dialogHeaderEl.onmousedown = moveDown
    // 双击头部效果
    dialogHeaderEl.ondblclick = (e) => {
      if (isFullScreen === false) {
        nowWidth = dragDom.clientWidth
        nowHight = dragDom.clientHeight
        nowMarginTop = dragDom.style.marginTop
        dragDom.style.left = 0
        dragDom.style.top = 0
        dragDom.style.height = '100VH'
        dragDom.style.width = '100VW'
        dragDom.style.marginTop = 0
        isFullScreen = true
        dialogHeaderEl.style.cursor = 'initial'
        dialogHeaderEl.onmousedown = null
      } else {
        dragDom.style.height = 'auto'
        dragDom.style.width = nowWidth + 'px'
        dragDom.style.marginTop = nowMarginTop
        isFullScreen = false
        dialogHeaderEl.style.cursor = 'move'
        dialogHeaderEl.onmousedown = moveDown
      }
    }

    // 拉伸(右下方)
    const resizeEl = document.createElement('div')
    dragDom.appendChild(resizeEl)
    // 在弹窗右下角加上一个10-10px的控制块
    resizeEl.style.cursor = 'se-resize'
    resizeEl.style.position = 'absolute'
    resizeEl.style.height = '10px'
    resizeEl.style.width = '10px'
    resizeEl.style.right = '0px'
    resizeEl.style.bottom = '0px'
    resizeEl.style.zIndex = '99'
    // 鼠标拉伸弹窗
    resizeEl.onmousedown = (e) => {
      // 记录初始x位置
      const clientX = e.clientX
      // 鼠标按下，计算当前元素距离可视区的距离
      const disX = e.clientX - resizeEl.offsetLeft
      const disY = e.clientY - resizeEl.offsetTop

      document.onmousemove = function(e) {
        e.preventDefault() // 移动时禁用默认事件

        // 经过事件委托，计算移动的距离
        const x = e.clientX - disX + (e.clientX - clientX)// 这里 因为elementUI的dialog控制居中的，因此水平拉伸效果是双倍
        const y = e.clientY - disY
        // 比较是否小于最小宽高
        dragDom.style.width = x > minWidth ? `${x}px` : minWidth + 'px'
        dragDom.style.height = y > minHeight ? `${y}px` : minHeight + 'px'
      }
      // 拉伸结束
      document.onmouseup = function(e) {
        document.onmousemove = null
        document.onmouseup = null
      }
    }

    // 拉伸(右边)
    const resizeElR = document.createElement('div')
    dragDom.appendChild(resizeElR)
    // 在弹窗右下角加上一个10-10px的控制块
    resizeElR.style.cursor = 'w-resize'
    resizeElR.style.position = 'absolute'
    resizeElR.style.height = '100%'
    resizeElR.style.width = '10px'
    resizeElR.style.right = '0px'
    resizeElR.style.top = '0px'
    // 鼠标拉伸弹窗
    resizeElR.onmousedown = (e) => {
      const elW = dragDom.clientWidth
      const EloffsetLeft = dragDom.offsetLeft
      // 记录初始x位置
      const clientX = e.clientX
      document.onmousemove = function(e) {
        e.preventDefault() // 移动时禁用默认事件
        // 右侧鼠标拖拽位置
        if (clientX > EloffsetLeft + elW - 10 && clientX < EloffsetLeft + elW) {
          // 往左拖拽
          if (clientX > e.clientX) {
            if (dragDom.clientWidth < minWidth) {
              console.log(11)
            } else {
              dragDom.style.width = elW - (clientX - e.clientX) * 2 + 'px'
            }
          }
          // 往右拖拽
          if (clientX < e.clientX) {
            dragDom.style.width = elW + (e.clientX - clientX) * 2 + 'px'
          }
        }
      }
      // 拉伸结束
      document.onmouseup = function(e) {
        document.onmousemove = null
        document.onmouseup = null
      }
    }

    // 拉伸(左边)
    const resizeElL = document.createElement('div')
    dragDom.appendChild(resizeElL)
    // 在弹窗右下角加上一个10-10px的控制块
    resizeElL.style.cursor = 'w-resize'
    resizeElL.style.position = 'absolute'
    resizeElL.style.height = '100%'
    resizeElL.style.width = '10px'
    resizeElL.style.left = '0px'
    resizeElL.style.top = '0px'
    // 鼠标拉伸弹窗
    resizeElL.onmousedown = (e) => {
      const elW = dragDom.clientWidth
      const EloffsetLeft = dragDom.offsetLeft
      // 记录初始x位置
      const clientX = e.clientX
      document.onmousemove = function(e) {
        e.preventDefault() // 移动时禁用默认事件
        // 左侧鼠标拖拽位置
        if (clientX > EloffsetLeft && clientX < EloffsetLeft + 10) {
          // 往左拖拽
          if (clientX > e.clientX) {
            dragDom.style.width = elW + (clientX - e.clientX) * 2 + 'px'
          }
          // 往右拖拽
          if (clientX < e.clientX) {
            if (dragDom.clientWidth < minWidth) {
              console.log(22)
            } else {
              dragDom.style.width = elW - (e.clientX - clientX) * 2 + 'px'
            }
          }
        }
      }
      // 拉伸结束
      document.onmouseup = function(e) {
        document.onmousemove = null
        document.onmouseup = null
      }
    }

    // 拉伸(下边)
    const resizeElB = document.createElement('div')
    dragDom.appendChild(resizeElB)
    // 在弹窗右下角加上一个10-10px的控制块
    resizeElB.style.cursor = 'n-resize'
    resizeElB.style.position = 'absolute'
    resizeElB.style.height = '10px'
    resizeElB.style.width = '100%'
    resizeElB.style.left = '0px'
    resizeElB.style.bottom = '0px'
    // 鼠标拉伸弹窗
    resizeElB.onmousedown = (e) => {
      const EloffsetTop = dragDom.offsetTop
      const ELscrollTop = el.scrollTop
      const clientY = e.clientY
      const elH = dragDom.clientHeight
      document.onmousemove = function(e) {
        e.preventDefault() // 移动时禁用默认事件
        // 底部鼠标拖拽位置
        if (ELscrollTop + clientY > EloffsetTop + elH - 20 && ELscrollTop + clientY < EloffsetTop + elH) {
          // 往上拖拽
          if (clientY > e.clientY) {
            if (dragDom.clientHeight < minHeight) {
              console.log(33)
            } else {
              dragDom.style.height = elH - (clientY - e.clientY) * 2 + 'px'
            }
          }
          // 往下拖拽
          if (clientY < e.clientY) {
            dragDom.style.height = elH + (e.clientY - clientY) * 2 + 'px'
          }
        }
      }
      // 拉伸结束
      document.onmouseup = function(e) {
        document.onmousemove = null
        document.onmouseup = null
      }
    }
  }
})

