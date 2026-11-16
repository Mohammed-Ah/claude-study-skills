# COE 446 – Topic 4: Cellular Evolution
### Deep-Dive Study Guide — Slides 2–36

*Course: COE 446 Mobile Computing, KFUPM — Instructor: Zeeshan Kaleem*
*Each section matches the lecture slide number. Slide 1 (title) is skipped. Your handwritten margin notes are addressed where they appear.*

> Your note on slide 36 says **"end of quiz material — slide 39 in the updated slides."** This guide covers everything up to that point.

---

## Roadmap

This topic traces how cellular networks grew from 1G to 3.5G:

1. **1G (AMPS), slides 2–3:** analogue FM voice, FDMA, the basic cellular architecture.
2. **2G (GSM), slides 4–23:** digital voice, FDMA/TDMA, the SIM card, the BSS/NSS architecture, the four databases (HLR, VLR, AuC, EIR), registration, call setup, and the GSM frame structure down to the bit.
3. **2.5G (GPRS/EDGE), slides 24–27:** packet data added *alongside* the voice network.
4. **3G (UMTS/WCDMA), slides 28–34:** CDMA air interface, the UTRAN (NodeB + RNC), and radio resource management.
5. **3.5G (HSPA), slides 35–36:** AMC, HARQ and fast scheduling. These led directly to LTE.

A thread to keep in mind: **the core network changed slowly, while the radio access changed every generation.** GPRS ran beside the GSM voice core. UMTS kept the GSM/GPRS core and replaced only the radio part.

---

## Slide 2 — 1G Analog Systems: AMPS

**AMPS (Advanced Mobile Phone Service)** was the North American 1G system, launched in 1983 and developed by Bell Labs.

### Spectrum
- **Two 25 MHz bands:**
  - **869–894 MHz: downlink** (base → mobile)
  - **824–849 MHz: uplink** (mobile → base)
- The two bands are a fixed **45 MHz apart** (869 − 824 = 45). This is **FDD (Frequency Division Duplex)**: each call uses one uplink channel and its paired downlink channel 45 MHz higher, so the phone can talk and listen at the same time. A duplexer filter separates the two directions.
- The FCC split each 25 MHz band between **two competing operators** (the "A" and "B" carriers). Each operator therefore had **12.5 MHz per direction**.

### Channels
- **12.5 MHz ÷ 30 kHz ≈ 416 channels per operator.**
  - **395 traffic (voice) channels**, carrying **analogue FM** voice. FM was chosen because it is robust to amplitude fading and noise, and it has a "capture effect" that suppresses weaker interferers.
  - **21 control channels**, using **FSK** (digital, 10 kb/s). These carry call setup, paging and channel assignments. Even 1G used digital signalling for control.
- **FDMA:** one user per 30 kHz channel for the whole call. A channel is dedicated even during silence, which is wasteful. That waste is one reason 2G went digital.

### Reuse and cell size
- **Reuse factor N = 7:** the 395 voice channels are divided among 7 cells in a cluster, so each cell has about **56 voice channels**. Adjacent cells never share frequencies. Co-channel cells are a reuse distance D = R√(3N) ≈ 4.6R apart.
- **Cell radius 2–20 km:** large cells, because the system was designed for car phones with high transmit power (up to 3 W).

**Why 1G was replaced:** no encryption (anyone with a scanner could listen in), poor spectral efficiency, no data, incompatible national standards (no roaming), and phone cloning fraud.

---

## Slide 3 — 1G AMPS Architecture

The figure shows hexagonal cells, each with a base-station tower, connected by wires to green **MTSO** boxes, which connect to the cloud labelled **Public Telephone Network (PTN)**.

### Components (left callout: "cell")
- **Cell:** covers a geographic region.
- **Base station (BS):** the radio at the centre of the cell. It is **analogous to an 802.11 access point**: the attachment point between the wireless terminal and the wired network.
- **Controller:** handles the call process between the mobile unit and the rest of the network (channel assignment, signal monitoring).
- **Mobile terminal:** attaches to the network *through* the BS.
- **Air interface:** the **physical and link-layer protocols between mobile and BS**. This is the part that changes most between generations.

### MTSO (Mobile Telephone Switching Office), top callout
- **Connects cells to the wired PTN.** It is the bridge between the radio network and the ordinary telephone system.
- **Manages call setup:** assigns a voice channel, rings the phone, connects the circuit.
- **Handles mobility:** tracks which cell a mobile is in and performs **handoff** when it moves into another cell. In AMPS this is a hard handoff, where the mobile is told to retune to a new frequency.
- Several MTSOs are linked by a **wired network**.

**Big picture:** this cells → base stations → switching office → PSTN structure is the template for every later generation. GSM's BTS/BSC/MSC and LTE's eNB/EPC keep the same shape.

---

## Slide 4 — 2G Systems: GSM

**GSM (Global System for Mobile communications)** started as the European standard (ETSI, launched 1991) and became the world's dominant 2G system.

- **Frequency band around 900 MHz** (GSM-900). DCS-1800 was added later in Europe, and 850/1900 MHz in the Americas.
- **Channel bandwidth 200 kHz, giving 125 duplex channels:** 25 MHz ÷ 200 kHz = 125. In practice **124** are usable because one is kept as a guard band; the figure on slide 22 says "124 channels".
- **Maximum cell radius 35 km.** This limit comes from timing, not power. A far-away mobile's burst arrives late, and the **timing advance** parameter can only compensate up to about 35 km of round-trip delay (63 steps × ~0.55 km).
- **Hybrid FDMA/TDMA:** the band is divided into 200 kHz carriers (FDMA), and each carrier is divided into **8 time slots** (TDMA), so **8 users share one carrier**.
- **Advantages of digital transmission:**
  - **Higher quality:** digital speech with error correction is consistent until the link fails, rather than fading into static.
  - **Compression:** speech codecs (full-rate 13 kb/s) compress voice so it fits a timeslot.
  - **Encryption:** the A5 cipher protects the air link. This was absent in 1G.
  - **Error detection and correction:** convolutional coding, CRC, interleaving.
  - **Multiplexing of channels by different users:** TDMA slots.

### SIM (Subscriber Identity Module)
- **Ties the user's identity to the mobile terminal:** the SIM holds the **IMSI** (International Mobile Subscriber Identity). The *subscription* belongs to the SIM, not to the handset.
- **Portable and transferable:** move the SIM to another phone and your number and services move with it. This was a revolution compared with 1G, where identity was burned into the phone.
- **Enables cryptographic algorithms:** the SIM stores the secret key **Ki** (also stored only at the AuC) and runs the A3 (authentication) and A8 (cipher-key generation) algorithms *inside* the card. Ki never leaves the card.
- **Can also store short messages and charging information** (SMS, contacts, operator settings).

---

## Slide 5 — GSM Features

- **Communication:** voice plus data services. Data meant SMS, circuit-switched data at 9.6 kb/s, and fax.
- **Total mobility:** **international access (roaming)**. Because many countries adopted the same standard, the HLR/VLR mechanism (slides 13–14) let a subscriber use foreign networks. The SIM makes identity portable.
- **High capacity:** **better frequency reuse** (digital links tolerate lower C/I, about 9 dB versus 18 dB for AMPS, so a **reuse factor of 3–4** is possible instead of 7), **smaller cells**, and **more customers per cell** (8 users per 200 kHz carrier).
- **High transmission quality:** better audio and reliability, and **uninterrupted calls at up to 250 km/h**. Equalisation, interleaving and the training sequence (slide 22) cope with the fast fading and Doppler shift at high speed.
- **Security:** **access control**, **authentication via SIM and PIN**. The PIN protects the SIM locally and authentication protects the network. Calls are encrypted, and **TMSI** hides the user's real identity on the air (slide 16).

