const businesses = [
  {
    id: "carcraft",
    name: "Car Craft Auto Body",
    short: "CC",
    type: "Automotive",
    color: "#f04444",
    x: 298,
    y: 510,
    description: "A conversion-ready automotive hub with vehicle inventory, service pages, towing support, and a frictionless photo-estimate flow.",
    action: "Request a photo estimate",
    hotspot: "Start photo estimate",
    website: "https://carcraftautobodytowing.com/",
    gallery: ["assets/carcraft-home-new.png", "assets/carcraft-photo-estimate.png", "assets/carcraft-admin-dashboard.png"]
  },
  {
    id: "rentme",
    name: "Rent Me CT",
    short: "RM",
    type: "Luxury rentals",
    color: "#d5a94e",
    x: 458,
    y: 265,
    description: "A premium vehicle-rental experience with a live fleet, streamlined booking, customer accounts, and a private operations dashboard.",
    action: "Browse available rentals",
    hotspot: "Reserve a vehicle",
    website: "https://rentmect.com/",
    gallery: ["assets/rentme-home-2026.png", "assets/rentme-live-fleet-2026.png", "assets/rentme-vehicle-details-2026.png"]
  },
  {
    id: "fusion",
    name: "Fusion Health Juice Bar",
    short: "FH",
    type: "Food & wellness",
    color: "#61b846",
    x: 626,
    y: 430,
    description: "A bright product-first storefront for juices, smoothies, bowls, customer favorites, and fast online ordering.",
    action: "View menu & order",
    hotspot: "Open the menu",
    website: "https://fusionhealthjuicebar.com",
    gallery: ["assets/fusion-health-home.png", "assets/fusion-health-menu.png", "assets/fusion-health-delivery-apps.png"]
  },
  {
    id: "patio",
    name: "The Patio",
    short: "P",
    type: "Hospitality",
    color: "#20b9aa",
    x: 694,
    y: 205,
    description: "A full hospitality platform connecting guests to the venue, cocktails, events, a live menu, and space-booking experiences.",
    action: "Explore the experience",
    hotspot: "View venue experience",
    website: "https://thepatioct.com",
    gallery: ["assets/patio-home-2026.jpg", "assets/patio-drinks-2026.jpg", "assets/patio-ordering-2026.jpg"]
  },
  {
    id: "livingword",
    name: "Living Word Imprints",
    short: "LW",
    type: "Print & production",
    color: "#875de8",
    x: 216,
    y: 305,
    description: "A custom operating system for invoices, saved customer records, inventory, reporting, email updates, and live order status.",
    action: "Check an order status",
    hotspot: "Track an order",
    website: "https://status.livingwordimprints.com",
    gallery: ["assets/living-word-status-page.png", "assets/living-word-edit-invoice.png", "assets/living-word-inventory.png"]
  },
  {
    id: "empire",
    name: "Empire Elite Rides",
    short: "EE",
    type: "Private transportation",
    color: "#f0a43c",
    x: 512,
    y: 585,
    description: "A polished private-ride experience with reservation requests, customer-ready service detail, and a streamlined admin workflow.",
    action: "Request a private ride",
    hotspot: "Start a reservation",
    website: "https://empireeliterides.com",
    gallery: ["assets/empire-elite-pricing-2026.png", "assets/empire-elite-booking-2026.png", "assets/empire-elite-admin-dashboard-2026.png"]
  }
];

const boundary = [
  [70,46.4],[104,235.3],[107.4,295.5],[87.4,352.5],[97.3,420.6],[103.1,453.8],
  [100.1,491.1],[99.3,504.3],[98.4,519.8],[98.2,529.6],[101,546.4],[100.9,637.8],
  [178.5,715.8],[404.7,699.6],[652.1,674.1],[797.5,669],[827,631.2],[825.4,585.6],
  [793.3,521.3],[772.6,505.2],[714.6,485.5],[690.9,473.3],[646.9,441.5],[621.6,420.8],
  [598.1,367.2],[610.3,331.5],[655.2,300],[731.2,269.3],[772.7,230.3],[793.7,164.6],
  [790.5,116.4],[790.5,70.1],[756.6,51.2],[626.8,80.3],[667,51.5],[539.8,57.2],
  [367.4,93.4],[298.4,40.9]
];

