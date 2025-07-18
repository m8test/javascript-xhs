/**
 * 创建一个小红书存储对象，用于保存和读取配置
 *
 * @param {Packages.com.m8test.script.core.api.storage.Storages} $storages - 用于存储数据的全局对象
 * @returns {XhSStorage} - 返回一个新的存储对象
 */
function newXhSStorage($storages) {
    let storage = $storages.get("xhs_config");
    return {
        /**
         * 从存储中读取配置
         *
         * @returns {XHSConfig} - 读取的配置对象
         */
        readConfig: function () {
            let s = storage.get("config", null)
            if (s == null) {
                return {
                    viewDetailTime: 5000,
                    searchResultViewCount: 5,
                    searchTexts: [],
                    commentTexts: [],
                    privateMessageTexts: [],
                    privateMessageRate: 30,
                    commentRate: 10,
                    likeRate: 10,
                    favoriteRate: 10
                }
            } else {
                /**
                 * @type {XHSConfig}
                 */
                return JSON.parse(s)
            }
        },
        /**
         * 保存配置到存储中
         *
         * @param {string} config - 要保存的配置字符串
         * @returns {boolean} - 保存是否成功
         */
        saveConfig: function (config) {
            return storage.put("config", config)
        }
    }
}

module.exports = {newXhSStorage: newXhSStorage}