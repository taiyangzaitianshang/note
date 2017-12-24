//单例模式
//核心是确保只有一个实例，并提供全局访问,下面将创建和唯一对象两件事分开-----单一职责模式
var CreateDiv = function( html ){
	this.html = html;
	this.init();
};
CreateDiv.prototype.init = function(){
	var div = document.createElement( 'div' );
	div.innerHTML = this.html;
	document.body.appendChild( div );
};
//接下来引入代理类 proxySingletonCreateDiv：
var ProxySingletonCreateDiv = (function(){
	var instance;	//整个函数体放在闭包中，是为了instance唯一
	return function( html ){
		if ( !instance ){
			instance = new CreateDiv( html );
		}
		return instance;
	}
})();
var a = new ProxySingletonCreateDiv( 'sven1' );
var b = new ProxySingletonCreateDiv( 'sven2' );
alert ( a === b )
//但js没有类，没必要去模拟类然后创建单例，可以定义全局对象，用闭包或者namespace防止污染

//BI中也有很多这样的场景
if(!BI.has(xxx)){
	//createSometing
}
return xxx;
//但是这样其实我创建dimension或者region都要再重复写
//可以把创建具体的过程提成接口
var getSingle = function(fn){
	var result;
	return function(){
		return result || result = (fn.apply(this, arguments))
	}
}

//策略模式
//定义一组算法，使得他们之间可以互相替换
//一般来说有两个部分组成
//1.n个策略方法
//2.委托对象
//将对应策略方法放入委托对象中，委托对象自定调用
var calculateBonus = function( performanceLevel, salary ){
	if ( performanceLevel === 'S' ){
		return salary * 4;
	}
	if ( performanceLevel === 'A' ){
		return salary * 3;
	}
	if ( performanceLevel === 'B' ){
		return salary * 2;
	}
};
calculateBonus( 'B', 20000 ); // 输出： 40000
calculateBonus( 'S', 6000 ); // 输出： 24000
//传入不同的level和基础薪资，获得结果，但是if语句使得函数庞大且有新函数则要不断维护

//将这n个if，也即计算算法封装成一个个类(函数)，将这些方法set到奖金类中
var performanceS = function(){};
performanceS.prototype.calculate = function( salary ){
	return salary * 4;
};
var performanceA = function(){};
performanceA.prototype.calculate = function( salary ){
	return salary * 3;
};

var Bonus = function(){
	this.salary = null; // 原始工资
	this.strategy = null; // 绩效等级对应的策略对象
};
Bonus.prototype.setSalary = function( salary ){
	this.salary = salary; // 设置员工的原始工资
};
Bonus.prototype.setStrategy = function( strategy ){
	this.strategy = strategy; // 设置员工绩效等级对应的策略对象
};
Bonus.prototype.getBonus = function(){ // 取得奖金数额
	return this.strategy.calculate( this.salary ); // 把计算奖金的操作委托给对应的策略对象
};

//js
var strategies = {
	"S": function( salary ){
		return salary * 4;
	},
	"A": function( salary ){
		return salary * 3;
	},
	"B": function( salary ){
	return salary * 2;
	}
};
var calculateBonus = function( level, salary ){
	return strategies[ level ]( salary );
};
console.log( calculateBonus( 'S', 20000 ) ); // 输出： 80000
console.log( calculateBonus( 'A', 10000 ) ); // 输出： 30000
//和if相比较，感觉有点像map(直接取)和数组(索引遍历)

//代理模式
//C和A接触，通或B和A接触
//B可以替A过滤掉一些操作要求(保护代理)
//B可以在A真正需要时把C的请求给A(虚拟代理，实际就是延时加载)
//开放封闭原则 单一职责原则
//本体真实图片，代理对象负责加载图片，以后如果不需要加载延时，直接去掉代理对象即可
var myImage = (function(){
	var imgNode = document.createElement( 'img' );
	document.body.appendChild( imgNode );
	return {
		setSrc: function( src ){
			imgNode.src = src;
		}
	}
})();
var proxyImage = (function(){
	var img = new Image;
	img.onload = function(){
		myImage.setSrc( this.src );
	}
	return {
		setSrc: function( src ){
			myImage.setSrc( 'file:// /C:/Users/svenzeng/Desktop/loading.gif' );
			img.src = src;
		}
	}
})();

