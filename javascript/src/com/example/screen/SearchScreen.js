let m = require("com/example/util/ActionContainer")
let newActionContainer = m.newActionContainer
let newAction = m.newAction
let random = require("com/example/util/random")

/**
 * 随机获取需要搜索的文字
 *
 * @param {GlobalObjects} globalObjects - 全局对象，包含了所有需要的全局对象
 * @returns {string|null} - 返回需要搜索的文字，如果没有可用的搜索文本则返回 null
 */
function getSearchText(globalObjects) {
    let searchTexts = globalObjects.xhsStorage.readConfig().searchTexts
    if (searchTexts == null || searchTexts.length == 0) {
        return null
    }
    let searchText = random.getRandomElement(searchTexts)
    globalObjects.$console.log(globalObjects.$stringResources.getString("search"), searchText)
    return searchText
}

/**
 * 创建一个新的搜索动作
 *
 * @param {GlobalObjects} globalObjects - 全局对象，包含了所有需要的全局对象
 * @returns {Action} - 新创建的搜索动作
 */
function newPerformSearchAction(globalObjects) {
    let $stringResources = globalObjects.$stringResources;
    let performSearchActionName = $stringResources.getString("perform_search_action")
    return newAction(performSearchActionName, function () {
        let $accessibility = globalObjects.$accessibility;
        let $console = globalObjects.$console;
        let $threads = globalObjects.$threads;
        // 如果是搜索的话，就执行搜索相关操作
        $console.log($stringResources.getString("perform_search_action"));
        // 获取搜索框，可以编辑并且可以获取焦点的节点一般为编辑框
        let node = $accessibility.createSelector()
            .editable(function (isEditable) {
                return isEditable;
            })
            .focusable(function (isFocusable) {
                return isFocusable
            })
            .findOne(globalObjects.display.getId(), -1)
        if (node == null) {
            $console.error($stringResources.getString("no_editable_node"));
        } else {
            // 搜索框的文本内容
            let searchText = getSearchText(globalObjects);
            if (searchText == null) {
                $console.error($stringResources.getString("no_search_text"));
            } else {
                let result = node.setText(searchText)
                // 休眠一段时间防止操作过快
                $threads.sleep(3000);
                $console.log($stringResources.getString("set_search_text"), searchText, result);
                // 点击搜索按钮
                let searchTextButton = $accessibility.createSelector().text(function (text) {
                    return $stringResources.getString("search") == text;
                }).findOne(globalObjects.display.getId(), -1)
                if (searchTextButton == null) {
                    $console.error($stringResources.getString("no_search_button"));
                } else {
                    result = searchTextButton.click()
                    $console.log($stringResources.getString("click_search_button"), searchText, result);
                }
            }
        }
    }, 0, 2000);
}

/**
 * 创建一个搜索屏幕对象
 *
 * @param {GlobalObjects} globalObjects - 全局对象，包含了所有需要的全局对象
 * @returns {MobileScreen} - 新的搜索屏幕对象
 */
function newScreen(globalObjects) {
    let $accessibility = globalObjects.$accessibility;
    let $stringResources = globalObjects.$stringResources;
    let performSearchActionName = $stringResources.getString("perform_search_action")
    return {
        name: $stringResources.getString("search"),
        isScreen: function () {
            // 如果存在猜你喜欢的文字表明这是搜索页面
            let node = $accessibility.createSelector().text(function (text) {
                return $stringResources.getString("guess_you_like") == text
            }).findOne(globalObjects.display.getId(), -1);
            return node != null;
        },
        actionContainer: newActionContainer(
            [newPerformSearchAction(globalObjects)],
            function () {
                return [performSearchActionName]
            },
            globalObjects
        )
    };
}

module.exports = newScreen;