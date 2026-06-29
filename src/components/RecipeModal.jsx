import React from "react";
import { getRecipeMetadata, INGREDIENT_ALIASES } from "../data";

function RecipeModal({
  matchedRecipes,
  closeRecipePanel,
  cookRecipe,
  isFavorite,
  toggleFavorite,
  foods,
}) {
  return (
    <div className="recipe-modal-overlay" onClick={closeRecipePanel}>
      <div className="recipe-modal" onClick={(e) => e.stopPropagation()}>
        <div className="recipe-modal-header">
          <h2>🍽️ 今天吃这些</h2>
          <button className="modal-close" onClick={closeRecipePanel}>
            ✕
          </button>
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
                const metadata = getRecipeMetadata(recipe.name);
                // 根据紧急程度决定边框颜色
                const borderClass = recipe.priority === "urgent" ? "urgent-recipe" :
                                   recipe.priority === "soon" ? "soon-recipe" : "";
                return (
                  <div
                    key={idx}
                    className={`recipe-item ${borderClass} ${recipe.alreadyCooked ? "already-cooked" : ""}`}
                  >
                    <div className="recipe-main">
                      <span className="recipe-emoji">{recipe.emoji}</span>
                      <div className="recipe-info">
                        <h3>
                          {recipe.name}
                          {recipe.hasGrandSlam && (
                            <span className="mini-crown" title="大满贯食材">👑</span>
                          )}
                          {recipe.priority === "urgent" && (
                            <span className="urgent-badge" title="包含3天内到期的食材">🚨 紧急</span>
                          )}
                          {recipe.priority === "soon" && (
                            <span className="soon-badge" title="包含3-7天到期的食材">⚠️ 注意</span>
                          )}
                          {recipe.alreadyCooked && (
                            <span className="cooked-badge">✓ 今天吃过</span>
                          )}
                          <button
                            className={`favorite-btn ${isFavorite(recipe.name) ? "favorited" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(recipe.name);
                            }}
                            title={
                              isFavorite(recipe.name) ? "取消收藏" : "收藏"
                            }
                          >
                            {isFavorite(recipe.name) ? "⭐" : "☆"}
                          </button>
                        </h3>
                        <p className="recipe-ingredients">
                          需要：{recipe.ingredients.join(" + ")}
                        </p>
                        <div className="recipe-meta">
                          <span className="recipe-difficulty">
                            {metadata.difficulty === "简单"
                              ? "🟢"
                              : metadata.difficulty === "中等"
                                ? "🟡"
                                : "🔴"}{" "}
                            {metadata.difficulty}
                          </span>
                          <span className="recipe-time">
                            ⏱️ {metadata.time}分钟
                          </span>
                          {recipe.totalCalories && (
                            <span className="recipe-calories">
                              🔥 {recipe.totalCalories}千卡
                            </span>
                          )}
                          {recipe.healthAdjustment && (
                            <span
                              className="recipe-health-adjustment"
                              title={
                                recipe.healthAdjustment === "reducing"
                                  ? "体重和体脂率都在上升，强烈建议低热量食物"
                                  : recipe.healthAdjustment === "controlling"
                                  ? "体重或体脂率上升，建议控制热量"
                                  : recipe.healthAdjustment === "excellent"
                                  ? "体重和体脂率都在下降，进展非常好"
                                  : recipe.healthAdjustment === "good"
                                  ? "体重或体脂率下降，保持良好"
                                  : ""
                              }
                            >
                              {recipe.healthAdjustment === "reducing"
                                ? "🔥 强烈减脂"
                                : recipe.healthAdjustment === "controlling"
                                ? "📈 控制热量"
                                : recipe.healthAdjustment === "excellent"
                                ? "⭐ 进展极佳"
                                : recipe.healthAdjustment === "good"
                                ? "👍 保持良好"
                                : ""}
                            </span>
                          )}
                          {recipe.matchesHealthGoal && (
                            <span className="recipe-health-goal" title="符合当前健康目标">
                              🎯 目标
                            </span>
                          )}
                        </div>
                        {recipe.health && (
                          <p className="recipe-health">
                            💪 {recipe.health}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      className="cook-btn"
                      onClick={() => cookRecipe(recipe)}
                    >
                      {recipe.alreadyCooked ? "再做一次" : "做这道菜"}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="recipe-footer">
              共 {matchedRecipes.recipes.length} 道菜可选
              {matchedRecipes.recipes.some((r) => r.alreadyCooked) && (
                <span className="cooked-hint">
                  （
                  {
                    matchedRecipes.recipes.filter((r) => r.alreadyCooked)
                      .length
                  }{" "}
                  道今天吃过）
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default RecipeModal;
