let m = require("com/example/util/ActionContainer")
let newActionContainer = m.newActionContainer
let newAction = m.newAction
let newBackAction = m.newBackAction
let random = require("com/example/util/random")

/**
 * 创建一个点击私信按钮动作对象
 *
 * @param {GlobalObjects} globalObjects - 全局对象，包含了所有需要的全局对象
 * @returns {Action} - 返回一个新的点击私信按钮动作对象
 */
function newClickMessageButtonAction(globalObjects) {
    let $stringResources = globalObjects.$stringResources;
    let $console = globalObjects.$console;
    let $accessibility = globalObjects.$accessibility;
    let $threads = globalObjects.$threads;
    let actionName = $stringResources.getString("click_private_message_button_action")
    return newAction(actionName,
        function () {
            let node = getToolsNode($accessibility);
            if (node == null) {
                $console.error($stringResources.getString("no_tools_node"))
            } else {
                // 找到节点后点击私信图标
                $console.log($stringResources.getString("click"), $stringResources.getString("private_message"), node.child(1).child(1).click())
                $threads.sleep(random.getRandomInt(1000, 3000))
            }
        }, 0, 1000)
}

/**
 * 获取用户资料页的工具节点
 *
 * @param {Packages.com.m8test.accessibility.api.Accessibility} $accessibility - 无障碍操作对象
 * @returns {Packages.com.m8test.accessibility.api.AccessibilityNode|null} - 工具节点，如果未找到则返回 null
 */
function getToolsNode($accessibility) {
    return $accessibility.createSelector()
        // 节点名称为 LinearLayout
        .className(function (className) {
            return className == "android.view.ViewGroup"
        })
        // 有 2 个子节点，分别是左边的关注、粉丝以获赞与收藏以及右边的关注和私信
        .childCount(function (count) {
            return count == 2;
        })
        .child(0, $accessibility.createSelector()
            .className(function (className) {
                return className == "android.view.ViewGroup"
            })
            // 关注
            .child(0, $accessibility.createSelector().className(function (className) {
                return className == "android.widget.Button"
            }))
            // 粉丝
            .child(1, $accessibility.createSelector().className(function (className) {
                return className == "android.widget.Button"
            }))
            // 获赞与收藏
            .child(2, $accessibility.createSelector().className(function (className) {
                return className == "android.widget.Button"
            }))
        )
        // 索引为 1 的子节点 LinearLayout，并且其索为 1 的子节点为 ImageView(私信)
        .child(1, $accessibility.createSelector()
            .className(function (className) {
                return className == "android.widget.LinearLayout"
            })
            .child(1, $accessibility.createSelector().className(function (className) {
                return className == "android.widget.ImageView"
            }))
        )
        .findOne(3000)
}

/**
 * 创建一个用户资料屏幕对象
 *
 * @param {GlobalObjects} globalObjects - 全局对象，包含了所有需要的全局对象
 * @returns {MobileScreen} - 新的用户资料屏幕对象
 */
function newScreen(globalObjects) {
    let $accessibility = globalObjects.$accessibility;
    let $stringResources = globalObjects.$stringResources;
    let clickMessageButton = newClickMessageButtonAction(globalObjects)
    let backAction = newBackAction(globalObjects)
    // 是否向用户私信
    let isPrivateMessageToUser = false
    return {
        name: $stringResources.getString("post_detail"),
        isScreen: function () {
            return getToolsNode($accessibility) != null;
        },
        actionContainer: newActionContainer(
            [clickMessageButton, backAction],
            function () {
                let result;
                if (isPrivateMessageToUser) {
                    // 如果之前已经私信过用户
                    result = [backAction.name]
                } else {
                    // 如果没有私信过用户则私信用户(点击私信按钮)
                    result = [clickMessageButton.name]
                }
                isPrivateMessageToUser = !isPrivateMessageToUser;
                return result;
            },
            globalObjects
        ),
    };
}

module.exports = newScreen;