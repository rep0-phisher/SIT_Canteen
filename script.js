"use strict";

const FOOD = [
  {
    id: 1, name: "Masala Dosa", category: "Meals", price: 60,
    description: "Crispy dosa with potato masala and chutney.",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=650&q=80",
    badge: "Popular", available: true
  },
  {
    id: 2, name: "Veg Sandwich", category: "Fast Food", price: 45,
    description: "Toasted bread filled with fresh vegetables.",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=650&q=80",
    badge: "", available: true
  },
  {
    id: 3, name: "Samosa (2 pcs)", category: "Snacks", price: 25,
    description: "Golden, crispy pastry with spiced potato.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=650&q=80",
    badge: "Student favourite", available: true
  },
  {
    id: 4, name: "Veg Burger", category: "Fast Food", price: 70,
    description: "Veg patty, crunchy lettuce and house sauce.",
    image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=650&q=80",
    badge: "", available: true
  },
  {
    id: 5, name: "Veg Thali", category: "Meals", price: 100,
    description: "A filling Indian meal with rice, roti and sabzi.",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=650&q=80",
    badge: "Filling meal", available: true
  },
  {
    id: 6, name: "Poha", category: "Snacks", price: 30,
    description: "Light poha with peanuts and fresh coriander.",
    image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=650&q=80",
    badge: "", available: true
  },
  {
    id: 7, name: "Masala Chai", category: "Drinks", price: 15,
    description: "Warm Indian tea with aromatic spices.",
    image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=650&q=80",
    badge: "Budget pick", available: true
  },
  {
    id: 8, name: "Cold Coffee", category: "Drinks", price: 50,
    description: "Chilled, creamy coffee for your study break.",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=650&q=80",
    badge: "", available: true
  },
  {
    id: 9, name: "French Fries", category: "Snacks", price: 55,
    description: "Crispy golden fries with a pinch of seasoning.",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=650&q=80",
    badge: "", available: true
  },
  {
    id: 10, name: "Paneer Roll", category: "Fast Food", price: 65,
    description: "Soft wrap filled with spiced paneer and veggies.",
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=650&q=80",
    badge: "Popular", available: true
  },
  {
    id: 11, name: "Idli (3 pcs)", category: "Meals", price: 35,
    description: "Soft steamed idlis with chutney.",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=650&q=80",
    badge: "", available: true
  },
  {
    id: 12, name: "Fresh Lime Soda", category: "Drinks", price: 30,
    description: "Refreshing lime drink, sweet or salted.",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765edfd7?auto=format&fit=crop&w=650&q=80",
    badge: "", available: true
  }
];

const $ = (selector) => document.querySelector(selector);

const state = {
  category: "All",
  search: "",
  sort: "popular",
  cart: loadCart(),
  toastTimer: null
};

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("sit-canteen-cart") || "{}");
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};

    const valid = {};
    for (const item of FOOD) {
      const qty = saved[item.id];
      if (item.available && Number.isInteger(qty) && qty > 0 && qty <= 99) {
        valid[item.id] = qty;
      }
    }
    return valid;
  } catch {
    return {};
  }
}

function saveCart() {
  try {
    localStorage.setItem("sit-canteen-cart", JSON.stringify(state.cart));
  } catch {
    // The cart still works for this page session if storage is disabled.
  }
}

function money(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[char]);
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function filteredFood() {
  let items = FOOD.filter(item => {
    const matchesCategory =
      state.category === "All" || item.category === state.category;
    const text = `${item.name} ${item.category} ${item.description}`.toLowerCase();
    const matchesSearch = text.includes(state.search.toLowerCase().trim());
    return matchesCategory && matchesSearch;
  });

  switch (state.sort) {
    case "low":
      items.sort((a, b) => a.price - b.price);
      break;
    case "high":
      items.sort((a, b) => b.price - a.price);
      break;
    case "az":
      items.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      items.sort((a, b) =>
        Number(Boolean(b.badge)) - Number(Boolean(a.badge)) || a.id - b.id
      );
  }
  return items;
}

