// 食材健康数据库
export const FOOD_HEALTH_DB = {
  // 大满贯食物
  蓝莓: {
    systems: ["angiogenesis", "stemcell", "dna", "immunity"],
    grandSlam: true,
    expiry: 5,
  },
  黑巧克力: {
    systems: ["angiogenesis", "stemcell", "dna", "immunity"],
    grandSlam: true,
    expiry: 365,
  },
  绿茶: {
    systems: ["angiogenesis", "dna", "immunity"],
    grandSlam: true,
    expiry: 180,
  },
  蘑菇: {
    systems: ["immunity", "angiogenesis", "stemcell"],
    grandSlam: true,
    expiry: 7,
  },
  特级初榨橄榄油: {
    systems: ["angiogenesis", "dna", "stemcell"],
    grandSlam: true,
    expiry: 365,
  },
  胡萝卜: {
    systems: ["angiogenesis", "dna", "immunity"],
    grandSlam: true,
    expiry: 12,
  },
  茄子: {
    systems: ["angiogenesis", "dna", "immunity"],
    grandSlam: true,
    expiry: 7,
  },
  羽衣甘蓝: {
    systems: ["angiogenesis", "dna", "immunity", "stemcell"],
    grandSlam: true,
    expiry: 5,
  },
  奇异果: {
    systems: ["dna", "immunity", "angiogenesis"],
    grandSlam: true,
    expiry: 7,
  },
  樱桃: {
    systems: ["angiogenesis", "dna", "immunity"],
    grandSlam: true,
    expiry: 5,
  },
  桃子: { systems: ["angiogenesis", "dna"], grandSlam: true, expiry: 5 },
  杏: {
    systems: ["angiogenesis", "dna", "immunity"],
    grandSlam: true,
    expiry: 5,
  },
  李子: { systems: ["angiogenesis", "dna"], grandSlam: true, expiry: 7 },
  芒果: {
    systems: ["angiogenesis", "dna", "immunity"],
    grandSlam: true,
    expiry: 5,
  },
  竹笋: { systems: ["angiogenesis", "microbiome"], grandSlam: true, expiry: 5 },
  红茶: { systems: ["angiogenesis", "dna"], grandSlam: true, expiry: 180 },
  咖啡: {
    systems: ["angiogenesis", "dna", "stemcell"],
    grandSlam: true,
    expiry: 365,
  },
  洋甘菊茶: {
    systems: ["angiogenesis", "immunity"],
    grandSlam: true,
    expiry: 180,
  },

  // 普通食物
  鸡蛋: { systems: ["stemcell", "dna"], grandSlam: false, expiry: 14 },
  菠菜: {
    systems: ["angiogenesis", "dna", "immunity"],
    grandSlam: false,
    expiry: 4,
  },
  生菜: {
    systems: ["angiogenesis", "microbiome"],
    grandSlam: false,
    expiry: 4,
  },
  油菜: { systems: ["angiogenesis", "dna"], grandSlam: false, expiry: 4 },
  西兰花: {
    systems: ["angiogenesis", "dna", "immunity"],
    grandSlam: false,
    expiry: 5,
  },
  花菜: { systems: ["angiogenesis", "dna"], grandSlam: false, expiry: 5 },
  番茄: {
    systems: ["angiogenesis", "dna", "immunity"],
    grandSlam: false,
    expiry: 7,
  },
  黄瓜: {
    systems: ["angiogenesis", "microbiome"],
    grandSlam: false,
    expiry: 7,
  },
  土豆: { systems: ["microbiome", "stemcell"], grandSlam: false, expiry: 12 },
  牛奶: { systems: ["stemcell"], grandSlam: false, expiry: 7 },
  豆腐: { systems: ["stemcell", "angiogenesis"], grandSlam: false, expiry: 3 },
  猪肉: { systems: ["stemcell"], grandSlam: false, expiry: 4 },
  鸡肉: { systems: ["stemcell"], grandSlam: false, expiry: 4 },
  苹果: {
    systems: ["angiogenesis", "microbiome", "dna"],
    grandSlam: false,
    expiry: 15,
  },
  香蕉: { systems: ["microbiome", "stemcell"], grandSlam: false, expiry: 5 },
  草莓: { systems: ["angiogenesis", "dna"], grandSlam: false, expiry: 3 },
  大蒜: { systems: ["immunity", "angiogenesis"], grandSlam: false, expiry: 30 },
  洋葱: { systems: ["immunity", "microbiome"], grandSlam: false, expiry: 30 },
  白菜: {
    systems: ["angiogenesis", "microbiome"],
    grandSlam: false,
    expiry: 10,
  },
  芹菜: {
    systems: ["angiogenesis", "microbiome"],
    grandSlam: false,
    expiry: 7,
  },
  牛肉: { systems: ["stemcell"], grandSlam: false, expiry: 4 },
  鱼: {
    systems: ["angiogenesis", "stemcell", "dna"],
    grandSlam: false,
    expiry: 2,
  },
  虾: { systems: ["stemcell"], grandSlam: false, expiry: 2 },

  // 新增食材
  豆芽: { systems: ["stemcell"], grandSlam: false, expiry: 3 },
  空心菜: { systems: ["angiogenesis", "dna"], grandSlam: false, expiry: 3 },
  韭菜: { systems: ["angiogenesis", "stemcell"], grandSlam: false, expiry: 5 },
  青椒: { systems: ["immunity", "angiogenesis"], grandSlam: false, expiry: 7 },
  四季豆: { systems: ["microbiome", "stemcell"], grandSlam: false, expiry: 5 },
  秋葵: { systems: ["microbiome", "immunity"], grandSlam: false, expiry: 4 },
  葱: { systems: ["immunity", "angiogenesis"], grandSlam: false, expiry: 10 },
  紫菜: {
    systems: ["immunity", "angiogenesis"],
    grandSlam: false,
    expiry: 365,
  },
  冬瓜: {
    systems: ["microbiome", "angiogenesis"],
    grandSlam: false,
    expiry: 10,
  },
  南瓜: { systems: ["angiogenesis", "dna"], grandSlam: false, expiry: 30 },
  山药: { systems: ["microbiome", "stemcell"], grandSlam: false, expiry: 15 },
  苦瓜: { systems: ["dna", "immunity"], grandSlam: false, expiry: 5 },
  木耳: {
    systems: ["microbiome", "angiogenesis"],
    grandSlam: false,
    expiry: 365,
  },

  // 地中海饮食食材
  三文鱼: {
    systems: ["angiogenesis", "stemcell", "dna"],
    grandSlam: true,
    expiry: 2,
  },
  牛油果: {
    systems: ["angiogenesis", "dna", "immunity"],
    grandSlam: true,
    expiry: 5,
  },
  特级初榨橄榄油: {
    systems: ["angiogenesis", "dna", "stemcell"],
    grandSlam: true,
    expiry: 365,
  },
  全麦面包: {
    systems: ["microbiome", "stemcell"],
    grandSlam: false,
    expiry: 7,
  },
  坚果: {
    systems: ["angiogenesis", "dna", "immunity"],
    grandSlam: true,
    expiry: 365,
  },
  鹰嘴豆: {
    systems: ["microbiome", "stemcell"],
    grandSlam: false,
    expiry: 365,
  },
  柠檬: {
    systems: ["immunity", "angiogenesis"],
    grandSlam: false,
    expiry: 14,
  },
  奶油: {
    systems: ["stemcell"],
    grandSlam: false,
    expiry: 30,
  },
  奶酪: {
    systems: ["stemcell", "microbiome"],
    grandSlam: false,
    expiry: 30,
  },
  培根: {
    systems: ["stemcell"],
    grandSlam: false,
    expiry: 7,
  },
  椰子油: {
    systems: ["angiogenesis", "immunity"],
    grandSlam: false,
    expiry: 365,
  },
  姜黄: {
    systems: ["immunity", "angiogenesis", "dna"],
    grandSlam: false,
    expiry: 365,
  },
  蜂蜜: {
    systems: ["immunity", "angiogenesis"],
    grandSlam: false,
    expiry: 365,
  },
  燕麦: {
    systems: ["microbiome", "angiogenesis"],
    grandSlam: false,
    expiry: 365,
  },
  荷兰豆: {
    systems: ["microbiome", "angiogenesis"],
    grandSlam: false,
    expiry: 5,
  },
  西葫芦: {
    systems: ["angiogenesis", "microbiome"],
    grandSlam: false,
    expiry: 5,
  },
};
