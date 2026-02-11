const test = require("node:test");
const assert = require("node:assert/strict");

const createFakeRoot = () => {
  const classSet = new Set();
  const styleMap = new Map();
  return {
    classList: {
      add: (c) => classSet.add(c),
      remove: (c) => classSet.delete(c),
      contains: (c) => classSet.has(c),
    },
    style: {
      setProperty: (k, v) => styleMap.set(k, String(v)),
      removeProperty: (k) => styleMap.delete(k),
      getPropertyValue: (k) => styleMap.get(k) ?? "",
      _dump: () => Object.fromEntries(styleMap.entries()),
    },
  };
};

const createDomElement = (tagName) => {
  const listeners = new Map();
  const children = [];
  const el = {
    tagName: String(tagName).toUpperCase(),
    className: "",
    type: "",
    value: "",
    checked: false,
    files: null,
    accept: "",
    placeholder: "",
    style: {},
    innerHTML: "",
    textContent: "",
    href: "",
    download: "",
    _children: children,
    addEventListener: (type, cb) => {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(cb);
    },
    dispatch: async (type) => {
      const cbs = listeners.get(type) ?? [];
      for (const cb of cbs) {
        const ret = cb.call(el, { type, target: el });
        if (ret && typeof ret.then === "function") await ret;
      }
    },
    append: (...els) => {
      for (const c of els) children.push(c);
    },
    appendChild: (c) => children.push(c),
    remove: () => {},
    click: () => {
      const cbs = listeners.get("click") ?? [];
      for (const cb of cbs) cb.call(el, { type: "click", target: el });
    },
  };
  return el;
};

const setupGlobals = (themeVars) => {
  const root = createFakeRoot();
  const anchors = [];
  const messages = [];
  global.document = {
    documentElement: root,
    body: {
      appendChild: (el) => {
        if (el && el.tagName === "A") anchors.push(el);
      },
    },
    createElement: (tag) => createDomElement(tag),
  };
  global.window = global;
  global.URL = {
    createObjectURL: () => "blob://test",
    revokeObjectURL: () => {},
  };
  global.__messages = messages;
  global.getComputedStyle = () => ({
    getPropertyValue: (k) => themeVars[k] ?? "",
  });
  const requireHook = (id) => {
    if (id === "siyuan") {
      class Setting {
        constructor(_opts = {}) {
          this.items = [];
        }
        addItem(item) {
          this.items.push(item);
        }
        open(_name) {}
      }
      class Plugin {
        constructor() {
          this.i18n = {};
          this.displayName = "Eye Care Theme";
          this.name = "eye-care-theme";
          this.commands = [];
          this._store = {};
        }
        addCommand(cmd) {
          this.commands.push(cmd);
        }
        openSetting() {
          this.setting?.open?.(this.displayName || this.name);
        }
        async loadData(storageName) {
          return this._store[storageName] ?? "";
        }
        async saveData(storageName, data) {
          this._store[storageName] = data;
          return data;
        }
        async removeData(storageName) {
          delete this._store[storageName];
          return null;
        }
      }
      return {
        Plugin,
        Setting,
        showMessage: (msg) => messages.push(msg),
      };
    }
    return require(id);
  };
  global.require = requireHook;
  return { root, anchors, messages };
};

const loadPluginModule = () => {
  delete require.cache[require.resolve("../index.js")];
  return require("../index.js");
};

const withFakeDate = (isoString, fn) => {
  const RealDate = global.Date;
  class FakeDate extends RealDate {
    constructor(...args) {
      if (args.length === 0) {
        super(isoString);
      } else {
        super(...args);
      }
    }
    static now() {
      return new RealDate(isoString).getTime();
    }
  }
  global.Date = FakeDate;
  try {
    fn();
  } finally {
    global.Date = RealDate;
  }
};

test("parseColorInput supports hex and rgb", () => {
  setupGlobals({});
  const mod = loadPluginModule();
  const t = mod.__test__;
  assert.deepEqual(t.parseColorInput("#ff00aa"), { r: 255, g: 0, b: 170 });
  assert.deepEqual(t.parseColorInput("ff00aa"), { r: 255, g: 0, b: 170 });
  assert.deepEqual(t.parseColorInput("rgb(1, 2, 3)"), { r: 1, g: 2, b: 3 });
  assert.deepEqual(t.parseColorInput("1 2 3"), { r: 1, g: 2, b: 3 });
  assert.equal(t.parseColorInput("rgb(999, 0, 0)"), null);
  assert.equal(t.parseColorInput("#abcd"), null);
});

