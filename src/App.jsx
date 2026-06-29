import React, { useState, useEffect, useCallback } from "react";
import {
  DEFENSE_SYSTEMS,
  NUTRITION_DB,
  DIET_PATTERNS,
  INGREDIENT_ALIASES,
  FOOD_HEALTH_DB,
  RECIPES,
  MEAL_TYPES,
  getRecipeMetadata,
} from "./data";
import {
  parseInput,
  parseToGrams,
  formatQuantity,
  getRemainingDays,
  getColorStatus,
  calculateBMI,
  getBMICategory,
  calculateTDEE,
  calculateDailyNutrition,
  calculateHealthScore,
  calculateHealthScoreForDay,
  calculatePersonalizedHealthScore,
  calculateIdealNutritionGoals,
  calculateRecipeNutrition,
  getNutrientDeficiencies,
  getWasteStats,
  getSeasonalRecommendations,
  getHealthGoalRecommendations,
} from "./utils";
import {
  ProgressSection,
  AnalyticsPanel,
  RecipeModal,
  DailySummaryModal,
  MealSelectorModal,
  ShoppingListModal,
  NotificationSettings,
  FamilyGroup,
  FoodSettingsModal,
} from "./components";
import { LoginModal } from "./components/auth/LoginModal";
import { RegisterModal } from "./components/auth/RegisterModal";
import { useAuth } from "./contexts/AuthContext";
import {
  subscribeToFoods,
  addFood as addFoodToFirestore,
  updateFood as updateFoodInFirestore,
  deleteFood as deleteFoodFromFirestore,
  getPersonalFridgeId,
  createPersonalFridge,
} from "./firebase/firestore";
import { setDoc, doc } from "firebase/firestore";
import { db } from "./firebase/config";
import { migrateLocalStorageToFirestore, getPersonalFridgeIdFromStorage } from "./services/migrationService";
import {
  checkExpiringFoods,
  scheduleDailyCheck,
  getNotificationSettings,
  getNotificationPermission,
} from "./services/notificationService";


