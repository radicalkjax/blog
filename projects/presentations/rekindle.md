---
theme: none
title: Hacking Together A Discord Clone
info: Building Rekindle — Xfire, Veilid, Tauri, architecture, secure control, and community governance.
author: Kali Jackson
routerMode: hash
aspectRatio: 16/9
canvasWidth: 1280
colorSchema: dark
presenter: true
browserExporter: true
monaco: false
twoslash: false
record: false
wakeLock: false
transition: fade-out
fonts:
  sans: Arial
  mono: DM Mono
  provider: none
defaults:
  layout: chiral
chapter: INTRO
class: cover
---

# Hacking Together<br>A Discord Clone

<p class="tagline">Everything is Lego.</p>
<p>Rekindle · Kali Jackson / @radicalkjax</p>
<img class="cover-brand" src="./assets/rekindle.png" alt="Rekindle logo">

<!--
This is my journey building Rekindle: the motivation, prior art, technical choices, things that broke, and what I learned. I am the person going through that journey; the clankers are tools I worked with. Sam is an artistic reference, not the narrator. Target 35–40 minutes including demo and questions.
-->
---
chapter: INTRO
---

# Preso flow

<ol class="agenda"><li>Porque?</li><li>Xfire: history and analysis</li><li>Veilid: use-case and reasoning</li><li>Tauri: why I love it</li><li>STEAM vs STEM for clankers</li><li>App architecture</li><li>3 Step-Intents, governance, identity</li><li>What I’ve learned</li><li>Demo</li><li>Questions</li></ol>

<!--
Follow the author’s Google Slides sequence. The talk moves from personal motivation and prior art into actual implementation, then the design choices and lessons.
-->

---
chapter: PORQUE?
---

# Because “fuck Discord,” that’s why.

<p class="lede">I want the social features. I want a different answer to who controls them.</p>
<v-clicks>

- A central service retains account and activity data.
- Deleting an account does not automatically delete every message.
- The operator decides how the service changes—and whether it survives.

</v-clicks>
<p class="small"><a href="https://support.discord.com/hc/en-us/articles/5431812448791-How-long-Discord-keeps-your-information">Discord’s own retention explanation</a></p>

<!--
1–2 minutes. These are the privacy and platform-dependence motivations behind the original placeholder list. Discord’s retention document distinguishes account deletion from messages and includes exceptions. Do not imply no deletion controls exist.
-->

---
chapter: XFIRE
---

# Xfire ran so Discord could walk.

<div class="timeline"><div><strong>2004</strong><p>Xfire launches: find your friends, see their games, join them.</p></div><div><strong>2005</strong><p>Yahoo sues. The case is settled; Xfire continues operating.</p></div><div><strong>2015</strong><p>The messaging service shuts down.</p></div></div>
<p class="punchline">A useful product can disappear when the business around it changes.</p>
<p class="small"><a href="https://www.builtinsf.com/articles/xfire-oral-history">Xfire founders and staff · oral history</a></p>

<!--
1 minute. Keep the original prior-art argument but correct its chronology: January 2004 launch, 2005 patent lawsuit, later settlement; the lawsuit did not immediately kill Xfire. The founders’ interview connects shutdown to changing ownership, resources and product direction.
-->

---
chapter: XFIRE
---

# Reverse engineer the experience

<div class="split equal"><div><h2>What I want to keep</h2>

<v-clicks>

- A small buddy list, not one giant window.
- Chat windows that behave like desktop tools.
- Presence, calls, file sharing.
- Skins. Yes, skins.

</v-clicks>
</div><div><h2>What gets rebuilt</h2>
<p>The familiar client sits on a new peer-to-peer foundation.</p>
<p class="small">Rekindle keeps extracted skin and layout references under <code>legacy/unpacked/skins/</code>.</p></div></div>

<!--
1 minute. docs/architecture/ui-skin.md explicitly calls the Xfire-style client a load-bearing design goal. Original assets and XML layouts supplied visual references. Explain this as analysis and reimplementation, not a legal assurance about reuse.
-->

---
chapter: VEILID
---

# I wanted to learn Veilid.

<p class="lede">A chat app gave me something familiar to build on an unfamiliar network.</p>
<v-clicks>

