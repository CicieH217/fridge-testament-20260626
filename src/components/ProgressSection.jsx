import React from "react";
import { DEFENSE_SYSTEMS, FOOD_HEALTH_DB } from "../data";

function ProgressSection({
  meals,
  showDefensePanel,
  setShowDefensePanel,
  show555Explanation,
  setShow555Explanation,
  flashCount,
  calculateDailyProgress,
}) {
  const progress = calculateDailyProgress();

  return (
    <div className="progress-section">
      <div
        className="progress-header"
        onClick={() => setShowDefensePanel(!showDefensePanel)}
      >
        <h3>🎯 今日 5×5×5 进度</h3>
        <div className="progress-header-right">
          <button
            className="explain-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShow555Explanation(true);
            }}
            title="什么是 5×5×5？"
          >
            ?
          </button>
          <span className="toggle-icon">{showDefensePanel ? "▼" : "▶"}</span>
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
        <div
          className="progress-fill"
          style={{ width: `${progress.progress}%` }}
        />
      </div>

      {showDefensePanel && (
        <div className="defense-systems-panel">
          {Object.entries(DEFENSE_SYSTEMS).map(([key, sys]) => {
            const isCovered = meals.some((meal) =>
              meal.ingredients.some((ing) => {
                const healthData = FOOD_HEALTH_DB[ing];
                return healthData?.systems?.includes(key);
              })
            );
            return (
              <div
                key={key}
                className={`defense-item ${isCovered ? "covered" : ""}`}
              >
                <span className="defense-icon">{sys.icon}</span>
                <span className="defense-name">{sys.name}</span>
                {isCovered && <span className="check-mark">✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProgressSection;
