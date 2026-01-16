let currentMode = "auto";

export function getCurrentMode() {
  return currentMode;
}

export function setCurrentMode(mode) {
  currentMode = mode;
  console.log(`🔄 System mode changed to: ${mode}`);
}

export function isManualMode() {
  return currentMode === "manual";
}

export function isAutoMode() {
  return currentMode === "auto";
}
