---
theme: none
title: Hacking Together A Discord Clone
info: Building Rekindle, an Xfire-style chat app on Veilid and Tauri. Architecture, failures and fixes.
author: Kali Jackson
favicon: ./assets/rekindle.png
routerMode: hash
aspectRatio: 16/9
canvasWidth: 1280
colorSchema: dark
presenter: true
browserExporter: true
monaco: false
twoslash: false
record: false
wakeLock: true
transition: fade
magicMoveDuration: 900
fonts:
  sans: Barlow
  mono: DM Mono
  provider: none
defaults:
  layout: chiral
chapter: intro
bg: cover
scrim: divider
class: cover
hud: false
---

<div class="cover-title">

# Hacking Together<br>A Discord Clone

<img class="cover-brand" src="./assets/rekindle-mark.png" alt="Rekindle logo">

</div>

<p class="tagline">An Xfire-style chat app on Veilid, Tauri and Rust</p>
<p class="byline">REKINDLE · KALI JACKSON · @RADICALKJAX</p>

<!--
This is how I built Rekindle: why, the prior art, what I picked, what broke, what I learned. It's MIT, there's no company, and it's not done.

The line along the bottom of every slide is the agenda; the diamond is the current section.

~40 min + demo + questions.
-->

---
chapter: intro
---

# whoami

<div class="whoami">
<div>

- Originally from Merced and grew up on a farm
- Graduated from CSU Stanislaus
- Worked at Geek Squad while going to school
- I've been doing corpo things for about 10 years
- I've been modding/making/hacking since I was 10
- Enjoy lots of outside time with my gf and puppies
- Huge Pokemon, Sailor Moon and Cowboy Bebop fan

</div>
<img class="headshot" src="./assets/headshot-bsky.jpg" alt="Kali Jackson">
</div>

<!--
30 seconds.
-->

---
chapter: intro
---

# preso flow

<RouteMap />

<!--
20 seconds. Why I left Discord, the app I'm copying, the two things I built on (Veilid, Tauri), how I work with agents, then Rekindle's architecture and security design, what I learned, demo.
-->

---
chapter: why
bg: why
scrim: divider
class: divider
---

<p class="eyebrow">PART 01</p>

# Why?

<p class="subline loud">Because “<em>fuck Discord</em>,” that’s why.</p>

<!--
Divider. The next few slides are real attacks on Discord users, how each one works, and what I took from them.
-->

---
chapter: why
bg: why
---

# how Discord is built

<div class="proof panel">
“Routing all your network traffic through Discord servers also ensures that your IP address is never leaked whether you use text, voice, or video.”
<a class="source" href="https://discord.com/blog/how-discord-handles-two-and-half-million-concurrent-voice-users-using-webrtc#:~:text=Routing%20all%20your%20network%20traffic%20through%20Discord%20servers" target="_blank" rel="noopener">Discord engineering blog · 2.5M concurrent voice users</a>
</div>

<v-clicks>

- Other users never see your IP. <a class="cite" href="https://discord.com/privacy#:~:text=this%20includes%20information%20like%20your%20IP%20address" target="_blank" rel="noopener">Discord sees everyone’s, and logs it.</a>
- <a class="cite" href="https://discord.com/blog/every-voice-and-video-call-on-discord-is-now-end-to-end-encrypted#:~:text=End%2Dto%2Dend%20Encryption%20is%20now%20standard%20for%20every%20voice%20and%20video%20call" target="_blank" rel="noopener">Voice and video are end-to-end encrypted</a> (<a class="cite" href="https://discord.com/blog/meet-dave-e2ee-for-audio-video#:~:text=Today%2C%20we%E2%80%99ll%20start%20migrating%20voice%20and%20video%20in%20DMs" target="_blank" rel="noopener">DAVE, 2024</a>). <span v-mark="{ at: 2, color: '#e8501e', type: 'underline' }"><a class="cite" href="https://discord.com/blog/every-voice-and-video-call-on-discord-is-now-end-to-end-encrypted#:~:text=We%20have%20no%20current%20plans%20to%20extend%20E2EE%20to%20text%20messages" target="_blank" rel="noopener">Text is not.</a></span> The server can read every message.
- Joining a public server can get you its <a class="cite" href="https://discord.com/developers/docs/topics/permissions#:~:text=Allows%20for%20reading%20of%20message%20history" target="_blank" rel="noopener">full message history</a>.
- <a class="cite" href="https://www.dexerto.com/gaming/discord-bot-built-to-stop-alt-accounts-leaks-millions-of-users-ip-addresses-3416371/#:~:text=it%20records%20the%20IP%20address%20of%20every%20member%20who%20verifies" target="_blank" rel="noopener">Verification bots record the IP of everyone who verifies.</a>

</v-clicks>

<!--
1 min. Fair to Discord: the relay design does stop peer-to-peer IP leaks. But it means one company holds every IP, every message, and the social graph. Every attack in this section uses one of these properties.
-->

---
chapter: why
bg: why
---

# 0-click location from a friend request

<div class="split">
<div>

<ol class="steps">
<li v-click>Attacker sets an avatar and <a class="cite" href="https://gist.github.com/hackermondev/45a3cdfa52246f1d1201c1e8cdef6117#:~:text=sending%20a%20friend%20request%20to%20a%20Discord%20user%20triggers%20a%20push%20notification" target="_blank" rel="noopener">sends you a friend request</a>.</li>
<li v-click><a class="cite" href="https://gist.github.com/hackermondev/45a3cdfa52246f1d1201c1e8cdef6117#:~:text=Your%20phone%20downloads%20the%20avatar%20url" target="_blank" rel="noopener">Your phone fetches that avatar</a> for the push notification. Cloudflare caches it at the datacenter nearest you.</li>
<li v-click>Attacker asks every Cloudflare datacenter for the same URL. <a class="cite" href="https://gist.github.com/hackermondev/45a3cdfa52246f1d1201c1e8cdef6117#:~:text=cf%2Dcache%2Dstatus%20can%20be%20HIT%2FMISS%20and%20cf%2Dray%20includes%20the%20airport%20code" target="_blank" rel="noopener">The one that says <code>HIT</code> is near you.</a></li>
</ol>

<p v-click class="result">You never open the app. Result: <b><a class="cite" href="https://gist.github.com/hackermondev/45a3cdfa52246f1d1201c1e8cdef6117#:~:text=within%20a%20250%20mile%20radius" target="_blank" rel="noopener">~250 mile radius.</a></b></p>

</div>
<div>

```http {all|1-2|4-6}
GET /avatars/<user_id>/<avatar_hash>.png
Host: cdn.discordapp.com

HTTP/1.1 200 OK
cf-cache-status: HIT
cf-ray: 8f…-SJC
```

<p class="small">Steering the request to a chosen datacenter: first <a class="cite" href="https://gist.github.com/hackermondev/45a3cdfa52246f1d1201c1e8cdef6117#:~:text=using%20an%20IP%20range%20used%20internally%20by%20Cloudflare%20WARP" target="_blank" rel="noopener">a Cloudflare WARP routing bug</a>, then <a class="cite" href="https://gist.github.com/hackermondev/45a3cdfa52246f1d1201c1e8cdef6117#:~:text=reach%20about%2054%25%20of%20all%20Cloudflare%20datacenters" target="_blank" rel="noopener">VPN exits (~54% of Cloudflare datacenters)</a>.</p>

</div>
</div>

<!--
1.5 min. hackermondev, Jan 2025. cf-ray ends in the airport code of the datacenter that answered. The demo located Discord's CTO to the SF area.

Responses: Cloudflare fixed the routing bug ("Cloudflare Teleport"), paid $200, and said the root cause isn't theirs. Discord called it a Cloudflare issue. Signal called it out of scope. The attack works against anything that pushes attacker-controlled images through a CDN.
-->

---
chapter: why
bg: why
---

# verify bots are IP databases

<div class="split equal">
<div>

<h2>how “verify” works</h2>

<ol class="steps">
<li>A server installs the bot <a class="cite" href="https://www.dexerto.com/gaming/discord-bot-built-to-stop-alt-accounts-leaks-millions-of-users-ip-addresses-3416371/" target="_blank" rel="noopener">to stop alt accounts</a>.</li>
<li><a class="cite" href="https://www.dexerto.com/gaming/discord-bot-built-to-stop-alt-accounts-leaks-millions-of-users-ip-addresses-3416371/#:~:text=it%20records%20the%20IP%20address%20of%20every%20member%20who%20verifies" target="_blank" rel="noopener">It records the IP of every member who verifies.</a></li>
<li><a class="cite" href="https://cybersecuritynews.com/discord-users-data-exposed/amp/#:~:text=copied%20user%2Dagent%20hashes%20covering%20about%2025%20million%20accounts" target="_blank" rel="noopener">Plus user-agent hashes</a>, across <a class="cite" href="https://www.dexerto.com/gaming/discord-bot-built-to-stop-alt-accounts-leaks-millions-of-users-ip-addresses-3416371/#:~:text=its%20600%2C000%2Dplus%20communities" target="_blank" rel="noopener">600,000+ servers</a>.</li>
</ol>

<p class="small">One bot, one database of everyone who ever verified.</p>

</div>
<div v-click class="panel danger compact">

<h2>Double Counter, Oct 2026</h2>

<ol class="steps">
<li><a class="cite" href="https://cybersecuritynews.com/discord-users-data-exposed/amp/#:~:text=still%20ran%20a%20publicly%20reachable%20Metabase%20analytics%20tool" target="_blank" rel="noopener">Old server, publicly reachable Metabase</a> with <a class="cite" href="https://www.dexerto.com/gaming/discord-bot-built-to-stop-alt-accounts-leaks-millions-of-users-ip-addresses-3416371/#:~:text=which%20still%20ran%20a%20tool%20with%20a%20known%20security%20flaw" target="_blank" rel="noopener">a known flaw</a>.</li>
<li><a class="cite" href="https://cybersecuritynews.com/discord-users-data-exposed/amp/#:~:text=A%20flaw%20let%20the%20attacker%20forge%20an%20administrator%20session" target="_blank" rel="noopener">The flaw let the attacker forge an admin session.</a></li>
<li>On the box: <a class="cite" href="https://cybersecuritynews.com/discord-users-data-exposed/amp/#:~:text=a%20cloud%20service%2Daccount%20key%20with%20administrator%20rights" target="_blank" rel="noopener">an admin cloud service-account key</a>.</li>
<li><a class="cite" href="https://cybersecuritynews.com/discord-users-data-exposed/amp/#:~:text=Attackers%20copied%20about%2012%20GB%20of%20database%20records" target="_blank" rel="noopener">12 GB copied</a>. Bot token rotated; <a class="cite" href="https://cybersecuritynews.com/discord-users-data-exposed/amp/#:~:text=They%20read%20the%20new%20token%20within%20two%20minutes" target="_blank" rel="noopener">new token read within two minutes</a>.</li>
</ol>

<p class="result"><b><a class="cite" href="https://www.dexerto.com/gaming/discord-bot-built-to-stop-alt-accounts-leaks-millions-of-users-ip-addresses-3416371/#:~:text=roughly%2028%20million%20Discord%20accounts" target="_blank" rel="noopener">~28M accounts</a></b>: <a class="cite" href="https://www.dexerto.com/gaming/discord-bot-built-to-stop-alt-accounts-leaks-millions-of-users-ip-addresses-3416371/#:~:text=rough%20locations%20down%20to%20the%20city%20and%20internet%20provider" target="_blank" rel="noopener">IP, city, ISP</a>. <a class="cite" href="https://www.dexerto.com/gaming/discord-bot-built-to-stop-alt-accounts-leaks-millions-of-users-ip-addresses-3416371/#:~:text=around%20a%20million%20email%20addresses%20were%20copied%20in%20full" target="_blank" rel="noopener">~1M emails</a>.</p>

</div>
</div>

<!--
1.5 min. This was days ago. The bot's whole feature is a database of the IP of everyone who ever verified on 600k+ servers, so the breach is the feature leaking.

The re-hijack is the lesson: they rotated the bot token, but the cloud credentials were still live, so the attacker read the new token within two minutes. Discord disabled new installs of the app.

Sources are secondary (CybersecurityNews, Dexerto); I couldn't find Double Counter's own postmortem. Dates vary between Oct 3 and 4.
-->

---
chapter: why
bg: why
---

# spy.pet: scrolling is scraping

<div class="split equal">
<div>

<ol class="steps">
<li><a class="cite" href="https://www.pcworld.com/article/2308047/scraper-spies-on-600-million-discord-users-and-sells-the-data.html#:~:text=14%2C000%20Discord%20servers%20and%20more%20than%20600%20million%20users" target="_blank" rel="noopener">Accounts join big public servers.</a></li>
<li>Read their message history through the normal API.</li>
<li><a class="cite" href="https://www.pcworld.com/article/2308047/scraper-spies-on-600-million-discord-users-and-sells-the-data.html#:~:text=just%20over%20four%20billion%20messages%20indexed%20so%20far" target="_blank" rel="noopener">Index it all, searchable per user.</a></li>
</ol>