- Prior art for the app; real work to understand the protocol.
- Privacy is part of Veilid’s purpose. The implementation is open source.
- Every node contributes. There is no application server to quietly lean on.
- That makes it a deliberately tough project for the clankers.

</v-clicks>
<p class="small"><a href="https://veilid.com/">Veilid</a> · also: chill peeps.</p>

<!--
1 minute. Preserve the author’s personal reasoning from the Google deck: learn Veilid, choose a privacy-oriented open protocol and challenge agents with decentralized responsibilities. Avoid saying the protocol alone solves all app privacy or legal questions.
-->

---
chapter: VEILID
---

# Storing a message ≠ notifying a peer

```mermaid {theme: 'base', themeVariables: {primaryColor: '#172b38', primaryTextColor: '#edf1f5', primaryBorderColor: '#92d2dc', lineColor: '#a6b8c8', fontFamily: 'Arial', fontSize: '22px'}}
flowchart LR
 A[Send a message] --> B[Permission check + encryption]
 B --> C[Write encrypted record]
 C --> D[Gossip a notification]
 D --> E[Peer fetches and verifies]
 E --> F[Decrypt and display]
```

<v-clicks>

- The record carries the message; gossip tells peers where to look.
- Notification failure and persistence failure need different recovery paths.

</v-clicks>
<p class="source">rekindle-channel/src/pipeline.rs · community/message_notifications_handle.rs</p>

<!--
1–1.5 minutes. Actual send pipeline persists encrypted content before best-effort gossip. Receiver fetches from the DHT and verifies/decrypts. Watches and inspection provide backstops. The delivered status is not a read receipt.
-->

---
chapter: TAURI
---

# Why I love Tauri

<p class="lede">Rust 🏳️‍⚧️ + the OS’s native webview.</p>
<v-clicks>

- Web UI where it helps. Rust where the state, keys, and protocol live.
- Explicit permissions between the webview and native capabilities.
- Desktop and mobile support in the framework.
- My client can look like Xfire without fighting the OS title bar.

</v-clicks>
<p class="small"><a href="https://tauri.app/concept/process-model/">Process model</a> · <a href="https://tauri.app/security/capabilities/">Capabilities</a></p>

<!--
1 minute. Preserve enthusiasm, correct the original “everything is containers” claim: Tauri uses processes and native webviews, not container isolation. Framework platform support is not a claim of completed Rekindle mobile support.
-->

---
chapter: TAURI
---

# The frontend asks. Rust does the work.

<div class="split">
<div>

```ts {all|1|2}
createCommunity: (name: string) =>
  invoke<string>("create_community", { name }),
```

<a class="source" href="https://github.com/ScopeCreep-zip/Rekindle/blob/e6c3f1c1b4e4f73a18f258dcb8a1309063e4314e/src/ipc/commands/community.ts#L81">src/ipc/commands/community.ts · 81–82</a>

</div>
<div>

<h2>Create a community</h2>

<v-clicks>

- A small typed call from the client.
- The native side owns the operation.
- The command boundary is where access and input handling matter.

</v-clicks>

</div>
</div>

<!--
1 minute. Real excerpt, not pseudocode. Step through the createCommunity call. Show where the UI-to-native boundary sits; this wrapper itself is not an authorization check.
-->

---
chapter: STEAM VS STEM
---

# Art gives the clanker context.

<div class="split equal"><div>

<v-clicks>

- I’m combining CogSci and CompSci.
- Death Stranding fits: building a network, connecting communities, doing difficult technical work.
- Sam has milestones and a reason to finish. An agent needs those too.

</v-clicks>
</div><div><img class="art-reference" src="./assets/death-stranding-landscape.jpg" alt="Sam crossing a broad landscape in Death Stranding"><p class="image-credit">Death Stranding · Kojima Productions / SIE · PlayStation image</p><p class="small">Sam’s journey gave me a way to think about my own work.</p></div></div>

<!--
1–1.5 minutes. This is where I explain how the Chiral influence helped me think about the project. I am the one going on the journey: learning the network, choosing the architecture, hitting failures, and working toward a usable app. Sam provides a reference for that experience. Milestones and dependency boundaries also help me direct the agents, but they do not become the protagonists. Official gameplay source: https://blog.playstation.com/2019/09/12/death-stranding-new-tgs-gameplay-video/
-->

