**The Verification Layer and Auditable Evidence Trail are the primary differentiators.** All other elements (animations, 3D visualizations, dashboards) support but never overshadow this core value.

at wih demo fallbckuilding new bdots(o pa fscoeback when end unavailableeyond responsiv laut

**BackeIntegation Stratgy:**
- **PRESERVE exiting backend integration** where real endoints and cntracts already exist i the codebase
- **Priority order:** Exitng erified backend endpoint → real backend data → uploaded/parsed data → detrministicdemo data falback
- Do **NOT** invent endpoints or fake API responses
- Inspect existing code for Render bckend references and maintain them
- Document an backend requirements discvered dring implemenationMnimal. Do **NOT** add Jest, React Testing Library, Playwright, Axe-core, Chromatic, or other testing frameworks unless already present.aa-Fravailable business ,demo nlywhn reala unavailbleentaler and evidenc tailht sections
8. **Restrained Visual Effects**: Use soft sadows, subtle translucenborder, controlld highlights, and small-sale transions. **NO ne glow, excessive bloom, or AI-vibe effect.**├ PRESERVED)
│   └── Backend Integration( where exists

**Dashboard Data Priority:**
```
User Interaction / Backend Response    ↓1. Check for existing backend endpoint data (PRIORITY)
    ↓
2. If available: Use real backend data
    ↓
3. If unavailable: Use uploaded/parsed structured data
    ↓
4. If unavailable: Derive from lib/bizlens-data.ts (parsedLedgerData)
    ↓
5. Last resort: Use demo data fallback (novaRetail constants)
    ↓
Deterministic Dashboard Generation
    ↓
Component Rendering

**Component State Flow:**
```
 or backend**U Flow**Backend Upload (if endpoint exists)
    ↓
 if backend unavailable**SDA Flow** (soft shadow, controlled border, subtle scale) with emphasis on verification and evidence trails allwth exessive blur)
- Replce with resraned shadows: `bx-hadow: 0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.24`rity with pomnen evidence displa
- Maintain existing backend integration points

**Visual Effect Guidelines:**
- Active states: Soft 1-2px border highlight, subtle background opacity change (5-10%), small scale (1.02-1.03)
- Hover states: Gentle shadow depth change, border color transition
- NO glow effects, NO neon colors, NO excessive bloom
- Focus on depth through layering and subtle translucency by 20-30%: 0.4-0.6 range by 30%/bloom- Ensure scene supports but does not distract from verification layer messaging
2a6e5Mor sbtl: (`0 2px 4px rgba(00,0,0.1)`), (`0 4px 8px rgba(00,0,0.15)`),sutle b (1px solid rgba(59,130,246,0.3)), soft blue accent0.80.98 (NO GLOW EFFECTS): (#9ca3af) 0.6, border 1px solid rgba(156,163,175,0.3)a (#60a5fa), opcity 0.9r (2px solid #ffffff), background gba(255,255,2550.1), scale 1.03, **NO GLOW**

**Clarification on "glow effect":** The requirements mention removing neon/glow effects but also reference giving active stages a"t." This contradiction is resolved by using **soft shadows and translucent borders** instead of true glow:
- Use `box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2)` for suble depth
- Use `border: 2px solid rgba(96165, 250, 0.8)` for viu mphasis
-**Do NOT se** `box-shadow: 0 0 20x 10px rgba(...)` (neon glow), emphasizing the auditable evidence trail #10b981   #f59e0b
- Emphasize transparency: show file names, line numbers, calculation stepsres or real backend esponsogic

**Priority Order fr Data Sources:**
1. Existin backend endpont data (if verified endpoint exists in odebase)2. Uploaded/parsed business data (if available from file processing)3. Existing parsed data structures (`parsedLedgerData` from `lib/bizlens-data.ts)
4. Deterministic demo data fallback (novaRetail constans) - **LAST RESORT ONLY**

**Do NOT hardcode novaRetail.forecast as the primar dashboard source.** The dashboard MUST derive from real structured data whenever available.

```ty, source: 'backend' | 'parsed' | 'demo'availbl)
  
  // Generate revenue trend from actual data structure
  const revenueTrend = generateRevenueTrendFromData(verifiedRowsh,
      dataSource: source // Track wat data source was used
      // Priority: real trend data > demo fallback   revenueTrend:revenueTrend.length > 0? 
     expenses: aggregateByDepartment(verifiedRows)
    }
  }
}

