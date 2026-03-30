// ============================================================
// CERES — Mock Data Layer
// ============================================================

export const FARMER_PROFILE = {
  name: "Ramesh Kumar",
  village: "Chandpur, Haryana",
  landAcres: 4.5,
  cropType: "Wheat",
  soilType: "Loamy",
  phone: "+91 98765 43210",
  farmScore: 78,
  badges: ["Early Adopter", "Water Saver", "Pest Guardian"],
  loanEligible: true,
  loanAmount: 150000,
};

export const GOLDEN_HOUR_ALERTS = [
  {
    id: 1,
    icon: "⚠️",
    title: "Spray Pesticide",
    desc: "Aphid infestation risk detected. Spray neem oil solution immediately.",
    urgency: "critical",
    hoursLeft: 5.5,
    action: "View Instructions",
  },
  {
    id: 2,
    icon: "💧",
    title: "Irrigate West Field",
    desc: "Soil moisture critically low. Irrigate now for maximum yield protection.",
    urgency: "warning",
    hoursLeft: 4,
    action: "Start Irrigation",
  },
  {
    id: 3,
    icon: "🌧",
    title: "Delay Sowing",
    desc: "Heavy rainfall predicted. Delay sowing by 2 days for optimal germination.",
    urgency: "safe",
    hoursLeft: 48,
    action: "See Forecast",
  },
  {
    id: 4,
    icon: "🌡",
    title: "Frost Warning",
    desc: "Temperature dropping to 3°C tonight. Cover sensitive seedlings.",
    urgency: "critical",
    hoursLeft: 3,
    action: "Protect Crops",
  },
];

export const DAILY_ACTIONS = [
  { time: "6:00 AM", task: "Water wheat crops (North field)", done: true, icon: "💧" },
  { time: "8:00 AM", task: "Check for pest signs on leaves", done: true, icon: "🔍" },
  { time: "10:00 AM", task: "Apply fertilizer — Row 3-7", done: false, icon: "🌱" },
  { time: "2:00 PM", task: "Avoid spraying — rain likely at 4 PM", done: false, icon: "🌧" },
  { time: "5:00 PM", task: "Check soil moisture sensors", done: false, icon: "📊" },
  { time: "7:00 PM", task: "Review tomorrow's weather forecast", done: false, icon: "🌤" },
];

export const MANDI_PRICES = [
  { crop: "Wheat", price: 2250, trend: +3.2, demand: "High", location: "Karnal Mandi" },
  { crop: "Rice", price: 1980, trend: -1.1, demand: "Medium", location: "Ambala Mandi" },
  { crop: "Mustard", price: 5400, trend: +7.8, demand: "Very High", location: "Sirsa Mandi" },
  { crop: "Cotton", price: 6100, trend: +2.3, demand: "High", location: "Hisar Mandi" },
  { crop: "Maize", price: 1750, trend: -0.5, demand: "Low", location: "Panipat Mandi" },
  { crop: "Barley", price: 1650, trend: +1.8, demand: "Medium", location: "Rohtak Mandi" },
];

export const GOVT_SCHEMES = [
  {
    name: "PM-KISAN",
    desc: "₹6,000/year direct income support",
    eligible: true,
    benefit: "₹6,000/year",
    deadline: "Apr 15, 2026",
    icon: "🏦",
    link: "#",
  },
  {
    name: "Kisan Credit Card",
    desc: "Short-term crop loans at 4% interest",
    eligible: true,
    benefit: "Up to ₹3 Lakh",
    deadline: "Open",
    icon: "💳",
    link: "#",
  },
  {
    name: "PMFBY Crop Insurance",
    desc: "Coverage against natural calamities",
    eligible: true,
    benefit: "₹1.5 Lakh coverage",
    deadline: "Apr 30, 2026",
    icon: "🛡",
    link: "#",
  },
  {
    name: "Solar Pump Subsidy",
    desc: "75% subsidy on solar irrigation pumps",
    eligible: false,
    benefit: "₹45,000 subsidy",
    deadline: "May 1, 2026",
    icon: "☀️",
    link: "#",
  },
  {
    name: "Soil Health Card",
    desc: "Free soil testing and recommendations",
    eligible: true,
    benefit: "Free",
    deadline: "Open",
    icon: "🧪",
    link: "#",
  },
];

export const WHAT_IF_CROPS = [
  {
    name: "Wheat",
    yieldPerAcre: 22,
    pricePerQ: 2250,
    waterNeed: "High",
    growDays: 120,
    risk: "Low",
  },
  {
    name: "Mustard",
    yieldPerAcre: 8,
    pricePerQ: 5400,
    waterNeed: "Low",
    growDays: 90,
    risk: "Medium",
  },
  {
    name: "Rice",
    yieldPerAcre: 25,
    pricePerQ: 1980,
    waterNeed: "Very High",
    growDays: 150,
    risk: "Medium",
  },
  {
    name: "Maize",
    yieldPerAcre: 30,
    pricePerQ: 1750,
    waterNeed: "Medium",
    growDays: 100,
    risk: "Low",
  },
  {
    name: "Soybean",
    yieldPerAcre: 12,
    pricePerQ: 3800,
    waterNeed: "Medium",
    growDays: 110,
    risk: "High",
  },
];

