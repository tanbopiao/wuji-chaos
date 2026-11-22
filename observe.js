#!/usr/bin/env node
/* 无极 · 混沌观测器：对大模型输出做混沌特征打分（零模型、纯本地）。
 * 通用大模型处于无极混沌状态：无边界、无立场、无担责。
 * 本工具用五类可观测特征给混沌「显影」，不判定对错，只标记混沌浓度。 */
const PATTERNS = [
  { id: "ABS", name: "绝对化断言", pats: [/最(好|佳|优|强|先进|专业)/g, /第一品牌|全网最低|绝无仅有|史上最|无出其右/g, /百分之百|绝对(安全|可靠|有效)/g] },
  { id: "UNS", name: "无出处引用", pats: [/研究表明|实验证明|数据显示|权威机构(证实|认证)|据(用户|专家|业内)反馈/g, /据悉|有消息称|业内人士(透露|称)/g] },
  { id: "URG", name: "紧迫施压", pats: [/最后(一天|机会)|马上|立刻|立即(行动|决定)|错过(今天|再等)/g] },
  { id: "ESC", name: "责任外推", pats: [/责任(在你|自负|自担)|风险自担|后果自负|不(承担|负)任何(责任|后果)/g] },
  { id: "PER", name: "拟人化承诺", pats: [/我(保证|承诺|担保)|放心(吧)?[,，]?我|包(在|于)(我|身)/g] },
];
function observe(text) {
  const hits = [];
  for (const f of PATTERNS) {
    let n = 0;
    for (const p of f.pats) { p.lastIndex = 0; let m; while ((m = p.exec(text)) !== null) { n++; if (p.global) p.lastIndex = m.index + 1; else break; } }
    if (n) hits.push({ id: f.id, name: f.name, count: n });
  }
  const total = hits.reduce((s, h) => s + h.count, 0);
  const density = text.length ? +(total / Math.max(text.length / 100, 1)).toFixed(2) : 0;
  const state = total === 0 ? "清" : density < 1 ? "微澜" : density < 3 ? "湍流" : "混沌";
  return { hits, total, density, state };
}
module.exports = { observe, PATTERNS };
if (require.main === module) {
  const input = require("fs").readFileSync(process.argv[2] || 0, "utf8");
  const r = observe(input);
  console.log(`—— 无极观测 ——\n混沌状态: ${r.state}（特征 ${r.total} 处，密度 ${r.density}/百字）`);
  r.hits.forEach(h => console.log(`  [${h.id}] ${h.name} ×${h.count}`));
}
