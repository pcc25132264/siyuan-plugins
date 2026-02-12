"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.__test__ = void 0;
const DEFAULT_STYLE_CONFIG = {
    nodeBorderWidth: 1,
    handleBorderWidth: 1,
    nodeShadow: "0 10px 26px rgba(15,23,42,.10)",
    kinds: {
        default: { accent: "#6366F1", background: "", glyph: "•" },
        question: { accent: "#F59E0B", background: "color-mix(in srgb, #FFFBEB 78%, var(--b3-theme-background))", glyph: "?" },
        assumption: { accent: "#A855F7", background: "color-mix(in srgb, #FAF5FF 78%, var(--b3-theme-background))", glyph: "△" },
        situation: { accent: "#60A5FA", background: "color-mix(in srgb, #EFF6FF 72%, var(--b3-theme-background))", glyph: "≡" },
        answer: { accent: "#22C55E", background: "color-mix(in srgb, #ECFDF5 78%, var(--b3-theme-background))", glyph: "✓" },
        complication: { accent: "#F59E0B", background: "color-mix(in srgb, #FFFBEB 78%, var(--b3-theme-background))", glyph: "!" },
        group: { accent: "#94A3B8", background: "", glyph: "▦" },
    },
};
const normalizeStyleConfig = (raw) => {
    const obj = typeof raw === "object" && raw ? raw : {};
    const bw = Number(obj.nodeBorderWidth);
    const hw = Number(obj.handleBorderWidth);
    const nodeBorderWidth = Number.isFinite(bw) ? clamp(bw, 0, 6) : DEFAULT_STYLE_CONFIG.nodeBorderWidth;
    const handleBorderWidth = Number.isFinite(hw) ? clamp(hw, 0, 6) : DEFAULT_STYLE_CONFIG.handleBorderWidth;
    const nodeShadow = typeof obj.nodeShadow === "string" && obj.nodeShadow.trim() ? obj.nodeShadow.trim() : DEFAULT_STYLE_CONFIG.nodeShadow;
    const kindsRaw = obj.kinds && typeof obj.kinds === "object" ? obj.kinds : {};
    const outKinds = {};
    const keys = ["default", "question", "assumption", "situation", "answer", "complication", "group"];
    for (const k of keys) {
        const v = kindsRaw[k] || {};
        outKinds[k] = {
            accent: normalizeColor(typeof v.accent === "string" ? v.accent : DEFAULT_STYLE_CONFIG.kinds[k].accent),
            background: typeof v.background === "string" ? v.background : DEFAULT_STYLE_CONFIG.kinds[k].background,
            glyph: typeof v.glyph === "string" && v.glyph ? v.glyph : DEFAULT_STYLE_CONFIG.kinds[k].glyph,
        };
    }
    return { nodeBorderWidth, handleBorderWidth, nodeShadow, kinds: outKinds };
};
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const createId = () => {
    const rnd = Math.random().toString(16).slice(2);
    return `${Date.now().toString(16)}-${rnd}`;
};
const safeJsonParse = (raw) => {
    if (!raw)
        return null;
    if (typeof raw === "object")
        return raw;
    if (typeof raw !== "string")
        return null;
    try {
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
};
const debounce = (fn, waitMs) => {
    let timer = null;
    return (...args) => {
        if (timer)
            window.clearTimeout(timer);
        timer = window.setTimeout(() => {
            timer = null;
            fn(...args);
        }, waitMs);
    };
};
const downloadText = (filename, text, mime = "text/plain;charset=utf-8") => {
    const a = document.createElement("a");
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};
const normalizeColor = (raw) => {
    const v = String(raw || "").trim();
    if (!v)
        return "#6366F1";
    if (/^#[0-9a-fA-F]{6}$/.test(v))
        return v;
    return "#6366F1";
};
const getCenter = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};
const buildDefaultData = () => ({
    version: 1,
    nodes: [],
    edges: [],
});
const buildTemplate = (id) => {
    const inferKindFromColor = (normalized) => {
        const c = String(normalized || "").toUpperCase();
        if (c === "#22C55E" || c === "#10B981")
            return "answer";
        if (c === "#60A5FA" || c === "#0EA5E9")
            return "situation";
        if (c === "#A855F7")
            return "assumption";
        if (c === "#EF4444")
            return "complication";
        if (c === "#F97316" || c === "#F59E0B")
            return "question";
        return "default";
    };
    const node = (title, x, y, shape, color, kind) => {
        const normalized = normalizeColor(color);
        const resolvedKind = kind ?? inferKindFromColor(normalized);
        return {
            id: createId(),
            title,
            kind: resolvedKind,
            x,
            y,
            shape,
            color: normalized,
            blockId: "",
        };
    };
    const edge = (from, to, type) => ({
        id: createId(),
        from,
        to,
        type,
    });
    const base = buildDefaultData();
    const mk = (nodes, edges) => ({ version: 1, nodes, edges });
    if (id === "5w1h") {
        const c = node("主题", 380, 120, "rect", "#4F46E5", "default");
        const w = node("What", 220, 240, "rect", "#0EA5E9", "question");
        const why = node("Why", 380, 240, "rect", "#F97316", "question");
        const who = node("Who", 540, 240, "rect", "#10B981", "question");
        const when = node("When", 220, 360, "rect", "#A855F7", "question");
        const where = node("Where", 380, 360, "rect", "#EF4444", "question");
        const how = node("How", 540, 360, "rect", "#F59E0B", "question");
        return mk([c, w, why, who, when, where, how], [
            edge(c.id, w.id, "curve"),
            edge(c.id, why.id, "curve"),
            edge(c.id, who.id, "curve"),
            edge(c.id, when.id, "curve"),
            edge(c.id, where.id, "curve"),
            edge(c.id, how.id, "curve"),
        ]);
    }
    if (id === "pyramid") {
        const top = node("结论", 400, 120, "rect", "#4F46E5", "answer");
        const a = node("论点 A", 260, 260, "rect", "#0EA5E9", "assumption");
        const b = node("论点 B", 400, 260, "rect", "#10B981", "assumption");
        const c = node("论点 C", 540, 260, "rect", "#F97316", "assumption");
        const a1 = node("依据 A1", 220, 380, "rect", "#94A3B8", "situation");
        const a2 = node("依据 A2", 300, 380, "rect", "#94A3B8", "situation");
        const b1 = node("依据 B1", 380, 380, "rect", "#94A3B8", "situation");
        const b2 = node("依据 B2", 460, 380, "rect", "#94A3B8", "situation");
        const c1 = node("依据 C1", 540, 380, "rect", "#94A3B8", "situation");
        const c2 = node("依据 C2", 620, 380, "rect", "#94A3B8", "situation");
        return mk([top, a, b, c, a1, a2, b1, b2, c1, c2], [
            edge(top.id, a.id, "curve"),
            edge(top.id, b.id, "curve"),
            edge(top.id, c.id, "curve"),
            edge(a.id, a1.id, "polyline"),
            edge(a.id, a2.id, "polyline"),
            edge(b.id, b1.id, "polyline"),
            edge(b.id, b2.id, "polyline"),
            edge(c.id, c1.id, "polyline"),
            edge(c.id, c2.id, "polyline"),
        ]);
    }
    if (id === "swot") {
        const s = node("Strengths", 260, 180, "rect", "#10B981", "situation");
        const w = node("Weaknesses", 520, 180, "rect", "#EF4444", "situation");
        const o = node("Opportunities", 260, 360, "rect", "#0EA5E9", "situation");
        const t = node("Threats", 520, 360, "rect", "#F97316", "situation");
        return mk([s, w, o, t], []);
    }
    if (id === "pdca") {
        const p = node("Plan", 260, 220, "circle", "#4F46E5", "assumption");
        const d = node("Do", 520, 220, "circle", "#0EA5E9", "assumption");
        const c = node("Check", 520, 420, "circle", "#F97316", "situation");
        const a = node("Act", 260, 420, "circle", "#10B981", "answer");
        return mk([p, d, c, a], [
            edge(p.id, d.id, "curve"),
            edge(d.id, c.id, "curve"),
            edge(c.id, a.id, "curve"),
            edge(a.id, p.id, "curve"),
        ]);
    }
    if (id === "smart") {
        const s = node("Specific", 240, 200, "rect", "#4F46E5");
        const m = node("Measurable", 520, 200, "rect", "#0EA5E9");
        const a = node("Achievable", 240, 340, "rect", "#10B981");
        const r = node("Relevant", 520, 340, "rect", "#F97316");
        const t = node("Time-bound", 380, 460, "rect", "#EF4444");
        return mk([s, m, a, r, t], []);
    }
    if (id === "mece") {
        const root = node("问题", 400, 120, "rect", "#4F46E5", "question");
        const c1 = node("拆解 1", 240, 260, "rect", "#0EA5E9", "assumption");
        const c2 = node("拆解 2", 400, 260, "rect", "#10B981", "assumption");
        const c3 = node("拆解 3", 560, 260, "rect", "#F97316", "assumption");
        return mk([root, c1, c2, c3], [edge(root.id, c1.id, "curve"), edge(root.id, c2.id, "curve"), edge(root.id, c3.id, "curve")]);
    }
    if (id === "goldencircle") {
        const why = node("WHY", 400, 180, "circle", "#F97316");
        const how = node("HOW", 400, 320, "circle", "#0EA5E9");
        const what = node("WHAT", 400, 460, "circle", "#10B981");
        return mk([why, how, what], [edge(why.id, how.id, "curve"), edge(how.id, what.id, "curve")]);
    }
    if (id === "rice") {
        const r = node("Reach", 240, 220, "rect", "#0EA5E9");
        const i = node("Impact", 520, 220, "rect", "#10B981");
        const c = node("Confidence", 240, 360, "rect", "#F59E0B");
        const e = node("Effort", 520, 360, "rect", "#EF4444");
        const score = node("Score", 380, 120, "rect", "#4F46E5");
        return mk([score, r, i, c, e], [edge(score.id, r.id, "curve"), edge(score.id, i.id, "curve"), edge(score.id, c.id, "curve"), edge(score.id, e.id, "curve")]);
    }
    if (id === "quadrant") {
        const q1 = node("重要且紧急", 260, 220, "rect", "#EF4444");
        const q2 = node("重要不紧急", 520, 220, "rect", "#10B981");
        const q3 = node("不重要但紧急", 260, 360, "rect", "#F59E0B");
        const q4 = node("不重要不紧急", 520, 360, "rect", "#94A3B8");
        return mk([q1, q2, q3, q4], []);
    }
    if (id === "scqa") {
        const s = node("Situation", 240, 220, "rect", "#0EA5E9", "situation");
        const c = node("Complication", 520, 220, "rect", "#F59E0B", "complication");
        const q = node("Question", 240, 360, "rect", "#4F46E5", "question");
        const a = node("Answer", 520, 360, "rect", "#10B981", "answer");
        return mk([s, c, q, a], [edge(s.id, c.id, "curve"), edge(c.id, q.id, "curve"), edge(q.id, a.id, "curve")]);
    }
    if (id === "5why") {
        const p = node("问题", 240, 260, "rect", "#EF4444", "question");
        const w1 = node("Why 1", 380, 260, "rect", "#F97316", "assumption");
        const w2 = node("Why 2", 520, 260, "rect", "#F59E0B", "assumption");
        const w3 = node("Why 3", 660, 260, "rect", "#10B981", "assumption");
        const w4 = node("Why 4", 800, 260, "rect", "#0EA5E9", "assumption");
        const w5 = node("Why 5", 940, 260, "rect", "#4F46E5", "assumption");
        return mk([p, w1, w2, w3, w4, w5], [edge(p.id, w1.id, "straight"), edge(w1.id, w2.id, "straight"), edge(w2.id, w3.id, "straight"), edge(w3.id, w4.id, "straight"), edge(w4.id, w5.id, "straight")]);
    }
    if (id === "decision-balance") {
        const decision = node("决策", 400, 120, "diamond", "#4F46E5");
        const pros = node("收益 / 支持", 260, 300, "rect", "#10B981");
        const cons = node("成本 / 反对", 540, 300, "rect", "#EF4444");
        return mk([decision, pros, cons], [edge(decision.id, pros.id, "curve"), edge(decision.id, cons.id, "curve")]);
    }
    return base;
};
class HistoryStack {
    constructor(limit = 60) {
        this.undoStack = [];
        this.redoStack = [];
        this.limit = limit;
    }
    push(state) {
        this.undoStack.push(state);
        if (this.undoStack.length > this.limit)
            this.undoStack.shift();
        this.redoStack = [];
    }
    canUndo() {
        return this.undoStack.length > 1;
    }
    canRedo() {
        return this.redoStack.length > 0;
    }
    undo() {
        if (!this.canUndo())
            return null;
        const cur = this.undoStack.pop();
        this.redoStack.push(cur);
        return this.undoStack[this.undoStack.length - 1] ?? null;
    }
    redo() {
        if (!this.canRedo())
            return null;
        const next = this.redoStack.pop();
        this.undoStack.push(next);
        return next;
    }
    reset(initial) {
        this.undoStack = [initial];
        this.redoStack = [];
    }
}
class MindchainEditor {
    constructor(options) {
        this.destroyed = false;
        this.viewport = { panX: 0, panY: 0, zoom: 1 };
        this.data = buildDefaultData();
        this.history = new HistoryStack(80);
        this.sidebarCollapsed = true;
        this.templateDropdownEl = null;
        this.templateDropdownCleanup = null;
        this.selectedNodes = new Set();
        this.selectedEdges = new Set();
        this.panning = false;
        this.panStart = null;
        this.draggingNodeId = null;
        this.dragStart = null;
        this.dragMoved = false;
        this.suppressNextInlineEdit = false;
        this.connectingFromNodeId = null;
        this.connectingEdgeType = "curve";
        this.tempEdgePath = null;
        this.nodeElements = new Map();
        this.graphlibMod = null;
        this.dagreMod = null;
        this.dagreLoading = null;
        this.api = options.api;
        this.i18n = options.i18n;
        this.app = options.app;
        this.root = options.root;
        this.docId = options.docId;
        this.styleConfig = normalizeStyleConfig(options.styleConfig);
        this.connectingEdgeType = options.edgeType;
        this.saveDataDebounced = debounce(() => this.saveToDocAttrs(), 600);
    }
    setEdgeType(next) {
        this.connectingEdgeType = next;
    }
    async init() {
        this.root.innerHTML = "";
        this.root.classList.add("mindchain-flow");
        if (this.sidebarCollapsed)
            this.root.classList.add("mindchain-flow--sidebar-collapsed");
        this.layoutEl = document.createElement("div");
        this.layoutEl.className = "mindchain-flow__layout";
        this.sidebarEl = document.createElement("div");
        this.sidebarEl.className = "mindchain-flow__sidebar";
        this.mainEl = document.createElement("div");
        this.mainEl.className = "mindchain-flow__main";
        this.toolbarEl = document.createElement("div");
        this.toolbarEl.className = "mindchain-flow__toolbar";
        this.canvasEl = document.createElement("div");
        this.canvasEl.className = "mindchain-flow__canvas";
        this.stageEl = document.createElement("div");
        this.stageEl.className = "mindchain-flow__stage";
        this.stageEl.style.position = "relative";
        this.stageEl.style.height = "100%";
        this.stageEl.style.width = "100%";
        this.stageEl.style.overflow = "hidden";
        this.edgeSvgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.edgeSvgEl.style.position = "absolute";
        this.edgeSvgEl.style.left = "0";
        this.edgeSvgEl.style.top = "0";
        this.edgeSvgEl.style.width = "100%";
        this.edgeSvgEl.style.height = "100%";
        this.edgeSvgEl.style.pointerEvents = "none";
        this.nodesLayerEl = document.createElement("div");
        this.nodesLayerEl.style.position = "absolute";
        this.nodesLayerEl.style.left = "0";
        this.nodesLayerEl.style.top = "0";
        this.nodesLayerEl.style.width = "100%";
        this.nodesLayerEl.style.height = "100%";
        this.stageEl.appendChild(this.edgeSvgEl);
        this.stageEl.appendChild(this.nodesLayerEl);
        this.canvasEl.appendChild(this.stageEl);
        this.mainEl.appendChild(this.toolbarEl);
        this.mainEl.appendChild(this.canvasEl);
        this.layoutEl.appendChild(this.sidebarEl);
        this.layoutEl.appendChild(this.mainEl);
        this.root.appendChild(this.layoutEl);
        this.mountSidebar();
        this.mountToolbar();
        this.mountCanvasEvents();
        this.applyStyleConfigToRoot();
        await this.ensureDagreLoaded();
        await this.loadFromDocAttrs();
        this.history.reset(this.cloneData(this.data));
        this.renderAll();
    }
    setStyleConfig(next) {
        this.styleConfig = normalizeStyleConfig(next);
        this.applyStyleConfigToRoot();
        this.renderAll();
    }
    applyStyleConfigToRoot() {
        this.root.style.setProperty("--mindchain-node-border-width", `${this.styleConfig.nodeBorderWidth}px`);
        this.root.style.setProperty("--mindchain-handle-border-width", `${this.styleConfig.handleBorderWidth}px`);
        this.root.style.setProperty("--mindchain-node-shadow", this.styleConfig.nodeShadow);
    }
    destroy() {
        this.destroyed = true;
        this.closeTemplateDropdown();
        this.root.innerHTML = "";
        this.nodeElements.clear();
        this.selectedNodes.clear();
        this.selectedEdges.clear();
    }
    mountToolbar() {
        const icon = (id) => {
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("class", "mindchain-icon");
            svg.setAttribute("viewBox", "0 0 24 24");
            const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
            use.setAttribute("href", `#${id}`);
            use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#${id}`);
            svg.appendChild(use);
            return svg;
        };
        const iconBtn = (label, iconId, onClick) => {
            const b = document.createElement("button");
            b.className = "b3-button b3-button--text mindchain-iconbtn";
            b.title = label;
            b.setAttribute("aria-label", label);
            b.appendChild(icon(iconId));
            b.addEventListener("click", onClick);
            return b;
        };
        const sep = () => {
            const s = document.createElement("div");
            s.className = "fn__space";
            return s;
        };
        const templateBtn = iconBtn(this.i18n.toolbarTemplate || "Templates", "iconMCTemplates", () => {
            this.toggleTemplateDropdown(templateBtn);
        });
        this.toolbarEl.appendChild(templateBtn);
        this.toolbarEl.appendChild(iconBtn(this.i18n.toolbarFitView || "Fit", "iconMCFit", () => this.fitView()));
        this.toolbarEl.appendChild(sep());
        this.toolbarEl.appendChild(iconBtn("添加问题", "iconMCAddQuestion", () => void this.addNodeAtViewportCenter(false, "question")));
        this.toolbarEl.appendChild(iconBtn("添加假设", "iconMCAddAssumption", () => void this.addNodeAtViewportCenter(false, "assumption")));
        this.toolbarEl.appendChild(iconBtn("添加事实", "iconMCAddSituation", () => void this.addNodeAtViewportCenter(false, "situation")));
        this.toolbarEl.appendChild(iconBtn("添加结论", "iconMCAddAnswer", () => void this.addNodeAtViewportCenter(false, "answer")));
        this.toolbarEl.appendChild(sep());
        this.toolbarEl.appendChild(iconBtn(this.i18n.toolbarUndo, "iconMCUndo", () => this.undo()));
        this.toolbarEl.appendChild(iconBtn(this.i18n.toolbarRedo, "iconMCRedo", () => this.redo()));
        this.toolbarEl.appendChild(sep());
        this.toolbarEl.appendChild(iconBtn(this.i18n.toolbarCopy, "iconMCCopy", () => void this.copySelection()));
        this.toolbarEl.appendChild(iconBtn(this.i18n.toolbarPaste, "iconMCPaste", () => void this.pasteFromClipboard()));
        this.toolbarEl.appendChild(sep());
        this.toolbarEl.appendChild(iconBtn(this.i18n.toolbarImport, "iconMCImport", () => void this.importJSON()));
        this.toolbarEl.appendChild(iconBtn(this.i18n.toolbarExport, "iconMCExport", () => this.openExportDialog()));
    }
    mountSidebar() {
        this.sidebarEl.innerHTML = "";
    }
    getTemplateItems() {
        return [
            { id: "5w1h", title: "5W1H 分析法" },
            { id: "pyramid", title: "金字塔原理" },
            { id: "swot", title: "SWOT 分析" },
            { id: "pdca", title: "PDCA 循环" },
            { id: "smart", title: "SMART 目标法" },
            { id: "mece", title: "MECE 拆解法" },
            { id: "goldencircle", title: "黄金圈法则" },
            { id: "rice", title: "RICE 优先级评估" },
            { id: "quadrant", title: "四象限时间管理" },
            { id: "scqa", title: "SCQA 表达模型" },
            { id: "5why", title: "5Why 根因分析" },
            { id: "decision-balance", title: "决策平衡分析" },
        ];
    }
    closeTemplateDropdown() {
        try {
            this.templateDropdownCleanup?.();
        }
        catch { }
        this.templateDropdownCleanup = null;
        this.templateDropdownEl?.remove();
        this.templateDropdownEl = null;
    }
    toggleTemplateDropdown(anchor) {
        if (this.templateDropdownEl) {
            this.closeTemplateDropdown();
            return;
        }
        const templates = this.getTemplateItems();
        const pop = document.createElement("div");
        pop.className = "mindchain-templateDropdown";
        const search = document.createElement("input");
        search.type = "search";
        search.className = "b3-text-field fn__block mindchain-templateDropdown__search";
        search.placeholder = this.i18n.templateSearchPlaceholder || "Search";
        const list = document.createElement("div");
        list.className = "mindchain-templateDropdown__list";
        pop.appendChild(search);
        pop.appendChild(list);
        const render = (q) => {
            const query = (q || "").trim().toLowerCase();
            const filtered = query ? templates.filter((t) => t.title.toLowerCase().includes(query)) : templates;
            list.innerHTML = "";
            for (const t of filtered) {
                const b = document.createElement("button");
                b.type = "button";
                b.className = "mindchain-templateDropdown__item";
                b.textContent = t.title;
                b.addEventListener("click", async () => {
                    this.closeTemplateDropdown();
                    await this.applyTemplate(t.id);
                });
                list.appendChild(b);
            }
        };
        render("");
        search.addEventListener("input", () => render(search.value));
        pop.style.position = "fixed";
        pop.style.zIndex = "9999";
        document.body.appendChild(pop);
        const place = () => {
            const rect = anchor.getBoundingClientRect();
            const gap = 8;
            const maxW = 360;
            const w = Math.min(maxW, Math.max(260, Math.floor(window.innerWidth * 0.28)));
            pop.style.width = `${w}px`;
            const popRect = pop.getBoundingClientRect();
            const left = clamp(rect.left, 8, window.innerWidth - popRect.width - 8);
            const top = clamp(rect.bottom + gap, 8, window.innerHeight - popRect.height - 8);
            pop.style.left = `${left}px`;
            pop.style.top = `${top}px`;
        };
        place();
        setTimeout(() => place(), 0);
        search.focus();
        const onDown = (e) => {
            const t = e.target;
            if (pop.contains(t) || anchor.contains(t))
                return;
            this.closeTemplateDropdown();
        };
        const onKeyDown = (e) => {
            if (e.key === "Escape")
                this.closeTemplateDropdown();
        };
        const onResize = () => place();
        window.addEventListener("resize", onResize);
        document.addEventListener("mousedown", onDown, true);
        document.addEventListener("keydown", onKeyDown, true);
        this.templateDropdownEl = pop;
        this.templateDropdownCleanup = () => {
            window.removeEventListener("resize", onResize);
            document.removeEventListener("mousedown", onDown, true);
            document.removeEventListener("keydown", onKeyDown, true);
        };
    }
    mountCanvasEvents() {
        this.stageEl.addEventListener("pointerdown", (e) => {
            const target = e.target;
            const nodeEl = target.closest?.(".mindchain-node");
            if (nodeEl)
                return;
            if (e.button !== 0)
                return;
            this.clearSelection();
            this.panning = true;
            this.stageEl.setPointerCapture(e.pointerId);
            this.panStart = { x: e.clientX, y: e.clientY, panX: this.viewport.panX, panY: this.viewport.panY };
        });
        this.stageEl.addEventListener("pointermove", (e) => {
            if (this.panning && this.panStart) {
                const dx = e.clientX - this.panStart.x;
                const dy = e.clientY - this.panStart.y;
                this.viewport.panX = this.panStart.panX + dx;
                this.viewport.panY = this.panStart.panY + dy;
                this.applyViewport();
            }
            if (this.draggingNodeId && this.dragStart) {
                const node = this.data.nodes.find((n) => n.id === this.draggingNodeId);
                if (!node)
                    return;
                const dx = (e.clientX - this.dragStart.x) / this.viewport.zoom;
                const dy = (e.clientY - this.dragStart.y) / this.viewport.zoom;
                if (!this.dragMoved && (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5))
                    this.dragMoved = true;
                node.x = this.dragStart.nodeX + dx;
                node.y = this.dragStart.nodeY + dy;
                this.updateNodePosition(node.id);
                this.redrawEdges();
                this.saveDataDebounced();
            }
            if (this.connectingFromNodeId && this.tempEdgePath) {
                const fromEl = this.nodeElements.get(this.connectingFromNodeId);
                if (!fromEl)
                    return;
                const fromCenter = this.nodeCenterInStage(fromEl);
                const p = this.clientToStagePoint(e.clientX, e.clientY);
                this.tempEdgePath.setAttribute("d", this.edgePath(fromCenter.x, fromCenter.y, p.x, p.y, this.connectingEdgeType));
            }
        });
        this.stageEl.addEventListener("pointerup", (e) => {
            if (this.panning) {
                this.panning = false;
                this.panStart = null;
                return;
            }
            if (this.draggingNodeId) {
                this.draggingNodeId = null;
                this.dragStart = null;
                if (this.dragMoved) {
                    this.dragMoved = false;
                    this.pushHistory();
                }
                return;
            }
            if (this.connectingFromNodeId) {
                const target = document.elementFromPoint(e.clientX, e.clientY);
                const nodeEl = target?.closest?.(".mindchain-node");
                const toId = nodeEl?.dataset?.nodeId || "";
                const fromId = this.connectingFromNodeId;
                this.connectingFromNodeId = null;
                if (this.tempEdgePath) {
                    this.tempEdgePath.remove();
                    this.tempEdgePath = null;
                }
                if (toId && toId !== fromId) {
                    this.addEdge(fromId, toId, this.connectingEdgeType);
                }
            }
        });
        this.stageEl.addEventListener("wheel", (e) => {
            if (!e.ctrlKey)
                return;
            e.preventDefault();
            const delta = -e.deltaY;
            const zoomFactor = delta > 0 ? 1.08 : 0.92;
            const nextZoom = clamp(this.viewport.zoom * zoomFactor, 0.25, 2.5);
            const before = this.clientToStagePoint(e.clientX, e.clientY);
            this.viewport.zoom = nextZoom;
            this.applyViewport();
            const after = this.clientToStagePoint(e.clientX, e.clientY);
            this.viewport.panX += (after.x - before.x) * this.viewport.zoom;
            this.viewport.panY += (after.y - before.y) * this.viewport.zoom;
            this.applyViewport();
        }, { passive: false });
        this.root.addEventListener("keydown", (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
                e.preventDefault();
                if (e.shiftKey)
                    this.redo();
                else
                    this.undo();
                return;
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
                e.preventDefault();
                void this.copySelection();
                return;
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
                e.preventDefault();
                void this.pasteFromClipboard();
                return;
            }
            if (e.key === "Delete" || e.key === "Backspace") {
                e.preventDefault();
                void this.deleteSelection();
            }
        });
        this.root.tabIndex = 0;
    }
    applyViewport() {
        const { panX, panY, zoom } = this.viewport;
        const t = `translate(${panX}px, ${panY}px) scale(${zoom})`;
        this.nodesLayerEl.style.transformOrigin = "0 0";
        this.edgeSvgEl.style.transformOrigin = "0 0";
        this.nodesLayerEl.style.transform = t;
        this.edgeSvgEl.style.transform = t;
    }
    clientToStagePoint(clientX, clientY) {
        const rect = this.stageEl.getBoundingClientRect();
        const x = (clientX - rect.left - this.viewport.panX) / this.viewport.zoom;
        const y = (clientY - rect.top - this.viewport.panY) / this.viewport.zoom;
        return { x, y };
    }
    nodeCenterInStage(nodeEl) {
        const rect = nodeEl.getBoundingClientRect();
        const stageRect = this.stageEl.getBoundingClientRect();
        const cx = (rect.left - stageRect.left - this.viewport.panX + rect.width / 2) / this.viewport.zoom;
        const cy = (rect.top - stageRect.top - this.viewport.panY + rect.height / 2) / this.viewport.zoom;
        return { x: cx, y: cy };
    }
    renderAll() {
        this.applyViewport();
        this.renderNodes();
        this.redrawEdges();
    }
    renderNodes() {
        this.nodesLayerEl.innerHTML = "";
        this.nodeElements.clear();
        const inferKindFromTitle = (title) => {
            const t = String(title || "");
            if (/结论|答案|answer/i.test(t))
                return "answer";
            if (/假设|假說|hypothesis|assumption/i.test(t))
                return "assumption";
            if (/冲突|complication/i.test(t))
                return "complication";
            if (/问题|question/i.test(t))
                return "question";
            if (/事实|情境|situation/i.test(t))
                return "situation";
            return "default";
        };
        for (const node of this.data.nodes) {
            if (node.groupId) {
                const group = this.data.nodes.find((n) => n.id === node.groupId && n.isGroup);
                if (group?.collapsed)
                    continue;
            }
            const el = document.createElement("div");
            el.className = "mindchain-node";
            el.dataset.nodeId = node.id;
            el.dataset.shape = node.shape;
            if (node.isGroup)
                el.dataset.group = "1";
            const titleForKind = String(node.title || "");
            const kind = node.isGroup ? "group" : (node.kind || inferKindFromTitle(titleForKind));
            el.dataset.kind = kind;
            el.style.position = "absolute";
            el.style.left = `${node.x}px`;
            el.style.top = `${node.y}px`;
            const kindStyle = this.styleConfig.kinds[kind] || this.styleConfig.kinds.default;
            el.style.setProperty("--mindchain-kind-accent", kindStyle.accent);
            if (kindStyle.background)
                el.style.setProperty("--mindchain-node-bg", kindStyle.background);
            else
                el.style.removeProperty("--mindchain-node-bg");
            el.tabIndex = -1;
            const inner = document.createElement("div");
            inner.className = "mindchain-node__inner";
            const header = document.createElement("div");
            header.className = "mindchain-node__header";
            const glyph = document.createElement("div");
            glyph.className = "mindchain-node__glyph";
            glyph.textContent = kindStyle.glyph;
            const headerTitle = document.createElement("div");
            headerTitle.className = "mindchain-node__headerTitle";
            headerTitle.textContent = node.title || (node.isGroup ? "Group" : "Node");
            header.appendChild(glyph);
            header.appendChild(headerTitle);
            const meta = document.createElement("div");
            meta.className = "mindchain-node__meta";
            const pill = document.createElement("span");
            pill.className = "mindchain-node__pill";
            pill.textContent = node.isGroup ? "GROUP" : node.shape.toUpperCase();
            meta.appendChild(pill);
            const actions = document.createElement("div");
            actions.className = "mindchain-node__actions";
            const iconEl = (id) => {
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.setAttribute("class", "mindchain-icon");
                svg.setAttribute("viewBox", "0 0 24 24");
                const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
                use.setAttribute("href", `#${id}`);
                use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#${id}`);
                svg.appendChild(use);
                return svg;
            };
            const btnIcon = (titleText, iconId, onClick) => {
                const b = document.createElement("button");
                b.type = "button";
                b.className = "mindchain-iconbtn";
                b.title = titleText;
                b.setAttribute("aria-label", titleText);
                b.appendChild(iconEl(iconId));
                b.addEventListener("click", onClick);
                return b;
            };
            const btnDel = btnIcon(this.i18n.nodeDelete, "iconMCTrash", (ev) => {
                ev.stopPropagation();
                void this.deleteNode(node.id);
            });
            btnDel.classList.add("mindchain-iconbtn--danger");
            if (node.isGroup) {
                const btnCollapse = btnIcon(this.i18n.groupCollapse, "iconMCCollapse", (ev) => {
                    ev.stopPropagation();
                    node.collapsed = !node.collapsed;
                    this.pushHistory();
                    this.saveDataDebounced();
                    this.renderAll();
                });
                actions.appendChild(btnCollapse);
            }
            actions.appendChild(btnDel);
            header.appendChild(actions);
            inner.appendChild(header);
            const body = document.createElement("div");
            body.className = "mindchain-node__body";
            body.textContent = (node.body || "").trim();
            if (!body.textContent)
                body.dataset.placeholder = "点击输入…";
            inner.appendChild(body);
            inner.appendChild(meta);
            const beginInlineEdit = (field) => {
                if (this.suppressNextInlineEdit) {
                    this.suppressNextInlineEdit = false;
                    return;
                }
                const targetEl = field === "title" ? headerTitle : body;
                if (targetEl.isContentEditable)
                    return;
                const original = targetEl.textContent || "";
                targetEl.contentEditable = "true";
                targetEl.spellcheck = false;
                targetEl.classList.add("is-editing");
                const onInput = () => {
                    const value = (targetEl.textContent || "").trimEnd();
                    if (field === "title")
                        node.title = value;
                    else
                        node.body = value;
                    if (field === "body") {
                        if (value.trim())
                            delete body.dataset.placeholder;
                        else
                            body.dataset.placeholder = "点击输入…";
                    }
                    this.saveDataDebounced();
                };
                const cleanup = () => {
                    targetEl.contentEditable = "false";
                    targetEl.classList.remove("is-editing");
                    targetEl.removeEventListener("input", onInput);
                    targetEl.removeEventListener("keydown", onKeyDown);
                    targetEl.removeEventListener("blur", onBlur);
                };
                const cancel = () => {
                    targetEl.textContent = original;
                    cleanup();
                };
                const onBlur = () => {
                    const value = (targetEl.textContent || "").trimEnd();
                    if (field === "title")
                        node.title = value;
                    else
                        node.body = value;
                    this.pushHistory();
                    this.saveDataDebounced();
                    void this.tryUpdateNodeBlock(node);
                    cleanup();
                    this.renderAll();
                };
                const onKeyDown = (e) => {
                    if (e.key === "Escape") {
                        e.preventDefault();
                        cancel();
                        return;
                    }
                    if (e.key === "Enter" && (field === "title" || !e.shiftKey)) {
                        e.preventDefault();
                        targetEl.blur?.();
                    }
                };
                targetEl.addEventListener("input", onInput);
                targetEl.addEventListener("keydown", onKeyDown);
                targetEl.addEventListener("blur", onBlur);
                targetEl.focus();
                const sel = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(targetEl);
                range.collapse(false);
                sel?.removeAllRanges();
                sel?.addRange(range);
            };
            headerTitle.addEventListener("click", (e) => {
                e.stopPropagation();
                this.root.focus();
                if (!this.selectedNodes.has(node.id)) {
                    this.clearSelection();
                    this.selectedNodes.add(node.id);
                    this.syncSelectionStyles();
                }
                beginInlineEdit("title");
            });
            body.addEventListener("click", (e) => {
                e.stopPropagation();
                this.root.focus();
                if (!this.selectedNodes.has(node.id)) {
                    this.clearSelection();
                    this.selectedNodes.add(node.id);
                    this.syncSelectionStyles();
                }
                beginInlineEdit("body");
            });
            el.appendChild(inner);
            const handle = document.createElement("div");
            handle.className = "mindchain-node__handle";
            handle.title = this.i18n.edgeType || "Connect";
            handle.addEventListener("pointerdown", (e) => {
                e.stopPropagation();
                if (e.button !== 0)
                    return;
                this.root.focus();
                this.startConnect(node.id);
                try {
                    this.stageEl.setPointerCapture(e.pointerId);
                }
                catch { }
            });
            el.appendChild(handle);
            el.addEventListener("pointerdown", (e) => {
                if (e.target.closest?.(".mindchain-node__actions"))
                    return;
                if (e.target.closest?.(".mindchain-node__headerTitle,.mindchain-node__body"))
                    return;
                if (e.target.isContentEditable)
                    return;
                if (e.button !== 0)
                    return;
                this.root.focus();
                if (e.altKey) {
                    this.startConnect(node.id);
                    return;
                }
                if (!this.selectedNodes.has(node.id)) {
                    if (!e.shiftKey)
                        this.clearSelection();
                    this.selectedNodes.add(node.id);
                    this.syncSelectionStyles();
                }
                else if (e.shiftKey) {
                    this.selectedNodes.delete(node.id);
                    this.syncSelectionStyles();
                }
                this.draggingNodeId = node.id;
                this.dragStart = { x: e.clientX, y: e.clientY, nodeX: node.x, nodeY: node.y };
                this.dragMoved = false;
                try {
                    el.setPointerCapture(e.pointerId);
                }
                catch { }
            });
            el.addEventListener("dblclick", (e) => {
                e.stopPropagation();
                if (node.isGroup) {
                    node.collapsed = !node.collapsed;
                    this.pushHistory();
                    this.saveDataDebounced();
                    this.renderAll();
                }
                else {
                    void this.openNodeEditor(node.id);
                }
            });
            this.nodesLayerEl.appendChild(el);
            this.nodeElements.set(node.id, el);
        }
        this.syncSelectionStyles();
    }
    syncSelectionStyles() {
        for (const [id, el] of this.nodeElements.entries()) {
            if (this.selectedNodes.has(id)) {
                el.classList.add("is-selected");
            }
            else {
                el.classList.remove("is-selected");
            }
        }
    }
    updateNodePosition(nodeId) {
        const node = this.data.nodes.find((n) => n.id === nodeId);
        const el = this.nodeElements.get(nodeId);
        if (!node || !el)
            return;
        el.style.left = `${node.x}px`;
        el.style.top = `${node.y}px`;
    }
    redrawEdges() {
        this.edgeSvgEl.innerHTML = "";
        const lineColor = "rgba(100,116,139,.65)";
        for (const edge of this.data.edges) {
            const fromEl = this.nodeElements.get(edge.from);
            const toEl = this.nodeElements.get(edge.to);
            if (!fromEl || !toEl)
                continue;
            const from = this.nodeCenterInStage(fromEl);
            const to = this.nodeCenterInStage(toEl);
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", this.edgePath(from.x, from.y, to.x, to.y, edge.type));
            path.setAttribute("fill", "none");
            path.setAttribute("stroke", lineColor);
            path.setAttribute("stroke-width", "2");
            path.setAttribute("stroke-linecap", "round");
            path.setAttribute("stroke-linejoin", "round");
            this.edgeSvgEl.appendChild(path);
        }
        if (this.tempEdgePath)
            this.edgeSvgEl.appendChild(this.tempEdgePath);
    }
    edgePath(x1, y1, x2, y2, type) {
        if (type === "straight") {
            return `M ${x1} ${y1} L ${x2} ${y2}`;
        }
        if (type === "polyline") {
            const mx = (x1 + x2) / 2;
            return `M ${x1} ${y1} L ${mx} ${y1} L ${mx} ${y2} L ${x2} ${y2}`;
        }
        const dx = Math.abs(x2 - x1);
        const c = clamp(dx * 0.5, 40, 220);
        return `M ${x1} ${y1} C ${x1 + c} ${y1}, ${x2 - c} ${y2}, ${x2} ${y2}`;
    }
    clearSelection() {
        this.selectedNodes.clear();
        this.selectedEdges.clear();
        this.syncSelectionStyles();
    }
    async loadFromDocAttrs() {
        const resp = await this.api.fetchSyncPost("/api/attr/getBlockAttrs", { id: this.docId });
        if (resp?.code === -1) {
            this.data = buildDefaultData();
            return;
        }
        const attrs = resp?.data || {};
        const raw = attrs["custom-mindchain-data"];
        const parsed = safeJsonParse(raw);
        if (parsed?.version === 1 && Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
            this.data = {
                version: 1,
                nodes: parsed.nodes.map((n) => ({
                    ...n,
                    shape: (["rect", "circle", "diamond"].includes(n.shape) ? n.shape : "rect"),
                    color: normalizeColor(n.color),
                    title: String(n.title || ""),
                    body: String(n.body || ""),
                    x: Number.isFinite(n.x) ? n.x : 0,
                    y: Number.isFinite(n.y) ? n.y : 0,
                    blockId: String(n.blockId || ""),
                })),
                edges: parsed.edges
                    .filter((e) => e && typeof e.from === "string" && typeof e.to === "string")
                    .map((e) => ({
                    ...e,
                    id: String(e.id || createId()),
                    type: (["straight", "curve", "polyline"].includes(e.type) ? e.type : "curve"),
                })),
            };
            await this.hydrateNodeBodies();
            return;
        }
        this.data = buildDefaultData();
    }
    async saveToDocAttrs() {
        if (this.destroyed)
            return;
        try {
            await this.api.fetchSyncPost("/api/attr/setBlockAttrs", {
                id: this.docId,
                attrs: {
                    "custom-mindchain": "1",
                    "custom-mindchain-data": JSON.stringify(this.data),
                },
            });
        }
        catch {
            this.api.showMessage(this.i18n.errorCreateDoc, 4000, "error");
        }
    }
    cloneData(data) {
        return {
            version: 1,
            nodes: data.nodes.map((n) => ({ ...n })),
            edges: data.edges.map((e) => ({ ...e })),
        };
    }
    pushHistory() {
        this.history.push(this.cloneData(this.data));
    }
    undo() {
        const prev = this.history.undo();
        if (!prev)
            return;
        this.data = this.cloneData(prev);
        this.clearSelection();
        this.renderAll();
        this.saveDataDebounced();
    }
    redo() {
        const next = this.history.redo();
        if (!next)
            return;
        this.data = this.cloneData(next);
        this.clearSelection();
        this.renderAll();
        this.saveDataDebounced();
    }
    async ensureNodeBlock(docId, node) {
        if (node.blockId)
            return node.blockId;
        const title = node.isGroup ? `**${node.title || "Group"}**` : node.title || "Node";
        const resp = await this.api.fetchSyncPost("/api/block/appendBlock", {
            parentID: docId,
            dataType: "markdown",
            data: title,
        });
        const id = resp?.data?.[0]?.doOperations?.[0]?.id;
        if (typeof id === "string" && id) {
            node.blockId = id;
            return id;
        }
        return "";
    }
    async tryUpdateNodeBlock(node) {
        if (!node.blockId)
            return;
        const title = String(node.title || (node.isGroup ? "Group" : "Node")).trim();
        const body = String(node.body || "").trim();
        const md = body ? `**${title}**\n${body}` : `**${title}**`;
        try {
            await this.api.fetchSyncPost("/api/block/updateBlock", { id: node.blockId, dataType: "markdown", data: md });
        }
        catch { }
    }
    stripKramdown(raw) {
        const s = String(raw || "");
        return s
            .replace(/\{:[^}]*\}/g, "")
            .replace(/<[^>]+>/g, "")
            .replace(/\n{3,}/g, "\n\n")
            .trim();
    }
    async getBlockText(blockId) {
        const id = String(blockId || "").trim();
        if (!id)
            return "";
        try {
            const resp = await this.api.fetchSyncPost("/api/block/getBlockKramdown", { id });
            const k = resp?.data?.kramdown;
            if (typeof k === "string" && k.trim())
                return this.stripKramdown(k);
        }
        catch { }
        try {
            const resp = await this.api.fetchSyncPost("/api/block/getBlockMarkdown", { id });
            const md = resp?.data?.markdown;
            if (typeof md === "string" && md.trim())
                return this.stripKramdown(md);
        }
        catch { }
        return "";
    }
    async hydrateNodeBodies() {
        const jobs = [];
        for (const n of this.data.nodes) {
            if (typeof n.body !== "string")
                n.body = "";
            if (n.body?.trim())
                continue;
            if (!n.blockId)
                continue;
            jobs.push((async () => {
                const text = await this.getBlockText(n.blockId);
                if (text)
                    n.body = text;
            })());
        }
        await Promise.all(jobs);
    }
    async addNodeAtViewportCenter(isGroup, kind) {
        const stageRect = this.stageEl.getBoundingClientRect();
        const center = this.clientToStagePoint(stageRect.left + stageRect.width / 2, stageRect.top + stageRect.height / 2);
        const resolvedKind = !isGroup && kind ? kind : undefined;
        const kindTitle = resolvedKind === "question"
            ? "问题"
            : resolvedKind === "assumption"
                ? "假设"
                : resolvedKind === "situation"
                    ? "事实"
                    : resolvedKind === "answer"
                        ? "结论"
                        : "Node";
        const kindColor = resolvedKind === "question"
            ? "#F59E0B"
            : resolvedKind === "assumption"
                ? "#A855F7"
                : resolvedKind === "situation"
                    ? "#60A5FA"
                    : resolvedKind === "answer"
                        ? "#22C55E"
                        : "#4F46E5";
        const node = {
            id: createId(),
            title: isGroup ? "Group" : kindTitle,
            kind: resolvedKind,
            x: Math.round(center.x - 80),
            y: Math.round(center.y - 40),
            shape: isGroup ? "rect" : "rect",
            color: isGroup ? "#94A3B8" : kindColor,
            blockId: "",
            isGroup,
        };
        await this.ensureNodeBlock(this.docId, node);
        this.data.nodes.push(node);
        this.pushHistory();
        this.saveDataDebounced();
        this.renderAll();
        this.fitView();
        this.selectedNodes.clear();
        this.selectedNodes.add(node.id);
        this.syncSelectionStyles();
    }
    startConnect(fromNodeId) {
        this.connectingFromNodeId = fromNodeId;
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "rgba(99,102,241,.9)");
        path.setAttribute("stroke-width", "2.5");
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        path.setAttribute("stroke-dasharray", "6 6");
        this.tempEdgePath = path;
        this.redrawEdges();
    }
    addEdge(from, to, type) {
        const exist = this.data.edges.find((e) => e.from === from && e.to === to);
        if (exist)
            return;
        this.data.edges.push({ id: createId(), from, to, type });
        this.pushHistory();
        this.saveDataDebounced();
        this.renderAll();
    }
    async deleteNode(nodeId) {
        const node = this.data.nodes.find((n) => n.id === nodeId);
        if (!node)
            return;
        if (node.blockId) {
            try {
                await this.api.fetchSyncPost("/api/block/deleteBlock", { id: node.blockId });
            }
            catch {
                this.api.showMessage(this.i18n.errorCreateDoc, 4000, "error");
            }
        }
        this.data.nodes = this.data.nodes.filter((n) => n.id !== nodeId);
        this.data.edges = this.data.edges.filter((e) => e.from !== nodeId && e.to !== nodeId);
        for (const n of this.data.nodes) {
            if (n.groupId === nodeId)
                n.groupId = undefined;
        }
        this.selectedNodes.delete(nodeId);
        this.pushHistory();
        this.saveDataDebounced();
        this.renderAll();
    }
    async deleteSelection() {
        const ids = Array.from(this.selectedNodes.values());
        for (const id of ids) {
            await this.deleteNode(id);
        }
    }
    async openNodeEditor(nodeId) {
        const node = this.data.nodes.find((n) => n.id === nodeId);
        if (!node)
            return;
        const blockId = await this.ensureNodeBlock(this.docId, node);
        if (!blockId)
            return;
        const contentId = `mindchain-protyle-${createId()}`;
        const html = `<div class="b3-dialog__content">
  <div id="${contentId}" style="height: 56vh;"></div>
</div>
<div class="b3-dialog__action">
  <button class="b3-button b3-button--text">${window.siyuan?.languages?.confirm || "OK"}</button>
</div>`;
        const dialog = new this.api.Dialog({
            title: node.title || this.i18n.nodeEdit,
            content: html,
            width: "860px",
            height: "70vh",
        });
        const mount = dialog.element.querySelector(`#${contentId}`);
        if (!mount)
            return;
        let protyle;
        try {
            protyle = new this.api.Protyle(this.app, mount, {
                blockId,
                action: [this.api.Constants.CB_GET_ALL],
                render: {
                    background: false,
                    title: false,
                    titleShowTop: false,
                    hideTitleOnZoom: false,
                    gutter: true,
                    scroll: false,
                    breadcrumb: false,
                    breadcrumbDocName: false,
                },
            });
        }
        catch {
            dialog.destroy();
            this.api.showMessage(this.i18n.errorLoadRuntime, 5000, "error");
            return;
        }
        const btnOk = dialog.element.querySelector(".b3-dialog__action .b3-button");
        btnOk?.addEventListener("click", () => {
            try {
                protyle?.destroy?.();
            }
            catch { }
            dialog.destroy();
        });
    }
    openNodeStyleDialog(nodeId) {
        const node = this.data.nodes.find((n) => n.id === nodeId);
        if (!node)
            return;
        const contentId = `mindchain-style-${createId()}`;
        const shapeId = `${contentId}-shape`;
        const colorId = `${contentId}-color`;
        const titleId = `${contentId}-title`;
        const html = `<div class="b3-dialog__content">
  <div class="fn__flex fn__flex-column" style="gap: 10px;">
    <label class="b3-label">
      <div class="b3-label__text">${this.i18n.nodeStyle}</div>
      <select id="${shapeId}" class="b3-select fn__block">
        <option value="rect">Rect</option>
        <option value="circle">Circle</option>
        <option value="diamond">Diamond</option>
      </select>
    </label>
    <label class="b3-label">
      <div class="b3-label__text">${this.i18n.nodeColor}</div>
      <input id="${colorId}" class="b3-text-field fn__block" value="${node.color || ""}" placeholder="#6366F1" />
    </label>
    <label class="b3-label">
      <div class="b3-label__text">Title</div>
      <input id="${titleId}" class="b3-text-field fn__block" value="${(node.title || "").replace(/"/g, "&quot;")}" />
    </label>
  </div>
</div>
<div class="b3-dialog__action">
  <button class="b3-button b3-button--cancel">${window.siyuan?.languages?.cancel || "Cancel"}</button>
  <div class="fn__space"></div>
  <button class="b3-button b3-button--text">${window.siyuan?.languages?.confirm || "OK"}</button>
</div>`;
        const dialog = new this.api.Dialog({ title: this.i18n.nodeStyle, content: html, width: "520px" });
        const shapeEl = dialog.element.querySelector(`#${shapeId}`);
        const colorEl = dialog.element.querySelector(`#${colorId}`);
        const titleEl = dialog.element.querySelector(`#${titleId}`);
        if (shapeEl)
            shapeEl.value = node.shape;
        const btns = dialog.element.querySelectorAll(".b3-dialog__action .b3-button");
        const btnCancel = btns[0];
        const btnOk = btns[1];
        btnCancel?.addEventListener("click", () => dialog.destroy());
        btnOk?.addEventListener("click", () => {
            const nextShape = shapeEl?.value || "rect";
            if (nextShape === "rect" || nextShape === "circle" || nextShape === "diamond") {
                node.shape = nextShape;
            }
            node.color = normalizeColor(colorEl?.value || "");
            node.title = String(titleEl?.value || "");
            this.pushHistory();
            this.saveDataDebounced();
            this.renderAll();
            dialog.destroy();
        });
    }
    async copySelection() {
        const nodeIds = Array.from(this.selectedNodes.values());
        const nodes = this.data.nodes.filter((n) => nodeIds.includes(n.id));
        const edges = this.data.edges.filter((e) => nodeIds.includes(e.from) && nodeIds.includes(e.to));
        const payload = { version: 1, nodes, edges };
        const text = JSON.stringify(payload, null, 2);
        try {
            await navigator.clipboard.writeText(text);
        }
        catch {
            downloadText("mindchain-selection.json", text, "application/json;charset=utf-8");
        }
    }
    async pasteFromClipboard() {
        let text = "";
        try {
            text = await navigator.clipboard.readText();
        }
        catch {
            this.api.showMessage(this.i18n.importJSON, 2600, "info");
            return;
        }
        const parsed = safeJsonParse(text);
        if (!parsed?.nodes?.length)
            return;
        const map = new Map();
        const stageRect = this.stageEl.getBoundingClientRect();
        const center = this.clientToStagePoint(stageRect.left + stageRect.width / 2, stageRect.top + stageRect.height / 2);
        const baseX = parsed.nodes[0].x;
        const baseY = parsed.nodes[0].y;
        const newNodes = [];
        for (const n of parsed.nodes) {
            const id = createId();
            map.set(n.id, id);
            const nn = {
                ...n,
                id,
                x: center.x + (n.x - baseX) + 24,
                y: center.y + (n.y - baseY) + 24,
                blockId: "",
                color: normalizeColor(n.color),
            };
            await this.ensureNodeBlock(this.docId, nn);
            newNodes.push(nn);
        }
        const newEdges = [];
        for (const e of parsed.edges || []) {
            const from = map.get(e.from);
            const to = map.get(e.to);
            if (!from || !to)
                continue;
            newEdges.push({ id: createId(), from, to, type: (e.type || "curve") });
        }
        this.data.nodes.push(...newNodes);
        this.data.edges.push(...newEdges);
        this.pushHistory();
        this.saveDataDebounced();
        this.renderAll();
        this.fitView();
        this.clearSelection();
        for (const n of newNodes)
            this.selectedNodes.add(n.id);
        this.syncSelectionStyles();
    }
    async importJSON() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json";
        input.addEventListener("change", async () => {
            const file = input.files?.[0];
            if (!file)
                return;
            const text = await file.text();
            const parsed = safeJsonParse(text);
            if (!parsed || parsed.version !== 1)
                return;
            for (const n of parsed.nodes) {
                n.id = String(n.id || createId());
                n.blockId = "";
                n.color = normalizeColor(n.color);
                await this.ensureNodeBlock(this.docId, n);
            }
            for (const e of parsed.edges) {
                e.id = String(e.id || createId());
                e.type = (["straight", "curve", "polyline"].includes(e.type) ? e.type : "curve");
            }
            this.data = parsed;
            this.history.reset(this.cloneData(this.data));
            this.clearSelection();
            this.saveDataDebounced();
            this.renderAll();
            this.fitView();
        });
        input.click();
    }
    openExportDialog() {
        const contentId = `mindchain-export-${createId()}`;
        const html = `<div class="b3-dialog__content">
  <div id="${contentId}" class="mindchain-dock__actions"></div>
</div>`;
        const dialog = new this.api.Dialog({
            title: this.i18n.toolbarExport,
            content: html,
            width: "420px",
        });
        const host = dialog.element.querySelector(`#${contentId}`);
        if (!host)
            return;
        const makeBtn = (text, cb) => {
            const b = document.createElement("button");
            b.className = "b3-button b3-button--text";
            b.textContent = text;
            b.addEventListener("click", async () => {
                await cb();
                dialog.destroy();
            });
            return b;
        };
        host.appendChild(makeBtn(this.i18n.exportJSON, () => this.exportJSON()));
        host.appendChild(makeBtn(this.i18n.exportMarkdown, () => this.exportMarkdown()));
        host.appendChild(makeBtn(this.i18n.exportPNG, () => this.exportPNG()));
        host.appendChild(makeBtn(this.i18n.exportPDF, () => this.exportPDF()));
    }
    exportJSON() {
        downloadText(`mindchain-${this.docId}.json`, JSON.stringify(this.data, null, 2), "application/json;charset=utf-8");
    }
    exportMarkdown() {
        const nodes = this.data.nodes.map((n) => `- ${n.title || n.id} (${n.shape})`).join("\n");
        const edges = this.data.edges.map((e) => {
            const from = this.data.nodes.find((n) => n.id === e.from)?.title || e.from;
            const to = this.data.nodes.find((n) => n.id === e.to)?.title || e.to;
            return `- ${from} -> ${to} (${e.type})`;
        }).join("\n");
        const md = `# MindChain\n\n## Nodes\n\n${nodes || "- (empty)"}\n\n## Edges\n\n${edges || "- (empty)"}\n`;
        downloadText(`mindchain-${this.docId}.md`, md, "text/markdown;charset=utf-8");
    }
    getVisibleNodes() {
        return this.data.nodes.filter((node) => {
            if (node.groupId) {
                const group = this.data.nodes.find((n) => n.id === node.groupId && n.isGroup);
                if (group?.collapsed)
                    return false;
            }
            return true;
        });
    }
    exportSVGString() {
        const nodes = this.getVisibleNodes();
        const edges = this.data.edges.filter((e) => nodes.some((n) => n.id === e.from) && nodes.some((n) => n.id === e.to));
        const padding = 60;
        let minX = 0;
        let minY = 0;
        let maxX = 600;
        let maxY = 400;
        if (nodes.length) {
            minX = Number.POSITIVE_INFINITY;
            minY = Number.POSITIVE_INFINITY;
            maxX = Number.NEGATIVE_INFINITY;
            maxY = Number.NEGATIVE_INFINITY;
            for (const n of nodes) {
                const el = this.nodeElements.get(n.id);
                const w = el ? el.getBoundingClientRect().width / this.viewport.zoom : 180;
                const h = el ? el.getBoundingClientRect().height / this.viewport.zoom : 90;
                minX = Math.min(minX, n.x);
                minY = Math.min(minY, n.y);
                maxX = Math.max(maxX, n.x + w);
                maxY = Math.max(maxY, n.y + h);
            }
            minX -= padding;
            minY -= padding;
            maxX += padding;
            maxY += padding;
        }
        const width = Math.max(200, Math.ceil(maxX - minX));
        const height = Math.max(200, Math.ceil(maxY - minY));
        const esc = (s) => s
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
        const nodeSvg = nodes
            .map((n) => {
            const el = this.nodeElements.get(n.id);
            const w = el ? el.getBoundingClientRect().width / this.viewport.zoom : 180;
            const h = el ? el.getBoundingClientRect().height / this.viewport.zoom : 90;
            const x = n.x - minX;
            const y = n.y - minY;
            const stroke = n.color || "#6366F1";
            const fill = "var(--b3-theme-surface, #fff)";
            let shape = "";
            if (n.shape === "circle") {
                const r = Math.min(w, h) / 2;
                shape = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2" />`;
            }
            else if (n.shape === "diamond") {
                const cx = x + w / 2;
                const cy = y + h / 2;
                const pts = [
                    `${cx} ${y}`,
                    `${x + w} ${cy}`,
                    `${cx} ${y + h}`,
                    `${x} ${cy}`,
                ].join(" ");
                shape = `<polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="2" />`;
            }
            else {
                shape = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" ry="12" fill="${fill}" stroke="${stroke}" stroke-width="2" />`;
            }
            const title = esc(n.title || (n.isGroup ? "Group" : "Node"));
            const tx = x + 14;
            const ty = y + 26;
            const text = `<text x="${tx}" y="${ty}" font-size="14" font-family="system-ui, -apple-system, Segoe UI, Roboto" fill="var(--b3-theme-on-surface, #111827)">${title}</text>`;
            return `<g>${shape}${text}</g>`;
        })
            .join("");
        const edgeSvg = edges
            .map((e) => {
            const fromEl = this.nodeElements.get(e.from);
            const toEl = this.nodeElements.get(e.to);
            if (!fromEl || !toEl)
                return "";
            const from = this.nodeCenterInStage(fromEl);
            const to = this.nodeCenterInStage(toEl);
            const d = this.edgePath(from.x - minX, from.y - minY, to.x - minX, to.y - minY, e.type);
            return `<path d="${d}" fill="none" stroke="rgba(100,116,139,.75)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`;
        })
            .join("");
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="var(--b3-theme-background, #ffffff)" />
  ${edgeSvg}
  ${nodeSvg}
</svg>`;
    }
    async exportPNG() {
        const svg = this.exportSVGString();
        const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        const ratio = Math.max(1, Math.min(3, Math.round((window.devicePixelRatio || 1) * 2) / 2));
        await new Promise((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error("image load failed"));
            img.src = url;
        }).catch(() => { });
        const w = Math.max(1, img.naturalWidth || 1);
        const h = Math.max(1, img.naturalHeight || 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(w * ratio);
        canvas.height = Math.round(h * ratio);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            URL.revokeObjectURL(url);
            return;
        }
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        const dataURL = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = dataURL;
        a.download = `mindchain-${this.docId}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }
    exportPDF() {
        const svg = this.exportSVGString();
        const w = window.open("", "_blank");
        if (!w)
            return;
        w.document.open();
        w.document.write(`<!doctype html><html><head><meta charset="utf-8" />
<title>MindChain PDF</title>
<style>html,body{margin:0;padding:0} svg{width:100%;height:auto}</style>
</head><body>${svg}</body></html>`);
        w.document.close();
        w.focus();
        w.print();
    }
    openTemplateDialog() {
        const contentId = `mindchain-template-${createId()}`;
        const list = [
            { id: "5w1h", title: "5W1H 分析法" },
            { id: "pyramid", title: "金字塔原理" },
            { id: "swot", title: "SWOT 分析" },
            { id: "pdca", title: "PDCA 循环" },
            { id: "smart", title: "SMART 目标法" },
            { id: "mece", title: "MECE 拆解法" },
            { id: "goldencircle", title: "黄金圈法则" },
            { id: "rice", title: "RICE 优先级评估" },
            { id: "quadrant", title: "四象限时间管理" },
            { id: "scqa", title: "SCQA 表达模型" },
            { id: "5why", title: "5Why 根因分析" },
            { id: "decision-balance", title: "决策平衡分析" },
        ];
        const optionsHTML = list.map((it) => `<option value="${it.id}">${it.title}</option>`).join("");
        const html = `<div class="b3-dialog__content">
  <select id="${contentId}" class="b3-select fn__block">${optionsHTML}</select>
</div>
<div class="b3-dialog__action">
  <button class="b3-button b3-button--cancel">${window.siyuan?.languages?.cancel || "Cancel"}</button>
  <div class="fn__space"></div>
  <button class="b3-button b3-button--text">${window.siyuan?.languages?.confirm || "OK"}</button>
</div>`;
        const dialog = new this.api.Dialog({ title: this.i18n.toolbarTemplate, content: html, width: "520px" });
        const select = dialog.element.querySelector(`#${contentId}`);
        const btns = dialog.element.querySelectorAll(".b3-dialog__action .b3-button");
        const btnCancel = btns[0];
        const btnOk = btns[1];
        btnCancel?.addEventListener("click", () => dialog.destroy());
        btnOk?.addEventListener("click", async () => {
            const value = select?.value || "";
            await this.applyTemplate(value);
            dialog.destroy();
        });
    }
    async applyTemplate(templateId) {
        const tpl = buildTemplate(templateId);
        for (const n of tpl.nodes) {
            await this.ensureNodeBlock(this.docId, n);
        }
        this.data = tpl;
        this.applyDagreLayout("LR");
        this.history.reset(this.cloneData(this.data));
        this.clearSelection();
        this.saveDataDebounced();
        this.renderAll();
        this.fitView();
    }
    getNodeSize(nodeId) {
        const el = this.nodeElements.get(nodeId);
        if (!el)
            return { w: 180, h: 90 };
        const rect = el.getBoundingClientRect();
        const zoom = this.viewport.zoom || 1;
        return { w: rect.width / zoom, h: rect.height / zoom };
    }
    fitView() {
        const nodes = this.getVisibleNodes();
        const stageRect = this.stageEl.getBoundingClientRect();
        if (!stageRect.width || !stageRect.height)
            return;
        const padding = 72;
        let minX = Number.POSITIVE_INFINITY;
        let minY = Number.POSITIVE_INFINITY;
        let maxX = Number.NEGATIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;
        for (const n of nodes) {
            const { w, h } = this.getNodeSize(n.id);
            minX = Math.min(minX, n.x);
            minY = Math.min(minY, n.y);
            maxX = Math.max(maxX, n.x + w);
            maxY = Math.max(maxY, n.y + h);
        }
        if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
            this.viewport.zoom = 1;
            this.viewport.panX = 0;
            this.viewport.panY = 0;
            this.applyViewport();
            return;
        }
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;
        const contentW = Math.max(1, maxX - minX);
        const contentH = Math.max(1, maxY - minY);
        const zoom = clamp(Math.min(stageRect.width / contentW, stageRect.height / contentH), 0.25, 2.2);
        this.viewport.zoom = zoom;
        this.viewport.panX = (stageRect.width - contentW * zoom) / 2 - minX * zoom;
        this.viewport.panY = (stageRect.height - contentH * zoom) / 2 - minY * zoom;
        this.applyViewport();
    }
    async ensureDagreLoaded() {
        if (this.dagreMod?.graphlib?.Graph && typeof this.dagreMod.layout === "function")
            return this.dagreMod;
        if (this.dagreLoading)
            return this.dagreLoading;
        this.dagreLoading = (async () => {
            try {
                const w = window;
                if (!w._) {
                    try {
                        w._ = require("lodash");
                    }
                    catch { }
                }
                if (!w.graphlib) {
                    try {
                        const gl = require("./vendor/graphlib.min.js");
                        if (gl?.Graph) {
                            this.graphlibMod = gl;
                            w.graphlib = gl;
                        }
                    }
                    catch { }
                }
            }
            catch { }
            try {
                const mod = require("./vendor/dagre.min.js");
                if (mod?.graphlib?.Graph && typeof mod.layout === "function") {
                    this.dagreMod = mod;
                    return this.dagreMod;
                }
            }
            catch { }

            if (typeof window !== "undefined") {
                const loadScript = (src) => new Promise((resolve) => {
                    const s = document.createElement("script");
                    s.src = src;
                    s.onload = () => resolve(true);
                    s.onerror = () => resolve(false);
                    document.head.appendChild(s);
                });

                if (!window.graphlib) {
                    await loadScript("/plugins/mindchain-flow/vendor/graphlib.min.js");
                }
                await loadScript("/plugins/mindchain-flow/vendor/dagre.min.js");
                
                if (window.dagre && window.dagre.graphlib && window.dagre.layout) {
                     this.dagreMod = window.dagre;
                     return this.dagreMod;
                }
            }

            return null;
        })();
        const mod = await this.dagreLoading;
        this.dagreLoading = null;
        return mod;
    }
    getDagre() {
        if (this.dagreMod?.graphlib?.Graph && typeof this.dagreMod.layout === "function")
            return this.dagreMod;
        try {
            const w = window;
            if (!w._) {
                try {
                    w._ = require("lodash");
                }
                catch { }
            }
            if (!w.graphlib) {
                try {
                    const gl = require("./vendor/graphlib.min.js");
                    if (gl?.Graph) {
                        this.graphlibMod = gl;
                        w.graphlib = gl;
                    }
                }
                catch { }
            }
        }
        catch { }
        try {
            const mod = require("./vendor/dagre.min.js");
            if (mod?.graphlib?.Graph && typeof mod.layout === "function") {
                this.dagreMod = mod;
                return mod;
            }
        }
        catch { }
        return null;
    }
    applyDagreLayout(rankdir) {
        const dagre = this.getDagre();
        if (!dagre) {
            this.api.showMessage(this.i18n.errorLoadDagre || "Failed to load dagre", 5000, "error");
            return false;
        }
        const g = new dagre.graphlib.Graph();
        g.setGraph({ rankdir, nodesep: 48, ranksep: 72, marginx: 24, marginy: 24 });
        g.setDefaultEdgeLabel(() => ({}));
        const visible = this.getVisibleNodes();
        for (const n of visible) {
            const { w, h } = this.getNodeSize(n.id);
            g.setNode(n.id, { width: w, height: h });
        }
        for (const e of this.data.edges) {
            if (!g.hasNode(e.from) || !g.hasNode(e.to))
                continue;
            g.setEdge(e.from, e.to);
        }
        dagre.layout(g);
        for (const n of visible) {
            const nodeLayout = g.node(n.id);
            if (!nodeLayout)
                continue;
            const { w, h } = this.getNodeSize(n.id);
            n.x = Math.round(nodeLayout.x - w / 2);
            n.y = Math.round(nodeLayout.y - h / 2);
        }
        return true;
    }
    autoLayout(rankdir) {
        const ok = this.applyDagreLayout(rankdir);
        if (!ok)
            return;
        this.pushHistory();
        this.saveDataDebounced();
        this.renderAll();
        this.fitView();
    }
}
let api;
try {
    api = require("siyuan");
}
catch {
    api = {
        Plugin: class {
            constructor() {
                this.i18n = {};
                this.displayName = "MindChain";
                this.name = "mindchain-flow";
            }
            onload() { }
            onunload() { }
            addCommand(_cmd) { }
            addIcons(_svg) { }
            addTab(_options) { }
            addDock(_options) { }
            openSetting() { }
            async loadData(_storageName) { return ""; }
            async saveData(_storageName, data) { return data; }
            async removeData(_storageName) { return null; }
        },
        Setting: class {
            constructor(_options = {}) { }
            addItem(_options) { }
            open(_name) { }
        },
        Dialog: class {
            constructor(options) {
                const div = document.createElement("div");
                div.innerHTML = options.content;
                this.element = div;
            }
            destroy() { }
        },
        Protyle: class {
        },
        Constants: { CB_GET_ALL: "cb-get-all" },
        showMessage: (_msg) => { },
        fetchPost: (_url, _data, cb) => cb?.({ code: 0, data: null }),
        fetchSyncPost: async (_url, _data) => ({ code: 0, data: null }),
        openTab: (_options) => { },
    };
}
const { Plugin, Setting, showMessage, fetchSyncPost, openTab } = api;
const ICON_DEF = `
<symbol id="iconMindchainFlow" viewBox="0 0 24 24">
  <path d="M8.5 7.2a3 3 0 1 1 0 .1V7.2Zm0 0h7.1M15.5 7.2a3 3 0 1 1 0 .1V7.2ZM8.5 16.8a3 3 0 1 1 0 .1v-.1Zm0 0h7.1M15.5 16.8a3 3 0 1 1 0 .1v-.1ZM12 7.4v9.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</symbol>
<symbol id="iconMCTemplates" viewBox="0 0 24 24">
  <path d="M8 7h12M8 12h12M8 17h8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M5 6.5h.01M5 11.5h.01M5 16.5h.01" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
</symbol>
<symbol id="iconMCLayout" viewBox="0 0 24 24">
  <path d="M6 6h4v4H6zM14 6h4v4h-4zM10 14h4v4h-4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M10 8h4M12 10v4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
</symbol>
<symbol id="iconMCFit" viewBox="0 0 24 24">
  <path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9 9h6v6H9z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
</symbol>
<symbol id="iconMCPlus" viewBox="0 0 24 24">
  <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
</symbol>
<symbol id="iconMCAddQuestion" viewBox="0 0 24 24">
  <path d="M5 6h14a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H11l-4 3v-3H5a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M10.4 10.1a1.8 1.8 0 0 1 3.2 1c0 1.5-1.6 1.6-1.6 2.9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M12 16.6h.01" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
</symbol>
<symbol id="iconMCAddAssumption" viewBox="0 0 24 24">
  <path d="M12 4l9 16H3L12 4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M12 9v5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M12 16.8h.01" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
</symbol>
<symbol id="iconMCAddSituation" viewBox="0 0 24 24">
  <path d="M6 7h12M6 12h12M6 17h12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M4 7h.01M4 12h.01M4 17h.01" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
</symbol>
<symbol id="iconMCAddAnswer" viewBox="0 0 24 24">
  <path d="M20 7l-9 11-4-4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M4.5 6.8h.01" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
</symbol>
<symbol id="iconMCOpen" viewBox="0 0 24 24">
  <path d="M4 19V7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M4 12h18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
</symbol>
<symbol id="iconMCGroup" viewBox="0 0 24 24">
  <path d="M6.5 7.5h11v11h-11z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M6.5 11.5h11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
</symbol>
<symbol id="iconMCUndo" viewBox="0 0 24 24">
  <path d="M9 7H5v4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M5 11c2.2-2.6 5.2-4 8.5-4 4.4 0 7.5 2.6 7.5 6.5S17.9 20 13.5 20c-3.1 0-5.7-1.2-7.3-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
</symbol>
<symbol id="iconMCRedo" viewBox="0 0 24 24">
  <path d="M15 7h4v4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M19 11c-2.2-2.6-5.2-4-8.5-4C6.1 7 3 9.6 3 13.5S6.1 20 10.5 20c3.1 0 5.7-1.2 7.3-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
</symbol>
<symbol id="iconMCCopy" viewBox="0 0 24 24">
  <path d="M9 9h10v10H9z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M5 15H5V5h10v0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</symbol>
<symbol id="iconMCPaste" viewBox="0 0 24 24">
  <path d="M9 6h10v14H7V8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M9 4h4l1 2H8l1-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
</symbol>
<symbol id="iconMCImport" viewBox="0 0 24 24">
  <path d="M12 3v10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M8 9l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M5 21h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
</symbol>
<symbol id="iconMCExport" viewBox="0 0 24 24">
  <path d="M12 21V11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M16 15l-4-4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M5 3h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
</symbol>
<symbol id="iconMCEdit" viewBox="0 0 24 24">
  <path d="M4 20h4l11-11-4-4L4 16v4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M13 6l4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
</symbol>
<symbol id="iconMCStyle" viewBox="0 0 24 24">
  <path d="M12 3a7 7 0 0 0-7 7c0 3.2 2.3 5.7 5 7 1.6.8 2 1.1 2 2.5v1.5h4v-1.5c0-1.4.4-1.7 2-2.5 2.7-1.3 5-3.8 5-7a7 7 0 0 0-7-7z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M9 21h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
</symbol>
<symbol id="iconMCTrash" viewBox="0 0 24 24">
  <path d="M6 7h12l-1 14H7L6 7z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M9 7V4h6v3M4 7h16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M10 11v6M14 11v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
</symbol>
<symbol id="iconMCCollapse" viewBox="0 0 24 24">
  <path d="M8 10l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</symbol>
`.trim();
const TAB_TYPE = "mindchain";
const DOCK_TYPE = "dock";
const buildI18n = (i18n) => i18n || {};
const getFirstOpenNotebookId = () => {
    const notebooks = window.siyuan?.notebooks;
    if (!Array.isArray(notebooks))
        return "";
    const nb = notebooks.find((n) => n && !n.closed);
    return nb?.id || "";
};
const createMindchainDoc = async (app, title) => {
    const notebook = getFirstOpenNotebookId();
    if (!notebook) {
        showMessage(window.siyuan?.languages?.newFileTip || "No notebook", 3000, "error");
        return "";
    }
    const name = title || `MindChain ${new Date().toISOString().slice(0, 10)}`;
    const path = `/${name}.sy`;
    const resp = await fetchSyncPost("/api/filetree/createDocWithMd", { notebook, path, markdown: `# ${name}\n`, listDocTree: true });
    if (resp?.code !== 0 || !resp?.data)
        return "";
    const docId = String(resp.data);
    await fetchSyncPost("/api/attr/setBlockAttrs", {
        id: docId,
        attrs: {
            "custom-mindchain": "1",
            "custom-mindchain-data": JSON.stringify(buildDefaultData()),
        },
    });
    openTab({
        app,
        custom: {
            title: name,
            icon: "iconMindchainFlow",
            data: { docId },
            id: `mindchain-flow${TAB_TYPE}`,
        },
    });
    return docId;
};
class MindchainFlowPlugin extends Plugin {
    constructor() {
        super(...arguments);
        this.editors = new Map();
        this.dockRoot = null;
        this.styleConfig = DEFAULT_STYLE_CONFIG;
        this.edgeType = "curve";
    }
    async onload() {
        this.appRef = this.app;
        this.addIcons(ICON_DEF);
        try {
            const stored = await this.loadData("styleConfig");
            this.styleConfig = normalizeStyleConfig(stored);
        }
        catch {
            this.styleConfig = DEFAULT_STYLE_CONFIG;
        }
        try {
            const stored = await this.loadData("edgeType");
            const v = String(stored || "");
            this.edgeType = v === "straight" || v === "polyline" || v === "curve" ? v : "curve";
        }
        catch {
            this.edgeType = "curve";
        }
        this.addTab({
            type: TAB_TYPE,
            init: (custom) => {
                const docId = String(custom?.data?.docId || "");
                if (!docId)
                    return;
                const root = custom.element;
                const editor = new MindchainEditor({
                    api,
                    i18n: buildI18n(this.i18n),
                    app: this.appRef,
                    root,
                    docId,
                    styleConfig: this.styleConfig,
                    edgeType: this.edgeType,
                });
                this.editors.set(custom.id, editor);
                void editor.init();
            },
            destroy: () => { },
        });
        this.addDock({
            type: DOCK_TYPE,
            config: {
                icon: "iconMindchainFlow",
                title: buildI18n(this.i18n).dockTitle || "MindChain",
                position: "LeftTop",
                size: { width: 260, height: 0 },
                show: true,
            },
            data: null,
            init: (custom) => {
                this.dockRoot = custom?.element || null;
                if (this.dockRoot)
                    this.renderDock(this.dockRoot);
            },
        });
        this.addCommand({
            langKey: "commandCreate",
            langText: buildI18n(this.i18n).commandCreate,
            callback: () => {
                void createMindchainDoc(this.appRef, buildI18n(this.i18n).tabTitle);
            },
        });
        this.addCommand({
            langKey: "commandOpen",
            langText: buildI18n(this.i18n).commandOpen,
            callback: () => {
                void this.openMindchainForActiveDoc();
            },
        });
        this.setting = new Setting({});
        this.setting.addItem({
            title: buildI18n(this.i18n).settingsTheme || "Theme",
            description: buildI18n(this.i18n).settingsThemeDesc || "",
            createActionElement: () => {
                const wrap = document.createElement("div");
                const select = document.createElement("select");
                select.className = "b3-select fn__block";
                const i18n = buildI18n(this.i18n);
                select.innerHTML = [
                    `<option value="auto">${i18n.settingsThemeAuto || "Auto"}</option>`,
                    `<option value="light">${i18n.settingsThemeLight || "Light"}</option>`,
                    `<option value="dark">${i18n.settingsThemeDark || "Dark"}</option>`,
                ].join("");
                wrap.appendChild(select);
                select.addEventListener("change", () => {
                    void this.saveData("theme", select.value);
                });
                void this.loadData("theme").then((v) => {
                    if (typeof v === "string" && v)
                        select.value = v;
                });
                return wrap;
            },
        });
        this.setting.addItem({
            title: "连线类型",
            description: "设置新建连线的默认类型",
            createActionElement: () => {
                const wrap = document.createElement("div");
                const select = document.createElement("select");
                select.className = "b3-select fn__block";
                select.innerHTML = [
                    `<option value="curve">Curve</option>`,
                    `<option value="polyline">Polyline</option>`,
                    `<option value="straight">Straight</option>`,
                ].join("");
                select.value = this.edgeType;
                wrap.appendChild(select);
                select.addEventListener("change", () => {
                    const v = select.value;
                    const next = v === "straight" || v === "polyline" || v === "curve" ? v : "curve";
                    this.edgeType = next;
                    for (const ed of this.editors.values())
                        ed.setEdgeType(next);
                    void this.saveData("edgeType", next);
                });
                void this.loadData("edgeType").then((stored) => {
                    const v = String(stored || "");
                    const next = v === "straight" || v === "polyline" || v === "curve" ? v : "curve";
                    this.edgeType = next;
                    select.value = next;
                    for (const ed of this.editors.values())
                        ed.setEdgeType(next);
                });
                return wrap;
            },
        });
        this.setting.addItem({
            title: "样式与颜色",
            description: "使用 JSON 配置卡片边框/阴影/类型配色",
            createActionElement: () => {
                const wrap = document.createElement("div");
                const textarea = document.createElement("textarea");
                textarea.className = "b3-text-field fn__block";
                textarea.style.height = "240px";
                textarea.spellcheck = false;
                textarea.value = JSON.stringify(this.styleConfig, null, 2);
                const actions = document.createElement("div");
                actions.className = "fn__flex";
                actions.style.gap = "8px";
                actions.style.marginTop = "8px";
                const btnSave = document.createElement("button");
                btnSave.className = "b3-button b3-button--text";
                btnSave.textContent = window.siyuan?.languages?.save || "Save";
                const btnReset = document.createElement("button");
                btnReset.className = "b3-button b3-button--cancel";
                btnReset.textContent = window.siyuan?.languages?.reset || "Reset";
                const apply = async () => {
                    let parsed;
                    try {
                        parsed = JSON.parse(textarea.value || "");
                    }
                    catch {
                        showMessage("样式 JSON 解析失败", 4000, "error");
                        return;
                    }
                    const normalized = normalizeStyleConfig(parsed);
                    this.styleConfig = normalized;
                    for (const ed of this.editors.values())
                        ed.setStyleConfig(normalized);
                    try {
                        await this.saveData("styleConfig", normalized);
                    }
                    catch { }
                    textarea.value = JSON.stringify(this.styleConfig, null, 2);
                };
                btnSave.addEventListener("click", () => void apply());
                btnReset.addEventListener("click", () => {
                    this.styleConfig = DEFAULT_STYLE_CONFIG;
                    textarea.value = JSON.stringify(this.styleConfig, null, 2);
                    void apply();
                });
                actions.appendChild(btnSave);
                actions.appendChild(btnReset);
                wrap.appendChild(textarea);
                wrap.appendChild(actions);
                return wrap;
            },
        });
    }
    onunload() {
        for (const ed of this.editors.values())
            ed.destroy();
        this.editors.clear();
    }
    async queryMindchainDocs() {
        const sql = "select b.id as id, coalesce(t.value, b.content) as title, b.updated as updated from blocks b " +
            "join attributes a on a.block_id = b.id and a.name = 'custom-mindchain' and a.value = '1' " +
            "left join attributes t on t.block_id = b.id and t.name = 'title' " +
            "where b.type = 'd' " +
            "order by b.updated desc limit 500";
        try {
            const resp = await fetchSyncPost("/api/query/sql", { stmt: sql });
            const data = resp?.data;
            const rows = Array.isArray(data?.rows) ? data.rows : Array.isArray(data) ? data : Array.isArray(data?.blocks) ? data.blocks : [];
            return rows
                .map((r) => ({
                id: String(r?.id || ""),
                title: String(r?.title || r?.content || "").trim(),
                updated: r?.updated,
            }))
                .filter((r) => r.id);
        }
        catch {
            return [];
        }
    }
    openMindchainDoc(docId, title) {
        const t = String(title || "").trim() || buildI18n(this.i18n).tabTitle || "MindChain";
        openTab({
            app: this.appRef,
            custom: {
                title: t,
                icon: "iconMindchainFlow",
                data: { docId },
                id: `mindchain-flow${TAB_TYPE}`,
            },
        });
    }
    async deleteMindchainDoc(docId) {
        try {
            const sql = `select box, path from blocks where id = '${docId}' limit 1`;
            const resp = await fetchSyncPost("/api/query/sql", { stmt: sql });
            const row = resp?.data?.[0] || {};
            const notebook = String(row.box || "");
            const path = String(row.path || "");
            if (!notebook || !path)
                return false;
            const respDel = await fetchSyncPost("/api/filetree/removeDoc", { notebook, path });
            return respDel?.code === 0 || typeof respDel?.code === "undefined";
        }
        catch {
            return false;
        }
    }
    async renameMindchainDoc(docId, newTitleRaw) {
        const newTitle = String(newTitleRaw || "")
            .replace(/\r\n|\r|\n|\u2028|\u2029|\t/g, "")
            .replace(/\//g, "／")
            .trim();
        const finalTitle = newTitle ||
            String((window.siyuan?.languages || {})?.untitled || "Untitled");
        try {
            const resp = await fetchSyncPost("/api/filetree/renameDocByID", {
                id: docId,
                title: finalTitle,
            });
            if (resp?.code === 0 || typeof resp?.code === "undefined") {
                await fetchSyncPost("/api/attr/setBlockAttrs", {
                    id: docId,
                    attrs: { "custom-mindchain-title": finalTitle },
                });
                return finalTitle;
            }
            return false;
        }
        catch {
            return false;
        }
    }
    confirmDeleteMindchainDoc(docId, title, onDone) {
        const lang = window.siyuan?.languages || {};
        const dlgTitle = lang.deleteOpConfirm || buildI18n(this.i18n).nodeDelete || "Delete";
        const fileName = String(title || docId);
        const tip = lang.confirmDeleteTip ? String(lang.confirmDeleteTip).replace("${x}", fileName) : `Delete “${fileName}”?`;
        const html = `<div class="b3-dialog__content">${tip}</div>
<div class="b3-dialog__action">
  <button class="b3-button b3-button--cancel">${lang.cancel || "Cancel"}</button>
  <div class="fn__space"></div>
  <button class="b3-button b3-button--text">${lang.confirm || "OK"}</button>
</div>`;
        const dialog = new api.Dialog({ title: dlgTitle, content: html, width: "520px" });
        const btns = dialog.element.querySelectorAll(".b3-dialog__action .b3-button");
        const btnCancel = btns[0];
        const btnOk = btns[1];
        btnCancel?.addEventListener("click", () => dialog.destroy());
        btnOk?.addEventListener("click", () => {
            void (async () => {
                await this.deleteMindchainDoc(docId);
                dialog.destroy();
                onDone();
            })();
        });
    }
    renderDock(host) {
        host.innerHTML = "";
        host.classList.add("mindchain-dock");
        const actions = document.createElement("div");
        actions.className = "mindchain-dock__actions";
        const iconEl = (id) => {
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("class", "mindchain-icon");
            svg.setAttribute("viewBox", "0 0 24 24");
            const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
            use.setAttribute("href", `#${id}`);
            use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#${id}`);
            svg.appendChild(use);
            return svg;
        };
        const iconBtn = (label, iconId, onClick) => {
            const b = document.createElement("button");
            b.type = "button";
            b.className = "mindchain-iconbtn";
            b.title = label;
            b.setAttribute("aria-label", label);
            b.appendChild(iconEl(iconId));
            b.addEventListener("click", onClick);
            return b;
        };
        const i18n = buildI18n(this.i18n);
        const btnCreate = iconBtn(i18n.create || "Create", "iconMCPlus", (ev) => {
            ev.stopPropagation();
            void (async () => {
                await createMindchainDoc(this.appRef, i18n.tabTitle);
                if (this.dockRoot)
                    this.renderDock(this.dockRoot);
            })();
        });
        actions.appendChild(btnCreate);
        host.appendChild(actions);
        const search = document.createElement("input");
        search.type = "search";
        search.className = "b3-text-field fn__block mindchain-dock__search";
        search.placeholder = i18n.dockSearchPlaceholder || "Search";
        host.appendChild(search);
        const list = document.createElement("div");
        list.className = "mindchain-dock__list";
        host.appendChild(list);
        const formatUpdated = (v) => {
            const s = String(v ?? "").trim();
            if (/^\d{14}$/.test(s)) {
                const y = Number(s.slice(0, 4));
                const m = Number(s.slice(4, 6)) - 1;
                const d = Number(s.slice(6, 8));
                const hh = Number(s.slice(8, 10));
                const mm = Number(s.slice(10, 12));
                const ss = Number(s.slice(12, 14));
                const dt = new Date(y, m, d, hh, mm, ss);
                if (!Number.isNaN(dt.getTime()))
                    return dt.toLocaleString();
            }
            const n = Number(s);
            if (Number.isFinite(n) && n > 0) {
                const dt = new Date(n);
                if (!Number.isNaN(dt.getTime()))
                    return dt.toLocaleString();
            }
            return "";
        };
        let docs = [];
        const render = () => {
            const q = search.value.trim().toLowerCase();
            const filtered = q ? docs.filter((d) => (d.title || d.id).toLowerCase().includes(q)) : docs;
            list.innerHTML = "";
            if (!filtered.length) {
                const empty = document.createElement("div");
                empty.className = "mindchain-dock__empty";
                empty.textContent = i18n.dockEmpty || "暂无思维链";
                list.appendChild(empty);
                return;
            }
            for (const d of filtered) {
                const title = d.title || d.id;
                const time = formatUpdated(d.updated);
                const row = document.createElement("div");
                row.className = "mindchain-dock__item";
                let openTimer = null;
                const main = document.createElement("button");
                main.type = "button";
                main.className = "mindchain-dock__itemMain";
                main.innerHTML = `<div class="mindchain-dock__itemTitle"></div>${time ? `<div class="mindchain-dock__itemMeta"></div>` : ""}`;
                const tEl = main.querySelector(".mindchain-dock__itemTitle");
                if (tEl)
                    tEl.textContent = title;
                const mEl = main.querySelector(".mindchain-dock__itemMeta");
                if (mEl)
                    mEl.textContent = time;
                main.addEventListener("click", () => {
                    if (row.dataset.editing === "1")
                        return;
                    if (openTimer)
                        window.clearTimeout(openTimer);
                    openTimer = window.setTimeout(() => {
                        openTimer = null;
                        if (row.dataset.editing === "1")
                            return;
                        this.openMindchainDoc(d.id, d.title);
                    }, 220);
                });
                tEl?.addEventListener("dblclick", (ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    if (openTimer)
                        window.clearTimeout(openTimer);
                    openTimer = null;
                    if (row.dataset.editing === "1")
                        return;
                    row.dataset.editing = "1";
                    const input = document.createElement("input");
                    input.className = "b3-text-field fn__block mindchain-dock__titleInput";
                    input.value = title;
                    tEl.textContent = "";
                    tEl.appendChild(input);
                    input.focus();
                    input.select();
                    const cleanup = () => {
                        row.dataset.editing = "0";
                        delete row.dataset.editing;
                    };
                    const commit = () => {
                        void (async () => {
                            const newTitle = await this.renameMindchainDoc(d.id, input.value);
                            cleanup();
                            if (newTitle === false) {
                                tEl.textContent = title;
                                return;
                            }
                            d.title = newTitle;
                            render();
                        })();
                    };
                    input.addEventListener("keydown", (e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            commit();
                        }
                        else if (e.key === "Escape") {
                            e.preventDefault();
                            cleanup();
                            tEl.textContent = title;
                        }
                    });
                    input.addEventListener("blur", () => commit(), { once: true });
                });
                const del = iconBtn(i18n.nodeDelete || "Delete", "iconMCTrash", (ev) => {
                    ev.stopPropagation();
                    this.confirmDeleteMindchainDoc(d.id, title, async () => {
                        docs = docs.filter(x => x.id !== d.id);
                        render();
                    });
                });
                del.classList.add("mindchain-iconbtn--danger");
                row.appendChild(main);
                row.appendChild(del);
                list.appendChild(row);
            }
        };
        search.addEventListener("input", () => render());
        void (async () => {
            docs = await this.queryMindchainDocs();
            render();
        })();
    }
    async openMindchainForActiveDoc() {
        const editor = api.getActiveEditor?.();
        const docId = String(editor?.protyle?.block?.rootID || "");
        if (!docId) {
            showMessage(buildI18n(this.i18n).errorNotMindchainDoc || "No active document", 2800, "error");
            return;
        }
        const resp = await fetchSyncPost("/api/attr/getBlockAttrs", { id: docId });
        const attrs = resp?.data || {};
        if (String(attrs["custom-mindchain"] || "") !== "1") {
            showMessage(buildI18n(this.i18n).errorNotMindchainDoc || "Not a MindChain document", 3200, "error");
            return;
        }
        openTab({
            app: this.appRef,
            custom: {
                title: buildI18n(this.i18n).tabTitle || "MindChain",
                icon: "iconMindchainFlow",
                data: { docId },
                id: `mindchain-flow${TAB_TYPE}`,
            },
        });
    }
}
exports.default = MindchainFlowPlugin;
exports.__test__ = {
    clamp,
    createId,
    safeJsonParse,
    buildTemplate,
    HistoryStack,
};
