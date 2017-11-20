require = function e (n, r, t) {
  function o (s, a) {
    if (!r[s]) {
      if (!n[s]) {
        var c = "function" == typeof require && require;
        if (!a && c)return c(s, !0);
        if (i)return i(s, !0);
        var u = new Error("Cannot find module '" + s + "'");
        throw u.code = "MODULE_NOT_FOUND", u
      }
      var f = r[s] = {exports: {}};
      n[s][0].call(f.exports, function (e) {
        var r = n[s][1][e];
        return o(r ? r : e)
      }, f, f.exports, e, n, r, t)
    }
    return r[s].exports
  }

  for (var i = "function" == typeof require && require, s = 0; s < t.length; s++)o(t[s]);
  return o
}({
  1: [function (e, n, r) {
    var t = e("./main.js"), o = e("./Region.js"), i = 6378137, s = 57.29577951308232;
    n.exports = o.extend({
      init: function (e, n, r) {
        var t = this;
        t.name = e, t.center = n, t.radius = r, t._updateBbox(n, r)
      }, _updateBbox: function (e, n) {
        var r = this, t = e[0] || 0, o = e[1] || 0, a = n / i, c = a / Math.cos(o / s);
        return r.bbox = [t - c, o - a, t + c, o + a], r
      }, _hit: function (e, n) {
        var r = this, o = t.utils.geodetic.sphereDistance([e, n], r.center);
        return o <= r.radius
      }
    })
  }, {"./Region.js": 8, "./main.js": "GGeofence"}],
  2: [function (e, n, r) {
    var t = e("./main.js"), o = function () {
    };
    o.extend = function (e) {
      var n = function () {
        var e = this;
        e.init && e.init.apply(e, arguments)
      }, r = t.utils.object.merge, o = function () {
      };
      o.prototype = this.prototype;
      var i = new o;
      i.constructor = n, n.prototype = i;
      var s, a;
      for (s in this)this.hasOwnProperty(s) && "prototype" !== s && (n[s] = this[s]);
      var c, u = {};
      if (e.mixins) {
        for (s = 0, a = e.mixins.length; a > s; s++)c = e.mixins[s], r(i, c), c.options && r(u, c.options);
        delete e.mixins
      }
      e.statics && (r(n, e.statics), delete e.statics);
      var f = this.prototype.options;
      return f && r(u, f), r(u, e.options), e.options = u, r(i, e), n.__super__ = this.prototype, n
    }, n.exports = o
  }, {"./main.js": "GGeofence"}],
  3: [function (e, n, r) {
    var t = e("./main.js"), o = {
      eventsKey: "_g_events_", addListener: function (e, n, r) {
        var t = {action: n, context: r || this}, o = this.eventsKey, i = this[o] = this[o] || {};
        return i[e] = i[e] || [], i[e].push(t), this
      }, removeListener: function (e, n, r) {
        var t, o, i, s = this.eventsKey, a = this[s];
        if (!a)return this;
        if (n) {
          if (t = a[e])for (o = t.length - 1; o >= 0; o--)t[o].action !== n || r && t[o].context !== r || (i = t.splice(o, 1))
        } else delete a[e];
        return this
      }, clearListeners: function () {
        var e = this.eventsKey;
        return delete this[e], this
      }, hasListeners: function (e) {
        var n = this.eventsKey, r = this[n];
        return r ? e in r && r[e].length > 0 : !1
      }, fireEvent: function (e, n) {
        var r = this;
        if (!r.hasListeners(e))return r;
        var o, i = r.eventsKey, s = r[i], a = t.utils.object.merge({}, n, {
          type: e, target: r, cancel: function () {
            return a._cancel = !0, a
          }
        });
        if (s)for (var c = s[e], u = c.length - 1; u >= 0 && !a._cancel; u--)o = c[u].action, o && o.call(c[u].context || r, a);
        return r
      }
    };
    o.on = o.addListener, o.off = o.removeListener, o.fire = o.fireEvent, n.exports = o
  }, {"./main.js": "GGeofence"}],
  4: [function (e, n, r) {
    var t = e("./main.js");
    n.exports = t.Class.extend({
      init: function (e, n, r) {
        var o = this;
        o.id = e, o.region = n, o.options = t.utils.object.merge({duration: 0, dwellDelay: 1e4}, o.options, r);
        var i = o.options.duration;
        i > 0 && (o._tid = setTimeout(function () {
          o.remove()
        }, i))
      }, remove: function () {
        var e = this, n = e._manager;
        return n && (delete n._geofences[e.id], n._geofenceTree.remove(e.region.bbox, e)), e
      }
    })
  }, {"./main.js": "GGeofence"}],
  5: [function (e, n, r) {
    var t = e("./main.js"), o = e("./Event.js"), i = e("./RTree.js"), s = e("./Geofence.js"), a = e("./Visitor.js"),
      c = t.Class.extend({
        mixins: [o], init: function () {
          var e = this;
          e._idSeq = 0, e._geofences = {}, e._geofenceTree = new i, e._visitors = {}
        }, add: function (e, n) {
          var r = this, t = r._idSeq++, o = new s(t, e, n);
          return o._manager = r, r._geofences[t] = o, r._geofenceTree.insert(o.region.bbox, o), o
        }, all: function () {
          return this._geofenceTree.all()
        }, get: function (e) {
          return this._geofences[e]
        }, query: function (e) {
          var n, r, o, i = this, s = i._geofenceTree.search(e), a = [];
          for (n in s)r = s[n], o = r.region.bbox, t.utils.extent.overlaps(o, e) && a.push(r);
          return a
        }, clear: function () {
          var e = this;
          return e._geofences = {}, e._geofenceTree.clear(), e
        }, updateVisitor: function (e, n, r) {
          var o = this, i = +new Date, s = o._visitors[e], c = !s;
          c && (s = o._visitors[e] = new a(e, n));
          var u = t.utils.geodetic.sphereDistance(n, s.loc);
          if (c || u > r || !r) {
            var f, e, l, h = n[0], d = n[1], b = o._geofenceTree.search([h, d, h, d]), v = s._fenceInfos, _ = {};
            for (f in b)l = b[f], l.region._hit(h, d) && (_[l.id] = l);
            for (e in v)fenceInfo = v[e], _[e] || (clearTimeout(s._dwellTids[e]), o.fire("geofenceLeave", {
              geofence: fenceInfo.geofence,
              visitor: s
            }), delete v[e]);
            for (e in _)if (l = _[e], !v[e]) {
              v[e] = {geofence: _[e], enterAt: i}, o.fire("geofenceEnter", {geofence: l, visitor: s});
              var m = l.options.dwellDelay || 0;
              m > 0 && (s._dwellTids = s._dwellTids || {}, clearTimeout(s._dwellTids[e]), o._geofences[e] && (s._dwellTids[e] = setTimeout(function () {
                o.fire("geofenceDwell", {geofence: fenceInfo.geofence, visitor: s})
              }, m)))
            }
            s._updateLoc(n)
          }
          return o
        }, removeVisitor: function (e) {
          var n = this, r = n._visitors[e];
          for (var t in r._dwellTids)clearTimeout(r._dwellTids[t]);
          return delete n._visitors[e], n
        }, clearVisitors: function () {
          var e = this;
          for (var n in e._visitors)removeVisitor(n);
          return e
        }
      });
    n.exports = new c
  }, {"./Event.js": 3, "./Geofence.js": 4, "./RTree.js": 7, "./Visitor.js": 9, "./main.js": "GGeofence"}],
  6: [function (e, n, r) {
    var t = e("./main.js"), o = e("./Region.js");
    n.exports = o.extend({
      init: function (e, n) {
        var r = this;
        r.name = e, r.polygon = n, r._updateBbox(n)
      }, _updateBbox: function (e) {
        for (var n, r, t, o, i, s, a, c = this, u = e[0], f = 0, l = u.length; l > f; f++)n = u[f], r = n[0], t = n[1], o = void 0 === o ? r : Math.min(o, r), i = void 0 === i ? r : Math.max(i, r), s = void 0 === s ? t : Math.min(s, t), a = void 0 === a ? t : Math.max(a, t);
        return c.bbox = [o, s, i, a], c
      }, _hit: function (e, n) {
        {
          var r = this;
          r.options
        }
        if (r.bbox && !t.utils.extent.contains(r.bbox, [e, n]))return !1;
        var o, i, s, a, c, u, f, l = r.polygon, h = !1;
        for (o = 0, i = l.length; i > o; o++)for (c = l[o], s = 0, a = c.length; a > s; s++) {
          if (u = c[s], u[0] === e && u[1] === n)return !0;
          f = s === a - 1 ? c[0] : c[s + 1], u[1] > n != f[1] > n && e < (f[0] - u[0]) * (n - u[1]) / (f[1] - u[1]) + u[0] && (h = !h)
        }
        return h
      }
    })
  }, {"./Region.js": 8, "./main.js": "GGeofence"}],
  7: [function (e, n, r) {
    var o = e("./main.js"), i = o.utils.object.isArray;
    n.exports = o.Class.extend({
      init: function (e) {
        var n = this;
        n._tolerance = 1e-6, n._fan = e || 8, n._fanHalf = Math.floor(n._fan / 2), n._t = {
          mbr: {
            x: void 0,
            y: void 0,
            w: void 0,
            h: void 0
          }, nodes: []
        }
      }, insert: function (e, n) {
        var r = this;
        if (e && n) {
          var t = r._getMbrByExtent(e), o = {mbr: t, obj: n};
          return r._insertTo(o, r._t)
        }
      }, remove: function (e, n) {
        var r = this;
        if (e && n) {
          var t = r._getMbrByExtent(e);
          return r._removeFrom(t, n, r._t)
        }
      }, clear: function () {
        var e = this;
        e._t.mbr = {x: void 0, y: void 0, w: void 0, h: void 0}, e._t.nodes = []
      }, search: function (e) {
        var n = this, r = n._getMbrByExtent(e);
        return n._searchSubtree(r, !1, n._t)
      }, count: function () {
        var e = this;
        return e._countNode(e._t)
      }, all: function () {
        var e = this;
        return e._allInNode(e._t)
      }, _getMbrByExtent: function (e) {
        var n = e[0], r = e[1], t = e[2], o = e[3], i = {x: n, y: r, w: t - n, h: o - r};
        return i
      }, _countNode: function (e) {
        var n = 0;
        if ("nodes" in e)for (var r = e.nodes.length - 1; r >= 0; r--)n += this._countNode(e.nodes[r]); else"obj" in e && n++;
        return n
      }, _allInNode: function (e) {
        var n = [];
        if ("nodes" in e)for (var r = e.nodes.length - 1; r >= 0; r--)n = n.concat(this._allInNode(e.nodes[r])); else"obj" in e && n.push(e.obj);
        return n
      }, _insertTo: function (e, n) {
        var r = this;
        if (0 === n.nodes.length)return n.nodes.push(e), void(n.mbr = r._resizeMbrWithNodes(n.mbr, n.nodes));
        var t, o = r._chooseSubtree(e, n), s = e;
        do {
          if (t && "nodes" in t && 0 === t.nodes.length) {
            var a = t;
            t = o.pop();
            for (var c = 0; c < t.nodes.length; c++)if (t.nodes[c] === a || 0 === t.nodes[c].nodes.length) {
              t.nodes.splice(c, 1);
              break
            }
          } else t = o.pop();
          if ("obj" in s || "nodes" in s || i(s)) {
            if (i(s)) {
              for (var u = 0; u < s.length; u++)r._expandMbr(t.mbr, s[u].mbr);
              t.nodes = t.nodes.concat(s)
            } else r._expandMbr(t.mbr, s.mbr), t.nodes.push(s);
            t.nodes.length <= r._fan ? s = r._cloneMbr(t.mbr) : (s = r._split(t.nodes), o.length < 1 && (t.nodes.push(s[0]), o.push(t), s = s[1]))
          } else r._expandMbr(t.mbr, s), s = r._cloneMbr(t.mbr)
        } while (o.length > 0)
      }, _removeFrom: function (e, n, r) {
        var t = this, o = [], i = [], s = [], a = 1;
        if (!e || !t._mbrOverlap(e, r.mbr))return s;
        var c = {mbr: t._cloneMbr(e), target: n};
        i.push(r.nodes.length), o.push(r);
        var u, f, l, h;
        do {
          if (u = o.pop(), f = i.pop() - 1, "target" in c)for (; f >= 0;) {
            if (l = u.nodes[f], t._mbrOverlap(c.mbr, l.mbr)) {
              if (c.target && "obj" in l && l.obj === c.target || !c.target && ("obj" in l || t._mbrContain(c.mbr, l.mbr))) {
                "nodes" in l ? (u.nodes.splice(f, 1), s = t._searchSubtree(l.mbr, !0, l)) : s = u.nodes.splice(f, 1), u.mbr = t._resizeMbrWithNodes(u.mbr, u.nodes), delete c.target, u.nodes.length < t._fanHalf && (c.nodes = t._searchSubtree(u.mbr, !0, u));
                break
              }
              "nodes" in l && (a += 1, i.push(f), o.push(u), u = l, f = l.nodes.length)
            }
            f -= 1
          } else if ("nodes" in c) {
            for (u.nodes.splice(f + 1, 1), u.nodes.length > 0 && (u.mbr = t._resizeMbrWithNodes(u.mbr, u.nodes)), h = c.nodes.length - 1; h >= 0; h--)t._insertTo(c.nodes[h], u);
            c.nodes.length = 0, 0 === o.length && u.nodes.length <= 1 ? (c.nodes = t._searchSubtree(u.mbr, !0, u), u.nodes.length = 0, o.push(u), i.push(1)) : o.length > 0 && u.nodes.length < t._fanHalf ? (c.nodes = t._searchSubtree(u.mbr, !0, u), u.nodes.length = 0) : delete c.nodes
          } else u.mbr = t._resizeMbrWithNodes(u.mbr, u.nodes);
          a -= 1
        } while (o.length > 0);
        return s
      }, _chooseSubtree: function (e, n) {
        var r = -1, t = [];
        t.push(n);
        var o, i = n.nodes;
        do {
          -1 != r && (t.push(i[r]), i = i[r].nodes, r = -1);
          for (var s = i.length - 1; s >= 0; s--) {
            if (o = i[s], o.obj) {
              r = -1;
              break
            }
            0 > r && (r = s)
          }
        } while (-1 != r);
        return t
      }, _split: function (e) {
        for (var n = this, r = n._linearPickSeeds(e); e.length > 0;)n._pickNext(e, r[0], r[1]);
        return r
      }, _linearPickSeeds: function (e) {
        for (var n, r, t, o = this, i = e.length - 1, s = 0, a = e.length - 1, c = 0, u = e.length - 2; u >= 0; u--)t = e[u], t.mbr.x > e[s].mbr.x ? s = u : t.mbr.x + t.mbr.w < e[i].mbr.x + e[i].mbr.w && (i = u), t.mbr.y > e[c].mbr.y ? c = u : t.mbr.y + t.mbr.h < e[a].mbr.y + e[a].mbr.h && (a = u);
        var f = Math.abs(e[i].mbr.x + e[i].mbr.w - e[s].mbr.x), l = Math.abs(e[a].mbr.y + e[a].mbr.h - e[c].mbr.y);
        return f > l ? i > s ? (n = e.splice(i, 1)[0], r = e.splice(s, 1)[0]) : (r = e.splice(s, 1)[0], n = e.splice(i, 1)[0]) : a > c ? (n = e.splice(a, 1)[0], r = e.splice(c, 1)[0]) : (r = e.splice(c, 1)[0], n = e.splice(a, 1)[0]), [{
          mbr: o._cloneMbr(n.mbr),
          nodes: [n]
        }, {mbr: o._cloneMbr(r.mbr), nodes: [r]}]
      }, _pickNext: function (e, n, r) {
        for (var t, o, i, s, a, c, u = this, f = 0, l = -1, h = n, d = e.length - 1; d >= 0; d--)c = e[d], t = u._cloneMbr(n.mbr), u._expandMbr(t, c.mbr), i = t.w * t.h - n.mbr.w * n.mbr.h, o = u._cloneMbr(r.mbr), u._expandMbr(o, c.mbr), s = o.w * o.h - r.mbr.w * r.mbr.h, a = Math.abs(i - s), a > f && (f = a, l = d, h = s > i ? n : r);
        var b = e.splice(l, 1)[0];
        n.nodes.length + e.length + 1 <= u._fanHalf ? (n.nodes.push(b), u._expandMbr(n.mbr, b.mbr)) : r.nodes.length + e.length + 1 <= u._fanHalf ? (r.nodes.push(b), u._expandMbr(r.mbr, b.mbr)) : (h.nodes.push(b), u._expandMbr(h.mbr, b.mbr))
      }, _searchSubtree: function (e, n, r) {
        var t = this, o = [];
        if (!(t._mbrOverlap(e, r.mbr) && "nodes" in r))return o;
        for (var i, s, a = [r.nodes]; a.length > 0;) {
          i = a.pop();
          for (var c = i.length - 1; c >= 0; c--)s = i[c], t._mbrOverlap(e, s.mbr) && ("nodes" in s ? a.push(s.nodes) : "obj" in s && o.push(n ? s : s.obj))
        }
        return o
      }, _mbrOverlap: function (e, n) {
        var r = this, t = r._tolerance;
        return e && n && !r._mbrNoValue(e) && !r._mbrNoValue(n) ? e.x <= n.x + n.w + t && e.x + e.w + t >= n.x && e.y <= n.y + n.h + t && e.y + e.h + t >= n.y : void 0
      }, _mbrContain: function (e, n) {
        var r = this;
        return e && n && !r._mbrNoValue(e) && !r._mbrNoValue(n) ? e.x + e.w + t >= n.x + n.w && e.x <= n.x + t && e.y + e.h + t >= n.y + n.h && e.y <= n.y + t : void 0
      }, _cloneMbr: function (e) {
        return e ? {x: e.x, y: e.y, w: e.w, h: e.h} : void 0
      }, _mbrNoValue: function (e) {
        return void 0 === e.x || void 0 === e.y || void 0 === e.w || void 0 === e.h
      }, _expandMbr: function (e, n) {
        var r = this;
        if (!e || r._mbrNoValue(e)) e = r._cloneMbr(n); else {
          var t = Math.min(e.x, n.x), o = Math.min(e.y, n.y), i = Math.max(e.x + e.w, n.x + n.w) - t,
            s = Math.max(e.y + e.h, n.y + n.h) - o;
          e.x = t, e.y = o, e.w = i, e.h = s
        }
        return e
      }, _resizeMbrWithNodes: function (e, n) {
        var r = this;
        if (!(n.length < 1)) {
          (!e || r._mbrNoValue(e)) && (e = r._cloneMbr(n[0].mbr));
          for (var t = n.length - 1; t > 0; t--)r._expandMbr(e, n[t].mbr);
          return e
        }
      }
    })
  }, {"./main.js": "GGeofence"}],
  8: [function (e, n, r) {
    var t = e("./main.js");
    n.exports = t.Class.extend({
      _hit: function (e, n) {
        return !1
      }
    })
  }, {"./main.js": "GGeofence"}],
  9: [function (e, n, r) {
    var t = e("./main.js"), o = e("./Event.js");
    n.exports = t.Class.extend({
      mixins: [o], init: function (e, n) {
        var r = this;
        r.id = e, r.loc = n, r._createdAt = r._updatedAt = +new Date, r._fenceInfos = {}
      }, _updateLoc: function (e) {
        var n = this;
        n.loc = e, n._updatedAt = +new Date
      }
    })
  }, {"./Event.js": 3, "./main.js": "GGeofence"}],
  10: [function (e, n, r) {
    n.exports = {
      overlaps: function (e, n, r) {
        if (!e || !n)return !1;
        var t = e[0], o = e[1], i = e[2], s = e[3], a = n[0], c = n[1], u = n[2], f = n[3], l = r || 0;
        return t > u + l || a - l > i || o > f + l || c - l > s ? !1 : !0
      }, contains: function (e, n, r) {
        if (!e || !n)return !1;
        var t = e[0], o = e[1], i = e[2], s = e[3], a = n[0], c = n[1], u = r || 0;
        return a - i > u || t - a > u || c - s > u || o - c > u ? !1 : !0
      }
    }
  }, {}],
  11: [function (e, n, r) {
    var t = 6378137, o = 57.29577951308232;
    n.exports = {
      sphereDistance: function (e, n) {
        var r = Math.cos, i = Math.sin, s = Math.pow, a = o, c = e[0] / a, u = e[1] / a, f = n[0] / a, l = n[1] / a,
          h = f - c, d = r(h), b = i(h), v = r(u), _ = i(u), m = r(l), p = i(l), g = s(m * b, 2),
          x = s(v * p - _ * m * d, 2), j = Math.sqrt(g + x), y = _ * p + v * m * d;
        return t * Math.atan2(j, y)
      }
    }
  }, {}],
  12: [function (e, n, r) {
    n.exports = {
      isArray: function (e) {
        return "[object Array]" === Object.prototype.toString.call(e)
      }, isObject: function (e) {
        return "[object Object]" === Object.prototype.toString.call(e)
      }, merge: function (e) {
        var n, r, t, o, i = Array.prototype.slice.call(arguments, 1);
        for (r = 0, t = i.length; t > r; r++) {
          o = i[r] || {};
          for (n in o)o.hasOwnProperty(n) && (e[n] = o[n])
        }
        return e
      }
    }
  }, {}],
  GGeofence: [function (e, n, r) {
    var t = n.exports = {version: "1.0.0", browser: "undefined" != typeof window};
    !function () {
      t.utils = {
        object: e("./utils/object.js"),
        extent: e("./utils/extent.js"),
        geodetic: e("./utils/geodetic.js")
      }, t.Class = e("./Class.js"), t.RTree = e("./RTree.js"), t.Region = e("./Region.js"), t.CircleRegion = e("./CircleRegion.js"), t.PolygonRegion = e("./PolygonRegion.js"), t.Geofence = e("./Geofence.js"), t.Visitor = e("./Visitor.js"), t.GeofenceManager = e("./GeofenceManager.js")
    }()
  }, {
    "./CircleRegion.js": 1,
    "./Class.js": 2,
    "./Geofence.js": 4,
    "./GeofenceManager.js": 5,
    "./PolygonRegion.js": 6,
    "./RTree.js": 7,
    "./Region.js": 8,
    "./Visitor.js": 9,
    "./utils/extent.js": 10,
    "./utils/geodetic.js": 11,
    "./utils/object.js": 12
  }]
}, {}, ["GGeofence"]);