<p class="result"><b><a class="cite" href="https://www.pcworld.com/article/2308047/scraper-spies-on-600-million-discord-users-and-sells-the-data.html#:~:text=14%2C000%20Discord%20servers%20and%20more%20than%20600%20million%20users" target="_blank" rel="noopener">~14,000 servers · 600M+ users</a> · <a class="cite" href="https://www.pcworld.com/article/2308047/scraper-spies-on-600-million-discord-users-and-sells-the-data.html#:~:text=just%20over%20four%20billion%20messages%20indexed%20so%20far" target="_blank" rel="noopener">4B+ messages</a>.</b> <a class="cite" href="https://www.pcworld.com/article/2308047/scraper-spies-on-600-million-discord-users-and-sells-the-data.html#:~:text=worth%20as%20little%20as%20%245%20USD" target="_blank" rel="noopener">$5 a lookup</a>.</p>

</div>
<div>

<v-clicks>

- Nothing was broken into. <a class="cite" href="https://discord.com/developers/docs/topics/permissions#:~:text=Allows%20for%20reading%20of%20message%20history" target="_blank" rel="noopener">Reading history is a normal permission.</a>
- <a class="cite" href="https://www.404media.co/discord-shuts-down-spy-pet-bots-that-scraped-sold-user-messages/#:~:text=Discord%20banned%20a%20mass%20of%20accounts" target="_blank" rel="noopener">Discord banned the accounts</a> (Apr 2024).
- 2025: <a class="cite" href="https://arxiv.org/abs/2502.00627v1#:~:text=over%202.05%20billion%20messages%20from%204.74%20million%20users%20across%203%2C167%20public%20servers" target="_blank" rel="noopener">researchers pulled 2.05B messages from 3,167 public servers</a>, <a class="cite" href="https://arxiv.org/abs/2502.00627v1#:~:text=Data%20was%20collected%20through%20Discord%27s%20public%20API" target="_blank" rel="noopener">using only the public API</a>.

</v-clicks>

</div>
</div>

<!--
1.5 min. spy.pet ran Nov 2023 – Apr 2024 (404 Media). The academic dataset is "Discord Unveiled" (arXiv 2502.00627): usernames rewritten, IDs hashed, but it shows the same access still works. Root cause: membership = full scrollback, and text is readable by whoever holds it.
-->

---
chapter: why
bg: why
---

# old invite links now lead to malware

<div class="split">
<div>

```text
discord.gg/uzwgPxUZ   real invite, temporary
discord.gg/uzwgpxuz   attacker vanity URL

invite expires → old link → attacker
```

<p class="small"><a class="cite" href="https://research.checkpoint.com/2025/from-trust-to-threat-hijacked-discord-invites-used-for-multi-stage-malware-delivery/#:~:text=vanity%20codes%20are%20always%20stored%20and%20compared%20in%20lowercase" target="_blank" rel="noopener">Vanity URLs are lowercase-only</a>, so a lowercase copy of a live invite is free to register. <a class="cite" href="https://research.checkpoint.com/2025/from-trust-to-threat-hijacked-discord-invites-used-for-multi-stage-malware-delivery/#:~:text=available%20to%20Discord%20servers%20with%20a%20premium%20subscription%20%28Level%203%20Boost%29" target="_blank" rel="noopener">Any Level 3 boosted server can.</a></p>

</div>
<div>

<v-clicks>

- Fake “Safeguard” verify bot → <a class="cite" href="https://research.checkpoint.com/2025/from-trust-to-threat-hijacked-discord-invites-used-for-multi-stage-malware-delivery/#:~:text=Discord%20starts%20the%20OAuth2%20authentication%20flow" target="_blank" rel="noopener">OAuth</a> → a fake CAPTCHA page.
- <a class="cite" href="https://research.checkpoint.com/2025/from-trust-to-threat-hijacked-discord-invites-used-for-multi-stage-malware-delivery/#:~:text=open%20the%20Windows%20Run%20dialog%20%28Win%20%2B%20R%29%2C%20paste%20the%20text%20preloaded%20into%20the%20clipboard" target="_blank" rel="noopener">“Verification failed, paste this into Win+R.”</a> That’s PowerShell.
- <a class="cite" href="https://research.checkpoint.com/2025/from-trust-to-threat-hijacked-discord-invites-used-for-multi-stage-malware-delivery/#:~:text=including%20AsyncRAT%20and%20Skuld%20Stealer" target="_blank" rel="noopener">Drops AsyncRAT and Skuld Stealer</a>. Skuld <a class="cite" href="https://research.checkpoint.com/2025/from-trust-to-threat-hijacked-discord-invites-used-for-multi-stage-malware-delivery/#:~:text=Stealing%20Discord%20authentication%20tokens" target="_blank" rel="noopener">steals Discord tokens</a> and <a class="cite" href="https://research.checkpoint.com/2025/from-trust-to-threat-hijacked-discord-invites-used-for-multi-stage-malware-delivery/#:~:text=Discord%20injection%20module%20to%20intercept%20sensitive%20user%20operations%20such%20as%20login" target="_blank" rel="noopener">hooks Discord logins</a>.

</v-clicks>

</div>
</div>

<!--
1.5 min. Check Point Research, June 2025. People post invites in forums and Reddit; those links outlive the invite. <a class="cite" href="https://research.checkpoint.com/2025/from-trust-to-threat-hijacked-discord-invites-used-for-multi-stage-malware-delivery/#:~:text=the%20number%20of%20downloads%20exceeded%201%2C300" target="_blank" rel="noopener">1,300+ downloads</a> across 8+ countries. Discord disabled the bot; the invite reuse behavior itself didn't change.
-->

---
chapter: why
bg: why
---

# your ID, in a support ticket

<v-clicks>

- Age checks use <a class="cite" href="https://cyberinsider.com/discord-expands-age-verification-system-for-teen-users-worldwide/#:~:text=voluntary%20facial%20age%20estimation%20and%20ID%2Dbased%20verification" target="_blank" rel="noopener">a face scan or government ID</a>. <a class="cite" href="https://discord.com/press-releases/update-on-security-incident-involving-third-party-customer-service#:~:text=which%20our%20vendor%20used%20to%20review%20age%2Drelated%20appeals" target="_blank" rel="noopener">Appeals go to a support vendor.</a>
- Oct 2025: <a class="cite" href="https://discord.com/press-releases/update-on-security-incident-involving-third-party-customer-service" target="_blank" rel="noopener">attackers get into the third-party support system</a>.
- <span v-mark="{ at: 3, color: '#e8501e', type: 'box' }"><a class="cite" href="https://discord.com/press-releases/update-on-security-incident-involving-third-party-customer-service#:~:text=approximately%2070%2C000%20users%20that%20may%20have%20had%20government%2DID%20photos%20exposed" target="_blank" rel="noopener">~70,000 government ID photos</a></span>, plus names, emails, <a class="cite" href="https://discord.com/press-releases/update-on-security-incident-involving-third-party-customer-service#:~:text=IP%20addresses" target="_blank" rel="noopener">IPs and support transcripts</a>.
- 2026: <a class="cite" href="https://cyberinsider.com/discord-expands-age-verification-system-for-teen-users-worldwide/#:~:text=global%20rollout%20of" target="_blank" rel="noopener">“teen-by-default” rolls out globally</a>. More IDs, same pipeline.

</v-clicks>

<!--
1 min. Discord's disclosure, Oct 3 2025; the attackers claimed 1.6 TB. The named vendor (5CA) denies it handled IDs; Zendesk says its platform wasn't breached. Either way the ID photos were sitting in a support system.
-->

---
chapter: why
bg: why
---

# what I took from this

<div class="big-table">

| the attack used… | so Rekindle… |
|---|---|
| one service that sees every IP | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-protocol/src/dht/pool/safety.rs#L9-L25" target="_blank" rel="noopener">has no servers.</a> Traffic goes over Veilid’s anonymous routes. |
| a server that can read text | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/security/overview.md#L1-L36" target="_blank" rel="noopener">encrypts everything on your device, end to end</a> |
| join = full message history | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/roadmap.md#L132" target="_blank" rel="noopener">has no public directory</a>; <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-codec/src/community/channel_record/types.rs#L16-L20" target="_blank" rel="noopener">channels are ciphertext without the key</a> |
| bots with their own websites | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/user/faq.md#L118-L124" target="_blank" rel="noopener">has no server-hosted bots, webhooks or OAuth</a> |
| IDs sitting in a vendor’s system | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-crypto/src/identity.rs#L8-L16" target="_blank" rel="noopener">Your identity is a keypair.</a> (Veilid has no accounts.) |

</div>

<!--
1 min. This is the requirements list for the rest of the talk. Each row comes back later with the code that does it.
-->

---
chapter: why
bg: why
scrim: left
---

# who Rekindle is for

<div class="mid">

<v-clicks>

- <span class="by rk">Rekindle</span> My gaming friends. Buddy list, <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/architecture/game-detect.md#L1-L6" target="_blank" rel="noopener">see what everyone’s playing</a>, hop in voice.
- <span class="by rk">Rekindle</span> People who’d be harmed by metadata collection or content disclosure. <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/security/threat-model.md#L21-L27" target="_blank" rel="noopener">The threat model is built around them.</a>
- <span class="by veilid">Veilid</span> No servers, so <a class="cite" href="https://veilid.gitlab.io/developer-book/print.html#:~:text=we%20can%E2%80%99t%20have%20a%20normal%20notion%20of%20%E2%80%9Caccount%E2%80%9D" target="_blank" rel="noopener">no accounts</a>. Your IP stays <a class="cite" href="https://veilid.gitlab.io/developer-book/print.html#:~:text=participants%20can%20interact%20without%20revealing%20their%20identities%20or%20locations%20to%20other%20nodes" target="_blank" rel="noopener">behind routes</a>.
- <span class="by rk">Rekindle</span> <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-crypto/src/identity.rs#L8-L16" target="_blank" rel="noopener">Your identity is a keypair made on your machine</a>, with <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-secrets/src/derive.rs#L13-L24" target="_blank" rel="noopener">a different pseudonym per community</a>.

</v-clicks>

</div>

<!--
1 min. Tags say who does what. No accounts and IP hiding come from Veilid itself; the developer book says apps define user identity ("User identities are not formalized by veilid currently"), so the keypair identity and per-community pseudonyms are Rekindle's.

Threat model: "Rekindle is built for vulnerable users ... anyone who would be materially harmed by metadata collection or content disclosure. We accept usability tradeoffs to close attack paths that would matter to those users."
-->

---
chapter: xfire
bg: xfire
scrim: divider
class: divider
---

<p class="eyebrow">PART 02</p>

# Xfire

<p class="subline">History and analysis.</p>

<!--
Divider. Why copy Xfire and not Discord's UI.
-->

---
chapter: xfire
bg: xfire
class: center
---

# Xfire ran so Discord could walk

<div class="timeline" style="--steps: 6">
  <div><strong>2004</strong><p><a class="cite" href="https://www.builtinsf.com/articles/xfire-oral-history#:~:text=We%20launched%20Xfire%20in%20the%20middle%20of%20January%20of%202004" target="_blank" rel="noopener">Launches.</a> See what your friends are playing.</p></div>
  <div><strong>2005</strong><p><a class="cite" href="https://web.archive.org/web/20070930080400/http://www.gamespot.com/news/6140392.html#:~:text=The%20Yahoo%20patent%20was%20granted%20to%20two%20once%2DYahoo%20employees" target="_blank" rel="noopener">Yahoo sues</a> over a founder’s own patent. <a class="cite" href="https://www.builtinsf.com/articles/xfire-oral-history#:~:text=We%20ended%20up%20having%20to%20settle%20with%20Yahoo%20for%20not%20very%20much" target="_blank" rel="noopener">Settles.</a></p></div>
  <div><strong>2006</strong><p><a class="cite" href="https://web.archive.org/web/20110512003031/http://www.xfire.com/cms/xf_pr_20060424/#:~:text=for%20%24102%20million%20in%20cash" target="_blank" rel="noopener">Viacom buys it for $102M.</a></p></div>
  <div><strong>2010</strong><p><a class="cite" href="https://techcrunch.com/2010/08/02/exclusive-titan-gaming-takes-xfire-off-viacoms-hands/#:~:text=a%20small%20company%20that%20raised%20a%20mere%20%241%20million%20in%20angel%20funding" target="_blank" rel="noopener">Sold to Titan Gaming.</a> <a class="cite" href="https://www.builtinsf.com/articles/xfire-oral-history#:~:text=I%20had%20to%20lay%20off%20almost%20everyone%2C%20including%20myself" target="_blank" rel="noopener">Almost everyone laid off.</a></p></div>
  <div><strong>2011–13</strong><p><a class="cite" href="https://techcrunch.com/2011/10/06/xfire-to-fly-solo-again-raises-4-million-from-intel-capital/#:~:text=Xfire%20is%20severing%20the%20ties%20with%20Titan%20Gaming" target="_blank" rel="noopener">Spun out again</a>, then <a class="cite" href="https://techcrunch.com/2012/04/09/xfire-nabs-groupon-tencent-ceo/#:~:text=announcing%20a%20joint%20venture%20with%20Beijing" target="_blank" rel="noopener">a China joint venture</a>.</p></div>
  <div><strong>2015</strong><p><a class="cite" href="https://web.archive.org/web/20150611014251/http://social.xfire.com/#:~:text=we%20have%20decided%20to%20sunset%20the%20Xfire%20Client%20and%20the%20social%20site" target="_blank" rel="noopener">Client and social site shut down</a> for an esports platform.</p></div>
</div>

