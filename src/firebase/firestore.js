import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./config";

// ===== 冰箱食材操作 =====

// 获取用户的个人冰箱 ID
export const getPersonalFridgeId = async (userId) => {
  const q = query(
    collection(db, "fridges"),
    where("ownerId", "==", userId),
    where("type", "==", "personal"),
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].id;
};

// 创建个人冰箱
export const createPersonalFridge = async (userId) => {
  const fridgeRef = await addDoc(collection(db, "fridges"), {
    ownerId: userId,
    type: "personal",
    createdAt: serverTimestamp(),
  });
  return fridgeRef.id;
};

// 添加食材
export const addFood = async (fridgeId, foodData, userId) => {
  const { id, ...data } = foodData;
  const docRef = await addDoc(
    collection(db, "fridges", fridgeId, "foods"),
    {
      ...data,
      addedBy: userId,
      createdAt: serverTimestamp(),
    },
  );
  return docRef.id;
};

// 更新食材
export const updateFood = async (fridgeId, foodId, updates) => {
  await updateDoc(doc(db, "fridges", fridgeId, "foods", foodId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// 删除食材
export const deleteFood = async (fridgeId, foodId) => {
  await deleteDoc(doc(db, "fridges", fridgeId, "foods", foodId));
};

// 监听冰箱食材变化（实时同步）
export const subscribeToFoods = (fridgeId, callback) => {
  return onSnapshot(
    collection(db, "fridges", fridgeId, "foods"),
    (snapshot) => {
      const foods = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(foods);
    },
  );
};

// ===== 用户数据操作 =====

// 保存用户数据（批量）
export const saveUserData = async (userId, data) => {
  const batch = writeBatch(db);
  const userRef = doc(db, "users", userId);

  for (const [key, value] of Object.entries(data)) {
    const fieldRef = doc(db, "users", userId, "data", key);
    batch.set(fieldRef, {
      value,
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
};

// 获取用户数据
export const getUserData = async (userId) => {
  const snapshot = await getDocs(
    collection(db, "users", userId, "data"),
  );
  const data = {};
  snapshot.docs.forEach((doc) => {
    data[doc.id] = doc.data().value;
  });
  return data;
};

// 监听用户数据变化
export const subscribeToUserData = (userId, key, callback) => {
  const docRef = doc(db, "users", userId, "data", key);
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data().value);
    }
  });
};

// ===== 批量迁移 =====

// 批量迁移本地数据到 Firestore
export const migrateToFirestore = async (userId, localData, fridgeId) => {
  const batch = writeBatch(db);

  // 迁移用户数据
  for (const [key, value] of Object.entries(localData.userData)) {
    if (value !== null && value !== undefined) {
      const fieldRef = doc(db, "users", userId, "data", key);
      batch.set(fieldRef, {
        value,
        migratedAt: serverTimestamp(),
      });
    }
  }

  // 迁移食材
  if (localData.foods && localData.foods.length > 0) {
    for (const food of localData.foods) {
      const { id, ...foodData } = food;
      const foodRef = doc(
        collection(db, "fridges", fridgeId, "foods"),
      );
      batch.set(foodRef, {
        ...foodData,
        addedBy: userId,
        migratedAt: serverTimestamp(),
      });
    }
  }

  await batch.commit();
};
