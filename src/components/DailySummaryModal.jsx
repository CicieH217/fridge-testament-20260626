import React from "react";
import { MEAL_TYPES, DEFENSE_SYSTEMS } from "../data";
import { calculateDailyNutrition } from "../utils";

function DailySummaryModal({
  showDailySummary,
  setShowDailySummary,
  meals,
  setMeals,
}) {
  return (
    <div
      className="daily-summary-overlay"
      onClick={() => setShowDailySummary(false)}
    >
      <div className="daily-summary" onClick={(e) => e.stopPropagation()}>
        <div className="daily-summary-header">
          <h2>📊 今日饮食汇总</h2>
          <button
            className="modal-close"
            onClick={() => setShowDailySummary(false)}
          >
            ✕
          </button>
        </div>
        {(() => {
          const dailyNutrition = calculateDailyNutrition(meals);
          return (
            <>
              <div className="nutrition-summary">
                <div className="nutrition-main">
                  <div className="calories-display">
                    <span className="calories-value">
                      {dailyNutrition.calories}
                    </span>
                    <span className="calories-unit">千卡</span>
                  </div>
                  <div className="macros">
                    <div className="macro-item">
                      <span className="macro-value">
                        {dailyNutrition.protein}g
                      </span>
                      <span className="macro-label">蛋白质</span>
                    </div>
                    <div className="macro-item">
                      <span className="macro-value">
                        {dailyNutrition.fat}g
                      </span>
                      <span className="macro-label">脂肪</span>
                    </div>
                    <div className="macro-item">
                      <span className="macro-value">
                        {dailyNutrition.carbs}g
                      </span>
                      <span className="macro-label">碳水</span>
                    </div>
                    <div className="macro-item">
                      <span className="macro-value">
                        {dailyNutrition.fiber}g
                      </span>
                      <span className="macro-label">纤维</span>
                    </div>
                  </div>
                </div>
              </div>

              {dailyNutrition.grandSlamFoods.length > 0 && (
                <div className="grand-slam-summary">
                  <h3>👑 今日大满贯食物</h3>
                  <div className="grand-slam-tags">
                    {dailyNutrition.grandSlamFoods.map((food) => (
                      <span key={food} className="grand-slam-tag">
                        👑 {food}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {dailyNutrition.coveredSystems.length > 0 && (
                <div className="systems-summary">
                  <h3>🛡️ 已激活的防御系统</h3>
                  <div className="systems-tags">
                    {dailyNutrition.coveredSystems.map((sys) => (
                      <span key={sys} className="system-tag">
                        {DEFENSE_SYSTEMS[sys].icon}{" "}
                        {DEFENSE_SYSTEMS[sys].name}
                      </span>
                    ))}
                  </div>
                  <p className="systems-progress">
                    {dailyNutrition.coveredSystems.length}/5 个系统已覆盖
                  </p>
                </div>
              )}

              <div className="meals-list">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <h3 style={{ margin: 0 }}>🍽️ 今日餐次记录</h3>
                  <button
                    onClick={() => {
                      if (
                        window.confirm("确定要清除今日所有饮食记录吗？")
                      ) {
                        setMeals([]);
                      }
                    }}
                    style={{
                      padding: "6px 12px",
                      background: "#ff6b6b",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    🗑️ 清除今日记录
                  </button>
                </div>
                {Object.entries(MEAL_TYPES).map(([key, mealType]) => {
                  const typeMeals = meals.filter((m) => m.type === key);
                  if (typeMeals.length === 0) return null;
                  return (
                    <div key={key} className="meal-type-section">
                      <div className="meal-type-title">
                        <span>{mealType.icon}</span>
                        <span>{mealType.name}</span>
                      </div>
                      {typeMeals.map((meal) => (
                        <div key={meal.id} className="meal-item">
                          <span className="meal-time">{meal.time}</span>
                          <span className="meal-emoji">{meal.emoji}</span>
                          <div className="meal-details">
                            <span className="meal-name">{meal.recipe}</span>
                            <span className="meal-calories">
                              {meal.nutrition.calories} 千卡
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}

export default DailySummaryModal;
