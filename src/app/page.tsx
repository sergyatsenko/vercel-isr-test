import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hello World with Timestamp",
};

export const dynamic = "force-static";

async function getTimestamp() {
  return new Date().toISOString();
}

export default async function Home() {
  const timestamp = await getTimestamp();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
        backgroundColor: "#f0f0f0",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h1 style={{ color: "#333", marginBottom: "20px" }}>Hello World</h1>
      <p style={{ color: "#666" }}>Generated at: {timestamp}</p>
    </div>
  );
}
