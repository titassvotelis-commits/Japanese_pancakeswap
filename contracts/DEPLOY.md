# Optimus (JNTo) — BSC mainnet deploy

## Prerequisites

- Deployer wallet `0xb22f80F9Ec693EB1dBf4B072F8749f8a471AaF0E` with **≥ 0.05 BNB** for gas
- `contracts/.env` from `.env.example` with `PRIVATE_KEY` and `BSCSCAN_API_KEY`
- No initial liquidity required at deploy (add later via UI)

## Emissions (defaults — change in `.env` before deploy)

| Contract | Rate | Notes |
|----------|------|--------|
| **MasterChef** (JNTo-USDT farm) | **0.01 JNTo / block** | ~105k JNTo/year; **25,000 JNTo** sent to chef at deploy |
| **SousChef** (Pools stake) | **0.005 JNTo / block** | **5,000 JNTo** sent to pool at deploy |
| **Farm alloc** | **1000** (100% to JNTo-USDT) | Single pool, pid `0` |

Total supply is **100,000 JNTo**; remaining tokens stay on deployer for liquidity/treasury.

## Commands

```bash
cd contracts
cp .env.example .env
# edit .env — add PRIVATE_KEY and BSCSCAN_API_KEY
npm install
npm run compile
npm run deploy
npm run verify
npm run sync-frontend
cd ..
node scripts/patch-pancakeswap-sdk.js
yarn start
```

## Deploy order (automatic)

1. JNTo token (100k supply → deployer)
2. PancakeFactory
3. PancakeRouter
4. Create **JNTo–USDT** pair

Optional (for **USDT ↔ BNB** swaps via multi-hop):

```bash
npx hardhat run scripts/create-jnto-wbnb-pair.js --network bsc
```

Then add **JNTo–BNB** liquidity in the app (`/add/<JNTo>/BNB`). Without this pool, only **USDT ↔ JNTo** can be routed on your factory.
5. MasterChef + pool 0
6. SousChef (pools)
7. Fund chefs with JNTo

## Router fix (add liquidity reverts)

The bundled `PancakeRouter` must use the **same `INIT_CODE_PAIR_HASH` as your factory**. An older router sent liquidity to the wrong pair address (empty `0x5c40…` instead of `0xF1bF…`).

After pulling the latest `contracts/deploy/router.sol`, redeploy only the router (deployer needs **~0.001 BNB**):

```bash
cd contracts
npm run compile
npm run redeploy-router
npm run sync-frontend
cd ..
yarn start
```

Then in the UI: **re-approve USDT and JNTo** for the new router address, and add liquidity again.

## After deploy

1. **Add liquidity** on `/add/JNTo/USDT` (needs JNTo + USDT in wallet).
2. **Stake LP** on `/farms` (pid 0).
3. **Stake JNTo** on `/pools`.
4. Transfer ownership of Factory / chefs to multisig when ready.

## Outputs

- `contracts/deployment.json` — all addresses
- `contracts/address.txt` — quick copy/paste
- Frontend synced via `sync-frontend`