---
chapter: CHIRAL ARCH
---

# Everything is Lego. Boundaries matter.

<div class="split">
<div>

```rust {all|1-2|3-6}
pub async fn send_channel_message<D: ChannelMessagingDeps>(
    deps: &D,
    community_id: &str,
    channel_id: &str,
    body: &str,
) -> Result<ChannelSendResult, ChannelError> {
```

<a class="source" href="https://github.com/ScopeCreep-zip/Rekindle/blob/e6c3f1c1b4e4f73a18f258dcb8a1309063e4314e/crates/rekindle-channel/src/pipeline.rs#L128">crates/rekindle-channel/src/pipeline.rs · 128–133</a>

</div>
<div>

<h2>One job, explicit dependencies</h2>

<v-clicks>

- The channel pipeline depends on a trait.
- The host supplies records, keys, events, and storage.
- Change the host without rewriting the messaging rules.

</v-clicks>

</div>
</div>

<!--
1 minute. Actual generic send pipeline and ChannelMessagingDeps boundary. The adapter implements host-specific work. This is a concrete agent-workflow benefit: a bounded task with known inputs and effects, not a mystical roleplay layer.
-->

---
chapter: APP ARCH
---

# Client, communities, multimedia

```mermaid {theme: 'base', themeVariables: {primaryColor: '#172b38', primaryTextColor: '#edf1f5', primaryBorderColor: '#92d2dc', lineColor: '#a6b8c8', fontFamily: 'Arial', fontSize: '22px'}}
flowchart LR
 UI[Desktop: Solid + Tauri] --> R[Shared Rust logic]
 TUI[Terminal: CLI / TUI] --> N[Daemon via Noise IK IPC]
 N --> R
 R --> C[Community state + governance]
 R --> M[Messaging + media]
 C --> V[Veilid records and routes]
 M --> V
```

<p class="small">Shared rules; the clients still have different feature coverage.</p>

<!--
1 minute. Return to the author’s app-architecture section. Explain clients first, then community state, then multimedia. The shared logic is distributed across crates and runtimes, not necessarily one central object.
-->

---
chapter: CLIENT
---

# Skins!!! And why not a TUI?

<div class="split equal"><div><h2>Desktop</h2>

<v-clicks>

- Login and connect.
- Buddy list and separate chat/community windows.
- Xfire-style skin and custom window controls.

</v-clicks>
</div><div><h2>Terminal</h2><p>The daemon owns the node; the TUI talks to it over authenticated IPC.</p><p>Same project. A different way to use it.</p></div></div>

<!--
1 minute. The original slide asks why not a TUI. Explain daemon/CLI separation and avoid implying full feature parity. Skin architecture and window catalog: docs/architecture/ui-skin.md.
-->

---
chapter: COMMUNITIES
---

# “Plate Gates”: the next segment

<div class="code-wide">

```rust {all|1-4|6-8|10-11}
let next_segment_index = descriptors.last().map_or(1, |d| d.segment_index + 1);
if next_segment_index >= MAX_SEGMENTS {
    return Err(GovernanceRuntimeError::SegmentCapReached(MAX_SEGMENTS));
}

if !highest_segment_full(deps, community_id).await? {
    return Err(GovernanceRuntimeError::SegmentNotFull);
}

let slot_range_start = next_segment_index * SLOTS_PER_SEGMENT;
let slot_range_end = slot_range_start + SLOTS_PER_SEGMENT;
```

<a class="source" href="https://github.com/ScopeCreep-zip/Rekindle/blob/e6c3f1c1b4e4f73a18f258dcb8a1309063e4314e/crates/rekindle-governance-runtime/src/segments.rs#L123">crates/rekindle-governance-runtime/src/segments.rs · 123–133</a>

</div>
<p v-click>255 slots per segment. Add a registry/governance pair when full; announce it through governance.</p>

<!--
1 minute. Plate Gate is the project’s existing name, kept in its original context. Protocol allocates 255 for compatibility; Veilid can validate 256 under o_cnt:0. Eight segments is the current cap, not a 2,040-user load-test result.
-->

---
chapter: COMMUNITIES
---

# Who gets to change the community?

<div class="code-wide">

