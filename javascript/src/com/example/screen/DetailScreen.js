let m = require("com/example/util/ActionContainer")
let newActionContainer = m.newActionContainer
let newAction = m.newAction
let newBackAction = m.newBackAction
let random = require("com/example/util/random")

/**
 * 创建一个查看详情动作对象
 *
 * @param {GlobalObjects} globalObjects 全局对象
 * @returns {Action} 返回一个新的查看详情动作对象
 */
function newViewDetailAction(globalObjects) {
    let $stringResources = globalObjects.$stringResources;
    let $console = globalObjects.$console;
    let $accessibility = globalObjects.$accessibility;
    let $threads = globalObjects.$threads;
    let viewDetailActionName = $stringResources.getString("view_detail_action")
    return newAction(viewDetailActionName,
        function () {
            let config = globalObjects.xhsStorage.readConfig()
            let isLike = random.testChance(config.likeRate)
            let isComment = random.testChance(config.commentRate)
            let isFavorite = random.testChance(config.favoriteRate)
            // 随机滑动1-3次, 每次滑动h后等待1000-5000毫秒
            random.randomSwipeUp(globalObjects, 1, 3, 1000, 5000)
            let node = getSaySomethingNode($accessibility, $stringResources);
            if (node == null) {
                $console.error($stringResources.getString("cannot_find_say_something_node"))
            } else {
                // 查找兄弟节点，三个兄弟节点都有用
                let brothers = node.findBrothers($accessibility.createSelector().className(function (className) {
                    return className == "android.widget.Button"
                }), 3)
                if (brothers.getSize() == 3) {
                    $console.log($stringResources.getString("image_text_post"))
                    // 这是图文帖子
                    let likeButton = brothers.get(0)
                    let favoriteButton = brothers.get(1)
                    let commentButton = brothers.get(2)
                    $console.log($stringResources.getString("like"), likeButton.child(1).text())
                    $console.log($stringResources.getString("favorite"), favoriteButton.child(1).text())
                    $console.log($stringResources.getString("comment"), commentButton.child(1).text())
                    if (isLike) {
                        $console.log($stringResources.getString("click"), $stringResources.getString("like"), likeButton.click())
                        $threads.sleep(random.getRandomInt(1000, 3000))
                    }
                    if (isFavorite) {
                        $console.log($stringResources.getString("click"), $stringResources.getString("favorite"), favoriteButton.click())
                        $threads.sleep(random.getRandomInt(1000, 3000))
                    }
                    if (isComment) {
                        // 点击评论按钮
                        $console.log($stringResources.getString("click"), $stringResources.getString("comment"), commentButton.click())
                        $threads.sleep(random.getRandomInt(1000, 3000))
                    }
                } else {
                    // 还有可能是视频帖子
                    let operationListNode = $accessibility.createSelector()
                        .className(function (className) {
                            return className == "android.widget.LinearLayout"
                        })
                        .childCount(function (count) {
                            return count == 5;
                        })
                        .child(0, $accessibility.createSelector().className(function (className) {
                            return className == "android.widget.Button"
                        }))
                        .child(1, $accessibility.createSelector().className(function (className) {
                            return className == "android.widget.Button"
                        }))
                        .child(2, $accessibility.createSelector().className(function (className) {
                            return className == "android.widget.Button"
                        }))
                        .child(3, $accessibility.createSelector().className(function (className) {
                            return className == "android.widget.Button"
                        }))
                        .child(4, $accessibility.createSelector().className(function (className) {
                            return className == "android.widget.Button"
                        }))
                        .findOne(3000);
                    if (operationListNode != null) {
                        $console.log($stringResources.getString("video_post"))
                        let likeButton = operationListNode.child(0)
                        let favoriteButton = operationListNode.child(2)
                        let commentButton = operationListNode.child(1)
                        // 找到了操作列表
                        $console.log($stringResources.getString("like"), likeButton.child(0).text())
                        $console.log($stringResources.getString("comment"), commentButton.child(1).text())
                        $console.log($stringResources.getString("favorite"), favoriteButton.child(1).text())
                        if (isLike) {
                            $console.log($stringResources.getString("click"), $stringResources.getString("like"), likeButton.click())
                            $threads.sleep(random.getRandomInt(1000, 3000))
                        }
                        if (isFavorite) {
                            $console.log($stringResources.getString("click"), $stringResources.getString("favorite"), favoriteButton.click())
                            $threads.sleep(random.getRandomInt(1000, 3000))
                        }
                        if (isComment) {
                            // 点击评论按钮
                            $console.log($stringResources.getString("click"), $stringResources.getString("comment"), commentButton.click())
                            $threads.sleep(random.getRandomInt(1000, 3000))
                        }
                    } else {
                        $console.error($stringResources.getString("not_a_post"))
                    }
                }
            }
            // 浏览一段时间
            $threads.sleep(random.getRandomInt(0, globalObjects.xhsStorage.readConfig().viewDetailTime))
        }, 0, 1000)
}

/**
 *
 * @param {Packages.com.m8test.accessibility.api.Accessibility} $accessibility
 * @param {Packages.com.m8test.script.core.api.resource.StringResources} $stringResources
 */
function getSaySomethingNode($accessibility, $stringResources) {
    return $accessibility.createSelector()
        .text(function (text) {
            return text == $stringResources.getString("say_something");
        })
        .findOne(3000)
}

/**
 * 创建一个帖子详情界面对象
 *
 * @param {GlobalObjects} globalObjects 全局对象, 包含了所有需要的全局对象
 * @returns {MobileScreen} 新的搜索屏幕对象
 */
function newScreen(globalObjects) {
    let $accessibility = globalObjects.$accessibility;
    let $stringResources = globalObjects.$stringResources;
    let viewDetailAction = newViewDetailAction(globalObjects)
    let backAction = newBackAction(globalObjects)
    let isViewDetail = false
    return {
        name: $stringResources.getString("post_detail"),
        isScreen: function () {
            // 需要说点什么的TextView
            return getSaySomethingNode($accessibility, $stringResources) != null;
        },
        actionContainer: newActionContainer(
            [viewDetailAction, backAction],
            function () {
                let result;
                if (isViewDetail) {
                    // 如果之前已经浏览过详情页
                    result = [backAction.name]
                } else {
                    // 如果没有浏览过详情页则浏览详情页
                    result = [viewDetailAction.name]
                }
                isViewDetail = !isViewDetail;
                return result;
            },
            globalObjects
        ),
    };
}

module.exports = newScreen;