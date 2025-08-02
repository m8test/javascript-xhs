/**
 * 自动化任务类，用于管理应用的多个屏幕和执行相应的操作
 *
 * @param {string} packageName - 所有的屏幕都需要在同一个包名下，也就是一个 app，例如抖音，快手等，每次检查是不是一个屏幕时都需要检测包名
 * @param {GlobalObjects} globalObjects - 全局对象，包含了所有需要的全局对象
 */
function AutoTask(packageName, globalObjects) {
    this.packageName = packageName;
    /**
     * 存储应用中所有屏幕的数组
     * @type {MobileScreen[]}
     */
    this.screens = [];
    this.shell = globalObjects.shell;
    this.accessibility = globalObjects.$accessibility;
    this.console = globalObjects.$console;
    this.threads = globalObjects.$threads;
    this.display = globalObjects.display;
    this.stringResources = globalObjects.$stringResources;
    this.shellCommands = globalObjects.$shellCommands;
    this.launchAppWaitTime = 3000; // 启动应用等待时间，单位毫秒
    this.intervalId = -1; // 如果正在运行中的话就是大于 0 的数字，否则就是 -1
}

/**
 * 添加一个屏幕到当前应用的屏幕列表中
 *
 * @param {MobileScreen} screen - 需要添加的屏幕对象
 * @returns {MobileScreen} - 返回添加的屏幕对象
 */
AutoTask.prototype.addScreen = function (screen) {
    this.screens.push(screen);
    return screen;
}

/**
 * 启动应用并等待指定时间
 * 该方法会检查 shell 状态，构造启动命令并执行，同时记录日志
 * 如果 shell 不可用或已在运行，则返回 false 表示启动失败
 *
 * @returns {boolean} - 启动应用是否成功
 */
AutoTask.prototype.launchApp = function () {
    let console = this.console;
    let stringResources = this.stringResources;
    if (this.shell.isShutdown()) {
        console.error(stringResources.getString("shell_service_was_shutdown"));
        return false;
    }
    if (this.shell.isRunning()) {
        console.error(stringResources.getString("shell_service_is_running"));
        return false;
    }
    let command = this.shellCommands.launchApp(this.packageName, "0", this.display.getId().toString());
    this.console.log(stringResources.getString("execute_app_launch_command"), command);
    let result = this.shell.exec(command, function (config) {
        // config.onStdOut(function (line) {
        //     console.log("Launch app", line);
        // })
        // config.onStdErr(function (line) {
        //     console.error("Error launching app: " + line);
        // });
    });
    return result.isSuccess();
}

/**
 * 停止当前进程的执行
 * 清除定时器并重置 intervalId
 */
AutoTask.prototype.stop = function () {
    let console = this.console;
    if (this.intervalId == -1) {
        console.warn(this.stringResources.getString("process_is_not_running"));
        return;
    }
    this.threads.getMain().getTimer().clearInterval(this.intervalId);
    this.intervalId = -1;
}

/**
 * 运行进程的主循环
 * 检查并确保目标应用在前台，然后依次执行所有屏幕的操作
 * 该循环会持续运行直到进程被显式停止
 */
AutoTask.prototype.run = function () {
    let console = this.console;
    if (this.intervalId != -1) {
        console.warn(this.stringResources.getString("process_is_running"));
        return;
    }
    let that = this;
    let threads = this.threads;
    // 遍历所有的屏幕，如果 isScreen 返回 true，则执行 action，不要跳出循环，一直死循环，遍历所有屏幕后再次遍历
    this.intervalId = threads.getMain().getTimer().setInterval(function () {
        let hasScreenHandled = false;
        for (let i = 0; i < that.screens.length; i++) {
            // 如果线程中断的话就不执行了
            console.log(that.stringResources.getString("thread_interrupt_status"), threads.getCurrent().isInterrupted());
            if (threads.getCurrent().isInterrupted()) break;
            // 如果当前应用不是 packageName 对应的应用程序，则启动 packageName 对应的应用程序
            if (that.accessibility.getCurrentPackage() != that.packageName) {
                if (!that.launchApp()) {
                    // 如果启动应用失败，打印错误信息并跳出循环
                    return;
                }
                console.log(that.stringResources.getString("command_sent"), that.stringResources.getString("waiting_for"), that.launchAppWaitTime, that.stringResources.getString("milliseconds"));
                threads.sleep(that.launchAppWaitTime);
            }
            var screen = that.screens[i];
            let r = screen.isScreen()
            if (r) hasScreenHandled = true;
            console.log(that.stringResources.getString("checking_screen"), screen.name, r);
            if (r) {
                console.log(that.stringResources.getString("current_screen_is"), screen.name);
                screen.actionContainer.run();
                console.log(that.stringResources.getString("action_performed"));
            }
        }
        // 如果没有屏幕被执行，则执行返回操作防止在某个页面卡死
        if (!hasScreenHandled) {
            // 执行返回
            that.console.log(that.stringResources.getString("no_screen_executed"), that.shell.exec("input keyevent 4", function (config) {
            }).isSuccess());
        }
        hasScreenHandled = false;
        console.log(that.stringResources.getString("all_screens_executed"), that.stringResources.getString("waiting_for"));
    }, 1000)
}

module.exports = { AutoTask: AutoTask };