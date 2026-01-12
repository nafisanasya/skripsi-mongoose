import { API_BASE } from "./config.js";

// 1. Fungsi Mengirim Perubahan Mode (POST)
async function setSystemMode(mode) {
  try {
    console.log(`📡 Sending mode to backend: ${mode}`);

    // PERBAIKAN: Endpoint disesuaikan dengan route backend (/api/mode)
    const response = await fetch(`${API_BASE}/mode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // PERBAIKAN: Sertakan manualState default agar data lengkap
      body: JSON.stringify({
        mode: mode,
        manualState: { acFront: "OFF", acSide: "OFF" },
      }),
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

// 2. Fungsi Mengambil Status Saat Ini (GET) - Untuk Initial Load
async function getSystemMode() {
  try {
    const response = await fetch(`${API_BASE}/mode`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data; // Mengembalikan object { mode: 'auto', ... }
  } catch (error) {
    console.error("❌ Error getting system mode:", error);
    return null;
  }
}

export { setSystemMode, getSystemMode };
