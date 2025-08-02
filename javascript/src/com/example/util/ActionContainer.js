let random = require("com/example/util/random")

/**
 * 创建一个新的动作容器
 *
 * @param {Array<Action>} actions - 动作数组
 * @param {function(): Array<String>} getActionNames - 获取动作名称的函数
 * @param {GlobalObjects} globalObjects - 全局对象，包含了所有需要的全局对象
 * @returns {ActionContainer} - 返回一个新的动作容器对象
 */
function newActionContainer(actions, getActionNames, globalObjects) {
    return {
        actions: actions,
        getActionNames: getActionNames,
        run: function () {
            let $console = globalObjects.$console;
            let $stringResources = globalObjects.$stringResources;
            let $threads = globalObjects.$threads;
            let actionNames = this.getActionNames()
            let realActions = this.actions.filter(action => actionNames.indexOf(action.name) != -1);
            if (realActions.length == 0)
                $console.warn($stringResources.getString("no_action_found"))
            realActions.forEach(action => {
                $console.log(action.name, $stringResources.getString("run_start"));
                action.run()
                $console.log(action.name, $stringResources.getString("run_end"));
                // 等待一段时间再执行下一个动作
                $threads.sleep(action.waitTime)
            })
        }
    }
}

/**
 * 创建一个新的动作
 *
 * @param {string} name - 动作名称
 * @param {function(): void} action - 动作执行函数
 * @param {number} [runtimes=0] - 初始运行次数
 * @param {number} [waitTime=1000] - 动作执行后的等待时间，单位为毫秒
 * @returns {Action} - 返回一个新的动作对象
 */
function newAction(name, action, runtimes, waitTime) {
    return {
        name: name,
        run: function () {
            action()
            this.runTimes++;
        },
        runTimes: runtimes || 0,
        waitTime: waitTime || 1000
    }
}

/**
 * 返回操作, 如果查看了多次详情，那么需要重新搜索
 *
 * @param {GlobalObjects} globalObjects - 全局对象
 * @returns {Action} - 返回一个新的返回动作对象
 */
function newBackAction(globalObjects) {
    let $stringResources = globalObjects.$stringResources;
    return {
        name: $stringResources.getString("back"),
        run: function () {
            // 执行返回操作
            globalObjects.display.getController().pressBack()
            let waitTime = random.getRandomInt(1000, 3000)
            globalObjects.$console.log($stringResources.getString("back"), $stringResources.getString("waiting_for") + waitTime + "ms")
            globalObjects.$threads.sleep(waitTime);
        },
        runTimes: 0,
        waitTime: 1000
    }
}

module.exports = {newActionContainer, newAction, newBackAction};