//场景：n个checkBox,每勾选一个就会向后台发送数据（就像BI的多路径），开销大
//通过代理函数来将2秒后的结果发送至后台
//代理函数每次都将勾选的item放到全局cache中(可用闭包)，2秒之后调用本体同步函数,这样以后不需要等两秒，直接去掉代理就好了
var proxy = (function(){
	var cache = [];
	return function(id){
		cache.push(id);
		if(timer){
			return;
		}
		var timer = setTimeOut(function(){
			doPassValue(cache);
			clearTimeout(timer);
			timer = null;
			cache.length = 0;
		}, 2000);
	}
})()

//场景，console打印各种信息的js比较大，代码中调用可以，但只在打开控制台时加载这个js，并执行代码中调用的api
//同样的，闭包包一下，缓存调用的函数
var miniConsole = (function(){
	var cache = [];	
	var handler = function(){ //放在闭包中是因为只想加载一次js
		//当按下F2时，加载js，并执行缓存方法
		if ( ev.keyCode === 113 ){
			var script = document.createElement( 'script' );
			script.onload = function(){
			//此时miniConsole.js被加载，覆盖了前面的miniConsole,使得fn()中使用的是js中的对象方法
				for ( var i = 0, fn; fn = cache[ i++ ]; ){
					fn();
				}
			};
		script.src = 'miniConsole.js';
		document.getElementsByTagName( 'head' )[0].appendChild( script );
}
	};
	document.body.addEventListener( 'keydown', handler, false );
	return {
		log: function(){
			var args = arguments;
			cache.push(function(){
				return miniConsole.log(miniConsole, args);//调用log只是把方法存起来
			})
		}
	}
}
})();

//场景，功能是计算乘积，而代理负责缓存结果
var multi = function(){
	//calc
}

var proxy = (function(){
	var cache = {};
	return function(){
		var args = Array.prototype.join.call(arguments, ",");
		if(args in cahce){
			return cache[args];
		}
		return cache[args] = multi.apply(this, arguments);
	}
})()

//迭代器模式
//没啥好说的

//发布-订阅模式
//BI中也有这样的场景，等一个action回调，然后在回调中A组件刷新，B组件setXXX，C组件resize
//这样毁掉会越来越大且充满耦合
//回调成功后trigger,
//A,B,C皆监听回调成功事件，各自处理
$.ajax( 'http:// xxx.com?login', function(data){ // 登录成功
	login.trigger( 'loginSucc', data); // 发布登录成功的消息
});
var header = (function(){ // header 模块
	login.listen( 'loginSucc', function( data){
	header.setAvatar( data.avatar );
	});
	return {
		setAvatar: function( data ){
			console.log( '设置 header 模块的头像' );
		}
	}
})();
var nav = (function(){ // nav 模块
		login.listen( 'loginSucc', function( data ){
		nav.setAvatar( data.avatar );
	});
	return {
		setAvatar: function( avatar ){
		console.log( '设置 nav 模块的头像' );
	}
}
})();
//可以这么认为a,b之间需要交互，那么a只通过EVENT发事件和信息
//B只通过EVENT监听事件和信息，然后XXX
//A，B皆不知道对方的存在
var Event = (function(){
	var clientList = {},
		listen,
		trigger,
		remove;
listen = function( key, fn ){
	if ( !clientList[ key ] ){
		clientList[ key ] = [];
	}
	clientList[ key ].push( fn );
};
trigger = function(){
	var key = Array.prototype.shift.call( arguments ),
	fns = clientList[ key ];
	if ( !fns || fns.length === 0 ){
		return false;
	}
	for( var i = 0, fn; fn = fns[ i++ ]; ){
		fn.apply( this, arguments );
	}
};
remove = function( key, fn ){
	var fns = clientList[ key ];
	if ( !fns ){
		return false;
	}
	if ( !fn ){
		fns && ( fns.length = 0 );
	}else{
		for ( var l = fns.length - 1; l >=0; l-- ){
			var _fn = fns[ l ];
			if ( _fn === fn ){
				fns.splice( l, 1 );
			}
		}
	}
};
return {
	listen: listen,
	trigger: trigger,
	remove: remove
}
})();
Event.listen( 'squareMeter88', function( price ){ // 小红订阅消息
console.log( '价格= ' + price ); // 输出： '价格=2000000'
});
Event.trigger( 'squareMeter88', 2000000 ); // 售楼处发布消息
//问题 先发布后订阅也应该收到消息（类似扣扣登陆后离线消息也能接受到）

