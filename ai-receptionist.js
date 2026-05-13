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
    AI_BACKEND_URL: window.REIMAGE_AI_BACKEND_URL || "http://127.0.0.1:8000/chat",
    AI_TIMEOUT_MS: 2500,

    SUPABASE_URL: "https://uybcjtigyujoyrunecto.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5YmNqdGlneXVqb3lydW5lY3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MTczOTAsImV4cCI6MjA5MjI5MzM5MH0.UTDL7poTPwzVWSjNg28tPJeaHzU_Xbqe6c08Y7tl5Fk",
    tableName: "start_requests",
    source: "AI Website Receptionist"
  };

  const SERVICES = {
    website: {
      label: "Website Development",
      price:
        "Website pricing: Static Website is $99 down + $29.99/month. Dynamic Website is $249.99 down + $49.99/month.",
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

  const AI_RECEPTIONIST_PLANS = {
    starter: {
      label: "Starter",
      price: "$99/month",
      replies: "2,000 AI replies/month",
      usageLimit: "20 replies per conversation",
      profileLimit: "1 business profile",
      websiteLimit: "1 website",
      includes: "Lead capture included",
      bestFor: "small businesses that want a website receptionist to answer questions, collect leads, and route serious customers."
    },
    growth: {
      label: "Growth",
      price: "$149/month",
      replies: "5,000 AI replies/month",
      usageLimit: "20 replies per conversation",
      profileLimit: "1 business profile",
      websiteLimit: "1 website",
      includes: "Lead capture included",
      bestFor: "businesses with higher website traffic or more frequent customer questions."
    },
    pro: {
      label: "Pro",
      price: "$249/month",
      replies: "10,000 AI replies/month",
      usageLimit: "20 replies per conversation",
      profileLimit: "1 business profile",
      websiteLimit: "1 website",
      includes: "Lead capture plus automation support",
      bestFor: "busy businesses that need higher message volume plus automation for intake, follow-up, routing, and lead handling."
    }
  };

  const WEBSITE_PLANS = {
    static: {
      label: "Static Website",
      downPayment: "$99 down",
      monthly: "$29.99/month",
      pages: "up to 5 polished pages",
      includes: "mobile-responsive design, contact form setup, hosting, and maintenance support",
      bestFor: "businesses that need a professional online presence fast and do not need frequent page or content changes."
    },
    dynamic: {
      label: "Dynamic Website",
      downPayment: "$249.99 down",
      monthly: "$49.99/month",
      pages: "expanded page structure",
      includes: "SEO optimization, analytics, CMS or dynamic sections, client portals, admin portals, Supabase integration, backend-connected forms, hosting, and maintenance support",
      bestFor: "businesses that update often, run campaigns, need stronger conversion structure, collect customer data, need portal access, or want backend-connected workflows."
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
    salesStage: "discovery",
    awaitingPricingChoice: false,
    backendAvailable: null,
    supabase: null,
    memory: {
      businessType: "",
      industry: "",
      currentIndustry: "",
      sector: "",
      businessStage: "",
      problem: "",
      currentProblem: "",
      painPoints: [],
      primaryPainPoint: "",
      timeInBusiness: "",
      conversationSummary: "",
      serviceInterest: "",
      serviceInterests: [],
      currentServices: [],
      qualification: {
        missedOpportunities: "",
        budget: "",
        timeline: "",
        decisionMaker: "",
        websiteType: "",
        websiteUpdates: ""
      },
      lastQuestionAsked: "",
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
      sector: "",
      revenue: "",
      employees: "",
      service: "",
      goal: "",
      painPoints: "",
      timeInBusiness: "",
      missedOpportunities: "",
      budget: "",
      urgency: "",
      decisionMaker: "",
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

  function setCurrentServices(keysOrLabels) {
    const labels = keysOrLabels
      .map((item) => SERVICES[item]?.label || item)
      .filter(Boolean);

    state.memory.currentServices = labels;
    state.memory.serviceInterests = labels;
    state.memory.serviceInterest = labels.join(" + ");
    state.memory.lastRecommendedService = labels[0] || "";
  }

  function setCurrentProblem(text) {
    state.memory.currentProblem = text;
    state.memory.problem = text;
  }

  function setLastQuestion(question) {
    state.memory.lastQuestionAsked = question;
  }

  // ─── Semantic Intent Engine (Transformers.js) ────────────────────────────────
  // Replaces the old keyword-scoring scoreIntent(). Uses a tiny all-MiniLM-L6-v2
  // embedding model (~25 MB, cached in the browser after first load) to compare
  // the user's message against natural-language descriptions of each intent by
  // MEANING, not keywords. Falls back to the legacy keyword scorer if the model
  // hasn't loaded yet.

  const INTENT_DESCRIPTIONS = {
    greeting:                  "saying hello or greeting someone",
    howAreYou:                 "asking how someone is doing or what's up",
    contactPhone:              "asking for a phone number or how to call",
    contactEmail:              "asking for an email address",
    portal:                    "asking about the client portal, login, dashboard, or account access",
    pricing:                   "asking about price, cost, how much something costs, or getting a quote",
    website:                   "asking about building or improving a website, landing page, or online presence",
    social:                    "asking about social media, Instagram, Facebook, reels, or content creation",
    phone:                     "asking about an AI phone receptionist or answering missed calls",
    webbot:                    "asking about a website chatbot or AI web receptionist",
    automation:                "asking about automating tasks, workflows, forms, follow-ups, or intake processes",
    growth:                    "asking about starting a business or building a foundation from scratch",
    full:                      "asking about a complete business system with everything included",
    funding:                   "asking about business funding, loans, capital, financing, or money for the business",
    choose:                    "not sure which service to pick and asking for a recommendation",
    start:                     "ready to get started, book, or submit a project request",
    careers:                   "asking about jobs, hiring, or working for the company",
    thanks:                    "saying thank you or expressing appreciation",
    objectionPrice:            "saying the price is too expensive or out of budget",
    objectionThink:            "saying they need to think about it or aren't ready yet",
    objectionExistingWebsite:  "saying they already have a website",
    competitor:                "asking about Wix, Squarespace, WordPress, Shopify, or similar website builders",
    timeline:                  "asking how long something takes or when it will be done",
    payment:                   "asking about payment methods, deposits, or invoices",
    bundle:                    "asking what services to combine or what package makes sense",
    faq:                       "asking general questions about how the process works or what happens next",
    stageNew:                  "mentioning they are starting a new business or haven't launched yet",
    stageExisting:             "mentioning they have an existing business that is already open",
    urgent:                    "saying they need something immediately, urgently, or as soon as possible",
    profanity:                 "using swear words or offensive language"
  };

  const nlp = {
    pipeline: null,
    intentEmbeddings: null,
    loading: false,
    ready: false,

    async load() {
      if (nlp.ready || nlp.loading) return;
      nlp.loading = true;

      try {
        // Dynamically import Transformers.js from the official CDN
        const { pipeline, env } = await import(
          "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js"
        );

        // Use local cache so the model is only downloaded once per browser
        env.allowLocalModels = false;

        nlp.pipeline = await pipeline(
          "feature-extraction",
          "Xenova/all-MiniLM-L6-v2",
          { quantized: true }          // ~25 MB quantized model
        );

        // Pre-compute embeddings for every intent description
        const keys   = Object.keys(INTENT_DESCRIPTIONS);
        const values = Object.values(INTENT_DESCRIPTIONS);
        const outputs = await nlp.pipeline(values, { pooling: "mean", normalize: true });

        nlp.intentEmbeddings = keys.map((k, i) => ({
          intent: k,
          vec: Array.from(outputs[i].data)
        }));

        nlp.ready = true;
      } catch (err) {
        console.warn("RE IMAGE NLP: model load failed, using keyword fallback.", err);
      }

      nlp.loading = false;
    },

    cosineSimilarity(a, b) {
      let dot = 0, normA = 0, normB = 0;
      for (let i = 0; i < a.length; i++) {
        dot   += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
      }
      return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-8);
    },

    async classify(text) {
      if (!nlp.ready) return null;

      const out = await nlp.pipeline([text], { pooling: "mean", normalize: true });
      const vec  = Array.from(out[0].data);

      let best = null, bestScore = -Infinity;
      for (const { intent, vec: iv } of nlp.intentEmbeddings) {
        const score = nlp.cosineSimilarity(vec, iv);
        if (score > bestScore) { bestScore = score; best = intent; }
      }

      // Require a minimum confidence threshold — below it, fall back to keywords
      return bestScore >= 0.30 ? best : null;
    }
  };

  // Legacy keyword scorer — used as fallback while NLP is loading or if it fails
  function scoreIntentKeywords(text) {
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

  // Public scorer — tries semantic model first, falls back to keywords
  async function scoreIntent(text) {
    const semantic = await nlp.classify(text);
    if (semantic) return semantic;
    return scoreIntentKeywords(text);
  }

  // Kick off model loading immediately so it's ready by the time the user types
  nlp.load();
  // ─────────────────────────────────────────────────────────────────────────────

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

  function inferStageFromTime(text) {
    const t = clean(text);
    if (t.includes("not open") || t.includes("pre launch") || t.includes("pre-launch") || t.includes("starting")) {
      return "New business / starting from scratch";
    }

    const monthMatch = t.match(/(\d+)\s*(month|months|mo)\b/);
    if (monthMatch && Number(monthMatch[1]) < 12) return "New business / starting from scratch";

    if (t.includes("year") || t.includes("yr") || t.includes("years") || t.includes("been in business")) {
      return "Existing business / improving current setup";
    }

    return "";
  }

  function updateMemory(text, intent) {
    const industry = detectIndustry(text);
    const stage = detectBusinessStage(text);

    if (industry) {
      state.memory.industry = industry;
      state.memory.currentIndustry = industry;
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

    if (serviceMap[intent]) setCurrentServices([serviceMap[intent]]);

    if (["website", "social", "phone", "webbot", "automation", "growth", "full", "funding", "choose", "bundle"].includes(intent)) {
      setCurrentProblem(text);
    }

    if (["objectionPrice", "objectionThink", "objectionExistingWebsite"].includes(intent)) {
      state.memory.lastObjection = intent;
      state.lead.objection = intent;
    }

    state.memory.lastIntent = intent;
  }

  function shouldUseBusinessContext(text) {
    const t = clean(text);
    if (!detectIndustry(t)) return false;

    const directQuestionIntents = [
      INTENTS.pricing,
      INTENTS.contactPhone,
      INTENTS.contactEmail,
      INTENTS.portal,
      INTENTS.careers,
      INTENTS.start
    ];

    return !directQuestionIntents.some((words) => includesAny(t, words));
  }

  function describeBusinessContext() {
    const industry = describeIndustry();
    const stage = state.memory.businessStage ? `, ${state.memory.businessStage.toLowerCase()}` : "";
    const time = state.memory.timeInBusiness ? `, operating for ${state.memory.timeInBusiness}` : "";
    const problem = summarizeProblem(state.memory.problem);
    const problemLine = problem ? `, and the main challenge is ${problem}` : "";
    return `You run ${industry}${stage}${time}${problemLine}.`;
  }

  function describeIndustry() {
    const industry = state.memory.currentIndustry || state.memory.industry;
    if (!industry) return "a business";
    if (industry === "auto") return "a mobile/detailing or auto service business";
    if (industry === "beauty") return "a beauty business";
    if (industry === "restaurant") return "a restaurant or food business";
    if (industry === "contractor") return "a contractor or trades business";
    if (industry === "retail") return "a retail business";
    if (industry === "rental") return "a rental business";
    if (industry === "medical") return "a health or wellness business";
    if (industry === "professional") return "a professional services business";
    if (/^[aeiou]/i.test(industry)) return `an ${industry} business`;
    return `a ${industry} business`;
  }

  function summarizeProblem(text) {
    const t = clean(text);
    if (!t) return "";

    if (t.includes("ghost") && (t.includes("estimate") || t.includes("quote"))) {
      return "turning estimates into follow-up conversations and booked work";
    }
    if (t.includes("follow up") || t.includes("follow-up")) {
      return "keeping follow-up consistent after people show interest";
    }
    if (t.includes("lead") || t.includes("leads")) {
      return "getting a steadier flow of qualified leads";
    }
    if (t.includes("call") || t.includes("missed")) {
      return "capturing calls and messages before opportunities slip away";
    }
    if (t.includes("instagram") || t.includes("facebook") || t.includes("social") || t.includes("content")) {
      return "staying visible and organized across social media";
    }
    if (t.includes("website") || t.includes("site") || t.includes("google")) {
      return "making the website clearer and better at converting visitors";
    }
    if (t.includes("booking") || t.includes("appointment")) {
      return "making booking easier for customers";
    }
    if (t.includes("admin") || t.includes("manual") || t.includes("organizing") || t.includes("requests")) {
      return "reducing manual admin work and organizing customer requests";
    }
    if (t.includes("funding") || t.includes("loan") || t.includes("capital")) {
      return "figuring out the right funding path";
    }

    return "clarifying the customer flow and deciding what should be improved first";
  }

  function shortBusinessAcknowledgement(text) {
    const industry = state.memory.industry ? describeIndustry().replace(/^a |^an /, "your ") : "the business";
    const problem = summarizeProblem(text);
    if (problem) return `Got it. For ${industry}, it sounds like the priority is ${problem}.`;
    return `Got it. I want to understand the business a little better before recommending anything.`;
  }

  function startDiscovery(text) {
    updateMemory(text, "choose");
    const services = mentionedServiceKeys(text);
    if (services.length) setCurrentServices(services);
    setCurrentProblem(text);
    state.step = "discoveryTime";
    setLastQuestion("timeInBusiness");

    return bot(
      [
        shortBusinessAcknowledgement(text),
        "",
        "Before I recommend anything, how long have you been in business?"
      ].join("\n"),
      ["Not open yet", "Under 1 year", "1-3 years", "3+ years"]
    );
  }

  function serviceKeyFromText(text, useMemory = true) {
    const t = clean(text);

    if (t.includes("ai receptionist phone")) return "phone";
    if (t.includes("ai receptionist")) return "phone";
    if (t.includes("starter ai receptionist") || t === "starter" || t.includes("starter plan")) return "webbot";
    if (t.includes("growth ai receptionist") || t === "growth" || t.includes("growth plan")) return "webbot";
    if (t.includes("pro ai receptionist") || t === "pro" || t.includes("pro plan")) return "webbot";
    if (t.includes("ai web receptionist") || t.includes("web receptionist chatbot")) return "webbot";
    if (t.includes("website development")) return "website";
    if (t.includes("social media management")) return "social";
    if (t.includes("business funding")) return "funding";
    if (t.includes("ai automation")) return "automation";
    if (t.includes("growth foundation")) return "growth";
    if (t.includes("full scale system")) return "full";
    if (t.includes("static website") || t.includes("dynamic website")) return "website";

    if (includesAny(t, INTENTS.phone)) return "phone";
    if (includesAny(t, INTENTS.webbot)) return "webbot";
    if (includesAny(t, INTENTS.funding)) return "funding";
    if (includesAny(t, INTENTS.website)) return "website";
    if (includesAny(t, INTENTS.social)) return "social";
    if (includesAny(t, INTENTS.automation)) return "automation";
    if (includesAny(t, INTENTS.growth)) return "growth";
    if (includesAny(t, INTENTS.full)) return "full";

    if (useMemory && (state.memory.lastRecommendedService || state.memory.serviceInterest || state.memory.currentServices.length)) {
      const label = clean(state.memory.currentServices[0] || state.memory.lastRecommendedService || state.memory.serviceInterest);
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

  function mentionedServiceKeys(text) {
    const t = clean(text);
    const keys = [];

    const checks = [
      ["webbot", INTENTS.webbot],
      ["phone", INTENTS.phone],
      ["funding", INTENTS.funding],
      ["website", INTENTS.website],
      ["social", INTENTS.social],
      ["automation", INTENTS.automation],
      ["growth", INTENTS.growth],
      ["full", INTENTS.full]
    ];

    checks.forEach(([key, words]) => {
      if (includesAny(t, words) && !keys.includes(key)) keys.push(key);
    });

    return keys;
  }

  function serviceLabels(keys) {
    return keys.map((key) => SERVICES[key]?.label).filter(Boolean);
  }

  function activeServiceKeys() {
    const labels = state.memory.currentServices.length
      ? state.memory.currentServices
      : state.memory.serviceInterests;

    return labels
      .map((label) => serviceKeyFromText(label, false))
      .filter(Boolean);
  }

  function relatedServicesFor(keys) {
    const related = [];
    const add = (key) => {
      if (!keys.includes(key) && !related.includes(key)) related.push(key);
    };

    keys.forEach((key) => {
      if (key === "website") {
        add("webbot");
        add("automation");
        add("social");
      }
      if (key === "social") {
        add("website");
        add("webbot");
      }
      if (key === "phone") {
        add("webbot");
        add("automation");
      }
      if (key === "webbot") {
        add("website");
        add("automation");
      }
      if (key === "funding") {
        add("website");
        add("growth");
      }
      if (key === "automation") {
        add("website");
        add("phone");
      }
      if (key === "growth") {
        add("website");
        add("social");
      }
      if (key === "full") {
        add("website");
        add("automation");
        add("webbot");
      }
    });

    return related.slice(0, 3);
  }

  function salesFollowUpQuestion(keys) {
    const related = relatedServicesFor(keys);
    const relatedLabels = serviceLabels(related);

    if (relatedLabels.length) {
      return `A smart next thing to check is whether you also need ${formatList(relatedLabels)}. Are you trying to solve just this one piece, or build the full customer flow?`;
    }

    return "Are you trying to solve just this one piece, or build the full customer flow?";
  }

  function isReceptionistService(keys = activeServiceKeys()) {
    return keys.some((key) => key === "webbot" || key === "phone");
  }

  function planSummary(planKey) {
    const plan = AI_RECEPTIONIST_PLANS[planKey];
    if (!plan) return "";

    return [
      `${plan.label}: ${plan.price}`,
      `${plan.replies}, ${plan.usageLimit}, ${plan.profileLimit}, ${plan.websiteLimit}.`,
      plan.includes
    ].join("\n");
  }

  function allReceptionistPlanPricing() {
    return [
      "AI receptionist plans:",
      "",
      planSummary("starter"),
      "",
      planSummary("growth"),
      "",
      planSummary("pro")
    ].join("\n");
  }

  function recommendReceptionistPlan() {
    const missed = clean(state.memory.qualification.missedOpportunities);
    const budget = clean(state.memory.qualification.budget);

    if (missed.includes("25+") || missed.includes("10-25") || budget.includes("750+")) return "pro";
    if (missed.includes("5-10") || budget.includes("300-$750") || budget.includes("300-750")) return "growth";
    return "starter";
  }

  function planRecommendationReply() {
    if (!isReceptionistService()) return "";

    const planKey = recommendReceptionistPlan();
    const plan = AI_RECEPTIONIST_PLANS[planKey];

    return [
      `Based on the volume and budget you shared, I would start with the ${plan.label} plan.`,
      "",
      planSummary(planKey),
      "",
      `That plan is best for ${plan.bestFor}`
    ].join("\n");
  }

  function planKeyFromText(text) {
    const t = clean(text);
    if (t.includes("starter")) return "starter";
    if (t.includes("growth")) return "growth";
    if (t.includes("pro")) return "pro";
    return "";
  }

  function websitePlanKeyFromText(text) {
    const t = clean(text);
    if (t.includes("static")) return "static";
    if (t.includes("dynamic")) return "dynamic";
    return "";
  }

  function websitePlanSummary(planKey) {
    const plan = WEBSITE_PLANS[planKey];
    if (!plan) return "";

    return [
      `${plan.label}: ${plan.downPayment} + ${plan.monthly}`,
      `Includes ${plan.pages}, ${plan.includes}.`,
      `Best for ${plan.bestFor}`
    ].join("\n");
  }

  function allWebsitePlanPricing() {
    return [
      "Website Development pricing:",
      "",
      websitePlanSummary("static"),
      "",
      websitePlanSummary("dynamic"),
      "",
      "Static means the pages are mostly fixed and edited when updates are needed. Dynamic means the site can support flexible sections, campaigns, SEO/analytics structure, client portals, admin portals, Supabase integration, backend-connected forms, and content that changes more often."
    ].join("\n");
  }

  function websiteQualifierReply() {
    state.salesStage = "qualification";
    state.step = "websiteType";
    setCurrentServices(["website"]);
    setLastQuestion("websiteType");

    return [
      allWebsitePlanPricing(),
      "",
      "To point you toward the right website setup, which sounds closer to what you need?",
      "",
      "Static is best if you need a clean professional site fast. Dynamic is better if you need SEO, analytics, campaigns, CMS-style updates, client portals, admin portals, Supabase integration, backend-connected forms, or more flexible content."
    ].join("\n");
  }

  function recommendWebsitePlan() {
    const type = clean(state.memory.qualification.websiteType);
    const updates = clean(state.memory.qualification.websiteUpdates);
    const problem = clean([state.memory.currentProblem, state.memory.problem, state.memory.primaryPainPoint].join(" "));

    if (
      type.includes("dynamic") ||
      updates.includes("weekly") ||
      updates.includes("seasonal") ||
      problem.includes("seo") ||
      problem.includes("campaign") ||
      problem.includes("analytics") ||
      problem.includes("update often") ||
      problem.includes("portal") ||
      problem.includes("admin") ||
      problem.includes("supabase") ||
      problem.includes("backend") ||
      problem.includes("login") ||
      problem.includes("dashboard") ||
      problem.includes("customer data")
    ) {
      return "dynamic";
    }

    return "static";
  }

  function websitePlanRecommendationReply() {
    if (!activeServiceKeys().includes("website")) return "";
    const planKey = recommendWebsitePlan();
    const plan = WEBSITE_PLANS[planKey];

    return [
      `Based on what you shared, I would lean toward the ${plan.label}.`,
      `${plan.label} pricing is ${plan.downPayment} + ${plan.monthly}.`,
      `It includes ${plan.includes}.`
    ].join("\n");
  }

  function formatList(items) {
    if (items.length <= 1) return items[0] || "";
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
  }

  function summarizeRequestedServices(keys, text) {
    const labels = serviceLabels(keys);
    const industry = state.memory.industry ? `${state.memory.industry} business` : "business";
    const serviceList = formatList(labels);
    const problem = summarizeProblem(text);

    if (problem) {
      return `You are looking for ${serviceList} for your ${industry}, with the bigger goal of ${problem}.`;
    }

    return `You are looking for ${serviceList} for your ${industry}, so customers have a clearer way to understand the business and take the next step.`;
  }

  function combinedServicesReply(keys) {
    const labels = serviceLabels(keys);
    const industry = state.memory.industry;
    const summary = summarizeRequestedServices(keys, state.memory.problem);

    setCurrentServices(keys);
    state.memory.conversationSummary = summary;

    const lines = [
      "Here is what I am hearing:",
      "",
      summary,
      "",
      industry
        ? `For a ${industry} business, those services can work together instead of being handled separately.`
        : "Those services can work together instead of being handled separately.",
      "",
      "Here is how I would think about it:"
    ];

    keys.forEach((key) => {
      const service = SERVICES[key];
      if (!service) return;
      lines.push("", `• ${service.label}: ${service.summary}`);
    });

    lines.push(
      "",
      "Suggested sequence:",
      "",
      "1. Clarify the funding goal and what the money would support.",
      "2. Scope the website around what customers need to see, order, request, or trust.",
      "3. Use one plan so the funding conversation and website build support the same growth goal.",
      "",
      "A good next step is to send one request with both needs so RE IMAGE can review the business, funding goal, and website scope together.",
      "",
      "Do you want pricing first, or should I ask a few quick questions so I can point you toward the best starting point?"
    );

    return lines.join("\n");
  }

  function correctionReply(text) {
    const keys = mentionedServiceKeys(text);
    const isCorrection = /\b(actually|i meant|instead|not that|change it|switch)\b/i.test(text);

    if (!isCorrection || !keys.length) return "";

    setCurrentServices(keys);
    setCurrentProblem(text);

    if (keys.length > 1) {
      return combinedServicesReply(keys);
    }

    const key = keys[0];
    const service = SERVICES[key];

    if (!service) return "";

    return [
      "Got it. I updated the focus.",
      "",
      `Now I am looking at ${service.label} as the main service.`,
      "",
      service.summary,
      "",
      "Do you want pricing for that, or do you want to start a request?"
    ].join("\n");
  }

  function pricingReply(text) {
    const directPlan = planKeyFromText(text);
    if (directPlan) {
      setCurrentServices(["webbot"]);
      state.awaitingPricingChoice = false;
      return planSummary(directPlan);
    }

    const directWebsitePlan = websitePlanKeyFromText(text);
    if (directWebsitePlan) {
      setCurrentServices(["website"]);
      state.awaitingPricingChoice = false;
      return websitePlanSummary(directWebsitePlan);
    }

    const mentioned = mentionedServiceKeys(text);

    if (mentioned.length > 1) {
      state.awaitingPricingChoice = false;
      return mentioned.map((key) => SERVICES[key].price).join("\n\n");
    }

    const activeServices = state.memory.currentServices.length
      ? state.memory.currentServices
      : state.memory.serviceInterests;

    if (!mentioned.length && activeServices.length > 1) {
      state.awaitingPricingChoice = false;
      const prices = activeServices
        .map((label) => {
          const key = serviceKeyFromText(label, false);
          return key ? SERVICES[key].price : "";
        })
        .filter(Boolean)
        .join("\n\n");

      return [
        "For the services we are discussing:",
        "",
        prices,
        "",
        "If you want, RE IMAGE can review the full setup as one request so the website, funding, and next steps are not treated separately."
      ].join("\n");
    }

    const key = serviceKeyFromText(text);

    if (!key) {
      state.awaitingPricingChoice = true;
      return [
        "Which service do you want pricing for?",
        "",
        "I can give pricing for:",
        "• Starter AI Receptionist — $99/month",
        "• Growth AI Receptionist — $149/month",
        "• Pro AI Receptionist — $249/month",
        "• AI Web Receptionist Chatbot",
        "• AI Receptionist Phone",
        "• AI Automation",
        "• Social Media Management",
        "• Website Development",
        "• Static Website — $99 down + $29.99/month",
        "• Dynamic Website — $249.99 down + $49.99/month",
        "• Business Funding",
        "• Growth Foundation",
        "• Full Scale System"
      ].join("\n");
    }

    state.awaitingPricingChoice = false;
    if (key === "webbot" || key === "phone") return allReceptionistPlanPricing();
    if (key === "website") return allWebsitePlanPricing();
    return SERVICES[key].price;
  }

  function salesPricingReply(text) {
    const price = pricingReply(text);
    const keys = activeServiceKeys();

    if (state.awaitingPricingChoice) return price;

    if (keys.includes("website")) return websiteQualifierReply();

    state.salesStage = "qualification";
    state.step = "salesMissed";
    setLastQuestion("missedOpportunities");

    return [
      price,
      "",
      "To point you toward the right setup, I just need a little more context.",
      "",
      "About how many leads, calls, messages, bookings, or customers do you think you miss in a typical week?"
    ].join("\n");
  }

  function qualificationSummary() {
    const q = state.memory.qualification;
    const services = state.memory.currentServices.length
      ? formatList(state.memory.currentServices)
      : state.memory.serviceInterest || "the right service";
    const business = describeIndustry();
    const problem = summarizeProblem(state.memory.currentProblem || state.memory.problem);

    return [
      `You are looking at ${services} for ${business}.`,
      problem ? `The main goal is ${problem}.` : "",
      q.websiteType ? `Website type: ${q.websiteType}.` : "",
      q.websiteUpdates ? `Expected website updates: ${q.websiteUpdates}.` : "",
      q.missedOpportunities ? `You may be missing about ${q.missedOpportunities} opportunities each week.` : "",
      q.budget ? `Your budget range is ${q.budget}.` : "",
      q.timeline ? `You want to start ${q.timeline.toLowerCase()}.` : "",
      q.decisionMaker ? decisionMakerSentence(q.decisionMaker) : ""
    ].filter(Boolean).join(" ");
  }

  function decisionMakerSentence(value) {
    const t = clean(value);
    if (t.includes("i decide")) return "You are the decision maker.";
    if (t.includes("partner")) return "A partner would need to review it too.";
    if (t.includes("manager")) return "A manager would need to approve it.";
    return `Decision process: ${value}.`;
  }

  function softCloseReply() {
    const quality = calculateLeadScore();
    const keys = activeServiceKeys();
    const followUp = salesFollowUpQuestion(keys);
    const planRecommendation = planRecommendationReply();
    const websiteRecommendation = websitePlanRecommendationReply();

    state.salesStage = "close";

    const lines = [
      "Here is what I am hearing:",
      "",
      qualificationSummary()
    ];

    if (planRecommendation) {
      lines.push("", planRecommendation);
    }

    if (websiteRecommendation) {
      lines.push("", websiteRecommendation);
    }

    lines.push(
      "",
      quality === "Hot"
        ? "This sounds like a strong fit to send over now, especially because the need and timeline are clear."
        : "This sounds worth reviewing so RE IMAGE can point you toward the strongest first move without overbuilding.",
      "",
      followUp,
      "",
      "I can also collect your basic details now so RE IMAGE can follow up with the right recommendation."
    );

    return lines.join("\n");
  }

  function recommendService() {
    const industry = state.memory.industry;
    const stage = state.memory.businessStage;
    const primaryPain = clean(state.memory.primaryPainPoint);
    const problem = clean([primaryPain, state.memory.problem, state.memory.businessType, stage].join(" "));

    let key = "";

    if (primaryPain.includes("website") || primaryPain.includes("site") || primaryPain.includes("online presence")) key = "website";
    else if (primaryPain.includes("social") || primaryPain.includes("instagram") || primaryPain.includes("facebook") || primaryPain.includes("content")) key = "social";
    else if (primaryPain.includes("missed call") || primaryPain.includes("calls")) key = "phone";
    else if (primaryPain.includes("manual") || primaryPain.includes("admin") || primaryPain.includes("follow")) key = "automation";
    else if (primaryPain.includes("lead") || primaryPain.includes("bookings")) key = "website";
    else if (problem.includes("funding") || problem.includes("loan") || problem.includes("capital") || problem.includes("financing") || problem.includes("money")) key = "funding";
    else if (problem.includes("ghost") || problem.includes("follow up") || problem.includes("follow-up") || problem.includes("estimate") || problem.includes("quote")) key = "automation";
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
    setCurrentServices([key]);

    return [
      `${service.label}`,
      "",
      service.summary,
      "",
      "Would you like pricing for this service, or do you want to start a request?",
      "",
      salesFollowUpQuestion([key])
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

  function discoveryRecommendationReply() {
    const key = recommendService();
    const service = SERVICES[key];
    const summary = describeBusinessContext();
    const existingKeys = activeServiceKeys().filter((existingKey) => existingKey !== key);
    const finalKeys = [key, ...existingKeys];
    const finalLabels = serviceLabels(finalKeys);
    state.memory.conversationSummary = summary;
    setCurrentServices(finalKeys);

    return [
      "Here is what I am hearing:",
      "",
      summary,
      "",
      finalKeys.length > 1
        ? `Based on that, I would look at ${formatList(finalLabels)} together.`
        : `Based on that, I am leaning toward ${service.label} as the first move.`,
      "",
      finalKeys.length > 1
        ? finalKeys.map((serviceKey) => `• ${SERVICES[serviceKey].label}: ${SERVICES[serviceKey].summary}`).join("\n")
        : service.summary,
      "",
      bundleReply(),
      "",
      "Does that sound right, or is the bigger issue something else?"
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
    if (state.memory.qualification.missedOpportunities) score += 10;
    if (state.memory.qualification.budget) score += 10;
    if (state.memory.qualification.timeline) score += 10;
    if (state.memory.qualification.decisionMaker) score += 5;

    if (text.includes("asap") || text.includes("today") || text.includes("urgent") || text.includes("this week")) score += 25;
    if (text.includes("pricing") || text.includes("price") || text.includes("cost")) score += 10;
    if (text.includes("$750") || text.includes("750+") || text.includes("$500") || text.includes("1000") || text.includes("1,000")) score += 15;
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
  async function getAIReply(userMessage) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), CONFIG.AI_TIMEOUT_MS);

    try {
      const response = await fetch(CONFIG.AI_BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify(
          typeof userMessage === "string" ? { message: userMessage } : userMessage
        )
      });

      if (!response.ok) throw new Error(`Backend responded ${response.status}`);
      const data = await response.json();
      state.backendAvailable = true;

      return data.reply || "";
    } catch (error) {
      state.backendAvailable = false;
      console.error("AI Receptionist error:", error);
      return "";
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function buildAIContext() {
    return {
      industry: state.memory.currentIndustry || state.memory.industry || "",
      services: state.memory.currentServices.length
        ? state.memory.currentServices
        : state.memory.serviceInterests,
      problem: summarizeProblem(state.memory.currentProblem || state.memory.problem),
      stage: state.memory.businessStage,
      timeInBusiness: state.memory.timeInBusiness,
      lastQuestionAsked: state.memory.lastQuestionAsked
    };
  }

  function looksLikeUsefulRewrite(text, draft) {
    const reply = String(text || "").trim();
    if (reply.length < 20) return false;
    if (reply.length > Math.max(900, draft.length * 1.7)) return false;
    if (/customer:|receptionist:|draft reply|rewritten/i.test(reply)) return false;
    if (/tell me (a little )?more|how can i help|thanks for reaching out/i.test(reply)) return false;

    const protectedTerms = [
      "Business Funding",
      "Website Development",
      "Static Website",
      "Dynamic Website",
      "Social Media Management",
      "AI Receptionist Phone",
      "AI Web Receptionist",
      "AI Automation",
      "Growth Foundation",
      "Full Scale System"
    ].filter((term) => draft.includes(term));

    if (protectedTerms.length && !protectedTerms.some((term) => reply.includes(term))) return false;

    return true;
  }

  async function polishReply(draft, userMessage) {
    const reply = await getAIReply({
      message: userMessage || state.memory.currentProblem || "Customer needs help",
      mode: "polish",
      draft,
      context: buildAIContext()
    });

    if (looksLikeUsefulRewrite(reply, draft)) return reply;
    return draft;
  }

  async function smartBot(draft, chips, userMessage) {
    showTyping();
    const polished = await polishReply(draft, userMessage);
    hideTyping();
    return bot(polished, chips);
  }
  function fallbackReply() {
    const backendLine = state.backendAvailable === false
      ? "The live AI writer is not reachable right now, but I can still help with the built-in service guide."
      : "";

    return [
      backendLine,
      backendLine ? "" : "",
      "I can help with websites, social media, AI receptionists, AI automation, business funding, pricing, the client portal, or starting a project.",
      "",
      "Are you asking about pricing, services, the client portal, funding, or starting a request?"
    ].filter((line, index, arr) => line || arr[index - 1]).join("\n");
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
      "Starter AI Receptionist",
      "Growth AI Receptionist",
      "Pro AI Receptionist",
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
    hydrateLeadFromMemory(service);

    state.step = "name";
    bot(
      [
        "Perfect. I’ll use what you already shared so you don’t have to repeat everything.",
        "",
        "I just need your contact details and any missing basics so RE IMAGE can follow up properly.",
        "",
        "What’s your full name?"
      ].join("\n")
    );
  }

  function hydrateLeadFromMemory(service) {
    const activeServices = state.memory.currentServices.length
      ? state.memory.currentServices
      : state.memory.serviceInterests;

    if (service) state.lead.service = service;
    else if (activeServices.length) state.lead.service = formatList(activeServices);
    else if (state.memory.lastRecommendedService) state.lead.service = state.memory.lastRecommendedService;
    else if (state.memory.serviceInterest) state.lead.service = state.memory.serviceInterest;

    state.lead.stage = state.memory.businessStage || state.lead.stage;
    state.lead.sector = state.memory.sector || state.memory.currentIndustry || state.memory.industry || state.lead.sector;
    state.lead.goal = summarizeProblem(state.memory.currentProblem || state.memory.problem) || state.memory.currentProblem || state.memory.problem || state.lead.goal;
    state.lead.painPoints = state.memory.primaryPainPoint || state.memory.painPoints.join(", ") || state.lead.painPoints;
    state.lead.timeInBusiness = state.memory.timeInBusiness || state.lead.timeInBusiness;
    state.lead.missedOpportunities = state.memory.qualification.missedOpportunities || state.lead.missedOpportunities;
    state.lead.budget = state.memory.qualification.budget || state.lead.budget;
    state.lead.urgency = state.memory.qualification.timeline || state.lead.urgency;
    state.lead.decisionMaker = state.memory.qualification.decisionMaker || state.lead.decisionMaker;
    state.lead.objection = state.memory.lastObjection || state.lead.objection;
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
      `Sector / Occupation: ${l.sector || state.memory.sector || "—"}`,
      `Detected industry: ${state.memory.industry || "—"}`,
      `Business stage: ${l.stage || state.memory.businessStage || "—"}`,
      `Time in business: ${l.timeInBusiness || state.memory.timeInBusiness || "—"}`,
      `Team size: ${l.employees || "—"}`,
      `Monthly revenue range: ${l.revenue || "—"}`,
      `Interested service: ${l.service || "—"}`,
      `Current services discussed: ${state.memory.currentServices.join(", ") || "—"}`,
      `Bot recommendation: ${state.memory.lastRecommendedService || "—"}`,
      `Goal / problem: ${l.goal || "—"}`,
      `Pain points: ${l.painPoints || state.memory.painPoints.join(", ") || "—"}`,
      `Missed opportunities: ${l.missedOpportunities || state.memory.qualification.missedOpportunities || "—"}`,
      `Budget: ${l.budget || state.memory.qualification.budget || "—"}`,
      `Timeline: ${l.urgency || state.memory.qualification.timeline || "—"}`,
      `Decision maker: ${l.decisionMaker || state.memory.qualification.decisionMaker || "—"}`,
      `Website type: ${state.memory.qualification.websiteType || "—"}`,
      `Website update frequency: ${state.memory.qualification.websiteUpdates || "—"}`,
      `Sales qualification summary: ${qualificationSummary() || "—"}`,
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

  async function sendCustomerWelcomeEmail() {
  if (!state.lead.email) return;

  try {
    await fetch(CONFIG.AI_BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Send welcome email to customer after service request submission.",
        customer_email: state.lead.email,
        send_welcome: true
      })
    });
  } catch (error) {
    console.error("Welcome email failed:", error);
  }
}

  async function finishLead() {
    const l = state.lead;

    bot(
      [
        "Here\u2019s what I\u2019m sending to RE IMAGE:",
        "",
        `Name: ${l.name}`,
        `Email: ${l.email}`,
        `Phone: ${l.phone}`,
        `Business: ${l.business}`,
        `Sector: ${l.sector || "\u2014"}`,
        `Team size: ${l.employees || "\u2014"}`,
        `Revenue range: ${l.revenue || "\u2014"}`,
        `Stage: ${l.stage || state.memory.businessStage || "Not sure"}`,
        `Service: ${l.service}`,
        `Goal: ${l.goal}`,
        `Pain points: ${l.painPoints || "\u2014"}`,
        `Missed opportunities: ${l.missedOpportunities || state.memory.qualification.missedOpportunities || "\u2014"}`,
        `Budget: ${l.budget || state.memory.qualification.budget || "Not sure"}`,
        `Timeline: ${l.urgency || state.memory.qualification.timeline || "Not sure"}`,
        `Decision maker: ${l.decisionMaker || state.memory.qualification.decisionMaker || "\u2014"}`,
        `Lead quality: ${calculateLeadScore()}`
      ].join("\n"),
      ["Confirm & Send", "Change service", "Open form"]
    );

    state.step = "confirm";
  }

  // \u2500\u2500 Sector / occupation helpers \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  const SECTOR_CHIPS = [
    "Restaurant / Food",
    "Beauty / Salon / Spa",
    "Auto / Body Shop",
    "Contractor / Trades",
    "Medical / Health",
    "Retail / E-commerce",
    "Professional Services",
    "Rental / Fleet",
    "Other"
  ];

  function sectorFromChip(value) {
    const t = clean(value);
    if (t.includes("restaurant") || t.includes("food")) return "restaurant";
    if (t.includes("beauty") || t.includes("salon") || t.includes("spa")) return "beauty";
    if (t.includes("auto") || t.includes("body")) return "auto";
    if (t.includes("contractor") || t.includes("trade")) return "contractor";
    if (t.includes("medical") || t.includes("health")) return "medical";
    if (t.includes("retail") || t.includes("ecommerce") || t.includes("e-commerce")) return "retail";
    if (t.includes("professional") || t.includes("consulting") || t.includes("agency")) return "professional";
    if (t.includes("rental") || t.includes("fleet")) return "rental";
    return "";
  }

  function budgetChips() {
    const svc = clean(state.lead.service || state.memory.serviceInterest || "");
    if (svc.includes("automation") || svc.includes("full scale")) {
      return ["Under $500/mo", "$500\u2013$1,000/mo", "$1,000\u2013$2,500/mo", "$2,500+/mo"];
    }
    if (svc.includes("social")) {
      return ["$99/week", "$149 per reel", "$399 for 3 reels", "Not sure"];
    }
    if (svc.includes("website")) {
      return ["Under $1,000", "$1,000\u2013$3,000", "$3,000\u2013$6,000", "Not sure yet"];
    }
    return ["Not sure", "$100\u2013$500", "$500\u2013$1,500", "$1,500+"];
  }

  function painPointChips() {
    const ind = state.memory.industry || sectorFromChip(state.lead.sector || "");
    if (ind === "beauty" || ind === "medical") {
      return ["Not enough bookings", "Missing calls", "Weak social media", "No online reviews", "Hard to follow up"];
    }
    if (ind === "restaurant") {
      return ["Low foot traffic", "No online ordering", "Weak social content", "Missing calls", "No loyalty system"];
    }
    if (ind === "auto" || ind === "contractor") {
      return ["Missing quote requests", "Slow follow-up", "No online presence", "Missing calls", "Hard to collect payments"];
    }
    return ["Not enough leads", "Missing calls", "Weak website", "Poor social media", "Too much manual admin"];
  }
  // \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

  function askNextLeadQuestion() {
    if (!state.lead.name) {
      state.step = "name";
      return bot("What’s your full name?");
    }
    if (!state.lead.email) {
      state.step = "email";
      return bot(`Nice to meet you, ${state.lead.name.split(" ")[0]}! What email address should RE IMAGE use to reach you?`);
    }
    if (!state.lead.phone) {
      state.step = "phone";
      return bot("And what’s the best phone number for RE IMAGE to call or text?");
    }
    if (!state.lead.business) {
      state.step = "business";
      return bot("What’s your business name? If you haven’t named it yet, just say \"not yet.\"");
    }
    if (!state.lead.sector) {
      state.step = "sector";
      return bot("What sector or industry is your business in?", SECTOR_CHIPS);
    }
    if (!state.lead.stage) {
      state.step = "stage";
      return bot("Is this a new business you’re building, or an existing one you’re trying to grow?", ["New business", "Existing business"]);
    }
    if (!state.lead.employees) {
      state.step = "employees";
      return bot("How big is your team right now?", ["Just me", "2–5 people", "6–15 people", "16+ people"]);
    }
    if (!state.lead.revenue && !clean(state.lead.stage).includes("new")) {
      state.step = "revenue";
      return bot("Roughly what’s your current monthly revenue? This helps RE IMAGE tailor the right solution.", ["Under $5K/mo", "$5K–$15K/mo", "$15K–$50K/mo", "$50K+/mo", "Prefer not to say"]);
    }
    if (!state.lead.painPoints) {
      state.step = "painPoints";
      return bot("I have the general need, but what’s the biggest challenge holding the business back right now?", painPointChips());
    }
    if (!state.lead.service) {
      state.step = "service";
      return bot("Which service should RE IMAGE focus on first?", serviceChips());
    }
    if (!state.lead.goal) {
      state.step = "goal";
      return bot(`In one or two sentences, what outcome are you hoping for with ${state.lead.service}?`);
    }
    if (!state.lead.budget) {
      state.step = "budget";
      return bot("What’s your budget for this? Pick the range that fits best.", budgetChips());
    }
    if (!state.lead.urgency) {
      state.step = "urgency";
      return bot("When are you hoping to get started?", ["ASAP — this week", "This month", "Next 1–3 months", "Just exploring for now"]);
    }

    state.step = null;
    return finishLead();
  }

  async function handleLeadStep(text) {
    const value = String(text || "").trim();

    if (state.step === "name") {
      if (value.length < 2) return bot("I need your full name to send the request.");
      state.lead.name = value;
      return askNextLeadQuestion();
    }

    if (state.step === "email") {
      if (!validateEmail(value)) return bot("That doesn\u2019t look quite right \u2014 can you double-check your email address?");
      state.lead.email = value;
      return askNextLeadQuestion();
    }

    if (state.step === "phone") {
      if (!validatePhone(value)) return bot("Please include your area code \u2014 I need at least 10 digits.");
      state.lead.phone = value;
      return askNextLeadQuestion();
    }

    if (state.step === "business") {
      state.lead.business = value;
      state.memory.businessType = value;

      if (state.memory.industry) {
        state.lead.sector = state.memory.industry;
        state.memory.sector = state.memory.industry;
        return askNextLeadQuestion();
      }

      return askNextLeadQuestion();
    }

    if (state.step === "sector") {
      state.lead.sector = value;
      state.memory.sector = value;
      const detected = sectorFromChip(value) || detectIndustry(value);
      if (detected) state.memory.industry = detected;

      if (clean(value) === "other") {
        state.step = "sectorOther";
        return bot("No problem \u2014 can you briefly describe what your business does?");
      }

      return askNextLeadQuestion();
    }

    if (state.step === "sectorOther") {
      state.lead.sector = value;
      state.memory.sector = value;
      const detected = detectIndustry(value);
      if (detected) state.memory.industry = detected;
      return askNextLeadQuestion();
    }

    if (state.step === "stage") {
      const stage = detectBusinessStage(value) || (clean(value).includes("new") ? "New business / starting from scratch" : "Existing business / improving current setup");
      state.lead.stage = stage;
      state.memory.businessStage = stage;
      return askNextLeadQuestion();
    }

    if (state.step === "employees") {
      state.lead.employees = value;
      const isNew = clean(state.lead.stage).includes("new");
      if (isNew) {
        state.lead.revenue = "Pre-revenue / not launched";
        return askNextLeadQuestion();
      }
      return askNextLeadQuestion();
    }

    if (state.step === "revenue") {
      state.lead.revenue = value;
      return askNextLeadQuestion();
    }

    if (state.step === "painPoints") {
      state.lead.painPoints = value;
      state.memory.painPoints.push(value);
      const autoKey = recommendService();
      const autoService = SERVICES[autoKey];
      state.memory.lastRecommendedService = autoService.label;
      if (!state.lead.service) {
        state.step = "service";
        return bot(
          `Based on that, ${autoService.label} sounds like the strongest starting point for you.\n\n${autoService.summary}\n\nDoes that sound right, or would you like a different service?`,
          [...serviceChips().filter(s => s !== autoService.label).slice(0, 4), `Yes, ${autoService.label}`]
        );
      }
      return askNextLeadQuestion();
    }

    if (state.step === "service") {
      const key = serviceKeyFromText(value);
      state.lead.service = key ? SERVICES[key].label : value;
      state.memory.serviceInterest = state.lead.service;
      return askNextLeadQuestion();
    }

    if (state.step === "goal") {
      state.lead.goal = value;
      state.memory.problem = value;
      return askNextLeadQuestion();
    }

    if (state.step === "budget") {
      state.lead.budget = value;
      return askNextLeadQuestion();
    }

    if (state.step === "urgency") {
      state.lead.urgency = value;
      return askNextLeadQuestion();
    }

    if (state.step === "confirm") {
      if (/confirm|send|yes|submit|ok/i.test(value)) {
        try {
          state.busy = true;
          await saveLead();
          await sendCustomerWelcomeEmail();
          state.busy = false;
          state.step = null;
          return bot(
            `Perfect \u2014 your request is on its way to RE IMAGE. Someone will review it and follow up at ${state.lead.email} or ${state.lead.phone}.\n\nIs there anything else I can help you with?`,
            ["Client portal", "New project", "Phone number", "Email"]
          );
        } catch (e) {
          console.error("RE IMAGE receptionist lead failed", e);
          state.busy = false;
          return bot(
            "I had trouble sending from the widget. Please use the Start With Us form \u2014 your details will still reach RE IMAGE.",
            ["Open form", "Phone number", "Email"]
          );
        }
      }

      if (/change|service/i.test(value)) {
        state.step = "service";
        return bot("No problem \u2014 which service would you like instead?", serviceChips());
      }

      if (/open form|form/i.test(value)) {
        window.location.href = CONFIG.startUrl;
        return;
      }

      return bot("Type \"Confirm & Send\" to submit, \"Change service\" to edit, or \"Open form\" to use the full form.");
    }
  }

  function isDiscoveryStep() {
    return state.step === "discoveryTime" || state.step === "discoveryPain";
  }

  function isSalesStep() {
    return ["salesMissed", "salesBudget", "salesTimeline", "salesDecision", "websiteType", "websiteUpdates"].includes(state.step);
  }

  async function handleSalesStep(text) {
    const value = String(text || "").trim();

    if (state.step === "websiteType") {
      const planKey = websitePlanKeyFromText(value);
      state.memory.qualification.websiteType = planKey || value;
      state.lead.service = planKey ? WEBSITE_PLANS[planKey].label : "Website Development";
      state.step = "websiteUpdates";
      setLastQuestion("websiteUpdates");

      return bot(
        [
          planKey
            ? `Got it. ${WEBSITE_PLANS[planKey].label} sounds like the better fit so far.`
            : "Got it. I can help narrow that down.",
          "",
          "How often do you expect to update the website after it launches?"
        ].join("\n"),
        ["Rarely", "Monthly", "Weekly", "Seasonal campaigns", "Not sure"]
      );
    }

    if (state.step === "websiteUpdates") {
      state.memory.qualification.websiteUpdates = value;
      state.step = "salesBudget";
      setLastQuestion("budget");

      return bot(
        [
          "That helps.",
          "",
          websitePlanRecommendationReply(),
          "",
          "What budget range feels realistic for the website?"
        ].join("\n"),
        ["Under $100/mo", "$100-$300/mo", "$300-$750/mo", "$750+/mo", "Not sure yet"]
      );
    }

    if (state.step === "salesMissed") {
      state.memory.qualification.missedOpportunities = value;
      state.lead.missedOpportunities = value;
      state.step = "salesBudget";
      setLastQuestion("budget");

      return bot(
        [
          "That helps. If you are missing that many opportunities, the follow-up system matters.",
          "",
          "What budget range would feel realistic if the setup could help capture more of those opportunities?"
        ].join("\n"),
        ["Under $100/mo", "$100-$300/mo", "$300-$750/mo", "$750+/mo", "Not sure yet"]
      );
    }

    if (state.step === "salesBudget") {
      state.memory.qualification.budget = value;
      state.lead.budget = value;
      state.step = "salesTimeline";
      setLastQuestion("timeline");

      return bot(
        [
          "Got it.",
          "",
          "How soon are you trying to get something in place?"
        ].join("\n"),
        ["ASAP", "This month", "Next 1-3 months", "Just exploring"]
      );
    }

    if (state.step === "salesTimeline") {
      state.memory.qualification.timeline = value;
      state.lead.urgency = value;
      state.step = "salesDecision";
      setLastQuestion("decisionMaker");

      return bot(
        [
          "Good to know.",
          "",
          "Are you the person who would make the decision, or would someone else need to review it too?"
        ].join("\n"),
        ["I decide", "Need a partner to review", "Need manager approval", "Not sure"]
      );
    }

    if (state.step === "salesDecision") {
      state.memory.qualification.decisionMaker = value;
      state.lead.decisionMaker = value;
      state.step = null;
      setLastQuestion("");

      return smartBot(softCloseReply(), ["Start a project", "Show pricing again", "Other services"], value);
    }
  }

  async function handleDiscoveryStep(text) {
    const value = String(text || "").trim();

    if (state.step === "discoveryTime") {
      state.memory.timeInBusiness = value;
      state.lead.timeInBusiness = value;

      const stage = inferStageFromTime(value) || detectBusinessStage(value);
      if (stage) {
        state.memory.businessStage = stage;
        state.lead.stage = stage;
      }

      state.step = "discoveryPain";
      setLastQuestion("primaryPainPoint");
      return bot(
        [
          "That helps.",
          "",
          describeBusinessContext(),
          "",
          "What is the biggest thing costing you opportunities right now?"
        ].join("\n"),
        ["Slow follow-up", "Not enough leads", "Missed calls", "Weak website", "Social media", "Too much manual admin"]
      );
    }

    if (state.step === "discoveryPain") {
      state.memory.problem = [state.memory.problem, value].filter(Boolean).join(" | ");
      state.memory.currentProblem = state.memory.problem;
      state.memory.primaryPainPoint = value;
      state.memory.painPoints.push(value);
      state.lead.painPoints = value;
      state.step = null;
      setLastQuestion("");

      return smartBot(discoveryRecommendationReply(), ["Pricing", "Start a project", "Ask another question"], value);
    }
  }

  async function routeChip(label) {
    const t = clean(label);
    const serviceKey = serviceKeyFromText(label, false);

    if (state.awaitingPricingChoice && serviceKey) {
      setCurrentServices([serviceKey]);
      await smartBot(salesPricingReply(label), ["0-5/week", "5-10/week", "10-25/week", "25+/week", "Not sure"], label);
      return true;
    }

    if (t.includes("show pricing again")) {
      await smartBot(salesPricingReply(label), ["Under $100/mo", "$100-$300/mo", "$300-$750/mo", "$750+/mo", "Not sure yet"], label);
      return true;
    }

    if (t.includes("other services")) {
      const keys = activeServiceKeys();
      const related = relatedServicesFor(keys);
      bot(
        related.length
          ? `The related services I would check next are ${formatList(serviceLabels(related))}. Which one do you want to explore?`
          : "Which other service do you want to explore?",
        serviceChips()
      );
      return true;
    }

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
      setCurrentServices(["funding"]);
      await smartBot(
        [
          businessFundingReply(),
          "",
          salesFollowUpQuestion(["funding"])
        ].join("\n"),
        ["Pricing", "Website Development", "Growth Foundation", "Start a project"],
        label
      );
      return true;
    }

    if (t.includes("pricing")) {
      await smartBot(salesPricingReply(label), ["0-5/week", "5-10/week", "10-25/week", "25+/week", "Not sure"], label);
      return true;
    }

    if (t.includes("services")) {
      bot(fallbackReply(), mainChips());
      return true;
    }

    return false;
  }

  // Typing indicator helpers
  function showTyping() {
    const body = document.querySelector(".reibot-body");
    if (!body || document.getElementById("reibot-typing")) return;
    const row = document.createElement("div");
    row.id = "reibot-typing";
    row.className = "reibot-msg";
    row.innerHTML = `
      <div class="reibot-avatar">RI</div>
      <div class="reibot-bubble" style="padding:14px 16px;">
        <span style="display:inline-flex;gap:4px;align-items:center;">
          <span style="width:7px;height:7px;border-radius:50%;background:#2ba3b8;animation:reidot 1s infinite 0s"></span>
          <span style="width:7px;height:7px;border-radius:50%;background:#2ba3b8;animation:reidot 1s infinite .2s"></span>
          <span style="width:7px;height:7px;border-radius:50%;background:#2ba3b8;animation:reidot 1s infinite .4s"></span>
        </span>
      </div>`;
    if (!document.getElementById("reidot-style")) {
      const s = document.createElement("style");
      s.id = "reidot-style";
      s.textContent = "@keyframes reidot{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}";
      document.head.appendChild(s);
    }
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById("reibot-typing");
    if (el) el.remove();
  }

  async function handleInput(raw) {
    const text = String(raw || "").trim();
    if (!text || state.busy) return;

    state.busy = true;
    user(text);

    const input = document.querySelector(".reibot-input");
    if (input) input.value = "";

    const correction = correctionReply(text);
    if (correction) {
      state.busy = false;
      return smartBot(correction, ["Pricing", "Start a project", "Ask another question"], text);
    }

    const requestedServices = mentionedServiceKeys(text);
    if (requestedServices.length > 1) {
      updateMemory(text, "choose");
      state.busy = false;
      return smartBot(combinedServicesReply(requestedServices), ["Pricing", "Start a project", "Ask another question"], text);
    }

    if (await routeChip(text)) { state.busy = false; return; }
    if (isDiscoveryStep()) { state.busy = false; return handleDiscoveryStep(text); }
    if (isSalesStep()) { state.busy = false; return handleSalesStep(text); }
    if (state.step) { state.busy = false; return handleLeadStep(text); }

    if (shouldUseBusinessContext(text)) {
      state.busy = false;
      return startDiscovery(text);
    }

    // Show typing dots while semantic model classifies (usually < 200 ms once loaded)
    showTyping();
    const intent = await scoreIntent(text);
    hideTyping();
    updateMemory(text, intent);
    state.busy = false;

    if (intent === "profanity") {
      return bot(profanityReply(), ["Pricing", "Services", "Client portal", "Business Funding", "Start a project"]);
    }

    if (intent === "urgent") {
      return bot(urgentReply(), ["Start a project", "Phone number", "Email"]);
    }

    if (detectIndustry(text)) {
      return startDiscovery(text);
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
        return smartBot(salesPricingReply(text), ["0-5/week", "5-10/week", "10-25/week", "25+/week", "Not sure"], text);

      case "website":
      case "social":
      case "phone":
      case "webbot":
      case "automation":
      case "growth":
      case "full":
      case "funding":
        return smartBot(serviceReply(intent), ["Pricing", "Start a project", "Help me choose"], text);

      case "choose":
        return smartBot(recommendationReply(), ["Pricing", "Start a project", "Client portal"], text);

      case "objectionPrice":
      case "objectionThink":
      case "objectionExistingWebsite":
        return smartBot(objectionReply(intent), ["Help me choose", "Start a project", "Pricing"], text);

      case "competitor":
        return smartBot(competitorReply(), ["Help me choose", "Start a project"], text);

      case "timeline":
        return smartBot(timelineReply(), ["Start a project", "Phone number"], text);

      case "payment":
        return smartBot(paymentReply(), ["Start a project", "Client portal"], text);

      case "bundle":
        return smartBot(bundleReply(), ["Start a project", "Pricing"], text);

      case "faq":
        return smartBot(faqReply(), ["Start a project", "Client portal", "Phone number"], text);

      case "stageNew":
      case "stageExisting":
        return smartBot(businessStageReply(), ["Help me choose", "Start a project"], text);

      case "start":
        return startLead();

      case "careers":
        return bot("For job opportunities, use the Careers page. I can open it for you.", ["Open careers", "Start a project"]);

      default: {
        showTyping();
        const aiReply = await getAIReply(text);
        hideTyping();

        if (aiReply) {
          return bot(aiReply, ["Pricing", "Start a project", "Client portal"]);
        }

        return bot(fallbackReply(), mainChips());
      }
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
            <div class="reibot-sub" id="reibot-sub-status">Service guidance + lead intake</div>
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

      // Show NLP loading status in subtitle
      const sub = document.getElementById("reibot-sub-status");
      if (sub && !nlp.ready) {
        sub.textContent = "Loading smart replies…";
        const poll = setInterval(() => {
          if (nlp.ready) {
            sub.textContent = "Service guidance + lead intake";
            clearInterval(poll);
          }
        }, 500);
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
