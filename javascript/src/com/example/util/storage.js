/**
 * 表示一个存储对象
 *
 * @param {Packages.com.m8test.script.core.api.storage.Storages} $storages 用于存储数据的全局对象
 * @returns {XhSStorage} 返回一个新的存储对象
 */
function newXhSStorage($storages) {
    let storage = $storages.get("xhs_config");
    return {
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
        saveConfig: function (config) {
            return storage.put("config", config)
        }
    }
}

module.exports = {newXhSStorage: newXhSStorage}