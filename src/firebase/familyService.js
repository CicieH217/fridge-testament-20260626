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
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

// ===== 家庭组操作 =====

// 生成 6 位随机邀请码
const generateInviteCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 去掉容易混淆的字符
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// 创建家庭组
export const createFamilyGroup = async (userId, groupName) => {
  // 先创建一个共享冰箱
  const fridgeRef = await addDoc(collection(db, "fridges"), {
    ownerId: userId,
    type: "family",
    createdAt: serverTimestamp(),
  });

  // 创建家庭组
  const inviteCode = generateInviteCode();
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7); // 7天后过期

  const groupRef = await addDoc(collection(db, "familyGroups"), {
    name: groupName,
    inviteCode,
    inviteCodeExpiry: expiryDate.toISOString(),
    memberIds: [userId],
    memberNames: {}, // Will be populated with displayName
    adminId: userId,
    familyFridgeId: fridgeRef.id,
    createdAt: serverTimestamp(),
  });

  // 更新冰箱的家庭组 ID
  await updateDoc(fridgeRef, { familyGroupId: groupRef.id });

  return {
    groupId: groupRef.id,
    fridgeId: fridgeRef.id,
    inviteCode,
  };
};

// 通过邀请码加入家庭组
export const joinFamilyGroup = async (userId, inviteCode, displayName) => {
  // 查找邀请码对应的家庭组
  const q = query(
    collection(db, "familyGroups"),
    where("inviteCode", "==", inviteCode),
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("邀请码无效");
  }

  const groupDoc = snapshot.docs[0];
  const groupData = groupDoc.data();

  // 检查邀请码是否过期
  const expiry = new Date(groupData.inviteCodeExpiry);
  if (expiry < new Date()) {
    throw new Error("邀请码已过期");
  }

  // 检查是否已是成员
  if (groupData.memberIds.includes(userId)) {
    throw new Error("你已经是这个家庭的成员了");
  }

  // 加入家庭组
  const memberNames = { ...groupData.memberNames, [userId]: displayName || "新成员" };
  await updateDoc(groupDoc.ref, {
    memberIds: [...groupData.memberIds, userId],
    memberNames,
  });

  return {
    groupId: groupDoc.id,
    fridgeId: groupData.familyFridgeId,
    groupName: groupData.name,
  };
};

// 获取用户所属的家庭组
export const getUserFamilyGroups = async (userId) => {
  const q = query(
    collection(db, "familyGroups"),
    where("memberIds", "array-contains", userId),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// 获取家庭组信息
export const getFamilyGroup = async (groupId) => {
  const docRef = doc(db, "familyGroups", groupId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

// 离开家庭组
export const leaveFamilyGroup = async (groupId, userId) => {
  const groupRef = doc(db, "familyGroups", groupId);
  const groupSnap = await getDoc(groupRef);

  if (!groupSnap.exists()) return;

  const groupData = groupSnap.data();

  // 如果是管理员且是唯一成员，删除家庭组
  if (groupData.adminId === userId && groupData.memberIds.length === 1) {
    await deleteDoc(groupRef);
    await deleteDoc(doc(db, "fridges", groupData.familyFridgeId));
    return;
  }

  // 如果管理员离开，转移管理员给下一个成员
  const newMemberIds = groupData.memberIds.filter((id) => id !== userId);
  const newMemberNames = { ...groupData.memberNames };
  delete newMemberNames[userId];

  const updates = {
    memberIds: newMemberIds,
    memberNames: newMemberNames,
  };

  if (groupData.adminId === userId) {
    updates.adminId = newMemberIds[0];
  }

  await updateDoc(groupRef, updates);
};

// 生成新的邀请码
export const regenerateInviteCode = async (groupId) => {
  const inviteCode = generateInviteCode();
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);

  await updateDoc(doc(db, "familyGroups", groupId), {
    inviteCode,
    inviteCodeExpiry: expiryDate.toISOString(),
  });

  return inviteCode;
};

// 监听家庭组变化
export const subscribeToFamilyGroup = (groupId, callback) => {
  return onSnapshot(doc(db, "familyGroups", groupId), (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() });
    }
  });
};
