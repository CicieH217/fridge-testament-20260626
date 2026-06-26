import React, { useState, useEffect } from 'react'

// 五大健康防御系统
const DEFENSE_SYSTEMS = {
  angiogenesis: { name: '血管生成', icon: '🩸', color: '#E74C3C' },
  stemcell: { name: '干细胞再生', icon: '🧬', color: '#9B59B6' },
  microbiome: { name: '微生物组', icon: '🦠', color: '#3498DB' },
  dna: { name: 'DNA 保护', icon: '🛡️', color: '#1ABC9C' },
  immunity: { name: '免疫系统', icon: '⚔️', color: '#F39C12' }
}

// 营养成分数据库（每 100g/100ml）
const NUTRITION_DB = {
  '蓝莓': { calories: 57, protein: 0.7, fat: 0.3, carbs: 14, fiber: 2.4 },
  '黑巧克力': { calories: 546, protein: 5, fat: 31, carbs: 60, fiber: 7 },
  '绿茶': { calories: 1, protein: 0, fat: 0, carbs: 0.2, fiber: 0 },
  '蘑菇': { calories: 22, protein: 3.1, fat: 0.3, carbs: 3.3, fiber: 1 },
  '特级初榨橄榄油': { calories: 884, protein: 0, fat: 100, carbs: 0, fiber: 0 },
  '胡萝卜': { calories: 41, protein: 0.9, fat: 0.2, carbs: 10, fiber: 2.8 },
  '茄子': { calories: 25, protein: 1, fat: 0.2, carbs: 6, fiber: 3 },
  '羽衣甘蓝': { calories: 49, protein: 4.3, fat: 0.9, carbs: 9, fiber: 3.6 },
  '奇异果': { calories: 61, protein: 1.1, fat: 0.5, carbs: 15, fiber: 3 },
  '樱桃': { calories: 50, protein: 1, fat: 0.3, carbs: 12, fiber: 1.6 },
  '鸡蛋': { calories: 155, protein: 13, fat: 11, carbs: 1.1, fiber: 0 },
  '菠菜': { calories: 23, protein: 2.9, fat: 0.4, carbs: 3.6, fiber: 2.2 },
  '番茄': { calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9, fiber: 1.2 },
  '牛奶': { calories: 42, protein: 3.4, fat: 1, carbs: 5, fiber: 0 },
  '豆腐': { calories: 76, protein: 8, fat: 4.8, carbs: 1.9, fiber: 0.3 },
  '猪肉': { calories: 242, protein: 27, fat: 14, carbs: 0, fiber: 0 },
  '鸡肉': { calories: 165, protein: 31, fat: 3.6, carbs: 0, fiber: 0 },
  '苹果': { calories: 52, protein: 0.3, fat: 0.2, carbs: 14, fiber: 2.4 },
  '香蕉': { calories: 89, protein: 1.1, fat: 0.3, carbs: 23, fiber: 2.6 },
  '牛肉': { calories: 250, protein: 26, fat: 15, carbs: 0, fiber: 0 },
  '鱼': { calories: 206, protein: 22, fat: 12, carbs: 0, fiber: 0 },
  // 新增的营养数据
  '大蒜': { calories: 149, protein: 6.4, fat: 0.5, carbs: 30, fiber: 2.1 },
  '蒜头': { calories: 149, protein: 6.4, fat: 0.5, carbs: 30, fiber: 2.1 },
  '洋葱': { calories: 40, protein: 1.1, fat: 0.1, carbs: 9, fiber: 1.7 },
  '西兰花': { calories: 34, protein: 2.8, fat: 0.4, carbs: 7, fiber: 2.6 },
  '白菜': { calories: 13, protein: 1.5, fat: 0.1, carbs: 2, fiber: 1 },
  '生菜': { calories: 15, protein: 1.3, fat: 0.2, carbs: 2, fiber: 1.3 },
  '油菜': { calories: 18, protein: 1.8, fat: 0.3, carbs: 2.5, fiber: 1.4 },
  '芹菜': { calories: 16, protein: 0.7, fat: 0.1, carbs: 3, fiber: 1.5 },
  '花菜': { calories: 25, protein: 2, fat: 0.3, carbs: 5, fiber: 2 },
  '土豆': { calories: 77, protein: 2, fat: 0.1, carbs: 17, fiber: 2.2 },
  '黄瓜': { calories: 15, protein: 0.7, fat: 0.1, carbs: 3, fiber: 0.5 },
  '草莓': { calories: 32, protein: 0.7, fat: 0.3, carbs: 8, fiber: 2 },
  '虾': { calories: 85, protein: 20, fat: 0.7, carbs: 0, fiber: 0 },
  '酸奶': { calories: 59, protein: 3.5, fat: 0.7, carbs: 7, fiber: 0 },
  '红茶': { calories: 1, protein: 0, fat: 0, carbs: 0.3, fiber: 0 },
  '咖啡': { calories: 2, protein: 0.1, fat: 0, carbs: 0, fiber: 0 },
  // 新增食材的营养数据
  '豆芽': { calories: 18, protein: 3.2, fat: 0.1, carbs: 3, fiber: 0.8 },
  '空心菜': { calories: 19, protein: 2.2, fat: 0.2, carbs: 3, fiber: 1.4 },
  '韭菜': { calories: 26, protein: 2.4, fat: 0.4, carbs: 4, fiber: 1.4 },
  '青椒': { calories: 22, protein: 1, fat: 0.3, carbs: 5, fiber: 1.7 },
  '四季豆': { calories: 31, protein: 2, fat: 0.2, carbs: 6, fiber: 2.2 },
  '秋葵': { calories: 25, protein: 2, fat: 0.1, carbs: 5, fiber: 3.2 },
  '葱': { calories: 31, protein: 1.7, fat: 0.3, carbs: 6, fiber: 2.2 },
  '紫菜': { calories: 235, protein: 27, fat: 1, carbs: 45, fiber: 21 },
  '冬瓜': { calories: 11, protein: 0.4, fat: 0.1, carbs: 2, fiber: 0.9 },
  '南瓜': { calories: 26, protein: 1, fat: 0.1, carbs: 6, fiber: 0.5 },
  '山药': { calories: 57, protein: 1.9, fat: 0.2, carbs: 13, fiber: 0.8 },
  '苦瓜': { calories: 19, protein: 1, fat: 0.2, carbs: 3, fiber: 2.7 },
  '木耳': { calories: 21, protein: 1.5, fat: 0.2, carbs: 5, fiber: 2.6 },
  // 地中海饮食食材
  '三文鱼': { calories: 208, protein: 20, fat: 13, carbs: 0, fiber: 0, dietTags: ['mediterranean'] },
  '金枪鱼': { calories: 132, protein: 28, fat: 1, carbs: 0, fiber: 0, dietTags: ['mediterranean'] },
  '牛油果': { calories: 160, protein: 2, fat: 15, carbs: 9, fiber: 7, dietTags: ['mediterranean'] },
  '坚果': { calories: 600, protein: 20, fat: 50, carbs: 20, fiber: 10, dietTags: ['mediterranean'] },
  '全麦面包': { calories: 250, protein: 13, fat: 3, carbs: 45, fiber: 7, dietTags: ['mediterranean'] }
}

// 饮食模式定义
const DIET_PATTERNS = {
  mediterranean: {
    name: '地中海饮食',
    emoji: '🫒',
    description: '富含橄榄油、鱼类、坚果、蔬菜和全谷物',
    keyFoods: ['特级初榨橄榄油', '三文鱼', '金枪鱼', '牛油果', '坚果', '全麦面包', '番茄', '菠菜', '大蒜'],
    benefits: ['心血管健康', '抗炎', '长寿']
  },
  highProtein: {
    name: '高蛋白饮食',
    emoji: '💪',
    description: '适合增肌和运动后恢复',
    keyFoods: ['鸡肉', '牛肉', '鱼', '鸡蛋', '豆腐', '牛奶'],
    benefits: ['增肌', '饱腹感强', '代谢提升']
  },
  lowCarb: {
    name: '低碳水饮食',
    emoji: '🥑',
    description: '适合减脂和控制血糖',
    keyFoods: ['牛油果', '鸡蛋', '鱼', '肉类', '绿叶蔬菜'],
    benefits: ['减脂', '血糖稳定', '精力集中']
  },
  vegetarian: {
    name: '素食',
    emoji: '🥬',
    description: '植物性饮食，环保健康',
    keyFoods: ['豆腐', '菠菜', '西兰花', '蘑菇', '坚果'],
    benefits: ['环保', '心血管健康', '消化好']
  },
  keto: {
    name: '生酮饮食',
    emoji: '🥓',
    description: '高脂肪(70-80%)、极低碳水(5-10%)的饮食模式',
    keyFoods: ['牛油果', '鸡蛋', '三文鱼', '奶酪', '坚果', '橄榄油', '绿叶蔬菜'],
    benefits: ['快速减脂', '血糖控制', 'mental clarity']
  },
  dash: {
    name: 'DASH 饮食',
    emoji: '❤️',
    description: '预防高血压的饮食模式，低盐高钾',
    keyFoods: ['蔬菜', '水果', '全谷物', '低脂奶制品', '鱼', '鸡肉', '坚果'],
    benefits: ['降血压', '心血管健康', '降胆固醇']
  },
  paleo: {
    name: '原始人饮食',
    emoji: '🦴',
    description: '模拟旧石器时代祖先的饮食，无加工食品',
    keyFoods: ['瘦肉', '鱼', '蔬菜', '水果', '坚果', '种子', '鸡蛋'],
    benefits: ['减重', '降血压', '抗炎']
  },
  intermittentFasting: {
    name: '间歇性断食',
    emoji: '⏰',
    description: '16:8或5:2模式，限制进食时间窗口',
    keyFoods: ['任何健康食物', '重点在进食窗口内均衡饮食'],
    benefits: ['减脂', '胰岛素敏感', '细胞修复']
  },
  vegan: {
    name: '纯素饮食',
    emoji: '🌱',
    description: '完全不含动物产品的植物性饮食',
    keyFoods: ['蔬菜', '水果', '全谷物', '豆类', '坚果', '种子', '豆腐'],
    benefits: ['环保', '抗炎', '心血管健康']
  },
  flexitarian: {
    name: '弹性素食',
    emoji: '🥗',
    description: '以植物性食物为主，偶尔食用肉类',
    keyFoods: ['蔬菜', '水果', '全谷物', '豆类', '少量鱼肉', '少量禽肉'],
    benefits: ['灵活', '心血管健康', '可持续']
  },
  antiInflammatory: {
    name: '抗炎饮食',
    emoji: '🔥',
    description: '富含抗氧化剂，减少体内炎症',
    keyFoods: ['蓝莓', '深绿色蔬菜', '三文鱼', '姜黄', '坚果', '橄榄油', '绿茶'],
    benefits: ['抗炎', '关节健康', '免疫提升']
  }
}

// 食材别名映射表
const INGREDIENT_ALIASES = {
  '大蒜': ['蒜头', '蒜', '蒜瓣'],
  '洋葱': ['葱头', '圆葱'],
  '番茄': ['西红柿'],
  '土豆': ['马铃薯', '洋芋'],
  '西兰花': ['绿花菜', '西蓝花'],
  '花菜': ['菜花', '白花菜'],
  '白菜': ['大白菜', '黄芽白'],
  '生菜': ['莴苣叶'],
  '鸡蛋': ['蛋', '鸡蛋白'],
  '牛奶': ['鲜奶', '牛乳'],
  '猪肉': ['猪肉', '猪瘦肉'],
  '牛肉': ['牛瘦肉', '牛排'],
  '鸡肉': ['鸡胸肉', '鸡腿']
}

// 根据别名获取标准食材名
const getStandardIngredient = (name) => {
  // 先检查是否是标准名
  if (NUTRITION_DB[name] || FOOD_HEALTH_DB[name]) {
    return name
  }

  // 检查是否是某个标准食材的别名
  for (const [standard, aliases] of Object.entries(INGREDIENT_ALIASES)) {
    if (aliases.includes(name)) {
      return standard
    }
  }

  // 如果找不到，返回原名
  return name
}

// 单位转换（转换为克）
const UNIT_TO_GRAM = {
  'g': 1,
  '克': 1,
  'kg': 1000,
  '千克': 1000,
  '公斤': 1000,
  'ml': 1,
  '毫升': 1,
  'l': 1000,
  '升': 1000,
  '杯': 240,
  '碗': 200,
  '瓶': 500,
  '盒': 250,
  '包': 100,
  '份': 150
}

// 食物特定重量映射（每个/颗/片的平均重量，基于科学数据）
const FOOD_UNIT_WEIGHTS = {
  // 蛋类
  '鸡蛋': { '个': 50, '颗': 50 },
  '鸭蛋': { '个': 70, '颗': 70 },
  // 水果类
  '苹果': { '个': 180, '颗': 180 },
  '香蕉': { '个': 120, '根': 120 },
  '橙子': { '个': 200, '颗': 200 },
  '梨': { '个': 200, '颗': 200 },
  '桃子': { '个': 150, '颗': 150 },
  '李子': { '个': 50, '颗': 50 },
  '芒果': { '个': 300, '颗': 300 },
  '奇异果': { '个': 80, '颗': 80 },
  '樱桃': { '个': 8, '颗': 8 },
  '草莓': { '个': 15, '颗': 15 },
  '杏': { '个': 40, '颗': 40 },
  '蓝莓': { '个': 2, '颗': 2 },
  // 蔬菜类
  '番茄': { '个': 120, '颗': 120 },
  '土豆': { '个': 150, '颗': 150 },
  '胡萝卜': { '个': 100, '根': 100 },
  '洋葱': { '个': 150, '颗': 150 },
  '茄子': { '个': 200, '根': 200 },
  '黄瓜': { '个': 200, '根': 200 },
  '西兰花': { '个': 300, '颗': 300 },
  '花菜': { '个': 400, '颗': 400 },
  '白菜': { '个': 1000, '颗': 1000 },
  '南瓜': { '个': 2000, '颗': 2000 },
  '冬瓜': { '个': 3000, '颗': 3000 },
  '青椒': { '个': 80, '颗': 80 },
  '苦瓜': { '个': 250, '根': 250 },
  '丝瓜': { '个': 300, '根': 300 },
  '玉米': { '个': 300, '根': 300 },
  '山药': { '个': 200, '根': 200 },
  '莲藕': { '个': 300, '节': 300 },
  // 菌菇类
  '蘑菇': { '个': 20, '朵': 20 },
  '香菇': { '个': 15, '朵': 15 },
  '木耳': { '个': 5, '朵': 5 },
  // 其他
  '豆腐': { '块': 200, '盒': 300 },
  '大蒜': { '个': 5, '颗': 5, '瓣': 3 },
  '生姜': { '个': 50, '块': 50 }
}

