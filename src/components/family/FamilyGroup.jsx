import { useState, useEffect } from "react";
import {
  createFamilyGroup,
  joinFamilyGroup,
  getUserFamilyGroups,
  leaveFamilyGroup,
  regenerateInviteCode,
  subscribeToFamilyGroup,
} from "../../firebase/familyService";
import { useAuth } from "../../contexts/AuthContext";

export const FamilyGroup = ({ onClose, onSelectFamilyFridge }) => {
  const { user } = useAuth();
  const [familyGroups, setFamilyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadFamilyGroups();
  }, [user]);

  const loadFamilyGroups = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const groups = await getUserFamilyGroups(user.uid);
      setFamilyGroups(groups);
    } catch (err) {
      console.error("Load family groups error:", err);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      setError("请输入家庭名称");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const result = await createFamilyGroup(user.uid, groupName.trim());
      setShowCreate(false);
      setGroupName("");
      await loadFamilyGroups();
    } catch (err) {
      setError("创建失败: " + err.message);
    }
    setCreating(false);
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      setError("请输入邀请码");
      return;
    }
    setCreating(true);
    setError("");
    try {
      await joinFamilyGroup(
        user.uid,
        inviteCode.trim().toUpperCase(),
        user.displayName || user.email,
      );
      setShowJoin(false);
      setInviteCode("");
      await loadFamilyGroups();
    } catch (err) {
      setError(err.message);
    }
    setCreating(false);
  };

  const handleLeave = async (groupId, groupName) => {
    if (!window.confirm(`确定要离开「${groupName}」吗？`)) return;
    try {
      await leaveFamilyGroup(groupId, user.uid);
      await loadFamilyGroups();
    } catch (err) {
      setError("离开失败: " + err.message);
    }
  };

  const handleRegenerateCode = async (groupId) => {
    try {
      const newCode = await regenerateInviteCode(groupId);
      await loadFamilyGroups();
      alert(`新邀请码: ${newCode}\n有效期 7 天`);
    } catch (err) {
      setError("刷新失败: " + err.message);
    }
  };

  const getExpiryInfo = (expiryStr) => {
    const expiry = new Date(expiryStr);
    const now = new Date();
    const days = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    if (days <= 0) return { text: "已过期", color: "#C73D3D" };
    if (days === 1) return { text: "明天过期", color: "#E6833B" };
    return { text: `${days}天后过期`, color: "#666" };
  };

  return (
    <div className="meal-selector-overlay" onClick={onClose}>
      <div className="meal-selector" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
        <div className="meal-selector-header">
          <h2>👨‍👩‍👧‍👦 家庭共享</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: "20px" }}>
          {error && (
            <div style={{
              background: "#FCE9E9",
              color: "#C73D3D",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "14px",
            }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
              加载中...
            </div>
          ) : familyGroups.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px" }}>
              <p style={{ fontSize: "48px", margin: "0 0 16px" }}>🏠</p>
              <p style={{ color: "#666", marginBottom: "20px" }}>
                还没有加入任何家庭组
              </p>
              <p style={{ color: "#999", fontSize: "14px" }}>
                创建或加入一个家庭组，和家人共享冰箱
              </p>
            </div>
          ) : (
            <div style={{ marginBottom: "16px" }}>
              {familyGroups.map((group) => {
                const expiryInfo = getExpiryInfo(group.inviteCodeExpiry);
                const isAdmin = group.adminId === user.uid;
                return (
                  <div key={group.id} style={{
                    background: "#F5FAF7",
                    padding: "16px",
                    borderRadius: "12px",
                    marginBottom: "12px",
                    border: "1px solid #EAF6EF",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ margin: 0, fontSize: "16px" }}>
                        🏠 {group.name}
                        {isAdmin && <span style={{ fontSize: "12px", color: "#2D7A4A", marginLeft: "8px" }}>管理员</span>}
                      </h3>
                      <button
                        onClick={() => onSelectFamilyFridge(group.familyFridgeId, group.name)}
                        className="cook-btn"
                        style={{ padding: "6px 12px", fontSize: "13px" }}
                      >
                        查看冰箱
                      </button>
                    </div>

                    <div style={{ marginTop: "12px", fontSize: "14px", color: "#666" }}>
                      <p style={{ margin: "4px 0" }}>
                        👥 成员: {group.memberIds.length} 人
                        {group.memberNames && Object.values(group.memberNames).length > 0 && (
                          <span style={{ color: "#999", marginLeft: "8px" }}>
                            ({Object.values(group.memberNames).join(", ")})
                          </span>
                        )}
                      </p>
                      {isAdmin && (
                        <>
                          <p style={{ margin: "4px 0" }}>
                            📝 邀请码: <strong style={{ fontSize: "16px", letterSpacing: "2px" }}>{group.inviteCode}</strong>
                            <span style={{ color: expiryInfo.color, marginLeft: "8px", fontSize: "12px" }}>
                              ({expiryInfo.text})
                            </span>
                          </p>
                          <button
                            onClick={() => handleRegenerateCode(group.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#3498DB",
                              cursor: "pointer",
                              padding: 0,
                              fontSize: "13px",
                              marginTop: "4px",
                            }}
                          >
                            🔄 刷新邀请码
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => handleLeave(group.id, group.name)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#C73D3D",
                        cursor: "pointer",
                        padding: 0,
                        fontSize: "13px",
                        marginTop: "8px",
                      }}
                    >
                      离开家庭
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Create / Join buttons */}
          {!showCreate && !showJoin && (
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowCreate(true)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #2D7A4A",
                  background: "#F5FAF7",
                  color: "#2D7A4A",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                + 创建家庭
              </button>
              <button
                onClick={() => setShowJoin(true)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #3498DB",
                  background: "#EBF5FB",
                  color: "#3498DB",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                🔑 加入家庭
              </button>
            </div>
          )}

          {/* Create form */}
          {showCreate && (
            <div style={{ marginTop: "16px" }}>
              <h4 style={{ margin: "0 0 12px" }}>创建新家庭</h4>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="家庭名称（如：温馨小窝）"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                  marginBottom: "12px",
                }}
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="cook-btn"
                  style={{ flex: 1 }}
                >
                  {creating ? "创建中..." : "创建"}
                </button>
                <button
                  onClick={() => { setShowCreate(false); setGroupName(""); setError(""); }}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* Join form */}
          {showJoin && (
            <div style={{ marginTop: "16px" }}>
              <h4 style={{ margin: "0 0 12px" }}>加入家庭</h4>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="输入 6 位邀请码"
                maxLength={6}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "18px",
                  letterSpacing: "4px",
                  textAlign: "center",
                  marginBottom: "12px",
                }}
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handleJoin}
                  disabled={creating}
                  className="cook-btn"
                  style={{ flex: 1 }}
                >
                  {creating ? "加入中..." : "加入"}
                </button>
                <button
                  onClick={() => { setShowJoin(false); setInviteCode(""); setError(""); }}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
