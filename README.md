# GENUS

**EVERYTHING LEAVES A TRACE.**

A local, build-free coin-scanning application using HTML, CSS, vanilla JavaScript, Canvas, SVG and localStorage. Every coin is read as a core sample of strata: one band per era reached, cracks for faults, a fossil bed for the ones that stopped moving. Phantom and Solflare connect through their injected Solana providers. No backend or database is required.

## Run locally

From this folder:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Open **http://localhost:8080**. A static HTTP server is required for reliable Canvas image export; do not use a `file://` URL. No external fonts, libraries or services are needed. Wallet connections require HTTPS or localhost. Use a wallet-enabled browser or an installed Phantom/Solflare extension.

## Try the product loop

1. Paste a Solana token address into the hero, or click **LIVE $BONK**. **TRY $BONK** opens the offline reference snapshot instead. Addresses that cannot be looked up open the manual form.
2. Enter a name, ticker, market cap, ATH, volume, holders and age. Optionally upload a PNG, JPEG or WebP. Uploads are resized to 512 pixels and set into the strata as a fossil medallion.
3. Watch the scan sequence and open the find profile.
4. Read its strata and layer history. Simulate a pump, crash, inactivity or returning activity; changes are saved locally. You can also edit market inputs directly.
5. Generate a PNL card using your entry market cap and SOL position, or choose a status, era, fault, reformation or **Excavation** card.
6. Export a **1200 × 675** or **1080 × 1080** PNG. **Share on X** opens prefilled copy; attach the downloaded image yourself.

## Vocabulary

| Was | Now |
|---|---|
| Species / specimen | Find |
| Keeper | Curator (`#curator`) |
| Graveyard | Fossil Bed (`#fossils`) |
| Ecosystem | Strata (`#strata`) |
| Leaderboard | Index (`#index`) |
| My Species | My Collection (`#collection`) |
| Generation | Era |
| Mutation / Resurrection | Fault / Reformation |

Stored data keeps its original field names and the `species.archive.v1` storage key, so existing archives keep working. Only display labels changed.

## Included

- 15 recognizable reference tokens, 3 fossils and a reformation example.
- Original token reference images on profiles, with click-to-enlarge; uploaded images are set into custom finds as fossil medallions.
- Procedural strata art (`js/strata.js`) drawn from each find's era, faults, health and status; fossils render in stone tones, reformations gain a teal band.
- A **five-second intro**: a wall of computers each showing a genus, with the camera dollying toward the centre screen until it becomes the page. Plays once per browser session, skippable with the button, click, Esc, Enter or Space, and never plays with reduced motion. **Replay Intro** is in the footer.
- A hero core sample that deposits layer by layer, cracks and takes its fossil mark, with pause and replay controls.
- Motion layer: drifting sediment dust, cursor glow and parallax, scroll reveals, count-up stats, card tilt, a scrolling field-notes ticker, button sheen and animated bars. All of it respects `prefers-reduced-motion`.
- Era timeline per find, fossil bed, index tabs, favorites and My Collection.
- Deterministic era rules centralized in `js/evolution.js`.
- Real Phantom and Solflare connections, wallet-address curator identities, account-change handling and disconnect.
- Persistent custom finds, positions, history, card settings, wallet profiles and saved market scenarios.
- Eight Canvas card types: My PNL, Find Status, New Era, ATH, Fault, Survival, Reformation and Excavation.
- Optional feature-detected WebMCP read, profile navigation and scan-start tools. These are not needed to use the application.

## Live data

Paste any **Solana token address** into the hero. GENUS reads it straight from your browser, with no server, key or account, so it works on static hosting such as GitHub Pages.

1. **DexScreener** (fast, one call): name, ticker, market cap, 24h volume across pairs and age from the oldest pair. The find appears within a couple of seconds.
2. **GeckoTerminal** (background, rate limited): holder count, daily or hourly price history and a token image. From the history GENUS derives a real ATH, the real dates each era was reached, and faults (drawdowns of 65% or more).

Behaviour to know about:

- GeckoTerminal allows about 30 calls a minute per visitor, so its calls are queued and spaced out. If it is busy or blocked the find still saves, shows **LIMITED HISTORY** and holders as **N/A**, and **Refresh** retries.
- ATH and era dates only cover the price history GeckoTerminal has for the pool (often months, not years). Older coins say so on their first layer.
- Holder counts and history are cached for 30 minutes in this browser.
- DexScreener images cannot be embedded across origins, so a live find shows its image on the profile and embeds it as the fossil medallion only when GeckoTerminal's image can be fetched.
- Opening a live find refreshes it automatically when its data is older than three minutes. **Refresh Live Finds** in My Collection refreshes them all.
- Only Solana tokens with a trading pair are supported. Anything else (or a failed lookup) offers a manual form, prefilled with the address.

