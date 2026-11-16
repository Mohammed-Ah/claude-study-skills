# COE 446 – Topic 3: Cellular Capacity & the Radio Access Network (RAN)
### Deep-Dive Study Guide — Slides 26–45 (Topic_3-RAN_v11)

*Course: COE 446 Mobile Computing, KFUPM — Instructor: Zeeshan Kaleem*
*Every section is numbered to match the lecture slide numbers so you can cross-reference directly. Your handwritten margin notes are addressed where they appear.*

---

## Roadmap of this part of the topic

These 20 slides tell one story in three movements:

1. **Uplink power control (slide 26)** — how a phone decides how loud to transmit, and why "not fully compensating" path loss is deliberate.
2. **Capacity (slides 27–40)** — how capacity is measured today, the planning identity *Throughput ≈ Bandwidth × Spectral efficiency × Cell density*, and the three "levers" that grow it: more spectrum (L1), more cells (L2), more bits per hertz (L3). Then channel assignment, from FCA/DCA to the modern NR scheduler.
3. **The RAN itself (slides 41–45)** — what the RAN is, how it saves energy, and how its architecture evolved from monolithic boxes to disaggregated, open, software-controlled O-RAN.

---

## Slide 26 — Understanding LTE / 5G Fractional Power Control

### The formula, term by term

The uplink transmit power of a UE (on the PUSCH, the uplink data channel) in slot *i* is:

**P = min{ P_max , P₀ + α·PL + 10·log₁₀(M) + Δ_TF + f(i) }**  (all terms in dB/dBm)

