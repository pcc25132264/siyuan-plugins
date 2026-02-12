declare function require(name: string): any;

type PresetId =
  | "yellow"
  | "green"
  | "gray"
  | "almond"
  | "rose"
  | "lavender"
  | "cyan"
  | "alice"
  | "honey"
  | "cornsilk"
  | "antique"
  | "wheat"
  | "parchment"
  | "custom";

type RGB = { r: number; g: number; b: number };

type EyeCareSmartTime = {
  enabled: boolean;
  start: string;
  end: string;
};

type EyeCareConfig = {
  enabled: boolean;
  preset: PresetId;
  customColor: string;
  opacity: number;
  smartTime: EyeCareSmartTime;
};

type ExportedConfig = {
  version: 1;
  exportedAt: string;
  config: EyeCareConfig;
};

const DEFAULT_CONFIG: EyeCareConfig = {
  enabled: false,
  preset: "yellow",
  customColor: "#FFF2CC",
  opacity: 0.18,
  smartTime: {
    enabled: false,
    start: "21:00",
    end: "07:00",
  },
};

const PRESET_RGB: Record<Exclude<PresetId, "custom">, RGB> = {
  yellow: { r: 255, g: 242, b: 204 },
  green: { r: 221, g: 244, b: 230 },
  gray: { r: 237, g: 237, b: 237 },
  almond: { r: 255, g: 235, b: 205 },
  rose: { r: 255, g: 228, b: 225 },
  lavender: { r: 230, g: 230, b: 250 },
  cyan: { r: 224, g: 255, b: 255 },
  alice: { r: 240, g: 248, b: 255 },
  honey: { r: 240, g: 255, b: 240 },
  cornsilk: { r: 255, g: 248, b: 220 },
  antique: { r: 250, g: 235, b: 215 },
  wheat: { r: 245, g: 222, b: 179 },
  parchment: { r: 253, g: 245, b: 230 },
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const parseHexColor = (raw: string): RGB | null => {
  const v = raw.trim();
  const m = v.match(/^#?([0-9a-fA-F]{6})$/);
  if (!m) return null;
  const hex = m[1];
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  if ([r, g, b].some((x) => Number.isNaN(x))) return null;
  return { r, g, b };
};

const parseRgbColor = (raw: string): RGB | null => {
  const v = raw.trim();
  const mFunc = v.match(/^rgb\(\s*([0-9]{1,3})\s*[, ]\s*([0-9]{1,3})\s*[, ]\s*([0-9]{1,3})\s*\)$/i);
  if (mFunc) {
    const r = Number.parseInt(mFunc[1], 10);
    const g = Number.parseInt(mFunc[2], 10);
    const b = Number.parseInt(mFunc[3], 10);
    if ([r, g, b].some((x) => Number.isNaN(x) || x < 0 || x > 255)) return null;
    return { r, g, b };
  }
  const mPlain = v.match(/^([0-9]{1,3})\s*[, ]\s*([0-9]{1,3})\s*[, ]\s*([0-9]{1,3})$/);
  if (!mPlain) return null;
  const r = Number.parseInt(mPlain[1], 10);
  const g = Number.parseInt(mPlain[2], 10);
  const b = Number.parseInt(mPlain[3], 10);
  if ([r, g, b].some((x) => Number.isNaN(x) || x < 0 || x > 255)) return null;
  return { r, g, b };
};

const parseColorInput = (raw: string): RGB | null => {
  return parseHexColor(raw) ?? parseRgbColor(raw);
};

const rgbToCSSVarValue = (rgb: RGB) => `${rgb.r} ${rgb.g} ${rgb.b}`;

const opacityToPercent = (opacity: number) => `${Math.round(clamp(opacity, 0, 0.5) * 100)}%`;

const parseTimeHHmm = (raw: string): number | null => {
  const v = raw.trim();
  const m = v.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!m) return null;
  const h = Number.parseInt(m[1], 10);
  const min = Number.parseInt(m[2], 10);
  if (Number.isNaN(h) || Number.isNaN(min)) return null;
  return h * 60 + min;
};

const shouldEnableByTime = (nowMinutes: number, startMinutes: number, endMinutes: number) => {
  if (startMinutes === endMinutes) return true;
  if (startMinutes < endMinutes) {
    return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  }
  return nowMinutes >= startMinutes || nowMinutes < endMinutes;
};

const safeJsonParse = <T>(raw: any): T | null => {
  if (!raw) return null;
  if (typeof raw === "object") return raw as T;
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const pick = (obj: any, key: string, fallback: any) => {
  if (!obj || typeof obj !== "object") return fallback;
  return typeof obj[key] === "undefined" ? fallback : obj[key];
};

const buildConfig = (raw: any): EyeCareConfig => {
  const cfg: EyeCareConfig = {
    enabled: Boolean(pick(raw, "enabled", DEFAULT_CONFIG.enabled)),
    preset: pick(raw, "preset", DEFAULT_CONFIG.preset),
    customColor: String(pick(raw, "customColor", DEFAULT_CONFIG.customColor)),
    opacity: Number(pick(raw, "opacity", DEFAULT_CONFIG.opacity)),
    smartTime: {
      enabled: Boolean(pick(raw?.smartTime, "enabled", DEFAULT_CONFIG.smartTime.enabled)),
      start: String(pick(raw?.smartTime, "start", DEFAULT_CONFIG.smartTime.start)),
      end: String(pick(raw?.smartTime, "end", DEFAULT_CONFIG.smartTime.end)),
    },
  };
  if (
    ![
      "yellow",
      "green",
      "gray",
      "almond",
      "rose",
      "lavender",
      "cyan",
      "alice",
      "honey",
      "cornsilk",
      "antique",
      "wheat",
      "parchment",
      "custom",
    ].includes(cfg.preset)
  ) {
    cfg.preset = DEFAULT_CONFIG.preset;
  }
  cfg.opacity = clamp(Number.isFinite(cfg.opacity) ? cfg.opacity : DEFAULT_CONFIG.opacity, 0, 0.5);
  return cfg;
};

const getTintRGB = (cfg: EyeCareConfig): RGB | null => {
  if (cfg.preset !== "custom") return PRESET_RGB[cfg.preset];
  return parseColorInput(cfg.customColor);
};

let siyuan: any;
try {
  siyuan = require("siyuan");
} catch {
  class SettingFallback {
    public items: any[] = [];
    constructor(_options: any = {}) {}
    public addItem(options: any) {
      this.items.push(options);
    }
    public open(_name: string) {}
  }

  class PluginFallback {
    public i18n: Record<string, any> = {};
    public displayName = "Eye Care Theme";
    public readonly name = "eye-care-theme";
    public setting: any;
    public commands: any[] = [];
    private store: Record<string, any> = {};
    public onload(): Promise<void> | void {}
    public onunload(): void {}
    public addCommand(command: any): void {
      this.commands.push(command);
    }
    public openSetting(): void {
      this.setting?.open?.(this.displayName || this.name);
    }
    public async loadData(storageName: string): Promise<any> {
      return this.store[storageName] ?? "";
    }
    public async saveData(storageName: string, data: any): Promise<any> {
      this.store[storageName] = data;
      return data;
    }
    public async removeData(storageName: string): Promise<any> {
      delete this.store[storageName];
      return null;
    }
  }
  siyuan = {
    Plugin: PluginFallback,
    Setting: SettingFallback,
    showMessage: (msg: string) => {
      const g: any = globalThis as any;
      if (Array.isArray(g.__eyeCareTestMessages)) {
        g.__eyeCareTestMessages.push(msg);
      }
    },
  };
}

const { Plugin, Setting, showMessage } = siyuan as {
  Plugin: any;
  Setting: any;
  showMessage: (msg: string, timeout?: number, type?: "error" | "info") => void;
};

export const __test__ = {
  clamp,
  parseColorInput,
  parseTimeHHmm,
  shouldEnableByTime,
  buildConfig,
  opacityToPercent,
  rgbToCSSVarValue,
  getTintRGB,
};

export default class EyeCareThemePlugin extends Plugin {
  private config: EyeCareConfig = { ...DEFAULT_CONFIG, smartTime: { ...DEFAULT_CONFIG.smartTime } };
  private saveTimer: number | null = null;
  private smartTimer: number | null = null;
  private lastSmartApplied: boolean | null = null;

  private enabledInput: HTMLInputElement | null = null;
  private presetSelect: HTMLSelectElement | null = null;
  private customColorInput: HTMLInputElement | null = null;
  private opacityRange: HTMLInputElement | null = null;
  private smartTimeInput: HTMLInputElement | null = null;
  private smartStartInput: HTMLInputElement | null = null;
  private smartEndInput: HTMLInputElement | null = null;

  private readonly rootClassName = "petal-eye-care-enabled";
  private readonly baseVars = {
    background: "--petal-eye-care-base-background",
    surface: "--petal-eye-care-base-surface",
    surfaceLighter: "--petal-eye-care-base-surface-lighter",
    borderColor: "--petal-eye-care-base-border-color",
    protyleCodeBackground: "--petal-eye-care-base-protyle-code-background",
    backgroundLight: "--petal-eye-care-base-background-light",
    surfaceLight: "--petal-eye-care-base-surface-light",
  } as const;

  private readonly themeVars = {
    background: "--b3-theme-background",
    surface: "--b3-theme-surface",
    surfaceLighter: "--b3-theme-surface-lighter",
    borderColor: "--b3-border-color",
    protyleCodeBackground: "--b3-protyle-code-background",
    backgroundLight: "--b3-theme-background-light",
    surfaceLight: "--b3-theme-surface-light",
  } as const;

  private t(key: string, fallback: string) {
    const v = this.i18n?.[key];
    return typeof v === "string" && v.trim() ? v : fallback;
  }

  public async onload() {
    await this.loadConfig();
    this.applyTheme();
    this.setupSmartTimer();
    this.registerCommands();
    this.setupSetting();
  }

  public onunload() {
    if (this.saveTimer) window.clearTimeout(this.saveTimer);
    if (this.smartTimer) window.clearInterval(this.smartTimer);
    this.saveTimer = null;
    this.smartTimer = null;
    this.lastSmartApplied = null;
    this.enabledInput = null;
    this.presetSelect = null;
    this.customColorInput = null;
    this.opacityRange = null;
    this.smartTimeInput = null;
    this.smartStartInput = null;
    this.smartEndInput = null;
    this.disableTheme();
  }

  private async loadConfig() {
    const raw = await this.loadData("config.json");
    const parsed = safeJsonParse<any>(raw);
    this.config = buildConfig(parsed ?? {});
  }

  private persistConfigDebounced() {
    if (this.saveTimer) window.clearTimeout(this.saveTimer);
    this.saveTimer = window.setTimeout(() => {
      this.saveTimer = null;
      void this.saveData("config.json", this.config).catch(() => {});
    }, 200);
  }

  private registerCommands() {
    this.addCommand({
      langKey: "toggleEyeCare",
      hotkey: "Ctrl+Alt+E",
      callback: () => {
        if (this.config.smartTime.enabled) {
          this.config.smartTime.enabled = false;
          this.smartTimeInput && (this.smartTimeInput.checked = false);
          this.setupSmartTimer();
        }
        this.config.enabled = !this.config.enabled;
        this.enabledInput && (this.enabledInput.checked = this.config.enabled);
        this.applyTheme();
        this.persistConfigDebounced();
      },
    });
    this.addCommand({
      langKey: "openSettings",
      hotkey: "",
      callback: () => {
        this.openSetting();
      },
    });
  }

  private setupSetting() {
    this.setting = new Setting({
      confirmCallback: () => {},
    });

    this.setting.addItem({
      title: this.t("enabled", "Enable eye-care mode"),
      actionElement: this.createEnabledSwitch(),
    });

    this.setting.addItem({
      title: this.t("preset", "Color preset"),
      actionElement: this.createPresetSelect(),
    });

    this.setting.addItem({
      title: this.t("customColor", "Custom color (HEX/RGB)"),
      actionElement: this.createCustomColorInput(),
    });

    this.setting.addItem({
      title: this.t("opacity", "Tint strength"),
      actionElement: this.createOpacityRange(),
    });

    this.setting.addItem({
      title: this.t("smartTime", "Smart time mode"),
      description: this.t("smartTimeDesc", "Automatically enable/disable based on system time."),
      actionElement: this.createSmartTimeSwitch(),
    });

    this.setting.addItem({
      title: this.t("smartTimeStart", "Start time (HH:mm)"),
      actionElement: this.createSmartStartInput(),
    });

    this.setting.addItem({
      title: this.t("smartTimeEnd", "End time (HH:mm)"),
      actionElement: this.createSmartEndInput(),
    });

    this.setting.addItem({
      title: "",
      actionElement: this.createImportExportActions(),
      direction: "row",
    });
  }

  private createEnabledSwitch() {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "b3-switch fn__flex-center";
    input.checked = this.config.enabled;
    input.addEventListener("change", () => {
      this.config.enabled = input.checked;
      if (this.config.smartTime.enabled) {
        this.config.smartTime.enabled = false;
        this.smartTimeInput && (this.smartTimeInput.checked = false);
        this.setupSmartTimer();
      }
      this.applyTheme();
      this.persistConfigDebounced();
    });
    this.enabledInput = input;
    return input;
  }

  private createPresetSelect() {
    const select = document.createElement("select");
    select.className = "b3-select fn__block";
    const options: Array<{ id: PresetId; label: string }> = [
      { id: "yellow", label: this.t("presetYellow", "Soft yellow") },
      { id: "green", label: this.t("presetGreen", "Soft green") },
      { id: "gray", label: this.t("presetGray", "Soft gray") },
      { id: "almond", label: this.t("presetAlmond", "Almond") },
      { id: "rose", label: this.t("presetRose", "Rose") },
      { id: "lavender", label: this.t("presetLavender", "Lavender") },
      { id: "cyan", label: this.t("presetCyan", "Cyan") },
      { id: "alice", label: this.t("presetAlice", "Alice Blue") },
      { id: "honey", label: this.t("presetHoney", "Honeydew") },
      { id: "cornsilk", label: this.t("presetCornsilk", "Cornsilk") },
      { id: "antique", label: this.t("presetAntique", "Antique White") },
      { id: "wheat", label: this.t("presetWheat", "Wheat") },
      { id: "parchment", label: this.t("presetParchment", "Parchment") },
      { id: "custom", label: this.t("presetCustom", "Custom") },
    ];
    select.innerHTML = options.map((o) => `<option value="${o.id}">${o.label}</option>`).join("");
    select.value = this.config.preset;
    select.addEventListener("change", () => {
      const next = select.value as PresetId;
      if (
        ![
          "yellow",
          "green",
          "gray",
          "almond",
          "rose",
          "lavender",
          "cyan",
          "alice",
          "honey",
          "cornsilk",
          "antique",
          "wheat",
          "parchment",
          "custom",
        ].includes(next)
      )
        return;
      this.config.preset = next;
      this.applyTheme();
      this.persistConfigDebounced();
    });
    this.presetSelect = select;
    return select;
  }

  private createCustomColorInput() {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "b3-text-field fn__block";
    input.value = this.config.customColor;
    input.addEventListener("input", () => {
      this.config.customColor = input.value;
      if (this.config.preset === "custom" && !parseColorInput(this.config.customColor)) {
        showMessage(this.t("invalidColor", "Invalid color"), 3000, "error");
        return;
      }
      this.applyTheme();
      this.persistConfigDebounced();
    });
    this.customColorInput = input;
    return input;
  }

  private createOpacityRange() {
    const wrapper = document.createElement("div");
    wrapper.className = "fn__flex";
    const range = document.createElement("input");
    range.type = "range";
    range.className = "b3-slider fn__flex-1";
    range.min = "0";
    range.max = "50";
    range.step = "1";
    range.value = String(Math.round(this.config.opacity * 100));
    const tip = document.createElement("span");
    tip.className = "fn__space";
    const value = document.createElement("small");
    value.className = "fn__flex-center";
    value.style.whiteSpace = "nowrap";
    value.textContent = `${range.value}%`;
    const onChange = () => {
      const next = clamp(Number.parseInt(range.value, 10) / 100, 0, 0.5);
      this.config.opacity = next;
      value.textContent = `${Math.round(next * 100)}%`;
      this.applyTheme();
      this.persistConfigDebounced();
    };
    range.addEventListener("input", onChange);
    wrapper.append(range, tip, value);
    this.opacityRange = range;
    return wrapper;
  }

  private createSmartTimeSwitch() {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "b3-switch fn__flex-center";
    input.checked = this.config.smartTime.enabled;
    input.addEventListener("change", () => {
      this.config.smartTime.enabled = input.checked;
      this.setupSmartTimer();
      this.applyTheme();
      this.persistConfigDebounced();
    });
    this.smartTimeInput = input;
    return input;
  }

  private createSmartStartInput() {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "b3-text-field fn__block";
    input.value = this.config.smartTime.start;
    input.placeholder = "21:00";
    input.addEventListener("input", () => {
      this.config.smartTime.start = input.value;
      if (this.config.smartTime.enabled && parseTimeHHmm(this.config.smartTime.start) === null) {
        showMessage(this.t("invalidTime", "Invalid time"), 3000, "error");
        return;
      }
      this.applyTheme();
      this.persistConfigDebounced();
    });
    this.smartStartInput = input;
    return input;
  }

  private createSmartEndInput() {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "b3-text-field fn__block";
    input.value = this.config.smartTime.end;
    input.placeholder = "07:00";
    input.addEventListener("input", () => {
      this.config.smartTime.end = input.value;
      if (this.config.smartTime.enabled && parseTimeHHmm(this.config.smartTime.end) === null) {
        showMessage(this.t("invalidTime", "Invalid time"), 3000, "error");
        return;
      }
      this.applyTheme();
      this.persistConfigDebounced();
    });
    this.smartEndInput = input;
    return input;
  }

  private createImportExportActions() {
    const wrap = document.createElement("div");
    wrap.className = "fn__flex";

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/json,.json";
    fileInput.className = "fn__none";
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files?.[0];
      fileInput.value = "";
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = safeJsonParse<any>(text);
        const next = parsed?.config ? buildConfig(parsed.config) : buildConfig(parsed);
        this.config = next;
        this.syncSettingUI();
        this.applyTheme(true);
        this.persistConfigDebounced();
        showMessage(this.t("importSuccess", "Imported"), 2500, "info");
      } catch {
        showMessage(this.t("importFailed", "Import failed"), 3000, "error");
      }
    });

    const importBtn = document.createElement("button");
    importBtn.className = "b3-button b3-button--text";
    importBtn.textContent = this.t("importConfig", "Import");
    importBtn.addEventListener("click", () => fileInput.click());

    const exportBtn = document.createElement("button");
    exportBtn.className = "b3-button b3-button--text";
    exportBtn.textContent = this.t("exportConfig", "Export");
    exportBtn.addEventListener("click", () => {
      const payload: ExportedConfig = {
        version: 1,
        exportedAt: new Date().toISOString(),
        config: this.config,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${this.name}-config.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showMessage(this.t("exportSuccess", "Exported"), 2500, "info");
    });

    const resetBtn = document.createElement("button");
    resetBtn.className = "b3-button b3-button--text";
    resetBtn.textContent = this.t("resetConfig", "Reset");
    resetBtn.addEventListener("click", () => {
      this.config = buildConfig(DEFAULT_CONFIG);
      this.syncSettingUI();
      this.applyTheme(true);
      this.persistConfigDebounced();
    });

    wrap.append(importBtn, exportBtn, resetBtn, fileInput);
    return wrap;
  }

  private syncSettingUI() {
    if (this.enabledInput) this.enabledInput.checked = this.config.enabled;
    if (this.presetSelect) this.presetSelect.value = this.config.preset;
    if (this.customColorInput) this.customColorInput.value = this.config.customColor;
    if (this.opacityRange) this.opacityRange.value = String(Math.round(this.config.opacity * 100));
    if (this.smartTimeInput) this.smartTimeInput.checked = this.config.smartTime.enabled;
    if (this.smartStartInput) this.smartStartInput.value = this.config.smartTime.start;
    if (this.smartEndInput) this.smartEndInput.value = this.config.smartTime.end;
  }

  private setupSmartTimer() {
    if (this.smartTimer) window.clearInterval(this.smartTimer);
    this.smartTimer = null;
    this.lastSmartApplied = null;
    if (!this.config.smartTime.enabled) return;
    this.tickSmartTime();
    this.smartTimer = window.setInterval(() => this.tickSmartTime(), 30_000);
  }

  private tickSmartTime() {
    if (!this.config.smartTime.enabled) return;
    const start = parseTimeHHmm(this.config.smartTime.start);
    const end = parseTimeHHmm(this.config.smartTime.end);
    if (start === null || end === null) return;
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const shouldEnable = shouldEnableByTime(nowMinutes, start, end);
    if (this.lastSmartApplied === shouldEnable) return;
    this.lastSmartApplied = shouldEnable;
    this.config.enabled = shouldEnable;
    if (this.enabledInput) this.enabledInput.checked = shouldEnable;
    this.applyTheme(true);
    this.persistConfigDebounced();
  }

  private applyTheme(forceRebase = false) {
    const tint = getTintRGB(this.config);
    if (!tint) {
      if (this.config.preset === "custom") return;
    }
    if (!this.config.enabled) {
      this.disableTheme();
      return;
    }
    this.enableTheme(tint ?? PRESET_RGB.yellow, forceRebase);
  }

  private disableTheme() {
    const root = document.documentElement;
    root.classList.remove(this.rootClassName);
    Object.values(this.baseVars).forEach((v) => root.style.removeProperty(v));
    root.style.removeProperty("--petal-eye-care-tint");
    root.style.removeProperty("--petal-eye-care-mix");
  }

  private enableTheme(tint: RGB, forceRebase: boolean) {
    const root = document.documentElement;
    this.captureBaseVars(root, forceRebase);
    root.style.setProperty("--petal-eye-care-tint", rgbToCSSVarValue(tint));
    root.style.setProperty("--petal-eye-care-mix", opacityToPercent(this.config.opacity));
    root.classList.add(this.rootClassName);
  }

  private captureBaseVars(root: HTMLElement, force: boolean) {
    const shouldCapture = force || Object.values(this.baseVars).some((v) => !root.style.getPropertyValue(v).trim());
    if (!shouldCapture) return;
    const wasEnabled = root.classList.contains(this.rootClassName);
    if (wasEnabled) root.classList.remove(this.rootClassName);
    const cs = getComputedStyle(root);
    const read = (name: string, fallback: string) => {
      const v = cs.getPropertyValue(name).trim();
      return v || fallback;
    };
    const background = read(this.themeVars.background, "#ffffff");
    const surface = read(this.themeVars.surface, background);
    const surfaceLighter = read(this.themeVars.surfaceLighter, surface);
    const borderColor = read(this.themeVars.borderColor, "rgba(0,0,0,0.12)");
    const protyleCodeBackground = read(this.themeVars.protyleCodeBackground, surface);
    const backgroundLight = read(this.themeVars.backgroundLight, background);
    const surfaceLight = read(this.themeVars.surfaceLight, surface);
    root.style.setProperty(this.baseVars.background, background);
    root.style.setProperty(this.baseVars.surface, surface);
    root.style.setProperty(this.baseVars.surfaceLighter, surfaceLighter);
    root.style.setProperty(this.baseVars.borderColor, borderColor);
    root.style.setProperty(this.baseVars.protyleCodeBackground, protyleCodeBackground);
    root.style.setProperty(this.baseVars.backgroundLight, backgroundLight);
    root.style.setProperty(this.baseVars.surfaceLight, surfaceLight);
    if (wasEnabled) root.classList.add(this.rootClassName);
  }
}
