let m = require("com/example/util/ActionContainer")
let newActionContainer = m.newActionContainer
let newBackAction = m.newBackAction
let newAction = m.newAction
let random = require("com/example/util/random")

/**
 * 创建一个发送评论动作对象
 *
 * @param {GlobalObjects} globalObjects - 全局对象，包含了所有需要的全局对象
 * @returns {Action} - 返回一个新的发送评论动作对象
 */
function newSendAction(globalObjects) {
    let $stringResources = globalObjects.$stringResources;
    let $console = globalObjects.$console;
    let $threads = globalObjects.$threads;
    let viewDetailActionName = $stringResources.getString("click") + $stringResources.getString("input_comment")
    return newAction(viewDetailActionName,
        function () {
            let node = getToolsNode(globalObjects.$accessibility, globalObjects.display)
            if (node == null) {
                $console.error($stringResources.getString("no_tools_node"))
            } else {
                $console.log($stringResources.getString("click"), $stringResources.getString("input_comment"), node.child(2).click())
                $threads.sleep(random.getRandomInt(1000, 3000))
            }
        }, 0, 1000)
}

/**
 * 获取发送评论所需的工具栏节点
 *
 * @param {Packages.com.m8test.accessibility.api.Accessibility} $accessibility - 无障碍操作对象
 * @param {Packages.com.m8test.script.core.api.display.Display} display - 虚拟屏幕对象
 * @returns {Packages.com.m8test.accessibility.api.AccessibilityNode|null} - 工具栏节点，如果未找到则返回 null
 */
function getToolsNode($accessibility, display) {
    return $accessibility.createSelector()
        .className(function (className) {
            return className == "android.view.ViewGroup"
        })
        .childCount(function (count) {
            return count == 9;
        })
        .child(2, $accessibility.createSelector().className(function (className) {
            return className == "android.widget.EditText"
        }))
        .child(3, $accessibility.createSelector().className(function (className) {
            return className == "android.widget.ImageView"
        }))
        .findOne(display.getId(), -1)
}

/**
 * 创建一个视频评论列表屏幕对象
 *
 * @param {GlobalObjects} globalObjects - 全局对象，包含了所有需要的全局对象
 * @returns {MobileScreen} - 新的视频评论列表屏幕对象
 */
function newScreen(globalObjects) {
    let $accessibility = globalObjects.$accessibility;
    let $stringResources = globalObjects.$stringResources;
    let sendAction = newSendAction(globalObjects)
    let backAction = newBackAction(globalObjects)
    let isComment = false
    return {
        name: $stringResources.getString("video_comment_list"),
        isScreen: function () {
            // 需要发送工具栏
            return getToolsNode($accessibility, globalObjects.display) != null;
        },
        actionContainer: newActionContainer(
            [sendAction, backAction],
            function () {
                let result;
                // 如果已经评论那么需要返回
                if (isComment) {
                    result = [backAction.name]
                } else {
                    result = [sendAction.name]
                }
                isComment = !isComment;
                return result;
            },
            globalObjects
        ),
    };
}

module.exports = newScreen;