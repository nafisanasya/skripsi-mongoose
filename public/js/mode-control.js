import { API_BASE } from "./config.js";

// Fungsi untuk mengirim mode ke backend
async function setSystemMode(mode) {
  try {
    console.log(`📡 Sending mode to backend: ${mode}`);

    const response = await fetch(`${API_BASE}/system/mode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mode: mode }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`✅ System mode set to ${mode}:`, result);
    return result;
  } catch (error) {
    console.error("❌ Error setting system mode:", error);
    throw error;
  }
}

export { setSystemMode };
