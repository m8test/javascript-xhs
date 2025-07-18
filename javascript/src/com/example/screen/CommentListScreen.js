let m = require("com/example/util/ActionContainer")
let newActionContainer = m.newActionContainer
let newAction = m.newAction
let newBackAction = m.newBackAction
let random = require("com/example/util/random")

/**
 * 创建一个点击用户头像动作对象
 *
 * @param {GlobalObjects} globalObjects 全局对象
 * @returns {Action} 返回一个新的点击用户头像动作对象
 */
function newClickUserAvatarAction(globalObjects) {
    let $stringResources = globalObjects.$stringResources;
    let $console = globalObjects.$console;
    let $accessibility = globalObjects.$accessibility;
    let $threads = globalObjects.$threads;
    let actionName = $stringResources.getString("click_user_avatar_action")
    return newAction(actionName,
        function () {
            let config = globalObjects.xhsStorage.readConfig()
            let isPrivateMessageToUser = random.testChance(config.privateMessageRate)
            let node = getUserCommentNode($accessibility);
            if (node == null) {
                $console.error($stringResources.getString("cannot_find_user_comment_node"))
            } else {
                if (isPrivateMessageToUser) {
                    // 找到用户评论节点后, 点击用户头像
                    $console.log($stringResources.getString("click_user_avatar"), node.child(0).child(0).click())
                    $threads.sleep(random.getRandomInt(1000, 3000))
                }
            }
        }, 0, 1000)
}

/**
 * 获取用户评论节点
 * @param {Packages.com.m8test.accessibility.api.Accessibility} $accessibility
 */
function getUserCommentNode($accessibility) {
    return $accessibility.createSelector()
        // 父节点是LinearLayout
        .parent($accessibility.createSelector().className(function (className) {
            return className == "android.widget.LinearLayout"
        }))
        // 节点名称为LinearLayout
        .className(function (className) {
            return className == "android.widget.LinearLayout"
        })
        // 有3个子节点, 分别是头像，评论内容以及右边的点赞图标
        .childCount(function (count) {
            return count == 3;
        })
        // 索引为1的子节点LinearLayout, 并且其索为1的子节点为TextView(用户名)
        .child(1, $accessibility.createSelector()
            .className(function (className) {
                return className == "android.widget.LinearLayout"
            })
            .child(1, $accessibility.createSelector().className(function (className) {
                return className == "android.widget.TextView"
            }))
        )
        .findOne(3000)
}

/**
 * 创建一个点击详情动作对象
 *
 * @param {GlobalObjects} globalObjects 全局对象, 包含了所有需要的全局对象
 * @returns {MobileScreen} 新的搜索屏幕对象
 */
function newScreen(globalObjects) {
    let $accessibility = globalObjects.$accessibility;
    let $stringResources = globalObjects.$stringResources;
    let clickUserAvatar = newClickUserAvatarAction(globalObjects)
    let backAction = newBackAction(globalObjects)
    // 是否向用户私信
    let isPrivateMessageToUser = false
    return {
        name: $stringResources.getString("post_detail"),
        isScreen: function () {
            // 需要说点什么的TextView
            return getUserCommentNode($accessibility) != null;
        },
        actionContainer: newActionContainer(
            [clickUserAvatar, backAction],
            function () {
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