## Deploy to GitHub Pages

The site is plain static files with relative paths, so it works from a repository root or a project path such as `https://you.github.io/genus/`.

1. Create a new GitHub repository and upload the **contents** of this folder (not the folder itself), so `index.html` sits at the top level. Dragging the unzipped files into the web uploader works.
2. In the repository go to **Settings → Pages**, set **Source** to **Deploy from a branch**, choose **main** and **/ (root)**, and save.
3. After a minute the site is live at the URL shown on that page. A custom domain can be added on the same screen.
4. Edit the X link in `index.html` (the `nav-twitter` anchor, currently `https://x.com`) to your profile.

The `.nojekyll` file stops GitHub from processing the files. Nothing needs building.

## Wallet profiles

Choose **Connect Wallet → Phantom / Solflare** and approve access in the wallet. The returned Solana public key selects the curator profile. Display names, custom finds, favorites, market scenarios, positions and activity are stored separately for each address. Using the same address through either provider opens the same profile.

Disconnect returns to the guest archive. Existing collections remain in that guest archive after migration. Reset Archive clears only the current profile. Downloads also export the current profile only.

Phantom reconnects silently on reload when the site is already trusted. Solflare restores an already-connected injected provider; otherwise choose Connect Wallet again. Mobile users can open the site inside the wallet’s app browser. Installation links appear when the wallet is unavailable.

Profiles remain local to this browser and origin. Connection provides a public key; it does not synchronize devices, authenticate a server session or automatically import holdings. PNL positions still use manual inputs.

Implementation references: [Phantom connection API](https://docs.phantom.com/solana/establishing-a-connection), [Phantom provider detection](https://docs.phantom.com/solana/detecting-the-provider), and [Solflare wallet integration](https://docs.solflare.com/solflare/technical/integrate-solflare/solflare-wallet-sdk).

## Data and behavior

`js/data.js` is the source of the 15 reference coins. Their values and reference contract identifiers are fictional snapshots. Coins you scan by address use live data (see above); coins entered by hand use your figures.

Eras depend on achieved market-cap thresholds. Previously achieved eras survive a crash; drawdowns change health and add faults. Same normalized CA and ticker generate the same base identity. Time stamps record discovery and events; they do not randomize the strata.

PNL is approximately `(current market cap / entry market cap - 1) × 100`, assuming unchanged token supply. SOL gain applies that ratio to the manually entered SOL position. Fees, slippage, supply changes and SOL/USD price changes are excluded. Optional entry price is stored for reference.

**Settings → Download Archive** exports a JSON copy of your finds, positions, preferences and profile. Existing saved collections migrate automatically to the archive storage namespace.

Storage is browser- and origin-specific. Use the same localhost address and port to keep your archive. Uploads are compressed/resized, and storage failures show a notice instead of silently discarding data. **Settings → Reset Archive** clears the current profile’s archive after confirmation, keeping the wallet connection and other profiles.

## Files

- `index.html` — shared navigation, intro mount, dialogs and footer
- `css/style.css` — responsive interface (recolored to the GENUS palette)
- `css/genus.css` — brand, strata hero, intro and motion layer
- `js/app.js` — views, scan sequence and interactions
- `js/data.js` — all reference finds and historical event data
- `js/strata.js` — procedural strata art and display vocabulary
- `js/species.js` — find cards and filters
- `js/lookup.js` — live DexScreener and GeckoTerminal lookup, throttling, caching and history parsing
- `js/evolution.js` — thresholds, deterministic interpretation and simulation
- `js/storage.js` — persistence and shared formatting helpers
- `js/wallet.js` — Phantom/Solflare connections and curator sessions
- `js/cards.js` — PNL calculation, full-resolution PNG rendering and X intents
- `js/hero-core.js` — hero core sample deposition and replay controls
- `js/dust.js` — sediment-dust canvas behind the hero
- `js/intro.js` — the five-second computer-wall intro
- `js/fx.js` — scroll reveals, count-ups, tilt and header state
- `js/agent-tools.js` — optional WebMCP integration
- `assets/logo/` — GENUS wordmark and symbol. Nothing else in `assets/` is needed except `assets/tokens/` (reference coin images).

See [QA.md](QA.md) for browser verification.
