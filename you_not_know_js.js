 //let的作用于包含在块中,且不做声明提升
 if(true){
	 {
		 let a = 123;
		 console.log(a); //123
	 }
	 console.log(a); 	//error
 }
 console.log(a); 	//error
 
 //可以通过let来制作等价于for循环闭包的效果：let每次都重新声明变量
 for (let i=1; i<=5; i++) {
	setTimeout( function timer() {
		console.log( i );
	}, 100 );
}

for (var i=1; i<=5; i++) {
	(function(j) {
		setTimeout( function timer() {
			console.log( j );
		}, 100 );
	})( i );
}
 
 //const声明常量
 //函数声明优先于变量声明，即使他在变量之后被声明
 
 //利用闭包进行模块定义
 var MyModules = (function Manager(){
	var modules = {};
	
	function define(name, dependences, impl){
		for(var i = 0; i < dependences.length; i++){
			dependences[i] = modules[dependences[i]];
		};
		modules[name] = impl.apply(impl, dependences);
	};
	
	function get(name){
		return modules[name];
	};
	
	return {
		define: define,
		get: get
	};
	
 })();
 MyModules.define("foo", ["bar"], function(bar){
	 var hungry = "hippo";
	 function awesome(){
		 console.log(bar.hello(hungry).toUpperCase);
	 }
 })
 
 //关于柯里化
 function foo(p1,p2) {
	this.val = p1 + p2;
}
var bar = foo.bind( null, "p1" );
bar("p2");
val; // p1p2

//硬绑定
//apply, call强制指定上下文，之后不可改变

//软绑定
//函数调用时的上下文是this是全局或者undefined时，把指定对象obj绑定
//否则不改变this
if(!Function.prototype.softBind){
	Function.prototype.softBind = function(obj){
		var fn = this;
		var curried = [].slice.apply(arguments, 1);
		var bound = function(){
			return fn.apply(((!this || this === (window || global)) ? obj : this), curried.concat.apply(curried, arguments));
		};
		bound.prototype = Object.create(fn.prototype);
		return bound;
	}
}

function foo() {
	console.log(this.name);
}

var obj = { name: "obj" },
obj2 = { name: "obj2" },
obj3 = { name: "obj3" };

var fooOBJ = foo.softBind(obj);

fooOBJ() //obj

obj2.foo() //obj2

//箭头函数中的this的域由其外层作用于决定
function foo() {
	// 返回一个箭头函数
	return (a) => {
		//this 继承自 foo()
		console.log( this.a );
	};
}
var obj1 = {a:2};
var obj2 = {a:3};
var bar = foo.call( obj1 );
bar.call( obj2 ); // 2, 不是 3 ！

//为对象添加属性方法
Object.defineProperty(myObj, "a", {
	value: 2,
	writable: false,	
	configurable: true,
	enumerable: true	//在循环中是否能访问到
})

myObj.a = 3; //无效

//configurable为false，那么再次defineProperty同一个属性将会TypeError，所以他是单向的，连删除这个属性都无法做到

//判断对象中是都有某个属性名
in //会检查原型链
hasOwnProperty	//只检查当前对象

for(var i in obj)	//对对象
//对数组  退出循环
forEach 
every	return false;
some	return true; 
for(var i of Array)

//js中只有对象，而无类，所有模仿类的行为都是因为function中有prototype
//new Father()的时候会创建一个对象，之后这个对象会被“关联”到prototype上（可以看出书中在极力避免称这个对象为原型对象，而只说他们是关联的）
var f = new Father();
Father.prototype === f.[[Prototype]] || f.contructor
	
//obj对象的原型链上存在属性a，如果a是不可写的，那么将无法修改或在对象上添加该属性
//若属性a在原型链上是个setter，那么setter会被调用而不是替换
//可以用defineProperty代替=来为对象修改属性 

//Object.create(obj)返回一个新对象，这个新对象的[[prototype]]会自动关联到obj上
Son.prototype = Object.create(Father.prototype);

Son.prototype = Father.prototype; //这会使得对son的原型的修改直接影响到Father的原型

Son.prototype = new Father()	//如果Father的构造函数中做了乱七八糟的事（写日志，修改状态，给this添加属性什么的）那会影响Son的后代

//es6提供的原型修改方法
Object.setPrototypeOf(Son.prototype, Father.prototype);

//典型的（ “ 原型”） 面向对象风格：
function Foo(who) {
	this.me = who;
} 
Foo.prototype.identify = function() {
	return "I am " + this.me;
};
function Bar(who) {
	Foo.call( this, who );
} 
Bar.prototype = Object.create( Foo.prototype );
Bar.prototype.speak = function() {
	alert( "Hello, " + this.identify() + "." );
};
var b1 = new Bar( "b1" );
var b2 = new Bar( "b2" );
b1.speak();
b2.speak();

//对象关联风格
Foo = {
	init: function(who) {
		this.me = who;
	},
	identify: function() {
		return "I am " + this.me;
	}
};
Bar = Object.create( Foo );
Bar.speak = function() {
	alert( "Hello, " + this.identify() + "." );
};
var b1 = Object.create( Bar );
b1.init( "b1" );
var b2 = Object.create( Bar );
b2.init( "b2" );
b1.speak();
b2.speak();

/////////////////////////////////////
function Controller() {
	this.errors = [];
}
Controller.prototype.showDialog(title, message){}
Controller.prototype.success = function(msg){ 
	this.showDialog("success", msg); 
}
Controller.prototype.failure = function(err){
	this.errs.push(err);
	this.showDialog("Error", err);
}

function LoginController(){
	Controller.call(this);
}
LoginController.prototype = Object.create(Controller.prototype);
//重写
LoginController.prototype.failure = function(err){
	Controller.prototype.failure.call(this, "err");
}

//内置类型 boolean. string, number, null, undefined,symbol(基本类型们), object
//typeof null === "object", 内存中，前三位为0表对象，而null全是0，所以也被认为是对象
//所以判null (!a && typeof === "object")

42.toFixed(2)为什么报错，因为js视42.为一个数字常量，加括号或者42..toFixed甚至42 .toFixed都可以

IEEE 754的浮点数精度问题 0.1 + 0.2 = 0.3;
//两个值相减差小于js的机器精度2^-52
//最大的浮点数 1.798e+308 最小浮点数 5e-234
//整数安全值范围最大值远小于浮点数，2^53 - 1，比他大的就存成字符串吧
//而按位或这样的数位操作只适用于32位有符号整形，所以范围会更小一些，所以 a | 0可以截取a中的32位数

//NaN是js中唯一一个不等于自身的值

b = Number(2)包装标量2后传入函数中后+1（这个+1操作的时候产生了新对象），之后b所指向的对象仍然不会发生改变

//对象封装和拆封
new String() 和 a.valueOf

//可以考虑一下，当函数有多个参，但其中一个或多个在某些情况下使用是不变的，那么可以考虑将他定制化成另一个函数
function a(behavior){
	return function(a, b){
		return behavior(a, b);
	};
}
var behaviorAdd = a(function(i, j){
	return i + j;
})

var behaviorMin = a(function(i, j){
	return i - j;
})