```rust {all|1-7|8-11}
for (idx, authored) in all.iter().enumerate() {
    let is_genesis = idx == 0;

    if is_genesis {
        // Genesis entry always accepted — bootstraps the community
        state.creator = Some(authored.author.clone());
        apply(&authored.author, &authored.entry, &mut state);
    } else if validate_write(&authored.author, &authored.entry, &state) {
        apply(&authored.author, &authored.entry, &mut state);
    }
    // else: silently excluded (reader-validates)
}
```

<a class="source" href="https://github.com/ScopeCreep-zip/Rekindle/blob/e6c3f1c1b4e4f73a18f258dcb8a1309063e4314e/crates/rekindle-governance/src/merge/mod.rs#L67">crates/rekindle-governance/src/merge/mod.rs · 67–78</a>

</div>
<p v-click>Writing an entry does not mean the community accepts its effect.</p>

<!--
1–1.5 minutes. Real merge loop; earlier sorting is by Lamport then author. Genesis bootstraps creator, later writes require validation. Same entry set produces the same state, but peers can temporarily have different sets.
-->

---
chapter: MULTIMEDIA
---

# So now I’m building a telecom app.

```mermaid {theme: 'base', themeVariables: {primaryColor: '#172b38', primaryTextColor: '#edf1f5', primaryBorderColor: '#92d2dc', lineColor: '#a6b8c8', fontFamily: 'Arial', fontSize: '22px'}}
flowchart LR
 S[Session state] --> C[Capture + encode]
 C --> E[Encrypt + fragment]
 E --> V[Veilid route]
 V --> D[Reassemble + decrypt]
 D --> P[Decode + playback]
```

<v-clicks>

- Audio: capture, echo control, noise suppression, jitter handling.
- Video: codec capabilities, negotiation, fragmentation, keyframes.
- And all of it has to agree on who is actually in the call.

</v-clicks>
<p class="small">20 ms Opus frames · 4 KiB video fragments · three-hop safety floor</p>

<!--
1 minute. Keep the author’s session-management/capture/in-transit sequence. Current multimedia code supports these values. Larger audio calls can use a peer MCU that decodes/mixes; that host is inside the plaintext trust boundary. This is not a measured latency claim.
-->

---
chapter: MULTIMEDIA
---

# “Connected” isn’t enough.

<div class="split">
<div>

```rust {all|2|3-6}
pub fn ready(&self) -> bool {
    self.handshake == JoinHandshake::Connected
        && self.roster_non_empty
        && self.mek_present
        && self.local_caps_reported
        && self.session_config_emitted
}
```

<a class="source" href="https://github.com/ScopeCreep-zip/Rekindle/blob/e6c3f1c1b4e4f73a18f258dcb8a1309063e4314e/crates/rekindle-voice/src/media_ready.rs#L45">crates/rekindle-voice/src/media_ready.rs · 45–51</a>

</div>
<div>

<MediaReadyDemo />

</div>
</div>

<!--
1–1.5 minutes. Real readiness predicate next to an interactive illustration. Tick every prerequisite, then remove the MEK to show a precise blocker. The illustration has a binary handshake; actual runtime also distinguishes Announced and Seen. It neither opens a connection nor changes Rekindle.
-->

---
chapter: TINFOIL SOCIALITE
---

# 3 Step-Intents

<p class="lede">A user should always stay part of flows.</p>
<v-clicks>
<div class="intent-step"><strong>1 · A proposes</strong><span>Make the request.</span></div>
<div class="intent-step"><strong>2 · B accepts</strong><span>Agree to the proposed change.</span></div>
<div class="intent-step"><strong>3 · A allows completion</strong><span>Keep the final authorization explicit.</span></div>
</v-clicks>
<p class="punchline">A → B → A = A + B</p>

<!--
1–1.5 minutes. The author’s cross-cutting secure-control/access design from Google slide 9. Reveal one intent at a time. Nintendo inspiration is the author’s attribution; official reciprocal registration and staged transfers are supporting precedents, not a named Nintendo doctrine. A transport acknowledgment cannot substitute for human consent.
-->

---
chapter: TINFOIL SOCIALITE
---

# Recovery is a trust decision.

<div class="split">
<div>

```rust {all|1-3|4}
state
    .pending_session_resets
    .lock()
    .insert(sender_hex.to_string(), prekey_bundle.to_vec());
```

