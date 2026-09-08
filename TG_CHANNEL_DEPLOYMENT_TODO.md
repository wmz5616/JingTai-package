# 晶泰包装：Telegram 频道云图床与素材中控部署指南（待办备忘录）

> **文档性质**：技术落地待办清单与执行备忘录 (Actionable Checklist)  
> **适用场景**：后续准备好正式实物图片、微信收款/业务二维码及视频素材时，依循本手册从 0 到 1 搭建 TG 频道图床并快速接入全站。

---

## 目录
1. [待办事项总览清单 (Checklist)](#一待办事项总览清单-checklist)
2. [阶段一：Telegram 机器人与频道从零搭建](#二阶段一telegram-机器人与频道从零搭建5分钟)
3. [阶段二：搭建 Cloudflare Worker 免费全球 CDN 反代](#三阶段二搭建-cloudflare-worker-免费全球-cdn-反代零成本)
4. [阶段三：全站待替换实物素材清单与规格建议](#四阶段三全站待替换实物素材清单与规格建议)
5. [阶段四：项目一键挂载接入实操](#五阶段四项目一键挂载接入实操)
6. [阶段五：生产环境稳定性与避坑指南](#六阶段五生产环境稳定性与避坑指南)

---

## 一、待办事项总览清单 (Checklist)

- [ ] **1. Telegram 基础设施**
  - [ ] 找 `@BotFather` 注册专门的媒体托管机器人，保存 `BOT_TOKEN`。
  - [ ] 创建用于存放素材的专用私有/公开 Channel（如 `Jingtai_Packaging_Assets`）。
  - [ ] 将 Bot 添加为该 Channel 的管理员（具备发布与读取消息权限）。
  - [ ] 获取 Channel 的唯一 `CHAT_ID`（如 `-100xxxxxxxxxx`）。

- [ ] **2. 免费 CDN 节点搭建 (Cloudflare Worker)**
  - [ ] 登录 Cloudflare Dashboard，创建名为 `jingtai-media-cdn` 的 Worker。
  - [ ] 复制本文档提供的反代代码并填入 `BOT_TOKEN`。
  - [ ] 给 Worker 绑定自定义二级域名（例如 `cdn.jingtaipackaging.com` 或 `assets.xxx.com`）。
  - [ ] 浏览器测试访问一张测试图片，确认直链可直接渲染并返回 `image/jpeg`。

- [ ] **3. 实物素材拍摄与整理**
  - [ ] 准备 3 张品牌核心素材：高分辨率正色 Logo、白色透明底 Logo、官方业务微信二维码。
  - [ ] 准备 10 款主打商品实物图（每款至少 1 张正面主图 + 1 张特写细节图，参考下文表格）。
  - [ ] 将图片批量发送至 TG 频道，记录生成的文件直链或文件 ID。

- [ ] **4. 本地一键挂载与上线**
  - [ ] 运行 `node scripts/sync-tg-assets.cjs --cdn https://你的TG反代域名` 设置全局前缀。
  - [ ] 或者在 `src/data/products.json` 中直接贴入 TG 直链。
  - [ ] 运行 `npm run build` 执行静态多语言全量构建并部署。

---

## 二、阶段一：Telegram 机器人与频道从零搭建（5分钟）

### 步骤 1：找 BotFather 创建专属机器人
1. 在 Telegram 搜索栏搜索 `@BotFather`（认准蓝标认证号）。
2. 发送命令 `/newbot`。
3. 按照提示输入机器人名称（例如：`Jingtai Packaging Asset Bot`）和用户名（例如：`jingtai_assets_bot`，必须以 `bot` 结尾）。
4. 创建成功后，BotFather 会给你一段密钥（HTTP API Token），形如：
   ```text
   7123456789:AAFlkjhsdf89sdf78sf98s7df8s7df8s7df
   ```
   **【重要】请妥善保存此 Token，千万不要泄露给他人。**

### 步骤 2：创建素材存储频道 (Channel)
1. 在 Telegram 点击“新建” -> “新建频道 (New Channel)”。
2. 频道名称可填写为：`晶泰包装-网站媒体库` 或 `Jingtai Packaging Assets`。
3. 频道类型可设为 **Private Channel（私有频道）**，更加安全隐私；或者设为 **Public（公开）**。

### 步骤 3：将机器人设为管理员
1. 进入刚创建的频道设置 -> **Administrators（管理员）** -> **Add Admin（添加管理员）**。
2. 搜索你刚创建的机器人用户名（例如 `@jingtai_assets_bot`）。
3. 赋予它“Post Messages（发送消息）”和“Edit Messages”权限，点击保存。

### 步骤 4：获取频道的 Channel ID
1. 在频道内随便发送一条文字消息。
2. 将这条消息转发给 `@userinfobot` 或 `@JsonDumpBot`。
3. 机器人会回传一条 JSON 数据，其中 `forward_from_chat` 下的 `id`（通常是以 `-100` 开头的一长串负数，如 `-1002345678901`）就是你的 Channel ID。

---

## 三、阶段二：搭建 Cloudflare Worker 免费全球 CDN 反代（零成本）

由于 Telegram 官方的文件链接（`https://api.telegram.org/file/bot...`）在国内部分网络无法直连，且有严格的每日请求配额，**通过 Cloudflare Worker 进行免费边缘代理是业界公认的最佳方案**（免服务器、自带全球 Edge 缓存、永久 HTTPS）。

### 完整 Cloudflare Worker 脚本：
在 Cloudflare 创建一个 Worker（如 `jingtai-media-cdn`），将默认代码替换为以下脚本：

```javascript
/**
 * Jingtai Packaging - Telegram Channel Media Proxy & CDN Cache
 * 部署平台: Cloudflare Workers (免费版每日 100,000 次请求足够使用)
 */

// 1. 替换为您在 BotFather 申请的 Bot Token
const BOT_TOKEN = '7123456789:AAFlkjhsdf89sdf78sf98s7df8s7df8s7df';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 根路径健康检查
    if (path === '/' || path === '/health') {
      return new Response('Jingtai Packaging Media CDN is Running.', { status: 200 });
    }

    // 格式一: 直连 Telegram 文件路径 /file/<file_path>
    // 示例: https://cdn.yourdomain.com/file/photos/file_123.jpg
    let targetUrl = '';
    if (path.startsWith('/file/')) {
      const filePath = path.replace('/file/', '');
      targetUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
    } else {
      // 格式二: 支持直接通过 file_id 获取文件
      targetUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}${path}`;
    }

    // 检查 Cloudflare 边缘缓存
    const cache = caches.default;
    let response = await cache.match(request);

    if (!response) {
      // 向 Telegram 抓取原图
      response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (JingtaiPackaging CDN Proxy)'
        }
      });

      if (response.ok) {
        // 克隆响应并写入浏览器与 CDN 长期缓存（缓存 365 天）
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
        newHeaders.set('Access-Control-Allow-Origin', '*');
        newHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

        response = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders
        });

        // 异步将响应加入 Cloudflare 全球缓存，避免下次再耗费 TG 流量
        ctx.waitUntil(cache.put(request, response.clone()));
      }
    }

    return response;
  }
};
```

### 绑定自定义域名（可选但推荐）
在 Worker 的 **Settings -> Triggers -> Custom Domains** 中，添加你的域名解析，比如 `cdn.jingtaipackaging.com`。

---

## 四、阶段三：全站待替换实物素材清单与规格建议

当您后续拍摄或取得实物素材时，建议按以下清晰清单归类上传至 TG 频道：

### 1. 品牌全局素材 (3 项)
| 素材类别 | 建议分辨率 | 格式 | 推荐说明 | 当前项目映射位置 |
| :--- | :--- | :--- | :--- | :--- |
| **标准品牌 Logo** | 400×100 px 以上 | PNG (透明底) | 浅色底使用的黑色+金色字标 Logo | `site.assets.logo` |
| **反白底色 Logo** | 400×100 px 以上 | PNG (透明底) | 页脚深黑底使用的纯白+金色 Logo | `site.assets.logoWhite` |
| **业务微信二维码** | 600×600 px 正方形 | JPG / PNG | 晶泰业务对接人实名企业微信或个人微信 | `site.assets.wechatQr` |

### 2. 十款主打商品图片矩阵 (每个型号建议 1~2 张)
在 [`src/data/products.json`](file:///d:/code/晶泰/src/data/products.json) 中对应以下 10 个型号（建议比例为 1:1 正方形或 4:5 竖构图，800×800 以上）：

| 序号 | 商品 ID (`id`) | 中文品名 | 英文品名 | 建议拍摄重点 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `frosted-amber-dropper-30ml` | 30ml 磨砂茶色高白料精油滴管瓶 | 30ml Frosted Amber Dropper | 展现半透磨砂质感与刻度胶头滴管 |
| 2 | `nordic-clear-dropper-50ml` | 50ml 北欧极简透明高透精油滴管瓶 | 50ml Nordic Clear Dropper | 展现高白料玻璃通透底色与清亮水剂 |
| 3 | `matte-black-push-dropper-30ml` | 30ml 哑光磨砂黑按压自吸滴管瓶 | 30ml Matte Black Push Dropper | 展现高级丝绒触感哑光黑与按压泵盖 |
| 4 | `emerald-bamboo-dropper-15ml` | 15ml 翡翠绿配原木竹节滴管瓶 | 15ml Emerald Bamboo Dropper | 突出天然竹盖纹理与祖母绿厚底 |
| 5 | `frosted-lotion-pump-50ml` | 50ml 哑光磨砂精华乳液泵瓶 | 50ml Frosted Lotion Pump | 突出按压外置弹簧泵头与防漏回吸卡口 |
| 6 | `heavy-base-lotion-100ml` | 100ml 加厚水晶重底爽肤水乳液瓶 | 100ml Heavy-Base Lotion | 突出底部超厚配重玻璃层与大容量握持 |
| 7 | `heavy-base-cream-jar-50g` | 50g 极奢重底厚壁膏霜面霜宽口瓶 | 50g Heavy-Base Cream Jar | 展现厚壁水晶底、手感重量及内衬垫片 |
| 8 | `amber-uv-face-cream-jar-30g` | 30g 医用级深茶色避光面霜眼霜罐 | 30g Amber UV Cream Jar | 展现深茶色避光性能与黑金双层电化铝盖 |
| 9 | `luxury-perfume-spray-50ml` | 50ml 高定细密雾化香水喷雾瓶 | 50ml Luxury Perfume Spray | 展现超细雾化效果与高透厚重玻璃瓶肩 |
| 10 | `frosted-toner-mist-100ml` | 100ml 磨砂超微雾化爽肤水喷雾瓶 | 100ml Frosted Toner Mist | 展现大容量磨砂手感与轻奢金属喷头 |

---

## 五、阶段四：项目一键挂载接入实操

当您把上述图片上传至 TG 频道并拿到了直链或配置好了 CDN 域名，只需以下简单操作即可完成替换：

### 操作场景 A：配置了统一的 TG CDN 反代域名
直接在项目根目录运行预置脚本：
```bash
node scripts/sync-tg-assets.cjs --cdn https://cdn.jingtaipackaging.com
```
* 这会自动写入 [`src/data/site.json`](file:///d:/code/晶泰/src/data/site.json) 的 `"assetCdnUrl"` 字段。
* 全站所有相对路径图片会自动无缝重定向到该 CDN。

### 操作场景 B：逐一替换具体直链
1. **替换 Logo 与微信二维码**：
   打开 [`src/data/site.json`](file:///d:/code/晶泰/src/data/site.json)，将 `assets` 字段换成您的 TG 直链：
   ```json
   "assets": {
     "logo": "https://cdn.xxx.com/file/logo.png",
     "logoWhite": "https://cdn.xxx.com/file/logo-white.png",
     "wechatQr": "https://cdn.xxx.com/file/wechat-qr.jpg"
   }
   ```
2. **替换商品实物图**：
   打开 [`src/data/products.json`](file:///d:/code/晶泰/src/data/products.json)，直接修改对应商品的 `images` 数组：
   ```json
   "id": "frosted-amber-dropper-30ml",
   "images": [
     "https://cdn.xxx.com/file/30ml-amber-1.jpg",
     "https://cdn.xxx.com/file/30ml-amber-2.jpg"
   ]
   ```

### 操作场景 C：通过 JSON 文件批量映射
准备一个 `tg-map.json`：
```json
{
  "frosted-amber-dropper-30ml": [
    "https://cdn.xxx.com/file/amber-1.jpg",
    "https://cdn.xxx.com/file/amber-2.jpg"
  ],
  "nordic-clear-dropper-50ml": [
    "https://cdn.xxx.com/file/clear-1.jpg"
  ]
}
```
运行批量注入脚本：
```bash
node scripts/sync-tg-assets.cjs --map tg-map.json
```

### 最后执行编译验证
```bash
npm run build
```
看到 71 个页面以 0 错误编译通过后，直接提交代码并触发部署即可！

---

## 六、阶段五：生产环境稳定性与避坑指南

1. **绝对不要删除 TG 频道内的原消息**：
   Telegram 是通过消息中的文件 ID 进行索引的。一旦在频道中删除了该条消息，该文件链接在数小时后将失效返回 404。建议将素材频道设为只读并严格归档。
2. **文件大小控制**：
   建议单张商品照片上传前控制在 **500KB - 2MB** 之间（WebP 或高质量 JPG）。过大的原始 RAW 文件（如 20MB+）会导致手机端加载延迟，影响外贸买家留存率。
3. **启用 Cloudflare 长期缓存**：
   本文档提供的 Worker 脚本已经内置了 `Cache-Control: public, max-age=31536000, immutable`。首次访问后 Cloudflare 会在离买家最近的全球边缘节点缓存 1 年，下次访问毫秒级秒开，且几乎零消耗 Telegram API 额度。