// 食材健康数据库
const FOOD_HEALTH_DB = {
  // 大满贯食物
  '蓝莓': { systems: ['angiogenesis', 'stemcell', 'dna', 'immunity'], grandSlam: true, expiry: 5 },
  '黑巧克力': { systems: ['angiogenesis', 'stemcell', 'dna', 'immunity'], grandSlam: true, expiry: 365 },
  '绿茶': { systems: ['angiogenesis', 'dna', 'immunity'], grandSlam: true, expiry: 180 },
  '蘑菇': { systems: ['immunity', 'angiogenesis', 'stemcell'], grandSlam: true, expiry: 7 },
  '特级初榨橄榄油': { systems: ['angiogenesis', 'dna', 'stemcell'], grandSlam: true, expiry: 365 },
  '胡萝卜': { systems: ['angiogenesis', 'dna', 'immunity'], grandSlam: true, expiry: 12 },
  '茄子': { systems: ['angiogenesis', 'dna', 'immunity'], grandSlam: true, expiry: 7 },
  '羽衣甘蓝': { systems: ['angiogenesis', 'dna', 'immunity', 'stemcell'], grandSlam: true, expiry: 5 },
  '奇异果': { systems: ['dna', 'immunity', 'angiogenesis'], grandSlam: true, expiry: 7 },
  '樱桃': { systems: ['angiogenesis', 'dna', 'immunity'], grandSlam: true, expiry: 5 },
  '桃子': { systems: ['angiogenesis', 'dna'], grandSlam: true, expiry: 5 },
  '杏': { systems: ['angiogenesis', 'dna', 'immunity'], grandSlam: true, expiry: 5 },
  '李子': { systems: ['angiogenesis', 'dna'], grandSlam: true, expiry: 7 },
  '芒果': { systems: ['angiogenesis', 'dna', 'immunity'], grandSlam: true, expiry: 5 },
  '竹笋': { systems: ['angiogenesis', 'microbiome'], grandSlam: true, expiry: 5 },
  '红茶': { systems: ['angiogenesis', 'dna'], grandSlam: true, expiry: 180 },
  '咖啡': { systems: ['angiogenesis', 'dna', 'stemcell'], grandSlam: true, expiry: 365 },
  '洋甘菊茶': { systems: ['angiogenesis', 'immunity'], grandSlam: true, expiry: 180 },

  // 普通食物
  '鸡蛋': { systems: ['stemcell', 'dna'], grandSlam: false, expiry: 14 },
  '菠菜': { systems: ['angiogenesis', 'dna', 'immunity'], grandSlam: false, expiry: 4 },
  '生菜': { systems: ['angiogenesis', 'microbiome'], grandSlam: false, expiry: 4 },
  '油菜': { systems: ['angiogenesis', 'dna'], grandSlam: false, expiry: 4 },
  '西兰花': { systems: ['angiogenesis', 'dna', 'immunity'], grandSlam: false, expiry: 5 },
  '花菜': { systems: ['angiogenesis', 'dna'], grandSlam: false, expiry: 5 },
  '番茄': { systems: ['angiogenesis', 'dna', 'immunity'], grandSlam: false, expiry: 7 },
  '黄瓜': { systems: ['angiogenesis', 'microbiome'], grandSlam: false, expiry: 7 },
  '土豆': { systems: ['microbiome', 'stemcell'], grandSlam: false, expiry: 12 },
  '牛奶': { systems: ['stemcell'], grandSlam: false, expiry: 7 },
  '豆腐': { systems: ['stemcell', 'angiogenesis'], grandSlam: false, expiry: 3 },
  '猪肉': { systems: ['stemcell'], grandSlam: false, expiry: 4 },
  '鸡肉': { systems: ['stemcell'], grandSlam: false, expiry: 4 },
  '苹果': { systems: ['angiogenesis', 'microbiome', 'dna'], grandSlam: false, expiry: 15 },
  '香蕉': { systems: ['microbiome', 'stemcell'], grandSlam: false, expiry: 5 },
  '草莓': { systems: ['angiogenesis', 'dna'], grandSlam: false, expiry: 3 },
  '大蒜': { systems: ['immunity', 'angiogenesis'], grandSlam: false, expiry: 30 },
  '洋葱': { systems: ['immunity', 'microbiome'], grandSlam: false, expiry: 30 },
  '白菜': { systems: ['angiogenesis', 'microbiome'], grandSlam: false, expiry: 10 },
  '芹菜': { systems: ['angiogenesis', 'microbiome'], grandSlam: false, expiry: 7 },
  '牛肉': { systems: ['stemcell'], grandSlam: false, expiry: 4 },
  '鱼': { systems: ['angiogenesis', 'stemcell', 'dna'], grandSlam: false, expiry: 2 },
  '虾': { systems: ['stemcell'], grandSlam: false, expiry: 2 },

  // 新增食材
  '豆芽': { systems: ['stemcell'], grandSlam: false, expiry: 3 },
  '空心菜': { systems: ['angiogenesis', 'dna'], grandSlam: false, expiry: 3 },
  '韭菜': { systems: ['angiogenesis', 'stemcell'], grandSlam: false, expiry: 5 },
  '青椒': { systems: ['immunity', 'angiogenesis'], grandSlam: false, expiry: 7 },
  '四季豆': { systems: ['microbiome', 'stemcell'], grandSlam: false, expiry: 5 },
  '秋葵': { systems: ['microbiome', 'immunity'], grandSlam: false, expiry: 4 },
  '葱': { systems: ['immunity', 'angiogenesis'], grandSlam: false, expiry: 10 },
  '紫菜': { systems: ['immunity', 'angiogenesis'], grandSlam: false, expiry: 365 },
  '冬瓜': { systems: ['microbiome', 'angiogenesis'], grandSlam: false, expiry: 10 },
  '南瓜': { systems: ['angiogenesis', 'dna'], grandSlam: false, expiry: 30 },
  '山药': { systems: ['microbiome', 'stemcell'], grandSlam: false, expiry: 15 },
  '苦瓜': { systems: ['dna', 'immunity'], grandSlam: false, expiry: 5 },
  '木耳': { systems: ['microbiome', 'angiogenesis'], grandSlam: false, expiry: 365 }
}

// 菜谱数据库
const RECIPES = [
  // 大满贯菜谱
  { name: '番茄炒蛋', ingredients: ['番茄', '鸡蛋'], emoji: '🍳', health: 'DNA 保护 + 干细胞再生' },
  { name: '蒜蓉菠菜', ingredients: ['菠菜', '大蒜'], emoji: '🥗', health: '血管生成 + 免疫' },
  { name: '西兰花炒肉', ingredients: ['西兰花', '猪肉'], emoji: '🥦', health: 'DNA 保护 + 干细胞' },
  { name: '土豆炖牛肉', ingredients: ['土豆', '牛肉'], emoji: '🥔', health: '微生物组 + 干细胞' },
  { name: '黄瓜炒鸡蛋', ingredients: ['黄瓜', '鸡蛋'], emoji: '🥒', health: '血管生成 + 干细胞' },
  { name: '胡萝卜炒肉', ingredients: ['胡萝卜', '猪肉'], emoji: '🥕', health: '大满贯：血管 + DNA + 免疫' },
  { name: '白菜豆腐汤', ingredients: ['白菜', '豆腐'], emoji: '🍲', health: '血管生成 + 干细胞' },
  { name: '香蕉奶昔', ingredients: ['香蕉', '牛奶'], emoji: '🥤', health: '微生物组 + 干细胞' },
  { name: '蓝莓酸奶碗', ingredients: ['蓝莓'], emoji: '🫐', health: '大满贯：4 个防御系统' },
  { name: '蘑菇鸡汤', ingredients: ['蘑菇', '鸡肉'], emoji: '🍄', health: '大满贯：免疫 + 血管 + 干细胞' },
  { name: '蘑菇炒蛋', ingredients: ['蘑菇', '鸡蛋'], emoji: '🍳', health: '大满贯 + 干细胞' },
  { name: '蒜蓉茄子', ingredients: ['茄子', '大蒜'], emoji: '🍆', health: '大满贯 + 免疫' },
  { name: '胡萝卜炒蛋', ingredients: ['胡萝卜', '鸡蛋'], emoji: '🥕', health: '大满贯 + 干细胞' },
  { name: '绿茶配黑巧', ingredients: ['绿茶', '黑巧克力'], emoji: '🍵', health: '超级大满贯：覆盖全部系统' },
  { name: '番茄蘑菇汤', ingredients: ['番茄', '蘑菇'], emoji: '🍅', health: '大满贯组合' },

  // 简单家常菜谱（不需要大满贯食物）
  { name: '蒜蓉炒西兰花', ingredients: ['西兰花', '大蒜'], emoji: '🥦', health: '血管生成 + DNA + 免疫' },
  { name: '清炒白菜', ingredients: ['白菜'], emoji: '🥬', health: '微生物组 + 血管生成' },
  { name: '番茄蛋花汤', ingredients: ['番茄', '鸡蛋'], emoji: '🍅', health: 'DNA 保护 + 血管生成' },
  { name: '洋葱炒鸡蛋', ingredients: ['洋葱', '鸡蛋'], emoji: '🧅', health: '免疫 + 干细胞' },
  { name: '芹菜炒肉', ingredients: ['芹菜', '猪肉'], emoji: '🥬', health: '微生物组 + 干细胞' },
  { name: '清蒸鱼', ingredients: ['鱼'], emoji: '🐟', health: '血管生成 + 干细胞 + DNA' },
  { name: '白灼虾', ingredients: ['虾'], emoji: '🦐', health: '干细胞再生' },
  { name: '蒜蓉生菜', ingredients: ['生菜', '大蒜'], emoji: '🥬', health: '血管生成 + 免疫' },
  { name: '炒油菜', ingredients: ['油菜'], emoji: '🥬', health: '血管生成 + DNA' },
  { name: '花菜炒肉', ingredients: ['花菜', '猪肉'], emoji: '🥦', health: '血管生成 + 干细胞' },
  { name: '草莓奶昔', ingredients: ['草莓', '牛奶'], emoji: '🍓', health: '血管生成 + 干细胞' },
  { name: '苹果汁', ingredients: ['苹果'], emoji: '🍎', health: '微生物组 + 血管生成 + DNA' },

  // 新增：更多经典家常菜
  { name: '酸辣土豆丝', ingredients: ['土豆', '大蒜'], emoji: '🥔', health: '微生物组 + 免疫' },
  { name: '鱼香肉丝', ingredients: ['猪肉', '胡萝卜'], emoji: '🥕', health: '干细胞 + 大满贯' },
  { name: '宫保鸡丁', ingredients: ['鸡肉', '胡萝卜'], emoji: '🍗', health: '干细胞 + 大满贯' },
  { name: '麻婆豆腐', ingredients: ['豆腐', '猪肉'], emoji: '🍲', health: '血管生成 + 干细胞' },
  { name: '红烧茄子', ingredients: ['茄子', '大蒜'], emoji: '🍆', health: '大满贯 + 免疫' },
  { name: '清炒豆芽', ingredients: ['豆芽'], emoji: '🌱', health: '干细胞再生' },
  { name: '蒜蓉空心菜', ingredients: ['空心菜', '大蒜'], emoji: '🥬', health: '血管生成 + 免疫' },
  { name: '韭菜炒蛋', ingredients: ['韭菜', '鸡蛋'], emoji: '🥚', health: '血管生成 + 干细胞' },
  { name: '青椒肉丝', ingredients: ['青椒', '猪肉'], emoji: '🫑', health: '免疫 + 干细胞' },
  { name: '干煸四季豆', ingredients: ['四季豆', '猪肉'], emoji: '🫘', health: '微生物组 + 干细胞' },
  { name: '蒜蓉秋葵', ingredients: ['秋葵', '大蒜'], emoji: '🟢', health: '微生物组 + 免疫' },
  { name: '凉拌黄瓜', ingredients: ['黄瓜', '大蒜'], emoji: '🥒', health: '血管生成 + 免疫' },
  { name: '西红柿鸡蛋面', ingredients: ['番茄', '鸡蛋'], emoji: '🍜', health: 'DNA + 干细胞' },
  { name: '葱花鸡蛋饼', ingredients: ['鸡蛋', '葱'], emoji: '🥞', health: '干细胞 + 免疫' },
  { name: '紫菜蛋花汤', ingredients: ['紫菜', '鸡蛋'], emoji: '🥣', health: '免疫 + 干细胞' },
  { name: '冬瓜排骨汤', ingredients: ['冬瓜', '猪肉'], emoji: '🍲', health: '微生物组 + 干细胞' },
  { name: '南瓜小米粥', ingredients: ['南瓜'], emoji: '🎃', health: '血管生成 + DNA' },
  { name: '清炒山药', ingredients: ['山药'], emoji: '🥔', health: '微生物组 + 干细胞' },
  { name: '蒜蓉苦瓜', ingredients: ['苦瓜', '大蒜'], emoji: '🟢', health: 'DNA + 免疫' },
  { name: '菠菜猪肝汤', ingredients: ['菠菜', '猪肉'], emoji: '🥬', health: '血管生成 + 干细胞' },
  { name: '木耳炒肉', ingredients: ['木耳', '猪肉'], emoji: '🍄', health: '微生物组 + 干细胞' },

  // 新增：西兰花搭配系列
  { name: '西兰花炒蘑菇', ingredients: ['西兰花', '蘑菇'], emoji: '🥦', health: '血管生成 + DNA + 免疫' },
  { name: '西兰花炒鸡肉', ingredients: ['西兰花', '鸡肉'], emoji: '🥦', health: '血管生成 + 干细胞 + DNA' },
  { name: '西兰花炒虾仁', ingredients: ['西兰花', '虾'], emoji: '🥦', health: '血管生成 + 干细胞' },
  { name: '西兰花炒鸡蛋', ingredients: ['西兰花', '鸡蛋'], emoji: '🥦', health: '血管生成 + DNA + 干细胞' },
  { name: '西兰花炒牛肉', ingredients: ['西兰花', '牛肉'], emoji: '🥦', health: '血管生成 + 干细胞 + DNA' },
  { name: '西兰花炒豆腐', ingredients: ['西兰花', '豆腐'], emoji: '🥦', health: '血管生成 + DNA + 干细胞' },

  // 新增：蘑菇搭配系列
  { name: '蘑菇炒西兰花', ingredients: ['蘑菇', '西兰花'], emoji: '🍄', health: '大满贯 + 血管生成' },
  { name: '蘑菇炒青菜', ingredients: ['蘑菇', '青菜'], emoji: '🍄', health: '大满贯 + 血管生成' },
  { name: '蘑菇炒鸡蛋', ingredients: ['蘑菇', '鸡蛋'], emoji: '🍄', health: '大满贯 + 干细胞' },

  // 新增：鸡肉搭配系列
  { name: '鸡肉炒西兰花', ingredients: ['鸡肉', '西兰花'], emoji: '🍗', health: '干细胞 + 血管生成' },
  { name: '鸡肉炒蘑菇', ingredients: ['鸡肉', '蘑菇'], emoji: '🍗', health: '干细胞 + 大满贯' },
  { name: '鸡肉炒青椒', ingredients: ['鸡肉', '青椒'], emoji: '🍗', health: '干细胞 + 免疫' },

  // 新增：更多家常搭配
  { name: '青椒炒鸡蛋', ingredients: ['青椒', '鸡蛋'], emoji: '🫑', health: '免疫 + 干细胞' },
  { name: '土豆炒鸡蛋', ingredients: ['土豆', '鸡蛋'], emoji: '🥔', health: '微生物组 + 干细胞' },
  { name: '胡萝卜炒鸡蛋', ingredients: ['胡萝卜', '鸡蛋'], emoji: '🥕', health: '大满贯 + 干细胞' },
  { name: '洋葱炒牛肉', ingredients: ['洋葱', '牛肉'], emoji: '🧅', health: '免疫 + 干细胞' },
  { name: '白菜炒木耳', ingredients: ['白菜', '木耳'], emoji: '🥬', health: '血管生成 + 微生物组' },

  // 新增：经典家常菜（更多搭配）
  { name: '酸辣白菜', ingredients: ['白菜', '胡萝卜'], emoji: '🥬', health: '血管生成 + 微生物组' },
  { name: '清炒土豆丝', ingredients: ['土豆', '青椒'], emoji: '🥔', health: '微生物组 + 免疫' },
  { name: '红烧土豆', ingredients: ['土豆', '猪肉'], emoji: '🥔', health: '微生物组 + 干细胞' },
  { name: '番茄土豆汤', ingredients: ['番茄', '土豆'], emoji: '🍅', health: 'DNA + 微生物组' },
  { name: '黄瓜炒肉片', ingredients: ['黄瓜', '猪肉'], emoji: '🥒', health: '血管生成 + 干细胞' },
  { name: '凉拌木耳', ingredients: ['木耳', '胡萝卜'], emoji: '🍄', health: '微生物组 + 大满贯' },
  { name: '芹菜炒香干', ingredients: ['芹菜', '豆腐'], emoji: '🥬', health: '微生物组 + 血管生成' },
  { name: '茄子土豆煲', ingredients: ['茄子', '土豆'], emoji: '🍆', health: '大满贯 + 微生物组' },
  { name: '蒜蓉粉丝蒸扇贝', ingredients: ['扇贝', '大蒜'], emoji: '🐚', health: '干细胞 + 免疫' },
  { name: '清蒸鲈鱼', ingredients: ['鱼', '葱'], emoji: '🐟', health: '血管生成 + 免疫' },
  { name: '糖醋排骨', ingredients: ['猪肉', '胡萝卜'], emoji: '🍖', health: '干细胞 + 大满贯' },
  { name: '鱼香茄子', ingredients: ['茄子', '猪肉'], emoji: '🍆', health: '大满贯 + 干细胞' },
  { name: '回锅肉', ingredients: ['猪肉', '青椒'], emoji: '🥓', health: '干细胞 + 免疫' },
  { name: '水煮鱼', ingredients: ['鱼', '白菜'], emoji: '🐟', health: '血管生成 + 微生物组' },
  { name: '酸菜鱼', ingredients: ['鱼', '白菜'], emoji: '🐟', health: '血管生成 + 微生物组' },
  { name: '红烧肉', ingredients: ['猪肉'], emoji: '🥩', health: '干细胞再生' },
  { name: '清炖鸡汤', ingredients: ['鸡肉', '蘑菇'], emoji: '🍲', health: '干细胞 + 大满贯' },
  { name: '番茄牛肉汤', ingredients: ['番茄', '牛肉'], emoji: '🍲', health: 'DNA + 干细胞' },
  { name: '玉米排骨汤', ingredients: ['玉米', '猪肉'], emoji: '🍲', health: '微生物组 + 干细胞' },
  { name: '冬瓜排骨汤', ingredients: ['冬瓜', '猪肉'], emoji: '🍲', health: '微生物组 + 干细胞' },
  { name: '莲藕排骨汤', ingredients: ['莲藕', '猪肉'], emoji: '🍲', health: '血管生成 + 干细胞' },
  { name: '山药炖鸡汤', ingredients: ['山药', '鸡肉'], emoji: '🍲', health: '微生物组 + 干细胞' },
  { name: '胡萝卜牛肉汤', ingredients: ['胡萝卜', '牛肉'], emoji: '🍲', health: '大满贯 + 干细胞' },
  { name: '菠菜鸡蛋汤', ingredients: ['菠菜', '鸡蛋'], emoji: '🥣', health: '血管生成 + 干细胞' },
  { name: '紫菜虾皮汤', ingredients: ['紫菜', '虾'], emoji: '🥣', health: '免疫 + 干细胞' },
  { name: '西红柿蛋汤', ingredients: ['番茄', '鸡蛋'], emoji: '🥣', health: 'DNA + 干细胞' },
  { name: '蛋炒饭', ingredients: ['鸡蛋', '胡萝卜'], emoji: '🍚', health: '干细胞 + 大满贯' },
  { name: '酱油炒饭', ingredients: ['鸡蛋', '青椒'], emoji: '🍚', health: '干细胞 + 免疫' },
  { name: '扬州炒饭', ingredients: ['鸡蛋', '胡萝卜', '猪肉'], emoji: '🍚', health: '干细胞 + 大满贯' },
  { name: '炒面', ingredients: ['猪肉', '白菜'], emoji: '🍜', health: '干细胞 + 血管生成' },
  { name: '炒河粉', ingredients: ['猪肉', '豆芽'], emoji: '🍜', health: '干细胞 + 再生' },
  { name: '炸酱面', ingredients: ['猪肉', '黄瓜'], emoji: '🍜', health: '干细胞 + 血管生成' },
  { name: '葱油拌面', ingredients: ['葱', '鸡蛋'], emoji: '🍜', health: '免疫 + 干细胞' },
  { name: '煎饺', ingredients: ['猪肉', '白菜'], emoji: '🥟', health: '干细胞 + 血管生成' },
  { name: '蒸饺', ingredients: ['猪肉', '白菜'], emoji: '🥟', health: '干细胞 + 血管生成' },
  { name: '小笼包', ingredients: ['猪肉', '葱'], emoji: '🥟', health: '干细胞 + 免疫' },
  { name: '红烧狮子头', ingredients: ['猪肉', '白菜'], emoji: '🍖', health: '干细胞 + 血管生成' },
  { name: '清蒸狮子头', ingredients: ['猪肉', '马蹄'], emoji: '🍖', health: '干细胞再生' },
  { name: '可乐鸡翅', ingredients: ['鸡肉'], emoji: '🍗', health: '干细胞再生' },
  { name: '红烧鸡翅', ingredients: ['鸡肉', '土豆'], emoji: '🍗', health: '干细胞 + 微生物组' },
  { name: '烤鸡腿', ingredients: ['鸡肉', '土豆'], emoji: '🍗', health: '干细胞 + 微生物组' },
  { name: '宫保虾球', ingredients: ['虾', '胡萝卜'], emoji: '🦐', health: '干细胞 + 大满贯' },
  { name: '蒜蓉粉丝蒸虾', ingredients: ['虾', '大蒜'], emoji: '🦐', health: '干细胞 + 免疫' },
  { name: '白灼基围虾', ingredients: ['虾'], emoji: '🦐', health: '干细胞再生' },
  { name: '椒盐虾', ingredients: ['虾', '青椒'], emoji: '🦐', health: '干细胞 + 免疫' },
  { name: '番茄虾仁', ingredients: ['番茄', '虾'], emoji: '🍅', health: 'DNA + 干细胞' },
  { name: '虾仁炒蛋', ingredients: ['虾', '鸡蛋'], emoji: '🦐', health: '干细胞 + DNA' },
  { name: '韭菜盒子', ingredients: ['韭菜', '鸡蛋'], emoji: '🥟', health: '血管生成 + 干细胞' },
  { name: '葱油饼', ingredients: ['葱', '鸡蛋'], emoji: '🥞', health: '免疫 + 干细胞' },
  { name: '鸡蛋饼', ingredients: ['鸡蛋', '胡萝卜'], emoji: '🥞', health: '干细胞 + 大满贯' },
  { name: '手抓饼', ingredients: ['鸡蛋', '猪肉'], emoji: '🥞', health: '干细胞 + DNA' },
  { name: '肉夹馍', ingredients: ['猪肉'], emoji: '🥙', health: '干细胞再生' },
  { name: '煎饼果子', ingredients: ['鸡蛋', '葱'], emoji: '🥞', health: '干细胞 + 免疫' },
  { name: '生煎包', ingredients: ['猪肉', '葱'], emoji: '🥟', health: '干细胞 + 免疫' },
  { name: '锅贴', ingredients: ['猪肉', '白菜'], emoji: '🥟', health: '干细胞 + 血管生成' },
  { name: '烧麦', ingredients: ['猪肉', '糯米'], emoji: '🥟', health: '干细胞再生' },
  { name: '粽子', ingredients: ['猪肉', '糯米'], emoji: '🍙', health: '干细胞再生' },
  { name: '汤圆', ingredients: ['猪肉', '糯米'], emoji: '🍡', health: '干细胞再生' },
  { name: '月饼', ingredients: ['猪肉', '蛋黄'], emoji: '🥮', health: '干细胞 + DNA' },
  { name: '春卷', ingredients: ['猪肉', '白菜'], emoji: '🥟', health: '干细胞 + 血管生成' },
  { name: '油条', ingredients: ['鸡蛋'], emoji: '🥖', health: '干细胞再生' },
  { name: '豆浆', ingredients: ['黄豆'], emoji: '🥛', health: '干细胞再生' },
  { name: '豆腐脑', ingredients: ['豆腐', '猪肉'], emoji: '🥣', health: '血管生成 + 干细胞' },
  { name: '皮蛋瘦肉粥', ingredients: ['猪肉', '鸡蛋'], emoji: '🥣', health: '干细胞 + DNA' },
  { name: '小米粥', ingredients: ['小米'], emoji: '🥣', health: '微生物组再生' },
  { name: '八宝粥', ingredients: ['红豆', '糯米'], emoji: '🥣', health: '微生物组再生' },
  { name: '绿豆汤', ingredients: ['绿豆'], emoji: '🥣', health: '微生物组再生' },
  { name: '红豆汤', ingredients: ['红豆'], emoji: '🥣', health: '微生物组再生' },
  { name: '银耳莲子汤', ingredients: ['银耳', '莲子'], emoji: '🥣', health: '微生物组再生' },
  { name: '冰糖雪梨', ingredients: ['梨'], emoji: '🍐', health: '微生物组 + 血管生成' },
  { name: '桂花酸梅汤', ingredients: ['乌梅'], emoji: '🥤', health: '微生物组再生' }
]