<p class="small"><a class="cite" href="https://web.archive.org/web/20150611014251/http://social.xfire.com/#:~:text=we%20have%20decided%20to%20sunset%20the%20Xfire%20Client%20and%20the%20social%20site" target="_blank" rel="noopener">A client with a company behind it can be turned off.</a></p>

<!--
1 min. The Yahoo suit is a side story: the patent was co-founder Chris Kirmse's own work at Yahoo, it settled "for not very much," and it didn't kill Xfire. What killed it is the next slide.

Dates: GameSpot says the suit was filed in January 2005, The Register says February. Viacom's release is dated April 24, 2006.
-->

---
chapter: xfire
bg: xfire
---

# why Xfire died

<div class="mid">

<v-clicks>

- **No business of its own.** <a class="cite" href="https://web.archive.org/web/20080226041808/http://www.gamesindustry.biz/content_page.php?aid=16332#:~:text=free%20to%20download%20and%20supported%20by%20advertising%20revenue" target="_blank" rel="noopener">Free, paid for by ads</a>. Then <a class="cite" href="https://www.builtinsf.com/articles/xfire-oral-history#:~:text=Viacom%20imposed%20huge%20goals%20of%20revenue%20generation%20on%20us" target="_blank" rel="noopener">Viacom set revenue goals it couldn’t meet</a>, and <a class="cite" href="https://www.builtinsf.com/articles/xfire-oral-history#:~:text=the%20person%20who%20had%20driven%20that%20gaming%20community%20company%20acquisition%20strategy%20was%20fired" target="_blank" rel="noopener">the person who drove the deal was fired</a>.
- **The team left.** <a class="cite" href="https://www.builtinsf.com/articles/xfire-oral-history#:~:text=Most%20of%20the%20original%20Xfire%20team%20left%20shortly%20after%20the%20acquisition" target="_blank" rel="noopener">Most of the original team left</a>; after the 2010 sale, <a class="cite" href="https://www.builtinsf.com/articles/xfire-oral-history#:~:text=with%20the%20exception%20of%20four%20people" target="_blank" rel="noopener">four people were kept</a>. <a class="cite" href="https://www.builtinsf.com/articles/xfire-oral-history#:~:text=making%20simple%20changes%20seemed%20to%20take%20weeks%20or%20months" target="_blank" rel="noopener">Simple changes took weeks or months.</a>
- **Steam did it too.** <a class="cite" href="https://www.builtinsf.com/articles/xfire-oral-history#:~:text=Steam%20basically%20just%20started%20to%20swallow%20the%20universe%20of%20gaming" target="_blank" rel="noopener">“Steam basically just started to swallow the universe of gaming.”</a> <a class="cite" href="https://web.archive.org/web/20191212161910/https://www.reuters.com/article/idUS158175%2B07-Oct-2010%2BMW20101007#:~:text=6.5%20million%20monthly%20active%20users" target="_blank" rel="noopener">Monthly users stalled around 6.5M</a>.
- **Owners kept changing direction.** <a class="cite" href="https://www.builtinsf.com/articles/xfire-oral-history#:~:text=change%20the%20client%20to%20be%20more%20of%20a%20tool%20to%20set%20up%20tournaments%20among%20players" target="_blank" rel="noopener">Tournaments</a>, <a class="cite" href="https://www.builtinsf.com/articles/xfire-oral-history#:~:text=That%20turned%20out%20to%20be%20a%20big%20distraction%20for%20about%20two%20years" target="_blank" rel="noopener">China</a>, <a class="cite" href="https://www.builtinsf.com/articles/xfire-oral-history#:~:text=We%20had%20a%20group%20of%20investors%20who%20clashed%20with%20the%20existing%20management%20and%20shareholders" target="_blank" rel="noopener">investor fights</a>, esports.
- **Users got two days’ notice.** <a class="cite" href="https://www.gameskinny.com/news/xfire-kills-pc-app-and-website-in-favor-of-esports/#:~:text=only%20two%20days%20%28as%20of%20this%20writing%29%20before%20the%20service%20is%20killed" target="_blank" rel="noopener">“only two days … before the service is killed”</a>, plus <a class="cite" href="https://web.archive.org/web/20150611014251/http://social.xfire.com/#:~:text=Enter%20your%20username%20to%20download%20your%20screenshots%20and%20videos" target="_blank" rel="noopener">a form to download your screenshots and videos</a>.

</v-clicks>

</div>

<!--
1.5 min. Every one of these is a decision made by an owner, not by the people using it. Rekindle has no owner to make them: the code is MIT, the network is Veilid's, and your data is on your machine.

Sources: the BuiltIn SF oral history (2020, founders and staff remembering), TechCrunch 2010–2012, Reuters 2010, GameSkinny 2015, and Xfire's own shutdown notice on archive.org.
-->

---
chapter: xfire
bg: xfire
---

# reverse engineering Xfire: static only

<div class="split equal">
<div>

<div class="receipts">
  <div><span>Feb 10 11:04</span><span><a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/commit/b29fba9a" target="_blank" rel="noopener">b29fba9a</a></span><span>Xfire installer from xf1re.com</span></div>
  <div><span>Feb 10 12:20</span><span><a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/commit/4ca3f333" target="_blank" rel="noopener">4ca3f333</a></span><span>beginning claude re framework for xfire</span></div>
  <div><span>Feb 10 12:48</span><span><a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/commit/ba066924" target="_blank" rel="noopener">ba066924</a></span><span>xfire re&#39;d &lt;33</span></div>
  <div><span>Feb 12</span><span><a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/commit/5a20b508" target="_blank" rel="noopener">5a20b508</a></span><span>legacy artifacts untracked</span></div>
</div>

</div>
<div>

- Target: <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/4ca3f3335add7b3e750dc0199f65aacbc4915168/CLAUDE.md#L5-L11" target="_blank" rel="noopener">the xf1re.com fan revival’s installer</a>.
- Never ran it. <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/4ca3f3335add7b3e750dc0199f65aacbc4915168/.claude/settings.json#L111-L114" target="_blank" rel="noopener">The agent’s tool rules deny the exe and wine.</a>
- <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/4ca3f3335add7b3e750dc0199f65aacbc4915168/.claude/docs/re-workflow.md#L5-L49" target="_blank" rel="noopener">7z unpack → strings → PE imports → skin archive</a>.
- The protocol spec came from <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/4ca3f3335add7b3e750dc0199f65aacbc4915168/.claude/docs/xfire-protocol.md#L1-L4" target="_blank" rel="noopener">OpenFire (2007), gfire, PFire and the IMFreedom KB</a>: years of community RE.

</div>
</div>

<p class="small">Ghidra and a VM pass were <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/4ca3f3335add7b3e750dc0199f65aacbc4915168/.claude/docs/re-workflow.md#L51-L72" target="_blank" rel="noopener">planned</a>. The commits only show strings, imports and resources.</p>

<!--
1 min. Start to "xfire re'd" was under two hours: installer at 11:04, the RE setup at 12:20, results at 12:48. The exe was "not confirmed safe," so the rule was static only, enforced in the agent's deny list, not just asked nicely.

None of this started from zero. OpenFire documented the protocol in 2007; gfire (Pidgin) and PFire kept it alive. I stood on that.
-->

---
chapter: xfire
bg: xfire
---

# what was inside

<div class="mid">

<v-clicks>

- <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/ba066924f8478086fdb6c92c554424a42646b3f3/analysis/manifest.md#L9-L14" target="_blank" rel="noopener">The real Xfire build, Release155b</a>, with <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/ba066924f8478086fdb6c92c554424a42646b3f3/analysis/strings-report.md#L212" target="_blank" rel="noopener">server domains swapped to xf1re.com</a>.
- <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/ba066924f8478086fdb6c92c554424a42646b3f3/analysis/protocol-notes.md#L9-L13" target="_blank" rel="noopener">Login hash: SHA1(SHA1(user + pass + "UltimateArena") + salt)</a>, SHA1 compiled in.
- <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/ba066924f8478086fdb6c92c554424a42646b3f3/analysis/protocol-notes.md#L84-L115" target="_blank" rel="noopener">P2P over UDP for chat, voice and files, with UPnP and NAT port prediction</a>.
- <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/ba066924f8478086fdb6c92c554424a42646b3f3/analysis/protocol-notes.md#L144-L156" target="_blank" rel="noopener">IM bridges to AIM, Yahoo, Google Talk and Facebook</a>.
- <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/ba066924f8478086fdb6c92c554424a42646b3f3/analysis/strings-report.md#L165-L181" target="_blank" rel="noopener">Game detection by process scan</a> plus <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/architecture/game-detect.md#L72-L73" target="_blank" rel="noopener">a 2 MB xfire_games.ini</a>; <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/ba066924f8478086fdb6c92c554424a42646b3f3/analysis/imports-report.md#L93" target="_blank" rel="noopener">3,845 game icons</a>.
- The skin: <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/ba066924f8478086fdb6c92c554424a42646b3f3/analysis/manifest.md#L55-L69" target="_blank" rel="noopener">529 files, a Themes.xml with 78 named colors, tile layouts</a>.

</v-clicks>

</div>

<!--
1 min. Xfire was already doing P2P for chat and voice in the 2000s, with a central server brokering the connection. Rekindle keeps the P2P and drops the broker.
-->

---
chapter: xfire
bg: xfire
---

# kept the look, dropped the plumbing

<div class="big-table">

| Xfire | Rekindle |
|---|---|
| <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/ba066924f8478086fdb6c92c554424a42646b3f3/analysis/ui-assets/README.md#L50-L54" target="_blank" rel="noopener">selection blue RGBA(23,124,193)</a> | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/src/styles/global.css#L64" target="_blank" rel="noopener"><code>--color-xfire-accent: #177cc1</code></a> |
| <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/ba066924f8478086fdb6c92c554424a42646b3f3/unpacked/skins_extracted/Components/MainWindow.xml#L5" target="_blank" rel="noopener">buddy list 333×555</a> | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/architecture/ui-skin.md#L72-L74" target="_blank" rel="noopener">320×650: “copying its aspect ratio is part of the nostalgia goal”</a> |
| <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/ba066924f8478086fdb6c92c554424a42646b3f3/analysis/ui-assets/README.md#L86-L96" target="_blank" rel="noopener">tiles, 9-slice frames, button states</a> | CSS grid, <code>border-image</code>, <code>:hover</code> |
| <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-db/schema/001_init.sql#L587" target="_blank" rel="noopener">imindex message acks</a> | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-db/schema/001_init.sql#L587" target="_blank" rel="noopener">per-message, per-peer delivery tracking</a> |
| a 2 MB game list | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/architecture/game-detect.md#L72-L90" target="_blank" rel="noopener">a curated JSON list, no network lookups</a> |
| UA01 protocol, central servers | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/decisions/0001-veilid-as-transport.md#L10-L12" target="_blank" rel="noopener">dropped: “without any central server”</a> |
| installer + extracted assets | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/commit/5a20b508" target="_blank" rel="noopener">untracked two days later</a>; <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/.gitignore#L108-L111" target="_blank" rel="noopener">/legacy/ is gitignored</a> |

</div>

<!--
1 min. The colors and shape are a near copy on purpose: nostalgia is the point. The plumbing isn't: Rekindle doesn't speak UA01 and there's nothing to point it at. Not checking a remote game list is a privacy choice: "querying a remote game-recognition service would expose what the user is playing to a third party."
-->

---
chapter: veilid
bg: veilid
scrim: divider
class: divider
---

<p class="eyebrow">PART 03</p>

# Veilid

<p class="subline">Use-case and reasoning.</p>

<!--
Divider. Veilid is cDc's work; Rekindle is an app on top of it. The next slides draw that line on purpose.
-->

---
chapter: veilid
bg: veilid
scrim: left
---

# why Veilid

<div class="mid">

<v-clicks>

- I wanted to learn it. A chat app has plenty of prior art to compare against.
- Discord’s privacy record, Xfire’s legal history: <a class="cite" href="https://media.defcon.org/DEF%20CON%2031/DEF%20CON%2031%20presentations/Christien%20DilDog%20Rioux%20Katelyn%20Medus4%20Bowden%20-%20The%20Internals%20of%20Veilid%20a%20New%20Decentralized%20Application%20Framework.pdf#page=3" target="_blank" rel="noopener">Veilid’s mission</a> and <a class="cite" href="https://gitlab.com/veilid/veilid" target="_blank" rel="noopener">open source</a> cover both.
- <a class="cite" href="https://media.defcon.org/DEF%20CON%2031/DEF%20CON%2031%20presentations/Christien%20DilDog%20Rioux%20Katelyn%20Medus4%20Bowden%20-%20The%20Internals%20of%20Veilid%20a%20New%20Decentralized%20Application%20Framework.pdf#page=9" target="_blank" rel="noopener">“Every node is equal”</a> isn’t intuitive for clankers. A deliberately tough project for them.
- Project is run by chill peeps.

</v-clicks>

</div>

<!--
1 min. From my original outline.
-->

---
chapter: veilid
bg: veilid
scrim: left
---

# Veilid’s mission

<div class="proof panel veilid narrow-quote">
“We exist to develop, distribute, and maintain a privacy focused communication platform and protocol for the purposes of <span v-mark="{ at: 1, color: '#8583d8', type: 'underline' }">defending human and civil rights.</span>”
<a class="source" href="https://media.defcon.org/DEF%20CON%2031/DEF%20CON%2031%20presentations/Christien%20DilDog%20Rioux%20Katelyn%20Medus4%20Bowden%20-%20The%20Internals%20of%20Veilid%20a%20New%20Decentralized%20Application%20Framework.pdf#page=3" target="_blank" rel="noopener">The Veilid Mission · DilDog &amp; Medus4, DEF CON 31 · slide 3</a>
</div>

