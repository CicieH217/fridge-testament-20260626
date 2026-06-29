import React, { useState, useEffect } from "react";
import {
  DEFENSE_SYSTEMS,
  DIET_PATTERNS,
  FOOD_HEALTH_DB,
} from "../data";
import {
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateTDEE,
  calculateIdealNutritionGoals,
  calculatePersonalizedHealthScore,
  getNutrientDeficiencies,
  calculateDailyNutrition,
  getWasteStats,
  getSeasonalRecommendations,
  getHealthGoalRecommendations,
  calculateHealthScoreForDay,
  generateShoppingList,
} from "../utils";









// 绘制折线图函数（优化边距和字体）
const drawLineChart = (canvas, data, unit, color) => {
  if (!canvas) return;
  
  try {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // 设置边距（给标签留空间）
    const padding = { top: 25, right: 35, bottom: 25, left: 45 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 按日期排序并去重（同一天只保留最后一条记录）
    const deduped = {};
    data.forEach(item => {
      deduped[item.date] = item;
    });
    const sorted = Object.values(deduped).sort((a, b) => new Date(a.date) - new Date(b.date));

    // 计算范围
    const values = sorted.map(d => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;
    
    // 添加 10% 的上下缓冲
    const yMin = minVal - range * 0.1;
    const yMax = maxVal + range * 0.1;
    const yRange = yMax - yMin;

    // 绘制网格线
    ctx.strokeStyle = "#e8e8e8";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // 绘制折线
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    sorted.forEach((item, index) => {
      const x = padding.left + (chartWidth / (sorted.length - 1)) * index;
      const y = padding.top + chartHeight - ((item.value - yMin) / yRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // 绘制数据点和标签
    sorted.forEach((item, index) => {
      const x = padding.left + (chartWidth / (sorted.length - 1)) * index;
      const y = padding.top + chartHeight - ((item.value - yMin) / yRange) * chartHeight;

      // 绘制数据点
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();

      // 绘制数值标签（在点上方）
      ctx.fillStyle = "#333";
      ctx.font = "bold 10px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`${item.value}${unit}`, x, y - 12);

      // 绘制日期标签（在底部）
      ctx.fillStyle = "#666";
      ctx.font = "10px Arial";
      const date = new Date(item.date);
      ctx.fillText(`${date.getMonth() + 1}/${date.getDate()}`, x, height - 8);
    });
  } catch (error) {
    console.error("Error drawing chart:", error);
  }
};


function AnalyticsPanel({
  meals,
  healthProfile,
  setHealthProfile,
  healthGoal,
  setHealthGoal,
  mealHistory,
  nutritionGoals,
  foods,
  dietaryPreferences,
  setDietaryPreferences,
  setShowShoppingList,
}) {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDietDescription, setShowDietDescription] = useState(false);

  

  const [selectedDietKey, setSelectedDietKey] = useState(null);
  const [selectedDietForDesc, setSelectedDietForDesc] = useState(null);

  // 获取每周趋势数据
  const getWeeklyTrend = () => {
    const today = new Date();
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayData = mealHistory.find((m) => m.date === dateStr);
      last7Days.push({
        date: dateStr,
        dayName: ["日", "一", "二", "三", "四", "五", "六"][date.getDay()],
        calories: dayData?.nutrition?.calories || 0,
        protein: dayData?.nutrition?.protein || 0,
        mealCount: dayData?.mealCount || 0,
        healthScore: dayData
          ? calculateHealthScoreForDay(dayData.nutrition)
          : 0,
      });
    }

    return last7Days;
  };

  // 获取营养目标完成度
  const getNutritionGoalProgress = () => {
    const todayNutrition = calculateDailyNutrition(meals);

    return {
      calories: {
        current: todayNutrition.calories,
        target: nutritionGoals.calories,
        percentage: Math.round(
          (todayNutrition.calories / nutritionGoals.calories) * 100,
        ),
      },
      protein: {
        current: todayNutrition.protein,
        target: nutritionGoals.protein,
        percentage: Math.round(
          (todayNutrition.protein / nutritionGoals.protein) * 100,
        ),
      },
      fat: {
        current: todayNutrition.fat,
        target: nutritionGoals.fat,
        percentage: Math.round((todayNutrition.fat / nutritionGoals.fat) * 100),
      },
      carbs: {
        current: todayNutrition.carbs,
        target: nutritionGoals.carbs,
        percentage: Math.round(
          (todayNutrition.carbs / nutritionGoals.carbs) * 100,
        ),
      },
      fiber: {
        current: todayNutrition.fiber,
        target: nutritionGoals.fiber,
        percentage: Math.round(
          (todayNutrition.fiber / nutritionGoals.fiber) * 100,
        ),
      },
    };
  };

  return (
    <div className="analytics-section">
      <div
        className="analytics-header"
        onClick={() => setShowAnalytics(!showAnalytics)}
      >
        <h3>🎭 食乜八卦阵</h3>
        <span className="toggle-icon">{showAnalytics ? "▼" : "▶"}</span>
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
                      onChange={(e) =>
                        setHealthProfile({
                          ...healthProfile,
                          height: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="profile-input-group">
                    <label>体重 (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={healthProfile.weight || ""}
                      onChange={(e) => {
                        const value = e.target.value ? parseFloat(e.target.value) : null;
                        const now = new Date().toISOString().split("T")[0];
                        const history = healthProfile.weightHistory || [];

                        // 如果今天已经有记录，更新它；否则添加新记录
                        const existingIndex = history.findIndex(h => h.date === now);
                        let newHistory;
                        if (existingIndex >= 0 && value !== null) {
                          newHistory = [...history];
                          newHistory[existingIndex] = { date: now, value };
                        } else if (value !== null) {
                          newHistory = [...history, { date: now, value }];
                        } else {
                          newHistory = history;
                        }

                        // 只保留最近 30 天的记录
                        newHistory = newHistory
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .slice(0, 30);

                        setHealthProfile({
                          ...healthProfile,
                          weight: value,
                          weightHistory: newHistory,
                        });
                      }}
                      placeholder="例如：65.5"
                    />
                  </div>
                  <div className="profile-input-group">
                    <label>年龄</label>
                    <input
                      type="number"
                      value={healthProfile.age}
                      onChange={(e) =>
                        setHealthProfile({
                          ...healthProfile,
                          age: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="profile-input-group">
                    <label>性别</label>
                    <select
                      value={healthProfile.gender}
                      onChange={(e) =>
                        setHealthProfile({
                          ...healthProfile,
                          gender: e.target.value,
                        })
                      }
                    >
                      <option value="male">男</option>
                      <option value="female">女</option>
                    </select>
                  </div>
                  <div className="profile-input-group full-width">
                    <label>活动水平</label>
                    <select
                      value={healthProfile.activityLevel}
                      onChange={(e) =>
                        setHealthProfile({
                          ...healthProfile,
                          activityLevel: e.target.value,
                        })
                      }
                    >
                      <option value="sedentary">久坐（办公室工作）</option>
                      <option value="light">轻度活动（每周1-3次运动）</option>
                      <option value="moderate">
                        中度活动（每周3-5次运动）
                      </option>
                      <option value="active">
                        高度活动（每周6-7次运动）
                      </option>
                      <option value="veryActive">
                        非常活跃（体力劳动/专业运动员）
                      </option>
                    </select>
                  </div>
                  <div className="profile-input-group full-width">
                    <label>体脂率 (%) - 可选</label>
                    <input
                      type="number"
                      step="0.1"
                      value={healthProfile.bodyFat || ""}
                      onChange={(e) => {
                        const value = e.target.value ? parseFloat(e.target.value) : null;
                        const now = new Date().toISOString().split("T")[0];
                        const history = healthProfile.bodyFatHistory || [];

                        // 如果今天已经有记录，更新它；否则添加新记录
                        const existingIndex = history.findIndex(h => h.date === now);
                        let newHistory;
                        if (existingIndex >= 0 && value !== null) {
                          newHistory = [...history];
                          newHistory[existingIndex] = { date: now, value };
                        } else if (value !== null) {
                          newHistory = [...history, { date: now, value }];
                        } else {
                          newHistory = history;
                        }

                        // 只保留最近 30 天的记录
                        newHistory = newHistory
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .slice(0, 30);

                        setHealthProfile({
                          ...healthProfile,
                          bodyFat: value,
                          bodyFatHistory: newHistory,
                        });
                      }}
                      placeholder="例如：20.5"
                    />
                  </div>
                </div>
                <button
                  className="save-profile-btn"
                  onClick={() =>
                    setHealthProfile({
                      ...healthProfile,
                      showProfileSetup: false,
                    })
                  }
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
                      <span className="stat-value">
                        {healthProfile.height}cm
                      </span>
                      <span className="stat-label">身高</span>
                    </div>
                  </div>
                  <div className="profile-stat">
                    <span className="stat-icon">⚖️</span>
                    <div className="stat-info">
                      <span className="stat-value">
                        {healthProfile.weight}kg
                      </span>
                      <span className="stat-label">体重</span>
                    </div>
                  </div>
                  <div className="profile-stat">
                    <span className="stat-icon">
                      {getBMICategory(calculateBMI(healthProfile)).emoji}
                    </span>
                    <div className="stat-info">
                      <span
                        className="stat-value"
                        style={{ color: getBMICategory(calculateBMI(healthProfile)).color }}
                      >
                        {calculateBMI(healthProfile)}
                      </span>
                      <span className="stat-label">
                        BMI {getBMICategory(calculateBMI(healthProfile)).category}
                      </span>
                    </div>
                  </div>
                  <div className="profile-stat">
                    <span className="stat-icon"></span>
                    <div className="stat-info">
                      <span className="stat-value">{calculateBMR(healthProfile)}</span>
                      <span className="stat-label">基础代谢</span>
                    </div>
                  </div>
                  <div className="profile-stat">
                    <span className="stat-icon">🔥</span>
                    <div className="stat-info">
                      <span className="stat-value">{calculateTDEE(healthProfile)}</span>
                      <span className="stat-label">每日消耗</span>
                    </div>
                  </div>
                  {healthProfile.bodyFat && (
                    <div className="profile-stat">
                      <span className="stat-icon">💪</span>
                      <div className="stat-info">
                        <span className="stat-value">{healthProfile.bodyFat}%</span>
                        <span className="stat-label">体脂率</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 体脂率和体重趋势图 */}
                <div style={{
                  marginTop: "16px",
                  padding: "12px",
                  background: "#f9f9f9",
                  borderRadius: "8px",
                }}>
                  <div style={{ fontWeight: "bold", marginBottom: "12px", fontSize: "14px" }}>
                    📊 健康趋势
                  </div>

                  {/* 体重趋势图 */}
                  {healthProfile.weightHistory && healthProfile.weightHistory.length >= 2 && (
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "#3498DB" }}>
                        ️ 体重趋势
                      </div>
                      <canvas
                        ref={(canvas) => {
                          if (canvas) {
                            drawLineChart(canvas, healthProfile.weightHistory, "kg", "#3498DB");
                          }
                        }}
                        width={300}
                        height={300}
                        style={{ width: "100%", height: "300px", background: "white", borderRadius: "6px" }}
                      />
                    </div>
                  )}

                  {/* 体脂率趋势图 */}
                  {healthProfile.bodyFatHistory && healthProfile.bodyFatHistory.length >= 2 && (
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "#2D7A4A" }}>
                        💪 体脂率趋势
                      </div>
                      <canvas
                        ref={(canvas) => {
                          if (canvas) {
                            drawLineChart(canvas, healthProfile.bodyFatHistory, "%", "#2D7A4A");
                          }
                        }}
                        width={300}
                        height={300}
                        style={{ width: "100%", height: "300px", background: "white", borderRadius: "6px" }}
                      />
                    </div>
                  )}

                  {(healthProfile.weightHistory?.length < 2 && healthProfile.bodyFatHistory?.length < 2) && (
                    <div style={{ color: "#999", fontSize: "13px" }}>
                      需要至少 2 次不同日期的记录才能显示趋势图
                    </div>
                  )}
                </div>


                <button
                  className="edit-profile-btn"
                  onClick={() =>
                    setHealthProfile({
                      ...healthProfile,
                      showProfileSetup: true,
                    })
                  }
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
                const healthScore = calculatePersonalizedHealthScore(meals, healthProfile, healthGoal);
                const scoreColor =
                  healthScore.percentage >= 80
                    ? "#2D7A4A"
                    : healthScore.percentage >= 60
                      ? "#E6833B"
                      : "#C73D3D";
                return (
                  <>
                    <h4>🏆 今日健康评分（个性化）</h4>
                    <div
                      className="score-circle"
                      style={{ borderColor: scoreColor }}
                    >
                      <span
                        className="score-value"
                        style={{ color: scoreColor }}
                      >
                        {healthScore.score}
                      </span>
                      <span className="score-max">
                        / {healthScore.maxScore}
                      </span>
                    </div>
                    <div className="personalized-info">
                      <div className="info-item">
                        <span className="info-label">BMI</span>
                        <span
                          className="info-value"
                          style={{ color: healthScore.bmiCategory.color }}
                        >
                          {healthScore.bmi} (
                          {healthScore.bmiCategory.category})
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">理想热量</span>
                        <span className="info-value">
                          {healthScore.idealGoals.calories} 千卡
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">理想蛋白质</span>
                        <span className="info-value">
                          {healthScore.idealGoals.protein}g
                        </span>
                      </div>
                    </div>
                    <div className="score-breakdown">
                      <div className="breakdown-item">
                        <span className="breakdown-label">热量达标</span>
                        <div className="breakdown-bar">
                          <div
                            className="breakdown-fill"
                            style={{
                              width: `${(healthScore.breakdown.calories.score / healthScore.breakdown.calories.max) * 100}%`,
                              background: "#3498DB",
                            }}
                          />
                        </div>
                        <span className="breakdown-value">
                          {healthScore.breakdown.calories.score}/
                          {healthScore.breakdown.calories.max}
                        </span>
                      </div>
                      <div className="breakdown-item">
                        <span className="breakdown-label">蛋白质达标</span>
                        <div className="breakdown-bar">
                          <div
                            className="breakdown-fill"
                            style={{
                              width: `${(healthScore.breakdown.protein.score / healthScore.breakdown.protein.max) * 100}%`,
                              background: "#E74C3C",
                            }}
                          />
                        </div>
                        <span className="breakdown-value">
                          {healthScore.breakdown.protein.score}/
                          {healthScore.breakdown.protein.max}
                        </span>
                      </div>
                      <div className="breakdown-item">
                        <span className="breakdown-label">BMI健康</span>
                        <div className="breakdown-bar">
                          <div
                            className="breakdown-fill"
                            style={{
                              width: `${(healthScore.breakdown.bmi.score / healthScore.breakdown.bmi.max) * 100}%`,
                              background: healthScore.bmiCategory.color,
                            }}
                          />
                        </div>
                        <span className="breakdown-value">
                          {healthScore.breakdown.bmi.score}/
                          {healthScore.breakdown.bmi.max}
                        </span>
                      </div>
                      <div className="breakdown-item">
                        <span className="breakdown-label">大满贯食物</span>
                        <div className="breakdown-bar">
                          <div
                            className="breakdown-fill"
                            style={{
                              width: `${(healthScore.breakdown.grandSlam.score / healthScore.breakdown.grandSlam.max) * 100}%`,
                              background: "#F39C12",
                            }}
                          />
                        </div>
                        <span className="breakdown-value">
                          {healthScore.breakdown.grandSlam.score}/
                          {healthScore.breakdown.grandSlam.max}
                        </span>
                      </div>
                      <div className="breakdown-item">
                        <span className="breakdown-label">防御系统</span>
                        <div className="breakdown-bar">
                          <div
                            className="breakdown-fill"
                            style={{
                              width: `${(healthScore.breakdown.systems.score / healthScore.breakdown.systems.max) * 100}%`,
                              background: "#9B59B6",
                            }}
                          />
                        </div>
                        <span className="breakdown-value">
                          {healthScore.breakdown.systems.score}/
                          {healthScore.breakdown.systems.max}
                        </span>
                      </div>
                      <div className="breakdown-item">
                        <span className="breakdown-label">餐次规律</span>
                        <div className="breakdown-bar">
                          <div
                            className="breakdown-fill"
                            style={{
                              width: `${(healthScore.breakdown.meals.score / healthScore.breakdown.meals.max) * 100}%`,
                              background: "#1ABC9C",
                            }}
                          />
                        </div>
                        <span className="breakdown-value">
                          {healthScore.breakdown.meals.score}/
                          {healthScore.breakdown.meals.max}
                        </span>
                      </div>
                      <div className="breakdown-item">
                        <span className="breakdown-label">膳食纤维</span>
                        <div className="breakdown-bar">
                          <div
                            className="breakdown-fill"
                            style={{
                              width: `${(healthScore.breakdown.fiber.score / healthScore.breakdown.fiber.max) * 100}%`,
                              background: "#2ECC71",
                            }}
                          />
                        </div>
                        <span className="breakdown-value">
                          {healthScore.breakdown.fiber.score}/
                          {healthScore.breakdown.fiber.max}
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* 饮食模式选择 */}
          <div className="diet-preference-card">
            <h4>🎯 我的饮食模式</h4>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "12px" }}>
              选择你偏好的饮食模式，系统会优先推荐相关食谱
            </p>

            {showDietDescription ? (
              <div className="diet-description-view">
                <div className="diet-desc-header">
                  <span className="diet-desc-emoji">{selectedDietForDesc.emoji}</span>
                  <h3>{selectedDietForDesc.name}</h3>
                </div>
                <p className="diet-desc-text">{selectedDietForDesc.description}</p>
                <div className="diet-desc-benefits">
                  <strong>好处：</strong>
                  {selectedDietForDesc.benefits.join("、")}
                </div>
                <div className="diet-desc-keyfoods">
                  <strong>关键食材：</strong>
                  {selectedDietForDesc.keyFoods.join("、")}
                </div>
                <div className="diet-desc-actions">
                  <button
                    className="diet-desc-cancel"
                    onClick={() => {
                      setShowDietDescription(false);
                      setSelectedDietForDesc(null);
                      setSelectedDietKey(null);
                    }}
                  >
                    取消
                  </button>
                  {dietaryPreferences.includes(selectedDietKey) && (
                    <button
                      className="diet-desc-remove"
                      onClick={() => {
                        setDietaryPreferences([]);
                        setShowDietDescription(false);
                        setSelectedDietForDesc(null);
                        setSelectedDietKey(null);
                      }}
                    >
                      取消选择
                    </button>
                  )}
                  <button
                    className={`diet-desc-confirm ${dietaryPreferences.includes(selectedDietKey) ? "selected" : ""}`}
                    onClick={() => {
                      // 单选：先清空，再添加新的
                      setDietaryPreferences([selectedDietKey]);
                      setShowDietDescription(false);
                      setSelectedDietForDesc(null);
                      setSelectedDietKey(null);
                    }}
                  >
                    {dietaryPreferences.includes(selectedDietKey) ? "✓ 已选择" : "选择这个模式"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="diet-grid">
                {Object.entries(DIET_PATTERNS).map(([key, diet]) => (
                  <div
                    key={key}
                    className={`diet-card ${dietaryPreferences.includes(key) ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedDietKey(key);
                      setSelectedDietForDesc(diet);
                      setShowDietDescription(true);
                    }}
                  >
                    <span className="diet-card-emoji">{diet.emoji}</span>
                    <span className="diet-card-name">{diet.name}</span>
                    {dietaryPreferences.includes(key) && (
                      <span className="diet-card-check">✓</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 营养缺乏预警 */}
          {meals.length > 0 &&
            (() => {
              const deficiencies = getNutrientDeficiencies(meals, healthProfile, healthGoal);
              if (deficiencies.length > 0) {
                return (
                  <div className="nutrient-deficiency-card">
                    <h4>⚠️ 营养缺乏预警</h4>
                    <div className="deficiency-list">
                      {deficiencies.map((def, idx) => (
                        <div
                          key={idx}
                          className={`deficiency-item ${def.severity === "严重" ? "severe" : "mild"}`}
                        >
                          <span className="deficiency-icon">
                            {def.severity === "严重" ? "🔴" : "🟡"}
                          </span>
                          <div className="deficiency-info">
                            <span className="deficiency-name">
                              {def.nutrient}
                            </span>
                            <span className="deficiency-detail">
                              当前: {Math.round(def.current * 10) / 10}g /
                              目标: {def.target}g
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

          {/* 智能购物清单按钮 */}
          <div className="shopping-list-card">
            <h4>🛒 智能购物清单</h4>
            <p className="shopping-hint">
              根据您的营养目标和冰箱库存，生成个性化购物清单
            </p>
            <button
              className="shopping-btn"
              onClick={() => setShowShoppingList(true)}
            >
              生成购物清单
            </button>
          </div>


          {/* 食物浪费追踪 */}
          {(() => {
            const wasteStats = getWasteStats(foods);
            if (
              wasteStats.totalExpired > 0 ||
              wasteStats.totalExpiringSoon > 0
            ) {
              return (
                <div className="waste-tracking-card">
                  <h4>⚠️ 食物浪费预警</h4>
                  {wasteStats.totalExpired > 0 && (
                    <div className="waste-item expired">
                      <span className="waste-icon">❌</span>
                      <div className="waste-info">
                        <span className="waste-count">
                          {wasteStats.totalExpired} 种食材已过期
                        </span>
                        <span className="waste-list">
                          {wasteStats.expired.map((f) => f.name).join("、")}
                        </span>
                      </div>
                    </div>
                  )}
                  {wasteStats.totalExpiringSoon > 0 && (
                    <div className="waste-item expiring">
                      <span className="waste-icon">⏰</span>
                      <div className="waste-info">
                        <span className="waste-count">
                          {wasteStats.totalExpiringSoon}{" "}
                          种食材即将过期（3天内）
                        </span>
                        <span className="waste-list">
                          {wasteStats.expiringSoon
                            .map((f) => f.name)
                            .join("、")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })()}

          {/* 每周趋势图 */}
          {mealHistory.length > 0 && (
            <div className="weekly-trend-card">
              <h4>📈 本周饮食趋势</h4>
              {(() => {
                const weeklyTrend = getWeeklyTrend();
                const maxCalories = Math.max(
                  ...weeklyTrend.map((d) => d.calories),
                  1,
                );

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
                                background:
                                  day.calories > 0
                                    ? "linear-gradient(180deg, #2D7A4A 0%, #7CB89D 100%)"
                                    : "#E8E8E8",
                              }}
                            >
                              {day.calories > 0 && (
                                <span className="trend-value">
                                  {day.calories}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="trend-label">周{day.dayName}</span>
                          {day.healthScore > 0 && (
                            <span
                              className="trend-score"
                              style={{
                                color:
                                  day.healthScore >= 80
                                    ? "#2D7A4A"
                                    : day.healthScore >= 60
                                      ? "#E6833B"
                                      : "#C73D3D",
                              }}
                            >
                              {day.healthScore}分
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="trend-summary">
                      <span>
                        平均每日:{" "}
                        {Math.round(
                          weeklyTrend.reduce(
                            (sum, d) => sum + d.calories,
                            0,
                          ) / 7,
                        )}{" "}
                        千卡
                      </span>
                      <span>
                        平均健康分:{" "}
                        {Math.round(
                          weeklyTrend.reduce(
                            (sum, d) => sum + d.healthScore,
                            0,
                          ) / 7,
                        )}
                        分
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* 健康目标推荐 */}
          <div className="health-goal-card">
            <h4>
              {getHealthGoalRecommendations(healthGoal).emoji} 健康目标:{" "}
              {getHealthGoalRecommendations(healthGoal).name}
            </h4>
            <p className="goal-focus">
              重点: {getHealthGoalRecommendations(healthGoal).focus}
            </p>
            <div className="goal-foods">
              <span className="goal-label">推荐食材:</span>
              <div className="goal-food-tags">
                {getHealthGoalRecommendations(healthGoal).foods.map((food, idx) => (
                  <span key={idx} className="goal-food-tag">
                    {food}
                  </span>
                ))}
              </div>
            </div>
            <div className="goal-targets">
              <div className="target-item">
                <span className="target-label">目标热量</span>
                <span className="target-value">
                  {getHealthGoalRecommendations(healthGoal).targetCalories} 千卡
                </span>
              </div>
              <div className="target-item">
                <span className="target-label">目标蛋白质</span>
                <span className="target-value">
                  {getHealthGoalRecommendations(healthGoal).targetProtein}g
                </span>
              </div>
            </div>
            <button
              className="change-goal-btn"
              onClick={() => {
                const goals = [
                  "maintain",
                  "muscle_gain",
                  "fat_loss",
                  "health",
                ];
                const currentIndex = goals.indexOf(healthGoal);
                const nextIndex = (currentIndex + 1) % goals.length;
                setHealthGoal(goals[nextIndex]);
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
                const idealGoals = calculateIdealNutritionGoals(healthProfile, healthGoal);
                const todayNutrition = calculateDailyNutrition(meals);

                const getProgress = (current, target) => ({
                  current: Math.round(current * 10) / 10,
                  target: Math.round(target),
                  percentage: Math.round((current / target) * 100),
                });

                const calories = getProgress(
                  todayNutrition.calories,
                  idealGoals.calories,
                );
                const protein = getProgress(
                  todayNutrition.protein,
                  idealGoals.protein,
                );
                const fiber = getProgress(
                  todayNutrition.fiber,
                  idealGoals.fiber,
                );

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
                            background:
                              calories.percentage >= 90 &&
                              calories.percentage <= 110
                                ? "#2D7A4A"
                                : "#E6833B",
                          }}
                        />
                      </div>
                      <span className="nutrition-progress-percentage">
                        {calories.percentage}%
                      </span>
                    </div>

                    <div className="nutrition-progress-item">
                      <div className="nutrition-progress-header">
                        <span className="nutrition-progress-label">
                          蛋白质
                        </span>
                        <span className="nutrition-progress-value">
                          {protein.current} / {protein.target}g
                        </span>
                      </div>
                      <div className="nutrition-progress-bar">
                        <div
                          className="nutrition-progress-fill"
                          style={{
                            width: `${Math.min(protein.percentage, 100)}%`,
                            background:
                              protein.percentage >= 90
                                ? "#2D7A4A"
                                : "#E6833B",
                          }}
                        />
                      </div>
                      <span className="nutrition-progress-percentage">
                        {protein.percentage}%
                      </span>
                    </div>

                    <div className="nutrition-progress-item">
                      <div className="nutrition-progress-header">
                        <span className="nutrition-progress-label">
                          膳食纤维
                        </span>
                        <span className="nutrition-progress-value">
                          {fiber.current} / {fiber.target}g
                        </span>
                      </div>
                      <div className="nutrition-progress-bar">
                        <div
                          className="nutrition-progress-fill"
                          style={{
                            width: `${Math.min(fiber.percentage, 100)}%`,
                            background:
                              fiber.percentage >= 90 ? "#2D7A4A" : "#E6833B",
                          }}
                        />
                      </div>
                      <span className="nutrition-progress-percentage">
                        {fiber.percentage}%
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* 季节性食材推荐 */}
          {(() => {
            const seasonal = getSeasonalRecommendations();

            return (
              <div className="seasonal-card">
                <h4>
                  {seasonal.emoji} {seasonal.name}时令食材
                </h4>
                <p className="seasonal-benefits">💡 {seasonal.benefits}</p>
                <div className="seasonal-foods">
                  {seasonal.foods.map((food, idx) => (
                    <div key={idx} className="seasonal-food-item">
                      <span className="seasonal-food-name">{food}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default AnalyticsPanel;
