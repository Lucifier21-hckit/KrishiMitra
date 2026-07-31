# KrishiMitra AI 🌾

**An AI-powered multilingual farming assistant for small and marginal farmers**
Built for UN Sustainable Development Goal 2 — Zero Hunger

By **Alok Swarnkar** · Raipur, Chhattisgarh, India

---

## 🌍 Problem

Small and marginal farmers across rural India — including districts like Raipur, Durg, and Bilaspur in Chhattisgarh — often lack timely access to agricultural expertise. Late-detected crop disease, poorly timed mandi sales, and missed government schemes quietly erode farm incomes and food security every season.

## 💡 Solution

KrishiMitra AI ("Farmer's Friend") puts expert-level agricultural guidance directly into a farmer's hands, in simple Hindi-English, through:

- **AI Krishi Salahkar (Chat)** — ask any farming question, get a practical answer instantly
- **Fasal Rog Pehchan (Disease Detection)** — upload a crop/leaf photo, get an AI-driven preliminary diagnosis and next steps
- **Mandi Bhav** — current market prices across nearby mandis
- **Mausam** — 5-day weather outlook with irrigation advisories
- **Sarkari Yojanayein** — a curated list of relevant government schemes (PM-KISAN, Fasal Bima Yojana, and more)

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Generative AI / NLP | Anthropic Claude API (chat + vision) |
| Frontend | React.js, Lucide icons, custom CSS |
| Image Understanding | Claude's multimodal vision API |
| Planned data sources | Chhattisgarh Mandi Board API, IMD Weather API, data.gov.in |

## 🚀 Running the prototype

This is a single-file React component (`KrishiMitra_AI_Prototype.jsx`) built to run inside a Claude.ai Artifact, where API calls to Claude are pre-authenticated automatically.

To run it as a standalone React app instead:

1. Create a React app (e.g. with Vite): `npm create vite@latest krishimitra -- --template react`
2. Install dependencies: `npm install lucide-react`
3. Copy `KrishiMitra_AI_Prototype.jsx` into `src/App.jsx`
4. Replace the `fetch("https://api.anthropic.com/v1/messages", ...)` call with a request to your own backend proxy that holds your Anthropic API key (never expose an API key in frontend code)
5. Run: `npm run dev`

## 📄 Project Documentation

See `SDG_KrishiMitraAI_AlokSwarnkar.docx` in this repo for the full project write-up — problem statement, objectives, features, and future scope.

## 🔮 Future Scope

- Live Chhattisgarh Mandi Board and IMD weather API integration
- Hindi/Chhattisgarhi voice input and output
- Offline-first Android app
- Validation partnership with local Krishi Vigyan Kendras
- WhatsApp/SMS access for farmers without smartphones
- Scheme coverage for other Indian states

## 📜 License

This is an academic prototype submitted as an SDG project. Feel free to fork and extend it.
