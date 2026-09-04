# AURA PACKAGING — 化妆品玻璃瓶出海 B2B 独立站全功能与架构手册

本项目专为**立足广州美妆包材核心产业带、面向海外（欧美、中东、澳洲等）高端独立美妆品牌、配方实验室与采购总监**而量身打造。采用全托管无服务器（Serverless）与静态站点生成（SSG）极客架构，实现**零服务器维护成本、毫秒级首屏极速加载、Google 极致 SEO 结构化收录与高转化询盘动线**。

---

## 目录
1. [项目商业定位与核心优势](#一-项目商业定位与核心优势)
2. [技术栈与工程目录结构](#二-技术栈与工程目录结构)
3. [各个页面详细功能与业务动线](#三-各个页面详细功能与业务动线)
4. [核心组件与交互积木解析](#四-核心组件与交互积木解析)
5. [数据层说明与修改指引](#五-数据层说明与修改指引)
6. [询盘表单系统与防垃圾邮件机制](#六-询盘表单系统与防垃圾邮件机制)
7. [海外 SEO 与 Schema 结构化数据](#七-海外-seo-与-schema-结构化数据)
8. [本地运行与 Cloudflare Pages 部署指引](#八-本地运行与-cloudflare-pages-部署指引)

---

## 一、 项目商业定位与核心优势

### 1. 为什么定位为“广州一站式全案包材方案商”而非“单一窑炉工厂”？
- **传统单一工厂的痛点**：只卖光瓶，不配泵头滴管，不管外包装盒；开口要求 50,000 只起订；外语沟通慢；海外买家需要对接 4 个厂家，尺寸稍有 0.2mm 偏差就会导致漏液。
- **广州方案商的降维打击**：
  1. **一站式整套交付 (Turnkey Matching)**：瓶身 + 精密泵头/滴管 + 表面深加工 + 定制外盒整套出货，保证 100% 气密兼容。
  2. **买家在中国的独立品控盾牌 (Quality Guardian)**：出厂前执行 -0.08 MPa 负压真空试漏与 ISTA 3A 跌落测试，提供 AQL 2.5 质检报告。
  3. **广州 48 小时极速调样 (Guangzhou 48H Hub)**：依托白云区全球最大的美妆产业集群，样品 48 小时内由顺丰国际/DHL 直飞欧美。
  4. **柔性起订量与多品类拼单 (Low MOQ 1,000 Pcs)**：支持初创美妆品牌以 1,000 只试单起步，支持拼箱发货。
  5. **DDP 门到门包税派送**：全包中美/中欧清关、关税与海空物流，海外客户坐在办公室直接验货。

---

## 二、 技术栈与工程目录结构

### 1. 核心技术栈
- **核心框架**：Astro 4.16.x（专为内容与展示站设计，默认输出 0 JS 纯静态 HTML，极佳性能与 SEO）
- **CSS 框架**：Tailwind CSS 3.4.x（原子类高灵活度设计，移动端优先，奢华黑金视觉体系）
- **排版字体**：Google Fonts `Playfair Display`（奢华衬线标题）+ `Inter`（现代严谨正文）
- **交互逻辑**：原生轻量 JavaScript（询盘篮本地持久化、图库切换、模态框）
- **后端机制**：Formspree API + Cloudflare Pages Functions (`/functions/api/quote.ts`) 备用边缘函数
- **托管分发**：Cloudflare Pages（全球 300+ 边缘 CDN 节点免费加速，自动 SSL）

### 2. 标准文件目录
```
d:\code\晶泰\
├── README.md                      # 本项目全功能说明手册
├── astro.config.mjs               # Astro 配置文件 (集成 Tailwind)
├── tailwind.config.mjs            # 设计系统色盘与字体定义
├── tsconfig.json                  # TypeScript 路径映射与检查规范
├── package.json                   # 依赖与打包脚本
├── functions/                     # Cloudflare Pages 边缘服务
│   └── api/
│       └── quote.ts               # 边缘表单接收与 Telegram/邮件推送备用脚本
├── public/                        # 纯静态公开资源
│   ├── favicon.svg                # 奢华品牌 A 字金色 Monogram 矢量标
│   └── robots.txt                 # 爬虫协议与 Sitemap 地址
├── src/
│   ├── data/                      # B2B 核心数据层
│   │   ├── products.json          # 10 款玻璃瓶全规格参数数据库
│   │   └── site.json              # 全站品牌、广州中心、联系方式配置
│   ├── styles/
│   │   └── global.css             # 全局字体引入、磨砂玻璃与金色渐变类
│   ├── components/                # UI 积木与业务组件
│   │   ├── Header.astro           # 导航栏、出海公告条、移动端抽屉
│   │   ├── Footer.astro           # 底部导航、合规认证墙 (ISO/FDA/REACH)
│   │   ├── Button.astro           # 复用按钮原子组件 (5 种风格)
│   │   ├── Badge.astro            # 状态标签 (MOQ、库存、畅销等)
│   │   ├── ProductCard.astro      # 产品卡片 (双图 Hover 切换、加询盘篮)
│   │   ├── QuoteModal.astro       # 全局快速询价弹窗 (自动预填当前产品)
│   │   ├── InquiryDrawer.astro    # 多产品 RFQ 询盘清单篮抽屉
│   │   └── WhatsAppButton.astro   # 右下角悬浮 WhatsApp 官方绿动效胶囊
│   ├── layouts/
│   │   └── Layout.astro           # 统一 HTML 骨架、SEO 注入、Schema.org 注入
│   └── pages/                     # 路由与页面
│       ├── index.astro            # 独立站门户首页
│       ├── about.astro            # 关于我们与广州品控中心
│       ├── sample-kit.astro       # 免费样品申领高转化落地页
│       ├── products/
│       │   ├── index.astro        # 产品总目录 (多分类即时筛选 + 实时搜索)
│       │   └── [id].astro         # 动态静态预生成的产品详情页
│       └── 404.astro              # 友好兜底页
```

---

## 三、 各个页面详细功能与业务动线

### 1. 首页 (`/` -> `src/pages/index.astro`)
- **出海公告条 (Announcement Bar)**：
  - 显示“Guangzhou Supply Chain Hub: 48-Hour Sample Dispatch • Low MOQ 1,000 Pcs • DDP Door-to-Door”。
  - 提供官方邮箱与 WhatsApp 快捷直达链接。
- **Hero 视觉首屏**：
  - 奢华大标题：“Architectural Glass Packaging for Prestige Skincare & Perfumery”。
  - 核心卖点提炼：“Low MOQ 1,000 pcs”、“100% Leak Vacuum QA”、“DDP Door-to-Door”。
  - 双 CTA 按钮：直达“Order Free Sample Kit（免费拿样）”与“Explore 2026 Catalog（查阅目录）”。
- **4 大快捷分类导流区**：
  - 直达 Dropper（滴管瓶）、Pump & Lotion（乳液泵瓶）、Cream Jars（面霜膏霜瓶）、Mist Spray（香水喷雾瓶）。
- **畅销系列矩阵 (Featured Line)**：
  - 调用 `ProductCard` 组件，动态渲染 6 款代表性爆款瓶型。
- **表面深加工工艺展示库 (`#customization`)**：
  - 详尽介绍 6 大工艺：
    1. **Acid Frosted & Satin Etching**（酸蚀磨砂，丝绒防指纹触感）
    2. **Precision Silk-Screen Printing**（高精丝网印刷，支持 4pt 微型字体）
    3. **Hot Foil Stamping**（电化铝烫金烫银，镜面奢华反光）
    4. **Gradient Spray Coating**（渐变环保喷涂，色泽过渡顺滑）
    5. **Vacuum Metallization**（真空电镀与金属化处理）
    6. **Turnkey Secondary Box Packaging**（定制高端礼盒与纸盒一站式配套）
- **广州供应链核心优势与出口防损专栏**：
  - 图文展示**“客户在中国的品质盾牌”**：
    - 5 层加厚高强瓦楞独立隔板纸箱（Cell-Divider Egg-Crate Cartons）
    - -0.08 MPa 真空负压试漏（30 分钟 0 渗漏）
    - 免熏蒸标准实木托盘热缩膜缠绕打托
- **海外采购 B2B 常见问题解答 (FAQ Accordion)**：
  - 原生 HTML `<details>` 极速折叠组件，详尽解答起订量（MOQ）、样品政策、DDP 运费、相容性测试与交期。
- **底部高转化促单 Banner**：
  - 激发客户立即索取样品或发单询价。

---

### 2. 产品目录中心 (`/products` -> `src/pages/products/index.astro`)
- **多维度即时分类筛选**：
  - 按钮组：`All Packaging`、`Dropper Bottles`、`Pump & Lotion`、`Cream & Treatment Jars`、`Mist Spray & Perfume`。
  - 纯前端即时过滤，无需重新刷新页面。
  - 支持 URL Query 参数（如 `?category=dropper` 打开即自动激活对应分类）。
- **实时关键词搜索框**：
  - 键入即可实时按容量（如 `30ml`）、口径（如 `18/410`）、材质（如 `amber`）、特色（如 `bamboo`）进行快速筛选。
- **实时统计与无结果兜底**：
  - 动态显示“Showing X packaging models”，未匹配时展示友好的一键重置按钮。

---

### 3. 动态产品详情页 (`/products/[id]` -> `src/pages/products/[id].astro`)
- **静态预生成 (SSG)**：
  - 利用 Astro 原生 `getStaticPaths()`，在构建阶段根据 `products.json` 自动生成各个产品的纯静态 HTML 页面（如 `/products/frosted-amber-dropper-30ml/`）。
- **左侧多图交互画廊**：
  - 大图展示容器微距细节，下方多张缩略图点击即时平滑切换。
- **CAD 刀模工程图免费索取 (Dieline Request)**：
  - 专为海外美妆品牌的设计总监与包装设计师准备，提供 1:1 比例印刷区域图与螺纹尺寸图。
- **右侧工业级技术参数表 (Specifications Table)**：
  - 严格规范列出：
    - 口径标准（Neck Thread: 18/410, 20/410 DIN 等）
    - 玻璃材质（Medical USP Type III Amber / Super Flint 等）
    - 瓶体自重（Container Weight: 如 48.5g、142g 厚壁重底）
    - 满口溢水容量（Brimful Capacity）
    - 兼容配件体系（Droppers, Pumps, Bamboo Collars, Heat Seals）
    - 可选表面工艺（Frosted, Silk-Screen, Hot Stamping 等）
- **产品专属询价卡片 (Direct Factory Quote)**：
  - 点击直达预填好该产品型号的询盘模态框。
- **同品类智能关联推荐 (Related Products)**：
  - 自动根据当前产品所属分类推荐 3 款替代瓶型。

---

### 4. 免费样品盒落地页 (`/sample-kit` -> `src/pages/sample-kit.astro`)
- **海外 B2B 获客超级利器**：
  - 针对海外买家“担心玻璃质感与配方相容性、不敢轻易下大单”的顾虑而设计。
- **零风险拿样政策 (Zero-Risk Guarantee)**：
  - 标语明确承诺：“Physical packaging samples are completely **FREE**. You only cover the express DHL courier charge ($25–$35 USD). **100% of this courier fee is credited back as an immediate cash discount on your first bulk order!**”
- **样品盒分解清单 (What's in the Box)**：
  - 3~5 款不同容量样品瓶 + 匹配胶头/精密压泵 + 表面工艺色板 + CAD 矢量刀模图。
- **样品申领表单**：
  - 采集精准客户画像：客户姓名、企业邮箱、公司名称、DHL 快递送达地址（城市、州、国家）、关心的瓶型、配方类型（精油/精华/膏霜/香水）。

---

### 5. 关于我们与广州中心 (`/about` -> `src/pages/about.astro`)
- **破除单厂弊端**：以权威口吻阐述现代美妆品牌为何必须选择一站式全案伙伴。
- **广州枢纽区位价值 (`#guangzhou-hub`)**：
  - 48 小时调样通过广州白云机场直达海外。
  - 毗邻南沙港与盐田港，出海航程缩短 7~10 天。
  - 聚集全球最密集的表面深加工工艺线，打样对色精准快速。
- **4 阶段出厂品控实验室规范**：
  1. 阶段 1：-0.08 MPa 负压真空试漏 30 分钟
  2. 阶段 2：数显光学卡尺螺纹尺寸比对
  3. 阶段 3：3M 胶带 ASTM D3359 附着力防脱落百格测试
  4. 阶段 4：ISTA 3A 国际出口瓦楞箱跌落测试

---

### 6. 404 错误页面 (`/404` -> `src/pages/404.astro`)
- 遇到失效链接时提供友好的导航指引，提供“返回首页”与“查阅瓶型目录”快捷键。

---

## 四、 核心组件与交互积木解析

| 组件文件 | 核心职责与交互说明 |
| :--- | :--- |
| **`Header.astro`** | 包含顶部出海公告条、品牌 Logo、桌面多级下拉分类菜单、移动端侧滑抽屉、RFQ 询盘篮微标计数 |
| **`Footer.astro`** | 包含完整公司定位、品类直通车、ISO 9001 / FDA / EU 1223 / Prop 65 认证徽章墙与版权 |
| **`ProductCard.astro`** | 业务展示卡片。支持双图悬停缩放过渡、MOQ/容量徽章、"Add to RFQ" 一键加入篮子、"Quick Quote" 触发快速报价 |
| **`QuoteModal.astro`** | 全站通用报价弹窗。点击任意产品的报价按钮时，自动将产品型号预填到表单中，支持数量阶梯选择与 AJAX 无刷新提交 |
| **`InquiryDrawer.astro`** | **[独家进阶] 询盘清单篮**。基于 LocalStorage，允许买家在浏览全站时不断加购 3~5 款瓶型，并在右侧滑出抽屉一键打包提交综合询价单 |
| **`WhatsAppButton.astro`** | 屏幕右下角固定浮动。官方绿色配合呼吸光晕动效，悬停弹出“Guangzhou Specialist: 2-4H Fast RFQ”提示，点击直达对话 |
| **`Button.astro`** | 通用按钮组件，支持 `primary`（黑底金字）、`gold`（奢华香槟金）、`outline`（极简线框）等多种预设样式 |
| **`Badge.astro`** | 状态标签组件，支持 `gold`、`green`、`dark`、`light`，用于展示容量、库存和起订量 |

---

## 五、 数据层说明与修改指引

整个网站的产品与站点设置**完全脱离传统复杂数据库**，均由 `/src/data/` 目录下的 JSON 文件管理，修改后编译即可生效：

### 1. 全局站点配置 (`src/data/site.json`)
当需要修改公司名称、联系电话、邮箱或 WhatsApp 时，直接编辑此文件：
```json
{
  "name": "AURA PACKAGING",
  "companyName": "Aura Luxury Glass Packaging (Guangzhou) Co., Ltd.",
  "location": "Guangzhou Beauty & Cosmetic Supply Chain Hub, Guangdong, China",
  "email": "inquiry@aurapackaging.com",
  "whatsapp": "+86 188 1988 6688",
  "whatsappDirectUrl": "https://wa.me/8618819886688?text=Hello...",
  "formspreeEndpoint": "https://formspree.io/f/YOUR_FORM_ID"
}
```

### 2. 产品数据库 (`src/data/products.json`)
新增或编辑玻璃瓶型号只需向该 JSON 数组中添加对象。核心字段结构如下：
```json
{
  "id": "frosted-amber-dropper-30ml",       // 唯一 URL Slug (生成 /products/xxx)
  "name": "30ml Frosted Amber Glass Dropper Bottle",
  "subtitle": "UV-Protection Pipette Bottle for Active Serums",
  "category": "Dropper Bottles",            // 所属品类
  "categorySlug": "dropper",                // 品类过滤索引 (dropper / pump / jar / spray)
  "volume": "30ml (1.0 fl oz)",             // 容量
  "moq": 3000,                              // 定制起订量
  "inStockMoq": 1000,                       // 现货试单起订量
  "leadTime": "15-20 business days",        // 交期
  "images": [                               // 图片数组 (首图为卡片展示图，二图为悬停切换图)
    "https://your-domain.com/img1.jpg",
    "https://your-domain.com/img2.jpg"
  ],
  "specs": {
    "neckSize": "18/410 DIN Standard",      // 口径
    "material": "USP Type III Amber Flint Glass", // 材质
    "height": "92.5 mm",
    "diameter": "33.0 mm",
    "weight": "48.5 g",
    "brimfulCapacity": "35.2 ml",
    "surfaceHandling": ["Acid Frosted", "Silk-screen Print", "Hot Stamping"],
    "closureTypes": ["Precision Glass Pipette", "Child-Resistant Cap", "Gold Collar"]
  },
  "features": [                             // 核心卖点
    "99.4% UV Light Barrier",
    "Negative Pressure Leak-Tested at -0.08 MPa"
  ],
  "description": "详细英文描述文案...",
  "isFeatured": true,                       // 是否展示在首页畅销榜
  "badge": "Best Seller"                    // 标签
}
```

---

## 六、 询盘表单系统与防垃圾邮件机制

### 1. 双轨询盘对接方式
- **方式一（默认极简）：Formspree 端点**
  - 在 `src/data/site.json` 中配置 `formspreeEndpoint`。
  - 表单通过标准 POST 异步提交，用户提交后无需离开当前网页，弹窗内提供优雅的成功通知。
- **方式二（零成本自建）：Cloudflare Pages Functions**
  - 项目已内置 `functions/api/quote.ts`。
  - 部署到 Cloudflare Pages 后，自带 `/api/quote` 边缘路由，可在环境变量中填入 `TELEGRAM_BOT_TOKEN` 和 `TELEGRAM_CHAT_ID`，即可实现**询盘秒级推送到手机 Telegram**，永久免费且不受第三方表单条数限制。

### 2. 严格的蜜罐防垃圾爬虫机制 (Anti-Spam Honeypot)
- 每个表单均植入一段隐藏字段：
  ```html
  <input type="text" name="_gotcha" style="display:none !important;" tabindex="-1" autocomplete="off" />
  ```
- 正常人类在浏览器中看不见也不可能填写该输入框。而恶意网络垃圾爬虫在自动填表时会误填该字段，后端检测到 `_gotcha` 有值则自动静默丢弃，彻底杜绝邮箱被垃圾邮件塞满。

---

## 七、 多语言智能感知系统 (Browser > IP Multi-Language)

本项目已实现符合国际顶级标准的出海多语言架构，具备**自动感知判定**与**手动即时切换**双模能力：

### 1. 判定优先级序列 (Browser > IP)
1. **第一优先级（用户手动选择）**：检查 `localStorage['aura_preferred_lang']`，若用户曾手动切换过语言，优先遵循用户喜好。
2. **第二优先级（浏览器语言 `navigator.language`）**：
   - `zh*`（简体/繁体中文）→ 激活 `zh`
   - `es*`（西班牙语/拉美诸国）→ 激活 `es`
   - `fr*`（法语/高定美妆香水重镇）→ 激活 `fr`
   - `de*`（德语/瑞士有机严谨美妆）→ 激活 `de`
   - `en*`（英语）→ 激活 `en`
3. **第三优先级（IP 地理位置 Fallback）**：若浏览器语言无法明确判断，异步调用轻量级国家 IP 接口（如 `https://api.country.is/`，带 1.2 秒快速熔断），依据访客 IP 所在国家自动归属对应语种。
4. **默认兜底**：国际商贸通用英语 `en`。

### 2. 语种词条扩展与维护 (`src/i18n/translations.json`)
若需扩展葡萄牙语、日文或阿拉伯语，只需在 `src/i18n/translations.json` 中增加对应键值对象，并在 `src/i18n/i18n-client.ts` 的 `SUPPORTED_LANGS` 数组中添加该语种旗帜与代码即可，全站秒级热更新。

---

## 八、 海外 SEO 与 Schema 结构化数据


为了在 Google 搜索（如搜索 `cosmetic glass dropper bottle manufacturer china`, `low moq serum bottles wholesale`）中取得靠前排名，全站已内置全套海外技术 SEO：

1. **动态 Meta 标签**：
   - 每个产品详情页自动根据产品名生成专用 `<title>`、`<meta name="description">`、`<meta name="keywords">` 与 OpenGraph 社交卡片标签。
2. **Schema.org 官方结构化数据 (JSON-LD)**：
   - 首页自动注入 `Organization`（组织资质、客服电话、所属地广州）。
   - 产品详情页自动注入标准的 `Product` 架构（包含 `name`、`image`、`sku`、`category` 以及带批量起订量的 `AggregateOffer`）。使 Google 搜索结果可以直接以富媒体（Rich Snippets）形式展示产品信息。
3. **爬虫与地图规范**：
   - `public/robots.txt` 开放所有搜索引擎抓取，并指明网站地图地址。

---

## 八、 本地运行与 Cloudflare Pages 部署指引

### 1. 本地启动开发服务器
在本项目根目录下打开终端：
```bash
# 启动本地开发服务 (支持热重载)
npm run dev
```
打开浏览器访问：`http://localhost:4321`

### 2. 静态编译测试
```bash
# 编译为纯静态 HTML/CSS 文件至 dist/ 目录
npm run build

# 本地预览编译后的生产环境效果
npm run preview
```

### 3. Cloudflare Pages 一键免费部署步骤
1. 将当前工程文件夹推送到你的 **GitHub 仓库**（可设为私有仓库）。
2. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)。
3. 进入左侧导航 **Workers & Pages** -> 点击 **Create application** -> 选择 **Pages** -> **Connect to Git**。
4. 授权并选中你的 GitHub 仓库，配置以下构建参数：
   - **Framework preset（框架预设）**：`None` 或 `Astro`
   - **Build command（构建命令）**：`npm run build`
   - **Build output directory（输出目录）**：`dist`
5. 点击 **Save and Deploy（保存并部署）**。
6. Cloudflare 将在全球 300 多个数据中心节点全自动编译并秒级发布！
7. 进入 Pages 项目的 **Custom domains** 页面，绑定你自己的出海顶级域名（例如 `yourpackagingbrand.com`），Cloudflare 会全自动签发终身免费的 SSL 安全证书。

---

*手册制作完毕。如有规格调整或新增品类，直接修改 `src/data/products.json` 重新推送到 GitHub 即可自动触发 Cloudflare 极速更新！*