<v-clicks at="2">

- <a class="cite" href="https://media.defcon.org/DEF%20CON%2031/DEF%20CON%2031%20presentations/Christien%20DilDog%20Rioux%20Katelyn%20Medus4%20Bowden%20-%20The%20Internals%20of%20Veilid%20a%20New%20Decentralized%20Application%20Framework.pdf#page=9" target="_blank" rel="noopener">“All nodes are equal in the eyes of the network. No nodes are ‘special’.”</a>
- <a class="cite" href="https://media.defcon.org/DEF%20CON%2031/DEF%20CON%2031%20presentations/Christien%20DilDog%20Rioux%20Katelyn%20Medus4%20Bowden%20-%20The%20Internals%20of%20Veilid%20a%20New%20Decentralized%20Application%20Framework.pdf#page=13" target="_blank" rel="noopener">“Nodes help each other like mutual aid for connectivity.”</a>
- <a class="cite" href="https://media.defcon.org/DEF%20CON%2031/DEF%20CON%2031%20presentations/Christien%20DilDog%20Rioux%20Katelyn%20Medus4%20Bowden%20-%20The%20Internals%20of%20Veilid%20a%20New%20Decentralized%20Application%20Framework.pdf#page=6" target="_blank" rel="noopener">“Nodes != Identity.”</a>

</v-clicks>

<!--
1 min. All from cDc's DEF CON 31 deck, "The Internals of Veilid". The mission slide opens with an RBG quote. No coin, no blockchain: "Stop being dependent on corporate systems."

These three lines come back at the end, mapped to Rekindle.
-->

---
chapter: veilid
bg: veilid
---

# what Veilid gives an app

<p class="lede"><a class="cite" href="https://www.engadget.com/americas-original-hacking-supergroup-creates-a-free-framework-to-improve-app-security-190043865.html#:~:text=like%20Tor%20and%20IPFS%20had%20sex%20and%20produced%20this%20thing" target="_blank" rel="noopener">“Like Tor and IPFS had sex and produced this thing.”</a> <span class="small">— DilDog</span></p>

<div class="split equal">
<div class="panel veilid">

<h2>routing · the Tor half</h2>

- <a class="cite" href="https://veilid.gitlab.io/developer-book/print.html#:~:text=designed%20to%20protect%20the%20sender" target="_blank" rel="noopener">**Safety routes** hide the sender.</a>
- <a class="cite" href="https://veilid.gitlab.io/developer-book/print.html#:~:text=designed%20to%20protect%20the%20receiver" target="_blank" rel="noopener">**Private routes** hide the receiver.</a>
- <a class="cite" href="https://media.defcon.org/DEF%20CON%2031/DEF%20CON%2031%20presentations/Christien%20DilDog%20Rioux%20Katelyn%20Medus4%20Bowden%20-%20The%20Internals%20of%20Veilid%20a%20New%20Decentralized%20Application%20Framework.pdf#page=12" target="_blank" rel="noopener">Nodes help each other out.</a>
- <a class="cite" href="https://docs.rs/veilid-core/latest/veilid_core/struct.RoutingContext.html#:~:text=does%20not%20await%20a%20reply" target="_blank" rel="noopener">`app_message`</a> (datagram), <a class="cite" href="https://docs.rs/veilid-core/latest/veilid_core/struct.RoutingContext.html#:~:text=App%2Dlevel%20bidirectional%20call%20that%20expects%20a%20response%20to%20be%20returned" target="_blank" rel="noopener">`app_call`</a> (request/reply).

</div>
<div class="panel veilid">

<h2>storage · the IPFS half</h2>

- <a class="cite" href="https://veilid.gitlab.io/developer-book/print.html#:~:text=There%20are%20two%20types%20of%20schema%20implemented" target="_blank" rel="noopener">**DHT records**</a>, <a class="cite" href="https://docs.rs/veilid-core/latest/veilid_core/enum.DHTSchema.html#:~:text=owner%20subkeys%20plus%20per%2Dmember%20writable%20subkeys" target="_blank" rel="noopener">split into subkeys with per-member writers</a>.
- <a class="cite" href="https://docs.rs/veilid-core/latest/veilid_core/struct.RoutingContext.html#:~:text=when%20the%20record%20has%20subkeys%20change" target="_blank" rel="noopener">**Watches**</a>: get told when a record changes.

</div>
</div>

<p class="small">All of this is Veilid’s work. Next: what Rekindle builds on it.</p>

<!--
1.5 min. DilDog's line is the shortest accurate description: onion-style routing plus a distributed store, in one library, on every device. Quote via Engadget's DEF CON 31 coverage.
-->

---
chapter: veilid
bg: veilid
---

# what Rekindle adds on top

<div class="big-table boundary">

| Veilid gives | Rekindle adds |
|---|---|
| safety + private routes | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-types/src/config/mod.rs#L13-L19" target="_blank" rel="noopener">a 3-hop floor on every path, voice included</a> |
| `app_message` / `app_call` | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/protocol/overview.md#L253-L254" target="_blank" rel="noopener">gossip mesh, reliable delivery, call signaling, media frames</a> |
| DHT records + watches | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/architecture/communities-overview.md#L87-L113" target="_blank" rel="noopener">community governance log, joins, 3-path delivery</a> |
| <a class="cite" href="https://media.defcon.org/DEF%20CON%2031/DEF%20CON%2031%20presentations/Christien%20DilDog%20Rioux%20Katelyn%20Medus4%20Bowden%20-%20The%20Internals%20of%20Veilid%20a%20New%20Decentralized%20Application%20Framework.pdf#page=15" target="_blank" rel="noopener">transport encryption</a> | end to end: <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/security/overview.md#L1-L36" target="_blank" rel="noopener">PQXDH + Double Ratchet, group keys, SFrame</a> |
| node keys | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-secrets/src/derive.rs#L13-L24" target="_blank" rel="noopener">your identity key, a pseudonym per community</a> |

</div>

<!--
1.5 min. Rekindle doesn't use Veilid's TableStore or CryptoSystem; user keys live in a SQLCipher vault. ProtectedStore only holds Veilid's own node and route secrets.

One thing Rekindle turns OFF: its nodes don't serve the DHT (VEILID_CAPABILITY_DHT is disabled in veilid_config.rs). They route; they don't store other people's records.
-->

---
chapter: veilid
bg: veilid
---

# the line between them, in code

<div class="split code-heavy">
<div class="code-small">

```rust {all|1|3-5|6}
use veilid_core::{SafetySelection, SafetySpec};

pub fn safety_selection(
    profile: &SafetyProfile,
) -> SafetySelection {
    SafetySelection::Safe(SafetySpec {
        hop_count: usize::from(
            profile.hop_count.max(ANONYMITY_HOP_FLOOR),
        ),
```

<a class="source" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-protocol/src/dht/pool/safety.rs#L7-L14">crates/rekindle-protocol/src/dht/pool/safety.rs · 7–14 (trimmed, reflowed)</a>

</div>
<div>

<v-clicks>

- The route types are Veilid’s.
- The floor is Rekindle’s: <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-types/src/config/mod.rs#L13-L19" target="_blank" rel="noopener">every send goes through this one function, never under 3 hops</a>.
- <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/xtask/src/veilid_boundary.rs#L1-L29" target="_blank" rel="noopener">Only 5 of 43 crates may link `veilid-core`</a>. An xtask gate walks the dependency graph and fails the build otherwise.

</v-clicks>

</div>
</div>

<!--
1 min. ANONYMITY_HOP_FLOOR = 3: "a middle relay means no guard+exit collusion of two nodes can link sender to receiver." Admins can raise it, never lower it. Veilid itself rejects hop_count 0.

The boundary gate is ADR 0014 (xtask/src/veilid_boundary.rs): it checks transitive linkage from cargo metadata, not manifests, because importing a type from a crate that links Veilid means you can reach all of Veilid.
-->

---
chapter: veilid
bg: veilid
clicks: 4
---

# who sees your IP: Discord vs Rekindle on Veilid

<WhoSeesIP />

<!--
1.5 min.
[click] Discord: every client talks to Discord. Peers don't see you; Discord sees everyone.
[click] Verify bots get it from their own websites.
[click] Veilid, in Veilid's color. The sender picks a safety route, the receiver publishes a private route, and Veilid compiles them into one path. "Because no node can trust any other node to pick the whole route, both source and destination must participate" (DC31 p.28). Each hop knows only the next one (p.30). Veilid's default is one hop each (p.31).
[click] Rekindle, in cyan. Every send builds its safety route at 3 hops through one function: messages, DHT reads and writes, voice frames. Inbound private routes are still Veilid's default of 1, so a message to you crosses 4 hops; 3 inbound was tried, broke route allocation, and is being retested on 0.5.4. Rekindle runs no relay servers of its own.

Red line: your ISP can still see that you're talking to Veilid nodes. Hiding that is upstream Veilid work. And whoever you connect to directly sees your IP; that's how IP works. Content is end-to-end encrypted by Rekindle before Veilid touches it.
-->

---
chapter: veilid
clicks: 3
---

# how a channel message is delivered

<ChiralNotify />

<!--
1.5 min.
[click] Alice encrypts the message with the channel key (Rekindle) and writes it once into the channel's DHT record (Veilid stores and replicates it).
[click] Rekindle's gossip carries only a notice: channel, position, hash. Fast, best-effort. Gossip rides Veilid app_message.
[click] Bob gets the notice, fetches from the record, verifies, decrypts.

Three paths, any one is enough: the record write (source of truth), gossip (feels instant), and Veilid watches plus a 60 s inspect poll (catches whatever gossip missed).
-->

---
chapter: veilid
bg: veilid
---

# four delivery types

| What | Veilid primitive | Why |
|---|---|---|
| Chat, reactions, governance | DHT record write + gossip notice | must persist, must be findable |
| Voice frames, typing | `app_message`, fire and forget | late is useless, don’t store it |
| Keys, join bundles | `app_call`, wait for the reply | must arrive, must know it did |
| Files | chunks in the DHT, gossip says where | heavy, leave it put |

<p class="small">Veilid provides the primitives. <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/architecture/communities-overview.md#L87-L113" target="_blank" rel="noopener">Picking one per data type is Rekindle’s design.</a></p>

<!--
1 min. The questions that decided each row: does it need to persist? is it latency-critical? does it need a receipt? is it heavy?

Learned the hard way: app_call for everything died on join. 30+ calls in 5 seconds saturated Veilid's connection table and TryAgain cascaded.
-->

---
chapter: tauri
bg: tauri
scrim: divider
class: divider
---

<p class="eyebrow">PART 04</p>

# Tauri

<p class="subline">Why I love it.</p>

<!--
Divider.
-->

---
chapter: tauri
bg: tauri
scrim: left
---

# Tauri: why I love it

<div class="mid">

<v-clicks>

- Rust 🏳️‍⚧️ + <a class="cite" href="https://v2.tauri.app/concept/architecture/#:~:text=They%20are%20very%20small%20because%20they%20use%20the%20OS" target="_blank" rel="noopener">the OS’s own webview. Small installs.</a>
- The UI only renders. Keys, state and Veilid live in Rust.
- <a class="cite" href="https://tauri.app/security/capabilities/#:~:text=Capabilities%20define%20which%20permissions%20are%20granted%20or%20denied" target="_blank" rel="noopener">Capabilities</a>: each window only gets the commands you explicitly allow.
- <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/architecture/ui-skin.md#L1-L30" target="_blank" rel="noopener">Frameless windows, so it can actually look like Xfire.</a>
- <a class="cite" href="https://tauri.app/about/governance/#:~:text=The%20Tauri%20Programme%20within%20the%20Commons%20Conservancy" target="_blank" rel="noopener">Run by a non-profit: the Tauri Programme in The Commons Conservancy.</a> Also chill peeps.

</v-clicks>

</div>

<!--
1 min. Correction to my original slide: it's not "everything is containers." Tauri is a multi-process model with the OS webview and a capability/permission system. ~260 thin IPC commands; the logic sits in crates you can test without a window. Mobile is supported by the framework; Rekindle doesn't ship mobile.
-->

---
chapter: chiral
bg: journey
scrim: divider
class: divider
---

<p class="eyebrow">PART 05</p>

# STEAM vs STEM

<p class="subline">for clankers: the chiral arch.</p>

<!--
Divider. Why this talk looks like Death Stranding.
-->

---
chapter: chiral
bg: journey
scrim: left
---

# STEAM vs STEM for clankers

<div class="mid">

<v-clicks>

- I marry CogSci and CompSci when I build with agents.
- Pick art that has *strong* context with the project. Can’t find it? Make some.
- <a class="cite" href="https://en.wikipedia.org/wiki/Death_Stranding" target="_blank" rel="noopener">Death Stranding</a> is about rebuilding a network with nobody in charge. Surprisingly technical.
- Sam’s journey has milestones and an end. That structure carries agents through a project.

</v-clicks>

</div>

<!--
1.5 min. Shared vocabulary is compression. "Fragile cargo" to an agent means: confirmed delivery, receipt, retry. One phrase, a whole policy.
-->

