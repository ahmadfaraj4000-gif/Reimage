(function () {
  "use strict";

  const CONFIG = {
    businessName: "RE IMAGE Business Solutions",
    shortName: "RE IMAGE",
    tagline: "Websites, content, and automation systems for small businesses.",
    clientPortalUrl: "https://login.reimagebs.com",
    startUrl: "start-with-us.html",
    servicesUrl: "index.html#services",
    careersUrl: "careers.html",
    aiReceptionistsUrl: "ai-receptionists.html",
    websiteUrl: "website-development.html",
    socialUrl: "social-media-management.html",
    automationUrl: "ai-automation.html",
    growthUrl: "growth-foundation.html",
    fullSystemUrl: "full-scale-system.html",
    logo: "logo.png",
    socialHandle: "@reimagebusiness",
    serviceArea: "United States / remote support for small businesses",

    SUPABASE_URL: "https://uybcjtigyujoyrunecto.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5YmNqdGlneXVqb3lydW5lY3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MTczOTAsImV4cCI6MjA5MjI5MzM5MH0.UTDL7poTPwzVWSjNg28tPJeaHzU_Xbqe6c08Y7tl5Fk",
    tableName: "start_requests",
    source: "AI Website Receptionist",

    services: {
      growth: {
        label: "Growth Foundation",
        price: "Custom / consultation-based",
        url: "growth-foundation.html",
        summary: "A starting package for small businesses that need a clearer online presence, stronger messaging, and a foundation for growth."
      },
      full: {
        label: "Full Scale System",
        price: "Custom / consultation-based",
        url: "full-scale-system.html",
        summary: "A complete build for businesses that need a website, intake flow, operations support, automation, and a cleaner system behind the scenes."
      },
      social: {
        label: "Social Media Management",
        price: "Reels from $149 / account support $99 per week",
        url: "social-media-management.html",
        summary: "Professionally shot reels, researched scripts/hooks, calls to action, or account management support using owner-made content."
      },
      website: {
        label: "Website Development",
        price: "Custom / consultation-based",
        url: "website-development.html",
        summary: "Conversion-focused websites with service pages, clear CTAs, mobile polish, SEO basics, and lead capture."
      },
      phone: {
        label: "AI Receptionist Phone",
        price: "$99/month",
        url: "ai-receptionists.html#pricing",
        summary: "An AI phone receptionist for common questions, lead collection, and customer routing."
      },
      webbot: {
        label: "AI Web Receptionist Chatbot",
        price: "$69.99/month",
        url: "ai-receptionists.html#pricing",
        summary: "A website chatbot receptionist for FAQs, customer intake, service guidance, and lead capture."
      },
      automation: {
        label: "AI Automation",
        price: "$249/week",
        url: "ai-automation.html",
        summary: "Custom automation setup and ongoing optimization around the business process."
      }
    }
  };

  const state = {
    open: false,
    lang: "en",
    step: null,
    lead: freshLead(),
    supabase: null,
    busy: false,
    greeted: false
  };

  function freshLead() {
    return {
      name: "",
      email: "",
      phone: "",
      business: "",
      service: "",
      message: "",
      urgency: "",
      budget: "",
      goal: ""
    };
  }

  const copy = {
    en: {
      welcome: "Hi — welcome to RE IMAGE Business Solutions. I can help you choose a service, explain pricing, collect your project details, or point you to the right next step. What are you trying to build or improve?",
      placeholder: "Ask about websites, social media, AI receptionists...",
      quick: ["Help me choose", "Pricing", "AI Receptionist", "Website", "Social Media", "Start a project"],
      fallback: "I can help with websites, social media management, AI receptionists, AI automation, pricing, timelines, client portal questions, or starting a project. Which one are you looking for?",
      askName: "Absolutely. I’ll collect the important details so RE IMAGE can follow up properly. What’s your full name?",
      askEmail: "Thanks. What email should we use to contact you?",
      askPhone: "What phone number should we use?",
      askBusiness: "What’s the business name? If you don’t have one yet, you can say ‘not yet.’",
      askService: "Which service are you most interested in?",
      askGoal: "What are you trying to accomplish? Example: get more leads, rebuild website, add AI receptionist, manage social media, automate intake, or clean up operations.",
      askBudget: "Do you have a target budget or preferred starting package? You can also say ‘not sure.’",
      askUrgency: "When are you hoping to start?",
      confirm: "Here’s what I’m going to send over:",
      success: "Perfect — I sent your request to RE IMAGE. Someone can review it and follow up with the next step. You can also use the Start With Us page if you want to schedule directly.",
      fail: "I had trouble sending that request from the widget. Please use the Start With Us form and your details will still go through.",
      required: "I need that detail before I can send the request.",
      softFlirt: "I appreciate the energy 😄 I’m here to keep things professional, but I can definitely help your business look sharp and convert better. What are we building?",
      smallTalk: "I’m doing great — ready to help you turn visitors into actual leads. What kind of business are we working on?"
    },
    es: {
      welcome: "Hola — bienvenido a RE IMAGE Business Solutions. Puedo ayudarle a escoger un servicio, explicar precios, tomar los detalles del proyecto o dirigirle al próximo paso. ¿Qué quiere construir o mejorar?",
      placeholder: "Pregunte sobre websites, redes sociales, AI receptionist...",
      quick: ["Ayúdame a escoger", "Precios", "AI Receptionist", "Website", "Redes Sociales", "Empezar proyecto"],
      fallback: "Puedo ayudar con websites, manejo de redes sociales, AI receptionists, automatización, precios, tiempos, portal de cliente o empezar un proyecto. ¿Qué necesita?",
      askName: "Claro. Voy a tomar los detalles importantes para que RE IMAGE pueda darle seguimiento. ¿Cuál es su nombre completo?",
      askEmail: "Gracias. ¿Qué email debemos usar para contactarle?",
      askPhone: "¿Qué número de teléfono debemos usar?",
      askBusiness: "¿Cuál es el nombre del negocio? Si todavía no tiene uno, puede decir ‘todavía no.’",
      askService: "¿Qué servicio le interesa más?",
      askGoal: "¿Qué quiere lograr? Ejemplo: conseguir más clientes, rehacer el website, agregar AI receptionist, manejar redes sociales, automatizar intake o organizar operaciones.",
      askBudget: "¿Tiene un presupuesto o paquete preferido? También puede decir ‘no estoy seguro.’",
      askUrgency: "¿Cuándo quiere empezar?",
      confirm: "Esto es lo que voy a enviar:",
      success: "Perfecto — envié su solicitud a RE IMAGE. Alguien puede revisarla y darle seguimiento. También puede usar la página Start With Us para programar directo.",
      fail: "Tuve problema enviando la solicitud desde el chat. Use la forma Start With Us y sus detalles llegan igual.",
      required: "Necesito ese detalle antes de enviar la solicitud.",
      softFlirt: "Gracias por la energía 😄 Mantengo esto profesional, pero sí puedo ayudar a que su negocio se vea brutal y convierta mejor. ¿Qué vamos a construir?",
      smallTalk: "Estoy muy bien — listo para ayudarle a convertir visitantes en clientes reales. ¿Qué tipo de negocio tiene?"
    }
  };

  const keywords = {
    spanish: ["hola", "buenas", "gracias", "precio", "cuanto", "cuánto", "pagina", "página", "redes", "cita", "negocio", "automatizacion", "automatización", "empezar", "servicio"],
    start: ["start", "get started", "begin", "sign up", "contact", "talk", "consultation", "schedule", "book", "project", "quote", "proposal", "empezar", "comenzar", "consulta", "cita", "contactar", "proyecto"],
    choose: ["choose", "which", "recommend", "best", "not sure", "help me", "what do i need", "difference", "compare", "escoger", "cual", "cuál", "recomienda", "no se", "no sé", "diferencia"],
    pricing: ["price", "pricing", "cost", "how much", "monthly", "week", "package", "payment", "stripe", "budget", "precio", "cuanto", "cuánto", "costo", "mensual", "semanal", "paquete", "pago", "presupuesto"],
    website: ["website", "web site", "site", "landing page", "seo", "google", "domain", "hosting", "mobile", "redesign", "webpage", "pagina web", "página web", "sitio", "dominio"],
    social: ["social", "instagram", "facebook", "tiktok", "reel", "reels", "content", "post", "posting", "caption", "messages", "dm", "redes", "contenido", "publicar", "mensajes"],
    aiReceptionist: ["ai receptionist", "receptionist", "chatbot", "phone bot", "answer calls", "missed calls", "web receptionist", "phone receptionist", "virtual receptionist", "front desk", "recepcionista", "chat bot", "contestar llamadas", "llamadas perdidas"],
    automation: ["automation", "automate", "workflow", "crm", "intake", "forms", "admin", "portal", "follow up", "supabase", "stripe", "zapier", "automatización", "automatizacion", "flujo", "formularios"],
    portal: ["client portal", "login", "portal", "account", "dashboard", "admin", "password", "log in", "iniciar sesión", "cuenta"],
    careers: ["job", "career", "hiring", "work for", "apply", "trabajo", "empleo", "contratando", "aplicar"],
    timeline: ["how long", "timeline", "when", "deadline", "turnaround", "launch", "cuanto tarda", "cuánto tarda", "tiempo", "cuando", "cuándo"],
    smalltalk: ["how are you", "what's up", "whats up", "hello", "hey", "hi", "yo", "good morning", "good afternoon", "como estas", "cómo estás", "que tal", "qué tal"],
    flirt: ["cute", "sexy", "beautiful", "love you", "date", "flirt", "handsome", "preciosa", "guapa", "linda", "amor", "cita conmigo"]
  };

  function lower(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function hasAny(text, arr) {
    const t = lower(text);
    return arr.some(k => t.includes(lower(k)));
  }

  function t(key) {
    return copy[state.lang]?.[key] || copy.en[key] || "";
  }

  function detectLang(text) {
    if (hasAny(text, keywords.spanish)) state.lang = "es";
    if (/\b(english|ingles|inglés)\b/i.test(text)) state.lang = "en";
    if (/\b(espanol|español|spanish)\b/i.test(text)) state.lang = "es";
  }

  function detectIntent(text) {
    if (hasAny(text, keywords.flirt)) return "flirt";
    if (hasAny(text, keywords.start)) return "start";
    if (hasAny(text, keywords.aiReceptionist)) return "aiReceptionist";
    if (hasAny(text, keywords.website)) return "website";
    if (hasAny(text, keywords.social)) return "social";
    if (hasAny(text, keywords.automation)) return "automation";
    if (hasAny(text, keywords.pricing)) return "pricing";
    if (hasAny(text, keywords.choose)) return "choose";
    if (hasAny(text, keywords.portal)) return "portal";
    if (hasAny(text, keywords.careers)) return "careers";
    if (hasAny(text, keywords.timeline)) return "timeline";
    if (hasAny(text, keywords.smalltalk)) return "smalltalk";
    return "fallback";
  }

  function pricingReply() {
    if (state.lang === "es") {
      return [
        "Estos son los precios claros que están publicados:",
        "• AI Receptionist Phone: $99/mes",
        "• AI Web Receptionist Chatbot: $69.99/mes",
        "• AI Automation: $249/semana",
        "• Social Media: 1 reel profesional $149, 3 reels $399, manejo de cuenta $99/semana",
        "• Websites, Growth Foundation y Full Scale System dependen del alcance. Lo mejor es enviar los detalles para cotización."
      ].join("\n");
    }

    return [
      "Here’s the clean pricing we have published:",
      "• AI Receptionist Phone: $99/month",
      "• AI Web Receptionist Chatbot: $69.99/month",
      "• AI Automation: $249/week",
      "• Social Media: 1 professional reel $149, 3 reels $399, account management $99/week",
      "• Websites, Growth Foundation, and Full Scale System depend on scope, so the best move is to send project details for a quote."
    ].join("\n");
  }

  function chooseReply() {
    if (state.lang === "es") {
      return [
        "Le ayudo a escoger rápido:",
        "• Si necesita verse profesional online → Website Development.",
        "• Si pierde llamadas o preguntas repetidas → AI Receptionist Phone o Web Chatbot.",
        "• Si necesita contenido y presencia → Social Media Management.",
        "• Si ya tiene procesos desordenados → AI Automation o Full Scale System.",
        "• Si está empezando y necesita base → Growth Foundation.",
        "Si me dice el tipo de negocio y el problema principal, le digo cuál empezaría primero."
      ].join("\n");
    }

    return [
      "Here’s the fastest way to choose:",
      "• Need to look professional online → Website Development.",
      "• Missing calls or repeating the same answers → AI Receptionist Phone or Web Chatbot.",
      "• Need content and visibility → Social Media Management.",
      "• Messy operations or manual follow-up → AI Automation or Full Scale System.",
      "• Starting from scratch → Growth Foundation.",
      "Tell me your business type and biggest problem, and I’ll point you to the best starting option."
    ].join("\n");
  }

  function serviceReply(intent) {
    const langEs = state.lang === "es";

    if (intent === "website") {
      return langEs
        ? "Website Development es para negocios que necesitan una página profesional, clara y lista para convertir visitantes en leads. Puede incluir páginas de servicio, llamadas a la acción, diseño móvil, SEO básico, formularios y estructura para crecer."
        : "Website Development is for businesses that need a professional, conversion-focused site. It can include service pages, calls to action, mobile polish, SEO basics, forms, and a structure that helps turn visitors into leads.";
    }

    if (intent === "social") {
      return langEs
        ? "Social Media Management puede ser contenido profesional o manejo de cuenta. Los paquetes publicados incluyen 1 reel profesional por $149, 3 reels por $399, o manejo de cuenta por $99/semana usando contenido hecho por el dueño."
        : "Social Media Management can mean professional content or account operation. Published options include 1 professionally shot reel for $149, 3 reels for $399, or account management for $99/week using owner-made content.";
    }

    if (intent === "aiReceptionist") {
      return langEs
        ? "AI Receptionists ayudan a contestar preguntas, capturar leads y dirigir clientes al próximo paso. Phone Receptionist cuesta $99/mes. Web Receptionist Chatbot cuesta $69.99/mes. También se pueden usar juntos."
        : "AI Receptionists help answer questions, capture leads, and guide customers to the next step. Phone Receptionist is $99/month. Web Receptionist Chatbot is $69.99/month. They can also work together.";
    }

    if (intent === "automation") {
      return langEs
        ? "AI Automation es para automatizar tareas como intake, follow-up, formularios, mensajes, administración y procesos internos. El servicio publicado es $249/semana y se ajusta al flujo del negocio."
        : "AI Automation is for automating intake, follow-up, forms, messages, admin work, and internal workflows. The published service is $249/week and is tailored around the business process.";
    }

    return [
      `• ${CONFIG.services.website.label}: ${CONFIG.services.website.summary}`,
      `• ${CONFIG.services.social.label}: ${CONFIG.services.social.summary}`,
      `• ${CONFIG.services.phone.label}: ${CONFIG.services.phone.price}`,
      `• ${CONFIG.services.webbot.label}: ${CONFIG.services.webbot.price}`,
      `• ${CONFIG.services.automation.label}: ${CONFIG.services.automation.price}`,
      `• ${CONFIG.services.growth.label} / ${CONFIG.services.full.label}: custom systems based on business needs.`
    ].join("\n");
  }

  function bot(text, chips) {
    addMessage("bot", text);
    if (chips?.length) addChips(chips);
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

    chips.forEach(label => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = label;
      btn.addEventListener("click", () => handleInput(label));
      wrap.appendChild(btn);
    });

    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
  }

  function startLead(service) {
    state.lead = freshLead();
    if (service) state.lead.service = service;
    state.step = "name";
    bot(t("askName"));
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
      `Interested service: ${l.service || "—"}`,
      `Goal / problem: ${l.goal || l.message || "—"}`,
      `Budget: ${l.budget || "—"}`,
      `Timeline: ${l.urgency || "—"}`,
      `Language: ${state.lang}`,
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
      `${t("confirm")}\n\nName: ${l.name}\nEmail: ${l.email}\nPhone: ${l.phone}\nBusiness: ${l.business}\nService: ${l.service}\nGoal: ${l.goal}\nBudget: ${l.budget || "Not sure"}\nTimeline: ${l.urgency || "Not sure"}`,
      state.lang === "es"
        ? ["Confirmar", "Cambiar servicio", "Abrir forma"]
        : ["Confirm", "Change service", "Open form"]
    );

    state.step = "confirm";
  }

  async function handleLeadStep(text) {
    const value = text.trim();

    if (state.step === "name") {
      if (value.length < 2) return bot(t("required"));
      state.lead.name = value;
      state.step = "email";
      return bot(t("askEmail"));
    }

    if (state.step === "email") {
      if (!validateEmail(value)) {
        return bot(state.lang === "es" ? "Necesito un email válido para enviar la solicitud." : "I need a valid email before I can send the request.");
      }
      state.lead.email = value;
      state.step = "phone";
      return bot(t("askPhone"));
    }

    if (state.step === "phone") {
      if (!validatePhone(value)) {
        return bot(state.lang === "es" ? "Necesito un número de teléfono válido con área." : "I need a valid phone number with area code.");
      }
      state.lead.phone = value;
      state.step = "business";
      return bot(t("askBusiness"));
    }

    if (state.step === "business") {
      state.lead.business = value;
      state.step = "service";
      return bot(t("askService"), serviceChips());
    }

    if (state.step === "service") {
      state.lead.service = normalizeService(value);
      state.step = "goal";
      return bot(t("askGoal"));
    }

    if (state.step === "goal") {
      state.lead.goal = value;
      state.lead.message = value;
      state.step = "budget";
      return bot(t("askBudget"), state.lang === "es" ? ["No estoy seguro", "$100-$300", "$300-$750", "$750+"] : ["Not sure", "$100-$300", "$300-$750", "$750+"]);
    }

    if (state.step === "budget") {
      state.lead.budget = value;
      state.step = "urgency";
      return bot(t("askUrgency"), state.lang === "es" ? ["ASAP", "Esta semana", "Este mes", "Solo investigando"] : ["ASAP", "This week", "This month", "Just researching"]);
    }

    if (state.step === "urgency") {
      state.lead.urgency = value;
      return finishLead();
    }

    if (state.step === "confirm") {
      if (/confirm|yes|send|submit|ok|dale|si|sí|confirmar/i.test(value)) {
        try {
          state.busy = true;
          await saveLead();
          state.step = null;
          state.busy = false;
          return bot(t("success"), state.lang === "es" ? ["Nuevo proyecto", "Ver precios", "Portal cliente"] : ["New project", "View pricing", "Client portal"]);
        } catch (e) {
          console.error("RE IMAGE receptionist lead failed", e);
          state.busy = false;
          return bot(t("fail"), state.lang === "es" ? ["Abrir forma", "Intentar otra vez"] : ["Open form", "Try again"]);
        }
      }

      if (/change|service|cambiar/i.test(value)) {
        state.step = "service";
        return bot(t("askService"), serviceChips());
      }

      return bot(state.lang === "es" ? "Puede escribir Confirmar para enviarlo, Cambiar servicio, o Abrir forma." : "Type Confirm to send it, Change service, or Open form.");
    }
  }

  function normalizeService(v) {
    const text = lower(v);

    if (hasAny(text, keywords.aiReceptionist)) {
      if (text.includes("phone") || text.includes("call") || text.includes("llamada")) return "AI Receptionist Phone";
      if (text.includes("web") || text.includes("chat")) return "AI Web Receptionist Chatbot";
      return "AI Receptionists";
    }

    if (hasAny(text, keywords.website)) return "Website Development";
    if (hasAny(text, keywords.social)) return "Social Media Management";
    if (hasAny(text, keywords.automation)) return "AI Automation";
    if (text.includes("growth")) return "Growth Foundation";
    if (text.includes("full")) return "Full Scale System";

    return v;
  }

  function serviceChips() {
    return [
      "Website Development",
      "Social Media Management",
      "AI Receptionist Phone",
      "AI Web Receptionist Chatbot",
      "AI Automation",
      "Not sure"
    ];
  }

  function routeChip(label) {
    const tLabel = lower(label);

    if (tLabel.includes("open form") || tLabel.includes("abrir forma")) {
      window.location.href = CONFIG.startUrl;
      return true;
    }

    if (tLabel.includes("client portal") || tLabel.includes("portal cliente")) {
      window.open(CONFIG.clientPortalUrl, "_blank");
      return true;
    }

    if (tLabel.includes("pricing") || tLabel.includes("precios") || tLabel.includes("view pricing")) {
      bot(pricingReply(), ["Start a project", "AI Receptionist", "Website", "Social Media"]);
      return true;
    }

    if (tLabel.includes("new project") || tLabel.includes("start a project") || tLabel.includes("nuevo proyecto") || tLabel.includes("empezar proyecto")) {
      startLead();
      return true;
    }

    if (tLabel.includes("open careers")) {
      window.location.href = CONFIG.careersUrl;
      return true;
    }

    return false;
  }

  function handleInput(raw) {
    const text = String(raw || "").trim();
    if (!text || state.busy) return;

    user(text);
    detectLang(text);

    const input = document.querySelector(".reibot-input");
    if (input) input.value = "";

    if (routeChip(text)) return;
    if (state.step) return handleLeadStep(text);

    const intent = detectIntent(text);

    switch (intent) {
      case "flirt":
        return bot(t("softFlirt"), ["Start a project", "Pricing", "Website"]);

      case "smalltalk":
        return bot(t("smallTalk"), state.lang === "es" ? ["Ver servicios", "Precios", "Empezar"] : ["View services", "Pricing", "Get started"]);

      case "start":
        return startLead();

      case "choose":
        return bot(chooseReply(), ["Website", "AI Receptionist", "Social Media", "Start a project"]);

      case "pricing":
        return bot(pricingReply(), ["Start a project", "AI Receptionist", "Social Media", "Website"]);

      case "website":
      case "social":
      case "aiReceptionist":
      case "automation":
        return bot(serviceReply(intent), state.lang === "es" ? ["Empezar proyecto", "Precios", "Ayúdame a escoger"] : ["Start a project", "Pricing", "Help me choose"]);

      case "portal":
        return bot(
          state.lang === "es"
            ? "El portal de cliente está en login.reimagebs.com. Si todavía no tiene cuenta o necesita acceso, use Start With Us y RE IMAGE puede ayudarle."
            : "The client portal is at login.reimagebs.com. If you do not have an account or need access, use Start With Us and RE IMAGE can help.",
          ["Client portal", "Start a project"]
        );

      case "careers":
        return bot(
          state.lang === "es"
            ? "Para oportunidades de trabajo, use la página Careers. Si quiere, puedo abrirla."
            : "For job opportunities, use the Careers page. I can open it for you.",
          ["Open careers", "Start a project"]
        );

      case "timeline":
        return bot(
          state.lang === "es"
            ? "El tiempo depende del alcance. Un chatbot o receptionist simple puede moverse más rápido; websites y sistemas completos dependen de páginas, contenido, integraciones y revisiones. Lo mejor es enviar los detalles para una estimación real."
            : "Timeline depends on scope. A simple chatbot or receptionist setup can move faster; websites and full systems depend on pages, content, integrations, and revisions. The best move is to send the details for a real estimate.",
          ["Start a project", "Help me choose"]
        );

      default:
        return bot(t("fallback"), state.lang === "es" ? ["Ayúdame a escoger", "Precios", "Empezar proyecto"] : ["Help me choose", "Pricing", "Start a project"]);
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
    launch.innerHTML = `<b>AI</b><span>Help</span>`;

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
          <input class="reibot-input" type="text" autocomplete="off" placeholder="${t("placeholder")}">
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
        bot(t("welcome"), t("quick"));
      }

      setTimeout(() => input && input.focus(), 50);
    }

    function closePanel() {
      panel.classList.remove("open");
      state.open = false;
    }

    launch.addEventListener("click", () => state.open ? closePanel() : openPanel());
    close.addEventListener("click", closePanel);

    form.addEventListener("submit", e => {
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