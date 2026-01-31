import { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

const SectionCard = ({ title, action, children }: SectionCardProps) => (
  <div className="card" style={{ marginBottom: "20px" }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "12px",
      }}
    >
      <h2 style={{ margin: 0 }}>{title}</h2>
      {action}
    </div>
    {children}
  </div>
);

export default SectionCard;