// 菜谱元数据（难度、烹饪时间）
const RECIPE_METADATA = {
  // 快手菜（<15分钟）
  '番茄炒蛋': { difficulty: '简单', time: 10 },
  '蒜蓉菠菜': { difficulty: '简单', time: 8 },
  '黄瓜炒鸡蛋': { difficulty: '简单', time: 10 },
  '凉拌黄瓜': { difficulty: '简单', time: 5 },
  '清炒白菜': { difficulty: '简单', time: 8 },
  '蒜蓉生菜': { difficulty: '简单', time: 8 },
  '炒油菜': { difficulty: '简单', time: 8 },
  '清炒豆芽': { difficulty: '简单', time: 8 },
  '蒜蓉秋葵': { difficulty: '简单', time: 10 },
  '蓝莓酸奶碗': { difficulty: '简单', time: 5 },
  '苹果汁': { difficulty: '简单', time: 5 },

  // 中等难度（15-30分钟）
  '西兰花炒肉': { difficulty: '中等', time: 20 },
  '胡萝卜炒肉': { difficulty: '中等', time: 20 },
  '白菜豆腐汤': { difficulty: '中等', time: 25 },
  '香蕉奶昔': { difficulty: '简单', time: 10 },
  '蘑菇炒蛋': { difficulty: '中等', time: 15 },
  '蒜蓉茄子': { difficulty: '中等', time: 20 },
  '胡萝卜炒蛋': { difficulty: '中等', time: 15 },
  '蒜蓉炒西兰花': { difficulty: '简单', time: 12 },
  '番茄蛋花汤': { difficulty: '简单', time: 15 },
  '洋葱炒鸡蛋': { difficulty: '简单', time: 15 },
  '芹菜炒肉': { difficulty: '中等', time: 20 },
  '清蒸鱼': { difficulty: '中等', time: 25 },
  '白灼虾': { difficulty: '简单', time: 15 },
  '花菜炒肉': { difficulty: '中等', time: 20 },
  '草莓奶昔': { difficulty: '简单', time: 10 },
  '酸辣土豆丝': { difficulty: '简单', time: 15 },
  '鱼香肉丝': { difficulty: '中等', time: 25 },
  '宫保鸡丁': { difficulty: '中等', time: 25 },
  '麻婆豆腐': { difficulty: '中等', time: 20 },
  '红烧茄子': { difficulty: '中等', time: 25 },
  '蒜蓉空心菜': { difficulty: '简单', time: 10 },
  '韭菜炒蛋': { difficulty: '简单', time: 12 },
  '青椒肉丝': { difficulty: '中等', time: 20 },
  '干煸四季豆': { difficulty: '中等', time: 20 },
  '西红柿鸡蛋面': { difficulty: '简单', time: 15 },
  '葱花鸡蛋饼': { difficulty: '中等', time: 20 },
  '紫菜蛋花汤': { difficulty: '简单', time: 10 },
  '南瓜小米粥': { difficulty: '简单', time: 30 },
  '清炒山药': { difficulty: '简单', time: 15 },
  '蒜蓉苦瓜': { difficulty: '简单', time: 12 },

  // 复杂菜（>30分钟）
  '土豆炖牛肉': { difficulty: '复杂', time: 60 },
  '蘑菇鸡汤': { difficulty: '复杂', time: 90 },
  '绿茶配黑巧': { difficulty: '简单', time: 5 },
  '番茄蘑菇汤': { difficulty: '中等', time: 25 },
  '冬瓜排骨汤': { difficulty: '复杂', time: 90 },
  '红烧肉': { difficulty: '复杂', time: 120 },
  '糖醋排骨': { difficulty: '复杂', time: 60 },
  '鱼香茄子': { difficulty: '中等', time: 30 },
  '回锅肉': { difficulty: '中等', time: 30 },
  '水煮鱼': { difficulty: '复杂', time: 45 },
  '酸菜鱼': { difficulty: '复杂', time: 50 },
  '清炖鸡汤': { difficulty: '复杂', time: 120 },
  '番茄牛肉汤': { difficulty: '复杂', time: 90 },
  '玉米排骨汤': { difficulty: '复杂', time: 90 },
  '莲藕排骨汤': { difficulty: '复杂', time: 90 },
  '山药炖鸡汤': { difficulty: '复杂', time: 120 },
  '胡萝卜牛肉汤': { difficulty: '复杂', time: 90 },
  '菠菜猪肝汤': { difficulty: '中等', time: 25 },
  '木耳炒肉': { difficulty: '中等', time: 20 }
}

// 获取菜谱元数据
const getRecipeMetadata = (recipeName) => {
  return RECIPE_METADATA[recipeName] || { difficulty: '中等', time: 20 }
}

// 解析数量字符串为克数
// 解析数量字符串为克数（支持食物特定重量）
const parseToGrams = (qty, foodName = null) => {
  if (!qty) return 150 // 默认

  // 匹配数字 + 单位
  const match = qty.match(/^(\d+(?:\.\d+)?)\s*(ml|毫升|l|升|g|克|kg|千克|公斤|个|颗|片|块|杯|碗|瓶|盒|包|份|根|朵|瓣|节)?$/i)

  if (match) {
    const num = parseFloat(match[1])
    const unit = match[2]?.toLowerCase() || '份'

    // 优先使用食物特定重量
    if (foodName && FOOD_UNIT_WEIGHTS[foodName] && FOOD_UNIT_WEIGHTS[foodName][unit]) {
      return num * FOOD_UNIT_WEIGHTS[foodName][unit]
    }

    // 否则使用通用单位转换
    const multiplier = UNIT_TO_GRAM[unit] || 1
    return num * multiplier
  }

  // 纯数字
  const numMatch = qty.match(/^(\d+(?:\.\d+)?)$/)
  if (numMatch) {
    return parseFloat(numMatch[1]) * 150 // 假设是份数
  }

  // 中文数字
  const chineseNums = { '一': 1, '二': 2, '两': 2, '三': 3, '四': 4, '五': 5, '半': 0.5 }
  for (const [char, num] of Object.entries(chineseNums)) {
    if (qty.startsWith(char)) {
      if (foodName && FOOD_UNIT_WEIGHTS[foodName] && FOOD_UNIT_WEIGHTS[foodName]['个']) {
        return num * FOOD_UNIT_WEIGHTS[foodName]['个']
      }
      return num * 150
    }
  }

  return 150
}

// 格式化数量显示
const formatQuantity = (grams) => {
  if (grams >= 1000) return `${(grams / 1000).toFixed(1)}kg`
  if (grams >= 100) return `${Math.round(grams)}g`
  return `${grams.toFixed(0)}g`
}

