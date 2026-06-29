# 每日自动清零功能说明

## 更新日期

2026-06-29

## 问题背景

之前的 5×5×5 进度面板是基于**冰箱里所有食材**（`foods`）来计算的，而不是根据**今天吃过的餐次**（`meals`）。

这导致了一个问题：即使过了一天，5×5×5 进度不会归零，而是继续显示冰箱库存的数据。比如冰箱里有 20 种食材，进度永远显示 20 种，不符合「今日进度」的语义。

## 修复内容

### 改了什么

| 功能 | 改前（数据来源） | 改后（数据来源） |
|------|----------------|----------------|
| 5×5×5 食材总数 | 冰箱全部食材 `foods` | 今日餐次食材 `meals` |
| 5×5×5 大满贯食物 | 冰箱里的大满贯 | 今日吃过的大满贯 |
| 5×5×5 防御系统覆盖 | 冰箱食材覆盖的系统 | 今日饮食激活的系统 |
| 防御系统面板打勾 | 基于 `foods` 判断 | 基于 `meals` 判断 |

### 已有的每日清零（无需修改）

以下功能原本就基于 `meals`，已经是正确的：

- 热量 / 蛋白质 / 脂肪 / 碳水 / 纤维汇总
- 今日健康评分
- 营养目标完成度
- 营养缺乏预警
- 大满贯食物标签 & 防御系统标签（在 DailySummaryModal 里）

## 技术细节

### `meals` 的每日清零机制

`meals` 存储在 `localStorage` 的 `fridge_meals` key 中，带有日期戳：

```js
{ date: "Mon Jun 29 2026", meals: [...] }
```

每次 app 加载时检查日期，如果不是今天就自动清空为 `[]`：

```js
const [meals, setMeals] = useState(() => {
  const saved = localStorage.getItem("fridge_meals");
  const today = new Date().toDateString();
  if (saved) {
    const parsed = JSON.parse(saved);
    return parsed.date === today ? parsed.meals : [];
  }
  return [];
});
```

历史数据会保存到 `mealHistory`（最近 30 天），用于周趋势图和回顾。

### `calculateDailyProgress` 改动

**App.jsx** 中的函数，从遍历 `foods` 改为遍历 `meals`：

```js
const calculateDailyProgress = () => {
  const allIngredients = new Set();
  const coveredSystems = new Set();
  let grandSlamCount = 0;

  meals.forEach((meal) => {
    meal.ingredients.forEach((ing) => {
      allIngredients.add(ing);
      const healthData = FOOD_HEALTH_DB[ing];
      if (healthData) {
        if (healthData.grandSlam) grandSlamCount++;
        healthData.systems.forEach((sys) => coveredSystems.add(sys));
      }
    });
  });

  return {
    totalFoods: allIngredients.size,
    grandSlamCount,
    coveredSystems: coveredSystems.size,
    totalSystems: 5,
    progress: (coveredSystems.size / 5) * 100,
  };
};
```

### `ProgressSection` 组件改动

- prop 从 `foods` 改为 `meals`
- 防御系统面板的 ✓ 打勾逻辑改为遍历 `meals` 中的食材，查询 `FOOD_HEALTH_DB` 判断是否覆盖该防御系统
- 新增 `FOOD_HEALTH_DB` import

### 涉及文件

- `src/App.jsx` — `calculateDailyProgress` 函数 + `ProgressSection` 的 prop 传递
- `src/components/ProgressSection.jsx` — 组件 props + 防御系统打勾逻辑

## 用户体验变化

### 改前
- 早上打开 app → 5×5×5 面板还显示昨天的数据（来自冰箱库存）
- 即使什么都没吃，也显示「X 种食材 / Y 个防御系统」

### 改后
- 早上打开 app → 5×5×5 面板归零：0 种食材 / 0 大满贯 / 0/5 防御系统
- 每吃一顿饭，进度条实时增长
- 吃完 5 种不同健康食物、覆盖 5 个防御系统 → 达成 5×5×5 目标 🎉
- 符合「今日进度」的语义，鼓励每天都健康饮食
