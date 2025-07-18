let m = require("com/example/util/ActionContainer")
let newActionContainer = m.newActionContainer
let newAction = m.newAction
let newBackAction = m.newBackAction
let random = require("com/example/util/random")

/**
 * 创建一个查看详情动作对象
 *
 * @param {GlobalObjects} globalObjects - 全局对象
 * @returns {Action} - 返回一个新的查看详情动作对象
 */
function newViewDetailAction(globalObjects) {
    let $stringResources = globalObjects.$stringResources;
    let viewDetailActionName = $stringResources.getString("click_post_action")
    return newAction(viewDetailActionName,
        function () {
            let $accessibility = globalObjects.$accessibility;
            let $console = globalObjects.$console;
            // 随机滑动1-3次, 每次滑动后等待1000-5000毫秒
            random.randomSwipeUp(globalObjects, 1, 3, 1000, 5000)
            // 优先查看视频帖子, 选择类为 android.widget.RelativeLayout 并且其直接子节点依次为 android.widget.ImageView, android.widget.ImageView、android.widget.TextView以及android.widget.LinearLayout 的节点
            let videoPost = $accessibility.createSelector()
                .className(function (cn) {
                    return cn == "android.widget.RelativeLayout"
                })
                .child(0, $accessibility.createSelector().className(function (cn) {
                    return cn == "android.widget.ImageView"
                }))
                .child(1, $accessibility.createSelector().className(function (cn) {
                    return cn == "android.widget.ImageView"
                }))
                .child(2, $accessibility.createSelector().className(function (cn) {
                    return cn == "android.widget.TextView"
                }))
                .child(3, $accessibility.createSelector().className(function (cn) {
                    return cn == "android.widget.LinearLayout"
                }))
                .findOne(3000);
            if (videoPost != null) {
                // 找到视频帖, 点击视频贴
                let result = videoPost.parent().click();
                let textNode = videoPost.child(2);
                $console.log(textNode.text(), result);
            } else {
                // 图文贴, 选择类为 android.widget.RelativeLayout 并且其直接子节点依次为 android.widget.ImageView、android.widget.TextView以及android.widget.LinearLayout 的节点
                let imageTextNode = $accessibility.createSelector()
                    .className(function (cn) {
                        return cn == "android.widget.RelativeLayout"
                    })
                    .child(0, $accessibility.createSelector().className(function (cn) {
                        return cn == "android.widget.ImageView"
                    }))
                    .child(1, $accessibility.createSelector().className(function (cn) {
                        return cn == "android.widget.TextView"
                    }))
                    .child(2, $accessibility.createSelector().className(function (cn) {
                        return cn == "android.widget.LinearLayout"
                    }))
                    .findOne(3000);
                if (imageTextNode == null) {
                    $console.error($stringResources.getString("no_data_found"));
                } else {
                    let result = imageTextNode.parent().click();
                    let textNode = imageTextNode.child(1);
                    $console.log(textNode.text(), result);
                }
            }
        }, 0, 1000)
}

/**
 * 创建一个搜索结果屏幕对象
 *
 * @param {GlobalObjects} globalObjects - 全局对象, 包含了所有需要的全局对象
 * @returns {MobileScreen} - 新的搜索屏幕对象
 */
function newScreen(globalObjects) {
    let $accessibility = globalObjects.$accessibility;
    let $stringResources = globalObjects.$stringResources;
    let viewDetailAction = newViewDetailAction(globalObjects)
    let backAction = newBackAction(globalObjects)
    return {
        name: $stringResources.getString("search_result"),
        isScreen: function () {
            let isAll = $accessibility.createSelector()
                .text(function (text) {
                    return text == $stringResources.getString("all");
                })
                .findOne(3000) != null;
            let isComposite = $accessibility.createSelector()
                .text(function (text) {
                    return text == $stringResources.getString("composite");
                })
                .findOne(3000) != null;
            // 需要存在输入框以及搜索结果相关的节点
            return isAll && isComposite;
        },
        actionContainer: newActionContainer(
            [viewDetailAction, backAction],
            function () {
                if (viewDetailAction.runTimes >= globalObjects.xhsStorage.readConfig().searchResultViewCount) {
                    // 重置执行次数
                    viewDetailAction.runTimes = 0;
                    return [backAction.name]
                } else {
                    return [viewDetailAction.name]
                }
            },
            globalObjects
        ),
    };
}

module.exports = newScreen;