import React from "react";
import poweredByGDOT from "../../assets/images/icon_PoweredByGDOT.png";

interface FooterProps {
  variant?: "sidebar" | "default";
}

const Footer: React.FC<FooterProps> = ({ variant = "default" }) => (
  <footer
    style={
      variant === "sidebar"
        ? {
            width: "100%",
            padding: "12px 0",
            background: "#fff",
            borderTop: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }
        : {
            width: "100%",
            padding: "12px 0",
            background: "#fff",
            borderTop: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            position: "fixed",
            bottom: 0,
            left: 0,
            zIndex: 100,
          }
    }
  >
    <div style={{ marginLeft: 24, display: "flex", alignItems: "center" }}>
      <img
        src={poweredByGDOT}
        alt="Powered by GDOT"
        style={{ height: 35 }}
      />
    </div>
  </footer>
);

export default Footer;