(function (global) {
  "use strict";
  var VERSION = "2.7.1";
  var defaults = {
    title: "Canvasform survey",
    description: "",
    showProgress: true,
    showPageNumbers: true,
    showRequiredMark: true,
    showBotton: true,
    completeText: "Enviar respuestas",
    nextText: "Continuar",
    previousText: "Atrás",
    requiredError: "Este campo es obligatorio.",
    completedHtml:
      "<h2>Gracias por responder</h2><p>Tus respuestas han sido registradas correctamente.</p>",
  };
  var LAYOUT_TYPES = [
    "heading",
    "description",
    "separator",
    "section",
    "image",
    "video",
  ];
  function toSeconds(value, unit) {
    var v = Number(value) || 0;
    if (unit === "hours") return v * 3600;
    if (unit === "seconds") return v;
    return v * 60;
  }
  function formatSeconds(sec) {
    sec = Math.max(0, Math.floor(sec));
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = sec % 60;
    if (h > 0)
      return (
        h + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0")
      );
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }
  function merge(base, extra) {
    var result = {};
    Object.keys(base || {}).forEach(function (k) {
      result[k] = base[k];
    });
    Object.keys(extra || {}).forEach(function (k) {
      result[k] = extra[k];
    });
    return result;
  }
  function clone(value) {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (e) {
      return value;
    }
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
  function cssEscape(value) {
    if (global.CSS && typeof global.CSS.escape === "function") {
      return global.CSS.escape(String(value));
    }
    return String(value).replace(/([^\w-])/g, "\\$1");
  }
  function isEmpty(value) {
    if (value == null || value === "") return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === "object") {
      var keys = Object.keys(value);
      if (keys.length === 0) return true;
      for (var i = 0; i < keys.length; i++) {
        var v = value[keys[i]];
        if (v == null || v === "") continue;
        if (Array.isArray(v)) {
          if (
            v.length > 0 &&
            v.some(function (x) {
              return x != null && x !== "";
            })
          )
            return false;
          continue;
        }
        if (typeof v === "object") {
          var sub = Object.keys(v);
          for (var j = 0; j < sub.length; j++) {
            if (v[sub[j]] != null && v[sub[j]] !== "") return false;
          }
          continue;
        }
        return false;
      }
      return true;
    }
    return false;
  }
  function normalizeOperator(operator) {
    var v = String(operator || "=").toLowerCase();
    if (v === "==") return "=";
    return v;
  }
  function getChoiceValue(choice) {
    return typeof choice === "object" && choice !== null
      ? choice.value
      : choice;
  }
  function getChoiceText(choice) {
    return typeof choice === "object" && choice !== null
      ? choice.text != null
        ? choice.text
        : choice.value
      : choice;
  }
  function getAllQuestions(pages) {
    var qs = [];
    (pages || []).forEach(function (p) {
      (p.elements || []).forEach(function (q) {
        if (!q || !q.name) return;
        if (LAYOUT_TYPES.indexOf(q.type) !== -1) return;
        qs.push(q);
      });
    });
    return qs;
  }
  function findQuestionInPages(pages, name) {
    var qs = getAllQuestions(pages);
    for (var i = 0; i < qs.length; i++) {
      if (qs[i].name === name) return qs[i];
    }
    return null;
  }
  function findQuestion(name) {
    return findQuestionInPages(this.pages, name);
  }
  function expressionLiteral(value) {
    var text = String(value == null ? "" : value).trim();
    if (text === "true" || text === "false") return text;
    if (/^-?\d+(?:\.\d+)?$/.test(text)) return text;
    return "'" + text.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
  }
  function expressionArray(value) {
    var values = String(value == null ? "" : value)
      .split(",")
      .map(function (i) {
        return i.trim();
      })
      .filter(Boolean);
    return "[" + values.map(expressionLiteral).join(", ") + "]";
  }
  function conditionExpression(condition) {
    if (!condition || !condition.question) return "";
    var field = "{" + condition.question + "}";
    var operator = normalizeOperator(condition.operator);
    var value = condition.value;
    switch (operator) {
      case "=":
        return field + " = " + expressionLiteral(value);
      case "!=":
        return field + "!= " + expressionLiteral(value);
      case ">":
        return field + " > " + expressionLiteral(value);
      case "<":
        return field + " < " + expressionLiteral(value);
      case ">=":
        return field + " >= " + expressionLiteral(value);
      case "<=":
        return field + " <= " + expressionLiteral(value);
      case "contains":
        return field + " contains " + expressionLiteral(value);
      case "notcontains":
        return field + " notcontains " + expressionLiteral(value);
      case "startswith":
        return field + " startswith " + expressionLiteral(value);
      case "endswith":
        return field + " endswith " + expressionLiteral(value);
      case "empty":
        return field + " empty";
      case "notempty":
        return field + " notempty";
      case "anyof":
        return field + " anyof " + expressionArray(value);
      case "allof":
        return field + " allof " + expressionArray(value);
      default:
        return field + " = " + expressionLiteral(value);
    }
  }
  function buildVisibleIf(question) {
    var conditions = Array.isArray(question.canvasformConditions)
      ? question.canvasformConditions
      : [];
    conditions = conditions.filter(function (c) {
      return c && c.question;
    });
    if (!conditions.length) {
      delete question.visibleIf;
      return "";
    }
    var logic =
      String(question.canvasformConditionLogic || "and").toLowerCase() === "or"
        ? " or "
        : " and ";
    var expression = conditions
      .map(conditionExpression)
      .filter(Boolean)
      .join(logic);
    if (!expression) {
      delete question.visibleIf;
      return "";
    }
    var action =
      String(question.canvasformConditionAction || "show").toLowerCase() ===
      "hide"
        ? "hide"
        : "show";
    if (action === "hide") {
      expression = "!(" + expression + ")";
    }
    question.visibleIf = expression;
    return expression;
  }
  function parseSimpleVisibleIf(expression) {
    if (!expression) return null;
    var source = String(expression).trim();
    var action = "show";
    if (/^!\s*\(/.test(source) && /\)\s*$/.test(source)) {
      action = "hide";
      source = source.replace(/^!\s*\(/, "").replace(/\)\s*$/, "");
    }
    var separator = /\s+or\s+/i.test(source) ? "or" : "and";
    var parts = source.split(separator === "or" ? /\s+or\s+/i : /\s+and\s+/i);
    var conditions = [];
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i].trim();
      var match = part.match(
        /^\{([^}]+)\}\s*(=|==|!=|>=|<=|>|<|contains|notcontains|startswith|endswith|empty|notempty|anyof|allof)\s*(.*)$/i,
      );
      if (!match) return null;
      var operator = normalizeOperator(match[2]);
      var rawValue = match[3] || "";
      if (operator === "empty" || operator === "notempty") {
        conditions.push({ question: match[1], operator: operator, value: "" });
        continue;
      }
      if (
        (rawValue.charAt(0) === "'" &&
          rawValue.charAt(rawValue.length - 1) === "'") ||
        (rawValue.charAt(0) === '"' &&
          rawValue.charAt(rawValue.length - 1) === '"')
      ) {
        rawValue = rawValue.slice(1, -1);
      }
      if (operator === "anyof" || operator === "allof") {
        rawValue = rawValue
          .replace(/^\[/, "")
          .replace(/\]$/, "")
          .split(",")
          .map(function (item) {
            return item.trim().replace(/^['"]|['"]$/g, "");
          })
          .join(", ");
      }
      conditions.push({
        question: match[1],
        operator: operator,
        value: rawValue,
      });
    }
    return { action: action, logic: separator, conditions: conditions };
  }
  function ensureConditionalState(question) {
    if (!question) return null;
    if (!Array.isArray(question.canvasformConditions) && question.visibleIf) {
      var parsed = parseSimpleVisibleIf(question.visibleIf);
      if (parsed) {
        question.canvasformConditions = parsed.conditions;
        question.canvasformConditionLogic = parsed.logic;
        question.canvasformConditionAction = parsed.action;
      }
    }
    if (!Array.isArray(question.canvasformConditions)) {
      question.canvasformConditions = [];
    }
    if (!question.canvasformConditionLogic) {
      question.canvasformConditionLogic = "and";
    }
    if (!question.canvasformConditionAction) {
      question.canvasformConditionAction = "show";
    }
    return question;
  }
  function evaluateValue(value) {
    if (value == null) return "";
    if (Array.isArray(value)) {
      return value.map(function (item) {
        return String(item);
      });
    }
    if (typeof value === "object") {
      return value.number != null ? value.number : value;
    }
    return value;
  }
  function compareCondition(actual, condition) {
    var operator = normalizeOperator(condition.operator);
    var expected = condition.value == null ? "" : condition.value;
    var actualValue = evaluateValue(actual);
    var actualArray = Array.isArray(actualValue)
      ? actualValue.map(String)
      : null;
    var actualString = Array.isArray(actualValue)
      ? actualValue.join(", ")
      : String(actualValue == null ? "" : actualValue);
    if (actual === true) actualString = "true";
    if (actual === false) actualString = "false";
    var expectedString = String(expected);
    var actualNorm = actualString.trim().toLowerCase();
    var expectedNorm = expectedString.trim().toLowerCase();
    switch (operator) {
      case "empty":
        return (
          actual == null ||
          actual === "" ||
          (Array.isArray(actual) && actual.length === 0)
        );
      case "notempty":
        return !(
          actual == null ||
          actual === "" ||
          (Array.isArray(actual) && actual.length === 0)
        );
      case "=":
        if (actualArray) {
          return (
            actualArray
              .map(function (v) {
                return v.toLowerCase();
              })
              .indexOf(expectedNorm) !== -1
          );
        }
        return actualNorm === expectedNorm;
      case "!=":
        if (actualArray) {
          return (
            actualArray
              .map(function (v) {
                return v.toLowerCase();
              })
              .indexOf(expectedNorm) === -1
          );
        }
        return actualNorm !== expectedNorm;
      case ">":
        return Number(actualValue) > Number(expected);
      case "<":
        return Number(actualValue) < Number(expected);
      case ">=":
        return Number(actualValue) >= Number(expected);
      case "<=":
        return Number(actualValue) <= Number(expected);
      case "contains":
        if (actualArray) {
          return (
            actualArray
              .map(function (v) {
                return v.toLowerCase();
              })
              .indexOf(expectedNorm) !== -1
          );
        }
        return actualNorm.indexOf(expectedNorm) !== -1;
      case "notcontains":
        if (actualArray) {
          return (
            actualArray
              .map(function (v) {
                return v.toLowerCase();
              })
              .indexOf(expectedNorm) === -1
          );
        }
        return actualNorm.indexOf(expectedNorm) === -1;
      case "startswith":
        return actualNorm.indexOf(expectedNorm) === 0;
      case "endswith":
        return actualNorm.slice(-expectedNorm.length) === expectedNorm;
      case "anyof":
        var anyValues = expectedNorm
          .split(",")
          .map(function (i) {
            return i.trim();
          })
          .filter(Boolean);
        return anyValues.some(function (item) {
          return actualArray
            ? actualArray
                .map(function (v) {
                  return v.toLowerCase();
                })
                .indexOf(item) !== -1
            : actualNorm === item;
        });
      case "allof":
        var allValues = expectedNorm
          .split(",")
          .map(function (i) {
            return i.trim();
          })
          .filter(Boolean);
        return allValues.every(function (item) {
          return actualArray
            ? actualArray
                .map(function (v) {
                  return v.toLowerCase();
                })
                .indexOf(item) !== -1
            : actualNorm === item;
        });
      default:
        return actualNorm === expectedNorm;
    }
  }

  function getCanvasConfig() {
    return typeof window !== "undefined" && window.CANVASFORM_CONFIG
      ? window.CANVASFORM_CONFIG
      : {};
  }

  function CanvasForm(target, definition) {
    this.host =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!this.host) {
      throw new Error("CanvasForm: no se encontró el contenedor.");
    }
    this.definition = merge(defaults, definition || {});
    this.pages =
      Array.isArray(this.definition.pages) && this.definition.pages.length
        ? this.definition.pages
        : [
            {
              name: "page1",
              title: "",
              elements: this.definition.elements || [],
            },
          ];
    this.values = merge({}, this.definition.data || {});
    this.currentPage = 0;
    this._listeners = {};
    this._autocompleteHandlers = [];
    this._boundChange = this._handleChange.bind(this);
    this._timeLimit = this.definition.timeLimit || null;
    this._startTime = Date.now();
    this._timerId = null;
    this._timeExpired = false;
    this._forceComplete = false;
    this._geoLocation = this.definition.geoLocation || null;
    this._geoData = null;
    this._geoError = null;
    this._geoStatus = "idle";
    this.normalizeSchema();
    this.render();
    this.startTimer();
    this.captureGeoLocation();
  }
  CanvasForm.prototype.findQuestion = function (name) {
    return findQuestionInPages(this.pages, name);
  };
  CanvasForm.prototype.getGeoLocationConfig = function () {
    var g = this._geoLocation || this.definition.geoLocation;
    if (!g || !g.enabled) return null;
    return {
      enabled: true,
      highAccuracy: g.highAccuracy !== false,
      captureOnStart: g.captureOnStart !== false,
    };
  };
  CanvasForm.prototype.captureGeoLocation = function () {
    var self = this;
    var cfg = self.getGeoLocationConfig();
    if (!cfg) return;
    if (!navigator.geolocation) {
      self._geoStatus = "no_support";
      return;
    }
    self._geoStatus = "locating";
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        self._geoData = {
          coordinates: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: new Date().toISOString(),
          },
        };
        self._geoStatus = "ok";
      },
      function (err) {
        self._geoStatus = err.code === 1 ? "denied" : "error";
      },
      { enableHighAccuracy: cfg.highAccuracy, timeout: 20000, maximumAge: 0 },
    );
  };
  CanvasForm.prototype.getGeoData = function () {
    return this._geoData ? clone(this._geoData) : null;
  };
  CanvasForm.prototype.getTimeLimitConfig = function () {
    var tl = this._timeLimit || this.definition.timeLimit;
    if (!tl || !tl.enabled) return null;
    if (tl.min || tl.max) {
      return {
        enabled: true,
        minEnabled: !!(tl.min && tl.min.enabled),
        minSeconds: toSeconds(
          tl.min ? tl.min.value : 0,
          tl.min ? tl.min.unit : "minutes",
        ),
        maxEnabled: !!(tl.max && tl.max.enabled),
        maxSeconds: toSeconds(
          tl.max ? tl.max.value : 0,
          tl.max ? tl.max.unit : "minutes",
        ),
      };
    } else {
      return {
        enabled: true,
        minEnabled: false,
        minSeconds: 0,
        maxEnabled: true,
        maxSeconds: toSeconds(tl.value, tl.unit),
      };
    }
  };
  CanvasForm.prototype.getElapsedSeconds = function () {
    return Math.floor((Date.now() - this._startTime) / 1000);
  };
  CanvasForm.prototype.checkMinTime = function (isAuto) {
    if (this._forceComplete && isAuto) return { ok: true };
    var cfg = this.getTimeLimitConfig();
    if (!cfg || !cfg.minEnabled) return { ok: true };
    var elapsed = this.getElapsedSeconds();
    if (elapsed < cfg.minSeconds) {
      return {
        ok: false,
        remain: cfg.minSeconds - elapsed,
        message:
          "Debes esperar " +
          formatSeconds(cfg.minSeconds - elapsed) +
          " para poder enviar.",
      };
    }
    return { ok: true };
  };
  CanvasForm.prototype.startTimer = function () {
    var self = this;
    var cfg = self.getTimeLimitConfig();
    if (!cfg || !cfg.enabled) return;
    if (self._timerId) clearInterval(self._timerId);
    self._timerId = setInterval(function () {
      var elapsed = self.getElapsedSeconds();
      var timerEl = self.root
        ? self.root.querySelector("[data-canvasform-timer]")
        : null;
      var timerBar = self.root
        ? self.root.querySelector("[data-canvasform-timer-bar]")
        : null;
      if (timerEl && cfg.maxEnabled) {
        var remain = cfg.maxSeconds - elapsed;
        timerEl.textContent = "Tiempo restante: " + formatSeconds(remain);
      }
      if (timerBar && cfg.maxEnabled) {
        var pct = Math.min(100, (elapsed / cfg.maxSeconds) * 100);
        timerBar.style.width = pct + "%";
      }
      if (cfg.maxEnabled && elapsed >= cfg.maxSeconds && !self._timeExpired) {
        self._timeExpired = true;
        clearInterval(self._timerId);
        self._forceComplete = true;
        self.complete(true);
      }
    }, 1000);
  };
  CanvasForm.prototype.normalizeSchema = function () {
    this.pages.forEach(function (page) {
      if (!Array.isArray(page.elements)) {
        page.elements = [];
      }
      if (page.visibleIf && !page.canvasformConditions) {
        ensureConditionalState(page);
      }
      if (page.canvasformConditions) {
        buildVisibleIf(page);
      }
      page.elements.forEach(function (question) {
        if (!question) return;
        if (question.visibleIf && !question.canvasformConditions) {
          ensureConditionalState(question);
        }
        if (question.canvasformConditions) {
          buildVisibleIf(question);
        }
      });
    });
  };
  CanvasForm.prototype.on = function (event, callback) {
    (this._listeners[event] || (this._listeners[event] = [])).push(callback);
    return this;
  };
  CanvasForm.prototype.emit = function (event, payload) {
    (this._listeners[event] || []).slice().forEach(
      function (cb) {
        cb(payload, this);
      }.bind(this),
    );
  };
  CanvasForm.prototype.getValue = function (name) {
    return this.values[name];
  };
  CanvasForm.prototype.getData = function () {
    var data = clone(this.values) || {};
    var cfg = this.getTimeLimitConfig();
    if (cfg) {
      data._meta = data._meta || {};
      data._meta.timeElapsed = this.getElapsedSeconds();
      data._meta.timeLimit = cfg;
    }
    if (this._geoData) {
      var src = this._geoData.coordinates || this._geoData;
      data.coordinates = {
        latitude: src.latitude,
        longitude: src.longitude,
        accuracy: src.accuracy,
        timestamp: src.timestamp,
      };
    }
    return data;
  };
  CanvasForm.prototype.setValue = function (name, value) {
    this.values[name] = value;
    this.renderPage();
    this.emit("valueChanged", {
      name: name,
      value: value,
      data: this.getData(),
    });
    return this;
  };
  CanvasForm.prototype.visible = function (question) {
    if (!question || !question.visibleIf) return true;
    if (
      Array.isArray(question.canvasformConditions) &&
      question.canvasformConditions.length
    ) {
      var logic =
        String(question.canvasformConditionLogic || "and").toLowerCase() ===
        "or"
          ? "or"
          : "and";
      var result =
        logic === "or"
          ? question.canvasformConditions.some(
              function (c) {
                return compareCondition(this.values[c.question], c);
              }.bind(this),
            )
          : question.canvasformConditions.every(
              function (c) {
                return compareCondition(this.values[c.question], c);
              }.bind(this),
            );
      if (
        String(question.canvasformConditionAction || "show").toLowerCase() ===
        "hide"
      ) {
        return !result;
      }
      return result;
    }
    return this.evaluateExpression(question.visibleIf);
  };
  CanvasForm.prototype.isPageVisible = function (page) {
    if (!page) return false;
    if (
      !page.visibleIf &&
      (!page.canvasformConditions || !page.canvasformConditions.length)
    )
      return true;
    if (
      Array.isArray(page.canvasformConditions) &&
      page.canvasformConditions.length
    ) {
      var logic =
        String(page.canvasformConditionLogic || "and").toLowerCase() === "or"
          ? "or"
          : "and";
      var result =
        logic === "or"
          ? page.canvasformConditions.some(
              function (c) {
                return compareCondition(this.values[c.question], c);
              }.bind(this),
            )
          : page.canvasformConditions.every(
              function (c) {
                return compareCondition(this.values[c.question], c);
              }.bind(this),
            );
      if (
        String(page.canvasformConditionAction || "show").toLowerCase() ===
        "hide"
      )
        return !result;
      return result;
    }
    return this.evaluateExpression(page.visibleIf);
  };
  CanvasForm.prototype.getVisiblePages = function () {
    return this.pages.filter(this.isPageVisible.bind(this));
  };
  CanvasForm.prototype.getNextVisibleIndex = function (from) {
    var next = from + 1;
    while (next < this.pages.length) {
      if (this.isPageVisible(this.pages[next])) return next;
      next++;
    }
    return -1;
  };
  CanvasForm.prototype.getPrevVisibleIndex = function (from) {
    var prev = from - 1;
    while (prev >= 0) {
      if (this.isPageVisible(this.pages[prev])) return prev;
      prev--;
    }
    return -1;
  };
  CanvasForm.prototype.evaluateExpression = function (expression) {
    if (!expression) return true;
    var source = String(expression).replace(/\s+/g, " ").trim();
    if (!source) return true;
    if (source.charAt(0) === "(" && source.charAt(source.length - 1) === ")") {
      source = source.slice(1, -1).trim();
    }
    if (/^!\s*\(/.test(source) && /\)$/.test(source)) {
      return !this.evaluateExpression(
        source.replace(/^!\s*\(/, "").replace(/\)\s*$/, ""),
      );
    }
    var orParts = source.split(/\s+or\s+/i);
    if (orParts.length > 1) {
      return orParts.some(
        function (p) {
          return this.evaluateExpression(p);
        }.bind(this),
      );
    }
    var andParts = source.split(/\s+and\s+/i);
    if (andParts.length > 1) {
      return andParts.every(
        function (p) {
          return this.evaluateExpression(p);
        }.bind(this),
      );
    }
    var match = source.match(
      /^\(?\s*\{([^}]+)\}\s*(=|==|!=|>=|<=|>|<|contains|notcontains|startswith|endswith|empty|notempty|anyof|allof)\s*(.*?)\s*\)?$/i,
    );
    if (!match) return true;
    var rawValue = match[3] || "";
    if (
      (rawValue.charAt(0) === "'" &&
        rawValue.charAt(rawValue.length - 1) === "'") ||
      (rawValue.charAt(0) === '"' &&
        rawValue.charAt(rawValue.length - 1) === '"')
    ) {
      rawValue = rawValue.slice(1, -1);
    }
    if (
      normalizeOperator(match[2]) === "anyof" ||
      normalizeOperator(match[2]) === "allof"
    ) {
      rawValue = rawValue
        .replace(/^\[/, "")
        .replace(/\]$/, "")
        .split(",")
        .map(function (i) {
          return i.trim().replace(/^['"]|['"]$/g, "");
        })
        .join(", ");
    }
    return compareCondition(this.values[match[1]], {
      question: match[1],
      operator: normalizeOperator(match[2]),
      value: rawValue,
    });
  };

  CanvasForm.prototype.bindSignatures = function () {
    var self = this;
    var cfg = getCanvasConfig();
    var uploadUrl = cfg.UPLOAD_URL || cfg.API_URL || "/api/uploads";
    this.root.querySelectorAll("[data-signature]").forEach(function (canvas) {
      var context = canvas.getContext("2d");
      if (!context) return;
      var drawing = false;
      var hasStroke = false;
      var saveTimeout = null;
      var position = function (event) {
        var rect = canvas.getBoundingClientRect();
        var source =
          event.touches && event.touches.length ? event.touches[0] : event;
        return {
          x: ((source.clientX - rect.left) * canvas.width) / rect.width,
          y: ((source.clientY - rect.top) * canvas.height) / rect.height,
        };
      };
      context.strokeStyle = "#0A0A0B";
      context.fillStyle = "#0A0A0B";
      context.lineWidth = 2.5;
      context.lineCap = "round";
      context.lineJoin = "round";
      var start = function (event) {
        drawing = true;
        hasStroke = true;
        if (saveTimeout) {
          clearTimeout(saveTimeout);
          saveTimeout = null;
        }
        var point = position(event);
        context.beginPath();
        context.arc(point.x, point.y, 1.2, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.moveTo(point.x, point.y);
        self.values[canvas.dataset.signature] = canvas.toDataURL("image/png");
        if (canvas.setPointerCapture && event.pointerId != null) {
          try {
            canvas.setPointerCapture(event.pointerId);
          } catch (e) {}
        }
        event.preventDefault();
      };
      var draw = function (event) {
        if (!drawing) return;
        var point = position(event);
        context.lineTo(point.x, point.y);
        context.stroke();
        event.preventDefault();
      };
      var scheduleUpload = function () {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(function () {
          if (!hasStroke) return;
          canvas.toBlob(
            function (blob) {
              if (!blob) return;
              var statusEl = self.root.querySelector(
                '[data-file-for="' + cssEscape(canvas.dataset.signature) + '"]',
              );
              if (statusEl) statusEl.textContent = "Guardando firma...";
              var doUpload;
              if (
                cfg.uploadHandler &&
                typeof cfg.uploadHandler === "function"
              ) {
                doUpload = cfg.uploadHandler(
                  blob,
                  canvas.dataset.signature,
                  "signature",
                );
              } else {
                var fd = new FormData();
                fd.append("file", blob, "firma-" + Date.now() + ".jpg");
                fd.append("fieldName", canvas.dataset.signature);
                var headers = {};
                if (cfg.TOKEN) headers["Authorization"] = "Bearer " + cfg.TOKEN;
                doUpload = fetch(uploadUrl, {
                  method: "POST",
                  body: fd,
                  headers: headers,
                }).then(function (r) {
                  return r.json();
                });
              }
              doUpload
                .then(function (res) {
                  self.values[canvas.dataset.signature] = {
                    name: "firma.jpg",
                    type: "image/jpeg",
                    size: blob.size,
                    url: res.url || res.location || res.path,
                    storageKey: res.storageKey,
                  };
                  if (statusEl) statusEl.textContent = "✓ Firma guardada";
                  self.emit("valueChanged", {
                    name: canvas.dataset.signature,
                    value: self.values[canvas.dataset.signature],
                    data: self.getData(),
                  });
                  self.emit("fileUploaded", {
                    name: canvas.dataset.signature,
                    file: self.values[canvas.dataset.signature],
                  });
                })
                .catch(function () {
                  if (statusEl) statusEl.textContent = "Error al guardar firma";
                });
            },
            "image/jpeg",
            0.6,
          );
        }, 900);
      };
      var end = function () {
        if (!drawing) return;
        drawing = false;
        scheduleUpload();
      };
      canvas.addEventListener("pointerdown", start);
      canvas.addEventListener("pointermove", draw);
      canvas.addEventListener("pointerup", end);
      canvas.addEventListener("pointercancel", end);
      canvas.addEventListener("pointerleave", end);
    });
    this.root
      .querySelectorAll("[data-clear-signature]")
      .forEach(function (button) {
        button.onclick = function () {
          var name = button.dataset.clearSignature;
          var canvas = self.root.querySelector(
            '[data-signature="' + cssEscape(name) + '"]',
          );
          if (canvas) {
            var ctx = canvas.getContext("2d");
            if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
          delete self.values[name];
          var statusEl = self.root.querySelector(
            '[data-file-for="' + cssEscape(name) + '"]',
          );
          if (statusEl) statusEl.textContent = "Firma borrada";
          self.emit("valueChanged", {
            name: name,
            value: "",
            data: self.getData(),
          });
        };
      });
  };

  CanvasForm.prototype.refreshConditionalVisibility = function () {
    var page = this.pages[this.currentPage];
    if (!page) return;
    var shouldRender = false;
    (page.elements || []).forEach(function (question) {
      if (!question.name) return;
      var shouldBeVisible = this.visible(question);
      var element = this.root.querySelector(
        '[data-question="' + this.cssEscape(question.name) + '"]',
      );
      var isVisibleInDom = !!element;
      if (shouldBeVisible !== isVisibleInDom) {
        shouldRender = true;
      }
    }, this);
    var visibleNow = this.getVisiblePages().length;
    if (
      this._lastVisibleCount !== undefined &&
      this._lastVisibleCount !== visibleNow
    ) {
      shouldRender = true;
    }
    this._lastVisibleCount = visibleNow;
    if (shouldRender) {
      this.renderPage();
    }
  };
  CanvasForm.prototype.cssEscape = function (value) {
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
      return CSS.escape(String(value));
    }
    return String(value).replace(
      /([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g,
      "\\$1",
    );
  };
  CanvasForm.prototype.bindAutocomplete = function () {
    var survey = this;
    survey.root.querySelectorAll("[data-autocomplete]").forEach(function (box) {
      var input = box.querySelector("[data-autocomplete-input]");
      var list = box.querySelector("[data-autocomplete-list]");
      if (!input || !list) return;
      var name = box.dataset.autocomplete.replace("_country", "");
      var question = survey.findQuestion(name);
      if (!question && name.indexOf("_country") !== -1) {
        question = survey.findQuestion(box.dataset.autocomplete);
      }
      if (!question) {
        for (var p = 0; p < survey.pages.length; p++) {
          var els = survey.pages[p].elements || [];
          for (var q = 0; q < els.length; q++)
            if (els[q].name === name) {
              question = els[q];
              break;
            }
        }
      }
      if (!question) return;
      var options = Array.prototype.slice.call(
        list.querySelectorAll("[data-option-value]"),
      );
      var filter = function () {
        var query = String(input.value || "")
          .toLowerCase()
          .trim();
        var matches = 0;
        options.forEach(function (option) {
          var text = String(option.dataset.optionText || "").toLowerCase();
          var value = String(option.dataset.optionValue || "").toLowerCase();
          var match =
            query === "" ||
            text.indexOf(query) !== -1 ||
            value.indexOf(query) !== -1;
          option.hidden = !match;
          option.style.display = match ? "" : "none";
          if (match) matches++;
        });
        list.hidden = matches === 0;
      };
      input.addEventListener("focus", function () {
        filter();
        if (options.length > 0) list.hidden = false;
      });
      input.addEventListener("input", filter);
      input.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          list.hidden = true;
          return;
        }
        if (event.key === "Enter") {
          var firstVisible = options.find(function (o) {
            return !o.hidden;
          });
          if (firstVisible) firstVisible.click();
          event.preventDefault();
        }
      });
      options.forEach(function (option) {
        option.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          var selectedValue = option.dataset.optionValue;
          var selectedText = option.dataset.optionText;
          if (
            question.type === "dropdown" ||
            question.type === "select" ||
            name === question.name
          ) {
            survey.values[name] = selectedValue;
            input.value = selectedText;
          } else if (question.type === "tel") {
            var current = survey.values[name];
            if (!current || typeof current !== "object")
              current = { country: "", number: "" };
            survey.values[name] = {
              country: selectedValue,
              number: current.number || "",
            };
            input.value = selectedText;
          }
          list.hidden = true;
          survey.emit("valueChanged", {
            name: name,
            value: survey.values[name],
            data: survey.getData(),
          });
          survey.renderPage();
        });
      });
    });
  };
  CanvasForm.prototype.moveRanking = function (button, event) {
    event.preventDefault();
    var section = button.closest("[data-question]");
    if (!section) return;
    var question = this.findQuestion(section.dataset.question);
    if (!question) return;
    var choices = question.choices || [];
    var index = Number(button.dataset.rankIndex);
    var next = button.dataset.rank === "up" ? index - 1 : index + 1;
    if (next < 0 || next >= choices.length) return;
    var item = choices.splice(index, 1)[0];
    choices.splice(next, 0, item);
    this.values[question.name] = choices.map(function (c) {
      return getChoiceValue(c);
    });
    this.renderPage();
    this.emit("valueChanged", {
      name: question.name,
      value: this.values[question.name],
      data: this.getData(),
    });
  };

  // ================== RENDER QUESTION - FIX MATRIZ COMPLETO ==================
  CanvasForm.prototype.renderQuestion = function (question) {
    var self = this;
    var value = self.values[question.name];
    var id = "canvasform-" + question.name;
    var conditionalClass =
      question.visibleIf ||
      (Array.isArray(question.canvasformConditions) &&
        question.canvasformConditions.length)
        ? " canvasform-question-conditional"
        : "";
    var qWidth = question.width || question.canvasformWidth || 100;
    var allowed = [25, 33, 50, 66, 75, 100];
    if (allowed.indexOf(qWidth) === -1) qWidth = 100;
    if (LAYOUT_TYPES.indexOf(question.type) !== -1) qWidth = 100;
    var wClass = " w-" + qWidth;
    var layoutInner = "";
    if (question.type === "heading") {
      layoutInner =
        '<h3 class="canvasform-design-heading">' +
        escapeHtml(question.title || "") +
        "</h3>";
    } else if (question.type === "description") {
      layoutInner =
        '<p class="canvasform-design-description">' +
        escapeHtml(question.description || question.title || "") +
        "</p>";
    } else if (question.type === "separator") {
      layoutInner = '<hr class="canvasform-design-separator">';
    } else if (question.type === "image") {
      var rawUrl = question.src || question.url || question.imageUrl || "";
      var imgUrl = rawUrl;
      try {
        if (imgUrl.indexOf("google.com/imgres") !== -1) {
          var urlObj = new URL(imgUrl);
          var real = urlObj.searchParams.get("imgurl");
          if (real) imgUrl = decodeURIComponent(real);
        }
      } catch (e) {}
      if (imgUrl) {
        layoutInner =
          '<figure class="canvasform-design-media"><img src="' +
          escapeHtml(imgUrl) +
          '" alt="' +
          escapeHtml(question.alt || question.title || "") +
          '" loading="lazy"></figure>';
      }
    } else if (question.type === "video") {
      var videoUrl = question.src || question.url || question.videoUrl || "";
      var youtube = videoUrl.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i,
      );
      if (youtube) {
        layoutInner =
          '<div class="canvasform-design-media"><div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;"><iframe src="https://www.youtube.com/embed/' +
          escapeHtml(youtube[1]) +
          '" title="' +
          escapeHtml(question.title || "Video") +
          '" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div></div>';
      } else if (videoUrl) {
        layoutInner =
          '<div class="canvasform-design-media"><video src="' +
          escapeHtml(videoUrl) +
          '" controls></video></div>';
      }
    } else if (question.type === "section") {
      layoutInner =
        '<div class="canvasform-design-section"><h3>' +
        escapeHtml(question.title || "") +
        "</h3><p>" +
        escapeHtml(question.description || "") +
        "</p></div>";
    }
    if (LAYOUT_TYPES.indexOf(question.type) !== -1) {
      return (
        '<section class="canvasform-question' +
        conditionalClass +
        wClass +
        ' canvasform-question--full" data-question="' +
        escapeHtml(question.name) +
        '" data-type="' +
        escapeHtml(question.type) +
        '" data-width="' +
        qWidth +
        '">' +
        layoutInner +
        "</section>"
      );
    }
    if (question.type === "hidden") {
      return (
        '<input type="hidden" name="' +
        escapeHtml(question.name) +
        '" value="' +
        escapeHtml(value == null ? question.defaultValue || "" : value) +
        '">'
      );
    }
    var required = question.isRequired
      ? '<span class="canvasform-required" aria-hidden="true">*</span>'
      : "";
    var label =
      '<label class="canvasform-label" for="' +
      id +
      '">' +
      escapeHtml(question.title || "") +
      required +
      "</label>";
    var help = question.description
      ? '<div class="canvasform-help">' +
        escapeHtml(question.description) +
        "</div>"
      : "";
    var input = "";
    var options = question.choices || [];
    if (question.type === "radiogroup" || question.type === "checkbox") {
      var selected = Array.isArray(value) ? value : [value];
      input =
        '<div class="canvasform-options" role="group">' +
        options
          .map(function (choice) {
            var item =
              typeof choice === "object"
                ? choice
                : { value: choice, text: choice };
            var checked = selected.indexOf(item.value) !== -1 ? " checked" : "";
            var type = question.type === "checkbox" ? "checkbox" : "radio";
            return (
              '<label class="canvasform-option"><input type="' +
              type +
              '" name="' +
              escapeHtml(question.name) +
              '" value="' +
              escapeHtml(item.value) +
              '"' +
              checked +
              '><span class="canvasform-option-mark"></span><span>' +
              escapeHtml(item.text) +
              "</span></label>"
            );
          })
          .join("") +
        "</div>";
    } else if (question.type === "dropdown" || question.type === "select") {
      var selectedChoice = options.find(function (c) {
        return getChoiceValue(c) === value;
      });
      input =
        '<div class="canvasform-autocomplete" data-autocomplete="' +
        escapeHtml(question.name) +
        '"><input id="' +
        id +
        '" class="canvasform-control" data-autocomplete-input autocomplete="off" placeholder="' +
        escapeHtml(question.placeholder || "Escribe para buscar...") +
        '" value="' +
        escapeHtml(
          selectedChoice ? getChoiceText(selectedChoice) : value || "",
        ) +
        '"><div class="canvasform-autocomplete-list" data-autocomplete-list role="listbox" hidden>' +
        options
          .map(function (choice) {
            var item =
              typeof choice === "object"
                ? choice
                : { value: choice, text: choice };
            return (
              '<button type="button" role="option" data-option-value="' +
              escapeHtml(item.value) +
              '" data-option-text="' +
              escapeHtml(item.text) +
              '">' +
              escapeHtml(item.text) +
              "</button>"
            );
          })
          .join("") +
        "</div></div>";
    } else if (question.type === "rating") {
      var max = question.rateMax || 5;
      input =
        '<div class="canvasform-rating" role="radiogroup">' +
        Array.from({ length: max }, function (_, index) {
          var rating = index + 1;
          return (
            '<label><input type="radio" name="' +
            escapeHtml(question.name) +
            '" value="' +
            rating +
            '"' +
            (String(value) === String(rating) ? " checked" : "") +
            "><span>" +
            rating +
            "</span></label>"
          );
        }).join("") +
        "</div>";
    } else if (question.type === "imagechoice") {
      input =
        '<div class="canvasform-image-choices">' +
        (question.choices || [])
          .map(function (choice) {
            var item =
              typeof choice === "object"
                ? choice
                : { value: choice, text: choice };
            return (
              '<label><input type="radio" name="' +
              escapeHtml(question.name) +
              '" value="' +
              escapeHtml(item.value) +
              '"' +
              (value === item.value ? " checked" : "") +
              '><img src="' +
              escapeHtml(item.image || item.url || "") +
              '" alt="' +
              escapeHtml(item.text) +
              '"><span>' +
              escapeHtml(item.text) +
              "</span></label>"
            );
          })
          .join("") +
        "</div>";
    } else if (question.type === "scale" || question.type === "nps") {
      var scaleMin = question.rateMin != null ? question.rateMin : 0;
      var scaleMax = question.rateMax != null ? question.rateMax : 10;
      input =
        '<div class="canvasform-scale" role="radiogroup">' +
        Array.from({ length: scaleMax - scaleMin + 1 }, function (_, index) {
          var number = index + scaleMin;
          return (
            '<label><input type="radio" name="' +
            escapeHtml(question.name) +
            '" value="' +
            number +
            '"' +
            (String(value) === String(number) ? " checked" : "") +
            "><span>" +
            number +
            "</span></label>"
          );
        }).join("") +
        "</div>";
    } else if (question.type === "slider") {
      var sliderMin = question.min != null ? question.min : 1;
      var sliderMax = question.max != null ? question.max : 100;
      var sliderValue =
        value == null
          ? question.defaultValue != null
            ? question.defaultValue
            : sliderMin
          : value;
      input =
        '<div class="canvasform-slider"><div class="canvasform-slider-labels"><span>' +
        escapeHtml(sliderMin) +
        "</span><output>" +
        escapeHtml(sliderValue) +
        "</output><span>" +
        escapeHtml(sliderMax) +
        '</span></div><input id="' +
        id +
        '" name="' +
        escapeHtml(question.name) +
        '" type="range" min="' +
        escapeHtml(sliderMin) +
        '" max="' +
        escapeHtml(sliderMax) +
        '" step="' +
        escapeHtml(question.step != null ? question.step : 1) +
        '" value="' +
        escapeHtml(sliderValue) +
        '"></div>';
    } else if (question.type === "emojis") {
      input =
        '<div class="canvasform-emojis">' +
        (question.choices || ["😡", "😞", "😐", "🙂", "😍"])
          .map(function (emoji) {
            var item =
              typeof emoji === "object" ? emoji : { value: emoji, text: emoji };
            return (
              '<label><input type="radio" name="' +
              escapeHtml(question.name) +
              '" value="' +
              escapeHtml(item.value) +
              '"' +
              (value === item.value ? " checked" : "") +
              "><span>" +
              escapeHtml(item.text) +
              "</span></label>"
            );
          })
          .join("") +
        "</div>";
    } else if (question.type === "ranking") {
      input =
        '<ol class="canvasform-ranking">' +
        (question.choices || [])
          .map(function (choice, index) {
            var item =
              typeof choice === "object"
                ? choice
                : { value: choice, text: choice };
            return (
              "<li><span>" +
              escapeHtml(item.text) +
              '</span><button type="button" data-rank="up" data-rank-index="' +
              index +
              '">↑</button><button type="button" data-rank="down" data-rank-index="' +
              index +
              '">↓</button></li>'
            );
          })
          .join("") +
        "</ol>";
    } else if (
      question.type === "matrix" ||
      question.type === "matrixcheckbox" ||
      question.type === "matrixtext"
    ) {
      var matrixInput =
        question.type === "matrixtext"
          ? "text"
          : question.type === "matrixcheckbox"
            ? "checkbox"
            : "radio";
      var currentVal = value && typeof value === "object" ? value : {};

      input =
        '<div class="canvasform-matrix-scroll"><table class="canvasform-matrix"><thead><tr><th></th>' +
        (question.columns || [])
          .map(function (c) {
            return "<th>" + escapeHtml(getChoiceText(c)) + "</th>";
          })
          .join("") +
        "</tr></thead><tbody>" +
        (question.rows || [])
          .map(function (row, rowIndex) {
            var rowText = getChoiceText(row);
            var rowData = currentVal[rowText];
            if (
              typeof rowData !== "object" ||
              rowData === null ||
              Array.isArray(rowData)
            ) {
              rowData = {};
              if (
                currentVal[rowText] != null &&
                typeof currentVal[rowText] !== "object"
              ) {
                var firstCol =
                  question.columns && question.columns[0]
                    ? getChoiceText(question.columns[0])
                    : "0";
                rowData[firstCol] = currentVal[rowText];
              }
            }
            return (
              '<tr><th data-row="' +
              escapeHtml(rowText) +
              '">' +
              escapeHtml(rowText) +
              "</th>" +
              (question.columns || [])
                .map(function (col, columnIndex) {
                  var colText = getChoiceText(col);
                  var fieldName =
                    question.name + "_" + rowIndex + "_" + columnIndex;
                  var val =
                    rowData[colText] != null
                      ? rowData[colText]
                      : rowData[columnIndex] != null
                        ? rowData[columnIndex]
                        : "";
                  var isChecked = false;
                  if (question.type === "matrix")
                    isChecked = currentVal[rowText] === colText;
                  else if (question.type === "matrixcheckbox")
                    isChecked =
                      Array.isArray(currentVal[rowText]) &&
                      currentVal[rowText].indexOf(colText) !== -1;

                  if (matrixInput === "text") {
                    return (
                      '<td data-col="' +
                      escapeHtml(colText) +
                      '"><input type="text" class="canvasform-control" name="' +
                      escapeHtml(fieldName) +
                      '" data-row="' +
                      escapeHtml(rowText) +
                      '" data-col="' +
                      escapeHtml(colText) +
                      '" value="' +
                      escapeHtml(val) +
                      '" placeholder="' +
                      escapeHtml(colText) +
                      '" style="height:36px;"></td>'
                    );
                  } else {
                    return (
                      '<td data-col="' +
                      escapeHtml(colText) +
                      '"><input type="' +
                      matrixInput +
                      '" name="' +
                      escapeHtml(question.name + "_" + rowIndex) +
                      '" value="' +
                      columnIndex +
                      '" data-row="' +
                      escapeHtml(rowText) +
                      '" data-col="' +
                      escapeHtml(colText) +
                      '"' +
                      (isChecked ? " checked" : "") +
                      "></td>"
                    );
                  }
                })
                .join("") +
              "</tr>"
            );
          })
          .join("") +
        "</tbody></table></div>";
    } else if (question.type === "time" || question.type === "datetime") {
      input =
        '<input id="' +
        id +
        '" name="' +
        escapeHtml(question.name) +
        '" class="canvasform-control" type="' +
        (question.type === "time" ? "time" : "datetime-local") +
        '" value="' +
        escapeHtml(value || "") +
        '">';
    } else if (question.type === "daterange") {
      input =
        '<div class="canvasform-date-range"><input class="canvasform-control" name="' +
        escapeHtml(question.name + "_start") +
        '" type="date" value="' +
        escapeHtml(value && value.start) +
        '" aria-label="Fecha inicial"><span>hasta</span><input class="canvasform-control" name="' +
        escapeHtml(question.name + "_end") +
        '" type="date" value="' +
        escapeHtml(value && value.end) +
        '" aria-label="Fecha final"></div>';
    } else if (question.type === "boolean") {
      input =
        '<label class="canvasform-toggle"><input id="' +
        id +
        '" type="checkbox" name="' +
        escapeHtml(question.name) +
        '"' +
        (value === true ? " checked" : "") +
        "><span></span><b>" +
        escapeHtml(question.labelTrue || "Sí") +
        " / " +
        escapeHtml(question.labelFalse || "No") +
        "</b></label>";
    } else if (question.type === "tel") {
      var countryCodes = question.countryCodes || [
        { code: "+57", name: "Colombia" },
        { code: "+34", name: "España" },
        { code: "+52", name: "México" },
        { code: "+1", name: "Estados Unidos" },
      ];
      var phone =
        value && typeof value === "object"
          ? value
          : { country: countryCodes[0].code, number: value || "" };
      var selectedCountry =
        countryCodes.find(function (c) {
          return c.code === phone.country;
        }) || countryCodes[0];
      input =
        '<div class="canvasform-phone"><div class="canvasform-autocomplete" data-autocomplete="' +
        escapeHtml(question.name + "_country") +
        '"><input class="canvasform-control canvasform-country" data-autocomplete-input autocomplete="off" aria-label="País" placeholder="Busca país..." value="' +
        escapeHtml(selectedCountry.name + " (" + selectedCountry.code + ")") +
        '"><div class="canvasform-autocomplete-list" data-autocomplete-list role="listbox" hidden>' +
        countryCodes
          .map(function (c) {
            return (
              '<button type="button" role="option" data-option-value="' +
              escapeHtml(c.code) +
              '" data-option-text="' +
              escapeHtml(c.name + " (" + c.code + ")") +
              '">' +
              escapeHtml(c.name + " (" + c.code + ")") +
              "</button>"
            );
          })
          .join("") +
        '</div></div><input id="' +
        id +
        '" name="' +
        escapeHtml(question.name) +
        '" class="canvasform-control" type="tel" value="' +
        escapeHtml(phone.number) +
        '" placeholder="' +
        escapeHtml(question.placeholder || "300 000 0000") +
        '"></div>';
    } else if (question.type === "file") {
      input =
        '<input id="' +
        id +
        '" name="' +
        escapeHtml(question.name) +
        '" class="canvasform-control canvasform-file" type="file" accept="' +
        escapeHtml(question.accept || "") +
        '"><div class="canvasform-file-status" data-file-for="' +
        escapeHtml(question.name) +
        '">' +
        (value && value.name
          ? escapeHtml(value.name)
          : "Ningún archivo seleccionado") +
        "</div>";
    } else if (question.type === "signature") {
      input =
        '<div class="canvasform-signature-wrap"><canvas id="' +
        id +
        '" class="canvasform-signature" width="600" height="180" data-signature="' +
        escapeHtml(question.name) +
        '"></canvas><button type="button" class="canvasform-signature-clear" data-clear-signature="' +
        escapeHtml(question.name) +
        '">Limpiar firma</button><div class="canvasform-file-status" data-file-for="' +
        escapeHtml(question.name) +
        '"></div></div>';
    } else if (question.type === "date") {
      input =
        '<div class="canvasform-date-control"><input id="' +
        id +
        '" name="' +
        escapeHtml(question.name) +
        '" class="canvasform-control" type="date" value="' +
        escapeHtml(value || "") +
        '"><span>▣</span></div>';
    } else if (question.type === "comment" || question.type === "textarea") {
      input =
        '<textarea id="' +
        id +
        '" name="' +
        escapeHtml(question.name) +
        '" class="canvasform-control" rows="' +
        escapeHtml(question.rows || 4) +
        '" placeholder="' +
        escapeHtml(question.placeholder || "") +
        '">' +
        escapeHtml(value || "") +
        "</textarea>";
    } else if (question.type === "calculated") {
      input =
        '<output class="canvasform-calculated" id="' +
        id +
        '">' +
        escapeHtml(value == null ? question.defaultValue || "" : value) +
        "</output>";
    } else {
      var inputType =
        question.inputType ||
        { number: "number", email: "email", tel: "tel", url: "url" }[
          question.type
        ] ||
        "text";
      input =
        '<input id="' +
        id +
        '" name="' +
        escapeHtml(question.name) +
        '" class="canvasform-control" type="' +
        escapeHtml(inputType) +
        '" value="' +
        escapeHtml(value || "") +
        '" placeholder="' +
        escapeHtml(question.placeholder || "") +
        '">';
    }
    return (
      '<section class="canvasform-question' +
      conditionalClass +
      wClass +
      '" data-question="' +
      escapeHtml(question.name) +
      '" data-type="' +
      escapeHtml(question.type) +
      '" data-width="' +
      qWidth +
      '">' +
      label +
      help +
      input +
      '<div class="canvasform-error" data-error-for="' +
      escapeHtml(question.name) +
      '" role="alert"></div></section>'
    );
  };

  CanvasForm.prototype._handleChange = function (event) {
    var field = event.target;
    if (!field || !field.name) return;
    var rawName = field.name;
    var questionName = rawName;

    if (questionName.slice(-8) === "_country")
      questionName = questionName.slice(0, -8);
    if (questionName.slice(-6) === "_start")
      questionName = questionName.slice(0, -6);
    if (questionName.slice(-4) === "_end")
      questionName = questionName.slice(0, -4);

    var temp = questionName;
    if (temp.indexOf("_") !== -1) {
      var p = temp.split("_");
      while (p.length > 1 && /^\d+$/.test(p[p.length - 1])) p.pop();
      var stripped = p.join("_");
      if (this.findQuestion(stripped)) questionName = stripped;
    }

    var question = this.findQuestion(questionName);
    if (!question) return;

    var fields = this.root.querySelectorAll(
      '[name="' + cssEscape(field.name) + '"]',
    );
    var value;
    var cfg = getCanvasConfig();
    var uploadUrl = cfg.UPLOAD_URL || cfg.API_URL || "/api/uploads";

    if (question.type === "checkbox") {
      value = Array.from(fields)
        .filter(function (i) {
          return i.checked;
        })
        .map(function (i) {
          return i.value;
        });
    } else if (question.type === "boolean") {
      value = field.checked;
    } else if (question.type === "tel" && field.name.slice(-8) === "_country") {
      var currentPhone = this.values[question.name] || {};
      this.values[question.name] = {
        country: field.value,
        number: currentPhone.number || "",
      };
      this.emit("valueChanged", {
        name: question.name,
        value: this.values[question.name],
        data: this.getData(),
      });
      this.renderPage();
      return;
    } else if (question.type === "tel") {
      var countryField = this.root.querySelector(
        '[data-autocomplete="' +
          cssEscape(question.name + "_country") +
          '"] [data-autocomplete-input]',
      );
      var currentCountry =
        (this.values[question.name] || {}).country ||
        (question.countryCodes &&
          question.countryCodes[0] &&
          question.countryCodes[0].code) ||
        "+57";
      if (countryField) {
        var co = (question.countryCodes || []).find(function (c) {
          return c.name + " (" + c.code + ")" === countryField.value;
        });
        if (co) currentCountry = co.code;
      }
      value = { country: currentCountry, number: field.value };
    } else if (question.type === "file") {
      var file = field.files && field.files[0];
      if (!file) return;
      var statusEl = this.root.querySelector(
        '[data-file-for="' + cssEscape(question.name) + '"]',
      );
      var fileError = this.root.querySelector(
        '[data-error-for="' + cssEscape(question.name) + '"]',
      );
      var acceptStr = question.accept || "";
      var fileMode = question.fileMode || "all";
      var mime = (file.type || "").toLowerCase();
      var fName = (file.name || "").toLowerCase();
      var isValidType = true;
      if (fileMode === "image") isValidType = mime.indexOf("image/") === 0;
      else if (fileMode === "pdf")
        isValidType = mime === "application/pdf" || fName.endsWith(".pdf");
      else if (fileMode === "document")
        isValidType =
          /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv)$/.test(fName) ||
          /^(application\/(pdf|msword|vnd\.ms-excel|vnd\.openxmlformats)|text\/)/.test(
            mime,
          );
      else if (fileMode === "image_document")
        isValidType =
          mime.indexOf("image/") === 0 ||
          /\.(pdf|doc|docx|xls|xlsx)$/.test(fName) ||
          mime === "application/pdf";
      if (!isValidType) {
        field.value = "";
        if (fileError) fileError.textContent = "Tipo no permitido.";
        if (statusEl) statusEl.textContent = "❌ " + file.name + " rechazado";
        return;
      }
      var maxMB = question.maxSizeMB || cfg.MAX_FILE_MB || 5;
      var maxSize = Number(question.maxSize || maxMB * 1024 * 1024);
      if (file.size > maxSize) {
        field.value = "";
        if (fileError) fileError.textContent = "Máximo " + maxMB + "MB";
        if (statusEl) statusEl.textContent = "❌ Archivo muy grande";
        return;
      }
      if (fileError) fileError.textContent = "";
      if (statusEl) statusEl.textContent = "Subiendo " + file.name + "...";
      var self = this;
      var uploadPromise;
      if (cfg.uploadHandler && typeof cfg.uploadHandler === "function")
        uploadPromise = cfg.uploadHandler(file, question.name, "file");
      else {
        var fd = new FormData();
        fd.append("file", file);
        fd.append("fieldName", question.name);
        var headers = {};
        if (cfg.TOKEN) headers["Authorization"] = "Bearer " + cfg.TOKEN;
        uploadPromise = fetch(uploadUrl, {
          method: "POST",
          body: fd,
          headers: headers,
        }).then(function (r) {
          if (!r.ok) throw new Error("upload");
          return r.json();
        });
      }
      uploadPromise
        .then(function (res) {
          self.values[question.name] = {
            name: file.name,
            size: file.size,
            type: file.type,
            url: res.url || res.location || res.path,
            storageKey: res.storageKey,
            fileMode: fileMode,
          };
          if (statusEl) statusEl.textContent = "✓ " + file.name;
          self.emit("valueChanged", {
            name: question.name,
            value: self.values[question.name],
            data: self.getData(),
          });
        })
        .catch(function () {
          if (statusEl) statusEl.textContent = "Error al subir";
          field.value = "";
        });
      return;
    } else if (
      ["radiogroup", "rating", "scale", "nps", "imagechoice", "emojis"].indexOf(
        question.type,
      ) !== -1
    ) {
      var checked = Array.from(fields).find(function (i) {
        return i.checked;
      });
      value = checked ? checked.value : "";
    } else if (question.type === "daterange") {
      var sF = this.root.querySelector(
        '[name="' + cssEscape(question.name + "_start") + '"]',
      );
      var eF = this.root.querySelector(
        '[name="' + cssEscape(question.name + "_end") + '"]',
      );
      value = { start: sF ? sF.value : "", end: eF ? eF.value : "" };
    } else if (
      question.type === "matrix" ||
      question.type === "matrixcheckbox" ||
      question.type === "matrixtext"
    ) {
      var selfM = this;
      var parts = rawName.split("_");
      var colIdx = 0,
        rowIdx = 0;

      if (
        question.type === "matrixtext" &&
        parts.length >= 3 &&
        /^\d+$/.test(parts[parts.length - 1]) &&
        /^\d+$/.test(parts[parts.length - 2])
      ) {
        colIdx = parseInt(parts.pop(), 10);
        rowIdx = parseInt(parts.pop(), 10);
      } else {
        rowIdx = parseInt(parts.pop(), 10);
        if (isNaN(rowIdx)) rowIdx = 0;
        if (question.type !== "matrixtext") {
          colIdx = parseInt(field.value, 10);
          if (isNaN(colIdx)) colIdx = 0;
        }
      }

      var rowText =
        question.rows && question.rows[rowIdx] != null
          ? getChoiceText(question.rows[rowIdx])
          : "row_" + rowIdx;
      var colText =
        question.columns && question.columns[colIdx] != null
          ? getChoiceText(question.columns[colIdx])
          : "col_" + colIdx;

      if (
        !selfM.values[questionName] ||
        typeof selfM.values[questionName] !== "object" ||
        Array.isArray(selfM.values[questionName])
      )
        selfM.values[questionName] = {};

      if (question.type === "matrixtext") {
        if (
          !selfM.values[questionName][rowText] ||
          typeof selfM.values[questionName][rowText] !== "object" ||
          Array.isArray(selfM.values[questionName][rowText])
        )
          selfM.values[questionName][rowText] = {};
        selfM.values[questionName][rowText][colText] = field.value;
        var hasAny = Object.keys(selfM.values[questionName][rowText]).some(
          function (k) {
            return selfM.values[questionName][rowText][k] !== "";
          },
        );
        if (!hasAny) delete selfM.values[questionName][rowText];
      } else if (question.type === "matrix") {
        selfM.values[questionName][rowText] = colText;
      } else {
        var cur = selfM.values[questionName][rowText];
        if (!Array.isArray(cur)) cur = [];
        if (field.checked) {
          if (cur.indexOf(colText) === -1) cur.push(colText);
        } else {
          cur = cur.filter(function (c) {
            return c !== colText;
          });
        }
        if (cur.length === 0) delete selfM.values[questionName][rowText];
        else selfM.values[questionName][rowText] = cur;
      }
      value = selfM.values[questionName];
    } else {
      value = field.value;
    }
    this.values[question.name] = value;
    this.emit("valueChanged", {
      name: question.name,
      value: value,
      data: this.getData(),
    });
    if (
      [
        "boolean",
        "checkbox",
        "radiogroup",
        "dropdown",
        "select",
        "rating",
        "scale",
        "nps",
        "imagechoice",
        "emojis",
      ].indexOf(question.type) !== -1
    )
      this.renderPage();
  };

  CanvasForm.prototype.validate = function () {
    var valid = true;
    var questions = this.pages[this.currentPage].elements || [];
    questions.filter(this.visible.bind(this)).forEach(
      function (question) {
        if (LAYOUT_TYPES.indexOf(question.type) !== -1) return;
        if (question.type === "hidden") return;
        var error = this.root.querySelector(
          '[data-error-for="' + cssEscape(question.name) + '"]',
        );
        if (!error) return;
        var value = this.values[question.name];
        var message = "";
        if (question.isRequired && isEmpty(value)) {
          message = question.requiredErrorText || this.definition.requiredError;
        }
        if (
          !message &&
          question.minLength &&
          String(value || "").length < Number(question.minLength)
        ) {
          message = "Escribe al menos " + question.minLength + " caracteres.";
        }
        if (
          !message &&
          question.maxLength &&
          String(value || "").length > Number(question.maxLength)
        ) {
          message = "No superes los " + question.maxLength + " caracteres.";
        }
        if (
          !message &&
          (question.type === "email" || question.inputType === "email") &&
          value &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ) {
          message = "Introduce un email válido.";
        }
        if (!message && question.validators && value) {
          question.validators.forEach(function (validator) {
            if (message) return;
            if (validator.type === "regex" && validator.regex) {
              try {
                if (!new RegExp(validator.regex).test(value)) {
                  message = validator.text || "El formato no es válido.";
                }
              } catch (e) {}
            }
          });
        }
        error.textContent = message;
        if (error.parentElement) {
          error.parentElement.classList.toggle("has-error", Boolean(message));
        }
        if (message) valid = false;
      }.bind(this),
    );
    return valid;
  };
  CanvasForm.prototype.render = function () {
    this.host.classList.add("canvasform-host");
    this.host.innerHTML = '<div class="canvasform" role="form"></div>';
    this.root = this.host.firstElementChild;
    this.root.addEventListener("change", this._boundChange);
    this.root.addEventListener("input", this._boundChange);
    this.renderPage();
    return this;
  };
  CanvasForm.prototype.renderPage = function () {
    var page = this.pages[this.currentPage];
    if (!page) return;
    if (!this.isPageVisible(page)) {
      var n = this.getNextVisibleIndex(this.currentPage);
      if (n !== -1) {
        this.currentPage = n;
        return this.renderPage();
      }
      var p = this.getPrevVisibleIndex(this.currentPage);
      if (p !== -1) {
        this.currentPage = p;
        return this.renderPage();
      }
    }
    page = this.pages[this.currentPage];
    var visiblePages = this.getVisiblePages();
    var visibleIndex = visiblePages.indexOf(page);
    if (visibleIndex === -1) visibleIndex = 0;
    var visibleQuestions = (page.elements || []).filter(
      this.visible.bind(this),
    );
    var showBotton =
      this.definition.showBotton !== false &&
      this.definition.showButton !== false;
    var progress = Math.round(
      ((visibleIndex + 1) / (visiblePages.length || 1)) * 100,
    );
    var pageLabel =
      visiblePages.length > 1 && this.definition.showPageNumbers
        ? '<span class="canvasform-page-count">Página ' +
          (visibleIndex + 1) +
          " de " +
          visiblePages.length +
          "</span>"
        : visiblePages.length === 1
          ? '<span class="canvasform-page-count">Página 1 de 1</span>'
          : "";
    var cfg = this.getTimeLimitConfig();
    var geoCfg = this.getGeoLocationConfig();
    var timerMarkup =
      cfg && cfg.enabled
        ? '<div class="canvasform-timer-wrap"><div class="canvasform-timer-progress"><div data-canvasform-timer-bar style="width:0%"></div></div><div class="canvasform-timer" data-canvasform-timer>Cargando...</div></div>'
        : "";
    var geoMarkup = "";
    if (geoCfg) {
      var isLocating =
        this._geoStatus === "locating" || this._geoStatus === "idle";
      var text = isLocating ? "OBTENIENDO UBICACIÓN…" : "UBICACIÓN REGISTRADA";
      var dotBg = isLocating ? "#d97706" : "#0f7a4a";
      var display = isLocating || this._geoStatus === "ok" ? "flex" : "none";
      geoMarkup =
        '<div data-canvasform-geo style="display:' +
        display +
        ';align-items:center;gap:6px;font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#4a6350;background:#f0f5f1;border:1px solid #dbe6dd;padding:6px 12px;border-radius:999px;margin:12px 32px 0;width:fit-content;line-height:1"><span style="width:6px;height:6px;background:' +
        dotBg +
        ';border-radius:50%;display:inline-block;flex-shrink:0"></span><span>' +
        text +
        "</span></div>";
    }
    var progressMarkup =
      (this.definition.showProgress
        ? '<div class="canvasform-progress"><div class="canvasform-progress-bar" style="width:' +
          progress +
          '%"></div></div>'
        : "") +
      timerMarkup +
      geoMarkup;
    var minCheck = this.checkMinTime(false);
    var minHint = !minCheck.ok
      ? '<div class="canvasform-time-error" data-canvasform-min-hint>Debes esperar ' +
        escapeHtml(formatSeconds(minCheck.remain)) +
        " para poder enviar.</div>"
      : "";
    var isLastVisible = visibleIndex === visiblePages.length - 1;
    var primaryButtonHtml = "";
    if (showBotton && minCheck.ok) {
      primaryButtonHtml =
        '<button type="button" class="canvasform-button canvasform-button-primary" data-canvasform-action="' +
        (isLastVisible ? "complete" : "next") +
        '" data-canvasform-submit>' +
        escapeHtml(
          isLastVisible
            ? this.definition.completeText
            : this.definition.nextText,
        ) +
        "<span>→</span></button>";
    }
    var footerHtml = showBotton
      ? '<footer class="canvasform-footer">' +
        (visibleIndex > 0
          ? '<button type="button" class="canvasform-button canvasform-button-ghost" data-canvasform-action="previous">' +
            escapeHtml(this.definition.previousText) +
            "</button>"
          : "<span></span>") +
        minHint +
        "</div>" +
        (primaryButtonHtml || "<span></span>") +
        "</footer>"
      : '<footer class="canvasform-footer" style="border:none;"><span></span><span></span></footer>';
    this.root.innerHTML =
      '<header class="canvasform-header"><div><span class="canvasform-kicker">CANVASFORM • V1.0.1</span><h1>' +
      escapeHtml(this.definition.title) +
      "</h1><p>" +
      escapeHtml(this.definition.description) +
      "</p></div>" +
      pageLabel +
      "</header>" +
      progressMarkup +
      '<main class="canvasform-page"><div class="canvasform-page-heading"><span class="canvasform-step">0' +
      (visibleIndex + 1) +
      "</span><div><h2>" +
      escapeHtml(page.title || "") +
      "</h2>" +
      (page.description ? "<p>" + escapeHtml(page.description) + "</p>" : "") +
      '</div></div><div class="canvasform-questions">' +
      visibleQuestions.map(this.renderQuestion.bind(this)).join("") +
      "</div></main>" +
      footerHtml;
    this.root.querySelectorAll("[data-canvasform-action]").forEach(
      function (button) {
        button.addEventListener(
          "click",
          function () {
            var a = button.dataset.canvasformAction;
            if (typeof this[a] === "function") this[a]();
          }.bind(this),
        );
      }.bind(this),
    );
    this.bindSignatures();
    this.bindAutocomplete();
    if (this._timerId) {
      clearInterval(this._timerId);
      this._timerId = null;
    }
    this.startTimer();
  };
  CanvasForm.prototype.next = function () {
    if (!this.validate()) return false;
    var nextIdx = this.getNextVisibleIndex(this.currentPage);
    if (nextIdx !== -1) {
      this.currentPage = nextIdx;
      this.emit("pageChanged", { page: this.currentPage });
      this.renderPage();
    } else {
      this.complete(false);
    }
    return true;
  };
  CanvasForm.prototype.previous = function () {
    var prevIdx = this.getPrevVisibleIndex(this.currentPage);
    if (prevIdx !== -1) {
      this.currentPage = prevIdx;
      this.emit("pageChanged", { page: this.currentPage });
      this.renderPage();
    }
    return true;
  };
  CanvasForm.prototype.complete = function (isAuto) {
    if (
      !isAuto &&
      (this.definition.showBotton === false ||
        this.definition.showButton === false)
    )
      return false;
    var minCheck = this.checkMinTime(isAuto);
    if (!minCheck.ok && !isAuto) {
      alert(minCheck.message);
      this.renderPage();
      return false;
    }
    if (!isAuto && !this.validate()) return false;
    if (this._timerId) clearInterval(this._timerId);
    if (
      this.definition.showBotton === false ||
      this.definition.showButton === false
    )
      return false;
    if (!this.validate()) return false;
    this.root.innerHTML =
      '<div class="canvasform-complete">' +
      this.definition.completedHtml +
      '<button type="button" class="canvasform-button canvasform-button-ghost" data-canvasform-action="restart">Responder de nuevo</button></div>';
    var restartButton = this.root.querySelector(
      '[data-canvasform-action="restart"]',
    );
    if (restartButton) {
      restartButton.addEventListener("click", this.restart.bind(this));
    }
    this.emit("complete", this.getData());
    return true;
  };
  CanvasForm.prototype.restart = function () {
    this.currentPage = 0;
    this.values = merge({}, this.definition.data || {});
    this.renderPage();
    this.emit("restart", { data: this.getData() });
    this._startTime = Date.now();
    this._timeExpired = false;
    this._forceComplete = false;
    this._geoData = null;
    this._geoStatus = "idle";
    this.startTimer();
    this.captureGeoLocation();
    return this;
  };
  CanvasForm.prototype.destroy = function () {
    if (this._timerId) clearInterval(this._timerId);
    this._autocompleteHandlers.forEach(function (item) {
      item.node.removeEventListener(item.type, item.handler);
    });
    this._autocompleteHandlers = [];
    if (this.root) {
      this.root.removeEventListener("change", this._boundChange);
      this.root.removeEventListener("input", this._boundChange);
    }
    if (this.host) {
      this.host.innerHTML = "";
    }
    this._listeners = {};
    this.root = null;
    this._startTime = Date.now();
    this._timeExpired = false;
    this._forceComplete = false;
    this.startTimer();
  };
  CanvasForm.findQuestion = findQuestion;
  global.CanvasForm = CanvasForm;
  global.CanvasFormSurvey = CanvasForm;
  global.CanvasFormResponse = CanvasForm;
  global.CanvasformSurvey = CanvasForm;
  global.CanvasForm.version = VERSION;
  global.CanvasFormSurvey.version = VERSION;
})(window);
