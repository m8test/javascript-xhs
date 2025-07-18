(function () {
    function init() {
        // $webViewBridge.registerHandler() 用于设置供脚本端调用的处理器，第一个参数是处理器名，第二个参数是一个函数，会在处理器被调用时执行
        // $webViewBridge.registerHandler("functionForScriptToCall", function (data, responseCallback) {
        //     // data 为脚本端调用处理器时传递过来的参数
        //     // responseCallback 用于返回处理结果到脚本端
        //     if (responseCallback) {
        //         var responseData = "I am from Javascript " + data
        //         responseCallback(responseData)
        //     }
        // })
        // 需要在 $webViewBridge 初始化后调用
        loadConfig();
    }

    if (window.$webViewBridge) {
        init();
    } else {
        document.addEventListener(
            'WebViewBridgeReady',
            function () {
                //do your work here
                init();
            },
            false
        );
    }
})()

// document.getElementById("button").addEventListener("click", function (e) {
//     // $webViewBridge.callHandler() 用于调用脚本端注册的处理器，参数一为处理器名，参数二为需要传递给处理器的参数，参数三为回调函数用于接收脚本端的返回值
//     $webViewBridge.callHandler("handlerForWebView", "params from js", function (p) {
//         alert(p)
//     })
// })

// 初始化配置
let config = {
    viewDetailTime: 5000,
    searchResultViewCount: 10,
    searchTexts: [],
    commentTexts: [],
    privateMessageTexts: [],
    commentRate: 30,
    privateMessageRate: 10,
    likeRate: 10,
    favoriteRate: 20
};

// 加载配置
function loadConfig() {
    // 调用脚本端的读取配置方法
    const savedConfig = $webViewBridge.callHandler("readConfig", "", function (savedConfig) {
        if (savedConfig) {
            config = JSON.parse(savedConfig);
        }
        document.getElementById('viewDetailTime').value = config.viewDetailTime;
        document.getElementById('searchResultViewCount').value = config.searchResultViewCount;
        document.getElementById('commentRate').value = config.commentRate;
        document.getElementById('privateMessageRate').value = config.privateMessageRate;
        document.getElementById('likeRate').value = config.likeRate;
        document.getElementById('favoriteRate').value = config.favoriteRate;
        renderList('searchTextList', config.searchTexts, 'search');
        renderList('commentTextList', config.commentTexts, 'comment');
        renderList('privateMessageTextList', config.privateMessageTexts, 'privateMessage');
    });
}

// 渲染列表
function renderList(listId, items, type) {
    const list = document.getElementById(listId);
    list.innerHTML = '';
    items.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `
            <span>${item}</span>
            <div>
                <button class="btn btn-sm btn-outline-primary me-2" onclick="editItem(${index}, '${type}')">
                    <span class="material-icons">edit</span>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteItem(${index}, '${type}')">
                    <span class="material-icons">delete</span>
                </button>
            </div>
        `;
        list.appendChild(li);
    });
}

// 添加文本
function addItem(inputId, listId, array, type) {
    const input = document.getElementById(inputId);
    const text = input.value.trim();
    if (text) {
        array.push(text);
        renderList(listId, array, type);
        input.value = '';
    }
}

// 编辑文本
function editItem(index, type) {
    const modal = new bootstrap.Modal(document.getElementById('editModal'));
    const input = document.getElementById('editTextInput');
    const array = type === 'search' ? config.searchTexts :
        type === 'comment' ? config.commentTexts : config.privateMessageTexts;
    input.value = array[index];
    document.getElementById('editIndex').value = index;
    document.getElementById('editType').value = type;
    modal.show();
}

// 保存编辑
document.getElementById('saveEdit').addEventListener('click', () => {
    const index = parseInt(document.getElementById('editIndex').value);
    const type = document.getElementById('editType').value;
    const newText = document.getElementById('editTextInput').value.trim();
    if (newText) {
        const array = type === 'search' ? config.searchTexts :
            type === 'comment' ? config.commentTexts : config.privateMessageTexts;
        array[index] = newText;
        renderList(type === 'search' ? 'searchTextList' :
            type === 'comment' ? 'commentTextList' : 'privateMessageTextList', array, type);
        bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
    }
});

// 删除文本
function deleteItem(index, type) {
    const array = type === 'search' ? config.searchTexts :
        type === 'comment' ? config.commentTexts : config.privateMessageTexts;
    array.splice(index, 1);
    renderList(type === 'search' ? 'searchTextList' :
        type === 'comment' ? 'commentTextList' : 'privateMessageTextList', array, type);
}

// 保存配置
function saveConfigToLocal() {
    // 调用脚本端的保存配置方法
    $webViewBridge.callHandler("saveConfig", JSON.stringify(config), function (result) {
        if (result === 'true') {
            alert('配置已保存！');
        } else {
            alert('保存配置失败！');
        }
    });
}

// 切换主题
function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.contains('dark-mode');
    body.classList.toggle('dark-mode', !isDark);
    body.classList.toggle('light-mode', isDark);
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

// 初始化主题
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.add(`${savedTheme}-mode`);
}

// 事件监听
document.getElementById('addSearchText').addEventListener('click', () => addItem('searchTextInput', 'searchTextList', config.searchTexts, 'search'));
document.getElementById('addCommentText').addEventListener('click', () => addItem('commentTextInput', 'commentTextList', config.commentTexts, 'comment'));
document.getElementById('addPrivateMessageText').addEventListener('click', () => addItem('privateMessageTextInput', 'privateMessageTextList', config.privateMessageTexts, 'privateMessage'));
document.getElementById('saveConfig').addEventListener('click', () => {
    config.viewDetailTime = parseInt(document.getElementById('viewDetailTime').value);
    config.searchResultViewCount = parseInt(document.getElementById('searchResultViewCount').value);
    config.commentRate = parseInt(document.getElementById('commentRate').value);
    config.privateMessageRate = parseInt(document.getElementById('privateMessageRate').value);
    config.likeRate = parseInt(document.getElementById('likeRate').value);
    config.favoriteRate = parseInt(document.getElementById('favoriteRate').value);
    saveConfigToLocal();
});
document.getElementById("runOrStop").addEventListener('click', () => {
    $webViewBridge.callHandler("runOrStop", "", function (result) {
        alert(`当前状态: ${result}`);
    })
});
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
});