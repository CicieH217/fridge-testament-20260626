import { NUTRITION_DB, FOOD_HEALTH_DB, INGREDIENT_ALIASES, UNIT_TO_GRAM, FOOD_UNIT_WEIGHTS } from "../data";

// 根据别名获取标准食材名
export const getStandardIngredient = (name) => {
  // 先检查是否是标准名
  if (NUTRITION_DB[name] || FOOD_HEALTH_DB[name]) {
    return name;
  }

  // 检查是否是某个标准食材的别名
  for (const [standard, aliases] of Object.entries(INGREDIENT_ALIASES)) {
    if (aliases.includes(name)) {
      return standard;
    }
  }

  // 如果找不到，返回原名
  return name;
};

// 解析数量字符串为克数（支持食物特定重量）
export const parseToGrams = (qty, foodName = null) => {
  if (!qty) return 150; // 默认

  // 匹配数字 + 单位
  const match = qty.match(
    /^(\d+(?:\.\d+)?)\s*(ml|毫升|l|升|g|克|kg|千克|公斤|个|颗|片|块|杯|碗|瓶|盒|包|份|根|朵|瓣|节)?$/i,
  );

  if (match) {
    const num = parseFloat(match[1]);
    const unit = match[2]?.toLowerCase() || "份";

    // 优先使用食物特定重量
    if (
      foodName &&
      FOOD_UNIT_WEIGHTS[foodName] &&
      FOOD_UNIT_WEIGHTS[foodName][unit]
    ) {
      return num * FOOD_UNIT_WEIGHTS[foodName][unit];
    }

    // 否则使用通用单位转换
    const multiplier = UNIT_TO_GRAM[unit] || 1;
    return num * multiplier;
  }

  // 纯数字
  const numMatch = qty.match(/^(\d+(?:\.\d+)?)$/);
  if (numMatch) {
    return parseFloat(numMatch[1]) * 150; // 假设是份数
  }

  // 中文数字
  const chineseNums = { 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 半: 0.5 };
  for (const [char, num] of Object.entries(chineseNums)) {
    if (qty.startsWith(char)) {
      if (
        foodName &&
        FOOD_UNIT_WEIGHTS[foodName] &&
        FOOD_UNIT_WEIGHTS[foodName]["个"]
      ) {
        return num * FOOD_UNIT_WEIGHTS[foodName]["个"];
      }
      return num * 150;
    }
  }

  return 150;
};

// 格式化数量显示
export const formatQuantity = (grams) => {
  if (grams >= 1000) return `${(grams / 1000).toFixed(1)}kg`;
  if (grams >= 100) return `${Math.round(grams)}g`;
  return `${grams.toFixed(0)}g`;
};

// 解析用户输入文本为食材列表
export const parseInput = (text) => {
  const items = [];
  const parts = text.split(/[，,、\s]+/).filter((p) => p.trim());

  parts.forEach((part) => {
    // 匹配：食材名 + 数字 + 单位
    const match = part.match(
      /^(.+?)(\d+(?:\.\d+)?)\s*(ml|毫升|l|升|g|克|kg|千克|公斤|个|颗|片|块|杯|碗|瓶|盒|包|份)?$/i,
    );

    let name, quantity, grams;

    if (match) {
      name = match[1].trim();
      quantity = match[2] + (match[3] || "份");
      grams = parseToGrams(quantity, name);
    } else {
      // 只匹配食材名
      const nameMatch = part.match(/^([^0-9]+)$/);
      if (nameMatch) {
        name = nameMatch[1].trim();
        quantity = "1 份";
        grams = 150;
      } else {
        return;
      }
    }

    if (name) {
      // 将别名转换为标准食材名
      const standardName = getStandardIngredient(name);

      // 如果输入的名称和标准名不同，保留原始名称作为显示名
      const displayName = name !== standardName ? `${name}(${standardName})` : standardName;

      const healthData = FOOD_HEALTH_DB[standardName] || {
        systems: [],
        grandSlam: false,
        expiry: 7,
      };
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + healthData.expiry);

      items.push({
        id: Date.now() + Math.random(),
        name: standardName, // 使用标准名进行匹配
        displayName, // 显示名称（可能包含原始输入）
        quantity,
        grams,
        expiryDate: expiryDate.toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
        healthData,
      });
    }
  });

  return items;
};
