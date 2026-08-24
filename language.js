const translations = {
  'brand-tag':   {cn:'全球招商合作平台', en:'Global Partnership Platform'},
  'eyebrow':     {cn:'礼行天下 · 诚信立业', en:'Trust Travels the World'},
  'title':       {cn:'寻找全球招商代理合作伙伴', en:'Looking for Global Business Partners'},
  'subtitle':    {cn:'欢迎国内外企业、代理商、渠道商加入合作', en:'Welcoming enterprises, agents and distributors worldwide'},
  'cta':         {cn:'立即申请合作', en:'Apply to Partner'},
  'nav-about':   {cn:'关于我们', en:'About'},
  'nav-types':   {cn:'合作类型', en:'Partnership'},
  'nav-apply':   {cn:'申请合作', en:'Apply'},
  'nav-contact': {cn:'联系我们', en:'Contact'},
  'nav-admin':   {cn:'后台登录', en:'Admin Login'},
  'v1-title':    {cn:'诚信为本', en:'Integrity First'},
  'v1-desc':     {cn:'十余年行业积累，以诚待商，以信立业。', en:'A decade of industry experience, built on trust.'},
  'v2-title':    {cn:'全球资源', en:'Global Reach'},
  'v2-desc':     {cn:'链接海内外渠道网络，助力产品快速落地。', en:'Connecting channel networks worldwide.'},
  'v3-title':    {cn:'长期共赢', en:'Long-term Growth'},
  'v3-desc':     {cn:'陪伴伙伴共同成长，共享长期合作收益。', en:'Growing together with our partners, for the long run.'},
  'types-title': {cn:'合作类型', en:'Partnership Types'},
  'type1':       {cn:'招商人员', en:'Business Development Rep'},
  'type1-desc':  {cn:'负责区域市场拓展与客户对接，享受阶梯佣金。', en:'Lead regional market growth with tiered commission.'},
  'type2':       {cn:'代理商', en:'Agent / Distributor'},
  'type2-desc':  {cn:'获得区域独家代理资格，享受专属价格支持。', en:'Exclusive regional rights with preferred pricing.'},
  'cta2':        {cn:'查看合作详情并申请', en:'View Details & Apply'},
  'contact-title':{cn:'联系我们', en:'Contact Us'},
  'footer-desc': {cn:'礼诚天下 · 全球招商代理合作平台', en:'Global Partnership Platform'}
};

function changeLang(lang){
  document.querySelectorAll('[data-i18n]').forEach(function(el){
    const entry = translations[el.getAttribute('data-i18n')];
    if(entry && entry[lang]){ el.textContent = entry[lang]; }
  });
}
