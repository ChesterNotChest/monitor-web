/** 从 Vite 环境变量组装的运行时配置。 */

const BASE_URL = import.meta.env.VITE_SERVER_BASE_URL as string;
const API_PORT = import.meta.env.VITE_API_PORT as string;
const WEBRTC_PORT = import.meta.env.VITE_WEBRTC_PORT as string;

export const config = {
  /** 完整 Server 地址（含端口），如 http://localhost:8000 */
  serverBaseUrl: `${BASE_URL}:${API_PORT}`,

  /** REST API 完整前缀，如 http://localhost:8000/api/v1 */
  apiBase: `${BASE_URL}:${API_PORT}/api/v1`,

  /** WebRTC 信令/流地址，如 http://localhost:8080 */
  webrtcBase: `${BASE_URL}:${WEBRTC_PORT}`,
} as const;