const NS = "http://www.w3.org/2000/svg";
const mapStage = document.getElementById("mapStage");
const camera = document.getElementById("mapCamera");
const roadLayer = document.getElementById("roadLayer");
const buildingLayer = document.getElementById("buildingLayer");
const businessLayer = document.getElementById("businessLayer");
const directoryList = document.getElementById("directoryList");
const mapZoomLabel = document.getElementById("mapZoomLabel");
const previewImage = document.getElementById("previewImage");
const previewType = document.getElementById("previewType");
const previewName = document.getElementById("previewName");
const previewDescription = document.getElementById("previewDescription");
const previewWebsite = document.getElementById("previewWebsite");
const placeDialog = document.getElementById("placeDialog");
const spaceViewer = document.getElementById("spaceViewer");

let zoom = 1;
let offsetX = 0;
let offsetY = 0;
let selected = businesses[0];
let isPanning = false;
let panStart = null;
let viewerDragging = false;
let viewerStartX = 0;
let viewerPosition = 50;

function svgEl(tag, attributes = {}) {
  const el = document.createElementNS(NS, tag);
  Object.entries(attributes).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
}

function seededRandom(seed) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function pointInPolygon(x, y) {
  let inside = false;
  for (let i = 0, j = boundary.length - 1; i < boundary.length; j = i++) {
    const [xi, yi] = boundary[i];
    const [xj, yj] = boundary[j];
    const intersects = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}

function nearBusiness(x, y, radius = 58) {
  return businesses.some((business) => Math.hypot(business.x - x, business.y - y) < radius);
}

function buildingGeometry(x, y, width, height, depth) {
  const lean = width * .3;
  const top = [[x,y],[x+width,y-lean],[x+width+height,y-lean+height],[x+height,y+height]];
  const front = [top[3],top[2],[top[2][0],top[2][1]+depth],[top[3][0],top[3][1]+depth]];
  const side = [top[1],top[2],[top[2][0],top[2][1]+depth],[top[1][0],top[1][1]+depth]];
  return { top, front, side };
}

function pointsString(points) {
  return points.map((point) => point.join(",")).join(" ");
}

function addBuilding(x, y, width, height, depth, landmark = false) {
  const geometry = buildingGeometry(x, y, width, height, depth);
  const group = svgEl("g", { class: landmark ? "city-building landmark" : "city-building" });
  group.append(
    svgEl("polygon", { class: "building-front", points: pointsString(geometry.front) }),
    svgEl("polygon", { class: "building-side", points: pointsString(geometry.side) }),
    svgEl("polygon", { class: "building-top", points: pointsString(geometry.top) })
  );
  if (depth > 9) {
    group.append(svgEl("rect", {
      class: "building-window",
      x: geometry.front[3][0] + 4,
      y: geometry.front[3][1] - depth + 5,
      width: Math.max(4, width - 8),
      height: 1.5
    }));
  }
  buildingLayer.append(group);
}

function drawRoads() {
  const roads = [
    ["M105 180 C260 210 420 195 792 135", true],
    ["M95 355 C280 325 492 350 765 300", true],
    ["M115 545 C305 500 535 535 805 565", true],
    ["M190 80 C230 235 240 440 215 690", false],
    ["M360 75 C365 225 395 410 390 700", true],
    ["M535 65 C520 230 555 475 635 665", false],
    ["M690 80 C625 225 675 360 772 500", false],
    ["M110 255 C285 275 475 250 725 205", false],
    ["M115 445 C290 410 535 425 745 470", false],
    ["M265 105 C340 220 465 295 625 345", false],
    ["M180 635 C345 590 548 610 760 635", false]
  ];

  roads.forEach(([d, major]) => {
    roadLayer.append(svgEl("path", { d, class: major ? "map-road-major" : "map-road-minor" }));
    if (major) roadLayer.append(svgEl("path", { d, class: "road-center" }));
  });
}

function drawCity() {
  drawRoads();
  let index = 0;
  for (let y = 90; y <= 660; y += 34) {
    for (let x = 120; x <= 780; x += 38) {
      index += 1;
      const jitterX = seededRandom(index) * 13 - 6.5;
      const jitterY = seededRandom(index + 300) * 12 - 6;
      const bx = x + jitterX;
      const by = y + jitterY;
      if (!pointInPolygon(bx, by) || nearBusiness(bx, by)) continue;
      const width = 11 + seededRandom(index + 50) * 17;
      const height = 7 + seededRandom(index + 100) * 11;
      const isDowntown = bx > 350 && bx < 555 && by > 185 && by < 430;
      const depth = isDowntown
        ? 13 + seededRandom(index + 200) * 32
        : 5 + seededRandom(index + 200) * 10;
      addBuilding(bx, by, width, height, depth, isDowntown && depth > 30);
    }
  }
}

function drawBusiness(business, index) {
  const geometry = buildingGeometry(business.x - 19, business.y, 42, 26, 26);
  const group = svgEl("g", {
    class: "client-building",
    tabindex: "0",
    role: "button",
    "aria-label": `Focus ${business.name}`
  });
  group.dataset.business = business.id;

  const beam = svgEl("path", {
    class: "client-beam",
    d: `M${business.x - 18} ${business.y - 8} L${business.x} ${business.y - 122} L${business.x + 18} ${business.y - 8} Z`,
    fill: business.color
  });
  const front = svgEl("polygon", {
    class: "client-front",
    points: pointsString(geometry.front),
    fill: business.color
  });
  const side = svgEl("polygon", {
    class: "client-side",
    points: pointsString(geometry.side),
    fill: business.color
  });
  const top = svgEl("polygon", {
    class: "client-top",
    points: pointsString(geometry.top),
    fill: business.color
  });

  const pin = svgEl("g", { class: "client-pin", transform: `translate(${business.x + 14} ${business.y - 46})` });
  pin.append(
    svgEl("circle", { class: "client-ring", r: "24", stroke: business.color }),
    svgEl("circle", { class: "client-pin-bg", r: "17", fill: business.color })
  );
  const pinText = svgEl("text", { y: "3.5" });
  pinText.textContent = business.short;
  pin.append(pinText);

  const labelWidth = Math.max(94, business.name.length * 5.8);
  const label = svgEl("g", {
    class: "client-label",
    transform: `translate(${business.x + 14 - labelWidth / 2} ${business.y - 92})`
  });
  label.append(svgEl("rect", { width: labelWidth, height: 25, rx: "7" }));
  const labelText = svgEl("text", { x: labelWidth / 2, y: "16.5" });
  labelText.textContent = business.name;
  label.append(labelText);

  group.append(beam, front, side, top, pin, label);
  group.addEventListener("click", () => selectBusiness(business, true));
  group.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectBusiness(business, true);
    }
  });
  businessLayer.append(group);

  const item = document.createElement("button");
  item.className = "directory-item";
  item.type = "button";
  item.dataset.business = business.id;
  item.innerHTML = `
    <span class="directory-mark" style="background:${business.color}">${business.short}</span>
    <span><strong>${business.name}</strong><small>${business.type}</small></span>
    <span>›</span>
  `;
  item.addEventListener("click", () => selectBusiness(business, true));
  directoryList.append(item);
}