test("time helpers work for normal and cross-midnight ranges", () => {
  setupGlobals({});
  const mod = loadPluginModule();
  const t = mod.__test__;
  assert.equal(t.parseTimeHHmm("00:00"), 0);
  assert.equal(t.parseTimeHHmm("23:59"), 1439);
  assert.equal(t.parseTimeHHmm("24:00"), null);
  assert.equal(t.shouldEnableByTime(22 * 60, 21 * 60, 7 * 60), true);
  assert.equal(t.shouldEnableByTime(6 * 60, 21 * 60, 7 * 60), true);
  assert.equal(t.shouldEnableByTime(12 * 60, 21 * 60, 7 * 60), false);
  assert.equal(t.shouldEnableByTime(12 * 60, 8 * 60, 18 * 60), true);
});

test("plugin enable/disable updates root class and variables", () => {
  const themeVars = {
    "--b3-theme-background": "#111111",
    "--b3-theme-surface": "#222222",
    "--b3-theme-surface-lighter": "#333333",
    "--b3-border-color": "rgba(0,0,0,0.1)",
    "--b3-protyle-code-background": "#444444",
    "--b3-theme-background-light": "#555555",
    "--b3-theme-surface-light": "#666666",
  };
  const { root } = setupGlobals(themeVars);
  const mod = loadPluginModule();
  const PluginClass = mod.default;
  const plugin = new PluginClass({});
  plugin["config"] = mod.__test__.buildConfig({
    enabled: true,
    preset: "yellow",
    opacity: 0.2,
    customColor: "#ffffff",
    smartTime: { enabled: false, start: "21:00", end: "07:00" },
  });
  plugin["applyTheme"](true);
  assert.equal(root.classList.contains("petal-eye-care-enabled"), true);
  const dump = root.style._dump();
  assert.ok(dump["--petal-eye-care-base-background"]);
  assert.equal(dump["--petal-eye-care-mix"], "20%");
  plugin["config"].enabled = false;
  plugin["applyTheme"]();
  assert.equal(root.classList.contains("petal-eye-care-enabled"), false);
  const dump2 = root.style._dump();
  assert.equal(dump2["--petal-eye-care-base-background"], undefined);
});

test("smart time mode toggles enabled state and persists changes", async () => {
  const themeVars = {
    "--b3-theme-background": "#111111",
    "--b3-theme-surface": "#222222",
    "--b3-theme-surface-lighter": "#333333",
    "--b3-border-color": "rgba(0,0,0,0.1)",
    "--b3-protyle-code-background": "#444444",
    "--b3-theme-background-light": "#555555",
    "--b3-theme-surface-light": "#666666",
  };
  setupGlobals(themeVars);
  const mod = loadPluginModule();
  const PluginClass = mod.default;
  const plugin = new PluginClass({});
  plugin["config"] = mod.__test__.buildConfig({
    enabled: false,
    preset: "yellow",
    opacity: 0.18,
    customColor: "#ffffff",
    smartTime: { enabled: true, start: "21:00", end: "07:00" },
  });
  plugin["persistConfigDebounced"] = () => {
    plugin._persistCalled = (plugin._persistCalled ?? 0) + 1;
  };
  withFakeDate("2026-02-11T22:00:00.000Z", () => {
    plugin["tickSmartTime"]();
  });
  assert.equal(plugin["config"].enabled, true);
  assert.equal(plugin._persistCalled, 1);
  withFakeDate("2026-02-11T12:00:00.000Z", () => {
    plugin["tickSmartTime"]();
  });
  assert.equal(plugin["config"].enabled, false);
  assert.equal(plugin._persistCalled, 2);
});