<a class="source" href="https://github.com/ScopeCreep-zip/Rekindle/blob/e6c3f1c1b4e4f73a18f258dcb8a1309063e4314e/src-tauri/src/services/message_service/session_reset.rs#L105">src-tauri/src/services/message_service/session_reset.rs · 105–108</a>

</div>
<div>

<h2>Hold the new keys pending</h2>

<v-clicks>

- The request does not immediately replace the session.
- Keep the key bundle in memory.
- Show the safety number and request user acceptance.

</v-clicks>

</div>
</div>

<!--
1 minute. Concrete example of keeping the person inside a consequential flow. Earlier checks reject non-friends and empty bundles. User accepts through accept_session_reset after verifying the safety number out of band. This example supports the principle; it does not claim three manual confirmations in every current flow.
-->

---
chapter: GOVERNANCE
---

# Democracy of a new age, post Project 2025

<p class="lede">Social pressure forces democratized voting cycles and decentralization of leadership.</p>
<v-clicks>

- Members have a say in the direction of their community.
- Leadership is accountable to that community.
- The protocol checks whether the resulting administrative action is authorized.

</v-clicks>
<p class="punchline">Ownership means something.</p>

<!--
1–1.5 minutes. Preserve the author’s Google-slide political framing. Distinguish the current social governance practice from automated role enforcement: the audit established polls and roles, not a binding election-to-role engine or fixed quorum rules. Post–Project 2025 is the author’s democratic response to concentration of authority, not the origin of the model. Context: Mandate for Leadership and the Feb 18 2025 White House agency-control statement, linked in the appendix.
-->

---
chapter: GOVERNANCE
---

# What happens when the leader leaves?

<div class="split">
<div>

```rust {all|1-4}
// Step 0: Creator always has all permissions
if state.creator.as_ref() == Some(member) {
    return ALL;
}
```

<a class="source" href="https://github.com/ScopeCreep-zip/Rekindle/blob/e6c3f1c1b4e4f73a18f258dcb8a1309063e4314e/crates/rekindle-governance/src/permissions.rs#L32">crates/rekindle-governance/src/permissions.rs · 32–35</a>

</div>
<div>

<h2>Two things to separate</h2>

<v-clicks>

- Community operation is distributed across peers.
- Administrative roles can be granted and relinquished.
- The creator still has permanent authority in the current permission model.

</v-clicks>
<p class="small">Succession changes day-to-day leadership; it does not erase the creator’s power.</p>

</div>
</div>

<!--
1 minute. Address the original question about departure and loss of trust. Current ownership.rs explicitly returns still_creator on grants by the creator. Show this honestly as a tradeoff; avoid claiming democratic practice automatically revokes the genesis identity’s ALL permissions.
-->

---
chapter: IDENTITY
---

# One person. Different community identities.

<div class="code-wide">

```rust {all|2-3|4-5|6}
pub fn derive_community_pseudonym(master_secret: &[u8; 32], community_id: &str) -> SigningKey {
    let hkdf = Hkdf::<Sha256>::new(Some(b"rekindle-community-pseudonym-v1"), master_secret);
    let mut seed = [0u8; 32];
    hkdf.expand(community_id.as_bytes(), &mut seed)
        .expect("32-byte output is a valid HKDF-SHA256 length");
    SigningKey::from_bytes(&seed)
}
```

<a class="source" href="https://github.com/ScopeCreep-zip/Rekindle/blob/e6c3f1c1b4e4f73a18f258dcb8a1309063e4314e/crates/rekindle-secrets/src/derive.rs#L17">crates/rekindle-secrets/src/derive.rs · 17–23</a>

</div>
<v-clicks>

- Keep the master secret local. Use the community ID in the derivation.
- A different signing identity for each community.
- Different keys still cannot hide everything you reveal through timing or content.

</v-clicks>

<!--
1 minute. The author’s privacy-right and community-representation argument. Explain HKDF domain separation without claiming all correlation is impossible. Burning an identity cannot guarantee erasure of history stored elsewhere.
-->

---
chapter: LESSONS
---

# What I’ve learned

<p>Making a telecom app is hard. Who would’ve thought! /s</p>

<v-clicks>

- Veilid takes real upfront learning.
- Strong design and architecture can carry a project a long way.
- The clanker needs smaller jobs and better checks—not just more context.
- WebRTC and media stacks deserve their own security review.
- I still have a lot more to learn. :P

