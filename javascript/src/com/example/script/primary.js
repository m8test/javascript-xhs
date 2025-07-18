// 小红书版本 8.92.0
// 需要搜索的内容
let m = require("com/example/util/AutoTask")
let AutoTask = m.AutoTask;
let xhsStorage = require("com/example/util/storage").newXhSStorage($storages)
let shell = $shells.newAdbShell($maps.mapOf())
let globalObjects = {
    shell: shell,
    $accessibility: $accessibility,
    $console: $console,
    $threads: $threads,
    $stringResources: $stringResources,
    $shellCommands: $shellCommands,
    xhsStorage: xhsStorage
}
let task = new AutoTask("com.xingin.xhs", globalObjects)

// 注册主页
let newHomeScreen = require("com/example/screen/HomeScreen")
task.addScreen(newHomeScreen(globalObjects));

// 注册搜索页
let newSearchScreen = require("com/example/screen/SearchScreen")
task.addScreen(newSearchScreen(globalObjects));

// 注册搜索结果页
let newSearchResultScreen = require("com/example/screen/SearchResultScreen")
task.addScreen(newSearchResultScreen(globalObjects))

// 注册详情页
let newDetailScreen = require("com/example/screen/DetailScreen")
task.addScreen(newDetailScreen(globalObjects))

// 评论列表页面
let newCommentListScreen = require("com/example/screen/CommentListScreen")
task.addScreen(newCommentListScreen(globalObjects))

// 用户个人页面
let newUserProfileScreen = require("com/example/screen/UserProfileScreen")
task.addScreen(newUserProfileScreen(globalObjects))

let newPrivateMessageScreen = require("com/example/screen/PrivateMessageScreen")
task.addScreen(newPrivateMessageScreen(globalObjects))

// 注册视频评论页
let newVideoCommentListScreen = require("com/example/screen/VideoCommentListScreen")
task.addScreen(newVideoCommentListScreen(globalObjects))

// 注册评论页
let newInputCommentScreen = require("com/example/screen/InputCommentScreen")
task.addScreen(newInputCommentScreen(globalObjects))

// WebViewActivity.getBridge() 用于获取 WebViewBridge 对象
let bridge = $webView.getBridge()

/**
 * 注册保存配置的方法供网页端调用
 *
 * @param {string} config - 要保存的配置字符串
 * @returns {string} - 保存结果，"true" 或 "false"
 */
bridge.registerHandler("saveConfig", (config) => {
    // config -> String
    let result = xhsStorage.saveConfig(config)
    $console.log($stringResources.getString("save_config"), config, result)
    return result.toString()
})

/**
 * 注册读取配置的方法供网页端调用
 *
 * @param {string} params - 调用参数
 * @returns {string} - 读取的配置对象的 JSON 字符串
 */
bridge.registerHandler("readConfig", (params) => {
    // params -> String
    let result = JSON.stringify(xhsStorage.readConfig())
    $console.log($stringResources.getString("read_config"), result)
    return result // 将配置对象转换为 JSON 字符串返回
})

/**
 * 注册运行或停止任务的方法供网页端调用
 *
 * @param {string} it - 调用参数
 * @returns {string} - 操作结果，"run" 或 "stop"
 */
bridge.registerHandler("runOrStop", (it) => {
    // it -> String
    let result = ""
    if (task.intervalId == -1) {
        task.run()
        result = "run"
    } else {
        task.stop()
        result = "stop"
    }
    return result
})

// Activity.start() 用于启动 Android 系统的 Activity
$activity.start()