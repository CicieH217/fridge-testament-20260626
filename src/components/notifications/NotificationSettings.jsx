import { useState, useEffect } from "react";
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  getNotificationPermission,
  triggerImmediateCheck,
  sendLocalNotification,
} from "../../services/notificationService";
import { subscribeToFCM, unsubscribeFromFCM } from "../../firebase/messaging";
import { useAuth } from "../../contexts/AuthContext";

export const NotificationSettings = ({ foods, onClose }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(getNotificationSettings());
  const [permission, setPermission] = useState(getNotificationPermission());
  const [testing, setTesting] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const handleToggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  const handleTimeChange = (time) => {
    const newSettings = { ...settings, reminderTime: time };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setPermission(getNotificationPermission());
    if (granted) {
      const newSettings = { ...settings, enabled: true };
      setSettings(newSettings);
      saveNotificationSettings(newSettings);

      // 如果用户已登录，订阅 FCM
      if (user) {
        setSubscribing(true);
        const token = await subscribeToFCM(user.uid);
        setSubscribing(false);
        if (token) {
          console.log("FCM 订阅成功");
        }
      }
    }
  };

  const handleDisableNotifications = async () => {
    const newSettings = { ...settings, enabled: false };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);

    // 如果用户已登录，取消 FCM 订阅
    if (user) {
      await unsubscribeFromFCM(user.uid);
    }
  };

  const handleTestNotification = async () => {
    if (Notification.permission !== "granted") {
      alert("请先开启通知权限");
      return;
    }

    const success = await sendLocalNotification("🔔 测试通知", {
      body: "如果你看到这条消息，通知功能正常！",
      tag: "test",
    });

    if (success) {
      alert("✅ 通知已发送！看看屏幕角落有没有弹出来");
    } else {
      alert("❌ 通知发送失败");
    }
  };

  return (
    <div className="meal-selector-overlay" onClick={onClose}>
      <div className="meal-selector" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "450px" }}>
        <div className="meal-selector-header">
          <h2>🔔 通知设置</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: "20px" }}>
          {/* 调试信息 */}
          <div style={{
            background: "#f0f0f0",
            padding: "8px",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "12px",
            color: "#666",
          }}>
            权限: {permission} | 启用: {settings.enabled ? "是" : "否"}
          </div>
          {/* 通知权限状态 */}
          {permission !== "granted" && (
            <div style={{
              background: "#FFF4E6",
              padding: "16px",
              borderRadius: "12px",
              marginBottom: "16px",
              textAlign: "center",
            }}>
              <p style={{ margin: "0 0 12px", fontSize: "14px", color: "#E6833B" }}>
                {permission === "denied"
                  ? "❌ 通知权限被拒绝，请在浏览器设置中开启"
                  : "📬 开启通知，食材到期不再被遗忘"}
              </p>
              {permission !== "denied" && (
                <button
                  onClick={handleEnableNotifications}
                  className="cook-btn"
                  style={{ padding: "8px 20px", fontSize: "14px" }}
                >
                  开启通知权限
                </button>
              )}
            </div>
          )}

          {/* 总开关 */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 0",
            borderBottom: "1px solid #eee",
          }}>
            <div>
              <div style={{ fontWeight: "bold", fontSize: "15px" }}>🔔 启用通知</div>
              <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
                接收食材到期提醒
              </div>
            </div>
            <label style={{ position: "relative", display: "inline-block", width: "50px", height: "26px" }}>
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={() => {
                  if (settings.enabled) {
                    handleDisableNotifications();
                  } else {
                    handleEnableNotifications();
                  }
                }}
                disabled={permission !== "granted"}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: "absolute",
                cursor: "pointer",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: settings.enabled ? "#2D7A4A" : "#ccc",
                transition: ".3s",
                borderRadius: "26px",
              }}>
                <span style={{
                  position: "absolute",
                  content: '""',
                  height: "20px",
                  width: "20px",
                  left: settings.enabled ? "26px" : "3px",
                  bottom: "3px",
                  backgroundColor: "white",
                  transition: ".3s",
                  borderRadius: "50%",
                }} />
              </span>
            </label>
          </div>

          {/* 提醒时间 */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 0",
            borderBottom: "1px solid #eee",
          }}>
            <div>
              <div style={{ fontWeight: "bold", fontSize: "15px" }}>⏰ 每日提醒时间</div>
              <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
                每天几点检查临期食材
              </div>
            </div>
            <input
              type="time"
              value={settings.reminderTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              disabled={!settings.enabled}
              style={{
                padding: "6px 10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "14px",
              }}
            />
          </div>

          {/* 到期提醒 */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 0",
            borderBottom: "1px solid #eee",
          }}>
            <div>
              <div style={{ fontWeight: "bold", fontSize: "15px" }}>⚠️ 到期提醒</div>
              <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
                食材明天到期时提醒
              </div>
            </div>
            <label style={{ position: "relative", display: "inline-block", width: "50px", height: "26px" }}>
              <input
                type="checkbox"
                checked={settings.expiryWarning}
                onChange={() => handleToggle("expiryWarning")}
                disabled={!settings.enabled}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: "absolute",
                cursor: "pointer",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: settings.expiryWarning ? "#2D7A4A" : "#ccc",
                transition: ".3s",
                borderRadius: "26px",
              }}>
                <span style={{
                  position: "absolute",
                  content: '""',
                  height: "20px",
                  width: "20px",
                  left: settings.expiryWarning ? "26px" : "3px",
                  bottom: "3px",
                  backgroundColor: "white",
                  transition: ".3s",
                  borderRadius: "50%",
                }} />
              </span>
            </label>
          </div>

          {/* 仅紧急提醒 */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 0",
            borderBottom: "1px solid #eee",
          }}>
            <div>
              <div style={{ fontWeight: "bold", fontSize: "15px" }}>🔥 仅紧急提醒</div>
              <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
                只在今天/已到期时提醒
              </div>
            </div>
            <label style={{ position: "relative", display: "inline-block", width: "50px", height: "26px" }}>
              <input
                type="checkbox"
                checked={settings.urgentOnly}
                onChange={() => handleToggle("urgentOnly")}
                disabled={!settings.enabled}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: "absolute",
                cursor: "pointer",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: settings.urgentOnly ? "#2D7A4A" : "#ccc",
                transition: ".3s",
                borderRadius: "26px",
              }}>
                <span style={{
                  position: "absolute",
                  content: '""',
                  height: "20px",
                  width: "20px",
                  left: settings.urgentOnly ? "26px" : "3px",
                  bottom: "3px",
                  backgroundColor: "white",
                  transition: ".3s",
                  borderRadius: "50%",
                }} />
              </span>
            </label>
          </div>

          {/* 测试按钮 */}
          <button
            onClick={handleTestNotification}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "16px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              background: "#F5FAF7",
              cursor: "pointer",
              fontSize: "14px",
              color: "#2D7A4A",
              fontWeight: "bold",
            }}
          >
            📬 测试通知
          </button>
        </div>
      </div>
    </div>
  );
};
