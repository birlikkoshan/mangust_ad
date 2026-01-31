import type { CurrentUser } from "../../../api/Admin/client";

interface ProfileHeaderProps {
  user: CurrentUser;
  stats: { orders: number; wishlist: number };
}

const ProfileHeader = ({ user, stats }: ProfileHeaderProps) => {
  return (
    <div className="card" style={{ marginBottom: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p style={{ margin: "0 0 4px", color: "#6c757d" }}>Signed in as</p>
          <h1 style={{ margin: 0 }}>{user.name || user.email}</h1>
          <p style={{ margin: "6px 0 0", color: "#6c757d" }}>{user.email}</p>
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div className="badge">Role: {user.role}</div>
          <div className="badge">Orders: {stats.orders}</div>
          <div className="badge">Wishlist: {stats.wishlist}</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