---
chapter: chiral
bg: journey
scrim: left
---

# Death Stranding and Veilid: mutual aid

<div class="proof panel narrow-quote">
“No node above another. Every member is a full peer.” · “Mutual aid is the incentive. No tokens, no payment rails.”
<a class="source" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/architecture/communities-overview.md#L316-L342" target="_blank" rel="noopener">Rekindle design principles #1 and #12 · docs/architecture/communities-overview.md</a>
</div>

<div class="proof panel veilid narrow-quote">
“Nodes help each other like mutual aid for connectivity.”
<a class="source" href="https://media.defcon.org/DEF%20CON%2031/DEF%20CON%2031%20presentations/Christien%20DilDog%20Rioux%20Katelyn%20Medus4%20Bowden%20-%20The%20Internals%20of%20Veilid%20a%20New%20Decentralized%20Application%20Framework.pdf#page=13" target="_blank" rel="noopener">Veilid · DEF CON 31 · slide 13</a>
</div>

<!--
1 min. In the game, people you'll never meet build roads and bridges you use, and you leave ladders for them. In Veilid, every node relays for others. That match is why I picked this game.

The Rekindle line on the slide is from the public design principles; the longer Death Stranding version lives in my private planning notes.
-->

---
chapter: chiral
bg: arch
---

# game terms → Rekindle mechanics

| In the game | In Rekindle |
|---|---|
| Porters you never meet | <a class="cite" href="https://media.defcon.org/DEF%20CON%2031/DEF%20CON%2031%20presentations/Christien%20DilDog%20Rioux%20Katelyn%20Medus4%20Bowden%20-%20The%20Internals%20of%20Veilid%20a%20New%20Decentralized%20Application%20Framework.pdf#page=12" target="_blank" rel="noopener">Veilid nodes help each other out.</a> <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/decisions/0003-flat-smpl-governance.md#L10-L20" target="_blank" rel="noopener">Rekindle runs no servers or coordinators.</a> |
| A terminal anyone can activate | A community’s DHT record. Any member can write; every reader checks authority. |
| The network pings you; you go pick it up | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/architecture/communities-overview.md#L87-L113" target="_blank" rel="noopener">Gossip says “new message”; you fetch it from the record.</a> |
| Strands between friends | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/protocol/relay.md" target="_blank" rel="noopener">Strand Relay: opt-in, friends forward sealed blobs for each other.</a> |
| Roads wear in when used | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/architecture/communities-overview.md#L214" target="_blank" rel="noopener">Idle clients re-read records to keep them alive.</a> |

<!--
1.5 min. Don't read the table; pick two. The terminal row: any member can write an entry into the record; principle #7 "Reader validates, not writer" is what gives it rules. Strand Relay: friends volunteer, the volunteer pool is padded with dummy entries so you can't count who volunteered (docs/protocol/relay.md).
-->

---
chapter: chiral
bg: arch
---

# small pieces: one job, dependencies passed in

<div class="code-small">

```rust {all|3-11|12-17}
/// Architecture §8 / §15.4 / §28.5 / §28.7:
/// - rejects forum channels (posts go through thread creation)
/// - ensures a Plate Gate channel-segment record exists
/// - enforces SEND_MESSAGES permission
/// - enforces slowmode (with BYPASS_SLOWMODE shortcut)
/// - encrypts with AAD-bound MEK
/// - persists to local DB + bumps channel sequence + records slowmode
/// - resolves cleartext mentions for notification routing
/// - writes to SMPL channel record (enqueues retry on failure)
/// - gossips MessageNotification
/// - emits a local chat-event echo
pub async fn send_channel_message<D: ChannelMessagingDeps>(
    deps: &D,
    community_id: &str,
    channel_id: &str,
    body: &str,
) -> Result<ChannelSendResult, ChannelError> {
```

</div>

<a class="source" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-channel/src/pipeline.rs#L116-L132">crates/rekindle-channel/src/pipeline.rs · 116–132</a>

<!--
1 min. The doc comment is the checklist. The function only knows a trait; desktop and daemon each plug in records, keys, events and storage. Pure logic in a crate, I/O in the host. For agents that's a job with known inputs and effects: "change slowmode" without touching Veilid.
-->

---
chapter: arch
bg: arch
scrim: divider
class: divider
---

<p class="eyebrow">PART 06</p>

# App Arch

<p class="subline">Client, communities, multimedia.</p>

<!--
Divider.
-->

---
chapter: arch
bg: arch
clicks: 4
---

# secure app architecture

<SecureArch />

<!--
1.5 min. This is drawn the way a threat model draws it: a data flow diagram. Dashed boxes are trust boundaries, where the level of trust changes; rounded boxes are processes; two lines are data stores; [V] is Veilid's code, not mine. Each click lights one boundary and lists what enforces it.

[click] Webview to Rust. Tauri's own docs: the IPC layer "is the bridge for communication between these two trust groups." The webview holds no keys and can only call the commands its window is allowed.
[click] Keys. Raw key material stays in rekindle-secrets by design; it's a convention, not a build gate yet. Say the red lines out loud: chat history is plaintext at rest, and Argon2id runs at library defaults (Oct 4 standards audit S1, S15).
[click] The Veilid link: ADR 0014's transitive gate. Only five crates can reach veilid-core, and every DHT call goes through one record pool.
[click] The network. Rekindle's part is the 3-hop floor. The transport encryption, routes, DHT and relays are Veilid's. Rekindle's docs say hops decrypt and re-encrypt; cDc's slide 18 says relays don't decrypt. Doesn't matter here: content is already end to end.

Not on the map: the CLI/TUI talk to a separate rekindle-node daemon over Noise IK (both UIDs and the socket path bound into the handshake). The desktop moves to that daemon only after the IPC hardening step lands (ADR 0010).
-->

---
chapter: arch
bg: arch
---

# Skins!!! And why not a TUI?

<div class="split equal">
<div class="panel">

<h2>Desktop</h2>

- Simple login and connect.
- Buddy list, separate chat windows, Xfire skin.
- <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-game-detect/src/scanner.rs#L38-L50" target="_blank" rel="noopener">Game detection: process scan, Proton-aware.</a>

</div>
<div class="panel">

<h2>Terminal</h2>

- <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/architecture/daemon-cli.md#L19-L30" target="_blank" rel="noopener">The daemon owns the node and the keys.</a>
- CLI and TUI are just clients.
- Two identities on one box, scriptable. That’s how I test.

</div>
</div>

<!--
1 min. Game detection matches running processes (including games under Proton) against a game database to set "playing X" presence (crates/rekindle-game-detect). A headless daemon + CLI is how you script tests without a GUI.
-->

---
chapter: arch
bg: arch
---

# daemon IPC: Noise IK over a Unix socket

<div class="code-tiny">

```rust {all|2-6|7-12}
fn build_prologue(local_uid: u32, remote_uid: u32, socket_path: &Path) -> Vec<u8> {
    let (low, high) = if local_uid <= remote_uid {
        (local_uid, remote_uid)
    } else {
        (remote_uid, local_uid)
    };
    let path = socket_path.as_os_str().as_encoded_bytes();
    let mut prologue = Vec::with_capacity(15 + 8 + path.len());
    prologue.extend_from_slice(b"REKINDLE-IPC-v2");
    prologue.extend_from_slice(&low.to_be_bytes());
    prologue.extend_from_slice(&high.to_be_bytes());
    prologue.extend_from_slice(path);
```

</div>

<a class="source" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-ipc/src/noise.rs#L52-L63">crates/rekindle-ipc/src/noise.rs · 52–63</a>

<p class="small"><a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/security/threat-model.md#L92" target="_blank" rel="noopener">Both UIDs and the socket path go into the handshake hash</a>: another user’s process, or a swapped socket, fails the handshake. <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-ipc/src/noise.rs#L23" target="_blank" rel="noopener">Adapted from open-sesame’s core-ipc.</a></p>

<!--
1 min. A local socket is still an attack surface. Owner-only socket perms + peer UID check + this prologue. The frame length is authenticated before anything is allocated (Noise spec: messages "could be truncated by an attacker"). 5 s handshake timeout.
-->

---
chapter: arch
bg: communities
---

# communities: every reader enforces the rules

<div class="code-small">

```rust {all|2-7|8-9|10-13}
for (idx, authored) in all.iter().enumerate() {
    let is_genesis = idx == 0;

    if is_genesis {
        // Genesis entry always accepted — bootstraps the community
        state.creator = Some(authored.author.clone());
        apply(&authored.author, &authored.entry, &mut state);
    } else if validate_write(&authored.author, &authored.entry, &state) {
        apply(&authored.author, &authored.entry, &mut state);
    } else {
        // Silently excluded (reader-validates).
        continue;
    }
```

</div>

<a class="source" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-governance/src/merge/mod.rs#L84-L96">crates/rekindle-governance/src/merge/mod.rs · 84–96</a>

<p class="small">No server, no leader. Each member writes signed entries to the DHT; <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/decisions/0003-flat-smpl-governance.md" target="_blank" rel="noopener">every member merges all of them with the same rules and drops what the author wasn’t allowed to do</a>.</p>

<!--
1.5 min. Entries are sorted by Lamport time then author, so the same entries in give the same state out, on every device. Roles, bans, channels, invites: all entries in this log.

I tried an elected coordinator first. An audit found 15 critical bugs (split-brain, lost hand-offs), and it made one node special on a network where none is. This replaced it.
-->

---
chapter: arch
bg: communities
---

# group keys, rotated with no coordinator

<div class="split code-heavy">
<div class="code-tiny">

```rust
pub fn select_rotator(
    departed: &PseudonymKey,
    remaining: &[PseudonymKey],
) -> Option<PseudonymKey> {
    remaining
        .iter()
        .min_by_key(|m| election_hash(&departed.0, &m.0))
        .cloned()
}
```

<a class="source" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-secrets/src/rotator.rs#L23-L28">crates/rekindle-secrets/src/rotator.rs · 23–28 (reflowed)</a>

```rust
pub fn incoming_wins_same_generation(
    cached_rank: Option<&[u8; 32]>,
    incoming_rank: Option<&[u8; 32]>,
) -> bool {
    match (cached_rank, incoming_rank) {
        (Some(cached), Some(incoming)) => incoming < cached,
```

<a class="source" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-mek-rotation/src/convergence.rs#L36-L41">crates/rekindle-mek-rotation/src/convergence.rs · 36–41</a>

</div>
<div>

<div class="tight-list">
<v-clicks>

- <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-secrets/src/rotator.rs#L1-L12" target="_blank" rel="noopener">Someone leaves → new channel key, so they can’t read what’s next.</a>
- Who mints it? Lowest <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-secrets/src/rotator.rs#L72-L80" target="_blank" rel="noopener">`blake3(departed‖member)`</a>. Every device gets the same answer.
- <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-mek-rotation/src/election.rs#L14-L21" target="_blank" rel="noopener">Silent for 30 s → next-lowest takes over.</a>
- <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-mek-rotation/src/convergence.rs#L1-L22" target="_blank" rel="noopener">Two keys, same generation → all keep the lowest-ranked.</a>

</v-clicks>
</div>

</div>
</div>

<!--
1.5 min. Nobody is elected by a vote or a server; every device computes the same answer from the same inputs. The race case is real: peers with different views of who's online can both think they're the rotator. Before the convergence rule, peers kept whichever key arrived last and got "MEK decrypt failed at matching generation."

Forward secrecy holds: keys are random per rotation, and the departed member gets none of the candidates. Docs: ADR 0012.
-->

---
chapter: arch
bg: communities
clicks: 3
---

# a bug I found in my own design: insider slot lock

<SlotLock />

<p class="small"><a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/decisions/0011-member-sovereign-records.md#L15-L28" target="_blank" rel="noopener">Signatures stop forgery. They don’t stop someone writing your slot one last time.</a> Fix, designed Oct 4 and not built yet: <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/decisions/0011-member-sovereign-records.md#L120-L131" target="_blank" rel="noopener">each member gets their own record, owned by a key only they hold</a>.</p>

