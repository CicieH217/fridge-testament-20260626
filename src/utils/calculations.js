import { NUTRITION_DB, FOOD_HEALTH_DB, DIET_PATTERNS, DEFENSE_SYSTEMS } from "../data";

// 计算剩余天数
export const getRemainingDays = (expiryDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// 获取颜色状态
export const getColorStatus = (remainingDays) => {
  // 3天内：红色
  if (remainingDays <= 3)
    return {
      color: "#C73D3D",
      bgColor: "#FCE9E9",
      borderColor: "#C73D3D",
      label: remainingDays === 0 ? " 今天吃" : remainingDays < 0 ? " 已过期" : "⚠️ 尽快吃",
      flash: remainingDays === 0,
      expired: remainingDays < 0,
    };
  // 3-7天：橙色
  if (remainingDays <= 7)
    return {
      color: "#E6833B",
      bgColor: "#FFF4E6",
      borderColor: "#E6833B",
      label: "⏰ 注意",
    };
  // 7天以上：绿色
  return {
    color: "#2D7A4A",
    bgColor: "#EAF6EF",
    borderColor: "#2D7A4A",
    label: null,
  };
};

// 计算 BMI
export const calculateBMI = (healthProfile) => {
  const heightInMeters = healthProfile.height / 100;
  const bmi = healthProfile.weight / (heightInMeters * heightInMeters);
  return Math.round(bmi * 10) / 10;
};

// 获取 BMI 分类
export const getBMICategory = (bmi) => {
  if (bmi < 18.5) return { category: "偏瘦", color: "#3498DB", emoji: "💙" };
  if (bmi < 24) return { category: "正常", color: "#2D7A4A", emoji: "💚" };
  if (bmi < 28) return { category: "偏胖", color: "#E6833B", emoji: "💛" };
  return { category: "肥胖", color: "#C73D3D", emoji: "❤️" };
};

// 计算 BMR（基础代谢率）- Mifflin-St Jeor 公式
export const calculateBMR = (healthProfile) => {
  const { weight, height, age, gender } = healthProfile;
  if (gender === "male") {
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  } else {
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  }
};

// 计算 TDEE（每日总能量消耗）
export const calculateTDEE = (healthProfile) => {
  const bmr = calculateBMR(healthProfile);
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9,
  };
  return Math.round(
    bmr * (activityMultipliers[healthProfile.activityLevel] || 1.55),
  );
};

// 根据个人信息计算理想营养目标
export const calculateIdealNutritionGoals = (healthProfile, healthGoal) => {
  const tdee = calculateTDEE(healthProfile);
  const bmi = calculateBMI(healthProfile);
  const bmiCategory = getBMICategory(bmi);

  let calories, proteinRatio, fatRatio;

  if (
    healthGoal === "fat_loss" ||
    bmiCategory.category === "偏胖" ||
    bmiCategory.category === "肥胖"
  ) {
    calories = Math.round(tdee * 0.8);
    proteinRatio = 0.3;
    fatRatio = 0.25;
  } else if (
    healthGoal === "muscle_gain" ||
    bmiCategory.category === "偏瘦"
  ) {
    calories = Math.round(tdee * 1.15);
    proteinRatio = 0.3;
    fatRatio = 0.25;
  } else {
    calories = tdee;
    proteinRatio = 0.25;
    fatRatio = 0.3;
  }

  return {
    calories,
    protein: Math.round((calories * proteinRatio) / 4),
    fat: Math.round((calories * fatRatio) / 9),
    carbs: Math.round((calories * (1 - proteinRatio - fatRatio)) / 4),
    fiber: healthProfile.gender === "male" ? 38 : 25,
  };
};

// 计算菜谱的营养成分（支持自定义用量）
export const calculateRecipeNutrition = (recipe, customQuantities = {}) => {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;
  let totalFiber = 0;

  recipe.ingredients.forEach((ing) => {
    const nutrition = NUTRITION_DB[ing];
    if (nutrition) {
      const grams = parseInt(customQuantities[ing]) || 100;
      const ratio = grams / 100;
      totalCalories += nutrition.calories * ratio;
      totalProtein += nutrition.protein * ratio;
      totalFat += nutrition.fat * ratio;
      totalCarbs += nutrition.carbs * ratio;
      totalFiber += nutrition.fiber * ratio;
    }
  });

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fiber: Math.round(totalFiber * 10) / 10,
  };
};

