const path = require('path');
const fs = require('fs');
const WebpackObfuscator = require('webpack-obfuscator');

// --- 1. 读取全局变量和项目配置 (保持不变) ---
const globalVariablesPath = path.resolve(__dirname, 'build/json/GlobalVariables.json');
let reservedGlobalNames = [];
try {
    if (fs.existsSync(globalVariablesPath)) {
        const globalsFileContent = fs.readFileSync(globalVariablesPath, 'utf8');
        const globals = JSON.parse(globalsFileContent);
        reservedGlobalNames = globals.map(variable => variable.name);
        console.log('✅ Successfully loaded', reservedGlobalNames.length, 'global variables from JSON.');
    } else {
        console.warn('⚠️ Warning: GlobalVariables.json not found.');
    }
} catch (error) {
    console.error('❌ Error reading GlobalVariables.json:', error);
}

const projectConfigPath = path.resolve(__dirname, 'build/json/ProjectConfig.json');
let primaryScript = '';
let entryFilename = "";
try {
    if (fs.existsSync(projectConfigPath)) {
        const configFileContent = fs.readFileSync(projectConfigPath, 'utf8');
        const config = JSON.parse(configFileContent);
        if (config.entry) {
            entryFilename = config.entry.replace(/\\/g, '/');
            primaryScript = './src/' + entryFilename;
            console.log(`✅ Loaded entry point from ProjectConfig.json: ${primaryScript}`);
        } else {
            console.warn(`⚠️ Warning: ProjectConfig.json found, but 'entry' property is missing.`);
        }
    } else {
        console.warn(`⚠️ Warning: ProjectConfig.json not found.`);
    }
} catch (error) {
    console.error(`❌ Error reading ProjectConfig.json: ${error}`);
}

function findAllJsFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            results = results.concat(findAllJsFiles(fullPath));
        } else if (file.endsWith('.js')) {
            results.push('./' + path.relative(__dirname, fullPath).replace(/\\/g, '/'));
        }
    });
    return results;
}

// --- 2. 主配置导出 ---
module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    // --- 3. 构造最终的保留名称列表 ---
    const webpackAndModuleReservedNames = ['require', 'module', 'exports'];
    const allReservedNames = [...reservedGlobalNames, 'Packages', ...webpackAndModuleReservedNames];

    // --- 4. 配置插件 ---
    const plugins = [];
    if (isProduction) {
        console.log('✅ Applying JavaScript Obfuscator for production build.');
        plugins.push(
            new WebpackObfuscator({
                // --- 关键修正 ---
                renameGlobals: false,      // 必须为 false，以保护 $console, $activity 等
                renameProperties: false,   // 必须为 false，以保护 .log, .toString 等 Java 对象方法

                // --- 保留名称 (我们的“白名单”策略) ---
                reservedNames: allReservedNames,

                // --- 采取自参考配置的、安全且有效的选项 ---
                identifierNamesGenerator: 'hexadecimal', // 将变量名替换为十六进制字符串 (如 _0xabc123)
                stringArray: true,                       // 将所有字符串收集到一个数组中，通过索引引用
                rotateStringArray: true,                 // 随机旋转字符串数组，增加破解难度
                transformObjectKeys: true,               // 混淆对象键名
                compact: true,                           // 压缩输出代码

                // --- 注入僵尸代码以增加分析难度 ---
                deadCodeInjection: true,
                deadCodeInjectionThreshold: 0.4,

                // --- 目标环境 (非常重要！) ---
                // 'node' 环境会更好地保护 require/module/exports 结构，适用于 Webpack
                target: 'node'
            }, [])
        );
    }

    const initScripts = findAllJsFiles(path.resolve(__dirname, 'init'));
    const entryArray = primaryScript ? [...initScripts, primaryScript] : [...initScripts];

    console.log('--- Bundling files in the following order: ---');
    console.log(entryArray.join('\n'));
    console.log('-------------------------------------------');

    return {
        mode: isProduction ? 'production' : 'development',
        entry: entryArray,
        output: {
            filename: entryFilename || 'bundle.js',
            path: path.resolve(__dirname, 'build/project/src'),
        },
        // --- 5. 添加 Babel-Loader 用于 JS 降级 ---
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ["@babel/preset-env", {
                                    "useBuiltIns": "entry",
                                    "corejs": 3
                                }]
                            ]
                        }
                    }
                }
            ]
        },
        resolve: {
            modules: [
                path.resolve(__dirname, 'src'),
                path.resolve(__dirname, 'libs'),
                'node_modules'
            ]
        },
        plugins: plugins,
        devtool: isProduction ? false : 'eval-source-map'
    };
};