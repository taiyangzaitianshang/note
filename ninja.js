function multiMax(m){
	return m * Math.max.apply(Math, Array.prototype.slice.call(arguments, 1));
}
//将传入元素中的第一个元素和剩余元素中的最大值相乘，arguments不是数组，没有slice方法
//所以用Array的原型方法通过call将他伪装成数组

multiMax.length === 1//形参参数个数
arguments.length //实际传入参数个数

//方法重载，刚看到这种写法的时候我是很激动的
var ninja = {};
addMethod(ninja, "whatever", function(){ console.log("123"); })
addMethod(ninja, "whatever", function(a){ console.log("123" + a); })
addMethod(ninja, "whatever", function(a, b){ console.log(a + b); })

//闭包
function addMethod(obj, name, fn){
	var old = obj[name];
	obj[name] = function(){
		if(fn.length === arguments.length){
			return fn.apply(this, arguments);
		}else if(typeof old === 'function'){
			return old.apply(this, arguments);
		}
	}
}

//currying 在函数中预先填入一些参数，然后返回一个函数
Function.prototype.currying = function (){
	var fn = this;		//新增函数（对下面那个匿名函数来说）
	var args = Array.prototype.slice(arguments);//新增参数
	return function(){
		return fn.apply(this, args.concat(Array.prototype.slice.call(arguments)));
	}
}

Function.prototype.bind = function (){
	var fn = this;		//调用bind的上下文,就是调用bind的那个函数
	var args = Array.prototype.slice(arguments);//新增参数
	var obj = args.shift();	//传入bind的上下文
	return function(){
		return fn.apply(obj, args.concat(Array.prototype.slice.call(arguments)));
	}
}

//缓存exampleFunc的返回结果，调用时返回缓存值
Function.prototype.memorized = function (n) {
	this._values = this._values || {};
	return this._values[n] === undefined ? this._values[n] = this.apply(this, arguments) : this._values[n]
}

function isPrime(argument) {
	//isPrime body...
}

isPrime.memorized(1)
isPrime.memorized(2)
isPrime.memorized(1)
//但这种缓存是的使得用户需要主动调用memorized,很可能会忘记
//可以通过闭包来定义isPrime

Function.prototype.memorize = function () {
	//这边this要缓存，否则之后调用函数isPrime时，this指向的window
	var fn = this;	//在调用memorize时，this指向的是isPrime的body所在函数，得到引用
	return function(){
		return fn.memorized.apply(fn, arguments)
	}
}

var isPrime = (function (argument) {
	// isPrime body...
}).memorize();

isPrime(1)
isPrime(2)
isPrime(1)

FRContext.getCurrentEnv()
GeneralContext
GeneralUtils

//函数包装 使用新功能包装旧函数，旧功能不受影响
function wrap(obj, name, wrapper){
	var fn = obj[name];
	return obj[name] = function () {
		return wrapper.apply(this, [fn.bind(this)].concat(
			Array.prototype.slice.call(arguments)));
	};
}

if(Prototype.Browser.Opera) {
	wrap(Element.Methods, "readAttribute", function(original, elem, attr){
		return attr == "title" ? elem.title : original(elem,attr);
	})
}

//及时函数
(function(){/*body*/})()
//立即执行的匿名函数

(function(){
	//这边jQuery构造器赋值给window.jQuery后再赋值给jQuery是有意义的
	//这样使得即时在控制范围外的window.jQuery被修改后，闭包中仍然可以用
	//jQuery来强制保持
	var jQuery = window.jQuery = function(){

	}
})()

//往对象原型添加方法后，比如说拓展了计数的keys方法，那计数就不对了
//可以通过hasOwnProperty方法来过滤掉添加在对象原型上的方法

//子类化Array对象
function MyArray(){}

MyArray.prototype = new Array();
var mine = new MyArray();

//模拟Array
function MyArray(){}
MyArray.prototype.length = 0;
(function(){
	var methods = ['push', 'pop'];
	for(var i = 0; i < method.length; i++){
		(function(name){
			MyArray.prototype[name] = function(){
				return Array.prototype[name].apply(this, arguments);
			}
		})(method[i])
	}
}())

//中央定时器控制
//管理大批量的定时器：暂停恢复定时器，删除回调，每个页面同一时间只有一个定时器运行
var timer = {
	timerID: 0,		//控制timer有且仅有一个
	timers: [],		//存放定时器
	
	add: function(fn){
		this.timers.push(fn);
	},
	
	start: function(){
		if(this.timerID){
			return; 	//当前timer已经执行过start，则不再调用
		}
		(function runNext(){
			if(timers.timers.length > 0){ //空的时候，相当于递归终止条件吧
				for(var i = 0; i < timers.timers.length; i++){
					if(timers.timers[i]() === false){ //当前定时器回调返回false的话，表示不再参与下一轮
						timers.timers.splice(i, 1);
						i--;
					}
				}
				timers.timerID = setTimeout(runNext, 0);//剩余存在的定时器继续下一轮
			}
		})();
	},
	
	stop: function(){
		clearTimeout(this.timerID);
		this.timerID = 0;
	}
}

//eval求值，接收字符串，并执行代码，如果是对象这些不是简单变量，原始值，赋值语句。需要包一层()
evel('({a:1})')

var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
    var isArrayLike = function(collection) {
        var length = collection != null && collection.length;
        return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
    }
	
	//typeof判基本类型
	//instanceof判对象（包括数组，函数）
