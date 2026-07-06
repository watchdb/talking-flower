# 🌼 闲聊花 Web · Talking Flower

灵感来自任天堂 2026-03-12 发售的实体玩具「おしゃべりフラワー」(马力欧惊奇里的闲聊花)的**网页复刻玩具**,外加一个可后台常驻的 **Chrome 浏览器插件**。

> ⚠️ 粉丝自制,与任天堂无关。所有台词均为原创(中/英/日三语共 200+ 条),语音使用浏览器 / 系统自带 TTS 或你自选的在线引擎,不含任何任天堂音频、图像素材。

## 功能

| 功能 | 网页版 `web/` | 插件版 `extension/` |
|------|:---:|:---:|
| 自动闲聊(大量内置台词,随机播报) | ✅ | ✅ |
| **自定义台词**(自己加,混进随机池,按语言分开,可关内置) | ✅ | ✅ |
| 整点报时(可开关) | ✅ | ✅ |
| 自定义计划提醒(每天 / 仅一次,可开关、删除) | ✅ | ✅ + 系统通知 |
| 戳一下小花,随机回应 | ✅ | ✅ |
| 起床 / 睡觉问候 + 夜间免打扰 | ✅ | ✅ |
| 三语(中 / 英 / 日)台词 + 界面 | ✅ | ✅ |
| **智能优选音色**(自动挑最好听的神经网络音色,⭐ 标推荐) | ✅ | ✅ |
| **可爱 / 标准 / 沉稳 语音预设** + 语速 / 音调可调 | ✅ | ✅ |
| **在线语音引擎**(ElevenLabs,可爱音色,填自己的 Key) | ✅ | ✅ (经 offscreen) |
| 后台常驻(不用开着页面) | ❌ 需保持标签页打开 | ✅ `chrome.alarms` |

## 网页版 = 三语 SEO 工具站(部署 Cloudflare Pages)

网页版是一个**标准工具站**:header / hero(工具首屏可用)/ features / what-is / how-to / why / faq / footer,
三语(en 在根 `/`、zh 在 `/zh`、ja 在 `/ja`)各生成一个预渲染 HTML,利于 SEO。
用一个**零依赖的 Node 脚本**把 `content/*.json` 生成到 `web/dist/`,纯静态,丢到 CF Pages 即可。

```bash
cd web
node build.mjs        # 生成 dist/(en、zh、ja + sitemap.xml + robots.txt)
npm run preview       # 构建并本地起服务预览(npx serve dist)
```

打开后点「🔊 唤醒小花」(浏览器要求先有一次用户点击才允许发声),之后:

- **自动闲聊**:按所选频率(话痨 2–6 分钟 / 正常 8–20 分钟 / 安静 25–45 分钟)随机说话
- **整点报时**:每到整点报一次时间,可关闭
- **计划提醒**:添加「时间 + 内容」,到点大声念出 + 桌面通知;「仅一次」的计划触发后自动停用
- **夜间休息**:睡觉时间段内不闲聊、不报时(计划提醒不受影响),到点还会说晚安 / 早安
- **自定义台词**:在「自定义文案」里加自己的句子,会和内置台词一起被随机说出来(按当前语言分开存);可关掉「同时使用内置台词」,让小花只说你写的
- **语音**:见下方「语音怎么变好听 / 变可爱」

> 网页版当前**只用免费的浏览器语音**(ElevenLabs 在线引擎先不展示,代码保留在插件版)。
> 浏览器会对**后台标签页**的定时器节流(约 1 次/分钟),分钟级提醒不受影响,但页面关掉就全停了——想要常驻请用插件版。

### SEO 已内建

- `<title>` / `description` / `canonical`(无尾斜杠)/ 三语 `hreflang` 双向 + `x-default`
- Open Graph + Twitter Card + `og-image`(1200×630)
- JSON-LD:`WebApplication` / `FAQPage` / `BreadcrumbList`
- 每页仅 1 个 `<h1>`,多个 `<h2>` 覆盖长尾;**不输出** `keywords` meta
- 动态 `sitemap.xml`(含三语 alternates)+ `robots.txt`

### 改文案 / 加语言

- 站点文案全在 `web/content/{en,zh,ja}.json`(SEO 段落、FAQ、工具界面标签都在里面),改完 `node build.mjs`
- 站点根 URL、语言列表在 `web/build.mjs` 顶部的 `SITE_URL` / `LOCALES`;换自定义域名只改 `SITE_URL` 一行

### 部署到 Cloudflare Pages

```bash
# 方式一:本地直接上传(需已登录 wrangler)
cd web && npm run deploy          # = node build.mjs && wrangler pages deploy dist --project-name talking-flower

# 方式二:CF Pages 连 Git 仓库自动构建
#   Build command:      cd web && node build.mjs
#   Build output dir:   web/dist
```

当前配置的站点根:`https://talking-flower.pages.dev`(en `/`、zh `/zh`、ja `/ja`)。

