(function(){
  if (window.__fantasyValueRadarInjected_pro) return;
  window.__fantasyValueRadarInjected_pro = true;

  // ---------------- Polyfills ----------------
  try { if (!''.endsWith) { String.prototype.endsWith = function(s){return this.slice(-s.length)===s;} } } catch(e){}
  try { if (!Array.prototype.at) { Array.prototype.at = function(i){ i=Math.trunc(i)||0; if(i<0) i=this.length+i; return this[i]; } } } catch(e){}

  // ---------------- Normalizers ----------------
  const _norm = s => (s||"").toLowerCase().replace(/[\uFEFF]/g,"").replace(/[.\-_'’`]/g,"").replace(/\s+/g," ").trim();
  const _stripSuffix = name => String(name||"").trim().replace(/\s*,\s*/g," ").replace(/\s+(jr\.?|sr\.?|ii|iii|iv|v|vi)\s*$/i,"");
  const _rmDiacritics = s => { try { return String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,""); } catch(e){ return String(s||""); } };
  const canonName = s => _norm(_rmDiacritics(_stripSuffix(s)));
  function canonPos(p){
    let x=String(p||"").toUpperCase().replace(/\s+/g,"").trim();
    if (x==="DST"||x==="D/ST"||x==="DEF"||x==="DEFENSE"||x==="D") return "D/ST";
    if (x==="PK") return "K";
    if (["QB","RB","WR","TE","K","D/ST"].includes(x)) return x;
    const m=x.match(/^(QB|RB|WR|TE|K|DST|D\/ST)/);
    if (m) return (m[1]==="DST"?"D/ST":(m[1]==="D/ST"?"D/ST":m[1]));
    return x;
  }
  const TEAM_MAP = {"ARI":"ARI","ARIZONA":"ARI","ARIZONA CARDINALS":"ARI","CARDINALS":"ARI","ARI.":"ARI","ARZ":"ARI","ATL":"ATL","ATLANTA":"ATL","ATLANTA FALCONS":"ATL","FALCONS":"ATL","ATL.":"ATL","ATLANTA.":"ATL","BAL":"BAL","BALTIMORE":"BAL","BALTIMORE RAVENS":"BAL","RAVENS":"BAL","BAL.":"BAL","BUF":"BUF","BUFFALO":"BUF","BUFFALO BILLS":"BUF","BILLS":"BUF","BUF.":"BUF","CAR":"CAR","CAROLINA":"CAR","CAROLINA PANTHERS":"CAR","PANTHERS":"CAR","CAR.":"CAR","CHI":"CHI","CHICAGO":"CHI","CHICAGO BEARS":"CHI","BEARS":"CHI","CHI.":"CHI","CIN":"CIN","CINCINNATI":"CIN","CINCINNATI BENGALS":"CIN","BENGALS":"CIN","CIN.":"CIN","CLE":"CLE","CLEVELAND":"CLE","CLEVELAND BROWNS":"CLE","BROWNS":"CLE","CLE.":"CLE","DAL":"DAL","DALLAS":"DAL","DALLAS COWBOYS":"DAL","COWBOYS":"DAL","DAL.":"DAL","DEN":"DEN","DENVER":"DEN","DENVER BRONCOS":"DEN","BRONCOS":"DEN","DEN.":"DEN","DET":"DET","DETROIT":"DET","DETROIT LIONS":"DET","LIONS":"DET","DET.":"DET","GB":"GB","GREEN BAY":"GB","GREEN BAY PACKERS":"GB","PACKERS":"GB","HOU":"HOU","HOUSTON":"HOU","HOUSTON TEXANS":"HOU","TEXANS":"HOU","HOU.":"HOU","IND":"IND","INDIANAPOLIS":"IND","INDIANAPOLIS COLTS":"IND","COLTS":"IND","IND.":"IND","JAX":"JAX","JACKSONVILLE":"JAX","JACKSONVILLE JAGUARS":"JAX","JAGUARS":"JAX","JAGS":"JAX","JAC":"JAX","JAX.":"JAX","KC":"KC","KANSAS CITY":"KC","KANSAS CITY CHIEFS":"KC","CHIEFS":"KC","LAC":"LAC","LOS ANGELES CHARGERS":"LAC","LA CHARGERS":"LAC","SAN DIEGO CHARGERS":"LAC","CHARGERS":"LAC","SD":"LAC","LAC.":"LAC","LAR":"LAR","LOS ANGELES RAMS":"LAR","LA RAMS":"LAR","ST LOUIS RAMS":"LAR","RAMS":"LAR","LAR.":"LAR","LV":"LV","LAS VEGAS RAIDERS":"LV","LAS VEGAS":"LV","OAKLAND RAIDERS":"LV","RAIDERS":"LV","OAK":"LV","LV.":"LV","MIA":"MIA","MIAMI":"MIA","MIAMI DOLPHINS":"MIA","DOLPHINS":"MIA","MIA.":"MIA","MIN":"MIN","MINNESOTA":"MIN","MINNESOTA VIKINGS":"MIN","VIKINGS":"MIN","MIN.":"MIN","NE":"NE","NEW ENGLAND":"NE","NEW ENGLAND PATRIOTS":"NE","PATRIOTS":"NE","NO":"NO","NEW ORLEANS":"NO","NEW ORLEANS SAINTS":"NO","SAINTS":"NO","NOR":"NO","NO.":"NO","NYG":"NYG","NEW YORK GIANTS":"NYG","NY GIANTS":"NYG","GIANTS":"NYG","NYJ":"NYJ","NEW YORK JETS":"NYJ","NY JETS":"NYJ","JETS":"NYJ","PHI":"PHI","PHILADELPHIA":"PHI","PHILADELPHIA EAGLES":"PHI","EAGLES":"PHI","PHI.":"PHI","PIT":"PIT","PITTSBURGH":"PIT","PITTSBURGH STEELERS":"PIT","STEELERS":"PIT","PIT.":"PIT","SEA":"SEA","SEATTLE":"SEA","SEATTLE SEAHAWKS":"SEA","SEAHAWKS":"SEA","SEA.":"SEA","SF":"SF","SAN FRANCISCO":"SF","SAN FRANCISCO 49ERS":"SF","49ERS":"SF","TB":"TB","TAMPA BAY":"TB","TAMPA BAY BUCCANEERS":"TB","BUCCANEERS":"TB","BUCS":"TB","TB.":"TB","TEN":"TEN","TENNESSEE":"TEN","TENNESSEE TITANS":"TEN","TITANS":"TEN","TEN.":"TEN","WAS":"WAS","WASHINGTON":"WAS","WASHINGTON COMMANDERS":"WAS","WASHINGTON FOOTBALL TEAM":"WAS","WSH":"WAS","WAS.":"WAS","D/ST":"D/ST","DST":"D/ST","DEF":"D/ST","DEFENSE":"D/ST"};
  const canonTeam = t => { let x=String(t||"").trim(); if(!x) return ""; x=x.toUpperCase().replace(/\./g,""); if (TEAM_MAP[x]) return TEAM_MAP[x]; const m=x.match(/\(([A-Z]{2,3})\)/); if(m) return TEAM_MAP[m[1]]||m[1]; if (/^[A-Z]{2,3}$/.test(x)) return (x==="JAC"?"JAX":(x==="WSH"?"WAS":(x==="NOR"?"NO":x))); const parts=x.split(/\s+/); const full=parts.join(" "); if(TEAM_MAP[full]) return TEAM_MAP[full]; const last=parts[parts.length-1]; if(TEAM_MAP[last]) return TEAM_MAP[last]; return x; };

  const namePosKey = p => `${canonName(p.name)}|${canonPos(p.pos)}`;
  const keyFor = p => `${canonName(p.name)}|${canonPos(p.pos)}|${canonTeam(p.team)}`;
  const coerceInt = v => { const m = String(v ?? "").match(/-?\d+/); return m ? parseInt(m[0],10) : undefined; };

  // ---------------- Persist helpers ----------------
  const loadPersist = () => new Promise(res=>chrome.storage.local.get(["fvr_state","fvr_pos","fvr_size","fvr_auto","fvr_grp","fvr_ctx","fvr_ctxspan","fvr_hidden","fvr_cfg","fvr_showlog","fvr_updates_selector"], d=>res(d||{})));
  const saveState = (s) => new Promise(res=>chrome.storage.local.set({fvr_state:s}, ()=>res(true)));
  const savePos   = (p) => new Promise(res=>chrome.storage.local.set({fvr_pos:p}, ()=>res(true)));
  const saveSize  = (sz)=> new Promise(res=>chrome.storage.local.set({fvr_size:sz}, ()=>res(true)));
  const saveFlags = (f) => new Promise(res=>chrome.storage.local.set(f||{}, ()=>res(true)));
  const saveCfg   = (cfg)=> new Promise(res=>chrome.storage.local.set({fvr_cfg:cfg}, ()=>res(true)));

  // ---------------- UI Shell ----------------
  const host=document.createElement("div");
  host.style.all="initial"; host.style.position="fixed"; host.style.top="72px"; host.style.right="16px";
  host.style.zIndex="2147483647"; host.style.fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif";
  document.documentElement.appendChild(host);
  const shadow=host.attachShadow({mode:"open"});

  const style=document.createElement("style"); style.textContent=`
    :host, .fvr {
      --bg:#0B0F1A; --bg-elev:#101625; --border:#1e293b; --text:#e5e7eb; --muted:#9ca3af;
      --accent:#60a5fa; --good:#34d399; --bad:#f87171; --chip:#111827; --chip-border:#334155; --row-hover:rgba(96,165,250,.08);
      --shadow:0 12px 28px rgba(0,0,0,.42);
      --w-star:34px; --w-check:36px; --w-tier:110px; --w-name:320px; --w-pos:56px; --w-team:56px; --w-my:56px; --w-y:56px; --w-delta:56px; --w-sig:90px;
    }
    .fvr-card{ display:flex; flex-direction:column; width:720px; height:620px; max-width:92vw; max-height:82vh; background:var(--bg); color:var(--text); border:1px solid var(--border); border-radius:16px; box-shadow:var(--shadow); overflow:hidden; font-size:13px; position:relative; user-select:none; }
    .fvr-header{ cursor:grab; display:flex; align-items:center; justify-content:space-between; padding:10px 12px; background:var(--bg-elev); border-bottom:1px solid var(--border); }
    .fvr-title{ font-weight:800; font-size:14px; letter-spacing:.2px; display:flex; gap:10px; align-items:center; }
    .fvr-body{ flex:1; overflow:auto; padding:10px; }
    .row{ display:flex; gap:8px; margin-bottom:10px; align-items:center; flex-wrap:wrap; }
    .pill{ font-size:11px; padding:4px 8px; border-radius:999px; background:var(--chip); border:1px solid var(--chip-border); color:var(--muted); }
    input[type="file"]{ font-size:12px; color:var(--muted); }
    input[type="text"], input[type="number"], select { background:var(--bg); color:var(--text); border:1px solid var(--border); padding:8px 10px; border-radius:10px; font-size:12px; }
    table{ width:100%; border-collapse:collapse; font-size:12px; table-layout:fixed; }
    th, td{ padding:8px 10px; border-bottom:1px solid var(--border); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    thead th{ position:sticky; top:0; background:var(--bg); z-index:2; text-align:left; font-weight:700; font-size:12px; cursor:pointer; user-select:none; }
    tr:hover{ background:var(--row-hover); } tr.drafted{ opacity:.45; }
    tr.active{ outline:2px solid rgba(96,165,250,.65); outline-offset:-2px; }
    col.c-star { width: var(--w-star);} col.c-check { width: var(--w-check); } col.c-tier { width: var(--w-tier); } col.c-name { width: var(--w-name); } col.c-pos { width: var(--w-pos); } col.c-team { width: var(--w-team); } col.c-my { width: var(--w-my); } col.c-y { width: var(--w-y); } col.c-delta { width: var(--w-delta); } col.c-sig { width: var(--w-sig); }
    .delta-pos{ color:var(--good); font-weight:800; } .delta-neg{ color:var(--bad); font-weight:800; }
    .tier-chip{ font-weight:800; font-size:11px; padding:2px 8px; border-radius:999px; display:inline-flex; align-items:center; gap:6px; border:1px solid var(--chip-border); }
    .tier-dot{ width:8px; height:8px; border-radius:999px; }
    .t1{ background:rgba(34,197,94,.12);} .t1 .tier-dot{ background:#22c55e; }
    .t2{ background:rgba(59,130,246,.12);} .t2 .tier-dot{ background:#3b82f6; }
    .t3{ background:rgba(234,179,8,.12);} .t3 .tier-dot{ background:#eab308; }
    .t4{ background:rgba(249,115,22,.12);} .t4 .tier-dot{ background:#f97316; }
    .t5{ background:rgba(244,63,94,.12);} .t5 .tier-dot{ background:#f43f5e; }
    .group-row td{ background:var(--bg-elev); position:sticky; top:26px; z-index:1; }
    .resize-handle{ position:absolute; right:6px; bottom:6px; width:14px; height:14px; cursor:nwse-resize; border-right:2px solid var(--border); border-bottom:2px solid var(--border); opacity:.7; }
    .btn{ background:var(--bg); color:var(--text); border:1px solid var(--border); padding:6px 10px; border-radius:10px; cursor:pointer; font-size:12px; }
    .btn:disabled{ opacity:.5; cursor:not-allowed; }
    tr.context-anchor td{ background:linear-gradient(to right, rgba(96,165,250,.14), rgba(96,165,250,0) 45%); border-left:2px solid #60a5fa; }
    tr.context-ellipsis td{ text-align:center; color:var(--muted); font-style:italic; }
    .status{ margin-left:8px; font-size:11px; color:var(--muted); }
    .fvr-minibtn{ position:fixed; right:16px; bottom:16px; z-index:2147483647; background:var(--accent); color:white; border:none; padding:10px 12px; border-radius:999px; box-shadow:var(--shadow); font-size:12px; font-weight:800; cursor:pointer; display:none; }
    .star{ cursor:pointer; font-weight:800; } .star.on{ color:#fde047; }
    .pos-band-QB td{ border-left:3px solid #60a5fa; } /* blue */
    .pos-band-RB td{ border-left:3px solid #34d399; } /* green */
    .pos-band-WR td{ border-left:3px solid #f59e0b; } /* amber */
    .pos-band-TE td{ border-left:3px solid #f43f5e; } /* rose */
    .pos-band-K td { border-left:3px solid #a78bfa; } /* violet */
    .pos-band-D\/ST td{ border-left:3px solid #94a3b8; } /* slate */

    /* Auto-mark visual cues */
    @keyframes fvrFlash { 0%{background:rgba(34,197,94,.22);} 60%{background:rgba(34,197,94,.10);} 100%{background:transparent;} }
    tr.auto-flash td { animation: fvrFlash 1.15s ease-out 1; border-left:2px solid rgba(34,197,94,.7); }
    .auto-badge{ display:inline-flex; align-items:center; gap:4px; margin-left:8px; padding:1px 6px; font-size:10px; font-weight:700; border-radius:999px; background:rgba(34,197,94,.18); color:#34d399; border:1px solid rgba(34,197,94,.35); opacity:0; transform:translateY(-2px); animation: fvrBadge .95s ease-out forwards; }
    @keyframes fvrBadge { 0%{opacity:0; transform:translateY(-2px);} 20%{opacity:1; transform:translateY(0);} 80%{opacity:.9;} 100%{opacity:0; transform:translateY(-2px);} }
    /* Checkbox pulse */
    @keyframes fvrPulse { 0%{box-shadow:0 0 0 0 rgba(34,197,94,.55);} 70%{box-shadow:0 0 0 8px rgba(34,197,94,0);} 100%{box-shadow:0 0 0 0 rgba(34,197,94,0);} }
    td.check.auto-pulse{ position:relative; }
    td.check.auto-pulse::after{
      content:""; position:absolute; left:8px; top:50%; transform:translateY(-50%);
      width:14px; height:14px; border-radius:999px; animation:fvrPulse 900ms ease-out 1;
      border:1px solid rgba(34,197,94,.6);
    }
    /* Header dot pulse */
    .auto-dot{ display:inline-block; width:8px; height:8px; border-radius:999px; margin-left:6px; background:#22c55e; opacity:0; transform:scale(.6); }
    @keyframes fvrDot { 0%{opacity:0; transform:scale(.6);} 20%{opacity:1; transform:scale(1);} 80%{opacity:.9;} 100%{opacity:0; transform:scale(.6);} }

    /* On-deck banner */
    .ondeck{ position:absolute; left:12px; bottom:12px; padding:6px 10px; background:rgba(34,197,94,.14); color:#34d399; border:1px solid rgba(34,197,94,.35); border-radius:10px; font-weight:800; display:none;}
    .ondeck.show{ display:inline-flex; align-items:center; gap:8px; }
  `;
  shadow.appendChild(style);

  const wrap=document.createElement("div"); wrap.className="fvr-card fvr";
  wrap.innerHTML=`
    <div class="fvr-header" id="fvr-header">
      <div class="fvr-title">Fantasy Draft Companion <span id="hdrRound" class="pill">R– • Pick –</span></div>
      <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
        <label class="pill" id="autoPill" style="gap:8px; display:flex; align-items:center;"><input type="checkbox" id="autoPicks" /> Auto-mark picks</label>
        <button class="btn" id="btnBind" title="Click, then click the Updates list in the draft room to bind auto-mark source">Bind Updates Panel</button>
        <span class="status" id="bindStatus"></span>
        <label class="pill" title="Teams in league"><span>Teams</span> <input type="number" id="cfgTeams" min="2" max="20" value="12" style="width:58px; margin-left:6px;"></label>
        <label class="pill" title="Your starting slot (1..Teams)"><span>My slot</span> <input type="number" id="cfgSlot" min="1" max="20" value="1" style="width:58px; margin-left:6px;"></label>
        <label class="pill" title="Snake draft?"><input type="checkbox" id="cfgSnake" checked style="margin-right:6px;">Snake</label>
        <button class="btn" id="btnExport">Export CSV</button>
        <button class="btn" id="fvr-reset" title="Clear loaded data and marks">Reset</button>
        <button class="btn" id="fvr-hide" title="Hide panel (Show button appears bottom-right)">Hide</button>
      </div>
    </div>
    <div class="fvr-body">
      <div class="row" style="gap:10px; align-items:center;">
        <span class="pill">Load Your Ranks</span>
        <input type="file" id="myFile" accept=".csv,.json,text/csv,application/json" /><span class="status" id="myStatus"></span>
        <span class="pill">Load Yahoo Ranks</span>
        <input type="file" id="platFile" accept=".csv,.json,text/csv,application/json" /><span class="status" id="platStatus"></span>
        <label class="pill" style="gap:8px; display:flex; align-items:center;"><input type="checkbox" id="showAutoLog" /> Show auto log</label>
        <div id="autoLog" style="display:none; gap:6px; align-items:center; flex-wrap:wrap; max-width:40%; overflow:auto;"></div>
      </div>
      <div class="row" style="gap:10px;">
        <input type="text" id="searchName" placeholder="Search name…" style="flex:1; min-width:140px;" />
        <select id="filterPos"><option value="">All Pos</option><option>QB</option><option>RB</option><option>WR</option><option>TE</option><option>K</option><option>D/ST</option></select>
        <input type="text" id="filterTeam" placeholder="Team…" style="width:90px;" />
        <label class="pill" style="gap:8px; display:flex; align-items:center;"><input type="checkbox" id="onlyAvail" checked/> Available only (A)</label>
        <label class="pill" style="gap:8px; display:flex; align-items:center;"><input type="checkbox" id="groupTiers" checked/> Group by tier</label>
        <label class="pill" style="gap:8px; display:flex; align-items:center;"><input type="checkbox" id="contextMode" /> Context window</label>
        <input type="number" id="contextSpan" min="1" max="15" value="5" title="Rows above/below" style="width:64px;" />
        <span class="pill" id="countInfo">0</span>
      </div>
      <table>
        <colgroup>
          <col class="c-star" /><col class="c-check" /><col class="c-tier" /><col class="c-name" /><col class="c-pos" /><col class="c-team" /><col class="c-my" /><col class="c-y" /><col class="c-delta" /><col class="c-sig" />
        </colgroup>
        <thead>
          <tr>
            <th data-key="star">★</th>
            <th data-key="check">✓</th>
            <th data-key="my_tier">Tier</th>
            <th data-key="name">Name</th>
            <th data-key="pos">Pos</th>
            <th data-key="team">Team</th>
            <th data-key="my_rank">My</th>
            <th data-key="platform_rank">Y!</th>
            <th data-key="delta">Δ</th>
            <th data-key="signals">Signals</th>
          </tr>
        </thead>
        <tbody id="fvr-tbody"></tbody>
      </table>
      <div class="resize-handle" id="fvr-resize" title="Drag to resize"></div>
      <div class="ondeck" id="onDeck">On deck in 1 pick</div>
    </div>
  `;
  shadow.appendChild(wrap);

  // Floating show button
  const showBtn=document.createElement("button"); showBtn.className="fvr-minibtn"; showBtn.id="fvr-show"; showBtn.textContent="Show Draft Panel";
  shadow.appendChild(showBtn);

  // ---------------- State ----------------
  let state={players:[], autoLog:[]}; // players[*].starred, drafted
  let sortSpec={ key:"delta", dir:"desc" };
  let myData=[], platData=[];
  let cfg={ teams:12, slot:1, snake:true };

  // ---------------- Hooks ----------------
  const header=shadow.getElementById("fvr-header");
  const tbody=shadow.getElementById("fvr-tbody");
  const searchName=shadow.getElementById("searchName");
  const filterPos=shadow.getElementById("filterPos");
  const filterTeam=shadow.getElementById("filterTeam");
  const onlyAvail=shadow.getElementById("onlyAvail");
  const groupTiers=shadow.getElementById("groupTiers");
  const autoPicks=shadow.getElementById("autoPicks");
  const autoPill=shadow.getElementById("autoPill");
  const resetBtn=shadow.getElementById("fvr-reset");
  const hideBtn=shadow.getElementById("fvr-hide");
  const myFile=shadow.getElementById("myFile");
  const platFile=shadow.getElementById("platFile");
  const myStatus=shadow.getElementById("myStatus");
  const platStatus=shadow.getElementById("platStatus");
  const countInfo=shadow.getElementById("countInfo");
  const contextMode=shadow.getElementById("contextMode");
  const contextSpan=shadow.getElementById("contextSpan");
  const resizeHandle=shadow.getElementById("fvr-resize");
  const hdrRound=shadow.getElementById("hdrRound");
  const onDeck=shadow.getElementById("onDeck");
  const autoLogEl=shadow.getElementById("autoLog");
  const btnExport=shadow.getElementById("btnExport");
  const cfgTeams=shadow.getElementById("cfgTeams");
  const cfgSlot=shadow.getElementById("cfgSlot");
  const cfgSnake=shadow.getElementById("cfgSnake");
  const btnBind=shadow.getElementById("btnBind");
  const bindStatus=shadow.getElementById("bindStatus");
  const showAutoLog=shadow.getElementById("showAutoLog");

  // Prev/Next match controls
  const jumpPrev = document.createElement("button");
  jumpPrev.className = "btn"; jumpPrev.id = "jumpPrev"; jumpPrev.title = "Previous match"; jumpPrev.textContent = "◀";
  const jumpNext = document.createElement("button");
  jumpNext.className = "btn"; jumpNext.id = "jumpNext"; jumpNext.title = "Next match"; jumpNext.textContent = "▶";
  countInfo.insertAdjacentElement("afterend", jumpPrev);
  jumpPrev.insertAdjacentElement("afterend", jumpNext);

  // ---------------- Layout ----------------
  function layoutColumns(){
    try{
      const bodyEl = shadow.querySelector(".fvr-body");
      if (!bodyEl) return;
      const total = bodyEl.clientWidth;
      const fixed = 34+36+110+56+56+56+56+56+56+90;
      const padding = 24;
      const name = Math.max(180, total - fixed - padding);
      wrap.style.setProperty("--w-name", name + "px");
    }catch(e){}
  }

  function tierClassFor(t){ const n=parseInt(t,10)||0; if(n<=1) return "t1"; if(n===2) return "t2"; if(n===3) return "t3"; if(n===4) return "t4"; return "t5"; }
  function renderTierChip(t){ if(t==null||t==="") return ""; const cls=tierClassFor(t); return `<span class="tier-chip ${cls}"><span class="tier-dot"></span>${t}</span>`; }

  function orderByMyRank(players){
    const withIdx = players.map((p,i)=>({p,i}));
    withIdx.sort((a,b)=>{
      const ar = a.p.my_rank!=null ? parseInt(a.p.my_rank,10) : Number.POSITIVE_INFINITY;
      const br = b.p.my_rank!=null ? parseInt(b.p.my_rank,10) : Number.POSITIVE_INFINITY;
      if (ar!==br) return ar - br;
      return String(a.p.name||"").localeCompare(String(b.p.name||""));
    });
    return withIdx.map(x=>x.p);
  }

  // ---------------- Fuzzy matching ----------------
  function levenshtein(a,b){
    a = String(a||""); b = String(b||"");
    const al=a.length, bl=b.length;
    if (al===0) return bl; if (bl===0) return al;
    const dp=new Array((al+1)*(bl+1));
    for(let i=0;i<=al;i++) dp[i*(bl+1)]=i;
    for(let j=0;j<=bl;j++) dp[j]=j;
    for(let i=1;i<=al;i++){
      for(let j=1;j<=bl;j++){
        const cost = a[i-1]===b[j-1] ? 0 : 1;
        const idx = i*(bl+1)+j;
        dp[idx] = Math.min(
          dp[(i-1)*(bl+1)+j]+1,     // delete
          dp[i*(bl+1)+j-1]+1,       // insert
          dp[(i-1)*(bl+1)+j-1]+cost // sub
        );
      }
    }
    return dp[(al+1)*(bl+1)-1];
  }
  function fuzzyScore(targetLN, candFull){
    const candLN = canonName(candFull).split(" ").slice(-1)[0];
    const t = canonName(targetLN).split(" ").slice(-1)[0];
    if (!t || !candLN) return 999;
    if (candLN===t) return 0;
    const d = levenshtein(t, candLN);
    return d;
  }

  // ---------------- Render ----------------
  let matchIdxs = [];
  let activeMatch = 0;
  let activeKey = null; // selected row for hotkeys

  function render(){
    const nameQ=_norm(searchName.value), posQ=(filterPos.value||"").trim(), teamQ=_norm(filterTeam.value);
    const span=Math.max(1, Math.min(15, parseInt(contextSpan.value||"5", 10) || 5));

    // Base filtered set
    let base=state.players.slice().filter(r=>{
      if (onlyAvail.checked && r.drafted) return false;
      if (posQ && r.pos !== posQ) return false;
      if (teamQ && !_norm(r.team).includes(teamQ)) return false;
      return true;
    });

    // Sorting
    base.sort((a,b)=>{
      const k=sortSpec.key; let va=a[k], vb=b[k];
      if (k==="star"){ return (sortSpec.dir==="asc" ? ( (a.starred?1:0)-(b.starred?1:0) ) : ( (b.starred?1:0)-(a.starred?1:0) )); }
      if (k==="name"||k==="team"){ return sortSpec.dir==="asc" ? String(va||"").localeCompare(String(vb||"")) : String(vb||"").localeCompare(String(va||"")); }
      if (k==="pos"){ const order=["QB","RB","WR","TE","K","D/ST"]; const ia=order.indexOf(va), ib=order.indexOf(vb); const ca=(ia<0?999:ia), cb=(ib<0?999:ib); return sortSpec.dir==="asc" ? (ca-cb) : (cb-ca); }
      if (k==="my_tier"||k==="my_rank"||k==="platform_rank"||k==="delta"){
        va = (va==null ? (k==="delta" ? -99999 : 99999) : parseInt(va,10));
        vb = (vb==null ? (k==="delta" ? -99999 : 99999) : parseInt(vb,10));
        return sortSpec.dir==="asc" ? (va - vb) : (vb - va);
      }
      return 0;
    });

    // Match indices within base
    const matches = (r) => {
      const okName = !nameQ || _norm(r.name).includes(nameQ);
      const okPos  = !posQ  || r.pos === posQ;
      const okTeam = !teamQ || _norm(r.team).includes(teamQ);
      return okName && okPos && okTeam;
    };
    matchIdxs = base.map((r,i)=>[r,i]).filter(([r]) => matches(r)).map(([,i])=>i);
    if (activeMatch >= matchIdxs.length) activeMatch = 0;

    // Special case: single-player name search -> neighbor view by my_rank
    let neighborOverride = false;
    let rows = base;
    let anchorKey = null;
    let hiddenAbove = 0, hiddenBelow = 0;

    if (nameQ && !posQ && !teamQ){
      const allNameMatches = state.players.filter(p => _norm(p.name).includes(nameQ));
      if (allNameMatches.length === 1){
        neighborOverride = true;
        const target = allNameMatches[0];
        const byMy = orderByMyRank(state.players.slice());
        const idx = byMy.findIndex(p => namePosKey(p) === namePosKey(target));
        const slice = byMy.slice(Math.max(0, idx-1), idx+2);
        rows = slice;
        anchorKey = keyFor(target);
      }
    }

    // Context window logic if not overridden
    if (!neighborOverride){
      let anchorIndex = -1;
      if (contextMode.checked) {
        if (matchIdxs.length > 0) {
          anchorIndex = matchIdxs[activeMatch];
        } else if (nameQ || posQ || teamQ) {
          anchorIndex = 0;
        }
        if (anchorIndex >= 0 && base.length) {
          const start = Math.max(0, anchorIndex - span);
          const end   = Math.min(base.length, anchorIndex + span + 1);
          hiddenAbove = start;
          hiddenBelow = base.length - end;
          rows = base.slice(start, end);
          const anchor = base[anchorIndex];
          if (anchor) anchorKey = keyFor(anchor);
        } else {
          rows = base.filter(matches);
        }
      } else {
        rows = (nameQ || posQ || teamQ) ? base.filter(matches) : base;
      }
    }

    // Sort header indicators
    shadow.querySelectorAll("thead th").forEach(th=>{
      const k=th.getAttribute("data-key");
      if (!k || k==="check"){ th.style.cursor="default"; th.textContent=th.textContent.replace(/[↑↓]/g,""); return; }
      const label=th.textContent.replace(/[↑↓]/g,"").trim();
      th.textContent = label + (k===sortSpec.key ? (sortSpec.dir==="asc"?" ↑":" ↓") : "");
    });

    tbody.innerHTML="";
    let lastTier=null;

    if (!neighborOverride && contextMode.checked && (nameQ||posQ||teamQ) && hiddenAbove>0){
      const trE=document.createElement("tr"); trE.className="context-ellipsis";
      const td=document.createElement("td"); td.colSpan=10; td.textContent=`… ${hiddenAbove} hidden above …`;
      trE.appendChild(td); tbody.appendChild(trE);
    }

    rows.forEach(r=>{
      if (!neighborOverride && groupTiers.checked && r.my_tier!==lastTier){
        lastTier=r.my_tier;
        const trG=document.createElement("tr"); trG.className="group-row";
        const td=document.createElement("td"); td.colSpan=10; td.innerHTML=`${renderTierChip(r.my_tier) || '<span class="tier-chip">'+(r.my_tier??"?")+'</span>'}`;
        trG.appendChild(td); tbody.appendChild(trG);
      }
      const tr=document.createElement("tr");
      tr.setAttribute("data-k", keyFor(r));
      if (r.drafted) tr.classList.add("drafted");
      if (anchorKey && keyFor(r) === anchorKey) tr.classList.add("context-anchor");
      tr.classList.add(`pos-band-${r.pos.replace("/","\\/")}`);
      if (activeKey && keyFor(r)===activeKey) tr.classList.add("active");

      const deltaHTML=(r.delta==null)?"":`<span class="${(r.delta||0)>=0?"delta-pos":"delta-neg"}">${r.delta}</span>`;
      const sigs = [r.bye?`Bye ${r.bye}`:"", r.injury?String(r.injury).toUpperCase():"", r.depth?`#${r.depth}`:""].filter(Boolean).join(" · ");
      tr.innerHTML=`
        <td class="star"><span class="star ${r.starred?'on':''}" title="Star (S)">★</span></td>
        <td class="check"><input type="checkbox" class="chk" ${r.drafted?"checked":""} data-k="${keyFor(r)}"></td>
        <td class="tier">${renderTierChip(r.my_tier)}</td>
        <td class="name" title="${r.name}">${r.name}</td>
        <td class="pos">${r.pos}</td>
        <td class="team">${r.team}</td>
        <td class="my">${r.my_rank??""}</td>
        <td class="y">${r.platform_rank??""}</td>
        <td class="delta">${deltaHTML}</td>
        <td class="signals">${sigs}</td>`;
      tbody.appendChild(tr);
    });

    if (!neighborOverride && contextMode.checked && (nameQ||posQ||teamQ) && hiddenBelow>0){
      const trE=document.createElement("tr"); trE.className="context-ellipsis";
      const td=document.createElement("td"); td.colSpan=10; td.textContent=`… ${hiddenBelow} hidden below …`;
      trE.appendChild(td); tbody.appendChild(trE);
    }

    const availLeft = state.players.filter(p=>!p.drafted).length;
    let info = `${rows.length} shown • ${availLeft} available / ${state.players.length} total`;
    if (neighborOverride) info += " • Neighbor view (by My Rank)";
    countInfo.textContent = info;
    jumpPrev.disabled = matchIdxs.length <= 1;
    jumpNext.disabled = matchIdxs.length <= 1;

    tbody.querySelectorAll(".chk").forEach(chk=>chk.addEventListener("change", e=>{
      const k=chk.getAttribute("data-k"); const i = state.players.findIndex(p=>keyFor(p)===k);
      if (i>=0){ state.players[i].drafted = chk.checked; saveState(state); render(); updateRoundBanner(); }
    }));

    // Star toggles
    tbody.querySelectorAll("tr").forEach(tr=>{
      tr.addEventListener("click", ()=>{ activeKey = tr.getAttribute("data-k"); render(); });
      const star = tr.querySelector(".star");
      if (star){
        star.addEventListener("click", (ev)=>{
          ev.stopPropagation();
          const k = tr.getAttribute("data-k");
          const i = state.players.findIndex(p=>keyFor(p)===k);
          if (i>=0){ state.players[i].starred = !state.players[i].starred; saveState(state); render(); }
        });
      }
    });

    layoutColumns();
  }

  // ---------------- Sorting ----------------
  shadow.querySelectorAll("thead th").forEach(th=>{
    const key=th.getAttribute("data-key"); if(!key || key==="check") return;
    th.addEventListener("click", ()=>{
      if (sortSpec.key===key){ sortSpec.dir = (sortSpec.dir==="asc"?"desc":"asc"); }
      else { sortSpec.key = key; sortSpec.dir = (key==="name"||key==="team"||key==="pos"||key==="star") ? "asc" : "desc"; }
      render();
    });
  });

  // ---------------- Filters ----------------
  searchName.addEventListener("input", ()=>{ render(); });
  filterTeam.addEventListener("input", ()=>{ render(); });
  filterPos.addEventListener("change", ()=>{ render(); });
  onlyAvail.addEventListener("change", render);
  groupTiers.addEventListener("change", render);
  contextMode.addEventListener("change", render);
  contextSpan.addEventListener("input", render);

  shadow.getElementById("jumpPrev").addEventListener("click", ()=>{
    if (!matchIdxs.length) return;
    activeMatch = (activeMatch - 1 + matchIdxs.length) % matchIdxs.length;
    render();
  });
  shadow.getElementById("jumpNext").addEventListener("click", ()=>{
    if (!matchIdxs.length) return;
    activeMatch = (activeMatch + 1) % matchIdxs.length;
    render();
  });

  // ---------------- Hide/Show ----------------
  hideBtn.addEventListener("click", async ()=>{
    wrap.style.display="none";
    showBtn.style.display="inline-flex";
    await saveFlags({ fvr_hidden: true });
  });
  showBtn.addEventListener("click", async ()=>{
    wrap.style.display="flex";
    showBtn.style.display="none";
    await saveFlags({ fvr_hidden: false });
  });

  // ---------------- Drag ----------------
  (function enableDrag(){
    const headerEl = header;
    let dragging=false; let startX=0, startY=0; let startLeft=0, startTop=0;
    headerEl.addEventListener("mousedown", e=>{
      if (e.button !== 0) return;
      dragging=true; headerEl.style.cursor="grabbing"; document.body.style.userSelect="none";
      const rect = host.getBoundingClientRect();
      if (host.style.left==="" && host.style.right!=="") { host.style.left = rect.left+"px"; host.style.right = ""; }
      startX = e.clientX; startY = e.clientY;
      startLeft = parseFloat(host.style.left || rect.left); startTop = parseFloat(host.style.top || rect.top);
      const onMove = (e)=>{
        if (!dragging) return;
        const dx = e.clientX - startX; const dy = e.clientY - startY;
        const newLeft = Math.max(0, Math.min(window.innerWidth - wrap.offsetWidth - 8, startLeft + dx));
        const newTop  = Math.max(0, Math.min(window.innerHeight - 48, startTop + dy));
        host.style.left = newLeft + "px"; host.style.top = newTop + "px";
      };
      const onUp = async ()=>{
        dragging=false; headerEl.style.cursor="grab"; document.body.style.userSelect="";
        await savePos({ left: parseFloat(host.style.left||"0"), top: parseFloat(host.style.top||"0") });
        window.removeEventListener("mousemove", onMove);
      };
      window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp, {once:true});
    });
  })();

  // ---------------- Resize ----------------
  (function enableResize(){
    if (!resizeHandle) return;
    let resizing=false; let startX=0, startY=0; let startW=0, startH=0;
    resizeHandle.addEventListener("mousedown", e=>{
      e.preventDefault(); e.stopPropagation();
      if (e.button !== 0) return;
      resizing=true; document.body.style.userSelect="none";
      const rect = wrap.getBoundingClientRect(); startW = rect.width; startH = rect.height;
      startX = e.clientX; startY = e.clientY;
      const onMove = (e)=>{
        if (!resizing) return;
        const dx = e.clientX - startX, dy = e.clientY - startY;
        wrap.style.width = Math.max(520, startW + dx) + "px";
        wrap.style.height = Math.max(420, startH + dy) + "px";
        layoutColumns();
      };
      const onUp = async ()=>{
        resizing=false; document.body.style.userSelect="";
        await saveSize({ w: parseFloat(wrap.style.width||"720"), h: parseFloat(wrap.style.height||"620") });
        window.removeEventListener("mousemove", onMove);
      };
      window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp, {once:true});
    });
  })();

  // ---------------- File Import + Join ----------------
  function readFileAsText(file){
    return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(String(r.result||"")); r.onerror=()=>rej(r.error||new Error("read failed")); r.readAsText(file); });
  }
  function csvToObjects(text){
    const lines = String(text||"").replace(/\uFEFF/g,"").replace(/\r\n?/g,"\n").split("\n").filter(l=>l.trim().length>0);
    if (!lines.length) return [];
    const split = line => {
      const re = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^",]*))/g;
      const out=[]; let m;
      while ((m=re.exec(line))!==null){
        out.push(m[1]!==undefined ? m[1].replace(/""/g,'"') : (m[2]||""));
      }
      return out;
    };
    const headers = split(lines.shift()).map(h=>(_norm(h).replace(/\s+/g,"")));
    const objs=[];
    for (const line of lines){
      const cells = split(line);
      const row={};
      headers.forEach((h,idx)=> row[h] = cells[idx]!==undefined ? cells[idx] : "");
      objs.push(row); // push row
      // In JS we won't use Python; this is just for CSV parsing in content script
    }
    return objs;
  }
  function parseAny(text, filename){
    const name = String(filename||"").toLowerCase();
    const raw = String(text||"").trim();
    if (name.endsWith(".json") || raw.startsWith("[") || raw.startsWith("{")){
      try {
        const j = JSON.parse(raw);
        if (Array.isArray(j)) return j;
        if (j && Array.isArray(j.players)) return j.players;
        if (j && Array.isArray(j.data)) return j.data;
        return [];
      } catch(e){ return []; }
    }
    return csvToObjects(raw);
  }
  function pick(obj, keys){
    for (const k of keys){
      for (const cand of [k, k.replace(/_/g,""), k.replace(/_/g," "), k.replace(/_/g,"-")]){
        for (const prop in obj){
          if (_norm(prop).replace(/\s+/g,"")===_norm(cand).replace(/\s+/g,"")) return obj[prop];
        }
      }
    }
    return undefined;
  }
  function toMyRows(arr){
    const out=[];
    for (const o of arr){
      const name = pick(o, ["name","player","player_name","playername"]);
      const pos  = pick(o, ["pos","position"]);
      const team = pick(o, ["team","tm"]);
      const myr  = pick(o, ["my_rank","myrank","rank","overall","myoverall","my","o"]);
      const tier = pick(o, ["my_tier","tier","mytier"]);
      const bye  = pick(o, ["bye","bye_week","byeweek"]);
      const inj  = pick(o, ["injury","status","inj"]);
      const depth= pick(o, ["depth","depth_chart","depthchart"]);
      if (!name || !pos) continue;
      out.push({ name: String(name).trim(), pos: canonPos(pos), team: canonTeam(team||""), my_rank: coerceInt(myr), my_tier: tier==null?undefined:(String(tier).trim()), bye: coerceInt(bye), injury: inj||"", depth: coerceInt(depth) });
    }
    return out;
  }
  function toPlatRows(arr){
    const out=[];
    for (const o of arr){
      const name = pick(o, ["name","player","player_name","playername"]);
      const pos  = pick(o, ["pos","position"]);
      const team = pick(o, ["team","tm"]);
      const pr   = pick(o, ["platform_rank","platformrank","y_rank","yrank","yahoo_rank","yahoorank","rank","overall"]);
      if (!name || !pos) continue;
      out.push({ name: String(name).trim(), pos: canonPos(pos), team: canonTeam(team||""), platform_rank: coerceInt(pr) });
    }
    return out;
  }
  function recompute(){
    const draftedByKey = new Map();
    const starredByKey = new Map();
    const draftedByNP  = new Map();
    (state.players||[]).forEach(p=>{
      const k = keyFor(p); draftedByKey.set(k, !!p.drafted); starredByKey.set(k, !!p.starred);
      draftedByNP.set(namePosKey(p), !!p.drafted);
    });

    const myMap  = new Map();
    toMyRows(myData).forEach(r=>{
      const k = namePosKey(r);
      const prev = myMap.get(k);
      if (!prev || (!prev.team && r.team)) myMap.set(k, r);
    });
    const platMap = new Map();
    toPlatRows(platData).forEach(r=>{
      const k = namePosKey(r);
      const prev = platMap.get(k);
      if (!prev || (!prev.team && r.team)) platMap.set(k, r);
    });

    const keys = new Set([...myMap.keys(), ...platMap.keys()]);
    const merged=[]; 
    for (const k of keys){
      const m = myMap.get(k); const p = platMap.get(k);
      const base = { name: (m?.name||p?.name||""), pos: (m?.pos||p?.pos||""), team: canonTeam(m?.team||p?.team||""), my_rank: m?.my_rank, my_tier: m?.my_tier, platform_rank: p?.platform_rank, bye: m?.bye, injury: m?.injury, depth: m?.depth };
      base.delta = (base.my_rank!=null && base.platform_rank!=null) ? (base.platform_rank - base.my_rank) : undefined;
      const kFull = keyFor(base);
      base.drafted = draftedByKey.get(kFull) ?? draftedByNP.get(namePosKey(base)) ?? false;
      base.starred = starredByKey.get(kFull) ?? false;
      merged.push(base);
    }

    state.players = merged;
    saveState(state).then(()=>{ render(); updateRoundBanner(); });
    const myCount = myMap.size, platCount = platMap.size;
    myStatus.textContent   = myCount ? `Loaded ${myCount}` : '';
    platStatus.textContent = platCount ? `Loaded ${platCount}` : '';
  }

  async function loadMy(file){
    if (!file) return;
    myStatus.textContent="Loading…";
    try{ const text = await readFileAsText(file); myData = parseAny(text, file.name); recompute(); }
    catch(e){ myStatus.textContent="Error loading file"; }
  }
  async function loadPlat(file){
    if (!file) return;
    platStatus.textContent="Loading…";
    try{ const text = await readFileAsText(file); platData = parseAny(text, file.name); recompute(); }
    catch(e){ myStatus.textContent="Error loading file"; }
  }

  myFile.addEventListener("change", e=>{
    const f = e.target && e.target.files && e.target.files[0];
    if (!f) return;
    if (!String(f.name||"").toLowerCase().endsWith(".csv") && !String(f.name||"").toLowerCase().endsWith(".json")){
      myStatus.textContent = "Unsupported file type"; return;
    }
    loadMy(f);
  });
  platFile.addEventListener("change", e=>{
    const f = e.target && e.target.files && e.target.files[0];
    if (!f) return;
    if (!String(f.name||"").toLowerCase().endsWith(".csv") && !String(f.name||"").toLowerCase().endsWith(".json")){
      platStatus.textContent = "Unsupported file type"; return;
    }
    loadPlat(f);
  });

  resetBtn.addEventListener("click", ()=>{
    if (!confirm("Clear loaded ranks and drafted/star marks?")) return;
    myData=[]; platData=[]; state={players:[], autoLog:[]};
    myFile.value=""; platFile.value="";
    myStatus.textContent=""; platStatus.textContent="";
    chrome.storage.local.remove(["fvr_state"], ()=>{ render(); updateRoundBanner(); });
  });

  // ---------------- Auto-mark log & header pulse ----------------
  function pulseHeader(){
    try{
      const dot = document.createElement("span");
      dot.className="auto-dot";
      dot.style.animation="fvrDot 1000ms ease-out 1";
      autoPill.appendChild(dot);
      setTimeout(()=>{ try{ dot.remove(); }catch(e){} }, 1100);
    }catch(e){}
  }
  function addAutoLog(p){
    state.autoLog = state.autoLog || [];
    state.autoLog.unshift({ k:keyFor(p), name:p.name, team:p.team, pos:p.pos, ts:Date.now() });
    state.autoLog = state.autoLog.slice(0,20);
    saveState(state); renderAutoLog();
  }
  function renderAutoLog(){
    if (showAutoLog && !showAutoLog.checked){ autoLogEl.style.display="none"; return; }
    autoLogEl.style.display="flex";
    autoLogEl.innerHTML="";
    (state.autoLog||[]).slice(0,6).forEach(entry=>{
      const chip=document.createElement("span");
      chip.className="pill";
      chip.textContent=`${entry.name} (${entry.pos}-${entry.team})`;
      const undo=document.createElement("button");
      undo.className="btn"; undo.textContent="Undo"; undo.style.marginLeft="6px"; undo.style.padding="2px 6px"; undo.style.fontSize="11px";
      undo.addEventListener("click", ()=>{
        const i = state.players.findIndex(p=>keyFor(p)===entry.k);
        if (i>=0){ state.players[i].drafted=false; saveState(state).then(()=>{ render(); updateRoundBanner(); }); }
      });
      chip.appendChild(undo);
      autoLogEl.appendChild(chip);
    });
  }

  // ---------------- Updates source binding ----------------
  let boundSelector = null;

  function cssPathFor(el){
    try{
      if (!el || el.nodeType!==1) return null;
      if (el.id) return `#${CSS.escape(el.id)}`;
      const parts=[];
      let e=el, depth=0;
      while (e && e.nodeType===1 && depth<6){
        const tag = e.tagName.toLowerCase();
        let sel = tag;
        if (e.classList && e.classList.length){
          const cls = Array.from(e.classList).slice(0,2).map(c=>'.'+CSS.escape(c)).join('');
          sel += cls;
        }
        const parent = e.parentElement;
        if (parent){
          const sibs = Array.from(parent.children).filter(x=>x.tagName===e.tagName);
          if (sibs.length>1){
            const idx = Array.from(parent.children).indexOf(e)+1;
            sel += `:nth-child(${idx})`;
          }
        }
        parts.unshift(sel);
        if (e.id) break;
        e = e.parentElement; depth++;
      }
      return parts.length ? parts.join('>') : null;
    }catch(err){ return null; }
  }

  function resolveUpdatesContainers(){
    const els = [];
    if (boundSelector){
      try{ document.querySelectorAll(boundSelector).forEach(x=>els.push(x)); }catch(e){} 
    }
    const KNOWN = [
      "#ys-chat-msgs",
      "[data-test='chat-messages']",
      ".ys-draft-chat ul",
      ".ChatNotifList",
      ".DraftUpdates ul",
      "ul[data-yaft-module*='chat']",
      "ul[role='log']",
      ".Pos-a .Ovy-a ul"
    ];
    KNOWN.forEach(sel=>{ try{ document.querySelectorAll(sel).forEach(x=>{ if(!els.includes(x)) els.push(x); }); }catch(e){} });
    document.querySelectorAll("ul,ol").forEach(ul=>{
      try {
        const txt = (ul.textContent||"").toLowerCase();
        if (/\b(qb|rb|wr|te|k|d\/st)\b/i.test(txt) && ul.querySelector("abbr")) {
          if (!els.includes(ul)) els.push(ul);
        }
      } catch(e){}
    });
    return els;
  }

  let captureMode = false;
  function startCapture(){
    if (captureMode) return;
    captureMode = true;
    bindStatus.textContent = "Click the Updates list to bind…";
    const onClick = (ev)=>{
      if (shadow.contains(ev.target)) return;
      let el = ev.target;
      el = el.closest("ul,ol") || el.closest("div");
      const sel = cssPathFor(el);
      if (sel){
        boundSelector = sel;
        saveFlags({ fvr_updates_selector: sel });
        bindStatus.textContent = "Bound";
        stopAutoWatch(); startAutoWatch();
      } else {
        bindStatus.textContent = "Could not bind — try again";
      }
      window.removeEventListener("click", onClick, true);
      captureMode = false;
      ev.preventDefault(); ev.stopPropagation();
    };
    window.addEventListener("click", onClick, true);
  }

  // ---------------- Yahoo Updates watcher (auto-mark) ----------------
  let updatesObserver=null; const seenKeys=new Set();
  function startAutoWatch(){
    stopAutoWatch();
    const containers = resolveUpdatesContainers();
    if (containers.length){
      updatesObserver = new MutationObserver(muts=>{
        for (const m of muts){
          (m.addedNodes||[]).forEach(n=>{
            if (n.nodeType!==Node.ELEMENT_NODE) return;
            const li = (n.matches && n.matches("li")) ? n : (n.closest && n.closest("li"));
            if (li){ if (parsePickFromNode(li)) return; }
            const txt = (n.innerText||n.textContent||"").trim();
            if (txt && /selects|drafts|auto[- ]?pick/i.test(txt)) tryParseText(txt);
          });
        }
      });
      containers.forEach(list=>{
        try {
          updatesObserver.observe(list, {subtree:true, childList:true});
          list.querySelectorAll("li").forEach(li=>parsePickFromNode(li));
        } catch(e){}
      });
    } else {
      updatesObserver = new MutationObserver(muts=>{
        for (const m of muts){
          (m.addedNodes||[]).forEach(n=>{
            if (n.nodeType!==Node.ELEMENT_NODE) return;
            const txt = (n.innerText||n.textContent||"").trim();
            if (txt && /selects|drafts|auto[- ]?pick/i.test(txt)) tryParseText(txt);
          });
        }
      });
      updatesObserver.observe(document.body, {subtree:true, childList:true});
    }
  }
  function stopAutoWatch(){ if (updatesObserver){ try{ updatesObserver.disconnect(); }catch(e){} updatesObserver=null; } }
  function parsePickFromNode(node){
    try{
      const playerEl = node.querySelector(".ys-player");
      const abbrs = node.querySelectorAll(".PickInfo abbr, abbr");
      if (playerEl && abbrs && abbrs.length>=1){
        const short = playerEl.textContent.trim();
        const teamTxt = (abbrs[0].textContent||"").trim();
        const posTxt  = (abbrs[abbrs.length-1].textContent||"").trim();
        const team = canonTeam(teamTxt), pos = canonPos(posTxt);
        const last = extractSurnameFromShort(short);
        markByLastPosTeam(last, pos, team);
        return true;
      }
      const txt = (node.innerText||node.textContent||"").trim();
      if (txt && /selects|drafts|auto[- ]?pick/i.test(txt)){
        tryParseText(txt);
        return true;
      }
    }catch(e){}
    return false;
  }
  function handlePickLi(li){
    try{
      const playerEl = li.querySelector(".ys-player");
      const abbrs = li.querySelectorAll(".PickInfo abbr");
      if (!playerEl || !abbrs || abbrs.length < 1) return;
      const short = playerEl.textContent.trim();
      const teamTxt = (abbrs[0].textContent||"").trim();
      const posTxt = (abbrs[abbrs.length-1].textContent||"").trim();
      const key = `${short}|${teamTxt}|${posTxt}`.toLowerCase(); if (seenKeys.has(key)) return; seenKeys.add(key);
      const team = canonTeam(teamTxt); const pos  = canonPos(posTxt); const last = extractSurnameFromShort(short);
      markByLastPosTeam(last, pos, team);
    }catch(e){}
  }
  function extractSurnameFromShort(short){ let s=String(short||"").trim(); s=s.replace(/^[A-Za-z]\.\s+/, ""); s=s.replace(/\s+(jr\.?|sr\.?|ii|iii|iv|v|vi)\s*$/i, ""); return s; }
  function flashRowByKey(k){
    try{
      const sel = `[data-k="${(k||'').replace(/"/g,'\\"')}"]`;
      const row = tbody.querySelector(sel);
      if (!row) { pulseHeader(); return; }
      row.classList.add("auto-flash");
      const nameCell = row.querySelector("td.name");
      if (nameCell){
        let chip = nameCell.querySelector(".auto-badge");
        if (!chip){ chip = document.createElement("span"); chip.className="auto-badge"; chip.textContent="AUTO"; nameCell.appendChild(chip); setTimeout(()=>{ try{ chip.remove(); }catch(e){} }, 1100); }
      }
      const chkCell = row.querySelector("td.check");
      if (chkCell){ chkCell.classList.add("auto-pulse"); setTimeout(()=>{ try{ chkCell.classList.remove("auto-pulse"); }catch(e){} }, 950); }
      setTimeout(()=>{ try{ row.classList.remove("auto-flash"); }catch(e){} }, 1300);
      pulseHeader();
    }catch(e){}
  }
  function markByLastPosTeam(lastName, pos, team){
    const ln = canonName(lastName);
    let cands = state.players.map((p,i)=>({p,i, cn:canonName(p.name), cp:canonPos(p.pos), ct:canonTeam(p.team)})).filter(x => x.cn.endsWith(ln));
    if (pos)  cands = cands.filter(x => x.cp === pos);
    if (team) cands = cands.filter(x => x.ct === team || (!x.ct && team));
    if (!cands.length && team){
      cands = state.players.map((p,i)=>({p,i, cn:canonName(p.name), cp:canonPos(p.pos), ct:canonTeam(p.team)})).filter(x => x.cn.includes(ln) && (x.ct === team));
    }
    if (!cands.length){
      const target = ln.split(" ").slice(-1)[0];
      cands = state.players.map((p,i)=>({p,i, score:fuzzyScore(target,p.name), cp:canonPos(p.pos), ct:canonTeam(p.team)}))
        .filter(x => x.score<=2 && (!pos || x.cp===pos) && (!team || x.ct===team))
        .sort((a,b)=>a.score-b.score);
    }
    if (cands.length){
      const pick = cands.find(c=>!c.p?.drafted) || cands[0];
      if (pick && pick.p && !pick.p.drafted){
        pick.p.drafted = true;
        addAutoLog(pick.p);
        saveState(state).then(()=>{ render(); updateRoundBanner(); const k = keyFor(pick.p); flashRowByKey(k); });
      }
    }
  }
  function tryParseText(text){
    const PATTERNS = [
      /selects\s+([A-Za-z.\-’'` ]+)\s*\((QB|RB|WR|TE|K|D\/ST)\s*[-–—]\s*([A-Z]{2,3})\)/i,
      /(drafted|drafts)\s+([A-Za-z.\-’'` ]+)\s*,?\s*(QB|RB|WR|TE|K|D\/ST)?\s*[-–—]?\s*([A-Z]{2,3})?/i,
      /auto[- ]?pick:\s*([A-Za-z.\-’'` ]+)\s*,?\s*(QB|RB|WR|TE|K|D\/ST)?\s*[-–—]?\s*([A-Z]{2,3})?/i
    ];
    let name=null, pos=null, team=null;
    for (const re of PATTERNS){
      const m=text.match(re); if(!m) continue;
      if (re===PATTERNS[0]){ name=m[1]; pos=m[2]; team=m[3]; }
      else if (re===PATTERNS[1]){ name=m[2]; pos=m[3]||null; team=m[4]||null; }
      else if (re===PATTERNS[2]){ name=m[1]; pos=m[2]||null; team=m[3]||null; }
      break;
    }
    if (!name) return;
    const ln = extractSurnameFromShort(name);
    markByLastPosTeam(ln, pos?canonPos(pos):null, team?canonTeam(team):null);
  }

  // ---------------- Draft flow (rounds / on-deck) ----------------
  function getDraftCounts(){
    const teams = Math.max(2, Math.min(20, parseInt(cfg.teams||12,10) || 12));
    const drafted = state.players.filter(p=>p.drafted).length;
    const overall = drafted + 1;
    const round = Math.ceil(overall / teams);
    const pickInRound = ((overall-1) % teams) + 1;
    return {teams, drafted, overall, round, pickInRound};
  }
  function isMyTurnSoon(){
    const {teams, overall, round, pickInRound} = getDraftCounts();
    const slot = Math.max(1, Math.min(teams, parseInt(cfg.slot||1,10)||1));
    let myPickInRound;
    if (cfg.snake){
      myPickInRound = (round % 2 === 1) ? slot : (teams - slot + 1);
    } else {
      myPickInRound = slot;
    }
    const delta = myPickInRound - pickInRound;
    return { onDeck: delta===1, delta, round, overall, myPickInRound };
  }
  function updateRoundBanner(){
    const {overall, round, pickInRound} = getDraftCounts();
    hdrRound.textContent = `R${round} • Pick ${pickInRound} • OVR ${overall}`;
    const soon = isMyTurnSoon();
    if (soon.onDeck){ onDeck.textContent = `On deck (R${soon.round} • pick ${soon.myPickInRound})`; onDeck.classList.add("show"); }
    else if (soon.delta>1){ onDeck.textContent = `${soon.delta} picks until you`; onDeck.classList.add("show"); }
    else { onDeck.classList.remove("show"); }
  }
  cfgTeams.addEventListener("input", ()=>{ cfg.teams = parseInt(cfgTeams.value||"12",10)||12; saveCfg(cfg); updateRoundBanner(); });
  cfgSlot.addEventListener("input", ()=>{ cfg.slot  = parseInt(cfgSlot.value||"1",10)||1; saveCfg(cfg); updateRoundBanner(); });
  cfgSnake.addEventListener("change", ()=>{ cfg.snake = !!cfgSnake.checked; saveCfg(cfg); updateRoundBanner(); });

  // ---------------- Hotkeys ----------------
  function moveActive(dir){
    const rows = Array.from(tbody.querySelectorAll("tr[data-k]"));
    if (!rows.length) return;
    let idx = rows.findIndex(r=>r.getAttribute("data-k")===activeKey);
    if (idx<0){ activeKey = rows[0].getAttribute("data-k"); render(); return; }
    idx = Math.max(0, Math.min(rows.length-1, idx + dir));
    activeKey = rows[idx].getAttribute("data-k");
    render();
  }
  function toggleDraftedActive(){
    if (!activeKey) return;
    const i = state.players.findIndex(p=>keyFor(p)===activeKey);
    if (i>=0){ state.players[i].drafted = !state.players[i].drafted; saveState(state).then(()=>{ render(); updateRoundBanner(); }); }
  }
  function toggleStarActive(){
    if (!activeKey) return;
    const i = state.players.findIndex(p=>keyFor(p)===activeKey);
    if (i>=0){ state.players[i].starred = !state.players[i].starred; saveState(state).then(()=>{ render(); }); }
  }
  shadow.addEventListener("keydown", (e)=>{
    const tag = (e.target && (e.target.tagName||"")).toLowerCase();
    const isInput = tag==="input" || tag==="select" || tag==="textarea";
    if (isInput) return;
    if (e.key.toLowerCase()==="a"){ onlyAvail.checked = !onlyAvail.checked; render(); e.preventDefault(); }
    if (e.key.toLowerCase()==="d"){ toggleDraftedActive(); e.preventDefault(); }
    if (e.key.toLowerCase()==="s"){ toggleStarActive(); e.preventDefault(); }
    if (e.key==="ArrowDown" || e.key.toLowerCase()==="j"){ moveActive(+1); e.preventDefault(); }
    if (e.key==="ArrowUp"   || e.key.toLowerCase()==="k"){ moveActive(-1); e.preventDefault(); }
  });

  // Toggle auto log (persist)
  if (showAutoLog){
    showAutoLog.addEventListener("change", async ()=>{
      await saveFlags({ fvr_showlog: showAutoLog.checked });
      autoLogEl.style.display = showAutoLog.checked ? "flex" : "none";
      if (showAutoLog.checked) renderAutoLog();
    });
  }

  // ---------------- Export CSV ----------------
  btnExport.addEventListener("click", ()=>{
    const rows = Array.from(tbody.querySelectorAll("tr[data-k]")).map(tr=>{
      const k = tr.getAttribute("data-k");
      const p = state.players.find(x=>keyFor(x)===k);
      return p;
    }).filter(Boolean);
    const header = ["name","pos","team","my_rank","my_tier","platform_rank","delta","starred","drafted","bye","injury","depth"];
    const esc = (s)=>{
      const v = (s==null?"":String(s));
      return /[",\n]/.test(v) ? `"${v.replace(/"/g,'""')}"` : v;
    };
    const lines = [header.join(",")].concat(rows.map(p=>header.map(h=>esc(p[h])).join(",")));
    const csv = lines.join("\n");
    const blob = new Blob([csv], {type:"text/csv"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "fantasy-draft-view.csv";
    shadow.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 100);
  });

  // ---------------- Persisted load ----------------
  loadPersist().then(d => {
    try{
      if (d.fvr_state && d.fvr_state.players) state = d.fvr_state;
      if (d.fvr_pos) { host.style.right = ""; host.style.left = (d.fvr_pos.left||16)+"px"; host.style.top = (d.fvr_pos.top||72)+"px"; }
      if (d.fvr_size) { wrap.style.width=(d.fvr_size.w||720)+"px"; wrap.style.height=(d.fvr_size.h||620)+"px"; }
      if (typeof d.fvr_auto === "boolean") autoPicks.checked = d.fvr_auto;
      if (typeof d.fvr_grp === "boolean") groupTiers.checked = d.fvr_grp;
      if (typeof d.fvr_ctx === "boolean") contextMode.checked = d.fvr_ctx;
      if (typeof d.fvr_ctxspan === "number") contextSpan.value = String(Math.max(1, Math.min(15, d.fvr_ctxspan||5)));
      if (d.fvr_hidden) { wrap.style.display="none"; showBtn.style.display="inline-flex"; }
      if (d.fvr_cfg){ cfg = Object.assign({teams:12,slot:1,snake:true}, d.fvr_cfg); }
      if (d.fvr_updates_selector){ boundSelector = d.fvr_updates_selector; if (bindStatus) bindStatus.textContent = "Bound"; } else { if (bindStatus) bindStatus.textContent = "Auto"; }
      if (showAutoLog){ showAutoLog.checked = !!d.fvr_showlog; autoLogEl.style.display = showAutoLog.checked ? "flex" : "none"; }
    }catch(e){}
    render(); layoutColumns(); renderAutoLog(); updateRoundBanner();
    if (autoPicks.checked) startAutoWatch();
  });

  [autoPicks, groupTiers, contextMode, contextSpan].forEach(el=>el.addEventListener("change", async ()=>{
    await saveFlags({ fvr_auto: autoPicks.checked, fvr_grp: groupTiers.checked, fvr_ctx: contextMode.checked, fvr_ctxspan: Math.max(1, Math.min(15, parseInt(contextSpan.value||"5",10)||5)) });
    if (el===autoPicks){ if (autoPicks.checked) startAutoWatch(); else stopAutoWatch(); }
  }));

  // Bind Updates button
  if (btnBind){
    btnBind.addEventListener("click", (e)=>{
      e.preventDefault();
      startCapture();
    });
  }

  window.addEventListener("resize", layoutColumns);

  // Console probe
  window.__fvrProbe = function(){
    const els = resolveUpdatesContainers();
    return {
      boundSelector,
      containers: els.map((e,i)=>({i, selector: cssPathFor(e), sample: (e.innerText||"").slice(0,180)}))
    };
  };

})();