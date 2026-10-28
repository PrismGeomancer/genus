# SPECIES verification

Verified locally on 4 October 2026 using headless Google Chrome with Playwright against the static localhost server. No public deployment was performed.

## Wallet integration verification — 8 October 2026

Verified in headless Google Chrome using controlled injected-provider fixtures matching the Phantom and Solflare public-key connection flows:

- Missing-provider guidance and canceled-approval recovery, with working retries.
- Migration of existing collections into the guest archive without showing a connected wallet.
- Phantom connection, wallet address display, keeper identity and silent trusted restoration after reload.
- Account changes between two addresses, with separate display names and favorites; returning restores the saved profile.
- Solflare connection, the same-address profile shared across providers and restoration of an already-connected provider without a new prompt.
- Failed disconnect retains the connected profile; successful disconnect returns to the preserved guest collection.
- Untrusted account changes clear the session; an explicit disconnect does not automatically reconnect after reload.
- Reset affects the current keeper only, keeping other profiles and the active wallet connection.
- Mobile wallet chooser at 390px without overflow, JavaScript syntax checks and no browser errors.

Actual wallet-extension approval was not exercised in the automated browser. Desktop users need an installed wallet extension; mobile users can open SPECIES inside their wallet’s app browser. Profiles remain browser-local and no transactions or signatures are requested.

## Presentation verification — 8 October 2026

Large-display layout update verified in headless Google Chrome at 390, 1100, 1440, 1920, 2560 and 3440 pixels. All eight routes passed at each width (48 combinations), with no horizontal overflow or JavaScript errors. Reviewed homepage screenshots at 1920 and 3440 pixels and the specimen profile at 2560 pixels. Opening a species and its card dialog also passed at 2560 pixels. Layout checks used reduced motion.

Verified in headless Google Chrome against the local HTTP server after the product copy and keeper access changes:

- Nine routes at 1440px and 390px, with no horizontal overflow or visible early-stage wording.
- Existing collection migration, including keeper identity and favorites.
- Keeper navigation and optional wallet-address persistence after reload.
- Ecosystem search, saved specimens and market scenarios.
- Manually entered PNL, landscape and square dimensions, actual PNG downloads and share copy.
- JSON archive downloads and canceling an archive reset without losing positions.
- New species discovery through the manual snapshot form and profile reveal.
- Desktop and mobile visual review, all application JavaScript syntax checks and no browser errors.

This application uses illustrative reference values and manually entered market snapshots. The address-reference interface in these checks has since been replaced by connected wallet profiles. Balances are not read from the blockchain.

## Previous verification — 4 October 2026

### Functional checks: 60 passed

- Homepage, Three.js canvas, supplied logo and the 18-specimen reference collection.
- Previous wallet flow, copy, refresh persistence and disconnect. The keeper access flow has since replaced this interface.
- Ecosystem search, critical/mutating/ancient filters, profiles and evolution histories.
- Favorites and My Species.
- Contract discovery, manual token inputs, image upload/preview, specimen treatment, scan and reveal.
- Deterministic identity, custom species persistence and Newly Discovered ordering.
- Exact calculated positive and negative PNL; persisted position data.
- Landscape 1200 × 675 and square 1080 × 1080 Canvas output.
- Actual PNG download verified by its binary signature and saved file size.
- All seven card types, X intent URL and species-specific copy.
- Pump evolution, crash mutation without losing achieved generation, inactivity extinction, resurrection and refresh persistence.
- Graveyard, historical global event report, leaderboard categories and profile navigation.
- Keeper identity, PNL records and reset of the application's local storage.
- Mobile navigation and all primary routes at 390px, without horizontal overflow.
- No JavaScript page errors or browser console errors during the complete functional suite.

## Additional checks

- All 18 reference profiles at 360px, 390px and 430px: 54 combinations without horizontal overflow.
- Slow simulated activity updates observed after the 28-second interval.
- The original illustrated organism remains visible without the Three.js renderer.
- Visual review of desktop homepage, desktop/mobile profiles, card dialog, positive/negative landscape exports and square export.
- JavaScript syntax checked with Node.

## Limits

Tests cover the local application in Chrome. Native proposed WebMCP support was unavailable in this browser, so that optional integration could not be validated in a supported context. The feature-detected fallback runs normally.

Data is reference or user-provided. Tests do not verify real token contract addresses, market quotes, real wallets, blockchain transactions or actual social posting. X opens with copy; no image is attached automatically.

The 3D fallback and resized artwork are local. Browser storage is origin-specific and subject to quota; a failed write produces a notice. Mobile tests used browser viewports, not physical devices.

## Original meme profile images

Verified after adding source images: all 15 recognizable reference-token images load locally and differ from the evolved organism artwork; each opens an enlarged image view. Checked every updated profile at 390px with no horizontal overflow, custom uploaded source images, fictional-token fallback text and existing saved reference modifications. No browser errors occurred in this check.

## Hero evolution replay

Verified cell-to-mature geometry changes, the completed original specimen artwork, pause/resume, replay, route cleanup and re-entry, mobile overflow, reduced-motion behavior on preference change and reload, and the discovery CTA. No browser page or console errors occurred. The roughly 12-second replay is illustrative and does not modify saved market or evolution data.

## GENUS redesign verification — 23 October 2026

Verified in headless Google Chrome (puppeteer-core) against the local static server:

- Rename, vocabulary, routes (`#strata`, `#fossils`, `#index`, `#collection`, `#curator`, `#find/<id>`) and wallet copy; no old vocabulary visible in rendered pages.
- Five-second intro: frame capture at 1440×900 and 390×844 shows the dolly toward the centre screen and the crossfade into the page. Skip by Escape, plays once per session, replay link restarts it, and reduced motion bypasses it.
- Hero deposition replay completes and restarts; reduced motion shows the full core sample immediately.
- All routes render with no console errors; mobile (390px) has no horizontal overflow.
- Manual scan with an uploaded image embeds the token as a fossil medallion; simulator, filters, index tabs and wallet dialog work.
- PNG cards render for Find Status and Excavation (other types share the same renderer).

Not exercised: actual wallet-extension approval, and real-device touch behaviour.

## Live lookup verification — 23 October 2026

Run in headless Google Chrome against the real DexScreener and GeckoTerminal APIs:

- Real BONK mint: find appeared in about 2 seconds with live market cap, volume and age. After background enrichment it had 1,026,345 holders, 182 days of price history, a real ATH above the current cap and a dated fault.
- Refresh button and My Collection refresh-all work; the timestamp updates.
- Unknown address shows "No trace found" with Try again / Enter manually, and the manual form opens with the address prefilled.
- With both APIs blocked, a clear "could not be reached" message appears.
- With GeckoTerminal returning 429, the find still saves, shows "Limited history" and holders "N/A", and no errors reach the console.

Not tested: very new pump.fun tokens with no pool history on GeckoTerminal (they fall back to the limited-history path), and heavy repeated use against the GeckoTerminal rate limit.