export const COMMUNITY_POSTS = [
  {
    id: 1,
    farmer: "Suresh Yadav",
    village: "Rohtak",
    time: "2 min ago",
    message: "मेरी फसल में पीले धब्बे आ रहे हैं। किसी को पता है क्या?",
    translation: "Yellow spots appearing on my crop. Does anyone know what this is?",
    replies: 3,
    avatar: "S",
    likes: 8,
    hasAudio: true,
  },
  {
    id: 2,
    farmer: "Meena Devi",
    village: "Karnal",
    time: "15 min ago",
    message: "Neem oil spray worked great on my tomatoes. Highly recommend!",
    translation: null,
    replies: 7,
    avatar: "M",
    likes: 24,
    hasAudio: true,
  },
  {
    id: 3,
    farmer: "Jagdish Singh",
    village: "Panipat",
    time: "1 hr ago",
    message: "Wheat prices at Karnal mandi went up today — ₹2250/quintal!",
    translation: null,
    replies: 12,
    avatar: "J",
    likes: 45,
    hasAudio: false,
  },
  {
    id: 4,
    farmer: "Anita Kumari",
    village: "Ambala",
    time: "3 hr ago",
    message: "PM-KISAN installment received today. Check your accounts!",
    translation: null,
    replies: 31,
    avatar: "A",
    likes: 89,
    hasAudio: false,
  },
];

export const WEATHER_DATA = {
  temp: 28,
  humidity: 65,
  wind: 12,
  condition: "Partly Cloudy",
  icon: "⛅",
  rainfall: "4mm expected tonight",
  uvIndex: 6,
  forecast: [
    { day: "Today", icon: "⛅", high: 28, low: 18 },
    { day: "Tue", icon: "🌧", high: 22, low: 15 },
    { day: "Wed", icon: "🌧", high: 20, low: 14 },
    { day: "Thu", icon: "🌤", high: 26, low: 17 },
    { day: "Fri", icon: "☀️", high: 30, low: 19 },
  ],
};

export const SATELLITE_ZONES = [
  { id: 1, label: "North Field", ndvi: 0.82, status: "healthy", area: 1.5 },
  { id: 2, label: "South Field", ndvi: 0.55, status: "stressed", area: 1.2 },
  { id: 3, label: "East Plot", ndvi: 0.30, status: "poor", area: 0.8 },
  { id: 4, label: "West Plot", ndvi: 0.71, status: "healthy", area: 1.0 },
];

export const EXPERT_CONTACTS = [
  { name: "Dr. Rajesh Sharma", role: "Soil Expert", phone: "+91 98001 11001", available: true },
  { name: "Krishi Kendra", role: "Local Center", phone: "1800-180-1551", available: true },
  { name: "ICAR Helpline", role: "National", phone: "011-25842987", available: true },
];

export const CROP_TIMELINE = {
  crop: "Wheat",
  currentHealth: 62,
  events: [
    { day: "Day 1 — Mar 25", type: "healthy",   title: "Crop Healthy",            desc: "Normal growth. Chlorophyll levels normal. No issues detected.",                               risk: null,       predicted: false },
    { day: "Day 3 — Mar 27", type: "warning",   title: "Leaf Discoloration",      desc: "Early yellowing on lower leaves. Possible nitrogen deficiency beginning.",                   risk: "Risk: 30%", predicted: false },
    { day: "Day 5 — Mar 29", type: "critical",  title: "Risk Increased to 60%",   desc: "Discoloration spread to 30% of leaves. Aphid colony detected. Immediate action needed.",    risk: "Risk: 60%", predicted: false },
    { day: "Day 7 — Apr 1",  type: "critical",  title: "Spray Now (Predicted)",   desc: "AI predicts full leaf infection within 48h if untreated. Spray neem oil + fungicide now.", risk: "Risk: 85%", predicted: true  },
    { day: "Day 10 — Apr 4", type: "healthy",   title: "Recovery Expected",        desc: "With treatment applied, crop should recover to 80%+ health. Normal yield expected.",       risk: "Risk: 20%", predicted: true  },
  ],
};

export const PROFIT_LEAKS = [
  { icon: "📦", title: "Late Selling",            cause: "Sold wheat 12 days after peak mandi price", loss: 12000, fix: "Set price alerts — sell within 3 days of peak. Enable Mandi Alert in Market tab." },
  { icon: "💧", title: "Overwatering",             cause: "West field irrigated 2x more than required", loss: 3200,  fix: "Check soil moisture before irrigating. West field only needs water every 4 days." },
  { icon: "🧪", title: "Wrong Fertilizer Timing", cause: "Urea applied before rain — 40% wasted",      loss: 2800,  fix: "Apply urea 2 days after rain for best absorption. Check forecast first." },
  { icon: "🚜", title: "Fuel Waste",               cause: "Unoptimised tractor routes across fields",   loss: 1500,  fix: "Plan a single field visit route. Saves approx ₹125/week in diesel costs." },
];

export const HABIT_STREAK = {
  currentStreak: 5,
  longestStreak: 12,
  weekDays: ["M","T","W","T","F","S","S"],
  completed: [true, true, true, true, true, false, false],
  todayDone: false,
  points: 340,
  level: "Bronze Farmer",
};

export const WEATHER_ACTIONS = [
  { icon: "🌧", bg: "rgba(21,101,192,0.08)",  border: "rgba(21,101,192,0.25)",  color: "#1565C0", alert: "Heavy rain in 6 hours",     action: "→ Delay pesticide spray until tomorrow morning" },
  { icon: "☀️", bg: "rgba(245,127,23,0.08)",  border: "rgba(245,127,23,0.25)",  color: "#F57F17", alert: "UV Index 8 today (High)",   action: "→ Irrigate before 8 AM or after 5 PM" },
  { icon: "🌬", bg: "rgba(46,125,50,0.08)",   border: "rgba(46,125,50,0.25)",   color: "#2E7D32", alert: "Wind 18 km/h at 2 PM",       action: "→ Avoid foliar spray between 12–4 PM today" },
];
