#webpack note

##安装

```js
一般我都用npm install xxx --save-dev

较为简洁的是npm i -D xxx

loader安装

npm i -D xxx-loader yyy-loader

plugin安装

npm i -D xx-yy-plugin

DevServer

提供 HTTP 服务而不是使用本地文件预览；
监听文件的变化并自动刷新网页，做到实时预览；
支持 Source Map，以方便调试。

npm i -D webpack-dev-server

npm run webpack-dev-server 
这样默认会在8080端口启动一个服务，并监听文件更新刷新浏览器。
相当于执行了webpack -watch

通过加入 --hot参数来热更新而不是全局更新
通过加入 --devtool source-map使得在浏览器中调试看到的是源代码
而不是打包后的代码


```

##配置loader

webpack不支持解析csswen文件，通过loader支持非js文件

```js

//两种方式
use: ['style-loader', 'css-loader?minimize']


use: ['style-loader', {
    loader:'css-loader',
    options:{
      minimize:true,
    }
  }]

 // 也可以在源码中写
指定main.css使用什么去处理
  require('style-loader!css-loader?minimize!./main.css');


```


##Plugin

在构建流程中注入钩子，扩展webpack功能

在例子中css被loader转化后一起写入了js文件中，可能使得文件变大，通过plugin将其从js中抽取出来

ExtractTextPlugin 插件的作用是提取出 JavaScript 代码里的 CSS 到一个单独的文件

##Entry

##output

##Module

```js
module: {
    rules: [
    {
      // 命中 JavaScript 文件
      test: /\.js$/,
      // 用 babel-loader 转换 JavaScript 文件
      // ?cacheDirectory 表示传给 babel-loader 的参数，用于缓存 babel 编译结果加快重新编译速度
      use: ['babel-loader?cacheDirectory'],
      // 只命中src目录里的js文件，加快 Webpack 搜索速度
      include: path.resolve(__dirname, 'src')
    },
    {
      // 命中 SCSS 文件
      test: /\.scss$/,
      // 使用一组 Loader 去处理 SCSS 文件。
      // 处理顺序为从后到前，即先交给 sass-loader 处理，再把结果交给 css-loader 最后再给 style-loader。
      use: ['style-loader', 'css-loader', 'sass-loader'],
      // 排除 node_modules 目录下的文件
      exclude: path.resolve(__dirname, 'node_modules'),
    },
    {
      // 对非文本文件采用 file-loader 加载
      test: /\.(gif|png|jpe?g|eot|woff|ttf|svg|pdf)$/,
      use: ['file-loader'],
    },
  ]
}
//其中test,include和exclude支持数组来解析不同路径下的文件
//use也可以对象来表示loader
use: [
  {
    loader:'babel-loader',
    options:{
      cacheDirectory:true,
    },
    // enforce:'post' 的含义是把该 Loader 的执行顺序放到最后
    // enforce 的值还可以是 pre，代表把 Loader 的执行顺序放到最前面
    enforce:'post'
  },
  // 省略其它 Loader
]
```

通过配置noParse属性来忽略jquery等第三方库以提高性能
可以是正则或者function
```js

noParse: /jquery|chartjs/


```


##Resolve
配置webpack如何寻找依赖模块对应的文件
###alias
相当于替换路径的一部分
```js

resolve:{
  alias:{
    components: './src/components/'
  }
}
上面的代码使得我在
import XXX from 'components/AAA'是变成了
import XXX from './src/components/AAA'

但这样所有components都会被替换，可以通过加$来像正则
一样只对以改key结尾的路径替换
```

##DevServer


两份webpack.config配置文件，一份用于开发，一份用于生产环境
```js
const path = require('path');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');

module.exports = function (env = {}, argv) {
  const plugins = [];

  const isProduction = env['production'];

  // 在生成环境才压缩
  if (isProduction) {
    plugins.push(
      // 压缩输出的 JS 代码
      new UglifyJsPlugin()
    )
  }

  return {
    plugins: plugins,
    // 在生成环境不输出 Source Map
    devtool: isProduction ? undefined : 'source-map',
  };
}
```

function两参，第一参为object ,env
命令webpack --env.production --env.bao=foo使得env参数为bao和production

第二参为argv,是所有webpack后的参数，包括env

function也支持返回一个Promise对象来异步返回一份配置

#实战

##关于Es6
将es6语法转化为es5语法的babel,很显然配置的是loader
babel编译文件回去读取.babelrc的配置，这是一个json
{
    //控制使用那些插件如何去转化代码
    plugins: [
    [
        //npm i -D babel-plugin-transfrom-runtime(减少冗余代码)
        //必须和babel-runtime配套使用
        "transform-runtime",
        {
            polyfill: false
        }
    ]
    ],
    //被转化的源码中使用了哪些新特性
    "presets": [
    [
        "es2015",
        {
            "modules": false
        }
    ],
    "stage-2",
    "react"
    ]
}

```js
// Webpack 接入 Babel 必须依赖的模块
//npm i -D babel-core babel-loader 
// 根据你的需求选择不同的 Plugins 或 Presets
npm i -D babel-preset-env
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
      },
    ]
  },
  // 输出 source-map 方便直接调试 ES6 源码
  devtool: 'source-map'
};
```

