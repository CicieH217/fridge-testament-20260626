import { migrateToFirestore, getPersonalFridgeId, createPersonalFridge } from "../firebase/firestore";

const LOCALSTORAGE_KEYS = {
  foods: "fridge_foods",
  meals: "fridge_meals",
  healthGoal: "healthGoal",
  dietaryPreferences: "dietaryPreferences",
  healthProfile: "healthProfile",
  favoriteRecipes: "favoriteRecipes",
  cookingHistory: "cookingHistory",
  mealHistory: "mealHistory",
  nutritionGoals: "nutritionGoals",
};

export const checkMigrationNeeded = () => {
  return localStorage.getItem("migration_completed") !== "true";
};

export const migrateLocalStorageToFirestore = async (userId) => {
  if (localStorage.getItem("migration_completed") === "true") {
    console.log("迁移已完成，跳过");
    return;
  }

  // 收集本地数据
  const foods = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEYS.foods) || "[]");
  const healthGoal = localStorage.getItem(LOCALSTORAGE_KEYS.healthGoal) || "maintain";
  const dietaryPreferences = JSON.parse(
    localStorage.getItem(LOCALSTORAGE_KEYS.dietaryPreferences) || "[]",
  );
  const healthProfile = JSON.parse(
    localStorage.getItem(LOCALSTORAGE_KEYS.healthProfile) || "null",
  );
  const favoriteRecipes = JSON.parse(
    localStorage.getItem(LOCALSTORAGE_KEYS.favoriteRecipes) || "[]",
  );
  const cookingHistory = JSON.parse(
    localStorage.getItem(LOCALSTORAGE_KEYS.cookingHistory) || "[]",
  );
  const mealHistory = JSON.parse(
    localStorage.getItem(LOCALSTORAGE_KEYS.mealHistory) || "[]",
  );
  const nutritionGoals = JSON.parse(
    localStorage.getItem(LOCALSTORAGE_KEYS.nutritionGoals) || "null",
  );

  // 查找或创建个人冰箱
  let fridgeId = await getPersonalFridgeId(userId);
  if (!fridgeId) {
    fridgeId = await createPersonalFridge(userId);
  }

  // 执行迁移
  await migrateToFirestore(
    userId,
    {
      userData: {
        healthGoal,
        dietaryPreferences,
        healthProfile: healthProfile || {
          height: 170,
          weight: 65,
          age: 30,
          gender: "male",
          activityLevel: "moderate",
          showProfileSetup: false,
        },
        favoriteRecipes,
        cookingHistory,
        mealHistory,
        nutritionGoals: nutritionGoals || {
          calories: 2000,
          protein: 60,
          fat: 65,
          carbs: 250,
          fiber: 25,
        },
      },
      foods,
    },
    fridgeId,
  );

  // 标记迁移完成
  localStorage.setItem("migration_completed", "true");
  localStorage.setItem("personal_fridge_id", fridgeId);

  console.log("数据迁移完成！");
  return fridgeId;
};

export const getPersonalFridgeIdFromStorage = () => {
  return localStorage.getItem("personal_fridge_id");
};
