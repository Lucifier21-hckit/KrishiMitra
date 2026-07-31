import React, { useState, useRef, useEffect } from "react";
import { Send, Leaf, CloudSun, TrendingUp, FileText, Upload, MessageCircle, Home, X, Loader2 } from "lucide-react";

const COLORS = {
  forest: "#234D20",
  forestDark: "#173413",
  turmeric: "#D4A017",
  soil: "#8B4513",
  cream: "#FBF3E2",
  wheat: "#F1E2C3",
  ink: "#2B2118",
};

async function askClaude(messages, systemPrompt, imageBase64) {
  const userContent = imageBase64
    ? [
        { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 } },
        { type: "text", text: messages[messages.length - 1].content },
      ]
    : messages[messages.length - 1].content;

  const apiMessages = [
    ...messages.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userContent },
  ];

  // Forward requests to a serverless proxy so API keys aren't exposed in frontend
  const body = {
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    system: systemPrompt,
    messages: apiMessages,
  };

  const response = await fetch("/api/anthropic-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  const text = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  return text || "Maaf kijiye, kuch gadbad ho gayi. Kripya dobara koshish karein.";
}

function NavButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        borderRadius: 10,
        border: "none",
        background: active ? COLORS.turmeric : "transparent",
        color: active ? COLORS.forestDark : COLORS.cream,
        fontWeight: active ? 700 : 500,
        cursor: "pointer",
        fontSize: 14,
        width: "100%",
        textAlign: "left",
        transition: "all 0.15s ease",
      }}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
}

function Header({ tab }) {
  const titles = {
    home: "स्वागत है — Welcome",
    chat: "AI Krishi Salahkar",
    disease: "Fasal Rog Pehchan",
    market: "Mandi Bhav",
    weather: "Mausam",
    schemes: "Sarkari Yojanayein",
  };
  return (
    <div style={{ padding: "18px 24px", borderBottom: `1px solid ${COLORS.wheat}` }}>
      <h2 style={{ margin: 0, color: COLORS.forestDark, fontSize: 22, fontFamily: "Georgia, serif" }}>
        {titles[tab]}
      </h2>
    </div>
  );
}

