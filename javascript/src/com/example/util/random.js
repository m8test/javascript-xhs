/**
 * 生成一个在 min 和 max 之间的随机整数（包括 min 和 max）
 *
 * @param {number} min - 范围的最小值
 * @param {number} max - 范围的最大值
 * @returns {number} - 返回一个范围内的随机整数
 */
function getRandomInt(min, max) {
    // 确保 min 和 max 是整数
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    // 公式核心：Math.random() * (范围大小) + 偏移量
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1)) + minCeiled;
}

/**
 * 随机向上滑动屏幕指定次数
 *
 * @param {GlobalObjects} globalObjects - 全局对象，包含了所有需要的全局对象
 * @param {number} minTimes - 向上滑动次数的最小次数
 * @param {number} maxTimes - 向上滑动次数的最大次数
 * @param {number} minSleepTime - 随机休眠时间的最小值
 * @param {number} maxSleepTime - 随机休眠时间的最大值
 */
function randomSwipeUp(globalObjects, minTimes, maxTimes, minSleepTime, maxSleepTime) {
    let $console = globalObjects.$console;
    let $stringResources = globalObjects.$stringResources;
    let $threads = globalObjects.$threads;
    let times = getRandomInt(minTimes, maxTimes);
    let display = globalObjects.display;
    $console.log($stringResources.getString("swipe_up_times"), times);
    for (let i = 0; i < times; i++) {
        let sleepTime = getRandomInt(minSleepTime, maxSleepTime);
        display.getController().scroll(function (config) {
            let width = display.getWidth()
            let height = display.getHeight()
            // 滑动开始点x坐标 - 在屏幕宽度30%-70%之间随机
            config.setStartX(Math.floor(width * (0.3 + Math.random() * 0.4)));
            // 滑动开始点y坐标 - 在屏幕高度60%-80%之间随机（偏下方）
            config.setStartY(Math.floor(height * (0.6 + Math.random() * 0.2)));
            // 水平滑动距离 - 使用屏幕宽度比例，范围在-3%到3%之间
            config.setHorizontalDelta(Math.floor(width * (Math.random() * 0.06 - 0.03)));
            // 垂直滑动距离 - 负值表示向上滑动，滑动距离为屏幕高度的30%-50%
            config.setVerticalDelta(-Math.floor(height * (0.3 + Math.random() * 0.2)));
        })
        // 先向上滑动
        $console.log($stringResources.getString("swipe_up"), $stringResources.getString("waiting_for"), sleepTime, $stringResources.getString("milliseconds"));
        $threads.sleep(sleepTime);
    }
}

/**
 * 根据给定的概率（0 - 100 的整数）返回 true 或 false
 *
 * @param {number} percentage - 一个 0 到 100 之间的整数，代表成功的概率
 * @returns {boolean} - 如果成功则返回 true，否则返回 false
 */
function testChance(percentage) {
    // 1. 输入验证和处理
    if (typeof percentage !== 'number' || isNaN(percentage)) {
        console.error("输入必须是数字！");
        return false; // 或者可以抛出错误 throw new Error(...)
    }

    // 2. 处理边缘情况，同时也处理了 >100 或 <0 的情况
    if (percentage >= 100) {
        return true; // 概率大于等于 100%，永远成功
    }
    if (percentage <= 0) {
        return false; // 概率小于等于 0%，永远失败
    }

    // 3. 核心概率计算
    return Math.random() < (percentage / 100);
}

/**
 * 在矩形区域中随机获取一个点
 *
 * @param {Packages.android.graphics.Rect} rect - 矩形区域
 * @returns {Packages.android.graphics.Point} - 返回一个随机点
 */
function getRandomPointFromRect(rect) {
    return new Packages.android.graphics.Point(getRandomInt(rect.left, rect.right), getRandomInt(rect.top, rect.bottom));
}

/**
 * 从给定的数组中随机选择并返回一个元素
 *
 * @template T - 数组中元素的类型。此泛型参数确保返回值的类型与数组元素的类型一致
 * @param {Array<T>} arr - 要从中随机选择一个元素的数组
 * @returns {T | null} - 从数组中随机选择的一个元素。如果数组为空或输入不是一个有效的数组，则返回 null
 */
function getRandomElement(arr) {
    // 校验输入是否为数组且不为空
    if (!Array.isArray(arr) || arr.length === 0) {
        return null;
    }

    // 生成一个 0 到 arr.length - 1 之间的随机整数索引
    const randomIndex = Math.floor(Math.random() * arr.length);

    // 返回该索引对应的元素
    return arr[randomIndex];
}

module.exports = {
    getRandomInt: getRandomInt,
    randomSwipeUp: randomSwipeUp,
    testChance: testChance,
    getRandomPointFromRect: getRandomPointFromRect,
    getRandomElement: getRandomElement
};