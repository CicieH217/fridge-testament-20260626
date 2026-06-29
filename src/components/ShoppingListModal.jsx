import React, { useState, useEffect } from "react";
import { generateShoppingList, calculateDailyNutrition } from "../utils";

function ShoppingListModal({
  showShoppingList,
  setShowShoppingList,
  foods,
  healthProfile,
  healthGoal,
  meals,
}) {
  return (
    <>
      {showShoppingList && (
        <div
          className="meal-selector-overlay"
          onClick={() => setShowShoppingList(false)}
        >
          <div className="meal-selector" onClick={(e) => e.stopPropagation()}>
            <div className="meal-selector-header">
              <h2>🛒 智能购物清单</h2>
              <button
                className="modal-close"
                onClick={() => setShowShoppingList(false)}
              >
                ✕
              </button>
            </div>
            {(() => {
              const todayNutrition = calculateDailyNutrition(meals);
              const shoppingList = generateShoppingList(foods, healthProfile, healthGoal, todayNutrition);
              if (shoppingList.length === 0) {
                return (
                  <div className="shopping-empty">
                    <p>🎉 太棒了！您的冰箱已经很充足，无需购买额外食材</p>
                  </div>
                );
              }
              return (
                <div className="shopping-content">
                  <div className="shopping-summary">
                    共 {shoppingList.length} 项食材建议购买
                  </div>
                  <div className="shopping-list">
                    {shoppingList.map((item, idx) => (
                      <div
                        key={idx}
                        className={`shopping-item priority-${item.priority === "高" ? "high" : item.priority === "中" ? "medium" : "low"}`}
                      >
                        <span className="shopping-item-name">{item.name}</span>
                        <span className="shopping-item-reason">
                          {item.reason}
                        </span>
                        <span className="shopping-item-priority">
                          {item.priority === "高"
                            ? "🔴"
                            : item.priority === "中"
                              ? "🟡"
                              : "🟢"}{" "}
                          {item.priority}优先级
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
}

export default ShoppingListModal;