function App() {
  const [foods, setFoods] = useState(() => {
    const saved = localStorage.getItem('fridge_foods')
    return saved ? JSON.parse(saved) : []
  })
  const [inputText, setInputText] = useState('')
  const [matchedRecipes, setMatchedRecipes] = useState(null)
  const [flashCount, setFlashCount] = useState(0)
  const [showDefensePanel, setShowDefensePanel] = useState(false)
  const [show555Explanation, setShow555Explanation] = useState(false)
  const [editingFood, setEditingFood] = useState(null)
  const [editQuantity, setEditQuantity] = useState('')
  const [editExpiryDate, setEditExpiryDate] = useState('')
  const [meals, setMeals] = useState(() => {
    const saved = localStorage.getItem('fridge_meals')
    const today = new Date().toDateString()
    if (saved) {
      const parsed = JSON.parse(saved)
      // 只保留今天的数据
      return parsed.date === today ? parsed.meals : []
    }
    return []
  })
  const [showMealSelector, setShowMealSelector] = useState(null) // 正在选择餐次的菜谱
  const [showDailySummary, setShowDailySummary] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showIngredientQuantity, setShowIngredientQuantity] = useState(null) // 正在设置食材用量
  const [ingredientQuantities, setIngredientQuantities] = useState({}) // 自定义食材用量

  // 健康目标和饮食偏好
  const [healthGoal, setHealthGoal] = useState(() => {
    return localStorage.getItem('healthGoal') || 'maintain'
  })
  const [dietaryPreferences, setDietaryPreferences] = useState(() => {
    const saved = localStorage.getItem('dietaryPreferences')
    return saved ? JSON.parse(saved) : []
  })

  // 个人健康档案
  const [healthProfile, setHealthProfile] = useState(() => {
    const saved = localStorage.getItem('healthProfile')
    return saved ? JSON.parse(saved) : {
      height: 170, // cm
      weight: 65, // kg
      age: 30,
      gender: 'male', // male/female
      activityLevel: 'moderate', // sedentary/light/moderate/active/veryActive
      showProfileSetup: false
    }
  })

  // 收藏夹
  const [favoriteRecipes, setFavoriteRecipes] = useState(() => {
    const saved = localStorage.getItem('favoriteRecipes')
    return saved ? JSON.parse(saved) : []
  })

  // 烹饪历史
  const [cookingHistory, setCookingHistory] = useState(() => {
    const saved = localStorage.getItem('cookingHistory')
    return saved ? JSON.parse(saved) : []
  })

  // 显示购物清单
  const [showShoppingList, setShowShoppingList] = useState(false)

  // 显示收藏夹
  const [showFavorites, setShowFavorites] = useState(false)

  // 历史饮食数据（用于趋势分析）
  const [mealHistory, setMealHistory] = useState(() => {
    const saved = localStorage.getItem('mealHistory')
    return saved ? JSON.parse(saved) : []
  })

  // 营养目标
  const [nutritionGoals, setNutritionGoals] = useState(() => {
    const saved = localStorage.getItem('nutritionGoals')
    return saved ? JSON.parse(saved) : {
      calories: 2000,
      protein: 60,
      fat: 65,
      carbs: 250,
      fiber: 25
    }
  })

  // 餐次类型
  const MEAL_TYPES = {
    breakfast: { name: '早餐', icon: '🌅', time: '6:00-10:00' },
    lunch: { name: '午餐', icon: '☀️', time: '11:00-14:00' },
    dinner: { name: '晚餐', icon: '🌙', time: '17:00-20:00' },
    snack: { name: '加餐', icon: '🍪', time: '其他时间' }
  }

  const startEditing = (food) => {
    setEditingFood(food.id)
    setEditQuantity(food.quantity || formatQuantity(food.grams))
    setEditExpiryDate(food.expiryDate)
  }

  const saveEdit = (id) => {
    updateFood(id, {
      quantity: editQuantity,
      expiryDate: editExpiryDate
    })
    setEditingFood(null)
  }

  useEffect(() => {
    localStorage.setItem('fridge_foods', JSON.stringify(foods))
  }, [foods])

  useEffect(() => {
    const today = new Date().toDateString()
    localStorage.setItem('fridge_meals', JSON.stringify({ date: today, meals }))

    // 记录到历史数据
    if (meals.length > 0) {
      const todayData = {
        date: new Date().toISOString().split('T')[0],
        nutrition: calculateDailyNutrition(),
        mealCount: meals.length
      }

      setMealHistory(prev => {
        const filtered = prev.filter(m => m.date !== todayData.date)
        const updated = [...filtered, todayData].slice(-30) // 只保留最近30天
        localStorage.setItem('mealHistory', JSON.stringify(updated))
        return updated
      })
    }
  }, [meals])

  useEffect(() => {
    localStorage.setItem('healthGoal', healthGoal)
  }, [healthGoal])

  useEffect(() => {
    localStorage.setItem('dietaryPreferences', JSON.stringify(dietaryPreferences))
  }, [dietaryPreferences])

  useEffect(() => {
    localStorage.setItem('nutritionGoals', JSON.stringify(nutritionGoals))
  }, [nutritionGoals])

  useEffect(() => {
    localStorage.setItem('healthProfile', JSON.stringify(healthProfile))
  }, [healthProfile])

  useEffect(() => {
    localStorage.setItem('favoriteRecipes', JSON.stringify(favoriteRecipes))
  }, [favoriteRecipes])

  useEffect(() => {
    localStorage.setItem('cookingHistory', JSON.stringify(cookingHistory))
  }, [cookingHistory])

  useEffect(() => {
    const urgentFoods = foods.filter(f => getRemainingDays(f.expiryDate) === 0)
    if (urgentFoods.length > 0 && flashCount < 5) {
      const timer = setTimeout(() => setFlashCount(flashCount + 1), 500)
      return () => clearTimeout(timer)
    }
  }, [foods, flashCount])

  const getRemainingDays = (expiryDate) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiry = new Date(expiryDate)
    expiry.setHours(0, 0, 0, 0)
    const diffTime = expiry - today
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getColorStatus = (remainingDays) => {
    if (remainingDays >= 7) return { color: '#2D7A4A', bgColor: '#EAF6EF', borderColor: '#7CB89D', label: null }
    if (remainingDays >= 4) return { color: '#7CB89D', bgColor: '#F5FAF7', borderColor: '#7CB89D', label: null }
    if (remainingDays >= 2) return { color: '#E6833B', bgColor: '#FFF4E6', borderColor: '#E6833B', label: '⚠️ 尽快吃' }
    if (remainingDays === 1) return { color: '#E6833B', bgColor: '#FFE8D6', borderColor: '#E6833B', label: '⏰ 明天到期' }
    if (remainingDays === 0) return { color: '#C73D3D', bgColor: '#FCE9E9', borderColor: '#C73D3D', label: '🔥 今天吃', flash: true }
    return { color: '#999', bgColor: '#f5f5f5', borderColor: '#999', label: '❌ 已过期', expired: true }
  }

  const parseInput = (text) => {
    const items = []
    const parts = text.split(/[，,、\s]+/).filter(p => p.trim())

    parts.forEach(part => {
      // 匹配：食材名 + 数字 + 单位
      const match = part.match(/^(.+?)(\d+(?:\.\d+)?)\s*(ml|毫升|l|升|g|克|kg|千克|公斤|个|颗|片|块|杯|碗|瓶|盒|包|份)?$/i)

      let name, quantity, grams

      if (match) {
        name = match[1].trim()
        quantity = match[2] + (match[3] || '份')
        grams = parseToGrams(quantity, name)
      } else {
        // 只匹配食材名
        const nameMatch = part.match(/^([^0-9]+)$/)
        if (nameMatch) {
          name = nameMatch[1].trim()
          quantity = '1 份'
          grams = 150
        } else {
          return
        }
      }

      if (name) {
        // 将别名转换为标准食材名
        const standardName = getStandardIngredient(name)
        const healthData = FOOD_HEALTH_DB[standardName] || { systems: [], grandSlam: false, expiry: 7 }
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + healthData.expiry)

        items.push({
          id: Date.now() + Math.random(),
          name: standardName, // 使用标准名
          quantity,
          grams,
          expiryDate: expiryDate.toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          healthData
        })
      }
    })

    return items
  }

  const addFoods = () => {
    if (!inputText.trim()) return
    const newFoods = parseInput(inputText)
    setFoods([...newFoods, ...foods])
    setInputText('')
  }

  const deleteFood = (id) => {
    setFoods(foods.filter(f => f.id !== id))
  }

  const updateFood = (id, updates) => {
    setFoods(foods.map(f => {
      if (f.id === id) {
        const updated = { ...f, ...updates }
        if (updates.quantity) {
          updated.grams = parseToGrams(updates.quantity, f.name)
        }
        return updated
      }
      return f
    }))
  }

  const calculateDailyProgress = () => {
    const coveredSystems = new Set()
    const grandSlamCount = foods.filter(f => f.healthData?.grandSlam).length

    foods.forEach(food => {
      if (food.healthData?.systems) {
        food.healthData.systems.forEach(sys => coveredSystems.add(sys))
      }
    })

    return {
      totalFoods: foods.length,
      grandSlamCount,
      coveredSystems: coveredSystems.size,
      totalSystems: 5,
      progress: (coveredSystems.size / 5) * 100
    }
  }

  const findAllPossibleRecipes = () => {
    const available = []

    // 获取今天已经做过的菜谱
    const cookedRecipeNames = new Set(meals.map(m => m.recipe))

    RECIPES.forEach(recipe => {
      // 检查是否有足够的食材（考虑别名）
      // 最低要求：20g（对于大蒜等调味料，20g 已经足够）
      const canMake = recipe.ingredients.every(requiredIng => {
        // 查找冰箱中是否有这个食材（或其别名）
        return foods.some(f => {
          // 直接匹配
          if (f.name === requiredIng) return f.grams >= 20

          // 检查别名匹配
          const aliases = INGREDIENT_ALIASES[requiredIng]
          if (aliases && aliases.includes(f.name)) return f.grams >= 20

          return false
        })
      })

      if (canMake) {
        let priority = 'normal'
        let expiringCount = 0 // 统计临期食材数量
        let grandSlamCount = 0 // 统计大满贯食材数量

        recipe.ingredients.forEach(ing => {
          const foodItem = foods.find(f => {
            if (f.name === ing) return true
            const aliases = INGREDIENT_ALIASES[ing]
            return aliases && aliases.includes(f.name)
          })
          if (foodItem) {
            const days = getRemainingDays(foodItem.expiryDate)
            if (days <= 0) {
              priority = 'urgent'
              expiringCount++
            } else if (days <= 1 && priority !== 'urgent') {
              priority = 'soon'
              expiringCount++
            } else if (days <= 3) {
              expiringCount++
            }

            // 统计大满贯食材
            if (foodItem.healthData?.grandSlam) {
              grandSlamCount++
            }
          }
        })

        const hasGrandSlam = grandSlamCount > 0

        // 计算推荐分数（越高越优先）
        let score = 0
        // 临期食材越多，分数越高
        score += expiringCount * 100
        // 大满贯食材越多，分数越高
        score += grandSlamCount * 50
        // 紧急程度加分
        if (priority === 'urgent') score += 200
        else if (priority === 'soon') score += 100

        // 标记是否今天已经做过
        const alreadyCooked = cookedRecipeNames.has(recipe.name)

        available.push({ ...recipe, priority, hasGrandSlam, alreadyCooked, score, expiringCount, grandSlamCount })
      }
    })

    // 排序逻辑：
    // 1. 优先显示没做过的菜
    // 2. 在同组内，按推荐分数排序（考虑临期食材、大满贯等）
    available.sort((a, b) => {
      // 先按是否做过排序（false 在前，true 在后）
      if (a.alreadyCooked !== b.alreadyCooked) {
        return a.alreadyCooked ? 1 : -1
      }

      // 同组内按推荐分数排序（分数高的在前）
      return b.score - a.score
    })

    return available
  }

  const openRecipePanel = () => {
    if (foods.length === 0) {
      setMatchedRecipes({ empty: true })
      return
    }
    const recipes = findAllPossibleRecipes()
    setMatchedRecipes({ recipes })
  }

  // 计算菜谱的营养成分（支持自定义用量）
  const calculateRecipeNutrition = (recipe, customQuantities = {}) => {
    let totalCalories = 0
    let totalProtein = 0
    let totalFat = 0
    let totalCarbs = 0
    let totalFiber = 0

    recipe.ingredients.forEach(ing => {
      const nutrition = NUTRITION_DB[ing]
      if (nutrition) {
        // 使用自定义用量或默认 100g
        const grams = parseInt(customQuantities[ing]) || 100
        const ratio = grams / 100 // 营养数据是基于 100g 的
        totalCalories += nutrition.calories * ratio
        totalProtein += nutrition.protein * ratio
        totalFat += nutrition.fat * ratio
        totalCarbs += nutrition.carbs * ratio
        totalFiber += nutrition.fiber * ratio
      }
    })

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fiber: Math.round(totalFiber * 10) / 10
    }
  }

  // 点击"做这道菜"时，先选择餐次
  const cookRecipe = (recipe) => {
    setShowMealSelector(recipe)
  }

  // 确认餐次后，显示食材用量设置
  const confirmMealType = (mealType) => {
    const recipe = showMealSelector
    // 初始化默认用量（从冰箱中查找当前食材的用量）
    const initialQuantities = {}
    recipe.ingredients.forEach(ing => {
      const foodItem = foods.find(f => {
        if (f.name === ing) return true
        const aliases = INGREDIENT_ALIASES[ing]
        return aliases && aliases.includes(f.name)
      })
      // 默认使用 100g 或冰箱中现有的量（取较小值）
      initialQuantities[ing] = foodItem ? Math.min(foodItem.grams, 100) : 100
    })
    setIngredientQuantities(initialQuantities)
    // 创建包含 selectedMealType 的新菜谱对象
    const recipeWithMealType = { ...recipe, selectedMealType: mealType }
    setShowIngredientQuantity(recipeWithMealType)
    setShowMealSelector(null) // 关闭餐次选择
  }

  // 确认用量后，真正做菜
  const confirmCook = () => {
    const recipe = showIngredientQuantity
    const mealType = recipe.selectedMealType
    const newFoods = [...foods]

    // 消耗食材（考虑别名和自定义用量）
    recipe.ingredients.forEach(requiredIng => {
      const gramsToUse = parseInt(ingredientQuantities[requiredIng]) || 100
      const idx = newFoods.findIndex(f => {
        if (f.name === requiredIng) return true
        const aliases = INGREDIENT_ALIASES[requiredIng]
        return aliases && aliases.includes(f.name)
      })
      if (idx !== -1) {
        if (newFoods[idx].grams <= gramsToUse) {
          newFoods.splice(idx, 1)
        } else {
          newFoods[idx] = {
            ...newFoods[idx],
            grams: newFoods[idx].grams - gramsToUse,
            quantity: formatQuantity(newFoods[idx].grams - gramsToUse)
          }
        }
      }
    })

    setFoods(newFoods)

    // 记录这顿饭（使用自定义用量计算营养）
    const nutrition = calculateRecipeNutrition(recipe, ingredientQuantities)
    const newMeal = {
      id: Date.now(),
      type: mealType,
      recipe: recipe.name,
      emoji: recipe.emoji,
      ingredients: recipe.ingredients,
      ingredientQuantities: { ...ingredientQuantities }, // 记录实际用量
      nutrition,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      health: recipe.health
    }
    // 使用函数式更新，确保获取最新的 meals 状态
    setMeals(prevMeals => [...prevMeals, newMeal])

    // 添加到烹饪历史
    addToCookingHistory(recipe.name)

    // 更新菜谱列表
    const updatedRecipes = findAllPossibleRecipes()
    setMatchedRecipes({ recipes: updatedRecipes, justCooked: recipe.name })
    setShowIngredientQuantity(null)
    setIngredientQuantities({})

    setTimeout(() => {
      setMatchedRecipes(prev => prev ? { ...prev, justCooked: null } : null)
    }, 2000)
  }

  // 计算今日总营养摄入
  const calculateDailyNutrition = () => {
    let totalCalories = 0
    let totalProtein = 0
    let totalFat = 0
    let totalCarbs = 0
    let totalFiber = 0
    let grandSlamFoods = new Set()
    let coveredSystems = new Set()
    let allIngredients = []

    meals.forEach(meal => {
      totalCalories += meal.nutrition.calories
      totalProtein += meal.nutrition.protein
      totalFat += meal.nutrition.fat
      totalCarbs += meal.nutrition.carbs
      totalFiber += meal.nutrition.fiber

      // 收集所有食材
      meal.ingredients.forEach(ing => {
        allIngredients.push(ing)
        const healthData = FOOD_HEALTH_DB[ing]
        if (healthData) {
          if (healthData.grandSlam) {
            grandSlamFoods.add(ing)
          }
          healthData.systems.forEach(sys => coveredSystems.add(sys))
        }
      })
    })

    // 检测饮食模式
    const detectedDiets = detectDietPatterns(allIngredients)

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fiber: Math.round(totalFiber * 10) / 10,
      grandSlamFoods: Array.from(grandSlamFoods),
      coveredSystems: Array.from(coveredSystems),
      mealCount: meals.length,
      detectedDiets,
      allIngredients
    }
  }

  // 检测饮食模式
  const detectDietPatterns = (ingredients) => {
    const detected = []

    // 地中海饮食检测
    const mediterraneanFoods = DIET_PATTERNS.mediterranean.keyFoods
    const mediterraneanCount = ingredients.filter(ing => mediterraneanFoods.includes(ing)).length
    if (mediterraneanCount >= 3) {
      detected.push({
        pattern: 'mediterranean',
        match: mediterraneanCount,
        percentage: Math.round((mediterraneanCount / ingredients.length) * 100)
      })
    }

    // 高蛋白饮食检测
    const highProteinFoods = DIET_PATTERNS.highProtein.keyFoods
    const highProteinCount = ingredients.filter(ing => highProteinFoods.includes(ing)).length
    const totalProtein = calculateTotalProtein(ingredients)
    if (totalProtein >= 50 || highProteinCount >= 3) {
      detected.push({
        pattern: 'highProtein',
        match: highProteinCount,
        percentage: Math.round((highProteinCount / ingredients.length) * 100)
      })
    }

    // 低碳水饮食检测
    const totalCarbs = calculateTotalCarbs(ingredients)
    if (totalCarbs < 100 && ingredients.length > 0) {
      detected.push({
        pattern: 'lowCarb',
        match: totalCarbs,
        percentage: Math.round((1 - totalCarbs / 200) * 100)
      })
    }

    // 素食检测
    const meatFoods = ['猪肉', '牛肉', '鸡肉', '鱼', '虾']
    const hasMeat = ingredients.some(ing => meatFoods.includes(ing))
    if (!hasMeat && ingredients.length > 0) {
      detected.push({
        pattern: 'vegetarian',
        match: ingredients.length,
        percentage: 100
      })
    }

    // 生酮饮食检测 (极低碳水 <50g，高脂肪)
    const totalFat = calculateTotalFat(ingredients)
    if (totalCarbs < 50 && totalFat > 100 && ingredients.length > 0) {
      const ketoFoods = DIET_PATTERNS.keto.keyFoods
      const ketoCount = ingredients.filter(ing => ketoFoods.includes(ing)).length
      detected.push({
        pattern: 'keto',
        match: ketoCount,
        percentage: Math.round((ketoCount / ingredients.length) * 100)
      })
    }

    // DASH 饮食检测 (低盐高钾，蔬菜水果全谷物)
    const dashFoods = DIET_PATTERNS.dash.keyFoods
    const dashCount = ingredients.filter(ing => dashFoods.some(dash => ing.includes(dash) || dash.includes(ing))).length
    if (dashCount >= 4 && !hasMeat) {
      detected.push({
        pattern: 'dash',
        match: dashCount,
        percentage: Math.round((dashCount / ingredients.length) * 100)
      })
    }

    // 原始人饮食检测 (无谷物、无乳制品、无加工食品)
    const paleoFoods = DIET_PATTERNS.paleo.keyFoods
    const paleoCount = ingredients.filter(ing => paleoFoods.some(paleo => ing.includes(paleo) || paleo.includes(ing))).length
    const hasGrains = ingredients.some(ing => ['米', '面', '面包', '麦', '燕麦'].some(g => ing.includes(g)))
    const hasDairy = ingredients.some(ing => ['牛奶', '奶酪', '酸奶', '奶'].some(d => ing.includes(d)))
    if (paleoCount >= 3 && !hasGrains && !hasDairy && ingredients.length > 0) {
      detected.push({
        pattern: 'paleo',
        match: paleoCount,
        percentage: Math.round((paleoCount / ingredients.length) * 100)
      })
    }

    // 纯素饮食检测 (完全无动物产品)
    const animalProducts = ['猪肉', '牛肉', '鸡肉', '鱼', '虾', '鸡蛋', '牛奶', '奶酪', '蜂蜜']
    const hasAnimalProducts = ingredients.some(ing => animalProducts.some(a => ing.includes(a)))
    if (!hasAnimalProducts && ingredients.length > 0) {
      detected.push({
        pattern: 'vegan',
        match: ingredients.length,
        percentage: 100
      })
    }

    // 弹性素食检测 ( mostly plant-based, occasional meat)
    const plantFoods = ingredients.filter(ing => !meatFoods.includes(ing)).length
    const plantPercentage = (plantFoods / ingredients.length) * 100
    if (plantPercentage >= 70 && hasMeat && ingredients.length >= 3) {
      detected.push({
        pattern: 'flexitarian',
        match: plantFoods,
        percentage: Math.round(plantPercentage)
      })
    }

    // 抗炎饮食检测 (富含抗氧化剂)
    const antiInflammatoryFoods = DIET_PATTERNS.antiInflammatory.keyFoods
    const antiInflammatoryCount = ingredients.filter(ing =>
      antiInflammatoryFoods.some(aif => ing.includes(aif) || aif.includes(ing))
    ).length
    if (antiInflammatoryCount >= 3 && ingredients.length > 0) {
      detected.push({
        pattern: 'antiInflammatory',
        match: antiInflammatoryCount,
        percentage: Math.round((antiInflammatoryCount / ingredients.length) * 100)
      })
    }

    // 间歇性断食检测 (这个比较难从食材判断，暂时基于餐次数量)
    // 如果一天只有1-2餐，可能是间歇性断食
    const mealCount = new Set(meals.map(m => m.type)).size
    if (mealCount <= 2 && meals.length > 0) {
      detected.push({
        pattern: 'intermittentFasting',
        match: mealCount,
        percentage: 80
      })
    }

    return detected
  }

  // 计算总蛋白质
  const calculateTotalProtein = (ingredients) => {
    return ingredients.reduce((total, ing) => {
      const nutrition = NUTRITION_DB[ing]
      return total + (nutrition?.protein || 0)
    }, 0)
  }

  // 计算总碳水
  const calculateTotalCarbs = (ingredients) => {
    return ingredients.reduce((total, ing) => {
      const nutrition = NUTRITION_DB[ing]
      return total + (nutrition?.carbs || 0)
    }, 0)
  }

  // 计算总脂肪
  const calculateTotalFat = (ingredients) => {
    return ingredients.reduce((total, ing) => {
      const nutrition = NUTRITION_DB[ing]
      return total + (nutrition?.fat || 0)
    }, 0)
  }

  // 切换收藏状态
  const toggleFavorite = (recipeName) => {
    setFavoriteRecipes(prev => {
      if (prev.includes(recipeName)) {
        return prev.filter(name => name !== recipeName)
      } else {
        return [...prev, recipeName]
      }
    })
  }

  // 检查是否已收藏
  const isFavorite = (recipeName) => {
    return favoriteRecipes.includes(recipeName)
  }

  // 添加到烹饪历史
  const addToCookingHistory = (recipeName) => {
    const today = new Date().toISOString().split('T')[0]
    setCookingHistory(prev => {
      const existing = prev.find(item => item.date === today && item.recipe === recipeName)
      if (existing) {
        return prev.map(item =>
          item.date === today && item.recipe === recipeName
            ? { ...item, count: item.count + 1 }
            : item
        )
      } else {
        return [...prev, { date: today, recipe: recipeName, count: 1 }]
      }
    })
  }

  // 生成购物清单
  const generateShoppingList = () => {
    const idealGoals = calculateIdealNutritionGoals()
    const todayNutrition = calculateDailyNutrition()
    const shoppingList = []

    // 检查蛋白质是否充足
    if (todayNutrition.protein < idealGoals.protein * 0.8) {
      const proteinFoods = ['鸡胸肉', '牛肉', '鱼', '鸡蛋', '豆腐', '牛奶']
      proteinFoods.forEach(food => {
        if (!foods.some(f => f.name === food)) {
          shoppingList.push({ name: food, reason: '补充蛋白质', priority: '高' })
        }
      })
    }

    // 检查膳食纤维是否充足
    if (todayNutrition.fiber < idealGoals.fiber * 0.8) {
      const fiberFoods = ['燕麦', '全麦面包', '红薯', '豆类', '西兰花']
      fiberFoods.forEach(food => {
        if (!foods.some(f => f.name === food)) {
          shoppingList.push({ name: food, reason: '补充膳食纤维', priority: '高' })
        }
      })
    }

    // 检查大满贯食物
    const grandSlamFoods = Object.entries(FOOD_HEALTH_DB)
      .filter(([_, data]) => data.grandSlam)
      .map(([name, _]) => name)
      .slice(0, 5)

    grandSlamFoods.forEach(food => {
      if (!foods.some(f => f.name === food)) {
        shoppingList.push({ name: food, reason: '大满贯食物', priority: '中' })
      }
    })

    // 检查季节性食材
    const seasonal = getSeasonalRecommendations()
    seasonal.foods.forEach(food => {
      if (!foods.some(f => f.name === food)) {
        shoppingList.push({ name: food, reason: '时令食材', priority: '低' })
      }
    })

    // 按优先级排序
    const priorityOrder = { '高': 0, '中': 1, '低': 2 }
    return shoppingList.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  }

  // 获取营养缺乏警告
  const getNutrientDeficiencies = () => {
    const nutrition = calculateDailyNutrition()
    const idealGoals = calculateIdealNutritionGoals()
    const deficiencies = []

    if (nutrition.protein < idealGoals.protein * 0.7) {
      deficiencies.push({ nutrient: '蛋白质', current: nutrition.protein, target: idealGoals.protein, severity: '严重' })
    } else if (nutrition.protein < idealGoals.protein * 0.9) {
      deficiencies.push({ nutrient: '蛋白质', current: nutrition.protein, target: idealGoals.protein, severity: '轻微' })
    }

    if (nutrition.fiber < idealGoals.fiber * 0.7) {
      deficiencies.push({ nutrient: '膳食纤维', current: nutrition.fiber, target: idealGoals.fiber, severity: '严重' })
    } else if (nutrition.fiber < idealGoals.fiber * 0.9) {
      deficiencies.push({ nutrient: '膳食纤维', current: nutrition.fiber, target: idealGoals.fiber, severity: '轻微' })
    }

    return deficiencies
  }

  // 计算健康评分
  const calculateHealthScore = () => {
    const nutrition = calculateDailyNutrition()
    let score = 0
    let maxScore = 100

    // 营养均衡评分 (30分)
    const proteinRatio = nutrition.protein / Math.max(nutrition.calories / 4, 1)
    const fatRatio = nutrition.fat / Math.max(nutrition.calories / 9, 1)
    const carbRatio = nutrition.carbs / Math.max(nutrition.calories / 4, 1)

    if (proteinRatio >= 0.2 && proteinRatio <= 0.35) score += 10
    if (fatRatio >= 0.2 && fatRatio <= 0.35) score += 10
    if (carbRatio >= 0.4 && carbRatio <= 0.6) score += 10

    // 大满贯食物评分 (20分)
    const grandSlamScore = Math.min(nutrition.grandSlamFoods.length * 5, 20)
    score += grandSlamScore

    // 防御系统覆盖评分 (20分)
    const systemScore = Math.min(nutrition.coveredSystems.length * 4, 20)
    score += systemScore

    // 餐次规律评分 (15分)
    if (nutrition.mealCount >= 3) score += 15
    else if (nutrition.mealCount >= 2) score += 10
    else if (nutrition.mealCount >= 1) score += 5

    // 膳食纤维评分 (15分)
    if (nutrition.fiber >= 25) score += 15
    else if (nutrition.fiber >= 15) score += 10
    else if (nutrition.fiber >= 10) score += 5

    return {
      score: Math.round(score),
      maxScore,
      percentage: Math.round((score / maxScore) * 100),
      breakdown: {
        nutrition: { score: Math.round((proteinRatio >= 0.2 && proteinRatio <= 0.35 ? 10 : 0) + (fatRatio >= 0.2 && fatRatio <= 0.35 ? 10 : 0) + (carbRatio >= 0.4 && carbRatio <= 0.6 ? 10 : 0)), max: 30 },
        grandSlam: { score: grandSlamScore, max: 20 },
        systems: { score: systemScore, max: 20 },
        meals: { score: nutrition.mealCount >= 3 ? 15 : nutrition.mealCount >= 2 ? 10 : nutrition.mealCount >= 1 ? 5 : 0, max: 15 },
        fiber: { score: nutrition.fiber >= 25 ? 15 : nutrition.fiber >= 15 ? 10 : nutrition.fiber >= 10 ? 5 : 0, max: 15 }
      }
    }
  }

  // 获取食物浪费统计
  const getWasteStats = () => {
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const expiredFoods = foods.filter(f => {
      const expiry = new Date(f.expiryDate)
      return expiry < today
    })

    const expiringSoonFoods = foods.filter(f => {
      const expiry = new Date(f.expiryDate)
      const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
      return daysUntilExpiry >= 0 && daysUntilExpiry <= 3
    })

    return {
      expired: expiredFoods,
      expiringSoon: expiringSoonFoods,
      totalExpired: expiredFoods.length,
      totalExpiringSoon: expiringSoonFoods.length
    }
  }

  // 获取每周趋势数据
  const getWeeklyTrend = () => {
    const today = new Date()
    const last7Days = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const dayData = mealHistory.find(m => m.date === dateStr)
      last7Days.push({
        date: dateStr,
        dayName: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
        calories: dayData?.nutrition?.calories || 0,
        protein: dayData?.nutrition?.protein || 0,
        mealCount: dayData?.mealCount || 0,
        healthScore: dayData ? calculateHealthScoreForDay(dayData.nutrition) : 0
      })
    }

    return last7Days
  }

  // 计算某天的健康评分（用于历史数据）
  const calculateHealthScoreForDay = (nutrition) => {
    let score = 0

    // 营养均衡评分 (30分)
    const proteinRatio = nutrition.protein / Math.max(nutrition.calories / 4, 1)
    const fatRatio = nutrition.fat / Math.max(nutrition.calories / 9, 1)
    const carbRatio = nutrition.carbs / Math.max(nutrition.calories / 4, 1)

    if (proteinRatio >= 0.2 && proteinRatio <= 0.35) score += 10
    if (fatRatio >= 0.2 && fatRatio <= 0.35) score += 10
    if (carbRatio >= 0.4 && carbRatio <= 0.6) score += 10

    // 大满贯食物评分 (20分)
    score += Math.min(nutrition.grandSlamFoods.length * 5, 20)

    // 防御系统评分 (20分)
    score += Math.min(nutrition.coveredSystems.length * 4, 20)

    // 餐次规律评分 (15分)
    if (nutrition.mealCount >= 3) score += 15
    else if (nutrition.mealCount >= 2) score += 10
    else if (nutrition.mealCount >= 1) score += 5

    // 膳食纤维评分 (15分)
    if (nutrition.fiber >= 25) score += 15
    else if (nutrition.fiber >= 15) score += 10
    else if (nutrition.fiber >= 10) score += 5

    return score
  }

  // 根据健康目标推荐食材
  const getHealthGoalRecommendations = () => {
    const recommendations = {
      muscle_gain: {
        name: '增肌',
        emoji: '💪',
        focus: '高蛋白',
        foods: ['鸡胸肉', '牛肉', '鱼', '鸡蛋', '豆腐', '牛奶', '酸奶'],
        targetCalories: 2500,
        targetProtein: 120
      },
      fat_loss: {
        name: '减脂',
        emoji: '🔥',
        focus: '低碳水高蛋白',
        foods: ['鸡胸肉', '鱼', '绿叶蔬菜', '牛油果', '坚果', '鸡蛋'],
        targetCalories: 1500,
        targetProtein: 100
      },
      maintain: {
        name: '保持',
        emoji: '⚖️',
        focus: '均衡饮食',
        foods: ['各类蔬菜', '优质蛋白', '全谷物', '健康脂肪'],
        targetCalories: 2000,
        targetProtein: 60
      },
      health: {
        name: '健康养生',
        emoji: '🌿',
        focus: '大满贯食物',
        foods: ['蓝莓', '三文鱼', '菠菜', '西兰花', '大蒜', '绿茶', '黑巧克力'],
        targetCalories: 2000,
        targetProtein: 60
      }
    }

    return recommendations[healthGoal] || recommendations.maintain
  }

  // 获取季节性食材推荐
  const getSeasonalRecommendations = () => {
    const month = new Date().getMonth() + 1

    const seasonalFoods = {
      spring: {
        months: [3, 4, 5],
        name: '春季',
        emoji: '🌸',
        foods: ['菠菜', '韭菜', '春笋', '草莓', '樱桃'],
        benefits: '养肝护脾，增强免疫力'
      },
      summer: {
        months: [6, 7, 8],
        name: '夏季',
        emoji: '☀️',
        foods: ['西瓜', '黄瓜', '番茄', '苦瓜', '绿豆'],
        benefits: '清热解暑，补充水分'
      },
      autumn: {
        months: [9, 10, 11],
        name: '秋季',
        emoji: '🍂',
        foods: ['梨', '苹果', '南瓜', '山药', '莲藕'],
        benefits: '润肺生津，滋阴润燥'
      },
      winter: {
        months: [12, 1, 2],
        name: '冬季',
        emoji: '❄️',
        foods: ['羊肉', '牛肉', '萝卜', '白菜', '生姜'],
        benefits: '温补身体，增强抗寒能力'
      }
    }

    const season = Object.values(seasonalFoods).find(s => s.months.includes(month))
    return season || seasonalFoods.spring
  }

  // 获取营养目标完成度
  const getNutritionGoalProgress = () => {
    const todayNutrition = calculateDailyNutrition()

    return {
      calories: {
        current: todayNutrition.calories,
        target: nutritionGoals.calories,
        percentage: Math.round((todayNutrition.calories / nutritionGoals.calories) * 100)
      },
      protein: {
        current: todayNutrition.protein,
        target: nutritionGoals.protein,
        percentage: Math.round((todayNutrition.protein / nutritionGoals.protein) * 100)
      },
      fat: {
        current: todayNutrition.fat,
        target: nutritionGoals.fat,
        percentage: Math.round((todayNutrition.fat / nutritionGoals.fat) * 100)
      },
      carbs: {
        current: todayNutrition.carbs,
        target: nutritionGoals.carbs,
        percentage: Math.round((todayNutrition.carbs / nutritionGoals.carbs) * 100)
      },
      fiber: {
        current: todayNutrition.fiber,
        target: nutritionGoals.fiber,
        percentage: Math.round((todayNutrition.fiber / nutritionGoals.fiber) * 100)
      }
    }
  }

  // 计算 BMI
  const calculateBMI = () => {
    const heightInMeters = healthProfile.height / 100
    const bmi = healthProfile.weight / (heightInMeters * heightInMeters)
    return Math.round(bmi * 10) / 10
  }

  // 获取 BMI 分类
  const getBMICategory = () => {
    const bmi = calculateBMI()
    if (bmi < 18.5) return { category: '偏瘦', color: '#3498DB', emoji: '💙' }
    if (bmi < 24) return { category: '正常', color: '#2D7A4A', emoji: '💚' }
    if (bmi < 28) return { category: '偏胖', color: '#E6833B', emoji: '💛' }
    return { category: '肥胖', color: '#C73D3D', emoji: '❤️' }
  }

  // 计算 BMR（基础代谢率）- Mifflin-St Jeor 公式
  const calculateBMR = () => {
    const { weight, height, age, gender } = healthProfile
    if (gender === 'male') {
      return Math.round(10 * weight + 6.25 * height - 5 * age + 5)
    } else {
      return Math.round(10 * weight + 6.25 * height - 5 * age - 161)
    }
  }

  // 计算 TDEE（每日总能量消耗）
  const calculateTDEE = () => {
    const bmr = calculateBMR()
    const activityMultipliers = {
      sedentary: 1.2, // 久坐
      light: 1.375, // 轻度活动
      moderate: 1.55, // 中度活动
      active: 1.725, // 高度活动
      veryActive: 1.9 // 非常活跃
    }
    return Math.round(bmr * (activityMultipliers[healthProfile.activityLevel] || 1.55))
  }

  // 根据个人信息计算理想营养目标
  const calculateIdealNutritionGoals = () => {
    const tdee = calculateTDEE()
    const bmi = calculateBMI()
    const bmiCategory = getBMICategory()

    let calories, proteinRatio, fatRatio

    // 根据 BMI 和健康目标调整
    if (healthGoal === 'fat_loss' || bmiCategory.category === '偏胖' || bmiCategory.category === '肥胖') {
      calories = Math.round(tdee * 0.8) // 减少 20%
      proteinRatio = 0.3
      fatRatio = 0.25
    } else if (healthGoal === 'muscle_gain' || bmiCategory.category === '偏瘦') {
      calories = Math.round(tdee * 1.15) // 增加 15%
      proteinRatio = 0.3
      fatRatio = 0.25
    } else {
      calories = tdee
      proteinRatio = 0.25
      fatRatio = 0.3
    }

    return {
      calories,
      protein: Math.round((calories * proteinRatio) / 4), // 1g蛋白质 = 4千卡
      fat: Math.round((calories * fatRatio) / 9), // 1g脂肪 = 9千卡
      carbs: Math.round((calories * (1 - proteinRatio - fatRatio)) / 4), // 1g碳水 = 4千卡
      fiber: healthProfile.gender === 'male' ? 38 : 25 // 根据性别推荐纤维
    }
  }

  // 根据个人信息调整健康评分
  const calculatePersonalizedHealthScore = () => {
    const nutrition = calculateDailyNutrition()
    const idealGoals = calculateIdealNutritionGoals()
    const bmi = calculateBMI()
    const bmiCategory = getBMICategory()

    let score = 0
    const maxScore = 100

    // 1. 热量达标评分 (20分)
    const caloriePercentage = (nutrition.calories / idealGoals.calories) * 100
    if (caloriePercentage >= 90 && caloriePercentage <= 110) score += 20
    else if (caloriePercentage >= 80 && caloriePercentage <= 120) score += 15
    else if (caloriePercentage >= 70 && caloriePercentage <= 130) score += 10

    // 2. 蛋白质达标评分 (15分)
    const proteinPercentage = (nutrition.protein / idealGoals.protein) * 100
    if (proteinPercentage >= 90) score += 15
    else if (proteinPercentage >= 70) score += 10
    else if (proteinPercentage >= 50) score += 5

    // 3. BMI 健康评分 (15分)
    if (bmiCategory.category === '正常') score += 15
    else if (bmiCategory.category === '偏瘦' || bmiCategory.category === '偏胖') score += 10
    else score += 5

    // 4. 大满贯食物评分 (15分)
    score += Math.min(nutrition.grandSlamFoods.length * 5, 15)

    // 5. 防御系统评分 (15分)
    score += Math.min(nutrition.coveredSystems.length * 3, 15)

    // 6. 餐次规律评分 (10分)
    if (nutrition.mealCount >= 3) score += 10
    else if (nutrition.mealCount >= 2) score += 7
    else if (nutrition.mealCount >= 1) score += 4

    // 7. 膳食纤维评分 (10分)
    const fiberPercentage = (nutrition.fiber / idealGoals.fiber) * 100
    if (fiberPercentage >= 90) score += 10
    else if (fiberPercentage >= 70) score += 7
    else if (fiberPercentage >= 50) score += 4

    return {
      score: Math.round(score),
      maxScore,
      percentage: Math.round((score / maxScore) * 100),
      breakdown: {
        calories: { score: caloriePercentage >= 90 && caloriePercentage <= 110 ? 20 : caloriePercentage >= 80 && caloriePercentage <= 120 ? 15 : caloriePercentage >= 70 && caloriePercentage <= 130 ? 10 : 0, max: 20 },
        protein: { score: proteinPercentage >= 90 ? 15 : proteinPercentage >= 70 ? 10 : proteinPercentage >= 50 ? 5 : 0, max: 15 },
        bmi: { score: bmiCategory.category === '正常' ? 15 : bmiCategory.category === '偏瘦' || bmiCategory.category === '偏胖' ? 10 : 5, max: 15 },
        grandSlam: { score: Math.min(nutrition.grandSlamFoods.length * 5, 15), max: 15 },
        systems: { score: Math.min(nutrition.coveredSystems.length * 3, 15), max: 15 },
        meals: { score: nutrition.mealCount >= 3 ? 10 : nutrition.mealCount >= 2 ? 7 : nutrition.mealCount >= 1 ? 4 : 0, max: 10 },
        fiber: { score: fiberPercentage >= 90 ? 10 : fiberPercentage >= 70 ? 7 : fiberPercentage >= 50 ? 4 : 0, max: 10 }
      },
      idealGoals,
      bmi,
      bmiCategory
    }
  }

  const closeRecipePanel = () => setMatchedRecipes(null)

  const sortedFoods = [...foods].sort((a, b) =>
    getRemainingDays(a.expiryDate) - getRemainingDays(b.expiryDate)
  )

  const progress = calculateDailyProgress()

  // 获取大满贯食物列表
  const grandSlamFoods = Object.entries(FOOD_HEALTH_DB)
    .filter(([_, data]) => data.grandSlam)
    .map(([name, data]) => ({ name, systems: data.systems }))

  return (
    <div className="app">
      <header className="header">
        <h1>🧊 冰箱遗书</h1>
        <p className="slogan">别让番茄死得不明不白</p>
      </header>

      {/* 5×5×5 进度面板 */}
      <div className="progress-section">
        <div className="progress-header" onClick={() => setShowDefensePanel(!showDefensePanel)}>
          <h3>🎯 今日 5×5×5 进度</h3>
          <div className="progress-header-right">
            <button
              className="explain-btn"
              onClick={(e) => {
                e.stopPropagation()
                setShow555Explanation(true)
              }}
              title="什么是 5×5×5？"
            >
              ?
            </button>
            <span className="toggle-icon">{showDefensePanel ? '▼' : '▶'}</span>
          </div>
        </div>

        <div className="progress-stats">
          <div className="stat-item">
            <span className="stat-value">{progress.totalFoods}</span>
            <span className="stat-label">食材总数</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{progress.grandSlamCount}</span>
            <span className="stat-label">大满贯食物</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{progress.coveredSystems}/5</span>
            <span className="stat-label">防御系统</span>
          </div>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress.progress}%` }} />
        </div>

        {showDefensePanel && (
          <div className="defense-systems-panel">
            {Object.entries(DEFENSE_SYSTEMS).map(([key, sys]) => {
              const isCovered = foods.some(f => f.healthData?.systems?.includes(key))
              return (
                <div key={key} className={`defense-item ${isCovered ? 'covered' : ''}`}>
                  <span className="defense-icon">{sys.icon}</span>
                  <span className="defense-name">{sys.name}</span>
                  {isCovered && <span className="check-mark">✓</span>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 数据分析面板 */}
      <div className="analytics-section">
        <div className="analytics-header" onClick={() => setShowAnalytics(!showAnalytics)}>
          <h3>🎭 食乜八卦阵</h3>
          <span className="toggle-icon">{showAnalytics ? '▼' : '▶'}</span>
        </div>

        {showAnalytics && (
          <div className="analytics-content">
            {/* 个人健康档案 */}
            <div className="health-profile-card">
              <h4>👤 个人健康档案</h4>
              {healthProfile.showProfileSetup ? (
                <div className="profile-setup">
                  <div className="profile-inputs">
                    <div className="profile-input-group">
                      <label>身高 (cm)</label>
                      <input
                        type="number"
                        value={healthProfile.height}
                        onChange={(e) => setHealthProfile({ ...healthProfile, height: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="profile-input-group">
                      <label>体重 (kg)</label>
                      <input
                        type="number"
                        value={healthProfile.weight}
                        onChange={(e) => setHealthProfile({ ...healthProfile, weight: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="profile-input-group">
                      <label>年龄</label>
                      <input
                        type="number"
                        value={healthProfile.age}
                        onChange={(e) => setHealthProfile({ ...healthProfile, age: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="profile-input-group">
                      <label>性别</label>
                      <select
                        value={healthProfile.gender}
                        onChange={(e) => setHealthProfile({ ...healthProfile, gender: e.target.value })}
                      >
                        <option value="male">男</option>
                        <option value="female">女</option>
                      </select>
                    </div>
                    <div className="profile-input-group full-width">
                      <label>活动水平</label>
                      <select
                        value={healthProfile.activityLevel}
                        onChange={(e) => setHealthProfile({ ...healthProfile, activityLevel: e.target.value })}
                      >
                        <option value="sedentary">久坐（办公室工作）</option>
                        <option value="light">轻度活动（每周1-3次运动）</option>
                        <option value="moderate">中度活动（每周3-5次运动）</option>
                        <option value="active">高度活动（每周6-7次运动）</option>
                        <option value="veryActive">非常活跃（体力劳动/专业运动员）</option>
                      </select>
                    </div>
                  </div>
                  <button
                    className="save-profile-btn"
                    onClick={() => setHealthProfile({ ...healthProfile, showProfileSetup: false })}
                  >
                    保存档案
                  </button>
                </div>
              ) : (
                <div className="profile-summary">
                  <div className="profile-stats">
                    <div className="profile-stat">
                      <span className="stat-icon">📏</span>
                      <div className="stat-info">
                        <span className="stat-value">{healthProfile.height}cm</span>
                        <span className="stat-label">身高</span>
                      </div>
                    </div>
                    <div className="profile-stat">
                      <span className="stat-icon">⚖️</span>
                      <div className="stat-info">
                        <span className="stat-value">{healthProfile.weight}kg</span>
                        <span className="stat-label">体重</span>
                      </div>
                    </div>
                    <div className="profile-stat">
                      <span className="stat-icon">{getBMICategory().emoji}</span>
                      <div className="stat-info">
                        <span className="stat-value" style={{ color: getBMICategory().color }}>{calculateBMI()}</span>
                        <span className="stat-label">BMI {getBMICategory().category}</span>
                      </div>
                    </div>
                    <div className="profile-stat">
                      <span className="stat-icon">🔥</span>
                      <div className="stat-info">
                        <span className="stat-value">{calculateTDEE()}</span>
                        <span className="stat-label">每日消耗</span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="edit-profile-btn"
                    onClick={() => setHealthProfile({ ...healthProfile, showProfileSetup: true })}
                  >
                    编辑档案
                  </button>
                </div>
              )}
            </div>

            {/* 健康评分 */}
            {meals.length > 0 && (
              <div className="health-score-card">
                {(() => {
                  const healthScore = calculatePersonalizedHealthScore()
                  const scoreColor = healthScore.percentage >= 80 ? '#2D7A4A' : healthScore.percentage >= 60 ? '#E6833B' : '#C73D3D'
                  return (
                    <>
                      <h4>🏆 今日健康评分（个性化）</h4>
                      <div className="score-circle" style={{ borderColor: scoreColor }}>
                        <span className="score-value" style={{ color: scoreColor }}>{healthScore.score}</span>
                        <span className="score-max">/ {healthScore.maxScore}</span>
                      </div>
                      <div className="personalized-info">
                        <div className="info-item">
                          <span className="info-label">BMI</span>
                          <span className="info-value" style={{ color: healthScore.bmiCategory.color }}>
                            {healthScore.bmi} ({healthScore.bmiCategory.category})
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">理想热量</span>
                          <span className="info-value">{healthScore.idealGoals.calories} 千卡</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">理想蛋白质</span>
                          <span className="info-value">{healthScore.idealGoals.protein}g</span>
                        </div>
                      </div>
                      <div className="score-breakdown">
                        <div className="breakdown-item">
                          <span className="breakdown-label">热量达标</span>
                          <div className="breakdown-bar">
                            <div className="breakdown-fill" style={{ width: `${(healthScore.breakdown.calories.score / healthScore.breakdown.calories.max) * 100}%`, background: '#3498DB' }} />
                          </div>
                          <span className="breakdown-value">{healthScore.breakdown.calories.score}/{healthScore.breakdown.calories.max}</span>
                        </div>
                        <div className="breakdown-item">
                          <span className="breakdown-label">蛋白质达标</span>
                          <div className="breakdown-bar">
                            <div className="breakdown-fill" style={{ width: `${(healthScore.breakdown.protein.score / healthScore.breakdown.protein.max) * 100}%`, background: '#E74C3C' }} />
                          </div>
                          <span className="breakdown-value">{healthScore.breakdown.protein.score}/{healthScore.breakdown.protein.max}</span>
                        </div>
                        <div className="breakdown-item">
                          <span className="breakdown-label">BMI健康</span>
                          <div className="breakdown-bar">
                            <div className="breakdown-fill" style={{ width: `${(healthScore.breakdown.bmi.score / healthScore.breakdown.bmi.max) * 100}%`, background: healthScore.bmiCategory.color }} />
                          </div>
                          <span className="breakdown-value">{healthScore.breakdown.bmi.score}/{healthScore.breakdown.bmi.max}</span>
                        </div>
                        <div className="breakdown-item">
                          <span className="breakdown-label">大满贯食物</span>
                          <div className="breakdown-bar">
                            <div className="breakdown-fill" style={{ width: `${(healthScore.breakdown.grandSlam.score / healthScore.breakdown.grandSlam.max) * 100}%`, background: '#F39C12' }} />
                          </div>
                          <span className="breakdown-value">{healthScore.breakdown.grandSlam.score}/{healthScore.breakdown.grandSlam.max}</span>
                        </div>
                        <div className="breakdown-item">
                          <span className="breakdown-label">防御系统</span>
                          <div className="breakdown-bar">
                            <div className="breakdown-fill" style={{ width: `${(healthScore.breakdown.systems.score / healthScore.breakdown.systems.max) * 100}%`, background: '#9B59B6' }} />
                          </div>
                          <span className="breakdown-value">{healthScore.breakdown.systems.score}/{healthScore.breakdown.systems.max}</span>
                        </div>
                        <div className="breakdown-item">
                          <span className="breakdown-label">餐次规律</span>
                          <div className="breakdown-bar">
                            <div className="breakdown-fill" style={{ width: `${(healthScore.breakdown.meals.score / healthScore.breakdown.meals.max) * 100}%`, background: '#1ABC9C' }} />
                          </div>
                          <span className="breakdown-value">{healthScore.breakdown.meals.score}/{healthScore.breakdown.meals.max}</span>
                        </div>
                        <div className="breakdown-item">
                          <span className="breakdown-label">膳食纤维</span>
                          <div className="breakdown-bar">
                            <div className="breakdown-fill" style={{ width: `${(healthScore.breakdown.fiber.score / healthScore.breakdown.fiber.max) * 100}%`, background: '#2ECC71' }} />
                          </div>
                          <span className="breakdown-value">{healthScore.breakdown.fiber.score}/{healthScore.breakdown.fiber.max}</span>
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>
            )}

            {/* 营养缺乏预警 */}
            {meals.length > 0 && (() => {
              const deficiencies = getNutrientDeficiencies()
              if (deficiencies.length > 0) {
                return (
                  <div className="nutrient-deficiency-card">
                    <h4>⚠️ 营养缺乏预警</h4>
                    <div className="deficiency-list">
                      {deficiencies.map((def, idx) => (
                        <div key={idx} className={`deficiency-item ${def.severity === '严重' ? 'severe' : 'mild'}`}>
                          <span className="deficiency-icon">{def.severity === '严重' ? '🔴' : '🟡'}</span>
                          <div className="deficiency-info">
                            <span className="deficiency-name">{def.nutrient}</span>
                            <span className="deficiency-detail">
                              当前: {Math.round(def.current * 10) / 10}g / 目标: {def.target}g
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }
              return null
            })()}

            {/* 智能购物清单按钮 */}
            <div className="shopping-list-card">
              <h4>🛒 智能购物清单</h4>
              <p className="shopping-hint">根据您的营养目标和冰箱库存，生成个性化购物清单</p>
              <button
                className="shopping-btn"
                onClick={() => setShowShoppingList(true)}
              >
                生成购物清单
              </button>
            </div>

            {/* 饮食模式识别 */}
            {meals.length > 0 && (() => {
              const nutrition = calculateDailyNutrition()
              if (nutrition.detectedDiets.length > 0) {
                return (
                  <div className="diet-pattern-card">
                    <h4>🥗 今日饮食模式</h4>
                    <div className="diet-tags">
                      {nutrition.detectedDiets.map((diet, idx) => (
                        <div key={idx} className="diet-tag">
                          <span className="diet-emoji">{DIET_PATTERNS[diet.pattern].emoji}</span>
                          <div className="diet-info">
                            <span className="diet-name">{DIET_PATTERNS[diet.pattern].name}</span>
                            <span className="diet-description">{DIET_PATTERNS[diet.pattern].description}</span>
                            <span className="diet-match">匹配度: {diet.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {nutrition.detectedDiets.length > 0 && (
                      <p className="diet-benefits">
                        💡 好处: {nutrition.detectedDiets.map(d => DIET_PATTERNS[d.pattern].benefits.join('、')).join(' | ')}
                      </p>
                    )}
                  </div>
                )
              }
              return null
            })()}

            {/* 食物浪费追踪 */}
            {(() => {
              const wasteStats = getWasteStats()
              if (wasteStats.totalExpired > 0 || wasteStats.totalExpiringSoon > 0) {
                return (
                  <div className="waste-tracking-card">
                    <h4>⚠️ 食物浪费预警</h4>
                    {wasteStats.totalExpired > 0 && (
                      <div className="waste-item expired">
                        <span className="waste-icon">❌</span>
                        <div className="waste-info">
                          <span className="waste-count">{wasteStats.totalExpired} 种食材已过期</span>
                          <span className="waste-list">{wasteStats.expired.map(f => f.name).join('、')}</span>
                        </div>
                      </div>
                    )}
                    {wasteStats.totalExpiringSoon > 0 && (
                      <div className="waste-item expiring">
                        <span className="waste-icon">⏰</span>
                        <div className="waste-info">
                          <span className="waste-count">{wasteStats.totalExpiringSoon} 种食材即将过期（3天内）</span>
                          <span className="waste-list">{wasteStats.expiringSoon.map(f => f.name).join('、')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              }
              return null
            })()}

            {/* 每周趋势图 */}
            {mealHistory.length > 0 && (
              <div className="weekly-trend-card">
                <h4>📈 本周饮食趋势</h4>
                {(() => {
                  const weeklyTrend = getWeeklyTrend()
                  const maxCalories = Math.max(...weeklyTrend.map(d => d.calories), 1)

                  return (
                    <>
                      <div className="trend-chart">
                        {weeklyTrend.map((day, idx) => (
                          <div key={idx} className="trend-bar-container">
                            <div className="trend-bar-wrapper">
                              <div
                                className="trend-bar"
                                style={{
                                  height: `${(day.calories / maxCalories) * 100}%`,
                                  background: day.calories > 0 ? 'linear-gradient(180deg, #2D7A4A 0%, #7CB89D 100%)' : '#E8E8E8'
                                }}
                              >
                                {day.calories > 0 && (
                                  <span className="trend-value">{day.calories}</span>
                                )}
                              </div>
                            </div>
                            <span className="trend-label">周{day.dayName}</span>
                            {day.healthScore > 0 && (
                              <span className="trend-score" style={{ color: day.healthScore >= 80 ? '#2D7A4A' : day.healthScore >= 60 ? '#E6833B' : '#C73D3D' }}>
                                {day.healthScore}分
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="trend-summary">
                        <span>平均每日: {Math.round(weeklyTrend.reduce((sum, d) => sum + d.calories, 0) / 7)} 千卡</span>
                        <span>平均健康分: {Math.round(weeklyTrend.reduce((sum, d) => sum + d.healthScore, 0) / 7)}分</span>
                      </div>
                    </>
                  )
                })()}
              </div>
            )}

            {/* 健康目标推荐 */}
            <div className="health-goal-card">
              <h4>{getHealthGoalRecommendations().emoji} 健康目标: {getHealthGoalRecommendations().name}</h4>
              <p className="goal-focus">重点: {getHealthGoalRecommendations().focus}</p>
              <div className="goal-foods">
                <span className="goal-label">推荐食材:</span>
                <div className="goal-food-tags">
                  {getHealthGoalRecommendations().foods.map((food, idx) => (
                    <span key={idx} className="goal-food-tag">{food}</span>
                  ))}
                </div>
              </div>
              <div className="goal-targets">
                <div className="target-item">
                  <span className="target-label">目标热量</span>
                  <span className="target-value">{getHealthGoalRecommendations().targetCalories} 千卡</span>
                </div>
                <div className="target-item">
                  <span className="target-label">目标蛋白质</span>
                  <span className="target-value">{getHealthGoalRecommendations().targetProtein}g</span>
                </div>
              </div>
              <button
                className="change-goal-btn"
                onClick={() => {
                  const goals = ['maintain', 'muscle_gain', 'fat_loss', 'health']
                  const currentIndex = goals.indexOf(healthGoal)
                  const nextIndex = (currentIndex + 1) % goals.length
                  setHealthGoal(goals[nextIndex])
                }}
              >
                切换目标
              </button>
            </div>

            {/* 营养目标完成度 */}
            {meals.length > 0 && (
              <div className="nutrition-goal-card">
                <h4>🎯 今日营养目标完成度（个性化）</h4>
                {(() => {
                  const idealGoals = calculateIdealNutritionGoals()
                  const todayNutrition = calculateDailyNutrition()

                  const getProgress = (current, target) => ({
                    current: Math.round(current * 10) / 10,
                    target: Math.round(target),
                    percentage: Math.round((current / target) * 100)
                  })

                  const calories = getProgress(todayNutrition.calories, idealGoals.calories)
                  const protein = getProgress(todayNutrition.protein, idealGoals.protein)
                  const fiber = getProgress(todayNutrition.fiber, idealGoals.fiber)

                  return (
                    <div className="nutrition-progress-list">
                      <div className="nutrition-progress-item">
                        <div className="nutrition-progress-header">
                          <span className="nutrition-progress-label">热量</span>
                          <span className="nutrition-progress-value">
                            {calories.current} / {calories.target} 千卡
                          </span>
                        </div>
                        <div className="nutrition-progress-bar">
                          <div
                            className="nutrition-progress-fill"
                            style={{
                              width: `${Math.min(calories.percentage, 100)}%`,
                              background: calories.percentage >= 90 && calories.percentage <= 110 ? '#2D7A4A' : '#E6833B'
                            }}
                          />
                        </div>
                        <span className="nutrition-progress-percentage">{calories.percentage}%</span>
                      </div>

                      <div className="nutrition-progress-item">
                        <div className="nutrition-progress-header">
                          <span className="nutrition-progress-label">蛋白质</span>
                          <span className="nutrition-progress-value">
                            {protein.current} / {protein.target}g
                          </span>
                        </div>
                        <div className="nutrition-progress-bar">
                          <div
                            className="nutrition-progress-fill"
                            style={{
                              width: `${Math.min(protein.percentage, 100)}%`,
                              background: protein.percentage >= 90 ? '#2D7A4A' : '#E6833B'
                            }}
                          />
                        </div>
                        <span className="nutrition-progress-percentage">{protein.percentage}%</span>
                      </div>

                      <div className="nutrition-progress-item">
                        <div className="nutrition-progress-header">
                          <span className="nutrition-progress-label">膳食纤维</span>
                          <span className="nutrition-progress-value">
                            {fiber.current} / {fiber.target}g
                          </span>
                        </div>
                        <div className="nutrition-progress-bar">
                          <div
                            className="nutrition-progress-fill"
                            style={{
                              width: `${Math.min(fiber.percentage, 100)}%`,
                              background: fiber.percentage >= 90 ? '#2D7A4A' : '#E6833B'
                            }}
                          />
                        </div>
                        <span className="nutrition-progress-percentage">{fiber.percentage}%</span>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}

            {/* 季节性食材推荐 */}
            {(() => {
              const seasonal = getSeasonalRecommendations()

              return (
                <div className="seasonal-card">
                  <h4>{seasonal.emoji} {seasonal.name}时令食材</h4>
                  <p className="seasonal-benefits">💡 {seasonal.benefits}</p>
                  <div className="seasonal-foods">
                    {seasonal.foods.map((food, idx) => (
                      <div key={idx} className="seasonal-food-item">
                        <span className="seasonal-food-name">{food}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* 录入区域 */}
      <div className="input-section">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addFoods()}
          placeholder="例如：蓝莓 200g、鸡蛋 3 个、牛奶 500ml（支持单位✨）"
          className="input-field"
        />
        <button onClick={addFoods} className="add-btn">添加</button>
      </div>

      {/* 食材卡片列表 */}
      <div className="food-list">
        {sortedFoods.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>冰箱空空如也，去买点菜吧</p>
            <p className="empty-hint">试试添加：蓝莓 200g、蘑菇 150g、绿茶 1 杯</p>
          </div>
        ) : (
          sortedFoods.map(food => {
            const remainingDays = getRemainingDays(food.expiryDate)
            const status = getColorStatus(remainingDays)
            const isFlashing = status.flash && flashCount < 5 && flashCount % 2 === 0
            const isGrandSlam = food.healthData?.grandSlam
            const isEditing = editingFood === food.id

            return (
              <div
                key={food.id}
                className={`food-card ${isFlashing ? 'flash' : ''} ${isGrandSlam ? 'grand-slam' : ''}`}
                style={{
                  borderLeftColor: status.color,
                  backgroundColor: status.bgColor,
                  borderColor: status.borderColor
                }}
              >
                {isEditing ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(e.target.value)}
                      placeholder="数量（如：200g、3 个）"
                      autoFocus
                    />
                    <input
                      type="date"
                      value={editExpiryDate}
                      onChange={(e) => setEditExpiryDate(e.target.value)}
                    />
                    <button onClick={() => saveEdit(food.id)}>✓ 保存</button>
                    <button onClick={() => setEditingFood(null)} className="cancel-btn">✕ 取消</button>
                  </div>
                ) : (
                  <>
                    <div className="card-content">
                      <div className="food-info">
                        <h3 className="food-name">
                          {food.name}
                          {isGrandSlam && <span className="grand-slam-badge" title="大满贯食物">👑</span>}
                        </h3>
                        <span className="food-quantity">{food.quantity || formatQuantity(food.grams)}</span>
                      </div>
                      <div className="expiry-info">
                        {status.label && <span className="status-label">{status.label}</span>}
                        <span className="remaining-days" style={{ color: status.color }}>
                          {remainingDays > 0 ? `还剩 ${remainingDays} 天` :
                           remainingDays === 0 ? '今天到期' :
                           `已过期 ${Math.abs(remainingDays)} 天`}
                        </span>
                      </div>
                    </div>

                    {food.healthData?.systems && food.healthData.systems.length > 0 && (
                      <div className="health-tags">
                        {food.healthData.systems.map(sysKey => (
                          <span key={sysKey} className="health-tag" title={DEFENSE_SYSTEMS[sysKey].name}>
                            {DEFENSE_SYSTEMS[sysKey].icon}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="card-actions">
                      <button onClick={() => startEditing(food)} className="edit-btn" title="编辑">✏️</button>
                      <button onClick={() => deleteFood(food.id)} className="delete-btn" title="删除">✕</button>
                    </div>
                  </>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* 菜谱选择面板 */}
      {matchedRecipes && (
        <div className="recipe-modal-overlay" onClick={closeRecipePanel}>
          <div className="recipe-modal" onClick={(e) => e.stopPropagation()}>
            <div className="recipe-modal-header">
              <h2>🍽️ 今天吃这些</h2>
              <button className="modal-close" onClick={closeRecipePanel}>✕</button>
            </div>

            {matchedRecipes.empty ? (
              <div className="recipe-empty">
                <p>🛒 冰箱里什么都没有，先去采购吧</p>
              </div>
            ) : matchedRecipes.recipes.length === 0 ? (
              <div className="recipe-empty">
                <p>🤔 现有食材还做不了任何菜</p>
              </div>
            ) : (
              <>
                {matchedRecipes.justCooked && (
                  <div className="just-cooked-banner">
                    ✅ 已做好 {matchedRecipes.justCooked}！食材已扣减
                  </div>
                )}

                <div className="recipe-list">
                  {matchedRecipes.recipes.map((recipe, idx) => {
                    const metadata = getRecipeMetadata(recipe.name)
                    return (
                      <div
                        key={idx}
                        className={`recipe-item ${recipe.hasGrandSlam ? 'grand-slam-recipe' : ''} ${recipe.priority === 'urgent' ? 'urgent-recipe' : ''} ${recipe.alreadyCooked ? 'already-cooked' : ''}`}
                      >
                        <div className="recipe-main">
                          <span className="recipe-emoji">{recipe.emoji}</span>
                          <div className="recipe-info">
                            <h3>
                              {recipe.name}
                              {recipe.hasGrandSlam && <span className="mini-crown">👑</span>}
                              {recipe.priority === 'urgent' && <span className="urgent-badge">🔥</span>}
                              {recipe.alreadyCooked && <span className="cooked-badge">✓ 今天吃过</span>}
                              <button
                                className={`favorite-btn ${isFavorite(recipe.name) ? 'favorited' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleFavorite(recipe.name)
                                }}
                                title={isFavorite(recipe.name) ? '取消收藏' : '收藏'}
                              >
                                {isFavorite(recipe.name) ? '⭐' : '☆'}
                              </button>
                            </h3>
                            <p className="recipe-ingredients">需要：{recipe.ingredients.join(' + ')}</p>
                            <div className="recipe-meta">
                              <span className="recipe-difficulty">
                                {metadata.difficulty === '简单' ? '🟢' : metadata.difficulty === '中等' ? '🟡' : '🔴'} {metadata.difficulty}
                              </span>
                              <span className="recipe-time">⏱️ {metadata.time}分钟</span>
                            </div>
                            {recipe.health && <p className="recipe-health">💪 {recipe.health}</p>}
                          </div>
                        </div>
                        <button className="cook-btn" onClick={() => cookRecipe(recipe)}>
                          {recipe.alreadyCooked ? '再做一次' : '做这道菜'}
                        </button>
                      </div>
                    )
                  })}
                </div>

                <div className="recipe-footer">
                  共 {matchedRecipes.recipes.length} 道菜可选
                  {matchedRecipes.recipes.some(r => r.alreadyCooked) && (
                    <span className="cooked-hint">（{matchedRecipes.recipes.filter(r => r.alreadyCooked).length} 道今天吃过）</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 购物清单弹窗 */}
      {showShoppingList && (
        <div className="meal-selector-overlay" onClick={() => setShowShoppingList(false)}>
          <div className="meal-selector" onClick={(e) => e.stopPropagation()}>
            <div className="meal-selector-header">
              <h2>🛒 智能购物清单</h2>
              <button className="modal-close" onClick={() => setShowShoppingList(false)}>✕</button>
            </div>
            {(() => {
              const shoppingList = generateShoppingList()
              if (shoppingList.length === 0) {
                return (
                  <div className="shopping-empty">
                    <p>🎉 太棒了！您的冰箱已经很充足，无需购买额外食材</p>
                  </div>
                )
              }
              return (
                <div className="shopping-content">
                  <div className="shopping-summary">
                    共 {shoppingList.length} 项食材建议购买
                  </div>
                  <div className="shopping-list">
                    {shoppingList.map((item, idx) => (
                      <div key={idx} className={`shopping-item priority-${item.priority === '高' ? 'high' : item.priority === '中' ? 'medium' : 'low'}`}>
                        <span className="shopping-item-name">{item.name}</span>
                        <span className="shopping-item-reason">{item.reason}</span>
                        <span className="shopping-item-priority">
                          {item.priority === '高' ? '🔴' : item.priority === '中' ? '🟡' : '🟢'} {item.priority}优先级
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* 餐次选择弹窗 */}
      {showMealSelector && (
        <div className="meal-selector-overlay" onClick={() => setShowMealSelector(null)}>
          <div className="meal-selector" onClick={(e) => e.stopPropagation()}>
            <div className="meal-selector-header">
              <h2>🍽️ 这顿是什么餐？</h2>
              <button className="modal-close" onClick={() => setShowMealSelector(null)}>✕</button>
            </div>
            <div className="meal-info">
              <span className="meal-recipe-emoji">{showMealSelector.emoji}</span>
              <div>
                <h3>{showMealSelector.name}</h3>
                <p className="meal-ingredients-preview">
                  {showMealSelector.ingredients.join(' + ')}
                </p>
              </div>
            </div>
            <div className="meal-type-grid">
              {Object.entries(MEAL_TYPES).map(([key, mealType]) => (
                <button
                  key={key}
                  className="meal-type-btn"
                  onClick={() => confirmMealType(key)}
                >
                  <span className="meal-type-icon">{mealType.icon}</span>
                  <span className="meal-type-name">{mealType.name}</span>
                  <span className="meal-type-time">{mealType.time}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 食材用量设置弹窗 */}
      {showIngredientQuantity && (
        <div className="meal-selector-overlay" onClick={() => setShowIngredientQuantity(null)}>
          <div className="meal-selector" onClick={(e) => e.stopPropagation()}>
            <div className="meal-selector-header">
              <h2>⚖️ 设置食材用量</h2>
              <button className="modal-close" onClick={() => setShowIngredientQuantity(null)}>✕</button>
            </div>
            <div className="meal-info">
              <span className="meal-recipe-emoji">{showIngredientQuantity.emoji}</span>
              <div>
                <h3>{showIngredientQuantity.name}</h3>
                <p className="meal-ingredients-preview">
                  请设置每种食材的实际用量
                </p>
              </div>
            </div>
            <div className="ingredient-quantity-list">
              {showIngredientQuantity.ingredients.map(ing => {
                const foodItem = foods.find(f => {
                  if (f.name === ing) return true
                  const aliases = INGREDIENT_ALIASES[ing]
                  return aliases && aliases.includes(f.name)
                })
                const available = foodItem ? foodItem.grams : 0
                // 允许空字符串，只有当 key 不存在时才使用默认值 100
                const currentQuantity = ing in ingredientQuantities
                  ? (ingredientQuantities[ing] === '' ? '' : ingredientQuantities[ing])
                  : 100

                return (
                  <div key={ing} className="ingredient-quantity-item">
                    <div className="ingredient-info">
                      <span className="ingredient-name">{ing}</span>
                      <span className="ingredient-available">冰箱有：{formatQuantity(available)}</span>
                    </div>
                    <div className="quantity-input-group">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={currentQuantity}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '')
                          setIngredientQuantities({
                            ...ingredientQuantities,
                            [ing]: value // 允许空字符串
                          })
                        }}
                        placeholder="输入克数"
                        className="quantity-input"
                      />
                      <span className="quantity-unit">克</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="nutrition-preview">
              <h4>🔥 预计营养摄入</h4>
              {(() => {
                const nutrition = calculateRecipeNutrition(showIngredientQuantity, ingredientQuantities)
                return (
                  <>
                    <div className="nutrition-values">
                      <span>{nutrition.calories} 千卡</span>
                      <span>蛋白质 {nutrition.protein}g</span>
                      <span>脂肪 {nutrition.fat}g</span>
                      <span>碳水 {nutrition.carbs}g</span>
                    </div>
                    <p className="nutrition-source">
                      📊 数据来源：USDA 美国农业部食物成分数据库 & 《中国食物成分表》
                    </p>
                  </>
                )
              })()}
            </div>
            {(() => {
              // 检查是否所有食材都有有效的用量
              const hasInvalidQuantity = showIngredientQuantity.ingredients.some(ing => {
                const qty = ingredientQuantities[ing]
                return qty === undefined || qty === '' || parseInt(qty) === 0
              })

              return (
                <>
                  {hasInvalidQuantity && (
                    <div style={{
                      background: '#fff3cd',
                      color: '#856404',
                      padding: '10px',
                      borderRadius: '8px',
                      marginTop: '12px',
                      fontSize: '14px',
                      textAlign: 'center'
                    }}>
                      ⚠️ 请为所有食材输入用量（不能为 0 或空）
                    </div>
                  )}
                  <button
                    className="cook-btn"
                    onClick={confirmCook}
                    disabled={hasInvalidQuantity}
                    style={{
                      width: '100%',
                      marginTop: '16px',
                      opacity: hasInvalidQuantity ? 0.5 : 1,
                      cursor: hasInvalidQuantity ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ✓ 确认做菜
                  </button>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* 今日饮食汇总按钮 */}
      {meals.length > 0 && (
        <button
          className="daily-summary-btn"
          onClick={() => setShowDailySummary(true)}
        >
          📊 今日已吃 {meals.length} 餐
        </button>
      )}

      {/* 今日饮食汇总弹窗 */}
      {showDailySummary && (
        <div className="daily-summary-overlay" onClick={() => setShowDailySummary(false)}>
          <div className="daily-summary" onClick={(e) => e.stopPropagation()}>
            <div className="daily-summary-header">
              <h2>📊 今日饮食汇总</h2>
              <button className="modal-close" onClick={() => setShowDailySummary(false)}>✕</button>
            </div>
            {(() => {
              const dailyNutrition = calculateDailyNutrition()
              return (
                <>
                  <div className="nutrition-summary">
                    <div className="nutrition-main">
                      <div className="calories-display">
                        <span className="calories-value">{dailyNutrition.calories}</span>
                        <span className="calories-unit">千卡</span>
                      </div>
                      <div className="macros">
                        <div className="macro-item">
                          <span className="macro-value">{dailyNutrition.protein}g</span>
                          <span className="macro-label">蛋白质</span>
                        </div>
                        <div className="macro-item">
                          <span className="macro-value">{dailyNutrition.fat}g</span>
                          <span className="macro-label">脂肪</span>
                        </div>
                        <div className="macro-item">
                          <span className="macro-value">{dailyNutrition.carbs}g</span>
                          <span className="macro-label">碳水</span>
                        </div>
                        <div className="macro-item">
                          <span className="macro-value">{dailyNutrition.fiber}g</span>
                          <span className="macro-label">纤维</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {dailyNutrition.grandSlamFoods.length > 0 && (
                    <div className="grand-slam-summary">
                      <h3>👑 今日大满贯食物</h3>
                      <div className="grand-slam-tags">
                        {dailyNutrition.grandSlamFoods.map(food => (
                          <span key={food} className="grand-slam-tag">👑 {food}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {dailyNutrition.coveredSystems.length > 0 && (
                    <div className="systems-summary">
                      <h3>🛡️ 已激活的防御系统</h3>
                      <div className="systems-tags">
                        {dailyNutrition.coveredSystems.map(sys => (
                          <span key={sys} className="system-tag">
                            {DEFENSE_SYSTEMS[sys].icon} {DEFENSE_SYSTEMS[sys].name}
                          </span>
                        ))}
                      </div>
                      <p className="systems-progress">
                        {dailyNutrition.coveredSystems.length}/5 个系统已覆盖
                      </p>
                    </div>
                  )}

                  <div className="meals-list">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ margin: 0 }}>🍽️ 今日餐次记录</h3>
                      <button
                        onClick={() => {
                          if (window.confirm('确定要清除今日所有饮食记录吗？')) {
                            setMeals([])
                          }
                        }}
                        style={{
                          padding: '6px 12px',
                          background: '#ff6b6b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ 清除今日记录
                      </button>
                    </div>
                    {Object.entries(MEAL_TYPES).map(([key, mealType]) => {
                      const typeMeals = meals.filter(m => m.type === key)
                      if (typeMeals.length === 0) return null
                      return (
                        <div key={key} className="meal-type-section">
                          <div className="meal-type-title">
                            <span>{mealType.icon}</span>
                            <span>{mealType.name}</span>
                          </div>
                          {typeMeals.map(meal => (
                            <div key={meal.id} className="meal-item">
                              <span className="meal-time">{meal.time}</span>
                              <span className="meal-emoji">{meal.emoji}</span>
                              <div className="meal-details">
                                <span className="meal-name">{meal.recipe}</span>
                                <span className="meal-calories">{meal.nutrition.calories} 千卡</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* 5×5×5 说明弹窗 */}
      {show555Explanation && (
        <div className="explanation-modal-overlay" onClick={() => setShow555Explanation(false)}>
          <div className="explanation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="explanation-header">
              <h2>📚 什么是 5×5×5？</h2>
              <button className="modal-close" onClick={() => setShow555Explanation(false)}>✕</button>
            </div>
            <div className="explanation-content">
              <p className="explanation-source">来自威廉·李博士《吃出自愈力》</p>

              <div className="explanation-section">
                <h4>人体有五大健康防御系统</h4>
                <div className="systems-grid">
                  {Object.entries(DEFENSE_SYSTEMS).map(([key, sys]) => (
                    <div key={key} className="system-item">
                      <span>{sys.icon}</span>
                      <span>{sys.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="explanation-section">
                <h4>5×5×5 饮食法</h4>
                <div className="five-rule">
                  <div className="rule-item">
                    <span className="rule-number">5</span>
                    <div>
                      <strong>每天 5 种食物</strong>
                      <p>从健康清单中选择 5 种不同的食物</p>
                    </div>
                  </div>
                  <div className="rule-item">
                    <span className="rule-number">5</span>
                    <div>
                      <strong>覆盖 5 个系统</strong>
                      <p>确保每种防御系统都有食物支持</p>
                    </div>
                  </div>
                  <div className="rule-item">
                    <span className="rule-number">5</span>
                    <div>
                      <strong>每天 5 餐</strong>
                      <p>早餐、午餐、晚餐、加餐、甜品</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="explanation-section">
                <h4>👑 大满贯食物</h4>
                <p>能同时影响<strong>多个防御系统</strong>的全明星食物。优先选择这些食物，效率最高！</p>

                <div className="grand-slam-list">
                  {grandSlamFoods.map(({ name, systems }) => (
                    <div key={name} className="grand-slam-item">
                      <span className="grand-slam-name">👑 {name}</span>
                      <div className="grand-slam-systems">
                        {systems.map(sys => (
                          <span key={sys} title={DEFENSE_SYSTEMS[sys].name}>
                            {DEFENSE_SYSTEMS[sys].icon}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <p className="explanation-tip">💡 目前收录 {grandSlamFoods.length} 种大满贯食物</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 下一顿吃什么按钮 */}
      <button onClick={openRecipePanel} className="recommend-btn" disabled={foods.length === 0}>
        🍽️ 下一顿吃什么
      </button>
    </div>
  )
}

export default App
