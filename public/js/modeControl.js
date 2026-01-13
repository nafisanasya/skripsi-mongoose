import { API_BASE } from "./config.js";

// 1. Fungsi Mengirim Perubahan Mode (POST)
// Parameter 'manualData' sifatnya opsional (hanya dipakai saat tombol Apply ditekan)
async function setSystemMode(mode, manualData = null) {
  try {
    console.log(`📡 Sending mode to backend: ${mode}`);

    // Siapkan data yang mau dikirim
    let payload = { mode: mode };

    // PERBAIKAN PENTING:
    // Hanya kirim manualState KALO MEMANG ADA DATA (Tombol Apply).
    // Kalo cuma ganti mode (buka modal), manualData-nya null, jadi manualState TIDAK DIKIRIM.
    // Ini mencegah AC mati kaget.
    if (manualData) {
      payload.manualState = manualData;
    }

    const response = await fetch(`${API_BASE}/mode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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

// 2. Fungsi Mengambil Status Saat Ini (GET)
async function getSystemMode() {
  try {
    const response = await fetch(`${API_BASE}/mode`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("❌ Error getting system mode:", error);
    return null;
  }
}

export { setSystemMode, getSystemMode };
