# HYROX Mabel vergelijking Amsterdam vs Rotterdam 2026

- `mabel_hyrox_2026_data.json`: ruwe en afgeleide data.
- `mabel_hyrox_2026_comparison.csv`: vergelijkingsregels in tabelvorm.

## Simple site
Er is een eenvoudige statische site toegevoegd met grafieken en vergelijkingstabellen:
- `site/index.html`
- `site/styles.css`
- `site/app.js`

Lokaal draaien vanaf repo-root:

```bash
python -m http.server 8000
```

Open daarna:
- `http://localhost:8000/analysis/hyrox_mabel_2026/site/`
