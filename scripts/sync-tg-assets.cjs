/**
 * Telegram Channel / External CDN Asset Synchronization Utility
 * 
 * Usage:
 *   1. Check asset status:
 *      node scripts/sync-tg-assets.cjs --status
 * 
 *   2. Set global TG CDN base URL (e.g., Cloudflare Worker TG proxy):
 *      node scripts/sync-tg-assets.cjs --cdn https://tg-cdn.yourdomain.com
 * 
 *   3. Bulk replace product images from a mapping file:
 *      node scripts/sync-tg-assets.cjs --map ./tg-mapping.json
 */

const fs = require('fs');
const path = require('path');

const sitePath = path.join(__dirname, '../src/data/site.json');
const productsPath = path.join(__dirname, '../src/data/products.json');

const site = JSON.parse(fs.readFileSync(sitePath, 'utf8'));
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

const args = process.argv.slice(2);

if (args.includes('--status') || args.length === 0) {
  console.log('\n=== 晶泰包装: 静态资源与 TG 资产挂载状态 ===\n');
  console.log(`[CDN 基础前缀] : ${site.assetCdnUrl ? site.assetCdnUrl : '(未配置，当前走本地或直链)'}`);
  console.log('[品牌核心素材] :');
  console.log(`  - Logo        : ${site.assets?.logo || 'N/A'}`);
  console.log(`  - Logo White  : ${site.assets?.logoWhite || 'N/A'}`);
  console.log(`  - WeChat QR   : ${site.assets?.wechatQr || 'N/A'}`);
  
  console.log('\n[商品图片列表 (共 ' + products.length + ' 个商品)] :');
  products.forEach((p, i) => {
    const isTg = (p.images[0] || '').includes('telegram') || (p.images[0] || '').includes('t.me') || (p.images[0] || '').includes('tg-cdn');
    const type = isTg ? '✅ TG 频道' : (p.images[0] || '').startsWith('http') ? '🌐 外链(Unsplash)' : '📁 本地文件';
    console.log(`  ${(i + 1).toString().padStart(2, '0')}. [${type}] ${p.id} (${p.images.length} 张图) -> ${p.images[0]?.slice(0, 60)}...`);
  });

  console.log('\n💡 提示:');
  console.log('  1. 若您有 TG 反代域名: 运行 node scripts/sync-tg-assets.cjs --cdn https://你的域名');
  console.log('  2. 若您有商品图片直链映射表: 运行 node scripts/sync-tg-assets.cjs --map tg-map.json');
  console.log('  3. 或直接在 src/data/site.json 和 src/data/products.json 填入 TG 链接。\n');
  process.exit(0);
}

if (args.includes('--cdn')) {
  const cdnIndex = args.indexOf('--cdn');
  const cdnUrl = args[cdnIndex + 1];
  if (!cdnUrl) {
    console.error('❌ 错误: 请指定 CDN 地址，例如: node scripts/sync-tg-assets.cjs --cdn https://tg-cdn.example.com');
    process.exit(1);
  }
  site.assetCdnUrl = cdnUrl.replace(/\/+$/, '');
  fs.writeFileSync(sitePath, JSON.stringify(site, null, 2), 'utf8');
  console.log(`✅ 已成功将全局资源 CDN 地址更新为: ${site.assetCdnUrl}`);
  process.exit(0);
}

if (args.includes('--map')) {
  const mapIndex = args.indexOf('--map');
  const mapFile = args[mapIndex + 1];
  if (!mapFile || !fs.existsSync(mapFile)) {
    console.error('❌ 错误: 找不到映射文件 ' + mapFile);
    process.exit(1);
  }
  const mapping = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
  let updatedCount = 0;
  products.forEach((p) => {
    if (mapping[p.id]) {
      p.images = Array.isArray(mapping[p.id]) ? mapping[p.id] : [mapping[p.id]];
      updatedCount++;
    }
  });
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf8');
  console.log(`✅ 已成功批量更新 ${updatedCount} 个商品的 TG 图片链接！`);
  process.exit(0);
}