function renderMenu() {
  const items = filteredFood();
  $("#results-count").textContent =
    `${items.length} ${items.length === 1 ? "item" : "items"} found`;

  if (!items.length) {
    $("#food-grid").innerHTML = `
      <div class="no-results">
        <h3>No food found</h3>
        <p>Try another search or choose a different category.</p>
        <button class="primary-button" id="empty-reset" style="margin-top:16px">
          Show all food
        </button>
      </div>`;
    return;
  }

  $("#food-grid").innerHTML = items.map(item => `
    <article class="food-card">
      <div class="food-photo-wrap">
        <img class="food-photo"
          src="${escapeHTML(item.image)}"
          alt="${escapeHTML(item.name)}"
          loading="lazy">
        ${item.badge ? `<span class="food-badge">${escapeHTML(item.badge)}</span>` : ""}
        ${!item.available ? '<span class="food-badge sold-out">Sold out</span>' : ""}
      </div>
      <div class="food-info">
        <span class="food-category">${escapeHTML(item.category)}</span>
        <h3 class="food-name">${escapeHTML(item.name)}</h3>
        <p class="food-description">${escapeHTML(item.description)}</p>
        <div class="food-bottom">
          <span class="food-price">${money(item.price)}</span>
          <button class="add-button" data-add="${item.id}"
            ${!item.available ? "disabled" : ""}>
            ${item.available ? "+ Add" : "Unavailable"}
          </button>
        </div>
      </div>
    </article>
  `).join("");

  $("#food-grid").querySelectorAll(".food-photo").forEach(img => {
    img.addEventListener("error", () => {
      img.style.display = "none";
      img.parentElement.style.background =
        "linear-gradient(135deg,#e8eadb,#f7edda)";
      img.parentElement.setAttribute("aria-label", "Food image unavailable");
    }, { once: true });
  });
}

function cartCount() {
  return Object.values(state.cart).reduce((sum, qty) => sum + qty, 0);
}

function cartTotal() {
  return FOOD.reduce(
    (sum, item) => sum + item.price * (state.cart[item.id] || 0), 0
  );
}

function renderCart() {
  const entries = FOOD.filter(item => state.cart[item.id] > 0);
  const count = cartCount();
  const total = cartTotal();

  $("#cart-count").textContent = count;
  $("#cart-items").innerHTML = entries.map(item => `
    <div class="cart-line">
      <img class="cart-thumb" src="${escapeHTML(item.image)}"
        alt="${escapeHTML(item.name)}">
      <div class="cart-line-main">
        <h3>${escapeHTML(item.name)}</h3>
        <p>${money(item.price * state.cart[item.id])}</p>
        <div class="quantity-controls" aria-label="Quantity for ${escapeHTML(item.name)}">
          <button data-change="${item.id}" data-delta="-1"
            aria-label="Remove one ${escapeHTML(item.name)}">−</button>
          <span>${state.cart[item.id]}</span>
          <button data-change="${item.id}" data-delta="1"
            aria-label="Add one ${escapeHTML(item.name)}"
            ${state.cart[item.id] >= 99 ? "disabled" : ""}>+</button>
        </div>
      </div>
      <button class="icon-button" data-remove="${item.id}"
        aria-label="Remove ${escapeHTML(item.name)} from cart">✕</button>
    </div>
  `).join("");

  $("#cart-empty").hidden = count !== 0;
  $("#cart-items").hidden = count === 0;
  $("#cart-summary").hidden = count === 0;
  $("#cart-subtotal").textContent = money(total);
  $("#cart-total").textContent = money(total);
  $("#checkout-total").textContent = money(total);
}

function setCartOpen(open) {
  $("#cart-overlay").hidden = !open;
  document.body.classList.toggle(
    "locked", open || !$("#checkout-overlay").hidden || !$("#success-overlay").hidden
  );
  if (open) $("#cart-title").focus?.();
}

function openCheckout() {
  if (!cartCount()) {
    showToast("Your cart is empty. Add some food first.");
    return;
  }
  setCartOpen(false);
  $("#checkout-overlay").hidden = false;
  document.body.classList.add("locked");
  $("#customer-name").focus();
}

function closeCheckout() {
  $("#checkout-overlay").hidden = true;
  document.body.classList.remove("locked");
}

function makeOrderNumber() {
  return "SIT-" + Date.now().toString().slice(-8);
}