// 计算总蛋白质
export const calculateTotalProtein = (ingredients) => {
  return ingredients.reduce((total, ing) => {
    const nutrition = NUTRITION_DB[ing];
    return total + (nutrition?.protein || 0);
  }, 0);
};

// 计算总碳水
export const calculateTotalCarbs = (ingredients) => {
  return ingredients.reduce((total, ing) => {
    const nutrition = NUTRITION_DB[ing];
    return total + (nutrition?.carbs || 0);
  }, 0);
};

// 计算总脂肪
export const calculateTotalFat = (ingredients) => {
  return ingredients.reduce((total, ing) => {
    const nutrition = NUTRITION_DB[ing];
    return total + (nutrition?.fat || 0);
  }, 0);
};

// 检测饮食模式
export const detectDietPatterns = (ingredients, meals) => {
  const detected = [];

  // 地中海饮食检测
  const mediterraneanFoods = DIET_PATTERNS.mediterranean.keyFoods;
  const mediterraneanCount = ingredients.filter((ing) =>
    mediterraneanFoods.includes(ing),
  ).length;
  if (mediterraneanCount >= 3) {
    detected.push({
      pattern: "mediterranean",
      match: mediterraneanCount,
      percentage: Math.round((mediterraneanCount / ingredients.length) * 100),
    });
  }

  // 高蛋白饮食检测
  const highProteinFoods = DIET_PATTERNS.highProtein.keyFoods;
  const highProteinCount = ingredients.filter((ing) =>
    highProteinFoods.includes(ing),
  ).length;
  const totalProtein = calculateTotalProtein(ingredients);
  if (totalProtein >= 50 || highProteinCount >= 3) {
    detected.push({
      pattern: "highProtein",
      match: highProteinCount,
      percentage: Math.round((highProteinCount / ingredients.length) * 100),
    });
  }

  // 低碳水饮食检测
  const totalCarbs = calculateTotalCarbs(ingredients);
  if (totalCarbs < 100 && ingredients.length > 0) {
    detected.push({
      pattern: "lowCarb",
      match: totalCarbs,
      percentage: Math.round((1 - totalCarbs / 200) * 100),
    });
  }

  // 素食检测
  const meatFoods = ["猪肉", "牛肉", "鸡肉", "鱼", "虾"];
  const hasMeat = ingredients.some((ing) => meatFoods.includes(ing));
  if (!hasMeat && ingredients.length > 0) {
    detected.push({
      pattern: "vegetarian",
      match: ingredients.length,
      percentage: 100,
    });
  }

  // 生酮饮食检测
  const totalFat = calculateTotalFat(ingredients);
  if (totalCarbs < 50 && totalFat > 100 && ingredients.length > 0) {
    const ketoFoods = DIET_PATTERNS.keto.keyFoods;
    const ketoCount = ingredients.filter((ing) =>
      ketoFoods.includes(ing),
    ).length;
    detected.push({
      pattern: "keto",
      match: ketoCount,
      percentage: Math.round((ketoCount / ingredients.length) * 100),
    });
  }

  // DASH 饮食检测
  const dashFoods = DIET_PATTERNS.dash.keyFoods;
  const dashCount = ingredients.filter((ing) =>
    dashFoods.some((dash) => ing.includes(dash) || dash.includes(ing)),
  ).length;
  if (dashCount >= 4 && !hasMeat) {
    detected.push({
      pattern: "dash",
      match: dashCount,
      percentage: Math.round((dashCount / ingredients.length) * 100),
    });
  }

  // 原始人饮食检测
  const paleoFoods = DIET_PATTERNS.paleo.keyFoods;
  const paleoCount = ingredients.filter((ing) =>
    paleoFoods.some((paleo) => ing.includes(paleo) || paleo.includes(ing)),
  ).length;
  const hasGrains = ingredients.some((ing) =>
    ["米", "面", "面包", "麦", "燕麦"].some((g) => ing.includes(g)),
  );
  const hasDairy = ingredients.some((ing) =>
    ["牛奶", "奶酪", "酸奶", "奶"].some((d) => ing.includes(d)),
  );
  if (paleoCount >= 3 && !hasGrains && !hasDairy && ingredients.length > 0) {
    detected.push({
      pattern: "paleo",
      match: paleoCount,
      percentage: Math.round((paleoCount / ingredients.length) * 100),
    });
  }

  // 纯素饮食检测
  const animalProducts = [
    "猪肉", "牛肉", "鸡肉", "鱼", "虾", "鸡蛋", "牛奶", "奶酪", "蜂蜜",
  ];
  const hasAnimalProducts = ingredients.some((ing) =>
    animalProducts.some((a) => ing.includes(a)),
  );
  if (!hasAnimalProducts && ingredients.length > 0) {
    detected.push({
      pattern: "vegan",
      match: ingredients.length,
      percentage: 100,
    });
  }

  // 弹性素食检测
  const plantFoods = ingredients.filter(
    (ing) => !meatFoods.includes(ing),
  ).length;
  const plantPercentage = (plantFoods / ingredients.length) * 100;
  if (plantPercentage >= 70 && hasMeat && ingredients.length >= 3) {
    detected.push({
      pattern: "flexitarian",
      match: plantFoods,
      percentage: Math.round(plantPercentage),
    });
  }

  // 抗炎饮食检测
  const antiInflammatoryFoods = DIET_PATTERNS.antiInflammatory.keyFoods;
  const antiInflammatoryCount = ingredients.filter((ing) =>
    antiInflammatoryFoods.some(
      (aif) => ing.includes(aif) || aif.includes(ing),
    ),
  ).length;
  if (antiInflammatoryCount >= 3 && ingredients.length > 0) {
    detected.push({
      pattern: "antiInflammatory",
      match: antiInflammatoryCount,
      percentage: Math.round(
        (antiInflammatoryCount / ingredients.length) * 100,
      ),
    });
  }

  // 间歇性断食检测
  const mealCount = new Set(meals.map((m) => m.type)).size;
  if (mealCount <= 2 && meals.length > 0) {
    detected.push({
      pattern: "intermittentFasting",
      match: mealCount,
      percentage: 80,
    });
  }

  return detected;
};

