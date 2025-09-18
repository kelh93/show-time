// 虚拟列表实现逻辑
// 1. 
class VitrualList {
  constructor(containerEl, listEl) {
    this.state = {
      data: [], // 数据源
      itemHeight: 100, // 每个item的高度
      viewHeight: 0, // 最外层container的高度
      maxCount: 0, // 虚拟列表视图的最大展示个数
    }
    this.scrollStyle = {} // list 动态样式(滚动、偏移)
    this.prevIndex = -1; // 上一次视图列表在数据源中的起始索引
    this.startIndex = 0; // 当前视图列表在数据源中的起始索引
    this.endIndex = 0; // 当前视图列表在数据源中的结束索引
    this.renderList = []; // 当前视图列表的渲染数据

    this.containerDom = document.querySelector(containerEl);
    this.listDom = document.querySelector(listEl);
  }
  init(){
    this.state.viewHeight = this.containerDom.offsetHeight;
    // 最大显示个数: 容器高度/单个子项的高度,
    this.state.maxCount = Math.ceil(this.state.viewHeight / this.state.itemHeight) + 1;
    this.bindeEvent()
    this.addData()
    this.render()
  }
  cacluateEndIndex(){
    const end = this.startIndex + this.state.maxCount
    this.endIndex = this.state.data[end] ? end : this.state.data.length;
    // 滚动加载更多
    if(this.endIndex >= this.state.data.length){
      this.addData()
    }
  }
  getRenderList(){
    // 需要渲染到页面中的数据源片段
    this.renderList = this.state.data.slice(this.startIndex, this.endIndex);
  }
  setScrollStyle(){
    const { data, itemHeight } = this.state
    this.scrollStyle = {
      height: `${data.length * itemHeight - this.startIndex * itemHeight}px`, // 所有源数据占据的高度 - 已经滚动后的单元格高度
      transform: `translate3d(0, ${this.startIndex * itemHeight}px, 0)`
    }
    return this.scrollStyle
  }
  render(){
    this.cacluateEndIndex()
    // 设置视图数据源
    this.getRenderList()
    // map后，将数组转成字符串
    const template = this.renderList.map(item => `<div class="fs-virtual-list-item">${item}</div>`).join('')
    const { height, transform } = this.setScrollStyle()
    this.listDom.innerHTML = template
    this.listDom.style.height = height
    this.listDom.style.transform = transform
  }
  bindeEvent(){
    this.containerDom.addEventListener('scroll', this.rafThrottle(this.handleScroll.bind(this)))
  }
  handleScroll(){
    const { scrollTop } = this.containerDom
    // 滚动过的高度/单元格高度=已经滚动过的个数
    this.startIndex = Math.ceil(scrollTop / this.state.itemHeight)
    if(this.startIndex !== this.prevIndex){
      this.render()
    }
    this.prevIndex = this.startIndex
  }
  addData(){
    for (let i = 0; i < 10; i++) {
      this.state.data.push(this.state.data.length + 1)
    }
  }
  // 滚动事件节流
  rafThrottle(fn){
    let lock = false
    return function(...args){
      window.requestAnimationFrame(() => {
        if(lock) return
        lock = true
        fn.apply(this, args)
        lock = false
      })
    }
  }
}