function App() {
  const [foods, setFoods] = useState(() => {
    const saved = localStorage.getItem("fridge_foods");
    return saved ? JSON.parse(saved) : [];
  });
  const [inputText, setInputText] = useState("");
  const [matchedRecipes, setMatchedRecipes] = useState(null);
  const [flashCount, setFlashCount] = useState(0);
  const [showDefensePanel, setShowDefensePanel] = useState(false);
  const [show555Explanation, setShow555Explanation] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editExpiryDate, setEditExpiryDate] = useState("");
  const [meals, setMeals] = useState(() => {
    const saved = localStorage.getItem("fridge_meals");
    const today = new Date().toDateString();
    if (saved) {
      const parsed = JSON.parse(saved);
      // 只保留今天的数据
      return parsed.date === today ? parsed.meals : [];
    }
    return [];
  });
  const [showMealSelector, setShowMealSelector] = useState(null); // 正在选择餐次的菜谱
  const [showDailySummary, setShowDailySummary] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showIngredientQuantity, setShowIngredientQuantity] = useState(null); // 正在设置食材用量
  const [ingredientQuantities, setIngredientQuantities] = useState({}); // 自定义食材用量

  // 健康目标和饮食偏好
  const [healthGoal, setHealthGoal] = useState(() => {
    return localStorage.getItem("healthGoal") || "maintain";
  });
  const [dietaryPreferences, setDietaryPreferences] = useState(() => {
    const saved = localStorage.getItem("dietaryPreferences");
    return saved ? JSON.parse(saved) : [];
  });

  // 个人健康档案
  const [healthProfile, setHealthProfile] = useState(() => {
    const saved = localStorage.getItem("healthProfile");
    return saved
      ? JSON.parse(saved)
      : {
          height: 170, // cm
          weight: 65, // kg
          age: 30,
          gender: "male", // male/female
          activityLevel: "moderate", // sedentary/light/moderate/active/veryActive
          bodyFat: null, // 体脂率 (%)
          bodyFatHistory: [], // 体脂率历史记录 [{date, value}]
          weightHistory: [], // 体重历史记录 [{date, value}]
          showProfileSetup: false,
        };
  });

  // 收藏夹
  const [favoriteRecipes, setFavoriteRecipes] = useState(() => {
    const saved = localStorage.getItem("favoriteRecipes");
    return saved ? JSON.parse(saved) : [];
  });

  // 烹饪历史
  const [cookingHistory, setCookingHistory] = useState(() => {
    const saved = localStorage.getItem("cookingHistory");
    return saved ? JSON.parse(saved) : [];
  });

  // 显示购物清单
  const [showShoppingList, setShowShoppingList] = useState(false);

  // 显示收藏夹
  const [showFavorites, setShowFavorites] = useState(false);

  // 历史饮食数据（用于趋势分析）
  const [mealHistory, setMealHistory] = useState(() => {
    const saved = localStorage.getItem("mealHistory");
    return saved ? JSON.parse(saved) : [];
  });

  // 营养目标
  const [nutritionGoals, setNutritionGoals] = useState(() => {
    const saved = localStorage.getItem("nutritionGoals");
    return saved
      ? JSON.parse(saved)
      : {
          calories: 2000,
          protein: 60,
          fat: 65,
          carbs: 250,
          fiber: 25,
        };
  });

  // Auth state
  const { user, loading: authLoading, login, register, logout, isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [fridgeId, setFridgeId] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState(null); // null | 'migrating' | 'done'

  // Notification state
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  // Family sharing state
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [familyFridgeId, setFamilyFridgeId] = useState(null); // currently viewed family fridge
  const [familyFridgeName, setFamilyFridgeName] = useState(null);
  const [familyFoods, setFamilyFoods] = useState([]); // foods from family fridge
  const [personalFoods, setPersonalFoods] = useState([]); // backup of personal fridge foods
  const [viewingFamilyFridge, setViewingFamilyFridge] = useState(false);

  // Switch to family fridge view
  const handleSelectFamilyFridge = (fId, fName) => {
    setPersonalFoods(foods); // backup current foods
    setFamilyFridgeId(fId);
    setFamilyFridgeName(fName);
    setViewingFamilyFridge(true);
    setShowFamilyModal(false);

    // Subscribe to family fridge foods
    const unsubscribe = subscribeToFoods(fId, (cloudFoods) => {
      setFamilyFoods(cloudFoods);
      setFoods(cloudFoods);
    });
    // Store unsubscribe for later
    window._familyFridgeUnsubscribe = unsubscribe;
  };

  // Switch back to personal fridge
  const handleBackToPersonal = () => {
    if (window._familyFridgeUnsubscribe) {
      window._familyFridgeUnsubscribe();
      window._familyFridgeUnsubscribe = null;
    }
    setViewingFamilyFridge(false);
    setFamilyFridgeId(null);
    setFamilyFridgeName(null);
    setFoods(personalFoods);
  };

  // Check notifications when foods change
  useEffect(() => {
    if (foods.length > 0 && getNotificationPermission() === "granted") {
      const settings = getNotificationSettings();
      if (settings.enabled) {
        checkExpiringFoods(foods);
      }
    }
  }, [foods]);

  // Schedule daily notification check
  useEffect(() => {
    scheduleDailyCheck(() => foods);
  }, []);

  // Auth event listeners for login/register modals
  useEffect(() => {
    const handleLogin = async (e) => {
      try {
        await login(e.detail.email, e.detail.password);
        setShowLoginModal(false);
      } catch (err) {
        console.error("Login error:", err);
      }
    };
    const handleRegister = async (e) => {
      try {
        await register(e.detail.email, e.detail.password, e.detail.displayName);
        setShowRegisterModal(false);
      } catch (err) {
        console.error("Register error:", err);
      }
    };
    window.addEventListener("fridge-login", handleLogin);
    window.addEventListener("fridge-register", handleRegister);
    return () => {
      window.removeEventListener("fridge-login", handleLogin);
      window.removeEventListener("fridge-register", handleRegister);
    };
  }, []);

  // Setup Firestore sync when user logs in
  useEffect(() => {
    if (!user) {
      setFridgeId(null);
      return;
    }

    const setupSync = async () => {
      setSyncing(true);
      try {
        // Check if migration is needed
        let pFridgeId = getPersonalFridgeIdFromStorage();
        if (!pFridgeId) {
          pFridgeId = await getPersonalFridgeId(user.uid);
        }
        if (!pFridgeId) {
          pFridgeId = await createPersonalFridge(user.uid);
        }

        // Migrate localStorage data if needed
        if (localStorage.getItem("migration_completed") !== "true") {
          setMigrationStatus("migrating");
          await migrateLocalStorageToFirestore(user.uid);
          setMigrationStatus("done");
          setTimeout(() => setMigrationStatus(null), 3000);
        }

        setFridgeId(pFridgeId);

        // Subscribe to real-time food updates
        const unsubscribe = subscribeToFoods(pFridgeId, (cloudFoods) => {
          setFoods(cloudFoods);
          localStorage.setItem("fridge_foods", JSON.stringify(cloudFoods));
        });

        setSyncing(false);
        return () => unsubscribe();
      } catch (err) {
        console.error("Sync setup error:", err);
        setSyncing(false);
      }
    };

    setupSync();
  }, [user]);

  // Save user data to Firestore when it changes
  useEffect(() => {
    if (!user || !fridgeId) return;

    const saveUserData = async () => {
      try {
        await setDoc(doc(db, "users", user.uid, "data", "healthGoal"), {
          value: healthGoal, updatedAt: new Date().toISOString() });
        await setDoc(doc(db, "users", user.uid, "data", "dietaryPreferences"), {
          value: dietaryPreferences, updatedAt: new Date().toISOString() });
        await setDoc(doc(db, "users", user.uid, "data", "healthProfile"), {
          value: healthProfile, updatedAt: new Date().toISOString() });
        await setDoc(doc(db, "users", user.uid, "data", "favoriteRecipes"), {
          value: favoriteRecipes, updatedAt: new Date().toISOString() });
        await setDoc(doc(db, "users", user.uid, "data", "cookingHistory"), {
          value: cookingHistory, updatedAt: new Date().toISOString() });
        await setDoc(doc(db, "users", user.uid, "data", "mealHistory"), {
          value: mealHistory, updatedAt: new Date().toISOString() });
        await setDoc(doc(db, "users", user.uid, "data", "nutritionGoals"), {
          value: nutritionGoals, updatedAt: new Date().toISOString() });
      } catch (err) {
        console.error("Save user data error:", err);
      }
    };
    saveUserData();
  }, [user, fridgeId, healthGoal, dietaryPreferences, healthProfile, favoriteRecipes, cookingHistory, mealHistory, nutritionGoals]);

  // Sync food changes to Firestore
  const syncFoodToFirestore = useCallback(async (action, foodData, foodId) => {
    if (!user || !fridgeId) return;
    try {
      if (action === "add") {
        await addFoodToFirestore(fridgeId, foodData, user.uid);
      } else if (action === "update") {
        await updateFoodInFirestore(fridgeId, foodId, foodData);
      } else if (action === "delete") {
        await deleteFoodFromFirestore(fridgeId, foodId);
      }
    } catch (err) {
      console.error("Food sync error:", err);
    }
  }, [user, fridgeId]);

  const startEditing = (food) => {
    setEditingFood(food.id);
    setEditQuantity(food.quantity || formatQuantity(food.grams));
    setEditExpiryDate(food.expiryDate);
  };

  const saveEdit = (id) => {
    updateFood(id, {
      quantity: editQuantity,
      expiryDate: editExpiryDate,
    });
    setEditingFood(null);
  };

  useEffect(() => {
    localStorage.setItem("fridge_foods", JSON.stringify(foods));
  }, [foods]);

  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem(
      "fridge_meals",
      JSON.stringify({ date: today, meals }),
    );

    // 记录到历史数据
    if (meals.length > 0) {
      const todayData = {
        date: new Date().toISOString().split("T")[0],
        nutrition: calculateDailyNutrition(meals),
        mealCount: meals.length,
      };

      setMealHistory((prev) => {
        const filtered = prev.filter((m) => m.date !== todayData.date);
        const updated = [...filtered, todayData].slice(-30); // 只保留最近30天
        localStorage.setItem("mealHistory", JSON.stringify(updated));
        return updated;
      });
    }
  }, [meals]);

  useEffect(() => {
    localStorage.setItem("healthGoal", healthGoal);
  }, [healthGoal]);

  useEffect(() => {
    localStorage.setItem(
      "dietaryPreferences",
      JSON.stringify(dietaryPreferences),
    );
  }, [dietaryPreferences]);

  useEffect(() => {
    localStorage.setItem("nutritionGoals", JSON.stringify(nutritionGoals));
  }, [nutritionGoals]);

  useEffect(() => {
    localStorage.setItem("healthProfile", JSON.stringify(healthProfile));
  }, [healthProfile]);

  useEffect(() => {
    localStorage.setItem("favoriteRecipes", JSON.stringify(favoriteRecipes));
  }, [favoriteRecipes]);

  useEffect(() => {
    localStorage.setItem("cookingHistory", JSON.stringify(cookingHistory));
  }, [cookingHistory]);

  useEffect(() => {
    const urgentFoods = foods.filter(
      (f) => getRemainingDays(f.expiryDate) === 0,
    );
    if (urgentFoods.length > 0 && flashCount < 5) {
      const timer = setTimeout(() => setFlashCount(flashCount + 1), 500);
      return () => clearTimeout(timer);
    }
  }, [foods, flashCount]);




  const [pendingFoods, setPendingFoods] = useState([]); // 待确认的食材
  const [showFoodSettings, setShowFoodSettings] = useState(false); // 显示食材设置弹窗

  const addFoods = () => {
    if (!inputText.trim()) return;
    const newFoods = parseInput(inputText);
    // 打开设置弹窗，让用户确认重量和保质期
    setPendingFoods(newFoods);
    setShowFoodSettings(true);
    setInputText("");
  };

  // 确认添加食材
  const confirmAddFoods = () => {
    setFoods([...pendingFoods, ...foods]);
    // Sync to Firestore
    if (user && fridgeId) {
      pendingFoods.forEach((food) => syncFoodToFirestore("add", food));
    }
    setPendingFoods([]);
    setShowFoodSettings(false);
  };

  // 取消添加食材
  const cancelAddFoods = () => {
    setPendingFoods([]);
    setShowFoodSettings(false);
  };

  const deleteFood = (id) => {
    setFoods(foods.filter((f) => f.id !== id));
    // Sync to Firestore
    if (user && fridgeId) {
      syncFoodToFirestore("delete", null, String(id));
    }
  };

  const updateFood = (id, updates) => {
    setFoods(
      foods.map((f) => {
        if (f.id === id) {
          const updated = { ...f, ...updates };
          if (updates.quantity) {
            updated.grams = parseToGrams(updates.quantity, f.name);
          }
          return updated;
        }
        return f;
      }),
    );
    // Sync to Firestore
    if (user && fridgeId) {
      syncFoodToFirestore("update", updates, String(id));
    }
  };

  const calculateDailyProgress = () => {
    // 基于今天吃过的餐次（meals），而不是冰箱全部食材
    // 每天0点 meals 会自动清零，所以 5×5×5 进度也会重新计算
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

  // 通用趋势分析函数
  const getHealthTrend = (history, threshold = 0.5) => {
    if (!history || history.length < 2) {
      return { trend: "insufficient", change: 0, latest: null, previous: null };
    }

    const sorted = [...history].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    const latest = sorted[0].value;
    const previous = sorted[1].value;
    const change = latest - previous;

    let trend;
    if (Math.abs(change) < threshold) {
      trend = "stable";
    } else if (change > 0) {
      trend = "increasing";
    } else {
      trend = "decreasing";
    }

    return { trend, change, latest, previous, latestDate: sorted[0].date, previousDate: sorted[1].date };
  };

  // 分析体脂率趋势
  const getBodyFatTrend = () => {
    return getHealthTrend(healthProfile.bodyFatHistory, 0.5);
  };

  // 分析体重趋势
  const getWeightTrend = () => {
    return getHealthTrend(healthProfile.weightHistory, 0.5);
  };

  const findAllPossibleRecipes = () => {
    const available = [];

    // 获取今天已经做过的菜谱
    const cookedRecipeNames = new Set(meals.map((m) => m.recipe));

    RECIPES.forEach((recipe) => {
      // 检查食材匹配
      const matchedIngredients = [];
      const missingIngredients = [];

      recipe.ingredients.forEach((requiredIng) => {
        const found = foods.some((f) => {
          // 直接匹配
          if (f.name === requiredIng) return f.grams >= 20;

          // 检查别名匹配
          const aliases = INGREDIENT_ALIASES[requiredIng];
          if (aliases && aliases.includes(f.name)) return f.grams >= 20;

          // 扩大匹配：包含关系（如"希腊酸奶"包含"酸奶"）
          if (f.name.includes(requiredIng) || requiredIng.includes(f.name)) {
            return f.grams >= 20;
          }

          return false;
        });

        if (found) {
          matchedIngredients.push(requiredIng);
        } else {
          missingIngredients.push(requiredIng);
        }
      });

      // 只显示用户冰箱里有食材的菜谱
      // 必须匹配所有食材，或者只缺调味料（大蒜、洋葱等）
      const seasonings = ["大蒜", "蒜", "蒜头", "蒜瓣", "洋葱", "葱", "姜"];
      const missingNonSeasoning = missingIngredients.filter(
        ing => !seasonings.some(s => ing.includes(s) || s.includes(ing))
      );

      const canMake = missingNonSeasoning.length === 0;

      if (canMake) {
        let priority = "normal";
        let expiringCount = 0;
        let grandSlamCount = 0;
        let totalCalories = 0;
        const matchRatio = matchedIngredients.length / recipe.ingredients.length;

        matchedIngredients.forEach((ing) => {
          const foodItem = foods.find((f) => {
            if (f.name === ing) return true;
            const aliases = INGREDIENT_ALIASES[ing];
            if (aliases && aliases.includes(f.name)) return true;
            return f.name.includes(ing) || ing.includes(f.name);
          });
          if (foodItem) {
            const days = getRemainingDays(foodItem.expiryDate);
            if (days <= 3) {
              priority = "urgent";
              expiringCount++;
            } else if (days <= 7 && priority !== "urgent") {
              priority = "soon";
              expiringCount++;
            }

            if (foodItem.healthData?.grandSlam) {
              grandSlamCount++;
            }

            const nutrition = NUTRITION_DB[ing];
            if (nutrition) {
              totalCalories += (nutrition.calories * foodItem.grams) / 100;
            }
          }
        });

        const hasGrandSlam = grandSlamCount > 0;

        // 获取体脂率和体重趋势
        const bodyFatTrend = getBodyFatTrend();
        const weightTrend = getWeightTrend();

        // 计算推荐分数（越高越优先）
        let score = 0;

        // 优先级1：临期食材（最高优先级）
        // 紧急程度加分（权重最大）- 按新的颜色系统
        if (priority === "urgent") score += 500; // 3天内红色
        else if (priority === "soon") score += 300; // 3-7天橙色
        // 临期食材数量加分
        score += expiringCount * 50;

        // 优先级2：大满贯食材（用皇冠标注，不影响边框颜色）
        score += grandSlamCount * 30;

        // 优先级3：根据饮食模式偏好调整
        let dietMatchBonus = 0;
        if (dietaryPreferences.length > 0) {
          // 检查这道菜是否符合用户的饮食偏好
          const recipeIngredients = recipe.ingredients;
          dietaryPreferences.forEach((prefKey) => {
            const dietPattern = DIET_PATTERNS[prefKey];
            if (dietPattern) {
              // 计算菜谱食材与饮食模式的匹配度
              const matchingIngredients = recipeIngredients.filter(ing =>
                dietPattern.keyFoods.some(food =>
                  ing.includes(food) || food.includes(ing)
                )
              );
              if (matchingIngredients.length > 0) {
                // 匹配的食材越多，加分越高
                dietMatchBonus += matchingIngredients.length * 20;
              }
            }
          });
        }
        score += dietMatchBonus;

        // 优先级4：根据体脂率和体重趋势调整
        // 综合两个指标，如果都在上升，减脂优先；如果都在下降，保持良好
        let healthAdjustment = null;
        const increasingCount = [bodyFatTrend.trend, weightTrend.trend].filter(t => t === "increasing").length;
        const decreasingCount = [bodyFatTrend.trend, weightTrend.trend].filter(t => t === "decreasing").length;

        if (increasingCount >= 2) {
          // 两个指标都在上升，强烈建议减脂
          // 每 100 卡路里扣 3 分
          score -= (totalCalories / 100) * 3;
          healthAdjustment = "reducing";
        } else if (increasingCount === 1) {
          // 一个指标上升，建议控制热量
          // 每 100 卡路里扣 2 分
          score -= (totalCalories / 100) * 2;
          healthAdjustment = "controlling";
        } else if (decreasingCount >= 2) {
          // 两个指标都在下降，进展良好
          // 每 100 卡路里加 1 分（鼓励适量饮食）
          score += (totalCalories / 100) * 1;
          healthAdjustment = "excellent";
        } else if (decreasingCount === 1) {
          // 一个指标下降，适度鼓励
          // 每 100 卡路里加 0.5 分
          score += (totalCalories / 100) * 0.5;
          healthAdjustment = "good";
        }
        // stable 或 insufficient 趋势不调整

        // 优先级4：根据活动水平和今日已摄入热量调整
        // 计算用户的 TDEE（基于活动水平）
        const tdee = calculateTDEE(healthProfile);
        const todayNutrition = calculateDailyNutrition(meals);
        const remainingCalories = tdee - todayNutrition.calories;

        // 根据剩余热量需求调整分数
        if (remainingCalories > 0) {
          // 还有热量预算
          const calorieRatio = totalCalories / remainingCalories;
          if (calorieRatio <= 0.3) {
            // 适合当前餐次的热量（约占剩余的 30%）
            score += 30;
          } else if (calorieRatio <= 0.5) {
            // 稍微多一点，但可以接受
            score += 15;
          } else if (calorieRatio > 1) {
            // 超出剩余预算，扣分
            score -= 20;
          }
        } else {
          // 已经超标，低热量优先
          score -= (totalCalories / 100) * 1.5;
        }

        // 标记是否今天已经做过
        const alreadyCooked = cookedRecipeNames.has(recipe.name);

        available.push({
          ...recipe,
          priority,
          hasGrandSlam,
          alreadyCooked,
          score,
          expiringCount,
          grandSlamCount,
          totalCalories: Math.round(totalCalories),
          healthAdjustment,
          matchesHealthGoal: true,
          matchedIngredients, // 添加匹配的食材列表用于分组
        });
      }
    });

    // 去重：合并只有调味料差异的菜
    const seasonings = ["大蒜", "蒜", "蒜头", "蒜瓣", "洋葱", "葱", "姜", "辣椒", "胡椒", "盐"];
    const uniqueRecipes = [];
    const seen = new Set();

    available.forEach((recipe) => {
      // 提取主要食材（去掉调味料）
      const mainIngredients = recipe.ingredients
        .filter(ing => !seasonings.some(s => ing.includes(s) || s.includes(ing)))
        .sort()
        .join(",");

      if (!seen.has(mainIngredients)) {
        seen.add(mainIngredients);
        uniqueRecipes.push(recipe);
      } else {
        // 如果已经见过这个主要食材组合，比较分数，保留分数高的
        const existing = uniqueRecipes.find(r => {
          const rMain = r.ingredients
            .filter(ing => !seasonings.some(s => ing.includes(s) || s.includes(ing)))
            .sort()
            .join(",");
          return rMain === mainIngredients;
        });
        if (existing && recipe.score > existing.score) {
          const index = uniqueRecipes.indexOf(existing);
          uniqueRecipes[index] = recipe;
        }
      }
    });

    // 排序逻辑：
    // 1. 优先显示没做过的菜
    // 2. 按临期紧急程度排序（urgent > soon > normal）
    // 3. 按用户冰箱里的食材分组（包含用户食材的菜靠近显示）
    // 4. 同组内按分数排序

    const getMainIngredients = (ingredients) =>
      ingredients.filter(ing => !seasonings.some(s => ing.includes(s) || s.includes(ing)));

    uniqueRecipes.sort((a, b) => {
      // 先按是否做过排序
      if (a.alreadyCooked !== b.alreadyCooked) {
        return a.alreadyCooked ? 1 : -1;
      }

      // 按紧急程度排序
      const priorityOrder = { urgent: 3, soon: 2, normal: 1 };
      const aPriority = priorityOrder[a.priority] || 1;
      const bPriority = priorityOrder[b.priority] || 1;
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      // 按用户冰箱里的食材分组
      // 找到每道菜的第一个用户食材（按用户添加的顺序）
      const aUserIng = a.ingredients.find(ing =>
        foods.some(f => f.name === ing || (INGREDIENT_ALIASES[ing] && INGREDIENT_ALIASES[ing].includes(f.name)))
      ) || "";
      const bUserIng = b.ingredients.find(ing =>
        foods.some(f => f.name === ing || (INGREDIENT_ALIASES[ing] && INGREDIENT_ALIASES[ing].includes(f.name)))
      ) || "";

      if (aUserIng !== bUserIng) {
        return aUserIng.localeCompare(bUserIng); // 按用户食材排序分组
      }

      // 同组内按分数排序
      return b.score - a.score;
    });

    return uniqueRecipes;
  };

  const openRecipePanel = () => {
    if (foods.length === 0) {
      setMatchedRecipes({ empty: true });
      return;
    }
    const recipes = findAllPossibleRecipes();
    setMatchedRecipes({ recipes });
  };


  // 点击"做这道菜"时，先选择餐次
  const cookRecipe = (recipe) => {
    setShowMealSelector(recipe);
  };

  // 确认餐次后，显示食材用量设置
  const confirmMealType = (mealType) => {
    const recipe = showMealSelector;
    // 初始化默认用量（从冰箱中查找当前食材的用量）
    const initialQuantities = {};
    recipe.ingredients.forEach((ing) => {
      const foodItem = foods.find((f) => {
        if (f.name === ing) return true;
        const aliases = INGREDIENT_ALIASES[ing];
        return aliases && aliases.includes(f.name);
      });
      // 默认使用 100g 或冰箱中现有的量（取较小值）
      initialQuantities[ing] = foodItem ? Math.min(foodItem.grams, 100) : 100;
    });
    setIngredientQuantities(initialQuantities);
    // 创建包含 selectedMealType 的新菜谱对象
    const recipeWithMealType = { ...recipe, selectedMealType: mealType };
    setShowIngredientQuantity(recipeWithMealType);
    setShowMealSelector(null); // 关闭餐次选择
  };

  // 确认用量后，真正做菜
  const confirmCook = () => {
    const recipe = showIngredientQuantity;
    const mealType = recipe.selectedMealType;
    const newFoods = [...foods];

    // 消耗食材（考虑别名和自定义用量）
    recipe.ingredients.forEach((requiredIng) => {
      const gramsToUse = parseInt(ingredientQuantities[requiredIng]) || 100;
      const idx = newFoods.findIndex((f) => {
        if (f.name === requiredIng) return true;
        const aliases = INGREDIENT_ALIASES[requiredIng];
        return aliases && aliases.includes(f.name);
      });
      if (idx !== -1) {
        if (newFoods[idx].grams <= gramsToUse) {
          newFoods.splice(idx, 1);
        } else {
          newFoods[idx] = {
            ...newFoods[idx],
            grams: newFoods[idx].grams - gramsToUse,
            quantity: formatQuantity(newFoods[idx].grams - gramsToUse),
          };
        }
      }
    });

    setFoods(newFoods);

    // 记录这顿饭（使用自定义用量计算营养）
    const nutrition = calculateRecipeNutrition(recipe, ingredientQuantities);
    const newMeal = {
      id: Date.now(),
      type: mealType,
      recipe: recipe.name,
      emoji: recipe.emoji,
      ingredients: recipe.ingredients,
      ingredientQuantities: { ...ingredientQuantities }, // 记录实际用量
      nutrition,
      time: new Date().toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      health: recipe.health,
    };
    // 使用函数式更新，确保获取最新的 meals 状态
    setMeals((prevMeals) => [...prevMeals, newMeal]);

    // 添加到烹饪历史
    addToCookingHistory(recipe.name);

    // 更新菜谱列表
    const updatedRecipes = findAllPossibleRecipes();
    setMatchedRecipes({ recipes: updatedRecipes, justCooked: recipe.name });
    setShowIngredientQuantity(null);
    setIngredientQuantities({});

    setTimeout(() => {
      setMatchedRecipes((prev) =>
        prev ? { ...prev, justCooked: null } : null,
      );
    }, 2000);
  };




  // 切换收藏状态
  const toggleFavorite = (recipeName) => {
    setFavoriteRecipes((prev) => {
      if (prev.includes(recipeName)) {
        return prev.filter((name) => name !== recipeName);
      } else {
        return [...prev, recipeName];
      }
    });
  };

  // 检查是否已收藏
  const isFavorite = (recipeName) => {
    return favoriteRecipes.includes(recipeName);
  };

  // 添加到烹饪历史
  const addToCookingHistory = (recipeName) => {
    const today = new Date().toISOString().split("T")[0];
    setCookingHistory((prev) => {
      const existing = prev.find(
        (item) => item.date === today && item.recipe === recipeName,
      );
      if (existing) {
        return prev.map((item) =>
          item.date === today && item.recipe === recipeName
            ? { ...item, count: item.count + 1 }
            : item,
        );
      } else {
        return [...prev, { date: today, recipe: recipeName, count: 1 }];
      }
    });
  };


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





  const closeRecipePanel = () => setMatchedRecipes(null);

  const sortedFoods = [...foods].sort(
    (a, b) => getRemainingDays(a.expiryDate) - getRemainingDays(b.expiryDate),
  );

  const progress = calculateDailyProgress();

  // 获取大满贯食物列表
  const grandSlamFoods = Object.entries(FOOD_HEALTH_DB)
    .filter(([_, data]) => data.grandSlam)
    .map(([name, data]) => ({ name, systems: data.systems }));

  return (
    <div className="app">
      <header className="header">
        <h1>🧊 冰箱遗书</h1>
        <p className="slogan">别让番茄死得不明不白</p>
        <div className="auth-section">
          {authLoading ? (
            <span style={{ fontSize: "14px", color: "#999" }}>加载中...</span>
          ) : user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {syncing && <span style={{ fontSize: "12px", color: "#3498DB" }}>🔄 同步中...</span>}
              {migrationStatus === "migrating" && <span style={{ fontSize: "12px", color: "#E6833B" }}>📦 迁移数据中...</span>}
              {migrationStatus === "done" && <span style={{ fontSize: "12px", color: "#2D7A4A" }}>✅ 迁移完成!</span>}
              <span style={{ fontSize: "14px", color: "#666" }}>👋 {user.displayName || user.email}</span>
              {isAuthenticated && <span style={{ fontSize: "12px", color: "#2D7A4A" }}>☁️ 云同步</span>}
              <button
                onClick={logout}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                退出
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: "#3498DB",
                color: "#fff",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              🔐 登录 / 注册
            </button>
          )}
          {/* Notification button */}
          <button
            onClick={() => setShowNotificationSettings(true)}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid #ddd",
              background: getNotificationPermission() === "granted" ? "#F5FAF7" : "#fff",
              cursor: "pointer",
              fontSize: "16px",
              marginLeft: "8px",
            }}
            title="通知设置"
          >
            🔔
          </button>
          {/* Family sharing button (only when logged in) */}
          {user && (
            <button
              onClick={viewingFamilyFridge ? handleBackToPersonal : () => setShowFamilyModal(true)}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                background: viewingFamilyFridge ? "#FFF4E6" : "#fff",
                cursor: "pointer",
                fontSize: "16px",
                marginLeft: "4px",
              }}
              title={viewingFamilyFridge ? `返回个人冰箱` : "家庭共享"}
            >
              {viewingFamilyFridge ? `🏠 ${familyFridgeName}` : "👨‍👩‍👧‍👦"}
            </button>
          )}
        </div>
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      )}

      {/* Notification Settings Modal */}
      {showNotificationSettings && (
        <NotificationSettings
          foods={foods}
          onClose={() => setShowNotificationSettings(false)}
        />
      )}

      {/* Family Group Modal */}
      {showFamilyModal && (
        <FamilyGroup
          onClose={() => setShowFamilyModal(false)}
          onSelectFamilyFridge={handleSelectFamilyFridge}
        />
      )}

      {/* 5×5×5 进度面板 */}
      <ProgressSection
        meals={meals}
        showDefensePanel={showDefensePanel}
        setShowDefensePanel={setShowDefensePanel}
        show555Explanation={show555Explanation}
        setShow555Explanation={setShow555Explanation}
        flashCount={flashCount}
        calculateDailyProgress={calculateDailyProgress}
      />

      {/* 数据分析面板 */}
      <AnalyticsPanel
        meals={meals}
        healthProfile={healthProfile}
        setHealthProfile={setHealthProfile}
        healthGoal={healthGoal}
        setHealthGoal={setHealthGoal}
        mealHistory={mealHistory}
        nutritionGoals={nutritionGoals}
        foods={foods}
        dietaryPreferences={dietaryPreferences}
        setDietaryPreferences={setDietaryPreferences}
        setShowShoppingList={setShowShoppingList}
      />

      {/* 录入区域 */}
      <div className="input-section">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addFoods()}
          placeholder="例如：蓝莓 200g、鸡蛋 3 个、牛奶 500ml（支持单位✨）"
          className="input-field"
        />
        <button onClick={addFoods} className="add-btn">
          添加
        </button>
      </div>

      {/* 食材卡片列表 */}
      <div className="food-list">
        {sortedFoods.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>冰箱空空如也，去买点菜吧</p>
            <p className="empty-hint">
              试试添加：蓝莓 200g、蘑菇 150g、绿茶 1 杯
            </p>
          </div>
        ) : (
          sortedFoods.map((food) => {
            const remainingDays = getRemainingDays(food.expiryDate);
            const status = getColorStatus(remainingDays);
            const isFlashing =
              status.flash && flashCount < 5 && flashCount % 2 === 0;
            const isGrandSlam = food.healthData?.grandSlam;
            const isEditing = editingFood === food.id;

            return (
              <div
                key={food.id}
                className={`food-card ${isFlashing ? "flash" : ""} ${isGrandSlam ? "grand-slam" : ""}`}
                style={{
                  borderLeftColor: status.color,
                  backgroundColor: status.bgColor,
                  borderColor: status.borderColor,
                }}
              >
                {isEditing ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(e.target.value)}
                      placeholder="数量（如：200g、3 个）"
                      autoFocus
                    />
                    <input
                      type="date"
                      value={editExpiryDate}
                      onChange={(e) => setEditExpiryDate(e.target.value)}
                    />
                    <button onClick={() => saveEdit(food.id)}>✓ 保存</button>
                    <button
                      onClick={() => setEditingFood(null)}
                      className="cancel-btn"
                    >
                      ✕ 取消
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="card-content">
                      <div className="food-info">
                        <h3 className="food-name">
                          {food.displayName || food.name}
                          {isGrandSlam && (
                            <span
                              className="grand-slam-badge"
                              title="大满贯食物"
                            >
                              👑
                            </span>
                          )}
                        </h3>
                        <span className="food-quantity">
                          {food.quantity || formatQuantity(food.grams)}
                        </span>
                      </div>
                      <div className="expiry-info">
                        {status.label && (
                          <span className="status-label">{status.label}</span>
                        )}
                        <span
                          className="remaining-days"
                          style={{ color: status.color }}
                        >
                          {remainingDays > 0
                            ? `还剩 ${remainingDays} 天`
                            : remainingDays === 0
                              ? "今天到期"
                              : `已过期 ${Math.abs(remainingDays)} 天`}
                        </span>
                        {remainingDays <= 7 && remainingDays > 0 && (
                          <span className="expiry-warning" style={{ color: status.color }}>
                            {remainingDays <= 3 ? "🚨" : "️"}
                          </span>
                        )}
                      </div>
                    </div>

                    {food.healthData?.systems &&
                      food.healthData.systems.length > 0 && (
                        <div className="health-tags">
                          {food.healthData.systems.map((sysKey) => (
                            <span
                              key={sysKey}
                              className="health-tag"
                              title={DEFENSE_SYSTEMS[sysKey].name}
                            >
                              {DEFENSE_SYSTEMS[sysKey].icon}
                            </span>
                          ))}
                        </div>
                      )}

                    <div className="card-actions">
                      <button
                        onClick={() => startEditing(food)}
                        className="edit-btn"
                        title="编辑"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteFood(food.id)}
                        className="delete-btn"
                        title="删除"
                      >
                        ✕
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 菜谱选择面板 */}
      {matchedRecipes && (
        <RecipeModal
          matchedRecipes={matchedRecipes}
          closeRecipePanel={closeRecipePanel}
          cookRecipe={cookRecipe}
          isFavorite={isFavorite}
          toggleFavorite={toggleFavorite}
          foods={foods}
        />
      )}

      {/* 购物清单弹窗 */}
      <ShoppingListModal
        showShoppingList={showShoppingList}
        setShowShoppingList={setShowShoppingList}
        foods={foods}
        healthProfile={healthProfile}
        healthGoal={healthGoal}
        meals={meals}
      />

      {/* 食材设置弹窗 */}
      <FoodSettingsModal
        showFoodSettings={showFoodSettings}
        pendingFoods={pendingFoods}
        setPendingFoods={setPendingFoods}
        confirmAddFoods={confirmAddFoods}
        cancelAddFoods={cancelAddFoods}
      />

      {/* 餐次选择和食材用量设置弹窗 */}
      <MealSelectorModal
        showMealSelector={showMealSelector}
        setShowMealSelector={setShowMealSelector}
        showIngredientQuantity={showIngredientQuantity}
        setShowIngredientQuantity={setShowIngredientQuantity}
        ingredientQuantities={ingredientQuantities}
        setIngredientQuantities={setIngredientQuantities}
        confirmMealType={confirmMealType}
        confirmCook={confirmCook}
        foods={foods}
      />

      {/* 今日饮食汇总按钮 */}
      {meals.length > 0 && (
        <button
          className="daily-summary-btn"
          onClick={() => setShowDailySummary(true)}
        >
          📊 今日已吃 {meals.length} 餐
        </button>
      )}

      {/* 今日饮食汇总弹窗 */}
      {showDailySummary && (
        <DailySummaryModal
          showDailySummary={showDailySummary}
          setShowDailySummary={setShowDailySummary}
          meals={meals}
          setMeals={setMeals}
        />
      )}

      {/* 5×5×5 说明弹窗 */}
      {show555Explanation && (
        <div
          className="explanation-modal-overlay"
          onClick={() => setShow555Explanation(false)}
        >
          <div
            className="explanation-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="explanation-header">
              <h2>📚 什么是 5×5×5？</h2>
              <button
                className="modal-close"
                onClick={() => setShow555Explanation(false)}
              >
                ✕
              </button>
            </div>
            <div className="explanation-content">
              <p className="explanation-source">
                来自威廉·李博士《吃出自愈力》
              </p>

              <div className="explanation-section">
                <h4>人体有五大健康防御系统</h4>
                <div className="systems-grid">
                  {Object.entries(DEFENSE_SYSTEMS).map(([key, sys]) => (
                    <div key={key} className="system-item">
                      <span>{sys.icon}</span>
                      <span>{sys.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="explanation-section">
                <h4>5×5×5 饮食法</h4>
                <div className="five-rule">
                  <div className="rule-item">
                    <span className="rule-number">5</span>
                    <div>
                      <strong>每天 5 种食物</strong>
                      <p>从健康清单中选择 5 种不同的食物</p>
                    </div>
                  </div>
                  <div className="rule-item">
                    <span className="rule-number">5</span>
                    <div>
                      <strong>覆盖 5 个系统</strong>
                      <p>确保每种防御系统都有食物支持</p>
                    </div>
                  </div>
                  <div className="rule-item">
                    <span className="rule-number">5</span>
                    <div>
                      <strong>每天 5 餐</strong>
                      <p>早餐、午餐、晚餐、加餐、甜品</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="explanation-section">
                <h4>👑 大满贯食物</h4>
                <p>
                  能同时影响<strong>多个防御系统</strong>
                  的全明星食物。优先选择这些食物，效率最高！
                </p>

                <div className="grand-slam-list">
                  {grandSlamFoods.map(({ name, systems }) => (
                    <div key={name} className="grand-slam-item">
                      <span className="grand-slam-name">👑 {name}</span>
                      <div className="grand-slam-systems">
                        {systems.map((sys) => (
                          <span key={sys} title={DEFENSE_SYSTEMS[sys].name}>
                            {DEFENSE_SYSTEMS[sys].icon}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <p className="explanation-tip">
                  💡 目前收录 {grandSlamFoods.length} 种大满贯食物
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 下一顿吃什么按钮 */}
      <button
        onClick={openRecipePanel}
        className="recommend-btn"
        disabled={foods.length === 0}
      >
        🍽️ 下一顿吃什么
      </button>
    </div>
  );
}

export default App;