function placeOrder(event) {
  event.preventDefault();
  if (!cartCount()) {
    closeCheckout();
    showToast("Your cart is empty.");
    return;
  }

  const form = new FormData($("#checkout-form"));
  const customerName = String(form.get("customerName") || "").trim();
  const studentId = String(form.get("studentId") || "").trim();
  const pickupTime = String(form.get("pickupTime") || "");

  if (!customerName) {
    $("#customer-name").focus();
    return;
  }

  // Capture a snapshot before clearing the cart.
  const order = {
    number: makeOrderNumber(),
    customerName,
    studentId,
    pickupTime,
    total: cartTotal(),
    items: FOOD.filter(item => state.cart[item.id] > 0).map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: state.cart[item.id]
    })),
    createdAt: new Date().toISOString(),
    payment: "Pay at counter",
    status: "Demo order"
  };

  // This is browser-only demo storage, not a real order submission.
  try {
    const history = JSON.parse(localStorage.getItem("sit-canteen-orders") || "[]");
    const safeHistory = Array.isArray(history) ? history : [];
    safeHistory.push(order);
    localStorage.setItem("sit-canteen-orders", JSON.stringify(safeHistory.slice(-30)));
  } catch {
    // Confirmation still works if local storage is unavailable.
  }

  $("#order-number").textContent = order.number;
  $("#order-customer").textContent = order.customerName;
  $("#order-pickup").textContent = order.pickupTime;
  $("#order-amount").textContent = money(order.total);

  state.cart = {};
  saveCart();
  renderCart();
  renderMenu();
  $("#checkout-form").reset();
  closeCheckout();
  $("#success-overlay").hidden = false;
  document.body.classList.add("locked");
}

function resetFilters() {
  state.category = "All";
  state.search = "";
  state.sort = "popular";
  $("#search-input").value = "";
  $("#sort-select").value = "popular";
  $("#category-list").querySelectorAll("[data-category]").forEach(button => {
    button.classList.toggle("active", button.dataset.category === "All");
  });
  renderMenu();
}

$("#search-input").addEventListener("input", event => {
  state.search = event.target.value;
  renderMenu();
});

$("#sort-select").addEventListener("change", event => {
  state.sort = event.target.value;
  renderMenu();
});

$("#category-list").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.category = button.dataset.category;
  $("#category-list").querySelectorAll("[data-category]").forEach(chip => {
    chip.classList.toggle("active", chip === button);
  });
  renderMenu();
});

$("#food-grid").addEventListener("click", event => {
  if (event.target.closest("#empty-reset")) {
    resetFilters();
    return;
  }

  const button = event.target.closest("[data-add]");
  if (!button) return;

  const id = Number(button.dataset.add);
  const item = FOOD.find(food => food.id === id);
  if (!item || !item.available) return;

  const currentQty = state.cart[id] || 0;
  if (currentQty >= 99) {
    showToast("Maximum quantity is 99 per item.");
    return;
  }

  state.cart[id] = currentQty + 1;
  saveCart();
  renderCart();
  showToast(`${item.name} added to your cart.`);
});

$("#cart-items").addEventListener("click", event => {
  const changeButton = event.target.closest("[data-change]");
  const removeButton = event.target.closest("[data-remove]");

  if (removeButton) {
    delete state.cart[Number(removeButton.dataset.remove)];
  } else if (changeButton) {
    const id = Number(changeButton.dataset.change);
    const delta = Number(changeButton.dataset.delta);
    const next = (state.cart[id] || 0) + delta;

    if (next <= 0) delete state.cart[id];
    else if (next <= 99) state.cart[id] = next;
  } else {
    return;
  }

  saveCart();
  renderCart();
});

$("#open-cart").addEventListener("click", () => setCartOpen(true));
document.querySelectorAll("[data-close-cart]").forEach(button => {
  button.addEventListener("click", () => setCartOpen(false));
});

$("#checkout-button").addEventListener("click", openCheckout);
$("#close-checkout").addEventListener("click", closeCheckout);
$("#checkout-form").addEventListener("submit", placeOrder);

$("#finish-order").addEventListener("click", () => {
  $("#success-overlay").hidden = true;
  document.body.classList.remove("locked");
  window.location.hash = "menu";
  showToast("Demo order complete. Thank you!");
});

$("#clear-filters").addEventListener("click", resetFilters);

$("#search-input").addEventListener("keydown", event => {
  if (event.key === "Escape") {
    event.target.value = "";
    state.search = "";
    renderMenu();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    if (!$("#success-overlay").hidden) {
      $("#success-overlay").hidden = true;
      document.body.classList.remove("locked");
    } else if (!$("#checkout-overlay").hidden) {
      closeCheckout();
    } else if (!$("#cart-overlay").hidden) {
      setCartOpen(false);
    }
  }

  if (event.key === "/" &&
      !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    $("#search-input").focus();
  }
});

$("#footer-year").textContent = new Date().getFullYear();

renderMenu();
renderCart();