## 浏览器插件(Chrome / Edge,Manifest V3)

1. 打开 `chrome://extensions`(Edge 是 `edge://extensions`)
2. 打开右上角「开发者模式」
3. 点「加载已解压的扩展程序」,选择 `extension/` 目录
4. 工具栏出现小花图标;安装完成时小花会打个招呼

- 报时 / 闲聊 / 问候 / 计划全部由后台 `chrome.alarms` 驱动,**只要浏览器开着就生效**,无需保持任何页面打开
- 点击图标打开 popup:开关、频率、语言、语音引擎、声音、预设、自定义台词、作息、计划管理,和网页版一致
- 计划提醒到点会「大声念出 + 系统通知」
- 浏览器引擎用 `chrome.tts`;选在线引擎(ElevenLabs)时,后台通过一个 **offscreen 文档**播放生成的音频(service worker 自身不能播音频)

## 语音怎么变好听 / 变可爱

「声音不好听」通常是系统默认挑了个机械音色。三招,从易到强:

1. **换浏览器 / 选推荐音色**(免费,最省事)
   - 「声音」下拉默认是 **自动(挑最好听的)**,会优先选系统里的神经网络音色,列表里带 ⭐ 的都是推荐项。
   - 用 **Microsoft Edge** 打开,可免费拿到微软在线神经网络音色(中文晓晓 / 晓伊、日语 Nanami 等),明显比一般系统音色自然、可爱。
2. **用「🎀 可爱」预设**(免费)
   - 语音区有 `🎀 可爱 / 标准 / 沉稳` 三个预设,可爱预设会把音调调高、语速略快,配合女声音色更萌;也可以自己拖语速 / 音调滑块微调。
3. **接在线引擎 ElevenLabs**(音色最可爱最自然,需要自己的免费 Key)
   - ⚠️ 当前**仅插件版**展示此选项(网页版为保持简单先隐藏,代码仍在)。
   - 语音引擎选「在线 · ElevenLabs」,填两项:
     - **API Key**:在 [elevenlabs.io](https://elevenlabs.io) 免费注册后在账户里拿(有免费额度)。
     - **Voice ID**:在 ElevenLabs 的 Voice Library 里挑一个可爱音色,复制它的 Voice ID 填进来(留空则用一个占位默认音色)。
   - Key **只保存在你本地**(网页存 `localStorage`,插件存 `chrome.storage.local`),不上传别处;直接从浏览器调用 ElevenLabs API。
   - 在线请求失败(如 Key 错误 / 超额)会**自动回退到浏览器语音**,不会让小花变哑巴。

## 目录结构

```
.
├── web/                    # 网页版 = 三语 SEO 工具站(静态生成)
│   ├── build.mjs           # 零依赖生成器:content → dist/
│   ├── package.json        # build / preview / deploy 脚本
│   ├── content/            # 站点文案(SEO 段落、FAQ、工具界面标签)
│   │   ├── en.json  zh.json  ja.json
│   ├── assets/             # 直接拷进 dist 的静态资源
│   │   ├── app.js          # 工具逻辑:浏览器 TTS、优选音色、自定义台词、定时、计划
│   │   ├── style.css       # 站点 + 工具样式(含深色模式)
│   │   ├── lines.js        # 台词库(三语,200+ 条)
│   │   ├── favicon.svg  og-image.png
│   └── dist/               # 构建产物(gitignore;部署这个目录)
└── extension/              # Chrome 插件(MV3)
    ├── manifest.json
    ├── background.js       # service worker:alarms 编排与触发、引擎分发
    ├── offscreen.html/js   # 离屏文档:播放在线 TTS 音频(SW 不能直接播音频)
    ├── popup.html/css/js   # 设置面板
    ├── lines.js            # ⚠️ 与 web/assets/lines.js 是同一份文件的拷贝
    └── icons/              # 16/32/48/128 图标
```

> **改台词注意**:`web/assets/lines.js` 和 `extension/lines.js` 内容必须一致,改完一边记得
> `cp web/assets/lines.js extension/lines.js`。

## 已知限制

- 浏览器引擎的音色取决于浏览器 / 操作系统自带的 TTS voices,不同设备听感不同;想要稳定的可爱音色,用 Edge(免费神经网络音色)或接 ElevenLabs
- ElevenLabs 在线引擎需要你自己的 API Key,并受其免费额度 / 计费限制;这是可选项,不填也能正常用免费浏览器语音
- 直接在前端调用 ElevenLabs 会把 Key 放在客户端(仅存本地),适合个人自用的小玩具,不建议用在公开托管的站点上
- Firefox 不支持 MV3 的 `chrome.tts` / `offscreen`,插件目前只支持 Chromium 系浏览器(Chrome / Edge)
- 实体玩具的「温度感应」「马力欧 BGM」没有做:前者网页拿不到,后者是任天堂版权音乐