</v-clicks>

<!--
1 minute. Follow the author’s original closing points. The claim about specific critical WebRTC vulnerabilities needs a named affected version/CVE before it becomes a security claim; keep the talk at the review/trust-boundary lesson here. Existing governance/secrets/calls tests passed in the audit, but the demo needs rehearsal.
-->

---
chapter: DEMO
---

# Okay. Let’s use it.

<ol>
<li>Two identities. One community.</li>
<li>Send a message. Show the peer receiving it.</li>
<li>Change an administrative role. Explain whose authority permits it.</li>
<li>Start a call. Look at the readiness state.</li>
</ol>
<p class="small">If the network fails: inspect the trace and explain where the flow stopped.</p>

<!--
7–8 minutes. Rehearse with prepared profiles, a stable network and selected logs. This sequence is a plan, not a validated live recording. Show ordinary administrative delegation; do not try to demonstrate creator demotion. Have a captured failure trace ready.
-->

---
chapter: QUESTIONS
---

# Questions?

<p class="lede">Rekindle</p>
<p><a href="https://github.com/ScopeCreep-zip/Rekindle">github.com/ScopeCreep-zip/Rekindle</a></p>
<p>Kali Jackson · @radicalkjax</p>

<!--
Leave room for 5–10 minutes of discussion. The following slides are source references rather than additional talk sections.
-->

---
chapter: REFERENCES
---

# Sources and prior art

<ul class="reference-list"><li><a href="https://www.builtinsf.com/articles/xfire-oral-history">Xfire founders and staff: product, launch, lawsuit, shutdown</a></li><li><a href="https://support.discord.com/hc/en-us/articles/5431812448791-How-long-Discord-keeps-your-information">Discord: data retention</a></li><li><a href="https://veilid.com/">Veilid: privacy and peer-to-peer infrastructure</a></li><li><a href="https://tauri.app/concept/process-model/">Tauri: process model</a> / <a href="https://tauri.app/security/capabilities/">capabilities</a></li><li><a href="https://blog.playstation.com/2019/09/12/death-stranding-new-tgs-gameplay-video/">Death Stranding: connecting communities and planning the work</a></li><li><a href="https://www.nintendo.com/en-gb/Support/Legacy-system/Registering-friends-240216.html">Nintendo: reciprocal friend registration</a></li><li><a href="https://www.nintendo.com/en-gb/Support/Purchases-Subscriptions/Games/How-to-Transfer-an-Island-to-Another-Nintendo-Switch-2-or-Nintendo-Switch-Console-Animal-Crossing-New-Horizons--1879835.html">Nintendo: staged source/target transfer</a></li></ul>

<!--
The author’s Google deck supplies the outline and personal motivations. These references ground factual elaborations. No exact named Nintendo three-step-intents framework was established.
-->

---
chapter: REFERENCES
---

# Code and governance context

<ul class="reference-list"><li><a href="https://github.com/ScopeCreep-zip/Rekindle/tree/e6c3f1c1b4e4f73a18f258dcb8a1309063e4314e">Rekindle: commit-pinned implementation snapshot</a></li><li><a href="https://github.com/ScopeCreep-zip/Rekindle/blob/e6c3f1c1b4e4f73a18f258dcb8a1309063e4314e/docs/architecture/ui-skin.md">Client identity and Xfire skin architecture</a></li><li><a href="https://github.com/ScopeCreep-zip/Rekindle/blob/e6c3f1c1b4e4f73a18f258dcb8a1309063e4314e/crates/rekindle-governance-runtime/src/ownership.rs">Administrative succession and immutable creator authority</a></li><li><a href="https://www.congress.gov/118/meeting/house/117667/documents/HHRG-118-GO00-20240919-SD036.pdf">Project 2025: Mandate for Leadership</a></li><li><a href="https://www.whitehouse.gov/fact-sheets/2025/02/fact-sheet-president-donald-j-trump-reins-in-independent-agencies-to-restore-a-government-that-answers-to-the-american-people/">February 2025: White House agency-control statement</a></li></ul>
<p class="small">Each code slide links directly to its source excerpt.</p>

<!--
The democratic response is the author’s political framing. Source presence and unit tests are not a live-network benchmark.
-->
