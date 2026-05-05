(function () {
  "use strict";

  const CONFIG = {
    businessName: "RE IMAGE Business Solutions",
    shortName: "RE IMAGE",
    phone: "8607185928",
    phoneDisplay: "(860) 718-5928",
    email: "reimagebs@gmail.com",
    clientPortalUrl: "https://login.reimagebs.com",
    startUrl: "start-with-us.html",
    servicesUrl: "index.html#services",
    careersUrl: "careers.html",
    logo: "logo.png",

    SUPABASE_URL: "https://uybcjtigyujoyrunecto.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5YmNqdGlneXVqb3lydW5lY3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MTczOTAsImV4cCI6MjA5MjI5MzM5MH0.UTDL7poTPwzVWSjNg28tPJeaHzU_Xbqe6c08Y7tl5Fk",
    tableName: "start_requests",
    source: "AI Website Receptionist"
  };

  const SERVICES = {
    website: {
      label: "Website Development",
      price:
        "Website pricing depends on scope, pages, content, and features. The best next step is to send your project details so RE IMAGE can quote it properly.",
      summary:
        "Website Development is best when your business needs a professional online presence, clear service pages, mobile design, SEO basics, forms, booking links, payment links, and stronger calls to action."
    },
    social: {
      label: "Social Media Management",
      price:
        "Social Media pricing: 1 professional reel is $149, 3 professional reels are $399, and account management using owner-made content is $99/week.",
      summary:
        "Social Media Management is best when you need better content, stronger Instagram/Facebook presence, reels, captions, posting support, and more trust with customers."
    },
    webbot: {
      label: "AI Web Receptionist Chatbot",
      price: "AI Web Receptionist Chatbot pricing is $69.99/month.",
      summary:
        "The AI Web Receptionist Chatbot helps answer website questions, guide customers, collect leads, explain services, and send service requests."
    },
    phone: {
      label: "AI Receptionist Phone",
      price: "AI Receptionist Phone pricing is $99/month.",
      summary:
        "The AI Phone Receptionist helps answer calls, handle common questions, collect customer details, and reduce missed opportunities."
    },
    automation: {
      label: "AI Automation",
      price: "AI Automation pricing is $249/week.",
      summary:
        "AI Automation is best when you want to clean up intake, follow-up, admin work, forms, messages, payment flows, reminders, or repetitive business tasks."
    },
    growth: {
      label: "Growth Foundation",
      price:
        "Growth Foundation is consultation-based because it depends on what your business already has and what needs to be built first.",
      summary:
        "Growth Foundation is best for businesses that need the basics cleaned up: website direction, messaging, service structure, lead flow, local visibility, and online presence."
    },
    full: {
      label: "Full Scale System",
      price:
        "Full Scale System is custom-priced because it depends on the website, portal, automation, intake, payments, and admin features needed.",
      summary:
        "Full Scale System is best when you need a full business setup: website, client flow, admin system, automation, forms, payments, and operations support."
    },
    funding: {
      label: "Business Funding",
      price:
        "Business funding options depend on the business, revenue, credit profile, time in business, and funding amount needed. RE IMAGE can help review the situation and guide you toward the right funding path.",
      summary:
        "Business Funding is for owners who need access to capital for growth, equipment, marketing, inventory, payroll, expansion, or operations. RE IMAGE can help collect the right details and guide the next step."
    }
  };

  const INDUSTRIES = {
    restaurant: ["restaurant", "food", "cafe", "pizza", "bar", "bakery", "catering", "kitchen", "food truck", "deli"],
    beauty: ["spa", "beauty", "skin", "salon", "lashes", "brows", "barber", "hair", "nails", "esthetician", "makeup", "med spa"],
    auto: ["auto", "body shop", "autobody", "mechanic", "collision", "detailing", "car repair", "repair shop", "paint shop", "towing"],
    rental: ["rental", "car rental", "rent cars", "fleet", "vehicles", "equipment rental"],
    contractor: ["contractor", "cleaning", "landscaping", "plumbing", "hvac", "roofing", "construction", "electrician", "handyman"],
    medical: ["clinic", "doctor", "dentist", "therapy", "health", "chiropractor", "wellness"],
    retail: ["retail", "store", "boutique", "clothing", "ecommerce", "e-commerce", "shop", "products"],
    professional: ["consulting", "consultant", "accounting", "law", "lawyer", "real estate", "agency", "insurance"]
  };

  const INTENTS = {
    greeting: ["hi", "hello", "hey", "yo", "good morning", "good afternoon", "good evening"],
    howAreYou: ["how are you", "how you doing", "how's it going", "whats up", "what's up"],
    contactPhone: ["phone", "phone number", "call", "number", "telephone", "contact number"],
    contactEmail: ["email", "e-mail", "mail"],
    portal: ["portal", "client portal", "login", "log in", "sign in", "account", "dashboard", "message", "service request"],
    pricing: ["price", "pricing", "cost", "how much", "monthly", "per month", "week", "quote", "estimate"],
    website: ["website", "site", "webpage", "landing page", "seo", "google", "domain", "redesign", "online presence"],
    social: ["social", "instagram", "facebook", "tiktok", "reel", "reels", "content", "caption", "posting"],
    phone: ["phone receptionist", "ai phone", "answer calls", "missed calls", "call answering", "virtual receptionist"],
    webbot: ["chatbot", "web receptionist", "website receptionist", "ai chatbot", "chat bot", "website chat"],
    automation: ["automation", "automate", "workflow", "intake", "forms", "follow up", "crm", "admin", "supabase", "stripe"],
    growth: ["growth foundation", "foundation", "starting", "start my business", "new business"],
    full: ["full scale", "full system", "complete system", "everything", "whole setup"],
    funding: [
      "funding", "business funding", "loan", "capital", "cash advance", "working capital",
      "business loan", "money for my business", "need money", "financing", "fund my business"
    ],
    choose: ["what do i need", "help me choose", "recommend", "best option", "not sure", "which service"],
    start: ["start", "get started", "book", "schedule", "consultation", "send request", "start project"],
    careers: ["job", "career", "hiring", "work for you", "apply"],
    thanks: ["thanks", "thank you", "appreciate it"],
    objectionPrice: [
      "too expensive", "cost too much", "cheaper", "can't afford", "can’t afford",
      "budget is low", "out of my budget", "pricey"
    ],
    objectionThink: [
      "need to think", "think about it", "not ready", "maybe later", "just looking",
      "just researching", "i'll get back", "ill get back"
    ],
    objectionExistingWebsite: [
      "already have a website", "i have a website", "my website already", "existing website", "current website"
    ],
    competitor: ["wix", "squarespace", "godaddy", "canva", "shopify", "wordpress", "fiverr", "upwork"],
    timeline: ["how long", "timeline", "how soon", "when will it be done", "turnaround", "how many days", "how many weeks"],
    payment: ["payment", "deposit", "invoice", "pay", "stripe", "square", "card"],
    bundle: ["bundle", "package", "combo", "what should i combine", "what goes together", "best package"],
    faq: ["revision", "revisions", "what happens next", "next step", "consultation", "free consultation", "do you offer", "what do you do"],
    stageNew: ["new business", "starting a business", "start up", "startup", "haven't launched", "not open yet", "from scratch"],
    stageExisting: ["existing business", "already open", "been in business", "current business", "improving my business", "we are open"],
    urgent: ["asap", "urgent", "today", "right now", "emergency", "immediately", "need this now"],
    profanity: ["fuck", "shit", "bitch", "asshole", "damn", "wtf", "fucking", "bullshit", "pissed"]
  };

  const state = {
    open: false,
    greeted: false,
    busy: false,
    step: null,
    supabase: null,
    memory: {
      businessType: "",
      industry: "",
      businessStage: "",
      problem: "",
      serviceInterest: "",
      lastIntent: "",
      lastRecommendedService: "",
      lastObjection: ""
    },
    lead: freshLead()
  };

  function freshLead() {
    return {
      name: "",
      email: "",
      phone: "",
      business: "",
      service: "",
      goal: "",
      budget: "",
      urgency: "",
      stage: "",
      objection: ""
    };
  }

  function clean(text) {
    return String(text || "").toLowerCase().trim();
  }

  function includesAny(text, list) {
    const t = clean(text);
    return list.some((word) => t.includes(clean(word)));
  }

  function scoreIntent(text) {
    const scores = {};
    const t = clean(text);

    Object.keys(INTENTS).forEach((intent) => {
      scores[intent] = 0;
      INTENTS[intent].forEach((word) => {
        if (t.includes(clean(word))) scores[intent] += word.length > 8 ? 3 : 2;
      });
    });

    if (state.memory.lastIntent && scores[state.memory.lastIntent] > 0) scores[state.memory.lastIntent] += 1;
    if (t.includes("price") || t.includes("cost") || t.includes("how much")) scores.pricing += 3;
    if (t.includes("loan") || t.includes("funding") || t.includes("capital")) scores.funding += 4;
    if (t.includes("portal") || t.includes("login")) scores.portal += 4;
    if (includesAny(t, INTENTS.profanity)) scores.profanity += 10;

    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const winner = ranked[0];
    if (!winner || winner[1] <= 0) return "unknown";
    return winner[0];
  }

  function detectIndustry(text) {
    const t = clean(text);

    for (const [industry, words] of Object.entries(INDUSTRIES)) {
      if (words.some((w) => t.includes(w))) return industry;
    }

    const patterns = ["i operate", "i run", "i own", "my business is", "we are a", "we do", "i have a"];
    if (patterns.some((p) => t.includes(p))) return "local service";
    return "";
  }

  function detectBusinessStage(text) {
    const t = clean(text);
    if (includesAny(t, INTENTS.stageNew)) return "New business / starting from scratch";
    if (includesAny(t, INTENTS.stageExisting)) return "Existing business / improving current setup";
    return "";
  }

  function updateMemory(text, intent) {
    const industry = detectIndustry(text);
    const stage = detectBusinessStage(text);

    if (industry) {
      state.memory.industry = industry;
      state.memory.businessType = text;
    }

    if (stage) {
      state.memory.businessStage = stage;
      state.lead.stage = stage;
    }

    const serviceMap = {
      website: "Website Development",
      social: "Social Media Management",
      phone: "AI Receptionist Phone",
      webbot: "AI Web Receptionist Chatbot",
      automation: "AI Automation",
      growth: "Growth Foundation",
      full: "Full Scale System",
      funding: "Business Funding"
    };

    if (serviceMap[intent]) state.memory.serviceInterest = serviceMap[intent];

    if (["website", "social", "phone", "webbot", "automation", "growth", "full", "funding", "choose", "bundle"].includes(intent)) {
      state.memory.problem = text;
    }

    if (["objectionPrice", "objectionThink", "objectionExistingWebsite"].includes(intent)) {
      state.memory.lastObjection = intent;
      state.lead.objection = intent;
    }

    state.memory.lastIntent = intent;
  }

  function serviceKeyFromText(text) {
    const t = clean(text);

    if (includesAny(t, INTENTS.phone)) return "phone";
    if (includesAny(t, INTENTS.webbot)) return "webbot";
    if (includesAny(t, INTENTS.funding)) return "funding";
    if (includesAny(t, INTENTS.website)) return "website";
    if (includesAny(t, INTENTS.social)) return "social";
    if (includesAny(t, INTENTS.automation)) return "automation";
    if (includesAny(t, INTENTS.growth)) return "growth";
    if (includesAny(t, INTENTS.full)) return "full";

    if (state.memory.serviceInterest) {
      const label = clean(state.memory.serviceInterest);
      if (label.includes("phone")) return "phone";
      if (label.includes("web receptionist") || label.includes("chatbot")) return "webbot";
      if (label.includes("website")) return "website";
      if (label.includes("social")) return "social";
      if (label.includes("automation")) return "automation";
      if (label.includes("growth")) return "growth";
      if (label.includes("full")) return "full";
      if (label.includes("funding") || label.includes("loan") || label.includes("capital")) return "funding";
    }

    return "";
  }

  function pricingReply(text) {
    const key = serviceKeyFromText(text);

    if (!key) {
      return [
        "Which service do you want pricing for?",
        "",
        "I can give pricing for:",
        "• AI Web Receptionist Chatbot",
        "• AI Receptionist Phone",
        "• AI Automation",
        "• Social Media Management",
        "• Website Development",
        "• Business Funding",
        "• Growth Foundation",
        "• Full Scale System"
      ].join("\n");
    }

    return SERVICES[key].price;
  }

  function recommendService() {
    const industry = state.memory.industry;
    const stage = state.memory.businessStage;
    const problem = clean([state.memory.problem, state.memory.businessType, stage].join(" "));

    let key = "";

    if (problem.includes("funding") || problem.includes("loan") || problem.includes("capital") || problem.includes("financing") || problem.includes("money")) key = "funding";
    else if (problem.includes("call") || problem.includes("phone") || problem.includes("missed")) key = "phone";
    else if (problem.includes("chat") || problem.includes("website questions")) key = "webbot";
    else if (problem.includes("instagram") || problem.includes("content") || problem.includes("reel")) key = "social";
    else if (problem.includes("google") || problem.includes("website") || problem.includes("site")) key = "website";
    else if (problem.includes("automate") || problem.includes("follow") || problem.includes("forms") || problem.includes("intake")) key = "automation";
    else if (problem.includes("everything") || problem.includes("system") || problem.includes("full")) key = "full";

    if (!key) {
      if (stage === "New business / starting from scratch") key = "growth";
      else if (["restaurant", "beauty", "auto", "rental", "contractor", "medical", "retail", "professional"].includes(industry)) key = "website";
      else key = "growth";
    }

    state.memory.lastRecommendedService = SERVICES[key].label;
    return key;
  }

  function recommendationReply() {
    const key = recommendService();
    const service = SERVICES[key];

    const industryLine = state.memory.industry
      ? `Since you operate a ${state.memory.industry} business, `
      : "Based on what you said, ";

    return [
      `${industryLine}I would start with ${service.label}.`,
      "",
      service.summary,
      "",
      bundleReply(),
      "",
      "After that, RE IMAGE can decide if you also need social media, AI receptionist support, automation, business funding, or a full system build."
    ].join("\n");
  }

  function portalReply() {
    return [
      `The RE IMAGE client portal is here: ${CONFIG.clientPortalUrl}`,
      "",
      "Clients can sign in, send service requests, message RE IMAGE, and keep communication organized.",
      "",
      "If you do not have access yet, start with the project request and RE IMAGE can help get your account set up."
    ].join("\n");
  }

  function phoneReply() {
    return `You can call RE IMAGE at ${CONFIG.phoneDisplay}.`;
  }

  function emailReply() {
    return `You can email RE IMAGE at ${CONFIG.email}.`;
  }

  function serviceReply(intent) {
    const map = {
      website: "website",
      social: "social",
      phone: "phone",
      webbot: "webbot",
      automation: "automation",
      growth: "growth",
      full: "full",
      funding: "funding"
    };

    const key = map[intent];
    const service = SERVICES[key];
    if (!service) return fallbackReply();

    return [
      `${service.label}`,
      "",
      service.summary,
      "",
      "Would you like pricing for this service, or do you want to start a request?"
    ].join("\n");
  }

  function businessTypeReply() {
    const key = recommendService();
    const service = SERVICES[key];

    return [
      "Got it — that helps.",
      "",
      `For that type of business, I would usually look at ${service.label} first.`,
      "",
      service.summary,
      "",
      bundleReply(),
      "",
      "What are you trying to improve most right now: more leads, better website, more bookings, social media, missed calls, automation, or funding?"
    ].join("\n");
  }

  function objectionReply(intent) {
    if (intent === "objectionPrice") {
      return [
        "I understand. The goal is not to sell you something you do not need.",
        "",
        "RE IMAGE can help figure out the most important first step, whether that is a simple website improvement, social media support, automation, funding guidance, or a larger system later.",
        "",
        "If budget is tight, the best move is to start with the service that creates the fastest return."
      ].join("\n");
    }

    if (intent === "objectionThink") {
      return [
        "That makes sense. A good next step is to send the basic details now so RE IMAGE can understand what you are considering.",
        "",
        "No pressure — it just gives you a clearer starting point when you are ready."
      ].join("\n");
    }

    if (intent === "objectionExistingWebsite") {
      return [
        "That actually helps. If you already have a website, RE IMAGE can look at whether it is doing its job:",
        "",
        "• Is it bringing leads?",
        "• Is it mobile friendly?",
        "• Is it clear what services you offer?",
        "• Does it connect to forms, booking, payments, or the client portal?",
        "",
        "Sometimes you do not need a brand-new site. You may just need a smarter lead flow."
      ].join("\n");
    }

    return fallbackReply();
  }

  function competitorReply() {
    return [
      "Tools like Wix, Squarespace, GoDaddy, Canva, Shopify, and WordPress can be fine for basic websites.",
      "",
      "Where RE IMAGE is different is when the business needs more than a pretty page — things like lead forms, client portals, AI receptionist tools, automation, payments, service requests, and admin workflows.",
      "",
      "If you only need something simple, a builder may work. If you need the website to support operations, RE IMAGE is usually the better fit."
    ].join("\n");
  }

  function timelineReply() {
    return [
      "Timeline depends on the service and how much content is ready.",
      "",
      "A smaller update or simple setup can move faster. A full website, portal, automation, funding package, or complete business system takes more planning.",
      "",
      `If this is urgent, call RE IMAGE directly at ${CONFIG.phoneDisplay}.`
    ].join("\n");
  }

  function paymentReply() {
    return [
      "RE IMAGE can handle payments, invoices, deposits, and checkout flows depending on the project.",
      "",
      "For client projects, payment details are usually handled through a secure payment processor like Stripe or Square, not through the chat.",
      "",
      "If you need payment setup for your own business, RE IMAGE can also help build that into your website or portal."
    ].join("\n");
  }

  function bundleReply() {
    const industry = state.memory.industry;

    if (industry === "beauty") return "Recommended bundle: Website + Booking Flow + Social Media Content + Gift Card Promotion + AI Web Receptionist.";
    if (industry === "auto") return "Recommended bundle: Website + Estimate Request Form + Before/After Gallery + Local SEO + Missed Call Support.";
    if (industry === "rental") return "Recommended bundle: Website + Booking Flow + Payments/Deposits + Client Portal + Admin Dashboard.";
    if (industry === "restaurant") return "Recommended bundle: Website + Menu/Ordering Flow + Local SEO + Social Media Content.";
    if (industry === "contractor") return "Recommended bundle: Website + Quote Request Form + Local SEO + Follow-Up Automation.";
    if (industry === "retail") return "Recommended bundle: Website/E-commerce + Social Content + Payment Setup + Customer Follow-Up.";

    return "Recommended general bundle: Website + SEO Basics + AI Web Receptionist + Lead Form + Client Portal.";
  }

  function businessFundingReply() {
    return [
      "Yes — RE IMAGE can help with business funding guidance.",
      "",
      "Business funding may help with growth, equipment, marketing, inventory, payroll, expansion, or operating cash flow.",
      "",
      "The right option depends on business revenue, time in business, credit profile, funding amount needed, and how quickly you need it.",
      "",
      "Would you like to send a funding request so RE IMAGE can review the details?"
    ].join("\n");
  }

  function faqReply() {
    return [
      "Here are the basics:",
      "",
      "• Next step: send a request so RE IMAGE can review your business and goal.",
      "• Consultation: RE IMAGE can use the request details to guide the next conversation.",
      "• Revisions: depend on the service and project scope.",
      "• Payments: handled securely through proper payment tools, not inside chat.",
      "• Portal: clients can sign in, send service requests, and message RE IMAGE."
    ].join("\n");
  }

  function businessStageReply() {
    if (state.memory.businessStage === "New business / starting from scratch") {
      return [
        "Since this is a new business, RE IMAGE should focus on foundation first:",
        "",
        "• clear service offer",
        "• professional website or landing page",
        "• lead form or booking flow",
        "• basic SEO/local visibility",
        "• social proof and content plan",
        "",
        "That usually points toward Growth Foundation or Website Development first."
      ].join("\n");
    }

    return [
      "Since this is an existing business, RE IMAGE should look at what is already working and what is leaking leads:",
      "",
      "• website clarity",
      "• calls and missed messages",
      "• booking/request flow",
      "• social media consistency",
      "• payment or admin bottlenecks",
      "",
      "That usually points toward Website Development, AI Receptionist, Automation, or a Full Scale System."
    ].join("\n");
  }

  function urgentReply() {
    return [
      "If this is urgent, the fastest move is to call RE IMAGE directly.",
      "",
      `Phone: ${CONFIG.phoneDisplay}`,
      `Email: ${CONFIG.email}`,
      "",
      "You can still send a request here so the details are organized."
    ].join("\n");
  }

  function profanityReply() {
    return [
      "I understand this might be frustrating. I can still help.",
      "",
      "Are you trying to ask about pricing, services, the client portal, business funding, or starting a request?"
    ].join("\n");
  }

  function calculateLeadScore() {
    let score = 0;
    const text = [
      state.lead.goal,
      state.lead.budget,
      state.lead.urgency,
      state.lead.stage,
      state.lead.objection,
      state.memory.problem,
      state.memory.serviceInterest
    ].join(" ").toLowerCase();

    if (state.lead.email) score += 15;
    if (state.lead.phone) score += 20;
    if (state.lead.business) score += 10;
    if (state.lead.service) score += 15;
    if (state.memory.industry) score += 5;
    if (state.lead.stage) score += 5;

    if (text.includes("asap") || text.includes("today") || text.includes("urgent") || text.includes("this week")) score += 25;
    if (text.includes("pricing") || text.includes("price") || text.includes("cost")) score += 10;
    if (text.includes("$750") || text.includes("750+")) score += 15;
    if (text.includes("just researching") || text.includes("maybe later") || text.includes("not ready")) score -= 15;
    if (text.includes("too expensive") || text.includes("can't afford") || text.includes("out of my budget")) score -= 10;

    if (score >= 70) return "Hot";
    if (score >= 40) return "Warm";
    return "Cold";
  }

  function adminNextStep() {
    const quality = calculateLeadScore();
    const service = state.lead.service || state.memory.lastRecommendedService || state.memory.serviceInterest || "General";

    if (quality === "Hot") return `Call quickly. Lead is hot and interested in ${service}.`;
    if (quality === "Warm") return `Follow up with a helpful message and clarify scope for ${service}.`;
    return `Nurture lead. Ask what problem they want solved first and offer a simple next step.`;
  }

  function fallbackReply() {
    return [
      "I can help with websites, social media, AI receptionists, AI automation, business funding, pricing, the client portal, or starting a project.",
      "",
      "Are you asking about pricing, services, the client portal, funding, or starting a request?"
    ].join("\n");
  }

  function bot(text, chips) {
    addMessage("bot", text);
    if (chips && chips.length) addChips(chips);
  }

  function user(text) {
    addMessage("user", text);
  }

  function addMessage(type, text) {
    const body = document.querySelector(".reibot-body");
    if (!body) return;

    const row = document.createElement("div");
    row.className = `reibot-msg reibot-${type}`;

    const bubble = document.createElement("div");
    bubble.className = "reibot-bubble";
    bubble.textContent = text;

    if (type === "bot") {
      const avatar = document.createElement("div");
      avatar.className = "reibot-avatar";
      avatar.textContent = "RI";
      row.appendChild(avatar);
      row.appendChild(bubble);
    } else {
      row.appendChild(bubble);
    }

    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  }

  function addChips(chips) {
    const body = document.querySelector(".reibot-body");
    if (!body) return;

    const wrap = document.createElement("div");
    wrap.className = "reibot-chips";

    chips.forEach((label) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = label;
      btn.addEventListener("click", () => handleInput(label));
      wrap.appendChild(btn);
    });

    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
  }

  function serviceChips() {
    return [
      "Website Development",
      "Social Media Management",
      "AI Web Receptionist Chatbot",
      "AI Receptionist Phone",
      "AI Automation",
      "Business Funding",
      "Not sure"
    ];
  }

  function mainChips() {
    return ["Help me choose", "Pricing", "Business Funding", "Client portal", "Start a project"];
  }

  function startLead(service) {
    state.lead = freshLead();
    if (service) state.lead.service = service;
    else if (state.memory.lastRecommendedService) state.lead.service = state.memory.lastRecommendedService;
    else if (state.memory.serviceInterest) state.lead.service = state.memory.serviceInterest;

    if (state.memory.businessStage) state.lead.stage = state.memory.businessStage;
    if (state.memory.lastObjection) state.lead.objection = state.memory.lastObjection;

    state.step = "name";
    bot("Absolutely. I’ll collect the important details so RE IMAGE can follow up properly. What’s your full name?");
  }

  function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
  }

  function validatePhone(v) {
    return String(v || "").replace(/\D/g, "").length >= 10;
  }

  async function ensureSupabase() {
    if (state.supabase) return state.supabase;

    if (!window.supabase) {
      await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    state.supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    return state.supabase;
  }

  function splitName(fullName) {
    const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
    return {
      first: parts[0] || "Website",
      last: parts.slice(1).join(" ") || "Lead"
    };
  }

  function buildLeadMessage() {
    const l = state.lead;

    return [
      "AI Receptionist Lead",
      `Business: ${l.business || "—"}`,
      `Business stage: ${l.stage || state.memory.businessStage || "—"}`,
      `Interested service: ${l.service || "—"}`,
      `Bot recommendation: ${state.memory.lastRecommendedService || "—"}`,
      `Goal / problem: ${l.goal || "—"}`,
      `Budget: ${l.budget || "—"}`,
      `Timeline: ${l.urgency || "—"}`,
      `Detected industry: ${state.memory.industry || "—"}`,
      `Lead quality: ${calculateLeadScore()}`,
      `Objection / hesitation: ${l.objection || state.memory.lastObjection || "—"}`,
      `Recommended admin next step: ${adminNextStep()}`,
      `Source: ${CONFIG.source}`
    ].join("\n");
  }

  async function saveLead() {
    const supabase = await ensureSupabase();
    const name = splitName(state.lead.name);

    const payload = {
      submission_type: CONFIG.source,
      first_name: name.first,
      last_name: name.last,
      email: state.lead.email,
      phone: state.lead.phone,
      business_name: state.lead.business,
      service_choice: state.lead.service || "General Question",
      message: buildLeadMessage(),
      status: "new"
    };

    const { error } = await supabase.from(CONFIG.tableName).insert([payload]);
    if (error) throw error;
  }

  async function finishLead() {
    const l = state.lead;

    bot(
      [
        "Here’s what I’m going to send over:",
        "",
        `Name: ${l.name}`,
        `Email: ${l.email}`,
        `Phone: ${l.phone}`,
        `Business: ${l.business}`,
        `Business stage: ${l.stage || state.memory.businessStage || "Not sure"}`,
        `Service: ${l.service}`,
        `Goal: ${l.goal}`,
        `Budget: ${l.budget || "Not sure"}`,
        `Timeline: ${l.urgency || "Not sure"}`,
        `Lead quality: ${calculateLeadScore()}`
      ].join("\n"),
      ["Confirm", "Change service", "Open form"]
    );

    state.step = "confirm";
  }

  async function handleLeadStep(text) {
    const value = String(text || "").trim();

    if (state.step === "name") {
      if (value.length < 2) return bot("I need your name before I can send the request.");
      state.lead.name = value;
      state.step = "email";
      return bot("Thanks. What email should RE IMAGE use to contact you?");
    }

    if (state.step === "email") {
      if (!validateEmail(value)) return bot("Please enter a valid email address.");
      state.lead.email = value;
      state.step = "phone";
      return bot("What phone number should RE IMAGE use?");
    }

    if (state.step === "phone") {
      if (!validatePhone(value)) return bot("Please enter a valid phone number with area code.");
      state.lead.phone = value;
      state.step = "business";
      return bot("What’s the business name? If you do not have one yet, you can say “not yet.”");
    }

    if (state.step === "business") {
      state.lead.business = value;
      state.memory.businessType = value;
      state.step = "stage";
      return bot("Is this a new business or an existing business?", ["New business", "Existing business"]);
    }

    if (state.step === "stage") {
      const stage = detectBusinessStage(value) || (clean(value).includes("new") ? "New business / starting from scratch" : "Existing business / improving current setup");
      state.lead.stage = stage;
      state.memory.businessStage = stage;
      state.step = "service";
      return bot("Which service are you most interested in?", serviceChips());
    }

    if (state.step === "service") {
      const key = serviceKeyFromText(value);
      state.lead.service = key ? SERVICES[key].label : value;
      state.memory.serviceInterest = state.lead.service;
      state.step = "goal";
      return bot(
        "What are you trying to accomplish? Example: get more leads, rebuild your website, add an AI receptionist, manage social media, automate intake, get business funding, or clean up operations."
      );
    }

    if (state.step === "goal") {
      state.lead.goal = value;
      state.memory.problem = value;
      state.step = "budget";
      return bot("Do you have a target budget, or are you not sure yet?", ["Not sure", "$100-$300", "$300-$750", "$750+"]);
    }

    if (state.step === "budget") {
      state.lead.budget = value;
      state.step = "urgency";
      return bot("When are you hoping to start?", ["ASAP", "This week", "This month", "Just researching"]);
    }

    if (state.step === "urgency") {
      state.lead.urgency = value;
      return finishLead();
    }

    if (state.step === "confirm") {
      if (/confirm|yes|send|submit|ok/i.test(value)) {
        try {
          state.busy = true;
          await saveLead();
          state.busy = false;
          state.step = null;

          return bot(
            "Perfect — I sent your request to RE IMAGE. Someone can review it and follow up with the next step.",
            ["Client portal", "New project", "Phone number", "Email"]
          );
        } catch (e) {
          console.error("RE IMAGE receptionist lead failed", e);
          state.busy = false;

          return bot(
            "I had trouble sending that request from the widget. Please use the Start With Us form and your details will still go through.",
            ["Open form", "Phone number", "Email"]
          );
        }
      }

      if (/change|service/i.test(value)) {
        state.step = "service";
        return bot("No problem. Which service should I change it to?", serviceChips());
      }

      if (/open form|form/i.test(value)) {
        window.location.href = CONFIG.startUrl;
        return;
      }

      return bot("Type Confirm to send it, Change service to edit it, or Open form to use the full form.");
    }
  }

  function routeChip(label) {
    const t = clean(label);

    if (t.includes("open form")) {
      window.location.href = CONFIG.startUrl;
      return true;
    }

    if (t.includes("open careers")) {
      window.location.href = CONFIG.careersUrl;
      return true;
    }

    if (t.includes("client portal")) {
      bot(portalReply(), ["Start a project", "Phone number", "Email"]);
      return true;
    }

    if (t.includes("phone number")) {
      bot(phoneReply(), ["Start a project", "Client portal"]);
      return true;
    }

    if (t === "email") {
      bot(emailReply(), ["Start a project", "Client portal"]);
      return true;
    }

    if (t.includes("new project") || t.includes("start a project") || t.includes("get started")) {
      startLead();
      return true;
    }

    if (t.includes("business funding")) {
      state.memory.serviceInterest = SERVICES.funding.label;
      bot(businessFundingReply(), ["Start a project", "Pricing", "Phone number"]);
      return true;
    }

    if (t.includes("pricing")) {
      bot(pricingReply(label), serviceChips());
      return true;
    }

    if (t.includes("services")) {
      bot(fallbackReply(), mainChips());
      return true;
    }

    return false;
  }

  function handleInput(raw) {
    const text = String(raw || "").trim();
    if (!text || state.busy) return;

    user(text);

    const input = document.querySelector(".reibot-input");
    if (input) input.value = "";

    if (routeChip(text)) return;
    if (state.step) return handleLeadStep(text);

    const intent = scoreIntent(text);
    updateMemory(text, intent);

    if (intent === "profanity") {
      return bot(profanityReply(), ["Pricing", "Services", "Client portal", "Business Funding", "Start a project"]);
    }

    if (intent === "urgent") {
      return bot(urgentReply(), ["Start a project", "Phone number", "Email"]);
    }

    if (detectIndustry(text)) {
      return bot(businessTypeReply(), ["More leads", "Better website", "Social media", "AI receptionist", "Automation", "Business Funding"]);
    }

    if (detectBusinessStage(text)) {
      return bot(businessStageReply(), ["Help me choose", "Pricing", "Start a project"]);
    }

    switch (intent) {
      case "greeting":
        return bot(
          "Hey — welcome to RE IMAGE Business Solutions. I can help with websites, social media, AI receptionists, automation, business funding, pricing, or the client portal. What are you trying to build or improve?",
          mainChips()
        );

      case "howAreYou":
        return bot(
          "I’m doing great — ready to help turn visitors into real leads. What kind of business are we working on?",
          ["Website", "Social Media", "AI receptionist", "Business Funding", "Start a project"]
        );

      case "thanks":
        return bot("You’re welcome. Do you want to start a request or ask about another service?", ["Start a project", "Pricing", "Client portal"]);

      case "contactPhone":
        return bot(phoneReply(), ["Start a project", "Email", "Client portal"]);

      case "contactEmail":
        return bot(emailReply(), ["Start a project", "Phone number", "Client portal"]);

      case "portal":
        return bot(portalReply(), ["Start a project", "Phone number", "Email"]);

      case "pricing":
        return bot(pricingReply(text), ["Start a project", "Help me choose"]);

      case "website":
      case "social":
      case "phone":
      case "webbot":
      case "automation":
      case "growth":
      case "full":
      case "funding":
        return bot(serviceReply(intent), ["Pricing", "Start a project", "Help me choose"]);

      case "choose":
        return bot(recommendationReply(), ["Pricing", "Start a project", "Client portal"]);

      case "objectionPrice":
      case "objectionThink":
      case "objectionExistingWebsite":
        return bot(objectionReply(intent), ["Help me choose", "Start a project", "Pricing"]);

      case "competitor":
        return bot(competitorReply(), ["Help me choose", "Start a project"]);

      case "timeline":
        return bot(timelineReply(), ["Start a project", "Phone number"]);

      case "payment":
        return bot(paymentReply(), ["Start a project", "Client portal"]);

      case "bundle":
        return bot(bundleReply(), ["Start a project", "Pricing"]);

      case "faq":
        return bot(faqReply(), ["Start a project", "Client portal", "Phone number"]);

      case "stageNew":
      case "stageExisting":
        return bot(businessStageReply(), ["Help me choose", "Start a project"]);

      case "start":
        return startLead();

      case "careers":
        return bot("For job opportunities, use the Careers page. I can open it for you.", ["Open careers", "Start a project"]);

      default:
        return bot(fallbackReply(), mainChips());
    }
  }

  function buildWidget() {
    const style = document.createElement("style");

    style.textContent = `
      .reibot-launch{position:fixed;right:22px;bottom:22px;z-index:5000;width:66px;height:66px;border:0;border-radius:50%;cursor:pointer;background:linear-gradient(135deg,#1a7a8a,#0d5a68);color:#fff;box-shadow:0 18px 46px rgba(0,0,0,.42),0 0 0 7px rgba(43,163,184,.13);font-family:Barlow,Arial,sans-serif;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1px;transition:transform .22s ease,box-shadow .22s ease}
      .reibot-launch:hover{transform:translateY(-3px) scale(1.03);box-shadow:0 22px 58px rgba(0,0,0,.48),0 0 0 9px rgba(43,163,184,.17)}
      .reibot-launch b{font-family:'Barlow Condensed',Barlow,Arial,sans-serif;font-size:21px;letter-spacing:.04em;line-height:1}
      .reibot-launch span{font-size:9px;font-weight:900;letter-spacing:.09em;text-transform:uppercase}

      .reibot-panel{position:fixed;right:22px;bottom:100px;z-index:5000;width:min(410px,calc(100vw - 28px));height:590px;max-height:calc(100vh - 125px);display:none;flex-direction:column;overflow:hidden;border-radius:24px;background:#071823;border:1px solid rgba(43,163,184,.34);box-shadow:0 28px 90px rgba(0,0,0,.58)}
      .reibot-panel.open{display:flex}

      .reibot-head{position:relative;padding:16px 16px 14px;background:radial-gradient(circle at 15% 0,rgba(43,163,184,.28),transparent 38%),linear-gradient(135deg,#0c1f2e,#102c3e);border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:space-between}
      .reibot-brand{display:flex;gap:11px;align-items:center}
      .reibot-logo{width:38px;height:38px;border-radius:12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;overflow:hidden}
      .reibot-logo img{width:100%;height:100%;object-fit:contain}
      .reibot-title{font-family:'Barlow Condensed',Barlow,Arial,sans-serif;text-transform:uppercase;letter-spacing:.08em;font-size:16px;color:#fff;font-weight:900}
      .reibot-sub{font-size:12px;color:#a8c7d3;margin-top:2px}
      .reibot-x{border:0;background:rgba(255,255,255,.08);color:#fff;width:34px;height:34px;border-radius:10px;cursor:pointer;font-size:18px}

      .reibot-body{flex:1;overflow:auto;padding:16px;background:radial-gradient(circle at 0 0,rgba(26,122,138,.12),transparent 36%),linear-gradient(180deg,#081724,#06131d)}
      .reibot-msg{display:flex;gap:9px;margin-bottom:12px}
      .reibot-user{justify-content:flex-end}
      .reibot-avatar{width:34px;height:34px;flex:0 0 34px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1a7a8a,#0d5a68);color:#fff;font-size:10px;font-weight:900;letter-spacing:.05em}
      .reibot-bubble{max-width:84%;white-space:pre-wrap;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.09);color:#eaf6fa;border-radius:17px 17px 17px 4px;padding:11px 12px;font-size:14px;line-height:1.48}
      .reibot-user .reibot-bubble{border-radius:17px 17px 4px 17px;background:linear-gradient(135deg,#1a7a8a,#0d5a68);border-color:rgba(43,163,184,.35);color:#fff}

      .reibot-chips{display:flex;gap:8px;flex-wrap:wrap;margin:2px 0 14px 43px}
      .reibot-chips button{border:1px solid rgba(43,163,184,.28);background:rgba(43,163,184,.10);color:#dff6fb;border-radius:999px;padding:9px 11px;font-size:12px;font-weight:900;cursor:pointer;text-transform:none;transition:.2s}
      .reibot-chips button:hover{background:rgba(43,163,184,.22);transform:translateY(-1px)}

      .reibot-foot{padding:12px;background:#071823;border-top:1px solid rgba(255,255,255,.08)}
      .reibot-form{display:flex;gap:8px}
      .reibot-input{flex:1;min-height:46px;border-radius:14px;border:1px solid rgba(43,163,184,.24);background:rgba(255,255,255,.06);color:#fff;padding:0 12px;outline:none;font-family:Barlow,Arial,sans-serif;font-size:14px}
      .reibot-input:focus{border-color:#2ba3b8;box-shadow:0 0 0 4px rgba(43,163,184,.12)}
      .reibot-send{width:50px;border:0;border-radius:14px;background:linear-gradient(135deg,#c8922a,#a0731e);color:#fff;font-weight:900;cursor:pointer}
      .reibot-mini{display:flex;justify-content:space-between;gap:10px;margin-top:9px;color:#7396a5;font-size:11px}
      .reibot-mini a{color:#e8ad40;text-decoration:none;font-weight:800}

      @media(max-width:520px){
        .reibot-launch{right:16px;bottom:16px;width:60px;height:60px}
        .reibot-panel{right:10px;left:10px;bottom:86px;width:auto;height:min(610px,calc(100vh - 105px));border-radius:20px}
        .reibot-bubble{max-width:88%;font-size:13.5px}
        .reibot-chips{margin-left:0}
        .reibot-chips button{font-size:12px;padding:8px 10px}
      }
    `;

    document.head.appendChild(style);

    const launch = document.createElement("button");
    launch.className = "reibot-launch";
    launch.type = "button";
    launch.setAttribute("aria-label", "Open RE IMAGE AI receptionist");
    launch.innerHTML = `<b>Chat</b><span>with us</span>`;

    const panel = document.createElement("section");
    panel.className = "reibot-panel";
    panel.setAttribute("aria-label", "RE IMAGE AI receptionist chat");

    panel.innerHTML = `
      <div class="reibot-head">
        <div class="reibot-brand">
          <div class="reibot-logo"><img src="${CONFIG.logo}" alt=""></div>
          <div>
            <div class="reibot-title">RE IMAGE Assistant</div>
            <div class="reibot-sub">Service guidance + lead intake</div>
          </div>
        </div>
        <button class="reibot-x" type="button" aria-label="Close">×</button>
      </div>

      <div class="reibot-body"></div>

      <div class="reibot-foot">
        <form class="reibot-form">
          <input class="reibot-input" type="text" autocomplete="off" placeholder="Ask about websites, funding, social media, AI receptionists...">
          <button class="reibot-send" type="submit">↗</button>
        </form>
        <div class="reibot-mini">
          <span>Replies instantly. Sends serious leads to RE IMAGE.</span>
          <a href="${CONFIG.startUrl}">Start With Us</a>
        </div>
      </div>
    `;

    document.body.appendChild(launch);
    document.body.appendChild(panel);

    const input = panel.querySelector(".reibot-input");
    const form = panel.querySelector(".reibot-form");
    const close = panel.querySelector(".reibot-x");

    function openPanel() {
      panel.classList.add("open");
      state.open = true;

      if (!state.greeted) {
        state.greeted = true;
        bot(
          "Hi — welcome to RE IMAGE Business Solutions. I can help you choose a service, explain pricing, talk about the client portal, business funding, or collect your project details. What are you trying to build or improve?",
          mainChips()
        );
      }

      setTimeout(() => input && input.focus(), 50);
    }

    function closePanel() {
      panel.classList.remove("open");
      state.open = false;
    }

    launch.addEventListener("click", () => (state.open ? closePanel() : openPanel()));
    close.addEventListener("click", closePanel);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handleInput(input.value);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildWidget);
  } else {
    buildWidget();
  }
})();