// 计算今日总营养摄入
export const calculateDailyNutrition = (meals) => {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;
  let totalFiber = 0;
  let grandSlamFoods = new Set();
  let coveredSystems = new Set();
  let allIngredients = [];

  meals.forEach((meal) => {
    totalCalories += meal.nutrition.calories;
    totalProtein += meal.nutrition.protein;
    totalFat += meal.nutrition.fat;
    totalCarbs += meal.nutrition.carbs;
    totalFiber += meal.nutrition.fiber;

    meal.ingredients.forEach((ing) => {
      allIngredients.push(ing);
      const healthData = FOOD_HEALTH_DB[ing];
      if (healthData) {
        if (healthData.grandSlam) {
          grandSlamFoods.add(ing);
        }
        healthData.systems.forEach((sys) => coveredSystems.add(sys));
      }
    });
  });

  const detectedDiets = detectDietPatterns(allIngredients, meals);

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
    allIngredients,
  };
};

// 计算健康评分
export const calculateHealthScore = (meals) => {
  const nutrition = calculateDailyNutrition(meals);
  let score = 0;
  const maxScore = 100;

  const proteinRatio = nutrition.protein / Math.max(nutrition.calories / 4, 1);
  const fatRatio = nutrition.fat / Math.max(nutrition.calories / 9, 1);
  const carbRatio = nutrition.carbs / Math.max(nutrition.calories / 4, 1);

  if (proteinRatio >= 0.2 && proteinRatio <= 0.35) score += 10;
  if (fatRatio >= 0.2 && fatRatio <= 0.35) score += 10;
  if (carbRatio >= 0.4 && carbRatio <= 0.6) score += 10;

  const grandSlamScore = Math.min(nutrition.grandSlamFoods.length * 5, 20);
  score += grandSlamScore;

  const systemScore = Math.min(nutrition.coveredSystems.length * 4, 20);
  score += systemScore;

  if (nutrition.mealCount >= 3) score += 15;
  else if (nutrition.mealCount >= 2) score += 10;
  else if (nutrition.mealCount >= 1) score += 5;

  if (nutrition.fiber >= 25) score += 15;
  else if (nutrition.fiber >= 15) score += 10;
  else if (nutrition.fiber >= 10) score += 5;

  return {
    score: Math.round(score),
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    breakdown: {
      nutrition: {
        score: Math.round(
          (proteinRatio >= 0.2 && proteinRatio <= 0.35 ? 10 : 0) +
            (fatRatio >= 0.2 && fatRatio <= 0.35 ? 10 : 0) +
            (carbRatio >= 0.4 && carbRatio <= 0.6 ? 10 : 0),
        ),
        max: 30,
      },
      grandSlam: { score: grandSlamScore, max: 20 },
      systems: { score: systemScore, max: 20 },
      meals: {
        score:
          nutrition.mealCount >= 3 ? 15
          : nutrition.mealCount >= 2 ? 10
          : nutrition.mealCount >= 1 ? 5
          : 0,
        max: 15,
      },
      fiber: {
        score:
          nutrition.fiber >= 25 ? 15
          : nutrition.fiber >= 15 ? 10
          : nutrition.fiber >= 10 ? 5
          : 0,
        max: 15,
      },
    },
  };
};

