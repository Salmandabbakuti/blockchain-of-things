import { Layout } from "antd";
import "antd/dist/reset.css";

const { Header, Footer, Content } = Layout;

export default function SiteLayout({ children }) {
  return (
    <Layout style={{ minHeight: "100vh", background: "#fafafa" }}>
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 99,
          padding: "0 24px",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.15)",
          height: "64px"
        }}
      >
        <h3
          style={{
            margin: 0,
            padding: 0,
            fontWeight: 800,
            fontSize: "1.2rem",
            letterSpacing: "0.5px",
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif"
          }}
        >
          ⚙️ BoT
        </h3>
        <appkit-button />
      </Header>

      <Content
        style={{
          margin: "0",
          padding: "0",
          minHeight: "calc(100vh - 128px)",
          color: "black",
          background: "#fafafa"
        }}
      >
        {children}
      </Content>

      <Footer
        style={{
          textAlign: "center",
          background: "white",
          borderTop: "1px solid #e0e0e0",
          padding: "24px 20px",
          margin: 0
        }}
      >
        <div style={{ marginBottom: "12px" }}>
          <a
            href="https://github.com/Salmandabbakuti"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#667eea",
              textDecoration: "none",
              fontWeight: 500,
              transition: "color 0.3s ease"
            }}
            onMouseEnter={(e) => (e.target.style.color = "#764ba2")}
            onMouseLeave={(e) => (e.target.style.color = "#667eea")}
          >
            ©{new Date().getFullYear()} Blockchain of Things. Powered by Polygon
          </a>
        </div>
        <p
          style={{
            fontSize: "12px",
            margin: "0",
            color: "#999",
            fontWeight: 500
          }}
        >
          v0.0.5
        </p>
      </Footer>
    </Layout>
  );
}
