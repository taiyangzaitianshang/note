/**
 * Created by windy on 2017/1/16.
 */
jQuery.remove()
//移除元素，包括子元素，所绑定事件和附加数据（data()）也一并移除
//但仍然可以引用到这个对象
//var n3 = $("#e");
//n3.remove()
//n3.dosomething

//将一个函数柯里化
var currying = function(fn){
	var args = [];
	
	return function(){
		if(arguments.length === 0){
			return fn.apply(this, args);
		}else{
			[].push.apply(this, args);
			return arguments.callee;
		}
	}
}

//去柯里化
Function.prototype.uncurrying = function () {
	var self = this;
	return function() {
		//弹出参数第一参，也即context
		var obj = Array.prototype.shift.call(arguments);
		return self.apply(obj, arguments);
	}
}

//箭头函数中的this是定义时的this
//箭头函数的 this 永远指向该函数构造时的环境
//由于箭头函数没有自己的this，所以当然也就不能用call()、apply()、bind()这些方法去改变this的指向

var push = Array.prototype.push.uncurrying();
(function(){
	push( arguments, 4 );
	console.log( arguments ); // 输出： [1, 2, 3, 4]
})( 1, 2, 3 )

//函数节流 函数不受控制的重复调用（比如说 window.onResize mousemove, 更新进度条）
//可以通过setTimeOut，比如说BI.debounce()
//下面这个函数会包装目标函数，是的目标函数在规定时间内至多只执行一次
//节流
var throttle = function(){
	var self = fn, timer, firstTime = true;	//fn当前函数的引用
	return function(){
		var args = arguments, me = this;
		if(firstTime){
			self.apply(me, args);
			return firstTime = false;
		}
		if(timer){	//定时器还在，那么上一次延时还未完成
			return false;
		}
		timer = setTimeout(function(){
			clearTimeOut(timer);
			timer = null;
			self.apply(me, args);
		}, interval || 500);
	}
}

window.onresize = throttle(function(){
	console.log(1);
}, 500);

//惰性加载
//例如给element绑定事件，不同浏览器是不同的方法，每次绑事件都if,if判断很麻烦 
//1.可以使用立即执行函数在代码加载时判断一次，并返回新的绑定函数，之后直接调用，不用再判断了
//但如果我的代码一次事件都没绑定过，那不是浪费了吗
//函数中还是用if判断，但是在第一次进入后改造这个函数。。。哇哦
var addEvent = function( elem, type, handler ){
	if ( window.addEventListener ){
		addEvent = function( elem, type, handler ){		//重定义了addEvent函数
			elem.addEventListener( type, handler, false );
		}
	}else if ( window.attachEvent ){
		addEvent = function( elem, type, handler ){
			elem.attachEvent( 'on' + type, handler );
		}
	}
	addEvent( elem, type, handler );
};

//function*申明的函数执行返回{value: xxx, done: ""}
//可以调用next来获取下一个值（函数内部在yield暂停，每次next移动到下一个yield处，并执行返回,直到undefined）

//被async声明的函数会返回的是一个 Promise 对象，如果不是，会被Promise.resolve(value)转成promise返回
//await 会等待这个 Promise 完成，并将其 resolve 的参数返回出来等同于 new Promise().then(//他的下一步就是这里面的)
//所以如果await等到的不是Promise,那么并无什么特别作用，所以await等一个async声明的函数才会阻塞
//Promise的then链式调用用来解决回调地狱

//resolve的参数是then中回调的参数，也是await的返回值

function takeLongTime(n) {
    return new Promise(resolve => {
        setTimeout(() => resolve(n + 200), n);
    });
}
function step1(n) {
    console.log(`step1 with ${n}`);
    return takeLongTime(n);
}
function step2(n) {
    console.log(`step2 with ${n}`);
    return takeLongTime(n);
}
function step3(n) {
    console.log(`step3 with ${n}`);
    return takeLongTime(n);
}

//现在用 Promise 方式来实现这三个步骤的处理
function doIt() {
    console.time("doIt");
    const time1 = 300;
    step1(time1)
        .then(time2 => step2(time2))
        .then(time3 => step3(time3))
        .then(result => {
            console.log(`result is ${result}`);
            console.timeEnd("doIt");
        });
}
doIt();
//用await就是进一步优化了then，显得更"同步"
async function doIt() {
    console.time("doIt");
    const time1 = 300;
    const time2 = await step1(time1);
    const time3 = await step2(time2);
    const result = await step3(time3);
    console.log(`result is ${result}`);
    console.timeEnd("doIt");
}
doIt();

event.preventDefault()//阻止浏览器默认行为(checkbox点击click即选中/取消,在input中keydown即输入值， click（a）标签就会跳转)，但是事件还是会触发，并冒泡