| Term | What it is | Why it's there |
|---|---|---|
| **P_max** | The UE's maximum allowed output power (typically **23 dBm = 200 mW** for a normal phone, "power class 3"). | Hardware/regulatory ceiling. The `min{}` means: whatever the formula asks for, you can never exceed this. |
| **P₀** | Target received power *per resource block* at the gNB/eNB (dBm). Has a cell-specific part and a UE-specific part. | Sets the baseline "how loud should a UE's signal arrive at the base station." Higher P₀ → higher SINR targets but more interference. |
| **α·PL** | Fractional path-loss compensation. PL is the downlink path loss the UE estimates (reference-signal transmit power minus measured RSRP). α ∈ [0, 1] (LTE allows 0, 0.4, 0.5 … 0.9, 1). | **The key knob.** It decides how much of the extra loss of a far-away UE is made up by transmitting louder. |
| **10·log₁₀(M)** | M = number of resource blocks allocated to the UE. | P₀ is a *per-RB* target. If you're given twice the bandwidth (2× RBs), you need twice the total power (+3 dB) to keep the same power spectral density. |
| **Δ_TF** | Transport-format adjustment. | Higher-order modulation/coding (more bits per resource element) needs higher SINR, so the UE adds power when it's sending a "denser" MCS. |
| **f(i)** | Closed-loop correction accumulated from **TPC (Transmit Power Control) commands** sent by the gNB in the DCI (e.g., −1, 0, +1, +3 dB). | Everything before this is **open-loop** (the UE's own estimate). Open-loop estimates have errors (fading, imperfect PL estimation, UL/DL differences). The gNB measures what actually arrives and nudges the UE up/down. |

**Open-loop vs closed-loop:** P₀ + α·PL is open-loop — the UE computes it alone from its own measurement. f(i) is closed-loop — feedback from the receiver. Real systems use both: open loop gets you roughly right quickly; closed loop fine-tunes.

### The graph — UE Tx power vs. path loss

- **x-axis:** path loss from 80 dB to 140 dB — moving right means moving farther from the gNB (or deeper indoors, behind buildings, etc.).
- **y-axis:** UE transmit power in dBm.
- **Dashed grey line:** the P_max ceiling (~23 dBm).
- **Red line (α = 1.0, full compensation):** power climbs steeply with path loss. Every extra dB of loss is fully paid back with an extra dB of transmit power, so the received power at the gNB stays constant at P₀. But it **hits the ceiling at ~130 dB** — beyond that the UE cannot compensate anymore and its received power starts dropping anyway.
- **Green line (α = 0.7, fractional):** power climbs more gently. Only 70 % of each extra dB of loss is compensated. At 140 dB it's still around 20 dBm — **below the ceiling**.

> Note: the chart is schematic. In the real formula the slope of each line is exactly α (1 dB of extra power per dB of path loss for α = 1, 0.7 dB per dB for α = 0.7). The picture's message — steeper red, gentler green, red saturates first — is what matters.

### Why α < 1? (the boxed takeaway)

With **full compensation**, every UE arrives at the gNB with the same received power, which sounds fair. But cell-edge UEs are, by definition, **close to neighbouring cells**. When they shout at full power to overcome their large path loss, that signal also lands at the neighbour's base station with considerable strength → **uplink inter-cell interference** rises for everyone.

With **fractional compensation (α ≈ 0.7–0.8):**
- Cell-centre UEs (small PL) transmit with relatively *more* margin and get high SINR → high MCS → high throughput.
- Cell-edge UEs get a *weaker* received signal (lower SINR, lower data rate) — but they generate **much less interference** into neighbouring cells.
- Net result: **higher total system throughput** and better average spectral efficiency, at the cost of some fairness to edge users. It's a deliberate throughput-vs-fairness trade-off.
- Secondary benefit: edge UEs aren't stuck at P_max all the time → **battery savings**.

**Extreme cases:** α = 0 → every UE transmits the same power regardless of position (no compensation; edge users suffer badly). α = 1 → classic full power control (constant received power; maximum interference from edge users).

---

## Slide 27 — How Capacity Is Measured Now

### Why "channels per cell" is obsolete

In 1G/2G, capacity meant *how many simultaneous calls a cell can carry*. Each call used a fixed-rate circuit (e.g., one 30 kHz AMPS channel, or one GSM timeslot). Capacity = (total channels) / (cluster size N) → channels per cell → Erlang-B for blocking. That works only when **every user gets the same fixed rate**.

Modern links use **adaptive modulation and coding (AMC)**: the same resource block might carry QPSK rate-1/3 for a user at the edge or 256-QAM rate-0.9 for a user near the tower — a ~20× difference in bits. "How many channels?" no longer captures how much data you can move, so capacity is measured in bits/s at three levels:

### ◆ Link level: C = B·log₂(1 + SINR)

- **Shannon capacity** (from Topic 2): the theoretical maximum error-free rate over bandwidth B at a given SINR.
- In practice the UE reports **CQI** (Channel Quality Indicator) reflecting its SINR, and the gNB picks an **MCS** (modulation and coding scheme) from a table. Each MCS delivers a certain number of bits per resource element. Practical systems run ~2–3 dB below the Shannon bound.
- Example: SINR = 15 dB ≈ 31.6 → log₂(32.6) ≈ 5.03 bit/s/Hz; on 20 MHz that's ~100 Mb/s theoretical.

### ◆ Cell level: spectral efficiency (bit/s/Hz per cell)

- Total cell throughput divided by the bandwidth it uses. Averages over all users at their various SINRs.
- Typical: ~1.5–3 bit/s/Hz/cell for LTE macro, 5–10+ for 5G with massive MIMO (because of multiple spatial layers).

### ◆ Network level: area spectral efficiency (bit/s/Hz/km²)

- Spectral efficiency per cell × number of cells per km². This is what captures **densification**: ten small cells in a square kilometre, each at 3 bit/s/Hz, beat one macro at 6 bit/s/Hz.

### The planning identity

**Throughput (per km²) ≈ Bandwidth [Hz] × Spectral efficiency [bit/s/Hz/cell] × Cell density [cells/km²]**

Check the units: Hz × (bit/s/Hz) × (1/km²) = bit/s/km². ✔

This identity organises the rest of the topic: **every capacity technique increases one of these three terms.** That's exactly the three "levers/layers" on the next slide.

---

## Slide 28 — Three Layers (Levers) for Capacity

*(The slide headings say "Leyer" — read it as "Layer/Lever".)*

| Lever | Term in the identity | Examples | Character |
|---|---|---|---|
| **1 — More spectrum** | Bandwidth | Buying licences at auction, carrier aggregation, new bands (3.5 GHz, mmWave), unlicensed/shared spectrum | Simple (no new sites), but **expensive** (auctions cost billions) and **finite** — physics and regulators limit how much exists, especially at good (low) frequencies. |
| **2 — More cells** | Cell density | Cell splitting, small cells, HetNets | The most powerful lever historically (most capacity growth since the 1950s came from smaller cells), but needs **sites, backhaul and power** — real estate and civil works. |
| **3 — More bits per hertz** | Spectral efficiency | MIMO, beamforming, higher-order modulation (256/1024-QAM), smarter scheduling, interference coordination | Pure technology; constrained by SINR and by Shannon. |

### How the classical techniques map onto the levers

- **Cell splitting** → lever 2 (more cells). **Sectoring** → lever 3 (higher SIR lets you use a smaller reuse factor N, so more channels per cell; it's the ancestor of beamforming). Neither needs new spectrum.
- **Dynamic Channel Assignment (DCA)** → better use of spectrum the operator *already* holds (effectively raising the useful bandwidth/efficiency without buying more).

### "Modern networks pull all three at once"

A 5G deployment typically adds 100 MHz of new 3.5 GHz spectrum (L1), deploys it on denser sites plus small cells (L2), and uses 64T64R massive MIMO with 256-QAM (L3). The gains **multiply**: e.g., 5× bandwidth × 3× efficiency × 2× density ≈ 30× capacity.

---

## Slide 29 — Layer 1: More Spectrum

### Carrier Aggregation (CA)
- Combines several **component carriers (CCs)** into one logical wide pipe for a single UE. NR supports **up to 16 CCs** (LTE-A started with 5 × 20 MHz = 100 MHz).
- CCs can be contiguous or non-contiguous, in the same band or different bands (inter-band CA).
- Typical strategy: a **low band** CC as the **primary cell (PCell)** for robust coverage and control signalling, plus **mid/high band** CCs as **secondary cells (SCells)** for raw capacity, activated only when the UE is close enough / has enough data.

### Dynamic Spectrum Sharing (DSS)
- An operator with LTE in, say, 1800 MHz doesn't want to empty that band before 5G phones are widespread. DSS lets **LTE and NR run on the same carrier**, with the split of resources between them decided **dynamically, per slot (1 ms)**, according to how much traffic each technology has.
- Cost: some overhead because NR must work around LTE's always-on reference signals (CRS) — so DSS is less efficient than a dedicated NR carrier, but it gives instant NR coverage on existing bands.

### New bands
- **3.5 GHz mid-band (n77/n78) is the "5G workhorse":** 60–100 MHz per operator — far more than typical LTE carriers (10–20 MHz) — with still-reasonable coverage (a few hundred metres to ~1–2 km), especially when massive MIMO beamforming adds gain.
- **FR2 mmWave (24–40+ GHz):** huge carriers of 100–400 MHz, but propagation is short (~100–200 m), blocked by walls, bodies, foliage, even rain. Good for hotspots (stadiums, streets), fixed wireless.

### Unlicensed & shared
- **NR-U:** NR running in unlicensed 5 GHz and 6 GHz bands, using **Listen-Before-Talk** to coexist fairly with Wi-Fi.
- **CBRS-style shared access:** a tiered, database-controlled sharing model (detailed on slide 30) — protects incumbents from interference while letting new users in.

### The trade-off figure
**Low band <1 GHz** (~10 MHz, km-scale reach) → **Mid-band 3.5 GHz** (60–100 MHz, balanced) → **mmWave 24–40 GHz** (100–400 MHz, ~100 m reach).

Why does reach shrink as frequency rises? (1) Free-space path loss with fixed-gain antennas grows as 20·log₁₀(f) — doubling frequency adds 6 dB of loss; (2) penetration and diffraction losses rise sharply with frequency; (3) wider bandwidth means more noise power (N = kTB), lowering SNR. Why is there more bandwidth up high? Simply because a given *percentage* of spectrum is far more hertz at 30 GHz than at 700 MHz, and those bands were less occupied.

**Conclusion: higher frequency → more bandwidth but less coverage → you must densify** — lever 1 drives lever 2.

---

## Slide 30 — Spectrum Techniques: How They Work

### 1) Carrier Aggregation figure
**Low 20 MHz + Mid 3.5 GHz 100 MHz + High/mmW 100 MHz → Aggregated (up to 16 CCs) = one high-rate link.**
- The UE's peak rate ≈ sum of the rates of each CC. The low-band CC keeps the connection alive (coverage, mobility); the higher CCs are where the throughput comes from.
- The scheduler can send data on whichever CCs have good conditions at any moment — a form of frequency diversity too.

### 2) Dynamic Spectrum Sharing figure
- Each bar is **one slot**; gold = LTE share, blue = NR share. The split changes from bar to bar — in some slots LTE gets most resources (lots of LTE users active), in others NR takes most.
- Key point: it's *not* a fixed 50/50 split. Static splits waste resources when one technology is idle; DSS follows demand.

### 3) CBRS Shared Access (3.5 GHz, 3550–3700 MHz in the US)
A three-tier priority system, coordinated by a cloud database called the **SAS (Spectrum Access System)**:

| Tier | Who | Rights |
|---|---|---|
| **Tier 1 — Incumbents** | US Navy radar, fixed satellite earth stations | **Always protected.** When radar is detected near the coast (by sensors), lower tiers must vacate the affected channels. |
| **Tier 2 — PAL (Priority Access Licence)** | Operators that won auctioned, **county-level** licences (10 MHz channels) | Protected from Tier 3, but must yield to Tier 1. |
| **Tier 3 — GAA (General Authorized Access)** | Anyone with certified equipment — enterprises, private LTE/5G networks | **Free, opportunistic**; uses whatever isn't taken; no protection. |

The SAS knows where every radio is (base stations register their location/power), computes interference, and **assigns channels and power limits** to each one so that each tier is protected from the tiers below it. It's the template for "dynamic, database-driven spectrum sharing" that regulators now use elsewhere.

---

## Slide 31 — Layer 2: Densification — Cell Splitting to HetNets

### Cell splitting — why 4× cells gives 4× capacity
- Cell area ∝ R². **Halving the radius** → each cell covers 1/4 of the area → you need **about 4× as many cells** to cover the same region.
- Each new cell reuses the same spectrum (same channels per cell, same reuse pattern scaled down). Total channels in the area = channels per cell × number of cells → **~4× capacity**.
- In general: capacity gain ≈ (R_old / R_new)².
- The co-channel SIR doesn't change because the geometry scales uniformly — D/R (= √(3N)) stays the same; transmit power is lowered so cells don't overshoot. (Rule of thumb: for path-loss exponent n, P_new = P_old − 10·n·log₁₀(2); for n = 4 that's 12 dB lower.)

### The figure
- **Before:** one large hexagon (radius R) with one site.
- **After:** four smaller hexagons (radius R/2), each a different colour (each its own site/cell) → "Same area, ~4× cells → ~4× capacity."

### Costs of splitting
- **More sites** (rent, construction, permits), **more backhaul** connections, **more handovers** (a moving user crosses cell boundaries 2× as often — more signalling, more chances of dropped calls), **harder planning** (frequency/PCI/neighbour lists).

### HetNet = modern form
- **Heterogeneous Network:** a **macro "umbrella"** layer provides wide coverage and handles fast-moving users, while **small cells** (micro/pico/femto) are dropped **only where traffic hotspots are** (malls, stations, campus).
- You don't split the whole cell uniformly — you add capacity surgically.
- **Reuse partitioning** (from classical cellular theory) was the early version: dividing a cell into inner/outer zones with different reuse factors — the inner zone (high SIR) can reuse channels more aggressively.

### Inter-layer interference
In a HetNet small cells usually **share the same carrier** as the macro (co-channel deployment — otherwise you'd waste spectrum). That creates strong macro→small-cell-user interference. The fix is **eICIC and range expansion** (time-domain coordination and biased association, slide 32), **not** giving each layer a separate frequency.

---

## Slide 32 — Interference Coordination in HetNets

> **Margin-note correction:** you wrote "inter-carrier interference coordination." ICIC stands for **Inter-Cell Interference Coordination** — it's about interference *between neighbouring cells* on the same carrier, not between carriers.

### 1) ICIC — frequency domain (LTE Release 8)
- **Figure:** Cell A and Cell B each use **all frequencies in their centre**, but their **cell-edge users** are restricted to **different sub-bands (f1 for A, f2 for B)**. So the two edges never collide.
- **Why it works:** cell-centre users are close to their own tower and far from the neighbour → high SIR even with full reuse. Edge users are the ones vulnerable to interference, so only they need orthogonal resources.
- This is called **Fractional Frequency Reuse (FFR)** or **Soft Frequency Reuse (SFR)** — reuse 1 in the centre, reuse 3 (or similar) at the edge. Neighbouring cells exchange load/interference indicators over the **X2 interface** (e.g., RNTP, HII, OI messages) to coordinate.
- **Limitation:** it only protects *data* channels; LTE control channels (PDCCH) span the whole band, so ICIC can't protect them — a big problem in HetNets. That leads to eICIC.

### 2) eICIC — time domain (LTE Release 10, "enhanced" ICIC)
- **Figure:** the macro row shows mostly blue (active) subframes with some grey **ABS (Almost Blank Subframes)**. In the small-cell row, the **green "protected" subframes line up exactly with the macro's ABS**.
- **ABS:** the macro sends no data and no control in those subframes — only the minimal must-have signals (cell reference signals, sync, broadcast) — hence "almost" blank.
- The small cell schedules its **vulnerable edge users** in those protected subframes, when the powerful macro is quiet. Users close to the small cell can be served in any subframe.
- **Cost:** the macro loses airtime (e.g., muting 2/8 subframes = 25 % macro capacity), so the ABS ratio is tuned to how much traffic the small cells take.
- Why time domain? Because it protects **both control and data** (the whole subframe is quiet), solving ICIC's control-channel problem.

### 3) CRE — Cell Range Expansion
- **Problem:** UEs normally attach to the cell with the strongest received signal (RSRP). A macro transmits at ~40–46 dBm, a pico at ~24–30 dBm → the pico's "strongest-signal" footprint is tiny, so it barely offloads anything.
- **Fix:** add a **bias** (e.g., +6 to +9 dB) to the small cell's measured RSRP when making cell-selection/handover decisions. The UE attaches to the small cell even if the macro is slightly stronger.
- **Figure:** a small cell with a solid inner circle (natural footprint) and a dashed outer circle (expanded with bias). The red dot is a UE in the extra ring — it now attaches to the small cell and is **offloaded from the macro**.
- **Catch:** UEs in that expanded ring actually receive the macro *more strongly* than their serving pico → terrible SINR. That's precisely why **CRE and eICIC go together**: the expanded-zone UEs are scheduled in the macro's ABS subframes.

---

## Slide 33 — Small Cells in Practice

### Definition
A **low-power node (250 mW – 5 W)** covering **50–300 m**, placed **where traffic concentrates rather than where coverage is missing**. (Compare a macro: 20–80 W per carrier, km-scale.) The purpose is capacity, not coverage — the macro already provides coverage.

### Forms
- **Outdoor micro/pico** mounted on **street furniture** (lamp posts, bus stops, walls).
- **Indoor pico and femto** — femtocells are consumer/enterprise devices using the customer's broadband for backhaul.
- **Radio dots / DAS (Distributed Antenna Systems)** in venues (stadiums, airports, malls): many small antennas fed from a central unit so the whole building gets uniform service.

### "The hard part is not radio"
What actually limits small-cell rollout: **site acquisition** (getting permission to mount on a city lamp post), **mains power** at the site, **planning permission** (municipal approvals), and **rent**. Engineering is the easy part; real estate and logistics decide what gets built.

### Backhaul options (the figure)
- **Macro (coverage layer)** on the left with the **macro umbrella** arc overhead.
- **Pico ~100 m with fibre** — best option where fibre exists (high capacity, low latency).
- **Pico ~100 m with mmWave PtP** — a point-to-point microwave/mmWave radio link to an aggregation point when fibre isn't available.
- **IAB node (no fibre)** — **5G Integrated Access and Backhaul**: the small cell is backhauled **by the macro over the air**, using the same NR radio. The macro "donor" serves both normal UEs and the IAB node; zero trenching needed.
- **Indoor venue with radio dots / DAS.**
- Banner note: **each small cell reuses the whole carrier → capacity ≈ number of cells.**

### Interference handling
eICIC ABS, CRE, and **coordinated scheduling** (CoMP-style) — **not** separate frequencies, because reusing the full carrier is what makes small cells worthwhile.

### Limits
**Cost per delivered Gb/s** (if a small cell sits in a spot with little traffic, it's expensive per bit), **backhaul availability**, **handover load** (fast users ping-pong through tiny cells — usually kept on the macro), and **energy per site** (many small sites each draw baseline power even when idle).

---

## Slide 34 — Example: What a Small-Cell Layer Buys

**Q.** Macro sector: 100 MHz, average SE = 6 bit/s/Hz. Add 6 picos reusing the same 100 MHz, each 4 bit/s/Hz after interference coordination. Compare capacity and cost.

**Step 1 — Macro alone:** C = B × SE = 100 MHz × 6 bit/s/Hz = **600 Mb/s**

**Step 2 — Each pico:** 100 MHz × 4 bit/s/Hz = **400 Mb/s**
(Lower SE than the macro because picos suffer interference from the macro and each other, even with eICIC.)

**Step 3 — Pico layer:** 6 × 400 Mb/s = **2.4 Gb/s**

**Step 4 — Total:** 600 Mb/s + 2.4 Gb/s = **3.0 Gb/s → 5× macro-only, no new spectrum.**
This is the planning identity at work: B unchanged, SE per cell slightly lower, but **cell density ×7** dominates.

> (Simplification: in reality the macro's own SE drops a bit after adding picos — ABS muting and extra interference — but the order of magnitude holds.)

**Cost check:**
- Picos: 6 × $15k = $90k for 2.4 Gb/s → $90,000 / 2,400 Mb/s ≈ **$37.5 per Mb/s**
- New macro: $150k for 600 Mb/s → **$250 per Mb/s**
- Picos are **~6.7× cheaper per unit of capacity** — *if* they are placed where the traffic actually is.

**Offloading bonus:** traffic moved to picos frees macro PRBs → users who stay on the macro get a bigger share of 600 Mb/s → **everyone's** throughput improves, not just pico users.

---

## Slide 35 — Layer 3a: Sectoring to Beamforming

### Sectoring
Replace one **omnidirectional** antenna with **3 × 120°** or **6 × 60°** directional antennas at the same site. Each sector is effectively its own cell.

**Why SIR improves.** With omni antennas and reuse N, a cell has **6 first-tier co-channel interferers**. With directional antennas, a sector only "sees" (and is seen by) the interferers in front of it:
- 120° sectors → **2** first-tier interferers (worst case)
- 60° sectors → **1** interferer

Using the classic approximation S/I = (D/R)ⁿ / i₀ with Q = D/R = √(3N), n = 4, N = 7:
- Omni: Q⁴ = (4.58)⁴ ≈ 441 → S/I = 441/6 ≈ 73.5 → **18.7 dB**
- 120° sectoring: 441/2 ≈ 220 → **23.4 dB** (≈ +4.8 dB, i.e., 10·log₁₀(6/2))

Because SIR now has margin above what's required (e.g., 18 dB for AMPS), you can **lower N** (e.g., from 7 to 4) — a smaller cluster means more channels per cell → more capacity. That's the "**a smaller N becomes acceptable**" bullet.

**Costs:** each cell's channels are **split among sectors** (trunking efficiency drops — three small pools block more than one big pool), **more handovers** (inter-sector handovers), more antennas, more complex planning.

### The figure
- **Left:** hexagonal cluster where some cells are divided into **3 sectors (1, 2, 3)** — 120° sectoring.
- **Right:** cells divided into **6 sectors (1–6)** — 60° sectoring.

### From sectors to beams
- **"A beam is a sector that can be steered, per user and per slot."** A sector's pattern is fixed when the antenna is installed. A beam is formed electronically by an antenna array by adjusting the phase/amplitude on each element — it can point at a specific user and change every slot.
- **Analogue beamforming:** phase shifters in the RF path; one beam at a time per RF chain; cheap, used at mmWave.
- **Digital beamforming:** each antenna element has its own RF chain and ADC/DAC; weights applied in baseband; many simultaneous beams; flexible but expensive/power-hungry.
- **Hybrid:** a few digital RF chains each driving an analogue sub-array — the practical compromise for large arrays.
- **"Same physics — antenna directivity — applied dynamically":** both sectoring and beamforming improve SIR by concentrating energy toward the intended receiver and away from others. Beamforming just does it adaptively and much more narrowly.

---

## Slide 36 — Layer 3b: MIMO and Massive MIMO

### SU-MIMO (Single-User MIMO)
- Several **spatial layers** (independent data streams) sent to **one user** over the same time-frequency resource. *(Your note: "base station communicating with one user" — correct.)*
- **Max layers = min(N_Tx, N_Rx)**, but the usable number equals the **rank** of the channel matrix H. Capacity grows ~linearly with that rank: C ≈ min(N_t, N_r) · B · log₂(1 + SNR/…).
- **Rich scattering** (many reflections, typical in cities/indoors) makes the paths from each Tx antenna look different → H well-conditioned → high rank.
- **Pure line-of-sight:** all antennas see nearly the same path → H is rank ~1 → the multiplexing gain **collapses**.
- Figure: one tower → **2 layers, one user** (two arrows to one phone).

> **Your margin note — "high SNR: multiplexing, low SNR: diversity":** exactly right. At high SNR, capacity is limited by degrees of freedom, so sending several streams (spatial multiplexing) multiplies the rate. At low SNR, each stream would be too weak, so it's better to send one stream redundantly across antennas (diversity/beamforming gain) to boost reliability and SNR. Real systems switch adaptively using the reported **rank indicator (RI)**.

### MU-MIMO / SDMA (Space-Division Multiple Access)
- **One time-frequency resource, several users.** Users are separated **by beams (space), not by frequency or time**.
- Figure: "same PRBs, 3 users separated in space" — three beams of different colours.
- **The precoder places a null on each user at the others' positions** (zero-forcing precoding): user A's beam is designed so that its signal is (almost) zero at users B and C, and vice versa → minimal inter-user interference.
- Advantage over SU-MIMO: the phones only need 1–2 antennas each; the base station's large array does the work.

### Massive MIMO (32T32R to 64T64R)
- "64T64R" = 64 transmit and 64 receive chains (often 192 physical elements grouped into 64 ports).
- **Array gain = 10·log₁₀(M):** coherently combining M antennas raises received SNR by a factor of M. 64 → 10·log₁₀(64) ≈ **18 dB**. (That's like transmitting 64× the power — enough to compensate much of the 3.5 GHz path-loss penalty.)
- **Narrow beams** put energy only toward the target → **less interference into neighbouring cells** (and the neighbours' users).
- Figure: "narrow beams, array gain 10·log₁₀(64) = 18 dB," serving four users.

### The gNB must know the channel (CSI)
Beamforming/precoding needs H. Two ways:
- **TDD — uplink SRS + reciprocity.** In TDD, uplink and downlink use the same frequency (just different times), so the channel is the same in both directions (**reciprocity** — *your note: "both channels behave similarly / are equal"*). The UE sends a **Sounding Reference Signal (SRS)** on the uplink; the gNB estimates the uplink channel from it and uses that directly for the downlink. Cheap and scales to 64 antennas — that's why massive MIMO is mostly a TDD story (3.5 GHz is TDD).
  - *Your note on SRS — "reference signal ... estimating the channel / how much power I'm getting from you":* SRS is a known pilot sequence; because the gNB knows what was sent, it compares to what it received to estimate the channel's gain and phase per antenna.
- **FDD — CSI-RS + PMI feedback.** Uplink and downlink are on different frequencies → reciprocity doesn't hold. The gNB sends **CSI-RS (CSI Reference Signals)** on the downlink; the UE measures them and **reports** back a **PMI (Precoding Matrix Indicator)** — an index into a pre-agreed codebook of precoders — plus RI and CQI. *(Your note: "Report + indicate".)* Feedback overhead grows with antenna count, which limits FDD massive MIMO.

### Beam management
At mmWave especially, the gNB and UE must find each other's beams:
1. **SSB sweeping:** the gNB transmits Synchronization Signal Blocks in different directions one after another; the UE reports the best one (initial access).
2. **Refinement:** narrower CSI-RS beams around the chosen direction (P2/P3 procedures) for the gNB and UE to fine-tune.
3. **Beam failure recovery:** if the link is blocked (someone walks in front), the UE detects failure and quickly switches to a candidate beam instead of dropping the connection.

---

## Slide 37 — Capacity Gain from Massive MIMO (Example)

**Given:** B = 100 MHz at 3.5 GHz; 64T64R array *(your note: 64 transmitters, 64 receivers at the base station)*; MU-MIMO serves 8 users × 2 layers; per-layer SE = 4 bit/s/Hz after beamforming; overhead factor 0.85.

**Overhead factor 0.85** *(your note — "a percent of rate will reduce efficiency and is used for control" — correct)*: only 85 % of resources carry user data; the other ~15 % go to control channels (PDCCH), reference signals (DMRS, CSI-RS, SSB), guard periods in TDD, etc.

**Step 1 — Spatial layers:** 8 users × 2 layers = **16 layers**

**Step 2 — Cell throughput:**
T = layers × B × SE × overhead = 16 × 100×10⁶ × 4 × 0.85 = **5.44 Gb/s ≈ 5.4 Gb/s**

**Step 3 — Baseline with only 2 layers (SU-MIMO 2×2):**
2 × 100×10⁶ × 4 × 0.85 = **0.68 Gb/s** → ratio 16/2 = **8× gain**

**Step 4 — Array gain:** 10·log₁₀(64) = **18 dB** — this is what lifts per-layer SINR high enough to sustain 4 bit/s/Hz on every one of the 16 layers.

**Key insight:** the extra capacity comes **from space, not spectrum** — the same 100 MHz is **reused 16 times inside one cell**. That's lever 3 working like lever 2 (spatial reuse inside one cell instead of across cells).

**Limits:**
- **Users must be spatially separable** — if two users are in the same direction (e.g., same window of a building), their channels are correlated and the precoder can't null one without hurting the other. The scheduler picks "compatible" users to pair.
- **Each layer needs its own RF chain and CSI** — 16 layers need 16 accurate channel estimates refreshed often (SRS overhead), plus baseband processing that scales with antennas × layers.

---

## Slide 38 — Comparison of FCA and DCA

**FCA (Fixed Channel Assignment):** each cell is permanently given a set of channels according to the reuse plan. A call can only use its cell's channels (or be blocked / borrow).
**DCA (Dynamic Channel Assignment):** all channels sit in a common pool; a channel is assigned to a call on demand, as long as it doesn't violate the reuse-distance (interference) constraint.

| Attribute | FCA | DCA | Why |
|---|---|---|---|
| **Traffic load** | Better under **heavy** load | Better under **light/moderate** load | At light load, DCA can hand any idle channel to a busy cell → less blocking. At heavy load, every cell is busy; DCA's on-demand choices tend to scatter channels sub-optimally (not packed at minimum reuse distance), so it ends up with *lower* reuse efficiency than FCA's carefully optimised plan. |
| **Flexibility** | Low | High | FCA can't react to hotspots. |
| **Reusability** | Limited | Maximum possible | DCA can reuse a channel anywhere the interference constraint allows. |
| **Temporal & spatial changes** | Very sensitive | Insensitive | A traffic surge in one cell overwhelms FCA's fixed set; DCA absorbs it. |
| **Forced call termination** | High probability | Low/moderate | During handover, the target cell under FCA may have no free channel → dropped call. |
| **Radio equipment** | Tunes only to allocated channels | Must cover all possible channels | Every DCA base station needs to be able to transmit on any channel in the pool → more expensive radios. |
| **Computational effort** | Low | High | DCA checks interference constraints at every assignment. |
| **Call set-up delay / signalling** | Low | Moderate/High | DCA must look up/coordinate channel availability (possibly with neighbours). |
| **Implementation complexity** | Low | Moderate/High | |
| **Frequency planning** | Lengthy and complex | Not needed | FCA needs a full reuse plan redone when cells are added. |
| **Control** | Centralized | Centralized, decentralized, or distributed | DCA can be run by a central controller (MSC) or by each base station sensing locally. |

**Exam angle:** know the two counter-intuitive rows — FCA wins at **heavy** load, and DCA needs radios that cover **all** channels. Hybrid schemes (HCA: some fixed + some dynamic channels) and **channel borrowing** sit in between.

---

## Slide 39 — LTE Radio vs New Radio (NR)

### NR keeps OFDM, but makes everything negotiable
LTE fixed almost every parameter in the standard (15 kHz subcarriers, 1 ms subframe, ≤20 MHz carrier). NR lets the operator choose **subcarrier spacing, slot length, bandwidth and duplex pattern per deployment** — because one 5G system must serve 700 MHz rural coverage and 28 GHz stadium hotspots, eMBB phones and URLLC robots.

### Scalable numerology — the key idea
- SCS = 15 kHz × 2^μ, μ = 0,1,2,3 → 15, 30, 60, 120 kHz.
- One slot is always **14 OFDM symbols**. Symbol duration ∝ 1/SCS, so wider subcarriers → shorter symbols → **shorter slots**: 1 ms, 0.5 ms, 0.25 ms, 0.125 ms.
- A 1 ms **subframe** remains the fixed time reference; it contains 2^μ slots.

> **Your margin notes:** "slot fixed at 1 ms" (LTE) vs "slot changes after 1 ms — slot is 0.5 ms so you need two slots." Exactly: at 30 kHz SCS a slot is 0.5 ms, so **two slots fit into each 1 ms subframe**; at 60 kHz, four; at 120 kHz, eight. In LTE the scheduling unit was locked at 1 ms.

- Why it matters: short slots → low latency (URLLC); wide subcarriers also tolerate more **phase noise and Doppler** at high frequencies (mmWave needs 120 kHz). Narrow subcarriers → longer cyclic prefix → better for large cells with long delay spread. **One air interface** serves both.

### Beam-based from the start
LTE's control channels and reference signals were broadcast over a fixed sector pattern, which limits beamforming. NR designed everything — synchronization (SSB), control, reference signals — around **steerable beams**, which is what makes massive MIMO and mmWave practical.

### Lean carrier
LTE's **cell-specific reference signals (CRS)** are transmitted on every subframe, across the whole band, **even with zero users** → constant interference + constant power use. NR removes always-on signals: only a periodic **SSB** (e.g., every 20 ms) plus **on-demand CSI-RS** for active users → less interference, better energy saving (links to slides 42–43).

### The comparison table

| Feature | LTE and earlier | 5G NR | Comment |
|---|---|---|---|
| Waveform | OFDM down, SC-FDMA up | CP-OFDM both ways (DFT-s-OFDM optional up) | SC-FDMA = DFT-spread OFDM; lower PAPR for battery-limited UEs (Topic 2). NR offers it as an option for coverage-limited UL. |
| Subcarrier spacing | fixed 15 kHz | 15/30/60/120 kHz | numerology |
| Slot duration | 1 ms, fixed | 1 ms down to 0.125 ms, plus **mini-slots** | mini-slots = 2, 4 or 7 symbols, transmission can start anywhere → URLLC |
| Carrier bandwidth | up to 20 MHz (100 MHz with CA) | up to 100 MHz (FR1), 400 MHz (FR2) | single carrier is as wide as LTE's aggregated maximum |
| Frequency range | below ~6 GHz | FR1 to 7.125 GHz + FR2 24.25–71 GHz | mmWave support |
| Duplexing | FDD or static TDD pattern | flexible and dynamic TDD | slot formats can change per slot to match UL/DL demand |
| Antennas | up to 8 layers, fixed sector beams | massive MIMO 64T64R, beam-based | |
| Always-on signals | CRS everywhere | lean: SSB + on-demand CSI-RS | |
| Channel coding | turbo (data), convolutional (control) | **LDPC (data), polar (control)** | LDPC: highly parallel decoding → multi-Gb/s; polar codes: near-capacity for short control messages |
| Latency target | ≈10 ms user plane | ≈1 ms, with **grant-free uplink** | grant-free (configured grant): UE transmits without asking first, skipping the request/grant round-trip |

**References:** 3GPP TS 38.300 (NR overall description), TS 38.211 (physical channels and modulation).

---

## Slide 40 — Channel Assignment: The NR Scheduler

### "In effect, DCA won"
FCA fixed channels per cell; DCA allocated them on demand. Modern OFDMA systems are the ultimate DCA: **every slot**, the **MAC scheduler** in the gNB decides which user gets which resources — no frequency planner in the loop. (Reuse-1 is now standard; interference is handled by power control, ICIC and beams rather than by fixed channel plans.)

### Resource unit: the Resource Block (RB/PRB)
- **12 subcarriers × one slot (14 symbols)**. Bandwidth of one RB = 12 × SCS: 180 kHz at 15 kHz, 360 kHz at 30 kHz, 1.44 MHz at 120 kHz.
- A 100 MHz carrier at 30 kHz SCS has 273 RBs.

### Numerology
15/30/60/120 kHz SCS; slots from 1 ms to 0.125 ms → the scheduler can decide as often as every 125 µs.

### Bandwidth Parts (BWP)
A UE may not support (or need) the full 100–400 MHz carrier. A **BWP** is a contiguous subset of RBs configured for that UE. Benefits: low-cost devices, and **power saving** — the gNB switches a UE to a narrow BWP when it's idle-ish and to a wide one for a burst of data (RF front-end and ADC power scale with bandwidth).

### Scheduling policies
| Policy | Rule | Pros | Cons |
|---|---|---|---|
| **Round Robin** | Users take turns regardless of channel | Perfect time-fairness | Ignores channel quality → low throughput |
| **Max C/I** | Serve the user with the best instantaneous channel | Maximum cell throughput | Edge users starve |
| **Proportional Fair (PF)** | Serve user maximising **r_i(t) / R̄_i(t)** — instantaneous achievable rate divided by its average past throughput | Exploits fading peaks (multi-user diversity) while staying fair | Practical compromise — used by real schedulers |

> **Your margin note — "if your [average] is low you will get more resources":** yes, that's the PF denominator. A user that has been served little has a small R̄, so its metric grows and it gets scheduled — but preferably at a moment when its own channel is at a local peak.

### QoS
- Each data flow is tagged with a **5QI (5G QoS Identifier)**, a scalar (standardised values like 1 = conversational voice, 9 = default best-effort; range up to 255) that maps to priority, packet delay budget, and error rate.
- **GBR (Guaranteed Bit Rate)** flows (voice, video calls) get reserved resources; **non-GBR** flows share what remains.
- **Per-slice resource shares:** with **network slicing**, the scheduler also enforces that, e.g., an URLLC slice gets ≥20 % of PRBs, independent of the eMBB slice's load.

---

## Slide 41 — What Is the RAN?

### Definition
**Everything between the user's antenna and the mobile core:** base stations, their antennas and radios, and the **transport** that connects them (fronthaul/midhaul/backhaul).

### The figure (top): "The RAN is everything between the antenna and the core"
**User Equipment ⟷ (radio) ⟷ RAN [scheduling · power control · retransmission · handover · interference management] ⟷ (backhaul) ⟷ Mobile Core ⟷ Internet/services.**

### Division of labour
- **RAN = decisions at radio speed** (sub-millisecond to milliseconds): **scheduling** (slide 40), **power control** (slide 26), **retransmission** (HARQ — must respond within a few slots), **handover** execution, **interference management** (ICIC/eICIC, beams).
- **Core = identity, mobility state, policy, internet access:** authentication (AUSF/UDM in 5GC), tracking where an idle UE is (AMF), QoS/charging policy (PCF), and the gateway to the internet (UPF). These happen on slower timescales and are centralised.

### Where the money and difficulty are
- **~60–70 % of network capex** goes to the RAN (tens of thousands of sites, each with radios, antennas, towers, power).
- **Most site energy** (slides 42–43).
- **All of the physics**: fading, interference, propagation are RAN problems.

### Same job, restructured every generation (figure, bottom)
| Generation | RAN name | Structure | Meaning |
|---|---|---|---|
| **2G GSM** | BSS | **BTS + BSC** | Radio (BTS at site) separated from control (BSC controlling many BTSs). |
| **3G UMTS** | UTRAN | **NodeB + RNC** | A powerful central controller (RNC) owns radio logic (e.g., soft handover combining, power control). |
| **4G LTE** | E-UTRAN | **eNB only** | **Flat:** the controller is removed; all radio intelligence is in the base station → lower latency. eNBs talk to each other directly over X2. |
| **5G NR** | NG-RAN | **gNB = CU + DU + RU** | The base station itself is **split** into functions that can live in different places. |

**Trend to remember:** **centralised control → flat → disaggregated and software-controlled.** The rest of the topic follows that line (slides 44–45).

---

## Slide 42 — Energy-Efficient RAN

Five techniques plus the motivation:

1. **Cell sleep modes** — switch a **whole cell off** when another layer or band (e.g., the low-band coverage cell) can hold coverage. **Deepest saving, slowest wake-up** (minutes).
2. **Carrier shutdown** — turn off **capacity carriers** (e.g., the 3.5 GHz or the second LTE carrier) while the **anchor carrier** keeps serving — typically during several night hours.
3. **RF-channel reconfiguration** — mute transmit chains and MIMO layers, e.g., **64T64R → 32T32R**. You lose peak capacity and some array gain (−3 dB) but halve the PA power.
4. **Load-aware activation** — **traffic prediction** (often ML-based) decides what sleeps and what wakes **before demand arrives**, so **KPIs** (throughput, accessibility, latency) are protected.
5. **Energy–coverage trade-off** — the deeper the sleep, the more you save but the longer recovery takes; deep sleep can **shrink coverage** (holes if the remaining layer can't cover) or **raise cell-edge latency** (users wait for wake-up).

**Why it matters:** the **radio unit** (especially the power amplifier) dominates site power, and the **RAN uses ~70–80 % of a mobile network's electricity**. And because traffic varies hugely over a day, most of that energy is spent serving near-zero load at night.

### The figure: "Energy saving follows the traffic curve — the deeper the sleep, the slower the wake-up"
- x-axis: time of day 00:00–24:00; y-axis: cell load. The blue curve is a typical daily traffic profile.
- **00:00–~06:30 (shaded):** traffic is at its minimum (~03:00) → **cell / deep sleep: capacity layer off**.
- **~07:00–08:00 (ramp-up):** **carrier shutdown + RF channels muted (64T64R → 32T32R)** — partial capacity while load grows.
- **~13:00 peak:** **busy hour — everything on.**
- **~18:00:** a second plateau → **load-aware wake-up before demand arrives** (pre-emptive activation based on prediction).
- **~22:30–24:00 (shaded):** traffic falls again → back into deep sleep.

The lesson: match the depth of the saving to the traffic level and to how fast you'll need the capacity back.

---

## Slide 43 — Energy Saving and Sleep Modes in RAN

### Why sleep works
- RAN ≈ **70–80 %** of network electricity; the radio unit dominates the site.
- Traffic is **bursty**: even in a busy cell there are many empty symbols and slots. An awake carrier draws significant **baseline power** even with no users (PA bias, always-on signals, cooling). **Sleep modes exploit those idle gaps.**

### Four sleep depths — distinguished by wake-up time (the bar chart)

| Sleep depth | What switches off | Wake-up time | Power saved (while asleep) |
|---|---|---|---|
| **Symbol / micro sleep** | PA off between OFDM symbols with no data | **≈30 µs** | ~10 % |
| **Slot / light sleep** | Empty slots, fewer reference signals | **≈700 µs** | ~20 % |
| **Channel shutdown** | MIMO layers or a whole carrier switched off | **≈30 s** | ~40 % |
| **Cell / deep sleep** | Whole cell off; coverage held by another layer | **≈15 min** | ~70 % |

Chart headline: **"deeper sleep saves more — but takes longer to wake and risks KPIs."** Each step down saves roughly double but wakes ~orders of magnitude slower. Micro-sleep is invisible to users (fits inside a symbol gap); deep sleep must be planned with prediction.

**Why NR enables this:** the lean carrier (slide 39). LTE's CRS were on in every subframe, so the PA could never rest; NR's sparse SSB leaves long empty stretches.

### Other levers
- **Longer SSB periodicity** (e.g., 20 ms → 160 ms): fewer mandatory transmissions → longer sleep windows (but slower initial access).
- **Extended DRX** for devices: the *UE* sleeps longer between paging occasions — saves UE battery and reduces gNB signalling.
- **MIMO layer muting** (64T64R → 32T32R).
- **3GPP Rel-18 Network Energy Saving (NES):** standardised features such as cell DTX/DRX (the cell itself has active/inactive periods UEs know about), spatial-element adaptation, and SSB-less SCells.

### Who decides?
- **SON (Self-Organising Network)** functions — automated optimisation in the vendor's management system.
- **Non-RT RIC rApps** in O-RAN (slide 45) — software apps running at >1 s timescales that use **traffic prediction** to set sleep policies, with carriers **woken on demand** when traffic unexpectedly appears.

---

## Slide 44 — RAN Evolution (4G E-UTRAN → 5G NG-RAN)

### 4G E-UTRAN: monolithic
The eNB is **one vendor's box at the cell site**, with all layers (RF, PHY, MAC, RLC, PDCP, RRC) **in the same chassis**. **Inflexible** (can't move functions or scale them independently) and **proprietary** (internal interfaces closed; you buy radios and baseband from the same vendor).

### 5G NG-RAN: disaggregated
The gNB is split into functions that **can sit in different places and come from different suppliers**:
- **RU (Radio Unit):** RF + lower PHY (FFT/iFFT, beamforming), at the antenna.
- **DU (Distributed Unit):** upper PHY, MAC (scheduler), RLC — real-time functions, near the site or in an edge hub.
- **CU (Central Unit):** PDCP, SDAP, RRC — non-real-time, can be centralised in a data centre and serve many DUs. (Further split into CU-CP and CU-UP.)

### What disaggregation buys
- **Hardware pooling** — one CU/DU pool serves many sites; peak loads at different sites average out (statistical multiplexing) → less hardware.
- **Faster software upgrades** — software on servers updates like cloud apps, not via site visits.
- **Coordination between cells** — co-located baseband can do joint scheduling, CoMP, interference coordination easily.
- **Vendor choice** — buy RUs from one supplier, DU/CU software from another.

### What it costs
- **A transport network between the pieces** — fronthaul (RU↔DU) needs very high capacity and tight latency (~100 µs order); midhaul (DU↔CU) less strict.
- **Integration work** that used to be internal to one vendor — now the operator (or an integrator) must make multi-vendor pieces interoperate and troubleshoot them.

### The figure
- **Left:** generic RAN picture — Mobile Core (cloud) on top, the RAN (a tower) in the middle, UEs (phones) at the bottom.
- **Middle — "4G RAN (E-UTRAN)":** a lattice tower with antennas: **Monolithic · Inflexible · Proprietary.**
- **Right — "5G RAN (moving towards virtualization…)":** a slim rooftop radio and a **server rack**: **Disaggregated architecture · Flexible · Programmable.**

---

## Slide 45 — RAN Evolution: D-RAN → C-RAN → vRAN → O-RAN

### D-RAN (Distributed / legacy RAN)
- **Complete base station at every site** — BBU (baseband) and RRH (radio head) both at the cell site, connected back to the core via backhaul (IP).
- **Simple**, but **no sharing** (each BBU sized for its own site's peak, idle most of the day) and **no coordination** (neighbouring BBUs can't jointly schedule).

### C-RAN (Centralised / Cloud RAN)
- **BBUs pooled in a central room** ("BBU hotel"); only **RRHs at the sites**, connected by **fibre fronthaul** using **CPRI (Common Public Radio Interface)**.
- **Pooling gain** (fewer BBUs needed since peaks at different sites don't coincide; smaller, cheaper sites with less cooling/power) and **coordination** (CoMP, eICIC at microsecond precision because the basebands sit together).
- **Price: a very fast fronthaul.** CPRI carries raw digitised I/Q samples per antenna — its rate scales with **bandwidth × number of antennas**, not with user traffic. A 100 MHz 64-antenna carrier would need hundreds of Gb/s → impractical. That's why 5G moved to **eCPRI with the 7.2x functional split** (part of the PHY moved into the RU so fronthaul carries frequency-domain data, roughly proportional to traffic/layers).

### vRAN (Virtualised RAN)
- The baseband becomes **software (vBBU / vDU / vCU) on general-purpose (x86/ARM) servers**, in a cloud/data centre.
- Physical-layer processing (LDPC decoding, FFTs, channel estimation) is too heavy for CPUs alone → **hardware accelerators** (FPGA, ASIC, GPU, "inline" or "lookaside" acceleration cards).
- Benefits: cloud-native operations (containers, orchestration, automated scaling), shared infrastructure with other workloads.

### O-RAN (Open RAN)
- Adds **open, standardised interfaces** between the pieces (specified by the O-RAN Alliance) so they can come from different vendors:
  - **Open Fronthaul** (RU ↔ DU, eCPRI/RoE, split 7.2x)
  - **F1** (DU ↔ CU, "open midhaul" — a 3GPP interface)
  - **E2** (RIC ↔ CU/DU), **A1** (non-RT RIC ↔ near-RT RIC), **O1** (management)
- Plus a controller — the **RIC (RAN Intelligent Controller)** — **that lets third-party software steer the RAN**:
  - **Near-RT RIC:** 10 ms – 1 s control loops, runs **xApps** (e.g., traffic steering, interference management, beam optimisation).
  - **Non-RT RIC** (inside the SMO, Service Management & Orchestration): >1 s, runs **rApps** (e.g., energy-saving policies — slide 43 — ML model training, long-term optimisation).

### The figure, left to right
| Stage | Packet core | Backhaul | Middle | Fronthaul | At the sites |
|---|---|---|---|---|---|
| **Legacy Non-Virtualized Site** | Physical box | IP | — | — | BBU + RRH at each site |
| **Centralized RAN (C-RAN)** | Physical | IP | **BBU** (pooled) | **CPRI** | RRHs only |
| **Virtualized RAN (V-RAN)** | **Virtualized packet core** (cloud) | IP | **vBBU** in a cloud | CPRI | RRHs |
| **Disaggregated Open RAN (O-RAN)** | Virtualized | IP | **vCU** ⟷ (Open Midhaul, IP) ⟷ **vDU**, both connected to the **RIC** | **Open Fronthaul, eCPRI / RoE** | **RUs** |

**Legend:** RRH = Remote Radio Head; BBU = Baseband Unit; CPRI = Common Public Radio Interface; RIC = RAN Intelligent Controller; CU = Centralized Unit; DU = Distributed Unit; RU = Remote/Radio Unit; RoE = Radio over Ethernet; eCPRI = Ethernet CPRI.

### Key takeaways from the slide
- **"Each step keeps the previous one's radio — what changes is where the functions run and who may supply them."** The air interface (OFDM, MIMO, scheduling algorithms) is the same; the evolution is architectural and commercial.
- **Benefits:** **vendor choice** (no lock-in, more competition → lower prices), **faster feature innovation** (software releases, third-party xApps), **commodity hardware** (servers instead of custom boxes), and **programmable optimisation** (RIC apps can implement new energy-saving or scheduling policies without waiting for a vendor).
- **Remember the trade-offs (from slide 44):** transport demands and multi-vendor integration/performance (general-purpose hardware still lags custom ASICs in energy efficiency for PHY processing).

---

## Quick-Review Cheat Sheet

- **Fractional PC:** P = min{P_max, P₀ + α·PL + 10log₁₀M + Δ_TF + f(i)}; α < 1 → less inter-cell interference, higher system throughput, weaker edge users.
- **Planning identity:** Throughput ≈ B × SE × cell density. L1 spectrum, L2 cells, L3 bits/Hz.
- **Halve radius → ~4× cells → ~4× capacity.**
- **ICIC (Rel-8)** = frequency-domain edge separation; **eICIC (Rel-10)** = ABS time-domain muting; **CRE** = bias to expand small cell, protected by eICIC.
- **Small-cell example:** 600 Mb/s + 6×400 Mb/s = 3.0 Gb/s (5×); $37/Mb/s vs $250/Mb/s.
- **Sectoring:** interferers 6 → 2 (120°) → 1 (60°); SIR ↑ ~4.8 dB (120°) → smaller N; costs trunking efficiency and handovers.
- **MIMO:** SU-MIMO layers ≤ min(Tx,Rx) = rank; MU-MIMO separates users by beams with nulls; array gain 10log₁₀M (64 → 18 dB). TDD → SRS + reciprocity; FDD → CSI-RS + PMI.
- **Massive MIMO example:** 16 × 100 MHz × 4 × 0.85 = 5.44 Gb/s; 8× vs 2 layers.
- **FCA vs DCA:** FCA better at heavy load, simple, needs planning; DCA better at light/moderate load, flexible, complex, radios cover all channels.
- **NR vs LTE:** numerology 15·2^μ kHz, slot 1/2^μ ms, mini-slots, 100/400 MHz carriers, FR1 ≤7.125 GHz, FR2 24.25–71 GHz, LDPC/polar, lean carrier, ~1 ms latency.
- **Scheduler:** RB = 12 subcarriers × 1 slot; BWP; RR / Max C/I / PF (r/R̄); 5QI, GBR/non-GBR, slices.
- **RAN:** antenna-to-core; radio-speed decisions; 60–70 % capex; 2G BTS+BSC → 3G NodeB+RNC → 4G eNB → 5G CU+DU+RU.
- **Energy:** RAN = 70–80 % of electricity. Sleep depths: symbol (30 µs, 10 %), slot (700 µs, 20 %), channel (30 s, 40 %), cell (15 min, 70 %). Decided by SON / non-RT RIC rApps.
- **D-RAN → C-RAN (BBU pool, CPRI fronthaul) → vRAN (software + accelerators) → O-RAN (open interfaces + RIC with xApps/rApps).**
