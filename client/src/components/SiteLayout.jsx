import { Divider, Layout } from "antd";
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
          padding: 0,
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <h3
          style={{
            margin: 0,
            padding: "0 6px",
            fontWeight: "bold"
          }}
        >
          Blockchain of Things (BoT)
        </h3>
        <appkit-button />
      </Header>

      <Content
        style={{
          margin: "12px 8px",
          padding: 12,
          minHeight: "100%",
          color: "black",
          maxHeight: "100%"
        }}
      >
        {children}
      </Content>
      <Divider plain />
      <Footer style={{ textAlign: "center" }}>
        <a
          href="https://github.com/Salmandabbakuti"
          target="_blank"
          rel="noopener noreferrer"
        >
          ©{new Date().getFullYear()} Blockchain of Things. Powered by Polygon
        </a>
        <p style={{ fontSize: "12px" }}>v0.0.5</p>
      </Footer>
    </Layout>
  );
}
