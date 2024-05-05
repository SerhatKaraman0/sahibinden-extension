let url = document.URL;

function getMainSpecs() {
  const itemName = document.querySelectorAll(".classifiedInfoList strong");
  const val = document.querySelectorAll(".classifiedInfoList span");
  const oto_json = {};

  for (let i = 0; i < itemName.length; i++) {
    oto_json[itemName[i].innerText.trim()] = val[i].innerText.trim();
  }

  return { general_info: oto_json };
}

function getDesc() {
  const descContainer = document.querySelector(".uiBoxContainer");
  if (descContainer) {
    const descContainerText = descContainer.innerText.trim();
    return { description: descContainerText };
  }
  return { description: "" }; // Return empty description if container is not found
}

function getDamageInfo() {
  const allInfos = document.querySelectorAll(
    ".uiBoxContainer.classifiedDescription"
  );
  let resultJson = {};

  allInfos.forEach((info) => {
    const h3 = info.querySelector("h3");
    const ul = info.querySelector("ul");

    if (h3 && ul) {
      const sectionName = h3.textContent.trim();
      const liItems = ul.querySelectorAll("li");
      const available = [];
      const unavailable = [];

      liItems.forEach((li) => {
        const partName = li.textContent.trim();
        if (li.classList.contains("selected")) {
          available.push(partName);
        } else {
          unavailable.push(partName);
        }
      });

      resultJson[sectionName] = {
        available,
        unavailable,
      };
    }
  });

  return { damage_info: resultJson };
}

function getTechDetails() {
  const res = {};
  document.querySelectorAll("h3").forEach((h3) => {
    const table = h3.nextElementSibling;
    const title = h3.innerText.trim();

    const titles = [];
    const values = {};

    if (table) {
      const tdItems = table.querySelectorAll("tr td");
      tdItems.forEach((td) => {
        if (td.classList.contains("title")) {
          titles.push(td.innerText.trim());
        } else {
          values[titles[titles.length - 1]] = td.innerText.trim();
        }
      });
    }

    if (Object.keys(values).length > 0) {
      res[title] = values;
    }
  });

  return { tech_details: res };
}

function storeDataInStorage() {
  const specs = getMainSpecs() || {};
  const desc = getDesc() || {};
  const damageInfo = getDamageInfo() || {};
  const techDetails = getTechDetails() || {};

  const mergedObj = { ...specs, ...desc, ...damageInfo, ...techDetails };

  chrome.storage.local.set({ myJsonData: mergedObj }, () => {
    console.log("JSON data stored successfully");
  });
}

function reloadContentScript() {
  // Re-run data extraction and storage
  storeDataInStorage();
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "reloadContentScript") {
    reloadContentScript();
  }
});

// Initial data extraction and storage
storeDataInStorage();

// Create a new MutationObserver instance to watch for DOM mutations
const observer = new MutationObserver((mutationsList) => {
  mutationsList.forEach((mutation) => {
    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
      // Handle DOM mutations and update stored data
      storeDataInStorage();
    }
  });
});

// Start observing the document body for mutations
const observerConfig = {
  childList: true,
  subtree: true,
};

observer.observe(document.body, observerConfig);
