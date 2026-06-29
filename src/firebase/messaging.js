import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./config";

// VAPID 公钥
const VAPID_KEY = "BMRXFSx2gH_RkWHHjpuDoFOP2atKxZdMqscb1Vgk1h6CkCcmw9hFeo6TL1TjuzohN0pxVkKXhR3u1Md53rR63d8";

/**
 * 获取并保存 FCM token
 * @param {string} userId - 用户 ID
 */
export const subscribeToFCM = async (userId) => {
  try {
    // 检查浏览器是否支持
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("此浏览器不支持推送通知");
      return null;
    }

    // 获取 service worker 注册
    const registration = await navigator.serviceWorker.ready;

    // 获取 messaging 实例
    const messaging = getMessaging();

    // 获取 FCM token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("FCM token 获取成功:", token);

      // 保存 token 到 Firestore
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        fcmToken: token,
        fcmTokenUpdatedAt: new Date().toISOString(),
      });

      console.log("FCM token 已保存到 Firestore");
      return token;
    } else {
      console.warn("无法获取 FCM token，请确保已授权通知权限");
      return null;
    }
  } catch (error) {
    console.error("订阅 FCM 失败:", error);
    return null;
  }
};

/**
 * 监听前台消息
 * @param {function} callback - 收到消息时的回调
 */
export const onForegroundMessage = (callback) => {
  try {
    const messaging = getMessaging();
    return onMessage(messaging, (payload) => {
      console.log("收到前台消息:", payload);
      callback(payload);
    });
  } catch (error) {
    console.error("监听前台消息失败:", error);
    return () => {};
  }
};

/**
 * 取消 FCM 订阅
 * @param {string} userId - 用户 ID
 */
export const unsubscribeFromFCM = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      fcmToken: null,
      fcmTokenUpdatedAt: new Date().toISOString(),
    });
    console.log("FCM token 已从 Firestore 删除");
  } catch (error) {
    console.error("取消 FCM 订阅失败:", error);
  }
};
