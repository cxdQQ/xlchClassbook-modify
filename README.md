# xlchClassbook

绚丽彩虹同学录 V1.5 fix 二改版 - 完全无加密源码

## 项目简介

基于 [xlch88/xlchClassbook](https://github.com/xlch88/xlchClassbook) 二改的同学录系统
去掉了现在没有用的东西，加入[QingXia-Ela/vue-mini-player](https://github.com/QingXia-Ela/vue-mini-player)播放器

## 目录结构

```
test/
├── Core/                    # 核心框架
│   ├── AdminPHP/            # AdminPHP 核心组件
│   ├── Tool/                # 工具类
│   └── WebApp/              # Web 应用核心
├── Template/Default/        # 默认模板
│   ├── _Common/             # 公共模块（含音乐配置）
│   ├── Page/                # 页面模板
│   └── _Main/               # 主配置
├── assets/                  # 静态资源
│   ├── js/music-player.js   # 音乐播放器
│   ├── css/                 # 样式文件
│   └── img/                 # 图片资源
├── Function/                # 功能模块
├── Install/                 # 安装程序
└── Upload/                  # 上传目录
```
### 音乐播放器配置

配置文件：`Template/Default/_Common/MusicConfig.php`

```php
$musicConfig = [
    'API_URL' => 'https://wyyapi.cxdqq.top',      // API 地址（基于 NeteaseCloudMusicApiEnhanced）
    'LINK_API_URL' => 'https://wyyapi.cxdqq.top/song/url/v1', // 歌曲链接获取接口
    'COOKIE' => '',                                 // 网易云音乐 Cookie（需自行配置）
    'TIMEOUT' => 15000,                             // 请求超时时间 (ms)
    'RETRY_COUNT' => 3,                             // 重试次数
    'DEBUG' => false                                 // 调试模式
];
```

**使用方式：**

1. 配置 `MusicConfig.php` 中的参数
2. 配置会自动输出为 `window.MUSIC_CONFIG` 全局变量
3. [music-player.js](assets/js/music-player.js) 和 [Option.php](Template/Default/Page/Option.php) 会自动读取该配置

**Cookie 获取方式：**
- 登录网易云音乐网页版
- 浏览器开发者工具 → Application → Cookies → 找到 `MUSIC_U` 的值

## 安装部署

1. 配置 Web 服务器（Apache/Nginx）
2. 使用PHP7.4
3. 创建MySQL数据库
4. 访问网站自动进入安装向导
5. 如需重装：删除 `Install/Install.lock`

**伪静态规则参考：** `Install/rewrite/` 目录下提供各服务器规则

## 技术栈

- 后端：PHP + Xlch-AdminPHP 框架
- 前端：jQuery + Bootstrap
- 数据库：MySQL
- 音乐播放器：[QingXia-Ela/vue-mini-player](https://github.com/QingXia-Ela/vue-mini-player)
- 音乐 API：NeteaseCloudMusicApiEnhanced

**二改作者：** 抽象のQQ

## 致谢 / 参考项目

| 项目 | 说明 |
|------|------|
| [xlch88/xlchClassbook](https://github.com/xlch88/xlchClassbook) | 原始同学录项目（本版本基于此二改） |
| [QingXia-Ela/vue-mini-player](https://github.com/QingXia-Ela/vue-mini-player) | Vue 音乐播放器组件 |
| [NeteaseCloudMusicApiEnhanced](https://github.com/NeteaseCloudMusicApiEnhanced/api-enhanced) | 网易云音乐 API 增强版 |

## 许可证

详见 [LICENSE](LICENSE) 文件
"# xlchClassbook-modify" 
"# xlchClassbook-modify" 