//命令模式
//移动和撤销
//command对象接受操作对象和操作参数，之后按钮点击的时候调用command的execute或者undo方法
var MoveCommand = function( receiver, pos ){
	this.receiver = receiver;
	this.pos = pos;
	this.oldPos = null;
};
MoveCommand.prototype.execute = function(){
	this.receiver.start( 'left', this.pos, 1000, 'strongEaseOut' );
	this.oldPos = XXXXX;
};
MoveCommand.prototype.undo = function(){
	this.receiver.start( 'left', this.oldPos, 1000, 'strongEaseOut' );
}
var moveCommand;
moveBtn.onclick = function(){
	var animate = new Animate( ball );
	moveCommand = new MoveCommand( animate, pos.value );
	moveCommand.execute();
};
//大概就是多有的操作一旦command对象构建完成，都有command去做了
//撤销和重做	对于不好逆的操作（划线了n次），那就全清空，重做栈中保存的操作
var Ryu = {
	attack: function(){
		console.log( '攻击' );
	},
	defense: function(){
		console.log( '防御' );
	},
	jump: function(){
		console.log( '跳跃' );
	},
	crouch: function(){
		console.log( '蹲下' );
	}
};
var makeCommand = function( receiver, state ){ // 柯里化，做了一个保存成员变量的事
	return function(){
		receiver[ state ]();
	}
};
var commands = {
	"119": "jump", // W
	"115": "crouch", // S
	"97": "defense", // A
	"100": "attack" // D
};
var commandStack = []; // 保存命令的堆栈
document.onkeypress = function( ev ){
	var keyCode = ev.keyCode,
	command = makeCommand( Ryu, commands[ keyCode ] );
	if ( command ){
		command(); // 执行命令
		commandStack.push( command ); // 将刚刚执行过的命令保存进堆栈
	}
};
document.getElementById( 'replay' ).onclick = function(){ // 点击播放录像
	var command;
	while( command = commandStack.shift() ){ // 从堆栈里依次取出命令并执行
		command();
	}
};

//组合模式
//树，递归执行，父节点由若干个子节点构成，含有相同的方法，但子节点执行某些方法可以抛出异常
//然而其实这并不是父子关系，而是has的关系
//这种模式并不适合于双向映射模式，比如某个叶子属于多个组

