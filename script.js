// ===============================
// Dark Mode
// ===============================
const darkModeToggle = document.getElementById('darkModeToggle');
const darkModeStatus = localStorage.getItem('darkMode');
if (darkModeStatus === 'enabled') {
  document.body.classList.add('dark-mode');
  if (darkModeToggle) darkModeToggle.textContent = "Light Mode";
} else {
  if (darkModeToggle) darkModeToggle.textContent = "Dark Mode";
}

if (darkModeToggle) {
  darkModeToggle.addEventListener('click', e => {
    e.preventDefault();
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('darkMode', 'enabled');
      darkModeToggle.textContent = "Light Mode";
    } else {
      localStorage.setItem('darkMode', 'disabled');
      darkModeToggle.textContent = "Dark Mode";
    }
  });
}

// ===============================
// Navbar Dropdown
// ===============================
const accountBtn = document.getElementById('account-btn');
const dropdown = accountBtn?.parentElement;
if (accountBtn) {
  accountBtn.addEventListener('click', e => {
    e.stopPropagation();
    dropdown.classList.toggle('active');
  });
}
window.addEventListener('click', e => {
  if (dropdown && !dropdown.contains(e.target)) dropdown.classList.remove('active');
});

// ===============================
// Listings & Posting
// ===============================
const postItemLink = document.getElementById("postItemLink");
const postForm = document.getElementById("postItemForm");
const listingForm = document.getElementById("listingForm");
const listingsContainer = document.getElementById("listings");
const userListingsContainer = document.getElementById("userListings");

const currentUser = "User1"; // fake user
let savedListings = JSON.parse(localStorage.getItem("listings")) || [];
const isMyListingsPage = window.location.pathname.includes("mylistings");

// Show/hide post form
if (postItemLink && postForm) {
  postItemLink.addEventListener("click", e => {
    e.preventDefault();
    postForm.style.display = postForm.style.display === "none" ? "block" : "none";
  });
}

// Add new listing
if (listingForm) {
  listingForm.addEventListener("submit", e => {
    e.preventDefault();
    const title = document.getElementById("itemTitle").value;
    const desc = document.getElementById("itemDescription").value;
    const price = document.getElementById("itemPrice").value;
    const category = document.getElementById("itemCategory").value;
    const imageFile = document.getElementById("itemImageFile")?.files[0];
    const isPublic = document.getElementById("itemPublic").checked;

    function saveListing(imageData) {
      const newListing = { title, desc, price, category, imageData, owner: currentUser, isPublic };
      savedListings.push(newListing);
      localStorage.setItem("listings", JSON.stringify(savedListings));
      if (!isMyListingsPage && isPublic) renderHomeListings([]);
      if (isMyListingsPage) renderUserListings();
    }

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = e => saveListing(e.target.result);
      reader.readAsDataURL(imageFile);
    } else {
      saveListing(null);
    }

    listingForm.reset();
    if (postForm) postForm.style.display = "none";
  });
}

// ===============================
// Render Home Listings (after search)
// ===============================
function renderHomeListings(listingsArray) {
  if (!listingsContainer) return;
  listingsContainer.innerHTML = "";
  if (listingsArray.length === 0) listingsContainer.innerHTML = "<p>No listings found.</p>";
  else listingsArray.forEach(listing => addListingToDOM(listing));
}

function addListingToDOM({ title, desc, price, category, imageData }) {
  const div = document.createElement("div");
  div.classList.add("listing");
  div.innerHTML = `
    <h3>${title} - $${price}</h3>
    <p><strong>Category:</strong> ${category}</p>
    <p>${desc}</p>
    ${imageData ? `<img src="${imageData}" style="width:150px;">` : ''}
    <hr>
  `;
  listingsContainer.appendChild(div);
}

// ===============================
// My Listings Page
// ===============================
function renderUserListings() {
  if (!userListingsContainer) return;
  const allListings = JSON.parse(localStorage.getItem("listings")) || [];
  const myListings = allListings.filter(l => l.owner === currentUser);

  userListingsContainer.innerHTML = "";
  if (myListings.length === 0) {
    userListingsContainer.innerHTML = "<p>You have no listings.</p>";
    return;
  }

  myListings.forEach((listing, idx) => {
    const div = document.createElement("div");
    div.classList.add("listing");
    div.innerHTML = `
      <h3>${listing.title} - $${listing.price}</h3>
      <p><strong>Category:</strong> ${listing.category}</p>
      <p>${listing.desc}</p>
      ${listing.imageData ? `<img src="${listing.imageData}" style="width:150px;">` : ''}
      <button class="deleteBtn" data-index="${idx}">Delete</button>
      <hr>
    `;
    userListingsContainer.appendChild(div);
  });

  // Delete button
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", e => {
      const idx = parseInt(e.target.getAttribute("data-index"));
      const allListings = JSON.parse(localStorage.getItem("listings")) || [];
      const myListings = allListings.filter(l => l.owner === currentUser);
      const listingToDelete = myListings[idx];
      const updatedListings = allListings.filter(l => l !== listingToDelete);
      localStorage.setItem("listings", JSON.stringify(updatedListings));
      renderUserListings();
    });
  });
}

// Initial render for My Listings page
if (isMyListingsPage) renderUserListings();

// ===============================
// Search on Home Page
// ===============================
const applyBtn = document.getElementById("applyFilters");
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");

if (applyBtn) {
  applyBtn.addEventListener("click", () => {
    const searchText = searchInput.value.toLowerCase();
    const category = categorySelect.value.toLowerCase();
    const results = savedListings.filter(l => {
      if (!l.isPublic) return false;
      const matchText = l.title.toLowerCase().includes(searchText) || l.desc.toLowerCase().includes(searchText);
      const matchCat = category === "" || l.category.toLowerCase() === category;
      return matchText && matchCat;
    });
    renderHomeListings(results);
  });
}