function generateRevenueTrendFromData(rows: LedgerRow[]): TrendPoint[] {
   Group by month andaggregate from actual data
  cont monthlyData = rows.rduce((acc,row) => {
    const month = nw Date(row.date).toLocaleStrng('default', { month: 'hor' })
    f (!acc[month]) acc[month] = { moth, actual: 0,t: null, net_profi: 0 }
   acc[month].cul += row.revenue / 1000 // Convert to kacc[month].net_profit+=(row.revenu - row.e) / 1000
    return acc
  }, {} a Record<string, TrendPoint>)
  
  return Object.values(monthlyData)
}
```

### Backend Integration Points

**During implementation, the developer MUST**
1. Search codebase for Render backend references (API URLs, fetch calls, backend config)
2. Preserveny existin backend inteation code
3. Use real backend endpoints where contracts exist
4. Fall back to demo data only when backend unavailable
5. Documnt ny backend requiremens discovered

**Exampl ackend Check:**
```tpscrit
sync function getDashboadDaa(): Proise<LedgerRow[]> {
  // Check for existing backend endpoint
  if (BACKEND_ENDPOINT_EXISTS) {
    try {
      const rspose = awai fetch'/api/ldge-data')
       (response.ok) {
        return awat rsponse.json() // Use real backen data
      }
    } catch (error) {
      consle.arn('Backend unavailable, uing demo data'
  
  // Fallback to demo data
  return parsedLedgerData)
```

### Backend Error Handling

```typescript
async function fetchWithFallback<T>(
  endpoint: string,
  fallback: T
): Promise<T> {
  try {
    const response = await fetch(endpoint)
    if (!response.ok) throw new Error('Backend error')
    return await response.json()
  } catch (error) {
    console.warn(`Backend ${endpoint} unavailable, using fallback data`
    return fallback  }
}
y.

**DO NOT automaticalldd new stingdependencies.** Use ejc'xiting ool only**Data Flow Tests:
- Test dashboard generation from parsedLedgerData
- Verify fallback to demo data when backend unavailable
- Confirm priority order: backend → parsed → demo

**- Test backend fallback behavior
dtsurcprioriyordrisepcds
- Test backend integration if endpoints exitealdab
- Confirm NO neon glow effects remain in UI
- Verify visual effects use restrained shadows and borders onlyoseful
- [ ] Visual effects use soft shadows and controlled highlights nly
- [ ] NO excesiv bloom or AI-vibe visual efects

**Data Flow**:
- [ ] Dashboard uses real backend data when endpoint exists
- [ ] Falls back to parsedLedgerData when backend navailable
- [ ] Uses demo data only as ast resort
- [ ] Data source priority is correct with restrained effects- [ ] Revenue trends derive from real data when available
 (when implemented)- [ ] Verification is emphasized as core differentiator
Backend Integration**:
- [ ] Existing backend endpoints are preserved
- [ ] al backend data i used when available
- [ ] Fallback behavior works correctly
- [ ] No invented endit or fake responses

**ResponsImplemntaionStregy: Phased ApprochTo ensure smal, independentyable phase:

###Pha 1: Data ClarityMod Foundao & Liht VisualSystem
**Gol**: Esblish lightthee architecture an visual systm

Task:
-Ceate `cpont/a-clrity-modex skeletonImlmnt liht themcolsytem (wite, soft lue, aqu, mint)
- Adlass pal cmpoentswih rrained hadowsCrte ntroduton ectionwith smoth tansitions
-**Deliable**: Lght serenderswih corrc color palette
###Phs 2: Inerctve Fie Card & Six-Stage Pipeline
**Gal**: Bild inteativile expeienceand ppeinvisualization

Tasks:
- Implement FileCard omponent with ntive dag-an-drop
-Crea PipelineStage component with rerained viual statesAdd hrizontal/vertical resonsve ayu
- Implemet tag click handle
-**Deliveable**:Ive pipeliewih working fil cardPhae 3: DeermisticDashbard Generatin with Rea DataGoal**: Dashboard drive from available daa with proper fallback

Tasks
-Ispec codebase forxi backendintegtion
- Impleent data sourc priity logic (bacend → parsed → demo) CreategeneratDashbord funtion wihral data par
- Addanmated KPI eveal with count-up effects
- Implement chtcsu Recharts**Deliverable: Dashboard shows real data with falbck okn

### Pase 4: Verificaion Layer & Evidence Trail
**Goalmphasizeverificaion as core differntiator

Task:
- Implement DaaLeae component with SVG paths Create auditableevidne trail visualizatin
-dd verifiation tatu ndcaors
-Implemen claim → source → dcio flow Addopilt Q&A deonstron se
- **Deliverbe**erifcation proces clerydmonstatd

### Phae 5: Refine Exitng Dark BizLens UI
**Gal**: Remove eoneffecs, improv viual consstecyTasks:
-Rem ll neon low box-shadows from BizLnsDemo
-Update t restrined shadow system
- Refine Three.js scene (coor, opacity, animation speed)- Improve typography hierarchyAdd aivedrag-and-drop o xiingsetins
- **Delibl**DakUI refid ithno glow effets

### Phase 6: Integratin, Ressiv, Performace & Polih**Goal**:Fial inand qualiy assuranc

Taks:
- Implemensrll-drin stactivation
- Add IntrsectionObserverwith cleanp
- Tst esponsiveayutmob/tablet/desktop)
-Otimize animatin performnce (60fps check)
- Respect prefers-reduced-motion
- Ad closingtement sction
-Fil isual polsh nd QA
- **Delverable**: Cmplete polishedemo redy fr IdeaSpk Round 2

## Depenencies

**ExistingDependncis (from packge.json**:Reat 19, Nxt.j 16.3.0, TypeScrpt 5.7.3
- Tawnd CSS 4.3.3
- Framer Moion3..
-Recharts3.10
- Lucide React1.16.0
-Reat Three Fber 9.7.0, Ret Three Drei 10.7.8
- Thre.js 0.185.1

**DO NOT ADD**: Jest, React Testing Library,laywright (testing framwoks)
- Axe-cre, Choatic (cssibility/visualtestingtool)
- Anynewile uload librarie
- Any new libraries

**Use exiting project tooling only.**