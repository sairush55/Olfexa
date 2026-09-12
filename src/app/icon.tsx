import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "#064e3b",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
          color: "white",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="20" cy="20" r="16" stroke="white" strokeWidth="2.5" strokeDasharray="4 2.5" opacity="0.6" />
          <circle cx="20" cy="20" r="11" stroke="white" strokeWidth="2" opacity="0.9" />
          <path d="M12 24C14.5 24 16 16 20 16C24 16 25.5 24 28 24" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <circle cx="20" cy="20" r="2.5" fill="white" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
