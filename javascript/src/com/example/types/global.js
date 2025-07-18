/**
 * 表示一个屏幕的类
 * @typedef {Object} MobileScreen
 * @property {string} name 屏幕名称
 * @property {()=>boolean} isScreen 判断是否为当前屏幕
 * @property {ActionContainer} actionContainer 如果是当前屏幕，通过actionContainer执行一组动作
 */

/**
 * 在某个页面需要执的动作
 *
 * @typedef {Object} Action
 * @property {string} name 动作名称
 * @property {()=>void} run 执行动作的函数
 * @property {number} runTimes 执行动作的次数
 * @property {number} waitTime 执行动作后的等待时间，单位毫秒
 */

/**
 * 动作容器，用于封装一组动作, 当处于某个屏幕时会通过该容器执行一组动作
 *
 * @typedef {Object} ActionContainer
 * @property {Array<Action>} actions 执行的动作列表
 * @property {()=>Array<String>} getActionNames 获取需要执行的动作名称, 如果判断是某个页面时都会执行一次
 * @property {()=>void} run 执行动作容器
 */

/**
 * 小红书自动化相关配置
 *
 * @typedef {Object} XHSConfig
 * @property {number} viewDetailTime 查看详情的时间, 在详情页面停留的时间，单位为毫秒
 * @property {number} searchResultViewCount 搜索结果页面查看的次数, 如果达到这个次数会重新搜索
 * @property {Array<String>} searchTexts 搜索的文本列表, 搜索时会随机选择一个文本进行搜索
 * @property {Array<String>} commentTexts 评论的文本列表, 评论时会随机选择一个文本进行评论
 * @property {Array<String>} privateMessageTexts 私信的文本列表, 私信时会随机选择一个文本进行私信
 * @property {number} commentRate 评论的概率, 0-100的整数, 代表评论的概率
 * @property {number} privateMessageRate 私信的概率, 0-100的整数, 代表私信的概率
 * @property {number} likeRate 点赞的概率, 0-100的整数, 代表点赞的概率
 * @property {number} favoriteRate 收藏的概率, 0-100的整数, 代表收藏的概率
 */

/**
 * @typedef {Object} XhSStorage
 * @property {(string) => boolean} saveConfig 保存配置到存储中
 * @property {()=>XHSConfig} readConfig 从存储中读取配置
 */

/**
 * @typedef {Object} GlobalObjects
 * @property {Packages.com.m8test.accessibility.api.Accessibility} $accessibility 用于无障碍操作的全局对象
 * @property {Packages.com.m8test.script.core.api.console.Console} $console 用于日志输出的全局对象
 * @property {Packages.com.m8test.script.core.api.resource.StringResources} $stringResources 用于加载脚本字符串资源的全局对象
 * @property {Packages.com.m8test.script.core.api.thread.Threads} $threads 线程对象，用于执行异步任务
 * @property {Packages.com.m8test.script.core.api.shell.ShellCommands} $shellCommands shell命令对象
 * @property {Packages.com.m8test.script.core.api.shell.Shell} shell 执行adb命令的shell对象
 * @property {XhSStorage} xhsStorage 小红书相关存储对象
 */