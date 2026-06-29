import { useState } from "react";

export const LoginModal = ({ onClose, onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Auth is handled by the parent component via custom event
      const event = new CustomEvent("fridge-login", {
        detail: { email, password },
      });
      window.dispatchEvent(event);
    } catch (err) {
      setError("登录失败：" + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="meal-selector-overlay"
      onClick={onClose}
    >
      <div
        className="meal-selector"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "400px" }}
      >
        <div className="meal-selector-header">
          <h2>🔐 登录冰箱</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
          {error && (
            <div
              style={{
                background: "#FCE9E9",
                color: "#C73D3D",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位"
              required
              minLength={6}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "14px",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="cook-btn"
            style={{
              width: "100%",
              marginBottom: "12px",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "登录中..." : "登录"}
          </button>

          <p
            style={{
              textAlign: "center",
              fontSize: "14px",
              color: "#666",
              margin: 0,
            }}
          >
            还没有账号？{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              style={{
                background: "none",
                border: "none",
                color: "#3498DB",
                cursor: "pointer",
                padding: 0,
                fontSize: "14px",
                textDecoration: "underline",
              }}
            >
              注册一个
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};
