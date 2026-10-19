/* App de atividades do kit Ricorda con Me (Italia, 15/10/2026). Um ficheiro, sem dependencias. Veio do app da Recorda (PT).
   O acesso vem do CAMINHO (window.CFG.acesso, ex. "fp") e soma-se ao que ja foi liberado neste aparelho (localStorage
   "rc-acesso"). f = kit, p = Piano di 90 giorni, m = Memorie dell'epoca, r = Fede e tradizioni (3.o bump, 15/10/2026),
   c = Corpo attivo, j = Giochi da fare insieme, b = bonus do Completo. Interface no "tu" (skill italia-adattare). */
(function () {
  const CFG = window.CFG;
  const D = "../assets/dados/";
  const $ = (s, el = document) => el.querySelector(s);
  const ler = (k, v) => { try { const x = localStorage.getItem(k); return x ? JSON.parse(x) : v; } catch (e) { return v; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const tem = new Set([...(ler("rc-acesso", [])), ...CFG.acesso.split("")]);
  gravar("rc-acesso", [...tem]);
  const feitas = ler("rc-feitas", {});
  const marcar = (id) => { feitas[id] = Date.now(); gravar("rc-feitas", feitas); };
  const cache = {};
  const dados = async (nome) => cache[nome] || (cache[nome] = await (await fetch(D + nome + ".json")).json());
  const app = $("#app");
  const cor = (c, c2) => { document.documentElement.style.setProperty("--c", c); document.documentElement.style.setProperty("--c2", c2); };
  const img = (f, t = 48) => `<img class="f3d" src="../assets/img/${f}" width="${t}" height="${t}" alt="">`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const EXTRAS = CFG.extras; // {p:{...}, m:{...}, c:{...}, j:{...}}
  const nomeP = () => EXTRAS.p.nome.charAt(0).toLowerCase() + EXTRAS.p.nome.slice(1); // o nome do plano no meio da frase
  const ORDEM = ["p", "m", "r", "c", "j"].filter((k) => EXTRAS[k]);
  /* venda dentro do app (Vini, 12/10/2026): os pacotes da LP viram UPGRADE PELA DIFERENCA para o Completo (34,90 EUR).
     Quem so tem o kit paga +19,90 (ou +9,90 pelo Dia a Dia = Plano + Jogos); quem ja tem algum complemento paga +9,90.
     Sem contador: o preco e a diferenca real e nao acaba. Cada item trancado tem AMOSTRA gratis para ela provar antes
     (Plano dias 1 a 3, 1.a pergunta e 1.a conversa das Memorias, 1.a rotina do Corpo, jogo da memoria). Sai o Dia Ativo */
  const UP = CFG.up || null;
  const BCOMP = CFG.bonus_completo || [];
  const tenhoN = ORDEM.filter((k) => tem.has(k)).length;
  const completo = ORDEM.every((k) => tem.has(k)) && (tem.has("b") || !BCOMP.length);
  const upgrade = () => (!UP || completo ? null : tenhoN >= 1 ? { preco: "+9,90 €", ck: UP.c9, ja: "una parte del pacchetto" } : { preco: "+19,90 €", ck: UP.c19, ja: "il kit" });
  const soDiaDia = () => !!(UP && UP.d9 && tenhoN === 0);
  const falta = () => ["p", "j", "c", "m", "r"].filter((k) => EXTRAS[k] && !tem.has(k)); // a ordem do cartao: o que mais pesa primeiro
  const BX = { nome: "5 bonus esclusivi", icone: "trophy.png", cor: "#5b4fc4", cor2: "#eeecfb", descricao: "Feste dell'anno, Il libro della mia vita, Sessioni di gruppo e altro",
               dor: "I 5 bonus che ha solo il pacchetto Completo: per le feste dell'anno, per la famiglia e per il gruppo.", pontos: BCOMP.map((b) => [b.icone, b.nome, b.desc]) };
  const X = (k) => (k === "b" ? BX : EXTRAS[k]);
  const livre = { p: (d) => +d <= 3, m: (t, i) => +i === 0 && (t === "quiz" || t === "conversa"), r: (t, i) => +i === 0 && (t === "quiz" || t === "conversa"), c: (i) => +i === 0, j: (i) => +i === 3 };
  const amostra = (k) => { const u = upgrade(); return u ? `<a class="amostra" href="#/oferta/${k}">${img("sparkles.png", 32)}<span><b>Stai provando.</b> Il resto è nel pacchetto Completo, a ${u.preco}.</span><em>Vedi ›</em></a>` : ""; };

  /* ------------------------------------------------------------------ celebracao */
  function festa(titulo, texto, voltar, oferta = "") {
    const f = $(".festa");
    $("h3", f).textContent = titulo; $("p", f).textContent = texto;
    const slot = $(".f-slot", f); if (slot) slot.innerHTML = oferta;
    $(".f-voltar", f).setAttribute("href", voltar || "#/");
    f.classList.add("on");
    const cores = ["#7a5aa6", "#e07b24", "#2f7fb8", "#2e9460", "#cf4f78", "#c99613"];
    for (let i = 0; i < 60; i++) {
      const c = document.createElement("i"); c.className = "confete";
      c.style.left = Math.random() * 100 + "vw"; c.style.background = cores[i % cores.length];
      c.style.animationDelay = Math.random() * 0.8 + "s"; document.body.appendChild(c);
      setTimeout(() => c.remove(), 3500);
    }
  }
  $(".festa .f-outra").onclick = () => { $(".festa").classList.remove("on"); rota(); };
  document.addEventListener("click", (e) => { if (e.target.closest(".f-voltar")) $(".festa").classList.remove("on"); });

  /* ------------------------------------------------------------------ motores */
  const M = {};

  M.opcoes = (el, d, fim) => {
    let i = 0;
    el.innerHTML = `<div class="progresso">${d.itens.map(() => "<i></i>").join("")}</div><div class="cartao"><div class="frase"></div><div class="opcoes"></div><p class="msg"></p></div>`;
    const mostra = () => {
      const it = d.itens[i];
      $(".frase", el).innerHTML = it.html; $(".msg", el).textContent = "";
      const op = $(".opcoes", el); op.innerHTML = ""; op.classList.toggle("grelha-op", !!it.rotulos);
      it.opcoes.forEach((o, k) => {
        const b = document.createElement("button");
        b.innerHTML = it.rotulos ? `<b>${esc(o)}</b>${it.rotulos[k]}` : esc(o);
        b.onclick = () => {
          if (String(o) === String(it.certa)) {
            b.classList.add("certo"); el.querySelectorAll(".progresso i")[i].classList.add("on");
            if (it.depois) $(".msg", el).innerHTML = "Esatto! La parola è <b>" + it.depois + "</b>.";
            setTimeout(() => { i++; i < d.itens.length ? mostra() : fim(); }, it.depois ? 1300 : 750);
          } else { b.classList.remove("errado"); void b.offsetWidth; b.classList.add("errado"); $(".msg", el).textContent = "Quasi! Riprova."; }
        };
        op.appendChild(b);
      });
    };
    mostra();
  };

  M.sopa = (el, d, fim) => {
    const n = d.grid.length;
    el.innerHTML = `<div class="grelha g${n > 12 ? "g" : n > 10 ? "m" : "p"}" style="grid-template-columns:repeat(${n},minmax(0,1fr))"></div><div class="chips">${d.palavras.map((p) => `<span class="chip" data-i="${p.i}">${esc(p.nome)}</span>`).join("")}</div><p class="msg"></p>`;
    const g = $(".grelha", el), msg = $(".msg", el), bt = [];
    const tons = ["#2f7fb8", "#e07b24", "#2e9460", "#cf4f78", "#7a5aa6", "#c99613", "#178f86", "#d9573f", "#5d6d7e", "#8e44ad", "#16a085", "#b03a2e"];
    d.grid.forEach((row, r) => row.forEach((ch, c) => { const b = document.createElement("button"); b.textContent = ch; b.onclick = () => toque(r, c); g.appendChild(b); bt.push(b); }));
    let ini = null, feitas = 0; const achadas = new Set();
    function toque(r, c) {
      const cel = (a, b) => bt[a * n + b];
      if (!ini) { ini = [r, c]; cel(r, c).classList.add("ini"); msg.textContent = "Ora tocca l'ultima lettera della parola."; return; }
      const [r0, c0] = ini; cel(r0, c0).classList.remove("ini"); ini = null;
      const dr = Math.sign(r - r0), dc = Math.sign(c - c0), len = Math.max(Math.abs(r - r0), Math.abs(c - c0)) + 1;
      if (len < 2 || r - r0 !== dr * (len - 1) || c - c0 !== dc * (len - 1)) { msg.textContent = "Tocca la prima e poi l'ultima lettera della parola."; return; }
      const cam = [...Array(len)].map((_, k) => [r0 + dr * k, c0 + dc * k]);
      const k1 = cam.map((p) => p.join(",")).join(";"), k2 = cam.slice().reverse().map((p) => p.join(",")).join(";");
      const w = d.palavras.find((p) => !achadas.has(p.i) && (p.chave === k1 || p.chave === k2));
      if (!w) { msg.textContent = "Questa non è una delle parole. Riprova!"; return; }
      achadas.add(w.i); feitas++;
      cam.forEach(([a, b]) => { const e = cel(a, b); e.classList.add("ok"); e.style.background = tons[(feitas - 1) % tons.length]; });
      $(`.chip[data-i="${w.i}"]`, el).classList.add("feito");
      msg.textContent = "Ottimo! Hai trovato la parola " + w.nome.toUpperCase() + ".";
      if (feitas === d.palavras.length) setTimeout(fim, 600);
    }
  };

  M.alvos = (el, d, fim) => {
    let e = 0;
    const etapa = () => {
      const et = d.etapas[e]; const total = et.alvos.length; const achou = new Set();
      el.innerHTML = `${d.etapas.length > 1 ? `<p class="passo-n">Riquadro ${e + 1} di ${d.etapas.length}</p>` : ""}<div class="alvos ${et.texto ? "txt" : ""} ${et.palavras ? "pal" : ""}" style="grid-template-columns:repeat(${et.cols},minmax(0,1fr))"></div><p class="msg">${total > 1 ? "Ne mancano " + total + "." : ""}</p>`;
      const g = $(".alvos", el);
      et.celulas.forEach((c, k) => {
        const b = document.createElement("button"); b.innerHTML = c;
        b.onclick = () => {
          if (et.alvos.includes(k)) {
            if (achou.has(k)) return; achou.add(k); b.classList.add("ok");
            $(".msg", el).textContent = achou.size < total ? "Ottimo! Ne mancano " + (total - achou.size) + "." : "Ottimo!";
            if (achou.size === total) setTimeout(() => { e++; e < d.etapas.length ? etapa() : fim(); }, 700);
          } else { b.classList.remove("errado"); void b.offsetWidth; b.classList.add("errado"); }
        };
        g.appendChild(b);
      });
    };
    if (d.mostrar) {
      const m = d.mostrar;
      const itens = m.tipo === "palavras" ? `<div class="mem-pal">${m.itens.map((w) => `<span>${esc(w)}</span>`).join("")}</div>` : `<div class="mem-img">${m.itens.join("")}</div>`;
      el.innerHTML = `<div class="cartao"><p class="rot-app">1. Osserva con calma</p>${itens}<button class="botao">Fatto, me li ricordo</button></div>`;
      $(".botao", el).onclick = etapa;
    } else etapa();
  };

  M.pares = (el, d, fim) => {
    const cartas = [...d.cartas, ...d.cartas].map((h, k) => ({ h, k: k % d.cartas.length })).sort(() => Math.random() - 0.5);
    const cols = d.cartas.length <= 4 ? 4 : d.cartas.length <= 6 ? 4 : 4;
    el.innerHTML = `<div class="pares" style="grid-template-columns:repeat(${cols},1fr)"></div><p class="msg">Gira due carte alla volta.</p>`;
    const g = $(".pares", el); let aberta = null, bloqueio = false, feitos = 0;
    cartas.forEach((c) => {
      const b = document.createElement("button"); b.className = "carta"; b.innerHTML = `<span class="fr">${c.h}</span><span class="vs">?</span>`;
      b.onclick = () => {
        if (bloqueio || b.classList.contains("virada")) return;
        b.classList.add("virada");
        if (!aberta) { aberta = { b, c }; return; }
        if (aberta.c.k === c.k) { b.classList.add("ok"); aberta.b.classList.add("ok"); aberta = null; feitos++; $(".msg", el).textContent = "Ottimo! È una coppia."; if (feitos === d.cartas.length) setTimeout(fim, 600); }
        else { bloqueio = true; const a = aberta; aberta = null; setTimeout(() => { a.b.classList.remove("virada"); b.classList.remove("virada"); bloqueio = false; }, 1100); }
      };
      g.appendChild(b);
    });
  };

  M.sudoku = (el, d, fim) => {
    const n = d.n, vaz = new Set(d.vazios.map(([r, c]) => r + "," + c)), val = {};
    let rows = "";
    for (let r = 0; r < n; r++) {
      rows += "<tr>";
      for (let c = 0; c < n; c++) {
        const k = [];
        if ((c + 1) % d.bc === 0 && c < n - 1) k.push("bd");
        if ((r + 1) % d.br === 0 && r < n - 1) k.push("bb");
        const v = vaz.has(r + "," + c);
        rows += `<td class="${k.join(" ")} ${v ? "vazio" : ""}" data-r="${r}" data-c="${c}">${v ? "" : d.sol[r][c]}</td>`;
      }
      rows += "</tr>";
    }
    el.innerHTML = `<table class="sud s${n}">${rows}</table><div class="teclas">${[...Array(n)].map((_, i) => `<button>${i + 1}</button>`).join("")}<button class="apaga">⌫</button></div><p class="msg">Tocca una casella vuota e poi il numero.</p>`;
    let sel = null;
    el.querySelectorAll("td.vazio").forEach((td) => (td.onclick = () => { if (sel) sel.classList.remove("sel"); sel = td; td.classList.add("sel"); }));
    el.querySelectorAll(".teclas button").forEach((b) => (b.onclick = () => {
      if (!sel) { $(".msg", el).textContent = "Prima tocca una casella vuota."; return; }
      const key = sel.dataset.r + "," + sel.dataset.c;
      if (b.classList.contains("apaga")) { sel.textContent = ""; delete val[key]; sel.classList.remove("mal"); return; }
      sel.textContent = b.textContent; val[key] = +b.textContent; sel.classList.remove("mal");
      if (Object.keys(val).length === vaz.size) {
        let certo = true;
        el.querySelectorAll("td.vazio").forEach((td) => { const ok = +td.textContent === d.sol[+td.dataset.r][+td.dataset.c]; if (!ok) { certo = false; td.classList.add("mal"); } });
        if (certo) setTimeout(fim, 500); else $(".msg", el).textContent = "Quasi! I numeri in rosso vanno cambiati.";
      }
    }));
  };

  M.desenho = (el, d, fim) => {
    el.innerHTML = `${d.modelo ? `<p class="rot-app">Modello</p><div class="modelo-d">${d.modelo}</div><p class="rot-app">Disegna qui</p>` : ""}<div class="tela"><div class="fundo">${d.fundo}</div><canvas></canvas></div><div class="duas-b"><button class="botao claro apagar">Cancella</button><button class="botao terminei">Ho finito</button></div>`;
    const tela = $(".tela", el), cv = $("canvas", el), svg = $(".fundo svg", el);
    const ajusta = () => { const r = svg.getBoundingClientRect(); cv.width = r.width * 2; cv.height = r.height * 2; cv.style.width = r.width + "px"; cv.style.height = r.height + "px"; };
    setTimeout(ajusta, 50); window.addEventListener("resize", ajusta, { once: true });
    const ctx = cv.getContext("2d"); let a = false;
    const p = (ev) => { const r = cv.getBoundingClientRect(); return [(ev.clientX - r.left) * 2, (ev.clientY - r.top) * 2]; };
    cv.addEventListener("pointerdown", (ev) => { a = true; cv.setPointerCapture(ev.pointerId); const [x, y] = p(ev); ctx.beginPath(); ctx.moveTo(x, y); });
    cv.addEventListener("pointermove", (ev) => { if (!a) return; const [x, y] = p(ev); ctx.lineWidth = 10; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--c"); ctx.lineTo(x, y); ctx.stroke(); });
    ["pointerup", "pointercancel"].forEach((t) => cv.addEventListener(t, () => (a = false)));
    $(".apagar", el).onclick = () => ctx.clearRect(0, 0, cv.width, cv.height);
    $(".terminei", el).onclick = fim;
    tela.style.touchAction = "none";
  };

  M.pontos = (el, d, fim) => {
    const pts = d.pts;
    el.innerHTML = `<svg class="pontos-app" viewBox="0 0 500 500"><g class="linhas"></g>${pts.map(([x, y], i) => `<g class="pt" data-i="${i}"><circle cx="${x}" cy="${y}" r="26" class="hit"/><circle cx="${x}" cy="${y}" r="9" class="dot"/><text x="${x + 14}" y="${y - 14}">${i + 1}</text></g>`).join("")}</svg><p class="msg">Tocca il puntino 1.</p>`;
    let prox = 0; const L = $(".linhas", el);
    const svg = $("svg", el);
    svg.addEventListener("click", (ev) => {
      const m = svg.getScreenCTM().inverse(); const q = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(m);
      let i = -1, melhor = 1e9;
      pts.forEach(([x, y], k) => { const dd = (x - q.x) ** 2 + (y - q.y) ** 2; if (dd < melhor) { melhor = dd; i = k; } });
      if (melhor > 60 * 60) return;
      const g = el.querySelector('.pt[data-i="' + i + '"]');
      if (i !== prox) { $(".msg", el).textContent = "Ora tocca il puntino " + (prox + 1) + "."; return; }
      g.classList.add("ok");
      if (i > 0) L.insertAdjacentHTML("beforeend", `<line x1="${pts[i - 1][0]}" y1="${pts[i - 1][1]}" x2="${pts[i][0]}" y2="${pts[i][1]}"/>`);
      prox++;
      if (prox === pts.length) {
        L.insertAdjacentHTML("beforeend", `<line x1="${pts[i][0]}" y1="${pts[i][1]}" x2="${pts[0][0]}" y2="${pts[0][1]}"/>`);
        $(".msg", el).innerHTML = "È " + esc(d.nome) + "!"; setTimeout(fim, 900);
      } else $(".msg", el).textContent = "Ottimo! Ora il puntino " + (prox + 1) + ".";
    });
  };

  M.cartoes = (el, d, fim) => {
    let i = 0;
    el.innerHTML = `<div class="cartao conversa"><p class="rot-app"></p><p class="pergunta"></p></div><div class="duas-b"><button class="botao claro ant">‹ Indietro</button><button class="botao seg">Avanti ›</button></div>`;
    const mostra = () => { $(".rot-app", el).textContent = "Cartoncino " + (i + 1) + " di " + d.cartoes.length; $(".pergunta", el).textContent = d.cartoes[i]; $(".seg", el).textContent = i === d.cartoes.length - 1 ? "Fine" : "Avanti ›"; };
    $(".ant", el).onclick = () => { if (i > 0) { i--; mostra(); } };
    $(".seg", el).onclick = () => { if (i < d.cartoes.length - 1) { i++; mostra(); } else fim(); };
    mostra();
  };

  /* adivinha: a resposta so aparece quando se pede (antes vinha junto e estragava o jogo) */
  M.adivinha = (el, d, fim) => {
    let i = 0;
    el.innerHTML = `<div class="cartao conversa"><p class="rot-app"></p><p class="pergunta"></p><p class="resp-a"></p></div><button class="botao claro ver">Vedi la soluzione</button><div class="duas-b"><button class="botao claro ant">‹ Indietro</button><button class="botao seg">Avanti ›</button></div>`;
    const mostra = () => { const it = d.itens[i]; $(".rot-app", el).textContent = "Indovinello " + (i + 1) + " di " + d.itens.length; $(".pergunta", el).textContent = it.q; $(".resp-a", el).textContent = ""; $(".ver", el).style.visibility = "visible"; $(".seg", el).textContent = i === d.itens.length - 1 ? "Fine" : "Avanti ›"; };
    $(".ver", el).onclick = () => { $(".resp-a", el).textContent = d.itens[i].r; $(".ver", el).style.visibility = "hidden"; };
    $(".ant", el).onclick = () => { if (i > 0) { i--; mostra(); } };
    $(".seg", el).onclick = () => { if (i < d.itens.length - 1) { i++; mostra(); } else fim(); };
    mostra();
  };

  /* sorteador do bingo: os numeros que ja sairam ficam guardados neste aparelho ate "Novo jogo" */
  M.sorteio = (el) => {
    let saidos = ler("rc-tombola", []);
    el.innerHTML = `<div class="sorteio"><div class="bola">–</div><p class="sub-s"></p><button class="botao grande tirar">Estrai un numero</button><div class="saidos"></div><button class="botao claro novo">Nuova partita</button></div>`;
    const mostra = (n) => {
      $(".bola", el).textContent = n || "–";
      $(".sub-s", el).textContent = saidos.length ? saidos.length + " numeri su 90 già estratti" : "Tocca il pulsante per estrarre il primo numero";
      $(".saidos", el).innerHTML = [...saidos].sort((a, b) => a - b).map((x) => `<span class="${x === n ? "ult" : ""}">${x}</span>`).join("");
      $(".tirar", el).disabled = saidos.length >= 90;
    };
    $(".tirar", el).onclick = () => {
      if (saidos.length >= 90) return;
      let n; do { n = 1 + Math.floor(Math.random() * 90); } while (saidos.includes(n));
      saidos.push(n); gravar("rc-tombola", saidos); mostra(n);
    };
    $(".novo", el).onclick = () => { if (saidos.length && !confirm("Cominciare una nuova partita? I numeri già estratti vengono cancellati.")) return; saidos = []; gravar("rc-tombola", saidos); mostra(); };
    mostra(saidos[saidos.length - 1]);
  };

  M.rotina = (el, d, fim) => {
    let i = 0, rest = 0, t = null;
    el.innerHTML = `<div class="progresso">${d.passos.map(() => "<i></i>").join("")}</div><div class="cartao ex"><div class="ex-ic"></div><h3></h3><p class="dose"></p><ol class="passos-ex"></ol><p class="cuidado"></p><div class="relog">0:00</div></div><div class="duas-b"><button class="botao claro pausa">Inizia</button><button class="botao seg">Avanti ›</button></div>`;
    const fmt = (s) => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
    const mostra = () => {
      const p = d.passos[i]; clearInterval(t); t = null; rest = p.segundos;
      $(".ex-ic", el).innerHTML = p.icone; $("h3", el).textContent = p.nome; $(".dose", el).textContent = p.dose;
      $(".passos-ex", el).innerHTML = p.passos.map((x) => `<li>${esc(x)}</li>`).join(""); $(".cuidado", el).textContent = p.cuidado;
      $(".relog", el).textContent = fmt(rest); $(".pausa", el).textContent = "Inizia";
      $(".seg", el).textContent = i === d.passos.length - 1 ? "Fine" : "Avanti ›";
      el.querySelectorAll(".progresso i").forEach((x, k) => x.classList.toggle("on", k < i));
    };
    $(".pausa", el).onclick = () => {
      if (t) { clearInterval(t); t = null; $(".pausa", el).textContent = "Continua"; return; }
      $(".pausa", el).textContent = "Pausa";
      t = setInterval(() => { rest--; $(".relog", el).textContent = fmt(Math.max(rest, 0)); if (rest <= 0) { clearInterval(t); t = null; $(".pausa", el).textContent = "Ripeti"; rest = d.passos[i].segundos; $(".relog", el).textContent = "Fatto!"; } }, 1000);
    };
    $(".seg", el).onclick = () => { if (i < d.passos.length - 1) { i++; mostra(); } else { clearInterval(t); fim(); } };
    mostra();
  };

  /* ------------------------------------------------------------------ paginas */
  const topo = (voltar, rotulo = "‹ Indietro") => `<div class="topo"><a class="voltar" href="${voltar}">${rotulo}</a></div>`;
  const faixa = (icone, nome) => `<div class="faixa">${icone}<h2>${esc(nome)}</h2></div>`;
  const imprimir = (texto = "Stampa o salva in PDF") => `<div class="imprimir"><button class="botao claro bt-imp">🖨️  ${texto}</button><p>Esce la scheda pronta da stampare, in formato A4.</p></div>`;
  const barraPdf = (pdfAtiv, pdfTodo, rotTodo) => `<div class="baixar"><a class="b-pdf" href="../assets/pdf/${pdfAtiv}" download>${img("page_facing_up.png", 34)}<span>Scarica questa attività in PDF</span></a><div class="b-sec"><button class="bt-imp">🖨️ Stampa</button>${pdfTodo ? `<a href="../assets/pdf/${pdfTodo}" download>${rotTodo}</a>` : ""}</div></div>`;
  const pdfTopo = (f, rot) => `<a class="pdf-destaque" href="../assets/pdf/${f}" download>${img("page_facing_up.png", 38)}<span>${rot}</span></a>`;
  const ligaImprimir = (html) => { document.querySelectorAll(".bt-imp").forEach((b) => b.onclick = () => { $("#papel").innerHTML = html.split("{{IMG}}").join("../assets/img/"); setTimeout(() => window.print(), 300); }); };

  /* o upgrade para o Completo e a oferta principal do app (Vini, 08/10 e 12/10/2026): cartao no inicio, cada
     complemento que falta com a DOR na primeira linha e o "Experimentar" que abre a amostra gratis */
  function destaque() {
    const u = upgrade(); if (!u) return "";
    const linhas = falta().map((k) => { const x = EXTRAS[k]; return `<a href="${x.amostra}">${img(x.icone, 38)}<span>${esc(x.dor)}<em>Prova gratis ›</em></span></a>`; }).join("")
      + (BCOMP.length && !tem.has("b") ? `<a href="#/oferta/b">${img("trophy.png", 38)}<span><b>E 5 bonus esclusivi:</b> Feste dell'anno (Natale, Capodanno, Pasqua e altre), Il libro della mia vita, 12 sessioni di gruppo, Diplomi e Musiche dell'epoca.<em>Vedi i bonus ›</em></span></a>` : "");
    return `<div class="destaque up"><span class="selo">COMPLETA IL TUO KIT</span>
      <h2>Il kit occupa 15 minuti. E il resto della giornata?</h2>
      ${UP.imagem ? `<img class="dt-img" src="${UP.imagem}" width="1000" height="760" alt="Le schede del pacchetto Completo">` : ""}
      <div class="dt-pontos up">${linhas}</div>
      <div class="dt-preco"><b>${u.preco}</b></div><p class="dt-depois">Il Completo costa 34,90 €. Visto che hai già ${u.ja}, paghi solo la differenza.</p>
      <a class="botao grande" href="${u.ck}">Voglio il Completo</a>
      ${soDiaDia() ? `<a class="dt-mais" href="${UP.d9}">Oppure solo il ${esc(EXTRAS.p.nome)} e i Giochi: +9,90 €</a>` : ""}</div>`;
  }

  /* a cada 3 atividades do kit feitas, a festa mostra UMA linha discreta com a amostra de um complemento que falta */
  function ofertaFesta() {
    if (!upgrade()) return "";
    const n = ler("rc-festas", 0) + 1; gravar("rc-festas", n);
    const f = falta(); if (n % 3 || !f.length) return "";
    const x = EXTRAS[f[(n / 3) % f.length]];
    return `<a class="f-of" href="${x.amostra}">${img(x.icone, 40)}<span>${esc(x.dor)}</span><em>Prova ›</em></a>`;
  }

  async function hub() {
    cor("#2f7fb8", "#e8f2fa");
    const cads = CFG.cadernos;
    let cards = "";
    for (const c of cads) {
      const n = Object.keys(feitas).filter((k) => k.startsWith(c.id + "-")).length;
      cards += `<a class="card" href="#/c/${c.id}" style="--c:${c.cor}">${img(c.icone, 54)}<b>${esc(c.nome)}</b><span>${n ? n + " di " + c.total + " fatte" : c.total + " attività"}</span></a>`;
    }
    const extra = (k) => {
      const x = X(k);
      if (tem.has(k)) return `<a class="tranc livre" href="#/${x.rota}" style="--c:${x.cor}">${img(x.icone, 50)}<div><b>${esc(x.nome)}</b><small>${esc(x.descricao)}</small></div><span class="cadeado">›</span></a>`;
      return `<a class="tranc" href="#/oferta/${k}">${img(x.icone, 50)}<div><b>${esc(x.nome)}</b><small>${esc(x.descricao)}</small></div><span class="exp">${k === "b" ? "Vedi" : "Prova"}</span></a>`;
    };
    const lista = [...ORDEM, ...(BCOMP.length && !tem.has("b") ? ["b"] : [])];
    const bonusC = tem.has("b") ? `<p class="secao">Bonus del Completo</p><div class="bonus">${BCOMP.map((b) => `<a class="pdf" href="../assets/pdf/${b.ficheiro}" download>${img(b.icone, 40)}${esc(b.nome)}</a>`).join("")}</div>` : "";
    const hoje = tem.has("p") ? `<a class="hoje" href="#/plano">${img("calendar.png", 56)}<div><b>L'attività di oggi</b><small>${esc(EXTRAS.p.nome)}: riprendi da dove avevi lasciato</small></div></a>` : "";
    const bonus = CFG.bonus.map((b) => `<a class="pdf" href="../assets/pdf/${b.ficheiro}" download>${img(b.icone, 40)}${esc(b.nome)}</a>`).join("");
    app.innerHTML = `
      <div class="ola"><div class="avos">${img("old_woman.png", 92)}${img("old_man.png", 92)}</div><h1>${esc(CFG.marca)}</h1><p>Attività per tenere la mente attiva. Da fare sullo schermo o da stampare.</p></div>
      ${destaque()}
      <a class="pdf-destaque" href="#/pdfs">${img("page_facing_up.png", 38)}<span>Preferisci la carta? Scarica tutto in PDF</span></a>
      ${hoje}
      <p class="secao">Gli 8 quaderni</p><div class="cadernos">${cards}</div>
      <p class="secao">Per andare oltre</p><div class="extras">${lista.map(extra).join("")}</div>
      ${bonusC}<p class="secao">Bonus da scaricare</p><div class="bonus">${bonus}</div>
      <p class="rodape">Queste attività sono un passatempo per allenare la mente. Non sostituiscono il parere del medico.</p>`;
  }

  async function caderno(id) {
    const c = CFG.cadernos.find((x) => x.id === id); cor(c.cor, c.cor2);
    const lista = await dados(id);
    const grupo = (nv) => lista.filter((a) => a.nivel === nv).map((a) => `<a class="ativ ${feitas[a.id] ? "feita" : ""}" href="#/a/${id}/${a.n}"><span class="num-a">${a.n}</span><b>${esc(a.titulo)}</b><span class="ck">${feitas[a.id] ? "✓" : ""}</span></a>`).join("");
    app.innerHTML = `${topo("#/", "‹ Inizio")}${faixa(img(c.icone, 44), c.nome)}
      ${pdfTopo(id + ".pdf", "Scarica il quaderno intero in PDF")}
      <p class="dica">${esc(c.descricao)}</p>
      ${[1, 2, 3].map((nv) => `<p class="secao"><span class="bolas">${[1, 2, 3].map((k) => `<i class="${k <= nv ? "on" : ""}"></i>`).join("")}</span> Livello ${nv}${nv === 1 ? ": per cominciare" : nv === 2 ? ": un po' di più" : ": sfida"}</p><div class="ativs">${grupo(nv)}</div>`).join("")}`;
  }

  async function atividade(id, n, voltar) {
    const c = CFG.cadernos.find((x) => x.id === id); cor(c.cor, c.cor2);
    const a = (await dados(id)).find((x) => x.n === +n);
    const seguinte = (await dados(id)).find((x) => x.n === +n + 1);
    app.innerHTML = `${topo(voltar || "#/c/" + id)}${faixa(img(c.icone, 40), c.nome)}
      <h1 class="titulo">${esc(a.titulo)}</h1>${barraPdf(a.pdf, id + ".pdf", "Quaderno intero in PDF")}<p class="dica">${a.instr_app}</p><div class="motor"></div>${imprimir()}`;
    M[a.app.motor]($(".motor"), a.app, () => {
      marcar(a.id);
      if (voltar && voltar.startsWith("#/plano")) festa("Benissimo!", "Un'altra attività fatta.", voltar);
      else festa("Benissimo!", seguinte ? "Attività completata. La prossima ti aspetta." : "Hai finito l'ultimo livello di questo quaderno!", seguinte ? `#/a/${id}/${seguinte.n}` : "#/c/" + id, ofertaFesta());
    });
    $(".festa .f-voltar").textContent = voltar && voltar.startsWith("#/plano") ? "Torna al calendario" : seguinte ? "Attività successiva" : "Torna al quaderno";
    ligaImprimir(a.papel);
  }

  /* ------------------------------ Plano do ano (19/10/2026: era de 90 dias; 12 meses, 1 atividade por dia; amostra: dias 1 a 3) */
  async function plano(dia) {
    const dono = tem.has("p");
    if (!dono && dia && !livre.p(dia)) return oferta("p");
    const x = EXTRAS.p; cor(x.cor, x.cor2);
    const P = await dados("plano");
    const feitoDia = (d) => d.atividades.every((a) => feitas[a.id]);
    if (!dia) {
      const hoje = P.dias.find((d) => !feitoDia(d)) || P.dias[P.dias.length - 1];
      const hojeLivre = dono || livre.p(hoje.dia);
      const porMes = {}, DM = P.dias_mes || 30;
      P.dias.forEach((d) => { const m = d.mes || Math.ceil(d.dia / DM); if (!porMes[m]) porMes[m] = []; porMes[m].push(d); });
      const mesHoje = hoje.mes || Math.ceil(hoje.dia / DM);
      const dia1 = (d) => (dono || livre.p(d.dia)
        ? `<a class="dia ${feitoDia(d) ? "feito" : ""} ${d.dia === hoje.dia ? "hj" : ""}" href="#/plano/${d.dia}">${d.dia}</a>`
        : `<a class="dia tr" href="#/oferta/p" aria-label="Giorno ${d.dia}, nel pacchetto Completo">🔒</a>`);
      const meses = Object.keys(porMes).map(Number).sort((a, b) => a - b).map((m) => {
        const ds = porMes[m], fatti = ds.filter(feitoDia).length;
        return `<details class="mes" ${m === mesHoje ? "open" : ""}><summary><b>Mese ${m}</b><small>Livello ${ds[0].nivel} · ${fatti}/${ds.length}</small></summary><div class="dias">${ds.map(dia1).join("")}</div></details>`;
      }).join("");
      app.innerHTML = `${topo("#/", "‹ Inizio")}${faixa(img(x.icone, 44), x.nome)}${dono ? "" : amostra("p")}
        ${dono ? pdfTopo(x.pdf, "Scarica il calendario in PDF") : ""}<a class="hoje grande" href="${hojeLivre ? "#/plano/" + hoje.dia : "#/oferta/p"}">${img("calendar.png", 64)}<div><b>Giorno ${hoje.dia}</b><small>${hojeLivre ? "L'attività di oggi è pronta" : "I giorni successivi sono nel pacchetto Completo"}</small></div></a>
        <p class="secao">I 12 mesi</p>${meses}`;
      return;
    }
    const d = P.dias.find((z) => z.dia === +dia);
    const nomes = Object.fromEntries(CFG.cadernos.map((c) => [c.id, c]));
    const seg = +dia < P.dias.length ? (dono || livre.p(+dia + 1) ? `<a class="botao claro" href="#/plano/${+dia + 1}">Vedi il giorno ${+dia + 1} ›</a>` : `<a class="botao claro" href="#/oferta/p">Il giorno ${+dia + 1} e i successivi sono nel Completo ›</a>`) : "";
    app.innerHTML = `${topo("#/plano", "‹ Calendario")}${faixa(img(x.icone, 44), "Giorno " + d.dia + " di " + P.dias.length)}${dono ? "" : amostra("p")}
      <p class="dica">${esc(d.nota)}</p>
      <div class="ativs">${d.atividades.map((a) => `<a class="ativ ${feitas[a.id] ? "feita" : ""}" href="#/pa/${d.dia}/${a.cad}/${a.n}">${img(nomes[a.cad].icone, 44)}<b>${esc(a.titulo)}<small>${esc(nomes[a.cad].nome)}</small></b><span class="ck">${feitas[a.id] ? "✓" : ""}</span></a>`).join("")}</div>
      ${feitoDia(d) ? `<p class="parabens">${img("trophy.png", 60)}Giorno ${d.dia} completato!</p>` : ""}
      ${seg}`;
  }

  /* ------------------------------ Memorie dell'epoca (m) e Fede e tradizioni (r): a mesma estrutura (amostra: 1.a domanda e 1.a conversazione) */
  async function memorias(tipo, i, k = "m") {
    const dono = tem.has(k);
    if (!dono && tipo && !livre[k](tipo, i)) return oferta(k);
    const x = EXTRAS[k]; cor(x.cor, x.cor2);
    const Mm = await dados(k === "m" ? "memorias" : "fede");
    const base = k === "m" ? "#/m/" : "#/fd/", lista_ = k === "m" ? "#/memorias" : "#/fede", chave = k === "m" ? "m-" : "fd-";
    if (!tipo) {
      const item = (t, a, n) => {
        const conteudo = `${img(a.icone || x.icone, 40)}<b>${esc(a.titulo)}</b>`;
        if (!dono && !livre[k](t, n)) return `<a class="ativ tr" href="#/oferta/${k}">${conteudo}<span class="ck">🔒</span></a>`;
        return `<a class="ativ ${feitas[chave + t + "-" + n] ? "feita" : ""}" href="${base}${t}/${n}">${conteudo}<span class="ck">${feitas[chave + t + "-" + n] ? "✓" : dono ? "" : "gratis"}</span></a>`;
      };
      const bloco = (t, arr, rot) => `<p class="secao">${rot}</p><div class="ativs">${arr.map((a, n) => item(t, a, n)).join("")}</div>`;
      app.innerHTML = `${topo("#/", "‹ Inizio")}${faixa(img(x.icone, 44), x.nome)}${dono ? pdfTopo(x.pdf, "Scarica tutto in PDF") : amostra(k)}<p class="dica">${esc(x.descricao)}. Da fare insieme e chiacchierando.</p>
        ${bloco("quiz", Mm.quizzes, "Chi si ricorda?")}${bloco("sopa", Mm.sopas, k === "m" ? "Crucipuzzle di una volta" : "Crucipuzzle")}${bloco("conversa", Mm.conversa, "Cartoncini di conversazione")}`;
      return;
    }
    const arr = { quiz: Mm.quizzes, sopa: Mm.sopas, conversa: Mm.conversa }[tipo]; const a = arr[+i];
    app.innerHTML = `${topo(lista_)}${faixa(img(x.icone, 40), x.nome)}${dono ? "" : amostra(k)}<h1 class="titulo">${esc(a.titulo)}</h1>${a.pdf ? barraPdf(a.pdf, dono ? x.pdf : "", "Tutto in PDF") : ""}<p class="dica">${a.instr_app}</p><div class="motor"></div>${a.papel ? imprimir() : ""}`;
    M[a.app.motor]($(".motor"), a.app, () => { marcar(chave + tipo + "-" + i); festa("Benissimo!", "Che bello ricordare.", lista_); });
    $(".festa .f-voltar").textContent = k === "m" ? "Torna alle Memorie" : "Torna a Fede e tradizioni";
    if (a.papel) ligaImprimir(a.papel);
  }

  /* ------------------------------ Corpo Ativo (amostra: a 1.a rotina) */
  async function corpo(i) {
    const dono = tem.has("c");
    if (!dono && i !== undefined && !livre.c(i)) return oferta("c");
    const x = EXTRAS.c; cor(x.cor, x.cor2);
    const C = await dados("corpo");
    if (i === undefined) {
      const item = (r, k) => {
        const conteudo = `${img(r.icone, 44)}<b>${esc(r.nome)}<small>${esc(r.descricao)}</small></b>`;
        if (!dono && !livre.c(k)) return `<a class="ativ tr" href="#/oferta/c">${conteudo}<span class="ck">🔒</span></a>`;
        return `<a class="ativ ${feitas["c-" + k] ? "feita" : ""}" href="#/corpo/${k}">${conteudo}<span class="ck">${feitas["c-" + k] ? "✓" : dono ? "" : "grátis"}</span></a>`;
      };
      app.innerHTML = `${topo("#/", "‹ Inizio")}${faixa(img(x.icone, 44), x.nome)}${dono ? pdfTopo(x.pdf, "Scarica gli esercizi in PDF") : amostra("c")}<p class="aviso-s">${esc(C.aviso)}</p>
        <p class="secao">Routine di 10 minuti</p><div class="ativs">${C.rotinas.map(item).join("")}</div>`;
      return;
    }
    const r = C.rotinas[+i];
    app.innerHTML = `${topo("#/corpo")}${faixa(img(x.icone, 40), x.nome)}${dono ? "" : amostra("c")}<h1 class="titulo">${esc(r.nome)}</h1>${dono ? pdfTopo(x.pdf, "Scarica gli esercizi in PDF") : ""}<p class="dica">${esc(r.descricao)} Da fare seduti su una sedia stabile.</p><div class="motor"></div>`;
    M.rotina($(".motor"), r, () => { marcar("c-" + i); festa("Benissimo!", "Routine completata. Il corpo ringrazia.", "#/corpo"); });
    $(".festa .f-voltar").textContent = "Torna alle routine";
  }

  /* ------------------------------ Jogos para Jogar Juntos (amostra: o jogo da memoria) */
  async function jogos(i) {
    const dono = tem.has("j");
    if (!dono && i !== undefined && !livre.j(i)) return oferta("j");
    const x = EXTRAS.j; cor(x.cor, x.cor2);
    const Jg = await dados("jogos");
    if (i === undefined) {
      const item = (g, k) => {
        const conteudo = `${img(g.icone, 44)}<b>${esc(g.nome)}<small>${esc(g.resumo)}</small></b>`;
        if (!dono && !livre.j(k)) return `<a class="ativ tr" href="#/oferta/j">${conteudo}<span class="ck">🔒</span></a>`;
        return `<a class="ativ" href="#/jogos/${k}">${conteudo}<span class="ck">${dono ? "›" : "grátis"}</span></a>`;
      };
      app.innerHTML = `${topo("#/", "‹ Inizio")}${faixa(img(x.icone, 44), x.nome)}${dono ? pdfTopo(x.pdf, "Scarica tutti i giochi in PDF") : amostra("j")}<p class="dica">Per giocare in due, in famiglia, durante una visita o in gruppo. Stampare, ritagliare e giocare.</p>
        <div class="ativs">${Jg.jogos.map(item).join("")}</div>`;
      return;
    }
    const g = Jg.jogos[+i];
    app.innerHTML = `${topo("#/jogos", "‹ Giochi")}${faixa(img(x.icone, 40), x.nome)}${dono ? "" : amostra("j")}<h1 class="titulo">${esc(g.nome)}</h1>${pdfTopo(g.pdf, "Scarica questo gioco in PDF")}
      <p class="secao">Come si gioca</p><ol class="como-j">${g.como.map((p) => `<li>${esc(p)}</li>`).join("")}</ol>${g.app ? '<div class="motor"></div>' : ""}`;
    if (g.app) {
      M[g.app.motor]($(".motor"), g.app, () => festa("Benissimo!", "Che bello giocare insieme.", "#/jogos"));
      $(".festa .f-voltar").textContent = "Torna ai giochi";
    }
  }

  /* ------------------------------ todos os PDF */
  function pdfs() {
    cor("#2f7fb8", "#e8f2fa");
    const item = (f, nome, ic) => `<a class="pdf" href="../assets/pdf/${f}" download>${img(ic, 40)}${esc(nome)}</a>`;
    const extra = (k) => { const x = X(k); return tem.has(k) ? item(x.pdf, x.nome, x.icone) : `<a class="pdf tr" href="#/oferta/${k}">${img(x.icone, 40)}${esc(x.nome)}<span class="cadeado">🔒</span></a>`; };
    const bc = BCOMP.length ? `<p class="secao">Bonus del Completo</p><div class="bonus">${tem.has("b") ? BCOMP.map((b) => item(b.ficheiro, b.nome, b.icone)).join("") : BCOMP.map((b) => `<a class="pdf tr" href="#/oferta/b">${img(b.icone, 40)}${esc(b.nome)}<span class="cadeado">🔒</span></a>`).join("")}</div>` : "";
    app.innerHTML = `${topo("#/", "‹ Inizio")}<h1 class="titulo">Tutto in PDF</h1><p class="dica">Scarica, salva e stampa tutte le volte che vuoi.</p>
      ${item("inizia-qui.pdf", "Guida: come usare il kit", "open_book.png")}
      <p class="secao">Gli 8 quaderni</p><div class="bonus">${CFG.cadernos.map((c) => item(c.id + ".pdf", c.nome, c.icone)).join("")}</div>
      <p class="secao">Per andare oltre</p><div class="bonus">${ORDEM.map(extra).join("")}</div>
      ${bc}<p class="secao">Bonus</p><div class="bonus">${CFG.bonus.map((b) => item(b.ficheiro, b.nome, b.icone)).join("")}</div>`;
  }

  /* ------------------------------ pagina de oferta (venda dentro do produto): a dor, o que tem, a amostra gratis
     e o upgrade pela diferenca. O avulso deixou de ser vendido aqui (12/10/2026) */
  function oferta(k) {
    const x = X(k); const u = upgrade();
    if (!x || !u) return hub();
    cor(x.cor, x.cor2);
    const diaDia = soDiaDia() && (k === "p" || k === "j") ? `<a class="dt-mais" href="${UP.d9}">Oppure solo il ${esc(EXTRAS.p.nome)} e i Giochi: +9,90 €</a>` : "";
    app.innerHTML = `${topo("#/", "‹ Inizio")}
      <div class="of-topo">${img(x.icone, 110)}<span class="selo">NEL PACCHETTO COMPLETO</span><h1>${esc(x.nome)}</h1><p>${esc(x.dor || x.promessa)}</p></div>
      <div class="of-lista">${x.pontos.map((p) => `<div class="of-p">${img(p[0], 46)}<div><b>${esc(p[1])}</b><p>${esc(p[2])}</p></div></div>`).join("")}</div>
      ${x.amostra ? `<a class="botao claro grande" href="${x.amostra}">Prova gratis</a>` : ""}
      <div class="of-up"><p>Questo e tutto quello che manca al tuo kit sono nel <b>pacchetto Completo</b>, con 5 bonus esclusivi.</p>
        <div class="dt-preco"><b>${u.preco}</b></div><p class="dt-depois">Il Completo costa 34,90 €. Visto che hai già ${u.ja}, paghi solo la differenza.</p>
        <a class="botao grande" href="${u.ck}">Voglio il Completo</a>${diaDia}</div>
      <p class="rodape">Pagamento sicuro con Hotmart, con carta o PayPal. Appena il pagamento è confermato, si apre l'accesso al pacchetto e la guida resta nella tua area acquisti di Hotmart.</p>`;
  }

  /* ------------------------------------------------------------------ rotas */
  async function rota() {
    const h = location.hash.replace(/^#\/?/, "").split("/");
    window.scrollTo(0, 0);
    if (!h[0]) return hub();
    if (h[0] === "c") return caderno(h[1]);
    if (h[0] === "a") return atividade(h[1], h[2]);
    if (h[0] === "pa") return atividade(h[2], h[3], "#/plano/" + h[1]);
    if (h[0] === "plano") return plano(h[1]);
    if (h[0] === "memorias") return memorias();
    if (h[0] === "m") return memorias(h[1], h[2]);
    if (h[0] === "fede") return memorias(undefined, undefined, "r");
    if (h[0] === "fd") return memorias(h[1], h[2], "r");
    if (h[0] === "corpo") return corpo(h[1]);
    if (h[0] === "jogos") return jogos(h[1]);
    if (h[0] === "oferta") return oferta(h[1]);
    if (h[0] === "pdfs") return pdfs();
    hub();
  }
  window.addEventListener("hashchange", () => { $(".festa").classList.remove("on"); rota(); });
  rota();
})();
