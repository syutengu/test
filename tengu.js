const div = document.createElement('div')
div.innerText = 'hello world'
document.body.append(div)

const SVGTAGS = 'svg,foreignObject,href,circle,rect,g,defs,line,path,polygon,polyline,text,use,symbol,textPath,tspan,image,strokeWidth,fontFamily'.split(',')


//通过路径字符串获取对象深层属性 get property by path
Object.prototype.p = function (path) {
  return (path + '').split('.').reduce((pre, cur) => pre?.[cur], this)
}

/**创建并渲染dom对象
 * @param {HTMLElement} parent 父节点
 * @param {String} type 节点类型名称
 * @param {String} className 空格分隔的类名
 * @param {String} content 内容(HTML,element,text)
 * @param {Object} options 参数设定
 * @return {HTMLElement} 返回创建的dom
 */
function renderElement(parent, type, className, content, options) {
  if (!type) return
  const el = SVGTAGS.includes(type) ? document.createElementNS("http://www.w3.org/2000/svg", type) : document.createElement(type)
  if (className) SVGTAGS.includes(type) ? className.trim().split(' ').map(e => el.classList.add(e)) : el.className = className
  if (content) content instanceof HTMLElement ? el.append(content) : el.innerHTML = content ?? ''
  options?.prepend ? parent?.prepend(el) : parent?.append(el)
  delete options?.prepend
  return el
}

