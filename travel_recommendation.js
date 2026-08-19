const menuToggle = document.querySelector(".menu-toggle");
const navContent = document.querySelector(".nav-content");

if (menuToggle && navContent) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    navContent.classList.toggle("open", !isOpen);
  });
}

document.querySelectorAll("[data-current-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const resetButton = document.getElementById("resetButton");
const resultsContainer = document.getElementById("recommendationResults");
const searchMessage = document.getElementById("searchMessage");
const emptyState = document.getElementById("emptyState");
let travelDataPromise;

function loadTravelData() {
  if (!travelDataPromise) {
    travelDataPromise = fetch("travel_recommendation_api.json").then((response) => {
      if (!response.ok) throw new Error(`Travel data request failed (${response.status})`);
      return response.json();
    });
  }
  return travelDataPromise;
}

function normalise(value) {
  return value.trim().toLocaleLowerCase();
}

function allDestinations(data) {
  const cities = data.countries.flatMap((country) =>
    country.cities.map((city) => ({ ...city, category: "City", country: country.name }))
  );
  const temples = data.temples.map((place) => ({ ...place, category: "Temple" }));
  const beaches = data.beaches.map((place) => ({ ...place, category: "Beach" }));
  return [...cities, ...temples, ...beaches];
}

function findRecommendations(data, rawQuery) {
  const query = normalise(rawQuery);
  const categoryAliases = {
    beach: "beaches",
    beaches: "beaches",
    temple: "temples",
    temples: "temples",
    country: "countries",
    countries: "countries"
  };
  const category = categoryAliases[query];

  if (category === "beaches") return data.beaches.map((place) => ({ ...place, category: "Beach" }));
  if (category === "temples") return data.temples.map((place) => ({ ...place, category: "Temple" }));
  if (category === "countries") {
    return data.countries.flatMap((country) =>
      country.cities.map((city) => ({ ...city, category: "City", country: country.name }))
    );
  }

  const countryMatch = data.countries.find((country) => normalise(country.name) === query);
  if (countryMatch) {
    return countryMatch.cities.map((city) => ({ ...city, category: "City", country: countryMatch.name }));
  }

  return allDestinations(data).filter((place) => {
    const searchableText = [place.name, place.description, place.category, place.country, ...(place.tags || [])]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();
    return searchableText.includes(query);
  });
}

function createRecommendationCard(place, index) {
  const card = document.createElement("article");
  card.className = "recommendation-card";
  card.style.setProperty("--card-delay", `${index * 70}ms`);

  const imageWrapper = document.createElement("div");
  imageWrapper.className = "card-image";

  const image = document.createElement("img");
  image.src = place.imageUrl;
  image.alt = place.name;
  image.loading = "lazy";
  image.addEventListener("error", () => card.classList.add("image-error"), { once: true });

  const category = document.createElement("span");
  category.className = "card-category";
  category.textContent = place.category;
  imageWrapper.append(image, category);

  const body = document.createElement("div");
  body.className = "card-body";

  const title = document.createElement("h3");
  title.textContent = place.name;

  const description = document.createElement("p");
  description.textContent = place.description;

  const button = document.createElement("button");
  button.className = "card-link";
  button.type = "button";
  button.innerHTML = "Explore place <span aria-hidden=\"true\">↗</span>";

  body.append(title, description, button);
  card.append(imageWrapper, body);
  return card;
}

function renderRecommendations(places, query) {
  resultsContainer.replaceChildren();
  emptyState.hidden = true;

  if (!places.length) {
    searchMessage.textContent = `No places matched “${query}”. Try beach, temple, country, Japan, or Brazil.`;
    emptyState.hidden = false;
    emptyState.querySelector("h3").textContent = "No passport stamp for that search—yet.";
    emptyState.querySelector("p").textContent = "Try a broader category or another country.";
    return;
  }

  searchMessage.textContent = `${places.length} recommendation${places.length === 1 ? "" : "s"} for “${query}”`;
  const fragment = document.createDocumentFragment();
  places.forEach((place, index) => fragment.append(createRecommendationCard(place, index)));
  resultsContainer.append(fragment);
}

async function runSearch(query) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    searchMessage.textContent = "Enter a destination, country, beach, or temple to begin.";
    searchInput?.focus();
    return;
  }

  searchMessage.textContent = "Finding places…";
  emptyState.hidden = true;
  resultsContainer.replaceChildren();

  try {
    const data = await loadTravelData();
    renderRecommendations(findRecommendations(data, trimmedQuery), trimmedQuery);
    document.getElementById("discover")?.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    console.error(error);
    searchMessage.textContent = "Travel data could not be loaded. Run this project through a local web server.";
    emptyState.hidden = false;
  }
}

searchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  runSearch(searchInput.value);
});

resetButton?.addEventListener("click", () => {
  searchForm.reset();
  resultsContainer.replaceChildren();
  searchMessage.textContent = "";
  emptyState.hidden = false;
  emptyState.querySelector("h3").textContent = "Your next story starts with a search.";
  emptyState.querySelector("p").textContent = "Use the search bar above or select one of the suggestions.";
  searchInput.focus();
});

document.querySelectorAll("[data-query]").forEach((button) => {
  button.addEventListener("click", () => {
    searchInput.value = button.dataset.query;
    runSearch(button.dataset.query);
  });
});

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = new FormData(contactForm).get("name").trim().split(" ")[0];
  formStatus.textContent = `Thanks, ${name}. Your enquiry has been received.`;
  formStatus.classList.add("success");
  contactForm.reset();
});