// 计算某天的健康评分（用于历史数据）
export const calculateHealthScoreForDay = (nutrition) => {
  let score = 0;

  const proteinRatio = nutrition.protein / Math.max(nutrition.calories / 4, 1);
  const fatRatio = nutrition.fat / Math.max(nutrition.calories / 9, 1);
  const carbRatio = nutrition.carbs / Math.max(nutrition.calories / 4, 1);

  if (proteinRatio >= 0.2 && proteinRatio <= 0.35) score += 10;
  if (fatRatio >= 0.2 && fatRatio <= 0.35) score += 10;
  if (carbRatio >= 0.4 && carbRatio <= 0.6) score += 10;

  score += Math.min(nutrition.grandSlamFoods.length * 5, 20);
  score += Math.min(nutrition.coveredSystems.length * 4, 20);

  if (nutrition.mealCount >= 3) score += 15;
  else if (nutrition.mealCount >= 2) score += 10;
  else if (nutrition.mealCount >= 1) score += 5;

  if (nutrition.fiber >= 25) score += 15;
  else if (nutrition.fiber >= 15) score += 10;
  else if (nutrition.fiber >= 10) score += 5;

  return score;
};

// 计算个性化健康评分
export const calculatePersonalizedHealthScore = (meals, healthProfile, healthGoal) => {
  const nutrition = calculateDailyNutrition(meals);
  const idealGoals = calculateIdealNutritionGoals(healthProfile, healthGoal);
  const bmi = calculateBMI(healthProfile);
  const bmiCategory = getBMICategory(bmi);

  let score = 0;
  const maxScore = 100;

  const caloriePercentage = (nutrition.calories / idealGoals.calories) * 100;
  if (caloriePercentage >= 90 && caloriePercentage <= 110) score += 20;
  else if (caloriePercentage >= 80 && caloriePercentage <= 120) score += 15;
  else if (caloriePercentage >= 70 && caloriePercentage <= 130) score += 10;

  const proteinPercentage = (nutrition.protein / idealGoals.protein) * 100;
  if (proteinPercentage >= 90) score += 15;
  else if (proteinPercentage >= 70) score += 10;
  else if (proteinPercentage >= 50) score += 5;

  if (bmiCategory.category === "正常") score += 15;
  else if (bmiCategory.category === "偏瘦" || bmiCategory.category === "偏胖")
    score += 10;
  else score += 5;

  score += Math.min(nutrition.grandSlamFoods.length * 5, 15);
  score += Math.min(nutrition.coveredSystems.length * 3, 15);

  if (nutrition.mealCount >= 3) score += 10;
  else if (nutrition.mealCount >= 2) score += 7;
  else if (nutrition.mealCount >= 1) score += 4;

  const fiberPercentage = (nutrition.fiber / idealGoals.fiber) * 100;
  if (fiberPercentage >= 90) score += 10;
  else if (fiberPercentage >= 70) score += 7;
  else if (fiberPercentage >= 50) score += 4;

  return {
    score: Math.round(score),
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    breakdown: {
      calories: {
        score:
          caloriePercentage >= 90 && caloriePercentage <= 110 ? 20
          : caloriePercentage >= 80 && caloriePercentage <= 120 ? 15
          : caloriePercentage >= 70 && caloriePercentage <= 130 ? 10
          : 0,
        max: 20,
      },
      protein: {
        score:
          proteinPercentage >= 90 ? 15
          : proteinPercentage >= 70 ? 10
          : proteinPercentage >= 50 ? 5
          : 0,
        max: 15,
      },
      bmi: {
        score:
          bmiCategory.category === "正常" ? 15
          : bmiCategory.category === "偏瘦" || bmiCategory.category === "偏胖" ? 10
          : 5,
        max: 15,
      },
      grandSlam: {
        score: Math.min(nutrition.grandSlamFoods.length * 5, 15),
        max: 15,
      },
      systems: {
        score: Math.min(nutrition.coveredSystems.length * 3, 15),
        max: 15,
      },
      meals: {
        score:
          nutrition.mealCount >= 3 ? 10
          : nutrition.mealCount >= 2 ? 7
          : nutrition.mealCount >= 1 ? 4
          : 0,
        max: 10,
      },
      fiber: {
        score:
          fiberPercentage >= 90 ? 10
          : fiberPercentage >= 70 ? 7
          : fiberPercentage >= 50 ? 4
          : 0,
        max: 10,
      },
    },
    idealGoals,
    bmi,
    bmiCategory,
  };
};