test("buildConfig clamps opacity and validates preset", () => {
  setupGlobals({});
  const mod = loadPluginModule();
  const t = mod.__test__;
  const cfg = t.buildConfig({
    enabled: "x",
    preset: "nope",
    opacity: 99,
    customColor: 123,
    smartTime: { enabled: 1, start: 1, end: 2 },
  });
  assert.equal(cfg.enabled, true);
  assert.equal(cfg.preset, "yellow");
  assert.equal(cfg.opacity, 0.5);
  assert.equal(cfg.customColor, "123");
  assert.equal(cfg.smartTime.enabled, true);
  assert.equal(cfg.smartTime.start, "1");
  assert.equal(cfg.smartTime.end, "2");
});

test("onload wires commands and settings, export button works", async () => {
  const themeVars = {
    "--b3-theme-background": "#111111",
    "--b3-theme-surface": "#222222",
    "--b3-theme-surface-lighter": "#333333",
    "--b3-border-color": "rgba(0,0,0,0.1)",
    "--b3-protyle-code-background": "#444444",
    "--b3-theme-background-light": "#555555",
    "--b3-theme-surface-light": "#666666",
  };
  const { root, anchors } = setupGlobals(themeVars);
  const mod = loadPluginModule();
  const PluginClass = mod.default;
  const plugin = new PluginClass({});
  plugin.loadData = async () => ({
    enabled: true,
    preset: "custom",
    customColor: "rgb(10, 20, 30)",
    opacity: 0.12,
    smartTime: { enabled: false, start: "21:00", end: "07:00" },
  });
  await plugin.onload();
  assert.equal(root.classList.contains("petal-eye-care-enabled"), true);
  assert.equal(plugin.commands.length, 2);
  assert.ok(plugin.setting.items.length >= 6);
  const exportWrap = plugin["createImportExportActions"]();
  const exportBtn = exportWrap._children.find((c) => c && typeof c.textContent === "string" && c.textContent.toLowerCase().includes("export"));
  exportBtn.click();
  assert.equal(anchors.length, 1);
});

test("persistConfigDebounced writes config after delay", async () => {
  setupGlobals({});
  const mod = loadPluginModule();
  const PluginClass = mod.default;
  const plugin = new PluginClass({});
  plugin.saveData = async (_name, data) => {
    plugin._saved = data;
    return data;
  };
  plugin["config"] = mod.__test__.buildConfig({ enabled: true, preset: "yellow", opacity: 0.11, customColor: "#fff", smartTime: { enabled: false, start: "21:00", end: "07:00" } });
  plugin["persistConfigDebounced"]();
  await new Promise((r) => setTimeout(r, 260));
  assert.equal(plugin._saved.enabled, true);
});

test("toggle command flips enabled and disables smart time", async () => {
  const themeVars = {
    "--b3-theme-background": "#111111",
    "--b3-theme-surface": "#222222",
    "--b3-theme-surface-lighter": "#333333",
    "--b3-border-color": "rgba(0,0,0,0.1)",
    "--b3-protyle-code-background": "#444444",
    "--b3-theme-background-light": "#555555",
    "--b3-theme-surface-light": "#666666",
  };
  const { root } = setupGlobals(themeVars);
  const mod = loadPluginModule();
  const PluginClass = mod.default;
  const plugin = new PluginClass({});
  plugin.loadData = async () => ({
    enabled: false,
    preset: "yellow",
    customColor: "#ffffff",
    opacity: 0.2,
    smartTime: { enabled: true, start: "21:00", end: "07:00" },
  });
  await plugin.onload();
  assert.equal(plugin["config"].smartTime.enabled, true);
  plugin.commands.find((c) => c.langKey === "toggleEyeCare").callback();
  assert.equal(plugin["config"].enabled, true);
  assert.equal(plugin["config"].smartTime.enabled, false);
  assert.equal(root.classList.contains("petal-eye-care-enabled"), true);
});

test("invalid custom color shows message when preset is custom", async () => {
  global.__eyeCareTestMessages = [];
  setupGlobals({});
  const mod = loadPluginModule();
  const PluginClass = mod.default;
  const plugin = new PluginClass({});
  plugin["config"] = mod.__test__.buildConfig({
    enabled: true,
    preset: "custom",
    customColor: "#ffffff",
    opacity: 0.2,
    smartTime: { enabled: false, start: "21:00", end: "07:00" },
  });
  const input = plugin["createCustomColorInput"]();
  input.value = "bad-color";
  await input.dispatch("input");
  assert.equal(global.__eyeCareTestMessages.length >= 1, true);
});
