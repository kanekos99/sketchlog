const pagination = document.getElementById("pagination");
const postsPerPage = 6;
let posts = [];

function getCurrentPage() {
  const currentPage = getHashParms().get("page");
  return currentPage;
}

function getCurrentTag() {
  const currentTag = getHashParms().get("tag");
  return currentTag;
}

function hasTagHash() {
  currentTag = getHashParms().get("tag");
}

function handlePagination() {
  const postClassName = "post-box";
  posts = Array.from(postsContainer.getElementsByClassName(postClassName));
  const totalPages = Math.ceil(posts.length / postsPerPage);
  let currentPage = getCurrentPage();
  if (!currentPage || currentPage > totalPages || currentPage < 0) {
    currentPage = 1;
    if (!isValidHash(getCurrentTag())) {
      history.pushState(null, "", window.location.pathname);
    } else {
      location.hash = "#tag=" + getCurrentTag();
    }
  }
  displayPage(currentPage);
  window.scrollTo({ top: 0, behavior: "smooth" });
  updatePaginationControls(Number(currentPage), totalPages);
}

function updatePaginationControls(currentPage, totalPages) {
  pagination.innerHTML = "";

  if (totalPages <= 1) {
    return;
  }

  appendPreviousButton(currentPage);
  appendNumberButtons(currentPage, totalPages);
  appendNextButton(currentPage, totalPages);
}

function displayPage(page) {
  globalCurrentPage = page;
  const startIndex = (page - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  posts.forEach((post, index) => {
    if (index >= startIndex && index < endIndex) {
      post.style.display = "block";
    } else {
      post.style.display = "none";
    }
  });
}

function updatePageHash(currentPage) {
  const pageHash = "page=" + currentPage;
  if (isValidHash(getCurrentTag())) {
    location.hash = "#tag=" + getCurrentTag() + "&" + pageHash;
  } else {
    location.hash = "#page=" + currentPage;
  }
}

function appendPreviousButton(currentPage) {
  const prevLink = document.createElement("a");
  prevLink.href = "#";
  prevLink.id = "prev";
  prevLink.classList.add("disabled");

  const prevIcon = document.createElement("i");
  prevIcon.classList.add("fa", "fa-caret-left");
  prevIcon.setAttribute("aria-hidden", "true");
  prevLink.appendChild(prevIcon);

  pagination.appendChild(prevLink);

  prevLink.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      updatePageHash(currentPage);
    }
  });

  if (currentPage === 1) {
    prevLink.classList.add("disabled");
  } else {
    prevLink.classList.remove("disabled");
  }
}

function appendNumberButtons(currentPage, totalPages) {
  for (let i = 1; i <= totalPages; i++) {
    const pageLink = document.createElement("a");
    pageLink.href = "#";
    pageLink.classList.add("page-link");
    if (i === 1) {
      pageLink.classList.add("active");
    }
    pageLink.dataset.page = i;
    pageLink.textContent = i;

    pagination.appendChild(pageLink);

    pageLink.addEventListener("click", (e) => {
      e.preventDefault();
      const page = parseInt(pageLink.getAttribute("data-page"));
      if (page !== currentPage) {
        currentPage = page;
        updatePageHash(currentPage);
      }
    });
  }

  const pageLinks = document.querySelectorAll(".page-link");

  pageLinks.forEach((link) => {
    const page = parseInt(link.getAttribute("data-page"));
    link.classList.toggle("active", page === currentPage);
  });
}

function appendNextButton(currentPage, totalPages) {
  const nextLink = document.createElement("a");
  nextLink.href = "#";
  nextLink.id = "next";

  const nextIcon = document.createElement("i");
  nextIcon.classList.add("fa", "fa-caret-right");
  nextIcon.setAttribute("aria-hidden", "true");
  nextLink.appendChild(nextIcon);

  pagination.appendChild(nextLink);

  nextLink.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage < totalPages) {
      currentPage++;
      updatePageHash(currentPage);
    }
  });

  if (currentPage === totalPages) {
    console.log(true);
    nextLink.classList.add("disabled");
  } else {
    console.log(false);
    nextLink.classList.remove("disabled");
  }
}