---

## Slide 6 — GSM Network Architecture

The slide has two diagrams of the same architecture.

### Left: "Figure 13.9 Overall GSM Architecture" (textbook view)
Three blocks separated by three dashed lines, which are the **standard interfaces**:

| Block | Contents | Interface to its right |
|---|---|---|
| **Mobile station** | **ME** (mobile equipment) + **SIM** | **Um**: the air interface, MS ↔ BTS |
| **Base station subsystem (BSS)** | Several **base transceiver stations** + one **base station controller** | **Abis**: BTS ↔ BSC (a wired link inside the BSS). **A**: BSC ↔ MSC |
| **Network subsystem (NSS)** | **Mobile switching centre** + **VLR**, **AuC, EIR, HLR**, **Operation and maintenance centre**, **Data communication network** | Connects to the **PSTN** |

**Why standard interfaces matter:** they let an operator buy BTSs from one vendor and MSCs from another, because everyone implements Um, Abis and A the same way. (Abis was partly proprietary in practice.)

The **Operation and Maintenance Centre (OMC)** monitors and configures the network (alarms, performance statistics, software). The **data communication network** links the management systems to the elements they manage.

### Right: physical view
Cars and phones → **Um** → clusters of hexagonal cells with **BTSs** → **Abis** → **BSC** (one per cluster; two clusters shown) → **A** → **MSC** → **Gateway MSC (G)** → **Public telephone network**.

Note the tree structure: **many BTSs per BSC, many BSCs per MSC, and one gateway** to the outside world.

---

## Slide 7 — Mobile Equipment (ME)

- **ME = the physical terminal** (phone, PDA). It contains the **radio transceiver**, **digital signal processors** (speech codec, channel coding, equalisation, GMSK modulation) and the **SIM**.
- Strictly, GSM terminology says **MS (Mobile Station) = ME + SIM**. The ME is identified by its **IMEI** (International Mobile Equipment Identity), which the EIR checks (slide 14). The *user* is identified by the IMSI on the SIM.
- The ME communicates across the **Um interface** with the **BTS of the cell it is in**. The ME is constantly measuring the signal strength of its serving and neighbouring cells. It reports these measurements to the network, which uses them for handoff decisions (made by the BSC, slide 10).

---

## Slide 8 — Base Station Subsystem (BSS)

- **BSS = BSC + one or more BTSs + the links between them.**
- **The BSC:**
  - **Reserves radio frequencies:** allocates channels and timeslots to calls.
  - **Manages handoff between cells within its own BSS.** If both the old and new cells belong to the same BSC, the handoff happens without involving the MSC (an *intra-BSC* handoff).
  - **Controls paging:** it tells the right BTSs to broadcast the page when a call arrives for a mobile.
- **A BTS can form one cell, or several cells if it uses sectorized antennas.** With three 120° sectors, one site is three cells (see Topic 3, slide 35).
  - A BTS includes the **radio antenna**, the **radio transceiver** (TRX) and a **link to the BSC**.

**Design logic:** the BTS is kept "dumb" and cheap because there are thousands of them. The intelligence lives in fewer BSCs. This is the "radio separated from control" step in Topic 3's RAN evolution (2G: BTS + BSC).

---

## Slide 9 — Base Transceiver Station (BTS)

What the BTS does, roughly bottom-up:
- **Radio transmission and reception:** modulation/demodulation (GMSK), RF amplification, filtering.
- **Physical-layer management:** **TDMA** transmission (putting each user's burst in its slot), **channel coding** (convolutional coding and interleaving), **ciphering** (A5 encryption over the air, using the key Kc supplied from the network).
- **Link-layer management:** the LAPDm protocol on the air interface (framing, acknowledgements for signalling).
- **Measuring received signal quality and power:** RXLEV (level) and RXQUAL (bit error rate) for each mobile on the uplink. These feed power control and handoff.
- **Interference measurements** on idle timeslots, so the BSC can choose the cleanest channels for new calls.

The BTS *measures* but does not *decide*. It forwards its measurements to the BSC.

---

## Slide 10 — Base Station Controller (BSC)

### Interface between the MSC and the BTSs
- **Switching between BTSs and forwarding traffic:** the BSC concentrates traffic from many BTSs onto the A-interface toward the MSC. The TRAU (transcoder) unit near the BSC converts 13 kb/s GSM speech to the 64 kb/s PCM used in the PSTN.
- **Controlling the BTSs:** configuration and operation.

### Radio Resource Management (RRM) for the BSS
- **Channel allocation:** chooses a free carrier/timeslot for each call, using the interference measurements.
- **Processing BTS measurements:** collects the mobile and BTS reports.
- **BTS and MS power control:** commands both ends to transmit at the minimum power that meets quality. This reduces interference and saves battery. It is the 2G version of the power control in Topic 3, slide 26.
- **Handoff:** decides *when* and *to which cell*, based on the measurements.

**Key point:** in 2G, radio decisions are centralised in the BSC. In 3G they move to the RNC, and in 4G into the eNB itself.

---

## Slide 11 — Network and Switching Subsystem (NSS)

- **Links the cellular network to the public networks (PSTNs).**
- **Controls handoff between cells in different BSSs.** If a mobile moves from a cell of BSC-1 to a cell of BSC-2, the MSC must coordinate (an *inter-BSC* handoff). If the BSCs belong to different MSCs, it is an *inter-MSC* handoff and both MSCs take part.
- **Authenticates users and validates accounts** (using AuC and HLR).
- **Enables worldwide roaming** (using HLR/VLR).
- **The MSC is the central element** of this subsystem.

**Figure:** BTS → BSC (together labelled "Base station system (BSS)") → **MSC** → **G (Gateway MSC)** → **Public telephone network**. Legend: BTS (tower), BSC (box with ×), MSC (tall box with ×), mobile equipment (SIM card).

---

## Slide 12 — Mobile Switching Center (MSC)

The MSC is essentially a telephone exchange extended with mobility functions:
- **Switching:** sets up circuit-switched 64 kb/s connections between callers.
- **Mobility support:** handoffs between BSCs and MSCs.
- **Location registration and forwarding of location information:** works with the VLR and HLR so the network knows which **location area** each mobile is in.
- **Management of network resources:** trunks, circuits.
- **Generating and forwarding accounting and billing information:** Call Detail Records (CDRs).
- **Integrating several databases:** HLR, VLR, AuC, EIR (next two slides).
- **Interworking functions via the Gateway MSC:**
  - The **Gateway MSC (GMSC)** is the gateway for calls to and from external networks such as the PSTN. *(The slide says "Gateway Mobile Switching Controller"; the standard name is Gateway Mobile Switching **Center**.)*
  - When someone on a landline calls a mobile, the call first reaches the GMSC, which asks the HLR where the subscriber is (slide 18).

---

## Slide 13 — MSC Databases (1): HLR and VLR

### Home Location Register (HLR)
- Stores information **permanently** about each subscriber who **belongs to this operator** (the home network):
  - Identities: **IMSI**, and **MSISDN** (the phone number).
  - **Subscribed services:** call forwarding, roaming permission, data service and so on.
  - **Current location:** not the exact cell, but **which VLR/MSC is currently serving the user**.
  - Authentication-related data.
- **One provider can have several HLRs**, each holding part of the subscriber base.

### Visitor Location Register (VLR)
- Holds information **temporarily** about subscribers **currently in this MSC's region**, whether home users or roamers.
- Holds a copy of the subscriber profile (downloaded from the HLR), the **TMSI**, and the **location area** the mobile is in.
- **Updates the subscriber's HLR with the subscriber's location** when they arrive.
- The VLR is usually built into the MSC, so you often see "MSC/VLR".

### Why two databases? (the core mobility idea)
- The HLR is the **permanent anchor**: there is one fixed place where anybody can ask "where is subscriber X?".
- The VLR is a **local cache**: during a call or a location update, the serving MSC doesn't need to contact a possibly distant HLR (in another country for roamers). It has the data locally.
- When the user moves to another MSC area, the new VLR registers them, the HLR is updated to point to the new VLR, and the HLR tells the old VLR to delete the record.

This **two-level location management** (home anchor plus visited cache) is reused in GPRS, UMTS, LTE (HSS/MME) and 5G (UDM/AMF). It is also the same idea as **Mobile IP's home agent and foreign agent**.

---

## Slide 14 — MSC Databases (2): AuC and EIR

### Authentication Center (AuC)
- Holds each subscriber's secret key **Ki** (the same Ki as in that subscriber's SIM) and runs the authentication and encryption-key algorithms.
- **How GSM authentication works** (challenge–response):
  1. The AuC generates a random number **RAND** (128 bits).
  2. It computes **SRES = A3(Ki, RAND)**, the expected response, and **Kc = A8(Ki, RAND)**, the cipher key.
  3. The triplet (RAND, SRES, Kc) is sent through the HLR to the VLR.
  4. The VLR/MSC sends **RAND** to the mobile. The SIM computes its own SRES and Kc with its own Ki.
  5. The mobile returns its SRES. If it matches, the user is authentic. Both sides now hold **Kc**, which the BTS and mobile use for **A5** encryption of the air link.
