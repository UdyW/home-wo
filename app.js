(function () {
  "use strict";
  var KEY = "homegym-v1";
  var $ = function (s) { return document.querySelector(s); };
  var app = $("#app");
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function uid() { return Math.random().toString(36).slice(2, 9); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  }

  // ---------- storage ----------
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && Array.isArray(s.workouts) && s.workouts.length) {
          s.sessions = s.sessions || [];
          s.drafts = s.drafts || {};
          migrate(s);
          return s;
        }
      }
    } catch (e) { /* fall through to defaults */ }
    return { workouts: clone(window.DEFAULT_WORKOUTS), sessions: [], drafts: {}, planVersion: window.DEFAULT_PLAN_VERSION || 1 };
  }
  // Adds default workout days the user doesn't have yet. Never changes days they already have.
  function migrate(s) {
    var target = window.DEFAULT_PLAN_VERSION || 1;
    if ((s.planVersion || 1) >= target) return;
    var have = {};
    s.workouts.forEach(function (w) { have[w.id] = true; });
    window.DEFAULT_WORKOUTS.forEach(function (w) { if (!have[w.id]) s.workouts.push(clone(w)); });
    s.planVersion = target;
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* saved on next change */ }
  }
  function weekOrder(w) { return w.weekday === "" || w.weekday == null ? 99 : (Number(w.weekday) + 6) % 7; }
  function orderedWorkouts() { return state.workouts.slice().sort(function (a, b) { return weekOrder(a) - weekOrder(b); }); }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { toast("Couldn't save on this device. Export a backup from Edit plan."); }
  }

  var state = load();
  var view = "today";
  var today = new Date().getDay();
  var currentId = (state.workouts.find(function (w) { return Number(w.weekday) === today; }) || state.workouts[0]).id;

  function W() { return state.workouts.find(function (w) { return w.id === currentId; }) || state.workouts[0]; }
  function sortedSessions() { return state.sessions.slice().sort(function (a, b) { return b.date.localeCompare(a.date); }); }
  function lastEntry(exId) {
    var ss = sortedSessions();
    for (var i = 0; i < ss.length; i++) {
      var e = ss[i].entries[exId];
      if (e && e.some(function (x) { return x.done; })) return { date: ss[i].date, sets: e };
    }
    return null;
  }
  function getDraft(w) {
    var d = state.drafts[w.id];
    if (!d) { d = { started: new Date().toISOString(), entries: {}, notes: "" }; state.drafts[w.id] = d; }
    w.exercises.forEach(function (ex) {
      var arr = d.entries[ex.id];
      if (!arr) {
        var last = lastEntry(ex.id);
        arr = d.entries[ex.id] = [];
        for (var i = 0; i < ex.sets; i++) {
          var prev = last && (last.sets[i] || last.sets[0]);
          arr.push({ kg: prev ? prev.kg : "", reps: ex.target, done: false });
        }
      }
      while (arr.length < ex.sets) arr.push({ kg: arr.length ? arr[arr.length - 1].kg : "", reps: ex.target, done: false });
      if (arr.length > ex.sets) arr.length = ex.sets;
    });
    return d;
  }
  function unitWord(ex) { return ex.unit === "sec" ? "sec" : ex.unit === "min" ? "min" : "reps"; }

  // ---------- day bar & nav ----------
  function renderDaybar() {
    var bar = $("#daybar");
    if (view === "history") { bar.innerHTML = ""; return; }
    bar.innerHTML = orderedWorkouts().map(function (w) {
      var sel = w.id === currentId, name = w.dayLabel || w.title || "Day";
      var short = /day$/i.test(name) ? name.slice(0, 3) : name;
      return '<button role="tab" data-day="' + esc(w.id) + '" aria-selected="' + sel + '" aria-label="' + esc(name) + '"' +
        (Number(w.weekday) === today && w.weekday !== "" ? ' class="is-today"' : "") + ">" + esc(short) + "</button>";
    }).join("");
  }
  function render() {
    document.querySelectorAll(".views button").forEach(function (b) {
      if (b.dataset.view === view) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
    renderDaybar();
    if (view === "today") renderToday();
    else if (view === "history") renderHistory();
    else renderEdit();
  }

  // ---------- workout (logging) ----------
  function renderRestDay(w) {
    var h = '<section class="hero"><p class="day">' + esc(w.dayLabel) + "</p><h2>" + esc(w.title) + "</h2>" +
      '<p class="sub">' + esc(w.summary) + "</p></section>";
    if (w.warmup && w.warmup.length) {
      h += '<div class="closing"><p><b>Gentle options for today</b></p><ul class="warm">' +
        w.warmup.map(function (r) { return "<li><b>" + esc(r[0]) + " (" + esc(r[1]) + ")</b><span>" + esc(r[2] || "") + "</span></li>"; }).join("") +
        "</ul></div>";
    }
    var next = orderedWorkouts().filter(function (x) { return !x.restDay && x.exercises.length; })[0];
    if (next) h += '<p class="empty">Nothing to log today. Your week starts again with ' + esc(next.dayLabel) + " " + esc(next.title) + ".</p>";
    app.innerHTML = h;
  }
  function renderToday() {
    var w = W();
    if (w.restDay) { renderRestDay(w); return; }
    var d = getDraft(w);
    var total = 0, done = 0, dots = "";
    w.exercises.forEach(function (ex) {
      d.entries[ex.id].forEach(function (s) { total++; if (s.done) done++; dots += '<i class="' + (s.done ? "on" : "") + '"></i>'; });
    });
    var h = '<section class="hero"><p class="day">' + esc(w.dayLabel) + "</p><h2>" + esc(w.title) + "</h2>" +
      '<p class="sub">' + esc(w.summary) + "</p>" +
      '<div class="meter" aria-hidden="true">' + dots + "</div>" +
      '<p class="count">' + done + " of " + total + " sets done</p></section>";

    if (w.warmup && w.warmup.length) {
      h += '<details class="block"><summary>Warm-up</summary><ul class="warm">' +
        w.warmup.map(function (r) { return "<li><b>" + esc(r[0]) + " (" + esc(r[1]) + ")</b><span>" + esc(r[2] || "") + "</span></li>"; }).join("") +
        "</ul></details>";
    }

    w.exercises.forEach(function (ex, i) {
      var sets = d.entries[ex.id];
      var last = lastEntry(ex.id);
      var lastTxt = "", hint = "";
      if (last) {
        var doneSets = last.sets.filter(function (s) { return s.done; });
        var kgs = doneSets.map(function (s) { return s.kg; }).filter(function (k) { return k !== ""; });
        lastTxt = '<p class="last">Last time: ' + (kgs.length ? esc(kgs[0]) + " kg, " : "") +
          doneSets.map(function (s) { return esc(s.reps); }).join(", ") + " " + unitWord(ex) + "</p>";
        var hitAll = last.sets.length >= ex.sets && last.sets.every(function (s) { return s.done && Number(s.reps) >= Number(ex.target); });
        if (hitAll && ex.unit !== "min") hint = '<p class="hint">Every set hit target last time. Try 1\u20132 more ' + unitWord(ex) + " or the next weight.</p>";
      }
      h += '<article class="ex" data-ex="' + esc(ex.id) + '"><header><span class="num">' + (i + 1) + "</span><div>" +
        "<h3>" + esc(ex.name) + "</h3>" +
        '<p class="meta">' + (ex.sets > 1 ? ex.sets + " \u00d7 " : "") + esc(ex.label || ex.target) + (Number(ex.rest) ? ", " + ex.rest + " s rest" : "") + ". " + esc(ex.equipment || "") + "</p>" +
        "</div></header>" + lastTxt + hint + '<div class="sets">';
      sets.forEach(function (s, j) {
        var setName = ex.sets > 1 ? "Set " + (j + 1) : (ex.unit === "min" ? "Done" : "Set 1");
        h += '<div class="set' + (ex.weighted === false ? " noweight" : "") + '"><span class="n">' + setName + "</span>" +
          (ex.weighted === false ? "" :
          '<label><input inputmode="decimal" data-f="kg" data-i="' + j + '" value="' + esc(s.kg) + '" placeholder="\u2013" aria-label="Set ' + (j + 1) + ' weight in kg"><span>kg</span></label>') +
          '<label><input inputmode="numeric" data-f="reps" data-i="' + j + '" value="' + esc(s.reps) + '" aria-label="Set ' + (j + 1) + " " + unitWord(ex) + '"><span>' + unitWord(ex) + "</span></label>" +
          '<button class="plate' + (s.done ? " on" : "") + '" data-action="toggle" data-i="' + j + '" aria-pressed="' + s.done + '" aria-label="Mark set ' + (j + 1) + ' done"></button></div>';
      });
      h += "</div>";
      if (ex.cue || ex.start) {
        h += '<details class="cue"><summary>How to do it</summary>' + (ex.cue ? "<p>" + esc(ex.cue) + "</p>" : "") +
          (ex.start ? "<p><b>Suggested start:</b> " + esc(ex.start) + "</p>" : "") + "</details>";
      }
      h += "</article>";
    });

    h += '<div class="closing">' + (w.finisher ? "<p><b>Finisher:</b> " + esc(w.finisher) + "</p>" : "") +
      (w.cooldown ? "<p><b>Cool-down:</b> " + esc(w.cooldown) + "</p>" : "") +
      '<label class="field"><span>Notes for today (how it felt, anything that hurt)</span><textarea data-notes>' + esc(d.notes) + "</textarea></label></div>" +
      '<div class="actions"><button class="btn primary" data-action="finish">Finish and save session</button>' +
      '<button class="btn danger" data-action="discard">Clear today\u2019s entries</button></div>';
    app.innerHTML = h;
  }

  // ---------- history ----------
  function sparkline(vals) {
    if (vals.length < 2) return '<svg aria-hidden="true"></svg>';
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals), rng = max - min || 1;
    var pts = vals.map(function (v, i) {
      return [(i / (vals.length - 1)) * 114 + 3, 29 - ((v - min) / rng) * 26];
    });
    var last = pts[pts.length - 1];
    return '<svg viewBox="0 0 120 32" aria-hidden="true"><polyline points="' + pts.map(function (p) { return p.join(","); }).join(" ") +
      '"/><circle cx="' + last[0] + '" cy="' + last[1] + '" r="3"/></svg>';
  }
  function renderHistory() {
    var ss = sortedSessions();
    if (!ss.length) {
      app.innerHTML = '<h2 class="section">History</h2><p class="empty">No sessions yet. Finish a workout and it will show up here, with your weights over time.</p>';
      return;
    }
    var h = '<h2 class="section">Progress</h2>';
    var chrono = ss.slice().reverse();
    state.workouts.forEach(function (w) {
      w.exercises.forEach(function (ex) {
        var vals = [];
        chrono.forEach(function (s) {
          var e = s.entries[ex.id]; if (!e) return;
          var kgs = e.filter(function (x) { return x.done && x.kg !== "" && !isNaN(Number(x.kg)); }).map(function (x) { return Number(x.kg); });
          if (kgs.length) vals.push(Math.max.apply(null, kgs));
        });
        if (!vals.length) return;
        var vs = vals.slice(-12);
        var diff = vs[vs.length - 1] - vs[0];
        h += '<div class="trend"><div>' + esc(ex.name) + "<small>" + esc(w.dayLabel) + ", " + vals.length + " session" + (vals.length > 1 ? "s" : "") + "</small></div>" +
          sparkline(vs) + '<div class="val">' + vs[vs.length - 1] + " kg<small>" + (diff > 0 ? "+" + diff : diff === 0 ? "same" : diff) + "</small></div></div>";
      });
    });
    h += '<h2 class="section">Sessions</h2>';
    ss.forEach(function (s) {
      var count = 0;
      Object.keys(s.entries).forEach(function (k) { count += s.entries[k].filter(function (x) { return x.done; }).length; });
      h += '<details class="session"><summary><b>' + esc(fmtDate(s.date)) + "</b> " + esc(s.title) + " <span>(" + count + " sets)</span></summary><ul>";
      Object.keys(s.entries).forEach(function (k) {
        var done = s.entries[k].filter(function (x) { return x.done; });
        if (!done.length) return;
        h += "<li>" + esc((s.names && s.names[k]) || k) + ": " +
          done.map(function (x) { return (x.kg !== "" ? esc(x.kg) + " kg \u00d7 " : "") + esc(x.reps); }).join(", ") + "</li>";
      });
      h += "</ul>" + (s.notes ? "<p>" + esc(s.notes) + "</p>" : "") +
        '<button class="btn small danger" data-action="delsession" data-id="' + esc(s.id) + '">Delete this session</button></details>';
    });
    app.innerHTML = h;
  }

  // ---------- edit ----------
  function field(label, attr, value, type) {
    if (type === "textarea") return '<label class="field"><span>' + label + "</span><textarea " + attr + ">" + esc(value) + "</textarea></label>";
    return '<label class="field"><span>' + label + '</span><input type="' + (type || "text") + '" ' + attr + ' value="' + esc(value) + '"></label>';
  }
  function renderEdit() {
    var w = W();
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var h = '<h2 class="section">Edit ' + esc(w.dayLabel) + "</h2>" +
      '<div class="grid">' + field("Day name", 'data-wf="dayLabel"', w.dayLabel) + field("Title", 'data-wf="title"', w.title) +
      '<label class="field"><span>Opens automatically on</span><select data-wf="weekday"><option value="">No day</option>' +
      days.map(function (d, i) { return '<option value="' + i + '"' + (String(w.weekday) === String(i) ? " selected" : "") + ">" + d + "</option>"; }).join("") +
      "</select></label>" +
      '<label class="field"><span>Type of day</span><select data-wf="restDay"><option value="no"' + (!w.restDay ? " selected" : "") + '>Training day</option><option value="yes"' + (w.restDay ? " selected" : "") + ">Rest day (nothing to log)</option></select></label></div>" +
      field("Summary", 'data-wf="summary"', w.summary) +
      field("Warm-up (one per line: movement | amount | note)", 'data-wf="warmup"', (w.warmup || []).map(function (r) { return r.join(" | "); }).join("\n"), "textarea") +
      field("Finisher", 'data-wf="finisher"', w.finisher) + field("Cool-down", 'data-wf="cooldown"', w.cooldown);

    h += '<h2 class="section">Exercises</h2>';
    w.exercises.forEach(function (ex, i) {
      var a = 'data-x="' + esc(ex.id) + '" data-xf=';
      h += '<div class="edit-ex"><div class="row"><strong>' + (i + 1) + ". " + esc(ex.name) + "</strong>" +
        '<button class="btn small" data-action="up" data-x="' + esc(ex.id) + '" aria-label="Move up">\u2191</button>' +
        '<button class="btn small" data-action="down" data-x="' + esc(ex.id) + '" aria-label="Move down">\u2193</button>' +
        '<button class="btn small danger" data-action="delex" data-x="' + esc(ex.id) + '">Remove</button></div>' +
        field("Name", a + '"name"', ex.name) +
        '<div class="grid">' + field("Sets", a + '"sets"', ex.sets, "number") + field("Target reps or seconds", a + '"target"', ex.target, "number") +
        '<label class="field"><span>Counted in</span><select ' + a + '"unit"><option value="reps"' + (ex.unit !== "sec" ? " selected" : "") + '>Reps</option><option value="sec"' + (ex.unit === "sec" ? " selected" : "") + '>Seconds</option><option value="min"' + (ex.unit === "min" ? " selected" : "") + ">Minutes</option></select></label>" +
        '<label class="field"><span>Weight box</span><select ' + a + '"weighted"><option value="yes"' + (ex.weighted !== false ? " selected" : "") + '>Show kg</option><option value="no"' + (ex.weighted === false ? " selected" : "") + ">No weight</option></select></label>" +
        field("Rest (seconds)", a + '"rest"', ex.rest, "number") + "</div>" +
        '<div class="grid">' + field("Shown as", a + '"label"', ex.label) + field("Equipment", a + '"equipment"', ex.equipment) + "</div>" +
        field("Suggested start", a + '"start"', ex.start) + field("How to do it", a + '"cue"', ex.cue, "textarea") + "</div>";
    });
    h += '<div class="actions"><button class="btn primary" data-action="addex">Add exercise</button></div>' +
      '<h2 class="section">Plan and data</h2><div class="actions">' +
      '<button class="btn" data-action="addworkout">Add a workout day</button>' +
      '<button class="btn danger" data-action="delworkout">Delete ' + esc(w.dayLabel) + "</button></div>" +
      '<p class="empty">Your data lives in this browser only. Export a backup now and then, and import it on another phone or computer.</p>' +
      '<div class="actions"><button class="btn" data-action="export">Export backup</button>' +
      '<label class="btn">Import backup<input type="file" accept="application/json" data-import hidden></label>' +
      '<button class="btn danger" data-action="resetplan">Restore original plan</button></div>';
    app.innerHTML = h;
  }

  // ---------- timer ----------
  var tEnd = 0, tTotal = 0, tInt = null, tHide = null;
  function startTimer(sec) {
    sec = Number(sec); if (!sec) return;
    clearTimeout(tHide);
    tTotal = sec; tEnd = Date.now() + sec * 1000;
    $("#timer").hidden = false; $("#tlabel").textContent = "Rest";
    clearInterval(tInt); tInt = setInterval(tick, 250); tick();
  }
  function tick() {
    var left = Math.max(0, Math.ceil((tEnd - Date.now()) / 1000));
    $("#tleft").textContent = Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0");
    $("#tfill").style.width = (100 - (left / tTotal) * 100) + "%";
    if (left <= 0) {
      clearInterval(tInt);
      $("#tlabel").textContent = "Rest done. Next set";
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      tHide = setTimeout(function () { $("#timer").hidden = true; }, 5000);
    }
  }
  $("#timer").addEventListener("click", function (e) {
    var t = e.target.dataset.t;
    if (t === "add") { tEnd += 15000; tTotal += 15; clearInterval(tInt); clearTimeout(tHide); tInt = setInterval(tick, 250); tick(); }
    if (t === "skip") { clearInterval(tInt); $("#timer").hidden = true; }
  });

  var toastT;
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }

  // ---------- events ----------
  document.querySelector(".views").addEventListener("click", function (e) {
    var v = e.target.dataset.view; if (!v) return; view = v; render(); window.scrollTo(0, 0);
  });
  $("#daybar").addEventListener("click", function (e) {
    var id = e.target.dataset.day; if (!id) return; currentId = id; render();
  });

  app.addEventListener("click", function (e) {
    var b = e.target.closest("[data-action]"); if (!b) return;
    var act = b.dataset.action, w = W();
    if (act === "toggle") {
      var exId = b.closest(".ex").dataset.ex, i = Number(b.dataset.i);
      var s = getDraft(w).entries[exId][i]; s.done = !s.done; save();
      var y = window.scrollY; renderToday(); window.scrollTo(0, y);
      if (s.done) { var ex = w.exercises.find(function (x) { return x.id === exId; }); startTimer(ex && ex.rest); }
    } else if (act === "finish") {
      var d = getDraft(w);
      var any = Object.keys(d.entries).some(function (k) { return d.entries[k].some(function (x) { return x.done; }); });
      if (!any) { toast("Tap a plate to mark at least one set done first."); return; }
      var names = {}; w.exercises.forEach(function (x) { names[x.id] = x.name; });
      state.sessions.push({ id: uid(), workoutId: w.id, title: w.dayLabel + " " + w.title, date: new Date().toISOString(), entries: clone(d.entries), names: names, notes: d.notes });
      delete state.drafts[w.id]; save(); toast("Session saved"); view = "history"; render(); window.scrollTo(0, 0);
    } else if (act === "discard") {
      if (confirm("Clear everything you've entered for this workout today?")) { delete state.drafts[w.id]; save(); render(); }
    } else if (act === "delsession") {
      if (confirm("Delete this session from your history?")) {
        state.sessions = state.sessions.filter(function (s) { return s.id !== b.dataset.id; }); save(); render();
      }
    } else if (act === "up" || act === "down") {
      var idx = w.exercises.findIndex(function (x) { return x.id === b.dataset.x; });
      var to = act === "up" ? idx - 1 : idx + 1;
      if (to < 0 || to >= w.exercises.length) return;
      var tmp = w.exercises[idx]; w.exercises[idx] = w.exercises[to]; w.exercises[to] = tmp; save(); render();
    } else if (act === "delex") {
      var exn = w.exercises.find(function (x) { return x.id === b.dataset.x; });
      if (confirm("Remove " + exn.name + " from " + w.dayLabel + "? Past sessions keep their records.")) {
        w.exercises = w.exercises.filter(function (x) { return x.id !== b.dataset.x; }); save(); render();
      }
    } else if (act === "addex") {
      w.exercises.push({ id: w.id + "-" + uid(), name: "New exercise", equipment: "", sets: 3, target: 10, unit: "reps", label: "10", rest: 60, start: "", cue: "" });
      save(); render(); window.scrollTo(0, document.body.scrollHeight);
    } else if (act === "addworkout") {
      var name = prompt("Name the day, for example Wednesday");
      if (!name) return;
      var nw = { id: uid(), weekday: "", dayLabel: name, title: "New workout", summary: "", warmup: [], exercises: [], finisher: "", cooldown: "" };
      state.workouts.push(nw); currentId = nw.id; save(); render();
    } else if (act === "delworkout") {
      if (state.workouts.length === 1) { toast("Keep at least one workout day."); return; }
      if (confirm("Delete the " + w.dayLabel + " workout? Past sessions stay in History.")) {
        state.workouts = state.workouts.filter(function (x) { return x.id !== w.id; });
        currentId = state.workouts[0].id; save(); render();
      }
    } else if (act === "export") {
      var blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "home-gym-backup-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    } else if (act === "resetplan") {
      if (confirm("Restore the original weekly plan? Your history is kept; your edits to the plan are lost.")) {
        state.workouts = clone(window.DEFAULT_WORKOUTS); state.drafts = {}; state.planVersion = window.DEFAULT_PLAN_VERSION || 1; currentId = state.workouts[0].id; save(); render();
      }
    }
  });

  app.addEventListener("input", function (e) {
    var t = e.target, w = W();
    if (t.dataset.f) {
      var exId = t.closest(".ex").dataset.ex;
      getDraft(w).entries[exId][Number(t.dataset.i)][t.dataset.f] = t.value.trim(); save();
    } else if (t.hasAttribute("data-notes")) {
      getDraft(w).notes = t.value; save();
    }
  });

  app.addEventListener("change", function (e) {
    var t = e.target, w = W();
    if (t.dataset.f === "kg" && t.value.trim() !== "") {
      var art = t.closest(".ex"), arr = getDraft(w).entries[art.dataset.ex];
      for (var n = Number(t.dataset.i) + 1; n < arr.length; n++) {
        if (arr[n].kg === "" && !arr[n].done) {
          arr[n].kg = t.value.trim();
          var inp = art.querySelector('input[data-f="kg"][data-i="' + n + '"]'); if (inp) inp.value = arr[n].kg;
        }
      }
      save(); return;
    }
    if (t.dataset.wf) {
      var k = t.dataset.wf;
      if (k === "warmup") {
        w.warmup = t.value.split("\n").map(function (l) { return l.split("|").map(function (p) { return p.trim(); }); })
          .filter(function (r) { return r[0]; }).map(function (r) { return [r[0], r[1] || "", r[2] || ""]; });
      } else if (k === "restDay") { w.restDay = t.value === "yes"; }
      else { w[k] = t.value; }
      save(); if (k === "dayLabel") renderDaybar();
    } else if (t.dataset.xf) {
      var ex = w.exercises.find(function (x) { return x.id === t.dataset.x; }); if (!ex) return;
      var f = t.dataset.xf, v = t.value;
      if (f === "sets" || f === "target" || f === "rest") { v = Math.max(f === "sets" ? 1 : 0, parseInt(v, 10) || 0); }
      if (f === "weighted") v = v !== "no";
      ex[f] = v; save();
      if (f === "weighted") return;
      if (f === "name") render();
    } else if (t.hasAttribute("data-import") && t.files[0]) {
      var r = new FileReader();
      r.onload = function () {
        try {
          var s = JSON.parse(r.result);
          if (!s || !Array.isArray(s.workouts) || !s.workouts.length) throw new Error("bad");
          if (!confirm("Replace everything on this device with the backup?")) return;
          state = { workouts: s.workouts, sessions: s.sessions || [], drafts: s.drafts || {}, planVersion: s.planVersion || 1 };
          migrate(state);
          currentId = state.workouts[0].id; save(); render(); toast("Backup imported");
        } catch (err) { toast("That file isn't a Home gym log backup."); }
      };
      r.readAsText(t.files[0]);
    }
  });

  render();
})();
