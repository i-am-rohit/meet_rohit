# Rohit Gusain — Chatbot Knowledge Base

**Active version:** `1.0`  
**Edition:** Verified Profile Edition  
**Entries:** 240 Q&A

## Files

| File | Purpose |
|------|---------|
| `v1.0.json` | Canonical 240 Q&A store + profile facts + answer rules |
| `supplements.ts` | Portfolio records already on the site: phones, social, role dates, FUSION, Shadon |
| `SOURCE.md` | Human-readable source dump used to build v1.0 |
| `index.ts` | Typed accessors + question matching for Ask Me |

## How to update

1. Edit answers in `SOURCE.md` (or provide a new verified Q&A pack).
2. Regenerate `v1.0.json` (or add `v1.1.json` and point `index.ts` at it).
3. Keep `rules` in sync — never invent unverified metrics.

## Chatbot rules (summary)

- Answer only from verified KB content.
- Mark pilots, estimates, and unverified items clearly.
- Do not mention Shadon unless asked.
- The COVID paper is the confirmed Springer chapter. Do not claim any other Springer publication, production RAG, or production agents without verification.
- Route consulting to meetrohit.in / LinkedIn / jhurohit@gmail.com.
