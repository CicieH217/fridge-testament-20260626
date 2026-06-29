import { useState } from "react";

export const RegisterModal = ({ onClose, onSwitchToLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const event = new CustomEvent("fridge-register", {
        detail: { email, password, displayName },
      });
      window.dispatchEvent(event);
    } catch (err) {
      setError("注册失败：" + err.message);
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
          <h2>📝 注册冰箱</h2>
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
              昵称
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="你的昵称"
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
            {loading ? "注册中..." : "注册"}
          </button>

          <p
            style={{
              textAlign: "center",
              fontSize: "14px",
              color: "#666",
              margin: 0,
            }}
          >
            已有账号？{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
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
              去登录
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};
