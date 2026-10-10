(function (global) {
  "use strict";
  var VERSION = "2.3.0-business-pro";
  function escapeHtml(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      }[c];
    });
  }
  function clone(v) {
    try {
      return JSON.parse(JSON.stringify(v));
    } catch (e) {
      return v;
    }
  }
  function getChoiceText(c) {
    return typeof c === "object" && c !== null
      ? c.text != null
        ? c.text
        : c.value
      : c;
  }
  function getChoiceValue(c) {
    return typeof c === "object" && c !== null ? c.value : c;
  }
  function getAllQuestions(pages) {
    var qs = [];
    (pages || []).forEach(function (p) {
      (p.elements || []).forEach(function (q) {
        if (!q || !q.name) return;
        if (
          [
            "heading",
            "description",
            "separator",
            "section",
            "image",
            "video",
          ].indexOf(q.type) !== -1
        )
          return;
        qs.push(q);
      });
    });
    return qs;
  }
  function avg(arr) {
    if (!arr.length) return 0;
    return (
      arr.reduce(function (a, b) {
        return a + b;
      }, 0) / arr.length
    );
  }

  var PALETTE_DEFAULT = [
    "#123a2e",
    "#1a5c49",
    "#e36f55",
    "#c9a227",
    "#7aa08e",
    "#b9d3c0",
    "#0f1a15",
    "#8fb5a0",
  ];

  // --- Canvas helpers ---
  function prepCanvas(canvas) {
    var ctx = canvas.getContext("2d");
    var dpr = global.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    var w = rect.width || canvas.clientWidth || 600,
      h = rect.height || canvas.clientHeight || 240;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx: ctx, w: w, h: h, dpr: dpr };
  }
  function drawBarChart(canvas, labels, values, colors) {
    var p = prepCanvas(canvas),
      ctx = p.ctx,
      W = p.w,
      H = p.h;
    var pad = { top: 14, right: 12, bottom: 34, left: 34 };
    var chartW = W - pad.left - pad.right,
      chartH = H - pad.top - pad.bottom;
    var max = Math.max.apply(null, values.concat([1]));
    var n = values.length || 1,
      barW = (chartW / n) * 0.55,
      gap = (chartW / n) * 0.45;
    ctx.font = "11px system-ui";
    ctx.textAlign = "center";
    values.forEach(function (val, i) {
      var x = pad.left + i * (barW + gap) + gap / 2,
        h = (val / max) * chartH,
        y = pad.top + chartH - h;
      ctx.fillStyle = (colors || PALETTE_DEFAULT)[
        i % (colors || PALETTE_DEFAULT).length
      ];
      ctx.beginPath();
      ctx.roundRect(x, y, barW, h, 6);
      ctx.fill();
      ctx.fillStyle = "#0f1a15";
      ctx.fillText(String(val), x + barW / 2, y - 6);
      ctx.fillStyle = "#7a8a82";
      ctx.fillText(String(labels[i]).slice(0, 14), x + barW / 2, H - 8);
    });
    ctx.strokeStyle = "#e3ebe5";
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top + chartH);
    ctx.lineTo(pad.left + chartW, pad.top + chartH);
    ctx.stroke();
  }
  function drawHBarChart(canvas, labels, values, colors) {
    var p = prepCanvas(canvas),
      ctx = p.ctx,
      W = p.w,
      H = p.h;
    var pad = { top: 10, right: 80, bottom: 10, left: 110 };
    var chartW = W - pad.left - pad.right,
      chartH = H - pad.top - pad.bottom;
    var max = Math.max.apply(null, values.concat([1]));
    var rowH = chartH / (values.length || 1);
    values.forEach(function (val, i) {
      var y = pad.top + i * rowH + 4,
        w = (val / max) * chartW,
        h = rowH * 0.55;
      ctx.fillStyle = (colors || PALETTE_DEFAULT)[
        i % (colors || PALETTE_DEFAULT).length
      ];
      ctx.beginPath();
      ctx.roundRect(pad.left, y, w, h, 6);
      ctx.fill();
      ctx.fillStyle = "#0f1a15";
      ctx.font = "12px system-ui";
      ctx.textAlign = "left";
      ctx.fillText(labels[i].slice(0, 22), pad.left - 100, y + h * 0.7);
      ctx.fillStyle = "#123a2e";
      ctx.fillText(val, pad.left + w + 8, y + h * 0.7);
    });
  }
  function drawPieLike(canvas, labels, values, donut, colors) {
    var p = prepCanvas(canvas),
      ctx = p.ctx,
      W = p.w,
      H = p.h;
    var total =
      values.reduce(function (a, b) {
        return a + b;
      }, 0) || 1;
    var cx = W * 0.32,
      cy = H / 2,
      r = Math.min(W, H) * 0.42,
      inner = donut ? r * 0.58 : 0;
    var cols = colors || PALETTE_DEFAULT,
      start = -Math.PI / 2;
    values.forEach(function (v, i) {
      var angle = (v / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.fillStyle = cols[i % cols.length];
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + angle);
      ctx.closePath();
      ctx.fill();
      start += angle;
    });
    if (inner > 0) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(cx, cy, inner, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#123a2e";
      ctx.font = "700 20px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(String(total), cx, cy + 6);
      ctx.font = "10px system-ui";
      ctx.fillStyle = "#7a8a82";
      ctx.fillText("RESP", cx, cy + 18);
    }
    var lx = W * 0.6,
      ly = 16;
    labels.forEach(function (l, i) {
      var pct = Math.round((values[i] / total) * 100);
      ctx.fillStyle = cols[i % cols.length];
      ctx.beginPath();
      ctx.roundRect(lx, ly, 10, 10, 3);
      ctx.fill();
      ctx.fillStyle = "#0f1a15";
      ctx.font = "12px system-ui";
      ctx.textAlign = "left";
      ctx.fillText(l + " — " + values[i] + " (" + pct + "%)", lx + 16, ly + 9);
      ly += 22;
    });
  }
  function drawLineChart(canvas, labels, values, colors) {
    var p = prepCanvas(canvas),
      ctx = p.ctx,
      W = p.w,
      H = p.h;
    var pad = { top: 16, right: 16, bottom: 30, left: 36 };
    var chartW = W - pad.left - pad.right,
      chartH = H - pad.top - pad.bottom;
    var max = Math.max.apply(null, values.concat([1])),
      min = Math.min.apply(null, values.concat([0]));
    var range = max - min || 1;
    ctx.strokeStyle = "#e3ebe5";
    ctx.lineWidth = 1;
    for (var i = 0; i <= 4; i++) {
      var y = pad.top + (chartH * i) / 4;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();
    }
    ctx.strokeStyle = (colors || PALETTE_DEFAULT)[0];
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    values.forEach(function (v, idx) {
      var x = pad.left + (chartW * idx) / Math.max(1, values.length - 1),
        y = pad.top + chartH * (1 - (v - min) / range);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    values.forEach(function (v, idx) {
      var x = pad.left + (chartW * idx) / Math.max(1, values.length - 1),
        y = pad.top + chartH * (1 - (v - min) / range);
      ctx.fillStyle = (colors || PALETTE_DEFAULT)[0];
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  function drawRadarChart(canvas, labels, values, colors) {
    var p = prepCanvas(canvas),
      ctx = p.ctx,
      W = p.w,
      H = p.h;
    var cx = W / 2,
      cy = H / 2,
      r = Math.min(W, H) * 0.38;
    var max = Math.max.apply(null, values.concat([1]));
    var n = labels.length;
    var cols = colors || PALETTE_DEFAULT;
    // grid
    ctx.strokeStyle = "#e3ebe5";
    ctx.lineWidth = 1;
    for (var level = 1; level <= 4; level++) {
      ctx.beginPath();
      for (var i = 0; i < n; i++) {
        var ang = -Math.PI / 2 + (Math.PI * 2 * i) / n;
        var rr = (r * level) / 4;
        var x = cx + Math.cos(ang) * rr,
          y = cy + Math.sin(ang) * rr;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }
    for (var i = 0; i < n; i++) {
      var ang = -Math.PI / 2 + (Math.PI * 2 * i) / n;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
      ctx.stroke();
    }
    // data
    ctx.fillStyle = cols[0] + "33";
    ctx.strokeStyle = cols[0];
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    values.forEach(function (v, i) {
      var ang = -Math.PI / 2 + (Math.PI * 2 * i) / n;
      var rr = (v / max) * r;
      var x = cx + Math.cos(ang) * rr,
        y = cy + Math.sin(ang) * rr;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // labels
    ctx.fillStyle = "#0f1a15";
    ctx.font = "11px system-ui";
    ctx.textAlign = "center";
    labels.forEach(function (l, i) {
      var ang = -Math.PI / 2 + (Math.PI * 2 * i) / n;
      var x = cx + Math.cos(ang) * (r + 14),
        y = cy + Math.sin(ang) * (r + 14);
      ctx.fillText(String(l).slice(0, 12), x, y);
    });
  }
  function drawHeatmap(canvas, labels, values, colors) {
    var p = prepCanvas(canvas),
      ctx = p.ctx,
      W = p.w,
      H = p.h;
    var pad = { top: 10, left: 110, right: 10, bottom: 30 };
    var chartW = W - pad.left - pad.right,
      chartH = H - pad.top - pad.bottom;
    var max = Math.max.apply(null, values.concat([1]));
    var rowH = chartH / (values.length || 1);
    values.forEach(function (v, i) {
      var intensity = v / max;
      var r = 18 + Math.round((227 - 18) * (1 - intensity));
      var g = 58 + Math.round((200 - 58) * intensity);
      var b = 46 + Math.round((120 - 46) * intensity);
      ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
      // actually invert: use brand color opacity
      ctx.globalAlpha = 0.2 + 0.8 * intensity;
      ctx.fillRect(pad.left, pad.top + i * rowH, chartW, rowH * 0.8);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#0f1a15";
      ctx.font = "12px system-ui";
      ctx.textAlign = "left";
      ctx.fillText(
        labels[i].slice(0, 22),
        pad.left - 100,
        pad.top + i * rowH + 14,
      );
      ctx.fillStyle = "#123a2e";
      ctx.font = "700 12px system-ui";
      ctx.textAlign = "right";
      ctx.fillText(v, pad.left + chartW - 6, pad.top + i * rowH + 16);
    });
  }
  function drawChart(canvas, type, labels, values, colors) {
    if (type === "hbar") return drawHBarChart(canvas, labels, values, colors);
    if (type === "donut")
      return drawPieLike(canvas, labels, values, true, colors);
    if (type === "pie")
      return drawPieLike(canvas, labels, values, false, colors);
    if (type === "line") return drawLineChart(canvas, labels, values, colors);
    if (type === "radar") return drawRadarChart(canvas, labels, values, colors);
    if (type === "heatmap") return drawHeatmap(canvas, labels, values, colors);
    return drawBarChart(canvas, labels, values, colors);
  }

  function analyzeQuestion(question, responses) {
    var name = question.name,
      type = question.type;
    var values = responses
      .map(function (r) {
        return r[name];
      })
      .filter(function (v) {
        return v !== undefined && v !== null && v !== "";
      });
    var result = { count: values.length, type: type, question: question };
    if (
      [
        "radiogroup",
        "dropdown",
        "boolean",
        "rating",
        "scale",
        "emojis",
        "imagechoice",
        "checkbox",
        "radiogroup",
      ].indexOf(type) !== -1
    ) {
      var map = {};
      values.forEach(function (v) {
        (Array.isArray(v) ? v : [v]).forEach(function (x) {
          var k = String(x);
          map[k] = (map[k] || 0) + 1;
        });
      });
      var labels = Object.keys(map);
      var counts = labels.map(function (k) {
        return map[k];
      });
      var labelText = labels.map(function (l) {
        var found = (question.choices || []).find(function (c) {
          return String(getChoiceValue(c)) === l;
        });
        if (found) return getChoiceText(found);
        if (l === "true") return question.labelTrue || "Sí";
        if (l === "false") return question.labelFalse || "No";
        return l;
      });
      result.labels = labelText;
      result.rawLabels = labels;
      result.values = counts;
      result.map = map;
      var nums = values.map(Number).filter(function (n) {
        return !isNaN(n);
      });
      if (nums.length) {
        result.avg = avg(nums).toFixed(2);
        result.min = Math.min.apply(null, nums);
        result.max = Math.max.apply(null, nums);
      }
    } else if (["slider", "number", "nps"].indexOf(type) !== -1) {
      var nums2 = values.map(Number).filter(function (n) {
        return !isNaN(n);
      });
      result.avg = nums2.length ? avg(nums2).toFixed(2) : 0;
      result.min = nums2.length ? Math.min.apply(null, nums2) : 0;
      result.max = nums2.length ? Math.max.apply(null, nums2) : 0;
      var map2 = {};
      nums2.forEach(function (n) {
        var k = String(n);
        map2[k] = (map2[k] || 0) + 1;
      });
      var sortedKeys = Object.keys(map2).sort(function (a, b) {
        return Number(a) - Number(b);
      });
      result.labels = sortedKeys;
      result.values = sortedKeys.map(function (k) {
        return map2[k];
      });
    } else {
      result.textValues = values.slice(0, 100);
    }
    return result;
  }

  function AuraSurveyDashboard(target, options) {
    this.host =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!this.host)
      throw new Error("AuraSurveyDashboard: contenedor no encontrado");
    this.options = options || {};
    this.tier = (
      this.options.tier ||
      this.options.license ||
      "pro"
    ).toLowerCase(); // 'basic' | 'pro' | 'indie' | 'business'
    if (this.tier === "indie") this.tier = "basic";
    if (this.tier === "business") this.tier = "pro";
    this.isPro = this.tier === "pro";
    this.brandColors = this.options.brandColors || PALETTE_DEFAULT;
    this.displayMode = this.options.displayMode || "count"; // count | percent
    this.schema = clone(
      this.options.schema || { title: "Dashboard", pages: [] },
    );
    this.responses = clone(this.options.responses || []);
    this.chartPrefs = {};
    this.currentFilter = "";
    this.compare = { q: "", value: "" }; // for pro cross-filter
    this.render();
  }
  AuraSurveyDashboard.prototype.setResponses = function (r) {
    this.responses = clone(r || []);
    this.render();
    return this;
  };
  AuraSurveyDashboard.prototype.setSchema = function (s) {
    this.schema = clone(s || {});
    this.render();
    return this;
  };
  AuraSurveyDashboard.prototype.getStats = function () {
    var qs = getAllQuestions(this.schema.pages || []);
    return {
      total: this.responses.length,
      questions: qs.length,
      avgCompletion: this.responses.length
        ? (
            (this.responses.filter(function (r) {
              return Object.keys(r).length >= qs.length * 0.8;
            }).length /
              this.responses.length) *
            100
          ).toFixed(0)
        : 0,
    };
  };
  AuraSurveyDashboard.prototype.exportPDF = function () {
    if (!this.isPro) {
      alert(
        "Exportar PDF es solo Business (PRO). Actualiza tu licencia en aurasurvey.lemonsqueezy.com",
      );
      return;
    }
    var self = this;
    var canvases = this.host.querySelectorAll("canvas");
    var images = {};
    canvases.forEach(function (c) {
      try {
        images[c.dataset.chart] = c.toDataURL("image/png");
      } catch (e) {}
    });
    var win = global.open("", "_blank");
    if (!win) {
      alert("Permite popups para exportar PDF");
      return;
    }
    var qs = getAllQuestions(this.schema.pages || []);
    var filtered = qs.filter(function (q) {
      return !self.currentFilter || q.name === self.currentFilter;
    });
    var html =
      '<!doctype html><html><head><meta charset="utf-8"><title>' +
      escapeHtml(this.schema.title || "Dashboard") +
      " PDF</title>";
    html +=
      "<style>body{font-family:system-ui,sans-serif;padding:24px;color:#0f1a15} h1{font-size:28px;letter-spacing:-.02em} h2{font-size:16px;margin-top:28px;border-bottom:1px solid #e3ebe5;padding-bottom:6px} img{max-width:100%;border:1px solid #e3ebe5;border-radius:12px;display:block} table{width:100%;border-collapse:collapse;margin-top:10px} th,td{border:1px solid #e3ebe5;padding:8px;text-align:left;font-size:12px} th{background:#123a2e;color:#fff} .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px} @media print{.no-print{display:none} @page{margin:14mm} .grid{grid-template-columns:1fr 1fr}} @media(max-width:700px){.grid{grid-template-columns:1fr}}</style></head><body>";
    html +=
      "<h1>" +
      escapeHtml(this.schema.title || "Dashboard") +
      " <small style='color:#7a8a82'>PRO</small></h1><p>Total respuestas: " +
      this.responses.length +
      " | Filtro: " +
      escapeHtml(self.currentFilter || "Todas") +
      " | Generado: " +
      new Date().toLocaleString() +
      "</p>";
    html += '<div class="grid">';
    filtered.forEach(function (q) {
      var analysis = analyzeQuestion(q, self.responses);
      html +=
        '<div style="border:1px solid #e3ebe5;border-radius:14px;padding:14px;break-inside:avoid">';
      html +=
        '<h2 style="margin:0 0 8px 0">' +
        escapeHtml(q.title || q.name) +
        '</h2><small style="color:#7a8a82">' +
        q.type +
        " • " +
        analysis.count +
        " resp." +
        (analysis.avg !== undefined ? " • Prom: " + analysis.avg : "") +
        "</small><br><br>";
      if (images[q.name]) html += '<img src="' + images[q.name] + '"><br>';
      if (analysis.labels) {
        html += "<table><tr><th>Opción</th><th>#</th><th>%</th></tr>";
        analysis.labels.forEach(function (l, i) {
          var pct = self.responses.length
            ? Math.round((analysis.values[i] / self.responses.length) * 100)
            : 0;
          html +=
            "<tr><td>" +
            escapeHtml(l) +
            "</td><td>" +
            analysis.values[i] +
            "</td><td>" +
            pct +
            "%</td></tr>";
        });
        html += "</table>";
      }
      html += "</div>";
    });
    html +=
      '</div><br><button class="no-print" onclick="window.print()" style="padding:12px 18px;border-radius:999px;border:0;background:#123a2e;color:#fff;cursor:pointer;font-weight:700">Imprimir / Guardar como PDF</button>';
    html +=
      "<script>setTimeout(()=>window.print(),600)<\/script></body></html>";
    win.document.write(html);
    win.document.close();
  };

  AuraSurveyDashboard.prototype.render = function () {
    var self = this;
    var stats = this.getStats();
    var questions = getAllQuestions(this.schema.pages || []);
    this.host.classList.add("aura-dashboard-host");
    var tierBadge = this.isPro
      ? '<span style="background:#123a2e;color:#fff;border-radius:999px;padding:4px 10px;font:700 10px Space Grotesk;letter-spacing:.8px">BUSINESS • PRO</span>'
      : '<span style="background:#e36f55;color:#fff;border-radius:999px;padding:4px 10px;font:700 10px Space Grotesk;letter-spacing:.8px">INDIE • BASIC</span>';
    var upgradeBanner = this.isPro
      ? ""
      : '<div style="margin:14px 0;padding:12px 16px;border:1px dashed #e36f55;background:#fff5f2;border-radius:12px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><div><b style="color:#e36f55">Estás en BASIC</b> — Solo barras y torta. Para presentar a clientes necesitas PRO: dona, línea, radar, heatmap, PDF y filtros cruzados.<br><small style="color:#7a8a82">Exportar PDF, colores de marca y Comparar están bloqueados.</small></div><a href="https://aurasurvey.lemonsqueezy.com/checkout/buy/bd66f21c-d1b0-4a59-b04c-b2234d8dfabc" target="_blank" style="background:#123a2e;color:#fff;padding:8px 14px;border-radius:999px;font:700 12px system-ui;text-decoration:none;white-space:nowrap">Upgrade a Business — $159 →</a></div>';

    // toolbar pro controls
    var proControls = "";
    if (this.isPro) {
      proControls =
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-left:8px">' +
        '<label style="margin-left:30px;font:600 11px system-ui;color:#7a8a82">MARCA</label><input type="color" data-brand-color="0" value="' +
        (this.brandColors[0] || "#123a2e") +
        '" style="width:28px;height:28px;border-radius:999px;border:1px solid #e3ebe5;padding:2px">' +
        '<input type="color" data-brand-color="1" value="' +
        (this.brandColors[1] || "#e36f55") +
        '" style="width:28px;height:28px;border-radius:999px;border:1px solid #e3ebe5;padding:2px">' +
        '<select data-display-mode style="padding:8px 12px;border-radius:999px;border:1px solid #dce4df;font:600 12px system-ui;background:#fff"><option value="count" ' +
        (this.displayMode === "count" ? "selected" : "") +
        '># Absoluto</option><option value="percent" ' +
        (this.displayMode === "percent" ? "selected" : "") +
        ">% Porcentaje</option></select>" +
        "</div>";
    }

    this.host.innerHTML =
      '<div class="aura-dashboard"><header class="aura-dash-header" style="display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap"><div><span class="aura-dash-kicker" style="display:flex;gap:8px;align-items:center">AURA / DASHBOARD • OFFLINE • ' +
      tierBadge +
      '</span><h1 style="margin:8px 0 4px">' +
      escapeHtml(this.schema.title || "Resultados") +
      '</h1><p style="color:#7a8a82;margin:0">' +
      escapeHtml(this.schema.description || "Análisis elegante, 100% offline") +
      '</p></div><div class="aura-dash-actions" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
      (this.isPro
        ? '<button class="aura-dash-btn green" data-act="pdf" style="padding:10px 16px;border-radius:999px;border:0;background:#123a2e;color:#fff;font:700 13px system-ui;cursor:pointer">⬇ Exportar PDF</button>'
        : '<button class="aura-dash-btn" data-act="pdf-locked" style="padding:10px 16px;border-radius:999px;border:1px dashed #e36f55;background:#fff5f2;color:#e36f55;font:700 13px system-ui;cursor:pointer" title="Solo Business">🔒 PDF solo PRO</button>') +
      "</div></header>" +
      upgradeBanner +
      '<div class="aura-dash-stats" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:14px 0"><div class="aura-dash-stat" style="background:#fff;border:1px solid #e3ebe5;border-radius:14px;padding:12px 14px"><b style="display:block;font-size:22px">' +
      stats.total +
      '</b><span style="font:700 10px system-ui;color:#7a8a82">TOTAL RESPUESTAS</span></div><div class="aura-dash-stat" style="background:#fff;border:1px solid #e3ebe5;border-radius:14px;padding:12px 14px"><b style="display:block;font-size:22px">' +
      questions.length +
      '</b><span style="font:700 10px system-ui;color:#7a8a82">PREGUNTAS</span></div><div class="aura-dash-stat" style="background:#fff;border:1px solid #e3ebe5;border-radius:14px;padding:12px 14px"><b style="display:block;font-size:22px">' +
      stats.avgCompletion +
      '%</b><span style="font:700 10px system-ui;color:#7a8a82">COMPLETADO</span></div><div class="aura-dash-stat" style="background:#fff;border:1px solid #e3ebe5;border-radius:14px;padding:12px 14px"><b style="display:block;font-size:22px">' +
      (questions.length ? stats.total * questions.length : 0) +
      '</b><span style="font:700 10px system-ui;color:#7a8a82">DATOS</span></div></div>' +
      '<div class="aura-dash-toolbar" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:10px 0">' +
      '<div class="aura-dash-filter-wrap" style="position:relative;min-width:280px"><div class="aura-autocomplete" data-autocomplete="dash-filter" style="width:100%"><input id="aura-dash-search" class="aura-dash-filter-input" placeholder="🔍 Filtrar por pregunta..." autocomplete="off" style="width:100%;padding:10px 14px;border:1px solid #dce4df;border-radius:999px;outline:0;font:500 13px system-ui;background:#fff"><div class="aura-autocomplete-list" data-autocomplete-list hidden style="position:absolute;top:110%;left:0;right:0;z-index:20;background:#fff;border:1px solid #dce4df;border-radius:12px;box-shadow:0 12px 30px rgba(15,26,21,.12);max-height:280px;overflow:auto;padding:6px"></div></div></div>' +
      '<button class="aura-dash-btn" data-act="clear-filter" style="margin-left:30px;display:none;padding:8px 12px;border-radius:999px;border:1px solid #dce4df;background:#fff;font:600 12px system-ui;cursor:pointer">✕ Limpiar</button>' +
      proControls +
      (self.isPro
        ? '<div style="display:flex;gap:8px;align-items:center;margin-left:auto"><label style="font:700 10px system-ui;color:#7a8a82">COMPARAR:</label><select data-compare-q style="padding:8px 10px;border-radius:999px;border:1px solid #dce4df;font:600 12px system-ui;max-width:180px"><option value="">Sin comparar</option>' +
          questions
            .map(function (q) {
              return (
                '<option value="' +
                escapeHtml(q.name) +
                '" ' +
                (self.compare.q === q.name ? "selected" : "") +
                ">" +
                escapeHtml((q.title || q.name).slice(0, 20)) +
                "</option>"
              );
            })
            .join("") +
          '</select><select data-compare-v style="padding:8px 10px;border-radius:999px;border:1px solid #dce4df;font:600 12px system-ui;max-width:140px"><option value="">Valor...</option></select></div>'
        : "") +
      '</div><div class="aura-dash-body" id="aura-dash-body" style="display:grid;grid-template-columns:1fr 1fr;gap:14px"></div></div>';

    this.host.querySelector('[data-act="pdf"]').onclick = function () {
      self.exportPDF();
    };
    var lockedBtn = this.host.querySelector('[data-act="pdf-locked"]');
    if (lockedBtn)
      lockedBtn.onclick = function () {
        self.exportPDF();
      };
    var clearBtn = this.host.querySelector('[data-act="clear-filter"]');
    var body = this.host.querySelector("#aura-dash-body");
    var input = this.host.querySelector("#aura-dash-search");
    var list = this.host.querySelector("[data-autocomplete-list]");

    // brand color handlers
    this.host.querySelectorAll("[data-brand-color]").forEach(function (inp) {
      inp.onchange = function () {
        var idx = parseInt(inp.dataset.brandColor, 10);
        self.brandColors[idx] = inp.value;
        renderList();
      };
    });
    var dispSel = this.host.querySelector("[data-display-mode]");
    if (dispSel)
      dispSel.onchange = function () {
        self.displayMode = this.value;
        renderList();
      };

    // compare handlers
    var compQ = this.host.querySelector("[data-compare-q]");
    var compV = this.host.querySelector("[data-compare-v]");
    function refreshCompareValues() {
      if (!compQ || !compV) return;
      var qName = compQ.value;
      self.compare.q = qName;
      if (!qName) {
        compV.innerHTML = '<option value="">Valor...</option>';
        self.compare.value = "";
        renderList();
        return;
      }
      var q = questions.find(function (x) {
        return x.name === qName;
      });
      if (!q) {
        return;
      }
      // get distinct values for that question
      var map = {};
      self.responses.forEach(function (r) {
        var v = r[qName];
        if (v === undefined || v === null || v === "") return;
        (Array.isArray(v) ? v : [v]).forEach(function (x) {
          map[String(x)] = (map[String(x)] || 0) + 1;
        });
      });
      var opts = Object.keys(map);
      compV.innerHTML =
        '<option value="">Valor...</option>' +
        opts
          .map(function (v) {
            var txt = (q.choices || []).find(function (c) {
              return String(getChoiceValue(c)) === v;
            });
            var label = txt ? getChoiceText(txt) : v;
            return (
              '<option value="' +
              escapeHtml(v) +
              '" ' +
              (self.compare.value === v ? "selected" : "") +
              ">" +
              escapeHtml(String(label).slice(0, 24)) +
              " (" +
              map[v] +
              ")</option>"
            );
          })
          .join("");
    }
    if (compQ) {
      compQ.onchange = function () {
        refreshCompareValues();
      };
    }
    if (compV) {
      compV.onchange = function () {
        self.compare.value = this.value;
        renderList();
      };
    }
    refreshCompareValues();

    function getChartTypeFor(q) {
      var def =
        q.type === "boolean" ? "donut" : q.type === "checkbox" ? "hbar" : "bar";
      var pref = self.chartPrefs[q.name] || def;
      if (!self.isPro) {
        // BASIC only bar/pie
        if (["bar", "pie"].indexOf(pref) === -1) pref = "bar";
      }
      return pref;
    }

    function buildFilterOptions(filterText) {
      var ft = (filterText || "").toLowerCase().trim();
      var opts = [
        { value: "", text: "📊 Todas (" + questions.length + ")" },
      ].concat(
        questions.map(function (q) {
          return {
            value: q.name,
            text: q.title || q.name,
            sub: q.type + " • " + q.name,
          };
        }),
      );
      var filtered = opts.filter(function (o) {
        if (!ft) return true;
        if (o.value === "") return true;
        return (
          o.text.toLowerCase().indexOf(ft) !== -1 ||
          o.value.toLowerCase().indexOf(ft) !== -1 ||
          (o.sub && o.sub.toLowerCase().indexOf(ft) !== -1)
        );
      });
      list.innerHTML = filtered
        .map(function (o) {
          return (
            '<button type="button" data-option-value="' +
            escapeHtml(o.value) +
            '" data-option-text="' +
            escapeHtml(o.text) +
            '" style="width:100%;text-align:left;padding:10px 12px;border:0;background:#fff;border-radius:8px;cursor:pointer;display:flex;justify-content:space-between;gap:10px;align-items:center"><span><b style="font-size:13px">' +
            escapeHtml(o.text) +
            "</b>" +
            (o.sub
              ? '<br><small style="color:#7a8a82">' +
                escapeHtml(o.sub) +
                "</small>"
              : "") +
            '</span><span style="color:#123a2e;font-size:12px">' +
            (o.value === self.currentFilter ? "●" : "") +
            "</span></button>"
          );
        })
        .join("");
      if (filtered.length) list.hidden = false;
      else list.hidden = true;
      list.querySelectorAll("[data-option-value]").forEach(function (btn) {
        btn.onclick = function (e) {
          e.preventDefault();
          e.stopPropagation();
          var val = btn.dataset.optionValue;
          var txt = btn.dataset.optionText;
          self.currentFilter = val;
          input.value = val === "" ? "" : txt;
          list.hidden = true;
          clearBtn.style.display = val ? "inline-flex" : "none";
          renderList();
        };
        btn.onmouseenter = function () {
          btn.style.background = "#f1f6f1";
        };
        btn.onmouseleave = function () {
          btn.style.background = "#fff";
        };
      });
    }
    input.addEventListener("focus", function () {
      buildFilterOptions(input.value);
    });
    input.addEventListener("input", function () {
      buildFilterOptions(input.value);
      if (!input.value) {
        self.currentFilter = "";
        clearBtn.style.display = "none";
        renderList();
      }
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") list.hidden = true;
      if (e.key === "Enter") {
        var first = list.querySelector("[data-option-value]");
        if (first) {
          first.click();
          e.preventDefault();
        }
      }
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest("[data-autocomplete='dash-filter']"))
        list.hidden = true;
    });
    clearBtn.onclick = function () {
      self.currentFilter = "";
      input.value = "";
      clearBtn.style.display = "none";
      list.hidden = true;
      renderList();
    };

    function renderList() {
      body.innerHTML = "";
      if (!self.responses.length) {
        body.innerHTML =
          '<div class="aura-dash-empty" style="grid-column:1/-1;background:#fff;border:1px solid #e3ebe5;border-radius:14px;padding:20px;color:#7a8a82">Aún no hay respuestas. Usa <code>setResponses([...])</code></div>';
        return;
      }
      var toShow = questions;
      if (self.currentFilter)
        toShow = questions.filter(function (q) {
          return q.name === self.currentFilter;
        });
      // apply compare filter if pro
      var baseResponses = self.responses;
      var filteredResponses = baseResponses;
      if (self.isPro && self.compare.q && self.compare.value) {
        filteredResponses = baseResponses.filter(function (r) {
          var v = r[self.compare.q];
          if (v === undefined || v === null) return false;
          var arr = Array.isArray(v) ? v.map(String) : [String(v)];
          return arr.indexOf(String(self.compare.value)) !== -1;
        });
      }

      toShow.forEach(function (q) {
        var analysis = analyzeQuestion(q, filteredResponses);
        var currentType = getChartTypeFor(q);
        var card = document.createElement("div");
        card.className = "aura-dash-card";
        card.style.cssText =
          "background:#fff;border:1px solid #e3ebe5;border-radius:16px;padding:16px";
        var allowed = self.isPro
          ? ["bar", "hbar", "donut", "pie", "line", "radar", "heatmap"]
          : ["bar", "pie"];
        var optionsHtml =
          '<select class="aura-chart-select" data-chart-type="' +
          q.name +
          '" style="padding:6px 10px;border-radius:999px;border:1px solid #dce4df;font:600 11px system-ui;background:#fff">';
        allowed.forEach(function (t) {
          var label =
            {
              bar: "Barras",
              hbar: "Horiz.",
              donut: "Dona",
              pie: "Torta",
              line: "Línea",
              radar: "Radar",
              heatmap: "Heatmap",
            }[t] || t;
          var lock =
            !self.isPro &&
            ["donut", "hbar", "line", "radar", "heatmap"].indexOf(t) !== -1
              ? " 🔒"
              : "";
          optionsHtml +=
            '<option value="' +
            t +
            '" ' +
            (currentType === t ? "selected" : "") +
            (lock ? " disabled" : "") +
            ">" +
            label +
            lock +
            "</option>";
        });
        optionsHtml += "</select>";
        if (!self.isPro) {
          optionsHtml +=
            ' <small style="color:#e36f55;font:700 10px system-ui">BASIC: solo barra/torta</small>';
        }
        var compareInfo =
          self.isPro && self.compare.q && self.compare.value
            ? '<div style="margin-top:6px;padding:6px 10px;background:#f1f6f1;border-radius:999px;display:inline-block;font:600 11px system-ui;color:#123a2e">Filtrado: ' +
              escapeHtml(self.compare.q) +
              " = " +
              escapeHtml(self.compare.value) +
              " (" +
              filteredResponses.length +
              "/" +
              baseResponses.length +
              ")</div>"
            : "";
        var head =
          '<div class="aura-dash-card-head" style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><div><h3 style="margin:0;font:700 14px Space Grotesk">' +
          escapeHtml(q.title || q.name) +
          '</h3><small style="color:#7a8a82">' +
          escapeHtml(q.type) +
          " • " +
          q.name +
          " • " +
          analysis.count +
          " respuestas" +
          (analysis.avg !== undefined ? " • Prom: " + analysis.avg : "") +
          "</small>" +
          compareInfo +
          '</div><div class="aura-dash-card-controls">' +
          (analysis.labels ? optionsHtml : "") +
          "</div></div>";
        var content = "";
        if (analysis.labels && analysis.labels.length) {
          content +=
            '<canvas class="aura-dash-canvas" data-chart="' +
            q.name +
            '" style="width:100%;height:220px;margin-top:10px"></canvas><div class="aura-dash-bar" style="margin-top:10px;display:grid;gap:6px">';
          analysis.labels.forEach(function (label, i) {
            var val = analysis.values[i];
            var pct = self.responses.length
              ? Math.round((val / filteredResponses.length) * 100)
              : 0;
            var displayVal =
              self.displayMode === "percent"
                ? pct + "%"
                : val + " (" + pct + "%)";
            return (content +=
              '<div class="aura-dash-bar-row" style="display:flex;gap:8px;align-items:center"><span style="flex:1;font:500 12px system-ui;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' +
              escapeHtml(label) +
              '</span><b style="font:700 12px system-ui">' +
              displayVal +
              '</b><div class="aura-dash-bar-track" style="width:60px;height:6px;background:#e9f3ec;border-radius:999px;overflow:hidden"><div class="aura-dash-bar-fill" style="width:' +
              pct +
              "%;height:100%;background:" +
              (self.brandColors[i % self.brandColors.length] || "#123a2e") +
              '"></div></div></div>');
          });
          // fix for loop above using forEach return not work, rebuild
        }
        // rebuild bar rows correctly
        if (analysis.labels && analysis.labels.length) {
          var rows = "";
          analysis.labels.forEach(function (label, i) {
            var val = analysis.values[i];
            var pct = filteredResponses.length
              ? Math.round((val / filteredResponses.length) * 100)
              : 0;
            var disp =
              self.displayMode === "percent"
                ? pct + "%"
                : val + " (" + pct + "%)";
            rows +=
              '<div style="display:flex;gap:8px;align-items:center"><span style="flex:1;font:500 12px system-ui;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' +
              escapeHtml(label) +
              '</span><b style="font:700 12px system-ui">' +
              disp +
              '</b><div style="width:60px;height:6px;background:#e9f3ec;border-radius:999px;overflow:hidden"><div style="width:' +
              pct +
              "%;height:100%;background:" +
              (self.brandColors[i % self.brandColors.length] || "#123a2e") +
              '"></div></div></div>';
          });
          content =
            '<canvas class="aura-dash-canvas" data-chart="' +
            q.name +
            '" style="width:100%;height:220px;margin-top:10px"></canvas><div style="margin-top:10px;display:grid;gap:6px">' +
            rows +
            "</div>";
          if (
            self.isPro === false &&
            filteredResponses.length !== baseResponses.length
          ) {
            /* basic should not have compare, but ignore */
          }
        } else if (analysis.textValues) {
          content =
            '<div class="aura-dash-text-list" style="margin-top:10px;display:grid;gap:6px;max-height:220px;overflow:auto">' +
            analysis.textValues
              .slice(0, 30)
              .map(function (t) {
                return (
                  '<div style="padding:8px 10px;background:#fbfdfb;border:1px solid #e3ebe5;border-radius:8px;font:400 12px system-ui">' +
                  escapeHtml(String(t).slice(0, 240)) +
                  "</div>"
                );
              })
              .join("") +
            "</div>";
        } else {
          content =
            '<div class="aura-dash-empty" style="color:#7a8a82;padding:12px">Sin datos graficables</div>';
        }
        card.innerHTML = head + content;
        body.appendChild(card);
        var canvas = card.querySelector('[data-chart="' + q.name + '"]');
        if (canvas && analysis.labels) {
          drawChart(
            canvas,
            currentType,
            analysis.labels,
            analysis.values,
            self.brandColors,
          );
        }
        var sel = card.querySelector('[data-chart-type="' + q.name + '"]');
        if (sel) {
          sel.onchange = function () {
            self.chartPrefs[q.name] = sel.value;
            renderList();
          };
        }
      });
      if (!body.children.length) {
        body.innerHTML =
          '<div class="aura-dash-empty" style="grid-column:1/-1;background:#fff;border:1px solid #e3ebe5;border-radius:14px;padding:20px">Sin resultados para "' +
          escapeHtml(self.currentFilter) +
          '"</div>';
      }
    }
    renderList();
    buildFilterOptions("");
  };
  AuraSurveyDashboard.prototype.destroy = function () {
    if (this.host) this.host.innerHTML = "";
  };
  global.AuraSurveyDashboard = AuraSurveyDashboard;
  global.AuraSurveyDashboard.version = VERSION;
})(window);
