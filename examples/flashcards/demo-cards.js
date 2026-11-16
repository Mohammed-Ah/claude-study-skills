// Small demo deck showing all three card types. Build it with:
// python3 skills/lecture-flashcards/scripts/build.py --cards examples/flashcards/demo-cards.js --out /tmp/demo.html --title "Demo" --heading "Demo deck"
const TOPICS = ["Link budgets", "Modulation", "Multiple access", "Cellular basics", "MIMO", "Mobility", "Security", "Architecture"];
const CARDS = [
 {type:"mcq", calc:true, src:"Demo · 1", topic:0,
  q:"A transmitter sends 20 dBm through a path loss of 100 dB. What is the received power?",
  code:"P_rx[dBm] = P_tx[dBm] − PL[dB]", opts:["−120 dBm","−80 dBm","0.2 dBm","120 dBm"], ans:1,
  exp:"20 − 100 = −80 dBm. −120 dBm wrongly adds 20 to the loss; 0.2 dBm divides instead of subtracting in dB."},
 {type:"fill", calc:true, src:"Demo · 2", topic:1,
  q:"How many bits does each 64-QAM symbol carry?", ans:"6", accept:["six","6 bits"],
  exp:"log2(64) = 6. A common slip is answering 8 (confusing it with 256-QAM)."},
 {type:"short", calc:false, src:"Demo · 3", topic:2,
  q:"Compare FDMA and TDMA in one exam-style answer.",
  model:"1. FDMA gives each user its own frequency channel for the whole call; TDMA gives each user a recurring time slot on a shared carrier.\n2. Mechanism: FDMA separates users with filters; TDMA needs tight synchronisation and guard times.\n3. Key contrast: TDMA lets one radio serve many users and frees the handset to measure other cells between slots.\n4. Example: AMPS is FDMA; GSM combines FDMA (200 kHz carriers) with TDMA (8 slots).", exp:""},
 {type:"mcq", calc:false, src:"Demo · 4", topic:3,
  q:"Which statement about cell splitting is FALSE?", opts:["It increases capacity without new spectrum","It reduces the number of handovers","Halving the radius gives about 4× the cells","Transmit power is reduced in the new cells"], ans:1,
  exp:"Smaller cells mean users cross boundaries more often, so handovers increase. The other three statements are true."},
 {type:"fill", calc:false, src:"Demo · 5", topic:4,
  q:"In TDD massive MIMO the gNB estimates the downlink channel from the uplink ____ (abbreviation).", ans:"SRS", accept:["sounding reference signal","sounding reference signals"],
  exp:"Sounding Reference Signals plus channel reciprocity. CSI-RS + PMI feedback is the FDD method."},
 {type:"mcq", calc:false, src:"Demo · 6", topic:5,
  q:"Which handoff type is make-before-break?", opts:["Hard handoff in GSM","Soft handoff in WCDMA","Inter-RAT handoff from LTE to GSM","Any handoff between different carriers"], ans:1,
  exp:"With reuse 1, a WCDMA UE can be connected to several Node Bs at once. GSM handoffs are break-before-make because neighbouring cells use different frequencies."},
 {type:"short", calc:false, src:"Demo · 7", topic:6,
  q:"Explain why GSM uses a TMSI.", model:"The TMSI is a temporary alias assigned by the VLR after authentication and sent encrypted. Using it instead of the permanent IMSI over the air stops eavesdroppers from tracking a subscriber. Only the VLR maps TMSI ↔ IMSI. Example: after a location update the network sends a new TMSI in steps 9–10 of registration.", exp:""},
 {type:"mcq", calc:false, src:"Demo · 8", topic:7,
  q:"Which O-RAN component runs xApps?", opts:["Non-RT RIC","SMO","Near-RT RIC","O-RU"], ans:2,
  exp:"xApps run in the near-RT RIC (10 ms–1 s loops). rApps run in the non-RT RIC inside the SMO."}
];
