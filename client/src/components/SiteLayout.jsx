import { Layout } from "antd";
import "antd/dist/reset.css";

const { Header, Footer, Content } = Layout;

export default function SiteLayout({ children }) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
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
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        }}
      >
        <h3
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            margin: 0
          }}
        >
          ⚙️ BoT
        </h3>
        <appkit-button />
      </Header>

      <Content>{children}</Content>

      <Footer
        style={{
          textAlign: "center",
          borderTop: "1px solid #e0e0e0"
        }}
      >
        <div>
          <a
            href="https://github.com/Salmandabbakuti"
            target="_blank"
            rel="noopener noreferrer"
          >
            ©{new Date().getFullYear()} Blockchain of Things
          </a>
        </div>
        <p
          style={{
            fontSize: "12px",
            margin: "0",
            color: "#999"
          }}
        >
          v1.1.0
        </p>
      </Footer>
    </Layout>
  );
}
