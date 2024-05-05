const STORAGE_KEY = "favoriteTabs";
let favoriteTabs = [];

// Function to load favorited links from storage
function loadFavoriteTabs() {
  chrome.storage.sync.get(STORAGE_KEY, (data) => {
    favoriteTabs = data[STORAGE_KEY] || [];
    displayTabsAndFavorites(); // After loading favoriteTabs, display tabs and favorites
  });
}

// Function to display tabs and favorite links
function displayTabsAndFavorites() {
  chrome.tabs.query({}, (tabs) => {
    const activeTabsList = document.getElementById("activeTabs");
    const favoriteLinksList = document
      .getElementById("favoriteLinks")
      .querySelector("ul");

    // Clear any existing list items
    activeTabsList.innerHTML = "";
    favoriteLinksList.innerHTML = "";

    const filteredTabs = tabs.filter((tab) =>
      tab.url.includes("https://www.sahibinden.com/ilan/vasita-otomobil")
    );

    // Create list items for each tab
    for (const tab of filteredTabs) {
      const listItem = document.createElement("li");
      const listItemContent = document.createElement("span");
      listItemContent.textContent = `${tab.url} - ${tab.title}`;
      listItem.appendChild(listItemContent);

      const favoriteButton = document.createElement("button");
      favoriteButton.classList.add("favoriteButton");
      favoriteButton.textContent = "Favorite";

      // Check if the tab is already favorited
      if (favoriteTabs.includes(tab.url)) {
        favoriteButton.classList.add("favorited");
      }

      // Add event listener to favoriteButton
      favoriteButton.addEventListener("click", () => {
        const isFavorited = favoriteTabs.includes(tab.url);

        if (isFavorited) {
          // Remove from favorites
          favoriteTabs = favoriteTabs.filter((url) => url !== tab.url);
          favoriteButton.classList.remove("favorited");
        } else {
          // Add to favorites
          favoriteTabs.push(tab.url);
          favoriteButton.classList.add("favorited");
        }

        // Update favorite links list
        updateFavoriteLinksList();

        // Update storage (call after updating favoriteTabs)
        updateStorage();
      });

      listItem.appendChild(favoriteButton);
      activeTabsList.appendChild(listItem);
    }

    // Display favorite links
    updateFavoriteLinksList();
  });
}

// Function to update the list of favorite links in the UI
function updateFavoriteLinksList() {
  const favoriteLinksList = document
    .getElementById("favoriteLinks")
    .querySelector("ul");

  // Clear previous favorite links
  favoriteLinksList.innerHTML = "";

  // Create list items for each favorited tab URL
  for (const url of favoriteTabs) {
    const favoriteLinkItem = document.createElement("li");
    favoriteLinkItem.textContent = url;
    favoriteLinksList.appendChild(favoriteLinkItem);
  }
}

// Function to update storage with the latest favoriteTabs
function updateStorage() {
  chrome.storage.sync.set({ [STORAGE_KEY]: favoriteTabs });
}

// Function to display JSON data from local storage
function displayJsonData() {
  const jsonDisplay = document.getElementById("jsonDisplay");

  chrome.storage.local.get("myJsonData", function (data) {
    const jsonData = data.myJsonData;

    if (jsonData) {
      jsonDisplay.textContent = JSON.stringify(jsonData, null, 2);
    } else {
      jsonDisplay.textContent = "No JSON data found";
    }
  });
}

// Initialize by loading favoriteTabs and setting up MutationObserver
loadFavoriteTabs();

// Create a MutationObserver to watch for changes in the document body
const observer = new MutationObserver((mutationsList, observer) => {
  mutationsList.forEach((mutation) => {
    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
      displayJsonData();
    }
  });
});

// Start observing the target node (document body) for mutations
const observerConfig = {
  childList: true,
  subtree: true,
};

observer.observe(document.body, observerConfig);