function HomeTab({ setTab }) {
  const cards = [
    { icon: MessageCircle, key: "chat", title: "AI Krishi Salahkar", desc: "Apne khet, fasal, keede-makode ya khaad se juda koi bhi sawal Hindi ya English mein poochein." },
    { icon: Upload, key: "disease", title: "Fasal Rog Pehchan", desc: "Patti ya fasal ki photo upload karein, AI turant rog pehchan kar upchaar batayega." },
    { icon: TrendingUp, key: "market", title: "Mandi Bhav", desc: "Raipur, Durg aur Bilaspur mandi ke aaj ke dhaan, chana aur sabzi ke bhav dekhein." },
    { icon: CloudSun, key: "weather", title: "Mausam Jaankari", desc: "Agle 5 din ka mausam poorvanumaan, barish aur sinchai salah ke saath." },
    { icon: FileText, key: "schemes", title: "Sarkari Yojanayein", desc: "PM-KISAN, Fasal Bima aur Chhattisgarh sarkar ki krishi yojanaon ki jaankari." },
  ];
  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          background: `linear-gradient(135deg, ${COLORS.forest}, ${COLORS.forestDark})`,
          borderRadius: 16,
          padding: "28px 24px",
          color: COLORS.cream,
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 13, letterSpacing: 1, color: COLORS.turmeric, fontWeight: 700, marginBottom: 6 }}>
          SDG 2 · ZERO HUNGER · CHHATTISGARH KE KISANO KE LIYE
        </div>
        <h1 style={{ margin: "0 0 10px", fontSize: 28, fontFamily: "Georgia, serif" }}>KrishiMitra AI</h1>
        <p style={{ margin: 0, opacity: 0.9, maxWidth: 520, lineHeight: 1.6, fontSize: 14 }}>
          Ek AI sahayak jo chhote aur seemant kisano ko unki bhasha mein, unke khet tak,
          krishi visheshagya jaisi salah pahunchata hai — bina intezaar, bina kharcha.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16 }}>
        {cards.map((c) => (
          <button
            key={c.key}
            onClick={() => setTab(c.key)}
            style={{
              textAlign: "left",
              background: "#fff",
              border: `1px solid ${COLORS.wheat}`,
              borderRadius: 14,
              padding: 18,
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <c.icon size={22} color={COLORS.forest} />
            <div style={{ fontWeight: 700, color: COLORS.ink, marginTop: 10, fontSize: 15 }}>{c.title}</div>
            <div style={{ fontSize: 13, color: "#6b5f4f", marginTop: 6, lineHeight: 1.5 }}>{c.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatTab() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Namaste! Main KrishiMitra hoon. Aap mujhse fasal, mitti, khaad, keet-niyantran ya mausam ke baare mein Hindi ya English mein sawal pooch sakte hain." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const reply = await askClaude(
        newMessages,
        "You are KrishiMitra, a warm and practical AI farming assistant for small and marginal farmers in Chhattisgarh, India. Answer in simple, mixed Hindi-English (Hinglish) unless the user writes otherwise and be concise.",
      );
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Network error. Kripya dobara koshish karein." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              background: m.role === "user" ? COLORS.forest : "#fff",
              color: m.role === "user" ? COLORS.cream : COLORS.ink,
              padding: "10px 14px",
              borderRadius: 12,
              maxWidth: "75%",
              fontSize: 14,
              lineHeight: 1.5,
              border: m.role === "user" ? "none" : `1px solid ${COLORS.wheat}`,
              whiteSpace: "pre-wrap",
            }}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", color: "#8a7a63", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            <Loader2 size={14} className="spin" style={{ animation: "spin 1s linear infinite" }} /> KrishiMitra soch raha hai...
          </div>
        )}
      </div>
      <div style={{ padding: 16, borderTop: `1px solid ${COLORS.wheat}`, display: "flex", gap: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Apna sawal likhein... e.g. Dhaan mein pila rog kaise theek karein?"
          style={{
            flex: 1,
            padding: "12px 14px",
            borderRadius: 10,
            border: `1px solid ${COLORS.wheat}`,
            fontSize: 14,
            outline: "none",
          }}
        />
        <button
          onClick={send}
          disabled={loading}
          style={{
            background: COLORS.turmeric,
            border: "none",
            borderRadius: 10,
            padding: "0 18px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Send size={18} color={COLORS.forestDark} />
        </button>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
    </div>
  );
}

function DiseaseTab() {
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      setImageBase64(reader.result.split(",")[1]);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!imageBase64) return;
    setLoading(true);
    try {
      const reply = await askClaude(
        [{ role: "user", content: "Is fasal/patti ki photo dekhkar bataiye: 1) Kya rog ya samasya dikh rahi hai, 2) Kitni gambhir hai, 3) Kisan gharelu/saral upchaar kya kar sakta hai, 4) Kab agr..." }],
        "You are KrishiMitra's crop-health assistant. Examine the plant/leaf image for visible signs of disease, pest damage, or nutrient deficiency. Be clear that this is preliminary guidance, not a diagnostic report. Provide simple, practical next steps a small farmer can follow.",
        imageBase64
      );
      setResult(reply);
    } catch (e) {
      setResult("Analysis failed. Kripya dobara koshish karein.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <p style={{ color: "#6b5f4f", fontSize: 14, marginTop: 0 }}>
        Beemar patti ya fasal ki photo upload karein — AI turant sambhavit rog aur salah degа.
      </p>
      <div
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${COLORS.forest}`,
          borderRadius: 14,
          padding: 30,
          textAlign: "center",
          cursor: "pointer",
          background: "#fff",
          maxWidth: 420,
        }}
      >
        {image ? (
          <img src={image} alt="fasal" style={{ maxWidth: "100%", maxHeight: 220, borderRadius: 10 }} />
        ) : (
          <>
            <Upload size={30} color={COLORS.forest} />
            <div style={{ marginTop: 10, color: COLORS.ink, fontSize: 14 }}>Photo upload karne ke liye click karein</div>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
      <button
        onClick={analyze}
        disabled={!imageBase64 || loading}
        style={{
          marginTop: 16,
          background: imageBase64 ? COLORS.turmeric : COLORS.wheat,
          border: "none",
          borderRadius: 10,
          padding: "10px 20px",
          fontWeight: 700,
          color: COLORS.forestDark,
          cursor: imageBase64 ? "pointer" : "not-allowed",
        }}
      >
        {loading ? "Jaanch ho rahi hai..." : "Rog Pehchano"}
      </button>
      {result && (
        <div style={{ marginTop: 20, background: "#fff", border: `1px solid ${COLORS.wheat}`, borderRadius: 12, padding: 18, maxWidth: 500, fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
          {result}
        </div>
      )}
    </div>
  );
}

function MarketTab() {
  const data = [
    { crop: "Dhaan (Common Paddy)", mandi: "Raipur Mandi", price: "₹2,183 / quintal", trend: "+1.2%" },
    { crop: "Chana (Gram)", mandi: "Durg Mandi", price: "₹5,420 / quintal", trend: "-0.8%" },
    { crop: "Tuar (Arhar Dal)", mandi: "Bilaspur Mandi", price: "₹7,650 / quintal", trend: "+2.4%" },
    { crop: "Tamatar (Tomato)", mandi: "Raipur Sabzi Mandi", price: "₹1,400 / quintal", trend: "+5.6%" },
    { crop: "Soyabean", mandi: "Rajnandgaon Mandi", price: "₹4,310 / quintal", trend: "-1.1%" },
  ];
  return (
    <div style={{ padding: 24 }}>
      <p style={{ color: "#6b5f4f", fontSize: 13, marginTop: 0 }}>
        * Demo data — live version ko Chhattisgarh Mandi Board API se jodha ja sakta hai.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", border: `1px solid ${COLORS.wheat}`, borderRadius: 10, padding: "12px 16px" }}>
            <div>
              <div style={{ fontWeight: 700, color: COLORS.ink, fontSize: 14 }}>{d.crop}</div>
              <div style={{ fontSize: 12, color: "#8a7a63" }}>{d.mandi}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700, color: COLORS.forest, fontSize: 14 }}>{d.price}</div>
              <div style={{ fontSize: 12, color: d.trend.startsWith("+") ? "#2D7A3E" : "#B5541B" }}>{d.trend}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeatherTab() {
  const days = [
    { day: "Aaj", temp: "34° / 26°", note: "Dhoop, halki nami" },
    { day: "Kal", temp: "33° / 25°", note: "Baadal chhaye rahenge" },
    { day: "Parso", temp: "30° / 24°", note: "Halki baarish" },
    { day: "Din 4", temp: "29° / 23°", note: "Tez baarish — sinchai roken" },
    { day: "Din 5", temp: "31° / 24°", note: "Saaf mausam" },
  ];
  return (
    <div style={{ padding: 24 }}>
      <p style={{ color: "#6b5f4f", fontSize: 13, marginTop: 0 }}>* Demo data — Raipur, Chhattisgarh ke liye 5-din poorvanumaan.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px,1fr))", gap: 12 }}>
        {days.map((d, i) => (
          <div key={i} style={{ background: "#fff", border: `1px solid ${COLORS.wheat}`, borderRadius: 12, padding: 16, textAlign: "center" }}>
            <div style={{ fontWeight: 700, color: COLORS.forestDark, fontSize: 13 }}>{d.day}</div>
            <CloudSun size={26} color={COLORS.turmeric} style={{ margin: "8px 0" }} />
            <div style={{ fontSize: 14, fontWeight: 700 }}>{d.temp}</div>
            <div style={{ fontSize: 11, color: "#8a7a63", marginTop: 4 }}>{d.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SchemesTab() {
  const schemes = [
    { name: "PM-KISAN Samman Nidhi", desc: "Har saal ₹6,000 seedha bank khate mein, teen kishton mein — sabhi patra kisan parivaron ke liye." },
    { name: "Pradhan Mantri Fasal Bima Yojana", desc: "Prakritik aapda se fasal nuksan par bima suraksha, bahut kam premium par." },
    { name: "Rajiv Gandhi Kisan Nyay Yojana (Chhattisgarh)", desc: "Chhattisgarh ke dhaan, makka aur ganna utpadak kisano ko pratyaksh aarthik sahayata." },
    { name: "Krishi Vigyan Kendra Salahkar Seva", desc: "Nazdiki KVK se muft mitti jaanch, beej salah aur field visit ki suvidha." },
  ];
  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
      {schemes.map((s, i) => (
        <div key={i} style={{ background: "#fff", border: `1px solid ${COLORS.wheat}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 700, color: COLORS.forestDark, fontSize: 14 }}>{s.name}</div>
          <div style={{ fontSize: 13, color: "#6b5f4f", marginTop: 6, lineHeight: 1.5 }}>{s.desc}</div>
        </div>
      ))}
    </div>
  );
}

