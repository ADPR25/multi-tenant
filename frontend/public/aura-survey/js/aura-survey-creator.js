var IsDesplegable = false;

(function (global) {
  "use strict";
  var VERSION = "1.4.0";
  var types = [
    { type: "text", label: "Texto corto", icon: "T", category: "Básicos" },
    { type: "textarea", label: "Texto largo", icon: "¶", category: "Básicos" },
    { type: "number", label: "Número", icon: "#", category: "Básicos" },
    { type: "email", label: "Email", icon: "@", category: "Básicos" },
    {
      type: "radiogroup",
      label: "Opción única",
      icon: "◉",
      category: "Selección",
    },
    {
      type: "checkbox",
      label: "Selección múltiple",
      icon: "☑",
      category: "Selección",
    },
    {
      type: "dropdown",
      label: "Lista desplegable",
      icon: "▾",
      category: "Selección",
    },
    { type: "ranking", label: "Ranking", icon: "☷", category: "Selección" },
    { type: "rating", label: "Valoración", icon: "★", category: "Valoración" },
    { type: "scale", label: "Escala", icon: "1–10", category: "Valoración" },
    { type: "slider", label: "Slider", icon: "━", category: "Valoración" },
    { type: "boolean", label: "Sí / No", icon: "◐", category: "Valoración" },
    { type: "date", label: "Fecha", icon: "D", category: "Fecha y hora" },
    { type: "time", label: "Hora", icon: "◷", category: "Fecha y hora" },
    {
      type: "datetime",
      label: "Fecha y hora",
      icon: "◴",
      category: "Fecha y hora",
    },
    {
      type: "daterange",
      label: "Rango de fechas",
      icon: "↔",
      category: "Fecha y hora",
    },
    { type: "tel", label: "Teléfono", icon: "☎", category: "Entrada" },
    { type: "file", label: "Archivo", icon: "↥", category: "Entrada" },
    { type: "signature", label: "Firma", icon: "✎", category: "Entrada" },
    {
      type: "matrix",
      label: "Matriz",
      icon: "⊞",
      category: "Selección avanzada",
    },
    {
      type: "matrixcheckbox",
      label: "Matriz múltiple",
      icon: "⊠",
      category: "Selección avanzada",
    },
    {
      type: "matrixtext",
      label: "Matriz de texto",
      icon: "▦",
      category: "Selección avanzada",
    },
    { type: "heading", label: "Encabezado", icon: "H", category: "Diseño" },
    {
      type: "description",
      label: "Texto descriptivo",
      icon: "¶",
      category: "Diseño",
    },
    { type: "image", label: "Imagen", icon: "▣", category: "Diseño" },
    { type: "video", label: "Video", icon: "▶", category: "Diseño" },
    { type: "separator", label: "Separador", icon: "—", category: "Diseño" },
    { type: "section", label: "Sección", icon: "☰", category: "Diseño" },
    {
      type: "calculated",
      label: "Campo calculado",
      icon: "Σ",
      category: "Avanzados",
    },
    { type: "hidden", label: "Campo oculto", icon: "◌", category: "Avanzados" },
  ];
  var labels = {};
  types.forEach(function (item) {
    labels[item.type] = item.label;
  });
  var categoryIcons = {
    Básicos: "Aa",
    Selección: "☷",
    Valoración: "★",
    "Fecha y hora": "◷",
    Entrada: "↥",
    "Selección avanzada": "⊞",
    Diseño: "✦",
    Avanzados: "Σ",
  };
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
  var CHOICE_TYPES = ["radiogroup", "checkbox", "dropdown", "ranking"];
  var CONDITION_TYPES = [
    "text",
    "textarea",
    "number",
    "email",
    "tel",
    "radiogroup",
    "checkbox",
    "dropdown",
    "ranking",
    "rating",
    "scale",
    "slider",
    "boolean",
    "date",
    "time",
    "datetime",
    "daterange",
  ];
  var countryCodes = [
    { code: "+57", name: "Colombia" },
    { code: "+34", name: "España" },
    { code: "+52", name: "México" },
    { code: "+1", name: "Estados Unidos" },
  ];

  function copy(value) {
    return JSON.parse(JSON.stringify(value));
  }
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      }[c];
    });
  }
  function youtubeToEmbed(url) {
    if (!url) return "";
    var u = String(url).trim();
    if (u.indexOf("/embed/") !== -1) return u;
    var m = u.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (m) return "https://www.youtube.com/embed/" + m[1];
    m = u.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (m) return "https://www.youtube.com/embed/" + m[1];
    m = u.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
    if (m) return "https://www.youtube.com/embed/" + m[1];
    return u;
  }
  function slug(value) {
    return (
      String(value || "pregunta")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "") || "pregunta"
    );
  }
  function isChoiceType(type) {
    return CHOICE_TYPES.indexOf(type) !== -1;
  }
  function isConditionType(type) {
    return CONDITION_TYPES.indexOf(type) !== -1;
  }
  function findType(type) {
    return types.find(function (i) {
      return i.type === type;
    });
  }
  function getAllQuestions(schema) {
    var result = [];
    (schema.pages || []).forEach(function (page) {
      (page.elements || []).forEach(function (el) {
        if (el && el.name && isConditionType(el.type)) result.push(el);
      });
    });
    return result;
  }
  function getQuestionByName(schema, name) {
    return (
      getAllQuestions(schema).find(function (q) {
        return q.name === name;
      }) || null
    );
  }
  function allowedOperatorsForType(type) {
    if (!type)
      return OPERATORS.map(function (o) {
        return o.value;
      });
    if (type === "boolean") return ["=", "!=", "empty", "notempty"];
    if (["number", "rating", "scale", "slider"].indexOf(type) !== -1)
      return ["=", "!=", ">", "<", ">=", "<=", "empty", "notempty"];
    if (isChoiceType(type)) return ["=", "!=", "empty", "notempty"];
    if (["date", "time", "datetime", "daterange"].indexOf(type) !== -1)
      return ["=", "!=", ">", "<", ">=", "<=", "empty", "notempty"];
    return ["=", "!=", "contains", "notcontains", "empty", "notempty"];
  }
  function getOperatorListForSource(source) {
    var allowed = allowedOperatorsForType(source ? source.type : null);
    return OPERATORS.filter(function (op) {
      return allowed.indexOf(op.value) !== -1;
    });
  }
  function uniqueNameGlobal(schema, desiredName, ignoreElement) {
    var all = getAllQuestions(schema);
    var base = slug(desiredName || "question");
    var name = base,
      counter = 1;
    while (
      all.some(function (item) {
        return item !== ignoreElement && item.name === name;
      })
    ) {
      counter++;
      name = base + "_" + counter;
    }
    return name;
  }
  function uniqueName(elements, desiredName, ignoreElement) {
    var base = slug(desiredName || "question");
    var name = base,
      counter = 1;
    while (
      elements.some(function (item) {
        return item !== ignoreElement && item.name === name;
      })
    ) {
      counter++;
      name = base + "_" + counter;
    }
    return name;
  }
  function uniquePageName(pages, desiredName, ignorePage) {
    var base = slug(desiredName || "page");
    var name = base,
      counter = 1;
    while (
      pages.some(function (item) {
        return item !== ignorePage && item.name === name;
      })
    ) {
      counter++;
      name = base + counter;
    }
    return name;
  }
  function defaultQuestion(type, index, elements, schema) {
    var q = {
      type: type,
      name: schema
        ? uniqueNameGlobal(schema, "question" + (index + 1))
        : uniqueName(elements || [], "question" + (index + 1)),
      title: "Nueva pregunta",
      isRequired: false,
    };
    if (isChoiceType(type))
      q.choices = [
        { value: "option_1", text: "Opción 1" },
        { value: "option_2", text: "Opción 2" },
        { value: "option_3", text: "Opción 3" },
      ];
    if (type === "boolean") {
      q.labelTrue = "Sí";
      q.labelFalse = "No";
    }
    if (type === "rating") {
      q.rateMin = 1;
      q.rateMax = 5;
    }
    if (type === "scale") {
      q.rateMin = 0;
      q.rateMax = 10;
    }
    if (type === "slider") {
      q.min = 1;
      q.max = 100;
      q.step = 1;
    }
    if (
      type === "matrix" ||
      type === "matrixcheckbox" ||
      type === "matrixtext"
    ) {
      q.rows = ["Fila 1", "Fila 2"];
      q.columns = ["Columna 1", "Columna 2", "Columna 3"];
    }
    if (type === "file") {
      q.accept = "image/*,.pdf";
      q.maxSize = 5242880;
    }
    if (type === "tel") {
      q.countryCodes = copy(countryCodes);
    }
    if (type === "calculated") {
      q.expression = "";
      q.readOnly = true;
    }
    if (type === "hidden") {
      q.visible = false;
    }
    if (type === "heading") {
      q.title = "Nuevo encabezado";
    }
    if (type === "description") {
      q.title = "Texto descriptivo";
    }
    if (type === "section") {
      q.title = "Nueva sección";
    }
    return q;
  }
  function normalizeCondition(condition) {
    condition = condition || {};
    var v =
      condition.value === null || condition.value === undefined
        ? ""
        : String(condition.value);
    var low = v.toLowerCase().trim();
    if (low === "si" || low === "sí") v = "true";
    if (low === "no") v = "false";
    return {
      question: condition.question || "",
      operator: condition.operator || "=",
      value: v,
    };
  }
  function getQuestionConditions(question) {
    if (question && Array.isArray(question.auraConditions))
      return question.auraConditions.map(normalizeCondition);
    return [];
  }
  function getOperator(operator) {
    return (
      OPERATORS.find(function (i) {
        return i.value === operator;
      }) || OPERATORS[0]
    );
  }
  function expressionValue(value, sourceQuestion) {
    value = value === null || value === undefined ? "" : String(value);
    if (sourceQuestion && sourceQuestion.type === "boolean") {
      if (
        value === "true" ||
        value.toLowerCase() === "sí" ||
        value === sourceQuestion.labelTrue
      )
        return "true";
      if (
        value === "false" ||
        value.toLowerCase() === "no" ||
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
    var sourceQuestion = getQuestionByName(schema, condition.question);
    var left = "{" + condition.question + "}";
    var operator = getOperator(condition.operator);
    if (!operator.needsValue) return left + " " + condition.operator;
    return (
      left +
      " " +
      condition.operator +
      " " +
      expressionValue(condition.value, sourceQuestion)
    );
  }
  function rebuildVisibleIf(question, schema) {
    var conditions = getQuestionConditions(question).filter(function (c) {
      return c.question;
    });
    if (!conditions.length) {
      delete question.visibleIf;
      delete question.auraConditions;
      delete question.auraConditionLogic;
      delete question.auraConditionAction;
      return;
    }
    var expressions = conditions
      .map(function (c) {
        return conditionToExpression(c, schema);
      })
      .filter(Boolean);
    if (!expressions.length) {
      delete question.visibleIf;
      return;
    }
    var logic = question.auraConditionLogic === "or" ? " or " : " and ";
    var expression = expressions
      .map(function (item) {
        return "(" + item + ")";
      })
      .join(logic);
    if (question.auraConditionAction === "hide")
      question.visibleIf = "!(" + expression + ")";
    else question.visibleIf = expression;
    question.auraConditions = conditions;
  }
  function paletteMarkup(creator) {
    var groups = {};
    types.forEach(function (item) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });

    // --- Normalizar / Migrar timeLimit ---
    var raw = creator.schema.timeLimit || {};
    var tl = {
      enabled: !!raw.enabled,
      min: {
        enabled: !!(raw.min && raw.min.enabled),
        value: (raw.min && raw.min.value) || raw.minValue || 1,
        unit: (raw.min && raw.min.unit) || raw.minUnit || "minutes",
      },
      max: {
        enabled: raw.max ? !!raw.max.enabled : raw.enabled ? true : false,
        value: (raw.max && raw.max.value) || raw.value || 10,
        unit: (raw.max && raw.max.unit) || raw.unit || "minutes",
      },
    };
    // guardar migración
    creator.schema.timeLimit = tl;

    var generalHtml =
      '<div class="creator-general">' +
      '<div class="creator-category-title"><i>◷</i><span>GENERAL</span></div>' +
      '<div class="creator-general-card' +
      (tl.enabled ? " is-active" : "") +
      '">' +
      '<div class="creator-general-row">' +
      "<div><b>Tiempo</b><small>Limitar duración de la encuesta</small></div>" +
      '<label class="aura-switch"><input type="checkbox" data-general-field="timeEnabled" ' +
      (tl.enabled ? "checked" : "") +
      '><span class="aura-switch-track"><span class="aura-switch-thumb"></span></span></label>' +
      "</div>" +
      (tl.enabled
        ? '<div class="creator-general-time">' +
          '<div class="aura-time-group' +
          (tl.min.enabled ? " is-active" : "") +
          '">' +
          '<div class="aura-time-group-head">' +
          "<span>Tiempo mínimo</span>" +
          '<label class="aura-switch aura-switch-sm"><input type="checkbox" data-general-field="minEnabled" ' +
          (tl.min.enabled ? "checked" : "") +
          '><span class="aura-switch-track"><span class="aura-switch-thumb"></span></span></label>' +
          "</div>" +
          (tl.min.enabled
            ? '<div class="aura-time-inputs">' +
              '<input type="number" min="0" class="inspector-input" data-general-field="minValue" value="' +
              tl.min.value +
              '">' +
              '<select class="inspector-input" data-general-field="minUnit">' +
              '<option value="seconds" ' +
              (tl.min.unit === "seconds" ? "selected" : "") +
              ">Segundos</option>" +
              '<option value="minutes" ' +
              (tl.min.unit === "minutes" ? "selected" : "") +
              ">Minutos</option>" +
              '<option value="hours" ' +
              (tl.min.unit === "hours" ? "selected" : "") +
              ">Horas</option>" +
              "</select>" +
              "</div>"
            : "") +
          "</div>" +
          '<div class="aura-time-group' +
          (tl.max.enabled ? " is-active" : "") +
          '">' +
          '<div class="aura-time-group-head">' +
          "<span>Tiempo máximo</span>" +
          '<label class="aura-switch aura-switch-sm"><input type="checkbox" data-general-field="maxEnabled" ' +
          (tl.max.enabled ? "checked" : "") +
          '><span class="aura-switch-track"><span class="aura-switch-thumb"></span></span></label>' +
          "</div>" +
          (tl.max.enabled
            ? '<div class="aura-time-inputs">' +
              '<input type="number" min="1" class="inspector-input" data-general-field="maxValue" value="' +
              tl.max.value +
              '">' +
              '<select class="inspector-input" data-general-field="maxUnit">' +
              '<option value="seconds" ' +
              (tl.max.unit === "seconds" ? "selected" : "") +
              ">Segundos</option>" +
              '<option value="minutes" ' +
              (tl.max.unit === "minutes" ? "selected" : "") +
              ">Minutos</option>" +
              '<option value="hours" ' +
              (tl.max.unit === "hours" ? "selected" : "") +
              ">Horas</option>" +
              "</select>" +
              "</div>"
            : "") +
          "</div>" +
          '<span class="creator-general-hint">Usa el mínimo para evitar envíos demasiado rápidos y el máximo para auto-enviar al agotar el tiempo.</span>' +
          "</div>"
        : "") +
      "</div>" +
      "</div>";

    var categoriesHtml = Object.keys(groups)
      .map(function (category) {
        var open = !IsDesplegable || creator.openCategories[category] === true;
        return (
          '<div class="creator-category ' +
          (open ? "is-open" : "") +
          '"><button type="button" class="creator-category-title" data-category="' +
          escapeHtml(category) +
          '" aria-expanded="' +
          open +
          '"><i>' +
          (categoryIcons[category] || "•") +
          "</i><span>" +
          escapeHtml(category) +
          "</span><b>" +
          (IsDesplegable ? "⌄" : "") +
          '</b></button><div class="creator-category-items">' +
          groups[category]
            .map(function (item) {
              return (
                '<button type="button" class="creator-type" data-add-type="' +
                escapeHtml(item.type) +
                '"><i>' +
                item.icon +
                "</i><span>" +
                escapeHtml(item.label) +
                "</span><b>+</b></button>"
              );
            })
            .join("") +
          "</div></div>"
        );
      })
      .join("");

    return generalHtml + categoriesHtml;
  }
  function AuraSurveyCreator(target, options) {
    this.host =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!this.host)
      throw new Error("AuraSurveyCreator: no se encontró el contenedor.");
    this.options = options || {};
    this.schema = copy(
      this.options.schema || {
        title: "Nueva encuesta",
        description: "Diseña una experiencia que la gente quiera completar.",
        pages: [{ name: "page1", title: "Primera página", elements: [] }],
      },
    );
    if (!this.schema.timeLimit) {
      this.schema.timeLimit = { enabled: false, value: 10, unit: "minutes" };
    }
    if (!Array.isArray(this.schema.pages) || !this.schema.pages.length)
      this.schema.pages = [
        { name: "page1", title: "Primera página", elements: [] },
      ];
    this.pageIndex = 0;
    this.selectedIndex = -1;
    this.openCategories = { Básicos: true };
    this._listeners = {};
    this.normalizeSchema();
    this.render();
  }
  AuraSurveyCreator.prototype.normalizeSchema = function () {
    var self = this;
    var seen = {};
    this.schema.pages.forEach(function (page) {
      if (!page.name) page.name = "page" + (page.pages.length + 1);
      if (!Array.isArray(page.elements)) page.elements = [];
      page.elements.forEach(function (question) {
        if (!question.name || seen[question.name])
          question.name = uniqueNameGlobal(
            self.schema,
            question.name || "question",
            question,
          );
        seen[question.name] = true;
        if (question.auraConditions)
          question.auraConditions =
            question.auraConditions.map(normalizeCondition);
        if (question.visibleIf && !question.auraConditions)
          self.tryParseVisibleIf(question);
      });
    });
  };
  AuraSurveyCreator.prototype.tryParseVisibleIf = function (question) {
    var expression = String(question.visibleIf || "");
    var match = expression.match(
      /^\(?\{([^}]+)\}\s*(=|!=|contains|notcontains|>=|<=|>|<)\s*['"]?(.*?)['"]?\)?$/,
    );
    if (!match) return;
    question.auraConditions = [
      { question: match[1], operator: match[2], value: match[3] },
    ];
    question.auraConditionLogic = "and";
    question.auraConditionAction = "show";
  };
  AuraSurveyCreator.prototype.on = function (event, callback) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(callback);
    return this;
  };
  AuraSurveyCreator.prototype.emit = function (event, payload) {
    (this._listeners[event] || []).forEach(
      function (cb) {
        cb(payload, this);
      }.bind(this),
    );
  };
  AuraSurveyCreator.prototype.currentPage = function () {
    if (this.pageIndex < 0 || this.pageIndex >= this.schema.pages.length)
      this.pageIndex = 0;
    return this.schema.pages[this.pageIndex];
  };
  AuraSurveyCreator.prototype.render = function () {
    this.host.innerHTML = '<div class="aura-creator"></div>';
    this.root = this.host.firstElementChild;
    this.renderShell();
    return this;
  };
  AuraSurveyCreator.prototype.renderQuestion = function (question, index) {
    var selected = index === this.selectedIndex;
    var preview = "";
    if (isChoiceType(question.type))
      preview = (question.choices || [])
        .slice(0, 3)
        .map(function (c) {
          return typeof c === "object" ? c.text : c;
        })
        .join(" · ");
    else if (question.type === "rating") preview = "☆ ☆ ☆ ☆ ☆";
    else if (question.type === "boolean")
      preview =
        (question.labelTrue || "Sí") + " / " + (question.labelFalse || "No");
    else preview = question.placeholder || "La respuesta aparecerá aquí";
    var hasConditions = getQuestionConditions(question).length > 0;
    var typeInfo = findType(question.type) || {
      label: question.type,
      icon: "?",
    };
    return (
      '<article class="creator-question ' +
      (selected ? "selected" : "") +
      '" data-question-index="' +
      index +
      '"><div class="creator-question-grip" draggable="true">⠿</div><div class="creator-question-content"><div class="creator-question-meta"><span class="creator-question-type">' +
      escapeHtml(typeInfo.label) +
      "</span><span>" +
      (question.isRequired ? "Obligatoria" : "Opcional") +
      "</span>" +
      (hasConditions
        ? '<span class="creator-condition-badge">Condicional</span>'
        : "") +
      "</div><h3>" +
      escapeHtml(question.title || "Sin título") +
      '</h3><div class="creator-question-preview">' +
      escapeHtml(preview) +
      '</div></div><div class="creator-question-actions"><button type="button" data-question-action="duplicate">＋</button><button type="button" data-question-action="delete">×</button></div></article>'
    );
  };
  AuraSurveyCreator.prototype.renderConditionQuestionOptions = function (
    currentQuestion,
    selectedName,
  ) {
    var questions = getAllQuestions(this.schema);
    return questions
      .filter(function (q) {
        return q.name !== currentQuestion.name;
      })
      .map(function (q) {
        return (
          '<option value="' +
          escapeHtml(q.name) +
          '" ' +
          (q.name === selectedName ? "selected" : "") +
          ">" +
          escapeHtml(q.title || q.name) +
          " (" +
          (findType(q.type)?.label || q.type) +
          ")</option>"
        );
      })
      .join("");
  };
  AuraSurveyCreator.prototype.renderConditionValue = function (
    condition,
    index,
  ) {
    var source = getQuestionByName(this.schema, condition.question);
    if (!source)
      return (
        '<input type="text" class="inspector-input condition-value" data-condition-field="value" data-condition-index="' +
        index +
        '" value="' +
        escapeHtml(condition.value) +
        '" placeholder="Selecciona primero una pregunta">'
      );
    var operator = getOperator(condition.operator);
    if (!operator.needsValue) return "";
    if (source.type === "boolean") {
      var trueLabel = source.labelTrue || "Sí";
      var falseLabel = source.labelFalse || "No";
      return (
        '<select class="inspector-input condition-value" data-condition-field="value" data-condition-index="' +
        index +
        '"><option value="">Selecciona...</option><option value="true" ' +
        (condition.value === "true" ? "selected" : "") +
        ">" +
        escapeHtml(trueLabel) +
        ' (verdadero)</option><option value="false" ' +
        (condition.value === "false" ? "selected" : "") +
        ">" +
        escapeHtml(falseLabel) +
        " (falso)</option></select>"
      );
    }
    if (isChoiceType(source.type)) {
      var choices = source.choices || [];
      return (
        '<select class="inspector-input condition-value" data-condition-field="value" data-condition-index="' +
        index +
        '"><option value="">Selecciona una opción...</option>' +
        choices
          .map(function (choice) {
            var item =
              typeof choice === "object"
                ? choice
                : { value: choice, text: choice };
            return (
              '<option value="' +
              escapeHtml(item.value) +
              '" ' +
              (String(item.value) === String(condition.value)
                ? "selected"
                : "") +
              ">" +
              escapeHtml(item.text) +
              "</option>"
            );
          })
          .join("") +
        "</select>"
      );
    }
    if (["number", "rating", "scale", "slider"].indexOf(source.type) !== -1) {
      return (
        '<input type="number" class="inspector-input condition-value" data-condition-field="value" data-condition-index="' +
        index +
        '" value="' +
        escapeHtml(condition.value) +
        '" placeholder="Ej: 5">'
      );
    }
    if (source.type === "date")
      return (
        '<input type="date" class="inspector-input condition-value" data-condition-field="value" data-condition-index="' +
        index +
        '" value="' +
        escapeHtml(condition.value) +
        '">'
      );
    if (source.type === "time")
      return (
        '<input type="time" class="inspector-input condition-value" data-condition-field="value" data-condition-index="' +
        index +
        '" value="' +
        escapeHtml(condition.value) +
        '">'
      );
    if (source.type === "datetime")
      return (
        '<input type="datetime-local" class="inspector-input condition-value" data-condition-field="value" data-condition-index="' +
        index +
        '" value="' +
        escapeHtml(condition.value) +
        '">'
      );
    return (
      '<input type="text" class="inspector-input condition-value" data-condition-field="value" data-condition-index="' +
      index +
      '" value="' +
      escapeHtml(condition.value) +
      '" placeholder="Valor">'
    );
  };
  AuraSurveyCreator.prototype.renderConditionalLogic = function (question) {
    var conditions = getQuestionConditions(question);
    var hasAvailableQuestions = getAllQuestions(this.schema).some(function (
      item,
    ) {
      return item.name !== question.name;
    });
    var rows = conditions
      .map(
        function (condition, index) {
          var source = getQuestionByName(this.schema, condition.question);
          var ops = getOperatorListForSource(source);
          return (
            '<div class="aura-condition-row" data-condition-index="' +
            index +
            '"><div class="aura-condition-number">' +
            (index + 1) +
            '</div><div class="aura-condition-fields"><select class="inspector-input condition-question" data-condition-field="question" data-condition-index="' +
            index +
            '"><option value="">¿Qué pregunta?</option>' +
            this.renderConditionQuestionOptions(question, condition.question) +
            '</select><select class="inspector-input condition-operator" data-condition-field="operator" data-condition-index="' +
            index +
            '">' +
            ops
              .map(function (item) {
                return (
                  '<option value="' +
                  item.value +
                  '" ' +
                  (item.value === condition.operator ? "selected" : "") +
                  ">" +
                  escapeHtml(item.label) +
                  "</option>"
                );
              })
              .join("") +
            '</select><div class="aura-condition-value">' +
            this.renderConditionValue(condition, index) +
            '</div></div><button type="button" class="aura-condition-remove" data-condition-action="remove" data-condition-index="' +
            index +
            '">×</button></div>'
          );
        }.bind(this),
      )
      .join("");
    return (
      '<div class="inspector-divider"></div><div class="aura-conditions-panel"><div class="aura-conditions-title"><div><strong>Visibilidad condicional</strong><small>Decide cuándo debe aparecer esta pregunta.</small></div></div>' +
      (!hasAvailableQuestions
        ? '<div class="aura-condition-empty">Primero agrega otra pregunta.</div>'
        : "") +
      (conditions.length
        ? '<label class="inspector-label">Comportamiento<select class="inspector-input" data-condition-action-mode><option value="show" ' +
          (question.auraConditionAction !== "hide" ? "selected" : "") +
          '>Mostrar cuando se cumpla</option><option value="hide" ' +
          (question.auraConditionAction === "hide" ? "selected" : "") +
          '>Ocultar cuando se cumpla</option></select></label><div class="aura-condition-combine"><span>Combinar:</span><select class="inspector-input" data-condition-logic><option value="and" ' +
          (question.auraConditionLogic !== "or" ? "selected" : "") +
          '>Todas (Y)</option><option value="or" ' +
          (question.auraConditionLogic === "or" ? "selected" : "") +
          ">Cualquiera (O)</option></select></div>"
        : "") +
      '<div class="aura-condition-list">' +
      rows +
      "</div>" +
      (hasAvailableQuestions
        ? '<button type="button" class="aura-condition-add" data-condition-action="add">+ Añadir condición</button>'
        : "") +
      (question.visibleIf
        ? '<div class="aura-condition-expression"><span>Expresión</span><code>' +
          escapeHtml(question.visibleIf) +
          "</code></div>"
        : "") +
      "</div>"
    );
  };

  // === AQUI ESTA EL CAMBIO PRINCIPAL PARA OCULTAR option_ ===
  AuraSurveyCreator.prototype.renderInspector = function () {
    var page = this.currentPage();
    var question = page.elements[this.selectedIndex];
    if (!question)
      return '<div class="inspector-empty"><span>✦</span><strong>Selecciona una pregunta</strong></div>';
    var typeInfo = findType(question.type) || {
      icon: "?",
      label: question.type,
    };
    var choiceEditor = "";
    if (isChoiceType(question.type)) {
      choiceEditor =
        '<div class="inspector-divider"></div><div class="inspector-label">Opciones<span>Solo el texto visible para el usuario</span></div><div class="choice-editor">' +
        (question.choices || [])
          .map(function (choice, index) {
            var item =
              typeof choice === "object"
                ? choice
                : { value: choice, text: choice };
            return (
              '<div class="choice-row"><input class="inspector-input choice-text" data-choice-field="text" data-choice-index="' +
              index +
              '" value="' +
              escapeHtml(item.text) +
              '" placeholder="Ej: Opción 1"><button type="button" data-choice-action="remove" data-choice-index="' +
              index +
              '">×</button></div>'
            );
          })
          .join("") +
        '<button type="button" class="choice-add" data-choice-action="add">+ Añadir opción</button></div>';
    }
    var extra = "";
    if (
      [
        "text",
        "textarea",
        "email",
        "tel",
        "number",
        "date",
        "time",
        "datetime",
      ].indexOf(question.type) !== -1
    )
      extra +=
        '<label class="inspector-label">Placeholder<input class="inspector-input" data-question-field="placeholder" value="' +
        escapeHtml(question.placeholder || "") +
        '"></label>';
    if (question.type === "boolean")
      extra +=
        '<label class="inspector-label">Etiqueta Sí<input class="inspector-input" data-question-field="labelTrue" value="' +
        escapeHtml(question.labelTrue || "Sí") +
        '"></label><label class="inspector-label">Etiqueta No<input class="inspector-input" data-question-field="labelFalse" value="' +
        escapeHtml(question.labelFalse || "No") +
        '"></label>';
    if (question.type === "rating" || question.type === "scale")
      extra =
        '<label class="inspector-label">Mín<input class="inspector-input" type="number" data-question-field="rateMin" value="' +
        (question.rateMin == null ? 0 : question.rateMin) +
        '"></label><label class="inspector-label">Máx<input class="inspector-input" type="number" data-question-field="rateMax" value="' +
        (question.rateMax == null ? 10 : question.rateMax) +
        '"></label>';
    if (question.type === "slider")
      extra =
        '<label class="inspector-label">Mín<input class="inspector-input" type="number" data-question-field="min" value="' +
        (question.min == null ? 1 : question.min) +
        '"></label><label class="inspector-label">Máx<input class="inspector-input" type="number" data-question-field="max" value="' +
        (question.max == null ? 100 : question.max) +
        '"></label><label class="inspector-label">Paso<input class="inspector-input" type="number" data-question-field="step" value="' +
        (question.step == null ? 1 : question.step) +
        '"></label>';

    // CAMPO VIDEO YOUTUBE ARREGLADO
    if (question.type === "video") {
      var isYoutube =
        String(question.src || "").indexOf("youtube.com/embed") !== -1;
      extra +=
        '<div class="inspector-divider"></div><label class="inspector-label">URL del Video de YouTube<input class="inspector-input" id="aura-video-url" data-question-field="src" value="' +
        escapeHtml(question.src || "") +
        '" placeholder="https://www.youtube.com/watch?v=..."></label>' +
        (question.src
          ? '<div style="margin-top:10px; border-radius:12px; overflow:hidden; background:#000; aspect-ratio:16/9;"><iframe width="100%" height="160" src="' +
            escapeHtml(youtubeToEmbed(question.src)) +
            '" frameborder="0" allowfullscreen></iframe></div>'
          : '<small style="opacity:.6">Pega el link de YouTube y se convertirá a embed automático.</small>') +
        '<label class="inspector-check" style="margin-top:12px;"><input type="checkbox" data-question-field="controls" ' +
        (question.controls === false ? "" : "checked") +
        "><span>Mostrar controles</span></label>";
    }

    if (question.type === "image") {
      extra +=
        '<label class="inspector-label">URL de la Imagen<input class="inspector-input" data-question-field="src" value="' +
        escapeHtml(question.src || "") +
        '" placeholder="https://..."></label>';
    }

    return (
      '<div class="inspector-heading"><div><span class="creator-eyebrow">PROPIEDADES</span><strong>' +
      escapeHtml(typeInfo.label) +
      '</strong></div><button type="button" data-action="close-inspector">×</button></div><div class="inspector-type"><span>' +
      typeInfo.icon +
      "</span><div><b>" +
      escapeHtml(typeInfo.label) +
      '</b></div></div><label class="inspector-label">Pregunta<input class="inspector-input" data-question-field="title" value="' +
      escapeHtml(question.title || "") +
      '"></label><label class="inspector-label">Descripción<textarea class="inspector-input inspector-textarea" data-question-field="description">' +
      escapeHtml(question.description || "") +
      '</textarea></label><label class="inspector-check"><input type="checkbox" data-question-field="isRequired" ' +
      (question.isRequired ? "checked" : "") +
      "><span>Obligatoria</span></label>" +
      extra +
      choiceEditor +
      this.renderConditionalLogic(question) +
      '<div class="inspector-divider"></div><button type="button" class="creator-button creator-button-danger" data-action="delete-selected">Eliminar pregunta</button>'
    );
  };
  AuraSurveyCreator.prototype.setMeta = function (meta) {
    if (!meta) return this;
    if (typeof meta.title === "string") {
      this.schema.title = meta.title;
    }
    if (typeof meta.description === "string") {
      this.schema.description = meta.description;
    }

    if (this.root) {
      var titleInput = this.root.querySelector('[data-field="schema-title"]');
      if (titleInput && document.activeElement !== titleInput) {
        titleInput.value = this.schema.title || "";
      }
      var h1 = this.root.querySelector(".creator-canvas-heading h1");
      if (h1) {
        h1.textContent = this.schema.title || "Nueva encuesta";
      }
    }

    this.persist();
    this.emit("change", this.getSchema());
    return this;
  };
  AuraSurveyCreator.prototype.renderShell = function () {
    var self = this;
    var page = this.currentPage();
    var palette = this.root.querySelector(".creator-palette");
    var paletteScrollTop = palette ? palette.scrollTop : 0;
    this.root.innerHTML =
      '<header class="creator-topbar"><div class="creator-brand"><span>A</span><span><b>Aura</b><small>Survey Creator</small></span></div><div class="creator-title"><input data-field="schema-title" value="' +
      escapeHtml(this.schema.title) +
      '"><span class="creator-saved">Guardado local</span></div><div class="creator-actions"><button type="button" class="creator-icon-button" data-action="json">{ }</button><button type="button" class="creator-button creator-button-light" data-action="save">Guardar</button><button type="button" class="creator-button creator-button-dark" data-action="preview">Vista previa ↗</button></div></header><div class="creator-body"><aside class="creator-palette"><div class="creator-type-list">' +
      paletteMarkup(this) +
      '</div></aside><main class="creator-canvas"><div class="creator-canvas-heading"><div><h1>' +
      escapeHtml(this.schema.title || "Nueva encuesta") +
      '</h1></div><button type="button" class="creator-button creator-button-green" data-action="add-page">+ Nueva página</button></div><div class="creator-tabs">' +
      this.schema.pages
        .map(function (item, index) {
          return (
            '<button type="button" class="creator-tab ' +
            (index === self.pageIndex ? "active" : "") +
            '" data-page-index="' +
            index +
            '">' +
            String(index + 1).padStart(2, "0") +
            " <span>" +
            escapeHtml(item.title || "Página " + (index + 1)) +
            "</span></button>"
          );
        })
        .join("") +
      '</div><section class="creator-page-card"><div class="creator-page-header"><input data-field="page-title" value="' +
      escapeHtml(page.title || "") +
      '"></div><div class="creator-question-list">' +
      (page.elements || []).map(this.renderQuestion.bind(this)).join("") +
      '</div></section><div class="creator-page-footer"><button type="button" class="creator-button creator-button-light" data-action="delete-page">Eliminar página</button><span>Página ' +
      (this.pageIndex + 1) +
      " de " +
      this.schema.pages.length +
      '</span></div></main><aside class="creator-inspector">' +
      this.renderInspector() +
      "</aside></div>";
    this.bind();
    palette = this.root.querySelector(".creator-palette");
    if (palette) palette.scrollTop = paletteScrollTop;
  };
  AuraSurveyCreator.prototype.save = function () {
    var schema = this.getSchema();
    this.persist();
    this.emit("save", schema);
    if (typeof this.options.onSave === "function") this.options.onSave(schema);
    return schema;
  };
  AuraSurveyCreator.prototype.bind = function () {
    var self = this;
    this.root.querySelectorAll("[data-add-type]").forEach(function (b) {
      b.onclick = function () {
        self.addQuestion(b.dataset.addType);
      };
    });
    this.root.querySelectorAll("[data-category]").forEach(function (b) {
      b.onclick = function (e) {
        e.stopPropagation();
        if (!IsDesplegable) return;
        self.openCategories[b.dataset.category] =
          !self.openCategories[b.dataset.category];
        self.renderShell();
      };
    });
    this.root.querySelectorAll("[data-page-index]").forEach(function (b) {
      b.onclick = function () {
        self.pageIndex = Number(b.dataset.pageIndex);
        self.selectedIndex = -1;
        self.renderShell();
      };
    });
    this.root.querySelectorAll("[data-question-index]").forEach(function (c) {
      c.onclick = function () {
        self.selectedIndex = Number(c.dataset.questionIndex);
        self.renderShell();
      };
    });
    this.root.querySelectorAll("[data-question-action]").forEach(function (b) {
      b.onclick = function (e) {
        e.stopPropagation();
        var card = b.closest("[data-question-index]");
        var idx = Number(card.dataset.questionIndex);
        if (b.dataset.questionAction === "delete") self.deleteQuestion(idx);
        else self.duplicateQuestion(idx);
      };
    });
    this.root.querySelectorAll("[data-action]").forEach(function (b) {
      b.onclick = function () {
        var a = b.dataset.action;
        if (a === "add-page") self.addPage();
        if (a === "delete-page") self.deletePage();
        if (a === "preview") self.preview();
        if (a === "json") self.showJson();
        if (a === "delete-selected") self.deleteQuestion(self.selectedIndex);
        if (a === "close-inspector") {
          self.selectedIndex = -1;
          self.renderShell();
        }
        if (a === "save") self.save();
      };
    });
    var title = this.root.querySelector('[data-field="schema-title"]');
    if (title)
      title.oninput = function () {
        self.schema.title = title.value;
        self.persist();
        self.emit("change", self.getSchema());
      };
    var pageTitle = this.root.querySelector('[data-field="page-title"]');
    if (pageTitle)
      pageTitle.oninput = function () {
        self.currentPage().title = pageTitle.value;
        self.persist();
        self.emit("change", self.getSchema());
      };
    this.root.querySelectorAll("[data-question-field]").forEach(function (f) {
      f.oninput = function () {
        self.updateQuestion(f);
      };
      f.onchange = function () {
        self.updateQuestion(f);
      };
    });
    this.root.querySelectorAll("[data-general-field]").forEach(function (f) {
      var field = f.dataset.generalField;

      var ensure = function () {
        if (!self.schema.timeLimit)
          self.schema.timeLimit = {
            enabled: false,
            min: { enabled: false, value: 1, unit: "minutes" },
            max: { enabled: true, value: 10, unit: "minutes" },
          };
        if (!self.schema.timeLimit.min)
          self.schema.timeLimit.min = {
            enabled: false,
            value: 1,
            unit: "minutes",
          };
        if (!self.schema.timeLimit.max)
          self.schema.timeLimit.max = {
            enabled: true,
            value: 10,
            unit: "minutes",
          };
      };

      var isNumberField =
        field === "minValue" || field === "maxValue" || field === "timeValue";
      var isCheckField =
        field === "timeEnabled" ||
        field === "minEnabled" ||
        field === "maxEnabled";

      function handleGeneralChange() {
        ensure();
        var tl = self.schema.timeLimit;

        if (field === "timeEnabled") tl.enabled = f.checked;
        if (field === "minEnabled") tl.min.enabled = f.checked;
        if (field === "maxEnabled") tl.max.enabled = f.checked;

        if (field === "minValue") tl.min.value = Number(f.value) || 0;
        if (field === "minUnit") tl.min.unit = f.value;

        if (field === "maxValue") tl.max.value = Number(f.value) || 1;
        if (field === "maxUnit") tl.max.unit = f.value;

        if (field === "timeValue") tl.max.value = Number(f.value) || 1;
        if (field === "timeUnit") tl.max.unit = f.value;

        self.persist();
        self.emit("change", self.getSchema());

        if (isCheckField || !isNumberField) {
          var active = document.activeElement;
          var activeField = active ? active.dataset.generalField : null;
          self.renderShell();
          if (activeField) {
            var toFocus = self.root.querySelector(
              '[data-general-field="' + activeField + '"]',
            );
            if (toFocus) toFocus.focus();
          }
        }
      }

      f.onchange = handleGeneralChange;
      if (f.type === "number") {
        f.oninput = function () {
          ensure();
          var tl = self.schema.timeLimit;
          if (field === "minValue") tl.min.value = Number(f.value) || 0;
          if (field === "maxValue") tl.max.value = Number(f.value) || 1;
          if (field === "timeValue") tl.max.value = Number(f.value) || 1;
          self.persist();
          self.emit("change", self.getSchema());
        };
      }
    });

    this.bindChoices();
    this.bindConditions();
    this.bindQuestionDragAndDrop();
  };
  //
  AuraSurveyCreator.prototype.bindChoices = function () {
    var self = this;
    this.root.querySelectorAll("[data-choice-field]").forEach(function (field) {
      field.oninput = function () {
        var q = self.currentPage().elements[self.selectedIndex];
        if (!q) return;
        var index = Number(field.dataset.choiceIndex);
        if (!q.choices) q.choices = [];
        var choice = q.choices[index];
        if (typeof choice !== "object") {
          choice = { value: choice, text: choice };
          q.choices[index] = choice;
        }
        // EL TEXTO ES LO QUE VE EL USUARIO, EL VALUE SE GENERA SOLO
        choice.text = field.value;
        choice.value = slug(field.value) || "option_" + (index + 1);
        self.persist();
        self.emit("change", self.getSchema());
      };
    });
    this.root
      .querySelectorAll('[data-choice-action="remove"]')
      .forEach(function (b) {
        b.onclick = function (e) {
          e.stopPropagation();
          var q = self.currentPage().elements[self.selectedIndex];
          if (!q) return;
          var index = Number(b.dataset.choiceIndex);
          if (q.choices && q.choices.length > 1) q.choices.splice(index, 1);
          self.persist();
          self.renderShell();
          self.emit("change", self.getSchema());
        };
      });
    var addChoice = this.root.querySelector('[data-choice-action="add"]');
    if (addChoice)
      addChoice.onclick = function (e) {
        e.stopPropagation();
        var q = self.currentPage().elements[self.selectedIndex];
        if (!q) return;
        if (!q.choices) q.choices = [];
        var n = q.choices.length + 1;
        q.choices.push({ value: "option_" + n, text: "Opción " + n });
        self.persist();
        self.renderShell();
        self.emit("change", self.getSchema());
      };
  };
  AuraSurveyCreator.prototype.bindConditions = function () {
    var self = this;
    this.root
      .querySelectorAll("[data-condition-field]")
      .forEach(function (field) {
        field.onchange = function () {
          self.updateCondition(field);
        };
        if (
          field.tagName === "INPUT" &&
          field.dataset.conditionField === "value"
        )
          field.oninput = function () {
            self.updateCondition(field);
          };
      });
    var logic = this.root.querySelector("[data-condition-logic]");
    if (logic)
      logic.onchange = function () {
        var q = self.currentPage().elements[self.selectedIndex];
        if (!q) return;
        q.auraConditionLogic = logic.value;
        rebuildVisibleIf(q, self.schema);
        self.persist();
        self.emit("change", self.getSchema());
      };
    var action = this.root.querySelector("[data-condition-action-mode]");
    if (action)
      action.onchange = function () {
        var q = self.currentPage().elements[self.selectedIndex];
        if (!q) return;
        q.auraConditionAction = action.value;
        rebuildVisibleIf(q, self.schema);
        self.persist();
        self.emit("change", self.getSchema());
      };
    this.root
      .querySelectorAll('[data-condition-action="remove"]')
      .forEach(function (b) {
        b.onclick = function (e) {
          e.stopPropagation();
          var q = self.currentPage().elements[self.selectedIndex];
          if (!q) return;
          var conditions = getQuestionConditions(q);
          conditions.splice(Number(b.dataset.conditionIndex), 1);
          q.auraConditions = conditions;
          rebuildVisibleIf(q, self.schema);
          self.persist();
          self.renderShell();
          self.emit("change", self.getSchema());
        };
      });
    var add = this.root.querySelector('[data-condition-action="add"]');
    if (add)
      add.onclick = function (e) {
        e.stopPropagation();
        var q = self.currentPage().elements[self.selectedIndex];
        if (!q) return;
        var conditions = getQuestionConditions(q);
        var available = getAllQuestions(self.schema).filter(function (i) {
          return i.name !== q.name;
        });
        if (!available.length) return;
        conditions.push({
          question: available[0].name,
          operator: getOperatorListForSource(available[0])[0].value,
          value: self.getDefaultConditionValue(available[0]),
        });
        q.auraConditions = conditions;
        q.auraConditionLogic = q.auraConditionLogic || "and";
        q.auraConditionAction = q.auraConditionAction || "show";
        rebuildVisibleIf(q, self.schema);
        self.persist();
        self.renderShell();
        self.emit("change", self.getSchema());
      };
  };
  AuraSurveyCreator.prototype.getDefaultConditionValue = function (question) {
    if (!question) return "";
    if (isChoiceType(question.type)) {
      var choices = question.choices || [];
      if (choices.length) {
        var first = choices[0];
        return String(typeof first === "object" ? first.value : first);
      }
    }
    if (question.type === "boolean") return "true";
    if (["number", "rating", "scale", "slider"].indexOf(question.type) !== -1)
      return "0";
    return "";
  };
  AuraSurveyCreator.prototype.updateCondition = function (field) {
    var q = this.currentPage().elements[this.selectedIndex];
    if (!q) return;
    var index = Number(field.dataset.conditionIndex);
    var conditions = getQuestionConditions(q);
    if (!conditions[index]) conditions[index] = normalizeCondition({});
    conditions[index][field.dataset.conditionField] = field.value;
    if (field.dataset.conditionField === "question") {
      var source = getQuestionByName(this.schema, field.value);
      var allowedOps = getOperatorListForSource(source);
      if (
        !allowedOps.some(function (o) {
          return o.value === conditions[index].operator;
        })
      ) {
        conditions[index].operator = allowedOps[0].value;
      }
      conditions[index].value = this.getDefaultConditionValue(source);
    }
    q.auraConditions = conditions;
    q.auraConditionLogic =
      (this.root.querySelector("[data-condition-logic]") || {}).value ||
      q.auraConditionLogic ||
      "and";
    q.auraConditionAction =
      (this.root.querySelector("[data-condition-action-mode]") || {}).value ||
      q.auraConditionAction ||
      "show";
    rebuildVisibleIf(q, this.schema);
    this.persist();
    this.emit("change", this.getSchema());
    if (
      field.dataset.conditionField === "question" ||
      field.dataset.conditionField === "operator"
    )
      this.renderShell();
  };
  AuraSurveyCreator.prototype.updateQuestion = function (field) {
    var q = this.currentPage().elements[this.selectedIndex];
    if (!q) return;
    var key = field.dataset.questionField;
    if (key === "maxSizeMb") q.maxSize = Number(field.value || 0) * 1048576;
    else if (field.type === "checkbox") q[key] = field.checked;
    else if (field.type === "number") q[key] = Number(field.value);
    else if (key === "rows" || key === "columns")
      q[key] = field.value
        .split("\n")
        .map(function (i) {
          return i.trim();
        })
        .filter(Boolean);
    else q[key] = field.value;
    if (key === "name") q.name = uniqueNameGlobal(this.schema, q.name, q);
    this.persist();
    this.emit("change", this.getSchema());
  };
  AuraSurveyCreator.prototype.addQuestion = function (type) {
    var page = this.currentPage();
    var q = defaultQuestion(
      type,
      page.elements.length,
      page.elements,
      this.schema,
    );
    page.elements.push(q);
    this.selectedIndex = page.elements.length - 1;
    this.persist();
    this.renderShell();
    this.emit("change", this.getSchema());
  };
  AuraSurveyCreator.prototype.deleteQuestion = function (index) {
    if (index < 0) return;
    var page = this.currentPage();
    if (!page.elements[index]) return;
    page.elements.splice(index, 1);
    this.selectedIndex = -1;
    this.persist();
    this.renderShell();
    this.emit("change", this.getSchema());
  };
  AuraSurveyCreator.prototype.duplicateQuestion = function (index) {
    var page = this.currentPage();
    var original = page.elements[index];
    if (!original) return;
    var q = copy(original);
    q.name = uniqueNameGlobal(this.schema, original.name + "_copy");
    if (q.auraConditions) {
      q.auraConditions = copy(q.auraConditions);
      q.auraConditions = q.auraConditions.filter(function (c) {
        return c.question !== q.name;
      });
      rebuildVisibleIf(q, this.schema);
    }
    page.elements.splice(index + 1, 0, q);
    this.selectedIndex = index + 1;
    this.persist();
    this.renderShell();
    this.emit("change", this.getSchema());
  };
  AuraSurveyCreator.prototype.addPage = function () {
    var name = uniquePageName(
      this.schema.pages,
      "page" + (this.schema.pages.length + 1),
    );
    this.schema.pages.push({ name: name, title: "Nueva página", elements: [] });
    this.pageIndex = this.schema.pages.length - 1;
    this.selectedIndex = -1;
    this.persist();
    this.renderShell();
    this.emit("change", this.getSchema());
  };
  AuraSurveyCreator.prototype.deletePage = function () {
    if (this.schema.pages.length === 1) {
      alert("La encuesta debe tener al menos una página.");
      return;
    }
    this.schema.pages.splice(this.pageIndex, 1);
    if (this.pageIndex >= this.schema.pages.length)
      this.pageIndex = this.schema.pages.length - 1;
    if (this.pageIndex < 0) this.pageIndex = 0;
    this.selectedIndex = -1;
    this.persist();
    this.renderShell();
    this.emit("change", this.getSchema());
  };
  AuraSurveyCreator.prototype.bindQuestionDragAndDrop = function () {
    var self = this;
    var draggedIndex = -1;
    var list = this.root.querySelector(".creator-question-list");
    if (!list) return;
    this.root
      .querySelectorAll(".creator-question-grip")
      .forEach(function (grip) {
        grip.ondragstart = function (e) {
          var card = grip.closest("[data-question-index]");
          draggedIndex = Number(card.dataset.questionIndex);
          card.classList.add("dragging");
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", String(draggedIndex));
        };
        grip.ondragend = function () {
          var card = grip.closest("[data-question-index]");
          if (card) card.classList.remove("dragging");
          list.querySelectorAll(".drag-over").forEach(function (i) {
            i.classList.remove("drag-over");
          });
          draggedIndex = -1;
        };
      });
    this.root.querySelectorAll(".creator-question").forEach(function (card) {
      card.ondragover = function (e) {
        if (draggedIndex < 0) return;
        e.preventDefault();
        card.classList.add("drag-over");
      };
      card.ondragleave = function (e) {
        if (!card.contains(e.relatedTarget)) card.classList.remove("drag-over");
      };
      card.ondrop = function (e) {
        e.preventDefault();
        card.classList.remove("drag-over");
        var targetIndex = Number(card.dataset.questionIndex);
        if (draggedIndex < 0 || draggedIndex === targetIndex) return;
        var elements = self.currentPage().elements;
        var moved = elements.splice(draggedIndex, 1)[0];
        var insertIndex =
          draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
        elements.splice(insertIndex, 0, moved);
        self.selectedIndex = insertIndex;
        self.persist();
        self.renderShell();
        self.emit("change", self.getSchema());
        draggedIndex = -1;
      };
    });
  };
  AuraSurveyCreator.prototype.getSchema = function () {
    return copy(this.schema);
  };
  AuraSurveyCreator.prototype.persist = function () {
    try {
      localStorage.setItem(
        this.options.storageKey || "aura-survey-draft",
        JSON.stringify(this.schema),
      );
    } catch (e) {}
  };
  AuraSurveyCreator.prototype.loadDraft = function () {
    try {
      var raw = localStorage.getItem(
        this.options.storageKey || "aura-survey-draft",
      );
      if (!raw) return false;
      var parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.pages)) return false;
      this.schema = copy(parsed);
      this.normalizeSchema();
      this.pageIndex = 0;
      this.selectedIndex = -1;
      this.renderShell();
      this.emit("change", this.getSchema());
      return true;
    } catch (e) {
      return false;
    }
  };
  AuraSurveyCreator.prototype.clearDraft = function () {
    try {
      localStorage.removeItem(this.options.storageKey || "aura-survey-draft");
    } catch (e) {}
    return this;
  };
  AuraSurveyCreator.prototype.showJson = function () {
    var self = this;
    var json = JSON.stringify(this.schema, null, 2);
    var modal = document.createElement("div");
    modal.className = "creator-modal-backdrop";
    modal.innerHTML =
      '<div class="creator-modal"><div class="creator-modal-header"><h2>Esquema</h2><button type="button" data-close>×</button></div><textarea readonly></textarea><div class="creator-modal-footer"><button type="button" class="creator-button creator-button-light" data-copy>Copiar</button><button type="button" class="creator-button creator-button-green" data-download>Descargar</button></div></div>';
    document.body.appendChild(modal);
    var textarea = modal.querySelector("textarea");
    textarea.value = json;
    modal.querySelector("[data-close]").onclick = function () {
      modal.remove();
    };
    modal.querySelector("[data-copy]").onclick = function () {
      var btn = this;
      if (navigator.clipboard)
        navigator.clipboard.writeText(json).then(function () {
          btn.textContent = "Copiado ✓";
        });
    };
    modal.querySelector("[data-download]").onclick = function () {
      var blob = new Blob([json], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = slug(self.schema.title || "encuesta") + ".json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 1000);
    };
  };
  AuraSurveyCreator.prototype.preview = function () {
    if (typeof global.AuraSurvey !== "function") {
      alert("Falta aura-survey.js");
      return;
    }
    var modal = document.createElement("div");
    modal.className = "creator-modal-backdrop";
    modal.innerHTML =
      '<div class="creator-preview-modal"><button type="button" class="creator-preview-close" data-close>×</button><div id="aura-preview-mount"></div></div>';
    document.body.appendChild(modal);
    var survey;
    try {
      survey = new global.AuraSurvey(
        modal.querySelector("#aura-preview-mount"),
        this.schema,
      );
    } catch (e) {
      modal.remove();
      alert(e.message);
      return;
    }
    modal.querySelector("[data-close]").onclick = function () {
      if (survey && survey.destroy) survey.destroy();
      modal.remove();
    };
  };
  AuraSurveyCreator.prototype.destroy = function () {
    if (this.host) this.host.innerHTML = "";
    this._listeners = {};
    this.root = null;
  };
  global.AuraSurveyCreator = AuraSurveyCreator;
  global.AuraSurveyCreator.types = types;
  global.AuraSurveyCreator.version = VERSION;
  global.AuraSurveyCreator.operators = OPERATORS;
  global.AuraSurveyCreator.countryCodes = countryCodes;
})(window);
