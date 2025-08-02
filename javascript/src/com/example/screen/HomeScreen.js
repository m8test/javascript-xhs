let m = require("com/example/util/ActionContainer")
let newActionContainer = m.newActionContainer
let newAction = m.newAction

/**
 * 创建一个新的搜索操作
 *
 * @param {GlobalObjects} globalObjects - 全局对象，包含了所有需要的全局对象
 * @returns {Action} - 新的搜索操作对象
 */
function newSearchAction(globalObjects) {
    let performSearchActionName = globalObjects.$stringResources.getString("click_search_action")
    return newAction(performSearchActionName, function () {
        let $accessibility = globalObjects.$accessibility;
        let $console = globalObjects.$console;
        let $stringResources = globalObjects.$stringResources;
        // 获取搜索按钮
        let node = $accessibility.createSelector().desc(function (desc) {
            return $stringResources.getString("search") == desc
        }).findOne(globalObjects.display.getId(), -1)
        if (node == null) {
            $console.error($stringResources.getString("no_search_button"));
        } else {
            let result = node.click();
            $console.log($stringResources.getString("click_search_button"), result);
        }
    }, 0, 2000);
}

/**
 * 创建一个首页的屏幕对象
 *
 * @param {GlobalObjects} globalObjects - 全局对象，包含了所有需要的全局对象
 * @returns {MobileScreen} - 新的首页屏幕对象
 */
function newScreen(globalObjects) {
    let $stringResources = globalObjects.$stringResources;
    let $accessibility = globalObjects.$accessibility;
    let performSearchActionName = $stringResources.getString("click_search_action")
    return {
        name: $stringResources.getString("home"),
        isScreen: function () {
            // 如果存在首页的文字并且处于选中状态才表明这是首页, 在模块脚本文件中如果需要使用中文字符串，则必须使用 $stringResources.getString() 方法获取中文字符串
            let node = $accessibility.createSelector().text(function (text) {
                return $stringResources.getString("home") == text
            }).findOne(globalObjects.display.getId(), -1);
            if (node == null) return false;
            return node.selected();
        },
        actionContainer: newActionContainer(
            [newSearchAction(globalObjects)],
            function () {
                return [performSearchActionName]
            },
            globalObjects),
    };
}

module.exports = newScreen;