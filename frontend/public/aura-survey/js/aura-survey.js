(function (global) {
  "use strict";
  var defaults = {
    title: "Aura survey",
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
  var CHOICE_TYPES = [
    "radiogroup",
    "checkbox",
    "dropdown",
    "ranking",
    "imagechoice",
    "emojis",
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
    return (
      value == null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    );
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
    var conditions = Array.isArray(question.auraConditions)
      ? question.auraConditions
      : [];
    conditions = conditions.filter(function (c) {
      return c && c.question;
    });
    if (!conditions.length) {
      delete question.visibleIf;
      return "";
    }
    var logic =
      String(question.auraConditionLogic || "and").toLowerCase() === "or"
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
      String(question.auraConditionAction || "show").toLowerCase() === "hide"
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
    if (!Array.isArray(question.auraConditions) && question.visibleIf) {
      var parsed = parseSimpleVisibleIf(question.visibleIf);
      if (parsed) {
        question.auraConditions = parsed.conditions;
        question.auraConditionLogic = parsed.logic;
        question.auraConditionAction = parsed.action;
      }
    }
    if (!Array.isArray(question.auraConditions)) {
      question.auraConditions = [];
    }
    if (!question.auraConditionLogic) {
      question.auraConditionLogic = "and";
    }
    if (!question.auraConditionAction) {
      question.auraConditionAction = "show";
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

    // --- FIX: NO convertir si/no a true/false ---
    // Solo normalizamos para comparacion case-insensitive
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

  function AuraSurvey(target, definition) {
    this.host =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!this.host) {
      throw new Error("AuraSurvey: no se encontró el contenedor.");
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
    this.normalizeSchema();
    this.render();
    this.startTimer();
  }

  AuraSurvey.prototype.findQuestion = function (name) {
    return findQuestionInPages(this.pages, name);
  };

  AuraSurvey.prototype.getTimeLimitConfig = function () {
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
  AuraSurvey.prototype.getElapsedSeconds = function () {
    return Math.floor((Date.now() - this._startTime) / 1000);
  };
  AuraSurvey.prototype.checkMinTime = function (isAuto) {
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
  AuraSurvey.prototype.startTimer = function () {
    var self = this;
    var cfg = self.getTimeLimitConfig();
    if (!cfg || !cfg.enabled) return;
    if (self._timerId) clearInterval(self._timerId);
    self._timerId = setInterval(function () {
      var elapsed = self.getElapsedSeconds();
      var timerEl = self.root
        ? self.root.querySelector("[data-aura-timer]")
        : null;
      var timerBar = self.root
        ? self.root.querySelector("[data-aura-timer-bar]")
        : null;
      var minHintEl = self.root
        ? self.root.querySelector("[data-aura-min-hint]")
        : null;
      var submitBtn = self.root
        ? self.root.querySelector("[data-aura-submit]")
        : null;
      var footer = self.root ? self.root.querySelector(".aura-footer") : null;

      if (timerEl && cfg.maxEnabled) {
        var remain = cfg.maxSeconds - elapsed;
        timerEl.textContent = "Tiempo restante: " + formatSeconds(remain);
        timerEl.className =
          remain < 60 ? "aura-timer aura-timer-danger" : "aura-timer";
      }
      if (timerBar && cfg.maxEnabled) {
        var pct = Math.min(100, (elapsed / cfg.maxSeconds) * 100);
        timerBar.style.width = pct + "%";
      }

      if (cfg.minEnabled) {
        var wait = cfg.minSeconds - elapsed;
        if (wait > 0) {
          if (minHintEl)
            minHintEl.textContent =
              "⏳ Debes esperar " + formatSeconds(wait) + " para poder enviar.";
        } else {
          if (minHintEl) minHintEl.remove();
          if (!submitBtn && footer) {
            var isLast = self.currentPage === self.pages.length - 1;
            var btn = document.createElement("button");
            btn.type = "button";
            btn.className = "aura-button aura-button-primary";
            btn.setAttribute("data-aura-action", isLast ? "complete" : "next");
            btn.setAttribute("data-aura-submit", "");
            btn.innerHTML =
              (isLast
                ? escapeHtml(self.definition.completeText)
                : escapeHtml(self.definition.nextText)) + "<span>→</span>";
            btn.addEventListener("click", function () {
              var a = btn.dataset.auraAction;
              if (typeof self[a] === "function") self[a]();
            });
            footer.appendChild(btn);
          }
          if (timerEl && !cfg.maxEnabled) {
            timerEl.textContent = "Puedes enviar ahora";
          }
        }
      }

      if (cfg.maxEnabled && elapsed >= cfg.maxSeconds && !self._timeExpired) {
        self._timeExpired = true;
        clearInterval(self._timerId);
        self._forceComplete = true;
        self.complete(true);
      }
    }, 1000);
  };
  AuraSurvey.prototype.normalizeSchema = function () {
    this.pages.forEach(function (page) {
      if (!Array.isArray(page.elements)) {
        page.elements = [];
      }
      page.elements.forEach(function (question) {
        if (!question) return;
        if (question.visibleIf && !question.auraConditions) {
          ensureConditionalState(question);
        }
        if (question.auraConditions) {
          buildVisibleIf(question);
        }
      });
    });
  };
  AuraSurvey.prototype.on = function (event, callback) {
    (this._listeners[event] || (this._listeners[event] = [])).push(callback);
    return this;
  };
  AuraSurvey.prototype.emit = function (event, payload) {
    (this._listeners[event] || []).slice().forEach(
      function (cb) {
        cb(payload, this);
      }.bind(this),
    );
  };
  AuraSurvey.prototype.getValue = function (name) {
    return this.values[name];
  };
  AuraSurvey.prototype.getData = function () {
    var data = clone(this.values) || {};
    var cfg = this.getTimeLimitConfig();
    if (cfg) {
      data._meta = { timeElapsed: this.getElapsedSeconds(), timeLimit: cfg };
    }
    return data;
  };
  AuraSurvey.prototype.setValue = function (name, value) {
    this.values[name] = value;
    this.renderPage();
    this.emit("valueChanged", {
      name: name,
      value: value,
      data: this.getData(),
    });
    return this;
  };
  AuraSurvey.prototype.visible = function (question) {
    if (!question || !question.visibleIf) return true;
    if (
      Array.isArray(question.auraConditions) &&
      question.auraConditions.length
    ) {
      var logic =
        String(question.auraConditionLogic || "and").toLowerCase() === "or"
          ? "or"
          : "and";
      var result =
        logic === "or"
          ? question.auraConditions.some(
              function (c) {
                return compareCondition(this.values[c.question], c);
              }.bind(this),
            )
          : question.auraConditions.every(
              function (c) {
                return compareCondition(this.values[c.question], c);
              }.bind(this),
            );
      if (
        String(question.auraConditionAction || "show").toLowerCase() === "hide"
      ) {
        return !result;
      }
      return result;
    }
    return this.evaluateExpression(question.visibleIf);
  };
  AuraSurvey.prototype.evaluateExpression = function (expression) {
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
  AuraSurvey.prototype.bindSignatures = function () {
    this.root.querySelectorAll("[data-signature]").forEach(
      function (canvas) {
        var context = canvas.getContext("2d");
        if (!context) return;
        var drawing = false;
        var position = function (event) {
          var rect = canvas.getBoundingClientRect();
          var source =
            event.touches && event.touches.length ? event.touches[0] : event;
          return {
            x: ((source.clientX - rect.left) * canvas.width) / rect.width,
            y: ((source.clientY - rect.top) * canvas.height) / rect.height,
          };
        };
        context.strokeStyle = "#185c49";
        context.fillStyle = "#185c49";
        context.lineWidth = 3;
        context.lineCap = "round";
        context.lineJoin = "round";
        var start = function (event) {
          drawing = true;
          var point = position(event);
          context.beginPath();
          context.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
          context.fill();
          context.beginPath();
          context.moveTo(point.x, point.y);
          if (canvas.setPointerCapture && event.pointerId != null) {
            try {
              canvas.setPointerCapture(event.pointerId);
            } catch (e) {}
          }
          this.values[canvas.dataset.signature] = canvas.toDataURL("image/png");
          event.preventDefault();
        }.bind(this);
        var draw = function (event) {
          if (!drawing) return;
          var point = position(event);
          context.lineTo(point.x, point.y);
          context.stroke();
          this.values[canvas.dataset.signature] = canvas.toDataURL("image/png");
          event.preventDefault();
        }.bind(this);
        var end = function () {
          drawing = false;
        };
        canvas.addEventListener("pointerdown", start);
        canvas.addEventListener("pointermove", draw);
        canvas.addEventListener("pointerup", end);
        canvas.addEventListener("pointercancel", end);
      }.bind(this),
    );
    this.root.querySelectorAll("[data-clear-signature]").forEach(
      function (button) {
        button.onclick = function () {
          var name = button.dataset.clearSignature;
          var canvas = this.root.querySelector(
            '[data-signature="' + cssEscape(name) + '"]',
          );
          if (canvas) {
            var context = canvas.getContext("2d");
            if (context) {
              context.clearRect(0, 0, canvas.width, canvas.height);
            }
          }
          delete this.values[name];
          this.emit("valueChanged", {
            name: name,
            value: "",
            data: this.getData(),
          });
        }.bind(this);
      }.bind(this),
    );
  };
  AuraSurvey.prototype.refreshConditionalVisibility = function () {
    var page = this.pages[this.currentPage];
    if (!page) return;
    var questions = page.elements || [];
    var shouldRender = false;
    questions.forEach(function (question) {
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
    if (shouldRender) {
      this.renderPage();
    }
  };
  AuraSurvey.prototype.cssEscape = function (value) {
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
      return CSS.escape(String(value));
    }
    return String(value).replace(
      /([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g,
      "\\$1",
    );
  };
  AuraSurvey.prototype.bindAutocomplete = function () {
    var survey = this;
    survey.root.querySelectorAll("[data-autocomplete]").forEach(function (box) {
      var input = box.querySelector("[data-autocomplete-input]");
      var list = box.querySelector("[data-autocomplete-list]");
      if (!input || !list) return;
      var name = box.dataset.autocomplete;
      var question = null;
      for (var p = 0; p < survey.pages.length; p++) {
        var elements = survey.pages[p].elements || [];
        for (var q = 0; q < elements.length; q++) {
          if (elements[q].name === name) {
            question = elements[q];
            break;
          }
        }
        if (question) break;
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
          if (match) {
            option.hidden = false;
            option.style.display = "";
            matches++;
          } else {
            option.hidden = true;
            option.style.display = "none";
          }
        });
        list.hidden = matches === 0;
      };
      input.addEventListener("focus", function () {
        filter();
        if (options.length > 0) {
          list.hidden = false;
        }
      });
      input.addEventListener("input", function () {
        filter();
      });
      input.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          list.hidden = true;
          return;
        }
        if (event.key === "Enter") {
          var firstVisible = options.find(function (option) {
            return !option.hidden;
          });
          if (firstVisible) {
            firstVisible.click();
          }
          event.preventDefault();
        }
      });
      options.forEach(function (option) {
        option.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          var selectedValue = option.dataset.optionValue;
          var selectedText = option.dataset.optionText;
          if (question.type === "dropdown") {
            survey.values[name] = selectedValue;
            input.value = selectedText;
          } else if (question.type === "tel") {
            var current = survey.values[name];
            if (!current || typeof current !== "object") {
              current = { country: "", number: "" };
            }
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
          if (typeof survey.refreshConditionalVisibility === "function") {
            survey.refreshConditionalVisibility();
          }
        });
      });
    });
  };
  AuraSurvey.prototype.moveRanking = function (button, event) {
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
  AuraSurvey.prototype.renderQuestion = function (question) {
    var value = this.values[question.name];
    var id = "aura-" + question.name;
    if (question.type === "heading") {
      return (
        '<h3 class="aura-design-heading">' +
        escapeHtml(question.title || "") +
        "</h3>"
      );
    }
    if (question.type === "description") {
      return (
        '<p class="aura-design-description">' +
        escapeHtml(question.description || question.title || "") +
        "</p>"
      );
    }
    if (question.type === "separator") {
      return '<hr class="aura-design-separator">';
    }
    if (question.type === "image") {
      var rawUrl = question.src || question.url || question.imageUrl || "";
      var imgUrl = rawUrl;
      try {
        if (imgUrl.indexOf("google.com/imgres") !== -1) {
          var urlObj = new URL(imgUrl);
          var real = urlObj.searchParams.get("imgurl");
          if (real) imgUrl = decodeURIComponent(real);
        }
      } catch (e) {}
      if (!imgUrl) return "";
      return (
        '<figure class="aura-design-media"><img src="' +
        escapeHtml(imgUrl) +
        '" alt="' +
        escapeHtml(question.alt || question.title || "") +
        '" loading="lazy" style="max-width:100%;border-radius:12px;"></figure>'
      );
    }
    if (question.type === "video") {
      var videoUrl = question.src || question.url || question.videoUrl || "";
      var youtube = videoUrl.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i,
      );
      if (youtube) {
        return (
          '<div class="aura-design-media"><div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;"><iframe src="https://www.youtube.com/embed/' +
          escapeHtml(youtube[1]) +
          '" title="' +
          escapeHtml(question.title || "Video") +
          '" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div></div>'
        );
      }
      if (videoUrl) {
        return (
          '<div class="aura-design-media"><video src="' +
          escapeHtml(videoUrl) +
          '" controls style="width:100%;border-radius:12px;"></video></div>'
        );
      }
      return '<div class="aura-design-media"><p class="aura-media-error">Usa un enlace válido de YouTube.</p></div>';
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
    if (question.type === "section") {
      return (
        '<div class="aura-design-section"><h3>' +
        escapeHtml(question.title || "") +
        "</h3><p>" +
        escapeHtml(question.description || "") +
        "</p></div>"
      );
    }
    var required = question.isRequired
      ? '<span class="aura-required" aria-hidden="true">*</span>'
      : "";
    var label =
      '<label class="aura-label" for="' +
      id +
      '">' +
      escapeHtml(question.title || "") +
      required +
      "</label>";
    var help = question.description
      ? '<div class="aura-help">' + escapeHtml(question.description) + "</div>"
      : "";
    var input = "";
    var options = question.choices || [];
    if (question.type === "radiogroup" || question.type === "checkbox") {
      var selected = Array.isArray(value) ? value : [value];
      input =
        '<div class="aura-options" role="group">' +
        options
          .map(function (choice) {
            var item =
              typeof choice === "object"
                ? choice
                : { value: choice, text: choice };
            var checked = selected.indexOf(item.value) !== -1 ? " checked" : "";
            var type = question.type === "checkbox" ? "checkbox" : "radio";
            return (
              '<label class="aura-option"><input type="' +
              type +
              '" name="' +
              escapeHtml(question.name) +
              '" value="' +
              escapeHtml(item.value) +
              '"' +
              checked +
              '><span class="aura-option-mark"></span><span>' +
              escapeHtml(item.text) +
              "</span></label>"
            );
          })
          .join("") +
        "</div>";
    } else if (question.type === "dropdown") {
      var selectedChoice = options.find(function (c) {
        return getChoiceValue(c) === value;
      });
      input =
        '<div class="aura-autocomplete" data-autocomplete="' +
        escapeHtml(question.name) +
        '"><input id="' +
        id +
        '" class="aura-control" data-autocomplete-input autocomplete="off" placeholder="' +
        escapeHtml(question.placeholder || "Escribe para buscar...") +
        '" value="' +
        escapeHtml(
          selectedChoice ? getChoiceText(selectedChoice) : value || "",
        ) +
        '"><div class="aura-autocomplete-list" data-autocomplete-list role="listbox" hidden>' +
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
        '<div class="aura-rating" role="radiogroup">' +
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
        '<div class="aura-image-choices">' +
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
        '<div class="aura-scale" role="radiogroup">' +
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
        '<div class="aura-slider"><div class="aura-slider-labels"><span>' +
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
        '<div class="aura-emojis">' +
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
        '<ol class="aura-ranking">' +
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
      input =
        '<div class="aura-matrix-scroll"><table class="aura-matrix"><thead><tr><th></th>' +
        (question.columns || [])
          .map(function (column) {
            return "<th>" + escapeHtml(getChoiceText(column)) + "</th>";
          })
          .join("") +
        "</tr></thead><tbody>" +
        (question.rows || [])
          .map(function (row, rowIndex) {
            var rowText = getChoiceText(row);
            return (
              "<tr><th>" +
              escapeHtml(rowText) +
              "</th>" +
              (question.columns || [])
                .map(function (_, columnIndex) {
                  return (
                    '<td><input type="' +
                    matrixInput +
                    '" name="' +
                    escapeHtml(question.name + "_" + rowIndex) +
                    '" value="' +
                    columnIndex +
                    '"></td>'
                  );
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
        '" class="aura-control" type="' +
        (question.type === "time" ? "time" : "datetime-local") +
        '" value="' +
        escapeHtml(value || "") +
        '">';
    } else if (question.type === "daterange") {
      input =
        '<div class="aura-date-range"><input class="aura-control" name="' +
        escapeHtml(question.name + "_start") +
        '" type="date" value="' +
        escapeHtml(value && value.start) +
        '" aria-label="Fecha inicial"><span>hasta</span><input class="aura-control" name="' +
        escapeHtml(question.name + "_end") +
        '" type="date" value="' +
        escapeHtml(value && value.end) +
        '" aria-label="Fecha final"></div>';
    } else if (question.type === "boolean") {
      input =
        '<label class="aura-toggle"><input id="' +
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
        '<div class="aura-phone"><div class="aura-autocomplete" data-autocomplete="' +
        escapeHtml(question.name + "_country") +
        '"><input class="aura-control aura-country" data-autocomplete-input autocomplete="off" aria-label="País" placeholder="Busca país..." value="' +
        escapeHtml(selectedCountry.name + " (" + selectedCountry.code + ")") +
        '"><div class="aura-autocomplete-list" data-autocomplete-list role="listbox" hidden>' +
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
        '" class="aura-control" type="tel" value="' +
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
        '" class="aura-control aura-file" type="file" accept="' +
        escapeHtml(question.accept || "") +
        '"><div class="aura-file-status" data-file-for="' +
        escapeHtml(question.name) +
        '">' +
        (value && value.name
          ? escapeHtml(value.name)
          : "Ningún archivo seleccionado") +
        "</div>";
    } else if (question.type === "signature") {
      input =
        '<div class="aura-signature-wrap"><canvas id="' +
        id +
        '" class="aura-signature" width="600" height="180" data-signature="' +
        escapeHtml(question.name) +
        '"></canvas><button type="button" class="aura-signature-clear" data-clear-signature="' +
        escapeHtml(question.name) +
        '">Limpiar firma</button></div>';
    } else if (question.type === "date") {
      input =
        '<div class="aura-date-control"><input id="' +
        id +
        '" name="' +
        escapeHtml(question.name) +
        '" class="aura-control" type="date" value="' +
        escapeHtml(value || "") +
        '"><span>▣</span></div>';
    } else if (question.type === "comment" || question.type === "textarea") {
      input =
        '<textarea id="' +
        id +
        '" name="' +
        escapeHtml(question.name) +
        '" class="aura-control" rows="' +
        escapeHtml(question.rows || 4) +
        '" placeholder="' +
        escapeHtml(question.placeholder || "") +
        '">' +
        escapeHtml(value || "") +
        "</textarea>";
    } else if (question.type === "calculated") {
      input =
        '<output class="aura-calculated" id="' +
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
        '" class="aura-control" type="' +
        escapeHtml(inputType) +
        '" value="' +
        escapeHtml(value || "") +
        '" placeholder="' +
        escapeHtml(question.placeholder || "") +
        '">';
    }
    var conditionalClass =
      question.visibleIf ||
      (Array.isArray(question.auraConditions) && question.auraConditions.length)
        ? " aura-question-conditional"
        : "";
    return (
      '<section class="aura-question' +
      conditionalClass +
      '" data-question="' +
      escapeHtml(question.name) +
      '">' +
      label +
      help +
      input +
      '<div class="aura-error" data-error-for="' +
      escapeHtml(question.name) +
      '" role="alert"></div></section>'
    );
  };
  AuraSurvey.prototype._handleChange = function (event) {
    var field = event.target;
    if (!field || !field.name) return;
    var questionName = field.name;
    if (questionName.slice(-8) === "_country") {
      questionName = questionName.slice(0, -8);
    }
    if (questionName.slice(-6) === "_start") {
      questionName = questionName.slice(0, -6);
    }
    if (questionName.slice(-4) === "_end") {
      questionName = questionName.slice(0, -4);
    }
    var question = this.findQuestion(questionName);
    if (!question) return;
    var fields = this.root.querySelectorAll(
      '[name="' + cssEscape(field.name) + '"]',
    );
    var value;
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
        var countryOption = (question.countryCodes || []).find(function (c) {
          return c.name + " (" + c.code + ")" === countryField.value;
        });
        if (countryOption) {
          currentCountry = countryOption.code;
        }
      }
      value = { country: currentCountry, number: field.value };
    } else if (question.type === "file") {
      var file = field.files && field.files[0];
      if (!file) return;
      var maxSize = Number(question.maxSize || 5242880);
      if (file.size > maxSize) {
        field.value = "";
        var fileError = this.root.querySelector(
          '[data-error-for="' + cssEscape(question.name) + '"]',
        );
        if (fileError) {
          fileError.textContent =
            "El archivo supera el tamaño máximo permitido.";
        }
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        this.values[question.name] = {
          name: file.name,
          type: file.type,
          size: file.size,
          base64: reader.result,
        };
        this.emit("valueChanged", {
          name: question.name,
          value: this.values[question.name],
          data: this.getData(),
        });
      }.bind(this);
      reader.readAsDataURL(file);
      return;
    } else if (
      question.type === "radiogroup" ||
      question.type === "rating" ||
      question.type === "scale" ||
      question.type === "nps" ||
      question.type === "imagechoice" ||
      question.type === "emojis"
    ) {
      var checked = Array.from(fields).find(function (i) {
        return i.checked;
      });
      value = checked ? checked.value : "";
    } else if (question.type === "daterange") {
      var startField = this.root.querySelector(
        '[name="' + cssEscape(question.name + "_start") + '"]',
      );
      var endField = this.root.querySelector(
        '[name="' + cssEscape(question.name + "_end") + '"]',
      );
      value = {
        start: startField ? startField.value : "",
        end: endField ? endField.value : "",
      };
    } else if (
      question.type === "matrix" ||
      question.type === "matrixcheckbox" ||
      question.type === "matrixtext"
    ) {
      value = this.values[question.name] || {};
      value[field.name] =
        field.type === "checkbox" ? field.checked : field.value;
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
        "rating",
        "scale",
        "nps",
        "imagechoice",
        "emojis",
      ].indexOf(question.type) !== -1
    ) {
      this.renderPage();
    }
  };
  AuraSurvey.prototype.validate = function () {
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
  AuraSurvey.prototype.render = function () {
    this.host.classList.add("aura-survey-host");
    this.host.innerHTML = '<div class="aura-survey" role="form"></div>';
    this.root = this.host.firstElementChild;
    this.root.addEventListener("change", this._boundChange);
    this.root.addEventListener("input", this._boundChange);
    this.renderPage();
    return this;
  };
  AuraSurvey.prototype.renderPage = function () {
    var page = this.pages[this.currentPage];
    if (!page) return;
    var visibleQuestions = (page.elements || []).filter(
      this.visible.bind(this),
    );
    var showBotton =
      this.definition.showBotton !== false &&
      this.definition.showButton !== false;
    var progress = Math.round(
      ((this.currentPage + 1) / this.pages.length) * 100,
    );
    var pageLabel =
      this.pages.length > 1 && this.definition.showPageNumbers
        ? '<span class="aura-page-count">Página ' +
          (this.currentPage + 1) +
          " de " +
          this.pages.length +
          "</span>"
        : "";

    var cfg = this.getTimeLimitConfig();
    var timerMarkup = "";
    if (cfg && cfg.enabled) {
      timerMarkup =
        '<div class="aura-timer-wrap"><div class="aura-timer-progress"><div data-aura-timer-bar style="width:0%"></div></div><div class="aura-timer" data-aura-timer>Cargando...</div></div>';
    }
    var progressMarkup =
      (this.definition.showProgress
        ? '<div class="aura-progress"><div class="aura-progress-bar" style="width:' +
          progress +
          '%"></div></div>'
        : "") + timerMarkup;

    var minCheck = this.checkMinTime(false);
    var minHint = !minCheck.ok
      ? '<div class="aura-time-error" data-aura-min-hint>⏳ Debes esperar ' +
        escapeHtml(formatSeconds(minCheck.remain)) +
        " para poder enviar.</div>"
      : "";

    var primaryButtonHtml = "";
    if (showBotton) {
      if (minCheck.ok) {
        primaryButtonHtml =
          '<button type="button" class="aura-button aura-button-primary" data-aura-action="' +
          (this.currentPage === this.pages.length - 1 ? "complete" : "next") +
          '" data-aura-submit>' +
          escapeHtml(
            this.currentPage === this.pages.length - 1
              ? this.definition.completeText
              : this.definition.nextText,
          ) +
          "<span>→</span></button>";
      } else {
        primaryButtonHtml = "";
      }
    }

    var footerHtml = "";
    if (showBotton) {
      footerHtml =
        '<footer class="aura-footer">' +
        (this.currentPage > 0
          ? '<button type="button" class="aura-button aura-button-ghost" data-aura-action="previous">' +
            escapeHtml(this.definition.previousText) +
            "</button>"
          : "<span></span>") +
        minHint +
        "</div>" +
        (primaryButtonHtml || "<span></span>") +
        "</footer>";
    } else {
      footerHtml =
        '<footer class="aura-footer" style="border:none;justify-content:center;padding-top:10px;"><span></span><span></span></footer>';
    }

    this.root.innerHTML =
      '<header class="aura-header"><div><span class="aura-kicker">AURA / FORM</span><h1>' +
      escapeHtml(this.definition.title) +
      "</h1><p>" +
      escapeHtml(this.definition.description) +
      "</p></div>" +
      pageLabel +
      "</header>" +
      progressMarkup +
      '<main class="aura-page"><div class="aura-page-heading"><span class="aura-step">0' +
      (this.currentPage + 1) +
      "</span><div><h2>" +
      escapeHtml(page.title || "") +
      "</h2>" +
      (page.description ? "<p>" + escapeHtml(page.description) + "</p>" : "") +
      '</div></div><div class="aura-questions">' +
      visibleQuestions.map(this.renderQuestion.bind(this)).join("") +
      "</div></main>" +
      footerHtml;

    this.root.querySelectorAll("[data-aura-action]").forEach(
      function (button) {
        button.addEventListener(
          "click",
          function () {
            var action = button.dataset.auraAction;
            if (typeof this[action] === "function") {
              this[action]();
            }
          }.bind(this),
        );
      }.bind(this),
    );
    this.root.querySelectorAll("[data-rank]").forEach(
      function (button) {
        button.addEventListener("click", this.moveRanking.bind(this, button));
      }.bind(this),
    );
    this.root
      .querySelectorAll('input[type="range"]')
      .forEach(function (slider) {
        slider.addEventListener("input", function () {
          var output = slider.parentElement.querySelector("output");
          if (output) {
            output.textContent = slider.value;
          }
        });
      });
    this.bindSignatures();
    this.bindAutocomplete();
    if (this._timerId) {
      clearInterval(this._timerId);
      this._timerId = null;
    }
    this.startTimer();
  };
  AuraSurvey.prototype.next = function () {
    var minCheck = this.checkMinTime(false);
    if (!minCheck.ok) {
      alert(minCheck.message);
      return false;
    }
    if (
      this.definition.showBotton === false ||
      this.definition.showButton === false
    )
      return false;
    if (!this.validate()) return false;
    if (this.currentPage < this.pages.length - 1) {
      this.currentPage++;
      this.emit("pageChanged", { page: this.currentPage });
      this.renderPage();
    }
    return true;
  };
  AuraSurvey.prototype.previous = function () {
    if (
      this.definition.showBotton === false ||
      this.definition.showButton === false
    )
      return false;
    if (this.currentPage > 0) {
      this.currentPage--;
      this.emit("pageChanged", { page: this.currentPage });
      this.renderPage();
    }
    return true;
  };
  AuraSurvey.prototype.complete = function (isAuto) {
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
      '<div class="aura-complete">' +
      this.definition.completedHtml +
      '<button type="button" class="aura-button aura-button-ghost" data-aura-action="restart">Responder de nuevo</button></div>';
    var restartButton = this.root.querySelector('[data-aura-action="restart"]');
    if (restartButton) {
      restartButton.addEventListener("click", this.restart.bind(this));
    }
    this.emit("complete", this.getData());
    return true;
  };
  AuraSurvey.prototype.restart = function () {
    this.currentPage = 0;
    this.values = merge({}, this.definition.data || {});
    this.renderPage();
    this.emit("restart", { data: this.getData() });
    this._startTime = Date.now();
    this._timeExpired = false;
    this._forceComplete = false;
    this.startTimer();
    return this;
  };
  AuraSurvey.prototype.destroy = function () {
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
  AuraSurvey.findQuestion = findQuestion;
  global.AuraSurvey = AuraSurvey;
  global.AuraSurvey.version = "1.1.1";
})(window);
