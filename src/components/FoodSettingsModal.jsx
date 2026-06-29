import React, { useState, useEffect } from "react";
import { formatQuantity, parseToGrams } from "../utils";

function FoodSettingsModal({
  showFoodSettings,
  pendingFoods,
  setPendingFoods,
  confirmAddFoods,
  cancelAddFoods,
}) {
  const [editedFoods, setEditedFoods] = useState(pendingFoods);
  const [inputValues, setInputValues] = useState({}); // 存储输入框的临时值
  const [showWarning, setShowWarning] = useState(""); // 警告信息
  // 当弹窗打开或 pendingFoods 变化时，更新 editedFoods
  useEffect(() => {
    if (showFoodSettings && pendingFoods.length > 0) {
      const foodsWithDays = pendingFoods.map(food => ({
        ...food,
        expiryDays: Math.ceil((new Date(food.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)),
      }));
      setEditedFoods(foodsWithDays);
      // 初始化输入值（默认为空）
      const initialValues = {};
      foodsWithDays.forEach((food, index) => {
        initialValues[index] = ""; // 默认为空
      });
      setInputValues(initialValues);
      setShowWarning("");
    }
  }, [showFoodSettings, pendingFoods]);

  const updateFood = (index, field, value) => {
    const newFoods = [...editedFoods];
    newFoods[index] = { ...newFoods[index], [field]: value };

    // 如果修改了重量，重新计算克数
    if (field === "quantity") {
      const food = newFoods[index];
      newFoods[index].grams = parseToGrams(value, food.name);
    }

    setEditedFoods(newFoods);
    setPendingFoods(newFoods);
  };

  const updateExpiryDays = (index, value) => {
    // 更新输入框显示值（允许为空字符串）
    const newInputValues = { ...inputValues, [index]: value };
    setInputValues(newInputValues);
    setShowWarning(""); // 清除警告

    // 更新数据（空值时暂时不更新 expiryDate，等提交时再处理）
    if (value !== "") {
      const days = parseInt(value) || 7;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);

      const newFoods = [...editedFoods];
      newFoods[index] = {
        ...newFoods[index],
        expiryDate: expiryDate.toISOString().split("T")[0],
        expiryDays: days,
      };
      setEditedFoods(newFoods);
      // 不调用 setPendingFoods，避免触发 useEffect 重置输入值
    }
  };

  // 确认添加食材
  const handleConfirm = () => {
    // 检查是否有空的保质期
    const emptyIndices = editedFoods
      .map((food, index) => inputValues[index] === "" || inputValues[index] === undefined ? index : -1)
      .filter(index => index !== -1);

    if (emptyIndices.length > 0) {
      setShowWarning("请填写所有食材的保质期");
      return;
    }

    // 提交前同步数据到 pendingFoods
    setPendingFoods(editedFoods);
    confirmAddFoods();
  };
  return (
    <>
      {showFoodSettings && (
        <div
          className="meal-selector-overlay"
          onClick={cancelAddFoods}
        >
          <div className="meal-selector" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="meal-selector-header">
              <h2>食材设置</h2>
              <button className="modal-close" onClick={cancelAddFoods}>
                ✕
              </button>
            </div>

            <div style={{ padding: "20px", maxHeight: "60vh", overflow: "auto" }}>
              {editedFoods.length === 0 ? (
                <p style={{ textAlign: "center", color: "#999" }}>没有食材</p>
              ) : (
                editedFoods.map((food, index) => (
                  <div key={food.id} className="food-setting-item" style={{
                    background: "#f5faf7",
                    padding: "16px",
                    borderRadius: "12px",
                    marginBottom: "12px",
                  }}>
                    <h3 style={{ margin: "0 0 12px", fontSize: "16px" }}>
                      {food.displayName || food.name}
                    </h3>

                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", fontSize: "13px", color: "#666", marginBottom: "4px" }}>
                        数量
                      </label>
                      <input
                        type="text"
                        value={food.quantity}
                        onChange={(e) => updateFood(index, "quantity", e.target.value)}
                        placeholder="例如：200g、3 个"
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: "6px",
                          border: "1px solid #ddd",
                          fontSize: "14px",
                        }}
                      />
                      <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
                        ≈ {formatQuantity(food.grams)}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "#666", marginBottom: "4px" }}>
                        保质期（天）
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={inputValues[index] !== undefined ? inputValues[index] : ""}
                        placeholder="请输入天数"
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          updateExpiryDays(index, value);
                        }}
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: "6px",
                          border: "1px solid #ddd",
                          fontSize: "14px",
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {showWarning && (
              <div style={{
                padding: "12px 20px",
                background: "#FFF4E6",
                color: "#E6833B",
                fontSize: "14px",
                textAlign: "center",
              }}>
                {showWarning}
              </div>
            )}

            <div style={{
              display: "flex",
              gap: "12px",
              padding: "16px 20px",
              borderTop: "1px solid #eee",
            }}>
              <button
                onClick={cancelAddFoods}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  background: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#2D7A4A",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                添加到冰箱
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FoodSettingsModal;
