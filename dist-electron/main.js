var Zd = Object.defineProperty;
var eh = (e, t, r) => t in e ? Zd(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var G = (e, t, r) => eh(e, typeof t != "symbol" ? t + "" : t, r);
import gt, { app as lr, BrowserWindow as Pc, ipcMain as jt } from "electron";
import Ue from "fs";
import th from "constants";
import Jr from "stream";
import ti from "util";
import Ic from "assert";
import Q from "path";
import Kr from "child_process";
import ri from "events";
import Qr from "crypto";
import Dc from "tty";
import St from "os";
import At from "url";
import Nc from "zlib";
import Fc from "http";
import rh from "https";
import { fileURLToPath as nh } from "node:url";
import ot from "node:path";
import Ho from "node:fs";
var Oe = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function ih(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var et = {}, qt = {}, Pe = {};
Pe.fromCallback = function(e) {
  return Object.defineProperty(function(...t) {
    if (typeof t[t.length - 1] == "function") e.apply(this, t);
    else
      return new Promise((r, n) => {
        t.push((i, o) => i != null ? n(i) : r(o)), e.apply(this, t);
      });
  }, "name", { value: e.name });
};
Pe.fromPromise = function(e) {
  return Object.defineProperty(function(...t) {
    const r = t[t.length - 1];
    if (typeof r != "function") return e.apply(this, t);
    t.pop(), e.apply(this, t).then((n) => r(null, n), r);
  }, "name", { value: e.name });
};
var ut = th, oh = process.cwd, Un = null, sh = process.env.GRACEFUL_FS_PLATFORM || process.platform;
process.cwd = function() {
  return Un || (Un = oh.call(process)), Un;
};
try {
  process.cwd();
} catch {
}
if (typeof process.chdir == "function") {
  var aa = process.chdir;
  process.chdir = function(e) {
    Un = null, aa.call(process, e);
  }, Object.setPrototypeOf && Object.setPrototypeOf(process.chdir, aa);
}
var ah = lh;
function lh(e) {
  ut.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) && t(e), e.lutimes || r(e), e.chown = o(e.chown), e.fchown = o(e.fchown), e.lchown = o(e.lchown), e.chmod = n(e.chmod), e.fchmod = n(e.fchmod), e.lchmod = n(e.lchmod), e.chownSync = s(e.chownSync), e.fchownSync = s(e.fchownSync), e.lchownSync = s(e.lchownSync), e.chmodSync = i(e.chmodSync), e.fchmodSync = i(e.fchmodSync), e.lchmodSync = i(e.lchmodSync), e.stat = a(e.stat), e.fstat = a(e.fstat), e.lstat = a(e.lstat), e.statSync = l(e.statSync), e.fstatSync = l(e.fstatSync), e.lstatSync = l(e.lstatSync), e.chmod && !e.lchmod && (e.lchmod = function(c, u, h) {
    h && process.nextTick(h);
  }, e.lchmodSync = function() {
  }), e.chown && !e.lchown && (e.lchown = function(c, u, h, m) {
    m && process.nextTick(m);
  }, e.lchownSync = function() {
  }), sh === "win32" && (e.rename = typeof e.rename != "function" ? e.rename : function(c) {
    function u(h, m, E) {
      var y = Date.now(), S = 0;
      c(h, m, function A(T) {
        if (T && (T.code === "EACCES" || T.code === "EPERM" || T.code === "EBUSY") && Date.now() - y < 6e4) {
          setTimeout(function() {
            e.stat(m, function(D, B) {
              D && D.code === "ENOENT" ? c(h, m, A) : E(T);
            });
          }, S), S < 100 && (S += 10);
          return;
        }
        E && E(T);
      });
    }
    return Object.setPrototypeOf && Object.setPrototypeOf(u, c), u;
  }(e.rename)), e.read = typeof e.read != "function" ? e.read : function(c) {
    function u(h, m, E, y, S, A) {
      var T;
      if (A && typeof A == "function") {
        var D = 0;
        T = function(B, k, q) {
          if (B && B.code === "EAGAIN" && D < 10)
            return D++, c.call(e, h, m, E, y, S, T);
          A.apply(this, arguments);
        };
      }
      return c.call(e, h, m, E, y, S, T);
    }
    return Object.setPrototypeOf && Object.setPrototypeOf(u, c), u;
  }(e.read), e.readSync = typeof e.readSync != "function" ? e.readSync : /* @__PURE__ */ function(c) {
    return function(u, h, m, E, y) {
      for (var S = 0; ; )
        try {
          return c.call(e, u, h, m, E, y);
        } catch (A) {
          if (A.code === "EAGAIN" && S < 10) {
            S++;
            continue;
          }
          throw A;
        }
    };
  }(e.readSync);
  function t(c) {
    c.lchmod = function(u, h, m) {
      c.open(
        u,
        ut.O_WRONLY | ut.O_SYMLINK,
        h,
        function(E, y) {
          if (E) {
            m && m(E);
            return;
          }
          c.fchmod(y, h, function(S) {
            c.close(y, function(A) {
              m && m(S || A);
            });
          });
        }
      );
    }, c.lchmodSync = function(u, h) {
      var m = c.openSync(u, ut.O_WRONLY | ut.O_SYMLINK, h), E = !0, y;
      try {
        y = c.fchmodSync(m, h), E = !1;
      } finally {
        if (E)
          try {
            c.closeSync(m);
          } catch {
          }
        else
          c.closeSync(m);
      }
      return y;
    };
  }
  function r(c) {
    ut.hasOwnProperty("O_SYMLINK") && c.futimes ? (c.lutimes = function(u, h, m, E) {
      c.open(u, ut.O_SYMLINK, function(y, S) {
        if (y) {
          E && E(y);
          return;
        }
        c.futimes(S, h, m, function(A) {
          c.close(S, function(T) {
            E && E(A || T);
          });
        });
      });
    }, c.lutimesSync = function(u, h, m) {
      var E = c.openSync(u, ut.O_SYMLINK), y, S = !0;
      try {
        y = c.futimesSync(E, h, m), S = !1;
      } finally {
        if (S)
          try {
            c.closeSync(E);
          } catch {
          }
        else
          c.closeSync(E);
      }
      return y;
    }) : c.futimes && (c.lutimes = function(u, h, m, E) {
      E && process.nextTick(E);
    }, c.lutimesSync = function() {
    });
  }
  function n(c) {
    return c && function(u, h, m) {
      return c.call(e, u, h, function(E) {
        f(E) && (E = null), m && m.apply(this, arguments);
      });
    };
  }
  function i(c) {
    return c && function(u, h) {
      try {
        return c.call(e, u, h);
      } catch (m) {
        if (!f(m)) throw m;
      }
    };
  }
  function o(c) {
    return c && function(u, h, m, E) {
      return c.call(e, u, h, m, function(y) {
        f(y) && (y = null), E && E.apply(this, arguments);
      });
    };
  }
  function s(c) {
    return c && function(u, h, m) {
      try {
        return c.call(e, u, h, m);
      } catch (E) {
        if (!f(E)) throw E;
      }
    };
  }
  function a(c) {
    return c && function(u, h, m) {
      typeof h == "function" && (m = h, h = null);
      function E(y, S) {
        S && (S.uid < 0 && (S.uid += 4294967296), S.gid < 0 && (S.gid += 4294967296)), m && m.apply(this, arguments);
      }
      return h ? c.call(e, u, h, E) : c.call(e, u, E);
    };
  }
  function l(c) {
    return c && function(u, h) {
      var m = h ? c.call(e, u, h) : c.call(e, u);
      return m && (m.uid < 0 && (m.uid += 4294967296), m.gid < 0 && (m.gid += 4294967296)), m;
    };
  }
  function f(c) {
    if (!c || c.code === "ENOSYS")
      return !0;
    var u = !process.getuid || process.getuid() !== 0;
    return !!(u && (c.code === "EINVAL" || c.code === "EPERM"));
  }
}
var la = Jr.Stream, ch = uh;
function uh(e) {
  return {
    ReadStream: t,
    WriteStream: r
  };
  function t(n, i) {
    if (!(this instanceof t)) return new t(n, i);
    la.call(this);
    var o = this;
    this.path = n, this.fd = null, this.readable = !0, this.paused = !1, this.flags = "r", this.mode = 438, this.bufferSize = 64 * 1024, i = i || {};
    for (var s = Object.keys(i), a = 0, l = s.length; a < l; a++) {
      var f = s[a];
      this[f] = i[f];
    }
    if (this.encoding && this.setEncoding(this.encoding), this.start !== void 0) {
      if (typeof this.start != "number")
        throw TypeError("start must be a Number");
      if (this.end === void 0)
        this.end = 1 / 0;
      else if (typeof this.end != "number")
        throw TypeError("end must be a Number");
      if (this.start > this.end)
        throw new Error("start must be <= end");
      this.pos = this.start;
    }
    if (this.fd !== null) {
      process.nextTick(function() {
        o._read();
      });
      return;
    }
    e.open(this.path, this.flags, this.mode, function(c, u) {
      if (c) {
        o.emit("error", c), o.readable = !1;
        return;
      }
      o.fd = u, o.emit("open", u), o._read();
    });
  }
  function r(n, i) {
    if (!(this instanceof r)) return new r(n, i);
    la.call(this), this.path = n, this.fd = null, this.writable = !0, this.flags = "w", this.encoding = "binary", this.mode = 438, this.bytesWritten = 0, i = i || {};
    for (var o = Object.keys(i), s = 0, a = o.length; s < a; s++) {
      var l = o[s];
      this[l] = i[l];
    }
    if (this.start !== void 0) {
      if (typeof this.start != "number")
        throw TypeError("start must be a Number");
      if (this.start < 0)
        throw new Error("start must be >= zero");
      this.pos = this.start;
    }
    this.busy = !1, this._queue = [], this.fd === null && (this._open = e.open, this._queue.push([this._open, this.path, this.flags, this.mode, void 0]), this.flush());
  }
}
var fh = hh, dh = Object.getPrototypeOf || function(e) {
  return e.__proto__;
};
function hh(e) {
  if (e === null || typeof e != "object")
    return e;
  if (e instanceof Object)
    var t = { __proto__: dh(e) };
  else
    var t = /* @__PURE__ */ Object.create(null);
  return Object.getOwnPropertyNames(e).forEach(function(r) {
    Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(e, r));
  }), t;
}
var se = Ue, ph = ah, mh = ch, gh = fh, wn = ti, ye, Hn;
typeof Symbol == "function" && typeof Symbol.for == "function" ? (ye = Symbol.for("graceful-fs.queue"), Hn = Symbol.for("graceful-fs.previous")) : (ye = "___graceful-fs.queue", Hn = "___graceful-fs.previous");
function yh() {
}
function xc(e, t) {
  Object.defineProperty(e, ye, {
    get: function() {
      return t;
    }
  });
}
var kt = yh;
wn.debuglog ? kt = wn.debuglog("gfs4") : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && (kt = function() {
  var e = wn.format.apply(wn, arguments);
  e = "GFS4: " + e.split(/\n/).join(`
GFS4: `), console.error(e);
});
if (!se[ye]) {
  var Eh = Oe[ye] || [];
  xc(se, Eh), se.close = function(e) {
    function t(r, n) {
      return e.call(se, r, function(i) {
        i || ca(), typeof n == "function" && n.apply(this, arguments);
      });
    }
    return Object.defineProperty(t, Hn, {
      value: e
    }), t;
  }(se.close), se.closeSync = function(e) {
    function t(r) {
      e.apply(se, arguments), ca();
    }
    return Object.defineProperty(t, Hn, {
      value: e
    }), t;
  }(se.closeSync), /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && process.on("exit", function() {
    kt(se[ye]), Ic.equal(se[ye].length, 0);
  });
}
Oe[ye] || xc(Oe, se[ye]);
var Ie = ls(gh(se));
process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !se.__patched && (Ie = ls(se), se.__patched = !0);
function ls(e) {
  ph(e), e.gracefulify = ls, e.createReadStream = k, e.createWriteStream = q;
  var t = e.readFile;
  e.readFile = r;
  function r(L, v, W) {
    return typeof v == "function" && (W = v, v = null), K(L, v, W);
    function K(ne, R, $, I) {
      return t(ne, R, function(O) {
        O && (O.code === "EMFILE" || O.code === "ENFILE") ? Xt([K, [ne, R, $], O, I || Date.now(), Date.now()]) : typeof $ == "function" && $.apply(this, arguments);
      });
    }
  }
  var n = e.writeFile;
  e.writeFile = i;
  function i(L, v, W, K) {
    return typeof W == "function" && (K = W, W = null), ne(L, v, W, K);
    function ne(R, $, I, O, N) {
      return n(R, $, I, function(P) {
        P && (P.code === "EMFILE" || P.code === "ENFILE") ? Xt([ne, [R, $, I, O], P, N || Date.now(), Date.now()]) : typeof O == "function" && O.apply(this, arguments);
      });
    }
  }
  var o = e.appendFile;
  o && (e.appendFile = s);
  function s(L, v, W, K) {
    return typeof W == "function" && (K = W, W = null), ne(L, v, W, K);
    function ne(R, $, I, O, N) {
      return o(R, $, I, function(P) {
        P && (P.code === "EMFILE" || P.code === "ENFILE") ? Xt([ne, [R, $, I, O], P, N || Date.now(), Date.now()]) : typeof O == "function" && O.apply(this, arguments);
      });
    }
  }
  var a = e.copyFile;
  a && (e.copyFile = l);
  function l(L, v, W, K) {
    return typeof W == "function" && (K = W, W = 0), ne(L, v, W, K);
    function ne(R, $, I, O, N) {
      return a(R, $, I, function(P) {
        P && (P.code === "EMFILE" || P.code === "ENFILE") ? Xt([ne, [R, $, I, O], P, N || Date.now(), Date.now()]) : typeof O == "function" && O.apply(this, arguments);
      });
    }
  }
  var f = e.readdir;
  e.readdir = u;
  var c = /^v[0-5]\./;
  function u(L, v, W) {
    typeof v == "function" && (W = v, v = null);
    var K = c.test(process.version) ? function($, I, O, N) {
      return f($, ne(
        $,
        I,
        O,
        N
      ));
    } : function($, I, O, N) {
      return f($, I, ne(
        $,
        I,
        O,
        N
      ));
    };
    return K(L, v, W);
    function ne(R, $, I, O) {
      return function(N, P) {
        N && (N.code === "EMFILE" || N.code === "ENFILE") ? Xt([
          K,
          [R, $, I],
          N,
          O || Date.now(),
          Date.now()
        ]) : (P && P.sort && P.sort(), typeof I == "function" && I.call(this, N, P));
      };
    }
  }
  if (process.version.substr(0, 4) === "v0.8") {
    var h = mh(e);
    A = h.ReadStream, D = h.WriteStream;
  }
  var m = e.ReadStream;
  m && (A.prototype = Object.create(m.prototype), A.prototype.open = T);
  var E = e.WriteStream;
  E && (D.prototype = Object.create(E.prototype), D.prototype.open = B), Object.defineProperty(e, "ReadStream", {
    get: function() {
      return A;
    },
    set: function(L) {
      A = L;
    },
    enumerable: !0,
    configurable: !0
  }), Object.defineProperty(e, "WriteStream", {
    get: function() {
      return D;
    },
    set: function(L) {
      D = L;
    },
    enumerable: !0,
    configurable: !0
  });
  var y = A;
  Object.defineProperty(e, "FileReadStream", {
    get: function() {
      return y;
    },
    set: function(L) {
      y = L;
    },
    enumerable: !0,
    configurable: !0
  });
  var S = D;
  Object.defineProperty(e, "FileWriteStream", {
    get: function() {
      return S;
    },
    set: function(L) {
      S = L;
    },
    enumerable: !0,
    configurable: !0
  });
  function A(L, v) {
    return this instanceof A ? (m.apply(this, arguments), this) : A.apply(Object.create(A.prototype), arguments);
  }
  function T() {
    var L = this;
    Z(L.path, L.flags, L.mode, function(v, W) {
      v ? (L.autoClose && L.destroy(), L.emit("error", v)) : (L.fd = W, L.emit("open", W), L.read());
    });
  }
  function D(L, v) {
    return this instanceof D ? (E.apply(this, arguments), this) : D.apply(Object.create(D.prototype), arguments);
  }
  function B() {
    var L = this;
    Z(L.path, L.flags, L.mode, function(v, W) {
      v ? (L.destroy(), L.emit("error", v)) : (L.fd = W, L.emit("open", W));
    });
  }
  function k(L, v) {
    return new e.ReadStream(L, v);
  }
  function q(L, v) {
    return new e.WriteStream(L, v);
  }
  var V = e.open;
  e.open = Z;
  function Z(L, v, W, K) {
    return typeof W == "function" && (K = W, W = null), ne(L, v, W, K);
    function ne(R, $, I, O, N) {
      return V(R, $, I, function(P, M) {
        P && (P.code === "EMFILE" || P.code === "ENFILE") ? Xt([ne, [R, $, I, O], P, N || Date.now(), Date.now()]) : typeof O == "function" && O.apply(this, arguments);
      });
    }
  }
  return e;
}
function Xt(e) {
  kt("ENQUEUE", e[0].name, e[1]), se[ye].push(e), cs();
}
var _n;
function ca() {
  for (var e = Date.now(), t = 0; t < se[ye].length; ++t)
    se[ye][t].length > 2 && (se[ye][t][3] = e, se[ye][t][4] = e);
  cs();
}
function cs() {
  if (clearTimeout(_n), _n = void 0, se[ye].length !== 0) {
    var e = se[ye].shift(), t = e[0], r = e[1], n = e[2], i = e[3], o = e[4];
    if (i === void 0)
      kt("RETRY", t.name, r), t.apply(null, r);
    else if (Date.now() - i >= 6e4) {
      kt("TIMEOUT", t.name, r);
      var s = r.pop();
      typeof s == "function" && s.call(null, n);
    } else {
      var a = Date.now() - o, l = Math.max(o - i, 1), f = Math.min(l * 1.2, 100);
      a >= f ? (kt("RETRY", t.name, r), t.apply(null, r.concat([i]))) : se[ye].push(e);
    }
    _n === void 0 && (_n = setTimeout(cs, 0));
  }
}
(function(e) {
  const t = Pe.fromCallback, r = Ie, n = [
    "access",
    "appendFile",
    "chmod",
    "chown",
    "close",
    "copyFile",
    "fchmod",
    "fchown",
    "fdatasync",
    "fstat",
    "fsync",
    "ftruncate",
    "futimes",
    "lchmod",
    "lchown",
    "link",
    "lstat",
    "mkdir",
    "mkdtemp",
    "open",
    "opendir",
    "readdir",
    "readFile",
    "readlink",
    "realpath",
    "rename",
    "rm",
    "rmdir",
    "stat",
    "symlink",
    "truncate",
    "unlink",
    "utimes",
    "writeFile"
  ].filter((i) => typeof r[i] == "function");
  Object.assign(e, r), n.forEach((i) => {
    e[i] = t(r[i]);
  }), e.exists = function(i, o) {
    return typeof o == "function" ? r.exists(i, o) : new Promise((s) => r.exists(i, s));
  }, e.read = function(i, o, s, a, l, f) {
    return typeof f == "function" ? r.read(i, o, s, a, l, f) : new Promise((c, u) => {
      r.read(i, o, s, a, l, (h, m, E) => {
        if (h) return u(h);
        c({ bytesRead: m, buffer: E });
      });
    });
  }, e.write = function(i, o, ...s) {
    return typeof s[s.length - 1] == "function" ? r.write(i, o, ...s) : new Promise((a, l) => {
      r.write(i, o, ...s, (f, c, u) => {
        if (f) return l(f);
        a({ bytesWritten: c, buffer: u });
      });
    });
  }, typeof r.writev == "function" && (e.writev = function(i, o, ...s) {
    return typeof s[s.length - 1] == "function" ? r.writev(i, o, ...s) : new Promise((a, l) => {
      r.writev(i, o, ...s, (f, c, u) => {
        if (f) return l(f);
        a({ bytesWritten: c, buffers: u });
      });
    });
  }), typeof r.realpath.native == "function" ? e.realpath.native = t(r.realpath.native) : process.emitWarning(
    "fs.realpath.native is not a function. Is fs being monkey-patched?",
    "Warning",
    "fs-extra-WARN0003"
  );
})(qt);
var us = {}, Lc = {};
const vh = Q;
Lc.checkPath = function(t) {
  if (process.platform === "win32" && /[<>:"|?*]/.test(t.replace(vh.parse(t).root, ""))) {
    const n = new Error(`Path contains invalid characters: ${t}`);
    throw n.code = "EINVAL", n;
  }
};
const Uc = qt, { checkPath: kc } = Lc, Mc = (e) => {
  const t = { mode: 511 };
  return typeof e == "number" ? e : { ...t, ...e }.mode;
};
us.makeDir = async (e, t) => (kc(e), Uc.mkdir(e, {
  mode: Mc(t),
  recursive: !0
}));
us.makeDirSync = (e, t) => (kc(e), Uc.mkdirSync(e, {
  mode: Mc(t),
  recursive: !0
}));
const wh = Pe.fromPromise, { makeDir: _h, makeDirSync: Fi } = us, xi = wh(_h);
var tt = {
  mkdirs: xi,
  mkdirsSync: Fi,
  // alias
  mkdirp: xi,
  mkdirpSync: Fi,
  ensureDir: xi,
  ensureDirSync: Fi
};
const Sh = Pe.fromPromise, Bc = qt;
function Ah(e) {
  return Bc.access(e).then(() => !0).catch(() => !1);
}
var Ht = {
  pathExists: Sh(Ah),
  pathExistsSync: Bc.existsSync
};
const sr = Ie;
function bh(e, t, r, n) {
  sr.open(e, "r+", (i, o) => {
    if (i) return n(i);
    sr.futimes(o, t, r, (s) => {
      sr.close(o, (a) => {
        n && n(s || a);
      });
    });
  });
}
function Th(e, t, r) {
  const n = sr.openSync(e, "r+");
  return sr.futimesSync(n, t, r), sr.closeSync(n);
}
var jc = {
  utimesMillis: bh,
  utimesMillisSync: Th
};
const cr = qt, me = Q, Ch = ti;
function Oh(e, t, r) {
  const n = r.dereference ? (i) => cr.stat(i, { bigint: !0 }) : (i) => cr.lstat(i, { bigint: !0 });
  return Promise.all([
    n(e),
    n(t).catch((i) => {
      if (i.code === "ENOENT") return null;
      throw i;
    })
  ]).then(([i, o]) => ({ srcStat: i, destStat: o }));
}
function $h(e, t, r) {
  let n;
  const i = r.dereference ? (s) => cr.statSync(s, { bigint: !0 }) : (s) => cr.lstatSync(s, { bigint: !0 }), o = i(e);
  try {
    n = i(t);
  } catch (s) {
    if (s.code === "ENOENT") return { srcStat: o, destStat: null };
    throw s;
  }
  return { srcStat: o, destStat: n };
}
function Rh(e, t, r, n, i) {
  Ch.callbackify(Oh)(e, t, n, (o, s) => {
    if (o) return i(o);
    const { srcStat: a, destStat: l } = s;
    if (l) {
      if (Zr(a, l)) {
        const f = me.basename(e), c = me.basename(t);
        return r === "move" && f !== c && f.toLowerCase() === c.toLowerCase() ? i(null, { srcStat: a, destStat: l, isChangingCase: !0 }) : i(new Error("Source and destination must not be the same."));
      }
      if (a.isDirectory() && !l.isDirectory())
        return i(new Error(`Cannot overwrite non-directory '${t}' with directory '${e}'.`));
      if (!a.isDirectory() && l.isDirectory())
        return i(new Error(`Cannot overwrite directory '${t}' with non-directory '${e}'.`));
    }
    return a.isDirectory() && fs(e, t) ? i(new Error(ni(e, t, r))) : i(null, { srcStat: a, destStat: l });
  });
}
function Ph(e, t, r, n) {
  const { srcStat: i, destStat: o } = $h(e, t, n);
  if (o) {
    if (Zr(i, o)) {
      const s = me.basename(e), a = me.basename(t);
      if (r === "move" && s !== a && s.toLowerCase() === a.toLowerCase())
        return { srcStat: i, destStat: o, isChangingCase: !0 };
      throw new Error("Source and destination must not be the same.");
    }
    if (i.isDirectory() && !o.isDirectory())
      throw new Error(`Cannot overwrite non-directory '${t}' with directory '${e}'.`);
    if (!i.isDirectory() && o.isDirectory())
      throw new Error(`Cannot overwrite directory '${t}' with non-directory '${e}'.`);
  }
  if (i.isDirectory() && fs(e, t))
    throw new Error(ni(e, t, r));
  return { srcStat: i, destStat: o };
}
function qc(e, t, r, n, i) {
  const o = me.resolve(me.dirname(e)), s = me.resolve(me.dirname(r));
  if (s === o || s === me.parse(s).root) return i();
  cr.stat(s, { bigint: !0 }, (a, l) => a ? a.code === "ENOENT" ? i() : i(a) : Zr(t, l) ? i(new Error(ni(e, r, n))) : qc(e, t, s, n, i));
}
function Hc(e, t, r, n) {
  const i = me.resolve(me.dirname(e)), o = me.resolve(me.dirname(r));
  if (o === i || o === me.parse(o).root) return;
  let s;
  try {
    s = cr.statSync(o, { bigint: !0 });
  } catch (a) {
    if (a.code === "ENOENT") return;
    throw a;
  }
  if (Zr(t, s))
    throw new Error(ni(e, r, n));
  return Hc(e, t, o, n);
}
function Zr(e, t) {
  return t.ino && t.dev && t.ino === e.ino && t.dev === e.dev;
}
function fs(e, t) {
  const r = me.resolve(e).split(me.sep).filter((i) => i), n = me.resolve(t).split(me.sep).filter((i) => i);
  return r.reduce((i, o, s) => i && n[s] === o, !0);
}
function ni(e, t, r) {
  return `Cannot ${r} '${e}' to a subdirectory of itself, '${t}'.`;
}
var hr = {
  checkPaths: Rh,
  checkPathsSync: Ph,
  checkParentPaths: qc,
  checkParentPathsSync: Hc,
  isSrcSubdir: fs,
  areIdentical: Zr
};
const Fe = Ie, xr = Q, Ih = tt.mkdirs, Dh = Ht.pathExists, Nh = jc.utimesMillis, Lr = hr;
function Fh(e, t, r, n) {
  typeof r == "function" && !n ? (n = r, r = {}) : typeof r == "function" && (r = { filter: r }), n = n || function() {
  }, r = r || {}, r.clobber = "clobber" in r ? !!r.clobber : !0, r.overwrite = "overwrite" in r ? !!r.overwrite : r.clobber, r.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
    `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
    "Warning",
    "fs-extra-WARN0001"
  ), Lr.checkPaths(e, t, "copy", r, (i, o) => {
    if (i) return n(i);
    const { srcStat: s, destStat: a } = o;
    Lr.checkParentPaths(e, s, t, "copy", (l) => l ? n(l) : r.filter ? Gc(ua, a, e, t, r, n) : ua(a, e, t, r, n));
  });
}
function ua(e, t, r, n, i) {
  const o = xr.dirname(r);
  Dh(o, (s, a) => {
    if (s) return i(s);
    if (a) return Gn(e, t, r, n, i);
    Ih(o, (l) => l ? i(l) : Gn(e, t, r, n, i));
  });
}
function Gc(e, t, r, n, i, o) {
  Promise.resolve(i.filter(r, n)).then((s) => s ? e(t, r, n, i, o) : o(), (s) => o(s));
}
function xh(e, t, r, n, i) {
  return n.filter ? Gc(Gn, e, t, r, n, i) : Gn(e, t, r, n, i);
}
function Gn(e, t, r, n, i) {
  (n.dereference ? Fe.stat : Fe.lstat)(t, (s, a) => s ? i(s) : a.isDirectory() ? qh(a, e, t, r, n, i) : a.isFile() || a.isCharacterDevice() || a.isBlockDevice() ? Lh(a, e, t, r, n, i) : a.isSymbolicLink() ? Wh(e, t, r, n, i) : a.isSocket() ? i(new Error(`Cannot copy a socket file: ${t}`)) : a.isFIFO() ? i(new Error(`Cannot copy a FIFO pipe: ${t}`)) : i(new Error(`Unknown file: ${t}`)));
}
function Lh(e, t, r, n, i, o) {
  return t ? Uh(e, r, n, i, o) : Wc(e, r, n, i, o);
}
function Uh(e, t, r, n, i) {
  if (n.overwrite)
    Fe.unlink(r, (o) => o ? i(o) : Wc(e, t, r, n, i));
  else return n.errorOnExist ? i(new Error(`'${r}' already exists`)) : i();
}
function Wc(e, t, r, n, i) {
  Fe.copyFile(t, r, (o) => o ? i(o) : n.preserveTimestamps ? kh(e.mode, t, r, i) : ii(r, e.mode, i));
}
function kh(e, t, r, n) {
  return Mh(e) ? Bh(r, e, (i) => i ? n(i) : fa(e, t, r, n)) : fa(e, t, r, n);
}
function Mh(e) {
  return (e & 128) === 0;
}
function Bh(e, t, r) {
  return ii(e, t | 128, r);
}
function fa(e, t, r, n) {
  jh(t, r, (i) => i ? n(i) : ii(r, e, n));
}
function ii(e, t, r) {
  return Fe.chmod(e, t, r);
}
function jh(e, t, r) {
  Fe.stat(e, (n, i) => n ? r(n) : Nh(t, i.atime, i.mtime, r));
}
function qh(e, t, r, n, i, o) {
  return t ? Vc(r, n, i, o) : Hh(e.mode, r, n, i, o);
}
function Hh(e, t, r, n, i) {
  Fe.mkdir(r, (o) => {
    if (o) return i(o);
    Vc(t, r, n, (s) => s ? i(s) : ii(r, e, i));
  });
}
function Vc(e, t, r, n) {
  Fe.readdir(e, (i, o) => i ? n(i) : zc(o, e, t, r, n));
}
function zc(e, t, r, n, i) {
  const o = e.pop();
  return o ? Gh(e, o, t, r, n, i) : i();
}
function Gh(e, t, r, n, i, o) {
  const s = xr.join(r, t), a = xr.join(n, t);
  Lr.checkPaths(s, a, "copy", i, (l, f) => {
    if (l) return o(l);
    const { destStat: c } = f;
    xh(c, s, a, i, (u) => u ? o(u) : zc(e, r, n, i, o));
  });
}
function Wh(e, t, r, n, i) {
  Fe.readlink(t, (o, s) => {
    if (o) return i(o);
    if (n.dereference && (s = xr.resolve(process.cwd(), s)), e)
      Fe.readlink(r, (a, l) => a ? a.code === "EINVAL" || a.code === "UNKNOWN" ? Fe.symlink(s, r, i) : i(a) : (n.dereference && (l = xr.resolve(process.cwd(), l)), Lr.isSrcSubdir(s, l) ? i(new Error(`Cannot copy '${s}' to a subdirectory of itself, '${l}'.`)) : e.isDirectory() && Lr.isSrcSubdir(l, s) ? i(new Error(`Cannot overwrite '${l}' with '${s}'.`)) : Vh(s, r, i)));
    else
      return Fe.symlink(s, r, i);
  });
}
function Vh(e, t, r) {
  Fe.unlink(t, (n) => n ? r(n) : Fe.symlink(e, t, r));
}
var zh = Fh;
const Ae = Ie, Ur = Q, Yh = tt.mkdirsSync, Xh = jc.utimesMillisSync, kr = hr;
function Jh(e, t, r) {
  typeof r == "function" && (r = { filter: r }), r = r || {}, r.clobber = "clobber" in r ? !!r.clobber : !0, r.overwrite = "overwrite" in r ? !!r.overwrite : r.clobber, r.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
    `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
    "Warning",
    "fs-extra-WARN0002"
  );
  const { srcStat: n, destStat: i } = kr.checkPathsSync(e, t, "copy", r);
  return kr.checkParentPathsSync(e, n, t, "copy"), Kh(i, e, t, r);
}
function Kh(e, t, r, n) {
  if (n.filter && !n.filter(t, r)) return;
  const i = Ur.dirname(r);
  return Ae.existsSync(i) || Yh(i), Yc(e, t, r, n);
}
function Qh(e, t, r, n) {
  if (!(n.filter && !n.filter(t, r)))
    return Yc(e, t, r, n);
}
function Yc(e, t, r, n) {
  const o = (n.dereference ? Ae.statSync : Ae.lstatSync)(t);
  if (o.isDirectory()) return op(o, e, t, r, n);
  if (o.isFile() || o.isCharacterDevice() || o.isBlockDevice()) return Zh(o, e, t, r, n);
  if (o.isSymbolicLink()) return lp(e, t, r, n);
  throw o.isSocket() ? new Error(`Cannot copy a socket file: ${t}`) : o.isFIFO() ? new Error(`Cannot copy a FIFO pipe: ${t}`) : new Error(`Unknown file: ${t}`);
}
function Zh(e, t, r, n, i) {
  return t ? ep(e, r, n, i) : Xc(e, r, n, i);
}
function ep(e, t, r, n) {
  if (n.overwrite)
    return Ae.unlinkSync(r), Xc(e, t, r, n);
  if (n.errorOnExist)
    throw new Error(`'${r}' already exists`);
}
function Xc(e, t, r, n) {
  return Ae.copyFileSync(t, r), n.preserveTimestamps && tp(e.mode, t, r), ds(r, e.mode);
}
function tp(e, t, r) {
  return rp(e) && np(r, e), ip(t, r);
}
function rp(e) {
  return (e & 128) === 0;
}
function np(e, t) {
  return ds(e, t | 128);
}
function ds(e, t) {
  return Ae.chmodSync(e, t);
}
function ip(e, t) {
  const r = Ae.statSync(e);
  return Xh(t, r.atime, r.mtime);
}
function op(e, t, r, n, i) {
  return t ? Jc(r, n, i) : sp(e.mode, r, n, i);
}
function sp(e, t, r, n) {
  return Ae.mkdirSync(r), Jc(t, r, n), ds(r, e);
}
function Jc(e, t, r) {
  Ae.readdirSync(e).forEach((n) => ap(n, e, t, r));
}
function ap(e, t, r, n) {
  const i = Ur.join(t, e), o = Ur.join(r, e), { destStat: s } = kr.checkPathsSync(i, o, "copy", n);
  return Qh(s, i, o, n);
}
function lp(e, t, r, n) {
  let i = Ae.readlinkSync(t);
  if (n.dereference && (i = Ur.resolve(process.cwd(), i)), e) {
    let o;
    try {
      o = Ae.readlinkSync(r);
    } catch (s) {
      if (s.code === "EINVAL" || s.code === "UNKNOWN") return Ae.symlinkSync(i, r);
      throw s;
    }
    if (n.dereference && (o = Ur.resolve(process.cwd(), o)), kr.isSrcSubdir(i, o))
      throw new Error(`Cannot copy '${i}' to a subdirectory of itself, '${o}'.`);
    if (Ae.statSync(r).isDirectory() && kr.isSrcSubdir(o, i))
      throw new Error(`Cannot overwrite '${o}' with '${i}'.`);
    return cp(i, r);
  } else
    return Ae.symlinkSync(i, r);
}
function cp(e, t) {
  return Ae.unlinkSync(t), Ae.symlinkSync(e, t);
}
var up = Jh;
const fp = Pe.fromCallback;
var hs = {
  copy: fp(zh),
  copySync: up
};
const da = Ie, Kc = Q, te = Ic, Mr = process.platform === "win32";
function Qc(e) {
  [
    "unlink",
    "chmod",
    "stat",
    "lstat",
    "rmdir",
    "readdir"
  ].forEach((r) => {
    e[r] = e[r] || da[r], r = r + "Sync", e[r] = e[r] || da[r];
  }), e.maxBusyTries = e.maxBusyTries || 3;
}
function ps(e, t, r) {
  let n = 0;
  typeof t == "function" && (r = t, t = {}), te(e, "rimraf: missing path"), te.strictEqual(typeof e, "string", "rimraf: path should be a string"), te.strictEqual(typeof r, "function", "rimraf: callback function required"), te(t, "rimraf: invalid options argument provided"), te.strictEqual(typeof t, "object", "rimraf: options should be object"), Qc(t), ha(e, t, function i(o) {
    if (o) {
      if ((o.code === "EBUSY" || o.code === "ENOTEMPTY" || o.code === "EPERM") && n < t.maxBusyTries) {
        n++;
        const s = n * 100;
        return setTimeout(() => ha(e, t, i), s);
      }
      o.code === "ENOENT" && (o = null);
    }
    r(o);
  });
}
function ha(e, t, r) {
  te(e), te(t), te(typeof r == "function"), t.lstat(e, (n, i) => {
    if (n && n.code === "ENOENT")
      return r(null);
    if (n && n.code === "EPERM" && Mr)
      return pa(e, t, n, r);
    if (i && i.isDirectory())
      return kn(e, t, n, r);
    t.unlink(e, (o) => {
      if (o) {
        if (o.code === "ENOENT")
          return r(null);
        if (o.code === "EPERM")
          return Mr ? pa(e, t, o, r) : kn(e, t, o, r);
        if (o.code === "EISDIR")
          return kn(e, t, o, r);
      }
      return r(o);
    });
  });
}
function pa(e, t, r, n) {
  te(e), te(t), te(typeof n == "function"), t.chmod(e, 438, (i) => {
    i ? n(i.code === "ENOENT" ? null : r) : t.stat(e, (o, s) => {
      o ? n(o.code === "ENOENT" ? null : r) : s.isDirectory() ? kn(e, t, r, n) : t.unlink(e, n);
    });
  });
}
function ma(e, t, r) {
  let n;
  te(e), te(t);
  try {
    t.chmodSync(e, 438);
  } catch (i) {
    if (i.code === "ENOENT")
      return;
    throw r;
  }
  try {
    n = t.statSync(e);
  } catch (i) {
    if (i.code === "ENOENT")
      return;
    throw r;
  }
  n.isDirectory() ? Mn(e, t, r) : t.unlinkSync(e);
}
function kn(e, t, r, n) {
  te(e), te(t), te(typeof n == "function"), t.rmdir(e, (i) => {
    i && (i.code === "ENOTEMPTY" || i.code === "EEXIST" || i.code === "EPERM") ? dp(e, t, n) : i && i.code === "ENOTDIR" ? n(r) : n(i);
  });
}
function dp(e, t, r) {
  te(e), te(t), te(typeof r == "function"), t.readdir(e, (n, i) => {
    if (n) return r(n);
    let o = i.length, s;
    if (o === 0) return t.rmdir(e, r);
    i.forEach((a) => {
      ps(Kc.join(e, a), t, (l) => {
        if (!s) {
          if (l) return r(s = l);
          --o === 0 && t.rmdir(e, r);
        }
      });
    });
  });
}
function Zc(e, t) {
  let r;
  t = t || {}, Qc(t), te(e, "rimraf: missing path"), te.strictEqual(typeof e, "string", "rimraf: path should be a string"), te(t, "rimraf: missing options"), te.strictEqual(typeof t, "object", "rimraf: options should be object");
  try {
    r = t.lstatSync(e);
  } catch (n) {
    if (n.code === "ENOENT")
      return;
    n.code === "EPERM" && Mr && ma(e, t, n);
  }
  try {
    r && r.isDirectory() ? Mn(e, t, null) : t.unlinkSync(e);
  } catch (n) {
    if (n.code === "ENOENT")
      return;
    if (n.code === "EPERM")
      return Mr ? ma(e, t, n) : Mn(e, t, n);
    if (n.code !== "EISDIR")
      throw n;
    Mn(e, t, n);
  }
}
function Mn(e, t, r) {
  te(e), te(t);
  try {
    t.rmdirSync(e);
  } catch (n) {
    if (n.code === "ENOTDIR")
      throw r;
    if (n.code === "ENOTEMPTY" || n.code === "EEXIST" || n.code === "EPERM")
      hp(e, t);
    else if (n.code !== "ENOENT")
      throw n;
  }
}
function hp(e, t) {
  if (te(e), te(t), t.readdirSync(e).forEach((r) => Zc(Kc.join(e, r), t)), Mr) {
    const r = Date.now();
    do
      try {
        return t.rmdirSync(e, t);
      } catch {
      }
    while (Date.now() - r < 500);
  } else
    return t.rmdirSync(e, t);
}
var pp = ps;
ps.sync = Zc;
const Wn = Ie, mp = Pe.fromCallback, eu = pp;
function gp(e, t) {
  if (Wn.rm) return Wn.rm(e, { recursive: !0, force: !0 }, t);
  eu(e, t);
}
function yp(e) {
  if (Wn.rmSync) return Wn.rmSync(e, { recursive: !0, force: !0 });
  eu.sync(e);
}
var oi = {
  remove: mp(gp),
  removeSync: yp
};
const Ep = Pe.fromPromise, tu = qt, ru = Q, nu = tt, iu = oi, ga = Ep(async function(t) {
  let r;
  try {
    r = await tu.readdir(t);
  } catch {
    return nu.mkdirs(t);
  }
  return Promise.all(r.map((n) => iu.remove(ru.join(t, n))));
});
function ya(e) {
  let t;
  try {
    t = tu.readdirSync(e);
  } catch {
    return nu.mkdirsSync(e);
  }
  t.forEach((r) => {
    r = ru.join(e, r), iu.removeSync(r);
  });
}
var vp = {
  emptyDirSync: ya,
  emptydirSync: ya,
  emptyDir: ga,
  emptydir: ga
};
const wp = Pe.fromCallback, ou = Q, ht = Ie, su = tt;
function _p(e, t) {
  function r() {
    ht.writeFile(e, "", (n) => {
      if (n) return t(n);
      t();
    });
  }
  ht.stat(e, (n, i) => {
    if (!n && i.isFile()) return t();
    const o = ou.dirname(e);
    ht.stat(o, (s, a) => {
      if (s)
        return s.code === "ENOENT" ? su.mkdirs(o, (l) => {
          if (l) return t(l);
          r();
        }) : t(s);
      a.isDirectory() ? r() : ht.readdir(o, (l) => {
        if (l) return t(l);
      });
    });
  });
}
function Sp(e) {
  let t;
  try {
    t = ht.statSync(e);
  } catch {
  }
  if (t && t.isFile()) return;
  const r = ou.dirname(e);
  try {
    ht.statSync(r).isDirectory() || ht.readdirSync(r);
  } catch (n) {
    if (n && n.code === "ENOENT") su.mkdirsSync(r);
    else throw n;
  }
  ht.writeFileSync(e, "");
}
var Ap = {
  createFile: wp(_p),
  createFileSync: Sp
};
const bp = Pe.fromCallback, au = Q, dt = Ie, lu = tt, Tp = Ht.pathExists, { areIdentical: cu } = hr;
function Cp(e, t, r) {
  function n(i, o) {
    dt.link(i, o, (s) => {
      if (s) return r(s);
      r(null);
    });
  }
  dt.lstat(t, (i, o) => {
    dt.lstat(e, (s, a) => {
      if (s)
        return s.message = s.message.replace("lstat", "ensureLink"), r(s);
      if (o && cu(a, o)) return r(null);
      const l = au.dirname(t);
      Tp(l, (f, c) => {
        if (f) return r(f);
        if (c) return n(e, t);
        lu.mkdirs(l, (u) => {
          if (u) return r(u);
          n(e, t);
        });
      });
    });
  });
}
function Op(e, t) {
  let r;
  try {
    r = dt.lstatSync(t);
  } catch {
  }
  try {
    const o = dt.lstatSync(e);
    if (r && cu(o, r)) return;
  } catch (o) {
    throw o.message = o.message.replace("lstat", "ensureLink"), o;
  }
  const n = au.dirname(t);
  return dt.existsSync(n) || lu.mkdirsSync(n), dt.linkSync(e, t);
}
var $p = {
  createLink: bp(Cp),
  createLinkSync: Op
};
const pt = Q, Ir = Ie, Rp = Ht.pathExists;
function Pp(e, t, r) {
  if (pt.isAbsolute(e))
    return Ir.lstat(e, (n) => n ? (n.message = n.message.replace("lstat", "ensureSymlink"), r(n)) : r(null, {
      toCwd: e,
      toDst: e
    }));
  {
    const n = pt.dirname(t), i = pt.join(n, e);
    return Rp(i, (o, s) => o ? r(o) : s ? r(null, {
      toCwd: i,
      toDst: e
    }) : Ir.lstat(e, (a) => a ? (a.message = a.message.replace("lstat", "ensureSymlink"), r(a)) : r(null, {
      toCwd: e,
      toDst: pt.relative(n, e)
    })));
  }
}
function Ip(e, t) {
  let r;
  if (pt.isAbsolute(e)) {
    if (r = Ir.existsSync(e), !r) throw new Error("absolute srcpath does not exist");
    return {
      toCwd: e,
      toDst: e
    };
  } else {
    const n = pt.dirname(t), i = pt.join(n, e);
    if (r = Ir.existsSync(i), r)
      return {
        toCwd: i,
        toDst: e
      };
    if (r = Ir.existsSync(e), !r) throw new Error("relative srcpath does not exist");
    return {
      toCwd: e,
      toDst: pt.relative(n, e)
    };
  }
}
var Dp = {
  symlinkPaths: Pp,
  symlinkPathsSync: Ip
};
const uu = Ie;
function Np(e, t, r) {
  if (r = typeof t == "function" ? t : r, t = typeof t == "function" ? !1 : t, t) return r(null, t);
  uu.lstat(e, (n, i) => {
    if (n) return r(null, "file");
    t = i && i.isDirectory() ? "dir" : "file", r(null, t);
  });
}
function Fp(e, t) {
  let r;
  if (t) return t;
  try {
    r = uu.lstatSync(e);
  } catch {
    return "file";
  }
  return r && r.isDirectory() ? "dir" : "file";
}
var xp = {
  symlinkType: Np,
  symlinkTypeSync: Fp
};
const Lp = Pe.fromCallback, fu = Q, Ve = qt, du = tt, Up = du.mkdirs, kp = du.mkdirsSync, hu = Dp, Mp = hu.symlinkPaths, Bp = hu.symlinkPathsSync, pu = xp, jp = pu.symlinkType, qp = pu.symlinkTypeSync, Hp = Ht.pathExists, { areIdentical: mu } = hr;
function Gp(e, t, r, n) {
  n = typeof r == "function" ? r : n, r = typeof r == "function" ? !1 : r, Ve.lstat(t, (i, o) => {
    !i && o.isSymbolicLink() ? Promise.all([
      Ve.stat(e),
      Ve.stat(t)
    ]).then(([s, a]) => {
      if (mu(s, a)) return n(null);
      Ea(e, t, r, n);
    }) : Ea(e, t, r, n);
  });
}
function Ea(e, t, r, n) {
  Mp(e, t, (i, o) => {
    if (i) return n(i);
    e = o.toDst, jp(o.toCwd, r, (s, a) => {
      if (s) return n(s);
      const l = fu.dirname(t);
      Hp(l, (f, c) => {
        if (f) return n(f);
        if (c) return Ve.symlink(e, t, a, n);
        Up(l, (u) => {
          if (u) return n(u);
          Ve.symlink(e, t, a, n);
        });
      });
    });
  });
}
function Wp(e, t, r) {
  let n;
  try {
    n = Ve.lstatSync(t);
  } catch {
  }
  if (n && n.isSymbolicLink()) {
    const a = Ve.statSync(e), l = Ve.statSync(t);
    if (mu(a, l)) return;
  }
  const i = Bp(e, t);
  e = i.toDst, r = qp(i.toCwd, r);
  const o = fu.dirname(t);
  return Ve.existsSync(o) || kp(o), Ve.symlinkSync(e, t, r);
}
var Vp = {
  createSymlink: Lp(Gp),
  createSymlinkSync: Wp
};
const { createFile: va, createFileSync: wa } = Ap, { createLink: _a, createLinkSync: Sa } = $p, { createSymlink: Aa, createSymlinkSync: ba } = Vp;
var zp = {
  // file
  createFile: va,
  createFileSync: wa,
  ensureFile: va,
  ensureFileSync: wa,
  // link
  createLink: _a,
  createLinkSync: Sa,
  ensureLink: _a,
  ensureLinkSync: Sa,
  // symlink
  createSymlink: Aa,
  createSymlinkSync: ba,
  ensureSymlink: Aa,
  ensureSymlinkSync: ba
};
function Yp(e, { EOL: t = `
`, finalEOL: r = !0, replacer: n = null, spaces: i } = {}) {
  const o = r ? t : "", s = JSON.stringify(e, n, i);
  if (s === void 0)
    throw new TypeError(`Converting ${typeof e} value to JSON is not supported`);
  return s.replace(/\n/g, t) + o;
}
function Xp(e) {
  return Buffer.isBuffer(e) && (e = e.toString("utf8")), e.replace(/^\uFEFF/, "");
}
var ms = { stringify: Yp, stripBom: Xp };
let ur;
try {
  ur = Ie;
} catch {
  ur = Ue;
}
const si = Pe, { stringify: gu, stripBom: yu } = ms;
async function Jp(e, t = {}) {
  typeof t == "string" && (t = { encoding: t });
  const r = t.fs || ur, n = "throws" in t ? t.throws : !0;
  let i = await si.fromCallback(r.readFile)(e, t);
  i = yu(i);
  let o;
  try {
    o = JSON.parse(i, t ? t.reviver : null);
  } catch (s) {
    if (n)
      throw s.message = `${e}: ${s.message}`, s;
    return null;
  }
  return o;
}
const Kp = si.fromPromise(Jp);
function Qp(e, t = {}) {
  typeof t == "string" && (t = { encoding: t });
  const r = t.fs || ur, n = "throws" in t ? t.throws : !0;
  try {
    let i = r.readFileSync(e, t);
    return i = yu(i), JSON.parse(i, t.reviver);
  } catch (i) {
    if (n)
      throw i.message = `${e}: ${i.message}`, i;
    return null;
  }
}
async function Zp(e, t, r = {}) {
  const n = r.fs || ur, i = gu(t, r);
  await si.fromCallback(n.writeFile)(e, i, r);
}
const em = si.fromPromise(Zp);
function tm(e, t, r = {}) {
  const n = r.fs || ur, i = gu(t, r);
  return n.writeFileSync(e, i, r);
}
var rm = {
  readFile: Kp,
  readFileSync: Qp,
  writeFile: em,
  writeFileSync: tm
};
const Sn = rm;
var nm = {
  // jsonfile exports
  readJson: Sn.readFile,
  readJsonSync: Sn.readFileSync,
  writeJson: Sn.writeFile,
  writeJsonSync: Sn.writeFileSync
};
const im = Pe.fromCallback, Dr = Ie, Eu = Q, vu = tt, om = Ht.pathExists;
function sm(e, t, r, n) {
  typeof r == "function" && (n = r, r = "utf8");
  const i = Eu.dirname(e);
  om(i, (o, s) => {
    if (o) return n(o);
    if (s) return Dr.writeFile(e, t, r, n);
    vu.mkdirs(i, (a) => {
      if (a) return n(a);
      Dr.writeFile(e, t, r, n);
    });
  });
}
function am(e, ...t) {
  const r = Eu.dirname(e);
  if (Dr.existsSync(r))
    return Dr.writeFileSync(e, ...t);
  vu.mkdirsSync(r), Dr.writeFileSync(e, ...t);
}
var gs = {
  outputFile: im(sm),
  outputFileSync: am
};
const { stringify: lm } = ms, { outputFile: cm } = gs;
async function um(e, t, r = {}) {
  const n = lm(t, r);
  await cm(e, n, r);
}
var fm = um;
const { stringify: dm } = ms, { outputFileSync: hm } = gs;
function pm(e, t, r) {
  const n = dm(t, r);
  hm(e, n, r);
}
var mm = pm;
const gm = Pe.fromPromise, Re = nm;
Re.outputJson = gm(fm);
Re.outputJsonSync = mm;
Re.outputJSON = Re.outputJson;
Re.outputJSONSync = Re.outputJsonSync;
Re.writeJSON = Re.writeJson;
Re.writeJSONSync = Re.writeJsonSync;
Re.readJSON = Re.readJson;
Re.readJSONSync = Re.readJsonSync;
var ym = Re;
const Em = Ie, Go = Q, vm = hs.copy, wu = oi.remove, wm = tt.mkdirp, _m = Ht.pathExists, Ta = hr;
function Sm(e, t, r, n) {
  typeof r == "function" && (n = r, r = {}), r = r || {};
  const i = r.overwrite || r.clobber || !1;
  Ta.checkPaths(e, t, "move", r, (o, s) => {
    if (o) return n(o);
    const { srcStat: a, isChangingCase: l = !1 } = s;
    Ta.checkParentPaths(e, a, t, "move", (f) => {
      if (f) return n(f);
      if (Am(t)) return Ca(e, t, i, l, n);
      wm(Go.dirname(t), (c) => c ? n(c) : Ca(e, t, i, l, n));
    });
  });
}
function Am(e) {
  const t = Go.dirname(e);
  return Go.parse(t).root === t;
}
function Ca(e, t, r, n, i) {
  if (n) return Li(e, t, r, i);
  if (r)
    return wu(t, (o) => o ? i(o) : Li(e, t, r, i));
  _m(t, (o, s) => o ? i(o) : s ? i(new Error("dest already exists.")) : Li(e, t, r, i));
}
function Li(e, t, r, n) {
  Em.rename(e, t, (i) => i ? i.code !== "EXDEV" ? n(i) : bm(e, t, r, n) : n());
}
function bm(e, t, r, n) {
  vm(e, t, {
    overwrite: r,
    errorOnExist: !0
  }, (o) => o ? n(o) : wu(e, n));
}
var Tm = Sm;
const _u = Ie, Wo = Q, Cm = hs.copySync, Su = oi.removeSync, Om = tt.mkdirpSync, Oa = hr;
function $m(e, t, r) {
  r = r || {};
  const n = r.overwrite || r.clobber || !1, { srcStat: i, isChangingCase: o = !1 } = Oa.checkPathsSync(e, t, "move", r);
  return Oa.checkParentPathsSync(e, i, t, "move"), Rm(t) || Om(Wo.dirname(t)), Pm(e, t, n, o);
}
function Rm(e) {
  const t = Wo.dirname(e);
  return Wo.parse(t).root === t;
}
function Pm(e, t, r, n) {
  if (n) return Ui(e, t, r);
  if (r)
    return Su(t), Ui(e, t, r);
  if (_u.existsSync(t)) throw new Error("dest already exists.");
  return Ui(e, t, r);
}
function Ui(e, t, r) {
  try {
    _u.renameSync(e, t);
  } catch (n) {
    if (n.code !== "EXDEV") throw n;
    return Im(e, t, r);
  }
}
function Im(e, t, r) {
  return Cm(e, t, {
    overwrite: r,
    errorOnExist: !0
  }), Su(e);
}
var Dm = $m;
const Nm = Pe.fromCallback;
var Fm = {
  move: Nm(Tm),
  moveSync: Dm
}, bt = {
  // Export promiseified graceful-fs:
  ...qt,
  // Export extra methods:
  ...hs,
  ...vp,
  ...zp,
  ...ym,
  ...tt,
  ...Fm,
  ...gs,
  ...Ht,
  ...oi
}, Gt = {}, yt = {}, he = {}, Et = {};
Object.defineProperty(Et, "__esModule", { value: !0 });
Et.CancellationError = Et.CancellationToken = void 0;
const xm = ri;
class Lm extends xm.EventEmitter {
  get cancelled() {
    return this._cancelled || this._parent != null && this._parent.cancelled;
  }
  set parent(t) {
    this.removeParentCancelHandler(), this._parent = t, this.parentCancelHandler = () => this.cancel(), this._parent.onCancel(this.parentCancelHandler);
  }
  // babel cannot compile ... correctly for super calls
  constructor(t) {
    super(), this.parentCancelHandler = null, this._parent = null, this._cancelled = !1, t != null && (this.parent = t);
  }
  cancel() {
    this._cancelled = !0, this.emit("cancel");
  }
  onCancel(t) {
    this.cancelled ? t() : this.once("cancel", t);
  }
  createPromise(t) {
    if (this.cancelled)
      return Promise.reject(new Vo());
    const r = () => {
      if (n != null)
        try {
          this.removeListener("cancel", n), n = null;
        } catch {
        }
    };
    let n = null;
    return new Promise((i, o) => {
      let s = null;
      if (n = () => {
        try {
          s != null && (s(), s = null);
        } finally {
          o(new Vo());
        }
      }, this.cancelled) {
        n();
        return;
      }
      this.onCancel(n), t(i, o, (a) => {
        s = a;
      });
    }).then((i) => (r(), i)).catch((i) => {
      throw r(), i;
    });
  }
  removeParentCancelHandler() {
    const t = this._parent;
    t != null && this.parentCancelHandler != null && (t.removeListener("cancel", this.parentCancelHandler), this.parentCancelHandler = null);
  }
  dispose() {
    try {
      this.removeParentCancelHandler();
    } finally {
      this.removeAllListeners(), this._parent = null;
    }
  }
}
Et.CancellationToken = Lm;
class Vo extends Error {
  constructor() {
    super("cancelled");
  }
}
Et.CancellationError = Vo;
var pr = {};
Object.defineProperty(pr, "__esModule", { value: !0 });
pr.newError = Um;
function Um(e, t) {
  const r = new Error(e);
  return r.code = t, r;
}
var $e = {}, zo = { exports: {} }, An = { exports: {} }, ki, $a;
function km() {
  if ($a) return ki;
  $a = 1;
  var e = 1e3, t = e * 60, r = t * 60, n = r * 24, i = n * 7, o = n * 365.25;
  ki = function(c, u) {
    u = u || {};
    var h = typeof c;
    if (h === "string" && c.length > 0)
      return s(c);
    if (h === "number" && isFinite(c))
      return u.long ? l(c) : a(c);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(c)
    );
  };
  function s(c) {
    if (c = String(c), !(c.length > 100)) {
      var u = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        c
      );
      if (u) {
        var h = parseFloat(u[1]), m = (u[2] || "ms").toLowerCase();
        switch (m) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return h * o;
          case "weeks":
          case "week":
          case "w":
            return h * i;
          case "days":
          case "day":
          case "d":
            return h * n;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return h * r;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return h * t;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return h * e;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return h;
          default:
            return;
        }
      }
    }
  }
  function a(c) {
    var u = Math.abs(c);
    return u >= n ? Math.round(c / n) + "d" : u >= r ? Math.round(c / r) + "h" : u >= t ? Math.round(c / t) + "m" : u >= e ? Math.round(c / e) + "s" : c + "ms";
  }
  function l(c) {
    var u = Math.abs(c);
    return u >= n ? f(c, u, n, "day") : u >= r ? f(c, u, r, "hour") : u >= t ? f(c, u, t, "minute") : u >= e ? f(c, u, e, "second") : c + " ms";
  }
  function f(c, u, h, m) {
    var E = u >= h * 1.5;
    return Math.round(c / h) + " " + m + (E ? "s" : "");
  }
  return ki;
}
var Mi, Ra;
function Au() {
  if (Ra) return Mi;
  Ra = 1;
  function e(t) {
    n.debug = n, n.default = n, n.coerce = f, n.disable = a, n.enable = o, n.enabled = l, n.humanize = km(), n.destroy = c, Object.keys(t).forEach((u) => {
      n[u] = t[u];
    }), n.names = [], n.skips = [], n.formatters = {};
    function r(u) {
      let h = 0;
      for (let m = 0; m < u.length; m++)
        h = (h << 5) - h + u.charCodeAt(m), h |= 0;
      return n.colors[Math.abs(h) % n.colors.length];
    }
    n.selectColor = r;
    function n(u) {
      let h, m = null, E, y;
      function S(...A) {
        if (!S.enabled)
          return;
        const T = S, D = Number(/* @__PURE__ */ new Date()), B = D - (h || D);
        T.diff = B, T.prev = h, T.curr = D, h = D, A[0] = n.coerce(A[0]), typeof A[0] != "string" && A.unshift("%O");
        let k = 0;
        A[0] = A[0].replace(/%([a-zA-Z%])/g, (V, Z) => {
          if (V === "%%")
            return "%";
          k++;
          const L = n.formatters[Z];
          if (typeof L == "function") {
            const v = A[k];
            V = L.call(T, v), A.splice(k, 1), k--;
          }
          return V;
        }), n.formatArgs.call(T, A), (T.log || n.log).apply(T, A);
      }
      return S.namespace = u, S.useColors = n.useColors(), S.color = n.selectColor(u), S.extend = i, S.destroy = n.destroy, Object.defineProperty(S, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => m !== null ? m : (E !== n.namespaces && (E = n.namespaces, y = n.enabled(u)), y),
        set: (A) => {
          m = A;
        }
      }), typeof n.init == "function" && n.init(S), S;
    }
    function i(u, h) {
      const m = n(this.namespace + (typeof h > "u" ? ":" : h) + u);
      return m.log = this.log, m;
    }
    function o(u) {
      n.save(u), n.namespaces = u, n.names = [], n.skips = [];
      const h = (typeof u == "string" ? u : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const m of h)
        m[0] === "-" ? n.skips.push(m.slice(1)) : n.names.push(m);
    }
    function s(u, h) {
      let m = 0, E = 0, y = -1, S = 0;
      for (; m < u.length; )
        if (E < h.length && (h[E] === u[m] || h[E] === "*"))
          h[E] === "*" ? (y = E, S = m, E++) : (m++, E++);
        else if (y !== -1)
          E = y + 1, S++, m = S;
        else
          return !1;
      for (; E < h.length && h[E] === "*"; )
        E++;
      return E === h.length;
    }
    function a() {
      const u = [
        ...n.names,
        ...n.skips.map((h) => "-" + h)
      ].join(",");
      return n.enable(""), u;
    }
    function l(u) {
      for (const h of n.skips)
        if (s(u, h))
          return !1;
      for (const h of n.names)
        if (s(u, h))
          return !0;
      return !1;
    }
    function f(u) {
      return u instanceof Error ? u.stack || u.message : u;
    }
    function c() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return n.enable(n.load()), n;
  }
  return Mi = e, Mi;
}
var Pa;
function Mm() {
  return Pa || (Pa = 1, function(e, t) {
    t.formatArgs = n, t.save = i, t.load = o, t.useColors = r, t.storage = s(), t.destroy = /* @__PURE__ */ (() => {
      let l = !1;
      return () => {
        l || (l = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
      };
    })(), t.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function r() {
      if (typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs))
        return !0;
      if (typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))
        return !1;
      let l;
      return typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && (l = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(l[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function n(l) {
      if (l[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + l[0] + (this.useColors ? "%c " : " ") + "+" + e.exports.humanize(this.diff), !this.useColors)
        return;
      const f = "color: " + this.color;
      l.splice(1, 0, f, "color: inherit");
      let c = 0, u = 0;
      l[0].replace(/%[a-zA-Z%]/g, (h) => {
        h !== "%%" && (c++, h === "%c" && (u = c));
      }), l.splice(u, 0, f);
    }
    t.log = console.debug || console.log || (() => {
    });
    function i(l) {
      try {
        l ? t.storage.setItem("debug", l) : t.storage.removeItem("debug");
      } catch {
      }
    }
    function o() {
      let l;
      try {
        l = t.storage.getItem("debug") || t.storage.getItem("DEBUG");
      } catch {
      }
      return !l && typeof process < "u" && "env" in process && (l = process.env.DEBUG), l;
    }
    function s() {
      try {
        return localStorage;
      } catch {
      }
    }
    e.exports = Au()(t);
    const { formatters: a } = e.exports;
    a.j = function(l) {
      try {
        return JSON.stringify(l);
      } catch (f) {
        return "[UnexpectedJSONParseError]: " + f.message;
      }
    };
  }(An, An.exports)), An.exports;
}
var bn = { exports: {} }, Bi, Ia;
function Bm() {
  return Ia || (Ia = 1, Bi = (e, t = process.argv) => {
    const r = e.startsWith("-") ? "" : e.length === 1 ? "-" : "--", n = t.indexOf(r + e), i = t.indexOf("--");
    return n !== -1 && (i === -1 || n < i);
  }), Bi;
}
var ji, Da;
function jm() {
  if (Da) return ji;
  Da = 1;
  const e = St, t = Dc, r = Bm(), { env: n } = process;
  let i;
  r("no-color") || r("no-colors") || r("color=false") || r("color=never") ? i = 0 : (r("color") || r("colors") || r("color=true") || r("color=always")) && (i = 1), "FORCE_COLOR" in n && (n.FORCE_COLOR === "true" ? i = 1 : n.FORCE_COLOR === "false" ? i = 0 : i = n.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(n.FORCE_COLOR, 10), 3));
  function o(l) {
    return l === 0 ? !1 : {
      level: l,
      hasBasic: !0,
      has256: l >= 2,
      has16m: l >= 3
    };
  }
  function s(l, f) {
    if (i === 0)
      return 0;
    if (r("color=16m") || r("color=full") || r("color=truecolor"))
      return 3;
    if (r("color=256"))
      return 2;
    if (l && !f && i === void 0)
      return 0;
    const c = i || 0;
    if (n.TERM === "dumb")
      return c;
    if (process.platform === "win32") {
      const u = e.release().split(".");
      return Number(u[0]) >= 10 && Number(u[2]) >= 10586 ? Number(u[2]) >= 14931 ? 3 : 2 : 1;
    }
    if ("CI" in n)
      return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((u) => u in n) || n.CI_NAME === "codeship" ? 1 : c;
    if ("TEAMCITY_VERSION" in n)
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(n.TEAMCITY_VERSION) ? 1 : 0;
    if (n.COLORTERM === "truecolor")
      return 3;
    if ("TERM_PROGRAM" in n) {
      const u = parseInt((n.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (n.TERM_PROGRAM) {
        case "iTerm.app":
          return u >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    return /-256(color)?$/i.test(n.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(n.TERM) || "COLORTERM" in n ? 1 : c;
  }
  function a(l) {
    const f = s(l, l && l.isTTY);
    return o(f);
  }
  return ji = {
    supportsColor: a,
    stdout: o(s(!0, t.isatty(1))),
    stderr: o(s(!0, t.isatty(2)))
  }, ji;
}
var Na;
function qm() {
  return Na || (Na = 1, function(e, t) {
    const r = Dc, n = ti;
    t.init = c, t.log = a, t.formatArgs = o, t.save = l, t.load = f, t.useColors = i, t.destroy = n.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    ), t.colors = [6, 2, 3, 4, 5, 1];
    try {
      const h = jm();
      h && (h.stderr || h).level >= 2 && (t.colors = [
        20,
        21,
        26,
        27,
        32,
        33,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        56,
        57,
        62,
        63,
        68,
        69,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        92,
        93,
        98,
        99,
        112,
        113,
        128,
        129,
        134,
        135,
        148,
        149,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        178,
        179,
        184,
        185,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        209,
        214,
        215,
        220,
        221
      ]);
    } catch {
    }
    t.inspectOpts = Object.keys(process.env).filter((h) => /^debug_/i.test(h)).reduce((h, m) => {
      const E = m.substring(6).toLowerCase().replace(/_([a-z])/g, (S, A) => A.toUpperCase());
      let y = process.env[m];
      return /^(yes|on|true|enabled)$/i.test(y) ? y = !0 : /^(no|off|false|disabled)$/i.test(y) ? y = !1 : y === "null" ? y = null : y = Number(y), h[E] = y, h;
    }, {});
    function i() {
      return "colors" in t.inspectOpts ? !!t.inspectOpts.colors : r.isatty(process.stderr.fd);
    }
    function o(h) {
      const { namespace: m, useColors: E } = this;
      if (E) {
        const y = this.color, S = "\x1B[3" + (y < 8 ? y : "8;5;" + y), A = `  ${S};1m${m} \x1B[0m`;
        h[0] = A + h[0].split(`
`).join(`
` + A), h.push(S + "m+" + e.exports.humanize(this.diff) + "\x1B[0m");
      } else
        h[0] = s() + m + " " + h[0];
    }
    function s() {
      return t.inspectOpts.hideDate ? "" : (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function a(...h) {
      return process.stderr.write(n.formatWithOptions(t.inspectOpts, ...h) + `
`);
    }
    function l(h) {
      h ? process.env.DEBUG = h : delete process.env.DEBUG;
    }
    function f() {
      return process.env.DEBUG;
    }
    function c(h) {
      h.inspectOpts = {};
      const m = Object.keys(t.inspectOpts);
      for (let E = 0; E < m.length; E++)
        h.inspectOpts[m[E]] = t.inspectOpts[m[E]];
    }
    e.exports = Au()(t);
    const { formatters: u } = e.exports;
    u.o = function(h) {
      return this.inspectOpts.colors = this.useColors, n.inspect(h, this.inspectOpts).split(`
`).map((m) => m.trim()).join(" ");
    }, u.O = function(h) {
      return this.inspectOpts.colors = this.useColors, n.inspect(h, this.inspectOpts);
    };
  }(bn, bn.exports)), bn.exports;
}
typeof process > "u" || process.type === "renderer" || process.browser === !0 || process.__nwjs ? zo.exports = Mm() : zo.exports = qm();
var Hm = zo.exports, en = {};
Object.defineProperty(en, "__esModule", { value: !0 });
en.ProgressCallbackTransform = void 0;
const Gm = Jr;
class Wm extends Gm.Transform {
  constructor(t, r, n) {
    super(), this.total = t, this.cancellationToken = r, this.onProgress = n, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.nextUpdate = this.start + 1e3;
  }
  _transform(t, r, n) {
    if (this.cancellationToken.cancelled) {
      n(new Error("cancelled"), null);
      return;
    }
    this.transferred += t.length, this.delta += t.length;
    const i = Date.now();
    i >= this.nextUpdate && this.transferred !== this.total && (this.nextUpdate = i + 1e3, this.onProgress({
      total: this.total,
      delta: this.delta,
      transferred: this.transferred,
      percent: this.transferred / this.total * 100,
      bytesPerSecond: Math.round(this.transferred / ((i - this.start) / 1e3))
    }), this.delta = 0), n(null, t);
  }
  _flush(t) {
    if (this.cancellationToken.cancelled) {
      t(new Error("cancelled"));
      return;
    }
    this.onProgress({
      total: this.total,
      delta: this.delta,
      transferred: this.total,
      percent: 100,
      bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
    }), this.delta = 0, t(null);
  }
}
en.ProgressCallbackTransform = Wm;
Object.defineProperty($e, "__esModule", { value: !0 });
$e.DigestTransform = $e.HttpExecutor = $e.HttpError = void 0;
$e.createHttpError = Xo;
$e.parseJson = Zm;
$e.configureRequestOptionsFromUrl = Tu;
$e.configureRequestUrl = Es;
$e.safeGetHeader = ar;
$e.configureRequestOptions = Vn;
$e.safeStringifyJson = zn;
const Vm = Qr, zm = Hm, Ym = Ue, Xm = Jr, Yo = At, Jm = Et, Fa = pr, Km = en, Dt = (0, zm.default)("electron-builder");
function Xo(e, t = null) {
  return new ys(e.statusCode || -1, `${e.statusCode} ${e.statusMessage}` + (t == null ? "" : `
` + JSON.stringify(t, null, "  ")) + `
Headers: ` + zn(e.headers), t);
}
const Qm = /* @__PURE__ */ new Map([
  [429, "Too many requests"],
  [400, "Bad request"],
  [403, "Forbidden"],
  [404, "Not found"],
  [405, "Method not allowed"],
  [406, "Not acceptable"],
  [408, "Request timeout"],
  [413, "Request entity too large"],
  [500, "Internal server error"],
  [502, "Bad gateway"],
  [503, "Service unavailable"],
  [504, "Gateway timeout"],
  [505, "HTTP version not supported"]
]);
class ys extends Error {
  constructor(t, r = `HTTP error: ${Qm.get(t) || t}`, n = null) {
    super(r), this.statusCode = t, this.description = n, this.name = "HttpError", this.code = `HTTP_ERROR_${t}`;
  }
  isServerError() {
    return this.statusCode >= 500 && this.statusCode <= 599;
  }
}
$e.HttpError = ys;
function Zm(e) {
  return e.then((t) => t == null || t.length === 0 ? null : JSON.parse(t));
}
class tr {
  constructor() {
    this.maxRedirects = 10;
  }
  request(t, r = new Jm.CancellationToken(), n) {
    Vn(t);
    const i = n == null ? void 0 : JSON.stringify(n), o = i ? Buffer.from(i) : void 0;
    if (o != null) {
      Dt(i);
      const { headers: s, ...a } = t;
      t = {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": o.length,
          ...s
        },
        ...a
      };
    }
    return this.doApiRequest(t, r, (s) => s.end(o));
  }
  doApiRequest(t, r, n, i = 0) {
    return Dt.enabled && Dt(`Request: ${zn(t)}`), r.createPromise((o, s, a) => {
      const l = this.createRequest(t, (f) => {
        try {
          this.handleResponse(f, t, r, o, s, i, n);
        } catch (c) {
          s(c);
        }
      });
      this.addErrorAndTimeoutHandlers(l, s, t.timeout), this.addRedirectHandlers(l, t, s, i, (f) => {
        this.doApiRequest(f, r, n, i).then(o).catch(s);
      }), n(l, s), a(() => l.abort());
    });
  }
  // noinspection JSUnusedLocalSymbols
  // eslint-disable-next-line
  addRedirectHandlers(t, r, n, i, o) {
  }
  addErrorAndTimeoutHandlers(t, r, n = 60 * 1e3) {
    this.addTimeOutHandler(t, r, n), t.on("error", r), t.on("aborted", () => {
      r(new Error("Request has been aborted by the server"));
    });
  }
  handleResponse(t, r, n, i, o, s, a) {
    var l;
    if (Dt.enabled && Dt(`Response: ${t.statusCode} ${t.statusMessage}, request options: ${zn(r)}`), t.statusCode === 404) {
      o(Xo(t, `method: ${r.method || "GET"} url: ${r.protocol || "https:"}//${r.hostname}${r.port ? `:${r.port}` : ""}${r.path}

Please double check that your authentication token is correct. Due to security reasons, actual status maybe not reported, but 404.
`));
      return;
    } else if (t.statusCode === 204) {
      i();
      return;
    }
    const f = (l = t.statusCode) !== null && l !== void 0 ? l : 0, c = f >= 300 && f < 400, u = ar(t, "location");
    if (c && u != null) {
      if (s > this.maxRedirects) {
        o(this.createMaxRedirectError());
        return;
      }
      this.doApiRequest(tr.prepareRedirectUrlOptions(u, r), n, a, s).then(i).catch(o);
      return;
    }
    t.setEncoding("utf8");
    let h = "";
    t.on("error", o), t.on("data", (m) => h += m), t.on("end", () => {
      try {
        if (t.statusCode != null && t.statusCode >= 400) {
          const m = ar(t, "content-type"), E = m != null && (Array.isArray(m) ? m.find((y) => y.includes("json")) != null : m.includes("json"));
          o(Xo(t, `method: ${r.method || "GET"} url: ${r.protocol || "https:"}//${r.hostname}${r.port ? `:${r.port}` : ""}${r.path}

          Data:
          ${E ? JSON.stringify(JSON.parse(h)) : h}
          `));
        } else
          i(h.length === 0 ? null : h);
      } catch (m) {
        o(m);
      }
    });
  }
  async downloadToBuffer(t, r) {
    return await r.cancellationToken.createPromise((n, i, o) => {
      const s = [], a = {
        headers: r.headers || void 0,
        // because PrivateGitHubProvider requires HttpExecutor.prepareRedirectUrlOptions logic, so, we need to redirect manually
        redirect: "manual"
      };
      Es(t, a), Vn(a), this.doDownload(a, {
        destination: null,
        options: r,
        onCancel: o,
        callback: (l) => {
          l == null ? n(Buffer.concat(s)) : i(l);
        },
        responseHandler: (l, f) => {
          let c = 0;
          l.on("data", (u) => {
            if (c += u.length, c > 524288e3) {
              f(new Error("Maximum allowed size is 500 MB"));
              return;
            }
            s.push(u);
          }), l.on("end", () => {
            f(null);
          });
        }
      }, 0);
    });
  }
  doDownload(t, r, n) {
    const i = this.createRequest(t, (o) => {
      if (o.statusCode >= 400) {
        r.callback(new Error(`Cannot download "${t.protocol || "https:"}//${t.hostname}${t.path}", status ${o.statusCode}: ${o.statusMessage}`));
        return;
      }
      o.on("error", r.callback);
      const s = ar(o, "location");
      if (s != null) {
        n < this.maxRedirects ? this.doDownload(tr.prepareRedirectUrlOptions(s, t), r, n++) : r.callback(this.createMaxRedirectError());
        return;
      }
      r.responseHandler == null ? tg(r, o) : r.responseHandler(o, r.callback);
    });
    this.addErrorAndTimeoutHandlers(i, r.callback, t.timeout), this.addRedirectHandlers(i, t, r.callback, n, (o) => {
      this.doDownload(o, r, n++);
    }), i.end();
  }
  createMaxRedirectError() {
    return new Error(`Too many redirects (> ${this.maxRedirects})`);
  }
  addTimeOutHandler(t, r, n) {
    t.on("socket", (i) => {
      i.setTimeout(n, () => {
        t.abort(), r(new Error("Request timed out"));
      });
    });
  }
  static prepareRedirectUrlOptions(t, r) {
    const n = Tu(t, { ...r }), i = n.headers;
    if (i != null && i.authorization) {
      const o = tr.reconstructOriginalUrl(r), s = bu(t, r);
      tr.isCrossOriginRedirect(o, s) && (Dt.enabled && Dt(`Given the cross-origin redirect (from ${o.host} to ${s.host}), the Authorization header will be stripped out.`), delete i.authorization);
    }
    return n;
  }
  static reconstructOriginalUrl(t) {
    const r = t.protocol || "https:";
    if (!t.hostname)
      throw new Error("Missing hostname in request options");
    const n = t.hostname, i = t.port ? `:${t.port}` : "", o = t.path || "/";
    return new Yo.URL(`${r}//${n}${i}${o}`);
  }
  static isCrossOriginRedirect(t, r) {
    if (t.hostname.toLowerCase() !== r.hostname.toLowerCase())
      return !0;
    if (t.protocol === "http:" && // This can be replaced with `!originalUrl.port`, but for the sake of clarity.
    ["80", ""].includes(t.port) && r.protocol === "https:" && // This can be replaced with `!redirectUrl.port`, but for the sake of clarity.
    ["443", ""].includes(r.port))
      return !1;
    if (t.protocol !== r.protocol)
      return !0;
    const n = t.port, i = r.port;
    return n !== i;
  }
  static retryOnServerError(t, r = 3) {
    for (let n = 0; ; n++)
      try {
        return t();
      } catch (i) {
        if (n < r && (i instanceof ys && i.isServerError() || i.code === "EPIPE"))
          continue;
        throw i;
      }
  }
}
$e.HttpExecutor = tr;
function bu(e, t) {
  try {
    return new Yo.URL(e);
  } catch {
    const r = t.hostname, n = t.protocol || "https:", i = t.port ? `:${t.port}` : "", o = `${n}//${r}${i}`;
    return new Yo.URL(e, o);
  }
}
function Tu(e, t) {
  const r = Vn(t), n = bu(e, t);
  return Es(n, r), r;
}
function Es(e, t) {
  t.protocol = e.protocol, t.hostname = e.hostname, e.port ? t.port = e.port : t.port && delete t.port, t.path = e.pathname + e.search;
}
class Jo extends Xm.Transform {
  // noinspection JSUnusedGlobalSymbols
  get actual() {
    return this._actual;
  }
  constructor(t, r = "sha512", n = "base64") {
    super(), this.expected = t, this.algorithm = r, this.encoding = n, this._actual = null, this.isValidateOnEnd = !0, this.digester = (0, Vm.createHash)(r);
  }
  // noinspection JSUnusedGlobalSymbols
  _transform(t, r, n) {
    this.digester.update(t), n(null, t);
  }
  // noinspection JSUnusedGlobalSymbols
  _flush(t) {
    if (this._actual = this.digester.digest(this.encoding), this.isValidateOnEnd)
      try {
        this.validate();
      } catch (r) {
        t(r);
        return;
      }
    t(null);
  }
  validate() {
    if (this._actual == null)
      throw (0, Fa.newError)("Not finished yet", "ERR_STREAM_NOT_FINISHED");
    if (this._actual !== this.expected)
      throw (0, Fa.newError)(`${this.algorithm} checksum mismatch, expected ${this.expected}, got ${this._actual}`, "ERR_CHECKSUM_MISMATCH");
    return null;
  }
}
$e.DigestTransform = Jo;
function eg(e, t, r) {
  return e != null && t != null && e !== t ? (r(new Error(`checksum mismatch: expected ${t} but got ${e} (X-Checksum-Sha2 header)`)), !1) : !0;
}
function ar(e, t) {
  const r = e.headers[t];
  return r == null ? null : Array.isArray(r) ? r.length === 0 ? null : r[r.length - 1] : r;
}
function tg(e, t) {
  if (!eg(ar(t, "X-Checksum-Sha2"), e.options.sha2, e.callback))
    return;
  const r = [];
  if (e.options.onProgress != null) {
    const s = ar(t, "content-length");
    s != null && r.push(new Km.ProgressCallbackTransform(parseInt(s, 10), e.options.cancellationToken, e.options.onProgress));
  }
  const n = e.options.sha512;
  n != null ? r.push(new Jo(n, "sha512", n.length === 128 && !n.includes("+") && !n.includes("Z") && !n.includes("=") ? "hex" : "base64")) : e.options.sha2 != null && r.push(new Jo(e.options.sha2, "sha256", "hex"));
  const i = (0, Ym.createWriteStream)(e.destination);
  r.push(i);
  let o = t;
  for (const s of r)
    s.on("error", (a) => {
      i.close(), e.options.cancellationToken.cancelled || e.callback(a);
    }), o = o.pipe(s);
  i.on("finish", () => {
    i.close(e.callback);
  });
}
function Vn(e, t, r) {
  r != null && (e.method = r), e.headers = { ...e.headers };
  const n = e.headers;
  return t != null && (n.authorization = t.startsWith("Basic") || t.startsWith("Bearer") ? t : `token ${t}`), n["User-Agent"] == null && (n["User-Agent"] = "electron-builder"), (r == null || r === "GET" || n["Cache-Control"] == null) && (n["Cache-Control"] = "no-cache"), e.protocol == null && process.versions.electron != null && (e.protocol = "https:"), e;
}
function zn(e, t) {
  return JSON.stringify(e, (r, n) => r.endsWith("Authorization") || r.endsWith("authorization") || r.endsWith("Password") || r.endsWith("PASSWORD") || r.endsWith("Token") || r.includes("password") || r.includes("token") || t != null && t.has(r) ? "<stripped sensitive data>" : n, 2);
}
var ai = {};
Object.defineProperty(ai, "__esModule", { value: !0 });
ai.MemoLazy = void 0;
class rg {
  constructor(t, r) {
    this.selector = t, this.creator = r, this.selected = void 0, this._value = void 0;
  }
  get hasValue() {
    return this._value !== void 0;
  }
  get value() {
    const t = this.selector();
    if (this._value !== void 0 && Cu(this.selected, t))
      return this._value;
    this.selected = t;
    const r = this.creator(t);
    return this.value = r, r;
  }
  set value(t) {
    this._value = t;
  }
}
ai.MemoLazy = rg;
function Cu(e, t) {
  if (typeof e == "object" && e !== null && (typeof t == "object" && t !== null)) {
    const i = Object.keys(e), o = Object.keys(t);
    return i.length === o.length && i.every((s) => Cu(e[s], t[s]));
  }
  return e === t;
}
var tn = {};
Object.defineProperty(tn, "__esModule", { value: !0 });
tn.githubUrl = ng;
tn.githubTagPrefix = ig;
tn.getS3LikeProviderBaseUrl = og;
function ng(e, t = "github.com") {
  return `${e.protocol || "https"}://${e.host || t}`;
}
function ig(e) {
  var t;
  return e.tagNamePrefix ? e.tagNamePrefix : !((t = e.vPrefixedTagName) !== null && t !== void 0) || t ? "v" : "";
}
function og(e) {
  const t = e.provider;
  if (t === "s3")
    return sg(e);
  if (t === "spaces")
    return ag(e);
  throw new Error(`Not supported provider: ${t}`);
}
function sg(e) {
  let t;
  if (e.accelerate == !0)
    t = `https://${e.bucket}.s3-accelerate.amazonaws.com`;
  else if (e.endpoint != null)
    t = `${e.endpoint}/${e.bucket}`;
  else if (e.bucket.includes(".")) {
    if (e.region == null)
      throw new Error(`Bucket name "${e.bucket}" includes a dot, but S3 region is missing`);
    e.region === "us-east-1" ? t = `https://s3.amazonaws.com/${e.bucket}` : t = `https://s3-${e.region}.amazonaws.com/${e.bucket}`;
  } else e.region === "cn-north-1" ? t = `https://${e.bucket}.s3.${e.region}.amazonaws.com.cn` : t = `https://${e.bucket}.s3.amazonaws.com`;
  return Ou(t, e.path);
}
function Ou(e, t) {
  return t != null && t.length > 0 && (t.startsWith("/") || (e += "/"), e += t), e;
}
function ag(e) {
  if (e.name == null)
    throw new Error("name is missing");
  if (e.region == null)
    throw new Error("region is missing");
  return Ou(`https://${e.name}.${e.region}.digitaloceanspaces.com`, e.path);
}
var vs = {};
Object.defineProperty(vs, "__esModule", { value: !0 });
vs.retry = $u;
const lg = Et;
async function $u(e, t) {
  var r;
  const { retries: n, interval: i, backoff: o = 0, attempt: s = 0, shouldRetry: a, cancellationToken: l = new lg.CancellationToken() } = t;
  try {
    return await e();
  } catch (f) {
    if (await Promise.resolve((r = a == null ? void 0 : a(f)) !== null && r !== void 0 ? r : !0) && n > 0 && !l.cancelled)
      return await new Promise((c) => setTimeout(c, i + o * s)), await $u(e, { ...t, retries: n - 1, attempt: s + 1 });
    throw f;
  }
}
var ws = {};
Object.defineProperty(ws, "__esModule", { value: !0 });
ws.parseDn = cg;
function cg(e) {
  let t = !1, r = null, n = "", i = 0;
  e = e.trim();
  const o = /* @__PURE__ */ new Map();
  for (let s = 0; s <= e.length; s++) {
    if (s === e.length) {
      r !== null && o.set(r, n);
      break;
    }
    const a = e[s];
    if (t) {
      if (a === '"') {
        t = !1;
        continue;
      }
    } else {
      if (a === '"') {
        t = !0;
        continue;
      }
      if (a === "\\") {
        s++;
        const l = parseInt(e.slice(s, s + 2), 16);
        Number.isNaN(l) ? n += e[s] : (s++, n += String.fromCharCode(l));
        continue;
      }
      if (r === null && a === "=") {
        r = n, n = "";
        continue;
      }
      if (a === "," || a === ";" || a === "+") {
        r !== null && o.set(r, n), r = null, n = "";
        continue;
      }
    }
    if (a === " " && !t) {
      if (n.length === 0)
        continue;
      if (s > i) {
        let l = s;
        for (; e[l] === " "; )
          l++;
        i = l;
      }
      if (i >= e.length || e[i] === "," || e[i] === ";" || r === null && e[i] === "=" || r !== null && e[i] === "+") {
        s = i - 1;
        continue;
      }
    }
    n += a;
  }
  return o;
}
var fr = {};
Object.defineProperty(fr, "__esModule", { value: !0 });
fr.nil = fr.UUID = void 0;
const Ru = Qr, Pu = pr, ug = "options.name must be either a string or a Buffer", xa = (0, Ru.randomBytes)(16);
xa[0] = xa[0] | 1;
const Bn = {}, X = [];
for (let e = 0; e < 256; e++) {
  const t = (e + 256).toString(16).substr(1);
  Bn[t] = e, X[e] = t;
}
class Bt {
  constructor(t) {
    this.ascii = null, this.binary = null;
    const r = Bt.check(t);
    if (!r)
      throw new Error("not a UUID");
    this.version = r.version, r.format === "ascii" ? this.ascii = t : this.binary = t;
  }
  static v5(t, r) {
    return fg(t, "sha1", 80, r);
  }
  toString() {
    return this.ascii == null && (this.ascii = dg(this.binary)), this.ascii;
  }
  inspect() {
    return `UUID v${this.version} ${this.toString()}`;
  }
  static check(t, r = 0) {
    if (typeof t == "string")
      return t = t.toLowerCase(), /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-([a-f0-9]{12})$/.test(t) ? t === "00000000-0000-0000-0000-000000000000" ? { version: void 0, variant: "nil", format: "ascii" } : {
        version: (Bn[t[14] + t[15]] & 240) >> 4,
        variant: La((Bn[t[19] + t[20]] & 224) >> 5),
        format: "ascii"
      } : !1;
    if (Buffer.isBuffer(t)) {
      if (t.length < r + 16)
        return !1;
      let n = 0;
      for (; n < 16 && t[r + n] === 0; n++)
        ;
      return n === 16 ? { version: void 0, variant: "nil", format: "binary" } : {
        version: (t[r + 6] & 240) >> 4,
        variant: La((t[r + 8] & 224) >> 5),
        format: "binary"
      };
    }
    throw (0, Pu.newError)("Unknown type of uuid", "ERR_UNKNOWN_UUID_TYPE");
  }
  // read stringified uuid into a Buffer
  static parse(t) {
    const r = Buffer.allocUnsafe(16);
    let n = 0;
    for (let i = 0; i < 16; i++)
      r[i] = Bn[t[n++] + t[n++]], (i === 3 || i === 5 || i === 7 || i === 9) && (n += 1);
    return r;
  }
}
fr.UUID = Bt;
Bt.OID = Bt.parse("6ba7b812-9dad-11d1-80b4-00c04fd430c8");
function La(e) {
  switch (e) {
    case 0:
    case 1:
    case 3:
      return "ncs";
    case 4:
    case 5:
      return "rfc4122";
    case 6:
      return "microsoft";
    default:
      return "future";
  }
}
var Nr;
(function(e) {
  e[e.ASCII = 0] = "ASCII", e[e.BINARY = 1] = "BINARY", e[e.OBJECT = 2] = "OBJECT";
})(Nr || (Nr = {}));
function fg(e, t, r, n, i = Nr.ASCII) {
  const o = (0, Ru.createHash)(t);
  if (typeof e != "string" && !Buffer.isBuffer(e))
    throw (0, Pu.newError)(ug, "ERR_INVALID_UUID_NAME");
  o.update(n), o.update(e);
  const a = o.digest();
  let l;
  switch (i) {
    case Nr.BINARY:
      a[6] = a[6] & 15 | r, a[8] = a[8] & 63 | 128, l = a;
      break;
    case Nr.OBJECT:
      a[6] = a[6] & 15 | r, a[8] = a[8] & 63 | 128, l = new Bt(a);
      break;
    default:
      l = X[a[0]] + X[a[1]] + X[a[2]] + X[a[3]] + "-" + X[a[4]] + X[a[5]] + "-" + X[a[6] & 15 | r] + X[a[7]] + "-" + X[a[8] & 63 | 128] + X[a[9]] + "-" + X[a[10]] + X[a[11]] + X[a[12]] + X[a[13]] + X[a[14]] + X[a[15]];
      break;
  }
  return l;
}
function dg(e) {
  return X[e[0]] + X[e[1]] + X[e[2]] + X[e[3]] + "-" + X[e[4]] + X[e[5]] + "-" + X[e[6]] + X[e[7]] + "-" + X[e[8]] + X[e[9]] + "-" + X[e[10]] + X[e[11]] + X[e[12]] + X[e[13]] + X[e[14]] + X[e[15]];
}
fr.nil = new Bt("00000000-0000-0000-0000-000000000000");
var rn = {}, Iu = {};
(function(e) {
  (function(t) {
    t.parser = function(p, d) {
      return new n(p, d);
    }, t.SAXParser = n, t.SAXStream = u, t.createStream = f, t.MAX_BUFFER_LENGTH = 64 * 1024;
    var r = [
      "comment",
      "sgmlDecl",
      "textNode",
      "tagName",
      "doctype",
      "procInstName",
      "procInstBody",
      "entity",
      "attribName",
      "attribValue",
      "cdata",
      "script"
    ];
    t.EVENTS = [
      "text",
      "processinginstruction",
      "sgmldeclaration",
      "doctype",
      "comment",
      "opentagstart",
      "attribute",
      "opentag",
      "closetag",
      "opencdata",
      "cdata",
      "closecdata",
      "error",
      "end",
      "ready",
      "script",
      "opennamespace",
      "closenamespace"
    ];
    function n(p, d) {
      if (!(this instanceof n))
        return new n(p, d);
      var b = this;
      o(b), b.q = b.c = "", b.bufferCheckPosition = t.MAX_BUFFER_LENGTH, b.encoding = null, b.opt = d || {}, b.opt.lowercase = b.opt.lowercase || b.opt.lowercasetags, b.looseCase = b.opt.lowercase ? "toLowerCase" : "toUpperCase", b.opt.maxEntityCount = b.opt.maxEntityCount || 512, b.opt.maxEntityDepth = b.opt.maxEntityDepth || 4, b.entityCount = b.entityDepth = 0, b.tags = [], b.closed = b.closedRoot = b.sawRoot = !1, b.tag = b.error = null, b.strict = !!p, b.noscript = !!(p || b.opt.noscript), b.state = v.BEGIN, b.strictEntities = b.opt.strictEntities, b.ENTITIES = b.strictEntities ? Object.create(t.XML_ENTITIES) : Object.create(t.ENTITIES), b.attribList = [], b.opt.xmlns && (b.ns = Object.create(S)), b.opt.unquotedAttributeValues === void 0 && (b.opt.unquotedAttributeValues = !p), b.trackPosition = b.opt.position !== !1, b.trackPosition && (b.position = b.line = b.column = 0), K(b, "onready");
    }
    Object.create || (Object.create = function(p) {
      function d() {
      }
      d.prototype = p;
      var b = new d();
      return b;
    }), Object.keys || (Object.keys = function(p) {
      var d = [];
      for (var b in p) p.hasOwnProperty(b) && d.push(b);
      return d;
    });
    function i(p) {
      for (var d = Math.max(t.MAX_BUFFER_LENGTH, 10), b = 0, w = 0, J = r.length; w < J; w++) {
        var ie = p[r[w]].length;
        if (ie > d)
          switch (r[w]) {
            case "textNode":
              N(p);
              break;
            case "cdata":
              O(p, "oncdata", p.cdata), p.cdata = "";
              break;
            case "script":
              O(p, "onscript", p.script), p.script = "";
              break;
            default:
              M(p, "Max buffer length exceeded: " + r[w]);
          }
        b = Math.max(b, ie);
      }
      var le = t.MAX_BUFFER_LENGTH - b;
      p.bufferCheckPosition = le + p.position;
    }
    function o(p) {
      for (var d = 0, b = r.length; d < b; d++)
        p[r[d]] = "";
    }
    function s(p) {
      N(p), p.cdata !== "" && (O(p, "oncdata", p.cdata), p.cdata = ""), p.script !== "" && (O(p, "onscript", p.script), p.script = "");
    }
    n.prototype = {
      end: function() {
        Y(this);
      },
      write: fn,
      resume: function() {
        return this.error = null, this;
      },
      close: function() {
        return this.write(null);
      },
      flush: function() {
        s(this);
      }
    };
    var a;
    try {
      a = require("stream").Stream;
    } catch {
      a = function() {
      };
    }
    a || (a = function() {
    });
    var l = t.EVENTS.filter(function(p) {
      return p !== "error" && p !== "end";
    });
    function f(p, d) {
      return new u(p, d);
    }
    function c(p, d) {
      if (p.length >= 2) {
        if (p[0] === 255 && p[1] === 254)
          return "utf-16le";
        if (p[0] === 254 && p[1] === 255)
          return "utf-16be";
      }
      return p.length >= 3 && p[0] === 239 && p[1] === 187 && p[2] === 191 ? "utf8" : p.length >= 4 ? p[0] === 60 && p[1] === 0 && p[2] === 63 && p[3] === 0 ? "utf-16le" : p[0] === 0 && p[1] === 60 && p[2] === 0 && p[3] === 63 ? "utf-16be" : "utf8" : d ? "utf8" : null;
    }
    function u(p, d) {
      if (!(this instanceof u))
        return new u(p, d);
      a.apply(this), this._parser = new n(p, d), this.writable = !0, this.readable = !0;
      var b = this;
      this._parser.onend = function() {
        b.emit("end");
      }, this._parser.onerror = function(w) {
        b.emit("error", w), b._parser.error = null;
      }, this._decoder = null, this._decoderBuffer = null, l.forEach(function(w) {
        Object.defineProperty(b, "on" + w, {
          get: function() {
            return b._parser["on" + w];
          },
          set: function(J) {
            if (!J)
              return b.removeAllListeners(w), b._parser["on" + w] = J, J;
            b.on(w, J);
          },
          enumerable: !0,
          configurable: !1
        });
      });
    }
    u.prototype = Object.create(a.prototype, {
      constructor: {
        value: u
      }
    }), u.prototype._decodeBuffer = function(p, d) {
      if (this._decoderBuffer && (p = Buffer.concat([this._decoderBuffer, p]), this._decoderBuffer = null), !this._decoder) {
        var b = c(p, d);
        if (!b)
          return this._decoderBuffer = p, "";
        this._parser.encoding = b, this._decoder = new TextDecoder(b);
      }
      return this._decoder.decode(p, { stream: !d });
    }, u.prototype.write = function(p) {
      if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(p))
        p = this._decodeBuffer(p, !1);
      else if (this._decoderBuffer) {
        var d = this._decodeBuffer(Buffer.alloc(0), !0);
        d && (this._parser.write(d), this.emit("data", d));
      }
      return this._parser.write(p.toString()), this.emit("data", p), !0;
    }, u.prototype.end = function(p) {
      if (p && p.length && this.write(p), this._decoderBuffer) {
        var d = this._decodeBuffer(Buffer.alloc(0), !0);
        d && (this._parser.write(d), this.emit("data", d));
      } else if (this._decoder) {
        var b = this._decoder.decode();
        b && (this._parser.write(b), this.emit("data", b));
      }
      return this._parser.end(), !0;
    }, u.prototype.on = function(p, d) {
      var b = this;
      return !b._parser["on" + p] && l.indexOf(p) !== -1 && (b._parser["on" + p] = function() {
        var w = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
        w.splice(0, 0, p), b.emit.apply(b, w);
      }), a.prototype.on.call(b, p, d);
    };
    var h = "[CDATA[", m = "DOCTYPE", E = "http://www.w3.org/XML/1998/namespace", y = "http://www.w3.org/2000/xmlns/", S = { xml: E, xmlns: y }, A = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, T = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, D = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, B = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
    function k(p) {
      return p === " " || p === `
` || p === "\r" || p === "	";
    }
    function q(p) {
      return p === '"' || p === "'";
    }
    function V(p) {
      return p === ">" || k(p);
    }
    function Z(p, d) {
      return p.test(d);
    }
    function L(p, d) {
      return !Z(p, d);
    }
    var v = 0;
    t.STATE = {
      BEGIN: v++,
      // leading byte order mark or whitespace
      BEGIN_WHITESPACE: v++,
      // leading whitespace
      TEXT: v++,
      // general stuff
      TEXT_ENTITY: v++,
      // &amp and such.
      OPEN_WAKA: v++,
      // <
      SGML_DECL: v++,
      // <!BLARG
      SGML_DECL_QUOTED: v++,
      // <!BLARG foo "bar
      DOCTYPE: v++,
      // <!DOCTYPE
      DOCTYPE_QUOTED: v++,
      // <!DOCTYPE "//blah
      DOCTYPE_DTD: v++,
      // <!DOCTYPE "//blah" [ ...
      DOCTYPE_DTD_QUOTED: v++,
      // <!DOCTYPE "//blah" [ "foo
      COMMENT_STARTING: v++,
      // <!-
      COMMENT: v++,
      // <!--
      COMMENT_ENDING: v++,
      // <!-- blah -
      COMMENT_ENDED: v++,
      // <!-- blah --
      CDATA: v++,
      // <![CDATA[ something
      CDATA_ENDING: v++,
      // ]
      CDATA_ENDING_2: v++,
      // ]]
      PROC_INST: v++,
      // <?hi
      PROC_INST_BODY: v++,
      // <?hi there
      PROC_INST_ENDING: v++,
      // <?hi "there" ?
      OPEN_TAG: v++,
      // <strong
      OPEN_TAG_SLASH: v++,
      // <strong /
      ATTRIB: v++,
      // <a
      ATTRIB_NAME: v++,
      // <a foo
      ATTRIB_NAME_SAW_WHITE: v++,
      // <a foo _
      ATTRIB_VALUE: v++,
      // <a foo=
      ATTRIB_VALUE_QUOTED: v++,
      // <a foo="bar
      ATTRIB_VALUE_CLOSED: v++,
      // <a foo="bar"
      ATTRIB_VALUE_UNQUOTED: v++,
      // <a foo=bar
      ATTRIB_VALUE_ENTITY_Q: v++,
      // <foo bar="&quot;"
      ATTRIB_VALUE_ENTITY_U: v++,
      // <foo bar=&quot
      CLOSE_TAG: v++,
      // </a
      CLOSE_TAG_SAW_WHITE: v++,
      // </a   >
      SCRIPT: v++,
      // <script> ...
      SCRIPT_ENDING: v++
      // <script> ... <
    }, t.XML_ENTITIES = {
      amp: "&",
      gt: ">",
      lt: "<",
      quot: '"',
      apos: "'"
    }, t.ENTITIES = {
      amp: "&",
      gt: ">",
      lt: "<",
      quot: '"',
      apos: "'",
      AElig: 198,
      Aacute: 193,
      Acirc: 194,
      Agrave: 192,
      Aring: 197,
      Atilde: 195,
      Auml: 196,
      Ccedil: 199,
      ETH: 208,
      Eacute: 201,
      Ecirc: 202,
      Egrave: 200,
      Euml: 203,
      Iacute: 205,
      Icirc: 206,
      Igrave: 204,
      Iuml: 207,
      Ntilde: 209,
      Oacute: 211,
      Ocirc: 212,
      Ograve: 210,
      Oslash: 216,
      Otilde: 213,
      Ouml: 214,
      THORN: 222,
      Uacute: 218,
      Ucirc: 219,
      Ugrave: 217,
      Uuml: 220,
      Yacute: 221,
      aacute: 225,
      acirc: 226,
      aelig: 230,
      agrave: 224,
      aring: 229,
      atilde: 227,
      auml: 228,
      ccedil: 231,
      eacute: 233,
      ecirc: 234,
      egrave: 232,
      eth: 240,
      euml: 235,
      iacute: 237,
      icirc: 238,
      igrave: 236,
      iuml: 239,
      ntilde: 241,
      oacute: 243,
      ocirc: 244,
      ograve: 242,
      oslash: 248,
      otilde: 245,
      ouml: 246,
      szlig: 223,
      thorn: 254,
      uacute: 250,
      ucirc: 251,
      ugrave: 249,
      uuml: 252,
      yacute: 253,
      yuml: 255,
      copy: 169,
      reg: 174,
      nbsp: 160,
      iexcl: 161,
      cent: 162,
      pound: 163,
      curren: 164,
      yen: 165,
      brvbar: 166,
      sect: 167,
      uml: 168,
      ordf: 170,
      laquo: 171,
      not: 172,
      shy: 173,
      macr: 175,
      deg: 176,
      plusmn: 177,
      sup1: 185,
      sup2: 178,
      sup3: 179,
      acute: 180,
      micro: 181,
      para: 182,
      middot: 183,
      cedil: 184,
      ordm: 186,
      raquo: 187,
      frac14: 188,
      frac12: 189,
      frac34: 190,
      iquest: 191,
      times: 215,
      divide: 247,
      OElig: 338,
      oelig: 339,
      Scaron: 352,
      scaron: 353,
      Yuml: 376,
      fnof: 402,
      circ: 710,
      tilde: 732,
      Alpha: 913,
      Beta: 914,
      Gamma: 915,
      Delta: 916,
      Epsilon: 917,
      Zeta: 918,
      Eta: 919,
      Theta: 920,
      Iota: 921,
      Kappa: 922,
      Lambda: 923,
      Mu: 924,
      Nu: 925,
      Xi: 926,
      Omicron: 927,
      Pi: 928,
      Rho: 929,
      Sigma: 931,
      Tau: 932,
      Upsilon: 933,
      Phi: 934,
      Chi: 935,
      Psi: 936,
      Omega: 937,
      alpha: 945,
      beta: 946,
      gamma: 947,
      delta: 948,
      epsilon: 949,
      zeta: 950,
      eta: 951,
      theta: 952,
      iota: 953,
      kappa: 954,
      lambda: 955,
      mu: 956,
      nu: 957,
      xi: 958,
      omicron: 959,
      pi: 960,
      rho: 961,
      sigmaf: 962,
      sigma: 963,
      tau: 964,
      upsilon: 965,
      phi: 966,
      chi: 967,
      psi: 968,
      omega: 969,
      thetasym: 977,
      upsih: 978,
      piv: 982,
      ensp: 8194,
      emsp: 8195,
      thinsp: 8201,
      zwnj: 8204,
      zwj: 8205,
      lrm: 8206,
      rlm: 8207,
      ndash: 8211,
      mdash: 8212,
      lsquo: 8216,
      rsquo: 8217,
      sbquo: 8218,
      ldquo: 8220,
      rdquo: 8221,
      bdquo: 8222,
      dagger: 8224,
      Dagger: 8225,
      bull: 8226,
      hellip: 8230,
      permil: 8240,
      prime: 8242,
      Prime: 8243,
      lsaquo: 8249,
      rsaquo: 8250,
      oline: 8254,
      frasl: 8260,
      euro: 8364,
      image: 8465,
      weierp: 8472,
      real: 8476,
      trade: 8482,
      alefsym: 8501,
      larr: 8592,
      uarr: 8593,
      rarr: 8594,
      darr: 8595,
      harr: 8596,
      crarr: 8629,
      lArr: 8656,
      uArr: 8657,
      rArr: 8658,
      dArr: 8659,
      hArr: 8660,
      forall: 8704,
      part: 8706,
      exist: 8707,
      empty: 8709,
      nabla: 8711,
      isin: 8712,
      notin: 8713,
      ni: 8715,
      prod: 8719,
      sum: 8721,
      minus: 8722,
      lowast: 8727,
      radic: 8730,
      prop: 8733,
      infin: 8734,
      ang: 8736,
      and: 8743,
      or: 8744,
      cap: 8745,
      cup: 8746,
      int: 8747,
      there4: 8756,
      sim: 8764,
      cong: 8773,
      asymp: 8776,
      ne: 8800,
      equiv: 8801,
      le: 8804,
      ge: 8805,
      sub: 8834,
      sup: 8835,
      nsub: 8836,
      sube: 8838,
      supe: 8839,
      oplus: 8853,
      otimes: 8855,
      perp: 8869,
      sdot: 8901,
      lceil: 8968,
      rceil: 8969,
      lfloor: 8970,
      rfloor: 8971,
      lang: 9001,
      rang: 9002,
      loz: 9674,
      spades: 9824,
      clubs: 9827,
      hearts: 9829,
      diams: 9830
    }, Object.keys(t.ENTITIES).forEach(function(p) {
      var d = t.ENTITIES[p], b = typeof d == "number" ? String.fromCharCode(d) : d;
      t.ENTITIES[p] = b;
    });
    for (var W in t.STATE)
      t.STATE[t.STATE[W]] = W;
    v = t.STATE;
    function K(p, d, b) {
      p[d] && p[d](b);
    }
    function ne(p) {
      var d = p && p.match(/(?:^|\s)encoding\s*=\s*(['"])([^'"]+)\1/i);
      return d ? d[2] : null;
    }
    function R(p) {
      return p ? p.toLowerCase().replace(/[^a-z0-9]/g, "") : null;
    }
    function $(p, d) {
      const b = R(p), w = R(d);
      return !b || !w ? !0 : w === "utf16" ? b === "utf16le" || b === "utf16be" : b === w;
    }
    function I(p, d) {
      if (!(!p.strict || !p.encoding || !d || d.name !== "xml")) {
        var b = ne(d.body);
        b && !$(p.encoding, b) && F(
          p,
          "XML declaration encoding " + b + " does not match detected stream encoding " + p.encoding.toUpperCase()
        );
      }
    }
    function O(p, d, b) {
      p.textNode && N(p), K(p, d, b);
    }
    function N(p) {
      p.textNode = P(p.opt, p.textNode), p.textNode && K(p, "ontext", p.textNode), p.textNode = "";
    }
    function P(p, d) {
      return p.trim && (d = d.trim()), p.normalize && (d = d.replace(/\s+/g, " ")), d;
    }
    function M(p, d) {
      return N(p), p.trackPosition && (d += `
Line: ` + p.line + `
Column: ` + p.column + `
Char: ` + p.c), d = new Error(d), p.error = d, K(p, "onerror", d), p;
    }
    function Y(p) {
      return p.sawRoot && !p.closedRoot && F(p, "Unclosed root tag"), p.state !== v.BEGIN && p.state !== v.BEGIN_WHITESPACE && p.state !== v.TEXT && M(p, "Unexpected end"), N(p), p.c = "", p.closed = !0, K(p, "onend"), n.call(p, p.strict, p.opt), p;
    }
    function F(p, d) {
      if (typeof p != "object" || !(p instanceof n))
        throw new Error("bad call to strictFail");
      p.strict && M(p, d);
    }
    function ee(p) {
      p.strict || (p.tagName = p.tagName[p.looseCase]());
      var d = p.tags[p.tags.length - 1] || p, b = p.tag = { name: p.tagName, attributes: {} };
      p.opt.xmlns && (b.ns = d.ns), p.attribList.length = 0, O(p, "onopentagstart", b);
    }
    function fe(p, d) {
      var b = p.indexOf(":"), w = b < 0 ? ["", p] : p.split(":"), J = w[0], ie = w[1];
      return d && p === "xmlns" && (J = "xmlns", ie = ""), { prefix: J, local: ie };
    }
    function j(p) {
      if (p.strict || (p.attribName = p.attribName[p.looseCase]()), p.attribList.indexOf(p.attribName) !== -1 || p.tag.attributes.hasOwnProperty(p.attribName)) {
        p.attribName = p.attribValue = "";
        return;
      }
      if (p.opt.xmlns) {
        var d = fe(p.attribName, !0), b = d.prefix, w = d.local;
        if (b === "xmlns")
          if (w === "xml" && p.attribValue !== E)
            F(
              p,
              "xml: prefix must be bound to " + E + `
Actual: ` + p.attribValue
            );
          else if (w === "xmlns" && p.attribValue !== y)
            F(
              p,
              "xmlns: prefix must be bound to " + y + `
Actual: ` + p.attribValue
            );
          else {
            var J = p.tag, ie = p.tags[p.tags.length - 1] || p;
            J.ns === ie.ns && (J.ns = Object.create(ie.ns)), J.ns[w] = p.attribValue;
          }
        p.attribList.push([p.attribName, p.attribValue]);
      } else
        p.tag.attributes[p.attribName] = p.attribValue, O(p, "onattribute", {
          name: p.attribName,
          value: p.attribValue
        });
      p.attribName = p.attribValue = "";
    }
    function ve(p, d) {
      if (p.opt.xmlns) {
        var b = p.tag, w = fe(p.tagName);
        b.prefix = w.prefix, b.local = w.local, b.uri = b.ns[w.prefix] || "", b.prefix && !b.uri && (F(
          p,
          "Unbound namespace prefix: " + JSON.stringify(p.tagName)
        ), b.uri = w.prefix);
        var J = p.tags[p.tags.length - 1] || p;
        b.ns && J.ns !== b.ns && Object.keys(b.ns).forEach(function(Ct) {
          O(p, "onopennamespace", {
            prefix: Ct,
            uri: b.ns[Ct]
          });
        });
        for (var ie = 0, le = p.attribList.length; ie < le; ie++) {
          var we = p.attribList[ie], _e = we[0], je = we[1], de = fe(_e, !0), qe = de.prefix, Ci = de.local, dn = qe === "" ? "" : b.ns[qe] || "", wr = {
            name: _e,
            value: je,
            prefix: qe,
            local: Ci,
            uri: dn
          };
          qe && qe !== "xmlns" && !dn && (F(
            p,
            "Unbound namespace prefix: " + JSON.stringify(qe)
          ), wr.uri = qe), p.tag.attributes[_e] = wr, O(p, "onattribute", wr);
        }
        p.attribList.length = 0;
      }
      p.tag.isSelfClosing = !!d, p.sawRoot = !0, p.tags.push(p.tag), O(p, "onopentag", p.tag), d || (!p.noscript && p.tagName.toLowerCase() === "script" ? p.state = v.SCRIPT : p.state = v.TEXT, p.tag = null, p.tagName = ""), p.attribName = p.attribValue = "", p.attribList.length = 0;
    }
    function Er(p) {
      if (!p.tagName) {
        F(p, "Weird empty close tag."), p.textNode += "</>", p.state = v.TEXT;
        return;
      }
      if (p.script) {
        if (p.tagName !== "script") {
          p.script += "</" + p.tagName + ">", p.tagName = "", p.state = v.SCRIPT;
          return;
        }
        O(p, "onscript", p.script), p.script = "";
      }
      var d = p.tags.length, b = p.tagName;
      p.strict || (b = b[p.looseCase]());
      for (var w = b; d--; ) {
        var J = p.tags[d];
        if (J.name !== w)
          F(p, "Unexpected close tag");
        else
          break;
      }
      if (d < 0) {
        F(p, "Unmatched closing tag: " + p.tagName), p.textNode += "</" + p.tagName + ">", p.state = v.TEXT;
        return;
      }
      p.tagName = b;
      for (var ie = p.tags.length; ie-- > d; ) {
        var le = p.tag = p.tags.pop();
        p.tagName = p.tag.name, O(p, "onclosetag", p.tagName);
        var we = {};
        for (var _e in le.ns)
          we[_e] = le.ns[_e];
        var je = p.tags[p.tags.length - 1] || p;
        p.opt.xmlns && le.ns !== je.ns && Object.keys(le.ns).forEach(function(de) {
          var qe = le.ns[de];
          O(p, "onclosenamespace", { prefix: de, uri: qe });
        });
      }
      d === 0 && (p.closedRoot = !0), p.tagName = p.attribValue = p.attribName = "", p.attribList.length = 0, p.state = v.TEXT;
    }
    function Be(p) {
      var d = p.entity, b = d.toLowerCase(), w, J = "";
      return p.ENTITIES[d] ? p.ENTITIES[d] : p.ENTITIES[b] ? p.ENTITIES[b] : (d = b, d.charAt(0) === "#" && (d.charAt(1) === "x" ? (d = d.slice(2), w = parseInt(d, 16), J = w.toString(16)) : (d = d.slice(1), w = parseInt(d, 10), J = w.toString(10))), d = d.replace(/^0+/, ""), isNaN(w) || J.toLowerCase() !== d || w < 0 || w > 1114111 ? (F(p, "Invalid character entity"), "&" + p.entity + ";") : String.fromCodePoint(w));
    }
    function vr(p, d) {
      d === "<" ? (p.state = v.OPEN_WAKA, p.startTagPosition = p.position) : k(d) || (F(p, "Non-whitespace before first tag."), p.textNode = d, p.state = v.TEXT);
    }
    function zt(p, d) {
      var b = "";
      return d < p.length && (b = p.charAt(d)), b;
    }
    function fn(p) {
      var d = this;
      if (this.error)
        throw this.error;
      if (d.closed)
        return M(
          d,
          "Cannot write after close. Assign an onready handler."
        );
      if (p === null)
        return Y(d);
      typeof p == "object" && (p = p.toString());
      for (var b = 0, w = ""; w = zt(p, b++), d.c = w, !!w; )
        switch (d.trackPosition && (d.position++, w === `
` ? (d.line++, d.column = 0) : d.column++), d.state) {
          case v.BEGIN:
            if (d.state = v.BEGIN_WHITESPACE, w === "\uFEFF")
              continue;
            vr(d, w);
            continue;
          case v.BEGIN_WHITESPACE:
            vr(d, w);
            continue;
          case v.TEXT:
            if (d.sawRoot && !d.closedRoot) {
              for (var ie = b - 1; w && w !== "<" && w !== "&"; )
                w = zt(p, b++), w && d.trackPosition && (d.position++, w === `
` ? (d.line++, d.column = 0) : d.column++);
              d.textNode += p.substring(ie, b - 1);
            }
            w === "<" && !(d.sawRoot && d.closedRoot && !d.strict) ? (d.state = v.OPEN_WAKA, d.startTagPosition = d.position) : (!k(w) && (!d.sawRoot || d.closedRoot) && F(d, "Text data outside of root node."), w === "&" ? d.state = v.TEXT_ENTITY : d.textNode += w);
            continue;
          case v.SCRIPT:
            w === "<" ? d.state = v.SCRIPT_ENDING : d.script += w;
            continue;
          case v.SCRIPT_ENDING:
            w === "/" ? d.state = v.CLOSE_TAG : (d.script += "<" + w, d.state = v.SCRIPT);
            continue;
          case v.OPEN_WAKA:
            if (w === "!")
              d.state = v.SGML_DECL, d.sgmlDecl = "";
            else if (!k(w)) if (Z(A, w))
              d.state = v.OPEN_TAG, d.tagName = w;
            else if (w === "/")
              d.state = v.CLOSE_TAG, d.tagName = "";
            else if (w === "?")
              d.state = v.PROC_INST, d.procInstName = d.procInstBody = "";
            else {
              if (F(d, "Unencoded <"), d.startTagPosition + 1 < d.position) {
                var J = d.position - d.startTagPosition;
                w = new Array(J).join(" ") + w;
              }
              d.textNode += "<" + w, d.state = v.TEXT;
            }
            continue;
          case v.SGML_DECL:
            if (d.sgmlDecl + w === "--") {
              d.state = v.COMMENT, d.comment = "", d.sgmlDecl = "";
              continue;
            }
            d.doctype && d.doctype !== !0 && d.sgmlDecl ? (d.state = v.DOCTYPE_DTD, d.doctype += "<!" + d.sgmlDecl + w, d.sgmlDecl = "") : (d.sgmlDecl + w).toUpperCase() === h ? (O(d, "onopencdata"), d.state = v.CDATA, d.sgmlDecl = "", d.cdata = "") : (d.sgmlDecl + w).toUpperCase() === m ? (d.state = v.DOCTYPE, (d.doctype || d.sawRoot) && F(
              d,
              "Inappropriately located doctype declaration"
            ), d.doctype = "", d.sgmlDecl = "") : w === ">" ? (O(d, "onsgmldeclaration", d.sgmlDecl), d.sgmlDecl = "", d.state = v.TEXT) : (q(w) && (d.state = v.SGML_DECL_QUOTED), d.sgmlDecl += w);
            continue;
          case v.SGML_DECL_QUOTED:
            w === d.q && (d.state = v.SGML_DECL, d.q = ""), d.sgmlDecl += w;
            continue;
          case v.DOCTYPE:
            w === ">" ? (d.state = v.TEXT, O(d, "ondoctype", d.doctype), d.doctype = !0) : (d.doctype += w, w === "[" ? d.state = v.DOCTYPE_DTD : q(w) && (d.state = v.DOCTYPE_QUOTED, d.q = w));
            continue;
          case v.DOCTYPE_QUOTED:
            d.doctype += w, w === d.q && (d.q = "", d.state = v.DOCTYPE);
            continue;
          case v.DOCTYPE_DTD:
            w === "]" ? (d.doctype += w, d.state = v.DOCTYPE) : w === "<" ? (d.state = v.OPEN_WAKA, d.startTagPosition = d.position) : q(w) ? (d.doctype += w, d.state = v.DOCTYPE_DTD_QUOTED, d.q = w) : d.doctype += w;
            continue;
          case v.DOCTYPE_DTD_QUOTED:
            d.doctype += w, w === d.q && (d.state = v.DOCTYPE_DTD, d.q = "");
            continue;
          case v.COMMENT:
            w === "-" ? d.state = v.COMMENT_ENDING : d.comment += w;
            continue;
          case v.COMMENT_ENDING:
            w === "-" ? (d.state = v.COMMENT_ENDED, d.comment = P(d.opt, d.comment), d.comment && O(d, "oncomment", d.comment), d.comment = "") : (d.comment += "-" + w, d.state = v.COMMENT);
            continue;
          case v.COMMENT_ENDED:
            w !== ">" ? (F(d, "Malformed comment"), d.comment += "--" + w, d.state = v.COMMENT) : d.doctype && d.doctype !== !0 ? d.state = v.DOCTYPE_DTD : d.state = v.TEXT;
            continue;
          case v.CDATA:
            for (var ie = b - 1; w && w !== "]"; )
              w = zt(p, b++), w && d.trackPosition && (d.position++, w === `
` ? (d.line++, d.column = 0) : d.column++);
            d.cdata += p.substring(ie, b - 1), w === "]" && (d.state = v.CDATA_ENDING);
            continue;
          case v.CDATA_ENDING:
            w === "]" ? d.state = v.CDATA_ENDING_2 : (d.cdata += "]" + w, d.state = v.CDATA);
            continue;
          case v.CDATA_ENDING_2:
            w === ">" ? (d.cdata && O(d, "oncdata", d.cdata), O(d, "onclosecdata"), d.cdata = "", d.state = v.TEXT) : w === "]" ? d.cdata += "]" : (d.cdata += "]]" + w, d.state = v.CDATA);
            continue;
          case v.PROC_INST:
            w === "?" ? d.state = v.PROC_INST_ENDING : k(w) ? d.state = v.PROC_INST_BODY : d.procInstName += w;
            continue;
          case v.PROC_INST_BODY:
            if (!d.procInstBody && k(w))
              continue;
            w === "?" ? d.state = v.PROC_INST_ENDING : d.procInstBody += w;
            continue;
          case v.PROC_INST_ENDING:
            if (w === ">") {
              const je = {
                name: d.procInstName,
                body: d.procInstBody
              };
              I(d, je), O(d, "onprocessinginstruction", je), d.procInstName = d.procInstBody = "", d.state = v.TEXT;
            } else
              d.procInstBody += "?" + w, d.state = v.PROC_INST_BODY;
            continue;
          case v.OPEN_TAG:
            Z(T, w) ? d.tagName += w : (ee(d), w === ">" ? ve(d) : w === "/" ? d.state = v.OPEN_TAG_SLASH : (k(w) || F(d, "Invalid character in tag name"), d.state = v.ATTRIB));
            continue;
          case v.OPEN_TAG_SLASH:
            w === ">" ? (ve(d, !0), Er(d)) : (F(
              d,
              "Forward-slash in opening tag not followed by >"
            ), d.state = v.ATTRIB);
            continue;
          case v.ATTRIB:
            if (k(w))
              continue;
            w === ">" ? ve(d) : w === "/" ? d.state = v.OPEN_TAG_SLASH : Z(A, w) ? (d.attribName = w, d.attribValue = "", d.state = v.ATTRIB_NAME) : F(d, "Invalid attribute name");
            continue;
          case v.ATTRIB_NAME:
            w === "=" ? d.state = v.ATTRIB_VALUE : w === ">" ? (F(d, "Attribute without value"), d.attribValue = d.attribName, j(d), ve(d)) : k(w) ? d.state = v.ATTRIB_NAME_SAW_WHITE : Z(T, w) ? d.attribName += w : F(d, "Invalid attribute name");
            continue;
          case v.ATTRIB_NAME_SAW_WHITE:
            if (w === "=")
              d.state = v.ATTRIB_VALUE;
            else {
              if (k(w))
                continue;
              F(d, "Attribute without value"), d.tag.attributes[d.attribName] = "", d.attribValue = "", O(d, "onattribute", {
                name: d.attribName,
                value: ""
              }), d.attribName = "", w === ">" ? ve(d) : Z(A, w) ? (d.attribName = w, d.state = v.ATTRIB_NAME) : (F(d, "Invalid attribute name"), d.state = v.ATTRIB);
            }
            continue;
          case v.ATTRIB_VALUE:
            if (k(w))
              continue;
            q(w) ? (d.q = w, d.state = v.ATTRIB_VALUE_QUOTED) : (d.opt.unquotedAttributeValues || M(d, "Unquoted attribute value"), d.state = v.ATTRIB_VALUE_UNQUOTED, d.attribValue = w);
            continue;
          case v.ATTRIB_VALUE_QUOTED:
            if (w !== d.q) {
              w === "&" ? d.state = v.ATTRIB_VALUE_ENTITY_Q : d.attribValue += w;
              continue;
            }
            j(d), d.q = "", d.state = v.ATTRIB_VALUE_CLOSED;
            continue;
          case v.ATTRIB_VALUE_CLOSED:
            k(w) ? d.state = v.ATTRIB : w === ">" ? ve(d) : w === "/" ? d.state = v.OPEN_TAG_SLASH : Z(A, w) ? (F(d, "No whitespace between attributes"), d.attribName = w, d.attribValue = "", d.state = v.ATTRIB_NAME) : F(d, "Invalid attribute name");
            continue;
          case v.ATTRIB_VALUE_UNQUOTED:
            if (!V(w)) {
              w === "&" ? d.state = v.ATTRIB_VALUE_ENTITY_U : d.attribValue += w;
              continue;
            }
            j(d), w === ">" ? ve(d) : d.state = v.ATTRIB;
            continue;
          case v.CLOSE_TAG:
            if (d.tagName)
              w === ">" ? Er(d) : Z(T, w) ? d.tagName += w : d.script ? (d.script += "</" + d.tagName + w, d.tagName = "", d.state = v.SCRIPT) : (k(w) || F(d, "Invalid tagname in closing tag"), d.state = v.CLOSE_TAG_SAW_WHITE);
            else {
              if (k(w))
                continue;
              L(A, w) ? d.script ? (d.script += "</" + w, d.state = v.SCRIPT) : F(d, "Invalid tagname in closing tag.") : d.tagName = w;
            }
            continue;
          case v.CLOSE_TAG_SAW_WHITE:
            if (k(w))
              continue;
            w === ">" ? Er(d) : F(d, "Invalid characters in closing tag");
            continue;
          case v.TEXT_ENTITY:
          case v.ATTRIB_VALUE_ENTITY_Q:
          case v.ATTRIB_VALUE_ENTITY_U:
            var le, we;
            switch (d.state) {
              case v.TEXT_ENTITY:
                le = v.TEXT, we = "textNode";
                break;
              case v.ATTRIB_VALUE_ENTITY_Q:
                le = v.ATTRIB_VALUE_QUOTED, we = "attribValue";
                break;
              case v.ATTRIB_VALUE_ENTITY_U:
                le = v.ATTRIB_VALUE_UNQUOTED, we = "attribValue";
                break;
            }
            if (w === ";") {
              var _e = Be(d);
              d.opt.unparsedEntities && !Object.values(t.XML_ENTITIES).includes(_e) ? ((d.entityCount += 1) > d.opt.maxEntityCount && M(
                d,
                "Parsed entity count exceeds max entity count"
              ), (d.entityDepth += 1) > d.opt.maxEntityDepth && M(
                d,
                "Parsed entity depth exceeds max entity depth"
              ), d.entity = "", d.state = le, d.write(_e), d.entityDepth -= 1) : (d[we] += _e, d.entity = "", d.state = le);
            } else Z(d.entity.length ? B : D, w) ? d.entity += w : (F(d, "Invalid character in entity name"), d[we] += "&" + d.entity + w, d.entity = "", d.state = le);
            continue;
          default:
            throw new Error(d, "Unknown state: " + d.state);
        }
      return d.position >= d.bufferCheckPosition && i(d), d;
    }
    /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
    String.fromCodePoint || function() {
      var p = String.fromCharCode, d = Math.floor, b = function() {
        var w = 16384, J = [], ie, le, we = -1, _e = arguments.length;
        if (!_e)
          return "";
        for (var je = ""; ++we < _e; ) {
          var de = Number(arguments[we]);
          if (!isFinite(de) || // `NaN`, `+Infinity`, or `-Infinity`
          de < 0 || // not a valid Unicode code point
          de > 1114111 || // not a valid Unicode code point
          d(de) !== de)
            throw RangeError("Invalid code point: " + de);
          de <= 65535 ? J.push(de) : (de -= 65536, ie = (de >> 10) + 55296, le = de % 1024 + 56320, J.push(ie, le)), (we + 1 === _e || J.length > w) && (je += p.apply(null, J), J.length = 0);
        }
        return je;
      };
      Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
        value: b,
        configurable: !0,
        writable: !0
      }) : String.fromCodePoint = b;
    }();
  })(e);
})(Iu);
Object.defineProperty(rn, "__esModule", { value: !0 });
rn.XElement = void 0;
rn.parseXml = gg;
const hg = Iu, Tn = pr;
class Du {
  constructor(t) {
    if (this.name = t, this.value = "", this.attributes = null, this.isCData = !1, this.elements = null, !t)
      throw (0, Tn.newError)("Element name cannot be empty", "ERR_XML_ELEMENT_NAME_EMPTY");
    if (!mg(t))
      throw (0, Tn.newError)(`Invalid element name: ${t}`, "ERR_XML_ELEMENT_INVALID_NAME");
  }
  attribute(t) {
    const r = this.attributes === null ? null : this.attributes[t];
    if (r == null)
      throw (0, Tn.newError)(`No attribute "${t}"`, "ERR_XML_MISSED_ATTRIBUTE");
    return r;
  }
  removeAttribute(t) {
    this.attributes !== null && delete this.attributes[t];
  }
  element(t, r = !1, n = null) {
    const i = this.elementOrNull(t, r);
    if (i === null)
      throw (0, Tn.newError)(n || `No element "${t}"`, "ERR_XML_MISSED_ELEMENT");
    return i;
  }
  elementOrNull(t, r = !1) {
    if (this.elements === null)
      return null;
    for (const n of this.elements)
      if (Ua(n, t, r))
        return n;
    return null;
  }
  getElements(t, r = !1) {
    return this.elements === null ? [] : this.elements.filter((n) => Ua(n, t, r));
  }
  elementValueOrEmpty(t, r = !1) {
    const n = this.elementOrNull(t, r);
    return n === null ? "" : n.value;
  }
}
rn.XElement = Du;
const pg = new RegExp(/^[A-Za-z_][:A-Za-z0-9_-]*$/i);
function mg(e) {
  return pg.test(e);
}
function Ua(e, t, r) {
  const n = e.name;
  return n === t || r === !0 && n.length === t.length && n.toLowerCase() === t.toLowerCase();
}
function gg(e) {
  let t = null;
  const r = hg.parser(!0, {}), n = [];
  return r.onopentag = (i) => {
    const o = new Du(i.name);
    if (o.attributes = i.attributes, t === null)
      t = o;
    else {
      const s = n[n.length - 1];
      s.elements == null && (s.elements = []), s.elements.push(o);
    }
    n.push(o);
  }, r.onclosetag = () => {
    n.pop();
  }, r.ontext = (i) => {
    n.length > 0 && (n[n.length - 1].value = i);
  }, r.oncdata = (i) => {
    const o = n[n.length - 1];
    o.value = i, o.isCData = !0;
  }, r.onerror = (i) => {
    throw i;
  }, r.write(e), t;
}
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CURRENT_APP_PACKAGE_FILE_NAME = e.CURRENT_APP_INSTALLER_FILE_NAME = e.XElement = e.parseXml = e.UUID = e.parseDn = e.retry = e.githubTagPrefix = e.githubUrl = e.getS3LikeProviderBaseUrl = e.ProgressCallbackTransform = e.MemoLazy = e.safeStringifyJson = e.safeGetHeader = e.parseJson = e.HttpExecutor = e.HttpError = e.DigestTransform = e.createHttpError = e.configureRequestUrl = e.configureRequestOptionsFromUrl = e.configureRequestOptions = e.newError = e.CancellationToken = e.CancellationError = void 0, e.asArray = u;
  var t = Et;
  Object.defineProperty(e, "CancellationError", { enumerable: !0, get: function() {
    return t.CancellationError;
  } }), Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
    return t.CancellationToken;
  } });
  var r = pr;
  Object.defineProperty(e, "newError", { enumerable: !0, get: function() {
    return r.newError;
  } });
  var n = $e;
  Object.defineProperty(e, "configureRequestOptions", { enumerable: !0, get: function() {
    return n.configureRequestOptions;
  } }), Object.defineProperty(e, "configureRequestOptionsFromUrl", { enumerable: !0, get: function() {
    return n.configureRequestOptionsFromUrl;
  } }), Object.defineProperty(e, "configureRequestUrl", { enumerable: !0, get: function() {
    return n.configureRequestUrl;
  } }), Object.defineProperty(e, "createHttpError", { enumerable: !0, get: function() {
    return n.createHttpError;
  } }), Object.defineProperty(e, "DigestTransform", { enumerable: !0, get: function() {
    return n.DigestTransform;
  } }), Object.defineProperty(e, "HttpError", { enumerable: !0, get: function() {
    return n.HttpError;
  } }), Object.defineProperty(e, "HttpExecutor", { enumerable: !0, get: function() {
    return n.HttpExecutor;
  } }), Object.defineProperty(e, "parseJson", { enumerable: !0, get: function() {
    return n.parseJson;
  } }), Object.defineProperty(e, "safeGetHeader", { enumerable: !0, get: function() {
    return n.safeGetHeader;
  } }), Object.defineProperty(e, "safeStringifyJson", { enumerable: !0, get: function() {
    return n.safeStringifyJson;
  } });
  var i = ai;
  Object.defineProperty(e, "MemoLazy", { enumerable: !0, get: function() {
    return i.MemoLazy;
  } });
  var o = en;
  Object.defineProperty(e, "ProgressCallbackTransform", { enumerable: !0, get: function() {
    return o.ProgressCallbackTransform;
  } });
  var s = tn;
  Object.defineProperty(e, "getS3LikeProviderBaseUrl", { enumerable: !0, get: function() {
    return s.getS3LikeProviderBaseUrl;
  } }), Object.defineProperty(e, "githubUrl", { enumerable: !0, get: function() {
    return s.githubUrl;
  } }), Object.defineProperty(e, "githubTagPrefix", { enumerable: !0, get: function() {
    return s.githubTagPrefix;
  } });
  var a = vs;
  Object.defineProperty(e, "retry", { enumerable: !0, get: function() {
    return a.retry;
  } });
  var l = ws;
  Object.defineProperty(e, "parseDn", { enumerable: !0, get: function() {
    return l.parseDn;
  } });
  var f = fr;
  Object.defineProperty(e, "UUID", { enumerable: !0, get: function() {
    return f.UUID;
  } });
  var c = rn;
  Object.defineProperty(e, "parseXml", { enumerable: !0, get: function() {
    return c.parseXml;
  } }), Object.defineProperty(e, "XElement", { enumerable: !0, get: function() {
    return c.XElement;
  } }), e.CURRENT_APP_INSTALLER_FILE_NAME = "installer.exe", e.CURRENT_APP_PACKAGE_FILE_NAME = "package.7z";
  function u(h) {
    return h == null ? [] : Array.isArray(h) ? h : [h];
  }
})(he);
var Ee = {}, _s = {}, ze = {};
function Nu(e) {
  return typeof e > "u" || e === null;
}
function yg(e) {
  return typeof e == "object" && e !== null;
}
function Eg(e) {
  return Array.isArray(e) ? e : Nu(e) ? [] : [e];
}
function vg(e, t) {
  var r, n, i, o;
  if (t)
    for (o = Object.keys(t), r = 0, n = o.length; r < n; r += 1)
      i = o[r], e[i] = t[i];
  return e;
}
function wg(e, t) {
  var r = "", n;
  for (n = 0; n < t; n += 1)
    r += e;
  return r;
}
function _g(e) {
  return e === 0 && Number.NEGATIVE_INFINITY === 1 / e;
}
ze.isNothing = Nu;
ze.isObject = yg;
ze.toArray = Eg;
ze.repeat = wg;
ze.isNegativeZero = _g;
ze.extend = vg;
function Fu(e, t) {
  var r = "", n = e.reason || "(unknown reason)";
  return e.mark ? (e.mark.name && (r += 'in "' + e.mark.name + '" '), r += "(" + (e.mark.line + 1) + ":" + (e.mark.column + 1) + ")", !t && e.mark.snippet && (r += `

` + e.mark.snippet), n + " " + r) : n;
}
function Br(e, t) {
  Error.call(this), this.name = "YAMLException", this.reason = e, this.mark = t, this.message = Fu(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
}
Br.prototype = Object.create(Error.prototype);
Br.prototype.constructor = Br;
Br.prototype.toString = function(t) {
  return this.name + ": " + Fu(this, t);
};
var nn = Br, Rr = ze;
function qi(e, t, r, n, i) {
  var o = "", s = "", a = Math.floor(i / 2) - 1;
  return n - t > a && (o = " ... ", t = n - a + o.length), r - n > a && (s = " ...", r = n + a - s.length), {
    str: o + e.slice(t, r).replace(/\t/g, "→") + s,
    pos: n - t + o.length
    // relative position
  };
}
function Hi(e, t) {
  return Rr.repeat(" ", t - e.length) + e;
}
function Sg(e, t) {
  if (t = Object.create(t || null), !e.buffer) return null;
  t.maxLength || (t.maxLength = 79), typeof t.indent != "number" && (t.indent = 1), typeof t.linesBefore != "number" && (t.linesBefore = 3), typeof t.linesAfter != "number" && (t.linesAfter = 2);
  for (var r = /\r?\n|\r|\0/g, n = [0], i = [], o, s = -1; o = r.exec(e.buffer); )
    i.push(o.index), n.push(o.index + o[0].length), e.position <= o.index && s < 0 && (s = n.length - 2);
  s < 0 && (s = n.length - 1);
  var a = "", l, f, c = Math.min(e.line + t.linesAfter, i.length).toString().length, u = t.maxLength - (t.indent + c + 3);
  for (l = 1; l <= t.linesBefore && !(s - l < 0); l++)
    f = qi(
      e.buffer,
      n[s - l],
      i[s - l],
      e.position - (n[s] - n[s - l]),
      u
    ), a = Rr.repeat(" ", t.indent) + Hi((e.line - l + 1).toString(), c) + " | " + f.str + `
` + a;
  for (f = qi(e.buffer, n[s], i[s], e.position, u), a += Rr.repeat(" ", t.indent) + Hi((e.line + 1).toString(), c) + " | " + f.str + `
`, a += Rr.repeat("-", t.indent + c + 3 + f.pos) + `^
`, l = 1; l <= t.linesAfter && !(s + l >= i.length); l++)
    f = qi(
      e.buffer,
      n[s + l],
      i[s + l],
      e.position - (n[s] - n[s + l]),
      u
    ), a += Rr.repeat(" ", t.indent) + Hi((e.line + l + 1).toString(), c) + " | " + f.str + `
`;
  return a.replace(/\n$/, "");
}
var Ag = Sg, ka = nn, bg = [
  "kind",
  "multi",
  "resolve",
  "construct",
  "instanceOf",
  "predicate",
  "represent",
  "representName",
  "defaultStyle",
  "styleAliases"
], Tg = [
  "scalar",
  "sequence",
  "mapping"
];
function Cg(e) {
  var t = {};
  return e !== null && Object.keys(e).forEach(function(r) {
    e[r].forEach(function(n) {
      t[String(n)] = r;
    });
  }), t;
}
function Og(e, t) {
  if (t = t || {}, Object.keys(t).forEach(function(r) {
    if (bg.indexOf(r) === -1)
      throw new ka('Unknown option "' + r + '" is met in definition of "' + e + '" YAML type.');
  }), this.options = t, this.tag = e, this.kind = t.kind || null, this.resolve = t.resolve || function() {
    return !0;
  }, this.construct = t.construct || function(r) {
    return r;
  }, this.instanceOf = t.instanceOf || null, this.predicate = t.predicate || null, this.represent = t.represent || null, this.representName = t.representName || null, this.defaultStyle = t.defaultStyle || null, this.multi = t.multi || !1, this.styleAliases = Cg(t.styleAliases || null), Tg.indexOf(this.kind) === -1)
    throw new ka('Unknown kind "' + this.kind + '" is specified for "' + e + '" YAML type.');
}
var De = Og, Tr = nn, Gi = De;
function Ma(e, t) {
  var r = [];
  return e[t].forEach(function(n) {
    var i = r.length;
    r.forEach(function(o, s) {
      o.tag === n.tag && o.kind === n.kind && o.multi === n.multi && (i = s);
    }), r[i] = n;
  }), r;
}
function $g() {
  var e = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {},
    multi: {
      scalar: [],
      sequence: [],
      mapping: [],
      fallback: []
    }
  }, t, r;
  function n(i) {
    i.multi ? (e.multi[i.kind].push(i), e.multi.fallback.push(i)) : e[i.kind][i.tag] = e.fallback[i.tag] = i;
  }
  for (t = 0, r = arguments.length; t < r; t += 1)
    arguments[t].forEach(n);
  return e;
}
function Ko(e) {
  return this.extend(e);
}
Ko.prototype.extend = function(t) {
  var r = [], n = [];
  if (t instanceof Gi)
    n.push(t);
  else if (Array.isArray(t))
    n = n.concat(t);
  else if (t && (Array.isArray(t.implicit) || Array.isArray(t.explicit)))
    t.implicit && (r = r.concat(t.implicit)), t.explicit && (n = n.concat(t.explicit));
  else
    throw new Tr("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  r.forEach(function(o) {
    if (!(o instanceof Gi))
      throw new Tr("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    if (o.loadKind && o.loadKind !== "scalar")
      throw new Tr("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    if (o.multi)
      throw new Tr("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
  }), n.forEach(function(o) {
    if (!(o instanceof Gi))
      throw new Tr("Specified list of YAML types (or a single Type object) contains a non-Type object.");
  });
  var i = Object.create(Ko.prototype);
  return i.implicit = (this.implicit || []).concat(r), i.explicit = (this.explicit || []).concat(n), i.compiledImplicit = Ma(i, "implicit"), i.compiledExplicit = Ma(i, "explicit"), i.compiledTypeMap = $g(i.compiledImplicit, i.compiledExplicit), i;
};
var xu = Ko, Rg = De, Lu = new Rg("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(e) {
    return e !== null ? e : "";
  }
}), Pg = De, Uu = new Pg("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(e) {
    return e !== null ? e : [];
  }
}), Ig = De, ku = new Ig("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(e) {
    return e !== null ? e : {};
  }
}), Dg = xu, Mu = new Dg({
  explicit: [
    Lu,
    Uu,
    ku
  ]
}), Ng = De;
function Fg(e) {
  if (e === null) return !0;
  var t = e.length;
  return t === 1 && e === "~" || t === 4 && (e === "null" || e === "Null" || e === "NULL");
}
function xg() {
  return null;
}
function Lg(e) {
  return e === null;
}
var Bu = new Ng("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: Fg,
  construct: xg,
  predicate: Lg,
  represent: {
    canonical: function() {
      return "~";
    },
    lowercase: function() {
      return "null";
    },
    uppercase: function() {
      return "NULL";
    },
    camelcase: function() {
      return "Null";
    },
    empty: function() {
      return "";
    }
  },
  defaultStyle: "lowercase"
}), Ug = De;
function kg(e) {
  if (e === null) return !1;
  var t = e.length;
  return t === 4 && (e === "true" || e === "True" || e === "TRUE") || t === 5 && (e === "false" || e === "False" || e === "FALSE");
}
function Mg(e) {
  return e === "true" || e === "True" || e === "TRUE";
}
function Bg(e) {
  return Object.prototype.toString.call(e) === "[object Boolean]";
}
var ju = new Ug("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: kg,
  construct: Mg,
  predicate: Bg,
  represent: {
    lowercase: function(e) {
      return e ? "true" : "false";
    },
    uppercase: function(e) {
      return e ? "TRUE" : "FALSE";
    },
    camelcase: function(e) {
      return e ? "True" : "False";
    }
  },
  defaultStyle: "lowercase"
}), jg = ze, qg = De;
function Hg(e) {
  return 48 <= e && e <= 57 || 65 <= e && e <= 70 || 97 <= e && e <= 102;
}
function Gg(e) {
  return 48 <= e && e <= 55;
}
function Wg(e) {
  return 48 <= e && e <= 57;
}
function Vg(e) {
  if (e === null) return !1;
  var t = e.length, r = 0, n = !1, i;
  if (!t) return !1;
  if (i = e[r], (i === "-" || i === "+") && (i = e[++r]), i === "0") {
    if (r + 1 === t) return !0;
    if (i = e[++r], i === "b") {
      for (r++; r < t; r++)
        if (i = e[r], i !== "_") {
          if (i !== "0" && i !== "1") return !1;
          n = !0;
        }
      return n && i !== "_";
    }
    if (i === "x") {
      for (r++; r < t; r++)
        if (i = e[r], i !== "_") {
          if (!Hg(e.charCodeAt(r))) return !1;
          n = !0;
        }
      return n && i !== "_";
    }
    if (i === "o") {
      for (r++; r < t; r++)
        if (i = e[r], i !== "_") {
          if (!Gg(e.charCodeAt(r))) return !1;
          n = !0;
        }
      return n && i !== "_";
    }
  }
  if (i === "_") return !1;
  for (; r < t; r++)
    if (i = e[r], i !== "_") {
      if (!Wg(e.charCodeAt(r)))
        return !1;
      n = !0;
    }
  return !(!n || i === "_");
}
function zg(e) {
  var t = e, r = 1, n;
  if (t.indexOf("_") !== -1 && (t = t.replace(/_/g, "")), n = t[0], (n === "-" || n === "+") && (n === "-" && (r = -1), t = t.slice(1), n = t[0]), t === "0") return 0;
  if (n === "0") {
    if (t[1] === "b") return r * parseInt(t.slice(2), 2);
    if (t[1] === "x") return r * parseInt(t.slice(2), 16);
    if (t[1] === "o") return r * parseInt(t.slice(2), 8);
  }
  return r * parseInt(t, 10);
}
function Yg(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && e % 1 === 0 && !jg.isNegativeZero(e);
}
var qu = new qg("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: Vg,
  construct: zg,
  predicate: Yg,
  represent: {
    binary: function(e) {
      return e >= 0 ? "0b" + e.toString(2) : "-0b" + e.toString(2).slice(1);
    },
    octal: function(e) {
      return e >= 0 ? "0o" + e.toString(8) : "-0o" + e.toString(8).slice(1);
    },
    decimal: function(e) {
      return e.toString(10);
    },
    /* eslint-disable max-len */
    hexadecimal: function(e) {
      return e >= 0 ? "0x" + e.toString(16).toUpperCase() : "-0x" + e.toString(16).toUpperCase().slice(1);
    }
  },
  defaultStyle: "decimal",
  styleAliases: {
    binary: [2, "bin"],
    octal: [8, "oct"],
    decimal: [10, "dec"],
    hexadecimal: [16, "hex"]
  }
}), Hu = ze, Xg = De, Jg = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function Kg(e) {
  return !(e === null || !Jg.test(e) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  e[e.length - 1] === "_");
}
function Qg(e) {
  var t, r;
  return t = e.replace(/_/g, "").toLowerCase(), r = t[0] === "-" ? -1 : 1, "+-".indexOf(t[0]) >= 0 && (t = t.slice(1)), t === ".inf" ? r === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : t === ".nan" ? NaN : r * parseFloat(t, 10);
}
var Zg = /^[-+]?[0-9]+e/;
function e0(e, t) {
  var r;
  if (isNaN(e))
    switch (t) {
      case "lowercase":
        return ".nan";
      case "uppercase":
        return ".NAN";
      case "camelcase":
        return ".NaN";
    }
  else if (Number.POSITIVE_INFINITY === e)
    switch (t) {
      case "lowercase":
        return ".inf";
      case "uppercase":
        return ".INF";
      case "camelcase":
        return ".Inf";
    }
  else if (Number.NEGATIVE_INFINITY === e)
    switch (t) {
      case "lowercase":
        return "-.inf";
      case "uppercase":
        return "-.INF";
      case "camelcase":
        return "-.Inf";
    }
  else if (Hu.isNegativeZero(e))
    return "-0.0";
  return r = e.toString(10), Zg.test(r) ? r.replace("e", ".e") : r;
}
function t0(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && (e % 1 !== 0 || Hu.isNegativeZero(e));
}
var Gu = new Xg("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: Kg,
  construct: Qg,
  predicate: t0,
  represent: e0,
  defaultStyle: "lowercase"
}), Wu = Mu.extend({
  implicit: [
    Bu,
    ju,
    qu,
    Gu
  ]
}), Vu = Wu, r0 = De, zu = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
), Yu = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function n0(e) {
  return e === null ? !1 : zu.exec(e) !== null || Yu.exec(e) !== null;
}
function i0(e) {
  var t, r, n, i, o, s, a, l = 0, f = null, c, u, h;
  if (t = zu.exec(e), t === null && (t = Yu.exec(e)), t === null) throw new Error("Date resolve error");
  if (r = +t[1], n = +t[2] - 1, i = +t[3], !t[4])
    return new Date(Date.UTC(r, n, i));
  if (o = +t[4], s = +t[5], a = +t[6], t[7]) {
    for (l = t[7].slice(0, 3); l.length < 3; )
      l += "0";
    l = +l;
  }
  return t[9] && (c = +t[10], u = +(t[11] || 0), f = (c * 60 + u) * 6e4, t[9] === "-" && (f = -f)), h = new Date(Date.UTC(r, n, i, o, s, a, l)), f && h.setTime(h.getTime() - f), h;
}
function o0(e) {
  return e.toISOString();
}
var Xu = new r0("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: n0,
  construct: i0,
  instanceOf: Date,
  represent: o0
}), s0 = De;
function a0(e) {
  return e === "<<" || e === null;
}
var Ju = new s0("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: a0
}), l0 = De, Ss = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
function c0(e) {
  if (e === null) return !1;
  var t, r, n = 0, i = e.length, o = Ss;
  for (r = 0; r < i; r++)
    if (t = o.indexOf(e.charAt(r)), !(t > 64)) {
      if (t < 0) return !1;
      n += 6;
    }
  return n % 8 === 0;
}
function u0(e) {
  var t, r, n = e.replace(/[\r\n=]/g, ""), i = n.length, o = Ss, s = 0, a = [];
  for (t = 0; t < i; t++)
    t % 4 === 0 && t && (a.push(s >> 16 & 255), a.push(s >> 8 & 255), a.push(s & 255)), s = s << 6 | o.indexOf(n.charAt(t));
  return r = i % 4 * 6, r === 0 ? (a.push(s >> 16 & 255), a.push(s >> 8 & 255), a.push(s & 255)) : r === 18 ? (a.push(s >> 10 & 255), a.push(s >> 2 & 255)) : r === 12 && a.push(s >> 4 & 255), new Uint8Array(a);
}
function f0(e) {
  var t = "", r = 0, n, i, o = e.length, s = Ss;
  for (n = 0; n < o; n++)
    n % 3 === 0 && n && (t += s[r >> 18 & 63], t += s[r >> 12 & 63], t += s[r >> 6 & 63], t += s[r & 63]), r = (r << 8) + e[n];
  return i = o % 3, i === 0 ? (t += s[r >> 18 & 63], t += s[r >> 12 & 63], t += s[r >> 6 & 63], t += s[r & 63]) : i === 2 ? (t += s[r >> 10 & 63], t += s[r >> 4 & 63], t += s[r << 2 & 63], t += s[64]) : i === 1 && (t += s[r >> 2 & 63], t += s[r << 4 & 63], t += s[64], t += s[64]), t;
}
function d0(e) {
  return Object.prototype.toString.call(e) === "[object Uint8Array]";
}
var Ku = new l0("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: c0,
  construct: u0,
  predicate: d0,
  represent: f0
}), h0 = De, p0 = Object.prototype.hasOwnProperty, m0 = Object.prototype.toString;
function g0(e) {
  if (e === null) return !0;
  var t = [], r, n, i, o, s, a = e;
  for (r = 0, n = a.length; r < n; r += 1) {
    if (i = a[r], s = !1, m0.call(i) !== "[object Object]") return !1;
    for (o in i)
      if (p0.call(i, o))
        if (!s) s = !0;
        else return !1;
    if (!s) return !1;
    if (t.indexOf(o) === -1) t.push(o);
    else return !1;
  }
  return !0;
}
function y0(e) {
  return e !== null ? e : [];
}
var Qu = new h0("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: g0,
  construct: y0
}), E0 = De, v0 = Object.prototype.toString;
function w0(e) {
  if (e === null) return !0;
  var t, r, n, i, o, s = e;
  for (o = new Array(s.length), t = 0, r = s.length; t < r; t += 1) {
    if (n = s[t], v0.call(n) !== "[object Object]" || (i = Object.keys(n), i.length !== 1)) return !1;
    o[t] = [i[0], n[i[0]]];
  }
  return !0;
}
function _0(e) {
  if (e === null) return [];
  var t, r, n, i, o, s = e;
  for (o = new Array(s.length), t = 0, r = s.length; t < r; t += 1)
    n = s[t], i = Object.keys(n), o[t] = [i[0], n[i[0]]];
  return o;
}
var Zu = new E0("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: w0,
  construct: _0
}), S0 = De, A0 = Object.prototype.hasOwnProperty;
function b0(e) {
  if (e === null) return !0;
  var t, r = e;
  for (t in r)
    if (A0.call(r, t) && r[t] !== null)
      return !1;
  return !0;
}
function T0(e) {
  return e !== null ? e : {};
}
var ef = new S0("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: b0,
  construct: T0
}), As = Vu.extend({
  implicit: [
    Xu,
    Ju
  ],
  explicit: [
    Ku,
    Qu,
    Zu,
    ef
  ]
}), xt = ze, tf = nn, C0 = Ag, O0 = As, vt = Object.prototype.hasOwnProperty, Yn = 1, rf = 2, nf = 3, Xn = 4, Wi = 1, $0 = 2, Ba = 3, R0 = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, P0 = /[\x85\u2028\u2029]/, I0 = /[,\[\]\{\}]/, of = /^(?:!|!!|![a-z\-]+!)$/i, sf = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function ja(e) {
  return Object.prototype.toString.call(e);
}
function Ze(e) {
  return e === 10 || e === 13;
}
function Mt(e) {
  return e === 9 || e === 32;
}
function xe(e) {
  return e === 9 || e === 32 || e === 10 || e === 13;
}
function rr(e) {
  return e === 44 || e === 91 || e === 93 || e === 123 || e === 125;
}
function D0(e) {
  var t;
  return 48 <= e && e <= 57 ? e - 48 : (t = e | 32, 97 <= t && t <= 102 ? t - 97 + 10 : -1);
}
function N0(e) {
  return e === 120 ? 2 : e === 117 ? 4 : e === 85 ? 8 : 0;
}
function F0(e) {
  return 48 <= e && e <= 57 ? e - 48 : -1;
}
function qa(e) {
  return e === 48 ? "\0" : e === 97 ? "\x07" : e === 98 ? "\b" : e === 116 || e === 9 ? "	" : e === 110 ? `
` : e === 118 ? "\v" : e === 102 ? "\f" : e === 114 ? "\r" : e === 101 ? "\x1B" : e === 32 ? " " : e === 34 ? '"' : e === 47 ? "/" : e === 92 ? "\\" : e === 78 ? "" : e === 95 ? " " : e === 76 ? "\u2028" : e === 80 ? "\u2029" : "";
}
function x0(e) {
  return e <= 65535 ? String.fromCharCode(e) : String.fromCharCode(
    (e - 65536 >> 10) + 55296,
    (e - 65536 & 1023) + 56320
  );
}
function af(e, t, r) {
  t === "__proto__" ? Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !0,
    writable: !0,
    value: r
  }) : e[t] = r;
}
var lf = new Array(256), cf = new Array(256);
for (var Jt = 0; Jt < 256; Jt++)
  lf[Jt] = qa(Jt) ? 1 : 0, cf[Jt] = qa(Jt);
function L0(e, t) {
  this.input = e, this.filename = t.filename || null, this.schema = t.schema || O0, this.onWarning = t.onWarning || null, this.legacy = t.legacy || !1, this.json = t.json || !1, this.listener = t.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = e.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = [];
}
function uf(e, t) {
  var r = {
    name: e.filename,
    buffer: e.input.slice(0, -1),
    // omit trailing \0
    position: e.position,
    line: e.line,
    column: e.position - e.lineStart
  };
  return r.snippet = C0(r), new tf(t, r);
}
function U(e, t) {
  throw uf(e, t);
}
function Jn(e, t) {
  e.onWarning && e.onWarning.call(null, uf(e, t));
}
var Ha = {
  YAML: function(t, r, n) {
    var i, o, s;
    t.version !== null && U(t, "duplication of %YAML directive"), n.length !== 1 && U(t, "YAML directive accepts exactly one argument"), i = /^([0-9]+)\.([0-9]+)$/.exec(n[0]), i === null && U(t, "ill-formed argument of the YAML directive"), o = parseInt(i[1], 10), s = parseInt(i[2], 10), o !== 1 && U(t, "unacceptable YAML version of the document"), t.version = n[0], t.checkLineBreaks = s < 2, s !== 1 && s !== 2 && Jn(t, "unsupported YAML version of the document");
  },
  TAG: function(t, r, n) {
    var i, o;
    n.length !== 2 && U(t, "TAG directive accepts exactly two arguments"), i = n[0], o = n[1], of.test(i) || U(t, "ill-formed tag handle (first argument) of the TAG directive"), vt.call(t.tagMap, i) && U(t, 'there is a previously declared suffix for "' + i + '" tag handle'), sf.test(o) || U(t, "ill-formed tag prefix (second argument) of the TAG directive");
    try {
      o = decodeURIComponent(o);
    } catch {
      U(t, "tag prefix is malformed: " + o);
    }
    t.tagMap[i] = o;
  }
};
function mt(e, t, r, n) {
  var i, o, s, a;
  if (t < r) {
    if (a = e.input.slice(t, r), n)
      for (i = 0, o = a.length; i < o; i += 1)
        s = a.charCodeAt(i), s === 9 || 32 <= s && s <= 1114111 || U(e, "expected valid JSON character");
    else R0.test(a) && U(e, "the stream contains non-printable characters");
    e.result += a;
  }
}
function Ga(e, t, r, n) {
  var i, o, s, a;
  for (xt.isObject(r) || U(e, "cannot merge mappings; the provided source object is unacceptable"), i = Object.keys(r), s = 0, a = i.length; s < a; s += 1)
    o = i[s], vt.call(t, o) || (af(t, o, r[o]), n[o] = !0);
}
function nr(e, t, r, n, i, o, s, a, l) {
  var f, c;
  if (Array.isArray(i))
    for (i = Array.prototype.slice.call(i), f = 0, c = i.length; f < c; f += 1)
      Array.isArray(i[f]) && U(e, "nested arrays are not supported inside keys"), typeof i == "object" && ja(i[f]) === "[object Object]" && (i[f] = "[object Object]");
  if (typeof i == "object" && ja(i) === "[object Object]" && (i = "[object Object]"), i = String(i), t === null && (t = {}), n === "tag:yaml.org,2002:merge")
    if (Array.isArray(o))
      for (f = 0, c = o.length; f < c; f += 1)
        Ga(e, t, o[f], r);
    else
      Ga(e, t, o, r);
  else
    !e.json && !vt.call(r, i) && vt.call(t, i) && (e.line = s || e.line, e.lineStart = a || e.lineStart, e.position = l || e.position, U(e, "duplicated mapping key")), af(t, i, o), delete r[i];
  return t;
}
function bs(e) {
  var t;
  t = e.input.charCodeAt(e.position), t === 10 ? e.position++ : t === 13 ? (e.position++, e.input.charCodeAt(e.position) === 10 && e.position++) : U(e, "a line break is expected"), e.line += 1, e.lineStart = e.position, e.firstTabInLine = -1;
}
function ce(e, t, r) {
  for (var n = 0, i = e.input.charCodeAt(e.position); i !== 0; ) {
    for (; Mt(i); )
      i === 9 && e.firstTabInLine === -1 && (e.firstTabInLine = e.position), i = e.input.charCodeAt(++e.position);
    if (t && i === 35)
      do
        i = e.input.charCodeAt(++e.position);
      while (i !== 10 && i !== 13 && i !== 0);
    if (Ze(i))
      for (bs(e), i = e.input.charCodeAt(e.position), n++, e.lineIndent = 0; i === 32; )
        e.lineIndent++, i = e.input.charCodeAt(++e.position);
    else
      break;
  }
  return r !== -1 && n !== 0 && e.lineIndent < r && Jn(e, "deficient indentation"), n;
}
function li(e) {
  var t = e.position, r;
  return r = e.input.charCodeAt(t), !!((r === 45 || r === 46) && r === e.input.charCodeAt(t + 1) && r === e.input.charCodeAt(t + 2) && (t += 3, r = e.input.charCodeAt(t), r === 0 || xe(r)));
}
function Ts(e, t) {
  t === 1 ? e.result += " " : t > 1 && (e.result += xt.repeat(`
`, t - 1));
}
function U0(e, t, r) {
  var n, i, o, s, a, l, f, c, u = e.kind, h = e.result, m;
  if (m = e.input.charCodeAt(e.position), xe(m) || rr(m) || m === 35 || m === 38 || m === 42 || m === 33 || m === 124 || m === 62 || m === 39 || m === 34 || m === 37 || m === 64 || m === 96 || (m === 63 || m === 45) && (i = e.input.charCodeAt(e.position + 1), xe(i) || r && rr(i)))
    return !1;
  for (e.kind = "scalar", e.result = "", o = s = e.position, a = !1; m !== 0; ) {
    if (m === 58) {
      if (i = e.input.charCodeAt(e.position + 1), xe(i) || r && rr(i))
        break;
    } else if (m === 35) {
      if (n = e.input.charCodeAt(e.position - 1), xe(n))
        break;
    } else {
      if (e.position === e.lineStart && li(e) || r && rr(m))
        break;
      if (Ze(m))
        if (l = e.line, f = e.lineStart, c = e.lineIndent, ce(e, !1, -1), e.lineIndent >= t) {
          a = !0, m = e.input.charCodeAt(e.position);
          continue;
        } else {
          e.position = s, e.line = l, e.lineStart = f, e.lineIndent = c;
          break;
        }
    }
    a && (mt(e, o, s, !1), Ts(e, e.line - l), o = s = e.position, a = !1), Mt(m) || (s = e.position + 1), m = e.input.charCodeAt(++e.position);
  }
  return mt(e, o, s, !1), e.result ? !0 : (e.kind = u, e.result = h, !1);
}
function k0(e, t) {
  var r, n, i;
  if (r = e.input.charCodeAt(e.position), r !== 39)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, n = i = e.position; (r = e.input.charCodeAt(e.position)) !== 0; )
    if (r === 39)
      if (mt(e, n, e.position, !0), r = e.input.charCodeAt(++e.position), r === 39)
        n = e.position, e.position++, i = e.position;
      else
        return !0;
    else Ze(r) ? (mt(e, n, i, !0), Ts(e, ce(e, !1, t)), n = i = e.position) : e.position === e.lineStart && li(e) ? U(e, "unexpected end of the document within a single quoted scalar") : (e.position++, i = e.position);
  U(e, "unexpected end of the stream within a single quoted scalar");
}
function M0(e, t) {
  var r, n, i, o, s, a;
  if (a = e.input.charCodeAt(e.position), a !== 34)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, r = n = e.position; (a = e.input.charCodeAt(e.position)) !== 0; ) {
    if (a === 34)
      return mt(e, r, e.position, !0), e.position++, !0;
    if (a === 92) {
      if (mt(e, r, e.position, !0), a = e.input.charCodeAt(++e.position), Ze(a))
        ce(e, !1, t);
      else if (a < 256 && lf[a])
        e.result += cf[a], e.position++;
      else if ((s = N0(a)) > 0) {
        for (i = s, o = 0; i > 0; i--)
          a = e.input.charCodeAt(++e.position), (s = D0(a)) >= 0 ? o = (o << 4) + s : U(e, "expected hexadecimal character");
        e.result += x0(o), e.position++;
      } else
        U(e, "unknown escape sequence");
      r = n = e.position;
    } else Ze(a) ? (mt(e, r, n, !0), Ts(e, ce(e, !1, t)), r = n = e.position) : e.position === e.lineStart && li(e) ? U(e, "unexpected end of the document within a double quoted scalar") : (e.position++, n = e.position);
  }
  U(e, "unexpected end of the stream within a double quoted scalar");
}
function B0(e, t) {
  var r = !0, n, i, o, s = e.tag, a, l = e.anchor, f, c, u, h, m, E = /* @__PURE__ */ Object.create(null), y, S, A, T;
  if (T = e.input.charCodeAt(e.position), T === 91)
    c = 93, m = !1, a = [];
  else if (T === 123)
    c = 125, m = !0, a = {};
  else
    return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = a), T = e.input.charCodeAt(++e.position); T !== 0; ) {
    if (ce(e, !0, t), T = e.input.charCodeAt(e.position), T === c)
      return e.position++, e.tag = s, e.anchor = l, e.kind = m ? "mapping" : "sequence", e.result = a, !0;
    r ? T === 44 && U(e, "expected the node content, but found ','") : U(e, "missed comma between flow collection entries"), S = y = A = null, u = h = !1, T === 63 && (f = e.input.charCodeAt(e.position + 1), xe(f) && (u = h = !0, e.position++, ce(e, !0, t))), n = e.line, i = e.lineStart, o = e.position, dr(e, t, Yn, !1, !0), S = e.tag, y = e.result, ce(e, !0, t), T = e.input.charCodeAt(e.position), (h || e.line === n) && T === 58 && (u = !0, T = e.input.charCodeAt(++e.position), ce(e, !0, t), dr(e, t, Yn, !1, !0), A = e.result), m ? nr(e, a, E, S, y, A, n, i, o) : u ? a.push(nr(e, null, E, S, y, A, n, i, o)) : a.push(y), ce(e, !0, t), T = e.input.charCodeAt(e.position), T === 44 ? (r = !0, T = e.input.charCodeAt(++e.position)) : r = !1;
  }
  U(e, "unexpected end of the stream within a flow collection");
}
function j0(e, t) {
  var r, n, i = Wi, o = !1, s = !1, a = t, l = 0, f = !1, c, u;
  if (u = e.input.charCodeAt(e.position), u === 124)
    n = !1;
  else if (u === 62)
    n = !0;
  else
    return !1;
  for (e.kind = "scalar", e.result = ""; u !== 0; )
    if (u = e.input.charCodeAt(++e.position), u === 43 || u === 45)
      Wi === i ? i = u === 43 ? Ba : $0 : U(e, "repeat of a chomping mode identifier");
    else if ((c = F0(u)) >= 0)
      c === 0 ? U(e, "bad explicit indentation width of a block scalar; it cannot be less than one") : s ? U(e, "repeat of an indentation width identifier") : (a = t + c - 1, s = !0);
    else
      break;
  if (Mt(u)) {
    do
      u = e.input.charCodeAt(++e.position);
    while (Mt(u));
    if (u === 35)
      do
        u = e.input.charCodeAt(++e.position);
      while (!Ze(u) && u !== 0);
  }
  for (; u !== 0; ) {
    for (bs(e), e.lineIndent = 0, u = e.input.charCodeAt(e.position); (!s || e.lineIndent < a) && u === 32; )
      e.lineIndent++, u = e.input.charCodeAt(++e.position);
    if (!s && e.lineIndent > a && (a = e.lineIndent), Ze(u)) {
      l++;
      continue;
    }
    if (e.lineIndent < a) {
      i === Ba ? e.result += xt.repeat(`
`, o ? 1 + l : l) : i === Wi && o && (e.result += `
`);
      break;
    }
    for (n ? Mt(u) ? (f = !0, e.result += xt.repeat(`
`, o ? 1 + l : l)) : f ? (f = !1, e.result += xt.repeat(`
`, l + 1)) : l === 0 ? o && (e.result += " ") : e.result += xt.repeat(`
`, l) : e.result += xt.repeat(`
`, o ? 1 + l : l), o = !0, s = !0, l = 0, r = e.position; !Ze(u) && u !== 0; )
      u = e.input.charCodeAt(++e.position);
    mt(e, r, e.position, !1);
  }
  return !0;
}
function Wa(e, t) {
  var r, n = e.tag, i = e.anchor, o = [], s, a = !1, l;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = o), l = e.input.charCodeAt(e.position); l !== 0 && (e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, U(e, "tab characters must not be used in indentation")), !(l !== 45 || (s = e.input.charCodeAt(e.position + 1), !xe(s)))); ) {
    if (a = !0, e.position++, ce(e, !0, -1) && e.lineIndent <= t) {
      o.push(null), l = e.input.charCodeAt(e.position);
      continue;
    }
    if (r = e.line, dr(e, t, nf, !1, !0), o.push(e.result), ce(e, !0, -1), l = e.input.charCodeAt(e.position), (e.line === r || e.lineIndent > t) && l !== 0)
      U(e, "bad indentation of a sequence entry");
    else if (e.lineIndent < t)
      break;
  }
  return a ? (e.tag = n, e.anchor = i, e.kind = "sequence", e.result = o, !0) : !1;
}
function q0(e, t, r) {
  var n, i, o, s, a, l, f = e.tag, c = e.anchor, u = {}, h = /* @__PURE__ */ Object.create(null), m = null, E = null, y = null, S = !1, A = !1, T;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = u), T = e.input.charCodeAt(e.position); T !== 0; ) {
    if (!S && e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, U(e, "tab characters must not be used in indentation")), n = e.input.charCodeAt(e.position + 1), o = e.line, (T === 63 || T === 58) && xe(n))
      T === 63 ? (S && (nr(e, u, h, m, E, null, s, a, l), m = E = y = null), A = !0, S = !0, i = !0) : S ? (S = !1, i = !0) : U(e, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), e.position += 1, T = n;
    else {
      if (s = e.line, a = e.lineStart, l = e.position, !dr(e, r, rf, !1, !0))
        break;
      if (e.line === o) {
        for (T = e.input.charCodeAt(e.position); Mt(T); )
          T = e.input.charCodeAt(++e.position);
        if (T === 58)
          T = e.input.charCodeAt(++e.position), xe(T) || U(e, "a whitespace character is expected after the key-value separator within a block mapping"), S && (nr(e, u, h, m, E, null, s, a, l), m = E = y = null), A = !0, S = !1, i = !1, m = e.tag, E = e.result;
        else if (A)
          U(e, "can not read an implicit mapping pair; a colon is missed");
        else
          return e.tag = f, e.anchor = c, !0;
      } else if (A)
        U(e, "can not read a block mapping entry; a multiline key may not be an implicit key");
      else
        return e.tag = f, e.anchor = c, !0;
    }
    if ((e.line === o || e.lineIndent > t) && (S && (s = e.line, a = e.lineStart, l = e.position), dr(e, t, Xn, !0, i) && (S ? E = e.result : y = e.result), S || (nr(e, u, h, m, E, y, s, a, l), m = E = y = null), ce(e, !0, -1), T = e.input.charCodeAt(e.position)), (e.line === o || e.lineIndent > t) && T !== 0)
      U(e, "bad indentation of a mapping entry");
    else if (e.lineIndent < t)
      break;
  }
  return S && nr(e, u, h, m, E, null, s, a, l), A && (e.tag = f, e.anchor = c, e.kind = "mapping", e.result = u), A;
}
function H0(e) {
  var t, r = !1, n = !1, i, o, s;
  if (s = e.input.charCodeAt(e.position), s !== 33) return !1;
  if (e.tag !== null && U(e, "duplication of a tag property"), s = e.input.charCodeAt(++e.position), s === 60 ? (r = !0, s = e.input.charCodeAt(++e.position)) : s === 33 ? (n = !0, i = "!!", s = e.input.charCodeAt(++e.position)) : i = "!", t = e.position, r) {
    do
      s = e.input.charCodeAt(++e.position);
    while (s !== 0 && s !== 62);
    e.position < e.length ? (o = e.input.slice(t, e.position), s = e.input.charCodeAt(++e.position)) : U(e, "unexpected end of the stream within a verbatim tag");
  } else {
    for (; s !== 0 && !xe(s); )
      s === 33 && (n ? U(e, "tag suffix cannot contain exclamation marks") : (i = e.input.slice(t - 1, e.position + 1), of.test(i) || U(e, "named tag handle cannot contain such characters"), n = !0, t = e.position + 1)), s = e.input.charCodeAt(++e.position);
    o = e.input.slice(t, e.position), I0.test(o) && U(e, "tag suffix cannot contain flow indicator characters");
  }
  o && !sf.test(o) && U(e, "tag name cannot contain such characters: " + o);
  try {
    o = decodeURIComponent(o);
  } catch {
    U(e, "tag name is malformed: " + o);
  }
  return r ? e.tag = o : vt.call(e.tagMap, i) ? e.tag = e.tagMap[i] + o : i === "!" ? e.tag = "!" + o : i === "!!" ? e.tag = "tag:yaml.org,2002:" + o : U(e, 'undeclared tag handle "' + i + '"'), !0;
}
function G0(e) {
  var t, r;
  if (r = e.input.charCodeAt(e.position), r !== 38) return !1;
  for (e.anchor !== null && U(e, "duplication of an anchor property"), r = e.input.charCodeAt(++e.position), t = e.position; r !== 0 && !xe(r) && !rr(r); )
    r = e.input.charCodeAt(++e.position);
  return e.position === t && U(e, "name of an anchor node must contain at least one character"), e.anchor = e.input.slice(t, e.position), !0;
}
function W0(e) {
  var t, r, n;
  if (n = e.input.charCodeAt(e.position), n !== 42) return !1;
  for (n = e.input.charCodeAt(++e.position), t = e.position; n !== 0 && !xe(n) && !rr(n); )
    n = e.input.charCodeAt(++e.position);
  return e.position === t && U(e, "name of an alias node must contain at least one character"), r = e.input.slice(t, e.position), vt.call(e.anchorMap, r) || U(e, 'unidentified alias "' + r + '"'), e.result = e.anchorMap[r], ce(e, !0, -1), !0;
}
function dr(e, t, r, n, i) {
  var o, s, a, l = 1, f = !1, c = !1, u, h, m, E, y, S;
  if (e.listener !== null && e.listener("open", e), e.tag = null, e.anchor = null, e.kind = null, e.result = null, o = s = a = Xn === r || nf === r, n && ce(e, !0, -1) && (f = !0, e.lineIndent > t ? l = 1 : e.lineIndent === t ? l = 0 : e.lineIndent < t && (l = -1)), l === 1)
    for (; H0(e) || G0(e); )
      ce(e, !0, -1) ? (f = !0, a = o, e.lineIndent > t ? l = 1 : e.lineIndent === t ? l = 0 : e.lineIndent < t && (l = -1)) : a = !1;
  if (a && (a = f || i), (l === 1 || Xn === r) && (Yn === r || rf === r ? y = t : y = t + 1, S = e.position - e.lineStart, l === 1 ? a && (Wa(e, S) || q0(e, S, y)) || B0(e, y) ? c = !0 : (s && j0(e, y) || k0(e, y) || M0(e, y) ? c = !0 : W0(e) ? (c = !0, (e.tag !== null || e.anchor !== null) && U(e, "alias node should not have any properties")) : U0(e, y, Yn === r) && (c = !0, e.tag === null && (e.tag = "?")), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : l === 0 && (c = a && Wa(e, S))), e.tag === null)
    e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
  else if (e.tag === "?") {
    for (e.result !== null && e.kind !== "scalar" && U(e, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + e.kind + '"'), u = 0, h = e.implicitTypes.length; u < h; u += 1)
      if (E = e.implicitTypes[u], E.resolve(e.result)) {
        e.result = E.construct(e.result), e.tag = E.tag, e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
        break;
      }
  } else if (e.tag !== "!") {
    if (vt.call(e.typeMap[e.kind || "fallback"], e.tag))
      E = e.typeMap[e.kind || "fallback"][e.tag];
    else
      for (E = null, m = e.typeMap.multi[e.kind || "fallback"], u = 0, h = m.length; u < h; u += 1)
        if (e.tag.slice(0, m[u].tag.length) === m[u].tag) {
          E = m[u];
          break;
        }
    E || U(e, "unknown tag !<" + e.tag + ">"), e.result !== null && E.kind !== e.kind && U(e, "unacceptable node kind for !<" + e.tag + '> tag; it should be "' + E.kind + '", not "' + e.kind + '"'), E.resolve(e.result, e.tag) ? (e.result = E.construct(e.result, e.tag), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : U(e, "cannot resolve a node with !<" + e.tag + "> explicit tag");
  }
  return e.listener !== null && e.listener("close", e), e.tag !== null || e.anchor !== null || c;
}
function V0(e) {
  var t = e.position, r, n, i, o = !1, s;
  for (e.version = null, e.checkLineBreaks = e.legacy, e.tagMap = /* @__PURE__ */ Object.create(null), e.anchorMap = /* @__PURE__ */ Object.create(null); (s = e.input.charCodeAt(e.position)) !== 0 && (ce(e, !0, -1), s = e.input.charCodeAt(e.position), !(e.lineIndent > 0 || s !== 37)); ) {
    for (o = !0, s = e.input.charCodeAt(++e.position), r = e.position; s !== 0 && !xe(s); )
      s = e.input.charCodeAt(++e.position);
    for (n = e.input.slice(r, e.position), i = [], n.length < 1 && U(e, "directive name must not be less than one character in length"); s !== 0; ) {
      for (; Mt(s); )
        s = e.input.charCodeAt(++e.position);
      if (s === 35) {
        do
          s = e.input.charCodeAt(++e.position);
        while (s !== 0 && !Ze(s));
        break;
      }
      if (Ze(s)) break;
      for (r = e.position; s !== 0 && !xe(s); )
        s = e.input.charCodeAt(++e.position);
      i.push(e.input.slice(r, e.position));
    }
    s !== 0 && bs(e), vt.call(Ha, n) ? Ha[n](e, n, i) : Jn(e, 'unknown document directive "' + n + '"');
  }
  if (ce(e, !0, -1), e.lineIndent === 0 && e.input.charCodeAt(e.position) === 45 && e.input.charCodeAt(e.position + 1) === 45 && e.input.charCodeAt(e.position + 2) === 45 ? (e.position += 3, ce(e, !0, -1)) : o && U(e, "directives end mark is expected"), dr(e, e.lineIndent - 1, Xn, !1, !0), ce(e, !0, -1), e.checkLineBreaks && P0.test(e.input.slice(t, e.position)) && Jn(e, "non-ASCII line breaks are interpreted as content"), e.documents.push(e.result), e.position === e.lineStart && li(e)) {
    e.input.charCodeAt(e.position) === 46 && (e.position += 3, ce(e, !0, -1));
    return;
  }
  if (e.position < e.length - 1)
    U(e, "end of the stream or a document separator is expected");
  else
    return;
}
function ff(e, t) {
  e = String(e), t = t || {}, e.length !== 0 && (e.charCodeAt(e.length - 1) !== 10 && e.charCodeAt(e.length - 1) !== 13 && (e += `
`), e.charCodeAt(0) === 65279 && (e = e.slice(1)));
  var r = new L0(e, t), n = e.indexOf("\0");
  for (n !== -1 && (r.position = n, U(r, "null byte is not allowed in input")), r.input += "\0"; r.input.charCodeAt(r.position) === 32; )
    r.lineIndent += 1, r.position += 1;
  for (; r.position < r.length - 1; )
    V0(r);
  return r.documents;
}
function z0(e, t, r) {
  t !== null && typeof t == "object" && typeof r > "u" && (r = t, t = null);
  var n = ff(e, r);
  if (typeof t != "function")
    return n;
  for (var i = 0, o = n.length; i < o; i += 1)
    t(n[i]);
}
function Y0(e, t) {
  var r = ff(e, t);
  if (r.length !== 0) {
    if (r.length === 1)
      return r[0];
    throw new tf("expected a single document in the stream, but found more");
  }
}
_s.loadAll = z0;
_s.load = Y0;
var df = {}, ci = ze, on = nn, X0 = As, hf = Object.prototype.toString, pf = Object.prototype.hasOwnProperty, Cs = 65279, J0 = 9, jr = 10, K0 = 13, Q0 = 32, Z0 = 33, ey = 34, Qo = 35, ty = 37, ry = 38, ny = 39, iy = 42, mf = 44, oy = 45, Kn = 58, sy = 61, ay = 62, ly = 63, cy = 64, gf = 91, yf = 93, uy = 96, Ef = 123, fy = 124, vf = 125, be = {};
be[0] = "\\0";
be[7] = "\\a";
be[8] = "\\b";
be[9] = "\\t";
be[10] = "\\n";
be[11] = "\\v";
be[12] = "\\f";
be[13] = "\\r";
be[27] = "\\e";
be[34] = '\\"';
be[92] = "\\\\";
be[133] = "\\N";
be[160] = "\\_";
be[8232] = "\\L";
be[8233] = "\\P";
var dy = [
  "y",
  "Y",
  "yes",
  "Yes",
  "YES",
  "on",
  "On",
  "ON",
  "n",
  "N",
  "no",
  "No",
  "NO",
  "off",
  "Off",
  "OFF"
], hy = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
function py(e, t) {
  var r, n, i, o, s, a, l;
  if (t === null) return {};
  for (r = {}, n = Object.keys(t), i = 0, o = n.length; i < o; i += 1)
    s = n[i], a = String(t[s]), s.slice(0, 2) === "!!" && (s = "tag:yaml.org,2002:" + s.slice(2)), l = e.compiledTypeMap.fallback[s], l && pf.call(l.styleAliases, a) && (a = l.styleAliases[a]), r[s] = a;
  return r;
}
function my(e) {
  var t, r, n;
  if (t = e.toString(16).toUpperCase(), e <= 255)
    r = "x", n = 2;
  else if (e <= 65535)
    r = "u", n = 4;
  else if (e <= 4294967295)
    r = "U", n = 8;
  else
    throw new on("code point within a string may not be greater than 0xFFFFFFFF");
  return "\\" + r + ci.repeat("0", n - t.length) + t;
}
var gy = 1, qr = 2;
function yy(e) {
  this.schema = e.schema || X0, this.indent = Math.max(1, e.indent || 2), this.noArrayIndent = e.noArrayIndent || !1, this.skipInvalid = e.skipInvalid || !1, this.flowLevel = ci.isNothing(e.flowLevel) ? -1 : e.flowLevel, this.styleMap = py(this.schema, e.styles || null), this.sortKeys = e.sortKeys || !1, this.lineWidth = e.lineWidth || 80, this.noRefs = e.noRefs || !1, this.noCompatMode = e.noCompatMode || !1, this.condenseFlow = e.condenseFlow || !1, this.quotingType = e.quotingType === '"' ? qr : gy, this.forceQuotes = e.forceQuotes || !1, this.replacer = typeof e.replacer == "function" ? e.replacer : null, this.implicitTypes = this.schema.compiledImplicit, this.explicitTypes = this.schema.compiledExplicit, this.tag = null, this.result = "", this.duplicates = [], this.usedDuplicates = null;
}
function Va(e, t) {
  for (var r = ci.repeat(" ", t), n = 0, i = -1, o = "", s, a = e.length; n < a; )
    i = e.indexOf(`
`, n), i === -1 ? (s = e.slice(n), n = a) : (s = e.slice(n, i + 1), n = i + 1), s.length && s !== `
` && (o += r), o += s;
  return o;
}
function Zo(e, t) {
  return `
` + ci.repeat(" ", e.indent * t);
}
function Ey(e, t) {
  var r, n, i;
  for (r = 0, n = e.implicitTypes.length; r < n; r += 1)
    if (i = e.implicitTypes[r], i.resolve(t))
      return !0;
  return !1;
}
function Qn(e) {
  return e === Q0 || e === J0;
}
function Hr(e) {
  return 32 <= e && e <= 126 || 161 <= e && e <= 55295 && e !== 8232 && e !== 8233 || 57344 <= e && e <= 65533 && e !== Cs || 65536 <= e && e <= 1114111;
}
function za(e) {
  return Hr(e) && e !== Cs && e !== K0 && e !== jr;
}
function Ya(e, t, r) {
  var n = za(e), i = n && !Qn(e);
  return (
    // ns-plain-safe
    (r ? (
      // c = flow-in
      n
    ) : n && e !== mf && e !== gf && e !== yf && e !== Ef && e !== vf) && e !== Qo && !(t === Kn && !i) || za(t) && !Qn(t) && e === Qo || t === Kn && i
  );
}
function vy(e) {
  return Hr(e) && e !== Cs && !Qn(e) && e !== oy && e !== ly && e !== Kn && e !== mf && e !== gf && e !== yf && e !== Ef && e !== vf && e !== Qo && e !== ry && e !== iy && e !== Z0 && e !== fy && e !== sy && e !== ay && e !== ny && e !== ey && e !== ty && e !== cy && e !== uy;
}
function wy(e) {
  return !Qn(e) && e !== Kn;
}
function Pr(e, t) {
  var r = e.charCodeAt(t), n;
  return r >= 55296 && r <= 56319 && t + 1 < e.length && (n = e.charCodeAt(t + 1), n >= 56320 && n <= 57343) ? (r - 55296) * 1024 + n - 56320 + 65536 : r;
}
function wf(e) {
  var t = /^\n* /;
  return t.test(e);
}
var _f = 1, es = 2, Sf = 3, Af = 4, er = 5;
function _y(e, t, r, n, i, o, s, a) {
  var l, f = 0, c = null, u = !1, h = !1, m = n !== -1, E = -1, y = vy(Pr(e, 0)) && wy(Pr(e, e.length - 1));
  if (t || s)
    for (l = 0; l < e.length; f >= 65536 ? l += 2 : l++) {
      if (f = Pr(e, l), !Hr(f))
        return er;
      y = y && Ya(f, c, a), c = f;
    }
  else {
    for (l = 0; l < e.length; f >= 65536 ? l += 2 : l++) {
      if (f = Pr(e, l), f === jr)
        u = !0, m && (h = h || // Foldable line = too long, and not more-indented.
        l - E - 1 > n && e[E + 1] !== " ", E = l);
      else if (!Hr(f))
        return er;
      y = y && Ya(f, c, a), c = f;
    }
    h = h || m && l - E - 1 > n && e[E + 1] !== " ";
  }
  return !u && !h ? y && !s && !i(e) ? _f : o === qr ? er : es : r > 9 && wf(e) ? er : s ? o === qr ? er : es : h ? Af : Sf;
}
function Sy(e, t, r, n, i) {
  e.dump = function() {
    if (t.length === 0)
      return e.quotingType === qr ? '""' : "''";
    if (!e.noCompatMode && (dy.indexOf(t) !== -1 || hy.test(t)))
      return e.quotingType === qr ? '"' + t + '"' : "'" + t + "'";
    var o = e.indent * Math.max(1, r), s = e.lineWidth === -1 ? -1 : Math.max(Math.min(e.lineWidth, 40), e.lineWidth - o), a = n || e.flowLevel > -1 && r >= e.flowLevel;
    function l(f) {
      return Ey(e, f);
    }
    switch (_y(
      t,
      a,
      e.indent,
      s,
      l,
      e.quotingType,
      e.forceQuotes && !n,
      i
    )) {
      case _f:
        return t;
      case es:
        return "'" + t.replace(/'/g, "''") + "'";
      case Sf:
        return "|" + Xa(t, e.indent) + Ja(Va(t, o));
      case Af:
        return ">" + Xa(t, e.indent) + Ja(Va(Ay(t, s), o));
      case er:
        return '"' + by(t) + '"';
      default:
        throw new on("impossible error: invalid scalar style");
    }
  }();
}
function Xa(e, t) {
  var r = wf(e) ? String(t) : "", n = e[e.length - 1] === `
`, i = n && (e[e.length - 2] === `
` || e === `
`), o = i ? "+" : n ? "" : "-";
  return r + o + `
`;
}
function Ja(e) {
  return e[e.length - 1] === `
` ? e.slice(0, -1) : e;
}
function Ay(e, t) {
  for (var r = /(\n+)([^\n]*)/g, n = function() {
    var f = e.indexOf(`
`);
    return f = f !== -1 ? f : e.length, r.lastIndex = f, Ka(e.slice(0, f), t);
  }(), i = e[0] === `
` || e[0] === " ", o, s; s = r.exec(e); ) {
    var a = s[1], l = s[2];
    o = l[0] === " ", n += a + (!i && !o && l !== "" ? `
` : "") + Ka(l, t), i = o;
  }
  return n;
}
function Ka(e, t) {
  if (e === "" || e[0] === " ") return e;
  for (var r = / [^ ]/g, n, i = 0, o, s = 0, a = 0, l = ""; n = r.exec(e); )
    a = n.index, a - i > t && (o = s > i ? s : a, l += `
` + e.slice(i, o), i = o + 1), s = a;
  return l += `
`, e.length - i > t && s > i ? l += e.slice(i, s) + `
` + e.slice(s + 1) : l += e.slice(i), l.slice(1);
}
function by(e) {
  for (var t = "", r = 0, n, i = 0; i < e.length; r >= 65536 ? i += 2 : i++)
    r = Pr(e, i), n = be[r], !n && Hr(r) ? (t += e[i], r >= 65536 && (t += e[i + 1])) : t += n || my(r);
  return t;
}
function Ty(e, t, r) {
  var n = "", i = e.tag, o, s, a;
  for (o = 0, s = r.length; o < s; o += 1)
    a = r[o], e.replacer && (a = e.replacer.call(r, String(o), a)), (st(e, t, a, !1, !1) || typeof a > "u" && st(e, t, null, !1, !1)) && (n !== "" && (n += "," + (e.condenseFlow ? "" : " ")), n += e.dump);
  e.tag = i, e.dump = "[" + n + "]";
}
function Qa(e, t, r, n) {
  var i = "", o = e.tag, s, a, l;
  for (s = 0, a = r.length; s < a; s += 1)
    l = r[s], e.replacer && (l = e.replacer.call(r, String(s), l)), (st(e, t + 1, l, !0, !0, !1, !0) || typeof l > "u" && st(e, t + 1, null, !0, !0, !1, !0)) && ((!n || i !== "") && (i += Zo(e, t)), e.dump && jr === e.dump.charCodeAt(0) ? i += "-" : i += "- ", i += e.dump);
  e.tag = o, e.dump = i || "[]";
}
function Cy(e, t, r) {
  var n = "", i = e.tag, o = Object.keys(r), s, a, l, f, c;
  for (s = 0, a = o.length; s < a; s += 1)
    c = "", n !== "" && (c += ", "), e.condenseFlow && (c += '"'), l = o[s], f = r[l], e.replacer && (f = e.replacer.call(r, l, f)), st(e, t, l, !1, !1) && (e.dump.length > 1024 && (c += "? "), c += e.dump + (e.condenseFlow ? '"' : "") + ":" + (e.condenseFlow ? "" : " "), st(e, t, f, !1, !1) && (c += e.dump, n += c));
  e.tag = i, e.dump = "{" + n + "}";
}
function Oy(e, t, r, n) {
  var i = "", o = e.tag, s = Object.keys(r), a, l, f, c, u, h;
  if (e.sortKeys === !0)
    s.sort();
  else if (typeof e.sortKeys == "function")
    s.sort(e.sortKeys);
  else if (e.sortKeys)
    throw new on("sortKeys must be a boolean or a function");
  for (a = 0, l = s.length; a < l; a += 1)
    h = "", (!n || i !== "") && (h += Zo(e, t)), f = s[a], c = r[f], e.replacer && (c = e.replacer.call(r, f, c)), st(e, t + 1, f, !0, !0, !0) && (u = e.tag !== null && e.tag !== "?" || e.dump && e.dump.length > 1024, u && (e.dump && jr === e.dump.charCodeAt(0) ? h += "?" : h += "? "), h += e.dump, u && (h += Zo(e, t)), st(e, t + 1, c, !0, u) && (e.dump && jr === e.dump.charCodeAt(0) ? h += ":" : h += ": ", h += e.dump, i += h));
  e.tag = o, e.dump = i || "{}";
}
function Za(e, t, r) {
  var n, i, o, s, a, l;
  for (i = r ? e.explicitTypes : e.implicitTypes, o = 0, s = i.length; o < s; o += 1)
    if (a = i[o], (a.instanceOf || a.predicate) && (!a.instanceOf || typeof t == "object" && t instanceof a.instanceOf) && (!a.predicate || a.predicate(t))) {
      if (r ? a.multi && a.representName ? e.tag = a.representName(t) : e.tag = a.tag : e.tag = "?", a.represent) {
        if (l = e.styleMap[a.tag] || a.defaultStyle, hf.call(a.represent) === "[object Function]")
          n = a.represent(t, l);
        else if (pf.call(a.represent, l))
          n = a.represent[l](t, l);
        else
          throw new on("!<" + a.tag + '> tag resolver accepts not "' + l + '" style');
        e.dump = n;
      }
      return !0;
    }
  return !1;
}
function st(e, t, r, n, i, o, s) {
  e.tag = null, e.dump = r, Za(e, r, !1) || Za(e, r, !0);
  var a = hf.call(e.dump), l = n, f;
  n && (n = e.flowLevel < 0 || e.flowLevel > t);
  var c = a === "[object Object]" || a === "[object Array]", u, h;
  if (c && (u = e.duplicates.indexOf(r), h = u !== -1), (e.tag !== null && e.tag !== "?" || h || e.indent !== 2 && t > 0) && (i = !1), h && e.usedDuplicates[u])
    e.dump = "*ref_" + u;
  else {
    if (c && h && !e.usedDuplicates[u] && (e.usedDuplicates[u] = !0), a === "[object Object]")
      n && Object.keys(e.dump).length !== 0 ? (Oy(e, t, e.dump, i), h && (e.dump = "&ref_" + u + e.dump)) : (Cy(e, t, e.dump), h && (e.dump = "&ref_" + u + " " + e.dump));
    else if (a === "[object Array]")
      n && e.dump.length !== 0 ? (e.noArrayIndent && !s && t > 0 ? Qa(e, t - 1, e.dump, i) : Qa(e, t, e.dump, i), h && (e.dump = "&ref_" + u + e.dump)) : (Ty(e, t, e.dump), h && (e.dump = "&ref_" + u + " " + e.dump));
    else if (a === "[object String]")
      e.tag !== "?" && Sy(e, e.dump, t, o, l);
    else {
      if (a === "[object Undefined]")
        return !1;
      if (e.skipInvalid) return !1;
      throw new on("unacceptable kind of an object to dump " + a);
    }
    e.tag !== null && e.tag !== "?" && (f = encodeURI(
      e.tag[0] === "!" ? e.tag.slice(1) : e.tag
    ).replace(/!/g, "%21"), e.tag[0] === "!" ? f = "!" + f : f.slice(0, 18) === "tag:yaml.org,2002:" ? f = "!!" + f.slice(18) : f = "!<" + f + ">", e.dump = f + " " + e.dump);
  }
  return !0;
}
function $y(e, t) {
  var r = [], n = [], i, o;
  for (ts(e, r, n), i = 0, o = n.length; i < o; i += 1)
    t.duplicates.push(r[n[i]]);
  t.usedDuplicates = new Array(o);
}
function ts(e, t, r) {
  var n, i, o;
  if (e !== null && typeof e == "object")
    if (i = t.indexOf(e), i !== -1)
      r.indexOf(i) === -1 && r.push(i);
    else if (t.push(e), Array.isArray(e))
      for (i = 0, o = e.length; i < o; i += 1)
        ts(e[i], t, r);
    else
      for (n = Object.keys(e), i = 0, o = n.length; i < o; i += 1)
        ts(e[n[i]], t, r);
}
function Ry(e, t) {
  t = t || {};
  var r = new yy(t);
  r.noRefs || $y(e, r);
  var n = e;
  return r.replacer && (n = r.replacer.call({ "": n }, "", n)), st(r, 0, n, !0, !0) ? r.dump + `
` : "";
}
df.dump = Ry;
var bf = _s, Py = df;
function Os(e, t) {
  return function() {
    throw new Error("Function yaml." + e + " is removed in js-yaml 4. Use yaml." + t + " instead, which is now safe by default.");
  };
}
Ee.Type = De;
Ee.Schema = xu;
Ee.FAILSAFE_SCHEMA = Mu;
Ee.JSON_SCHEMA = Wu;
Ee.CORE_SCHEMA = Vu;
Ee.DEFAULT_SCHEMA = As;
Ee.load = bf.load;
Ee.loadAll = bf.loadAll;
Ee.dump = Py.dump;
Ee.YAMLException = nn;
Ee.types = {
  binary: Ku,
  float: Gu,
  map: ku,
  null: Bu,
  pairs: Zu,
  set: ef,
  timestamp: Xu,
  bool: ju,
  int: qu,
  merge: Ju,
  omap: Qu,
  seq: Uu,
  str: Lu
};
Ee.safeLoad = Os("safeLoad", "load");
Ee.safeLoadAll = Os("safeLoadAll", "loadAll");
Ee.safeDump = Os("safeDump", "dump");
var ui = {};
Object.defineProperty(ui, "__esModule", { value: !0 });
ui.Lazy = void 0;
class Iy {
  constructor(t) {
    this._value = null, this.creator = t;
  }
  get hasValue() {
    return this.creator == null;
  }
  get value() {
    if (this.creator == null)
      return this._value;
    const t = this.creator();
    return this.value = t, t;
  }
  set value(t) {
    this._value = t, this.creator = null;
  }
}
ui.Lazy = Iy;
var rs = { exports: {} };
const Dy = "2.0.0", Tf = 256, Ny = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, Fy = 16, xy = Tf - 6, Ly = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var fi = {
  MAX_LENGTH: Tf,
  MAX_SAFE_COMPONENT_LENGTH: Fy,
  MAX_SAFE_BUILD_LENGTH: xy,
  MAX_SAFE_INTEGER: Ny,
  RELEASE_TYPES: Ly,
  SEMVER_SPEC_VERSION: Dy,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const Uy = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
};
var di = Uy;
(function(e, t) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: r,
    MAX_SAFE_BUILD_LENGTH: n,
    MAX_LENGTH: i
  } = fi, o = di;
  t = e.exports = {};
  const s = t.re = [], a = t.safeRe = [], l = t.src = [], f = t.safeSrc = [], c = t.t = {};
  let u = 0;
  const h = "[a-zA-Z0-9-]", m = [
    ["\\s", 1],
    ["\\d", i],
    [h, n]
  ], E = (S) => {
    for (const [A, T] of m)
      S = S.split(`${A}*`).join(`${A}{0,${T}}`).split(`${A}+`).join(`${A}{1,${T}}`);
    return S;
  }, y = (S, A, T) => {
    const D = E(A), B = u++;
    o(S, B, A), c[S] = B, l[B] = A, f[B] = D, s[B] = new RegExp(A, T ? "g" : void 0), a[B] = new RegExp(D, T ? "g" : void 0);
  };
  y("NUMERICIDENTIFIER", "0|[1-9]\\d*"), y("NUMERICIDENTIFIERLOOSE", "\\d+"), y("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${h}*`), y("MAINVERSION", `(${l[c.NUMERICIDENTIFIER]})\\.(${l[c.NUMERICIDENTIFIER]})\\.(${l[c.NUMERICIDENTIFIER]})`), y("MAINVERSIONLOOSE", `(${l[c.NUMERICIDENTIFIERLOOSE]})\\.(${l[c.NUMERICIDENTIFIERLOOSE]})\\.(${l[c.NUMERICIDENTIFIERLOOSE]})`), y("PRERELEASEIDENTIFIER", `(?:${l[c.NONNUMERICIDENTIFIER]}|${l[c.NUMERICIDENTIFIER]})`), y("PRERELEASEIDENTIFIERLOOSE", `(?:${l[c.NONNUMERICIDENTIFIER]}|${l[c.NUMERICIDENTIFIERLOOSE]})`), y("PRERELEASE", `(?:-(${l[c.PRERELEASEIDENTIFIER]}(?:\\.${l[c.PRERELEASEIDENTIFIER]})*))`), y("PRERELEASELOOSE", `(?:-?(${l[c.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${l[c.PRERELEASEIDENTIFIERLOOSE]})*))`), y("BUILDIDENTIFIER", `${h}+`), y("BUILD", `(?:\\+(${l[c.BUILDIDENTIFIER]}(?:\\.${l[c.BUILDIDENTIFIER]})*))`), y("FULLPLAIN", `v?${l[c.MAINVERSION]}${l[c.PRERELEASE]}?${l[c.BUILD]}?`), y("FULL", `^${l[c.FULLPLAIN]}$`), y("LOOSEPLAIN", `[v=\\s]*${l[c.MAINVERSIONLOOSE]}${l[c.PRERELEASELOOSE]}?${l[c.BUILD]}?`), y("LOOSE", `^${l[c.LOOSEPLAIN]}$`), y("GTLT", "((?:<|>)?=?)"), y("XRANGEIDENTIFIERLOOSE", `${l[c.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), y("XRANGEIDENTIFIER", `${l[c.NUMERICIDENTIFIER]}|x|X|\\*`), y("XRANGEPLAIN", `[v=\\s]*(${l[c.XRANGEIDENTIFIER]})(?:\\.(${l[c.XRANGEIDENTIFIER]})(?:\\.(${l[c.XRANGEIDENTIFIER]})(?:${l[c.PRERELEASE]})?${l[c.BUILD]}?)?)?`), y("XRANGEPLAINLOOSE", `[v=\\s]*(${l[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[c.XRANGEIDENTIFIERLOOSE]})(?:${l[c.PRERELEASELOOSE]})?${l[c.BUILD]}?)?)?`), y("XRANGE", `^${l[c.GTLT]}\\s*${l[c.XRANGEPLAIN]}$`), y("XRANGELOOSE", `^${l[c.GTLT]}\\s*${l[c.XRANGEPLAINLOOSE]}$`), y("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), y("COERCE", `${l[c.COERCEPLAIN]}(?:$|[^\\d])`), y("COERCEFULL", l[c.COERCEPLAIN] + `(?:${l[c.PRERELEASE]})?(?:${l[c.BUILD]})?(?:$|[^\\d])`), y("COERCERTL", l[c.COERCE], !0), y("COERCERTLFULL", l[c.COERCEFULL], !0), y("LONETILDE", "(?:~>?)"), y("TILDETRIM", `(\\s*)${l[c.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", y("TILDE", `^${l[c.LONETILDE]}${l[c.XRANGEPLAIN]}$`), y("TILDELOOSE", `^${l[c.LONETILDE]}${l[c.XRANGEPLAINLOOSE]}$`), y("LONECARET", "(?:\\^)"), y("CARETTRIM", `(\\s*)${l[c.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", y("CARET", `^${l[c.LONECARET]}${l[c.XRANGEPLAIN]}$`), y("CARETLOOSE", `^${l[c.LONECARET]}${l[c.XRANGEPLAINLOOSE]}$`), y("COMPARATORLOOSE", `^${l[c.GTLT]}\\s*(${l[c.LOOSEPLAIN]})$|^$`), y("COMPARATOR", `^${l[c.GTLT]}\\s*(${l[c.FULLPLAIN]})$|^$`), y("COMPARATORTRIM", `(\\s*)${l[c.GTLT]}\\s*(${l[c.LOOSEPLAIN]}|${l[c.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", y("HYPHENRANGE", `^\\s*(${l[c.XRANGEPLAIN]})\\s+-\\s+(${l[c.XRANGEPLAIN]})\\s*$`), y("HYPHENRANGELOOSE", `^\\s*(${l[c.XRANGEPLAINLOOSE]})\\s+-\\s+(${l[c.XRANGEPLAINLOOSE]})\\s*$`), y("STAR", "(<|>)?=?\\s*\\*"), y("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), y("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(rs, rs.exports);
var sn = rs.exports;
const ky = Object.freeze({ loose: !0 }), My = Object.freeze({}), By = (e) => e ? typeof e != "object" ? ky : e : My;
var $s = By;
const el = /^[0-9]+$/, Cf = (e, t) => {
  if (typeof e == "number" && typeof t == "number")
    return e === t ? 0 : e < t ? -1 : 1;
  const r = el.test(e), n = el.test(t);
  return r && n && (e = +e, t = +t), e === t ? 0 : r && !n ? -1 : n && !r ? 1 : e < t ? -1 : 1;
}, jy = (e, t) => Cf(t, e);
var Of = {
  compareIdentifiers: Cf,
  rcompareIdentifiers: jy
};
const Cn = di, { MAX_LENGTH: tl, MAX_SAFE_INTEGER: On } = fi, { safeRe: $n, t: Rn } = sn, qy = $s, { compareIdentifiers: Vi } = Of;
let Hy = class Qe {
  constructor(t, r) {
    if (r = qy(r), t instanceof Qe) {
      if (t.loose === !!r.loose && t.includePrerelease === !!r.includePrerelease)
        return t;
      t = t.version;
    } else if (typeof t != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof t}".`);
    if (t.length > tl)
      throw new TypeError(
        `version is longer than ${tl} characters`
      );
    Cn("SemVer", t, r), this.options = r, this.loose = !!r.loose, this.includePrerelease = !!r.includePrerelease;
    const n = t.trim().match(r.loose ? $n[Rn.LOOSE] : $n[Rn.FULL]);
    if (!n)
      throw new TypeError(`Invalid Version: ${t}`);
    if (this.raw = t, this.major = +n[1], this.minor = +n[2], this.patch = +n[3], this.major > On || this.major < 0)
      throw new TypeError("Invalid major version");
    if (this.minor > On || this.minor < 0)
      throw new TypeError("Invalid minor version");
    if (this.patch > On || this.patch < 0)
      throw new TypeError("Invalid patch version");
    n[4] ? this.prerelease = n[4].split(".").map((i) => {
      if (/^[0-9]+$/.test(i)) {
        const o = +i;
        if (o >= 0 && o < On)
          return o;
      }
      return i;
    }) : this.prerelease = [], this.build = n[5] ? n[5].split(".") : [], this.format();
  }
  format() {
    return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
  }
  toString() {
    return this.version;
  }
  compare(t) {
    if (Cn("SemVer.compare", this.version, this.options, t), !(t instanceof Qe)) {
      if (typeof t == "string" && t === this.version)
        return 0;
      t = new Qe(t, this.options);
    }
    return t.version === this.version ? 0 : this.compareMain(t) || this.comparePre(t);
  }
  compareMain(t) {
    return t instanceof Qe || (t = new Qe(t, this.options)), this.major < t.major ? -1 : this.major > t.major ? 1 : this.minor < t.minor ? -1 : this.minor > t.minor ? 1 : this.patch < t.patch ? -1 : this.patch > t.patch ? 1 : 0;
  }
  comparePre(t) {
    if (t instanceof Qe || (t = new Qe(t, this.options)), this.prerelease.length && !t.prerelease.length)
      return -1;
    if (!this.prerelease.length && t.prerelease.length)
      return 1;
    if (!this.prerelease.length && !t.prerelease.length)
      return 0;
    let r = 0;
    do {
      const n = this.prerelease[r], i = t.prerelease[r];
      if (Cn("prerelease compare", r, n, i), n === void 0 && i === void 0)
        return 0;
      if (i === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === i)
        continue;
      return Vi(n, i);
    } while (++r);
  }
  compareBuild(t) {
    t instanceof Qe || (t = new Qe(t, this.options));
    let r = 0;
    do {
      const n = this.build[r], i = t.build[r];
      if (Cn("build compare", r, n, i), n === void 0 && i === void 0)
        return 0;
      if (i === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === i)
        continue;
      return Vi(n, i);
    } while (++r);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(t, r, n) {
    if (t.startsWith("pre")) {
      if (!r && n === !1)
        throw new Error("invalid increment argument: identifier is empty");
      if (r) {
        const i = `-${r}`.match(this.options.loose ? $n[Rn.PRERELEASELOOSE] : $n[Rn.PRERELEASE]);
        if (!i || i[1] !== r)
          throw new Error(`invalid identifier: ${r}`);
      }
    }
    switch (t) {
      case "premajor":
        this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", r, n);
        break;
      case "preminor":
        this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", r, n);
        break;
      case "prepatch":
        this.prerelease.length = 0, this.inc("patch", r, n), this.inc("pre", r, n);
        break;
      case "prerelease":
        this.prerelease.length === 0 && this.inc("patch", r, n), this.inc("pre", r, n);
        break;
      case "release":
        if (this.prerelease.length === 0)
          throw new Error(`version ${this.raw} is not a prerelease`);
        this.prerelease.length = 0;
        break;
      case "major":
        (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
        break;
      case "minor":
        (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
        break;
      case "patch":
        this.prerelease.length === 0 && this.patch++, this.prerelease = [];
        break;
      case "pre": {
        const i = Number(n) ? 1 : 0;
        if (this.prerelease.length === 0)
          this.prerelease = [i];
        else {
          let o = this.prerelease.length;
          for (; --o >= 0; )
            typeof this.prerelease[o] == "number" && (this.prerelease[o]++, o = -2);
          if (o === -1) {
            if (r === this.prerelease.join(".") && n === !1)
              throw new Error("invalid increment argument: identifier already exists");
            this.prerelease.push(i);
          }
        }
        if (r) {
          let o = [r, i];
          n === !1 && (o = [r]), Vi(this.prerelease[0], r) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = o) : this.prerelease = o;
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${t}`);
    }
    return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
  }
};
var Ne = Hy;
const rl = Ne, Gy = (e, t, r = !1) => {
  if (e instanceof rl)
    return e;
  try {
    return new rl(e, t);
  } catch (n) {
    if (!r)
      return null;
    throw n;
  }
};
var mr = Gy;
const Wy = mr, Vy = (e, t) => {
  const r = Wy(e, t);
  return r ? r.version : null;
};
var zy = Vy;
const Yy = mr, Xy = (e, t) => {
  const r = Yy(e.trim().replace(/^[=v]+/, ""), t);
  return r ? r.version : null;
};
var Jy = Xy;
const nl = Ne, Ky = (e, t, r, n, i) => {
  typeof r == "string" && (i = n, n = r, r = void 0);
  try {
    return new nl(
      e instanceof nl ? e.version : e,
      r
    ).inc(t, n, i).version;
  } catch {
    return null;
  }
};
var Qy = Ky;
const il = mr, Zy = (e, t) => {
  const r = il(e, null, !0), n = il(t, null, !0), i = r.compare(n);
  if (i === 0)
    return null;
  const o = i > 0, s = o ? r : n, a = o ? n : r, l = !!s.prerelease.length;
  if (!!a.prerelease.length && !l) {
    if (!a.patch && !a.minor)
      return "major";
    if (a.compareMain(s) === 0)
      return a.minor && !a.patch ? "minor" : "patch";
  }
  const c = l ? "pre" : "";
  return r.major !== n.major ? c + "major" : r.minor !== n.minor ? c + "minor" : r.patch !== n.patch ? c + "patch" : "prerelease";
};
var eE = Zy;
const tE = Ne, rE = (e, t) => new tE(e, t).major;
var nE = rE;
const iE = Ne, oE = (e, t) => new iE(e, t).minor;
var sE = oE;
const aE = Ne, lE = (e, t) => new aE(e, t).patch;
var cE = lE;
const uE = mr, fE = (e, t) => {
  const r = uE(e, t);
  return r && r.prerelease.length ? r.prerelease : null;
};
var dE = fE;
const ol = Ne, hE = (e, t, r) => new ol(e, r).compare(new ol(t, r));
var Ye = hE;
const pE = Ye, mE = (e, t, r) => pE(t, e, r);
var gE = mE;
const yE = Ye, EE = (e, t) => yE(e, t, !0);
var vE = EE;
const sl = Ne, wE = (e, t, r) => {
  const n = new sl(e, r), i = new sl(t, r);
  return n.compare(i) || n.compareBuild(i);
};
var Rs = wE;
const _E = Rs, SE = (e, t) => e.sort((r, n) => _E(r, n, t));
var AE = SE;
const bE = Rs, TE = (e, t) => e.sort((r, n) => bE(n, r, t));
var CE = TE;
const OE = Ye, $E = (e, t, r) => OE(e, t, r) > 0;
var hi = $E;
const RE = Ye, PE = (e, t, r) => RE(e, t, r) < 0;
var Ps = PE;
const IE = Ye, DE = (e, t, r) => IE(e, t, r) === 0;
var $f = DE;
const NE = Ye, FE = (e, t, r) => NE(e, t, r) !== 0;
var Rf = FE;
const xE = Ye, LE = (e, t, r) => xE(e, t, r) >= 0;
var Is = LE;
const UE = Ye, kE = (e, t, r) => UE(e, t, r) <= 0;
var Ds = kE;
const ME = $f, BE = Rf, jE = hi, qE = Is, HE = Ps, GE = Ds, WE = (e, t, r, n) => {
  switch (t) {
    case "===":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e === r;
    case "!==":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e !== r;
    case "":
    case "=":
    case "==":
      return ME(e, r, n);
    case "!=":
      return BE(e, r, n);
    case ">":
      return jE(e, r, n);
    case ">=":
      return qE(e, r, n);
    case "<":
      return HE(e, r, n);
    case "<=":
      return GE(e, r, n);
    default:
      throw new TypeError(`Invalid operator: ${t}`);
  }
};
var Pf = WE;
const VE = Ne, zE = mr, { safeRe: Pn, t: In } = sn, YE = (e, t) => {
  if (e instanceof VE)
    return e;
  if (typeof e == "number" && (e = String(e)), typeof e != "string")
    return null;
  t = t || {};
  let r = null;
  if (!t.rtl)
    r = e.match(t.includePrerelease ? Pn[In.COERCEFULL] : Pn[In.COERCE]);
  else {
    const l = t.includePrerelease ? Pn[In.COERCERTLFULL] : Pn[In.COERCERTL];
    let f;
    for (; (f = l.exec(e)) && (!r || r.index + r[0].length !== e.length); )
      (!r || f.index + f[0].length !== r.index + r[0].length) && (r = f), l.lastIndex = f.index + f[1].length + f[2].length;
    l.lastIndex = -1;
  }
  if (r === null)
    return null;
  const n = r[2], i = r[3] || "0", o = r[4] || "0", s = t.includePrerelease && r[5] ? `-${r[5]}` : "", a = t.includePrerelease && r[6] ? `+${r[6]}` : "";
  return zE(`${n}.${i}.${o}${s}${a}`, t);
};
var XE = YE;
class JE {
  constructor() {
    this.max = 1e3, this.map = /* @__PURE__ */ new Map();
  }
  get(t) {
    const r = this.map.get(t);
    if (r !== void 0)
      return this.map.delete(t), this.map.set(t, r), r;
  }
  delete(t) {
    return this.map.delete(t);
  }
  set(t, r) {
    if (!this.delete(t) && r !== void 0) {
      if (this.map.size >= this.max) {
        const i = this.map.keys().next().value;
        this.delete(i);
      }
      this.map.set(t, r);
    }
    return this;
  }
}
var KE = JE, zi, al;
function Xe() {
  if (al) return zi;
  al = 1;
  const e = /\s+/g;
  class t {
    constructor($, I) {
      if (I = i(I), $ instanceof t)
        return $.loose === !!I.loose && $.includePrerelease === !!I.includePrerelease ? $ : new t($.raw, I);
      if ($ instanceof o)
        return this.raw = $.value, this.set = [[$]], this.formatted = void 0, this;
      if (this.options = I, this.loose = !!I.loose, this.includePrerelease = !!I.includePrerelease, this.raw = $.trim().replace(e, " "), this.set = this.raw.split("||").map((O) => this.parseRange(O.trim())).filter((O) => O.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const O = this.set[0];
        if (this.set = this.set.filter((N) => !y(N[0])), this.set.length === 0)
          this.set = [O];
        else if (this.set.length > 1) {
          for (const N of this.set)
            if (N.length === 1 && S(N[0])) {
              this.set = [N];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let $ = 0; $ < this.set.length; $++) {
          $ > 0 && (this.formatted += "||");
          const I = this.set[$];
          for (let O = 0; O < I.length; O++)
            O > 0 && (this.formatted += " "), this.formatted += I[O].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange($) {
      const O = ((this.options.includePrerelease && m) | (this.options.loose && E)) + ":" + $, N = n.get(O);
      if (N)
        return N;
      const P = this.options.loose, M = P ? l[f.HYPHENRANGELOOSE] : l[f.HYPHENRANGE];
      $ = $.replace(M, K(this.options.includePrerelease)), s("hyphen replace", $), $ = $.replace(l[f.COMPARATORTRIM], c), s("comparator trim", $), $ = $.replace(l[f.TILDETRIM], u), s("tilde trim", $), $ = $.replace(l[f.CARETTRIM], h), s("caret trim", $);
      let Y = $.split(" ").map((j) => T(j, this.options)).join(" ").split(/\s+/).map((j) => W(j, this.options));
      P && (Y = Y.filter((j) => (s("loose invalid filter", j, this.options), !!j.match(l[f.COMPARATORLOOSE])))), s("range list", Y);
      const F = /* @__PURE__ */ new Map(), ee = Y.map((j) => new o(j, this.options));
      for (const j of ee) {
        if (y(j))
          return [j];
        F.set(j.value, j);
      }
      F.size > 1 && F.has("") && F.delete("");
      const fe = [...F.values()];
      return n.set(O, fe), fe;
    }
    intersects($, I) {
      if (!($ instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((O) => A(O, I) && $.set.some((N) => A(N, I) && O.every((P) => N.every((M) => P.intersects(M, I)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test($) {
      if (!$)
        return !1;
      if (typeof $ == "string")
        try {
          $ = new a($, this.options);
        } catch {
          return !1;
        }
      for (let I = 0; I < this.set.length; I++)
        if (ne(this.set[I], $, this.options))
          return !0;
      return !1;
    }
  }
  zi = t;
  const r = KE, n = new r(), i = $s, o = pi(), s = di, a = Ne, {
    safeRe: l,
    t: f,
    comparatorTrimReplace: c,
    tildeTrimReplace: u,
    caretTrimReplace: h
  } = sn, { FLAG_INCLUDE_PRERELEASE: m, FLAG_LOOSE: E } = fi, y = (R) => R.value === "<0.0.0-0", S = (R) => R.value === "", A = (R, $) => {
    let I = !0;
    const O = R.slice();
    let N = O.pop();
    for (; I && O.length; )
      I = O.every((P) => N.intersects(P, $)), N = O.pop();
    return I;
  }, T = (R, $) => (R = R.replace(l[f.BUILD], ""), s("comp", R, $), R = q(R, $), s("caret", R), R = B(R, $), s("tildes", R), R = Z(R, $), s("xrange", R), R = v(R, $), s("stars", R), R), D = (R) => !R || R.toLowerCase() === "x" || R === "*", B = (R, $) => R.trim().split(/\s+/).map((I) => k(I, $)).join(" "), k = (R, $) => {
    const I = $.loose ? l[f.TILDELOOSE] : l[f.TILDE];
    return R.replace(I, (O, N, P, M, Y) => {
      s("tilde", R, O, N, P, M, Y);
      let F;
      return D(N) ? F = "" : D(P) ? F = `>=${N}.0.0 <${+N + 1}.0.0-0` : D(M) ? F = `>=${N}.${P}.0 <${N}.${+P + 1}.0-0` : Y ? (s("replaceTilde pr", Y), F = `>=${N}.${P}.${M}-${Y} <${N}.${+P + 1}.0-0`) : F = `>=${N}.${P}.${M} <${N}.${+P + 1}.0-0`, s("tilde return", F), F;
    });
  }, q = (R, $) => R.trim().split(/\s+/).map((I) => V(I, $)).join(" "), V = (R, $) => {
    s("caret", R, $);
    const I = $.loose ? l[f.CARETLOOSE] : l[f.CARET], O = $.includePrerelease ? "-0" : "";
    return R.replace(I, (N, P, M, Y, F) => {
      s("caret", R, N, P, M, Y, F);
      let ee;
      return D(P) ? ee = "" : D(M) ? ee = `>=${P}.0.0${O} <${+P + 1}.0.0-0` : D(Y) ? P === "0" ? ee = `>=${P}.${M}.0${O} <${P}.${+M + 1}.0-0` : ee = `>=${P}.${M}.0${O} <${+P + 1}.0.0-0` : F ? (s("replaceCaret pr", F), P === "0" ? M === "0" ? ee = `>=${P}.${M}.${Y}-${F} <${P}.${M}.${+Y + 1}-0` : ee = `>=${P}.${M}.${Y}-${F} <${P}.${+M + 1}.0-0` : ee = `>=${P}.${M}.${Y}-${F} <${+P + 1}.0.0-0`) : (s("no pr"), P === "0" ? M === "0" ? ee = `>=${P}.${M}.${Y}${O} <${P}.${M}.${+Y + 1}-0` : ee = `>=${P}.${M}.${Y}${O} <${P}.${+M + 1}.0-0` : ee = `>=${P}.${M}.${Y} <${+P + 1}.0.0-0`), s("caret return", ee), ee;
    });
  }, Z = (R, $) => (s("replaceXRanges", R, $), R.split(/\s+/).map((I) => L(I, $)).join(" ")), L = (R, $) => {
    R = R.trim();
    const I = $.loose ? l[f.XRANGELOOSE] : l[f.XRANGE];
    return R.replace(I, (O, N, P, M, Y, F) => {
      s("xRange", R, O, N, P, M, Y, F);
      const ee = D(P), fe = ee || D(M), j = fe || D(Y), ve = j;
      return N === "=" && ve && (N = ""), F = $.includePrerelease ? "-0" : "", ee ? N === ">" || N === "<" ? O = "<0.0.0-0" : O = "*" : N && ve ? (fe && (M = 0), Y = 0, N === ">" ? (N = ">=", fe ? (P = +P + 1, M = 0, Y = 0) : (M = +M + 1, Y = 0)) : N === "<=" && (N = "<", fe ? P = +P + 1 : M = +M + 1), N === "<" && (F = "-0"), O = `${N + P}.${M}.${Y}${F}`) : fe ? O = `>=${P}.0.0${F} <${+P + 1}.0.0-0` : j && (O = `>=${P}.${M}.0${F} <${P}.${+M + 1}.0-0`), s("xRange return", O), O;
    });
  }, v = (R, $) => (s("replaceStars", R, $), R.trim().replace(l[f.STAR], "")), W = (R, $) => (s("replaceGTE0", R, $), R.trim().replace(l[$.includePrerelease ? f.GTE0PRE : f.GTE0], "")), K = (R) => ($, I, O, N, P, M, Y, F, ee, fe, j, ve) => (D(O) ? I = "" : D(N) ? I = `>=${O}.0.0${R ? "-0" : ""}` : D(P) ? I = `>=${O}.${N}.0${R ? "-0" : ""}` : M ? I = `>=${I}` : I = `>=${I}${R ? "-0" : ""}`, D(ee) ? F = "" : D(fe) ? F = `<${+ee + 1}.0.0-0` : D(j) ? F = `<${ee}.${+fe + 1}.0-0` : ve ? F = `<=${ee}.${fe}.${j}-${ve}` : R ? F = `<${ee}.${fe}.${+j + 1}-0` : F = `<=${F}`, `${I} ${F}`.trim()), ne = (R, $, I) => {
    for (let O = 0; O < R.length; O++)
      if (!R[O].test($))
        return !1;
    if ($.prerelease.length && !I.includePrerelease) {
      for (let O = 0; O < R.length; O++)
        if (s(R[O].semver), R[O].semver !== o.ANY && R[O].semver.prerelease.length > 0) {
          const N = R[O].semver;
          if (N.major === $.major && N.minor === $.minor && N.patch === $.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return zi;
}
var Yi, ll;
function pi() {
  if (ll) return Yi;
  ll = 1;
  const e = Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(c, u) {
      if (u = r(u), c instanceof t) {
        if (c.loose === !!u.loose)
          return c;
        c = c.value;
      }
      c = c.trim().split(/\s+/).join(" "), s("comparator", c, u), this.options = u, this.loose = !!u.loose, this.parse(c), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, s("comp", this);
    }
    parse(c) {
      const u = this.options.loose ? n[i.COMPARATORLOOSE] : n[i.COMPARATOR], h = c.match(u);
      if (!h)
        throw new TypeError(`Invalid comparator: ${c}`);
      this.operator = h[1] !== void 0 ? h[1] : "", this.operator === "=" && (this.operator = ""), h[2] ? this.semver = new a(h[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(c) {
      if (s("Comparator.test", c, this.options.loose), this.semver === e || c === e)
        return !0;
      if (typeof c == "string")
        try {
          c = new a(c, this.options);
        } catch {
          return !1;
        }
      return o(c, this.operator, this.semver, this.options);
    }
    intersects(c, u) {
      if (!(c instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new l(c.value, u).test(this.value) : c.operator === "" ? c.value === "" ? !0 : new l(this.value, u).test(c.semver) : (u = r(u), u.includePrerelease && (this.value === "<0.0.0-0" || c.value === "<0.0.0-0") || !u.includePrerelease && (this.value.startsWith("<0.0.0") || c.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && c.operator.startsWith(">") || this.operator.startsWith("<") && c.operator.startsWith("<") || this.semver.version === c.semver.version && this.operator.includes("=") && c.operator.includes("=") || o(this.semver, "<", c.semver, u) && this.operator.startsWith(">") && c.operator.startsWith("<") || o(this.semver, ">", c.semver, u) && this.operator.startsWith("<") && c.operator.startsWith(">")));
    }
  }
  Yi = t;
  const r = $s, { safeRe: n, t: i } = sn, o = Pf, s = di, a = Ne, l = Xe();
  return Yi;
}
const QE = Xe(), ZE = (e, t, r) => {
  try {
    t = new QE(t, r);
  } catch {
    return !1;
  }
  return t.test(e);
};
var mi = ZE;
const ev = Xe(), tv = (e, t) => new ev(e, t).set.map((r) => r.map((n) => n.value).join(" ").trim().split(" "));
var rv = tv;
const nv = Ne, iv = Xe(), ov = (e, t, r) => {
  let n = null, i = null, o = null;
  try {
    o = new iv(t, r);
  } catch {
    return null;
  }
  return e.forEach((s) => {
    o.test(s) && (!n || i.compare(s) === -1) && (n = s, i = new nv(n, r));
  }), n;
};
var sv = ov;
const av = Ne, lv = Xe(), cv = (e, t, r) => {
  let n = null, i = null, o = null;
  try {
    o = new lv(t, r);
  } catch {
    return null;
  }
  return e.forEach((s) => {
    o.test(s) && (!n || i.compare(s) === 1) && (n = s, i = new av(n, r));
  }), n;
};
var uv = cv;
const Xi = Ne, fv = Xe(), cl = hi, dv = (e, t) => {
  e = new fv(e, t);
  let r = new Xi("0.0.0");
  if (e.test(r) || (r = new Xi("0.0.0-0"), e.test(r)))
    return r;
  r = null;
  for (let n = 0; n < e.set.length; ++n) {
    const i = e.set[n];
    let o = null;
    i.forEach((s) => {
      const a = new Xi(s.semver.version);
      switch (s.operator) {
        case ">":
          a.prerelease.length === 0 ? a.patch++ : a.prerelease.push(0), a.raw = a.format();
        case "":
        case ">=":
          (!o || cl(a, o)) && (o = a);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${s.operator}`);
      }
    }), o && (!r || cl(r, o)) && (r = o);
  }
  return r && e.test(r) ? r : null;
};
var hv = dv;
const pv = Xe(), mv = (e, t) => {
  try {
    return new pv(e, t).range || "*";
  } catch {
    return null;
  }
};
var gv = mv;
const yv = Ne, If = pi(), { ANY: Ev } = If, vv = Xe(), wv = mi, ul = hi, fl = Ps, _v = Ds, Sv = Is, Av = (e, t, r, n) => {
  e = new yv(e, n), t = new vv(t, n);
  let i, o, s, a, l;
  switch (r) {
    case ">":
      i = ul, o = _v, s = fl, a = ">", l = ">=";
      break;
    case "<":
      i = fl, o = Sv, s = ul, a = "<", l = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (wv(e, t, n))
    return !1;
  for (let f = 0; f < t.set.length; ++f) {
    const c = t.set[f];
    let u = null, h = null;
    if (c.forEach((m) => {
      m.semver === Ev && (m = new If(">=0.0.0")), u = u || m, h = h || m, i(m.semver, u.semver, n) ? u = m : s(m.semver, h.semver, n) && (h = m);
    }), u.operator === a || u.operator === l || (!h.operator || h.operator === a) && o(e, h.semver))
      return !1;
    if (h.operator === l && s(e, h.semver))
      return !1;
  }
  return !0;
};
var Ns = Av;
const bv = Ns, Tv = (e, t, r) => bv(e, t, ">", r);
var Cv = Tv;
const Ov = Ns, $v = (e, t, r) => Ov(e, t, "<", r);
var Rv = $v;
const dl = Xe(), Pv = (e, t, r) => (e = new dl(e, r), t = new dl(t, r), e.intersects(t, r));
var Iv = Pv;
const Dv = mi, Nv = Ye;
var Fv = (e, t, r) => {
  const n = [];
  let i = null, o = null;
  const s = e.sort((c, u) => Nv(c, u, r));
  for (const c of s)
    Dv(c, t, r) ? (o = c, i || (i = c)) : (o && n.push([i, o]), o = null, i = null);
  i && n.push([i, null]);
  const a = [];
  for (const [c, u] of n)
    c === u ? a.push(c) : !u && c === s[0] ? a.push("*") : u ? c === s[0] ? a.push(`<=${u}`) : a.push(`${c} - ${u}`) : a.push(`>=${c}`);
  const l = a.join(" || "), f = typeof t.raw == "string" ? t.raw : String(t);
  return l.length < f.length ? l : t;
};
const hl = Xe(), Fs = pi(), { ANY: Ji } = Fs, Cr = mi, xs = Ye, xv = (e, t, r = {}) => {
  if (e === t)
    return !0;
  e = new hl(e, r), t = new hl(t, r);
  let n = !1;
  e: for (const i of e.set) {
    for (const o of t.set) {
      const s = Uv(i, o, r);
      if (n = n || s !== null, s)
        continue e;
    }
    if (n)
      return !1;
  }
  return !0;
}, Lv = [new Fs(">=0.0.0-0")], pl = [new Fs(">=0.0.0")], Uv = (e, t, r) => {
  if (e === t)
    return !0;
  if (e.length === 1 && e[0].semver === Ji) {
    if (t.length === 1 && t[0].semver === Ji)
      return !0;
    r.includePrerelease ? e = Lv : e = pl;
  }
  if (t.length === 1 && t[0].semver === Ji) {
    if (r.includePrerelease)
      return !0;
    t = pl;
  }
  const n = /* @__PURE__ */ new Set();
  let i, o;
  for (const m of e)
    m.operator === ">" || m.operator === ">=" ? i = ml(i, m, r) : m.operator === "<" || m.operator === "<=" ? o = gl(o, m, r) : n.add(m.semver);
  if (n.size > 1)
    return null;
  let s;
  if (i && o) {
    if (s = xs(i.semver, o.semver, r), s > 0)
      return null;
    if (s === 0 && (i.operator !== ">=" || o.operator !== "<="))
      return null;
  }
  for (const m of n) {
    if (i && !Cr(m, String(i), r) || o && !Cr(m, String(o), r))
      return null;
    for (const E of t)
      if (!Cr(m, String(E), r))
        return !1;
    return !0;
  }
  let a, l, f, c, u = o && !r.includePrerelease && o.semver.prerelease.length ? o.semver : !1, h = i && !r.includePrerelease && i.semver.prerelease.length ? i.semver : !1;
  u && u.prerelease.length === 1 && o.operator === "<" && u.prerelease[0] === 0 && (u = !1);
  for (const m of t) {
    if (c = c || m.operator === ">" || m.operator === ">=", f = f || m.operator === "<" || m.operator === "<=", i) {
      if (h && m.semver.prerelease && m.semver.prerelease.length && m.semver.major === h.major && m.semver.minor === h.minor && m.semver.patch === h.patch && (h = !1), m.operator === ">" || m.operator === ">=") {
        if (a = ml(i, m, r), a === m && a !== i)
          return !1;
      } else if (i.operator === ">=" && !Cr(i.semver, String(m), r))
        return !1;
    }
    if (o) {
      if (u && m.semver.prerelease && m.semver.prerelease.length && m.semver.major === u.major && m.semver.minor === u.minor && m.semver.patch === u.patch && (u = !1), m.operator === "<" || m.operator === "<=") {
        if (l = gl(o, m, r), l === m && l !== o)
          return !1;
      } else if (o.operator === "<=" && !Cr(o.semver, String(m), r))
        return !1;
    }
    if (!m.operator && (o || i) && s !== 0)
      return !1;
  }
  return !(i && f && !o && s !== 0 || o && c && !i && s !== 0 || h || u);
}, ml = (e, t, r) => {
  if (!e)
    return t;
  const n = xs(e.semver, t.semver, r);
  return n > 0 ? e : n < 0 || t.operator === ">" && e.operator === ">=" ? t : e;
}, gl = (e, t, r) => {
  if (!e)
    return t;
  const n = xs(e.semver, t.semver, r);
  return n < 0 ? e : n > 0 || t.operator === "<" && e.operator === "<=" ? t : e;
};
var kv = xv;
const Ki = sn, yl = fi, Mv = Ne, El = Of, Bv = mr, jv = zy, qv = Jy, Hv = Qy, Gv = eE, Wv = nE, Vv = sE, zv = cE, Yv = dE, Xv = Ye, Jv = gE, Kv = vE, Qv = Rs, Zv = AE, ew = CE, tw = hi, rw = Ps, nw = $f, iw = Rf, ow = Is, sw = Ds, aw = Pf, lw = XE, cw = pi(), uw = Xe(), fw = mi, dw = rv, hw = sv, pw = uv, mw = hv, gw = gv, yw = Ns, Ew = Cv, vw = Rv, ww = Iv, _w = Fv, Sw = kv;
var Df = {
  parse: Bv,
  valid: jv,
  clean: qv,
  inc: Hv,
  diff: Gv,
  major: Wv,
  minor: Vv,
  patch: zv,
  prerelease: Yv,
  compare: Xv,
  rcompare: Jv,
  compareLoose: Kv,
  compareBuild: Qv,
  sort: Zv,
  rsort: ew,
  gt: tw,
  lt: rw,
  eq: nw,
  neq: iw,
  gte: ow,
  lte: sw,
  cmp: aw,
  coerce: lw,
  Comparator: cw,
  Range: uw,
  satisfies: fw,
  toComparators: dw,
  maxSatisfying: hw,
  minSatisfying: pw,
  minVersion: mw,
  validRange: gw,
  outside: yw,
  gtr: Ew,
  ltr: vw,
  intersects: ww,
  simplifyRange: _w,
  subset: Sw,
  SemVer: Mv,
  re: Ki.re,
  src: Ki.src,
  tokens: Ki.t,
  SEMVER_SPEC_VERSION: yl.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: yl.RELEASE_TYPES,
  compareIdentifiers: El.compareIdentifiers,
  rcompareIdentifiers: El.rcompareIdentifiers
}, an = {}, Zn = { exports: {} };
Zn.exports;
(function(e, t) {
  var r = 200, n = "__lodash_hash_undefined__", i = 1, o = 2, s = 9007199254740991, a = "[object Arguments]", l = "[object Array]", f = "[object AsyncFunction]", c = "[object Boolean]", u = "[object Date]", h = "[object Error]", m = "[object Function]", E = "[object GeneratorFunction]", y = "[object Map]", S = "[object Number]", A = "[object Null]", T = "[object Object]", D = "[object Promise]", B = "[object Proxy]", k = "[object RegExp]", q = "[object Set]", V = "[object String]", Z = "[object Symbol]", L = "[object Undefined]", v = "[object WeakMap]", W = "[object ArrayBuffer]", K = "[object DataView]", ne = "[object Float32Array]", R = "[object Float64Array]", $ = "[object Int8Array]", I = "[object Int16Array]", O = "[object Int32Array]", N = "[object Uint8Array]", P = "[object Uint8ClampedArray]", M = "[object Uint16Array]", Y = "[object Uint32Array]", F = /[\\^$.*+?()[\]{}|]/g, ee = /^\[object .+?Constructor\]$/, fe = /^(?:0|[1-9]\d*)$/, j = {};
  j[ne] = j[R] = j[$] = j[I] = j[O] = j[N] = j[P] = j[M] = j[Y] = !0, j[a] = j[l] = j[W] = j[c] = j[K] = j[u] = j[h] = j[m] = j[y] = j[S] = j[T] = j[k] = j[q] = j[V] = j[v] = !1;
  var ve = typeof Oe == "object" && Oe && Oe.Object === Object && Oe, Er = typeof self == "object" && self && self.Object === Object && self, Be = ve || Er || Function("return this")(), vr = t && !t.nodeType && t, zt = vr && !0 && e && !e.nodeType && e, fn = zt && zt.exports === vr, p = fn && ve.process, d = function() {
    try {
      return p && p.binding && p.binding("util");
    } catch {
    }
  }(), b = d && d.isTypedArray;
  function w(g, _) {
    for (var C = -1, x = g == null ? 0 : g.length, re = 0, H = []; ++C < x; ) {
      var ae = g[C];
      _(ae, C, g) && (H[re++] = ae);
    }
    return H;
  }
  function J(g, _) {
    for (var C = -1, x = _.length, re = g.length; ++C < x; )
      g[re + C] = _[C];
    return g;
  }
  function ie(g, _) {
    for (var C = -1, x = g == null ? 0 : g.length; ++C < x; )
      if (_(g[C], C, g))
        return !0;
    return !1;
  }
  function le(g, _) {
    for (var C = -1, x = Array(g); ++C < g; )
      x[C] = _(C);
    return x;
  }
  function we(g) {
    return function(_) {
      return g(_);
    };
  }
  function _e(g, _) {
    return g.has(_);
  }
  function je(g, _) {
    return g == null ? void 0 : g[_];
  }
  function de(g) {
    var _ = -1, C = Array(g.size);
    return g.forEach(function(x, re) {
      C[++_] = [re, x];
    }), C;
  }
  function qe(g, _) {
    return function(C) {
      return g(_(C));
    };
  }
  function Ci(g) {
    var _ = -1, C = Array(g.size);
    return g.forEach(function(x) {
      C[++_] = x;
    }), C;
  }
  var dn = Array.prototype, wr = Function.prototype, Ct = Object.prototype, Oi = Be["__core-js_shared__"], Hs = wr.toString, Ke = Ct.hasOwnProperty, Gs = function() {
    var g = /[^.]+$/.exec(Oi && Oi.keys && Oi.keys.IE_PROTO || "");
    return g ? "Symbol(src)_1." + g : "";
  }(), Ws = Ct.toString, td = RegExp(
    "^" + Hs.call(Ke).replace(F, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
  ), Vs = fn ? Be.Buffer : void 0, hn = Be.Symbol, zs = Be.Uint8Array, Ys = Ct.propertyIsEnumerable, rd = dn.splice, Ot = hn ? hn.toStringTag : void 0, Xs = Object.getOwnPropertySymbols, nd = Vs ? Vs.isBuffer : void 0, id = qe(Object.keys, Object), $i = Yt(Be, "DataView"), _r = Yt(Be, "Map"), Ri = Yt(Be, "Promise"), Pi = Yt(Be, "Set"), Ii = Yt(Be, "WeakMap"), Sr = Yt(Object, "create"), od = Pt($i), sd = Pt(_r), ad = Pt(Ri), ld = Pt(Pi), cd = Pt(Ii), Js = hn ? hn.prototype : void 0, Di = Js ? Js.valueOf : void 0;
  function $t(g) {
    var _ = -1, C = g == null ? 0 : g.length;
    for (this.clear(); ++_ < C; ) {
      var x = g[_];
      this.set(x[0], x[1]);
    }
  }
  function ud() {
    this.__data__ = Sr ? Sr(null) : {}, this.size = 0;
  }
  function fd(g) {
    var _ = this.has(g) && delete this.__data__[g];
    return this.size -= _ ? 1 : 0, _;
  }
  function dd(g) {
    var _ = this.__data__;
    if (Sr) {
      var C = _[g];
      return C === n ? void 0 : C;
    }
    return Ke.call(_, g) ? _[g] : void 0;
  }
  function hd(g) {
    var _ = this.__data__;
    return Sr ? _[g] !== void 0 : Ke.call(_, g);
  }
  function pd(g, _) {
    var C = this.__data__;
    return this.size += this.has(g) ? 0 : 1, C[g] = Sr && _ === void 0 ? n : _, this;
  }
  $t.prototype.clear = ud, $t.prototype.delete = fd, $t.prototype.get = dd, $t.prototype.has = hd, $t.prototype.set = pd;
  function rt(g) {
    var _ = -1, C = g == null ? 0 : g.length;
    for (this.clear(); ++_ < C; ) {
      var x = g[_];
      this.set(x[0], x[1]);
    }
  }
  function md() {
    this.__data__ = [], this.size = 0;
  }
  function gd(g) {
    var _ = this.__data__, C = mn(_, g);
    if (C < 0)
      return !1;
    var x = _.length - 1;
    return C == x ? _.pop() : rd.call(_, C, 1), --this.size, !0;
  }
  function yd(g) {
    var _ = this.__data__, C = mn(_, g);
    return C < 0 ? void 0 : _[C][1];
  }
  function Ed(g) {
    return mn(this.__data__, g) > -1;
  }
  function vd(g, _) {
    var C = this.__data__, x = mn(C, g);
    return x < 0 ? (++this.size, C.push([g, _])) : C[x][1] = _, this;
  }
  rt.prototype.clear = md, rt.prototype.delete = gd, rt.prototype.get = yd, rt.prototype.has = Ed, rt.prototype.set = vd;
  function Rt(g) {
    var _ = -1, C = g == null ? 0 : g.length;
    for (this.clear(); ++_ < C; ) {
      var x = g[_];
      this.set(x[0], x[1]);
    }
  }
  function wd() {
    this.size = 0, this.__data__ = {
      hash: new $t(),
      map: new (_r || rt)(),
      string: new $t()
    };
  }
  function _d(g) {
    var _ = gn(this, g).delete(g);
    return this.size -= _ ? 1 : 0, _;
  }
  function Sd(g) {
    return gn(this, g).get(g);
  }
  function Ad(g) {
    return gn(this, g).has(g);
  }
  function bd(g, _) {
    var C = gn(this, g), x = C.size;
    return C.set(g, _), this.size += C.size == x ? 0 : 1, this;
  }
  Rt.prototype.clear = wd, Rt.prototype.delete = _d, Rt.prototype.get = Sd, Rt.prototype.has = Ad, Rt.prototype.set = bd;
  function pn(g) {
    var _ = -1, C = g == null ? 0 : g.length;
    for (this.__data__ = new Rt(); ++_ < C; )
      this.add(g[_]);
  }
  function Td(g) {
    return this.__data__.set(g, n), this;
  }
  function Cd(g) {
    return this.__data__.has(g);
  }
  pn.prototype.add = pn.prototype.push = Td, pn.prototype.has = Cd;
  function at(g) {
    var _ = this.__data__ = new rt(g);
    this.size = _.size;
  }
  function Od() {
    this.__data__ = new rt(), this.size = 0;
  }
  function $d(g) {
    var _ = this.__data__, C = _.delete(g);
    return this.size = _.size, C;
  }
  function Rd(g) {
    return this.__data__.get(g);
  }
  function Pd(g) {
    return this.__data__.has(g);
  }
  function Id(g, _) {
    var C = this.__data__;
    if (C instanceof rt) {
      var x = C.__data__;
      if (!_r || x.length < r - 1)
        return x.push([g, _]), this.size = ++C.size, this;
      C = this.__data__ = new Rt(x);
    }
    return C.set(g, _), this.size = C.size, this;
  }
  at.prototype.clear = Od, at.prototype.delete = $d, at.prototype.get = Rd, at.prototype.has = Pd, at.prototype.set = Id;
  function Dd(g, _) {
    var C = yn(g), x = !C && zd(g), re = !C && !x && Ni(g), H = !C && !x && !re && oa(g), ae = C || x || re || H, pe = ae ? le(g.length, String) : [], ge = pe.length;
    for (var oe in g)
      Ke.call(g, oe) && !(ae && // Safari 9 has enumerable `arguments.length` in strict mode.
      (oe == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
      re && (oe == "offset" || oe == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
      H && (oe == "buffer" || oe == "byteLength" || oe == "byteOffset") || // Skip index properties.
      qd(oe, ge))) && pe.push(oe);
    return pe;
  }
  function mn(g, _) {
    for (var C = g.length; C--; )
      if (ta(g[C][0], _))
        return C;
    return -1;
  }
  function Nd(g, _, C) {
    var x = _(g);
    return yn(g) ? x : J(x, C(g));
  }
  function Ar(g) {
    return g == null ? g === void 0 ? L : A : Ot && Ot in Object(g) ? Bd(g) : Vd(g);
  }
  function Ks(g) {
    return br(g) && Ar(g) == a;
  }
  function Qs(g, _, C, x, re) {
    return g === _ ? !0 : g == null || _ == null || !br(g) && !br(_) ? g !== g && _ !== _ : Fd(g, _, C, x, Qs, re);
  }
  function Fd(g, _, C, x, re, H) {
    var ae = yn(g), pe = yn(_), ge = ae ? l : lt(g), oe = pe ? l : lt(_);
    ge = ge == a ? T : ge, oe = oe == a ? T : oe;
    var Le = ge == T, He = oe == T, Se = ge == oe;
    if (Se && Ni(g)) {
      if (!Ni(_))
        return !1;
      ae = !0, Le = !1;
    }
    if (Se && !Le)
      return H || (H = new at()), ae || oa(g) ? Zs(g, _, C, x, re, H) : kd(g, _, ge, C, x, re, H);
    if (!(C & i)) {
      var ke = Le && Ke.call(g, "__wrapped__"), Me = He && Ke.call(_, "__wrapped__");
      if (ke || Me) {
        var ct = ke ? g.value() : g, nt = Me ? _.value() : _;
        return H || (H = new at()), re(ct, nt, C, x, H);
      }
    }
    return Se ? (H || (H = new at()), Md(g, _, C, x, re, H)) : !1;
  }
  function xd(g) {
    if (!ia(g) || Gd(g))
      return !1;
    var _ = ra(g) ? td : ee;
    return _.test(Pt(g));
  }
  function Ld(g) {
    return br(g) && na(g.length) && !!j[Ar(g)];
  }
  function Ud(g) {
    if (!Wd(g))
      return id(g);
    var _ = [];
    for (var C in Object(g))
      Ke.call(g, C) && C != "constructor" && _.push(C);
    return _;
  }
  function Zs(g, _, C, x, re, H) {
    var ae = C & i, pe = g.length, ge = _.length;
    if (pe != ge && !(ae && ge > pe))
      return !1;
    var oe = H.get(g);
    if (oe && H.get(_))
      return oe == _;
    var Le = -1, He = !0, Se = C & o ? new pn() : void 0;
    for (H.set(g, _), H.set(_, g); ++Le < pe; ) {
      var ke = g[Le], Me = _[Le];
      if (x)
        var ct = ae ? x(Me, ke, Le, _, g, H) : x(ke, Me, Le, g, _, H);
      if (ct !== void 0) {
        if (ct)
          continue;
        He = !1;
        break;
      }
      if (Se) {
        if (!ie(_, function(nt, It) {
          if (!_e(Se, It) && (ke === nt || re(ke, nt, C, x, H)))
            return Se.push(It);
        })) {
          He = !1;
          break;
        }
      } else if (!(ke === Me || re(ke, Me, C, x, H))) {
        He = !1;
        break;
      }
    }
    return H.delete(g), H.delete(_), He;
  }
  function kd(g, _, C, x, re, H, ae) {
    switch (C) {
      case K:
        if (g.byteLength != _.byteLength || g.byteOffset != _.byteOffset)
          return !1;
        g = g.buffer, _ = _.buffer;
      case W:
        return !(g.byteLength != _.byteLength || !H(new zs(g), new zs(_)));
      case c:
      case u:
      case S:
        return ta(+g, +_);
      case h:
        return g.name == _.name && g.message == _.message;
      case k:
      case V:
        return g == _ + "";
      case y:
        var pe = de;
      case q:
        var ge = x & i;
        if (pe || (pe = Ci), g.size != _.size && !ge)
          return !1;
        var oe = ae.get(g);
        if (oe)
          return oe == _;
        x |= o, ae.set(g, _);
        var Le = Zs(pe(g), pe(_), x, re, H, ae);
        return ae.delete(g), Le;
      case Z:
        if (Di)
          return Di.call(g) == Di.call(_);
    }
    return !1;
  }
  function Md(g, _, C, x, re, H) {
    var ae = C & i, pe = ea(g), ge = pe.length, oe = ea(_), Le = oe.length;
    if (ge != Le && !ae)
      return !1;
    for (var He = ge; He--; ) {
      var Se = pe[He];
      if (!(ae ? Se in _ : Ke.call(_, Se)))
        return !1;
    }
    var ke = H.get(g);
    if (ke && H.get(_))
      return ke == _;
    var Me = !0;
    H.set(g, _), H.set(_, g);
    for (var ct = ae; ++He < ge; ) {
      Se = pe[He];
      var nt = g[Se], It = _[Se];
      if (x)
        var sa = ae ? x(It, nt, Se, _, g, H) : x(nt, It, Se, g, _, H);
      if (!(sa === void 0 ? nt === It || re(nt, It, C, x, H) : sa)) {
        Me = !1;
        break;
      }
      ct || (ct = Se == "constructor");
    }
    if (Me && !ct) {
      var En = g.constructor, vn = _.constructor;
      En != vn && "constructor" in g && "constructor" in _ && !(typeof En == "function" && En instanceof En && typeof vn == "function" && vn instanceof vn) && (Me = !1);
    }
    return H.delete(g), H.delete(_), Me;
  }
  function ea(g) {
    return Nd(g, Jd, jd);
  }
  function gn(g, _) {
    var C = g.__data__;
    return Hd(_) ? C[typeof _ == "string" ? "string" : "hash"] : C.map;
  }
  function Yt(g, _) {
    var C = je(g, _);
    return xd(C) ? C : void 0;
  }
  function Bd(g) {
    var _ = Ke.call(g, Ot), C = g[Ot];
    try {
      g[Ot] = void 0;
      var x = !0;
    } catch {
    }
    var re = Ws.call(g);
    return x && (_ ? g[Ot] = C : delete g[Ot]), re;
  }
  var jd = Xs ? function(g) {
    return g == null ? [] : (g = Object(g), w(Xs(g), function(_) {
      return Ys.call(g, _);
    }));
  } : Kd, lt = Ar;
  ($i && lt(new $i(new ArrayBuffer(1))) != K || _r && lt(new _r()) != y || Ri && lt(Ri.resolve()) != D || Pi && lt(new Pi()) != q || Ii && lt(new Ii()) != v) && (lt = function(g) {
    var _ = Ar(g), C = _ == T ? g.constructor : void 0, x = C ? Pt(C) : "";
    if (x)
      switch (x) {
        case od:
          return K;
        case sd:
          return y;
        case ad:
          return D;
        case ld:
          return q;
        case cd:
          return v;
      }
    return _;
  });
  function qd(g, _) {
    return _ = _ ?? s, !!_ && (typeof g == "number" || fe.test(g)) && g > -1 && g % 1 == 0 && g < _;
  }
  function Hd(g) {
    var _ = typeof g;
    return _ == "string" || _ == "number" || _ == "symbol" || _ == "boolean" ? g !== "__proto__" : g === null;
  }
  function Gd(g) {
    return !!Gs && Gs in g;
  }
  function Wd(g) {
    var _ = g && g.constructor, C = typeof _ == "function" && _.prototype || Ct;
    return g === C;
  }
  function Vd(g) {
    return Ws.call(g);
  }
  function Pt(g) {
    if (g != null) {
      try {
        return Hs.call(g);
      } catch {
      }
      try {
        return g + "";
      } catch {
      }
    }
    return "";
  }
  function ta(g, _) {
    return g === _ || g !== g && _ !== _;
  }
  var zd = Ks(/* @__PURE__ */ function() {
    return arguments;
  }()) ? Ks : function(g) {
    return br(g) && Ke.call(g, "callee") && !Ys.call(g, "callee");
  }, yn = Array.isArray;
  function Yd(g) {
    return g != null && na(g.length) && !ra(g);
  }
  var Ni = nd || Qd;
  function Xd(g, _) {
    return Qs(g, _);
  }
  function ra(g) {
    if (!ia(g))
      return !1;
    var _ = Ar(g);
    return _ == m || _ == E || _ == f || _ == B;
  }
  function na(g) {
    return typeof g == "number" && g > -1 && g % 1 == 0 && g <= s;
  }
  function ia(g) {
    var _ = typeof g;
    return g != null && (_ == "object" || _ == "function");
  }
  function br(g) {
    return g != null && typeof g == "object";
  }
  var oa = b ? we(b) : Ld;
  function Jd(g) {
    return Yd(g) ? Dd(g) : Ud(g);
  }
  function Kd() {
    return [];
  }
  function Qd() {
    return !1;
  }
  e.exports = Xd;
})(Zn, Zn.exports);
var Aw = Zn.exports;
Object.defineProperty(an, "__esModule", { value: !0 });
an.DownloadedUpdateHelper = void 0;
an.createTempUpdateFile = $w;
const bw = Qr, Tw = Ue, vl = Aw, Nt = bt, Fr = Q;
class Cw {
  constructor(t) {
    this.cacheDir = t, this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, this._downloadedFileInfo = null;
  }
  get downloadedFileInfo() {
    return this._downloadedFileInfo;
  }
  get file() {
    return this._file;
  }
  get packageFile() {
    return this._packageFile;
  }
  get cacheDirForPendingUpdate() {
    return Fr.join(this.cacheDir, "pending");
  }
  async validateDownloadedPath(t, r, n, i) {
    if (this.versionInfo != null && this.file === t && this.fileInfo != null)
      return vl(this.versionInfo, r) && vl(this.fileInfo.info, n.info) && await (0, Nt.pathExists)(t) ? t : null;
    const o = await this.getValidCachedUpdateFile(n, i);
    return o === null ? null : (i.info(`Update has already been downloaded to ${t}).`), this._file = o, o);
  }
  async setDownloadedFile(t, r, n, i, o, s) {
    this._file = t, this._packageFile = r, this.versionInfo = n, this.fileInfo = i, this._downloadedFileInfo = {
      fileName: o,
      sha512: i.info.sha512,
      isAdminRightsRequired: i.info.isAdminRightsRequired === !0
    }, s && await (0, Nt.outputJson)(this.getUpdateInfoFile(), this._downloadedFileInfo);
  }
  async clear() {
    this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, await this.cleanCacheDirForPendingUpdate();
  }
  async cleanCacheDirForPendingUpdate() {
    try {
      await (0, Nt.emptyDir)(this.cacheDirForPendingUpdate);
    } catch {
    }
  }
  /**
   * Returns "update-info.json" which is created in the update cache directory's "pending" subfolder after the first update is downloaded.  If the update file does not exist then the cache is cleared and recreated.  If the update file exists then its properties are validated.
   * @param fileInfo
   * @param logger
   */
  async getValidCachedUpdateFile(t, r) {
    const n = this.getUpdateInfoFile();
    if (!await (0, Nt.pathExists)(n))
      return null;
    let o;
    try {
      o = await (0, Nt.readJson)(n);
    } catch (f) {
      let c = "No cached update info available";
      return f.code !== "ENOENT" && (await this.cleanCacheDirForPendingUpdate(), c += ` (error on read: ${f.message})`), r.info(c), null;
    }
    if (!((o == null ? void 0 : o.fileName) !== null))
      return r.warn("Cached update info is corrupted: no fileName, directory for cached update will be cleaned"), await this.cleanCacheDirForPendingUpdate(), null;
    if (t.info.sha512 !== o.sha512)
      return r.info(`Cached update sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${o.sha512}, expected: ${t.info.sha512}. Directory for cached update will be cleaned`), await this.cleanCacheDirForPendingUpdate(), null;
    const a = Fr.join(this.cacheDirForPendingUpdate, o.fileName);
    if (!await (0, Nt.pathExists)(a))
      return r.info("Cached update file doesn't exist"), null;
    const l = await Ow(a);
    return t.info.sha512 !== l ? (r.warn(`Sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${l}, expected: ${t.info.sha512}`), await this.cleanCacheDirForPendingUpdate(), null) : (this._downloadedFileInfo = o, a);
  }
  getUpdateInfoFile() {
    return Fr.join(this.cacheDirForPendingUpdate, "update-info.json");
  }
}
an.DownloadedUpdateHelper = Cw;
function Ow(e, t = "sha512", r = "base64", n) {
  return new Promise((i, o) => {
    const s = (0, bw.createHash)(t);
    s.on("error", o).setEncoding(r), (0, Tw.createReadStream)(e, {
      ...n,
      highWaterMark: 1024 * 1024
      /* better to use more memory but hash faster */
    }).on("error", o).on("end", () => {
      s.end(), i(s.read());
    }).pipe(s, { end: !1 });
  });
}
async function $w(e, t, r) {
  let n = 0, i = Fr.join(t, e);
  for (let o = 0; o < 3; o++)
    try {
      return await (0, Nt.unlink)(i), i;
    } catch (s) {
      if (s.code === "ENOENT")
        return i;
      r.warn(`Error on remove temp update file: ${s}`), i = Fr.join(t, `${n++}-${e}`);
    }
  return i;
}
var gi = {}, Ls = {};
Object.defineProperty(Ls, "__esModule", { value: !0 });
Ls.getAppCacheDir = Pw;
const Qi = Q, Rw = St;
function Pw() {
  const e = (0, Rw.homedir)();
  let t;
  return process.platform === "win32" ? t = process.env.LOCALAPPDATA || Qi.join(e, "AppData", "Local") : process.platform === "darwin" ? t = Qi.join(e, "Library", "Caches") : t = process.env.XDG_CACHE_HOME || Qi.join(e, ".cache"), t;
}
Object.defineProperty(gi, "__esModule", { value: !0 });
gi.ElectronAppAdapter = void 0;
const wl = Q, Iw = Ls;
class Dw {
  constructor(t = gt.app) {
    this.app = t;
  }
  whenReady() {
    return this.app.whenReady();
  }
  get version() {
    return this.app.getVersion();
  }
  get name() {
    return this.app.getName();
  }
  get isPackaged() {
    return this.app.isPackaged === !0;
  }
  get appUpdateConfigPath() {
    return this.isPackaged ? wl.join(process.resourcesPath, "app-update.yml") : wl.join(this.app.getAppPath(), "dev-app-update.yml");
  }
  get userDataPath() {
    return this.app.getPath("userData");
  }
  get baseCachePath() {
    return (0, Iw.getAppCacheDir)();
  }
  quit() {
    this.app.quit();
  }
  relaunch() {
    this.app.relaunch();
  }
  onQuit(t) {
    this.app.once("quit", (r, n) => t(n));
  }
}
gi.ElectronAppAdapter = Dw;
var Nf = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ElectronHttpExecutor = e.NET_SESSION_NAME = void 0, e.getNetSession = r;
  const t = he;
  e.NET_SESSION_NAME = "electron-updater";
  function r() {
    return gt.session.fromPartition(e.NET_SESSION_NAME, {
      cache: !1
    });
  }
  class n extends t.HttpExecutor {
    constructor(o) {
      super(), this.proxyLoginCallback = o, this.cachedSession = null;
    }
    async download(o, s, a) {
      return await a.cancellationToken.createPromise((l, f, c) => {
        const u = {
          headers: a.headers || void 0,
          redirect: "manual"
        };
        (0, t.configureRequestUrl)(o, u), (0, t.configureRequestOptions)(u), this.doDownload(u, {
          destination: s,
          options: a,
          onCancel: c,
          callback: (h) => {
            h == null ? l(s) : f(h);
          },
          responseHandler: null
        }, 0);
      });
    }
    createRequest(o, s) {
      o.headers && o.headers.Host && (o.host = o.headers.Host, delete o.headers.Host), this.cachedSession == null && (this.cachedSession = r());
      const a = gt.net.request({
        ...o,
        session: this.cachedSession
      });
      return a.on("response", s), this.proxyLoginCallback != null && a.on("login", this.proxyLoginCallback), a;
    }
    addRedirectHandlers(o, s, a, l, f) {
      o.on("redirect", (c, u, h) => {
        o.abort(), l > this.maxRedirects ? a(this.createMaxRedirectError()) : f(t.HttpExecutor.prepareRedirectUrlOptions(h, s));
      });
    }
  }
  e.ElectronHttpExecutor = n;
})(Nf);
var ln = {}, Je = {};
Object.defineProperty(Je, "__esModule", { value: !0 });
Je.newBaseUrl = Nw;
Je.newUrlFromBase = Fw;
Je.getChannelFilename = xw;
const Ff = At;
function Nw(e) {
  const t = new Ff.URL(e);
  return t.pathname.endsWith("/") || (t.pathname += "/"), t;
}
function Fw(e, t, r = !1) {
  const n = new Ff.URL(e, t), i = t.search;
  return i != null && i.length !== 0 ? n.search = i : r && (n.search = `noCache=${Date.now().toString(32)}`), n;
}
function xw(e) {
  return `${e}.yml`;
}
var ue = {}, Lw = "[object Symbol]", xf = /[\\^$.*+?()[\]{}|]/g, Uw = RegExp(xf.source), kw = typeof Oe == "object" && Oe && Oe.Object === Object && Oe, Mw = typeof self == "object" && self && self.Object === Object && self, Bw = kw || Mw || Function("return this")(), jw = Object.prototype, qw = jw.toString, _l = Bw.Symbol, Sl = _l ? _l.prototype : void 0, Al = Sl ? Sl.toString : void 0;
function Hw(e) {
  if (typeof e == "string")
    return e;
  if (Ww(e))
    return Al ? Al.call(e) : "";
  var t = e + "";
  return t == "0" && 1 / e == -1 / 0 ? "-0" : t;
}
function Gw(e) {
  return !!e && typeof e == "object";
}
function Ww(e) {
  return typeof e == "symbol" || Gw(e) && qw.call(e) == Lw;
}
function Vw(e) {
  return e == null ? "" : Hw(e);
}
function zw(e) {
  return e = Vw(e), e && Uw.test(e) ? e.replace(xf, "\\$&") : e;
}
var Lf = zw;
Object.defineProperty(ue, "__esModule", { value: !0 });
ue.Provider = void 0;
ue.findFile = Qw;
ue.parseUpdateInfo = Zw;
ue.getFileList = Uf;
ue.resolveFiles = e_;
const wt = he, Yw = Ee, Xw = At, ei = Je, Jw = Lf;
class Kw {
  constructor(t) {
    this.runtimeOptions = t, this.requestHeaders = null, this.executor = t.executor;
  }
  // By default, the blockmap file is in the same directory as the main file
  // But some providers may have a different blockmap file, so we need to override this method
  getBlockMapFiles(t, r, n, i = null) {
    const o = (0, ei.newUrlFromBase)(`${t.pathname}.blockmap`, t);
    return [(0, ei.newUrlFromBase)(`${t.pathname.replace(new RegExp(Jw(n), "g"), r)}.blockmap`, i ? new Xw.URL(i) : t), o];
  }
  get isUseMultipleRangeRequest() {
    return this.runtimeOptions.isUseMultipleRangeRequest !== !1;
  }
  getChannelFilePrefix() {
    if (this.runtimeOptions.platform === "linux") {
      const t = process.env.TEST_UPDATER_ARCH || process.arch;
      return "-linux" + (t === "x64" ? "" : `-${t}`);
    } else
      return this.runtimeOptions.platform === "darwin" ? "-mac" : "";
  }
  // due to historical reasons for windows we use channel name without platform specifier
  getDefaultChannelName() {
    return this.getCustomChannelName("latest");
  }
  getCustomChannelName(t) {
    return `${t}${this.getChannelFilePrefix()}`;
  }
  get fileExtraDownloadHeaders() {
    return null;
  }
  setRequestHeaders(t) {
    this.requestHeaders = t;
  }
  /**
   * Method to perform API request only to resolve update info, but not to download update.
   */
  httpRequest(t, r, n) {
    return this.executor.request(this.createRequestOptions(t, r), n);
  }
  createRequestOptions(t, r) {
    const n = {};
    return this.requestHeaders == null ? r != null && (n.headers = r) : n.headers = r == null ? this.requestHeaders : { ...this.requestHeaders, ...r }, (0, wt.configureRequestUrl)(t, n), n;
  }
}
ue.Provider = Kw;
function Qw(e, t, r) {
  var n;
  if (e.length === 0)
    throw (0, wt.newError)("No files provided", "ERR_UPDATER_NO_FILES_PROVIDED");
  const i = e.filter((s) => s.url.pathname.toLowerCase().endsWith(`.${t.toLowerCase()}`)), o = (n = i.find((s) => [s.url.pathname, s.info.url].some((a) => a.includes(process.arch)))) !== null && n !== void 0 ? n : i.shift();
  return o || (r == null ? e[0] : e.find((s) => !r.some((a) => s.url.pathname.toLowerCase().endsWith(`.${a.toLowerCase()}`))));
}
function Zw(e, t, r) {
  if (e == null)
    throw (0, wt.newError)(`Cannot parse update info from ${t} in the latest release artifacts (${r}): rawData: null`, "ERR_UPDATER_INVALID_UPDATE_INFO");
  let n;
  try {
    n = (0, Yw.load)(e);
  } catch (i) {
    throw (0, wt.newError)(`Cannot parse update info from ${t} in the latest release artifacts (${r}): ${i.stack || i.message}, rawData: ${e}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
  }
  return n;
}
function Uf(e) {
  const t = e.files;
  if (t != null && t.length > 0)
    return t;
  if (e.path != null)
    return [
      {
        url: e.path,
        sha2: e.sha2,
        sha512: e.sha512
      }
    ];
  throw (0, wt.newError)(`No files provided: ${(0, wt.safeStringifyJson)(e)}`, "ERR_UPDATER_NO_FILES_PROVIDED");
}
function e_(e, t, r = (n) => n) {
  const i = Uf(e).map((a) => {
    if (a.sha2 == null && a.sha512 == null)
      throw (0, wt.newError)(`Update info doesn't contain nor sha256 neither sha512 checksum: ${(0, wt.safeStringifyJson)(a)}`, "ERR_UPDATER_NO_CHECKSUM");
    return {
      url: (0, ei.newUrlFromBase)(r(a.url), t),
      info: a
    };
  }), o = e.packages, s = o == null ? null : o[process.arch] || o.ia32;
  return s != null && (i[0].packageInfo = {
    ...s,
    path: (0, ei.newUrlFromBase)(r(s.path), t).href
  }), i;
}
Object.defineProperty(ln, "__esModule", { value: !0 });
ln.GenericProvider = void 0;
const bl = he, Zi = Je, eo = ue;
class t_ extends eo.Provider {
  constructor(t, r, n) {
    super(n), this.configuration = t, this.updater = r, this.baseUrl = (0, Zi.newBaseUrl)(this.configuration.url);
  }
  get channel() {
    const t = this.updater.channel || this.configuration.channel;
    return t == null ? this.getDefaultChannelName() : this.getCustomChannelName(t);
  }
  async getLatestVersion() {
    const t = (0, Zi.getChannelFilename)(this.channel), r = (0, Zi.newUrlFromBase)(t, this.baseUrl, this.updater.isAddNoCacheQuery);
    for (let n = 0; ; n++)
      try {
        return (0, eo.parseUpdateInfo)(await this.httpRequest(r), t, r);
      } catch (i) {
        if (i instanceof bl.HttpError && i.statusCode === 404)
          throw (0, bl.newError)(`Cannot find channel "${t}" update info: ${i.stack || i.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
        if (i.code === "ECONNREFUSED" && n < 3) {
          await new Promise((o, s) => {
            try {
              setTimeout(o, 1e3 * n);
            } catch (a) {
              s(a);
            }
          });
          continue;
        }
        throw i;
      }
  }
  resolveFiles(t) {
    return (0, eo.resolveFiles)(t, this.baseUrl);
  }
}
ln.GenericProvider = t_;
var yi = {}, Ei = {};
Object.defineProperty(Ei, "__esModule", { value: !0 });
Ei.BitbucketProvider = void 0;
const Tl = he, to = Je, ro = ue;
class r_ extends ro.Provider {
  constructor(t, r, n) {
    super({
      ...n,
      isUseMultipleRangeRequest: !1
    }), this.configuration = t, this.updater = r;
    const { owner: i, slug: o } = t;
    this.baseUrl = (0, to.newBaseUrl)(`https://api.bitbucket.org/2.0/repositories/${i}/${o}/downloads`);
  }
  get channel() {
    return this.updater.channel || this.configuration.channel || "latest";
  }
  async getLatestVersion() {
    const t = new Tl.CancellationToken(), r = (0, to.getChannelFilename)(this.getCustomChannelName(this.channel)), n = (0, to.newUrlFromBase)(r, this.baseUrl, this.updater.isAddNoCacheQuery);
    try {
      const i = await this.httpRequest(n, void 0, t);
      return (0, ro.parseUpdateInfo)(i, r, n);
    } catch (i) {
      throw (0, Tl.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${i.stack || i.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  resolveFiles(t) {
    return (0, ro.resolveFiles)(t, this.baseUrl);
  }
  toString() {
    const { owner: t, slug: r } = this.configuration;
    return `Bitbucket (owner: ${t}, slug: ${r}, channel: ${this.channel})`;
  }
}
Ei.BitbucketProvider = r_;
var _t = {};
Object.defineProperty(_t, "__esModule", { value: !0 });
_t.GitHubProvider = _t.BaseGitHubProvider = void 0;
_t.computeReleaseNotes = Mf;
const it = he, Lt = Df, n_ = At, ir = Je, ns = ue, no = /\/tag\/([^/]+)$/;
class kf extends ns.Provider {
  constructor(t, r, n) {
    super({
      ...n,
      /* because GitHib uses S3 */
      isUseMultipleRangeRequest: !1
    }), this.options = t, this.baseUrl = (0, ir.newBaseUrl)((0, it.githubUrl)(t, r));
    const i = r === "github.com" ? "api.github.com" : r;
    this.baseApiUrl = (0, ir.newBaseUrl)((0, it.githubUrl)(t, i));
  }
  computeGithubBasePath(t) {
    const r = this.options.host;
    return r && !["github.com", "api.github.com"].includes(r) ? `/api/v3${t}` : t;
  }
}
_t.BaseGitHubProvider = kf;
class i_ extends kf {
  constructor(t, r, n) {
    super(t, "github.com", n), this.options = t, this.updater = r;
  }
  get channel() {
    const t = this.updater.channel || this.options.channel;
    return t == null ? this.getDefaultChannelName() : this.getCustomChannelName(t);
  }
  async getLatestVersion() {
    var t, r, n, i, o;
    const s = new it.CancellationToken(), a = await this.httpRequest((0, ir.newUrlFromBase)(`${this.basePath}.atom`, this.baseUrl), {
      accept: "application/xml, application/atom+xml, text/xml, */*"
    }, s), l = (0, it.parseXml)(a);
    let f = l.element("entry", !1, "No published versions on GitHub"), c = null;
    try {
      if (this.updater.allowPrerelease) {
        const S = ((t = this.updater) === null || t === void 0 ? void 0 : t.channel) || ((r = Lt.prerelease(this.updater.currentVersion)) === null || r === void 0 ? void 0 : r[0]) || null;
        if (S === null)
          c = no.exec(f.element("link").attribute("href"))[1];
        else
          for (const A of l.getElements("entry")) {
            const T = no.exec(A.element("link").attribute("href"));
            if (T === null)
              continue;
            const D = T[1], B = ((n = Lt.prerelease(D)) === null || n === void 0 ? void 0 : n[0]) || null, k = !S || ["alpha", "beta"].includes(S), q = B !== null && !["alpha", "beta"].includes(String(B));
            if (k && !q && !(S === "beta" && B === "alpha")) {
              c = D;
              break;
            }
            if (B && B === S) {
              c = D;
              break;
            }
          }
      } else {
        c = await this.getLatestTagName(s);
        for (const S of l.getElements("entry"))
          if (no.exec(S.element("link").attribute("href"))[1] === c) {
            f = S;
            break;
          }
      }
    } catch (S) {
      throw (0, it.newError)(`Cannot parse releases feed: ${S.stack || S.message},
XML:
${a}`, "ERR_UPDATER_INVALID_RELEASE_FEED");
    }
    if (c == null)
      throw (0, it.newError)("No published versions on GitHub", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
    let u, h = "", m = "";
    const E = async (S) => {
      h = (0, ir.getChannelFilename)(S), m = (0, ir.newUrlFromBase)(this.getBaseDownloadPath(String(c), h), this.baseUrl);
      const A = this.createRequestOptions(m);
      try {
        return await this.executor.request(A, s);
      } catch (T) {
        throw T instanceof it.HttpError && T.statusCode === 404 ? (0, it.newError)(`Cannot find ${h} in the latest release artifacts (${m}): ${T.stack || T.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : T;
      }
    };
    try {
      let S = this.channel;
      this.updater.allowPrerelease && (!((i = Lt.prerelease(c)) === null || i === void 0) && i[0]) && (S = this.getCustomChannelName(String((o = Lt.prerelease(c)) === null || o === void 0 ? void 0 : o[0]))), u = await E(S);
    } catch (S) {
      if (this.updater.allowPrerelease)
        u = await E(this.getDefaultChannelName());
      else
        throw S;
    }
    const y = (0, ns.parseUpdateInfo)(u, h, m);
    return y.releaseName == null && (y.releaseName = f.elementValueOrEmpty("title")), y.releaseNotes == null && (y.releaseNotes = Mf(this.updater.currentVersion, this.updater.fullChangelog, l, f)), {
      tag: c,
      ...y
    };
  }
  async getLatestTagName(t) {
    const r = this.options, n = r.host == null || r.host === "github.com" ? (0, ir.newUrlFromBase)(`${this.basePath}/latest`, this.baseUrl) : new n_.URL(`${this.computeGithubBasePath(`/repos/${r.owner}/${r.repo}/releases`)}/latest`, this.baseApiUrl);
    try {
      const i = await this.httpRequest(n, { Accept: "application/json" }, t);
      return i == null ? null : JSON.parse(i).tag_name;
    } catch (i) {
      throw (0, it.newError)(`Unable to find latest version on GitHub (${n}), please ensure a production release exists: ${i.stack || i.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  get basePath() {
    return `/${this.options.owner}/${this.options.repo}/releases`;
  }
  resolveFiles(t) {
    return (0, ns.resolveFiles)(t, this.baseUrl, (r) => this.getBaseDownloadPath(t.tag, r.replace(/ /g, "-")));
  }
  getBaseDownloadPath(t, r) {
    return `${this.basePath}/download/${t}/${r}`;
  }
}
_t.GitHubProvider = i_;
function Cl(e) {
  const t = e.elementValueOrEmpty("content");
  return t === "No content." ? "" : t;
}
function Mf(e, t, r, n) {
  if (!t)
    return Cl(n);
  const i = [];
  for (const o of r.getElements("entry")) {
    const s = /\/tag\/v?([^/]+)$/.exec(o.element("link").attribute("href"))[1];
    Lt.valid(s) && Lt.lt(e, s) && i.push({
      version: s,
      note: Cl(o)
    });
  }
  return i.sort((o, s) => Lt.rcompare(o.version, s.version));
}
var vi = {};
Object.defineProperty(vi, "__esModule", { value: !0 });
vi.GitLabProvider = void 0;
const Te = he, io = At, o_ = Lf, Dn = Je, oo = ue;
class s_ extends oo.Provider {
  /**
   * Normalizes filenames by replacing spaces and underscores with dashes.
   *
   * This is a workaround to handle filename formatting differences between tools:
   * - electron-builder formats filenames like "test file.txt" as "test-file.txt"
   * - GitLab may provide asset URLs using underscores, such as "test_file.txt"
   *
   * Because of this mismatch, we can't reliably extract the correct filename from
   * the asset path without normalization. This function ensures consistent matching
   * across different filename formats by converting all spaces and underscores to dashes.
   *
   * @param filename The filename to normalize
   * @returns The normalized filename with spaces and underscores replaced by dashes
   */
  normalizeFilename(t) {
    return t.replace(/ |_/g, "-");
  }
  constructor(t, r, n) {
    super({
      ...n,
      // GitLab might not support multiple range requests efficiently
      isUseMultipleRangeRequest: !1
    }), this.options = t, this.updater = r, this.cachedLatestVersion = null;
    const o = t.host || "gitlab.com";
    this.baseApiUrl = (0, Dn.newBaseUrl)(`https://${o}/api/v4`);
  }
  get channel() {
    const t = this.updater.channel || this.options.channel;
    return t == null ? this.getDefaultChannelName() : this.getCustomChannelName(t);
  }
  async getLatestVersion() {
    const t = new Te.CancellationToken(), r = (0, Dn.newUrlFromBase)(`projects/${this.options.projectId}/releases/permalink/latest`, this.baseApiUrl);
    let n;
    try {
      const h = { "Content-Type": "application/json", ...this.setAuthHeaderForToken(this.options.token || null) }, m = await this.httpRequest(r, h, t);
      if (!m)
        throw (0, Te.newError)("No latest release found", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
      n = JSON.parse(m);
    } catch (h) {
      throw (0, Te.newError)(`Unable to find latest release on GitLab (${r}): ${h.stack || h.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
    const i = n.tag_name;
    let o = null, s = "", a = null;
    const l = async (h) => {
      s = (0, Dn.getChannelFilename)(h);
      const m = n.assets.links.find((y) => y.name === s);
      if (!m)
        throw (0, Te.newError)(`Cannot find ${s} in the latest release assets`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
      a = new io.URL(m.direct_asset_url);
      const E = this.options.token ? { "PRIVATE-TOKEN": this.options.token } : void 0;
      try {
        const y = await this.httpRequest(a, E, t);
        if (!y)
          throw (0, Te.newError)(`Empty response from ${a}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
        return y;
      } catch (y) {
        throw y instanceof Te.HttpError && y.statusCode === 404 ? (0, Te.newError)(`Cannot find ${s} in the latest release artifacts (${a}): ${y.stack || y.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : y;
      }
    };
    try {
      o = await l(this.channel);
    } catch (h) {
      if (this.channel !== this.getDefaultChannelName())
        o = await l(this.getDefaultChannelName());
      else
        throw h;
    }
    if (!o)
      throw (0, Te.newError)(`Unable to parse channel data from ${s}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    const f = (0, oo.parseUpdateInfo)(o, s, a);
    f.releaseName == null && (f.releaseName = n.name), f.releaseNotes == null && (f.releaseNotes = n.description || null);
    const c = /* @__PURE__ */ new Map();
    for (const h of n.assets.links)
      c.set(this.normalizeFilename(h.name), h.direct_asset_url);
    const u = {
      tag: i,
      assets: c,
      ...f
    };
    return this.cachedLatestVersion = u, u;
  }
  /**
   * Utility function to convert GitlabReleaseAsset to Map<string, string>
   * Maps asset names to their download URLs
   */
  convertAssetsToMap(t) {
    const r = /* @__PURE__ */ new Map();
    for (const n of t.links)
      r.set(this.normalizeFilename(n.name), n.direct_asset_url);
    return r;
  }
  /**
   * Find blockmap file URL in assets map for a specific filename
   */
  findBlockMapInAssets(t, r) {
    const n = [`${r}.blockmap`, `${this.normalizeFilename(r)}.blockmap`];
    for (const i of n) {
      const o = t.get(i);
      if (o)
        return new io.URL(o);
    }
    return null;
  }
  async fetchReleaseInfoByVersion(t) {
    const r = new Te.CancellationToken(), n = [`v${t}`, t];
    for (const i of n) {
      const o = (0, Dn.newUrlFromBase)(`projects/${this.options.projectId}/releases/${encodeURIComponent(i)}`, this.baseApiUrl);
      try {
        const s = { "Content-Type": "application/json", ...this.setAuthHeaderForToken(this.options.token || null) }, a = await this.httpRequest(o, s, r);
        if (a)
          return JSON.parse(a);
      } catch (s) {
        if (s instanceof Te.HttpError && s.statusCode === 404)
          continue;
        throw (0, Te.newError)(`Unable to find release ${i} on GitLab (${o}): ${s.stack || s.message}`, "ERR_UPDATER_RELEASE_NOT_FOUND");
      }
    }
    throw (0, Te.newError)(`Unable to find release with version ${t} (tried: ${n.join(", ")}) on GitLab`, "ERR_UPDATER_RELEASE_NOT_FOUND");
  }
  setAuthHeaderForToken(t) {
    const r = {};
    return t != null && (t.startsWith("Bearer") ? r.authorization = t : r["PRIVATE-TOKEN"] = t), r;
  }
  /**
   * Get version info for blockmap files, using cache when possible
   */
  async getVersionInfoForBlockMap(t) {
    if (this.cachedLatestVersion && this.cachedLatestVersion.version === t)
      return this.cachedLatestVersion.assets;
    const r = await this.fetchReleaseInfoByVersion(t);
    return r && r.assets ? this.convertAssetsToMap(r.assets) : null;
  }
  /**
   * Find blockmap URLs from version assets
   */
  async findBlockMapUrlsFromAssets(t, r, n) {
    let i = null, o = null;
    const s = await this.getVersionInfoForBlockMap(r);
    s && (i = this.findBlockMapInAssets(s, n));
    const a = await this.getVersionInfoForBlockMap(t);
    if (a) {
      const l = n.replace(new RegExp(o_(r), "g"), t);
      o = this.findBlockMapInAssets(a, l);
    }
    return [o, i];
  }
  async getBlockMapFiles(t, r, n, i = null) {
    if (this.options.uploadTarget === "project_upload") {
      const o = t.pathname.split("/").pop() || "", [s, a] = await this.findBlockMapUrlsFromAssets(r, n, o);
      if (!a)
        throw (0, Te.newError)(`Cannot find blockmap file for ${n} in GitLab assets`, "ERR_UPDATER_BLOCKMAP_FILE_NOT_FOUND");
      if (!s)
        throw (0, Te.newError)(`Cannot find blockmap file for ${r} in GitLab assets`, "ERR_UPDATER_BLOCKMAP_FILE_NOT_FOUND");
      return [s, a];
    } else
      return super.getBlockMapFiles(t, r, n, i);
  }
  resolveFiles(t) {
    return (0, oo.getFileList)(t).map((r) => {
      const i = [
        r.url,
        // Original filename
        this.normalizeFilename(r.url)
        // Normalized filename (spaces/underscores → dashes)
      ].find((s) => t.assets.has(s)), o = i ? t.assets.get(i) : void 0;
      if (!o)
        throw (0, Te.newError)(`Cannot find asset "${r.url}" in GitLab release assets. Available assets: ${Array.from(t.assets.keys()).join(", ")}`, "ERR_UPDATER_ASSET_NOT_FOUND");
      return {
        url: new io.URL(o),
        info: r
      };
    });
  }
  toString() {
    return `GitLab (projectId: ${this.options.projectId}, channel: ${this.channel})`;
  }
}
vi.GitLabProvider = s_;
var wi = {};
Object.defineProperty(wi, "__esModule", { value: !0 });
wi.KeygenProvider = void 0;
const Ol = he, so = Je, ao = ue;
class a_ extends ao.Provider {
  constructor(t, r, n) {
    super({
      ...n,
      isUseMultipleRangeRequest: !1
    }), this.configuration = t, this.updater = r, this.defaultHostname = "api.keygen.sh";
    const i = this.configuration.host || this.defaultHostname;
    this.baseUrl = (0, so.newBaseUrl)(`https://${i}/v1/accounts/${this.configuration.account}/artifacts?product=${this.configuration.product}`);
  }
  get channel() {
    return this.updater.channel || this.configuration.channel || "stable";
  }
  async getLatestVersion() {
    const t = new Ol.CancellationToken(), r = (0, so.getChannelFilename)(this.getCustomChannelName(this.channel)), n = (0, so.newUrlFromBase)(r, this.baseUrl, this.updater.isAddNoCacheQuery);
    try {
      const i = await this.httpRequest(n, {
        Accept: "application/vnd.api+json",
        "Keygen-Version": "1.1"
      }, t);
      return (0, ao.parseUpdateInfo)(i, r, n);
    } catch (i) {
      throw (0, Ol.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${i.stack || i.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  resolveFiles(t) {
    return (0, ao.resolveFiles)(t, this.baseUrl);
  }
  toString() {
    const { account: t, product: r, platform: n } = this.configuration;
    return `Keygen (account: ${t}, product: ${r}, platform: ${n}, channel: ${this.channel})`;
  }
}
wi.KeygenProvider = a_;
var _i = {};
Object.defineProperty(_i, "__esModule", { value: !0 });
_i.PrivateGitHubProvider = void 0;
const Kt = he, l_ = Ee, c_ = Q, $l = At, Rl = Je, u_ = _t, f_ = ue;
class d_ extends u_.BaseGitHubProvider {
  constructor(t, r, n, i) {
    super(t, "api.github.com", i), this.updater = r, this.token = n;
  }
  createRequestOptions(t, r) {
    const n = super.createRequestOptions(t, r);
    return n.redirect = "manual", n;
  }
  async getLatestVersion() {
    const t = new Kt.CancellationToken(), r = (0, Rl.getChannelFilename)(this.getDefaultChannelName()), n = await this.getLatestVersionInfo(t), i = n.assets.find((a) => a.name === r);
    if (i == null)
      throw (0, Kt.newError)(`Cannot find ${r} in the release ${n.html_url || n.name}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
    const o = new $l.URL(i.url);
    let s;
    try {
      s = (0, l_.load)(await this.httpRequest(o, this.configureHeaders("application/octet-stream"), t));
    } catch (a) {
      throw a instanceof Kt.HttpError && a.statusCode === 404 ? (0, Kt.newError)(`Cannot find ${r} in the latest release artifacts (${o}): ${a.stack || a.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : a;
    }
    return s.assets = n.assets, s;
  }
  get fileExtraDownloadHeaders() {
    return this.configureHeaders("application/octet-stream");
  }
  configureHeaders(t) {
    return {
      accept: t,
      authorization: `token ${this.token}`
    };
  }
  async getLatestVersionInfo(t) {
    const r = this.updater.allowPrerelease;
    let n = this.basePath;
    r || (n = `${n}/latest`);
    const i = (0, Rl.newUrlFromBase)(n, this.baseUrl);
    try {
      const o = JSON.parse(await this.httpRequest(i, this.configureHeaders("application/vnd.github.v3+json"), t));
      return r ? o.find((s) => s.prerelease) || o[0] : o;
    } catch (o) {
      throw (0, Kt.newError)(`Unable to find latest version on GitHub (${i}), please ensure a production release exists: ${o.stack || o.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  get basePath() {
    return this.computeGithubBasePath(`/repos/${this.options.owner}/${this.options.repo}/releases`);
  }
  resolveFiles(t) {
    return (0, f_.getFileList)(t).map((r) => {
      const n = c_.posix.basename(r.url).replace(/ /g, "-"), i = t.assets.find((o) => o != null && o.name === n);
      if (i == null)
        throw (0, Kt.newError)(`Cannot find asset "${n}" in: ${JSON.stringify(t.assets, null, 2)}`, "ERR_UPDATER_ASSET_NOT_FOUND");
      return {
        url: new $l.URL(i.url),
        info: r
      };
    });
  }
}
_i.PrivateGitHubProvider = d_;
Object.defineProperty(yi, "__esModule", { value: !0 });
yi.isUrlProbablySupportMultiRangeRequests = Bf;
yi.createClient = E_;
const Nn = he, h_ = Ei, Pl = ln, p_ = _t, m_ = vi, g_ = wi, y_ = _i;
function Bf(e) {
  return !e.includes("s3.amazonaws.com");
}
function E_(e, t, r) {
  if (typeof e == "string")
    throw (0, Nn.newError)("Please pass PublishConfiguration object", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
  const n = e.provider;
  switch (n) {
    case "github": {
      const i = e, o = (i.private ? process.env.GH_TOKEN || process.env.GITHUB_TOKEN : null) || i.token;
      return o == null ? new p_.GitHubProvider(i, t, r) : new y_.PrivateGitHubProvider(i, t, o, r);
    }
    case "bitbucket":
      return new h_.BitbucketProvider(e, t, r);
    case "gitlab":
      return new m_.GitLabProvider(e, t, r);
    case "keygen":
      return new g_.KeygenProvider(e, t, r);
    case "s3":
    case "spaces":
      return new Pl.GenericProvider({
        provider: "generic",
        url: (0, Nn.getS3LikeProviderBaseUrl)(e),
        channel: e.channel || null
      }, t, {
        ...r,
        // https://github.com/minio/minio/issues/5285#issuecomment-350428955
        isUseMultipleRangeRequest: !1
      });
    case "generic": {
      const i = e;
      return new Pl.GenericProvider(i, t, {
        ...r,
        isUseMultipleRangeRequest: i.useMultipleRangeRequest !== !1 && Bf(i.url)
      });
    }
    case "custom": {
      const i = e, o = i.updateProvider;
      if (!o)
        throw (0, Nn.newError)("Custom provider not specified", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
      return new o(i, t, r);
    }
    default:
      throw (0, Nn.newError)(`Unsupported provider: ${n}`, "ERR_UPDATER_UNSUPPORTED_PROVIDER");
  }
}
var Si = {}, cn = {}, gr = {}, Wt = {};
Object.defineProperty(Wt, "__esModule", { value: !0 });
Wt.OperationKind = void 0;
Wt.computeOperations = v_;
var Ut;
(function(e) {
  e[e.COPY = 0] = "COPY", e[e.DOWNLOAD = 1] = "DOWNLOAD";
})(Ut || (Wt.OperationKind = Ut = {}));
function v_(e, t, r) {
  const n = Dl(e.files), i = Dl(t.files);
  let o = null;
  const s = t.files[0], a = [], l = s.name, f = n.get(l);
  if (f == null)
    throw new Error(`no file ${l} in old blockmap`);
  const c = i.get(l);
  let u = 0;
  const { checksumToOffset: h, checksumToOldSize: m } = __(n.get(l), f.offset, r);
  let E = s.offset;
  for (let y = 0; y < c.checksums.length; E += c.sizes[y], y++) {
    const S = c.sizes[y], A = c.checksums[y];
    let T = h.get(A);
    T != null && m.get(A) !== S && (r.warn(`Checksum ("${A}") matches, but size differs (old: ${m.get(A)}, new: ${S})`), T = void 0), T === void 0 ? (u++, o != null && o.kind === Ut.DOWNLOAD && o.end === E ? o.end += S : (o = {
      kind: Ut.DOWNLOAD,
      start: E,
      end: E + S
      // oldBlocks: null,
    }, Il(o, a, A, y))) : o != null && o.kind === Ut.COPY && o.end === T ? o.end += S : (o = {
      kind: Ut.COPY,
      start: T,
      end: T + S
      // oldBlocks: [checksum]
    }, Il(o, a, A, y));
  }
  return u > 0 && r.info(`File${s.name === "file" ? "" : " " + s.name} has ${u} changed blocks`), a;
}
const w_ = process.env.DIFFERENTIAL_DOWNLOAD_PLAN_BUILDER_VALIDATE_RANGES === "true";
function Il(e, t, r, n) {
  if (w_ && t.length !== 0) {
    const i = t[t.length - 1];
    if (i.kind === e.kind && e.start < i.end && e.start > i.start) {
      const o = [i.start, i.end, e.start, e.end].reduce((s, a) => s < a ? s : a);
      throw new Error(`operation (block index: ${n}, checksum: ${r}, kind: ${Ut[e.kind]}) overlaps previous operation (checksum: ${r}):
abs: ${i.start} until ${i.end} and ${e.start} until ${e.end}
rel: ${i.start - o} until ${i.end - o} and ${e.start - o} until ${e.end - o}`);
    }
  }
  t.push(e);
}
function __(e, t, r) {
  const n = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  let o = t;
  for (let s = 0; s < e.checksums.length; s++) {
    const a = e.checksums[s], l = e.sizes[s], f = i.get(a);
    if (f === void 0)
      n.set(a, o), i.set(a, l);
    else if (r.debug != null) {
      const c = f === l ? "(same size)" : `(size: ${f}, this size: ${l})`;
      r.debug(`${a} duplicated in blockmap ${c}, it doesn't lead to broken differential downloader, just corresponding block will be skipped)`);
    }
    o += l;
  }
  return { checksumToOffset: n, checksumToOldSize: i };
}
function Dl(e) {
  const t = /* @__PURE__ */ new Map();
  for (const r of e)
    t.set(r.name, r);
  return t;
}
Object.defineProperty(gr, "__esModule", { value: !0 });
gr.DataSplitter = void 0;
gr.copyData = jf;
const Fn = he, S_ = Ue, A_ = Jr, b_ = Wt, Nl = Buffer.from(`\r
\r
`);
var ft;
(function(e) {
  e[e.INIT = 0] = "INIT", e[e.HEADER = 1] = "HEADER", e[e.BODY = 2] = "BODY";
})(ft || (ft = {}));
function jf(e, t, r, n, i) {
  const o = (0, S_.createReadStream)("", {
    fd: r,
    autoClose: !1,
    start: e.start,
    // end is inclusive
    end: e.end - 1
  });
  o.on("error", n), o.once("end", i), o.pipe(t, {
    end: !1
  });
}
class T_ extends A_.Writable {
  constructor(t, r, n, i, o, s, a, l) {
    super(), this.out = t, this.options = r, this.partIndexToTaskIndex = n, this.partIndexToLength = o, this.finishHandler = s, this.grandTotalBytes = a, this.onProgress = l, this.start = Date.now(), this.nextUpdate = this.start + 1e3, this.transferred = 0, this.delta = 0, this.partIndex = -1, this.headerListBuffer = null, this.readState = ft.INIT, this.ignoreByteCount = 0, this.remainingPartDataCount = 0, this.actualPartLength = 0, this.boundaryLength = i.length + 4, this.ignoreByteCount = this.boundaryLength - 2;
  }
  get isFinished() {
    return this.partIndex === this.partIndexToLength.length;
  }
  // noinspection JSUnusedGlobalSymbols
  _write(t, r, n) {
    if (this.isFinished) {
      console.error(`Trailing ignored data: ${t.length} bytes`);
      return;
    }
    this.handleData(t).then(() => {
      if (this.onProgress) {
        const i = Date.now();
        (i >= this.nextUpdate || this.transferred === this.grandTotalBytes) && this.grandTotalBytes && (i - this.start) / 1e3 && (this.nextUpdate = i + 1e3, this.onProgress({
          total: this.grandTotalBytes,
          delta: this.delta,
          transferred: this.transferred,
          percent: this.transferred / this.grandTotalBytes * 100,
          bytesPerSecond: Math.round(this.transferred / ((i - this.start) / 1e3))
        }), this.delta = 0);
      }
      n();
    }).catch(n);
  }
  async handleData(t) {
    let r = 0;
    if (this.ignoreByteCount !== 0 && this.remainingPartDataCount !== 0)
      throw (0, Fn.newError)("Internal error", "ERR_DATA_SPLITTER_BYTE_COUNT_MISMATCH");
    if (this.ignoreByteCount > 0) {
      const n = Math.min(this.ignoreByteCount, t.length);
      this.ignoreByteCount -= n, r = n;
    } else if (this.remainingPartDataCount > 0) {
      const n = Math.min(this.remainingPartDataCount, t.length);
      this.remainingPartDataCount -= n, await this.processPartData(t, 0, n), r = n;
    }
    if (r !== t.length) {
      if (this.readState === ft.HEADER) {
        const n = this.searchHeaderListEnd(t, r);
        if (n === -1)
          return;
        r = n, this.readState = ft.BODY, this.headerListBuffer = null;
      }
      for (; ; ) {
        if (this.readState === ft.BODY)
          this.readState = ft.INIT;
        else {
          this.partIndex++;
          let s = this.partIndexToTaskIndex.get(this.partIndex);
          if (s == null)
            if (this.isFinished)
              s = this.options.end;
            else
              throw (0, Fn.newError)("taskIndex is null", "ERR_DATA_SPLITTER_TASK_INDEX_IS_NULL");
          const a = this.partIndex === 0 ? this.options.start : this.partIndexToTaskIndex.get(this.partIndex - 1) + 1;
          if (a < s)
            await this.copyExistingData(a, s);
          else if (a > s)
            throw (0, Fn.newError)("prevTaskIndex must be < taskIndex", "ERR_DATA_SPLITTER_TASK_INDEX_ASSERT_FAILED");
          if (this.isFinished) {
            this.onPartEnd(), this.finishHandler();
            return;
          }
          if (r = this.searchHeaderListEnd(t, r), r === -1) {
            this.readState = ft.HEADER;
            return;
          }
        }
        const n = this.partIndexToLength[this.partIndex], i = r + n, o = Math.min(i, t.length);
        if (await this.processPartStarted(t, r, o), this.remainingPartDataCount = n - (o - r), this.remainingPartDataCount > 0)
          return;
        if (r = i + this.boundaryLength, r >= t.length) {
          this.ignoreByteCount = this.boundaryLength - (t.length - i);
          return;
        }
      }
    }
  }
  copyExistingData(t, r) {
    return new Promise((n, i) => {
      const o = () => {
        if (t === r) {
          n();
          return;
        }
        const s = this.options.tasks[t];
        if (s.kind !== b_.OperationKind.COPY) {
          i(new Error("Task kind must be COPY"));
          return;
        }
        jf(s, this.out, this.options.oldFileFd, i, () => {
          t++, o();
        });
      };
      o();
    });
  }
  searchHeaderListEnd(t, r) {
    const n = t.indexOf(Nl, r);
    if (n !== -1)
      return n + Nl.length;
    const i = r === 0 ? t : t.slice(r);
    return this.headerListBuffer == null ? this.headerListBuffer = i : this.headerListBuffer = Buffer.concat([this.headerListBuffer, i]), -1;
  }
  onPartEnd() {
    const t = this.partIndexToLength[this.partIndex - 1];
    if (this.actualPartLength !== t)
      throw (0, Fn.newError)(`Expected length: ${t} differs from actual: ${this.actualPartLength}`, "ERR_DATA_SPLITTER_LENGTH_MISMATCH");
    this.actualPartLength = 0;
  }
  processPartStarted(t, r, n) {
    return this.partIndex !== 0 && this.onPartEnd(), this.processPartData(t, r, n);
  }
  processPartData(t, r, n) {
    this.actualPartLength += n - r, this.transferred += n - r, this.delta += n - r;
    const i = this.out;
    return i.write(r === 0 && t.length === n ? t : t.slice(r, n)) ? Promise.resolve() : new Promise((o, s) => {
      i.on("error", s), i.once("drain", () => {
        i.removeListener("error", s), o();
      });
    });
  }
}
gr.DataSplitter = T_;
var Ai = {};
Object.defineProperty(Ai, "__esModule", { value: !0 });
Ai.executeTasksUsingMultipleRangeRequests = C_;
Ai.checkIsRangesSupported = os;
const is = he, Fl = gr, xl = Wt;
function C_(e, t, r, n, i) {
  const o = (s) => {
    if (s >= t.length) {
      e.fileMetadataBuffer != null && r.write(e.fileMetadataBuffer), r.end();
      return;
    }
    const a = s + 1e3;
    O_(e, {
      tasks: t,
      start: s,
      end: Math.min(t.length, a),
      oldFileFd: n
    }, r, () => o(a), i);
  };
  return o;
}
function O_(e, t, r, n, i) {
  let o = "bytes=", s = 0, a = 0;
  const l = /* @__PURE__ */ new Map(), f = [];
  for (let h = t.start; h < t.end; h++) {
    const m = t.tasks[h];
    m.kind === xl.OperationKind.DOWNLOAD && (o += `${m.start}-${m.end - 1}, `, l.set(s, h), s++, f.push(m.end - m.start), a += m.end - m.start);
  }
  if (s <= 1) {
    const h = (m) => {
      if (m >= t.end) {
        n();
        return;
      }
      const E = t.tasks[m++];
      if (E.kind === xl.OperationKind.COPY)
        (0, Fl.copyData)(E, r, t.oldFileFd, i, () => h(m));
      else {
        const y = e.createRequestOptions();
        y.headers.Range = `bytes=${E.start}-${E.end - 1}`;
        const S = e.httpExecutor.createRequest(y, (A) => {
          A.on("error", i), os(A, i) && (A.pipe(r, {
            end: !1
          }), A.once("end", () => h(m)));
        });
        e.httpExecutor.addErrorAndTimeoutHandlers(S, i), S.end();
      }
    };
    h(t.start);
    return;
  }
  const c = e.createRequestOptions();
  c.headers.Range = o.substring(0, o.length - 2);
  const u = e.httpExecutor.createRequest(c, (h) => {
    if (!os(h, i))
      return;
    const m = (0, is.safeGetHeader)(h, "content-type"), E = /^multipart\/.+?\s*;\s*boundary=(?:"([^"]+)"|([^\s";]+))\s*$/i.exec(m);
    if (E == null) {
      i(new Error(`Content-Type "multipart/byteranges" is expected, but got "${m}"`));
      return;
    }
    const y = new Fl.DataSplitter(r, t, l, E[1] || E[2], f, n, a, e.options.onProgress);
    y.on("error", i), h.pipe(y), h.on("end", () => {
      setTimeout(() => {
        u.abort(), i(new Error("Response ends without calling any handlers"));
      }, 1e4);
    });
  });
  e.httpExecutor.addErrorAndTimeoutHandlers(u, i), u.end();
}
function os(e, t) {
  if (e.statusCode >= 400)
    return t((0, is.createHttpError)(e)), !1;
  if (e.statusCode !== 206) {
    const r = (0, is.safeGetHeader)(e, "accept-ranges");
    if (r == null || r === "none")
      return t(new Error(`Server doesn't support Accept-Ranges (response code ${e.statusCode})`)), !1;
  }
  return !0;
}
var bi = {};
Object.defineProperty(bi, "__esModule", { value: !0 });
bi.ProgressDifferentialDownloadCallbackTransform = void 0;
const $_ = Jr;
var or;
(function(e) {
  e[e.COPY = 0] = "COPY", e[e.DOWNLOAD = 1] = "DOWNLOAD";
})(or || (or = {}));
class R_ extends $_.Transform {
  constructor(t, r, n) {
    super(), this.progressDifferentialDownloadInfo = t, this.cancellationToken = r, this.onProgress = n, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.expectedBytes = 0, this.index = 0, this.operationType = or.COPY, this.nextUpdate = this.start + 1e3;
  }
  _transform(t, r, n) {
    if (this.cancellationToken.cancelled) {
      n(new Error("cancelled"), null);
      return;
    }
    if (this.operationType == or.COPY) {
      n(null, t);
      return;
    }
    this.transferred += t.length, this.delta += t.length;
    const i = Date.now();
    i >= this.nextUpdate && this.transferred !== this.expectedBytes && this.transferred !== this.progressDifferentialDownloadInfo.grandTotal && (this.nextUpdate = i + 1e3, this.onProgress({
      total: this.progressDifferentialDownloadInfo.grandTotal,
      delta: this.delta,
      transferred: this.transferred,
      percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
      bytesPerSecond: Math.round(this.transferred / ((i - this.start) / 1e3))
    }), this.delta = 0), n(null, t);
  }
  beginFileCopy() {
    this.operationType = or.COPY;
  }
  beginRangeDownload() {
    this.operationType = or.DOWNLOAD, this.expectedBytes += this.progressDifferentialDownloadInfo.expectedByteCounts[this.index++];
  }
  endRangeDownload() {
    this.transferred !== this.progressDifferentialDownloadInfo.grandTotal && this.onProgress({
      total: this.progressDifferentialDownloadInfo.grandTotal,
      delta: this.delta,
      transferred: this.transferred,
      percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
      bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
    });
  }
  // Called when we are 100% done with the connection/download
  _flush(t) {
    if (this.cancellationToken.cancelled) {
      t(new Error("cancelled"));
      return;
    }
    this.onProgress({
      total: this.progressDifferentialDownloadInfo.grandTotal,
      delta: this.delta,
      transferred: this.transferred,
      percent: 100,
      bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
    }), this.delta = 0, this.transferred = 0, t(null);
  }
}
bi.ProgressDifferentialDownloadCallbackTransform = R_;
Object.defineProperty(cn, "__esModule", { value: !0 });
cn.DifferentialDownloader = void 0;
const Or = he, lo = bt, P_ = Ue, I_ = gr, D_ = At, xn = Wt, Ll = Ai, N_ = bi;
class F_ {
  // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
  constructor(t, r, n) {
    this.blockAwareFileInfo = t, this.httpExecutor = r, this.options = n, this.fileMetadataBuffer = null, this.logger = n.logger;
  }
  createRequestOptions() {
    const t = {
      headers: {
        ...this.options.requestHeaders,
        accept: "*/*"
      }
    };
    return (0, Or.configureRequestUrl)(this.options.newUrl, t), (0, Or.configureRequestOptions)(t), t;
  }
  doDownload(t, r) {
    if (t.version !== r.version)
      throw new Error(`version is different (${t.version} - ${r.version}), full download is required`);
    const n = this.logger, i = (0, xn.computeOperations)(t, r, n);
    n.debug != null && n.debug(JSON.stringify(i, null, 2));
    let o = 0, s = 0;
    for (const l of i) {
      const f = l.end - l.start;
      l.kind === xn.OperationKind.DOWNLOAD ? o += f : s += f;
    }
    const a = this.blockAwareFileInfo.size;
    if (o + s + (this.fileMetadataBuffer == null ? 0 : this.fileMetadataBuffer.length) !== a)
      throw new Error(`Internal error, size mismatch: downloadSize: ${o}, copySize: ${s}, newSize: ${a}`);
    return n.info(`Full: ${Ul(a)}, To download: ${Ul(o)} (${Math.round(o / (a / 100))}%)`), this.downloadFile(i);
  }
  downloadFile(t) {
    const r = [], n = () => Promise.all(r.map((i) => (0, lo.close)(i.descriptor).catch((o) => {
      this.logger.error(`cannot close file "${i.path}": ${o}`);
    })));
    return this.doDownloadFile(t, r).then(n).catch((i) => n().catch((o) => {
      try {
        this.logger.error(`cannot close files: ${o}`);
      } catch (s) {
        try {
          console.error(s);
        } catch {
        }
      }
      throw i;
    }).then(() => {
      throw i;
    }));
  }
  async doDownloadFile(t, r) {
    const n = await (0, lo.open)(this.options.oldFile, "r");
    r.push({ descriptor: n, path: this.options.oldFile });
    const i = await (0, lo.open)(this.options.newFile, "w");
    r.push({ descriptor: i, path: this.options.newFile });
    const o = (0, P_.createWriteStream)(this.options.newFile, { fd: i });
    await new Promise((s, a) => {
      const l = [];
      let f;
      if (!this.options.isUseMultipleRangeRequest && this.options.onProgress) {
        const A = [];
        let T = 0;
        for (const B of t)
          B.kind === xn.OperationKind.DOWNLOAD && (A.push(B.end - B.start), T += B.end - B.start);
        const D = {
          expectedByteCounts: A,
          grandTotal: T
        };
        f = new N_.ProgressDifferentialDownloadCallbackTransform(D, this.options.cancellationToken, this.options.onProgress), l.push(f);
      }
      const c = new Or.DigestTransform(this.blockAwareFileInfo.sha512);
      c.isValidateOnEnd = !1, l.push(c), o.on("finish", () => {
        o.close(() => {
          r.splice(1, 1);
          try {
            c.validate();
          } catch (A) {
            a(A);
            return;
          }
          s(void 0);
        });
      }), l.push(o);
      let u = null;
      for (const A of l)
        A.on("error", a), u == null ? u = A : u = u.pipe(A);
      const h = l[0];
      let m;
      if (this.options.isUseMultipleRangeRequest) {
        m = (0, Ll.executeTasksUsingMultipleRangeRequests)(this, t, h, n, a), m(0);
        return;
      }
      let E = 0, y = null;
      this.logger.info(`Differential download: ${this.options.newUrl}`);
      const S = this.createRequestOptions();
      S.redirect = "manual", m = (A) => {
        var T, D;
        if (A >= t.length) {
          this.fileMetadataBuffer != null && h.write(this.fileMetadataBuffer), h.end();
          return;
        }
        const B = t[A++];
        if (B.kind === xn.OperationKind.COPY) {
          f && f.beginFileCopy(), (0, I_.copyData)(B, h, n, a, () => m(A));
          return;
        }
        const k = `bytes=${B.start}-${B.end - 1}`;
        S.headers.range = k, (D = (T = this.logger) === null || T === void 0 ? void 0 : T.debug) === null || D === void 0 || D.call(T, `download range: ${k}`), f && f.beginRangeDownload();
        const q = this.httpExecutor.createRequest(S, (V) => {
          V.on("error", a), V.on("aborted", () => {
            a(new Error("response has been aborted by the server"));
          }), V.statusCode >= 400 && a((0, Or.createHttpError)(V)), V.pipe(h, {
            end: !1
          }), V.once("end", () => {
            f && f.endRangeDownload(), ++E === 100 ? (E = 0, setTimeout(() => m(A), 1e3)) : m(A);
          });
        });
        q.on("redirect", (V, Z, L) => {
          this.logger.info(`Redirect to ${x_(L)}`), y = L, (0, Or.configureRequestUrl)(new D_.URL(y), S), q.followRedirect();
        }), this.httpExecutor.addErrorAndTimeoutHandlers(q, a), q.end();
      }, m(0);
    });
  }
  async readRemoteBytes(t, r) {
    const n = Buffer.allocUnsafe(r + 1 - t), i = this.createRequestOptions();
    i.headers.range = `bytes=${t}-${r}`;
    let o = 0;
    if (await this.request(i, (s) => {
      s.copy(n, o), o += s.length;
    }), o !== n.length)
      throw new Error(`Received data length ${o} is not equal to expected ${n.length}`);
    return n;
  }
  request(t, r) {
    return new Promise((n, i) => {
      const o = this.httpExecutor.createRequest(t, (s) => {
        (0, Ll.checkIsRangesSupported)(s, i) && (s.on("error", i), s.on("aborted", () => {
          i(new Error("response has been aborted by the server"));
        }), s.on("data", r), s.on("end", () => n()));
      });
      this.httpExecutor.addErrorAndTimeoutHandlers(o, i), o.end();
    });
  }
}
cn.DifferentialDownloader = F_;
function Ul(e, t = " KB") {
  return new Intl.NumberFormat("en").format((e / 1024).toFixed(2)) + t;
}
function x_(e) {
  const t = e.indexOf("?");
  return t < 0 ? e : e.substring(0, t);
}
Object.defineProperty(Si, "__esModule", { value: !0 });
Si.GenericDifferentialDownloader = void 0;
const L_ = cn;
class U_ extends L_.DifferentialDownloader {
  download(t, r) {
    return this.doDownload(t, r);
  }
}
Si.GenericDifferentialDownloader = U_;
var Tt = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.UpdaterSignal = e.UPDATE_DOWNLOADED = e.DOWNLOAD_PROGRESS = e.CancellationToken = void 0, e.addHandler = n;
  const t = he;
  Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
    return t.CancellationToken;
  } }), e.DOWNLOAD_PROGRESS = "download-progress", e.UPDATE_DOWNLOADED = "update-downloaded";
  class r {
    constructor(o) {
      this.emitter = o;
    }
    /**
     * Emitted when an authenticating proxy is [asking for user credentials](https://github.com/electron/electron/blob/master/docs/api/client-request.md#event-login).
     */
    login(o) {
      n(this.emitter, "login", o);
    }
    progress(o) {
      n(this.emitter, e.DOWNLOAD_PROGRESS, o);
    }
    updateDownloaded(o) {
      n(this.emitter, e.UPDATE_DOWNLOADED, o);
    }
    updateCancelled(o) {
      n(this.emitter, "update-cancelled", o);
    }
  }
  e.UpdaterSignal = r;
  function n(i, o, s) {
    i.on(o, s);
  }
})(Tt);
Object.defineProperty(yt, "__esModule", { value: !0 });
yt.NoOpLogger = yt.AppUpdater = void 0;
const Ce = he, k_ = Qr, M_ = St, B_ = ri, Ge = bt, j_ = Ee, co = ui, We = Q, Ft = Df, kl = an, q_ = gi, Ml = Nf, H_ = ln, uo = yi, fo = Nc, G_ = Si, Qt = Tt;
class Us extends B_.EventEmitter {
  /**
   * Get the update channel. Doesn't return `channel` from the update configuration, only if was previously set.
   */
  get channel() {
    return this._channel;
  }
  /**
   * Set the update channel. Overrides `channel` in the update configuration.
   *
   * `allowDowngrade` will be automatically set to `true`. If this behavior is not suitable for you, simple set `allowDowngrade` explicitly after.
   */
  set channel(t) {
    if (this._channel != null) {
      if (typeof t != "string")
        throw (0, Ce.newError)(`Channel must be a string, but got: ${t}`, "ERR_UPDATER_INVALID_CHANNEL");
      if (t.length === 0)
        throw (0, Ce.newError)("Channel must be not an empty string", "ERR_UPDATER_INVALID_CHANNEL");
    }
    this._channel = t, this.allowDowngrade = !0;
  }
  /**
   *  Shortcut for explicitly adding auth tokens to request headers
   */
  addAuthHeader(t) {
    this.requestHeaders = Object.assign({}, this.requestHeaders, {
      authorization: t
    });
  }
  // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
  get netSession() {
    return (0, Ml.getNetSession)();
  }
  /**
   * The logger. You can pass [electron-log](https://github.com/megahertz/electron-log), [winston](https://github.com/winstonjs/winston) or another logger with the following interface: `{ info(), warn(), error() }`.
   * Set it to `null` if you would like to disable a logging feature.
   */
  get logger() {
    return this._logger;
  }
  set logger(t) {
    this._logger = t ?? new qf();
  }
  // noinspection JSUnusedGlobalSymbols
  /**
   * test only
   * @private
   */
  set updateConfigPath(t) {
    this.clientPromise = null, this._appUpdateConfigPath = t, this.configOnDisk = new co.Lazy(() => this.loadUpdateConfig());
  }
  /**
   * Allows developer to override default logic for determining if an update is supported.
   * The default logic compares the `UpdateInfo` minimum system version against the `os.release()` with `semver` package
   */
  get isUpdateSupported() {
    return this._isUpdateSupported;
  }
  set isUpdateSupported(t) {
    t && (this._isUpdateSupported = t);
  }
  /**
   * Allows developer to override default logic for determining if the user is below the rollout threshold.
   * The default logic compares the staging percentage with numerical representation of user ID.
   * An override can define custom logic, or bypass it if needed.
   */
  get isUserWithinRollout() {
    return this._isUserWithinRollout;
  }
  set isUserWithinRollout(t) {
    t && (this._isUserWithinRollout = t);
  }
  constructor(t, r) {
    super(), this.autoDownload = !0, this.autoInstallOnAppQuit = !0, this.autoRunAppAfterInstall = !0, this.allowPrerelease = !1, this.fullChangelog = !1, this.allowDowngrade = !1, this.disableWebInstaller = !1, this.disableDifferentialDownload = !1, this.forceDevUpdateConfig = !1, this.previousBlockmapBaseUrlOverride = null, this._channel = null, this.downloadedUpdateHelper = null, this.requestHeaders = null, this._logger = console, this.signals = new Qt.UpdaterSignal(this), this._appUpdateConfigPath = null, this._isUpdateSupported = (o) => this.checkIfUpdateSupported(o), this._isUserWithinRollout = (o) => this.isStagingMatch(o), this.clientPromise = null, this.stagingUserIdPromise = new co.Lazy(() => this.getOrCreateStagingUserId()), this.configOnDisk = new co.Lazy(() => this.loadUpdateConfig()), this.checkForUpdatesPromise = null, this.downloadPromise = null, this.updateInfoAndProvider = null, this._testOnlyOptions = null, this.on("error", (o) => {
      this._logger.error(`Error: ${o.stack || o.message}`);
    }), r == null ? (this.app = new q_.ElectronAppAdapter(), this.httpExecutor = new Ml.ElectronHttpExecutor((o, s) => this.emit("login", o, s))) : (this.app = r, this.httpExecutor = null);
    const n = this.app.version, i = (0, Ft.parse)(n);
    if (i == null)
      throw (0, Ce.newError)(`App version is not a valid semver version: "${n}"`, "ERR_UPDATER_INVALID_VERSION");
    this.currentVersion = i, this.allowPrerelease = W_(i), t != null && (this.setFeedURL(t), typeof t != "string" && t.requestHeaders && (this.requestHeaders = t.requestHeaders));
  }
  //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
  getFeedURL() {
    return "Deprecated. Do not use it.";
  }
  /**
   * Configure update provider. If value is `string`, [GenericServerOptions](./publish.md#genericserveroptions) will be set with value as `url`.
   * @param options If you want to override configuration in the `app-update.yml`.
   */
  setFeedURL(t) {
    const r = this.createProviderRuntimeOptions();
    let n;
    typeof t == "string" ? n = new H_.GenericProvider({ provider: "generic", url: t }, this, {
      ...r,
      isUseMultipleRangeRequest: (0, uo.isUrlProbablySupportMultiRangeRequests)(t)
    }) : n = (0, uo.createClient)(t, this, r), this.clientPromise = Promise.resolve(n);
  }
  /**
   * Asks the server whether there is an update.
   * @returns null if the updater is disabled, otherwise info about the latest version
   */
  checkForUpdates() {
    if (!this.isUpdaterActive())
      return Promise.resolve(null);
    let t = this.checkForUpdatesPromise;
    if (t != null)
      return this._logger.info("Checking for update (already in progress)"), t;
    const r = () => this.checkForUpdatesPromise = null;
    return this._logger.info("Checking for update"), t = this.doCheckForUpdates().then((n) => (r(), n)).catch((n) => {
      throw r(), this.emit("error", n, `Cannot check for updates: ${(n.stack || n).toString()}`), n;
    }), this.checkForUpdatesPromise = t, t;
  }
  isUpdaterActive() {
    return this.app.isPackaged || this.forceDevUpdateConfig ? !0 : (this._logger.info("Skip checkForUpdates because application is not packed and dev update config is not forced"), !1);
  }
  // noinspection JSUnusedGlobalSymbols
  checkForUpdatesAndNotify(t) {
    return this.checkForUpdates().then((r) => r != null && r.downloadPromise ? (r.downloadPromise.then(() => {
      const n = Us.formatDownloadNotification(r.updateInfo.version, this.app.name, t);
      new gt.Notification(n).show();
    }), r) : (this._logger.debug != null && this._logger.debug("checkForUpdatesAndNotify called, downloadPromise is null"), r));
  }
  static formatDownloadNotification(t, r, n) {
    return n == null && (n = {
      title: "A new update is ready to install",
      body: "{appName} version {version} has been downloaded and will be automatically installed on exit"
    }), n = {
      title: n.title.replace("{appName}", r).replace("{version}", t),
      body: n.body.replace("{appName}", r).replace("{version}", t)
    }, n;
  }
  async isStagingMatch(t) {
    const r = t.stagingPercentage;
    let n = r;
    if (n == null)
      return !0;
    if (n = parseInt(n, 10), isNaN(n))
      return this._logger.warn(`Staging percentage is NaN: ${r}`), !0;
    n = n / 100;
    const i = await this.stagingUserIdPromise.value, s = Ce.UUID.parse(i).readUInt32BE(12) / 4294967295;
    return this._logger.info(`Staging percentage: ${n}, percentage: ${s}, user id: ${i}`), s < n;
  }
  computeFinalHeaders(t) {
    return this.requestHeaders != null && Object.assign(t, this.requestHeaders), t;
  }
  async isUpdateAvailable(t) {
    const r = (0, Ft.parse)(t.version);
    if (r == null)
      throw (0, Ce.newError)(`This file could not be downloaded, or the latest version (from update server) does not have a valid semver version: "${t.version}"`, "ERR_UPDATER_INVALID_VERSION");
    const n = this.currentVersion;
    if ((0, Ft.eq)(r, n) || !await Promise.resolve(this.isUpdateSupported(t)) || !await Promise.resolve(this.isUserWithinRollout(t)))
      return !1;
    const o = (0, Ft.gt)(r, n), s = (0, Ft.lt)(r, n);
    return o ? !0 : this.allowDowngrade && s;
  }
  checkIfUpdateSupported(t) {
    const r = t == null ? void 0 : t.minimumSystemVersion, n = (0, M_.release)();
    if (r)
      try {
        if ((0, Ft.lt)(n, r))
          return this._logger.info(`Current OS version ${n} is less than the minimum OS version required ${r} for version ${n}`), !1;
      } catch (i) {
        this._logger.warn(`Failed to compare current OS version(${n}) with minimum OS version(${r}): ${(i.message || i).toString()}`);
      }
    return !0;
  }
  async getUpdateInfoAndProvider() {
    await this.app.whenReady(), this.clientPromise == null && (this.clientPromise = this.configOnDisk.value.then((n) => (0, uo.createClient)(n, this, this.createProviderRuntimeOptions())));
    const t = await this.clientPromise, r = await this.stagingUserIdPromise.value;
    return t.setRequestHeaders(this.computeFinalHeaders({ "x-user-staging-id": r })), {
      info: await t.getLatestVersion(),
      provider: t
    };
  }
  createProviderRuntimeOptions() {
    return {
      isUseMultipleRangeRequest: !0,
      platform: this._testOnlyOptions == null ? process.platform : this._testOnlyOptions.platform,
      executor: this.httpExecutor
    };
  }
  async doCheckForUpdates() {
    this.emit("checking-for-update");
    const t = await this.getUpdateInfoAndProvider(), r = t.info;
    if (!await this.isUpdateAvailable(r))
      return this._logger.info(`Update for version ${this.currentVersion.format()} is not available (latest version: ${r.version}, downgrade is ${this.allowDowngrade ? "allowed" : "disallowed"}).`), this.emit("update-not-available", r), {
        isUpdateAvailable: !1,
        versionInfo: r,
        updateInfo: r
      };
    this.updateInfoAndProvider = t, this.onUpdateAvailable(r);
    const n = new Ce.CancellationToken();
    return {
      isUpdateAvailable: !0,
      versionInfo: r,
      updateInfo: r,
      cancellationToken: n,
      downloadPromise: this.autoDownload ? this.downloadUpdate(n) : null
    };
  }
  onUpdateAvailable(t) {
    this._logger.info(`Found version ${t.version} (url: ${(0, Ce.asArray)(t.files).map((r) => r.url).join(", ")})`), this.emit("update-available", t);
  }
  /**
   * Start downloading update manually. You can use this method if `autoDownload` option is set to `false`.
   * @returns {Promise<Array<string>>} Paths to downloaded files.
   */
  downloadUpdate(t = new Ce.CancellationToken()) {
    const r = this.updateInfoAndProvider;
    if (r == null) {
      const i = new Error("Please check update first");
      return this.dispatchError(i), Promise.reject(i);
    }
    if (this.downloadPromise != null)
      return this._logger.info("Downloading update (already in progress)"), this.downloadPromise;
    this._logger.info(`Downloading update from ${(0, Ce.asArray)(r.info.files).map((i) => i.url).join(", ")}`);
    const n = (i) => {
      if (!(i instanceof Ce.CancellationError))
        try {
          this.dispatchError(i);
        } catch (o) {
          this._logger.warn(`Cannot dispatch error event: ${o.stack || o}`);
        }
      return i;
    };
    return this.downloadPromise = this.doDownloadUpdate({
      updateInfoAndProvider: r,
      requestHeaders: this.computeRequestHeaders(r.provider),
      cancellationToken: t,
      disableWebInstaller: this.disableWebInstaller,
      disableDifferentialDownload: this.disableDifferentialDownload
    }).catch((i) => {
      throw n(i);
    }).finally(() => {
      this.downloadPromise = null;
    }), this.downloadPromise;
  }
  dispatchError(t) {
    this.emit("error", t, (t.stack || t).toString());
  }
  dispatchUpdateDownloaded(t) {
    this.emit(Qt.UPDATE_DOWNLOADED, t);
  }
  async loadUpdateConfig() {
    return this._appUpdateConfigPath == null && (this._appUpdateConfigPath = this.app.appUpdateConfigPath), (0, j_.load)(await (0, Ge.readFile)(this._appUpdateConfigPath, "utf-8"));
  }
  computeRequestHeaders(t) {
    const r = t.fileExtraDownloadHeaders;
    if (r != null) {
      const n = this.requestHeaders;
      return n == null ? r : {
        ...r,
        ...n
      };
    }
    return this.computeFinalHeaders({ accept: "*/*" });
  }
  async getOrCreateStagingUserId() {
    const t = We.join(this.app.userDataPath, ".updaterId");
    try {
      const n = await (0, Ge.readFile)(t, "utf-8");
      if (Ce.UUID.check(n))
        return n;
      this._logger.warn(`Staging user id file exists, but content was invalid: ${n}`);
    } catch (n) {
      n.code !== "ENOENT" && this._logger.warn(`Couldn't read staging user ID, creating a blank one: ${n}`);
    }
    const r = Ce.UUID.v5((0, k_.randomBytes)(4096), Ce.UUID.OID);
    this._logger.info(`Generated new staging user ID: ${r}`);
    try {
      await (0, Ge.outputFile)(t, r);
    } catch (n) {
      this._logger.warn(`Couldn't write out staging user ID: ${n}`);
    }
    return r;
  }
  /** @internal */
  get isAddNoCacheQuery() {
    const t = this.requestHeaders;
    if (t == null)
      return !0;
    for (const r of Object.keys(t)) {
      const n = r.toLowerCase();
      if (n === "authorization" || n === "private-token")
        return !1;
    }
    return !0;
  }
  async getOrCreateDownloadHelper() {
    let t = this.downloadedUpdateHelper;
    if (t == null) {
      const r = (await this.configOnDisk.value).updaterCacheDirName, n = this._logger;
      r == null && n.error("updaterCacheDirName is not specified in app-update.yml Was app build using at least electron-builder 20.34.0?");
      const i = We.join(this.app.baseCachePath, r || this.app.name);
      n.debug != null && n.debug(`updater cache dir: ${i}`), t = new kl.DownloadedUpdateHelper(i), this.downloadedUpdateHelper = t;
    }
    return t;
  }
  async executeDownload(t) {
    const r = t.fileInfo, n = {
      headers: t.downloadUpdateOptions.requestHeaders,
      cancellationToken: t.downloadUpdateOptions.cancellationToken,
      sha2: r.info.sha2,
      sha512: r.info.sha512
    };
    this.listenerCount(Qt.DOWNLOAD_PROGRESS) > 0 && (n.onProgress = (T) => this.emit(Qt.DOWNLOAD_PROGRESS, T));
    const i = t.downloadUpdateOptions.updateInfoAndProvider.info, o = i.version, s = r.packageInfo;
    function a() {
      const T = decodeURIComponent(t.fileInfo.url.pathname);
      return T.toLowerCase().endsWith(`.${t.fileExtension.toLowerCase()}`) ? We.basename(T) : t.fileInfo.info.url;
    }
    const l = await this.getOrCreateDownloadHelper(), f = l.cacheDirForPendingUpdate;
    await (0, Ge.mkdir)(f, { recursive: !0 });
    const c = a();
    let u = We.join(f, c);
    const h = s == null ? null : We.join(f, `package-${o}${We.extname(s.path) || ".7z"}`), m = async (T) => {
      await l.setDownloadedFile(u, h, i, r, c, T), await t.done({
        ...i,
        downloadedFile: u
      });
      const D = We.join(f, "current.blockmap");
      return await (0, Ge.pathExists)(D) && await (0, Ge.copyFile)(D, We.join(l.cacheDir, "current.blockmap")), h == null ? [u] : [u, h];
    }, E = this._logger, y = await l.validateDownloadedPath(u, i, r, E);
    if (y != null)
      return u = y, await m(!1);
    const S = async () => (await l.clear().catch(() => {
    }), await (0, Ge.unlink)(u).catch(() => {
    })), A = await (0, kl.createTempUpdateFile)(`temp-${c}`, f, E);
    try {
      await t.task(A, n, h, S), await (0, Ce.retry)(() => (0, Ge.rename)(A, u), {
        retries: 60,
        interval: 500,
        shouldRetry: (T) => T instanceof Error && /^EBUSY:/.test(T.message) ? !0 : (E.warn(`Cannot rename temp file to final file: ${T.message || T.stack}`), !1)
      });
    } catch (T) {
      throw await S(), T instanceof Ce.CancellationError && (E.info("cancelled"), this.emit("update-cancelled", i)), T;
    }
    return E.info(`New version ${o} has been downloaded to ${u}`), await m(!0);
  }
  async differentialDownloadInstaller(t, r, n, i, o) {
    try {
      if (this._testOnlyOptions != null && !this._testOnlyOptions.isUseDifferentialDownload)
        return !0;
      const s = r.updateInfoAndProvider.provider, a = await s.getBlockMapFiles(t.url, this.app.version, r.updateInfoAndProvider.info.version, this.previousBlockmapBaseUrlOverride);
      this._logger.info(`Download block maps (old: "${a[0]}", new: ${a[1]})`);
      const l = async (E) => {
        const y = await this.httpExecutor.downloadToBuffer(E, {
          headers: r.requestHeaders,
          cancellationToken: r.cancellationToken
        });
        if (y == null || y.length === 0)
          throw new Error(`Blockmap "${E.href}" is empty`);
        try {
          return JSON.parse((0, fo.gunzipSync)(y).toString());
        } catch (S) {
          throw new Error(`Cannot parse blockmap "${E.href}", error: ${S}`);
        }
      }, f = {
        newUrl: t.url,
        oldFile: We.join(this.downloadedUpdateHelper.cacheDir, o),
        logger: this._logger,
        newFile: n,
        isUseMultipleRangeRequest: s.isUseMultipleRangeRequest,
        requestHeaders: r.requestHeaders,
        cancellationToken: r.cancellationToken
      };
      this.listenerCount(Qt.DOWNLOAD_PROGRESS) > 0 && (f.onProgress = (E) => this.emit(Qt.DOWNLOAD_PROGRESS, E));
      const c = async (E, y) => {
        const S = We.join(y, "current.blockmap");
        await (0, Ge.outputFile)(S, (0, fo.gzipSync)(JSON.stringify(E)));
      }, u = async (E) => {
        const y = We.join(E, "current.blockmap");
        try {
          if (await (0, Ge.pathExists)(y))
            return JSON.parse((0, fo.gunzipSync)(await (0, Ge.readFile)(y)).toString());
        } catch (S) {
          this._logger.warn(`Cannot parse blockmap "${y}", error: ${S}`);
        }
        return null;
      }, h = await l(a[1]);
      await c(h, this.downloadedUpdateHelper.cacheDirForPendingUpdate);
      let m = await u(this.downloadedUpdateHelper.cacheDir);
      return m == null && (m = await l(a[0])), await new G_.GenericDifferentialDownloader(t.info, this.httpExecutor, f).download(m, h), !1;
    } catch (s) {
      if (this._logger.error(`Cannot download differentially, fallback to full download: ${s.stack || s}`), this._testOnlyOptions != null)
        throw s;
      return !0;
    }
  }
}
yt.AppUpdater = Us;
function W_(e) {
  const t = (0, Ft.prerelease)(e);
  return t != null && t.length > 0;
}
class qf {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  info(t) {
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  warn(t) {
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error(t) {
  }
}
yt.NoOpLogger = qf;
Object.defineProperty(Gt, "__esModule", { value: !0 });
Gt.BaseUpdater = void 0;
const Bl = Kr, V_ = yt;
class z_ extends V_.AppUpdater {
  constructor(t, r) {
    super(t, r), this.quitAndInstallCalled = !1, this.quitHandlerAdded = !1;
  }
  quitAndInstall(t = !1, r = !1) {
    this._logger.info("Install on explicit quitAndInstall"), this.install(t, t ? r : this.autoRunAppAfterInstall) ? setImmediate(() => {
      gt.autoUpdater.emit("before-quit-for-update"), this.app.quit();
    }) : this.quitAndInstallCalled = !1;
  }
  executeDownload(t) {
    return super.executeDownload({
      ...t,
      done: (r) => (this.dispatchUpdateDownloaded(r), this.addQuitHandler(), Promise.resolve())
    });
  }
  get installerPath() {
    return this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.file;
  }
  // must be sync (because quit even handler is not async)
  install(t = !1, r = !1) {
    if (this.quitAndInstallCalled)
      return this._logger.warn("install call ignored: quitAndInstallCalled is set to true"), !1;
    const n = this.downloadedUpdateHelper, i = this.installerPath, o = n == null ? null : n.downloadedFileInfo;
    if (i == null || o == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    this.quitAndInstallCalled = !0;
    try {
      return this._logger.info(`Install: isSilent: ${t}, isForceRunAfter: ${r}`), this.doInstall({
        isSilent: t,
        isForceRunAfter: r,
        isAdminRightsRequired: o.isAdminRightsRequired
      });
    } catch (s) {
      return this.dispatchError(s), !1;
    }
  }
  addQuitHandler() {
    this.quitHandlerAdded || !this.autoInstallOnAppQuit || (this.quitHandlerAdded = !0, this.app.onQuit((t) => {
      if (this.quitAndInstallCalled) {
        this._logger.info("Update installer has already been triggered. Quitting application.");
        return;
      }
      if (!this.autoInstallOnAppQuit) {
        this._logger.info("Update will not be installed on quit because autoInstallOnAppQuit is set to false.");
        return;
      }
      if (t !== 0) {
        this._logger.info(`Update will be not installed on quit because application is quitting with exit code ${t}`);
        return;
      }
      this._logger.info("Auto install update on quit"), this.install(!0, !1);
    }));
  }
  spawnSyncLog(t, r = [], n = {}) {
    this._logger.info(`Executing: ${t} with args: ${r}`);
    const i = (0, Bl.spawnSync)(t, r, {
      env: { ...process.env, ...n },
      encoding: "utf-8",
      shell: !0
    }), { error: o, status: s, stdout: a, stderr: l } = i;
    if (o != null)
      throw this._logger.error(l), o;
    if (s != null && s !== 0)
      throw this._logger.error(l), new Error(`Command ${t} exited with code ${s}`);
    return a.trim();
  }
  /**
   * This handles both node 8 and node 10 way of emitting error when spawning a process
   *   - node 8: Throws the error
   *   - node 10: Emit the error(Need to listen with on)
   */
  // https://github.com/electron-userland/electron-builder/issues/1129
  // Node 8 sends errors: https://nodejs.org/dist/latest-v8.x/docs/api/errors.html#errors_common_system_errors
  async spawnLog(t, r = [], n = void 0, i = "ignore") {
    return this._logger.info(`Executing: ${t} with args: ${r}`), new Promise((o, s) => {
      try {
        const a = { stdio: i, env: n, detached: !0 }, l = (0, Bl.spawn)(t, r, a);
        l.on("error", (f) => {
          s(f);
        }), l.unref(), l.pid !== void 0 && o(!0);
      } catch (a) {
        s(a);
      }
    });
  }
}
Gt.BaseUpdater = z_;
var Gr = {}, un = {};
Object.defineProperty(un, "__esModule", { value: !0 });
un.FileWithEmbeddedBlockMapDifferentialDownloader = void 0;
const Zt = bt, Y_ = cn, X_ = Nc;
class J_ extends Y_.DifferentialDownloader {
  async download() {
    const t = this.blockAwareFileInfo, r = t.size, n = r - (t.blockMapSize + 4);
    this.fileMetadataBuffer = await this.readRemoteBytes(n, r - 1);
    const i = Hf(this.fileMetadataBuffer.slice(0, this.fileMetadataBuffer.length - 4));
    await this.doDownload(await K_(this.options.oldFile), i);
  }
}
un.FileWithEmbeddedBlockMapDifferentialDownloader = J_;
function Hf(e) {
  return JSON.parse((0, X_.inflateRawSync)(e).toString());
}
async function K_(e) {
  const t = await (0, Zt.open)(e, "r");
  try {
    const r = (await (0, Zt.fstat)(t)).size, n = Buffer.allocUnsafe(4);
    await (0, Zt.read)(t, n, 0, n.length, r - n.length);
    const i = Buffer.allocUnsafe(n.readUInt32BE(0));
    return await (0, Zt.read)(t, i, 0, i.length, r - n.length - i.length), await (0, Zt.close)(t), Hf(i);
  } catch (r) {
    throw await (0, Zt.close)(t), r;
  }
}
Object.defineProperty(Gr, "__esModule", { value: !0 });
Gr.AppImageUpdater = void 0;
const jl = he, ql = Kr, Q_ = bt, Z_ = Ue, $r = Q, eS = Gt, tS = un, rS = ue, Hl = Tt;
class nS extends eS.BaseUpdater {
  constructor(t, r) {
    super(t, r);
  }
  isUpdaterActive() {
    return process.env.APPIMAGE == null && !this.forceDevUpdateConfig ? (process.env.SNAP == null ? this._logger.warn("APPIMAGE env is not defined, current application is not an AppImage") : this._logger.info("SNAP env is defined, updater is disabled"), !1) : super.isUpdaterActive();
  }
  /*** @private */
  doDownloadUpdate(t) {
    const r = t.updateInfoAndProvider.provider, n = (0, rS.findFile)(r.resolveFiles(t.updateInfoAndProvider.info), "AppImage", ["rpm", "deb", "pacman"]);
    return this.executeDownload({
      fileExtension: "AppImage",
      fileInfo: n,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        const s = process.env.APPIMAGE;
        if (s == null)
          throw (0, jl.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
        (t.disableDifferentialDownload || await this.downloadDifferential(n, s, i, r, t)) && await this.httpExecutor.download(n.url, i, o), await (0, Q_.chmod)(i, 493);
      }
    });
  }
  async downloadDifferential(t, r, n, i, o) {
    try {
      const s = {
        newUrl: t.url,
        oldFile: r,
        logger: this._logger,
        newFile: n,
        isUseMultipleRangeRequest: i.isUseMultipleRangeRequest,
        requestHeaders: o.requestHeaders,
        cancellationToken: o.cancellationToken
      };
      return this.listenerCount(Hl.DOWNLOAD_PROGRESS) > 0 && (s.onProgress = (a) => this.emit(Hl.DOWNLOAD_PROGRESS, a)), await new tS.FileWithEmbeddedBlockMapDifferentialDownloader(t.info, this.httpExecutor, s).download(), !1;
    } catch (s) {
      return this._logger.error(`Cannot download differentially, fallback to full download: ${s.stack || s}`), process.platform === "linux";
    }
  }
  doInstall(t) {
    const r = process.env.APPIMAGE;
    if (r == null)
      throw (0, jl.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
    (0, Z_.unlinkSync)(r);
    let n;
    const i = $r.basename(r), o = this.installerPath;
    if (o == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    $r.basename(o) === i || !/\d+\.\d+\.\d+/.test(i) ? n = r : n = $r.join($r.dirname(r), $r.basename(o)), (0, ql.execFileSync)("mv", ["-f", o, n]), n !== r && this.emit("appimage-filename-updated", n);
    const s = {
      ...process.env,
      APPIMAGE_SILENT_INSTALL: "true"
    };
    return t.isForceRunAfter ? this.spawnLog(n, [], s) : (s.APPIMAGE_EXIT_AFTER_INSTALL = "true", (0, ql.execFileSync)(n, [], { env: s })), !0;
  }
}
Gr.AppImageUpdater = nS;
var Wr = {}, yr = {};
Object.defineProperty(yr, "__esModule", { value: !0 });
yr.LinuxUpdater = void 0;
const iS = Gt;
class oS extends iS.BaseUpdater {
  constructor(t, r) {
    super(t, r);
  }
  /**
   * Returns true if the current process is running as root.
   */
  isRunningAsRoot() {
    var t;
    return ((t = process.getuid) === null || t === void 0 ? void 0 : t.call(process)) === 0;
  }
  /**
   * Sanitizies the installer path for using with command line tools.
   */
  get installerPath() {
    var t, r;
    return (r = (t = super.installerPath) === null || t === void 0 ? void 0 : t.replace(/\\/g, "\\\\").replace(/ /g, "\\ ")) !== null && r !== void 0 ? r : null;
  }
  runCommandWithSudoIfNeeded(t) {
    if (this.isRunningAsRoot())
      return this._logger.info("Running as root, no need to use sudo"), this.spawnSyncLog(t[0], t.slice(1));
    const { name: r } = this.app, n = `"${r} would like to update"`, i = this.sudoWithArgs(n);
    this._logger.info(`Running as non-root user, using sudo to install: ${i}`);
    let o = '"';
    return (/pkexec/i.test(i[0]) || i[0] === "sudo") && (o = ""), this.spawnSyncLog(i[0], [...i.length > 1 ? i.slice(1) : [], `${o}/bin/bash`, "-c", `'${t.join(" ")}'${o}`]);
  }
  sudoWithArgs(t) {
    const r = this.determineSudoCommand(), n = [r];
    return /kdesudo/i.test(r) ? (n.push("--comment", t), n.push("-c")) : /gksudo/i.test(r) ? n.push("--message", t) : /pkexec/i.test(r) && n.push("--disable-internal-agent"), n;
  }
  hasCommand(t) {
    try {
      return this.spawnSyncLog("command", ["-v", t]), !0;
    } catch {
      return !1;
    }
  }
  determineSudoCommand() {
    const t = ["gksudo", "kdesudo", "pkexec", "beesu"];
    for (const r of t)
      if (this.hasCommand(r))
        return r;
    return "sudo";
  }
  /**
   * Detects the package manager to use based on the available commands.
   * Allows overriding the default behavior by setting the ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER environment variable.
   * If the environment variable is set, it will be used directly. (This is useful for testing each package manager logic path.)
   * Otherwise, it checks for the presence of the specified package manager commands in the order provided.
   * @param pms - An array of package manager commands to check for, in priority order.
   * @returns The detected package manager command or "unknown" if none are found.
   */
  detectPackageManager(t) {
    var r;
    const n = (r = process.env.ELECTRON_BUILDER_LINUX_PACKAGE_MANAGER) === null || r === void 0 ? void 0 : r.trim();
    if (n)
      return n;
    for (const i of t)
      if (this.hasCommand(i))
        return i;
    return this._logger.warn(`No package manager found in the list: ${t.join(", ")}. Defaulting to the first one: ${t[0]}`), t[0];
  }
}
yr.LinuxUpdater = oS;
Object.defineProperty(Wr, "__esModule", { value: !0 });
Wr.DebUpdater = void 0;
const sS = ue, Gl = Tt, aS = yr;
class ks extends aS.LinuxUpdater {
  constructor(t, r) {
    super(t, r);
  }
  /*** @private */
  doDownloadUpdate(t) {
    const r = t.updateInfoAndProvider.provider, n = (0, sS.findFile)(r.resolveFiles(t.updateInfoAndProvider.info), "deb", ["AppImage", "rpm", "pacman"]);
    return this.executeDownload({
      fileExtension: "deb",
      fileInfo: n,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        this.listenerCount(Gl.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (s) => this.emit(Gl.DOWNLOAD_PROGRESS, s)), await this.httpExecutor.download(n.url, i, o);
      }
    });
  }
  doInstall(t) {
    const r = this.installerPath;
    if (r == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    if (!this.hasCommand("dpkg") && !this.hasCommand("apt"))
      return this.dispatchError(new Error("Neither dpkg nor apt command found. Cannot install .deb package.")), !1;
    const n = ["dpkg", "apt"], i = this.detectPackageManager(n);
    try {
      ks.installWithCommandRunner(i, r, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
    } catch (o) {
      return this.dispatchError(o), !1;
    }
    return t.isForceRunAfter && this.app.relaunch(), !0;
  }
  static installWithCommandRunner(t, r, n, i) {
    var o;
    if (t === "dpkg")
      try {
        n(["dpkg", "-i", r]);
      } catch (s) {
        i.warn((o = s.message) !== null && o !== void 0 ? o : s), i.warn("dpkg installation failed, trying to fix broken dependencies with apt-get"), n(["apt-get", "install", "-f", "-y"]);
      }
    else if (t === "apt")
      i.warn("Using apt to install a local .deb. This may fail for unsigned packages unless properly configured."), n([
        "apt",
        "install",
        "-y",
        "--allow-unauthenticated",
        // needed for unsigned .debs
        "--allow-downgrades",
        // allow lower version installs
        "--allow-change-held-packages",
        r
      ]);
    else
      throw new Error(`Package manager ${t} not supported`);
  }
}
Wr.DebUpdater = ks;
var Vr = {};
Object.defineProperty(Vr, "__esModule", { value: !0 });
Vr.PacmanUpdater = void 0;
const Wl = Tt, lS = ue, cS = yr;
class Ms extends cS.LinuxUpdater {
  constructor(t, r) {
    super(t, r);
  }
  /*** @private */
  doDownloadUpdate(t) {
    const r = t.updateInfoAndProvider.provider, n = (0, lS.findFile)(r.resolveFiles(t.updateInfoAndProvider.info), "pacman", ["AppImage", "deb", "rpm"]);
    return this.executeDownload({
      fileExtension: "pacman",
      fileInfo: n,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        this.listenerCount(Wl.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (s) => this.emit(Wl.DOWNLOAD_PROGRESS, s)), await this.httpExecutor.download(n.url, i, o);
      }
    });
  }
  doInstall(t) {
    const r = this.installerPath;
    if (r == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    try {
      Ms.installWithCommandRunner(r, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
    } catch (n) {
      return this.dispatchError(n), !1;
    }
    return t.isForceRunAfter && this.app.relaunch(), !0;
  }
  static installWithCommandRunner(t, r, n) {
    var i;
    try {
      r(["pacman", "-U", "--noconfirm", t]);
    } catch (o) {
      n.warn((i = o.message) !== null && i !== void 0 ? i : o), n.warn("pacman installation failed, attempting to update package database and retry");
      try {
        r(["pacman", "-Sy", "--noconfirm"]), r(["pacman", "-U", "--noconfirm", t]);
      } catch (s) {
        throw n.error("Retry after pacman -Sy failed"), s;
      }
    }
  }
}
Vr.PacmanUpdater = Ms;
var zr = {};
Object.defineProperty(zr, "__esModule", { value: !0 });
zr.RpmUpdater = void 0;
const Vl = Tt, uS = ue, fS = yr;
class Bs extends fS.LinuxUpdater {
  constructor(t, r) {
    super(t, r);
  }
  /*** @private */
  doDownloadUpdate(t) {
    const r = t.updateInfoAndProvider.provider, n = (0, uS.findFile)(r.resolveFiles(t.updateInfoAndProvider.info), "rpm", ["AppImage", "deb", "pacman"]);
    return this.executeDownload({
      fileExtension: "rpm",
      fileInfo: n,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        this.listenerCount(Vl.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (s) => this.emit(Vl.DOWNLOAD_PROGRESS, s)), await this.httpExecutor.download(n.url, i, o);
      }
    });
  }
  doInstall(t) {
    const r = this.installerPath;
    if (r == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    const n = ["zypper", "dnf", "yum", "rpm"], i = this.detectPackageManager(n);
    try {
      Bs.installWithCommandRunner(i, r, this.runCommandWithSudoIfNeeded.bind(this), this._logger);
    } catch (o) {
      return this.dispatchError(o), !1;
    }
    return t.isForceRunAfter && this.app.relaunch(), !0;
  }
  static installWithCommandRunner(t, r, n, i) {
    if (t === "zypper")
      return n(["zypper", "--non-interactive", "--no-refresh", "install", "--allow-unsigned-rpm", "-f", r]);
    if (t === "dnf")
      return n(["dnf", "install", "--nogpgcheck", "-y", r]);
    if (t === "yum")
      return n(["yum", "install", "--nogpgcheck", "-y", r]);
    if (t === "rpm")
      return i.warn("Installing with rpm only (no dependency resolution)."), n(["rpm", "-Uvh", "--replacepkgs", "--replacefiles", "--nodeps", r]);
    throw new Error(`Package manager ${t} not supported`);
  }
}
zr.RpmUpdater = Bs;
var Yr = {};
Object.defineProperty(Yr, "__esModule", { value: !0 });
Yr.MacUpdater = void 0;
const zl = he, ho = bt, dS = Ue, Yl = Q, hS = Fc, pS = yt, mS = ue, Xl = Kr, Jl = Qr;
class gS extends pS.AppUpdater {
  constructor(t, r) {
    super(t, r), this.nativeUpdater = gt.autoUpdater, this.squirrelDownloadedUpdate = !1, this.nativeUpdater.on("error", (n) => {
      this._logger.warn(n), this.emit("error", n);
    }), this.nativeUpdater.on("update-downloaded", () => {
      this.squirrelDownloadedUpdate = !0, this.debug("nativeUpdater.update-downloaded");
    });
  }
  debug(t) {
    this._logger.debug != null && this._logger.debug(t);
  }
  closeServerIfExists() {
    this.server && (this.debug("Closing proxy server"), this.server.close((t) => {
      t && this.debug("proxy server wasn't already open, probably attempted closing again as a safety check before quit");
    }));
  }
  async doDownloadUpdate(t) {
    let r = t.updateInfoAndProvider.provider.resolveFiles(t.updateInfoAndProvider.info);
    const n = this._logger, i = "sysctl.proc_translated";
    let o = !1;
    try {
      this.debug("Checking for macOS Rosetta environment"), o = (0, Xl.execFileSync)("sysctl", [i], { encoding: "utf8" }).includes(`${i}: 1`), n.info(`Checked for macOS Rosetta environment (isRosetta=${o})`);
    } catch (u) {
      n.warn(`sysctl shell command to check for macOS Rosetta environment failed: ${u}`);
    }
    let s = !1;
    try {
      this.debug("Checking for arm64 in uname");
      const h = (0, Xl.execFileSync)("uname", ["-a"], { encoding: "utf8" }).includes("ARM");
      n.info(`Checked 'uname -a': arm64=${h}`), s = s || h;
    } catch (u) {
      n.warn(`uname shell command to check for arm64 failed: ${u}`);
    }
    s = s || process.arch === "arm64" || o;
    const a = (u) => {
      var h;
      return u.url.pathname.includes("arm64") || ((h = u.info.url) === null || h === void 0 ? void 0 : h.includes("arm64"));
    };
    s && r.some(a) ? r = r.filter((u) => s === a(u)) : r = r.filter((u) => !a(u));
    const l = (0, mS.findFile)(r, "zip", ["pkg", "dmg"]);
    if (l == null)
      throw (0, zl.newError)(`ZIP file not provided: ${(0, zl.safeStringifyJson)(r)}`, "ERR_UPDATER_ZIP_FILE_NOT_FOUND");
    const f = t.updateInfoAndProvider.provider, c = "update.zip";
    return this.executeDownload({
      fileExtension: "zip",
      fileInfo: l,
      downloadUpdateOptions: t,
      task: async (u, h) => {
        const m = Yl.join(this.downloadedUpdateHelper.cacheDir, c), E = () => (0, ho.pathExistsSync)(m) ? !t.disableDifferentialDownload : (n.info("Unable to locate previous update.zip for differential download (is this first install?), falling back to full download"), !1);
        let y = !0;
        E() && (y = await this.differentialDownloadInstaller(l, t, u, f, c)), y && await this.httpExecutor.download(l.url, u, h);
      },
      done: async (u) => {
        if (!t.disableDifferentialDownload)
          try {
            const h = Yl.join(this.downloadedUpdateHelper.cacheDir, c);
            await (0, ho.copyFile)(u.downloadedFile, h);
          } catch (h) {
            this._logger.warn(`Unable to copy file for caching for future differential downloads: ${h.message}`);
          }
        return this.updateDownloaded(l, u);
      }
    });
  }
  async updateDownloaded(t, r) {
    var n;
    const i = r.downloadedFile, o = (n = t.info.size) !== null && n !== void 0 ? n : (await (0, ho.stat)(i)).size, s = this._logger, a = `fileToProxy=${t.url.href}`;
    this.closeServerIfExists(), this.debug(`Creating proxy server for native Squirrel.Mac (${a})`), this.server = (0, hS.createServer)(), this.debug(`Proxy server for native Squirrel.Mac is created (${a})`), this.server.on("close", () => {
      s.info(`Proxy server for native Squirrel.Mac is closed (${a})`);
    });
    const l = (f) => {
      const c = f.address();
      return typeof c == "string" ? c : `http://127.0.0.1:${c == null ? void 0 : c.port}`;
    };
    return await new Promise((f, c) => {
      const u = (0, Jl.randomBytes)(64).toString("base64").replace(/\//g, "_").replace(/\+/g, "-"), h = Buffer.from(`autoupdater:${u}`, "ascii"), m = `/${(0, Jl.randomBytes)(64).toString("hex")}.zip`;
      this.server.on("request", (E, y) => {
        const S = E.url;
        if (s.info(`${S} requested`), S === "/") {
          if (!E.headers.authorization || E.headers.authorization.indexOf("Basic ") === -1) {
            y.statusCode = 401, y.statusMessage = "Invalid Authentication Credentials", y.end(), s.warn("No authenthication info");
            return;
          }
          const D = E.headers.authorization.split(" ")[1], B = Buffer.from(D, "base64").toString("ascii"), [k, q] = B.split(":");
          if (k !== "autoupdater" || q !== u) {
            y.statusCode = 401, y.statusMessage = "Invalid Authentication Credentials", y.end(), s.warn("Invalid authenthication credentials");
            return;
          }
          const V = Buffer.from(`{ "url": "${l(this.server)}${m}" }`);
          y.writeHead(200, { "Content-Type": "application/json", "Content-Length": V.length }), y.end(V);
          return;
        }
        if (!S.startsWith(m)) {
          s.warn(`${S} requested, but not supported`), y.writeHead(404), y.end();
          return;
        }
        s.info(`${m} requested by Squirrel.Mac, pipe ${i}`);
        let A = !1;
        y.on("finish", () => {
          A || (this.nativeUpdater.removeListener("error", c), f([]));
        });
        const T = (0, dS.createReadStream)(i);
        T.on("error", (D) => {
          try {
            y.end();
          } catch (B) {
            s.warn(`cannot end response: ${B}`);
          }
          A = !0, this.nativeUpdater.removeListener("error", c), c(new Error(`Cannot pipe "${i}": ${D}`));
        }), y.writeHead(200, {
          "Content-Type": "application/zip",
          "Content-Length": o
        }), T.pipe(y);
      }), this.debug(`Proxy server for native Squirrel.Mac is starting to listen (${a})`), this.server.listen(0, "127.0.0.1", () => {
        this.debug(`Proxy server for native Squirrel.Mac is listening (address=${l(this.server)}, ${a})`), this.nativeUpdater.setFeedURL({
          url: l(this.server),
          headers: {
            "Cache-Control": "no-cache",
            Authorization: `Basic ${h.toString("base64")}`
          }
        }), this.dispatchUpdateDownloaded(r), this.autoInstallOnAppQuit ? (this.nativeUpdater.once("error", c), this.nativeUpdater.checkForUpdates()) : f([]);
      });
    });
  }
  handleUpdateDownloaded() {
    this.autoRunAppAfterInstall ? this.nativeUpdater.quitAndInstall() : this.app.quit(), this.closeServerIfExists();
  }
  quitAndInstall() {
    this.squirrelDownloadedUpdate ? this.handleUpdateDownloaded() : (this.nativeUpdater.on("update-downloaded", () => this.handleUpdateDownloaded()), this.autoInstallOnAppQuit || this.nativeUpdater.checkForUpdates());
  }
}
Yr.MacUpdater = gS;
var Xr = {}, js = {};
Object.defineProperty(js, "__esModule", { value: !0 });
js.verifySignature = ES;
const Kl = he, Gf = Kr, yS = St, Ql = Q;
function Wf(e, t) {
  return ['set "PSModulePath=" & chcp 65001 >NUL & powershell.exe', ["-NoProfile", "-NonInteractive", "-InputFormat", "None", "-Command", e], {
    shell: !0,
    timeout: t
  }];
}
function ES(e, t, r) {
  return new Promise((n, i) => {
    const o = t.replace(/'/g, "''");
    r.info(`Verifying signature ${o}`), (0, Gf.execFile)(...Wf(`"Get-AuthenticodeSignature -LiteralPath '${o}' | ConvertTo-Json -Compress"`, 20 * 1e3), (s, a, l) => {
      var f;
      try {
        if (s != null || l) {
          po(r, s, l, i), n(null);
          return;
        }
        const c = vS(a);
        if (c.Status === 0) {
          try {
            const E = Ql.normalize(c.Path), y = Ql.normalize(t);
            if (r.info(`LiteralPath: ${E}. Update Path: ${y}`), E !== y) {
              po(r, new Error(`LiteralPath of ${E} is different than ${y}`), l, i), n(null);
              return;
            }
          } catch (E) {
            r.warn(`Unable to verify LiteralPath of update asset due to missing data.Path. Skipping this step of validation. Message: ${(f = E.message) !== null && f !== void 0 ? f : E.stack}`);
          }
          const h = (0, Kl.parseDn)(c.SignerCertificate.Subject);
          let m = !1;
          for (const E of e) {
            const y = (0, Kl.parseDn)(E);
            if (y.size ? m = Array.from(y.keys()).every((A) => y.get(A) === h.get(A)) : E === h.get("CN") && (r.warn(`Signature validated using only CN ${E}. Please add your full Distinguished Name (DN) to publisherNames configuration`), m = !0), m) {
              n(null);
              return;
            }
          }
        }
        const u = `publisherNames: ${e.join(" | ")}, raw info: ` + JSON.stringify(c, (h, m) => h === "RawData" ? void 0 : m, 2);
        r.warn(`Sign verification failed, installer signed with incorrect certificate: ${u}`), n(u);
      } catch (c) {
        po(r, c, null, i), n(null);
        return;
      }
    });
  });
}
function vS(e) {
  const t = JSON.parse(e);
  delete t.PrivateKey, delete t.IsOSBinary, delete t.SignatureType;
  const r = t.SignerCertificate;
  return r != null && (delete r.Archived, delete r.Extensions, delete r.Handle, delete r.HasPrivateKey, delete r.SubjectName), t;
}
function po(e, t, r, n) {
  if (wS()) {
    e.warn(`Cannot execute Get-AuthenticodeSignature: ${t || r}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
    return;
  }
  try {
    (0, Gf.execFileSync)(...Wf("ConvertTo-Json test", 10 * 1e3));
  } catch (i) {
    e.warn(`Cannot execute ConvertTo-Json: ${i.message}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
    return;
  }
  t != null && n(t), r && n(new Error(`Cannot execute Get-AuthenticodeSignature, stderr: ${r}. Failing signature validation due to unknown stderr.`));
}
function wS() {
  const e = yS.release();
  return e.startsWith("6.") && !e.startsWith("6.3");
}
Object.defineProperty(Xr, "__esModule", { value: !0 });
Xr.NsisUpdater = void 0;
const Ln = he, Zl = Q, _S = Gt, SS = un, ec = Tt, AS = ue, bS = bt, TS = js, tc = At;
class CS extends _S.BaseUpdater {
  constructor(t, r) {
    super(t, r), this._verifyUpdateCodeSignature = (n, i) => (0, TS.verifySignature)(n, i, this._logger);
  }
  /**
   * The verifyUpdateCodeSignature. You can pass [win-verify-signature](https://github.com/beyondkmp/win-verify-trust) or another custom verify function: ` (publisherName: string[], path: string) => Promise<string | null>`.
   * The default verify function uses [windowsExecutableCodeSignatureVerifier](https://github.com/electron-userland/electron-builder/blob/master/packages/electron-updater/src/windowsExecutableCodeSignatureVerifier.ts)
   */
  get verifyUpdateCodeSignature() {
    return this._verifyUpdateCodeSignature;
  }
  set verifyUpdateCodeSignature(t) {
    t && (this._verifyUpdateCodeSignature = t);
  }
  /*** @private */
  doDownloadUpdate(t) {
    const r = t.updateInfoAndProvider.provider, n = (0, AS.findFile)(r.resolveFiles(t.updateInfoAndProvider.info), "exe");
    return this.executeDownload({
      fileExtension: "exe",
      downloadUpdateOptions: t,
      fileInfo: n,
      task: async (i, o, s, a) => {
        const l = n.packageInfo, f = l != null && s != null;
        if (f && t.disableWebInstaller)
          throw (0, Ln.newError)(`Unable to download new version ${t.updateInfoAndProvider.info.version}. Web Installers are disabled`, "ERR_UPDATER_WEB_INSTALLER_DISABLED");
        !f && !t.disableWebInstaller && this._logger.warn("disableWebInstaller is set to false, you should set it to true if you do not plan on using a web installer. This will default to true in a future version."), (f || t.disableDifferentialDownload || await this.differentialDownloadInstaller(n, t, i, r, Ln.CURRENT_APP_INSTALLER_FILE_NAME)) && await this.httpExecutor.download(n.url, i, o);
        const c = await this.verifySignature(i);
        if (c != null)
          throw await a(), (0, Ln.newError)(`New version ${t.updateInfoAndProvider.info.version} is not signed by the application owner: ${c}`, "ERR_UPDATER_INVALID_SIGNATURE");
        if (f && await this.differentialDownloadWebPackage(t, l, s, r))
          try {
            await this.httpExecutor.download(new tc.URL(l.path), s, {
              headers: t.requestHeaders,
              cancellationToken: t.cancellationToken,
              sha512: l.sha512
            });
          } catch (u) {
            try {
              await (0, bS.unlink)(s);
            } catch {
            }
            throw u;
          }
      }
    });
  }
  // $certificateInfo = (Get-AuthenticodeSignature 'xxx\yyy.exe'
  // | where {$_.Status.Equals([System.Management.Automation.SignatureStatus]::Valid) -and $_.SignerCertificate.Subject.Contains("CN=siemens.com")})
  // | Out-String ; if ($certificateInfo) { exit 0 } else { exit 1 }
  async verifySignature(t) {
    let r;
    try {
      if (r = (await this.configOnDisk.value).publisherName, r == null)
        return null;
    } catch (n) {
      if (n.code === "ENOENT")
        return null;
      throw n;
    }
    return await this._verifyUpdateCodeSignature(Array.isArray(r) ? r : [r], t);
  }
  doInstall(t) {
    const r = this.installerPath;
    if (r == null)
      return this.dispatchError(new Error("No update filepath provided, can't quit and install")), !1;
    const n = ["--updated"];
    t.isSilent && n.push("/S"), t.isForceRunAfter && n.push("--force-run"), this.installDirectory && n.push(`/D=${this.installDirectory}`);
    const i = this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.packageFile;
    i != null && n.push(`--package-file=${i}`);
    const o = () => {
      this.spawnLog(Zl.join(process.resourcesPath, "elevate.exe"), [r].concat(n)).catch((s) => this.dispatchError(s));
    };
    return t.isAdminRightsRequired ? (this._logger.info("isAdminRightsRequired is set to true, run installer using elevate.exe"), o(), !0) : (this.spawnLog(r, n).catch((s) => {
      const a = s.code;
      this._logger.info(`Cannot run installer: error code: ${a}, error message: "${s.message}", will be executed again using elevate if EACCES, and will try to use electron.shell.openItem if ENOENT`), a === "UNKNOWN" || a === "EACCES" ? o() : a === "ENOENT" ? gt.shell.openPath(r).catch((l) => this.dispatchError(l)) : this.dispatchError(s);
    }), !0);
  }
  async differentialDownloadWebPackage(t, r, n, i) {
    if (r.blockMapSize == null)
      return !0;
    try {
      const o = {
        newUrl: new tc.URL(r.path),
        oldFile: Zl.join(this.downloadedUpdateHelper.cacheDir, Ln.CURRENT_APP_PACKAGE_FILE_NAME),
        logger: this._logger,
        newFile: n,
        requestHeaders: this.requestHeaders,
        isUseMultipleRangeRequest: i.isUseMultipleRangeRequest,
        cancellationToken: t.cancellationToken
      };
      this.listenerCount(ec.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (s) => this.emit(ec.DOWNLOAD_PROGRESS, s)), await new SS.FileWithEmbeddedBlockMapDifferentialDownloader(r, this.httpExecutor, o).download();
    } catch (o) {
      return this._logger.error(`Cannot download differentially, fallback to full download: ${o.stack || o}`), process.platform === "win32";
    }
    return !1;
  }
}
Xr.NsisUpdater = CS;
(function(e) {
  var t = Oe && Oe.__createBinding || (Object.create ? function(S, A, T, D) {
    D === void 0 && (D = T);
    var B = Object.getOwnPropertyDescriptor(A, T);
    (!B || ("get" in B ? !A.__esModule : B.writable || B.configurable)) && (B = { enumerable: !0, get: function() {
      return A[T];
    } }), Object.defineProperty(S, D, B);
  } : function(S, A, T, D) {
    D === void 0 && (D = T), S[D] = A[T];
  }), r = Oe && Oe.__exportStar || function(S, A) {
    for (var T in S) T !== "default" && !Object.prototype.hasOwnProperty.call(A, T) && t(A, S, T);
  };
  Object.defineProperty(e, "__esModule", { value: !0 }), e.NsisUpdater = e.MacUpdater = e.RpmUpdater = e.PacmanUpdater = e.DebUpdater = e.AppImageUpdater = e.Provider = e.NoOpLogger = e.AppUpdater = e.BaseUpdater = void 0;
  const n = bt, i = Q;
  var o = Gt;
  Object.defineProperty(e, "BaseUpdater", { enumerable: !0, get: function() {
    return o.BaseUpdater;
  } });
  var s = yt;
  Object.defineProperty(e, "AppUpdater", { enumerable: !0, get: function() {
    return s.AppUpdater;
  } }), Object.defineProperty(e, "NoOpLogger", { enumerable: !0, get: function() {
    return s.NoOpLogger;
  } });
  var a = ue;
  Object.defineProperty(e, "Provider", { enumerable: !0, get: function() {
    return a.Provider;
  } });
  var l = Gr;
  Object.defineProperty(e, "AppImageUpdater", { enumerable: !0, get: function() {
    return l.AppImageUpdater;
  } });
  var f = Wr;
  Object.defineProperty(e, "DebUpdater", { enumerable: !0, get: function() {
    return f.DebUpdater;
  } });
  var c = Vr;
  Object.defineProperty(e, "PacmanUpdater", { enumerable: !0, get: function() {
    return c.PacmanUpdater;
  } });
  var u = zr;
  Object.defineProperty(e, "RpmUpdater", { enumerable: !0, get: function() {
    return u.RpmUpdater;
  } });
  var h = Yr;
  Object.defineProperty(e, "MacUpdater", { enumerable: !0, get: function() {
    return h.MacUpdater;
  } });
  var m = Xr;
  Object.defineProperty(e, "NsisUpdater", { enumerable: !0, get: function() {
    return m.NsisUpdater;
  } }), r(Tt, e);
  let E;
  function y() {
    if (process.platform === "win32")
      E = new Xr.NsisUpdater();
    else if (process.platform === "darwin")
      E = new Yr.MacUpdater();
    else {
      E = new Gr.AppImageUpdater();
      try {
        const S = i.join(process.resourcesPath, "package-type");
        if (!(0, n.existsSync)(S))
          return E;
        switch ((0, n.readFileSync)(S).toString().trim()) {
          case "deb":
            E = new Wr.DebUpdater();
            break;
          case "rpm":
            E = new zr.RpmUpdater();
            break;
          case "pacman":
            E = new Vr.PacmanUpdater();
            break;
          default:
            break;
        }
      } catch (S) {
        console.warn("Unable to detect 'package-type' for autoUpdater (rpm/deb/pacman support). If you'd like to expand support, please consider contributing to electron-builder", S.message);
      }
    }
    return E;
  }
  Object.defineProperty(e, "autoUpdater", {
    enumerable: !0,
    get: () => E || y()
  });
})(et);
var jn = { exports: {} }, mo = { exports: {} }, rc;
function Vf() {
  return rc || (rc = 1, function(e) {
    let t = {};
    try {
      t = require("electron");
    } catch {
    }
    t.ipcRenderer && r(t), e.exports = r;
    function r({ contextBridge: n, ipcRenderer: i }) {
      if (!i)
        return;
      i.on("__ELECTRON_LOG_IPC__", (s, a) => {
        window.postMessage({ cmd: "message", ...a });
      }), i.invoke("__ELECTRON_LOG__", { cmd: "getOptions" }).catch((s) => console.error(new Error(
        `electron-log isn't initialized in the main process. Please call log.initialize() before. ${s.message}`
      )));
      const o = {
        sendToMain(s) {
          try {
            i.send("__ELECTRON_LOG__", s);
          } catch (a) {
            console.error("electronLog.sendToMain ", a, "data:", s), i.send("__ELECTRON_LOG__", {
              cmd: "errorHandler",
              error: { message: a == null ? void 0 : a.message, stack: a == null ? void 0 : a.stack },
              errorName: "sendToMain"
            });
          }
        },
        log(...s) {
          o.sendToMain({ data: s, level: "info" });
        }
      };
      for (const s of ["error", "warn", "info", "verbose", "debug", "silly"])
        o[s] = (...a) => o.sendToMain({
          data: a,
          level: s
        });
      if (n && process.contextIsolated)
        try {
          n.exposeInMainWorld("__electronLog", o);
        } catch {
        }
      typeof window == "object" ? window.__electronLog = o : __electronLog = o;
    }
  }(mo)), mo.exports;
}
var go = { exports: {} }, yo, nc;
function OS() {
  if (nc) return yo;
  nc = 1, yo = e;
  function e(t) {
    return Object.defineProperties(r, {
      defaultLabel: { value: "", writable: !0 },
      labelPadding: { value: !0, writable: !0 },
      maxLabelLength: { value: 0, writable: !0 },
      labelLength: {
        get() {
          switch (typeof r.labelPadding) {
            case "boolean":
              return r.labelPadding ? r.maxLabelLength : 0;
            case "number":
              return r.labelPadding;
            default:
              return 0;
          }
        }
      }
    });
    function r(n) {
      r.maxLabelLength = Math.max(r.maxLabelLength, n.length);
      const i = {};
      for (const o of t.levels)
        i[o] = (...s) => t.logData(s, { level: o, scope: n });
      return i.log = i.info, i;
    }
  }
  return yo;
}
var Eo, ic;
function $S() {
  if (ic) return Eo;
  ic = 1;
  class e {
    constructor({ processMessage: r }) {
      this.processMessage = r, this.buffer = [], this.enabled = !1, this.begin = this.begin.bind(this), this.commit = this.commit.bind(this), this.reject = this.reject.bind(this);
    }
    addMessage(r) {
      this.buffer.push(r);
    }
    begin() {
      this.enabled = [];
    }
    commit() {
      this.enabled = !1, this.buffer.forEach((r) => this.processMessage(r)), this.buffer = [];
    }
    reject() {
      this.enabled = !1, this.buffer = [];
    }
  }
  return Eo = e, Eo;
}
var vo, oc;
function zf() {
  if (oc) return vo;
  oc = 1;
  const e = OS(), t = $S(), n = class n {
    constructor({
      allowUnknownLevel: o = !1,
      dependencies: s = {},
      errorHandler: a,
      eventLogger: l,
      initializeFn: f,
      isDev: c = !1,
      levels: u = ["error", "warn", "info", "verbose", "debug", "silly"],
      logId: h,
      transportFactories: m = {},
      variables: E
    } = {}) {
      G(this, "dependencies", {});
      G(this, "errorHandler", null);
      G(this, "eventLogger", null);
      G(this, "functions", {});
      G(this, "hooks", []);
      G(this, "isDev", !1);
      G(this, "levels", null);
      G(this, "logId", null);
      G(this, "scope", null);
      G(this, "transports", {});
      G(this, "variables", {});
      this.addLevel = this.addLevel.bind(this), this.create = this.create.bind(this), this.initialize = this.initialize.bind(this), this.logData = this.logData.bind(this), this.processMessage = this.processMessage.bind(this), this.allowUnknownLevel = o, this.buffering = new t(this), this.dependencies = s, this.initializeFn = f, this.isDev = c, this.levels = u, this.logId = h, this.scope = e(this), this.transportFactories = m, this.variables = E || {};
      for (const y of this.levels)
        this.addLevel(y, !1);
      this.log = this.info, this.functions.log = this.log, this.errorHandler = a, a == null || a.setOptions({ ...s, logFn: this.error }), this.eventLogger = l, l == null || l.setOptions({ ...s, logger: this });
      for (const [y, S] of Object.entries(m))
        this.transports[y] = S(this, s);
      n.instances[h] = this;
    }
    static getInstance({ logId: o }) {
      return this.instances[o] || this.instances.default;
    }
    addLevel(o, s = this.levels.length) {
      s !== !1 && this.levels.splice(s, 0, o), this[o] = (...a) => this.logData(a, { level: o }), this.functions[o] = this[o];
    }
    catchErrors(o) {
      return this.processMessage(
        {
          data: ["log.catchErrors is deprecated. Use log.errorHandler instead"],
          level: "warn"
        },
        { transports: ["console"] }
      ), this.errorHandler.startCatching(o);
    }
    create(o) {
      return typeof o == "string" && (o = { logId: o }), new n({
        dependencies: this.dependencies,
        errorHandler: this.errorHandler,
        initializeFn: this.initializeFn,
        isDev: this.isDev,
        transportFactories: this.transportFactories,
        variables: { ...this.variables },
        ...o
      });
    }
    compareLevels(o, s, a = this.levels) {
      const l = a.indexOf(o), f = a.indexOf(s);
      return f === -1 || l === -1 ? !0 : f <= l;
    }
    initialize(o = {}) {
      this.initializeFn({ logger: this, ...this.dependencies, ...o });
    }
    logData(o, s = {}) {
      this.buffering.enabled ? this.buffering.addMessage({ data: o, date: /* @__PURE__ */ new Date(), ...s }) : this.processMessage({ data: o, ...s });
    }
    processMessage(o, { transports: s = this.transports } = {}) {
      if (o.cmd === "errorHandler") {
        this.errorHandler.handle(o.error, {
          errorName: o.errorName,
          processType: "renderer",
          showDialog: !!o.showDialog
        });
        return;
      }
      let a = o.level;
      this.allowUnknownLevel || (a = this.levels.includes(o.level) ? o.level : "info");
      const l = {
        date: /* @__PURE__ */ new Date(),
        logId: this.logId,
        ...o,
        level: a,
        variables: {
          ...this.variables,
          ...o.variables
        }
      };
      for (const [f, c] of this.transportEntries(s))
        if (!(typeof c != "function" || c.level === !1) && this.compareLevels(c.level, o.level))
          try {
            const u = this.hooks.reduce((h, m) => h && m(h, c, f), l);
            u && c({ ...u, data: [...u.data] });
          } catch (u) {
            this.processInternalErrorFn(u);
          }
    }
    processInternalErrorFn(o) {
    }
    transportEntries(o = this.transports) {
      return (Array.isArray(o) ? o : Object.entries(o)).map((a) => {
        switch (typeof a) {
          case "string":
            return this.transports[a] ? [a, this.transports[a]] : null;
          case "function":
            return [a.name, a];
          default:
            return Array.isArray(a) ? a : null;
        }
      }).filter(Boolean);
    }
  };
  G(n, "instances", {});
  let r = n;
  return vo = r, vo;
}
var wo, sc;
function RS() {
  if (sc) return wo;
  sc = 1;
  const e = console.error;
  class t {
    constructor({ logFn: n = null } = {}) {
      G(this, "logFn", null);
      G(this, "onError", null);
      G(this, "showDialog", !1);
      G(this, "preventDefault", !0);
      this.handleError = this.handleError.bind(this), this.handleRejection = this.handleRejection.bind(this), this.startCatching = this.startCatching.bind(this), this.logFn = n;
    }
    handle(n, {
      logFn: i = this.logFn,
      errorName: o = "",
      onError: s = this.onError,
      showDialog: a = this.showDialog
    } = {}) {
      try {
        (s == null ? void 0 : s({ error: n, errorName: o, processType: "renderer" })) !== !1 && i({ error: n, errorName: o, showDialog: a });
      } catch {
        e(n);
      }
    }
    setOptions({ logFn: n, onError: i, preventDefault: o, showDialog: s }) {
      typeof n == "function" && (this.logFn = n), typeof i == "function" && (this.onError = i), typeof o == "boolean" && (this.preventDefault = o), typeof s == "boolean" && (this.showDialog = s);
    }
    startCatching({ onError: n, showDialog: i } = {}) {
      this.isActive || (this.isActive = !0, this.setOptions({ onError: n, showDialog: i }), window.addEventListener("error", (o) => {
        var s;
        this.preventDefault && ((s = o.preventDefault) == null || s.call(o)), this.handleError(o.error || o);
      }), window.addEventListener("unhandledrejection", (o) => {
        var s;
        this.preventDefault && ((s = o.preventDefault) == null || s.call(o)), this.handleRejection(o.reason || o);
      }));
    }
    handleError(n) {
      this.handle(n, { errorName: "Unhandled" });
    }
    handleRejection(n) {
      const i = n instanceof Error ? n : new Error(JSON.stringify(n));
      this.handle(i, { errorName: "Unhandled rejection" });
    }
  }
  return wo = t, wo;
}
var _o, ac;
function Vt() {
  if (ac) return _o;
  ac = 1, _o = { transform: e };
  function e({
    logger: t,
    message: r,
    transport: n,
    initialData: i = (r == null ? void 0 : r.data) || [],
    transforms: o = n == null ? void 0 : n.transforms
  }) {
    return o.reduce((s, a) => typeof a == "function" ? a({ data: s, logger: t, message: r, transport: n }) : s, i);
  }
  return _o;
}
var So, lc;
function PS() {
  if (lc) return So;
  lc = 1;
  const { transform: e } = Vt();
  So = r;
  const t = {
    error: console.error,
    warn: console.warn,
    info: console.info,
    verbose: console.info,
    debug: console.debug,
    silly: console.debug,
    log: console.log
  };
  function r(i) {
    return Object.assign(o, {
      format: "{h}:{i}:{s}.{ms}{scope} › {text}",
      transforms: [n],
      writeFn({ message: { level: s, data: a } }) {
        const l = t[s] || t.info;
        setTimeout(() => l(...a));
      }
    });
    function o(s) {
      o.writeFn({
        message: { ...s, data: e({ logger: i, message: s, transport: o }) }
      });
    }
  }
  function n({
    data: i = [],
    logger: o = {},
    message: s = {},
    transport: a = {}
  }) {
    if (typeof a.format == "function")
      return a.format({
        data: i,
        level: (s == null ? void 0 : s.level) || "info",
        logger: o,
        message: s,
        transport: a
      });
    if (typeof a.format != "string")
      return i;
    i.unshift(a.format), typeof i[1] == "string" && i[1].match(/%[1cdfiOos]/) && (i = [`${i[0]}${i[1]}`, ...i.slice(2)]);
    const l = s.date || /* @__PURE__ */ new Date();
    return i[0] = i[0].replace(/\{(\w+)}/g, (f, c) => {
      var u, h;
      switch (c) {
        case "level":
          return s.level;
        case "logId":
          return s.logId;
        case "scope": {
          const m = s.scope || ((u = o.scope) == null ? void 0 : u.defaultLabel);
          return m ? ` (${m})` : "";
        }
        case "text":
          return "";
        case "y":
          return l.getFullYear().toString(10);
        case "m":
          return (l.getMonth() + 1).toString(10).padStart(2, "0");
        case "d":
          return l.getDate().toString(10).padStart(2, "0");
        case "h":
          return l.getHours().toString(10).padStart(2, "0");
        case "i":
          return l.getMinutes().toString(10).padStart(2, "0");
        case "s":
          return l.getSeconds().toString(10).padStart(2, "0");
        case "ms":
          return l.getMilliseconds().toString(10).padStart(3, "0");
        case "iso":
          return l.toISOString();
        default:
          return ((h = s.variables) == null ? void 0 : h[c]) || f;
      }
    }).trim(), i;
  }
  return So;
}
var Ao, cc;
function IS() {
  if (cc) return Ao;
  cc = 1;
  const { transform: e } = Vt();
  Ao = r;
  const t = /* @__PURE__ */ new Set([Promise, WeakMap, WeakSet]);
  function r(o) {
    return Object.assign(s, {
      depth: 5,
      transforms: [i]
    });
    function s(a) {
      if (!window.__electronLog) {
        o.processMessage(
          {
            data: ["electron-log: logger isn't initialized in the main process"],
            level: "error"
          },
          { transports: ["console"] }
        );
        return;
      }
      try {
        const l = e({
          initialData: a,
          logger: o,
          message: a,
          transport: s
        });
        __electronLog.sendToMain(l);
      } catch (l) {
        o.transports.console({
          data: ["electronLog.transports.ipc", l, "data:", a.data],
          level: "error"
        });
      }
    }
  }
  function n(o) {
    return Object(o) !== o;
  }
  function i({
    data: o,
    depth: s,
    seen: a = /* @__PURE__ */ new WeakSet(),
    transport: l = {}
  } = {}) {
    const f = s || l.depth || 5;
    return a.has(o) ? "[Circular]" : f < 1 ? n(o) ? o : Array.isArray(o) ? "[Array]" : `[${typeof o}]` : ["function", "symbol"].includes(typeof o) ? o.toString() : n(o) ? o : t.has(o.constructor) ? `[${o.constructor.name}]` : Array.isArray(o) ? o.map((c) => i({
      data: c,
      depth: f - 1,
      seen: a
    })) : o instanceof Date ? o.toISOString() : o instanceof Error ? o.stack : o instanceof Map ? new Map(
      Array.from(o).map(([c, u]) => [
        i({ data: c, depth: f - 1, seen: a }),
        i({ data: u, depth: f - 1, seen: a })
      ])
    ) : o instanceof Set ? new Set(
      Array.from(o).map(
        (c) => i({ data: c, depth: f - 1, seen: a })
      )
    ) : (a.add(o), Object.fromEntries(
      Object.entries(o).map(
        ([c, u]) => [
          c,
          i({ data: u, depth: f - 1, seen: a })
        ]
      )
    ));
  }
  return Ao;
}
var uc;
function DS() {
  return uc || (uc = 1, function(e) {
    const t = zf(), r = RS(), n = PS(), i = IS();
    typeof process == "object" && process.type === "browser" && console.warn(
      "electron-log/renderer is loaded in the main process. It could cause unexpected behaviour."
    ), e.exports = o(), e.exports.Logger = t, e.exports.default = e.exports;
    function o() {
      const s = new t({
        allowUnknownLevel: !0,
        errorHandler: new r(),
        initializeFn: () => {
        },
        logId: "default",
        transportFactories: {
          console: n,
          ipc: i
        },
        variables: {
          processType: "renderer"
        }
      });
      return s.errorHandler.setOptions({
        logFn({ error: a, errorName: l, showDialog: f }) {
          s.transports.console({
            data: [l, a].filter(Boolean),
            level: "error"
          }), s.transports.ipc({
            cmd: "errorHandler",
            error: {
              cause: a == null ? void 0 : a.cause,
              code: a == null ? void 0 : a.code,
              name: a == null ? void 0 : a.name,
              message: a == null ? void 0 : a.message,
              stack: a == null ? void 0 : a.stack
            },
            errorName: l,
            logId: s.logId,
            showDialog: f
          });
        }
      }), typeof window == "object" && window.addEventListener("message", (a) => {
        const { cmd: l, logId: f, ...c } = a.data || {}, u = t.getInstance({ logId: f });
        l === "message" && u.processMessage(c, { transports: ["console"] });
      }), new Proxy(s, {
        get(a, l) {
          return typeof a[l] < "u" ? a[l] : (...f) => s.logData(f, { level: l });
        }
      });
    }
  }(go)), go.exports;
}
var bo, fc;
function NS() {
  if (fc) return bo;
  fc = 1;
  const e = Ue, t = Q;
  bo = {
    findAndReadPackageJson: r,
    tryReadJsonAt: n
  };
  function r() {
    return n(s()) || n(o()) || n(process.resourcesPath, "app.asar") || n(process.resourcesPath, "app") || n(process.cwd()) || { name: void 0, version: void 0 };
  }
  function n(...a) {
    if (a[0])
      try {
        const l = t.join(...a), f = i("package.json", l);
        if (!f)
          return;
        const c = JSON.parse(e.readFileSync(f, "utf8")), u = (c == null ? void 0 : c.productName) || (c == null ? void 0 : c.name);
        return !u || u.toLowerCase() === "electron" ? void 0 : u ? { name: u, version: c == null ? void 0 : c.version } : void 0;
      } catch {
        return;
      }
  }
  function i(a, l) {
    let f = l;
    for (; ; ) {
      const c = t.parse(f), u = c.root, h = c.dir;
      if (e.existsSync(t.join(f, a)))
        return t.resolve(t.join(f, a));
      if (f === u)
        return null;
      f = h;
    }
  }
  function o() {
    const a = process.argv.filter((f) => f.indexOf("--user-data-dir=") === 0);
    return a.length === 0 || typeof a[0] != "string" ? null : a[0].replace("--user-data-dir=", "");
  }
  function s() {
    var a;
    try {
      return (a = require.main) == null ? void 0 : a.filename;
    } catch {
      return;
    }
  }
  return bo;
}
var To, dc;
function Yf() {
  if (dc) return To;
  dc = 1;
  const e = Kr, t = St, r = Q, n = NS();
  class i {
    constructor() {
      G(this, "appName");
      G(this, "appPackageJson");
      G(this, "platform", process.platform);
    }
    getAppLogPath(s = this.getAppName()) {
      return this.platform === "darwin" ? r.join(this.getSystemPathHome(), "Library/Logs", s) : r.join(this.getAppUserDataPath(s), "logs");
    }
    getAppName() {
      var a;
      const s = this.appName || ((a = this.getAppPackageJson()) == null ? void 0 : a.name);
      if (!s)
        throw new Error(
          "electron-log can't determine the app name. It tried these methods:\n1. Use `electron.app.name`\n2. Use productName or name from the nearest package.json`\nYou can also set it through log.transports.file.setAppName()"
        );
      return s;
    }
    /**
     * @private
     * @returns {undefined}
     */
    getAppPackageJson() {
      return typeof this.appPackageJson != "object" && (this.appPackageJson = n.findAndReadPackageJson()), this.appPackageJson;
    }
    getAppUserDataPath(s = this.getAppName()) {
      return s ? r.join(this.getSystemPathAppData(), s) : void 0;
    }
    getAppVersion() {
      var s;
      return (s = this.getAppPackageJson()) == null ? void 0 : s.version;
    }
    getElectronLogPath() {
      return this.getAppLogPath();
    }
    getMacOsVersion() {
      const s = Number(t.release().split(".")[0]);
      return s <= 19 ? `10.${s - 4}` : s - 9;
    }
    /**
     * @protected
     * @returns {string}
     */
    getOsVersion() {
      let s = t.type().replace("_", " "), a = t.release();
      return s === "Darwin" && (s = "macOS", a = this.getMacOsVersion()), `${s} ${a}`;
    }
    /**
     * @return {PathVariables}
     */
    getPathVariables() {
      const s = this.getAppName(), a = this.getAppVersion(), l = this;
      return {
        appData: this.getSystemPathAppData(),
        appName: s,
        appVersion: a,
        get electronDefaultDir() {
          return l.getElectronLogPath();
        },
        home: this.getSystemPathHome(),
        libraryDefaultDir: this.getAppLogPath(s),
        libraryTemplate: this.getAppLogPath("{appName}"),
        temp: this.getSystemPathTemp(),
        userData: this.getAppUserDataPath(s)
      };
    }
    getSystemPathAppData() {
      const s = this.getSystemPathHome();
      switch (this.platform) {
        case "darwin":
          return r.join(s, "Library/Application Support");
        case "win32":
          return process.env.APPDATA || r.join(s, "AppData/Roaming");
        default:
          return process.env.XDG_CONFIG_HOME || r.join(s, ".config");
      }
    }
    getSystemPathHome() {
      var s;
      return ((s = t.homedir) == null ? void 0 : s.call(t)) || process.env.HOME;
    }
    getSystemPathTemp() {
      return t.tmpdir();
    }
    getVersions() {
      return {
        app: `${this.getAppName()} ${this.getAppVersion()}`,
        electron: void 0,
        os: this.getOsVersion()
      };
    }
    isDev() {
      return process.env.NODE_ENV === "development" || process.env.ELECTRON_IS_DEV === "1";
    }
    isElectron() {
      return !!process.versions.electron;
    }
    onAppEvent(s, a) {
    }
    onAppReady(s) {
      s();
    }
    onEveryWebContentsEvent(s, a) {
    }
    /**
     * Listen to async messages sent from opposite process
     * @param {string} channel
     * @param {function} listener
     */
    onIpc(s, a) {
    }
    onIpcInvoke(s, a) {
    }
    /**
     * @param {string} url
     * @param {Function} [logFunction]
     */
    openUrl(s, a = console.error) {
      const f = { darwin: "open", win32: "start", linux: "xdg-open" }[process.platform] || "xdg-open";
      e.exec(`${f} ${s}`, {}, (c) => {
        c && a(c);
      });
    }
    setAppName(s) {
      this.appName = s;
    }
    setPlatform(s) {
      this.platform = s;
    }
    setPreloadFileForSessions({
      filePath: s,
      // eslint-disable-line no-unused-vars
      includeFutureSession: a = !0,
      // eslint-disable-line no-unused-vars
      getSessions: l = () => []
      // eslint-disable-line no-unused-vars
    }) {
    }
    /**
     * Sent a message to opposite process
     * @param {string} channel
     * @param {any} message
     */
    sendIpc(s, a) {
    }
    showErrorBox(s, a) {
    }
  }
  return To = i, To;
}
var Co, hc;
function FS() {
  if (hc) return Co;
  hc = 1;
  const e = Q, t = Yf();
  class r extends t {
    /**
     * @param {object} options
     * @param {typeof Electron} [options.electron]
     */
    constructor({ electron: o } = {}) {
      super();
      /**
       * @type {typeof Electron}
       */
      G(this, "electron");
      this.electron = o;
    }
    getAppName() {
      var s, a;
      let o;
      try {
        o = this.appName || ((s = this.electron.app) == null ? void 0 : s.name) || ((a = this.electron.app) == null ? void 0 : a.getName());
      } catch {
      }
      return o || super.getAppName();
    }
    getAppUserDataPath(o) {
      return this.getPath("userData") || super.getAppUserDataPath(o);
    }
    getAppVersion() {
      var s;
      let o;
      try {
        o = (s = this.electron.app) == null ? void 0 : s.getVersion();
      } catch {
      }
      return o || super.getAppVersion();
    }
    getElectronLogPath() {
      return this.getPath("logs") || super.getElectronLogPath();
    }
    /**
     * @private
     * @param {any} name
     * @returns {string|undefined}
     */
    getPath(o) {
      var s;
      try {
        return (s = this.electron.app) == null ? void 0 : s.getPath(o);
      } catch {
        return;
      }
    }
    getVersions() {
      return {
        app: `${this.getAppName()} ${this.getAppVersion()}`,
        electron: `Electron ${process.versions.electron}`,
        os: this.getOsVersion()
      };
    }
    getSystemPathAppData() {
      return this.getPath("appData") || super.getSystemPathAppData();
    }
    isDev() {
      var o;
      return ((o = this.electron.app) == null ? void 0 : o.isPackaged) !== void 0 ? !this.electron.app.isPackaged : typeof process.execPath == "string" ? e.basename(process.execPath).toLowerCase().startsWith("electron") : super.isDev();
    }
    onAppEvent(o, s) {
      var a;
      return (a = this.electron.app) == null || a.on(o, s), () => {
        var l;
        (l = this.electron.app) == null || l.off(o, s);
      };
    }
    onAppReady(o) {
      var s, a, l;
      (s = this.electron.app) != null && s.isReady() ? o() : (a = this.electron.app) != null && a.once ? (l = this.electron.app) == null || l.once("ready", o) : o();
    }
    onEveryWebContentsEvent(o, s) {
      var l, f, c;
      return (f = (l = this.electron.webContents) == null ? void 0 : l.getAllWebContents()) == null || f.forEach((u) => {
        u.on(o, s);
      }), (c = this.electron.app) == null || c.on("web-contents-created", a), () => {
        var u, h;
        (u = this.electron.webContents) == null || u.getAllWebContents().forEach((m) => {
          m.off(o, s);
        }), (h = this.electron.app) == null || h.off("web-contents-created", a);
      };
      function a(u, h) {
        h.on(o, s);
      }
    }
    /**
     * Listen to async messages sent from opposite process
     * @param {string} channel
     * @param {function} listener
     */
    onIpc(o, s) {
      var a;
      (a = this.electron.ipcMain) == null || a.on(o, s);
    }
    onIpcInvoke(o, s) {
      var a, l;
      (l = (a = this.electron.ipcMain) == null ? void 0 : a.handle) == null || l.call(a, o, s);
    }
    /**
     * @param {string} url
     * @param {Function} [logFunction]
     */
    openUrl(o, s = console.error) {
      var a;
      (a = this.electron.shell) == null || a.openExternal(o).catch(s);
    }
    setPreloadFileForSessions({
      filePath: o,
      includeFutureSession: s = !0,
      getSessions: a = () => {
        var l;
        return [(l = this.electron.session) == null ? void 0 : l.defaultSession];
      }
    }) {
      for (const f of a().filter(Boolean))
        l(f);
      s && this.onAppEvent("session-created", (f) => {
        l(f);
      });
      function l(f) {
        typeof f.registerPreloadScript == "function" ? f.registerPreloadScript({
          filePath: o,
          id: "electron-log-preload",
          type: "frame"
        }) : f.setPreloads([...f.getPreloads(), o]);
      }
    }
    /**
     * Sent a message to opposite process
     * @param {string} channel
     * @param {any} message
     */
    sendIpc(o, s) {
      var a, l;
      (l = (a = this.electron.BrowserWindow) == null ? void 0 : a.getAllWindows()) == null || l.forEach((f) => {
        var c, u;
        ((c = f.webContents) == null ? void 0 : c.isDestroyed()) === !1 && ((u = f.webContents) == null ? void 0 : u.isCrashed()) === !1 && f.webContents.send(o, s);
      });
    }
    showErrorBox(o, s) {
      var a;
      (a = this.electron.dialog) == null || a.showErrorBox(o, s);
    }
  }
  return Co = r, Co;
}
var Oo, pc;
function xS() {
  if (pc) return Oo;
  pc = 1;
  const e = Ue, t = St, r = Q, n = Vf();
  let i = !1, o = !1;
  Oo = {
    initialize({
      externalApi: l,
      getSessions: f,
      includeFutureSession: c,
      logger: u,
      preload: h = !0,
      spyRendererConsole: m = !1
    }) {
      l.onAppReady(() => {
        try {
          h && s({
            externalApi: l,
            getSessions: f,
            includeFutureSession: c,
            logger: u,
            preloadOption: h
          }), m && a({ externalApi: l, logger: u });
        } catch (E) {
          u.warn(E);
        }
      });
    }
  };
  function s({
    externalApi: l,
    getSessions: f,
    includeFutureSession: c,
    logger: u,
    preloadOption: h
  }) {
    let m = typeof h == "string" ? h : void 0;
    if (i) {
      u.warn(new Error("log.initialize({ preload }) already called").stack);
      return;
    }
    i = !0;
    try {
      m = r.resolve(
        __dirname,
        "../renderer/electron-log-preload.js"
      );
    } catch {
    }
    if (!m || !e.existsSync(m)) {
      m = r.join(
        l.getAppUserDataPath() || t.tmpdir(),
        "electron-log-preload.js"
      );
      const E = `
      try {
        (${n.toString()})(require('electron'));
      } catch(e) {
        console.error(e);
      }
    `;
      e.writeFileSync(m, E, "utf8");
    }
    l.setPreloadFileForSessions({
      filePath: m,
      includeFutureSession: c,
      getSessions: f
    });
  }
  function a({ externalApi: l, logger: f }) {
    if (o) {
      f.warn(
        new Error("log.initialize({ spyRendererConsole }) already called").stack
      );
      return;
    }
    o = !0;
    const c = ["debug", "info", "warn", "error"];
    l.onEveryWebContentsEvent(
      "console-message",
      (u, h, m) => {
        f.processMessage({
          data: [m],
          level: c[h],
          variables: { processType: "renderer" }
        });
      }
    );
  }
  return Oo;
}
var $o, mc;
function LS() {
  if (mc) return $o;
  mc = 1;
  class e {
    constructor({
      externalApi: n,
      logFn: i = void 0,
      onError: o = void 0,
      showDialog: s = void 0
    } = {}) {
      G(this, "externalApi");
      G(this, "isActive", !1);
      G(this, "logFn");
      G(this, "onError");
      G(this, "showDialog", !0);
      this.createIssue = this.createIssue.bind(this), this.handleError = this.handleError.bind(this), this.handleRejection = this.handleRejection.bind(this), this.setOptions({ externalApi: n, logFn: i, onError: o, showDialog: s }), this.startCatching = this.startCatching.bind(this), this.stopCatching = this.stopCatching.bind(this);
    }
    handle(n, {
      logFn: i = this.logFn,
      onError: o = this.onError,
      processType: s = "browser",
      showDialog: a = this.showDialog,
      errorName: l = ""
    } = {}) {
      var f;
      n = t(n);
      try {
        if (typeof o == "function") {
          const c = ((f = this.externalApi) == null ? void 0 : f.getVersions()) || {}, u = this.createIssue;
          if (o({
            createIssue: u,
            error: n,
            errorName: l,
            processType: s,
            versions: c
          }) === !1)
            return;
        }
        l ? i(l, n) : i(n), a && !l.includes("rejection") && this.externalApi && this.externalApi.showErrorBox(
          `A JavaScript error occurred in the ${s} process`,
          n.stack
        );
      } catch {
        console.error(n);
      }
    }
    setOptions({ externalApi: n, logFn: i, onError: o, showDialog: s }) {
      typeof n == "object" && (this.externalApi = n), typeof i == "function" && (this.logFn = i), typeof o == "function" && (this.onError = o), typeof s == "boolean" && (this.showDialog = s);
    }
    startCatching({ onError: n, showDialog: i } = {}) {
      this.isActive || (this.isActive = !0, this.setOptions({ onError: n, showDialog: i }), process.on("uncaughtException", this.handleError), process.on("unhandledRejection", this.handleRejection));
    }
    stopCatching() {
      this.isActive = !1, process.removeListener("uncaughtException", this.handleError), process.removeListener("unhandledRejection", this.handleRejection);
    }
    createIssue(n, i) {
      var o;
      (o = this.externalApi) == null || o.openUrl(
        `${n}?${new URLSearchParams(i).toString()}`
      );
    }
    handleError(n) {
      this.handle(n, { errorName: "Unhandled" });
    }
    handleRejection(n) {
      const i = n instanceof Error ? n : new Error(JSON.stringify(n));
      this.handle(i, { errorName: "Unhandled rejection" });
    }
  }
  function t(r) {
    if (r instanceof Error)
      return r;
    if (r && typeof r == "object") {
      if (r.message)
        return Object.assign(new Error(r.message), r);
      try {
        return new Error(JSON.stringify(r));
      } catch (n) {
        return new Error(`Couldn't normalize error ${String(r)}: ${n}`);
      }
    }
    return new Error(`Can't normalize error ${String(r)}`);
  }
  return $o = e, $o;
}
var Ro, gc;
function US() {
  if (gc) return Ro;
  gc = 1;
  class e {
    constructor(r = {}) {
      G(this, "disposers", []);
      G(this, "format", "{eventSource}#{eventName}:");
      G(this, "formatters", {
        app: {
          "certificate-error": ({ args: r }) => this.arrayToObject(r.slice(1, 4), [
            "url",
            "error",
            "certificate"
          ]),
          "child-process-gone": ({ args: r }) => r.length === 1 ? r[0] : r,
          "render-process-gone": ({ args: [r, n] }) => n && typeof n == "object" ? { ...n, ...this.getWebContentsDetails(r) } : []
        },
        webContents: {
          "console-message": ({ args: [r, n, i, o] }) => {
            if (!(r < 3))
              return { message: n, source: `${o}:${i}` };
          },
          "did-fail-load": ({ args: r }) => this.arrayToObject(r, [
            "errorCode",
            "errorDescription",
            "validatedURL",
            "isMainFrame",
            "frameProcessId",
            "frameRoutingId"
          ]),
          "did-fail-provisional-load": ({ args: r }) => this.arrayToObject(r, [
            "errorCode",
            "errorDescription",
            "validatedURL",
            "isMainFrame",
            "frameProcessId",
            "frameRoutingId"
          ]),
          "plugin-crashed": ({ args: r }) => this.arrayToObject(r, ["name", "version"]),
          "preload-error": ({ args: r }) => this.arrayToObject(r, ["preloadPath", "error"])
        }
      });
      G(this, "events", {
        app: {
          "certificate-error": !0,
          "child-process-gone": !0,
          "render-process-gone": !0
        },
        webContents: {
          // 'console-message': true,
          "did-fail-load": !0,
          "did-fail-provisional-load": !0,
          "plugin-crashed": !0,
          "preload-error": !0,
          unresponsive: !0
        }
      });
      G(this, "externalApi");
      G(this, "level", "error");
      G(this, "scope", "");
      this.setOptions(r);
    }
    setOptions({
      events: r,
      externalApi: n,
      level: i,
      logger: o,
      format: s,
      formatters: a,
      scope: l
    }) {
      typeof r == "object" && (this.events = r), typeof n == "object" && (this.externalApi = n), typeof i == "string" && (this.level = i), typeof o == "object" && (this.logger = o), (typeof s == "string" || typeof s == "function") && (this.format = s), typeof a == "object" && (this.formatters = a), typeof l == "string" && (this.scope = l);
    }
    startLogging(r = {}) {
      this.setOptions(r), this.disposeListeners();
      for (const n of this.getEventNames(this.events.app))
        this.disposers.push(
          this.externalApi.onAppEvent(n, (...i) => {
            this.handleEvent({ eventSource: "app", eventName: n, handlerArgs: i });
          })
        );
      for (const n of this.getEventNames(this.events.webContents))
        this.disposers.push(
          this.externalApi.onEveryWebContentsEvent(
            n,
            (...i) => {
              this.handleEvent(
                { eventSource: "webContents", eventName: n, handlerArgs: i }
              );
            }
          )
        );
    }
    stopLogging() {
      this.disposeListeners();
    }
    arrayToObject(r, n) {
      const i = {};
      return n.forEach((o, s) => {
        i[o] = r[s];
      }), r.length > n.length && (i.unknownArgs = r.slice(n.length)), i;
    }
    disposeListeners() {
      this.disposers.forEach((r) => r()), this.disposers = [];
    }
    formatEventLog({ eventName: r, eventSource: n, handlerArgs: i }) {
      var u;
      const [o, ...s] = i;
      if (typeof this.format == "function")
        return this.format({ args: s, event: o, eventName: r, eventSource: n });
      const a = (u = this.formatters[n]) == null ? void 0 : u[r];
      let l = s;
      if (typeof a == "function" && (l = a({ args: s, event: o, eventName: r, eventSource: n })), !l)
        return;
      const f = {};
      return Array.isArray(l) ? f.args = l : typeof l == "object" && Object.assign(f, l), n === "webContents" && Object.assign(f, this.getWebContentsDetails(o == null ? void 0 : o.sender)), [this.format.replace("{eventSource}", n === "app" ? "App" : "WebContents").replace("{eventName}", r), f];
    }
    getEventNames(r) {
      return !r || typeof r != "object" ? [] : Object.entries(r).filter(([n, i]) => i).map(([n]) => n);
    }
    getWebContentsDetails(r) {
      if (!(r != null && r.loadURL))
        return {};
      try {
        return {
          webContents: {
            id: r.id,
            url: r.getURL()
          }
        };
      } catch {
        return {};
      }
    }
    handleEvent({ eventName: r, eventSource: n, handlerArgs: i }) {
      var s;
      const o = this.formatEventLog({ eventName: r, eventSource: n, handlerArgs: i });
      if (o) {
        const a = this.scope ? this.logger.scope(this.scope) : this.logger;
        (s = a == null ? void 0 : a[this.level]) == null || s.call(a, ...o);
      }
    }
  }
  return Ro = e, Ro;
}
var Po, yc;
function Xf() {
  if (yc) return Po;
  yc = 1;
  const { transform: e } = Vt();
  Po = {
    concatFirstStringElements: t,
    formatScope: n,
    formatText: o,
    formatVariables: i,
    timeZoneFromOffset: r,
    format({ message: s, logger: a, transport: l, data: f = s == null ? void 0 : s.data }) {
      switch (typeof l.format) {
        case "string":
          return e({
            message: s,
            logger: a,
            transforms: [i, n, o],
            transport: l,
            initialData: [l.format, ...f]
          });
        case "function":
          return l.format({
            data: f,
            level: (s == null ? void 0 : s.level) || "info",
            logger: a,
            message: s,
            transport: l
          });
        default:
          return f;
      }
    }
  };
  function t({ data: s }) {
    return typeof s[0] != "string" || typeof s[1] != "string" || s[0].match(/%[1cdfiOos]/) ? s : [`${s[0]} ${s[1]}`, ...s.slice(2)];
  }
  function r(s) {
    const a = Math.abs(s), l = s > 0 ? "-" : "+", f = Math.floor(a / 60).toString().padStart(2, "0"), c = (a % 60).toString().padStart(2, "0");
    return `${l}${f}:${c}`;
  }
  function n({ data: s, logger: a, message: l }) {
    const { defaultLabel: f, labelLength: c } = (a == null ? void 0 : a.scope) || {}, u = s[0];
    let h = l.scope;
    h || (h = f);
    let m;
    return h === "" ? m = c > 0 ? "".padEnd(c + 3) : "" : typeof h == "string" ? m = ` (${h})`.padEnd(c + 3) : m = "", s[0] = u.replace("{scope}", m), s;
  }
  function i({ data: s, message: a }) {
    let l = s[0];
    if (typeof l != "string")
      return s;
    l = l.replace("{level}]", `${a.level}]`.padEnd(6, " "));
    const f = a.date || /* @__PURE__ */ new Date();
    return s[0] = l.replace(/\{(\w+)}/g, (c, u) => {
      var h;
      switch (u) {
        case "level":
          return a.level || "info";
        case "logId":
          return a.logId;
        case "y":
          return f.getFullYear().toString(10);
        case "m":
          return (f.getMonth() + 1).toString(10).padStart(2, "0");
        case "d":
          return f.getDate().toString(10).padStart(2, "0");
        case "h":
          return f.getHours().toString(10).padStart(2, "0");
        case "i":
          return f.getMinutes().toString(10).padStart(2, "0");
        case "s":
          return f.getSeconds().toString(10).padStart(2, "0");
        case "ms":
          return f.getMilliseconds().toString(10).padStart(3, "0");
        case "z":
          return r(f.getTimezoneOffset());
        case "iso":
          return f.toISOString();
        default:
          return ((h = a.variables) == null ? void 0 : h[u]) || c;
      }
    }).trim(), s;
  }
  function o({ data: s }) {
    const a = s[0];
    if (typeof a != "string")
      return s;
    if (a.lastIndexOf("{text}") === a.length - 6)
      return s[0] = a.replace(/\s?{text}/, ""), s[0] === "" && s.shift(), s;
    const f = a.split("{text}");
    let c = [];
    return f[0] !== "" && c.push(f[0]), c = c.concat(s.slice(1)), f[1] !== "" && c.push(f[1]), c;
  }
  return Po;
}
var Io = { exports: {} }, Ec;
function Ti() {
  return Ec || (Ec = 1, function(e) {
    const t = ti;
    e.exports = {
      serialize: n,
      maxDepth({ data: i, transport: o, depth: s = (o == null ? void 0 : o.depth) ?? 6 }) {
        if (!i)
          return i;
        if (s < 1)
          return Array.isArray(i) ? "[array]" : typeof i == "object" && i ? "[object]" : i;
        if (Array.isArray(i))
          return i.map((l) => e.exports.maxDepth({
            data: l,
            depth: s - 1
          }));
        if (typeof i != "object" || i && typeof i.toISOString == "function")
          return i;
        if (i === null)
          return null;
        if (i instanceof Error)
          return i;
        const a = {};
        for (const l in i)
          Object.prototype.hasOwnProperty.call(i, l) && (a[l] = e.exports.maxDepth({
            data: i[l],
            depth: s - 1
          }));
        return a;
      },
      toJSON({ data: i }) {
        return JSON.parse(JSON.stringify(i, r()));
      },
      toString({ data: i, transport: o }) {
        const s = (o == null ? void 0 : o.inspectOptions) || {}, a = i.map((l) => {
          if (l !== void 0)
            try {
              const f = JSON.stringify(l, r(), "  ");
              return f === void 0 ? void 0 : JSON.parse(f);
            } catch {
              return l;
            }
        });
        return t.formatWithOptions(s, ...a);
      }
    };
    function r(i = {}) {
      const o = /* @__PURE__ */ new WeakSet();
      return function(s, a) {
        if (typeof a == "object" && a !== null) {
          if (o.has(a))
            return;
          o.add(a);
        }
        return n(s, a, i);
      };
    }
    function n(i, o, s = {}) {
      const a = (s == null ? void 0 : s.serializeMapAndSet) !== !1;
      return o instanceof Error ? o.stack : o && (typeof o == "function" ? `[function] ${o.toString()}` : o instanceof Date ? o.toISOString() : a && o instanceof Map && Object.fromEntries ? Object.fromEntries(o) : a && o instanceof Set && Array.from ? Array.from(o) : o);
    }
  }(Io)), Io.exports;
}
var Do, vc;
function qs() {
  if (vc) return Do;
  vc = 1, Do = {
    transformStyles: n,
    applyAnsiStyles({ data: i }) {
      return n(i, t, r);
    },
    removeStyles({ data: i }) {
      return n(i, () => "");
    }
  };
  const e = {
    unset: "\x1B[0m",
    black: "\x1B[30m",
    red: "\x1B[31m",
    green: "\x1B[32m",
    yellow: "\x1B[33m",
    blue: "\x1B[34m",
    magenta: "\x1B[35m",
    cyan: "\x1B[36m",
    white: "\x1B[37m",
    gray: "\x1B[90m"
  };
  function t(i) {
    const o = i.replace(/color:\s*(\w+).*/, "$1").toLowerCase();
    return e[o] || "";
  }
  function r(i) {
    return i + e.unset;
  }
  function n(i, o, s) {
    const a = {};
    return i.reduce((l, f, c, u) => {
      if (a[c])
        return l;
      if (typeof f == "string") {
        let h = c, m = !1;
        f = f.replace(/%[1cdfiOos]/g, (E) => {
          if (h += 1, E !== "%c")
            return E;
          const y = u[h];
          return typeof y == "string" ? (a[h] = !0, m = !0, o(y, f)) : E;
        }), m && s && (f = s(f));
      }
      return l.push(f), l;
    }, []);
  }
  return Do;
}
var No, wc;
function kS() {
  if (wc) return No;
  wc = 1;
  const {
    concatFirstStringElements: e,
    format: t
  } = Xf(), { maxDepth: r, toJSON: n } = Ti(), {
    applyAnsiStyles: i,
    removeStyles: o
  } = qs(), { transform: s } = Vt(), a = {
    error: console.error,
    warn: console.warn,
    info: console.info,
    verbose: console.info,
    debug: console.debug,
    silly: console.debug,
    log: console.log
  };
  No = c;
  const f = `%c{h}:{i}:{s}.{ms}{scope}%c ${process.platform === "win32" ? ">" : "›"} {text}`;
  Object.assign(c, {
    DEFAULT_FORMAT: f
  });
  function c(y) {
    return Object.assign(S, {
      colorMap: {
        error: "red",
        warn: "yellow",
        info: "cyan",
        verbose: "unset",
        debug: "gray",
        silly: "gray",
        default: "unset"
      },
      format: f,
      level: "silly",
      transforms: [
        u,
        t,
        m,
        e,
        r,
        n
      ],
      useStyles: process.env.FORCE_STYLES,
      writeFn({ message: A }) {
        (a[A.level] || a.info)(...A.data);
      }
    });
    function S(A) {
      const T = s({ logger: y, message: A, transport: S });
      S.writeFn({
        message: { ...A, data: T }
      });
    }
  }
  function u({ data: y, message: S, transport: A }) {
    return typeof A.format != "string" || !A.format.includes("%c") ? y : [
      `color:${E(S.level, A)}`,
      "color:unset",
      ...y
    ];
  }
  function h(y, S) {
    if (typeof y == "boolean")
      return y;
    const T = S === "error" || S === "warn" ? process.stderr : process.stdout;
    return T && T.isTTY;
  }
  function m(y) {
    const { message: S, transport: A } = y;
    return (h(A.useStyles, S.level) ? i : o)(y);
  }
  function E(y, S) {
    return S.colorMap[y] || S.colorMap.default;
  }
  return No;
}
var Fo, _c;
function Jf() {
  if (_c) return Fo;
  _c = 1;
  const e = ri, t = Ue, r = St;
  class n extends e {
    constructor({
      path: a,
      writeOptions: l = { encoding: "utf8", flag: "a", mode: 438 },
      writeAsync: f = !1
    }) {
      super();
      G(this, "asyncWriteQueue", []);
      G(this, "bytesWritten", 0);
      G(this, "hasActiveAsyncWriting", !1);
      G(this, "path", null);
      G(this, "initialSize");
      G(this, "writeOptions", null);
      G(this, "writeAsync", !1);
      this.path = a, this.writeOptions = l, this.writeAsync = f;
    }
    get size() {
      return this.getSize();
    }
    clear() {
      try {
        return t.writeFileSync(this.path, "", {
          mode: this.writeOptions.mode,
          flag: "w"
        }), this.reset(), !0;
      } catch (a) {
        return a.code === "ENOENT" ? !0 : (this.emit("error", a, this), !1);
      }
    }
    crop(a) {
      try {
        const l = i(this.path, a || 4096);
        this.clear(), this.writeLine(`[log cropped]${r.EOL}${l}`);
      } catch (l) {
        this.emit(
          "error",
          new Error(`Couldn't crop file ${this.path}. ${l.message}`),
          this
        );
      }
    }
    getSize() {
      if (this.initialSize === void 0)
        try {
          const a = t.statSync(this.path);
          this.initialSize = a.size;
        } catch {
          this.initialSize = 0;
        }
      return this.initialSize + this.bytesWritten;
    }
    increaseBytesWrittenCounter(a) {
      this.bytesWritten += Buffer.byteLength(a, this.writeOptions.encoding);
    }
    isNull() {
      return !1;
    }
    nextAsyncWrite() {
      const a = this;
      if (this.hasActiveAsyncWriting || this.asyncWriteQueue.length === 0)
        return;
      const l = this.asyncWriteQueue.join("");
      this.asyncWriteQueue = [], this.hasActiveAsyncWriting = !0, t.writeFile(this.path, l, this.writeOptions, (f) => {
        a.hasActiveAsyncWriting = !1, f ? a.emit(
          "error",
          new Error(`Couldn't write to ${a.path}. ${f.message}`),
          this
        ) : a.increaseBytesWrittenCounter(l), a.nextAsyncWrite();
      });
    }
    reset() {
      this.initialSize = void 0, this.bytesWritten = 0;
    }
    toString() {
      return this.path;
    }
    writeLine(a) {
      if (a += r.EOL, this.writeAsync) {
        this.asyncWriteQueue.push(a), this.nextAsyncWrite();
        return;
      }
      try {
        t.writeFileSync(this.path, a, this.writeOptions), this.increaseBytesWrittenCounter(a);
      } catch (l) {
        this.emit(
          "error",
          new Error(`Couldn't write to ${this.path}. ${l.message}`),
          this
        );
      }
    }
  }
  Fo = n;
  function i(o, s) {
    const a = Buffer.alloc(s), l = t.statSync(o), f = Math.min(l.size, s), c = Math.max(0, l.size - s), u = t.openSync(o, "r"), h = t.readSync(u, a, 0, f, c);
    return t.closeSync(u), a.toString("utf8", 0, h);
  }
  return Fo;
}
var xo, Sc;
function MS() {
  if (Sc) return xo;
  Sc = 1;
  const e = Jf();
  class t extends e {
    clear() {
    }
    crop() {
    }
    getSize() {
      return 0;
    }
    isNull() {
      return !0;
    }
    writeLine() {
    }
  }
  return xo = t, xo;
}
var Lo, Ac;
function BS() {
  if (Ac) return Lo;
  Ac = 1;
  const e = ri, t = Ue, r = Q, n = Jf(), i = MS();
  class o extends e {
    constructor() {
      super();
      G(this, "store", {});
      this.emitError = this.emitError.bind(this);
    }
    /**
     * Provide a File object corresponding to the filePath
     * @param {string} filePath
     * @param {WriteOptions} [writeOptions]
     * @param {boolean} [writeAsync]
     * @return {File}
     */
    provide({ filePath: l, writeOptions: f = {}, writeAsync: c = !1 }) {
      let u;
      try {
        if (l = r.resolve(l), this.store[l])
          return this.store[l];
        u = this.createFile({ filePath: l, writeOptions: f, writeAsync: c });
      } catch (h) {
        u = new i({ path: l }), this.emitError(h, u);
      }
      return u.on("error", this.emitError), this.store[l] = u, u;
    }
    /**
     * @param {string} filePath
     * @param {WriteOptions} writeOptions
     * @param {boolean} async
     * @return {File}
     * @private
     */
    createFile({ filePath: l, writeOptions: f, writeAsync: c }) {
      return this.testFileWriting({ filePath: l, writeOptions: f }), new n({ path: l, writeOptions: f, writeAsync: c });
    }
    /**
     * @param {Error} error
     * @param {File} file
     * @private
     */
    emitError(l, f) {
      this.emit("error", l, f);
    }
    /**
     * @param {string} filePath
     * @param {WriteOptions} writeOptions
     * @private
     */
    testFileWriting({ filePath: l, writeOptions: f }) {
      t.mkdirSync(r.dirname(l), { recursive: !0 }), t.writeFileSync(l, "", { flag: "a", mode: f.mode });
    }
  }
  return Lo = o, Lo;
}
var Uo, bc;
function jS() {
  if (bc) return Uo;
  bc = 1;
  const e = Ue, t = St, r = Q, n = BS(), { transform: i } = Vt(), { removeStyles: o } = qs(), {
    format: s,
    concatFirstStringElements: a
  } = Xf(), { toString: l } = Ti();
  Uo = c;
  const f = new n();
  function c(h, { registry: m = f, externalApi: E } = {}) {
    let y;
    return m.listenerCount("error") < 1 && m.on("error", (k, q) => {
      T(`Can't write to ${q}`, k);
    }), Object.assign(S, {
      fileName: u(h.variables.processType),
      format: "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}",
      getFile: D,
      inspectOptions: { depth: 5 },
      level: "silly",
      maxSize: 1024 ** 2,
      readAllLogs: B,
      sync: !0,
      transforms: [o, s, a, l],
      writeOptions: { flag: "a", mode: 438, encoding: "utf8" },
      archiveLogFn(k) {
        const q = k.toString(), V = r.parse(q);
        try {
          e.renameSync(q, r.join(V.dir, `${V.name}.old${V.ext}`));
        } catch (Z) {
          T("Could not rotate log", Z);
          const L = Math.round(S.maxSize / 4);
          k.crop(Math.min(L, 256 * 1024));
        }
      },
      resolvePathFn(k) {
        return r.join(k.libraryDefaultDir, k.fileName);
      },
      setAppName(k) {
        h.dependencies.externalApi.setAppName(k);
      }
    });
    function S(k) {
      const q = D(k);
      S.maxSize > 0 && q.size > S.maxSize && (S.archiveLogFn(q), q.reset());
      const Z = i({ logger: h, message: k, transport: S });
      q.writeLine(Z);
    }
    function A() {
      y || (y = Object.create(
        Object.prototype,
        {
          ...Object.getOwnPropertyDescriptors(
            E.getPathVariables()
          ),
          fileName: {
            get() {
              return S.fileName;
            },
            enumerable: !0
          }
        }
      ), typeof S.archiveLog == "function" && (S.archiveLogFn = S.archiveLog, T("archiveLog is deprecated. Use archiveLogFn instead")), typeof S.resolvePath == "function" && (S.resolvePathFn = S.resolvePath, T("resolvePath is deprecated. Use resolvePathFn instead")));
    }
    function T(k, q = null, V = "error") {
      const Z = [`electron-log.transports.file: ${k}`];
      q && Z.push(q), h.transports.console({ data: Z, date: /* @__PURE__ */ new Date(), level: V });
    }
    function D(k) {
      A();
      const q = S.resolvePathFn(y, k);
      return m.provide({
        filePath: q,
        writeAsync: !S.sync,
        writeOptions: S.writeOptions
      });
    }
    function B({ fileFilter: k = (q) => q.endsWith(".log") } = {}) {
      A();
      const q = r.dirname(S.resolvePathFn(y));
      return e.existsSync(q) ? e.readdirSync(q).map((V) => r.join(q, V)).filter(k).map((V) => {
        try {
          return {
            path: V,
            lines: e.readFileSync(V, "utf8").split(t.EOL)
          };
        } catch {
          return null;
        }
      }).filter(Boolean) : [];
    }
  }
  function u(h = process.type) {
    switch (h) {
      case "renderer":
        return "renderer.log";
      case "worker":
        return "worker.log";
      default:
        return "main.log";
    }
  }
  return Uo;
}
var ko, Tc;
function qS() {
  if (Tc) return ko;
  Tc = 1;
  const { maxDepth: e, toJSON: t } = Ti(), { transform: r } = Vt();
  ko = n;
  function n(i, { externalApi: o }) {
    return Object.assign(s, {
      depth: 3,
      eventId: "__ELECTRON_LOG_IPC__",
      level: i.isDev ? "silly" : !1,
      transforms: [t, e]
    }), o != null && o.isElectron() ? s : void 0;
    function s(a) {
      var l;
      ((l = a == null ? void 0 : a.variables) == null ? void 0 : l.processType) !== "renderer" && (o == null || o.sendIpc(s.eventId, {
        ...a,
        data: r({ logger: i, message: a, transport: s })
      }));
    }
  }
  return ko;
}
var Mo, Cc;
function HS() {
  if (Cc) return Mo;
  Cc = 1;
  const e = Fc, t = rh, { transform: r } = Vt(), { removeStyles: n } = qs(), { toJSON: i, maxDepth: o } = Ti();
  Mo = s;
  function s(a) {
    return Object.assign(l, {
      client: { name: "electron-application" },
      depth: 6,
      level: !1,
      requestOptions: {},
      transforms: [n, i, o],
      makeBodyFn({ message: f }) {
        return JSON.stringify({
          client: l.client,
          data: f.data,
          date: f.date.getTime(),
          level: f.level,
          scope: f.scope,
          variables: f.variables
        });
      },
      processErrorFn({ error: f }) {
        a.processMessage(
          {
            data: [`electron-log: can't POST ${l.url}`, f],
            level: "warn"
          },
          { transports: ["console", "file"] }
        );
      },
      sendRequestFn({ serverUrl: f, requestOptions: c, body: u }) {
        const m = (f.startsWith("https:") ? t : e).request(f, {
          method: "POST",
          ...c,
          headers: {
            "Content-Type": "application/json",
            "Content-Length": u.length,
            ...c.headers
          }
        });
        return m.write(u), m.end(), m;
      }
    });
    function l(f) {
      if (!l.url)
        return;
      const c = l.makeBodyFn({
        logger: a,
        message: { ...f, data: r({ logger: a, message: f, transport: l }) },
        transport: l
      }), u = l.sendRequestFn({
        serverUrl: l.url,
        requestOptions: l.requestOptions,
        body: Buffer.from(c, "utf8")
      });
      u.on("error", (h) => l.processErrorFn({
        error: h,
        logger: a,
        message: f,
        request: u,
        transport: l
      }));
    }
  }
  return Mo;
}
var Bo, Oc;
function Kf() {
  if (Oc) return Bo;
  Oc = 1;
  const e = zf(), t = LS(), r = US(), n = kS(), i = jS(), o = qS(), s = HS();
  Bo = a;
  function a({ dependencies: l, initializeFn: f }) {
    var u;
    const c = new e({
      dependencies: l,
      errorHandler: new t(),
      eventLogger: new r(),
      initializeFn: f,
      isDev: (u = l.externalApi) == null ? void 0 : u.isDev(),
      logId: "default",
      transportFactories: {
        console: n,
        file: i,
        ipc: o,
        remote: s
      },
      variables: {
        processType: "main"
      }
    });
    return c.default = c, c.Logger = e, c.processInternalErrorFn = (h) => {
      c.transports.console.writeFn({
        message: {
          data: ["Unhandled electron-log error", h],
          level: "error"
        }
      });
    }, c;
  }
  return Bo;
}
var jo, $c;
function GS() {
  if ($c) return jo;
  $c = 1;
  const e = gt, t = FS(), { initialize: r } = xS(), n = Kf(), i = new t({ electron: e }), o = n({
    dependencies: { externalApi: i },
    initializeFn: r
  });
  jo = o, i.onIpc("__ELECTRON_LOG__", (a, l) => {
    l.scope && o.Logger.getInstance(l).scope(l.scope);
    const f = new Date(l.date);
    s({
      ...l,
      date: f.getTime() ? f : /* @__PURE__ */ new Date()
    });
  }), i.onIpcInvoke("__ELECTRON_LOG__", (a, { cmd: l = "", logId: f }) => {
    switch (l) {
      case "getOptions":
        return {
          levels: o.Logger.getInstance({ logId: f }).levels,
          logId: f
        };
      default:
        return s({ data: [`Unknown cmd '${l}'`], level: "error" }), {};
    }
  });
  function s(a) {
    var l;
    (l = o.Logger.getInstance(a)) == null || l.processMessage(a);
  }
  return jo;
}
var qo, Rc;
function WS() {
  if (Rc) return qo;
  Rc = 1;
  const e = Yf(), t = Kf(), r = new e();
  return qo = t({
    dependencies: { externalApi: r }
  }), qo;
}
const VS = typeof process > "u" || process.type === "renderer" || process.type === "worker", zS = typeof process == "object" && process.type === "browser";
VS ? (Vf(), jn.exports = DS()) : zS ? jn.exports = GS() : jn.exports = WS();
var YS = jn.exports;
const Qf = /* @__PURE__ */ ih(YS), ss = ot.join(lr.getPath("userData"), "templates.json"), qn = ot.dirname(nh(import.meta.url));
process.env.APP_ROOT = ot.join(qn, "..");
const as = process.env.VITE_DEV_SERVER_URL, mA = ot.join(process.env.APP_ROOT, "dist-electron"), Zf = ot.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = as ? ot.join(process.env.APP_ROOT, "public") : Zf;
let z;
function ed() {
  z = new Pc({
    icon: ot.join(process.env.VITE_PUBLIC, "PinitIcon.ico"),
    webPreferences: {
      preload: ot.join(qn, "preload.mjs"),
      webSecurity: !1,
      allowRunningInsecureContent: !0
    },
    frame: !1,
    minHeight: 980,
    minWidth: 1600,
    height: 980,
    width: 1600,
    center: !0,
    show: !0,
    // mostrá directo
    backgroundColor: "#141414"
  }), z.once("ready-to-show", () => {
    z == null || z.show();
  }), z.webContents.on("did-finish-load", () => {
    z == null || z.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), console.log("RENDERER_DIST:", Zf), console.log("__dirname:", qn), as ? z.loadURL(as) : z.loadFile(ot.join(qn, "../dist/index.html"));
}
lr.on("window-all-closed", () => {
  process.platform !== "darwin" && (lr.quit(), z = null);
});
lr.on("activate", () => {
  Pc.getAllWindows().length === 0 && ed();
});
lr.whenReady().then(() => {
  ed(), lr.isPackaged && setTimeout(() => et.autoUpdater.checkForUpdates(), 3e3);
});
jt.on("window:minimize", () => {
  z !== null && z.minimize();
});
jt.on("window:close", () => {
  z !== null && z.close();
});
jt.on("window:toggle-maximize", () => {
  z !== null && (z.isMaximized() ? z.unmaximize() : z.maximize());
});
Qf.transports.file.level = "info";
et.autoUpdater.logger = Qf;
et.autoUpdater.on("update-available", (e) => {
  z == null || z.webContents.send("update-available", e.version);
});
et.autoUpdater.on("download-progress", (e) => {
  z == null || z.webContents.send("update-progress", Math.round(e.percent));
});
et.autoUpdater.on("update-not-available", () => {
  z == null || z.webContents.send("update-status", "La app está al día");
});
et.autoUpdater.on("update-downloaded", () => {
  z == null || z.webContents.send("update-downloaded");
});
jt.on("update:start-download", () => {
  et.autoUpdater.downloadUpdate();
});
jt.on("update:install", () => {
  et.autoUpdater.quitAndInstall();
});
et.autoUpdater.on("error", (e) => {
  z == null || z.webContents.send("update-status", `Error: ${e.message}`);
});
jt.handle("templates:list", () => {
  try {
    if (Ho.existsSync(ss))
      return JSON.parse(Ho.readFileSync(ss, "utf-8"));
  } catch {
  }
  return [];
});
jt.handle("templates:save", (e, t) => {
  try {
    return Ho.writeFileSync(ss, JSON.stringify(t), "utf-8"), !0;
  } catch {
    return !1;
  }
});
export {
  mA as MAIN_DIST,
  Zf as RENDERER_DIST,
  as as VITE_DEV_SERVER_URL
};
