// 通知服务 - 管理浏览器推送通知
const NOTIFICATION_STORAGE_KEY = "notification_settings";

// 默认通知设置
const DEFAULT_SETTINGS = {
  enabled: false,
  reminderTime: "09:00", // 每日提醒时间
  expiryWarning: true, // 食材到期提醒
  dailySummary: true, // 每日饮食汇总
  urgentOnly: false, // 仅紧急提醒（今天到期的）
};

export const getNotificationSettings = () => {
  const saved = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
  if (saved) {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  }
  return { ...DEFAULT_SETTINGS };
};

export const saveNotificationSettings = (settings) => {
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(settings));
};

// 请求通知权限
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.warn("此浏览器不支持通知");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

// 获取通知权限状态
export const getNotificationPermission = () => {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
};

// 发送本地通知
export const sendLocalNotification = async (title, options = {}) => {
  if (Notification.permission !== "granted") {
    return false;
  }

  try {
    // 尝试用 Service Worker（如果有且已准备好）
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        // 等待最多 1 秒
        const registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1000))
        ]);

        await registration.showNotification(title, {
          body: options.body || "",
          tag: options.tag || "fridge-notification",
        });
        return true;
      } catch (e) {
        // Service Worker 失败，降级到普通通知
        console.log("Service Worker 通知失败，使用普通通知:", e.message);
      }
    }

    // 使用普通 Notification API
    const notification = new Notification(title, {
      body: options.body || "",
      tag: options.tag || "fridge-notification",
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (error) {
    console.error("发送通知失败:", error);
    return false;
  }
};

// 检查临期食材并发送通知
export const checkExpiringFoods = (foods, forceTest = false) => {
  const settings = getNotificationSettings();
  if (!settings.enabled || Notification.permission !== "granted") {
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 存储食材名称和剩余天数
  const expired = [];
  const expiringToday = [];
  const expiringTomorrow = [];
  const expiringSoon = []; // 2-3天
  const expiringThisWeek = []; // 4-7天

  foods.forEach((food) => {
    const expiry = new Date(food.expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      expired.push({ name: food.name, days: Math.abs(daysLeft) });
    } else if (daysLeft === 0) {
      expiringToday.push({ name: food.name, days: 0 });
    } else if (daysLeft === 1) {
      expiringTomorrow.push({ name: food.name, days: 1 });
    } else if (daysLeft <= 3) {
      expiringSoon.push({ name: food.name, days: daysLeft });
    } else if (daysLeft <= 7) {
      expiringThisWeek.push({ name: food.name, days: daysLeft });
    }
  });

  // 测试模式：如果没有任何临期食材，发送一条测试通知
  if (forceTest && expired.length === 0 && expiringToday.length === 0 &&
      expiringTomorrow.length === 0 && expiringSoon.length === 0) {
    sendLocalNotification("🔔 通知测试成功！", {
      body: `你的冰箱有 ${foods.length} 种食材，目前都没有到期问题 👍`,
      tag: "test-notification",
    });
    return;
  }

  // 发送通知
  if (expired.length > 0) {
    const expiredText = expired.map(e => `${e.name}(过期${e.days}天)`).join("、");
    sendLocalNotification("❌ 食材已过期", {
      body: `${expiredText} 快清理冰箱吧！`,
      tag: "expired-foods",
    });
  }

  if (expiringToday.length > 0) {
    const todayText = expiringToday.map(e => e.name).join("、");
    sendLocalNotification("🔥 今天必须吃掉！", {
      body: `${todayText} 今天到期！再不吃就晚了！`,
      tag: "expiring-today",
      requireInteraction: true,
    });
  }

  if (expiringTomorrow.length > 0 && settings.expiryWarning) {
    const tomorrowText = expiringTomorrow.map(e => e.name).join("、");
    sendLocalNotification("⏰ 明天到期", {
      body: `${tomorrowText} 明天就到期了（还剩1天），记得今天吃掉哦~`,
      tag: "expiring-tomorrow",
    });
  }

  if (expiringSoon.length > 0 && settings.expiryWarning && !settings.urgentOnly) {
    const soonText = expiringSoon.map(e => `${e.name}(还剩${e.days}天)`).join("、");
    sendLocalNotification("⚠️ 食材即将到期", {
      body: `${soonText} 尽快吃掉哦~`,
      tag: "expiring-soon",
    });
  }

  if (expiringThisWeek.length > 0 && settings.expiryWarning && !settings.urgentOnly) {
    const weekText = expiringThisWeek.map(e => `${e.name}(还剩${e.days}天)`).join("、");
    sendLocalNotification("📅 本周到期提醒", {
      body: `${weekText} 注意安排时间吃掉~`,
      tag: "expiring-week",
    });
  }
};

// 设置每日定时检查（使用 setTimeout 链式调用）
let scheduledCheckId = null;

export const scheduleDailyCheck = (foodsGetter) => {
  // 清除之前的定时器
  if (scheduledCheckId) {
    clearTimeout(scheduledCheckId);
  }

  const settings = getNotificationSettings();
  if (!settings.enabled) return;

  const scheduleNext = () => {
    const now = new Date();
    const [hours, minutes] = settings.reminderTime.split(":").map(Number);
    const nextCheck = new Date();
    nextCheck.setHours(hours, minutes, 0, 0);

    // 如果今天的时间已过，设置为明天
    if (nextCheck <= now) {
      nextCheck.setDate(nextCheck.getDate() + 1);
    }

    const delay = nextCheck - now;

    scheduledCheckId = setTimeout(() => {
      const foods = foodsGetter();
      checkExpiringFoods(foods);
      // 安排下一次检查
      scheduleNext();
    }, delay);
  };

  scheduleNext();
};

export const cancelScheduledCheck = () => {
  if (scheduledCheckId) {
    clearTimeout(scheduledCheckId);
    scheduledCheckId = null;
  }
};

// 立即检查一次（用于测试）
export const triggerImmediateCheck = (foods) => {
  checkExpiringFoods(foods, true); // forceTest = true
};