class Dom {
  /**basic.js定义的Dom对象
   * @param {Dom | HTMLElement} parentDom parent Dom or HTMLElement
   * @param {String} type html element type lowercase
   * @param {String} pathName e.g.'siwake.price' -> parent.siwake.price
   * @param {String} className 空格分隔的类名
   * @param  {Object} options 参数设定
   * @return {Dom} 返回创建的Dom实体
   */
  constructor(parentDom, type, pathName, className, options) {
    this._par = parentDom
    this._nam = pathName === undefined ? undefined : pathName + ''
    this._typ = type
    this._dom = undefined
    this._sta = {}
    this._prp = {}
    if (arguments.length > 0) {
      if (parentDom === window && !window._dom) window._dom = document.body
      //创建之前首先删除目的地父元素下同名子Dom（如果存在）
      if (this._par?.p(pathName) instanceof Dom) this._par.p(pathName).removeSelf()
      this._dom = renderElement((parentDom instanceof HTMLElement ? parentDom : parentDom?._dom), type, className, undefined, options)
      this.state = options
      this._dom._obj = this
    }
    if (parentDom && pathName !== undefined) {
      const p = this._nam ? this._nam.toString().split('.') : []
      p.reduce((pre, cur, idx) => {
        if (idx === p.length - 1) {
          pre[cur] = this
        }
        else if (!pre[cur]) pre[cur] = {}
        return pre[cur]
      }, parentDom)
    }
  }
  get parent() {
    return this._par
  }
  get propPath() {
    let p = this._nam
    return this._par ? p = (this._par.path ?? 'window') + '.' + p : p
  }
  get prop() {
    return this._prp
  }
  set prop(newProp) {
    this._prp = { ...this._prp, ...newProp }
  }
  get state() {
    return this._sta
  }
  set state(newState) {
    if (newState === undefined) return
    delete newState.prepend//已在创建dom时处理，无需保存在state中
    this._sta = { ...this._sta, ...newState }
    if (typeof newState !== 'object') return
    Object.keys(newState).map(k => {
      //排序 false for asc, true for desc
      if (k === 'sort') newState[k] === undefined ? this.rmvClass('asc,desc') : newState[k] ? this.rmvClass('asc').addClass('desc') : this.rmvClass('desc').addClass('asc')
      //INPUT的type
      else if (k === 'type' && this._typ === 'input') this._dom.type = newState[k]
      //LABEL的for属性
      else if (k === 'for' && this._typ === 'label') this._dom.setAttribute(k, newState[k])
      //特殊类名如selected,changed等
      else if ('changed,selected,actived,active,hovered,matched,disable,icon,hidden,error,numeric,new'.split(',').includes(k)) {
        this._typ === 'dropdown' && this._ttl ? this._ttl.toggleClass(k, !!newState[k]) : this.toggleClass(k, !!newState[k])
      }
      //类名重置
      else if (k === 'class' && arraize(newState[k]).length > 0) this._dom.className = arraize(newState[k]).join(' ')
      //文本
      else if (k === 'text') this._dom.textContent = newState[k]
      //CSS样式
      else if (k === 'style' && typeof newState[k] === 'object') {
        Object.keys(newState[k]).map(kk => {
          this._dom.style[kk] = newState[k][kk]
        })
        delete this._sta.style //无需保存
      }
      //特殊HTML属性
      else if ('value,title,tabIndex,placeholder,disabled,draggable,contentEditable'.split(',').includes(k)) this._dom[k] = newState[k]
      else if (k in this._dom) this._dom.setAttribute(k, newState[k])
      //svg元素必须使用setAttribute方法，否则报错
      else if (SVGTAGS.includes(this._typ)) this._dom.setAttribute(styleHyphenFormat(k), newState[k])
      //自动聚焦与自动选中
      else if ('autoselect,autofocus'.split(',').includes(k)) {
        // 自动选中内容
        if (k === 'autoselect' && this._typ === 'div') {
          console.log(`绑定autoselect,autofocus事件`)
          this._dom.addEventListener('focus', () => {
            var sel, range
            if (window.getSelection && document.createRange) {
              range = document.createRange()
              range.selectNodeContents(this._dom)
              sel = window.getSelection()
              sel.removeAllRanges()
              sel.addRange(range)
            } else if (document.body.createTextRange) {
              range = document.body.createTextRange()
              range.moveToElementText(this._dom)
              range.select()
            }
          })
        }
      }
      //其他均写入dataset
      else if (typeof newState[k] !== 'object') this._dom.dataset[k] = newState[k]
    })
  }
  //返回transform.matrix值字符串
  get matrixString() {
    return window.getComputedStyle(this._dom).transform
  }
  get matrix() {
    const transform = window.getComputedStyle(this._dom).transform
    return new DOMMatrixReadOnly(transform)
  }
  set matrix(args) {
    const matrix = args instanceof DOMMatrixReadOnly ? args : new DOMMatrixReadOnly(args)
    // return this.css('transform', `matrix(${matrix.m11},${matrix.m12},${matrix.m21},${matrix.m22},${matrix.m41},${matrix.m42})`) //or a,b,c,d,e,f is same
    return this.css('transform', `${matrix}`)
  }
  get rect() {
    return this._dom.getBoundingClientRect()
  }
  //获取矩形中心点XY
  get rectCenter() {
    const rect = this.rect
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    }
  }
  option(options) {
    this.state = options
    return this
  }
  /**快捷创建子Dom create child Dom
   * @param {String} type dom类型
   * @param {String} pathName 路径名称
   * @param {String} className 空格分隔的类名
   * @param {Function} callback 回调函数
   * @param  {Object} options 参数
   * @returns {Dom} 返回创建的Dom实体
   */
  make(type, pathName, className, callback, options) {
    if (type === 'textarea') return new Input(this, type, pathName, className, callback, options)
    if (type === 'ipt') return new Input(this, 'text', pathName, className, callback, options)
    if (type === 'btn') return new Btn(this, pathName, className, callback, options)
    if (type === 'dropdown') return new DropDown(this, pathName, options)
    if (type === 'sw') return new Switch(this, pathName, className, callback, options)
    return new Dom(this, type, pathName, className, options)
  }
  set className(v) {
    this._dom.className = v
    return this
  }
  append(element, prepend) {
    const isDom = element instanceof Dom
    if (isDom) {
      if (element._nam) {//先删除旧的同名Dom
        if (this[element._nam] instanceof Dom) this[element._nam].removeSelf()
        this[element._nam] = element
      }
      element._par = this
      prepend ? this._dom.prepend(element._dom) : this._dom.append(element._dom)
    }
    else prepend ? this._dom.prepend(element) : this._dom.append(element)
  }
  prepend(element) {
    this.append(element, true)
  }
  addClass(classes) {
    const c = arraize(classes)
    c.map(e => this._dom.classList.add(e))
    return this
  }
  rmvClass(classes) {
    const c = arraize(classes)
    c.map(e => this._dom.classList.remove(e))
    return this
  }
  toggleClass(classes, isAddClass = undefined) {
    const c = arraize(classes)
    c.map(e => this._dom.classList.toggle(e, isAddClass))
    return this
  }
  blink(duration, callback) {
    blink(this._dom, duration, callback)
    return this
  }
  attr(key, val) {
    //有键无值
    if (typeof key === 'string' && val === undefined) return this._dom.getAttribute(key)
    //有键有值
    if (typeof key === 'string') this._dom.setAttribute(key, val)
    //键为对象
    else if (typeof key === 'object') Object.keys(key).map(k => this._dom[k] = key[k])
    return this
  }
  rmvAttr(k) {
    this._dom.removeAttribute(k)
    return this
  }
  css(k, v) {
    //only one arg k
    if (arguments.length === 1) {
      // get style value
      if (typeof k === 'string') { return this._dom.style[k] }
      else if (typeof k === 'object') {
        this.state = { style: { ...this.state?.style, ...k } }
        return this
      }
      else return console.log(`Err:check ${k},${v}`)
    }
    //args is {key,value}
    else if (v && (typeof v === 'string' || typeof v === 'number')) {
      this.state = { style: { ...this.state?.style, ...{ [k]: v } } }
      return this
    }
    return this
  }
  text(v) {
    if (v === undefined) return this._dom.textContent
    this.state = { text: v }
    return this
  }
  isEmpty() {
    return this._dom.innerHTML === ''
  }
  //清空子元素(同时删除所有非特殊子Dom与this的属性绑定)
  empty() {
    this._dom.innerHTML = ''
    //删除this[子Dom]
    Object.keys(this).map(k => {
      if (!k.startsWith('_') && this[k] instanceof Dom) delete this[k]
    })
    return this
  }
  //删除自身
  removeSelf() {
    delete this._par?.[this._nam]
    this._dom.remove()
  }
  enable(enable = undefined) {
    if (enable === undefined) {
      if ('INPUT,TEXTAREA'.split(',').includes(this._dom.tagName)) this.rmvAttr('disabled')
      else this.state = { disable: false }
    }
    else {
      if ('INPUT,TEXTAREA'.split(',').includes(this._dom.tagName)) enable ? this.attr('disabled', true) : this.rmvAttr('disabled')
      else this.state = { disable: !enable }
    }
    return this
  }
  disable() {
    if ('INPUT,TEXTAREA'.split(',').includes(this._dom.tagName)) this.attr('disabled', true)
    else this.state = { disable: true }
    return this
  }
  click() {
    this._dom.click()
    return this
  }
  on(eventName, handler) {
    this._dom['on' + eventName] = handler
    return this
  }
  addEventListener(type, listener, options) {
    this._dom.addEventListener(type, listener, options)
  }
  removeEventListener(type, listener, options) {
    this._dom.removeEventListener(type, listener, options)
  }
  contains(dom) {
    return this._dom.contains(dom)
  }
  has(selector) {
    return this._dom.querySelectorAll(selector).length > 0
  }
  children(selector) {
    return [...this._dom.querySelectorAll(selector)].map(e => e._obj)
  }
  select(selector, className = 'selected') {
    if (!selector) return this.state = { [className]: true }
    return [...this.children(selector)].map(e => e.state = { [className]: true })
    // return this
  }
  unselect(selector, className = 'selected') {
    if (!selector) this.state = { [className]: false }
    else[...this.children(selector)].map(e => e.state = { [className]: false })
    return this
  }
  /**通过标签名或类名切换选择子元素
   * @param {String} type 'tag' or 'class' 使用标签还是类
   * @param {String} name 标签名或类名（小写）
   * @param {Function} callbackSelected 选中时的回调函数（传入参数为选中的Dom）
   * @param {Function} callbackUnselected 取消选中时的回调函数（传入参数为取消选中的Dom）
   * @param {Object} options 参数设定
   * single : true/[false] 仅可单选
   * @return {Array | Dom | undefined} 返回处于选中状态/取消选中状态的Dom数组。options.single为真时返回被点击的Dom单体或undefined
   */
  selectChildrenBy(type = 'tag', name, callbackSelected, callbackUnselected, options) {
    const single = options?.single
    //选中的Doms
    let selected = []
    if (this._dom.tabIndex === -1) this._dom.tabIndex = '0'//为绑定keydown事件
    //容器绑定鼠标click事件
    this._dom.addEventListener('click', evt => {
      const all = type === 'tag' ? [...this._dom.getElementsByTagName(name)] : [...this._dom.getElementsByClassName(name)]
      const clicked = find(evt.target)
      //如果没有对象被点中 则清楚全部已选
      if (clicked === undefined) selected = []
      //如果是仅可单选 则只选中clicked
      else if (single) selected = [clicked]
      //如果原来没有被选中对象 则只选中clicked
      else if (selected.length === 0) selected = [clicked]
      //如果不是仅可单选 而且 !SHIFT键 而且 !CTRL键 则只选中clicked
      else if (!evt.ctrlKey && !evt.shiftKey) selected = [clicked]
      //如果不是仅可单选 而且 CTRL键 而且 !SHIFT键 则添加选择范围
      else if (evt.ctrlKey && !evt.shiftKey) selected = [...new Set([...selected, clicked])]
      //如果不是仅可单选 而且 SHIFT键 扩大缩小选择范围
      else {
        //获取索引值
        const last = all.indexOf(selected[selected.length - 1])
        const idx = all.indexOf(clicked)
        //包含被点击对象与原数组尾项之间的所有项 作为添加组
        const add = idx > last ? all.filter((e, i) => i >= last && i <= idx) : all.filter((e, i) => i >= idx && i <= last)
        //如果CTRL键 则求原数组与添加组的去重并集 否则直接将添加组作为选中对象
        selected = evt.ctrlKey ? [...new Set([...selected, ...add])] : add
      }
      //更新所有对象选中状态
      all.map(e => e._obj.state = { selected: selected.includes(e) })
      //返回内容
      const res = single ? clicked?._obj : selected.map(e => e._obj)
      //容器绑定键盘keydown escape事件 取消选中
      this.on('keydown', evt => {
        if (evt.key !== 'Escape') return
        evt.preventDefault()
        selected.map(e => e._obj.unselect())
        selected = []
        callbackUnselected?.(res)
      })
      callbackSelected?.(res)
    }, false)
    //递归向上寻找最接近被点击对象的符合条件元素(直到evt.target === this._dom)
    var find = el => {
      if (type === 'tag' ? el.tagName === name.toUpperCase() : el.classList.contains(name)) return el
      else if (el === this._dom) return
      else return find(el.parentNode)
    }
  }
  //通过选框拖拽框选对象子Dom
  dragSelect(targetElements, callbackAfterSelect, options) {
    dragSelect(this, targetElements, callbackAfterSelect, options)
  }
  // 获取第一个选中的子元素
  get firstSelected() {
    return this._dom.querySelector('.selected')?._obj
  }
  is(selector) {
    return this._dom.matches(selector)
  }
  blur() {
    this._dom.blur()
    return this
  }
  focus() {
    this._dom.focus()
    return this
  }
  prev() {
    return this._dom.previousSibling?._obj
  }
  next() {
    return this._dom.nextSibling?._obj
  }
  first(selector) {
    if (selector === undefined) return this._dom.firstChild._obj
    return this._dom.querySelectorAll(selector)[0]?._obj
  }
  last(selector) {
    if (selector === undefined) return this._dom.lastChild._obj
    return this._dom.querySelector(`${selector}:last-child`)?._obj
  }
  draggable() {
    this._dom.draggable = 'true'
  }
  editable(enterCallback) {
    this._dom.contentEditable = true
    this._dom.addEventListener('keydown', event => {
      if (event.key !== 'Enter') return
      this._dom.blur()
      return enterCallback?.(this._dom.textContent)
    })
    return this
  }
  html(v) {
    if (v === undefined) return this._dom.innerHTML
    this._dom.innerHTML = v
    return this
  }
  scrollIntoView(options) {
    this._dom.scrollIntoView(options)
    return this
  }
  scroll(x, y) {
    this._dom.scroll(x, y)
    return this
  }
  hide() {
    this.state = { hidden: true }
    return this
  }
  show() {
    this.state = { hidden: false }
    return this
  }
  //显示提示文本
  tooltip(content, mouseenterCallback, time = 800, x = 5, y = -5) {
    let box, toin, toout
    this.addEventListener('mouseenter', () => {
      clearTimeout(toout)
      const { bottom, left } = this.rect
      box = box ?? new Dom(window, 'span', 'tooltiptext', 'tooltiptext hidden', {
        style: { left: left + x + 'px', top: bottom + y + 'px' }
      })
      box.html(content)
      toin = setTimeout(() => box.show(), time)
      mouseenterCallback?.apply()
    })
    this.addEventListener('mouseleave', () => {
      box?.hide()
      clearTimeout(toin)
      toout = setTimeout(() => {
        box?.removeSelf()
        box = undefined
      }, 500)
    })
    return this
  }
  hover(hover = true) {
    this.state = { hovered: hover }
    return this
  }
  /**复制克隆Dom
   * @param {Object} options 参数设定
   * keepOld:true/[false] 如有同名旧Dom，保留
   * @returns {Dom} 克隆体Dom
   */
  clone(options) {
    const name = `${this._nam}${options?.keepOld ? '_' : ''}`
    const clone = new Dom(undefined, this._typ, name)
    //是否需要深度克隆deepclone：对象下不存在非下划线开头的属性 且 dom子元素数量大于0
    const deep = Object.keys(this).filter(e => !e.startsWith('_')).length === 0 && this._dom.childElementCount > 0
    // if (deep) console.log(this._nam, this._dom.children)
    clone._dom = this._dom.cloneNode(deep)
    clone._dom._obj = clone
    clone.state = this.state
    Object.keys(this).filter(k => !k.startsWith('_') && this[k] instanceof Dom).map(k => {
      clone.append(this[k].clone())
    })
    return clone
  }
  contextmenu(callback) {
    this.on('contextmenu', evt => {
      evt.preventDefault()
      callback?.(evt, new RightMenu(evt.x, evt.y))
    })
  }
}

alert(this)

this.make = (type, pathName, className, options) => {
    return new Dom(this, type, pathName, className, options)
}
