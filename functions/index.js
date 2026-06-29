const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

// 每天上午 9 点运行
exports.checkExpiringFoods = functions.pubsub
  .schedule("0 9 * * *")
  .timeZone("Asia/Shanghai")
  .onRun(async (context) => {
    console.log("开始检查临期食材...");

    try {
      // 获取所有有 fcmToken 的用户
      const usersSnapshot = await db.collection("users").get();

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();

        // 检查用户是否有 fcmToken
        if (!userData.fcmToken) {
          console.log(`用户 ${userId} 没有 fcmToken，跳过`);
          continue;
        }

        // 获取用户的个人冰箱
        const personalFridgeRef = await db
          .collection("fridges")
          .where("ownerId", "==", userId)
          .where("type", "==", "personal")
          .limit(1)
          .get();

        if (personalFridgeRef.empty) {
          console.log(`用户 ${userId} 没有个人冰箱，跳过`);
          continue;
        }

        const fridgeId = personalFridgeRef.docs[0].id;

        // 获取冰箱里的所有食材
        const foodsSnapshot = await db
          .collection("fridges")
          .doc(fridgeId)
          .collection("foods")
          .get();

        if (foodsSnapshot.empty) {
          continue;
        }

        // 检查临期食材
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expiringToday = [];
        const expiringTomorrow = [];
        const expiringSoon = [];
        const expired = [];

        foodsSnapshot.forEach((doc) => {
          const food = doc.data();
          const expiry = new Date(food.expiryDate);
          expiry.setHours(0, 0, 0, 0);
          const daysLeft = Math.ceil(
            (expiry - today) / (1000 * 60 * 60 * 24)
          );

          if (daysLeft < 0) {
            expired.push(food.name);
          } else if (daysLeft === 0) {
            expiringToday.push(food.name);
          } else if (daysLeft === 1) {
            expiringTomorrow.push(food.name);
          } else if (daysLeft <= 3) {
            expiringSoon.push(food.name);
          }
        });

        // 构建通知内容
        let title = "";
        let body = "";

        if (expired.length > 0) {
          title = "❌ 食材已过期";
          body = `${expired.join("、")} 已经过期了，快清理冰箱吧！`;
        } else if (expiringToday.length > 0) {
          title = "🔥 今天必须吃掉！";
          body = `${expiringToday.join("、")} 今天到期！再不吃就晚了！`;
        } else if (expiringTomorrow.length > 0) {
          title = "⏰ 明天到期";
          body = `${expiringTomorrow.join("、")} 明天就到期了，记得今天吃掉哦~`;
        } else if (expiringSoon.length > 0) {
          title = "⚠️ 食材即将到期";
          body = `${expiringSoon.join("、")} 还有几天就到期了`;
        }

        // 如果有需要通知的内容，发送推送
        if (title && body) {
          const message = {
            token: userData.fcmToken,
            notification: {
              title: title,
              body: body,
            },
            data: {
              url: "/",
            },
            webpush: {
              notification: {
                icon: "/pwa-192x192.png",
                badge: "/pwa-192x192.png",
                vibrate: [200, 100, 200],
                actions: [
                  { action: "open", title: "打开应用" },
                  { action: "close", title: "关闭" },
                ],
              },
            },
          };

          try {
            await messaging.send(message);
            console.log(`已发送通知给用户 ${userId}: ${title}`);
          } catch (error) {
            console.error(`发送通知失败 (${userId}):`, error);
            // 如果 token 无效，删除它
            if (
              error.code === "messaging/invalid-registration-token" ||
              error.code === "messaging/registration-token-not-registered"
            ) {
              await db.collection("users").doc(userId).update({
                fcmToken: admin.firestore.FieldValue.delete(),
              });
              console.log(`已删除用户 ${userId} 的无效 token`);
            }
          }
        }
      }

      console.log("检查完成！");
      return null;
    } catch (error) {
      console.error("检查临期食材时出错:", error);
      return null;
    }
  });