function setCamera() {
  camera.setAttribute("transform", `translate(${offsetX} ${offsetY}) scale(${zoom})`);
  mapZoomLabel.textContent = `${Math.round(zoom * 100)}%`;
}

function focusBusiness(business) {
  zoom = window.innerWidth < 820 ? 1.2 : 1.34;
  offsetX = 450 - business.x * zoom;
  offsetY = 380 - business.y * zoom;
  setCamera();
}

function updatePreview(business) {
  previewImage.src = business.gallery[0];
  previewImage.alt = `${business.name} project preview`;
  previewType.textContent = business.type.toUpperCase();
  previewName.textContent = business.name;
  previewDescription.textContent = business.description;
  previewWebsite.href = business.website;
}

function selectBusiness(business, shouldFocus = false) {
  selected = business;
  document.querySelectorAll("[data-business]").forEach((element) => {
    element.classList.toggle("is-active", element.dataset.business === business.id);
  });
  updatePreview(business);
  if (shouldFocus) focusBusiness(business);
}

function setZoom(nextZoom) {
  zoom = Math.min(1.85, Math.max(.72, nextZoom));
  setCamera();
}

function resetMap() {
  zoom = 1;
  offsetX = 0;
  offsetY = 0;
  setCamera();
}

function openPlace(business) {
  selected = business;
  viewerPosition = 50;
  spaceViewer.style.backgroundImage = `url("${business.gallery[0]}")`;
  spaceViewer.style.backgroundPosition = `${viewerPosition}% 10%`;
  document.getElementById("viewerBrand").textContent = business.short;
  document.getElementById("viewerBrand").style.background = business.color;
  document.getElementById("viewerName").textContent = business.name;
  document.getElementById("viewerType").textContent = business.type;
  document.getElementById("placeIndex").textContent = `${String(businesses.indexOf(business) + 1).padStart(2, "0")} / ${String(businesses.length).padStart(2, "0")}`;
  document.getElementById("placeName").textContent = business.name;
  document.getElementById("placeDescription").textContent = business.description;
  document.getElementById("hotspotLabel").textContent = business.hotspot;

  const primaryAction = document.getElementById("placePrimaryAction");
  primaryAction.textContent = business.action;
  primaryAction.href = business.website;
  primaryAction.style.background = business.color;

  const secondaryAction = document.getElementById("placeSecondaryAction");
  secondaryAction.href = `our-work.html#websites`;

  const thumbnails = document.getElementById("spaceThumbnails");
  thumbnails.innerHTML = "";
  business.gallery.forEach((image, index) => {
    const button = document.createElement("button");
    button.className = `space-thumb${index === 0 ? " is-active" : ""}`;
    button.type = "button";
    button.setAttribute("aria-label", `View ${business.name} scene ${index + 1}`);
    button.innerHTML = `<img src="${image}" alt="">`;
    button.addEventListener("click", () => {
      spaceViewer.style.backgroundImage = `url("${image}")`;
      thumbnails.querySelectorAll(".space-thumb").forEach((thumb) => thumb.classList.remove("is-active"));
      button.classList.add("is-active");
    });
    thumbnails.append(button);
  });

  if (typeof placeDialog.showModal === "function") {
    placeDialog.showModal();
  } else {
    placeDialog.setAttribute("open", "");
  }
}

