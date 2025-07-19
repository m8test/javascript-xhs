let m = require("com/example/util/ActionContainer")
let newActionContainer = m.newActionContainer
let newAction = m.newAction
let newBackAction = m.newBackAction
let random = require("com/example/util/random")

/**
 * 创建一个发送消息动作对象
 *
 * @param {GlobalObjects} globalObjects - 全局对象，包含了所有需要的全局对象
 * @returns {Action} - 返回一个新的发送消息动作对象
 */
function newSendMessageAction(globalObjects) {
    let $stringResources = globalObjects.$stringResources;
    let $console = globalObjects.$console;
    let $accessibility = globalObjects.$accessibility;
    let $threads = globalObjects.$threads;
    let actionName = $stringResources.getString("click_user_avatar_action")
    return newAction(actionName,
        function () {
            let node = getInputMessageNode($accessibility);
            if (node == null) {
                $console.error($stringResources.getString("cannot_find_user_comment_node"))
            } else {
                // 找到用户评论节点后，点击用户头像
                let sendText = random.getRandomElement(globalObjects.xhsStorage.readConfig().privateMessageTexts)
                $console.log($stringResources.getString("input_text"), node.child(1).child(0).setText(sendText))
                $threads.sleep(random.getRandomInt(1000, 3000))
                // 点击发送按钮
                let sendButton = $accessibility.createSelector()
                    .parent($accessibility.createSelector().className(function (className) {
                        return className == "android.widget.RelativeLayout"
                    }))
                    .text(function (text) {
                        return text == $stringResources.getString("send")
                    })
                    .className(function (className) {
                        return className == "android.widget.TextView"
                    }).findOne(3000)
                $console.log($stringResources.getString("send"), sendButton.click())
            }
        }, 0, 1000)
}

/**
 * 获取输入消息所需的节点
 *
 * @param {Packages.com.m8test.accessibility.api.Accessibility} $accessibility - 无障碍操作对象
 * @returns {Packages.com.m8test.accessibility.api.AccessibilityNode|null} - 输入消息节点，如果未找到则返回 null
 */
function getInputMessageNode($accessibility) {
    return $accessibility.createSelector()
        // 节点名称为 ViewGroup
        .className(function (className) {
            return className == "android.view.ViewGroup"
        })
        // 有 4 个子节点，分别语音、输入框、表情以及添加按钮
        .childCount(function (count) {
            return count == 4;
        })
        // 语音按钮
        .child(0, $accessibility.createSelector().className(function (className) {
            return className == "android.widget.ImageView"
        }))
        // 索引为 1 的子节点 FrameLayout，并且其索为 1 的子节点为 EditText(输入框)
        .child(1, $accessibility.createSelector()
            .className(function (className) {
                return className == "android.widget.FrameLayout"
            })
            .child(0, $accessibility.createSelector().className(function (className) {
                return className == "android.widget.EditText"
            }))
        )
        .findOne(3000)
}

/**
 * 创建一个私信屏幕对象
 *
 * @param {GlobalObjects} globalObjects - 全局对象，包含了所有需要的全局对象
 * @returns {MobileScreen} - 新的私信屏幕对象
 */
function newScreen(globalObjects) {
    let $accessibility = globalObjects.$accessibility;
    let $stringResources = globalObjects.$stringResources;
    let clickUserAvatar = newSendMessageAction(globalObjects)
    let backAction = newBackAction(globalObjects)
    // 是否向用户私信
    let isPrivateMessageToUser = false
    return {
        name: $stringResources.getString("private_message"),
        isScreen: function () {
            return getInputMessageNode($accessibility) != null;
        },
        actionContainer: newActionContainer(
            [clickUserAvatar, backAction],
            function () {
                let node = globalObjects.$accessibility.createSelector()
                    .text(function (text) {
                        return text == globalObjects.$stringResources.getString("private_message_tips")
                    })
                    .findOne(3000)
                if (node != null) {
                    globalObjects.$console.log($stringResources.getString("private_message_tips"))
                    // 表示已经私信过了，直接返回即可
                    return [backAction.name]
                }
                let result;
                if (isPrivateMessageToUser) {
                    // 如果之前已经私信过用户
                    result = [backAction.name]
                } else {
                    // 如果没有私信过用户则私信用户(点击用户头像)
                    result = [clickUserAvatar.name]
                }
                isPrivateMessageToUser = !isPrivateMessageToUser;
                return result;
            },
            globalObjects
        ),
    };
}

module.exports = newScreen;