export default function KrishiMitraApp() {
  const [tab, setTab] = useState("home");
  const nav = [
    { key: "home", label: "Home", icon: Home },
    { key: "chat", label: "AI Chat", icon: MessageCircle },
    { key: "disease", label: "Rog Pehchan", icon: Upload },
    { key: "market", label: "Mandi Bhav", icon: TrendingUp },
    { key: "weather", label: "Mausam", icon: CloudSun },
    { key: "schemes", label: "Yojanayein", icon: FileText },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Segoe UI, Arial, sans-serif", background: COLORS.cream }}>
      <div style={{ width: 220, background: COLORS.forestDark, padding: 18, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.cream, marginBottom: 18, padding: "0 6px" }}>
          <Leaf size={22} color={COLORS.turmeric} />
          <span style={{ fontWeight: 800, fontSize: 17 }}>KrishiMitra</span>
        </div>
        {nav.map((n) => (
          <NavButton key={n.key} icon={n.icon} label={n.label} active={tab === n.key} onClick={() => setTab(n.key)} />
        ))}
        <div style={{ marginTop: "auto", color: "#c9c0a8", fontSize: 11, padding: "0 6px" }}>
          SDG 2 · Zero Hunger<br />Prototype by Alok Swarnkar
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Header tab={tab} />
        <div style={{ flex: 1, overflowY: "auto" }}>
          {tab === "home" && <HomeTab setTab={setTab} />}
          {tab === "chat" && <ChatTab />}
          {tab === "disease" && <DiseaseTab />}
          {tab === "market" && <MarketTab />}
          {tab === "weather" && <WeatherTab />}
          {tab === "schemes" && <SchemesTab />}
        </div>
      </div>
    </div>
  );
}