<!--
1.5 min. Found Oct 4. Joining a community = claiming your own subkey ("slot") in a shared Veilid SMPL record.
[click] Every member can derive every slot's write key from one shared seed in the invite. Authenticity came from signatures on the content.
[click] But Veilid storage nodes accept any validly signed value with a higher sequence number, and the max is u32::MAX − 1. Write someone's slot at the max: nobody, including them, can ever write it again. Unattributable. This is Veilid working as designed; my design handed out the keys. Veilid's own developer book warns about exactly this: "anyone could abuse that, including writing a subkey at the maximum sequence number" (https://veilid.gitlab.io/developer-book/print.html#:~:text=anyone%20could%20abuse%20that%2C%20including%20writing%20a%20subkey%20at%20the%20maximum%20sequence%20number).
[click] Do it to slot 0, the genesis, and the community can never admit anyone again.

The fix (ADR 0011, "member-sovereign records"): each member gets their own DHT record owned by a key only they hold, so nobody else can write it or lock it. No shared slots means no 255-member cap per record. VeilidChat uses the same per-participant pattern. Tradeoff: ~N records per community, and members keep each other's records alive by opening them (a Veilid node stores at most 128 remote records). Accepted Oct 4; no code yet.
-->

---
chapter: arch
bg: communities
---

# patching Veilid: hold a route until it’s used

<div class="split code-heavy">
<div class="code-tiny">

```text
select_single_route()        → route R
  … await …
                               release_route(R)   → R removed
get_respond_to(R)            → "Invalid target:
                                route key does not exist"
                               request dropped
```

<p class="source">the race, drawn out · <a class="cite" href="https://gitlab.com/veilid/veilid/-/blob/v0.5.7/veilid-core/src/routing_table/route_spec_store/route_select.rs#L52-L55" target="_blank" rel="noopener">route_select.rs</a> · <a class="cite" href="https://gitlab.com/veilid/veilid/-/blob/v0.5.7/veilid-core/src/routing_table/route_spec_store/route_allocate.rs#L410-L418" target="_blank" rel="noopener">route_allocate.rs</a> (Veilid v0.5.7)</p>

</div>
<div>

<div class="tight-list">
<v-clicks>

- <span class="by rk">Rekindle</span> Symptom: <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/Cargo.toml#L162-L168" target="_blank" rel="noopener">“route key does not exist”, rehydration requests dropped</a>.
- <span class="by veilid">Veilid</span> Cause: a route is picked, then used after an await. <a class="cite" href="https://gitlab.com/veilid/veilid/-/blob/v0.5.7/veilid-core/src/routing_table/route_spec_store/route_allocate.rs#L410-L418" target="_blank" rel="noopener">A release in between removes it outright.</a>
- <span class="by rk">Rekindle</span> Fix: <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/Cargo.toml#L162-L166" target="_blank" rel="noopener">hold the route until it’s used; a release drains it instead of removing it</a>.
- <span class="by rk">Rekindle</span> <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/Cargo.toml#L162-L170" target="_blank" rel="noopener">Rekindle pins veilid-core 0.5.7 plus that one commit</a> <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/commit/7933aa29" target="_blank" rel="noopener">until a Veilid release carries it</a>.

</v-clicks>
</div>

</div>
</div>

<!--
1.5 min. This one is Veilid's bug, not mine, and the fix is meant to go upstream; the point is that building on someone's network means reading their source when it breaks.

The race: select_single_route returned bare route ids. The reply path assembles the route after an await. If anything released that route in between (the API's release_route, the ping validator, private route management), release_allocated_route removed it unconditionally, and the reply failed with "Invalid target: route key does not exist".

Veilid already had the right tool: reference-counted route handles (AllocatedRouteSetRef) with mark-for-release, used on its dead-route path. The patch wires selection and explicit releases through them: a held route is marked, not removed; selection skips marked routes; the last drop releases it. It's the same split Tor (marked_for_close), arti and i2pd make between "no longer selectable" and "gone". Public API unchanged; one new test, test_route_drain.
-->

---
chapter: arch
bg: multimedia
---

# media pipeline

<div class="arch-stack media">
  <div class="arch-row pipeline">
    <div class="panel"><h2>Session</h2>who’s actually in the call</div>
    <div class="panel"><h2>Capture</h2>Opus 20 ms · echo · noise</div>
    <div class="panel"><h2>Protect</h2>SFrame keys · replay window</div>
    <div class="panel"><h2>Transit</h2>4 KiB fragments · ≥3 hops</div>
    <div class="panel"><h2>Playback</h2>reassemble · jitter buffer</div>
  </div>
</div>

<v-clicks>

- <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/decisions/0015-media-engine.md#L20-L40" target="_blank" rel="noopener">Every box on this slide has been rewritten at least once.</a> 71 commits touch voice, video and media stats.
- <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/decisions/0015-media-engine.md#L49" target="_blank" rel="noopener">Frames ride Veilid `app_message` over routes.</a> Everything above that is Rekindle’s.
- <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/decisions/0015-media-engine.md" target="_blank" rel="noopener">ADR 0015: stop hand-deriving it</a>; port proven engine parts (str0m’s bandwidth estimator, with attribution).

</v-clicks>

<!--
1 min. Opus frames are 960 samples at 48 kHz = 20 ms. Video fragments are capped at a 4 KiB transport budget. These are code values, not latency claims.

ADR 0015 lists the churn: two bandwidth estimators on one route, voice outside the pacer, a jitter buffer clamped to whole 20 ms frames, a second playout buffer in the frontend. The str0m-derived crate (rekindle-media-bwe) landed after the commit these slides pin; it carries str0m's NOTICE.
-->

---
chapter: arch
bg: multimedia
---

# media readiness gate

<div class="split">
<div>

````md magic-move {lines: false}
```rust
pub fn ready(&self) -> bool {
    self.handshake == JoinHandshake::Connected
        && self.roster_non_empty
        && self.mek_present
        && self.local_caps_reported
        && self.session_config_emitted
}
```
```rust
pub fn ready(&self) -> bool {
    self.handshake == JoinHandshake::Connected
        && self.roster_non_empty
        && self.local_caps_reported
        && self.session_config_emitted
}
```
````

<p class="source">crates/rekindle-voice/src/media_ready.rs · <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/commit/7933aa29" target="_blank" rel="noopener">before / after 7933aa29</a></p>

</div>
<div>

<MediaReadyDemo />

</div>
</div>

<!--
1.5 min. Before this gate, frames died silently down the chain: empty roster, a key the receiver didn't have, an encoder set up for a codec the box can't do. Now each failure has one name.

[click] The shared-key check is gone: media keys are per sender now (SFrame). Your key exists from your first frame and peers get it as they add you.

Live: tick the boxes, then untick one.
-->

---
chapter: arch
bg: multimedia
---

# replay protection for voice frames

<div class="split code-heavy">
<div class="code-tiny">

```rust {all|1-7|10-15|16-17}
let offset = high - seq;
if offset >= WINDOW_SIZE {
    // Below the window — too late to verify, drop. Even if this
    // is a legitimate reordered packet, accepting it would give
    // an attacker an unbounded replay budget.
    return false;
}

// `offset < WINDOW_SIZE` = 256, so both fit.
let word = usize::try_from(offset / 64).unwrap_or(WINDOW_WORDS - 1);
let bit = offset % 64;
let mask = 1u64 << bit;
if self.bitmap[word] & mask != 0 {
    return false; // Replay.
}
self.bitmap[word] |= mask;
true
```

<a class="source" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-voice/src/replay_window.rs#L73-L89">crates/rekindle-voice/src/replay_window.rs · 73–89</a>

</div>
<div>

<v-clicks>

- Other people’s nodes carry your audio. Any of them can resend a packet.
- Authenticated ≠ fresh. So <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-voice/src/media_crypto.rs#L246-L278" target="_blank" rel="noopener">after SFrame decrypts a frame, a 256-wide bitmap checks its counter</a>.
- Same idea as <a class="cite" href="https://www.rfc-editor.org/rfc/rfc4303#:~:text=Duplicates%20are%20rejected%20through%20the%20use%20of%20a%20sliding%20receive%20window" target="_blank" rel="noopener">IPsec</a> and <a class="cite" href="https://www.rfc-editor.org/rfc/rfc3711#:~:text=Each%20SRTP%20receiver%20maintains%20a%20Replay%20List" target="_blank" rel="noopener">SRTP</a>.

</v-clicks>

</div>
</div>

<!--
1 min. The jitter buffer only drops old frames after accepting them; this rejects at ingress, and only after authentication so forged counters can't poison the window. RFC 9605 §9.3 makes anti-replay optional for SFrame receivers ("MAY"); Rekindle does it anyway, the way RFC 3711 §3.3.2 recommends for SRTP. 256 covers a ~5 s LTE handover at 50 packets/sec.
-->

---
chapter: tinfoil
bg: identity
scrim: divider
class: divider
---

<p class="eyebrow">PART 07</p>

# Tinfoil Socialite

<p class="subline">3 step-intents, governance and identity.</p>

<!--
Divider. The key focus.
-->

---
chapter: tinfoil
bg: identity
scrim: left
---

# 3 Step-Intents: borrowed from Nintendo

<div class="mid">

<p class="lede">Simple two-way handshakes and powerful single actions break security and privacy by design.</p>

<v-clicks>

- <a class="cite" href="https://www.nintendo.co.uk/Support/Nintendo-3DS-2DS/FAQ/Hardware/How-do-I-register-friends-/How-do-I-register-friends-242795.html#:~:text=both%20of%20you%20will%20become%20fully%20registered%20friends" target="_blank" rel="noopener">**3DS friend codes:** both people enter each other’s code.</a> Until both do, <a class="cite" href="https://www.nintendo.co.uk/Support/Nintendo-3DS-2DS/FAQ/Hardware/How-do-I-register-friends-/How-do-I-register-friends-242795.html#:~:text=provisionally%20entered" target="_blank" rel="noopener">you’re only provisional</a>.
- <a class="cite" href="https://en-americas-support.nintendo.com/app/answers/detail/a_id/27394" target="_blank" rel="noopener">**Switch data transfer:**</a> <a class="cite" href="https://en-americas-support.nintendo.com/app/answers/detail/a_id/27394#:~:text=Prepare%20the%20transfer%20on%20the%20source%20console" target="_blank" rel="noopener">start on the old console</a>, <a class="cite" href="https://en-americas-support.nintendo.com/app/answers/detail/a_id/27394#:~:text=Prepare%20to%20receive%20the%20data%20on%20the%20target%20console" target="_blank" rel="noopener">sign in on the new one</a>, <a class="cite" href="https://en-americas-support.nintendo.com/app/answers/detail/a_id/27394#:~:text=Complete%20the%20transfer%20on%20the%20source%20console" target="_blank" rel="noopener">finish on the old one</a>.
- Nobody gets added, moved or trusted by one person’s single click.
- Rekindle applies the same pattern to actions that change who or what you trust.

</v-clicks>

</div>

<!--
1 min. This is a UI/UX design choice, not a protocol: every user action that changes who you trust, or what can act as you, is split into propose, accept, complete, with a human in the loop on both sides.
-->

---
chapter: tinfoil
bg: identity
clicks: 3
---

# 3 Step-Intents

<p class="small">A user should always stay part of the flow.</p>

<IntentSteps />

<p class="punchline">A → B → A = <em>A + B</em></p>

<!--
1.5 min. One click per step. After A sends a request, B must accept it, and A must allow completion. A network ack is not consent.

Same shape as Veilid's routing: no single side picks the whole route.
-->

---
chapter: tinfoil
bg: identity
---

# 3 Step-Intents in Rekindle

<div class="big-table intents">

| action | ① propose | ② accept | ③ complete |
|---|---|---|---|
| add a friend | you share an invite link | they open it, confirm, send a request | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/src-tauri/src/commands/friends.rs#L76" target="_blank" rel="noopener">you accept → session keys exchanged</a> |
| friend’s keys change | their client sends new keys | held as pending; you compare safety numbers | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/src-tauri/src/commands/friends.rs#L171" target="_blank" rel="noopener">you accept, or decline</a> |
| open a `rekindle://` link | the link arrives | held as pending; nothing runs | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/src-tauri/src/commands/deep_link.rs#L18-L45" target="_blank" rel="noopener">you confirm, or dismiss</a> |
| pair a new device | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/architecture/sync.md#L99" target="_blank" rel="noopener">old device shows a one-time code (5 min)</a> | new device scans it and dials back | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/architecture/sync.md#L80-L105" target="_blank" rel="noopener">old device checks and burns the code, then hands over keys</a> |

</div>

<p class="small">A delivery ACK is not consent: <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/protocol/overview.md#L116" target="_blank" rel="noopener"><code>FriendRequestReceived</code> only says the request arrived</a>. <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/src-tauri/src/services/message_service/friend_handlers/incoming.rs#L42-L51" target="_blank" rel="noopener">Crossing requests (both add each other) accept automatically</a>, like 3DS codes.</p>

<!--
1.5 min. Each row is a real command pair: accept_request / reject_request, accept_session_reset / decline_session_reset, confirm_deep_link / dismiss_deep_link, accept_pairing_code.

The deep-link row is a fix: the Oct 4 audit found a rekindle:// link could join a community with no consent. Now the link is parked as pending and the buddy list asks.

Key change: when a friend’s 1:1 session breaks they send new keys. Rekindle holds them as pending; you compare the safety number out of band, then accept (accept_session_reset, friends.rs:171). The threat model refuses “auto-rehandshake without user consent” (threat-model.md:29). Honest limits: the ratchet doesn’t keep skipped-message keys yet, and the safety number is only 32 bits.
-->

---
chapter: tinfoil
bg: governance
scrim: left
---

# Democracy of a new age, post Project 2025

<p class="lede"><a class="cite" href="https://www.npr.org/2024/11/05/g-s1-32720/what-is-project-2025-trump-election#:~:text=a%20controversial%20plan%20drafted%20by%20the%20conservative%20Heritage%20Foundation%20to%20overhaul%20the%20U.S.%20government" target="_blank" rel="noopener">Project 2025</a> concentrates power in one office. In a Rekindle community, each of its moves is <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/architecture/communities-overview.md#L42-L45" target="_blank" rel="noopener">an entry honest members drop</a>.</p>

<div class="big-table">

| Project 2025’s move | the rule that blocks it |
|---|---|
| <a class="cite" href="https://www.congress.gov/118/meeting/house/117667/documents/HHRG-118-GO00-20240919-SD036.pdf#page=53" target="_blank" rel="noopener">“all federal executive power in a President”</a> | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/architecture/communities-overview.md#L51-L55" target="_blank" rel="noopener">the key that created the community carries no special authority</a> |
| <a class="cite" href="https://www.congress.gov/118/meeting/house/117667/documents/HHRG-118-GO00-20240919-SD036.pdf#page=15" target="_blank" rel="noopener">stack loyalists: “an army of aligned, vetted” staff</a> | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-governance/src/validate/mod.rs#L122-L128" target="_blank" rel="noopener">you can’t mint a role above your own</a>, <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-governance/src/validate/mod.rs#L138-L144" target="_blank" rel="noopener">or grant one</a> |
| <a class="cite" href="https://www.congress.gov/118/meeting/house/117667/documents/HHRG-118-GO00-20240919-SD036.pdf#page=113" target="_blank" rel="noopener">Schedule F</a>: <a class="cite" href="https://www.whitehouse.gov/presidential-actions/2025/01/restoring-accountability-to-policy-influencing-positions-within-the-federal-workforce/#:~:text=is%20hereby%20immediately%20reinstated%20with%20full%20force%20and%20effect" target="_blank" rel="noopener">make career staff fireable</a> | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-governance/src/validate/mod.rs#L167-L173" target="_blank" rel="noopener">you can only strip or ban someone you outrank; equals are immune</a> |
| <a class="cite" href="https://www.whitehouse.gov/presidential-actions/2025/02/ensuring-accountability-for-all-agencies/#:~:text=ensure%20Presidential%20supervision%20and%20control%20of%20the%20entire%20executive%20branch" target="_blank" rel="noopener">bring the referees under the president</a> | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/architecture/communities-overview.md#L42-L45" target="_blank" rel="noopener">there’s no referee to capture: every member’s device checks every action</a> |
| one office decides | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-channel/src/polls.rs#L16-L19" target="_blank" rel="noopener">polls count each member once</a>; <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-governance/src/validate/mod.rs#L157-L160" target="_blank" rel="noopener">anyone can step down</a> |

</div>

<p v-click class="small todo">Not yet: poll results don’t bind roles, and <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-governance/src/validate/mod.rs#L84-L87" target="_blank" rel="noopener">the creator still passes every check</a>.</p>

<!--
2 min. I designed the governance as a democratized structure for a post-Project-2025 world: collective ownership, closer to democratic socialism ("working people should run both the economy and society democratically," DSA) than to a server with an owner. The left column is from the plan itself (the Heritage Foundation's ~900-page Mandate for Leadership) and the 2025 orders: Schedule F reinstated Jan 20, EO 14215 on Feb 18. The right column is code.

How each block works:
- Unitary executive: the keypair that creates a community "collapses behind a horizon": its public key stays the address, its private key has no governance power (the Schwarzschild principle).
- Stacking loyalists: a role definition is valid only if its position is below the writer's own. The code comment says why: "Without this, a mid-rank admin could mint a higher-ranked role and grant it to themselves to climb the hierarchy." Grants follow the same rule.
- Firing the checks: removing someone's role or banning them requires strictly outranking them. Equal rank is immune, so admins can't purge each other.
- Capturing the referees: reader validates. Any member can write any entry; every honest member's device drops the ones the author wasn't allowed to make. There's no server or moderator team whose say-so makes it true.

Honest gap: polls exist and count each member once, but there's no binding election-to-role engine yet, and the creator bypass is still there. The next two slides are about exactly that.

The Mandate link is the full Heritage document as Rep. Stansbury entered it into the record of a House Oversight hearing (Sept 19, 2024); Heritage's own PDF link now redirects. Page numbers are PDF pages.
-->

---
chapter: tinfoil
bg: governance
---

# governance: when the leader can’t be trusted

<div class="code-tiny">

````md magic-move {lines: false}
```rust
pub fn validate_write(
    writer: &PseudonymKey,
    entry: &GovernanceEntry,
    state: &GovernanceState,
) -> bool {
    // Creator always passes validation
    if state.creator.as_ref() == Some(writer) {
        return true;
    }
```
```rust
pub fn validate_write(
    writer: &PseudonymKey,
    entry: &GovernanceEntry,
    state: &GovernanceState,
) -> bool {
    match entry {
        GovernanceEntry::InviteCreated { max_uses, .. }
            if !crate::invite_quota::check_max_uses_cap(*max_uses) =>
        {
            return false;
        }
        _ => {}
    }

    // Creator always passes validation
    if state.creator.as_ref() == Some(writer) {
        return true;
    }
```
````

</div>

<p class="source">crates/rekindle-governance/src/validate/mod.rs · <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/commit/c8dc0a3a" target="_blank" rel="noopener">before / after c8dc0a3a</a> “a creator-bypass hole they exposed”</p>

<!--
1.5 min. My original question: what happens when a leader leaves or can't be trusted? Operation is distributed; nobody has to be online. But authority still has a root: the creator gets ALL permissions.

[click] The doc for invite caps said "even a creator-bypass writer cannot smuggle a max_uses = u32::MAX entry past honest peers." A probe proved they could: the cap was checked below the bypass. Rules about whether an entry is well-formed (self-authored join requests, admission mode set once, invite caps) now run before "the creator can do anything." Shown trimmed to the invite-cap arm.

The creator bypass itself is still there. It comes back on the last table.
-->

---
chapter: tinfoil
bg: governance
---

# governance: when the leader suddenly leaves

<div class="split code-heavy">
<div class="code-tiny">

```rust
// Only a member who may rotate the community key may bump its
// generation (plan D20); the rotator election draws from the same
// set. The +1 rule is enforced above, before the creator bypass.
GovernanceEntry::MEKGenerationBump { .. } => {
    crate::permissions::may_rotate_mek(writer, state)
}
```

<a class="source" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-governance/src/validate/mod.rs#L215-L220">crates/rekindle-governance/src/validate/mod.rs · 215–220</a>

```rust
// M10.2 — creator cannot be banned by anyone.
if state.creator.as_ref() == Some(target) {
    return false;
}
```

<a class="source" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-governance/src/validate/mod.rs#L180-L183">crates/rekindle-governance/src/validate/mod.rs · 180–183</a>

</div>
<div>

<div class="tight-list">
<v-clicks>

- <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/decisions/0003-flat-smpl-governance.md#L36-L37" target="_blank" rel="noopener">The community has to outlive anyone in it, creator included.</a>
- No election, no succession: <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/architecture/communities-overview.md#L306-L307" target="_blank" rel="noopener">elections split-brain in a DHT</a>. Admins keep acting <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/architecture/communities-overview.md#L248" target="_blank" rel="noopener">through their roles</a>.
- The re-key runs without them: <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-types/src/permissions.rs#L109-L111" target="_blank" rel="noopener">any member allowed to moderate can rotate</a>.
- Nobody online? <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/architecture/communities-overview.md#L323-L324" target="_blank" rel="noopener">Records live while members keep reading them</a>; <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/architecture/communities-channels.md#L88-L92" target="_blank" rel="noopener">the first one back re-keys</a>.

</v-clicks>
</div>

<p v-click class="small todo">Open: the creator seat can’t be banned or handed on.</p>

</div>
</div>

<!--
1.5 min. The previous slide is the leader you can't trust; this one is the leader who's just gone. Nothing waits on them: the re-key from the group-keys slide picks a rotator from whoever's left, and any member with moderation rights can bump the key.

Only members allowed to rotate the key (admin, or kick/ban/manage-community) can write a key bump (validate/mod.rs:215-220). My reading, not in the docs: if every one of them leaves, messaging keeps working but nobody can rotate keys or grant roles. That's an open problem.

If the creator loses their only device there's no recovery channel (faq.md:89-100), so the seat is dead: nobody can use it, nobody can reassign it.

Idle clients re-read records every 5 minutes (RECORD_WARM_INTERVAL, warming.rs:5). Each Veilid node stores at most 128 remote records (ADR 0011).
-->

---
chapter: tinfoil
bg: identity
---

# identity: a pseudonym per community

<div class="code-small">

```rust {all|2|3-5|6}
pub fn derive_community_pseudonym(master_secret: &[u8; 32], community_id: &str) -> SigningKey {
    let hkdf = Hkdf::<Sha256>::new(Some(domains::COMMUNITY_PSEUDONYM.as_bytes()), master_secret);
    let mut seed = [0u8; 32];
    hkdf.expand(community_id.as_bytes(), &mut seed)
        .expect("32-byte output is a valid HKDF-SHA256 length");
    SigningKey::from_bytes(&seed)
}
```

</div>

<a class="source" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-secrets/src/derive.rs#L18-L24">crates/rekindle-secrets/src/derive.rs · 18–24</a>

<v-clicks>

- <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-secrets/src/derive.rs#L13-L24" target="_blank" rel="noopener">One master secret, a different signing key per community.</a>
- Privacy is a right: create and burn identities without consequence.
- <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/security/threat-model.md#L131" target="_blank" rel="noopener">The keys can’t be linked.</a> *You* still can: timing, style, what you say.
- Communities hold identity too. Representation matters.

</v-clicks>

<!--
1 min. Veilid's node key is separate again: your Veilid node identity, your Rekindle identity, and each community pseudonym are three unrelated keys. That's Veilid's "Nodes != Identity" applied one layer up.

This is also why there's no OAuth, no connected accounts, no public server directory: each is a correlation point, and a directory lets someone enumerate at-risk communities.
-->

---
chapter: lessons
bg: lessons
scrim: divider
class: divider
---

<p class="eyebrow">PART 08</p>

# What I’ve Learned

<p class="subline"><a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/commits/82292f54170c4ecab7bdc394703c00ca48acb5ac" target="_blank" rel="noopener">8 months, 421 commits.</a></p>

<!--
Divider.
-->

---
chapter: lessons
bg: lessons
class: center
---

# timeline

<div class="timeline" style="--steps: 5">
  <div><strong>Feb</strong><p><a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/commit/ba066924" target="_blank" rel="noopener">Xfire RE’d.</a> Tauri + Veilid chat. 1:1 encrypted DMs.</p></div>
  <div><strong>Mar–Apr</strong><p>“bleh.” “the haunting of clippy.” <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/decisions/0003-flat-smpl-governance.md#L10-L16" target="_blank" rel="noopener">Coordinator audit: 15 critical bugs.</a></p></div>
  <div><strong>Apr 29</strong><p><a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/commit/ec4d3f7f" target="_blank" rel="noopener">Communities with no leader.</a></p></div>
  <div><strong>May–Jun</strong><p>Daemon + CLI, crate harvest, voice and video.</p></div>
  <div><strong>Aug–Oct</strong><p>Audits, <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/decisions/0014-veilid-boundary-is-transitive.md" target="_blank" rel="noopener">Veilid boundary gates</a>, <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/decisions/0011-member-sovereign-records.md" target="_blank" rel="noopener">the slot lock</a>, <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/commit/7933aa29" target="_blank" rel="noopener">per-sender media keys</a>.</p></div>
</div>

<!--
1 min. April: 5 commits. The quiet months are where the redesigns happen. The May 6 merge credits @usrbinkat for the foundational transport + CLI primitives.
-->

---
chapter: lessons
bg: lessons
---

# what the audits caught

<div class="big-table audits">

| commit | looked fine | what was actually happening |
|---|---|---|
| <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/commit/f278b919" target="_blank" rel="noopener">f278b919</a> | channel messages arrived | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/commit/f278b919" target="_blank" rel="noopener">live delivery was dead: 548–562 “record not open” errors per session; messages only came in on the 60 s poll</a> |
| <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/commit/89686a51" target="_blank" rel="noopener">89686a51</a> | video frames arrived | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/commit/89686a51" target="_blank" rel="noopener">cameras never showed: 625 decrypt failures, zero key requests sent. <code style="white-space:nowrap">1 >= 1</code> read as “already have the key”</a> |
| <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/commit/ca0bedb2" target="_blank" rel="noopener">ca0bedb2</a> | log said “gossip broadcast queued” | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/commit/ca0bedb2" target="_blank" rel="noopener">nothing was broadcast</a> |
| <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/commit/a7cec599" target="_blank" rel="noopener">a7cec599</a> | build green, zero-warnings policy | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/commit/a7cec599" target="_blank" rel="noopener">8 crates never opted in, rekindle-secrets included: 60 hidden violations</a> |
| <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/commit/dc07ad5d" target="_blank" rel="noopener">dc07ad5d</a> | manual dedup passes done | <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/commit/dc07ad5d" target="_blank" rel="noopener">a gate found 9 duplicate functions, all written on that same branch</a> |

</div>

<!--
1.5 min. Every row is from the commit message. The pattern: things that report success without doing the work. A log line that says "queued" when nothing was sent. A build that's green because eight crates were never checked. A recovery path whose own "do I need to?" test guaranteed it never ran in the one case it existed for.

The first two were found live, on two machines in a voice channel, not by tests. The last two are why I trust gates over memory: "Six memories telling me to check for existing implementations did not stop me duplicating code."
-->

---
chapter: lessons
bg: lessons
scrim: left
---

# working with clankers

<div class="mid">

<v-clicks>

- <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/commit/f278b919" target="_blank" rel="noopener">They write code that looks right and never runs. Twice in one day.</a>
- More context didn’t fix it. Gates did: <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/commit/dc07ad5d" target="_blank" rel="noopener">the dupe gate found nine</a>; <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/commit/a7cec599" target="_blank" rel="noopener">the lint gate found eight crates exempt</a>.
- Small jobs with known inputs beat “build the feature.”
- The art gave them a map. The audits kept them honest.

</v-clicks>

</div>

<!--
1 min. "Gathered new clanker ops :3"
-->

---
chapter: lessons
bg: lessons
scrim: left
---

# What I’ve learned

<p class="lede">Making a telecom app is hard. Who would’ve thought! /s</p>

<div class="mid">

<v-clicks>

- Veilid requires real upfront knowledge. Read the primitives before you design.
- Strong design and arch can carry a project pretty far.
- WebRTC and media stacks have teeth. Threat-model them on their own.
- I still have a lot more to learn :P

</v-clicks>

</div>

<!--
1 min. On my original "WebRTC has critical vulns" line: I'm keeping it as "media stacks are their own trust boundary" unless I name a specific CVE and version. That's part of why Rekindle's media rides Veilid routes with its own frame encryption instead of a stock WebRTC stack.
-->

---
chapter: demo
bg: demo
scrim: divider
class: divider
---

<p class="eyebrow">PART 09</p>

# Demo

<p class="subline">Two identities, one community.</p>

<!--
Divider. Switch machines.
-->

---
chapter: end
bg: questions
scrim: left
class: complete center
---

# questions

<div class="split equal greetz">
<div>

<h2>thanks</h2>

- cDc and the Veilid folks, for the network
- @usrbinkat, for help with the transport and CLI

</div>
<div>

<h2>repo</h2>

<p><a href="https://github.com/ScopeCreep-zip/Rekindle">Rekindle on GitHub</a></p>
<p class="byline">KALI JACKSON · @RADICALKJAX</p>

</div>
</div>

<!--
5–10 min of questions. SECURITY.md: private advisories, 90-day coordinated disclosure, credit unless you'd rather not.
-->

---
chapter: end
hud: false
---

# sources

<ul class="reference-list">
<li><a href="https://discord.com/blog/how-discord-handles-two-and-half-million-concurrent-voice-users-using-webrtc">Discord: 2.5M concurrent voice users (relay design)</a> · <a href="https://discord.com/privacy">privacy policy</a> · <a href="https://www.techrepublic.com/article/news-discord-dave-end-to-end-encryption/">DAVE covers calls, not text</a></li>
<li><a href="https://gist.github.com/hackermondev/45a3cdfa52246f1d1201c1e8cdef6117">hackermondev: 0-click deanonymization via Cloudflare cache (2025)</a></li>
<li><a href="https://cybersecuritynews.com/discord-users-data-exposed/amp/">CybersecurityNews</a> · <a href="https://www.dexerto.com/gaming/discord-bot-built-to-stop-alt-accounts-leaks-millions-of-users-ip-addresses-3416371/">Dexerto: Double Counter breach (2026)</a></li>
<li><a href="https://www.404media.co/discord-shuts-down-spy-pet-bots-that-scraped-sold-user-messages/">404 Media: spy.pet (2024)</a> · <a href="https://arxiv.org/abs/2502.00627v1">Discord Unveiled dataset (2025)</a></li>
<li><a href="https://research.checkpoint.com/2025/from-trust-to-threat-hijacked-discord-invites-used-for-multi-stage-malware-delivery/">Check Point: hijacked Discord invites (2025)</a></li>
<li><a href="https://www.nbcnews.com/tech/tech-news/70000-government-id-photos-exposed-discord-user-hack-rcna236714">NBC News: 70,000 ID photos exposed (2025)</a> · <a href="https://cyberinsider.com/discord-expands-age-verification-system-for-teen-users-worldwide/">CyberInsider: age verification (2026)</a></li>
<li><a href="https://www.builtinsf.com/articles/xfire-oral-history">Xfire oral history</a> · <a href="https://web.archive.org/web/20110512003031/http://www.xfire.com/cms/xf_pr_20060424/">Viacom acquisition release (2006)</a> · <a href="https://techcrunch.com/2010/08/02/exclusive-titan-gaming-takes-xfire-off-viacoms-hands/">TechCrunch 2010</a> · <a href="https://techcrunch.com/2011/10/06/xfire-to-fly-solo-again-raises-4-million-from-intel-capital/">2011</a> · <a href="https://techcrunch.com/2012/04/09/xfire-nabs-groupon-tencent-ceo/">2012</a> · <a href="https://web.archive.org/web/20150611014251/http://social.xfire.com/">Xfire shutdown notice (2015)</a> · <a href="https://www.gameskinny.com/news/xfire-kills-pc-app-and-website-in-favor-of-esports/">GameSkinny</a> · <a href="https://web.archive.org/web/20070930080400/http://www.gamespot.com/news/6140392.html">GameSpot 2005</a> · <a href="https://web.archive.org/web/20191212161910/https://www.reuters.com/article/idUS158175%2B07-Oct-2010%2BMW20101007">Reuters 2010</a></li>
<li><a href="https://media.defcon.org/DEF%20CON%2031/DEF%20CON%2031%20presentations/Christien%20DilDog%20Rioux%20Katelyn%20Medus4%20Bowden%20-%20The%20Internals%20of%20Veilid%20a%20New%20Decentralized%20Application%20Framework.pdf">The Internals of Veilid (DEF CON 31 slides)</a> · <a href="https://veilid.com/">veilid.com</a> · <a href="https://www.engadget.com/americas-original-hacking-supergroup-creates-a-free-framework-to-improve-app-security-190043865.html">Engadget: DEF CON 31 launch</a></li>
<li><a href="https://discord.com/blog/every-voice-and-video-call-on-discord-is-now-end-to-end-encrypted">Discord: E2EE for calls, not text</a> · <a href="https://discord.com/blog/meet-dave-e2ee-for-audio-video">DAVE launch</a> · <a href="https://discord.com/developers/docs/topics/permissions">permissions</a> · <a href="https://discord.com/press-releases/update-on-security-incident-involving-third-party-customer-service">Oct 2025 incident disclosure</a> · <a href="https://www.pcworld.com/article/2308047/scraper-spies-on-600-million-discord-users-and-sells-the-data.html">PCWorld: spy.pet</a></li>
<li><a href="https://veilid.gitlab.io/developer-book/print.html">Veilid developer book</a> · <a href="https://docs.rs/veilid-core/latest/veilid_core/struct.RoutingContext.html">veilid-core RoutingContext</a> · <a href="https://www.nintendo.co.uk/Support/Nintendo-3DS-2DS/FAQ/Hardware/How-do-I-register-friends-/How-do-I-register-friends-242795.html">Nintendo 3DS friends</a> · <a href="https://en-americas-support.nintendo.com/app/answers/detail/a_id/27394">Switch user-data transfer</a> · <a href="https://www.rfc-editor.org/rfc/rfc4303">RFC 4303</a> · <a href="https://www.rfc-editor.org/rfc/rfc3711">RFC 3711</a></li>
<li><a href="https://v2.tauri.app/concept/architecture/">Tauri architecture</a> · <a href="https://tauri.app/about/governance/">governance</a> · <a href="https://tauri.app/security/capabilities/">Tauri capabilities</a> · <a href="https://noiseprotocol.org/noise.html">Noise</a> · <a href="https://www.rfc-editor.org/rfc/rfc9605">RFC 9605 (SFrame)</a> · <a href="https://github.com/algesten/str0m">str0m</a></li>
<li><a href="https://github.com/ScopeCreep-zip/Rekindle/tree/82292f54170c4ecab7bdc394703c00ca48acb5ac">Rekindle @ 82292f54 (all code on these slides)</a></li>
<li><a href="https://www.congress.gov/118/meeting/house/117667/documents/HHRG-118-GO00-20240919-SD036.pdf">Project 2025: Mandate for Leadership</a> · <a href="https://www.npr.org/2024/11/05/g-s1-32720/what-is-project-2025-trump-election">NPR explainer</a> · <a href="https://www.whitehouse.gov/presidential-actions/2025/02/ensuring-accountability-for-all-agencies/">EO 14215</a> · <a href="https://www.whitehouse.gov/presidential-actions/2025/01/restoring-accountability-to-policy-influencing-positions-within-the-federal-workforce/">Schedule F order</a> · <a href="https://www.dsausa.org/about-us/what-is-democratic-socialism/">DSA: what is democratic socialism</a></li>
</ul>

<p class="small">Art direction inspired by <em>Death Stranding</em> (Kojima Productions). No game imagery used; landscapes are freely licensed photos, credited next.</p>

---
chapter: end
hud: false
---

# landscape credits

<div class="credits">
<p><a href="https://commons.wikimedia.org/wiki/File:Nesjavellir_hiking_trail_%28Unsplash%29.jpg">Nesjavellir hiking trail (Unsplash)</a> · Gemma Evans stayandroam · <a href="http://creativecommons.org/publicdomain/zero/1.0/deed.en">CC0</a></p>
<p><a href="https://commons.wikimedia.org/wiki/File:East_Iceland_%28Unsplash%29.jpg">East Iceland (Unsplash)</a> · Jeremy Bishop tidesinourveins · <a href="http://creativecommons.org/publicdomain/zero/1.0/deed.en">CC0</a></p>
<p><a href="https://commons.wikimedia.org/wiki/File:Solheimasandur_Plane_Wreck_%28Unsplash_SIczJ91He3c%29.jpg">Solheimasandur Plane Wreck (Unsplash SIczJ91He3c)</a> · Christoffer Engström christoffere · <a href="http://creativecommons.org/publicdomain/zero/1.0/deed.en">CC0</a></p>
<p><a href="https://commons.wikimedia.org/wiki/File:Iceland_lake_Northern_Lights_%28Unsplash%29.jpg">Iceland lake Northern Lights (Unsplash)</a> · Vincent Guth vingtcent · <a href="http://creativecommons.org/publicdomain/zero/1.0/deed.en">CC0</a></p>
<p><a href="https://commons.wikimedia.org/wiki/File:Rock_columns_at_Reynisfjara_Beach.jpg">Rock columns at Reynisfjara Beach</a> · Alexander Grebenkov · <a href="https://creativecommons.org/licenses/by/3.0">CC BY 3.0</a></p>
<p><a href="https://commons.wikimedia.org/wiki/File:A_Journey_from_Another_World_%28Unsplash%29.jpg">A Journey from Another World (Unsplash)</a> · Diogo Tavares diogotavares · <a href="http://creativecommons.org/publicdomain/zero/1.0/deed.en">CC0</a></p>
<p><a href="https://commons.wikimedia.org/wiki/File:Lost_in_the_valley_%28Unsplash%29.jpg">Lost in the valley (Unsplash)</a> · Jonatan Pie r3dmax · <a href="http://creativecommons.org/publicdomain/zero/1.0/deed.en">CC0</a></p>
<p><a href="https://commons.wikimedia.org/wiki/File:A_cabin_with_snow_by_the_lake_%28Unsplash%29.jpg">A cabin with snow by the lake (Unsplash)</a> · Asgeir Pall Juliusson asgeir · <a href="http://creativecommons.org/publicdomain/zero/1.0/deed.en">CC0</a></p>
<p><a href="https://commons.wikimedia.org/wiki/File:Misty_Waterfall_in_Iceland_%28Unsplash%29.jpg">Misty Waterfall in Iceland (Unsplash)</a> · Dan Gold danielcgold · <a href="http://creativecommons.org/publicdomain/zero/1.0/deed.en">CC0</a></p>
<p><a href="https://commons.wikimedia.org/wiki/File:Dj%C3%BApivogur%2C_Iceland_%28Unsplash_59G4kl4Ob00%29.jpg">Djúpivogur, Iceland (Unsplash 59G4kl4Ob00)</a> · Cosmic Timetraveler atw · <a href="http://creativecommons.org/publicdomain/zero/1.0/deed.en">CC0</a></p>
<p><a href="https://commons.wikimedia.org/wiki/File:Steam_over_an_Icelandic_field_%28Unsplash%29.jpg">Steam over an Icelandic field (Unsplash)</a> · Tim Wright timdwright · <a href="http://creativecommons.org/publicdomain/zero/1.0/deed.en">CC0</a></p>
<p><a href="https://commons.wikimedia.org/wiki/File:Snow-capped_Icelandic_mountains_%28Unsplash%29.jpg">Snow-capped Icelandic mountains (Unsplash)</a> · Rucksack Magazine rucksackmag · <a href="http://creativecommons.org/publicdomain/zero/1.0/deed.en">CC0</a></p>
<p><a href="https://commons.wikimedia.org/wiki/File:Rural_Drive_%28Unsplash%29.jpg">Rural Drive (Unsplash)</a> · Roma Ryabchenko n3moy · <a href="http://creativecommons.org/publicdomain/zero/1.0/deed.en">CC0</a></p>
<p><a href="https://commons.wikimedia.org/wiki/File:Kiwirrkurra_Community%2C_Gibson_Desert_North%2C_Australia_%28Unsplash%29.jpg">Kiwirrkurra Community, Gibson Desert North, Australia (Unsplash)</a> · Robert Whyte robertwhyte · <a href="http://creativecommons.org/publicdomain/zero/1.0/deed.en">CC0</a></p>
<p><a href="https://commons.wikimedia.org/wiki/File:Chihuahuan_Desert_Nature_Park_-_Flickr_-_aspidoscelis.jpg">Chihuahuan Desert Nature Park - Flickr - aspidoscelis</a> · Patrick Alexander from Las Cruces, NM · <a href="http://creativecommons.org/publicdomain/zero/1.0/deed.en">CC0</a></p>
</div>
