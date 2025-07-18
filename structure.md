# 项目结构与核心概念文档

本文档旨在详细介绍自动化脚本项目的结构、核心组件及其工作流程。

## 资源文件 (Resource Files)

资源文件统一存放在 `res` 目录下，用于管理脚本运行所需的各类静态数据。

### `res/strings`

此目录用于存放字符串资源。例如，`zh.json` 文件定义了中文字符串资源。在脚本中，可以通过全局变量 `$stringResources` 的
`getString` 方法来读取这些内容。

> **最佳实践**：建议将脚本中用到的所有固定文本（如日志信息、UI提示等）在 `zh.json`
> 中进行定义。这样做不仅便于未来的国际化（多语言支持），也能有效避免在脚本模块中使用中文字符串时可能出现的乱码问题。

### `res/auto_start_spa.txt`

此文件用于配置打包后的应用（APK）在启动时是否自动执行脚本。文件内容应为 `true` 或 `false`。

### `res/copyright.txt`

此文件用于设置打包后应用在主界面底部显示的版权信息。例如：`© 2025 M8Test. All rights reserved.`。

### `res/official_website.txt`

此文件用于配置版权信息的点击事件。当用户点击底部版权文本时，应用将跳转到此处设置的网址。例如：`https://www.m8test.com`。

## 脚本代码文件 (Script Code)

这部分是项目自动化逻辑的核心。

#### 核心运行逻辑

项目代码的执行流程遵循以下模式：

1. **创建任务**：首先，创建一个 `AutoTask` 实例，它代表一个完整的自动化任务。
2. **添加屏幕**：通过 `AutoTask.addScreen` 方法向任务中添加一个或多个“屏幕”（Screen）。每个屏幕代表应用的一个特定界面，例如首页、搜索结果页、私信页等。
3. **运行任务**：调用 `AutoTask.run` 方法启动自动化任务。运行时，框架会自动识别当前设备界面匹配哪个已定义的“屏幕”，并执行该屏幕下相应的操作逻辑。
4. **停止任务**：通过 `AutoTask.stop` 方法可以随时终止自动化任务的执行。

#### `ActionContainer` 执行逻辑

每个“屏幕”所包含的一系列动作（Action）都由一个 `ActionContainer` 来管理。其执行逻辑如下：

1. **获取动作序列**：框架通过调用 `ActionContainer.getActionNames`
   方法获取一个包含动作名称的数组。该方法可以根据当前状态动态返回需要执行的动作序列，也可以返回一个固定的动作列表。
2. **执行动作**：框架根据获取到的动作名称，找到对应的动作对象，并执行其内部的 `run` 方法来完成具体操作。

### `com/example/screen`

此目录存放了自动化任务中所有“屏幕”的定义文件。每个 `.js` 文件通常代表一个屏幕，例如 `HomeScreen.js` 用于定义首页的行为和识别规则。

### `com/example/script`

此目录包含项目的主入口文件 `primary.js`，是整个自动化任务的起点。

### `com/example/types`

此目录存放了项目中使用的类型定义文件。它们主要用于增强代码编辑器（如 VS Code）的智能提示和类型检查，在脚本实际运行时并不会被加载，对功能没有直接影响。

### `com/example/util`

此目录存放了项目中用到的各类工具模块，例如随机数生成器、本地存储封装等，以便在不同脚本文件中复用。

## 项目UI文件 (Webview)

项目UI文件位于 `webview` 目录下，用于构建脚本的交互界面。您可以利用现代前端技术，甚至是 AI 辅助工具，来构建功能丰富且美观的用户界面。

### `index.html`

用于显示脚本UI的HTML文件。其编写方式与标准HTML文件完全相同，通常会引入 `style.css` 和 `index.js`。

### `style.css`

用于定义UI界面的样式表文件，编写方式与标准CSS文件完全相同。

### `index.js`

用于处理UI界面逻辑的JavaScript文件。它与普通的Web前端JS类似，但包含一个关键的初始化部分，用于与原生脚本进行通信。

```js
(function () {
    // 初始化函数，建立与原生脚本的通信桥梁
    function init() {
        /**
         * $webViewBridge.registerHandler() 用于注册一个处理器，供原生脚本端调用。
         * @param {string} handlerName - 处理器名称，脚本端将通过此名称调用。
         * @param {function(data, responseCallback)} handler - 处理器函数。
         *   - data: 从脚本端传递过来的数据。
         *   - responseCallback: 一个回调函数，用于将处理结果返回给脚本端。
         */
        // 示例：
        // $webViewBridge.registerHandler("functionForScriptToCall", function (data, responseCallback) {
        //     console.log("接收到来自脚本端的数据:", data);
        //     if (responseCallback) {
        //         var responseData = "我是来自 JavaScript 的返回结果";
        //         responseCallback(responseData);
        //     }
        // });

        // 在 $webViewBridge 初始化完成后，加载配置
        loadConfig();
    }

    // 监听 WebViewBridgeReady 事件，确保 $webViewBridge 对象可用
    if (window.$webViewBridge) {
        init();
    } else {
        document.addEventListener('WebViewBridgeReady', init, false);
    }
})();
```

#### UI与脚本的通信示例

**1. UI端（WebView）调用脚本端方法**

UI端可以通过 `$webViewBridge.callHandler` 来调用在原生脚本端注册的方法。例如，加载配置时调用脚本端的 `readConfig` 方法：

```js
function loadConfig() {
    // 调用脚本端的 "readConfig" 处理器
    $webViewBridge.callHandler("readConfig", "", function (savedConfig) {
        // 这个回调函数会接收到脚本端的返回值
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            // 使用配置数据更新UI界面...
            document.getElementById('viewDetailTime').value = config.viewDetailTime;
            // ... 其他UI更新逻辑
        }
    });
}
```

**2. 脚本端注册供UI调用的方法**

为了响应UI端的调用，原生脚本端需要在入口文件（如 `primary.js`）中注册相应的处理器：

```js
/**
 * 注册 "readConfig" 处理器，供 WebView UI 端调用。
 *
 * @param {string} params - 从 UI 端调用时传递的参数 (此处未使用)。
 * @returns {string} - 返回读取到的配置对象的 JSON 字符串。
 */
bridge.registerHandler("readConfig", (params) => {
    const config = xhsStorage.readConfig();
    const result = JSON.stringify(config);
    $console.log($stringResources.getString("read_config"), result);
    return result; // 将配置对象序列化为 JSON 字符串并返回
});
```

保存配置的功能也采用同样的通信机制：UI端将表单数据序列化为JSON字符串，通过 `callHandler` 发送到脚本端，脚本端再通过相应的
`registerHandler` 接收数据并执行保存操作。