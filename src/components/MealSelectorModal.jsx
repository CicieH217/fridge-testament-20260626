import React from "react";
import { MEAL_TYPES, INGREDIENT_ALIASES } from "../data";
import { calculateRecipeNutrition, formatQuantity } from "../utils";

function MealSelectorModal({
  showMealSelector,
  setShowMealSelector,
  showIngredientQuantity,
  setShowIngredientQuantity,
  ingredientQuantities,
  setIngredientQuantities,
  confirmMealType,
  confirmCook,
  foods,
}) {
  return (
    <>
      {/* 餐次选择弹窗 */}
      {showMealSelector && (
        <div
          className="meal-selector-overlay"
          onClick={() => setShowMealSelector(null)}
        >
          <div className="meal-selector" onClick={(e) => e.stopPropagation()}>
            <div className="meal-selector-header">
              <h2>🍽️ 这顿是什么餐？</h2>
              <button
                className="modal-close"
                onClick={() => setShowMealSelector(null)}
              >
                ✕
              </button>
            </div>
            <div className="meal-info">
              <span className="meal-recipe-emoji">
                {showMealSelector.emoji}
              </span>
              <div>
                <h3>{showMealSelector.name}</h3>
                <p className="meal-ingredients-preview">
                  {showMealSelector.ingredients.join(" + ")}
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
        <div
          className="meal-selector-overlay"
          onClick={() => setShowIngredientQuantity(null)}
        >
          <div className="meal-selector" onClick={(e) => e.stopPropagation()}>
            <div className="meal-selector-header">
              <h2>⚖️ 设置食材用量</h2>
              <button
                className="modal-close"
                onClick={() => setShowIngredientQuantity(null)}
              >
                ✕
              </button>
            </div>
            <div className="meal-info">
              <span className="meal-recipe-emoji">
                {showIngredientQuantity.emoji}
              </span>
              <div>
                <h3>{showIngredientQuantity.name}</h3>
                <p className="meal-ingredients-preview">
                  请设置每种食材的实际用量
                </p>
              </div>
            </div>
            <div className="ingredient-quantity-list">
              {showIngredientQuantity.ingredients.map((ing) => {
                const foodItem = foods.find((f) => {
                  if (f.name === ing) return true;
                  const aliases = INGREDIENT_ALIASES[ing];
                  return aliases && aliases.includes(f.name);
                });
                const available = foodItem ? foodItem.grams : 0;
                // 允许空字符串，只有当 key 不存在时才使用默认值 100
                const currentQuantity =
                  ing in ingredientQuantities
                    ? ingredientQuantities[ing] === ""
                      ? ""
                      : ingredientQuantities[ing]
                    : 100;

                return (
                  <div key={ing} className="ingredient-quantity-item">
                    <div className="ingredient-info">
                      <span className="ingredient-name">{ing}</span>
                      <span className="ingredient-available">
                        冰箱有：{formatQuantity(available)}
                      </span>
                    </div>
                    <div className="quantity-input-group">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={currentQuantity}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          setIngredientQuantities({
                            ...ingredientQuantities,
                            [ing]: value, // 允许空字符串
                          });
                        }}
                        placeholder="输入克数"
                        className="quantity-input"
                      />
                      <span className="quantity-unit">克</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="nutrition-preview">
              <h4>🔥 预计营养摄入</h4>
              {(() => {
                const nutrition = calculateRecipeNutrition(
                  showIngredientQuantity,
                  ingredientQuantities,
                );
                return (
                  <>
                    <div className="nutrition-values">
                      <span>{nutrition.calories} 千卡</span>
                      <span>蛋白质 {nutrition.protein}g</span>
                      <span>脂肪 {nutrition.fat}g</span>
                      <span>碳水 {nutrition.carbs}g</span>
                    </div>
                    <p className="nutrition-source">
                      📊 数据来源：USDA 美国农业部食物成分数据库 &
                      《中国食物成分表》
                    </p>
                  </>
                );
              })()}
            </div>
            {(() => {
              // 检查是否所有食材都有有效的用量
              const hasInvalidQuantity =
                showIngredientQuantity.ingredients.some((ing) => {
                  const qty = ingredientQuantities[ing];
                  return qty === undefined || qty === "" || parseInt(qty) === 0;
                });

              return (
                <>
                  {hasInvalidQuantity && (
                    <div
                      style={{
                        background: "#fff3cd",
                        color: "#856404",
                        padding: "10px",
                        borderRadius: "8px",
                        marginTop: "12px",
                        fontSize: "14px",
                        textAlign: "center",
                      }}
                    >
                      ⚠️ 请为所有食材输入用量（不能为 0 或空）
                    </div>
                  )}
                  <button
                    className="cook-btn"
                    onClick={confirmCook}
                    disabled={hasInvalidQuantity}
                    style={{
                      width: "100%",
                      marginTop: "16px",
                      opacity: hasInvalidQuantity ? 0.5 : 1,
                      cursor: hasInvalidQuantity ? "not-allowed" : "pointer",
                    }}
                  >
                    ✓ 确认做菜
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
}

export default MealSelectorModal;