- **Ki never travels over the air**, only the random challenge and the response. That is why the AuC "controls access to user data" and is used "when a subscriber joins a network".
- *Weakness to know:* GSM authentication is **one-way**. The network authenticates the phone, but the phone does not authenticate the network, which made fake base stations ("IMSI catchers") possible. UMTS fixed this with mutual authentication (AKA).

### Equipment Identity Register (EIR)
- Tracks the *equipment* (the handset's **IMEI**), not the subscriber.
- It uses lists:
  - **White:** approved devices.
  - **Black:** stolen or blocked devices, which are refused service even with a valid SIM.
  - **Grey:** devices under observation.
- So it **blocks calls from stolen MEs** and **prevents unapproved equipment** from using the network.

---

## Slide 15 — Registration (overview flow)

The six boxes summarise the procedure that slide 16 details step by step:
1. **Every time the MS is switched on,** it must establish a new connection and possibly a new registration with the network.
2. **If the current location is not the same as before** (a different location area, which the mobile learns from the broadcast LAI, the Location Area Identifier), **the MS starts a registration (location update)**.
3. **Steps 1–4:** a **radio channel is set up** between the MS and the BSS for the registration.
4. **Steps 5–8:** the **NSS authenticates the MS**.
5. **Steps 9–11:** a **TMSI is assigned**, and the **VLR and HLR entries are updated**.
6. **Final step (12):** the temporary radio channel is **released**. (The slide says "transmission starts over a traffic channel". For registration alone, the mobile simply returns to idle on the control channels.)

---

## Slide 16 — Registration (signalling table)

Arrows show who sends to whom (MS, BTS, BSC, MSC, VLR, HLR):

| # | Message | Path | Meaning |
|---|---|---|---|
| 1 | **Channel request** | MS → BTS → BSC | The mobile asks for a signalling channel on the random-access channel (RACH). |
| 2 | **Activation response** | BSC → BTS | The BSC picks a dedicated channel (SDCCH) and tells the BTS to activate it. |
| 3 | **Activation ACK** | BTS → BSC | The BTS confirms the channel is ready. |
| 4 | **Channel assigned** | BSC → BTS → MS | "Immediate assignment": the mobile is told which channel to use. *Radio link done.* |
| 5 | **Location update request** | MS → BTS → BSC → MSC | The mobile identifies itself (TMSI or IMSI plus the old location area) and asks to register. |
| 6 | **Authentication request** | MSC → BSC → BTS → MS | Sends **RAND** (the challenge). |
| 7 | **Authentication response** | MS → … → MSC | Returns **SRES** computed by the SIM. |
| 8 | **Authentication check** | MSC ↔ VLR | The VLR compares the received SRES with the expected one. *Authentication done.* (Ciphering with Kc usually starts here.) |
| 9 | **Assigning TMSI** | MSC → … → MS | A new temporary identity, sent *encrypted*. |
| 10 | **ACK for TMSI** | MS → … → MSC | The mobile confirms it stored the TMSI. |
| 11 | **Entry to VLR and HLR** | MSC ↔ VLR ↔ HLR | The VLR records the mobile. The HLR is updated with the new VLR address and sends the subscriber profile. If the mobile came from another VLR, the old VLR is told to delete it. |
| 12 | **Channel release** | BSC → BTS → MS | The dedicated channel is freed. |

**Why a TMSI?** Sending the permanent IMSI over the air repeatedly would let eavesdroppers track a person. The TMSI is a random local alias that changes over time, so it provides **identity confidentiality**. Only the VLR knows the mapping between TMSI and IMSI.

**Count check against slide 15:** 4 (radio) + 4 (authentication) + 3 (TMSI/VLR/HLR) + 1 (release) = 12. ✔

---

## Slide 17 — Mobile Originating Call (MOC)

A call **from a mobile to a landline (PSTN)**. Figure: MS ↔ BSS ↔ MSC ↔ GMSC ↔ PSTN, with the VLR above the MSC.

| Steps | What happens |
|---|---|
| **1, 2: connection request** | MS → BSS (1) → MSC (2): the mobile requests a channel and sends the dialled number. |
| **3, 4: security check** | MSC ↔ VLR: is this subscriber authenticated and allowed to make this call (barring, credit, roaming restrictions)? Authentication and ciphering may run here. |
| **5–8: check resources (free circuit)** | MSC → GMSC (5) → PSTN (6): reserve a trunk toward the called party. PSTN → GMSC (7) → MSC (8): confirmation that the path is available and the far end is ringing. |
| **9, 10: set up call** | MSC → BSS (9): assign a traffic channel. BSS → MS (10): the mobile switches to it. Ringback, answer, conversation. |

Note that the **HLR is not involved** in an outgoing call. The VLR already holds everything needed (it was loaded at registration). This is exactly why the VLR exists.

---

## Slide 18 — Mobile Terminated Call (MTC)

A call **from the PSTN to a mobile**. This is harder because the network must first *find* the mobile. Figure: calling station → PSTN → GMSC, HLR above it, VLR beside the MSC, and three BSSs below the MSC paging the MS.

| Step(s) | What happens | Why |
|---|---|---|
| **1** | The caller dials the mobile number (**MSISDN**). | |
| **2** | The PSTN routes the call to the **GMSC** of the subscriber's home network. | The MSISDN's prefix identifies the home operator; the PSTN knows nothing about mobility. |
| **3** | GMSC → **HLR**: "where is this subscriber?" | The HLR is the permanent anchor. |
| **4, 5** | HLR ↔ current **VLR**: the HLR asks the serving VLR, which returns a temporary routing number (**MSRN**, Mobile Station Roaming Number). | The HLR only knows *which VLR*, not which cell. The MSRN is a routable number for reaching the serving MSC. |
| **6** | HLR → GMSC: returns the MSRN, which identifies the responsible MSC. | |
| **7** | GMSC → **current MSC**: the call is forwarded using the MSRN. | The call may be routed across countries if the user is roaming. |
| **8, 9** | MSC ↔ VLR: get the mobile's current status (idle/busy) and **location area**. | The VLR knows the location area, a group of cells, not the exact cell. |
| **10, 11** | **Paging**: the MSC tells *all BSSs in that location area* (10), which broadcast the page in all their cells (11). | An idle mobile does not report every cell change (that would drain the battery), so the network pages the whole area. |
| **12, 13** | The MS answers the page (12) through its BSS to the MSC (13). | Now the exact cell is known. |
| **14, 15** | **Security checks** (MSC ↔ VLR): authentication and ciphering. | |
| **16, 17** | **Set up the connection:** traffic channel assigned (MSC → BSS → MS) and the call is connected. | |

**Location area size trade-off:** larger location areas mean fewer location updates (less uplink signalling and battery use) but more paging (each call pages more cells). Smaller areas reverse this. Operators tune it.

---

## Slide 19 — GSM Radio Link Aspects (multiple access)

2G used two ways to share the spectrum:
- **GSM: combined FDMA/TDMA.** Divide the spectrum into frequency channels (200 kHz carriers), then divide each channel into time slots (8 per frame).
- **IS-95 (cdmaOne, US): CDMA.** All users transmit on the same 1.25 MHz band at the same time, separated by **unique spreading codes**. This is the ancestor of 3G's WCDMA.

**Figure:** a grid with **frequency bands** stacked vertically and **time slots** along the horizontal axis. Each small rectangle is one (carrier, slot) pair, which is a channel for one user. Beside it is a hexagonal cell cluster: each cell is given a subset of carriers (FDMA reuse between cells), and inside a cell the users share the carriers in time (TDMA).

---

## Slide 20 — Radio Link Aspects: Spectrum, Access, Modulation

### Spectrum (GSM-900)
- **Downlink (BTS transmits): 935–960 MHz**
- **Uplink (MS transmits): 890–915 MHz**
- **25 MHz each way**, with **45 MHz duplex spacing** (935 − 890). Uplink is the lower band because lower frequencies have less path loss, which helps the power-limited phone.
- **Channel bandwidth 200 kHz → 125 channels** (124 used).

### Access: FDMA/TDMA
- **Each channel supports 8 time slots, so 8 full-rate users.**
- Total ≈ 124 × 8 = **992 traffic channels** across the whole band. These are split among operators and reuse clusters.
- GSM uplink and downlink slots are offset by **3 timeslots**, so a phone never has to transmit and receive at the same instant. This means GSM handsets don't need an expensive duplexer.

### Modulation: GMSK (Gaussian Minimum Shift Keying)
- **An optimised version of FSK** *(the slide says "FSM"; it means FSK)*.
- **MSK** is FSK with the minimum frequency separation that keeps the two tones orthogonal (Δf = R_b/2), with continuous phase.
- **"Gaussian"**: the data pulses pass through a Gaussian low-pass filter (BT = 0.3) before modulating. This smooths frequency transitions and **narrows the spectrum** so it fits in 200 kHz.
- It is **constant-envelope**: the amplitude never changes, so the phone's power amplifier can run in efficient non-linear (class C) mode, which gives long battery life.
- **1 bit per symbol.** *(Your slide 24 note says "sends only one bit in GMSK". Correct, and that's why EDGE switched to 8-PSK with 3 bits per symbol.)*

### Carrier bit rate: 270.833 kb/s
- This is the gross bit rate of *one 200 kHz carrier*, shared by its 8 slots.
- It comes from the frame timing: **156.25 bits per slot ÷ 0.577 ms per slot ≈ 270.833 kb/s**. Equivalently, 1625/6 kb/s. Bit duration ≈ **3.69 µs**.
- Per user (raw): 270.833 / 8 ≈ 33.85 kb/s. After removing overhead (training sequence, tail and guard bits, control frames) it falls to **22.8 kb/s** (slide 23).

---

## Slide 21 — Radio Link Aspects: Frequency Hopping and Delay Equalisation

### Slow Frequency Hopping (SFH)
- **Successive TDMA frames are sent on different frequencies.** A user's timeslot stays fixed, but the carrier it uses changes every frame.
- **It switches every 4.615 ms** (one frame), which is about **217 hops per second**. It's called *slow* because each hop carries a whole burst, unlike fast hopping, which hops several times per bit.
- **It spreads out multipath fading.** Fading is frequency-selective: one carrier might be in a deep fade at your location while another is fine. Hopping means a deep fade hits only occasional bursts. Interleaving and convolutional coding spread each speech frame over 8 bursts, so the decoder can recover the bits that were lost. This is **frequency diversity**.
- **It also helps with co-channel interference.** Different cells hop with different patterns, so a strong interferer only collides occasionally. This is **interference averaging**, which allows tighter reuse.
- **SFH is optional in GSM** (the network decides). The broadcast control carrier (BCCH) never hops, because mobiles must be able to find it.

### Delay equalisation
- Mobiles **sharing a frame can be at different distances** from the BTS. A distant mobile's burst arrives later and could overlap the next user's slot.
- **Tail bits and guard bits provide margin to avoid overlap.** The guard period is about 30.5 µs (slide 22).
- The main tool is **timing advance (TA)**: the BTS measures each mobile's delay and tells it to transmit *earlier* by its round-trip delay, so all bursts arrive aligned. TA ranges over 0–63 steps of one bit (3.69 µs), which is about 553 m of distance per step and the reason for the **35 km cell limit** on slide 4.

---

## Slide 22 — Radio Link Aspects: Frame and Burst Structure

### Your margin notes (top)
- *"Frequency hopping means frequency changes while user slot is fixed."* ✔ Exactly right.
- *"Frequency channel size = 200 kHz; user 1 can either use f1: 1–200 kHz or f2: 201–400 kHz."* ✔ This illustrates hopping between adjacent 200 kHz carriers. (Real carriers sit at absolute frequencies such as 935.2 and 935.4 MHz, but the idea is the same.)
- *"One frame → 8 slots → 8 users."* ✔
- *"The slot will repeat after 4.615 ms (in the next frame); you cannot change your time slot within the same frame."* ✔ A full-rate user gets exactly one slot per frame.

### The numbers
- **Frame = 8 slots = 4.615 ms.** So **one slot = 4.615 / 8 ≈ 0.577 ms (577 µs)**.
- **Slot = 148 bits of burst plus a guard time of 30.5 µs (8.25 bits)**, for a total of **156.25 bit periods**. *(Your note: "total # bits = 156.25 bits".)* ✔ Check: 8.25 × 3.69 µs ≈ 30.5 µs. ✔
- **A slot is also called a burst period.** The burst is the data in the slot (the figure shows 546.5 µs of active burst inside the 577 µs slot).

### The normal burst, field by field (figure, bottom)

| Field | Bits | Purpose |
|---|---|---|
| **Tail** | 3 | All zeros. *(Your note: "indicates that the slot is going to start or end".)* They let the transmitter ramp power up and down without distorting the data, and give the equaliser (Viterbi) a known start and end state. |
| **User data** | 57 | First half of the encrypted payload. |
| **S (stealing flag)** | 1 | *(Your note: "S stands for stealing bit".)* ✔ See below. |
| **Training sequence** | 26 | Known pattern in the middle of the burst. |
| **S** | 1 | Second stealing flag. |
| **User data** | 57 | Second half of the payload. |
| **Tail** | 3 | All zeros. |
| *(Guard period)* | *8.25* | *Silence between bursts, so adjacent users' bursts don't overlap.* |

**Total: 3 + 57 + 1 + 26 + 1 + 57 + 3 = 148 bits**, plus 8.25 guard bits = **156.25**. Payload per burst = **2 × 57 = 114 bits** (used on slide 23).

### Why is the training sequence in the *middle*?
- *(Your note: "first estimate the channel, design equaliser to improve quality of signal".)* ✔ The receiver knows the 26-bit pattern in advance, compares it with what arrives, and **estimates the channel's impulse response**. This shows how multipath has smeared the signal. It then sets up an **adaptive equaliser** (typically a Viterbi/MLSE equaliser) to undo that smearing, which causes inter-symbol interference, for the data bits.
- It's placed in the middle so that the channel estimate is "fresh" for data on both sides. At 250 km/h the channel changes during the burst, and the middle placement minimises the maximum distance between any data bit and the estimate.

### Stealing flags (F bits)
- *(Your note: "information bit, max 1 in one time slot; head-over-related information".)* The flags say whether each 57-bit half carries **user traffic (F = 0)** or has been **"stolen" for urgent control signalling (F = 1)**. The control channel used this way is the FACCH (Fast Associated Control Channel).
- **Why steal?** During a call, a handover command must reach the phone *immediately*. Waiting for the slow regular control slot (SACCH, about once per 480 ms) might be too late. So the network replaces some speech with the handover message, and the brief audio glitch is acceptable.

### Figure, top right: hierarchy of frequency and time
- Two frequency bands: **935–960 MHz downlink, 124 channels (200 kHz)** and **890–915 MHz uplink, 124 channels**.
- Each carrier carries **higher GSM frame structures** in time, made of **GSM TDMA frames** of 8 slots (4.615 ms). Each slot is a **normal burst** as above. *(Your note near the slots: "8 users will be scheduled during this time".)*

---

## Slide 23 — Radio Link Aspects: Multiframes and the 22.8 kb/s Rate

*(Your notes: "burst = slot"; "8 slots → 4.615 ms; after 1 frame you get next slot".)* ✔

### The hierarchy (figure, right, from bottom to top)

| Level | Contents | Duration |
|---|---|---|
| **Burst (slot)** | 156.25 bit periods | **0.577 ms** |
| **Frame** | 8 slots | **4.615 ms** |
| **Traffic multiframe** | **26 frames** | **120 ms** (26 × 4.615) |
| **Control multiframe** | **51 frames** | **235.38 ms** (51 × 4.615) |
| **Superframe** | 51 traffic multiframes *or* 26 control multiframes (both = 26 × 51 frames) | **6.12 s** |
| **Hyperframe** | 2048 superframes | **3 h 28 min 53.76 s** |

- The traffic (26) and control (51) multiframe lengths have no common factor. Because of this, the idle frame of the traffic channel slides across all positions of the control multiframe. That lets a mobile in a call occasionally read the neighbour cells' sync channels to identify them for handover.
- The **hyperframe** exists for **encryption**: the frame number is an input to the A5 cipher. A counter that only repeats every ~3.5 hours keeps the keystream from repeating too soon.

### The 26-frame traffic multiframe
- **One frame carries control signalling (SACCH)**: power control and timing advance commands downlink, measurement reports uplink.
- **One frame is unused (idle)**: the mobile uses it to measure neighbouring cells.
- **So 24 of 26 frames carry user traffic.**
- **Each traffic channel gets one slot per frame**, so **24 slots per 120 ms multiframe**. *(Your note: "one user → 1 slot per frame → 24 frames → 24 slots".)* ✔

### The gross data rate

**R = (114 bits/slot × 24 slots/multiframe) / (120 ms/multiframe) = 2736 / 0.12 = 22.8 kb/s**

*(Your labels: "bits sent in one slot", "slots gotten per multiframe", "time per multiframe".)* ✔

**Where does 22.8 come from in practice?** The full-rate speech codec outputs **13 kb/s**. Channel coding (convolutional coding, parity) expands that to **22.8 kb/s**. In other words, 22.8 kb/s is the *coded* rate per user, of which only ~13 kb/s is speech. **Half-rate** channels give a user one slot every *other* frame (11.4 kb/s), which doubles capacity to 16 users per carrier.

---

## Slide 24 — GPRS (General Packet Radio Service)

*(The slide says "Generalized"; the standard name is **General** Packet Radio Service. Your note: "GSM → 2G; introduced a parallel channel for the data traffic".)* ✔

### Uses a new architecture for data traffic
- **Lets users keep a persistent data connection** ("always-on"). The phone keeps an IP address and a logical context (a PDP context) but uses radio resources *only when packets actually flow*.
- **Sending data over a voice connection would add too much setup and teardown overhead.** Circuit-switched GSM data (9.6 kb/s) dedicated a timeslot for the entire session even while you read a web page. Each new connection took seconds to set up, and billing was per minute. Internet traffic is bursty, so a circuit wastes resources. **Packet switching** shares the slots among many users statistically and bills per megabyte.

### Uses the same frame structure as voice
- GPRS reuses the GSM carrier, TDMA frames and GMSK, so operators only needed **software upgrades plus a PCU (Packet Control Unit)** at the BSC, not new radios.
- **It can combine up to 8 timeslots (all slots of a carrier) for a single user.** This is **multislot** operation: a phone of class 4+1 uses 4 downlink and 1 uplink slots, for example.
- **Overall throughput up to 171.2 kb/s.** This is the theoretical maximum: **8 slots × 21.4 kb/s** with the least-protected coding scheme, CS-4. With the typical coding scheme CS-2 (13.4 kb/s per slot) and 3–4 slots, real users saw about **40–50 kb/s**.

### EDGE (Enhanced Data rates for GSM Evolution)
- **"A more aggressive PHY layer":** EDGE adds **8-PSK** modulation, **3 bits/symbol** instead of GMSK's 1, at the same 270.833 ksymbol/s, plus link adaptation across 9 coding schemes (MCS-1 to MCS-9).
- Per-slot rate rises to **59.2 kb/s**, so up to **473.6 kb/s** with 8 slots (around 200 kb/s in practice).
- The trade-off: 8-PSK is not constant-envelope, so it needs a more linear (less efficient) power amplifier, and it needs higher SNR (a denser constellation). EDGE switches back to GMSK when the channel is poor.

### "2.5G"
GPRS and EDGE are called **2.5G**: still the 2G radio, but with packet data and IP. They bridged the gap until 3G. (EDGE technically meets some ITU 3G requirements and is sometimes called "2.75G".)

---

## Slide 25 — GPRS Architecture (figure)

The voice path is unchanged: **BTS → BSC → MSC → Gateway MSC → Public telephone network**.

A **new parallel data path** branches off at the BSC: **BSC → (Gb interface) → SGSN → (Gn) → GGSN → (Gi) → Public Internet**.

Labels along the bottom:
- **Radio interface (FDMA/TDMA)** on **Um**.
- **Radio access network: GERAN** (GSM/EDGE Radio Access Network), made of the BTSs and BSCs.
- **Core network: General Packet Radio Service (GPRS) Core Network**, made of the SGSN and GGSN.
- **Public Internet** beyond Gi.

**Interfaces:** *Um* (air), *Gb* (BSC/PCU ↔ SGSN, Frame Relay/IP), *Gn* (SGSN ↔ GGSN, IP with GTP tunnelling), *Gi* (GGSN ↔ Internet, plain IP). There is also a link between the MSC and SGSN (the *Gs* interface) for combined procedures, for example paging a GPRS-attached phone for an incoming voice call.

**Legend:** BTS (tower), BSC, MSC, **SGSN** (Serving GPRS Support Node, router icon), **GGSN** (Gateway GPRS Support Node), mobile equipment.

---

## Slide 26 — GPRS Architecture: New Entities

- **New network-subsystem entities:** **SGSN** and **GGSN**. In effect, these are the packet-switched counterparts of the MSC and GMSC.
- **New interfaces** between them (Gb, Gn, Gi, Gr to the HLR, and others).
- **Key insight: the new cellular data network runs in parallel with the existing voice network, except at the edge.**
  - **The voice network's core is unchanged.** MSCs keep switching circuits.
  - **The data network operates in parallel.** Only the *edge* (the radio access, meaning BTS/BSC and the air interface) is shared, with timeslots dynamically split between voice and data.
  - The **HLR is shared**: it simply gets GPRS subscription data added.

This **overlay approach** (add a packet core beside the circuit core and share the RAN) let operators launch data without disrupting voice revenue. The split into **CS and PS domains** lasted through 3G (slide 32) and only disappeared in **4G, which is all-IP** (voice becomes VoLTE, just another packet service).

---

## Slide 27 — GPRS Architecture: SGSN and GGSN Roles

### SGSN (Serving GPRS Support Node): "the MSC of packet data"
- **A router responsible for delivering packets** to mobiles in its service area, and from them toward the Internet (through the GGSN).
- **Mobility and location management:** tracks the mobile's **routing area** (the packet equivalent of a location area) and handles cell and routing-area updates.
- **Authentication and billing:** runs the same SIM-based challenge–response with the HLR/AuC and produces charging records (by volume).
- **Stores user location information** (like the VLR does for voice).

### GGSN (Gateway GPRS Support Node): "the GMSC of packet data"
- **The logical interface to the Internet.** To the outside world it looks like an ordinary IP router behind which the mobile users' IP addresses sit. It usually **assigns the mobile's IP address**.
- **Keeps routing information for each mobile,** so that packets arriving from the Internet are routed to **the SGSN currently serving that mobile**. It does this by tunnelling them over **GTP** (GPRS Tunnelling Protocol). When the mobile moves to another SGSN, only the tunnel endpoint changes. The mobile's IP address stays the same, so TCP sessions survive mobility. The GGSN acts as the **mobility anchor**.
- **Maps the mobile's Internet (IP) address to the corresponding IMSI.** It translates between the outside world's identifier (an IP address) and the cellular network's internal identity (IMSI), much as the GMSC/HLR maps an MSISDN to the serving MSC for voice.

---

## Slide 28 — UMTS and WCDMA

**UMTS (Universal Mobile Telecommunications System)** is the 3GPP 3G system (Release 99, first launched around 2001).
- **Research started in Europe in the early 1990s** (EU projects), aimed at the ITU's **IMT-2000** 3G requirements: 144 kb/s for vehicles, 384 kb/s for pedestrians, 2 Mb/s indoors.
- **It uses Wideband CDMA (WCDMA) as its air interface:**
  - **5 MHz carrier** (versus 1.25 MHz for IS-95, hence "wideband").
  - **Chip rate 3.84 Mcps.** Each user's data is multiplied by a spreading code. The spreading factor (4 to 512) trades data rate against processing gain.
  - **Frequency reuse of 1:** *every cell uses the same carrier*. Users and cells are separated by codes (scrambling codes per cell, channelisation/OVSF codes per user).
- **It is the successor of GSM:**
  - **Same core network as GSM/GPRS.** MSC, HLR, SGSN and GGSN were evolved, not replaced. This protected operators' investments.
  - **Changed air interface** (WCDMA instead of TDMA) and a new RAN (UTRAN, slide 33).
  - **Renamed components and interfaces** (see the table on slide 31).
- **Originally 144 kb/s up to 2 Mb/s, depending on mobility.** Fast-moving users get less, because a fast-fading channel can't support high spreading-reduced SINR margins, and the IMT-2000 targets were set per mobility class. Real Release 99 networks topped out at **384 kb/s**.

---

## Slide 29 — Why WCDMA?

### Higher capacity
- **Reuse 1** means every cell can use the full spectrum. There is no division by N = 3–7 as in GSM.
- **Soft capacity:** there is no hard limit of "8 slots". Capacity is limited by the *total interference*. Each extra user raises the noise floor a little, so the system degrades gracefully (and voice users' silent periods free capacity).

### Improved multipath performance through diversity
- The chip duration is short (1/3.84 MHz ≈ 0.26 µs), so multipath echoes that arrive more than one chip apart can be **resolved separately**.
- A **RAKE receiver** has several "fingers", each tracking one multipath component, and combines them (maximal-ratio combining). Multipath, which is the *enemy* of TDMA (it needs an equaliser), becomes a *source of diversity gain*.

### Lower mobile transmit power, so longer battery life
- **Power control:** CDMA needs it to solve the **near–far problem**. A phone near the tower would drown out a distant phone on the same frequency. WCDMA runs **fast closed-loop power control at 1500 Hz** (every 0.667 ms slot), so every phone arrives at the base station with just enough power. Phones never transmit more than necessary.
- **Variable transmission rate with voice activity detection (VAD):** in a conversation each person talks only ~40–50 % of the time. During silence, the phone transmits at a low rate or barely at all. This saves battery *and*, because capacity is interference-limited, **directly increases capacity**.

### Soft handoff

> **Your margin notes:** you wrote that soft handoff relates to a "natural gap between any 2 base stations to maintain connectivity", and that in hard handoff "there will be a moment where you're connected to neither of them because their ranges don't overlap". A cleaner way to put it:
> - **Soft handoff ("make-before-break"):** neighbouring cells' coverage *overlaps*. Because all cells use the **same frequency**, the mobile can be connected to **two or three base stations simultaneously** (its **active set**) in the overlap region. Uplink signals are combined (the RNC picks the best frame) and downlink signals are RAKE-combined. The old link is dropped only after the new one is solid, so there is **no interruption**, plus macro-diversity gain at the cell edge.
> - **Hard handoff ("break-before-make"):** the mobile must **release the old link before setting up the new one**. The brief gap is not because the coverage doesn't overlap (it usually does). It happens because in **GSM, neighbouring cells use different frequencies** and the phone's single radio can only be tuned to one at a time. So there is a short moment (tens of milliseconds) of being connected to neither.
> - Your little drawings capture it: two overlapping circles for soft handoff, and separate cells for hard handoff.

### Simultaneous support for services with different QoS
UMTS defined **four QoS (traffic) classes**:

| Class | Example | Key requirement |
|---|---|---|
| **Conversational (real-time)** | Voice, video telephony | Low *and* constant delay (≤ ~150 ms one-way), symmetric; errors tolerable |
| **Streaming** | Video and audio streaming | Bounded delay variation (jitter); the player buffers, so absolute delay matters less |
| **Interactive** | Web browsing, database queries | Request–response: round-trip delay matters; data must be error-free |
| **Background** | E-mail, downloads, SMS | Delay-insensitive; error-free; uses leftover capacity |

Different services can run **at the same time** on one connection (for example a voice call while downloading e-mail), with different spreading factors and QoS treatment.

---

## Slide 30 — 3G and 3.5G Architecture (figure)

The figure has the same layout as the GPRS figure (slide 25) but with the radio side relabelled:
- **Node B** (base station) → **Radio Network Controller (RNC)** → splits to **MSC → Gateway MSC → Public telephone network** and to **SGSN → GGSN → Public Internet**.
- Bottom labels: **radio interface (WCDMA, HSDPA)**, **radio access network: Universal Terrestrial Radio Access Network (UTRAN)**, **core network: GPRS core network**.

### Key insight
- **Same architecture as 2.5G except for the radio access network.** The core is reused.
- **New interfaces** (Iub, Iur, Iu, below).
- **Changes in naming** (BTS → NodeB, BSC → RNC).
- The SGSN remains and is now connected to the RNC over **Iu-PS** instead of to the BSC over Gb.

---

## Slide 31 — UMTS System Architecture

The diagram is divided into three domains by vertical lines labelled with interfaces:

**UE —(Uu)— UTRAN —(Iu)— CN — External networks**

### UE (User Equipment)
- **USIM** (Universal SIM, the 3G SIM, supporting mutual authentication) and **ME**, connected by the **Cu** interface (the electrical interface between the card and the phone).

### UTRAN
- Four **Node Bs**, two **RNCs**.
- **Iub:** Node B ↔ RNC (like GSM's Abis).
- **Iur:** RNC ↔ RNC. **This interface is new and has no GSM equivalent.** It exists for **soft handoff across RNCs**: if a mobile's active set includes a Node B under a *different* RNC, that RNC (the Drift RNC) forwards the data over Iur to the mobile's Serving RNC, which does the combining. So the RNCs talk to each other directly without involving the core.

### CN (Core Network)
- **MSC/VLR** and **GMSC** (circuit domain), **SGSN** and **GGSN** (packet domain), **HLR** (shared). Both RNCs connect to both the MSC/VLR and the SGSN.

### The renaming table (bottom left)

| GSM | UMTS |
|---|---|
| Mobile device/station (MS) | **User Equipment (UE)** |
| Base station (BS/BTS) | **Node B** |
| Base Station Controller (BSC) | **Radio Network Controller (RNC)** |

The bottom-right strip, **UE | UTRAN — CN**, is the simplified three-block view.

---

## Slide 32 — Core Network (CS and PS domains)

### Circuit-Switched (CS) domain, connected via **Iu-CS**
- **MSC:** switches voice and video calls (circuits).
- **VLR:** temporary subscriber data for the area.
- **GMSC:** gateway to the PSTN and other networks.

### Packet-Switched (PS) domain, connected via **Iu-PS**
- **SGSN:** packet routing, mobility (routing areas), authentication, billing.
- **GGSN:** gateway to the Internet, IP address allocation, mobility anchor.

### Registers
- **HLR:** shared by both domains. One subscriber record holds both voice and data subscriptions. (In UMTS it works with the AuC to run **AKA, Authentication and Key Agreement**, which adds network authentication and integrity protection to GSM's scheme.)

**Why two domains?** This is the legacy of the GPRS overlay (slide 26). A UMTS phone can have a voice call in the CS domain and a data session in the PS domain at the same time over the same radio link (a "multi-RAB" connection). The CS domain disappears in 4G.

---

## Slide 33 — UTRAN (UMTS Terrestrial Radio Access Network)

### Two new elements
- **Node B:** the base station. It handles the WCDMA physical layer (spreading, scrambling, RAKE, modulation, fast inner-loop power control at 1500 Hz).
- **RNC (Radio Network Controller):** controls many Node Bs.

### Radio Network Subsystem (RNS)
- **One RNC plus one or more Node Bs form an RNS.** This is the 3G equivalent of GSM's BSS.

### The UTRAN handles all radio-related functions
- **Radio Resource Management** (detailed on slide 34).
- **Soft handoff:** the RNC performs **selection combining** of the uplink frames received from the several Node Bs in the active set, and **splits** downlink data to all of them. This is a big reason the RNC is powerful and centralised in 3G. *(Topic 3, slide 41: "3G centralised control in the RNC".)*
- Other RNC roles: ciphering, header compression, outer-loop power control (setting the SIR target), RLC retransmissions.

### Maximising the common handling of PS and CS data
The same UTRAN radio procedures, channels and protocols carry both circuit voice and packet data, so the UTRAN doesn't need two separate radio stacks. Only at the Iu interface does traffic split toward Iu-CS or Iu-PS.

---

## Slide 34 — Radio Resource Management (RRM)

RRM functions fall into two groups.

### Network-based functions (look at the cell or system as a whole)
- **Admission Control (AC):** for every **new incoming connection**, checks whether admitting it would push the cell's interference/load beyond what keeps *existing* users' quality acceptable. If the connection is admitted, AC sets its parameters (bit rate, spreading factor, power targets). In CDMA this matters because capacity is soft. Without AC, one more user could degrade everyone's link.
  - Typical criterion: uplink **noise rise** (total received wideband power over thermal noise) must stay below about 3–6 dB, which is roughly a 50–75 % load factor. Downlink: total Node B transmit power below a threshold.
- **Load Control (LC):** handles situations where **load still exceeds the threshold** (users moved, the radio channel changed) and takes **countermeasures** to return to a feasible load. Examples include lowering bit rates of best-effort users, delaying packet data, handing users over to another carrier or to GSM, and as a last resort dropping low-priority connections. In short: AC is preventive, LC is corrective.
- **Packet Scheduler (PS):** handles **non-real-time (packet data) traffic**. It decides **when** each packet transmission starts and **at what bit rate**. It fills the capacity left over after real-time traffic. (This is the ancestor of the per-slot MAC scheduler in LTE/NR, Topic 3, slide 40. In Release 99 it sits in the RNC and is slow; HSDPA moved it to the Node B, slide 35.)

### Connection-based functions (per user)
- **Handoff Control (HC):** makes handoff decisions and **manages the UE's active set**, meaning which base stations it is simultaneously connected to in soft handoff. Cells are added, removed or replaced based on pilot strength (Ec/I0) measurements with hysteresis thresholds.
- **Power Control (PC):** maintains and maximises link quality while **minimising transmitted power**. It has three loops:
  - **Open loop:** initial power from the measured path loss (used for initial access).
  - **Closed inner loop:** 1500 Hz up/down commands from the Node B to meet an SIR target.
  - **Outer loop:** the RNC adjusts the SIR target itself to hit a target **block error rate (BLER)**.

  This is the same open-loop plus closed-loop structure as LTE/NR power control in Topic 3, slide 26.

---

## Slide 35 — 3.5G System (HSPA)

Later 3G releases improved performance substantially. These upgrades are called **3.5G**, or HSPA (High Speed Packet Access).

### HSDPA (High Speed Downlink Packet Access), Release 5
- **1.8 to 14.4 Mb/s downlink** (depending on UE category). The peak 14.4 Mb/s needs 16-QAM, 15 parallel codes (SF 16) and almost no coding.
- **Three key techniques:**
  - **Adaptive Modulation and Coding (AMC):** replaces fast power control as the link-adaptation method (slide 36).
  - **Hybrid ARQ (HARQ):** *(Your note: "FEC + ARQ; keeps previous info of the retransferred data".)* ✔ HARQ combines **forward error correction** with **automatic repeat request**. If a packet fails to decode, the receiver **does not throw it away**. It keeps the soft (analogue-like) values and **combines them with the retransmission**.
    - **Chase combining:** the same bits are resent and their energy adds up.
    - **Incremental redundancy:** extra parity bits are sent, lowering the effective code rate.

    Each retransmission makes decoding much more likely. HARQ is handled in the **Node B** with fast ACK/NACK, rather than RLC retransmissions from the distant RNC, which cut retransmission delay from ~100 ms to a few ms.
    *(Your note also wrote "adaptive repeat request". The standard term is **automatic** repeat request.)*
  - **Fast scheduling:** the scheduler moves from the RNC **down to the Node B**, with a short **2 ms TTI** (versus 10–80 ms in Release 99). The Node B sees each UE's channel quality report (CQI) every 2 ms and serves users when their channel is good. This is **multi-user diversity** and the start of Proportional Fair scheduling (Topic 3, slide 40).
- HSDPA also changed the resource model. Instead of a dedicated channel per user with power control, there is a **shared channel (HS-DSCH)** with **fixed power and variable rate**, time-shared among users.

### HSUPA (High Speed Uplink Packet Access), Release 6
- **Uplink up to 5.76 Mb/s.** It brings HARQ, a 2 ms TTI and Node-B-controlled scheduling to the uplink (via the "E-DCH" channel). The uplink keeps power control because of the near–far problem.

### HSPA+ (Evolved HSPA), Release 7 onward
- **Peak rates rose from 21 Mb/s to as high as 336 Mb/s** across releases. For example, 21 Mb/s with 64-QAM, 42 Mb/s with dual-carrier or 2×2 MIMO, 84 Mb/s with dual-carrier plus MIMO, and up to 336 Mb/s with 8 carriers plus MIMO in late releases.
- **Techniques:** **64-QAM** (6 bits/symbol), **2×2 and 4×4 MIMO** (spatial multiplexing), and **dual- or multi-carrier** operation (aggregating several 5 MHz carriers, a forerunner of LTE carrier aggregation).
- **Better battery life and faster wake-up from idle:** Continuous Packet Connectivity (DTX/DRX, so the phone sleeps between bursts while staying connected) and "Enhanced CELL_FACH" (small transfers without full connection setup), which reduce the latency of going from idle to active.

### Eventually led to LTE
HSPA's techniques (AMC, HARQ, fast scheduling at the base station, MIMO, multi-carrier) became the core of LTE. LTE combined them with **OFDMA**, which handles wide bandwidths and multipath better than CDMA, a **flat architecture** (no RNC, Topic 3, slide 41), and an **all-IP core**.

---

## Slide 36 — HSDPA in Detail (end of quiz material)

- **Standardised in 3GPP Release 5** (2002).
- **Improves system capacity and user data rates in the downlink** (downlink matters most because web and video traffic is heavily asymmetric).

### Adaptive Modulation and Coding (AMC)
- **Rate control works by dynamically adjusting the channel-coding rate and dynamically choosing between QPSK and 16-QAM modulation.**
  - Every 2 ms the UE reports a **CQI** based on its measured channel quality. The Node B picks the combination of modulation, code rate and number of codes (the transport block size) that the UE can decode with ≈10 % first-transmission BLER. HARQ cleans up the rest.
  - Good channel: **16-QAM** (4 bits/symbol) with a high code rate (little redundancy), so a big transport block.
  - Poor channel: **QPSK** (2 bits/symbol) with a low code rate (heavy redundancy), so a small transport block.
- **Users farther from the base station use modulation and coding that need a lower Eb/I0 (bit energy to interference ratio), which gives lower throughput.**
  - *(Your note: "low SNR".)* ✔ Far users have high path loss and more interference from neighbouring cells, so their SINR is low. A robust (low-order, heavily coded) MCS can be decoded at low Eb/I0, but each symbol carries fewer information bits, so throughput drops.
  - Compare this with **Release 99**: there, a distant user got the *same rate* by being given *more power* (power control). HSDPA does the opposite. It uses **constant power and varies the rate**, which is much more efficient for bursty data because it doesn't spend scarce power on users in bad conditions.
- This is the same principle as Topic 2's link adaptation and Topic 3's **"SINR is mapped to an MCS"** (Topic 3, slide 27). HSDPA is where it first became central to cellular systems.

---

## Quick-Review Cheat Sheet

**1G AMPS:** 824–849 MHz uplink, 869–894 MHz downlink (45 MHz duplex); 416 channels × 30 kHz per operator (395 voice FM + 21 control FSK); N = 7; R = 2–20 km; MTSO connects cells to the PTN, sets up calls and handles mobility.

**GSM numbers:**
- Uplink 890–915 MHz, downlink 935–960 MHz, 200 kHz carriers, 124/125 channels, 8 slots per carrier.
- GMSK modulation (1 bit/symbol, constant envelope); 270.833 kb/s per carrier.
- Bit = 3.69 µs; slot = 156.25 bits = 0.577 ms; frame = 8 slots = 4.615 ms.
- 26-frame traffic multiframe = 120 ms (24 traffic + 1 SACCH + 1 idle); 51-frame control multiframe = 235.38 ms; superframe = 6.12 s; hyperframe = 2048 superframes ≈ 3 h 28 min 53.76 s.
- Normal burst: 3 tail + 57 data + 1 S + 26 training + 1 S + 57 data + 3 tail = 148 bits, + 8.25 guard (30.5 µs).
- Rate per user = 114 × 24 / 120 ms = **22.8 kb/s** (coded; 13 kb/s speech).
- Slow frequency hopping every frame (217 hops/s), for frequency diversity and interference averaging.
- Max R = 35 km (timing advance limit); speeds up to 250 km/h.

**GSM architecture:**
- MS (ME + SIM) —Um— BTS —Abis— BSC —A— MSC — GMSC — PSTN.
- Databases: HLR (permanent, home), VLR (temporary, visited), AuC (Ki, RAND/SRES/Kc via A3/A8; A5 ciphering), EIR (IMEI white/black/grey lists).
- Registration = 12 steps: 4 radio + 4 authentication + 3 TMSI/VLR/HLR + 1 release.
- MOC: no HLR involved (the VLR suffices). MTC: GMSC → HLR → VLR (MSRN) → MSC → page the location area.

**2.5G:** GPRS = packet overlay (SGSN + GGSN; Gb/Gn/Gi; GTP tunnels); up to 8 slots, 171.2 kb/s max; voice core unchanged. EDGE = 8-PSK (3 bits/symbol), up to 473.6 kb/s.

**3G UMTS:**
- WCDMA: 5 MHz, 3.84 Mcps, reuse 1; RAKE (multipath diversity), fast power control at 1500 Hz (near–far problem), VAD, soft handoff (make-before-break, active set).
- QoS classes: conversational, streaming, interactive, background.
- UE (USIM + ME, Cu) —Uu— Node B —Iub— RNC (—Iur— RNC) —Iu-CS/Iu-PS— CN (MSC/VLR, GMSC | SGSN, GGSN | HLR). RNS = RNC + Node Bs.
- RRM: network-based = Admission Control, Load Control, Packet Scheduler; connection-based = Handoff Control, Power Control.

**3.5G:**
- HSDPA (Release 5): up to 14.4 Mb/s; AMC (QPSK/16-QAM), HARQ (soft combining), fast Node B scheduling with a 2 ms TTI; constant power with variable rate.
- HSUPA: 5.76 Mb/s uplink.
- HSPA+: 21 → 336 Mb/s with 64-QAM, MIMO and multi-carrier.
- These led to LTE.
