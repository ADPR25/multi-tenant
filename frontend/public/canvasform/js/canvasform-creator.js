(function (global) {
  "use strict";
  var VERSION = "2.7.1";

  var TYPES = {
    text: {
      label: "Texto corto",
      label_en: "Short text",
      icon: "T",
      category: "Básicos",
    },
    textarea: {
      label: "Texto largo",
      label_en: "Long text",
      icon: "B",
      category: "Básicos",
    },
    long_text: {
      label: "Texto largo",
      label_en: "Long text",
      icon: "L",
      category: "Básicos",
    },
    number: {
      label: "Número",
      label_en: "Number",
      icon: "#",
      category: "Básicos",
    },
    email: {
      label: "Correo",
      label_en: "Email",
      icon: "@",
      category: "Básicos",
    },
    radiogroup: {
      label: "Selección única",
      label_en: "Single choice",
      icon: "O",
      category: "Selección",
    },
    checkbox: {
      label: "Selección múltiple",
      label_en: "Multiple choice",
      icon: "C",
      category: "Selección",
    },
    dropdown: {
      label: "Desplegable",
      label_en: "Dropdown",
      icon: "D",
      category: "Selección",
    },
    select: {
      label: "Selector",
      label_en: "Select",
      icon: "S",
      category: "Selección",
    },
    ranking: {
      label: "Clasificación",
      label_en: "Ranking",
      icon: "R",
      category: "Selección",
    },
    rating: {
      label: "Calificación",
      label_en: "Rating",
      icon: "*",
      category: "Valoración",
    },
    scale: {
      label: "Escala",
      label_en: "Scale",
      icon: "1-10",
      category: "Valoración",
    },
    slider: {
      label: "Deslizador",
      label_en: "Slider",
      icon: "-",
      category: "Valoración",
    },
    boolean: {
      label: "Sí / No",
      label_en: "Yes / No",
      icon: "Y",
      category: "Valoración",
    },
    date: {
      label: "Fecha",
      label_en: "Date",
      icon: "D",
      category: "Fecha y hora",
    },
    time: {
      label: "Hora",
      label_en: "Time",
      icon: "T",
      category: "Fecha y hora",
    },
    datetime: {
      label: "Fecha y hora",
      label_en: "DateTime",
      icon: "DT",
      category: "Fecha y hora",
    },
    daterange: {
      label: "Rango de fechas",
      label_en: "Date range",
      icon: "DR",
      category: "Fecha y hora",
    },
    tel: {
      label: "Teléfono",
      label_en: "Phone",
      icon: "P",
      category: "Entrada",
    },
    file: {
      label: "Archivo",
      label_en: "File",
      icon: "F",
      category: "Entrada",
      fileModes: [
        { id: "all", label: "Todos" },
        { id: "image", label: "Solo imágenes" },
        { id: "pdf", label: "Solo PDF" },
        { id: "document", label: "Documentos (PDF, DOC, XLS)" },
        { id: "image_document", label: "Imágenes y documentos" },
      ],
    },
    signature: {
      label: "Firma",
      label_en: "Signature",
      icon: "S",
      category: "Entrada",
    },
    matrix: {
      label: "Matriz",
      label_en: "Matrix",
      icon: "M",
      category: "Selección avanzada",
    },
    matrixcheckbox: {
      label: "Matriz múltiple",
      label_en: "Matrix multiple",
      icon: "MM",
      category: "Selección avanzada",
    },
    matrixtext: {
      label: "Matriz de texto",
      label_en: "Matrix text",
      icon: "MT",
      category: "Selección avanzada",
    },
    heading: {
      label: "Título",
      label_en: "Heading",
      icon: "H",
      category: "Diseño",
    },
    description: {
      label: "Descripción",
      label_en: "Description",
      icon: "D",
      category: "Diseño",
    },
    image: {
      label: "Imagen",
      label_en: "Image",
      icon: "I",
      category: "Diseño",
    },
    video: { label: "Video", label_en: "Video", icon: "V", category: "Diseño" },
    separator: {
      label: "Separador",
      label_en: "Separator",
      icon: "-",
      category: "Diseño",
    },
    section: {
      label: "Sección",
      label_en: "Section",
      icon: "S",
      category: "Diseño",
    },
    calculated: {
      label: "Calculado",
      label_en: "Calculated",
      icon: "C",
      category: "Avanzados",
    },
    hidden: {
      label: "Oculto",
      label_en: "Hidden",
      icon: "H",
      category: "Avanzados",
    },
  };
  var CATEGORY_ORDER = [
    "Básicos",
    "Selección",
    "Valoración",
    "Fecha y hora",
    "Entrada",
    "Selección avanzada",
    "Diseño",
    "Avanzados",
  ];
  var WIDTHS = [
    { id: 25, label: "1/4", sub: "25%" },
    { id: 33, label: "1/3", sub: "33%" },
    { id: 50, label: "1/2", sub: "50%" },
    { id: 66, label: "2/3", sub: "66%" },
    { id: 75, label: "3/4", sub: "75%" },
    { id: 100, label: "Full", sub: "100%" },
  ];
  var OPERATORS = [
    { value: "=", label: "es igual a", needsValue: true },
    { value: "!=", label: "es diferente de", needsValue: true },
    { value: "contains", label: "contiene", needsValue: true },
    { value: "notcontains", label: "no contiene", needsValue: true },
    { value: ">", label: "es mayor que", needsValue: true },
    { value: "<", label: "es menor que", needsValue: true },
    { value: ">=", label: "es mayor o igual que", needsValue: true },
    { value: "<=", label: "es menor o igual que", needsValue: true },
    { value: "empty", label: "está vacío", needsValue: false },
    { value: "notempty", label: "no está vacío", needsValue: false },
  ];
  var CHOICE_TYPES = [
    "radiogroup",
    "checkbox",
    "dropdown",
    "ranking",
    "select",
  ];
  var CONDITION_TYPES = [
    "radiogroup",
    "checkbox",
    "dropdown",
    "select",
    "ranking",
    "rating",
    "scale",
    "boolean",
  ];

  function copy(v) {
    return JSON.parse(JSON.stringify(v));
  }
  function esc(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  function normalizeOption(opt, idx) {
    if (typeof opt === "string") {
      var slug =
        opt
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, "")
          .slice(0, 30) || "option_" + (idx + 1);
      return { value: slug, text: opt };
    }
    if (opt && typeof opt === "object") {
      var v = opt.value || opt.id || "option_" + (idx + 1);
      var t = opt.text || opt.label || opt.title || v;
      return { value: String(v), text: String(t) };
    }
    return { value: "option_" + (idx + 1), text: "Opción " + (idx + 1) };
  }
  function ensureOptionsArray(raw) {
    raw = raw || [];
    if (typeof raw === "string")
      raw = raw
        .split(",")
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean);
    return raw.map(function (o, i) {
      return normalizeOption(o, i);
    });
  }
  function genOptionValue(existing) {
    var base = "option_";
    var max = 0;
    (existing || []).forEach(function (o) {
      var m = String(o.value || "").match(/option_(\d+)/);
      if (m) max = Math.max(max, Number(m[1]));
    });
    return base + (max + 1);
  }
  function normalizeTimeLimit(raw) {
    raw = raw || {};
    var minEnabled = true;
    var maxEnabled = true;
    if (raw.min && typeof raw.min.enabled !== "undefined")
      minEnabled = !!raw.min.enabled;
    if (raw.max && typeof raw.max.enabled !== "undefined")
      maxEnabled = !!raw.max.enabled;
    return {
      enabled: !!raw.enabled,
      min: {
        enabled: minEnabled,
        value: (raw.min && raw.min.value) || raw.minValue || 1,
        unit: (raw.min && raw.min.unit) || raw.minUnit || "minutes",
      },
      max: {
        enabled: maxEnabled,
        value: (raw.max && raw.max.value) || raw.value || 10,
        unit: (raw.max && raw.max.unit) || raw.unit || "minutes",
      },
    };
  }
  function normalizeGeo(raw) {
    raw = raw || {};
    return {
      enabled: !!raw.enabled,
      highAccuracy: raw.highAccuracy !== false,
      captureOnStart: raw.captureOnStart !== false,
    };
  }
  function isChoiceType(t) {
    return CHOICE_TYPES.indexOf(t) !== -1;
  }
  function isConditionType(t) {
    return CONDITION_TYPES.indexOf(t) !== -1;
  }
  function normalizeCondition(c) {
    c = c || {};
    var v = c.value == null || c.value === undefined ? "" : String(c.value);
    return {
      question: c.question || "",
      operator: c.operator || "=",
      value: v.trim(),
    };
  }
  function getQuestionConditions(item) {
    if (item && Array.isArray(item.canvasformConditions))
      return item.canvasformConditions.map(normalizeCondition);
    return [];
  }
  function getOperator(op) {
    return (
      OPERATORS.find(function (i) {
        return i.value === op;
      }) || OPERATORS[0]
    );
  }
  function expressionValue(value, sourceQuestion) {
    value = value == null || value === undefined ? "" : String(value);
    if (sourceQuestion && sourceQuestion.type === "boolean") {
      var low = value.toLowerCase().trim();
      if (
        low === "true" ||
        low === "sí" ||
        low === "si" ||
        value === sourceQuestion.labelTrue
      )
        return "true";
      if (
        low === "false" ||
        low === "no" ||
        value === sourceQuestion.labelFalse
      )
        return "false";
      if (value === "") return "''";
    }
    if (
      sourceQuestion &&
      ["number", "rating", "scale", "slider"].indexOf(sourceQuestion.type) !==
        -1
    ) {
      if (/^-?\d+(\.\d+)?$/.test(value.trim())) return value.trim();
    }
    return "'" + value.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
  }
  function conditionToExpression(condition, schema) {
    condition = normalizeCondition(condition);
    if (!condition.question) return "";
    var source = null;
    if (schema && schema.fields) {
      source = schema.fields.find(function (q) {
        return q.id === condition.question;
      });
      if (!source && schema.pages) {
        schema.pages.forEach(function (p) {
          (p.elements || []).forEach(function (el) {
            if (el.name === condition.question)
              source = {
                type: el.type,
                choices: el.choices,
                labelTrue: el.labelTrue,
                labelFalse: el.labelFalse,
              };
          });
        });
      }
    }
    var left = "{" + condition.question + "}";
    var operator = getOperator(condition.operator);
    if (!operator.needsValue) return left + " " + condition.operator;
    return (
      left +
      " " +
      condition.operator +
      " " +
      expressionValue(condition.value, source)
    );
  }
  function rebuildVisibleIf(item, schema) {
    var conditions = getQuestionConditions(item).filter(function (c) {
      return c.question;
    });
    if (!conditions.length) {
      delete item.visibleIf;
      if (!item.canvasformConditions || !item.canvasformConditions.length) {
        delete item.canvasformConditions;
        delete item.canvasformConditionLogic;
        delete item.canvasformConditionAction;
      } else {
        item.canvasformConditions = conditions;
      }
      return;
    }
    var expressions = conditions
      .map(function (c) {
        return conditionToExpression(c, schema);
      })
      .filter(Boolean);
    if (!expressions.length) {
      delete item.visibleIf;
      return;
    }
    var logic = item.canvasformConditionLogic === "or" ? " or " : " and ";
    var expression = expressions
      .map(function (i) {
        return "(" + i + ")";
      })
      .join(logic);
    if (item.canvasformConditionAction === "hide")
      item.visibleIf = "!(" + expression + ")";
    else item.visibleIf = expression;
    item.canvasformConditions = conditions;
  }
  function allowedOperatorsForType(type) {
    if (!type)
      return OPERATORS.map(function (o) {
        return o.value;
      });
    if (type === "boolean") return ["=", "!=", "empty", "notempty"];
    if (["number", "rating", "scale", "slider"].indexOf(type) !== -1)
      return ["=", "!=", "<", ">", ">=", "<=", "empty", "notempty"];
    if (isChoiceType(type)) return ["=", "!=", "empty", "notempty"];
    if (["date", "time", "datetime", "daterange"].indexOf(type) !== -1)
      return ["=", "!=", "<", ">", ">=", "<=", "empty", "notempty"];
    return ["=", "!=", "contains", "notcontains", "empty", "notempty"];
  }
  function getOperatorListForSource(source) {
    var allowed = allowedOperatorsForType(source ? source.type : null);
    return OPERATORS.filter(function (op) {
      return allowed.indexOf(op.value) !== -1;
    });
  }
  function getAllConditionQuestions(schema) {
    return (schema.fields || []).filter(function (f) {
      return isConditionType(f.type);
    });
  }
  function getQuestionById(schema, id) {
    return (
      (schema.fields || []).find(function (f) {
        return f.id === id;
      }) || null
    );
  }
  function tryParseVisibleIf(item) {
    var expression = String(item.visibleIf || "");
    var m = expression.match(
      /^\{([^}]+)\}\s*(=|!=|contains|notcontains|>=|<=|>|<)\s*['"]?(.*?)['"]?$/,
    );
    if (!m) return;
    item.canvasformConditions = [
      { question: m[1], operator: m[2], value: m[3] },
    ];
    item.canvasformConditionLogic = "and";
    item.canvasformConditionAction = "show";
  }

  function CanvasFormV4Grid(target, opts) {
    opts = opts || {};
    this.host =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!this.host) throw new Error("CanvasFormV4Grid: host not found");
    this.opts = opts;
    var defaultFields = [];
    this.schema = copy(
      opts.schema || {
        title: "Nueva encuesta",
        description: "",
        pages: [
          { name: "page1", title: "Página 1", description: "", elements: [] },
        ],
        fields: defaultFields,
        timeLimit: { enabled: false, value: 10, unit: "minutes" },
        geoLocation: {
          enabled: false,
          highAccuracy: true,
          captureOnStart: true,
        },
      },
    );
    if (!Array.isArray(this.schema.fields)) this.schema.fields = defaultFields;
    if (!Array.isArray(this.schema.pages) || !this.schema.pages.length) {
      this.schema.pages = [
        {
          name: "page1",
          title: "Página 1",
          description: "",
          elements: [],
          canvasformConditions: [],
          canvasformConditionLogic: "and",
          canvasformConditionAction: "hide",
        },
      ];
    }
    if (
      this.schema.fields.length &&
      (!this.schema.pages[0].elements || !this.schema.pages[0].elements.length)
    ) {
      this.schema.pages[0].elements = this.schema.fields.map(function (f) {
        return {
          name: f.id,
          type: f.type,
          title: f.label || f.title,
          placeholder: f.placeholder || "",
          isRequired: !!f.required,
          width: f.width || 100,
          canvasformWidth: f.width || 100,
          choices: f.options || f.choices,
          defaultValue: f.value,
          src: f.src,
          rows: f.rows,
          columns: f.columns,
          expression: f.expression,
          fileMode: f.fileMode,
          accept: f.accept,
          maxSize: f.maxSize,
          maxSizeMB: f.maxSizeMB,
          canvasformConditions: f.canvasformConditions || [],
          canvasformConditionLogic: f.canvasformConditionLogic || "and",
          canvasformConditionAction: f.canvasformConditionAction || "show",
          visibleIf: f.visibleIf,
        };
      });
    }
    if (
      this.schema.pages[0].elements &&
      this.schema.pages[0].elements.length &&
      !this.schema.fields.length
    ) {
      this.schema.fields = this.schema.pages[0].elements.map(function (el) {
        return {
          id: el.name,
          type: el.type,
          label: el.title || el.label || el.type,
          placeholder: el.placeholder || "",
          width: el.width || 100,
          required: !!el.isRequired,
          options: el.choices,
          value: el.defaultValue,
          src: el.src,
          rows: el.rows,
          columns: el.columns,
          expression: el.expression,
          fileMode: el.fileMode,
          accept: el.accept,
          maxSize: el.maxSize,
          maxSizeMB: el.maxSizeMB,
          canvasformConditions: el.canvasformConditions || [],
          canvasformConditionLogic: el.canvasformConditionLogic || "and",
          canvasformConditionAction: el.canvasformConditionAction || "show",
          visibleIf: el.visibleIf,
        };
      });
    }
    this.schema.fields.forEach(function (f) {
      if (f.width == null) f.width = 100;
      if (!f.canvasformConditions) f.canvasformConditions = [];
      if (!f.canvasformConditionLogic) f.canvasformConditionLogic = "and";
      if (!f.canvasformConditionAction) f.canvasformConditionAction = "show";
      if (f.visibleIf && !f.canvasformConditions.length) tryParseVisibleIf(f);
    });
    this.schema.pages.forEach(function (p) {
      if (!p.canvasformConditions) p.canvasformConditions = [];
      if (!p.canvasformConditionLogic) p.canvasformConditionLogic = "and";
      if (!p.canvasformConditionAction) p.canvasformConditionAction = "hide";
      (p.elements || []).forEach(function (el) {
        if (el.width == null) el.width = 100;
        if (!el.canvasformConditions) el.canvasformConditions = [];
      });
      if (p.visibleIf && !p.canvasformConditions.length) tryParseVisibleIf(p);
    });
    this.schema.timeLimit = normalizeTimeLimit(this.schema.timeLimit);
    this.schema.geoLocation = normalizeGeo(this.schema.geoLocation);
    this.currentPageIdx = 0;
    this.selectedId =
      (this.schema.fields[0] && this.schema.fields[0].id) ||
      (this.schema.pages[0].elements[0] &&
        this.schema.pages[0].elements[0].name) ||
      null;
    this.search = "";
    this.dragId = null;
    this.openCats = { Básicos: true, Selección: true, Valoración: true };
    this.render();
  }
  CanvasFormV4Grid.prototype.getField = function (id) {
    return (
      this.schema.fields.find(function (f) {
        return f.id === id;
      }) || null
    );
  };
  CanvasFormV4Grid.prototype.getCurrentPage = function () {
    return this.schema.pages[this.currentPageIdx] || this.schema.pages[0];
  };
  CanvasFormV4Grid.prototype.addPage = function () {
    var n = this.schema.pages.length + 1;
    var page = {
      name: "page" + Date.now(),
      title: "Página " + n,
      description: "",
      elements: [],
      canvasformConditions: [],
      canvasformConditionLogic: "and",
      canvasformConditionAction: "hide",
    };
    this.schema.pages.push(page);
    this.currentPageIdx = this.schema.pages.length - 1;
    this.selectedId = null;
    this.render();
    this.emitChange();
  };
  CanvasFormV4Grid.prototype.delPage = function (idx) {
    if (this.schema.pages.length <= 1) return;
    this.schema.pages.splice(idx, 1);
    if (this.currentPageIdx >= this.schema.pages.length)
      this.currentPageIdx = this.schema.pages.length - 1;
    this.render();
    this.emitChange();
  };
  CanvasFormV4Grid.prototype.switchPage = function (idx) {
    this.currentPageIdx = idx;
    this.selectedId = null;
    this.render();
  };
  CanvasFormV4Grid.prototype.renderPagesBar = function () {
    var self = this;
    var html = this.schema.pages
      .map(function (p, i) {
        var active = i === self.currentPageIdx ? "active" : "";
        var count = (p.elements || []).length;
        var hasCond = getQuestionConditions(p).length > 0 ? " •◷" : "";
        return (
          '<div class="canvasform-page-tab ' +
          active +
          '" data-page="' +
          i +
          '" style="display:flex; align-items:center; gap:8px; padding:6px 12px; border-radius:999px; border:1px solid ' +
          (active ? "#000" : "#E8E8EC") +
          "; background:" +
          (active ? "#000" : "#fff") +
          "; color:" +
          (active ? "#fff" : "#0A0A0B") +
          '; font:500 12px Inter; cursor:pointer;"><span>' +
          (i + 1) +
          ". " +
          esc(p.title || "Página " + (i + 1)) +
          hasCond +
          '</span><span style="background:' +
          (active ? "rgba(255,255,255,.15)" : "#F6F6F8") +
          '; padding:2px 6px; border-radius:999px; font-size:10px;">' +
          count +
          "</span>" +
          (self.schema.pages.length > 1
            ? '<button data-del-page="' +
              i +
              '" style="width:18px; height:18px; border-radius:50%; border:1px solid ' +
              (active ? "rgba(255,255,255,.3)" : "#E8E8EC") +
              "; background:transparent; color:" +
              (active ? "#fff" : "#9A9AA3") +
              '; cursor:pointer; font-size:10px;">✕</button>'
            : "") +
          "</div>"
        );
      })
      .join("");
    html +=
      '<button data-add-page style="padding:6px 12px; border-radius:999px; border:1px dashed #9A9AA3; background:#fff; font:500 11px Inter; color:#6B6B76; cursor:pointer;">+ Página</button>';
    html +=
      '<span style="margin-left:auto; font:400 11px Inter; color:#9A9AA3;">' +
      this.schema.pages.length +
      " página(s) • Página actual: " +
      (this.currentPageIdx + 1) +
      "</span>";
    return html;
  };
  CanvasFormV4Grid.prototype.renderGeneral = function () {
    var tl = this.schema.timeLimit;
    var geo = this.schema.geoLocation;
    var timeHtml =
      '<div class="canvasform-general-card ' +
      (tl.enabled ? "is-active" : "") +
      '"><div class="canvasform-general-row"><div><b>Tiempo</b><small>Limitar duracion de la encuesta</small></div><label class="canvasform-switch"><input type="checkbox" data-gfield="timeEnabled" ' +
      (tl.enabled ? "checked" : "") +
      '><span class="canvasform-switch-track"><span class="canvasform-switch-thumb"></span></span></label></div>' +
      (tl.enabled
        ? '<div class="canvasform-general-time"><div class="canvasform-time-group is-active"><div class="canvasform-time-group-head"><span>Tiempo minimo</span></div><div class="canvasform-time-inputs"><input type="number" min="0" class="canvasform-insp-input" data-gfield="minValue" value="' +
          tl.min.value +
          '"><select class="canvasform-insp-input" data-gfield="minUnit"><option value="seconds" ' +
          (tl.min.unit === "seconds" ? "selected" : "") +
          ' >Segundos</option><option value="minutes" ' +
          (tl.min.unit === "minutes" ? "selected" : "") +
          '>Minutos</option><option value="hours" ' +
          (tl.min.unit === "hours" ? "selected" : "") +
          '>Horas</option></select></div></div><div class="canvasform-time-group is-active" style="margin-top:8px;"><div class="canvasform-time-group-head"><span>Tiempo maximo</span></div><div class="canvasform-time-inputs"><input type="number" min="1" class="canvasform-insp-input" data-gfield="maxValue" value="' +
          tl.max.value +
          '"><select class="canvasform-insp-input" data-gfield="maxUnit"><option value="seconds" ' +
          (tl.max.unit === "seconds" ? "selected" : "") +
          ' >Segundos</option><option value="minutes" ' +
          (tl.max.unit === "minutes" ? "selected" : "") +
          '>Minutos</option><option value="hours" ' +
          (tl.max.unit === "hours" ? "selected" : "") +
          '>Horas</option></select></div></div><span class="canvasform-general-hint" style="margin-top:8px; display:block;">Minimo evita envios rapidos y maximo auto-envia.</span></div>'
        : "") +
      "</div>";
    var geoHtml =
      '<div class="canvasform-general-card ' +
      (geo.enabled ? "is-active" : "") +
      '" style="margin-top:10px;"><div class="canvasform-general-row"><div><b>Coordenadas</b><small>Capturar ubicacion al responder</small></div><label class="canvasform-switch"><input type="checkbox" data-gfield="geoEnabled" ' +
      (geo.enabled ? "checked" : "") +
      '><span class="canvasform-switch-track"><span class="canvasform-switch-thumb"></span></span></label></div>' +
      (geo.enabled
        ? '<div class="canvasform-general-time"><span class="canvasform-general-hint">Pedira permiso de ubicacion al iniciar y guardara lat/lng con alta precision (GPS).</span></div>'
        : "") +
      "</div>";
    return (
      '<div class="canvasform-general"><div class="canvasform-general-title"><i>◷</i><span>GENERAL</span></div>' +
      timeHtml +
      geoHtml +
      "</div>"
    );
  };
  CanvasFormV4Grid.prototype.render = function () {
    var self = this;
    var prevScroll = {
      palette: 0,
      canvas: 0,
      inspector: 0,
      winY: window.scrollY,
    };
    try {
      var _p = self.host.querySelector(
        ".canvasform-palette > div:nth-child(2)",
      );
      if (!_p) _p = self.host.querySelector(".canvasform-palette");
      var _c = self.host.querySelector(".canvasform-canvas");
      var _i = self.host.querySelector(
        ".canvasform-inspector.canvasform-insp-body",
      );
      if (_p) prevScroll.palette = _p.scrollTop;
      if (_c) prevScroll.canvas = _c.scrollTop;
      if (_i) prevScroll.inspector = _i.scrollTop;
    } catch (e) {}
    this.host.innerHTML = '<div class="canvasform-v4"></div>';
    this.root = this.host.firstElementChild;
    var headTitle = esc(this.schema.title);
    var currentPage = self.getCurrentPage();
    var pageElements = currentPage.elements || [];
    var currentRowWidth = 0;
    pageElements.forEach(function (el) {
      currentRowWidth += el.width || 100;
      if (currentRowWidth >= 100) {
        currentRowWidth = 0;
      } else if (currentRowWidth > 0 && currentRowWidth < 100) {
        var next = pageElements[pageElements.indexOf(el) + 1];
        if (!next) el._isLastInRow = true;
      }
    });
    var fieldCount = self.schema.fields.length;
    var pageFieldCount = pageElements.length;
    var totalWidth = pageElements.reduce(function (a, b) {
      return a + (b.width || 0);
    }, 0);
    var groups = {};
    Object.keys(TYPES).forEach(function (k) {
      var cat = TYPES[k].category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(k);
    });
    var categoriesHtml = CATEGORY_ORDER.filter(function (c) {
      return groups[c];
    })
      .map(function (cat) {
        var isOpen = self.openCats[cat] !== false;
        var keys = groups[cat];
        var filtered = keys.filter(function (k) {
          if (!self.search) return true;
          var q = self.search.toLowerCase();
          var t = TYPES[k];
          return (
            (t.label || "").toLowerCase().indexOf(q) !== -1 ||
            (t.label_en || "").toLowerCase().indexOf(q) !== -1 ||
            k.indexOf(q) !== -1
          );
        });
        if (!filtered.length && self.search) return "";
        return (
          '<div class="canvasform-category ' +
          (isOpen ? "is-open" : "") +
          '"><div class="canvasform-cat-title" data-cat="' +
          esc(cat) +
          '" style="cursor:pointer; display:flex; justify-content:space-between;"><span>' +
          esc(cat.toUpperCase()) +
          " (" +
          filtered.length +
          ")</span><b>" +
          (isOpen ? "⌃" : "⌄") +
          '</b></div><div class="canvasform-cat-items" style="' +
          (isOpen ? "" : "display:none") +
          '">' +
          filtered
            .map(function (k) {
              var v = TYPES[k];
              return (
                '<button class="canvasform-field-btn" draggable="true" data-add="' +
                k +
                '"><div class="canvasform-field-icon">' +
                esc(v.icon) +
                '</div><div class="canvasform-field-meta"><b>' +
                esc(v.label) +
                "</b><small>" +
                esc(k) +
                '</small></div><span class="canvasform-drag">⋮</span></button>'
              );
            })
            .join("") +
          "</div></div>"
        );
      })
      .join("");
    this.root.innerHTML =
      '<header class="canvasform-topbar"> <div class="canvasform-brand"><div class="canvasform-brand-mark">CANVASFORM</div><small>V4.6</small><div class="canvasform-badge"><span class="canvasform-badge-dot"></span> V4.6 ' +
      self.schema.pages.length +
      "P - " +
      fieldCount +
      " fields " +
      (self.schema.timeLimit.enabled ? "⏱ " : "") +
      (self.schema.geoLocation.enabled ? "📍 " : "") +
      'COND+GRID</div></div> <div class="canvasform-title-input">✦ <input value="' +
      headTitle +
      '" data-title placeholder="Form title" /></div> <div class="canvasform-top-actions"> <button class="canvasform-btn" data-preview>◎ Preview</button> <button class="canvasform-btn canvasform-btn-dark" data-save>⎙ Save</button> </div></header><div class="canvasform-body"> <aside class="canvasform-palette"> <div class="canvasform-search"><div class="canvasform-search-box"><i>⌕</i><input placeholder="Search fields..." data-search value="' +
      esc(self.search) +
      '" /></div></div> <div style="flex:1; overflow:auto; padding-bottom:12px;">' +
      self.renderGeneral() +
      ' <div class="canvasform-drag-hint">DRAG OR CLICK</div>' +
      categoriesHtml +
      ' <div class="canvasform-grid-tip" style="margin:12px;"><div class="canvasform-grid-tip-icon">▦</div><div><b>12-COL GRID TIP</b><p>Mix 50% + 50% para dobles. 33% para 3 cols. Auto-wraps si >100%.</p></div></div> </div> </aside> <main class="canvasform-canvas" data-dropzone> <div class="canvasform-pages-bar" style="max-width:800px; margin:0 auto 12px; display:flex; gap:6px; align-items:center; flex-wrap:wrap;">' +
      self.renderPagesBar() +
      '</div> <div class="canvasform-canvas-card"> <div class="canvasform-canvas-head"><div><h2>' +
      headTitle +
      '</h2><div class="canvasform-canvas-sub"><span class="canvasform-pill"><b></b>' +
      fieldCount +
      " fields</span><span>• 12-col grid active</span>" +
      (self.schema.timeLimit.enabled
        ? '<span class="canvasform-pill">⏱ ' +
          self.schema.timeLimit.min.value +
          self.schema.timeLimit.min.unit.charAt(0) +
          " - " +
          self.schema.timeLimit.max.value +
          self.schema.timeLimit.max.unit.charAt(0) +
          "</span>"
        : "") +
      (self.schema.geoLocation.enabled
        ? '<span class="canvasform-pill">📍 Geo ON</span>'
        : "") +
      '</div></div><div class="canvasform-canvas-badge">▦ Canvas</div></div>' +
      (pageFieldCount === 0
        ? '<div class="canvasform-empty"><h3>Página ' +
          (self.currentPageIdx + 1) +
          ': Suelta campos aquí</h3><p>Esta página está vacía. Haz click o arrastra campos desde la izquierda. Usa 50%+50% para 2 columnas.</p><div style="margin-top:12px; display:flex; gap:8px; justify-content:center;"><button data-add-page style="padding:8px 14px; border-radius:999px; border:1px solid #000; background:#000; color:#fff; font:500 12px Inter; cursor:pointer;">+ Nueva página</button></div></div>'
        : '<div class="canvasform-grid">' +
          pageElements
            .map(function (el) {
              var f = self.schema.fields.find(function (x) {
                return x.id === el.name;
              }) || {
                id: el.name,
                type: el.type,
                label: el.title || el.label,
                placeholder: el.placeholder,
                width: el.width,
                required: !!el.isRequired,
                options: el.choices,
                value: el.defaultValue,
                src: el.src,
                rows: el.rows,
                columns: el.columns,
                fileMode: el.fileMode,
                accept: el.accept,
                canvasformConditions: el.canvasformConditions,
                canvasformConditionLogic: el.canvasformConditionLogic,
                canvasformConditionAction: el.canvasformConditionAction,
                visibleIf: el.visibleIf,
              };
              return self.renderField(f);
            })
            .join("") +
          '</div><div style="margin-top:24px; display:flex; align-items:center; gap:12px; opacity:.4;"><div style="flex:1; height:1px; background:#E8E8EC;"></div><span style="font:600 10px Inter; letter-spacing:.16em;">PÁGINA ' +
          (self.currentPageIdx + 1) +
          " • " +
          pageFieldCount +
          " CAMPOS • " +
          totalWidth +
          "% WIDTH • " +
          self.schema.pages.length +
          ' PÁGS TOTAL</span><div style="flex:1; height:1px; background:#E8E8EC;"></div></div>') +
      ' </div> <div style="max-width:800px; margin:16px auto 0; display:flex; gap:6px; font:400 11px Inter; color:#9A9AA3; justify-content:center;"><span>⌘</span> Click to select • Drag to reorder • Combine widths for columns</div> </main> <aside class="canvasform-inspector"> <div class="canvasform-insp-head"><span>⚙ Inspector</span>' +
      (self.getField(self.selectedId)
        ? '<span style="background:#F6F6F8; border:1px solid #E8E8EC; padding:2px 8px; border-radius:999px; font-size:10px;">' +
          esc(self.getField(self.selectedId).type) +
          "</span>"
        : "") +
      '</div> <div class="canvasform-insp-body">' +
      self.renderInspector() +
      '</div> <div class="canvasform-footer"><div style="width:20px; height:20px; background:#000; color:#fff; border-radius:50%; display:grid; place-items:center; font-size:10px;">C</div> Grid keeps local state</div> </aside></div>';
    this.bind();
    try {
      var _p2 = self.host.querySelector(
        ".canvasform-palette > div:nth-child(2)",
      );
      if (!_p2) _p2 = self.host.querySelector(".canvasform-palette");
      var _c2 = self.host.querySelector(".canvasform-canvas");
      var _i2 = self.host.querySelector(
        ".canvasform-inspector.canvasform-insp-body",
      );
      if (_p2) _p2.scrollTop = prevScroll.palette;
      if (_c2) _c2.scrollTop = prevScroll.canvas;
      if (_i2) _i2.scrollTop = prevScroll.inspector;
      window.scrollTo(0, prevScroll.winY);
    } catch (e) {}
  };
  CanvasFormV4Grid.prototype.renderField = function (f) {
    var isSel = f.id === this.selectedId;
    var wClass =
      f.width === 25
        ? "w-25"
        : f.width === 33
          ? "w-33"
          : f.width === 50
            ? "w-50"
            : f.width === 66
              ? "w-66"
              : f.width === 75
                ? "w-75"
                : "w-100";
    if (f._isLastInRow && f.width < 100) wClass = "w-100";
    var label = f.label || f.type;
    var ph = f.placeholder || "";
    var icon = TYPES[f.type] ? TYPES[f.type].icon : "T";
    var hasCond = getQuestionConditions(f).length > 0;
    var inputHtml = "";
    if (
      f.type === "text" ||
      f.type === "email" ||
      f.type === "number" ||
      f.type === "tel"
    )
      inputHtml =
        '<div class="canvasform-input">' + esc(ph || "Placeholder") + "</div>";
    else if (
      f.type === "textarea" ||
      f.type === "long_text" ||
      f.type === "description"
    )
      inputHtml =
        '<div class="canvasform-textarea">' +
        esc(ph || "Long text...") +
        "</div>";
    else if (isChoiceType(f.type)) {
      var opts = ensureOptionsArray(f.options);
      var preview = opts
        .slice(0, 3)
        .map(function (o) {
          return o.text;
        })
        .join(" · ");
      inputHtml =
        '<div class="canvasform-input" style="justify-content:space-between;">' +
        esc(ph || preview || "Select") +
        " <span>⌄</span></div>";
    } else if (f.type === "rating" || f.type === "scale") {
      var val = f.value || 0;
      var stars = "";
      for (var i = 1; i <= 5; i++)
        stars +=
          '<span class="canvasform-star ' +
          (i <= val ? "filled" : "empty") +
          '">★</span>';
      inputHtml =
        '<div class="canvasform-stars">' +
        stars +
        ' <span style="font-size:12px; color:#9A9AA3; margin-left:6px;">' +
        val +
        "/5</span></div>";
    } else if (f.type === "slider")
      inputHtml =
        '<div class="canvasform-input">━━●━━━ ' + (f.value || 50) + "%</div>";
    else if (f.type === "boolean")
      inputHtml = '<div class="canvasform-input">Si / No</div>';
    else if (
      f.type === "date" ||
      f.type === "time" ||
      f.type === "datetime" ||
      f.type === "daterange"
    )
      inputHtml =
        '<div class="canvasform-input">' +
        (f.type === "date"
          ? "dd / mm / yyyy"
          : f.type === "time"
            ? "hh : mm"
            : "dd/mm/yyyy hh:mm") +
        "</div>";
    else if (f.type === "file") {
      var modeLabel = {
        all: "↥ Todos",
        image: "🖼 Solo imágenes",
        pdf: "📄 Solo PDF",
        document: "📑 Documentos",
        image_document: "🖼📑 Img+Docs",
      }[f.fileMode || "all"];
      inputHtml =
        '<div class="canvasform-input" style="justify-content:space-between;"><span>↥ Subir archivo</span><small style="background:#F6F6F8; border:1px solid #E8E8EC; padding:2px 6px; border-radius:999px; font-size:10px;">' +
        esc(modeLabel) +
        '</small></div><small style="font:400 10px Inter; color:#9A9AA3; margin-top:4px; display:block;">Accept: ' +
        esc(f.accept || "*/*") +
        "</small>";
    } else if (f.type === "signature")
      inputHtml = '<div class="canvasform-input">✎ Firma aqui</div>';
    else if (
      f.type === "matrix" ||
      f.type === "matrixcheckbox" ||
      f.type === "matrixtext"
    ) {
      var rows = f.rows || [];
      var cols = f.columns || [];
      var table =
        '<div style="overflow:auto; max-height:120px; border:1px solid #E8E8EC; border-radius:8px;"><table style="width:100%; border-collapse:collapse; font:11px Inter;"><tr><th style="border-bottom:1px solid #E8E8EC; padding:4px;"></th>' +
        cols
          .map(function (c) {
            return (
              '<th style="border-bottom:1px solid #E8E8EC; padding:4px; text-align:left;">' +
              esc(c) +
              "</th>"
            );
          })
          .join("") +
        "</tr>" +
        rows
          .map(function (r) {
            return (
              '<tr><td style="border-bottom:1px solid #F6F6F8; padding:4px; font-weight:600;">' +
              esc(r) +
              "</td>" +
              cols
                .map(function () {
                  return '<td style="border-bottom:1px solid #F6F6F8; padding:4px; text-align:center;"><span style="width:12px;height:12px;border:1px solid #9A9AA3;border-radius:50%;display:inline-block;"></span></td>';
                })
                .join("") +
              "</tr>"
            );
          })
          .join("") +
        "</table></div>";
      inputHtml = table;
    } else if (f.type === "heading")
      inputHtml = '<div style="font:700 16px Inter;">' + esc(label) + "</div>";
    else if (f.type === "image")
      inputHtml =
        '<div class="canvasform-input">▣ Imagen: ' +
        (f.src || "https://...") +
        "</div>";
    else if (f.type === "video")
      inputHtml =
        '<div class="canvasform-input">▶ Video: ' +
        (f.src || "YouTube URL") +
        "</div>";
    else if (f.type === "separator")
      inputHtml =
        '<div style="height:1px; background:#E8E8EC; margin:12px 0;"></div>';
    else if (f.type === "section")
      inputHtml =
        '<div style="background:#F6F6F8; border:1px solid #E8E8EC; padding:8px 12px; border-radius:8px; font:600 12px Inter;">☰ ' +
        esc(label) +
        "</div>";
    else if (f.type === "calculated")
      inputHtml =
        '<div class="canvasform-input">Σ ' +
        (f.expression || "Campo calculado") +
        "</div>";
    else if (f.type === "hidden")
      inputHtml =
        '<div class="canvasform-input" style="opacity:.5;">◌ Oculto: ' +
        esc(f.id || "") +
        "</div>";
    else
      inputHtml =
        '<div class="canvasform-input">' + esc(ph || f.type) + "</div>";
    return (
      '<div class="canvasform-field ' +
      wClass +
      " " +
      (isSel ? "selected" : "") +
      '" data-field="' +
      esc(f.id) +
      '" draggable="true"><div class="canvasform-field-actions"><button data-dup="' +
      esc(f.id) +
      '">⎘ Dup</button><button data-del="' +
      esc(f.id) +
      '">🗑</button></div><div class="canvasform-field-top"><div class="canvasform-field-label"><span class="canvasform-w ' +
      (isSel ? "" : "light") +
      '">' +
      f.width +
      "%</span><span>" +
      esc(label) +
      "" +
      (f.required
        ? '<span style="color:#BF4934; margin-left:2px;">*</span>'
        : "") +
      "</span>" +
      (hasCond
        ? '<span style="background:#FEF3C7; border:1px solid #F59E0B; color:#92400E; font:600 9px Inter; padding:2px 6px; border-radius:999px; margin-left:6px;">◷ COND</span>'
        : "") +
      '</div><small style="color:#9A9AA3; font-size:10px;">' +
      esc(icon) +
      " " +
      esc(f.type) +
      (f.required ? " • REQ" : "") +
      "</small></div>" +
      inputHtml +
      "</div>"
    );
  };
  CanvasFormV4Grid.prototype.renderConditionQuestionOptions = function (
    currentItem,
    selectedName,
    isPage,
  ) {
    var self = this;
    var all = getAllConditionQuestions(self.schema);
    return all
      .filter(function (q) {
        if (isPage) return true;
        return q.id !== currentItem.id;
      })
      .map(function (q) {
        return (
          '<option value="' +
          esc(q.id) +
          '" ' +
          (q.id === selectedName ? "selected" : "") +
          ">" +
          esc(q.label || q.id) +
          " (" +
          (TYPES[q.type] ? TYPES[q.type].label : q.type) +
          ")</option>"
        );
      })
      .join("");
  };
  CanvasFormV4Grid.prototype.renderConditionValue = function (
    condition,
    index,
  ) {
    var source = getQuestionById(this.schema, condition.question);
    if (!source)
      return (
        '<input type="text" class="canvasform-insp-input condition-value" data-cond-field="value" data-cond-index="' +
        index +
        '" value="' +
        esc(condition.value) +
        '" placeholder="Selecciona pregunta primero">'
      );
    var op = getOperator(condition.operator);
    if (!op.needsValue) return "";
    if (source.type === "boolean") {
      var tL = source.labelTrue || "Sí";
      var fL = source.labelFalse || "No";
      return (
        '<select class="canvasform-insp-input condition-value" data-cond-field="value" data-cond-index="' +
        index +
        '"><option value="">Selecciona...</option><option value="true" ' +
        (condition.value === "true" ? "selected" : "") +
        ">" +
        esc(tL) +
        ' (verdadero)</option><option value="false" ' +
        (condition.value === "false" ? "selected" : "") +
        ">" +
        esc(fL) +
        " (falso)</option></select>"
      );
    }
    if (isChoiceType(source.type)) {
      var choices = ensureOptionsArray(source.options);
      return (
        '<select class="canvasform-insp-input condition-value" data-cond-field="value" data-cond-index="' +
        index +
        '"><option value="">Selecciona opción...</option>' +
        choices
          .map(function (c) {
            return (
              '<option value="' +
              esc(c.value) +
              '" ' +
              (String(c.value) === String(condition.value) ? "selected" : "") +
              ">" +
              esc(c.text) +
              "</option>"
            );
          })
          .join("") +
        "</select>"
      );
    }
    if (["number", "rating", "scale", "slider"].indexOf(source.type) !== -1)
      return (
        '<input type="number" class="canvasform-insp-input condition-value" data-cond-field="value" data-cond-index="' +
        index +
        '" value="' +
        esc(condition.value) +
        '" placeholder="Ej: 5">'
      );
    if (source.type === "date")
      return (
        '<input type="date" class="canvasform-insp-input condition-value" data-cond-field="value" data-cond-index="' +
        index +
        '" value="' +
        esc(condition.value) +
        '">'
      );
    if (source.type === "time")
      return (
        '<input type="time" class="canvasform-insp-input condition-value" data-cond-field="value" data-cond-index="' +
        index +
        '" value="' +
        esc(condition.value) +
        '">'
      );
    if (source.type === "datetime")
      return (
        '<input type="datetime-local" class="canvasform-insp-input condition-value" data-cond-field="value" data-cond-index="' +
        index +
        '" value="' +
        esc(condition.value) +
        '">'
      );
    return (
      '<input type="text" class="canvasform-insp-input condition-value" data-cond-field="value" data-cond-index="' +
      index +
      '" value="' +
      esc(condition.value) +
      '" placeholder="Valor">'
    );
  };
  CanvasFormV4Grid.prototype.renderConditionalLogic = function (item, isPage) {
    var conditions = getQuestionConditions(item);
    var hasQs =
      getAllConditionQuestions(this.schema).filter(function (q) {
        return isPage ? true : q.id !== item.id;
      }).length > 0;
    var rows = conditions
      .map(
        function (cond, idx) {
          var source = getQuestionById(this.schema, cond.question);
          var ops = getOperatorListForSource(source);
          return (
            '<div class="canvasform-condition-row" data-cond-index="' +
            idx +
            '" style="display:flex; flex-direction:column; gap:6px; padding:10px; border:1px solid #E8E8EC; border-radius:12px; background:#fff; margin-bottom:8px;"><div style="display:flex; justify-content:space-between; align-items:center;"><span style="background:#000; color:#fff; font:700 10px Inter; width:18px; height:18px; display:grid; place-items:center; border-radius:50%;">' +
            (idx + 1) +
            '</span><button data-cond-action="remove" data-cond-index="' +
            idx +
            '" style="width:22px; height:22px; border-radius:50%; border:1px solid #F2CEC5; background:#FFF3EF; color:#BF4934; cursor:pointer;">✕</button></div><select class="canvasform-insp-input condition-question" data-cond-field="question" data-cond-index="' +
            idx +
            '"><option value="">¿Qué pregunta?</option>' +
            this.renderConditionQuestionOptions(item, cond.question, !!isPage) +
            '</select><select class="canvasform-insp-input condition-operator" data-cond-field="operator" data-cond-index="' +
            idx +
            '">' +
            ops
              .map(function (op) {
                return (
                  '<option value="' +
                  op.value +
                  '" ' +
                  (op.value === cond.operator ? "selected" : "") +
                  ">" +
                  esc(op.label) +
                  "</option>"
                );
              })
              .join("") +
            '</select><div class="canvasform-condition-value">' +
            this.renderConditionValue(cond, idx) +
            "</div></div>"
          );
        }.bind(this),
      )
      .join("");
    var title = isPage
      ? "Visibilidad de esta página"
      : "Visibilidad condicional";
    var desc = isPage
      ? "Si se cumple, se oculta/muestra la página completa."
      : "Decide cuándo debe aparecer esta pregunta.";
    return (
      '<div style="height:1px; background:#E8E8EC; margin:16px 0;"></div><div class="canvasform-conditions-panel"><div style="margin-bottom:12px;"><div style="font:600 13px Inter; display:flex; align-items:center; gap:6px;"><span style="background:#FEF3C7; border:1px solid #F59E0B; width:24px; height:24px; display:grid; place-items:center; border-radius:6px;">◷</span> ' +
      title +
      '</div><div style="font:400 11px Inter; color:#9A9AA3; margin-top:4px;">' +
      desc +
      "</div></div>" +
      (!hasQs
        ? '<div style="background:#FFF3EF; border:1px solid #F2CEC5; padding:10px; border-radius:10px; font:400 12px Inter; color:#BF4934;">Primero agrega otra pregunta para condicionar.</div>'
        : "") +
      (conditions.length
        ? '<div style="display:grid; gap:8px; margin-bottom:10px;"><label style="font:500 12px Inter;">Comportamiento<select class="canvasform-insp-input" data-cond-action-mode style="margin-top:4px;"><option value="show" ' +
          (item.canvasformConditionAction !== "hide" ? "selected" : "") +
          '>Mostrar cuando se cumpla</option><option value="hide" ' +
          (item.canvasformConditionAction === "hide" ? "selected" : "") +
          '>Ocultar cuando se cumpla</option></select></label><label style="font:500 12px Inter;">Combinar<select class="canvasform-insp-input" data-cond-logic style="margin-top:4px;"><option value="and" ' +
          (item.canvasformConditionLogic !== "or" ? "selected" : "") +
          '>Todas (Y)</option><option value="or" ' +
          (item.canvasformConditionLogic === "or" ? "selected" : "") +
          ">Cualquiera (O)</option></select></label></div>"
        : "") +
      '<div class="canvasform-condition-list">' +
      rows +
      "</div>" +
      (hasQs
        ? '<button data-cond-action="add" style="width:100%; height:36px; border-radius:10px; border:1px dashed #185c49; background:#F0FDF4; color:#185c49; font:500 12px Inter; cursor:pointer; margin-top:4px;">+ Añadir condición</button>'
        : "") +
      (item.visibleIf
        ? '<div style="margin-top:10px; background:#F6F6F8; border:1px solid #E8E8EC; padding:8px 10px; border-radius:8px;"><span style="font:600 10px Inter; color:#9A9AA3;">Expresión</span><code style="display:block; font:400 11px JetBrains Mono; margin-top:4px; word-break:break-all;">' +
          esc(item.visibleIf) +
          "</code></div>"
        : "") +
      "</div>"
    );
  };
  CanvasFormV4Grid.prototype.renderInspector = function () {
    var f = this.getField(this.selectedId);
    if (!f) {
      var page = this.getCurrentPage();
      var hasCond = getQuestionConditions(page).length > 0;
      return (
        '<div style="padding:16px;"><div style="font:600 12px Inter; letter-spacing:.1em; color:#9A9AA3; margin-bottom:12px;">PÁGINA ' +
        (this.currentPageIdx + 1) +
        " " +
        (hasCond
          ? '<span style="background:#FEF3C7; border:1px solid #F59E0B; color:#92400E; padding:2px 6px; border-radius:999px; font-size:9px;">COND</span>'
          : "") +
        '</div><div class="canvasform-insp-section"><div class="canvasform-insp-title">Título de página</div><input class="canvasform-insp-input" data-page-field="title" value="' +
        esc(page.title || "") +
        '" /></div><div class="canvasform-insp-section" style="margin-top:12px;"><div class="canvasform-insp-title">Descripción</div><textarea class="canvasform-insp-input" data-page-field="description" style="min-height:60px;">' +
        esc(page.description || "") +
        "</textarea></div>" +
        this.renderConditionalLogic(page, true) +
        '<div style="height:1px; background:#E8E8EC; margin:16px 0;"></div><div style="font:400 11px Inter; color:#9A9AA3;">Tip: Selecciona un campo para editar sus opciones y condicionales. Si ninguna está seleccionada, editas la página.</div></div>'
      );
    }
    var dots = Math.round(((f.width || 100) / 100) * 12);
    var label = f.label || f.type;
    var ph = f.placeholder || "";
    var widthsHtml = WIDTHS.map(function (w) {
      var active = f.width === w.id ? "active" : "";
      return (
        '<button class="canvasform-width-btn ' +
        active +
        '" data-w="' +
        w.id +
        '">' +
        w.label +
        ' <span style="opacity:.6; font-size:10px;">' +
        w.sub +
        "</span></button>"
      );
    }).join("");
    var dotsHtml = "";
    for (var i = 0; i < 12; i++)
      dotsHtml +=
        '<div class="canvasform-width-dot ' +
        (i < dots ? "active" : "") +
        '"></div>';
    var extra = "";
    if (isChoiceType(f.type)) {
      var opts = ensureOptionsArray(f.options);
      extra +=
        '<div class="canvasform-insp-section" style="margin-top:12px;"><div class="canvasform-insp-title" style="display:flex; justify-content:space-between; align-items:center;"><span>Opciones</span><small style="color:#9A9AA3; font:400 11px Inter;">Solo texto visible • ID fijo</small></div><div class="canvasform-options-list" style="display:grid; gap:8px; margin-top:8px;">' +
        opts
          .map(function (o, i) {
            return (
              '<div class="canvasform-opt-row" data-opt-i="' +
              i +
              '" style="display:flex; gap:8px; align-items:center;"><input class="canvasform-insp-input" data-opt-label="' +
              i +
              '" value="' +
              esc(o.text) +
              '" placeholder="Texto visible" style="flex:1;"><span style="font:500 11px JetBrains Mono; color:#9A9AA3; background:#F6F6F8; border:1px solid #E8E8EC; padding:6px 8px; border-radius:8px; min-width:90px; text-align:center;">' +
              esc(o.value) +
              '</span><button data-opt-del="' +
              i +
              '" style="width:28px; height:28px; border-radius:8px; border:1px solid #F2CEC5; background:#FFF3EF; color:#BF4934; cursor:pointer; font-size:12px;">✕</button></div>'
            );
          })
          .join("") +
        '</div><button data-opt-add style="width:100%; margin-top:10px; height:36px; border-radius:10px; border:1px dashed #AABBB1; background:#F6FFF8; color:#185c49; font:500 12px Inter; cursor:pointer;">+ Añadir opción</button></div>';
    }
    if (f.type === "file") {
      var modes = [
        { id: "all", label: "Todos los archivos" },
        { id: "image", label: "Solo imágenes" },
        { id: "pdf", label: "Solo PDF" },
        { id: "document", label: "Solo documentos" },
        { id: "image_document", label: "Imágenes y documentos" },
      ];
      var currentMode = f.fileMode || "all";
      extra +=
        '<div class="canvasform-insp-section" style="margin-top:12px;">' +
        '<div class="canvasform-insp-title">Tipo de archivo permitido</div>' +
        '<select class="canvasform-insp-input" data-edit="fileMode">' +
        modes
          .map(function (m) {
            return (
              '<option value="' +
              m.id +
              '" ' +
              (m.id === currentMode ? "selected" : "") +
              ">" +
              esc(m.label) +
              "</option>"
            );
          })
          .join("") +
        "</select>" +
        '<div style="margin-top:8px; display:grid; gap:6px;">' +
        '<div class="canvasform-insp-title" style="font-size:11px; margin-top:6px;">Tamaño máximo (MB)</div>' +
        '<input type="number" min="1" max="50" class="canvasform-insp-input" data-edit="maxSizeMB" value="' +
        (f.maxSizeMB || 5) +
        '" />' +
        "</div>" +
        "</div>";
    }
    if (f.type === "rating" || f.type === "scale" || f.type === "slider")
      extra +=
        '<div class="canvasform-insp-section" style="margin-top:12px;"><div class="canvasform-insp-title">Valor por defecto</div><input type="number" class="canvasform-insp-input" data-edit="value" value="' +
        (f.value || 0) +
        '" /></div>';
    if (f.type === "video" || f.type === "image")
      extra +=
        '<div class="canvasform-insp-section" style="margin-top:12px;"><div class="canvasform-insp-title">URL SRC</div><input class="canvasform-insp-input" data-edit="src" value="' +
        esc(f.src || "") +
        '" placeholder="https://..." /></div>';
    if (
      f.type === "matrix" ||
      f.type === "matrixcheckbox" ||
      f.type === "matrixtext"
    ) {
      var rows = f.rows || ["Fila 1", "Fila 2"];
      var cols = f.columns || ["Columna 1", "Columna 2", "Columna 3"];
      extra +=
        '<div class="canvasform-insp-section" style="margin-top:16px; border-top:1px dashed #E8E8EC; padding-top:12px;"><div class="canvasform-insp-title" style="display:flex; justify-content:space-between; align-items:center;"><span>Filas</span><small style="color:#9A9AA3;">' +
        rows.length +
        ' filas</small></div><div style="display:grid; gap:8px; margin-top:8px;">' +
        rows
          .map(function (r, i) {
            return (
              '<div style="display:flex; gap:8px;"><input class="canvasform-insp-input" data-row-label="' +
              i +
              '" value="' +
              esc(r) +
              '" placeholder="Fila ' +
              (i + 1) +
              '" style="flex:1;"><button data-row-del="' +
              i +
              '" style="width:28px; height:28px; border-radius:8px; border:1px solid #F2CEC5; background:#FFF3EF; color:#BF4934; cursor:pointer;">✕</button></div>'
            );
          })
          .join("") +
        '</div><button data-row-add style="width:100%; margin-top:8px; height:32px; border-radius:10px; border:1px dashed #AABBB1; background:#F6FFF8; color:#185c49; font:500 11px Inter; cursor:pointer;">+ Añadir fila</button></div>';
      extra +=
        '<div class="canvasform-insp-section" style="margin-top:16px;"><div class="canvasform-insp-title" style="display:flex; justify-content:space-between; align-items:center;"><span>Columnas</span><small style="color:#9A9AA3;">' +
        cols.length +
        ' cols</small></div><div style="display:grid; gap:8px; margin-top:8px;">' +
        cols
          .map(function (c, i) {
            return (
              '<div style="display:flex; gap:8px;"><input class="canvasform-insp-input" data-col-label="' +
              i +
              '" value="' +
              esc(c) +
              '" placeholder="Columna ' +
              (i + 1) +
              '" style="flex:1;"><button data-col-del="' +
              i +
              '" style="width:28px; height:28px; border-radius:8px; border:1px solid #F2CEC5; background:#FFF3EF; color:#BF4934; cursor:pointer;">✕</button></div>'
            );
          })
          .join("") +
        '</div><button data-col-add style="width:100%; margin-top:8px; height:32px; border-radius:10px; border:1px dashed #AABBB1; background:#F6FFF8; color:#185c49; font:500 11px Inter; cursor:pointer;">+ Añadir columna</button></div>';
    }
    if (f.type === "calculated")
      extra +=
        '<div class="canvasform-insp-section" style="margin-top:12px;"><div class="canvasform-insp-title">Expresion</div><input class="canvasform-insp-input" data-edit="expression" value="' +
        esc(f.expression || "") +
        '" /></div>';
    return (
      '<div class="canvasform-insp-section"><div class="canvasform-insp-title">Column width</div><div class="canvasform-width-grid">' +
      widthsHtml +
      '</div><div class="canvasform-width-dots">' +
      dotsHtml +
      '</div></div><div style="height:1px; background:#E8E8EC; margin:16px 0;"></div><div class="canvasform-insp-section"><div class="canvasform-insp-title">Label</div><input class="canvasform-insp-input" data-edit="label" value="' +
      esc(label) +
      '" /></div><div class="canvasform-insp-section" style="margin-top:12px;"><div class="canvasform-insp-title">Placeholder</div><input class="canvasform-insp-input" data-edit="placeholder" value="' +
      esc(ph) +
      '" placeholder="Field placeholder" /></div>' +
      extra +
      '<div style="height:1px; background:#E8E8EC; margin:16px 0;"></div><div class="canvasform-insp-section"><div style="display:flex; justify-content:space-between; align-items:center;"><div><div style="font:600 13px Inter; display:flex; gap:6px; align-items:center;">Required ' +
      (f.required
        ? '<span style="background:#000; color:#fff; font:700 9px Inter; padding:2px 6px; border-radius:999px;">ON</span>'
        : '<span style="background:#E8E8EC; color:#9A9AA3; font:700 9px Inter; padding:2px 6px; border-radius:999px;">OFF</span>') +
      '</div><div style="font:400 11px Inter; color:#9A9AA3; margin-top:2px;">' +
      (f.required
        ? "Este campo es obligatorio *"
        : "Marca para hacerlo obligatorio") +
      '</div></div><label class="canvasform-switch"><input type="checkbox" data-toggle="required" ' +
      (f.required ? "checked" : "") +
      '><span class="canvasform-switch-track"><span class="canvasform-switch-thumb"></span></span></label></div></div>' +
      this.renderConditionalLogic(f, false) +
      '<div style="height:1px; background:#E8E8EC; margin:16px 0;"></div><div class="canvasform-insp-actions"><button data-action="dup">⎘ Duplicate</button><button data-action="del">🗑 Delete</button></div><div class="canvasform-field-id"><b>FIELD ID</b><code>' +
      esc(f.id) +
      " • " +
      esc(f.type) +
      " • " +
      f.width +
      "%" +
      (f.required ? " • REQUIRED" : "") +
      "</code></div>"
    );
  };
  CanvasFormV4Grid.prototype.bind = function () {
    var self = this;
    this.root.querySelectorAll("[data-add]").forEach(function (b) {
      b.addEventListener("dragstart", function (e) {
        e.dataTransfer.setData("text/plain", b.getAttribute("data-add"));
      });
      b.addEventListener("click", function () {
        self.addField(b.getAttribute("data-add"));
      });
    });
    this.root.querySelectorAll("[data-page]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        if (e.target.closest("[data-del-page]")) return;
        self.switchPage(Number(el.getAttribute("data-page")));
      });
    });
    this.root.querySelectorAll("[data-add-page]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        self.addPage();
      });
    });
    this.root.querySelectorAll("[data-del-page]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        var idx = Number(b.getAttribute("data-del-page"));
        if (
          confirm(
            "¿Borrar página " +
              (idx + 1) +
              "? Se perderán " +
              (self.schema.pages[idx].elements || []).length +
              " campos.",
          )
        )
          self.delPage(idx);
      });
    });
    this.root.querySelectorAll("[data-cat]").forEach(function (el) {
      el.addEventListener("click", function () {
        var c = el.getAttribute("data-cat");
        self.openCats[c] = !self.openCats[c];
        self.render();
      });
    });
    var searchInput = this.root.querySelector("[data-search]");
    if (searchInput) {
      searchInput.addEventListener("input", function (e) {
        self.search = e.target.value;
        var cats = self.root.querySelectorAll(".canvasform-category");
        cats.forEach(function (catEl) {
          var items = catEl.querySelectorAll(".canvasform-field-btn");
          var visibleCount = 0;
          items.forEach(function (btn) {
            var label = (btn.textContent || "").toLowerCase();
            var show =
              !self.search || label.indexOf(self.search.toLowerCase()) !== -1;
            btn.style.display = show ? "" : "none";
            if (show) visibleCount++;
          });
          var titleEl = catEl.querySelector(".canvasform-cat-title span");
          if (titleEl) {
            var base = titleEl.textContent.split("(")[0].trim();
            titleEl.textContent = base + " (" + visibleCount + ")";
          }
          catEl.style.display = visibleCount === 0 && self.search ? "none" : "";
        });
        var ni = self.root.querySelector("[data-search]");
        if (ni) {
          ni.focus({ preventScroll: true });
          try {
            ni.setSelectionRange(self.search.length, self.search.length);
          } catch (_) {}
        }
      });
    }
    var titleInput = this.root.querySelector("[data-title]");
    if (titleInput) {
      titleInput.addEventListener("input", function (e) {
        self.schema.title = e.target.value;
        var h2 = self.root.querySelector(".canvasform-canvas-card h2");
        if (h2) h2.textContent = e.target.value;
        self.emitChange();
      });
    }
    this.root.querySelectorAll("[data-gfield]").forEach(function (f) {
      var field = f.getAttribute("data-gfield");
      var isCheck = f.type === "checkbox";
      var handler = function () {
        var tl = self.schema.timeLimit;
        var geo = self.schema.geoLocation;
        if (field === "timeEnabled") {
          tl.enabled = f.checked;
          tl.min.enabled = true;
          tl.max.enabled = true;
        }
        if (field === "minValue") tl.min.value = Number(f.value) || 0;
        if (field === "minUnit") tl.min.unit = f.value;
        if (field === "maxValue") tl.max.value = Number(f.value) || 1;
        if (field === "maxUnit") tl.max.unit = f.value;
        if (field === "geoEnabled") {
          geo.enabled = f.checked;
          geo.highAccuracy = true;
          geo.captureOnStart = true;
        }
        self.emitChange();
        if (isCheck) self.render();
      };
      if (isCheck) f.addEventListener("change", handler);
      else {
        f.addEventListener("change", handler);
        f.addEventListener("input", function () {
          var tl = self.schema.timeLimit;
          if (field === "minValue") tl.min.value = Number(f.value) || 0;
          if (field === "maxValue") tl.max.value = Number(f.value) || 1;
          self.emitChange();
        });
      }
    });
    this.root.querySelectorAll("[data-page-field]").forEach(function (inp) {
      inp.addEventListener("input", function () {
        var page = self.getCurrentPage();
        var k = inp.getAttribute("data-page-field");
        page[k] = inp.value;
        self.emitChange();
      });
    });
    this.root.querySelectorAll("[data-field]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        self.selectedId = el.getAttribute("data-field");
        self.render();
      });
      el.addEventListener("dragstart", function (e) {
        var id = el.getAttribute("data-field");
        e.dataTransfer.setData("text/field-id", id);
        self.dragId = id;
        el.style.opacity = "0.4";
      });
      el.addEventListener("dragend", function () {
        el.style.opacity = "1";
        self.dragId = null;
        self.root.querySelectorAll("[data-field]").forEach(function (x) {
          x.style.outline = "";
        });
      });
      el.addEventListener("dragover", function (e) {
        e.preventDefault();
        if (self.dragId && self.dragId !== el.getAttribute("data-field")) {
          el.style.outline = "2px dashed #000";
        }
      });
      el.addEventListener("dragleave", function () {
        el.style.outline = "";
      });
      el.addEventListener("drop", function (e) {
        e.preventDefault();
        el.style.outline = "";
        var fromId = e.dataTransfer.getData("text/field-id") || self.dragId;
        var toId = el.getAttribute("data-field");
        if (fromId && toId && fromId !== toId) self.reorder(fromId, toId);
      });
    });
    var dz = this.root.querySelector("[data-dropzone]");
    if (dz) {
      dz.addEventListener("dragover", function (e) {
        e.preventDefault();
        var card = dz.querySelector(".canvasform-canvas-card");
        if (card) card.style.borderColor = "#000";
      });
      dz.addEventListener("dragleave", function () {
        var card = dz.querySelector(".canvasform-canvas-card");
        if (card) card.style.borderColor = "";
      });
      dz.addEventListener("drop", function (e) {
        e.preventDefault();
        var card = dz.querySelector(".canvasform-canvas-card");
        if (card) card.style.borderColor = "";
        var type = e.dataTransfer.getData("text/plain");
        if (TYPES[type]) self.addField(type);
      });
    }
    this.root.querySelectorAll("[data-dup]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        self.dup(b.getAttribute("data-dup"));
      });
    });
    this.root.querySelectorAll("[data-del]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        self.del(b.getAttribute("data-del"));
      });
    });
    this.root.querySelectorAll("[data-w]").forEach(function (b) {
      b.addEventListener("click", function () {
        var f = self.getField(self.selectedId);
        if (f) {
          f.width = Number(b.getAttribute("data-w"));
          var page = self.getCurrentPage();
          var el = page.elements.find(function (x) {
            return x.name === f.id;
          });
          if (el) {
            el.width = f.width;
            el.canvasformWidth = f.width;
          }
          self.render();
          self.emitChange();
        }
      });
    });
    // FIX: fileMode es SELECT necesita change
    this.root.querySelectorAll("[data-edit]").forEach(function (inp) {
      var evt = inp.tagName === "SELECT" ? "change" : "input";
      inp.addEventListener(evt, function () {
        var f = self.getField(self.selectedId);
        if (!f) return;
        var key = inp.getAttribute("data-edit");
        if (key === "label") {
          f.label = inp.value;
          var page = self.getCurrentPage();
          var el = page.elements.find(function (x) {
            return x.name === f.id;
          });
          if (el) el.title = inp.value;
        } else if (key === "placeholder") {
          f.placeholder = inp.value;
          var pg = self.getCurrentPage();
          var ell = pg.elements.find(function (x) {
            return x.name === f.id;
          });
          if (ell) ell.placeholder = inp.value;
        } else if (key === "value") {
          f.value = Number(inp.value) || 0;
        } else if (key === "src") {
          f.src = inp.value;
        } else if (key === "expression") {
          f.expression = inp.value;
        } else if (key === "fileMode") {
          f.fileMode = inp.value;
          var map = {
            all: "*/*",
            image: "image/*",
            pdf: "application/pdf,.pdf",
            document: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv",
            image_document: "image/*,.pdf,.doc,.docx,.xls,.xlsx",
          };
          f.accept = map[f.fileMode] || "*/*";
          var p = self.getCurrentPage();
          var e = p.elements.find(function (x) {
            return x.name === f.id;
          });
          if (e) {
            e.fileMode = f.fileMode;
            e.accept = f.accept;
          }
          self.render();
        } else if (key === "accept") {
          f.accept = inp.value;
          var p2 = self.getCurrentPage();
          var e2 = p2.elements.find(function (x) {
            return x.name === f.id;
          });
          if (e2) e2.accept = f.accept;
        } else if (key === "maxSizeMB") {
          f.maxSizeMB = Number(inp.value) || 5;
          f.maxSize = f.maxSizeMB * 1024 * 1024;
          var p3 = self.getCurrentPage();
          var e3 = p3.elements.find(function (x) {
            return x.name === f.id;
          });
          if (e3) {
            e3.maxSize = f.maxSize;
            e3.maxSizeMB = f.maxSizeMB;
          }
        }
        self.emitChange();
      });
    });
    this.root.querySelectorAll("[data-opt-label]").forEach(function (inp) {
      inp.addEventListener("input", function () {
        var f = self.getField(self.selectedId);
        if (!f) return;
        var idx = Number(inp.getAttribute("data-opt-label"));
        var opts = ensureOptionsArray(f.options);
        if (opts[idx]) {
          opts[idx].text = inp.value;
          f.options = opts;
          var page = self.getCurrentPage();
          var el = page.elements.find(function (x) {
            return x.name === f.id;
          });
          if (el) {
            el.choices = opts;
          }
          self.emitChange();
        }
      });
    });
    this.root.querySelectorAll("[data-opt-del]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var f = self.getField(self.selectedId);
        if (!f) return;
        var idx = Number(btn.getAttribute("data-opt-del"));
        var opts = ensureOptionsArray(f.options);
        opts.splice(idx, 1);
        f.options = opts;
        var page = self.getCurrentPage();
        var el = page.elements.find(function (x) {
          return x.name === f.id;
        });
        if (el) {
          el.choices = opts;
        }
        self.render();
        self.emitChange();
      });
    });
    var addOptBtn = this.root.querySelector("[data-opt-add]");
    if (addOptBtn) {
      addOptBtn.addEventListener("click", function () {
        var f = self.getField(self.selectedId);
        if (!f) return;
        var opts = ensureOptionsArray(f.options);
        var newVal = genOptionValue(opts);
        opts.push({ value: newVal, text: "Opción " + (opts.length + 1) });
        f.options = opts;
        var page = self.getCurrentPage();
        var el = page.elements.find(function (x) {
          return x.name === f.id;
        });
        if (el) {
          el.choices = opts;
        }
        self.render();
        self.emitChange();
      });
    }
    this.root.querySelectorAll("[data-row-label]").forEach(function (inp) {
      inp.addEventListener("input", function () {
        var f = self.getField(self.selectedId);
        if (!f) return;
        var idx = Number(inp.getAttribute("data-row-label"));
        f.rows[idx] = inp.value;
        var page = self.getCurrentPage();
        var el = page.elements.find(function (x) {
          return x.name === f.id;
        });
        if (el) el.rows = f.rows.slice();
        self.emitChange();
      });
    });
    this.root.querySelectorAll("[data-row-del]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var f = self.getField(self.selectedId);
        if (!f) return;
        var idx = Number(btn.getAttribute("data-row-del"));
        f.rows.splice(idx, 1);
        var page = self.getCurrentPage();
        var el = page.elements.find(function (x) {
          return x.name === f.id;
        });
        if (el) el.rows = f.rows.slice();
        self.render();
        self.emitChange();
      });
    });
    var addRowBtn = this.root.querySelector("[data-row-add]");
    if (addRowBtn) {
      addRowBtn.addEventListener("click", function () {
        var f = self.getField(self.selectedId);
        if (!f) return;
        if (!f.rows) f.rows = [];
        f.rows.push("Fila " + (f.rows.length + 1));
        var page = self.getCurrentPage();
        var el = page.elements.find(function (x) {
          return x.name === f.id;
        });
        if (el) el.rows = f.rows.slice();
        self.render();
        self.emitChange();
      });
    }
    this.root.querySelectorAll("[data-col-label]").forEach(function (inp) {
      inp.addEventListener("input", function () {
        var f = self.getField(self.selectedId);
        if (!f) return;
        var idx = Number(inp.getAttribute("data-col-label"));
        f.columns[idx] = inp.value;
        var page = self.getCurrentPage();
        var el = page.elements.find(function (x) {
          return x.name === f.id;
        });
        if (el) el.columns = f.columns.slice();
        self.emitChange();
      });
    });
    this.root.querySelectorAll("[data-col-del]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var f = self.getField(self.selectedId);
        if (!f) return;
        var idx = Number(btn.getAttribute("data-col-del"));
        f.columns.splice(idx, 1);
        var page = self.getCurrentPage();
        var el = page.elements.find(function (x) {
          return x.name === f.id;
        });
        if (el) el.columns = f.columns.slice();
        self.render();
        self.emitChange();
      });
    });
    var addColBtn = this.root.querySelector("[data-col-add]");
    if (addColBtn) {
      addColBtn.addEventListener("click", function () {
        var f = self.getField(self.selectedId);
        if (!f) return;
        if (!f.columns) f.columns = [];
        f.columns.push("Columna " + (f.columns.length + 1));
        var page = self.getCurrentPage();
        var el = page.elements.find(function (x) {
          return x.name === f.id;
        });
        if (el) el.columns = f.columns.slice();
        self.render();
        self.emitChange();
      });
    }
    var toggleReq = this.root.querySelector('[data-toggle="required"]');
    if (toggleReq) {
      toggleReq.addEventListener("change", function () {
        var f = self.getField(self.selectedId);
        if (f) {
          f.required = toggleReq.checked;
          var page = self.getCurrentPage();
          var el = page.elements.find(function (x) {
            return x.name === f.id;
          });
          if (el) el.isRequired = f.required;
          self.emitChange();
          self.render();
        }
      });
    }
    var dupAction = this.root.querySelector('[data-action="dup"]');
    if (dupAction)
      dupAction.addEventListener("click", function () {
        self.dup(self.selectedId);
      });
    var delAction = this.root.querySelector('[data-action="del"]');
    if (delAction)
      delAction.addEventListener("click", function () {
        self.del(self.selectedId);
      });
    var saveBtn = this.root.querySelector("[data-save]");
    if (saveBtn)
      saveBtn.addEventListener("click", function () {
        self.save();
      });
    var previewBtn = this.root.querySelector("[data-preview]");
    if (previewBtn)
      previewBtn.addEventListener("click", function () {
        self.preview();
      });
    self.root.querySelectorAll("[data-cond-field]").forEach(function (inp) {
      var evt = inp.tagName === "SELECT" ? "change" : "input";
      inp.addEventListener(evt, function () {
        var idx = Number(inp.getAttribute("data-cond-index"));
        var fieldName = inp.getAttribute("data-cond-field");
        var isPage = !self.getField(self.selectedId);
        var target = isPage
          ? self.getCurrentPage()
          : self.getField(self.selectedId);
        if (!target) return;
        var conds = getQuestionConditions(target);
        if (!conds[idx]) conds[idx] = normalizeCondition({});
        conds[idx][fieldName] = inp.value;
        if (fieldName === "question") {
          var src = getQuestionById(self.schema, inp.value);
          var allowed = getOperatorListForSource(src);
          if (
            !allowed.some(function (o) {
              return o.value === conds[idx].operator;
            })
          ) {
            conds[idx].operator = allowed[0].value;
          }
          if (src) {
            if (isChoiceType(src.type)) {
              var ch = ensureOptionsArray(src.options);
              conds[idx].value = ch[0] ? ch[0].value : "";
            } else if (src.type === "boolean") {
              conds[idx].value = "true";
            } else if (
              ["number", "rating", "scale", "slider"].indexOf(src.type) !== -1
            ) {
              conds[idx].value = "0";
            } else {
              conds[idx].value = "";
            }
          }
        }
        target.canvasformConditions = conds;
        var pageEl = null;
        if (!isPage) {
          pageEl = self.getCurrentPage().elements.find(function (x) {
            return x.name === target.id;
          });
          if (pageEl) {
            pageEl.canvasformConditions = conds;
          }
        }
        rebuildVisibleIf(target, self.schema);
        if (pageEl) pageEl.visibleIf = target.visibleIf;
        self.emitChange();
        if (fieldName === "question" || fieldName === "operator") {
          self.render();
        }
      });
    });
    var condLogic = self.root.querySelector("[data-cond-logic]");
    if (condLogic) {
      condLogic.addEventListener("change", function () {
        var isPage = !self.getField(self.selectedId);
        var target = isPage
          ? self.getCurrentPage()
          : self.getField(self.selectedId);
        if (!target) return;
        target.canvasformConditionLogic = condLogic.value;
        rebuildVisibleIf(target, self.schema);
        var pageEl = !isPage
          ? self.getCurrentPage().elements.find(function (x) {
              return x.name === target.id;
            })
          : null;
        if (pageEl) {
          pageEl.canvasformConditionLogic = target.canvasformConditionLogic;
          pageEl.visibleIf = target.visibleIf;
        }
        self.emitChange();
      });
    }
    var condAction = self.root.querySelector("[data-cond-action-mode]");
    if (condAction) {
      condAction.addEventListener("change", function () {
        var isPage = !self.getField(self.selectedId);
        var target = isPage
          ? self.getCurrentPage()
          : self.getField(self.selectedId);
        if (!target) return;
        target.canvasformConditionAction = condAction.value;
        rebuildVisibleIf(target, self.schema);
        var pageEl = !isPage
          ? self.getCurrentPage().elements.find(function (x) {
              return x.name === target.id;
            })
          : null;
        if (pageEl) {
          pageEl.canvasformConditionAction = target.canvasformConditionAction;
          pageEl.visibleIf = target.visibleIf;
        }
        self.emitChange();
        self.render();
      });
    }
    self.root
      .querySelectorAll('[data-cond-action="remove"]')
      .forEach(function (btn) {
        btn.addEventListener("click", function () {
          var idx = Number(btn.getAttribute("data-cond-index"));
          var isPage = !self.getField(self.selectedId);
          var target = isPage
            ? self.getCurrentPage()
            : self.getField(self.selectedId);
          if (!target) return;
          var conds = getQuestionConditions(target);
          conds.splice(idx, 1);
          target.canvasformConditions = conds;
          rebuildVisibleIf(target, self.schema);
          var pageEl = !isPage
            ? self.getCurrentPage().elements.find(function (x) {
                return x.name === target.id;
              })
            : null;
          if (pageEl) {
            pageEl.canvasformConditions = conds;
            pageEl.visibleIf = target.visibleIf;
          }
          self.render();
          self.emitChange();
        });
      });
    var addCond = self.root.querySelector('[data-cond-action="add"]');
    if (addCond) {
      addCond.addEventListener("click", function () {
        var isPage = !self.getField(self.selectedId);
        var target = isPage
          ? self.getCurrentPage()
          : self.getField(self.selectedId);
        if (!target) return;
        var available = getAllConditionQuestions(self.schema).filter(
          function (q) {
            return isPage ? true : q.id !== target.id;
          },
        );
        if (!available.length) return;
        var conds = getQuestionConditions(target);
        var src = available[0];
        var allowed = getOperatorListForSource(src);
        var defVal = "";
        if (isChoiceType(src.type)) {
          var ch = ensureOptionsArray(src.options);
          defVal = ch[0] ? ch[0].value : "";
        } else if (src.type === "boolean") defVal = "true";
        else if (
          ["number", "rating", "scale", "slider"].indexOf(src.type) !== -1
        )
          defVal = "0";
        conds.push({
          question: src.id,
          operator: allowed[0].value,
          value: defVal,
        });
        target.canvasformConditions = conds;
        if (!target.canvasformConditionLogic)
          target.canvasformConditionLogic = "and";
        if (!target.canvasformConditionAction)
          target.canvasformConditionAction = isPage ? "hide" : "show";
        rebuildVisibleIf(target, self.schema);
        var pageEl = !isPage
          ? self.getCurrentPage().elements.find(function (x) {
              return x.name === target.id;
            })
          : null;
        if (pageEl) {
          pageEl.canvasformConditions = conds;
          pageEl.canvasformConditionLogic = target.canvasformConditionLogic;
          pageEl.canvasformConditionAction = target.canvasformConditionAction;
          pageEl.visibleIf = target.visibleIf;
        }
        self.render();
        self.emitChange();
      });
    }
  };
  CanvasFormV4Grid.prototype.addField = function (type) {
    var id = "f" + Date.now();
    var def = TYPES[type] || { label: type };
    var field = {
      id: id,
      type: type,
      label: def.label || type,
      placeholder: "",
      width: type === "text" || type === "email" ? 50 : 100,
      required: false,
      canvasformConditions: [],
      canvasformConditionLogic: "and",
      canvasformConditionAction: "show",
    };
    if (type === "rating" || type === "scale" || type === "slider")
      field.value = 4;
    if (isChoiceType(type))
      field.options = [
        { value: "option_1", text: "Opción 1" },
        { value: "option_2", text: "Opción 2" },
        { value: "option_3", text: "Opción 3" },
      ];
    if (
      type === "matrix" ||
      type === "matrixcheckbox" ||
      type === "matrixtext"
    ) {
      field.rows = ["Fila 1", "Fila 2"];
      field.columns = ["Columna 1", "Columna 2", "Columna 3"];
    }
    if (type === "file") {
      field.fileMode = "all";
      field.accept = "*/*";
      field.maxSize = 5242880;
      field.maxSizeMB = 5;
    }
    if (type === "calculated") {
      field.expression = "";
      field.readOnly = true;
    }
    if (type === "hidden") {
      field.visible = false;
    }
    this.schema.fields.push(field);
    var page = this.getCurrentPage();
    page.elements.push({
      name: id,
      type: type,
      title: field.label,
      placeholder: "",
      isRequired: false,
      width: field.width,
      canvasformWidth: field.width,
      choices: field.options,
      defaultValue: field.value,
      src: field.src,
      rows: field.rows,
      columns: field.columns,
      fileMode: field.fileMode,
      accept: field.accept,
      maxSize: field.maxSize,
      maxSizeMB: field.maxSizeMB,
      canvasformConditions: [],
      canvasformConditionLogic: "and",
      canvasformConditionAction: "show",
    });
    this.selectedId = id;
    this.render();
    this.emitChange();
  };
  CanvasFormV4Grid.prototype.dup = function (id) {
    var f = this.getField(id);
    if (!f) return;
    var nf = copy(f);
    nf.id = "f" + Date.now();
    var idx = this.schema.fields.findIndex(function (x) {
      return x.id === id;
    });
    this.schema.fields.splice(idx + 1, 0, nf);
    var page = this.getCurrentPage();
    var pIdx = page.elements.findIndex(function (x) {
      return x.name === id;
    });
    if (pIdx !== -1) {
      var el = copy(page.elements[pIdx]);
      el.name = nf.id;
      el.title = nf.label;
      page.elements.splice(pIdx + 1, 0, el);
    }
    this.selectedId = nf.id;
    this.render();
    this.emitChange();
  };
  CanvasFormV4Grid.prototype.del = function (id) {
    this.schema.fields = this.schema.fields.filter(function (x) {
      return x.id !== id;
    });
    var page = this.getCurrentPage();
    page.elements = page.elements.filter(function (x) {
      return x.name !== id;
    });
    if (this.selectedId === id)
      this.selectedId = (page.elements[0] && page.elements[0].name) || null;
    this.render();
    this.emitChange();
  };
  CanvasFormV4Grid.prototype.reorder = function (fromId, toId) {
    var fromIdx = this.schema.fields.findIndex(function (x) {
      return x.id === fromId;
    });
    var toIdx = this.schema.fields.findIndex(function (x) {
      return x.id === toId;
    });
    if (fromIdx !== -1 && toIdx !== -1) {
      var moved = this.schema.fields.splice(fromIdx, 1)[0];
      this.schema.fields.splice(toIdx, 0, moved);
    }
    var page = this.getCurrentPage();
    var pf = page.elements.findIndex(function (x) {
      return x.name === fromId;
    });
    var pt = page.elements.findIndex(function (x) {
      return x.name === toId;
    });
    if (pf !== -1 && pt !== -1) {
      var m = page.elements.splice(pf, 1)[0];
      page.elements.splice(pt, 0, m);
    }
    this.render();
    this.emitChange();
  };
  CanvasFormV4Grid.prototype.emitChange = function () {
    if (typeof this.opts.onChange === "function")
      this.opts.onChange(this.getSchema());
    try {
      localStorage.setItem(
        "canvasform-v4-grid-draft",
        JSON.stringify(this.schema),
      );
    } catch (e) {}
  };
  CanvasFormV4Grid.prototype.save = function () {
    this.emitChange();
    var toast = document.createElement("div");
    toast.textContent =
      "Saved ✓ " +
      this.schema.fields.length +
      " fields " +
      (this.schema.timeLimit.enabled ? "⏱" : "") +
      (this.schema.geoLocation.enabled ? "📍" : "");
    toast.style.cssText =
      "position:fixed; top:60px; right:16px; background:#000; color:#fff; padding:8px 14px; border-radius:999px; font:500 12px Inter; z-index:9999;";
    document.body.appendChild(toast);
    setTimeout(function () {
      toast.remove();
    }, 2000);
    if (typeof this.opts.onSave === "function")
      this.opts.onSave(this.getSchema());
    return this.getSchema();
  };
  CanvasFormV4Grid.prototype.preview = function () {
    var schema = this.getSchema();
    var definition = {
      title: schema.title || "Preview",
      description: schema.description || "",
      timeLimit: schema.timeLimit,
      geoLocation: schema.geoLocation,
      pages: schema.pages.map(function (p) {
        return {
          name: p.name,
          title: p.title || "",
          description: p.description || "",
          elements: (p.elements || []).map(function (el) {
            return el;
          }),
          canvasformConditions: p.canvasformConditions || [],
          canvasformConditionLogic: p.canvasformConditionLogic || "and",
          canvasformConditionAction: p.canvasformConditionAction || "hide",
          visibleIf: p.visibleIf,
        };
      }),
    };
    var modal = document.createElement("div");
    modal.style.cssText =
      "position:fixed; inset:0; background:rgba(0,0,0,0.5); backdrop-filter:blur(12px); z-index:10000; display:flex; align-items:center; justify-content:center; padding:20px; overflow:auto;";
    var inner =
      '<div style="background:#F6F6F8; border-radius:20px; width:100%; max-width:960px; max-height:90vh; overflow:hidden; display:flex; flex-direction:column; border:1px solid #E8E8EC; box-shadow:0 20px 60px rgba(0,0,0,0.2);"><div style="display:flex; justify-content:space-between; align-items:center; padding:16px 20px; background:#fff; border-bottom:1px solid #E8E8EC;"><div style="display:flex; align-items:center; gap:10px;"><div style="width:28px; height:28px; background:#000; color:#fff; border-radius:8px; display:grid; place-items:center; font:700 10px Inter;">CANVASFORM</div><div><b style="font:600 13px Inter;">Vista previa - Response</b><div style="font:400 11px Inter; color:#9A9AA3;">' +
      schema.fields.length +
      " fields • " +
      schema.pages.length +
      ' págs • Condicional ON</div></div></div><div style="display:flex; gap:8px;"><button data-tab="preview" style="height:32px; padding:0 14px; border-radius:999px; border:1px solid #000; background:#000; color:#fff; font:500 12px Inter; cursor:pointer;">Preview</button><button data-tab="json" style="height:32px; padding:0 14px; border-radius:999px; border:1px solid #E8E8EC; background:#fff; font:500 12px Inter; cursor:pointer;">JSON</button><button data-close style="width:32px; height:32px; border-radius:50%; border:1px solid #E8E8EC; background:#fff; cursor:pointer;">X</button></div></div><div style="flex:1; overflow:auto; padding:20px; background:#F6F6F8;"><div data-preview-host></div><pre data-json-view style="display:none; background:#fff; padding:16px; border-radius:12px; border:1px solid #E8E8EC; font:11px monospace; white-space:pre-wrap; max-height:70vh; overflow:auto;"></pre></div></div>';
    modal.innerHTML = inner;
    document.body.appendChild(modal);
    var host = modal.querySelector("[data-preview-host]");
    var jsonView = modal.querySelector("[data-json-view]");
    jsonView.textContent = JSON.stringify(definition, null, 2);
    var tabPreview = modal.querySelector('[data-tab="preview"]');
    var tabJson = modal.querySelector('[data-tab="json"]');
    tabPreview.addEventListener("click", function () {
      host.style.display = "block";
      jsonView.style.display = "none";
      tabPreview.style.background = "#000";
      tabPreview.style.color = "#fff";
      tabJson.style.background = "#fff";
      tabJson.style.color = "#000";
    });
    tabJson.addEventListener("click", function () {
      host.style.display = "none";
      jsonView.style.display = "block";
      tabJson.style.background = "#000";
      tabJson.style.color = "#fff";
      tabPreview.style.background = "#fff";
      tabPreview.style.color = "#000";
    });
    modal.querySelector("[data-close]").addEventListener("click", function () {
      modal.remove();
    });
    modal.addEventListener("click", function (e) {
      if (e.target === modal) modal.remove();
    });
    if (typeof window.CanvasFormSurvey === "function") {
      try {
        new window.CanvasFormSurvey(host, definition);
      } catch (e) {
        host.innerHTML =
          '<div style="background:#FFF3EF; border:1px solid #F2CEC5; padding:16px; border-radius:12px; font:500 12px Inter; color:#BF4934;">Error: ' +
          esc(String(e.message || e)) +
          "</div>";
      }
    } else {
      host.innerHTML =
        '<div style="background:#fff; border:1px solid #E8E8EC; border-radius:16px; padding:24px; text-align:center;"><h3 style="font:600 14px Inter;">Falta canvasform-response-v4.js</h3><p style="font:400 12px Inter; color:#9A9AA3;">Incluye canvasform-response-v4.js + css antes del creator.</p></div>';
    }
  };
  CanvasFormV4Grid.prototype.getSchema = function () {
    var s = copy(this.schema);
    s.fields = (s.fields || []).map(function (f) {
      var nf = {
        id: f.id,
        type: f.type,
        label: f.label,
        placeholder: f.placeholder || "",
        width: f.width,
        required: !!f.required,
        canvasformConditions: f.canvasformConditions || [],
        canvasformConditionLogic: f.canvasformConditionLogic || "and",
        canvasformConditionAction: f.canvasformConditionAction || "show",
        visibleIf: f.visibleIf,
      };
      if (f.options) nf.options = ensureOptionsArray(f.options);
      if (f.value != null) nf.value = f.value;
      if (f.src) nf.src = f.src;
      if (f.rows) nf.rows = f.rows.slice();
      if (f.columns) nf.columns = f.columns.slice();
      if (f.expression) nf.expression = f.expression;
      if (f.accept) nf.accept = f.accept;
      if (f.fileMode) nf.fileMode = f.fileMode;
      if (f.maxSize) nf.maxSize = f.maxSize;
      if (f.maxSizeMB) nf.maxSizeMB = f.maxSizeMB;
      return nf;
    });
    if (!s.pages || !s.pages.length) {
      s.pages = [
        {
          name: "page1",
          title: s.title || "Tu opinion",
          elements: [],
          canvasformConditions: [],
          canvasformConditionLogic: "and",
          canvasformConditionAction: "hide",
        },
      ];
    }
    s.pages = s.pages.map(function (p) {
      return {
        name: p.name,
        title: p.title || "",
        description: p.description || "",
        elements: (p.elements || []).map(function (el) {
          return {
            name: el.name,
            type: el.type,
            title: el.title,
            placeholder: el.placeholder || "",
            isRequired: !!el.isRequired,
            width: el.width || 100,
            canvasformWidth: el.width || 100,
            choices: el.choices ? ensureOptionsArray(el.choices) : undefined,
            defaultValue: el.defaultValue,
            src: el.src,
            rows: el.rows,
            columns: el.columns,
            expression: el.expression,
            fileMode: el.fileMode,
            accept: el.accept,
            maxSize: el.maxSize,
            maxSizeMB: el.maxSizeMB,
            canvasformConditions: el.canvasformConditions || [],
            canvasformConditionLogic: el.canvasformConditionLogic || "and",
            canvasformConditionAction: el.canvasformConditionAction || "show",
            visibleIf: el.visibleIf,
          };
        }),
        canvasformConditions: p.canvasformConditions || [],
        canvasformConditionLogic: p.canvasformConditionLogic || "and",
        canvasformConditionAction: p.canvasformConditionAction || "hide",
        visibleIf: p.visibleIf,
      };
    });
    if (s.pages.length === 1) {
      s.pages[0].elements = s.fields.map(function (f) {
        return {
          name: f.id,
          type: f.type,
          title: f.label,
          placeholder: f.placeholder || "",
          isRequired: !!f.required,
          width: f.width || 100,
          canvasformWidth: f.width || 100,
          choices: f.options ? ensureOptionsArray(f.options) : undefined,
          defaultValue: f.value,
          src: f.src,
          rows: f.rows,
          columns: f.columns,
          expression: f.expression,
          fileMode: f.fileMode,
          accept: f.accept,
          maxSize: f.maxSize,
          maxSizeMB: f.maxSizeMB,
          canvasformConditions: f.canvasformConditions,
          canvasformConditionLogic: f.canvasformConditionLogic,
          canvasformConditionAction: f.canvasformConditionAction,
          visibleIf: f.visibleIf,
        };
      });
    }
    return s;
  };
  CanvasFormV4Grid.prototype.setSchema = function (s) {
    this.schema = copy(s);
    if (this.schema.fields) {
      this.schema.fields.forEach(function (f) {
        if (f.auraConditions && !f.canvasformConditions) {
          f.canvasformConditions = f.auraConditions;
          delete f.auraConditions;
        }
        if (f.auraConditionLogic && !f.canvasformConditionLogic) {
          f.canvasformConditionLogic = f.auraConditionLogic;
          delete f.auraConditionLogic;
        }
        if (f.auraConditionAction && !f.canvasformConditionAction) {
          f.canvasformConditionAction = f.auraConditionAction;
          delete f.auraConditionAction;
        }
        if (f.auraWidth && !f.canvasformWidth) {
          f.canvasformWidth = f.auraWidth;
          delete f.auraWidth;
        }
      });
    }
    if (this.schema.pages) {
      this.schema.pages.forEach(function (p) {
        if (p.auraConditions && !p.canvasformConditions) {
          p.canvasformConditions = p.auraConditions;
          delete p.auraConditions;
        }
        if (p.auraConditionLogic && !p.canvasformConditionLogic) {
          p.canvasformConditionLogic = p.auraConditionLogic;
          delete p.auraConditionLogic;
        }
        if (p.auraConditionAction && !p.canvasformConditionAction) {
          p.canvasformConditionAction = p.auraConditionAction;
          delete p.auraConditionAction;
        }
        (p.elements || []).forEach(function (el) {
          if (el.auraConditions && !el.canvasformConditions) {
            el.canvasformConditions = el.auraConditions;
            delete el.auraConditions;
          }
          if (el.auraConditionLogic && !el.canvasformConditionLogic) {
            el.canvasformConditionLogic = el.auraConditionLogic;
            delete el.auraConditionLogic;
          }
          if (el.auraConditionAction && !el.canvasformConditionAction) {
            el.canvasformConditionAction = el.auraConditionAction;
            delete el.auraConditionAction;
          }
          if (el.auraWidth && !el.canvasformWidth) {
            el.canvasformWidth = el.auraWidth;
            delete el.auraWidth;
          }
        });
      });
    }
    this.schema.timeLimit = normalizeTimeLimit(this.schema.timeLimit);
    this.schema.geoLocation = normalizeGeo(this.schema.geoLocation);
    this.schema.fields.forEach(function (f) {
      if (!f.canvasformConditions) f.canvasformConditions = [];
    });
    this.schema.pages.forEach(function (p) {
      if (!p.canvasformConditions) p.canvasformConditions = [];
      (p.elements || []).forEach(function (el) {
        if (!el.canvasformConditions) el.canvasformConditions = [];
      });
    });
    this.render();
  };
  CanvasFormV4Grid.prototype.on = function (event, cb) {
    if (!this._listeners) this._listeners = {};
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(cb);
    if (event === "change") {
      var prev = this.opts.onChange;
      var self = this;
      this.opts.onChange = function (s) {
        if (prev) prev(s);
        self._listeners[event].forEach(function (fn) {
          try {
            fn(s);
          } catch (e) {}
        });
      };
    }
    if (event === "save") {
      var prev2 = this.opts.onSave;
      var self2 = this;
      this.opts.onSave = function (s) {
        if (prev2) prev2(s);
        self2._listeners[event].forEach(function (fn) {
          try {
            fn(s);
          } catch (e) {}
        });
      };
    }
    return this;
  };
  CanvasFormV4Grid.prototype.emit = function (event, payload) {
    if (this._listeners && this._listeners[event]) {
      this._listeners[event].forEach(function (fn) {
        try {
          fn(payload);
        } catch (e) {}
      });
    }
    if (event === "change" && typeof this.opts.onChange === "function")
      this.opts.onChange(payload || this.getSchema());
    if (event === "save" && typeof this.opts.onSave === "function")
      this.opts.onSave(payload || this.getSchema());
  };
  CanvasFormV4Grid.prototype.persist = function () {
    this.emitChange();
  };
  CanvasFormV4Grid.prototype.destroy = function () {
    if (this.host) this.host.innerHTML = "";
  };
  global.CanvasFormV4Grid = CanvasFormV4Grid;
  global.CanvasFormGrid = CanvasFormV4Grid;
  global.CanvasFormSurveyCreator = CanvasFormV4Grid;
  global.CanvasFormCreator = CanvasFormV4Grid;
  global.CanvasFormSurveyCreator.types = TYPES;
  global.CanvasFormSurveyCreator.version = VERSION;
  global.CanvasFormSurveyCreator.operators = OPERATORS;
})(window);
