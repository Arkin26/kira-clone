# Protocols roadmap (evaluation)

Phased additions after **native multi-chain** checkout (Solana + EVM intents) and **Privy** are stable.

| Phase | Protocol / area | Role |
|-------|-----------------|------|
| 1 | [WalletConnect](https://walletconnect.com/) | Broader wallet discovery; often bundled via Privy / wagmi connectors. |
| 2 | [LI.FI](https://li.fi/) / Socket / 1inch | Swap user’s token to merchant-preferred asset on the same or another chain. |
| 3 | LayerZero / Wormhole / native bridges | True settlement when treasury must live on a **different** chain than the payer’s. |
| 4 | [x402](https://www.x402.org/) | HTTP 402 payment-required flows on top of existing intents (API monetization). |
| 5 | Chainlink feeds / fiat rails | Fiat display, limits, compliance hooks. |

**Notes**

- Swaps and bridges add support surface (stuck funds, slippage, MEV). Ship only when product needs “pay with any token” or cross-chain treasury.
- WalletConnect overlaps with Privy’s connector set; prefer one UX path to avoid duplicate connect modals.