// 获取营养缺乏警告
export const getNutrientDeficiencies = (meals, healthProfile, healthGoal) => {
  const nutrition = calculateDailyNutrition(meals);
  const idealGoals = calculateIdealNutritionGoals(healthProfile, healthGoal);
  const deficiencies = [];

  if (nutrition.protein < idealGoals.protein * 0.7) {
    deficiencies.push({
      nutrient: "蛋白质",
      current: nutrition.protein,
      target: idealGoals.protein,
      severity: "严重",
    });
  } else if (nutrition.protein < idealGoals.protein * 0.9) {
    deficiencies.push({
      nutrient: "蛋白质",
      current: nutrition.protein,
      target: idealGoals.protein,
      severity: "轻微",
    });
  }

  if (nutrition.fiber < idealGoals.fiber * 0.7) {
    deficiencies.push({
      nutrient: "膳食纤维",
      current: nutrition.fiber,
      target: idealGoals.fiber,
      severity: "严重",
    });
  } else if (nutrition.fiber < idealGoals.fiber * 0.9) {
    deficiencies.push({
      nutrient: "膳食纤维",
      current: nutrition.fiber,
      target: idealGoals.fiber,
      severity: "轻微",
    });
  }

  return deficiencies;
};

// 获取食物浪费统计
export const getWasteStats = (foods) => {
  const today = new Date();

  const expiredFoods = foods.filter((f) => {
    const expiry = new Date(f.expiryDate);
    return expiry < today;
  });

  const expiringSoonFoods = foods.filter((f) => {
    const expiry = new Date(f.expiryDate);
    const daysUntilExpiry = Math.ceil(
      (expiry - today) / (1000 * 60 * 60 * 24),
    );
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 3;
  });

  return {
    expired: expiredFoods,
    expiringSoon: expiringSoonFoods,
    totalExpired: expiredFoods.length,
    totalExpiringSoon: expiringSoonFoods.length,
  };
};

