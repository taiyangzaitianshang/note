/**使用了两个匿名函数。后面那个函数可以看作是模块代码的工厂函数，它是模块的主体部分。
 * 前面那个函数对运行环境进行检测，根据检测的结果对模块的工厂函数进行调用。
 */
(function (global, factory) {
    /**
     * 定义js模块加载方案，如果有define.amd的话，就在define中定义模块
     * amd是异步的。define调用时会等到依赖木块加载后再做模块实现
     */
    if (typeof define === 'function' && define.amd) {
        /**
         * define接受3参，1参为模块名，2参为依赖模块名(数组)，3参为模块实现(方法或对象)。
         * 1,2可以省略，
         * 3参为方法时可以接受2参中的模块，顺序为数组顺序
         */
        define(function () {
            return factory(global)
        })
    } else {
        factory(global)
    }
}(this, function (window) {
    //定义zepto
    var Zepto = (function () {
        var undefined, key, $, classList, emptyArray = [],
            //获取原生数组方法
            concat = emptyArray.concat, filter = emptyArray.filter, slice = emptyArray.slice,
            document = window.document,
            elementDisplay = {}, classCache = {},
            cssNumber = {
                'column-count': 1,
                'columns': 1,
                'font-weight': 1,
                'line-height': 1,
                'opacity': 1,
                'z-index': 1,
                'zoom': 1
            },//zoom 对象缩放比例
            fragmentRE = /^\s*<(\w+|!)[^>]*>/,  //匹配html标签，开标签，自封闭标签
            singleTagRe = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,//匹配成对的html标签和自封闭标签，开标签不包含属性，开闭标签间没有内容
            tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig, //开闭成对标签的自封闭标签形式，可带属性
            rootNodeRE = /^(?:body|html)$/i,
            capitalRE = /([A-Z])/g,

            methodAttribute = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

            adjacencyOperators = ['after', 'prepend', 'before', 'append'],
            table = document.createElement('table'),
            tableRow = document.createElement('tr'),
            containers = {
                'tr': document.createElement('tbody'),
                'tbody': table, 'thead': table, 'tfoot': table,
                'td': tableRow, 'th': tableRow,
                '*': document.createElement('div')
            },
            readyRE = /complete|loaded|interactive/,
            simpleSelectorRe = /^[\w-]*$/,  //匹配简单的选择器
            class2type = {},
            toString = class2type.toString,
            zepto = {},
            camelize, uniq,
            tempParent = document.createElement('div'),
            propMap = {
                'tabindex': 'tabIndex',
                'readonly': 'readOnly',
                'for': 'htmlFor',
                'class': 'className',
                'maxlength': 'maxLength',
                'cellspacing': 'cellSpacing',
                'cellpadding': 'cellPadding',
                'rowspan': 'rowSpan',
                'colspan': 'colSpan',
                'usemap': 'useMap',
                'frameborder': 'frameBorder',
                'contenteditable': 'contentEditable'
            },
            isArray = Array.isArray || function (object) {
                    return object instanceof Array
                }
        zepto.matches = function (element, selector) {
            //element不是元素节点 1.元素节点 2.属性节点 3.文本节点
            if (!selector || !element || element.nodeType !== 1) {
                return false;
            }
            //matches,js原生，但浏览器兼容有问题
            //webkitMatchesSelector chrome
            //mozMatchesSelector firefox
            //msMatchesSelector IE9+
            var matchesSelector = element.matches || element.webkitMatchesSelector ||
                element.mozMatchesSelector || element.oMatchesSelector ||
                element.matchesSelector
            if (matchesSelector) {
                return matchesSelector.call(element, selector)
            }
            var match, parent = element.parentNode, temp = !parent;
            //parent不存在的话
            if (temp) {
                /**
                 * 先将当前搜索元素加到临时创建的div下，然后在div下搜索selector
                 * 对应的element,之后移除添加的元素
                 */
                (parent = tempParent).appendChild(element)
            }
            //~-1 === 0 qsa querySelectorAll
            match = ~zepto.qsa(parent, selector).indexOf(element);
            temp && tempParent.removeChild(element);
            return match;
        }

        /**
         * class2type = {
                "[object Boolean]": "boolean",
                "[object Number]": "number",
                "[object String]": "string",
                "[object Function]": "function",
                "[object Array]": "array",
                "[object Date]": "date",
                "[object RegExp]": "regexp",
                "[object Object]": "object",
                "[object Error]": "error"
            }
         * 对象原型的toString return [object XXXX]
         */
        function type(obj) {
            return obj == null ? String(obj) :
                class2type[toString.call(obj)] || "object"
        }

        function isFunction(value) {
            return type(value) == 'function'
        }

        function isWindow(obj) {
            return obj != null && obj == obj.window
        }

        function isDocument(obj) {
            return obj != null && obj.nodeType == obj.DOCUMENT_NODE
        }

        function isObject(obj) {
            return type(obj) == 'object'
        }

        //纯粹的object, 就是该对象是通过"{}"或"new Object"创建的。
        //Object.getPrototypeOf获取对象的原型属性
        function isPlainObject(obj) {
            return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
        }

        //要有length属性且不为undefined
        //不能是function和window对象,这两个对象前者length是参数个数，后者是0?
        //type是array或者length为0？或者length>0并且length-1也作为key存在于对象中（限制对象key必须为数字）
        function likeArray(obj) {
            var length = !!obj && 'length' in obj && obj.length
            type = $.type(obj);
            return 'function' != type && !window(obj) && ('array' == type || length === 0
                || (typeof length == 'number' && length > 0 && (length - 1) in obj))
        }

        //去掉数组中item为null的
        function compact(array) {
            return filter.call(array, function (item) {
                return item != null;
            })
        }

        function flatten(array) {
            return array.length > 0 ? $.fn.concat.apply([], array) : array
        }

        //////////////////////////////////////////////////////////////////////////////////

        //把class中的-连接及其单词变成无-驼峰
        //match为匹配到的字符串
        //chr为匹配字符的最小分组索引$1？
        camelize = function (str) {
            return str.replace(/-+(.)?/g, function (match, chr) {
                return chr ? chr.toUpperCase() : ''
            })
        }

        //驼峰转化为连字符，与camelize互补
        function dasherize(str) {
            return str.replace(/::/g, '/')
                .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
                .replace(/([a-z\d])(a-Z)/g, '$1_$2')
                .replace(/_/g, '-')
                .toLowerCase()
        }
        
        uniq = function (array) {
            return filter.call(array, function (item, idx) {
                return array.indexOf(item) == idx
            })
        }
        
        function classRE(name) {
            return name in classCache ? classCache[name] : 
                (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
        }
        
        function maybeAddPx(name, value) {
            return (typeof value == 'number' && !cssNumber[dasherize(name)]) ? value + "px" : value;
        }

        //创建node节点，挂到body下，获取display样式，如果为none，则用block
        function defaultDisplay(nodeName) {
            var element, display;
            if(!elementDisplay[nodeName]){
                element = document.createElement(nodeName);
                document.body.appendChild(element)
                //getComputedStyle第二参为伪类e.g. :brefore
                display = getComputedStyle(element, '').getPropertyValue('display')
                element.parentNode.removeChild(element);
                display == 'none' && (display = 'block');
                elementDisplay[nodeName] = display
            }
            return elementDisplay[nodeName];
        }
        
        function children(element) {
            return 'children' in element ? slice.call(element.children) : 
                $.map(element.childNodes, function (node) {
                    if(node.nodeType == 1){
                        return node;
                    }
                })
        }

        //把dom的length拿到，dom存起来
        function Z(dom, selector) {
            var i, len = dom ? dom.length : 0;
            for(i = 0; i < len; i++){
                this[i] = dom[i];
            }
            this.length = len;
            this.selector = selector || ''
        }


        //获取给定html字符串的dom结构
        zepto.fragment = function (html, name, properties) {
            var dom, nodes, container

            /**
             * RegExp.$n 正则表达式第n个子匹配，相当于带括号的第n个分组
             */
            //html比如说是<div></div>
            //RegExp.$1是开标签中的内容
            if (singleTagRe.test(html)) {
                dom = $(document.createElement(RegExp.$1))
            }
            if (!dom) {
                //对于写成<div />形式的标签的处理
                if (html.replace) {
                    html = html.replace(tagExpanderRE, "<$1></$2>");
                }
                if (name === undefined) {
                    name = fragmentRE.test(html) && RegExp.$1
                }
                if (!(name in containers)) {
                    name = "*";
                    //下面的container将是div
                }

                container = containers[name];
                container.innerHTML = '' + html;
                //此each会返回整个迭代对象
                dom = $.each(slice.call(container.childNodes), function () {
                    //清空container,回归虚无
                    container.removeChild(this);
                });
            }

            if (isPlainObject(properties)) {
                nodes = $(dom);
                $.each(properties, function (key, value) {
                    if (methodAttribute.indexOf(key) > -1) {
                        nodes[key](value)
                    } else {
                        nodes.attr(key, value);
                    }
                })
            }

            return dom;
        }

        zepto.Z = function (dom, selector) {
            return new Z(dom, selector);
        }

        zepto.isZ = function (object) {
            return object instanceof zepto.Z;
        }

        zepto.init = function (selector, context) {
            var dom;
            if (!selector) {
                return zepto.Z();
            } else {
                if (typeof selector == 'string') {
                    selector = selector.trim();
                    if (selector[0] == '<' && fragmentRE.test(selector)) {
                        //dom = zepto.fragment(selector, )
                    }
                }
            }
        }

        $ = function (selector, context) {
            return zepto.init(selector, context);
        }

        function extend(target, source, deep) {
            for (key in source) {
                //只有标记了deep并且源是对象或数组才递归调用extend
                if(deep && (isPlainObject(source[key]) || isArray(source[key]))){
                    if(isPlainObject(source[key]) && !isPlainObject(target[key])){
                        target[key] = {}
                    }
                    if(isArray(source[key]) && !isArray(target[key])){
                        target[key] = [];
                    }
                    extend(target[key], source[key], deep)
                }else{
                    if(source[key] !== undefined) {
                        target[key] = source[key];
                    }
                }
            }
        }

        $.extend = function (target) {
            var deep, args = slice.call(arguments, 1);
            if(typeof target == 'boolean'){
                deep = target;
                target = args.shift();
            }
            args.forEach(function (arg) {
                extend(target, arg, deep)
            })
        }

        zepto.qsa = function (element, selector) {
            var found,
                maybeID = selector[0] == '#',
                maybeClass = !maybeID && selector[0] == '.',
                nameOnly = maybeID || maybeClass ? selector.slice(1) : selector,
                isSimple = simpleSelectorRe.test(nameOnly);//此正则匹配由-连接的文本
            return (element.getElementById && isSimple && maybeID) ?
                //是ID选择器
                ((found = element.getElementById(nameOnly)) ? [found] : []) :
                //9 document 10 document fragment 11也是document 相关的
                (element.nodeType !== 1 && element.nodeType !== 9 && element.type !== 11) ? [] :
                    slice.call(
                        isSimple && !maybeID && element.getElementsByClassName ?
                            //是class选择器
                            maybeClass ? element.getElementsByClassName(nameOnly) :
                                //是标签选择器
                                element.getElementsByTagName(selector) :
                            //直接查询
                            element.querySelectorAll(selector)
                    )
        }

        function filtered(nodes, selector) {
            return selector == null ? $(nodes) : $(nodes).filter(selector)
        }

        $.contains = document.documentElement.contains ?
            //调用现成方法
            function (parent, node) {
                return parent !== node && parent.contains(node)
            } :
            //调用人肉方法，从叶子节点往根节点搜索
            function (parent, node) {
                while (node && (node = node.parentNode)){
                    if(node === parent){
                        return true;
                    }
                }
                return false;
            };

        // function funcArg(context, arg, idx, payload) {
        //     return isFunction(arg) ? arg.call(context, idx, payload) : arg
        // }

        function setAttribute(node, name, value) {
            value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
        }

        function className(node, value){
            var klass = node.className || '', svg = klass && klass.baseVal !== undefined
            if(value === undefined){
                return svg ? klass.baseVal : klass
            }
            svg ? (klass.baseVal = value) : (node.className = value)
        }

        // "true"  => true
        // "false" => false
        // "null"  => null
        // "42"    => 42
        // "42.5"  => 42.5
        // "08"    => "08"
        // JSON    => parse if valid
        // String  => self
        function deserializeValue(value) {
            try {
                return value ? value == "true" || (
                    value == 'false' ? false :
                        value == 'null' ? null : +value + "" == +value ? +value:
                            /^[\[\{]/.test(value) ? $.parseJSON(value) : value) : value
            } catch (e) {
                return value;
            }
        }

        $.type = type;
        $.isFunction = isFunction
        $.isWindow = isWindow
        $.isArray = isArray
        $.isPlainObject = isPlainObject

        $.isEmptyObject = function(obj) {
            var name;
            //如果obj中有key值,就不是空对象
            for(name in obj) {
                return false;
            }
            return true;
        }

        //不合法的val，经过Number函数后是NaN
        //考虑boolean型的特殊性，Number(true)为1，要排除掉
        //考虑空字符串的特殊性，Number("")为0, 要排除掉
        $.isNumeric = function (val) {
            var num = Number(val), type = typeof val;
            return val != null && type != 'boolean' &&
                (type != 'string' || val.length) &&
                    !isNaN(num) && isFinite(num) || false
        }

        $.inArray = function (elem, array, i) {
            return emptyArray.indexOf.call(array, elem, i);
        }

        $.camelCase = camelize;

        $.trim = function (str) {
            return str ==null? "": String.prototype.trim.call(str)
        }

        $.uuid = 0;
        $.support = {}
        $.expr = {}
        $.noop = function () {}

        $.map = function (elements, callback) {
            var value, values = [], i, key;
            if(likeArray(elements)){
                for (i = 0; i < elements.length; i++){
                    value = callback(elements[i], i);
                    if(value != null){
                        values.push(value)
                    }
                }
            }else{
                for(key in elements) {
                    value = callback(elements[key], key)
                    if(value != null) {
                        values.push(value)
                    }
                }
            }
            return flatten(values);
        }

        //callback返回false就终止循环,并返回这个可能迭代到一半的类数组对象
        $.each = function (elements, callback) {
            var i, key;
            if (likeArray(elements)) {
                for(i = 0; i < elements.length; i++){
                    if(callback.call(elements[i], i, elements[i]) === false){
                        return elements;
                    }
                }
            } else {
                for(key in elements) {
                    if(callback.call(elements[key], key, elements[key]) === false){
                        return elements;
                    }
                }
            }
            return elements;
        }

        //检索
        $.grep = function (elements, callback) {
            return filter.call(elements, callback);
        }

        if(window.JSON){
            $.parseJSON = JSON.parse;
        }

        $.each("Number String Date Array Function Object Error RegExp Boolean", function (name) {
            class2type[ "[object " + name + "]" ] = name.toLowerCase()
        })


        /**
         * $ = function(selector, context){
         *   return zepto.init(selector, context)
         *  }
         * $.map和$.fn.map
         * 一个在方法上添加，相当于静态方法,可以直接调用
         * 一个相当于加了成员对象fn，new之后可以调用
         */
        //相当于扩展Z的方法
        $.fn = {
            construct: zepto.Z,
            length: 0,

            forEach: emptyArray.forEach,
            reduce: emptyArray.reduce,
            push: emptyArray.push,
            sort: emptyArray.sort,
            splice: emptyArray.splice,
            indexOf: emptyArray.indexOf,
            concat: function () {
                var i, value, args = [];
                for(i = 0; i < arguments.length; i++){
                    value = arguments[i];
                    args[i] = zepto.isZ(value) ? value.toArray() : value;
                }
                //concat可以合并n个数组，但是数组不能嵌套
                return concat.apply(zepto.isZ(this) ? this.toArray() : this, args)
            },

            //结果或被包装成Zepto对象
            map: function (fn) {
                return $($.map(this, function (el, i) {
                    return fn.call(el, i, el);
                }))
            },

            slice: function () {
                return $(slice.apply(this, arguments));
            },

            ready: function (callback) {

            },

            //负数倒序取, 不传返回全部
            get: function (idx) {
                return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
            },

            toArray: function () {
                return this.get();
            },

            size: function () {
                return this.length;
            },

            remove: function () {
                return this.each(function () {
                    if(this.parentNode != null){
                        this.parentNode.removeChild(this);
                    }
                })
            },

            each: function (callback) {
                emptyArray.every.call(this, function (el, idx) {
                    return callback.call(el, idx, el) !== false;
                })
                return this;
            },

            not: function (selector) {
                var nodes = [];
                if(isFunction(selector) && selector.call !== undefined){
                    this.each(function (idx) {
                        if(!selector.call(this, idx)){
                            nodes.push(this);
                        }
                    })
                }else{
                    var excludes = typeof selector == 'string' ? this.filter(selector) :
                        (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
                    this.forEach(function (el) {
                        if(excludes.indexOf(el) < 0){
                            nodes.push(el);
                        }
                    })
                }
                return $(nodes);
            },

            filter: function (selector) {
                if(isFunction(selector)){
                    return this.not(this.not(selector))
                }
                return $(filter.call(this, function (element) {
                    return zepto.matches(element, selector)
                }))
            },

            add: function (selector, context) {
                return $(uniq(this.concat($(selector, context))))
            },

            is: function (selector) {
                return this.length > 0 && zepto.matches(this[0], selector);
            },

            has: function (selector) {
                return this.filter(function () {
                    return isObject(selector) ?
                        $.contains(this, selector) :
                        $(this).find(selector).size()
                })
            },

            eq: function (idx) {
                return idx === -1 ? this.slice(idx) : this.slice()
            },

            first: function () {
                var el = this[0];
                return el && !isObject(el) ? el : $(el)
            },

            last: function () {
                var el = this[this.length - 1];
                return el && !Object(el) ? el : $(el)
            },

            find: function (selector) {
                var result, $this = this;
                if(!selector){
                    result = $();
                }else{
                    if(typeof selector == 'object'){
                        result = $(selector).filter(function () {
                            var node = this;
                            return emptyArray.some.call($this, function (parent) {
                                return $.contains(parent, node);
                            })
                        });
                    }else{
                        if(this.length === 1) {
                            result = $(zepto.qsa(this[0], selector))
                        } else {
                            result = this.map(function () {
                                return zepto.qsa(this, selector)
                            })
                        }
                    }
                }
                return result;
            },

            closest: function (selector, context) {
                var nodes = [], collection = typeof selector == 'object' && $(selector)
                this.each(function (_, node) {
                    while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector))){
                        node = node !== context && !isDocument(node) && node.parentNode
                    }
                    if(node && nodes.indexOf(node) < 0){
                        nodes.push(node);
                    }
                });
                return $(nodes);
            },

            parents: function (selector) {
                var ancestors = [], nodes = this;
                while (nodes.length > 0){
                    //向上查找所有节点的父节点，然后再找这些父节点的父节点
                    nodes = $.map(nodes, function (node) {
                        if((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0){
                            ancestors.push(node);
                            return node;
                        }
                    })
                }
                //由selector筛选祖先
                return filtered(ancestors, selector)
            },

            parent: function (selector) {
                return filtered(uniq(this.pluck('parentNode')), selector);
            },

            children: function () {
                return filtered(this.map(function () {
                    return children(this);
                }))
            },

            contents: function () {
                return this.map(function () {
                    //获取子容器的document对象
                    return this.contentDocument || slice.call(this.childNodes);
                })
            },

            //取this父节点的子节点
            siblings: function (selector) {
                return filtered(this.map(function (i, el) {
                    return filter.call(children(el.parentNode), function (child) {
                        return child !== el
                    })
                }), selector);
            },

            empty: function () {
                return this.each(function () {
                    this.innerHTML = '';
                });
            },

            pluck: function (property) {
                return $.map(this, function (el) {
                    return el[property]
                })
            },

            show: function () {
                return this.each(function () {
                    this.style.display == "none" && (this.style.display = '')
                    if(getComputedStyle(this, '').getPropertyValue("display") == "none"){
                        this.style.display = defaultDisplay(this.nodeName);
                    }
                })
            },

            replaceWith: function () {

            },

            wrap: function () {

            },

            wrapAll: function () {

            },

            wrapInner: function () {

            },

            unwrap: function () {

            },

            //此为深拷贝
            clone: function () {
                return this.map(function () {
                    return this.cloneNode(true);
                })
            },

            hide: function () {
                return this.css("display", "none");
            },

            //setting（true/false）可以强制show()或者hide()
            toggle: function (setting) {
                return this.each(function () {
                    var el = $(this);
                    (setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide();
                });
            },

            prev: function (selector) {
                return $(this.pluck('previousElementSibling')).filter(selector || '*')
            },

            next: function (selector) {
                return $(this.pluck('nextElementSibling')).filter(selector || '*')
            },

            html: function (html) {
                return 0 in arguments ?
                    this.each(function (idx) {
                        var originHtml = this.innerHTML;
                        $(this).empty().append()
                    }) :
                    (0 in this ? this[0].innerHTML : null)
            },

            text: function (text) {

            },

            attr: function (name, value) {

            },

            css: function (property, value) {
                //取
                if(arguments.length < 2) {
                    var element = this[0];
                    if(typeof property == 'string'){
                        if(!element) {
                            return;
                        }
                        return element.style[camelize(property)] || getComputedStyle(element, '').getPropertyValue(property)
                    }else{
                        if(isArray(property)){
                            if(!element){
                                return;
                            }
                            var props = {};
                            var computedStyle = getComputedStyle(element, '');
                            $.each(property, function (_, prop) {
                                props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
                            })
                            return props;
                        }
                    }
                }

                //存
                var css = '';
                if (type(property) == 'string') {
                    if(!value && value !== 0){
                        this.each(function () {
                            this.style.removeProperty(dasherize(property))
                        })
                    }else{
                        css = dasherize(property) + ":" + maybeAddPx(property, value)
                    }
                } else {
                    for(key in property){
                        if(!property[key] && property[key] !== 0){
                            this.each(function () {
                                this.style.removeProperty(dasherize(property))
                            })
                        }else{
                            css += dasherize(key) + ":" + maybeAddPx(key, property[key])
                        }
                    }
                }
                return this.each(function () {
                    this.style.cssText += ";" + css;
                })

            },

            //不给element参的话就寻找this在兄弟中的索引
            index: function (element) {
                return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
            },

            hasClass: function (name) {
                if(!name){
                    return false;
                }
                return emptyArray.some.call(this, function (el) {
                    return this.test(className(el))
                }, classRE(name));
            },

            addClass: function (name) {

            },

            removeClass: function (name) {

            },

            toggleClass: function (name, when) {

            },

            scrollTop: function (value) {
                if(!this.length){
                    return;
                }
                var hasScrollTop = 'scrollTop' in this[0];
                if(value === undefined){
                    return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset;
                }
                return this.each(hasScrollTop ?
                    function () {this.scrollTop = value} :
                function () {this.scrollTo(this.scrollX, value)})
            },

            position: function () {
                if(!this.length){
                    return;
                }
                var elem = this[0];
                var offsetParent = this.offsetParent();
            },

            offsetParent: function () {
                return this.map(function () {
                    var parent = this.offsetParent || document.body;
                    while (parent && !rootNodeRE.test(parent.nodeName)
                        && $(parent).css("position") == "static"){
                        parent = parent.offsetParent;
                    }
                    return parent;
                })
            }

        }
    })();

    //赋值给全局对象
    window.Zepto = Zepto;
    window.$ = undefined && (window.$ = Zepto)

    //定义了n个模块
    ;(function ($) {
        var _zid = 1, undefined,
            slice = Array.prototype.slice,
            isFunction = $.isFunction,
            isString = function (obj) {
                return typeof obj == 'string'
            },
            handlers = {},
            specialEvents = {},
            focusinSupported = 'onfocusin' in window,
            focus = { focus: 'focuson', blur: 'focusout' },
            hover = { mouseenter: 'mouseover', mouseleave: 'mouseout'}

        specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

        function zid(element) {
            return element._zid || (element._zid = _zid++)
        }

        function findHandlers(element, event, fn, selector) {

        }

        function parse(event) {

        }

        function matcherFor(ns) {
            
        }
        
        function eventCapture(handler, captureSetting) {

        }

        function realEvent(type) {

        }

        function add() {

        }

        function remove() {

        }

        $.event = {add: add, remove: remove};

        $.proxy = function (fn, context) {
            var args = (2 in arguments) && slice.call(arguments, 2);
            if (isFunction(fn)) {

            } else if (isString(context)) {
                if (args) {

                } else {
                    return $.proxy()
                }
            } else {
                throw new TypeError("expected function")
            }
        }

        $.fn.on = function(event, selector, data, callback, one){
            var autoRemove, delegator, $this = this
            if (event && !isString(event)) {
                $.each(event, function(type, fn){
                    $this.on(type, selector, data, fn, one)
                })
                return $this
            }

            if (!isString(selector) && !isFunction(callback) && callback !== false)
                callback = data, data = selector, selector = undefined
            if (callback === undefined || data === false)
                callback = data, data = undefined

            if (callback === false) callback = returnFalse

            return $this.each(function(_, element){
                if (one) autoRemove = function(e){
                    remove(element, e.type, callback)
                    return callback.apply(this, arguments)
                }

                if (selector) delegator = function(e){
                    var evt, match = $(e.target).closest(selector, element).get(0)
                    if (match && match !== element) {
                        evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
                        return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
                    }
                }

                add(element, event, callback, data, selector, delegator || autoRemove)
            })
        }

        $.fn.bind = function (event, data, callback) {
            return this.on(event, data, callback);
        }

        $.fn.unbind = function (event, callback) {
            return this.off(event, callback);
        }

        $.fn.one = function (event, selector, data, callback) {
            return this.on(event, selector, data, callback, 1);
        }




    }(Zepto))

    ;(function ($) {
    }(Zepto))

    ;(function ($) {
        $.fn.serializeArray = function () {
            var name, type, result = [],
                add = function (value) {
                    if(value.forEach){
                        return value.forEach(add);
                    }
                    result.push({name: name, value: value})
                }
            if(this[0]){
                $.each(this[0].elements, function (_, field) {
                    type = field.type, name = field.name;
                    if(name && field.nodeName.toLowerCase() != 'fieldset' &&
                    !field.disabled && type != 'submit' && type != 'reset' && type != 'button' &&
                    type != 'file' && ((type != 'radio' && type != 'checkbox') || field.checked)){
                        add($(field).val())
                    }
                })
            }
            return result;
        }

        $.fn.serialize = function () {
            var result = [];
            this.serializeArray()
        }
    }(Zepto))

    ;(function () {
    }())

    return Zepto;

}));
