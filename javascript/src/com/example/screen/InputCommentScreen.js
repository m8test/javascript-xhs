let m = require("com/example/util/ActionContainer")
let newActionContainer = m.newActionContainer
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
    let $accessibility = globalObjects.$accessibility;
    let $threads = globalObjects.$threads;
    let viewDetailActionName = $stringResources.getString("view_detail_action")
    return newAction(viewDetailActionName,
        function () {
            let node = getToolsNode(globalObjects.$accessibility, globalObjects.$stringResources, globalObjects.display)
            if (node == null) {
                $console.error($stringResources.getString("no_tools_node"))
            } else {
                // 获取输入节点
                let inputNode = $accessibility.createSelector().editable(function (isEditable) {
                    return isEditable;
                }).findOne(globalObjects.display.getId(), -1)
                if (inputNode == null) {
                    $console.error($stringResources.getString("no_input_node"))
                } else {
                    let text = random.getRandomElement(globalObjects.xhsStorage.readConfig().commentTexts)
                    $console.log($stringResources.getString("input_comment"), text, inputNode.setText(text))
                    $threads.sleep(random.getRandomInt(1000, 3000))
                    // 点击发送按钮
                    $console.log($stringResources.getString("click"), $stringResources.getString("send"), node.child(4).click())
                    $threads.sleep(random.getRandomInt(1000, 3000))
                }
            }
        }, 0, 1000)
}

/**
 * 获取发送评论所需的工具栏节点
 *
 * @param {Packages.com.m8test.accessibility.api.Accessibility} $accessibility - 无障碍操作对象
 * @param {Packages.com.m8test.script.core.api.resource.StringResources} $stringResources - 字符串资源对象
 * @param {Packages.com.m8test.script.core.api.display.Display} display - 虚拟屏幕对象
 * @returns {Packages.com.m8test.accessibility.api.AccessibilityNode|null} - 工具栏节点，如果未找到则返回 null
 */
function getToolsNode($accessibility, $stringResources, display) {
    return $accessibility.createSelector()
        .className(function (className) {
            return className == "android.view.ViewGroup"
        })
        .childCount(function (count) {
            return count == 6;
        })
        .child(0, $accessibility.createSelector().className(function (className) {
            return className == "android.widget.ImageView"
        }))
        .child(1, $accessibility.createSelector().className(function (className) {
            return className == "android.widget.ImageView"
        }))
        .child(2, $accessibility.createSelector().className(function (className) {
            return className == "android.widget.ImageView"
        }))
        .child(3, $accessibility.createSelector().className(function (className) {
            return className == "android.widget.ImageView"
        }))
        .child(4, $accessibility.createSelector().className(function (className) {
            return className == "android.widget.TextView"
        })
            .text(function (text) {
                return text == $stringResources.getString("send")
            }))
        .findOne(display.getId(), -1)
}

/**
 * 创建一个输入评论屏幕对象
 *
 * @param {GlobalObjects} globalObjects - 全局对象，包含了所有需要的全局对象
 * @returns {MobileScreen} - 新的输入评论屏幕对象
 */
function newScreen(globalObjects) {
    let $accessibility = globalObjects.$accessibility;
    let $stringResources = globalObjects.$stringResources;
    let sendAction = newSendAction(globalObjects)
    return {
        name: $stringResources.getString("input_comment"),
        isScreen: function () {
            // 需要发送工具栏
            return getToolsNode($accessibility, $stringResources, globalObjects.display) != null;
        },
        actionContainer: newActionContainer(
            [sendAction],
            function () {
                return [sendAction.name]
            },
            globalObjects
        ),
    };
}

module.exports = newScreen;