// 获取季节性食材推荐
export const getSeasonalRecommendations = () => {
  const month = new Date().getMonth() + 1;

  const seasonalFoods = {
    spring: {
      months: [3, 4, 5],
      name: "春季",
      emoji: "🌸",
      foods: ["菠菜", "韭菜", "春笋", "草莓", "樱桃"],
      benefits: "养肝护脾，增强免疫力",
    },
    summer: {
      months: [6, 7, 8],
      name: "夏季",
      emoji: "☀️",
      foods: ["西瓜", "黄瓜", "番茄", "苦瓜", "绿豆"],
      benefits: "清热解暑，补充水分",
    },
    autumn: {
      months: [9, 10, 11],
      name: "秋季",
      emoji: "🍂",
      foods: ["梨", "苹果", "南瓜", "山药", "莲藕"],
      benefits: "润肺生津，滋阴润燥",
    },
    winter: {
      months: [12, 1, 2],
      name: "冬季",
      emoji: "❄️",
      foods: ["羊肉", "牛肉", "萝卜", "白菜", "生姜"],
      benefits: "温补身体，增强抗寒能力",
    },
  };

  const season = Object.values(seasonalFoods).find((s) =>
    s.months.includes(month),
  );
  return season || seasonalFoods.spring;
};

// 根据健康目标推荐食材
export const getHealthGoalRecommendations = (healthGoal) => {
  const recommendations = {
    muscle_gain: {
      name: "增肌",
      emoji: "💪",
      focus: "高蛋白",
      foods: ["鸡胸肉", "牛肉", "鱼", "鸡蛋", "豆腐", "牛奶", "酸奶"],
      targetCalories: 2500,
      targetProtein: 120,
    },
    fat_loss: {
      name: "减脂",
      emoji: "🔥",
      focus: "低碳水高蛋白",
      foods: ["鸡胸肉", "鱼", "绿叶蔬菜", "牛油果", "坚果", "鸡蛋"],
      targetCalories: 1500,
      targetProtein: 100,
    },
    maintain: {
      name: "保持",
      emoji: "⚖️",
      focus: "均衡饮食",
      foods: ["各类蔬菜", "优质蛋白", "全谷物", "健康脂肪"],
      targetCalories: 2000,
      targetProtein: 60,
    },
    health: {
      name: "健康养生",
      emoji: "🌿",
      focus: "大满贯食物",
      foods: ["蓝莓", "三文鱼", "菠菜", "西兰花", "大蒜", "绿茶", "黑巧克力"],
      targetCalories: 2000,
      targetProtein: 60,
    },
  };

  return recommendations[healthGoal] || recommendations.maintain;
};

// 生成购物清单
export const generateShoppingList = (foods, healthProfile, healthGoal, todayNutrition) => {
  const idealGoals = calculateIdealNutritionGoals(healthProfile, healthGoal);
  const shoppingList = [];

  // 如果没有传入 todayNutrition，使用默认值
  const nutrition = todayNutrition || { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 };

  // 检查蛋白质是否充足
  if (nutrition.protein < idealGoals.protein * 0.8) {
    const proteinFoods = ["鸡胸肉", "牛肉", "鱼", "鸡蛋", "豆腐", "牛奶"];
    proteinFoods.forEach((food) => {
      if (!foods.some((f) => f.name === food)) {
        shoppingList.push({
          name: food,
          reason: "补充蛋白质",
          priority: "高",
        });
      }
    });
  }

  // 检查膳食纤维是否充足
  if (nutrition.fiber < idealGoals.fiber * 0.8) {
    const fiberFoods = ["燕麦", "全麦面包", "红薯", "豆类", "西兰花"];
    fiberFoods.forEach((food) => {
      if (!foods.some((f) => f.name === food)) {
        shoppingList.push({
          name: food,
          reason: "补充膳食纤维",
          priority: "高",
        });
      }
    });
  }

  // 检查大满贯食物
  const grandSlamFoods = Object.entries(FOOD_HEALTH_DB)
    .filter(([_, data]) => data.grandSlam)
    .map(([name, _]) => name)
    .slice(0, 5);

  grandSlamFoods.forEach((food) => {
    if (!foods.some((f) => f.name === food)) {
      shoppingList.push({ name: food, reason: "大满贯食物", priority: "中" });
    }
  });

  // 检查季节性食材
  const seasonal = getSeasonalRecommendations();
  seasonal.foods.forEach((food) => {
    if (!foods.some((f) => f.name === food)) {
      shoppingList.push({ name: food, reason: "时令食材", priority: "低" });
    }
  });

  // 按优先级排序
  const priorityOrder = { 高: 0, 中: 1, 低: 2 };
  return shoppingList.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
  );
};