//模板方法模式
//继承
var Beverage = function(){};
Beverage.prototype.boilWater = function(){
	console.log( '把水煮沸' );
};
Beverage.prototype.brew = function(){}; // 空方法，应该由子类重写
Beverage.prototype.pourInCup = function(){}; // 空方法，应该由子类重写
Beverage.prototype.addCondiments = function(){}; // 空方法，应该由子类重写
Beverage.prototype.init = function(){
	this.boilWater();
	this.brew();
	this.pourInCup();
	this.addCondiments();
};
var Coffee = function(){};
Coffee.prototype = new Beverage(); //这样的方式其实不好，如果Beverage中在构造时做了一些写日志什么的操作，那子类也被污染了，可以用Object.create(Beverage.prototype);
Coffee.prototype.brew = function(){
	console.log( '用沸水冲泡咖啡' );
};
Coffee.prototype.pourInCup = function(){
	console.log( '把咖啡倒进杯子' );
Coffee.prototype.addCondiments = function(){
	console.log( '加糖和牛奶' );
};
var Coffee = new Coffee();
Coffee.init();//这个init就是模板方法模式的体现(就是继承啊)
//js中没有接口检查，子类没有实现父类方法可以通过在父类接口中throw new Error("xxxxx")
//那么如果有一个子类在init时只想执行其中若干个方法中的几个呢
//用钩子，在父类执行对应方法时调用判断是否调用的方法

//享元模式
//把状态相同的对象指定为共享对象，其中变化的通过set传入对象，这样可以大大减少对象数量
//页面上有5个节点，当下一次要重绘页面需要10个节点时，我们只创建5个
var objectPoolFactory = function( createObjFn ){
	var objectPool = [];
	return {
		create: function(){
			var obj = objectPool.length === 0 ?
			createObjFn.apply( this, arguments ) : objectPool.shift();
			return obj;
		},
		recover: function( obj ){
			objectPool.push( obj );
		}
	}
};

//职责链模式
//多个对象都有机会处理请求，请求沿着对象的链传递，知道有对象处理它
//避免发送者和接收者之间的耦合，请求者只要知道链中的第一个对象。否则请求者就要知道哪些对象可以处理问题
//考虑if语句的嵌套，层层帅选
var order = function( orderType, pay, stock ){
	if ( orderType === 1 ){ // 500 元定金购买模式
		if ( pay === true ){ // 已支付定金
			console.log( '500 元定金预购, 得到 100 优惠券' );
		}else{ // 未支付定金，降级到普通购买模式
			if ( stock > 0 ){ // 用于普通购买的手机还有库存
				console.log( '普通购买, 无优惠券' );
			}else{
				console.log( '手机库存不足' );
			}
		}
	}
	else if ( orderType === 2 ){ // 200 元定金购买模式
		if ( pay === true ){
			console.log( '200 元定金预购, 得到 50 优惠券' );
		}else{
			if ( stock > 0 ){
				console.log( '普通购买, 无优惠券' );
			}else{
				console.log( '手机库存不足' );
			}
		}
	}
	else if ( orderType === 3 ){
		if ( stock > 0 ){
			console.log( '普通购买, 无优惠券' );
		}else{
			console.log( '手机库存不足' );
		}
	}
};
order( 1 , true, 500); // 输出： 500 元定金预购, 得到 100 优惠券

//把500处理和200处理封装成函数，层层调用
//先走500，不满足条件，调用200处理函数，不满足，再往下
//但这样处理函数中还有耦合，删200要修改500函数
//500元函数中不满足条件不调用200函数，改而返回不满足的标记，在外调用函数
var Chain = function( fn ){
	this.fn = fn;//百元函数
	this.successor = null;
};
Chain.prototype.setNextSuccessor = function( successor ){
	return this.successor = successor;
};
Chain.prototype.passRequest = function(){
	var ret = this.fn.apply( this, arguments );
	if ( ret === 'nextSuccessor' ){
		return this.successor && this.successor.passRequest.apply( this.successor, arguments );
	}
	return ret;
};
var chainOrder500 = new Chain( order500 );
var chainOrder200 = new Chain( order200 );
var chainOrderNormal = new Chain( orderNormal )

chainOrder500.setNextSuccessor( chainOrder200 );
chainOrder200.setNextSuccessor( chainOrderNormal );

chainOrder500.passRequest( 1, true, 500 );

//AOP
Function.prototype.after = function( fn ){
	var self = this;
	return function(){
		var ret = self.apply( this, arguments );
		if ( ret === 'nextSuccessor' ){
			return fn.apply( this, arguments );
		}
		return ret;
	}
};
var order = order500yuan.after( order200yuan ).after( orderNormal );
order( 1, true, 500 ); // 输出： 500 元定金预购，得到 100 优惠券
order( 2, true, 500 ); // 输出： 200 元定金预购，得到 50 优惠券
order( 1, false, 500 ); // 输出：普通购买，无优惠券

//中介者模式
//n架飞机不需要互相通信，可以通过信号塔联系
//两组对象，每个对象都包含一个朋友对象数组和敌人对象数组
//耦合性很高，一旦一个对象状态改变，所有的对象都要遍历数组改状态
//改进：每个对象只保存自己的信息，所属队伍etc,每次动作发生都调用中介者对应方法
//中介者管理所有玩家，并提供对象动作发生时的操作（对象增加，更换队伍，给跪了etc）

//BI中也有，一个控件对象change之后，通知其他change做相应改变，而他们可能没有任何关系
//如果多个对象之间的状态改变互相影响，耦合将非常高
//相当于提了个check方法，这个就是中介者（这种转化常常使得中介者很庞大）

//装饰者模式
//如何给函数添加功能
var a = function(){
	alert(1);
}
var _a = a;
a = function(){
	_a();
	alert(2)
}
//不违反开放封闭原则，但是增加的局部变量，一旦装饰链很长，维护麻烦
Function.prototype.before = function(beforeFn){
	var self = this;
	return function(){
		beforeFn.apply(this, arguments);
		return self.apply(this, arguments)
	}
}
//这样可以链式调用
window.onload = function(){
	alert (1);
}
window.onload = ( window.onload || function(){} ).after(function(){
		alert (2);
}).after(function(){
		alert (3);
}).after(function(){
		alert (4);
});
//before和函数本体共用arguments,马me就可以在before中修改参数

//状态模式
//状态驱动对象
//对象有n个状态，对象行为发生时，是调用的当前状态对象的方法
//当前状态对象方法执行时，除了做动作，还会修改对象的当前对象
//light对象(上下文)
var OffLightState = function(light){
	this.light = light;
}
OffLightState.prototype.buttonWasPressed = function(){
	console.log( '弱光' ); // offLightState 对应的行为
	this.light.setState( this.light.weakLightState ); // 切换状态到 weakLightState
};
// WeakLightState：
var WeakLightState = function( light ){
	this.light = light;
};
WeakLightState.prototype.buttonWasPressed = function(){
	console.log( '强光' ); // weakLightState 对应的行为
	this.light.setState( this.light.strongLightState ); // 切换状态到 strongLightState
};
// StrongLightState：
var StrongLightState = function( light ){
	this.light = light;
};
StrongLightState.prototype.buttonWasPressed = function(){
	console.log( '关灯' ); // strongLightState 对应的行为
	this.light.setState( this.light.offLightState ); // 切换状态到 offLightState
};

var Light = function(){
	this.offLightState = new OffLightState( this );
	this.weakLightState = new WeakLightState( this );
	this.strongLightState = new StrongLightState( this );
	this.button = null;
};

Light.prototype.init = function(){
	var button = document.createElement( 'button' ),self = this;
	this.button = document.body.appendChild( button );
	this.button.innerHTML = '开关';
	this.currState = this.offLightState; // 设置当前状态
	this.button.onclick = function(){
		self.currState.buttonWasPressed();
	}
};

Light.prototype.setState = function( newState ){
	this.currState = newState;
};

//灯光强弱的转化是线性的，一旦状态间的转化出现交叉，是很麻烦的
//文件上传：扫描，上传， 暂停，成功，失败， 取消（有两个按钮暂停/开始，删除）
//upload代表上传，plugin职责是上传的各个行为(扫描，上传暂停etc)
//upload中有成员plugin和n个状态对象，
//每个状态中定义点击两个按钮时的状态变化，调用upload中的对应方法（其实还是调用的plugin的方法并改变currentState）

//