drawCity();
businesses.forEach(drawBusiness);
selectBusiness(businesses[0]);
setCamera();

document.getElementById("zoomIn").addEventListener("click", () => setZoom(zoom + .16));
document.getElementById("zoomOut").addEventListener("click", () => setZoom(zoom - .16));
document.getElementById("resetMap").addEventListener("click", resetMap);
document.getElementById("enterLocation").addEventListener("click", () => openPlace(selected));
document.getElementById("dialogClose").addEventListener("click", () => placeDialog.close());
document.getElementById("viewerHotspot").addEventListener("click", () => {
  document.getElementById("placePrimaryAction").click();
});

placeDialog.addEventListener("click", (event) => {
  if (event.target === placeDialog) placeDialog.close();
});

mapStage.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button, a, .business-directory, .location-preview, .map-controls")) return;
  isPanning = true;
  panStart = { x: event.clientX, y: event.clientY, offsetX, offsetY };
  mapStage.setPointerCapture(event.pointerId);
});

mapStage.addEventListener("pointermove", (event) => {
  if (!isPanning || !panStart) return;
  const ratio = 900 / mapStage.clientWidth;
  offsetX = panStart.offsetX + (event.clientX - panStart.x) * ratio;
  offsetY = panStart.offsetY + (event.clientY - panStart.y) * ratio;
  setCamera();
});

mapStage.addEventListener("pointerup", () => {
  isPanning = false;
  panStart = null;
});

mapStage.addEventListener("pointercancel", () => {
  isPanning = false;
  panStart = null;
});

mapStage.addEventListener("wheel", (event) => {
  event.preventDefault();
  setZoom(zoom + (event.deltaY < 0 ? .1 : -.1));
}, { passive: false });

spaceViewer.addEventListener("pointerdown", (event) => {
  viewerDragging = true;
  viewerStartX = event.clientX;
  spaceViewer.setPointerCapture(event.pointerId);
});

spaceViewer.addEventListener("pointermove", (event) => {
  if (!viewerDragging) return;
  const delta = event.clientX - viewerStartX;
  viewerStartX = event.clientX;
  viewerPosition = Math.min(100, Math.max(0, viewerPosition - delta * .12));
  spaceViewer.style.backgroundPosition = `${viewerPosition}% 10%`;
});

spaceViewer.addEventListener("pointerup", () => {
  viewerDragging = false;
});

spaceViewer.addEventListener("pointercancel", () => {
  viewerDragging = false;
});

const instructions = document.getElementById("mapInstructions");
instructions.querySelector("button").addEventListener("click", () => instructions.classList.add("is-hidden"));
window.setTimeout(() => instructions.classList.add("is-hidden"), 6500);

const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
menuBtn?.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
});
document.querySelectorAll(".nav-links a").forEach((link) => link.addEventListener("click", () => {
  navLinks.classList.remove("open");
  menuBtn?.setAttribute("aria-expanded", "false");
}));
