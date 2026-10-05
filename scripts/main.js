const app = {
  init: function () {
    console.log("Hello world :)");
    getData();
  },
};

const postsContainer = document.getElementById("posts-container");
const homeButton = document.getElementById("home-button");
const loadingScreen = document.getElementById("loading-screen");

let postsCollection = [];
let tagsList = new Set([]);

const post_sheetId = "1G_t1u2Y9VriPwUvXmh8xXmn2QLEYEvDMb_XfeScUGlM";

function getData() {
  // Get the data
  const url = `https://docs.google.com/spreadsheets/d/${post_sheetId}/gviz/tq?`;
  const retrievedSheet = getSheet(url);

  return retrievedSheet.then((result) => {
    const json = JSON.parse(
      result
        .split("\n")[1]
        .replace(/google.visualization.Query.setResponse\(|\);/g, ""),
    );

    //set post ID
    for (i = 0; i < json.table.rows.length; i++) {
      json.table.rows[i].c[4] = i;
    }

    postsCollection = json.table.rows.toReversed();
    getTagsList(postsCollection);
    // displayAllPosts(postsCollection);
  });
}

function displayAllPosts(postsCollection) {
  postsContainer.innerHTML = "";

  handleTagFilter();
  handleHomeOrBack();

  for (i = 0; i < postsCollection.length; i++) {
    displayPost(postsCollection[i].c, false);
  }
  handlePagination();
}

function displaySinglePost(postData) {
  postsContainer.innerHTML = "";
  pagination.innerHTML = "";

  location.hash = "log-" + postData[4];
  handleHomeOrBack();
  displayPost(postData, true);

  const commentWidget = document.createElement("div");
  commentWidget.id = "c_widget";
  postsContainer.appendChild(commentWidget);
  appendCommentBox();
}

function displayPost(postData, isSinglePost) {
  const postBox = document.createElement("div");
  postBox.className = "post-box";
  postBox.insertAdjacentHTML("beforeend", displayDate(postData));
  postBox.insertAdjacentHTML(
    "beforeend",
    displayImages(postData, isSinglePost),
  );
  postBox.insertAdjacentHTML("beforeend", displayText(postData));
  postBox.insertAdjacentHTML("beforeend", displayTags(postData));
  postsContainer.appendChild(postBox);
}

function displayDate(postData) {
  const rawDate = postData[0].f;
  const formattedTimestamp = convertTimestamp(rawDate);
  const postDate = formattedTimestamp.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const dateHTML = `
    <div class="date-row">
      <a class="post-num" 
        href="#log-${postData[4]}"
      >
        <i class="fa fa-caret-right me-1" aria-hidden="true"></i>
        log: ${postData[4].toString().padStart(3, 0)}
      </a>
      <span class="date-label">${postDate}</span>
    </div>
  `;
  return dateHTML;
}

function displayImages(postData, isSinglePost) {
  const rawImages = postData[1].v;
  const postImages = rawImages.split(", ");
  let combinedImagesHTML = "";
  postImages.forEach((image) => {
    let imageClass = "thumbnail";
    if (postImages.length <= 1) {
      imageClass = "thumbnail thumbnail-solo";
    }
    if (isSinglePost) {
      imageClass = "thumbnail thumbnail-single";
    }
    const imageUrl = "https://kanekos99.github.io/sketch-gallery/img/" + image;
    const imageHTML = `
      <div class="${imageClass}">
        <img 
          src="${imageUrl}"
          loading="lazy"
          onclick="showImage(this)"
          data-bs-toggle="modal"
          data-bs-target="#galleryModal"
          data-post="post_${postData[4]}"
        />
      </div>
    `;
    combinedImagesHTML += imageHTML;
  });
  const imagesRowHTML = `
   <div class="d-flex flex-row flex-wrap justify-content-center img-container">
    ${combinedImagesHTML}
   </div>
  `;
  return imagesRowHTML;
}

function displayText(postData) {
  const postText = postData[2].v;
  const postTextHTML = `
    <div class="post-text">
      ${postText}
    </div>
  `;
  return postTextHTML;
}

function displayTags(postData) {
  const postTags = postData[3].v.split(", ");
  let combinedTagsHTML = "";

  postTags.forEach((tag) => {
    const tagLink = tag.toLowerCase().replaceAll(" ", "-");

    const tagHTML = `
      <a href="#tag=${tagLink}" class="post-tag">
        #${tag}
      </a>
    `;
    combinedTagsHTML += tagHTML;
  });
  const tagsRowHTML = `
   <div class="d-flex flex-row flex-wrap justify-content-start tag-row">
      <label class="tag-label">tags: </label>
      ${combinedTagsHTML}
   </div>
  `;
  return tagsRowHTML;
}

function getTagsList(postsCollection) {
  for (i = 0; i < postsCollection.length; i++) {
    const postTags = postsCollection[i].c[3].v.split(", ");
    postTags.forEach((tag) => {
      tagsList.add(tag.toLowerCase().replaceAll(" ", "-"));
    });
  }
}

function handleTagFilter() {
  const currentTag = getHashParms().get("tag");
  if (isValidHash(currentTag)) {
    const formattedHash = currentTag.trim().toLowerCase().replaceAll("-", " ");
    const tagFilterHTML = `
      <div class="tag-filter">
        <div class="tag-filter-text">
          viewing logs for <b>#${formattedHash}</b>
        </div>
      </div>
    `;
    postsContainer.insertAdjacentHTML("beforeend", tagFilterHTML);
  }
}

function getHashParms() {
  const currentHash = window.location.hash.slice(1);
  const params = new URLSearchParams(currentHash);
  return params;
}

function handleHomeOrBack() {
  if (isOnHomePage()) {
    homeButton.innerHTML = `
        <i class="fa fa-home me-2" aria-hidden="true"></i>home
    `;
  } else {
    homeButton.innerHTML = `
        <i class="fa fa-arrow-circle-left me-2" aria-hidden="true"></i>back
    `;
  }
  homeButton.disabled = false;
}

function goHomeOrBack() {
  if (isOnHomePage()) {
    window.open("https://kanekos.neocities.org/", "_blank");
  } else {
    redirectToHome();
  }
}

function isOnHomePage() {
  if (!window.location.hash) {
    return true;
  }
  const params = getHashParms();
  if (params.size === 1 && params.has("page")) {
    return true;
  }
  return false;
}

function redirectToHome() {
  if (!getCurrentPage() || (getCurrentPage() && getCurrentTag())) {
    history.pushState(null, "", window.location.pathname);
  }
  displayAllPosts(postsCollection);
}

// Fetches the Google Sheet resource from the provided URL
function getSheet(url) {
  return new Promise(function (resolve, reject) {
    fetch(url).then((response) => {
      if (!response.ok) {
        reject("Could not find Google Sheet with that URL");
      } else {
        response.text().then((data) => {
          if (!data) {
            reject("Invalid data pulled from sheet");
          }
          resolve(data);
        });
      }
    });
  });
}

function convertTimestamp(timestamp) {
  const [date, time] = timestamp.split(" ");
  const [day, month, year] = date.split("/");
  const [hour, minute, second] = time.split(":");
  const dateObj = new Date(year, month - 1, day, hour, minute, second);
  return dateObj;
}

function getPostsByTag(tagName) {
  const filteredPosts = [];
  postsCollection.forEach((post) => {
    const postTags = post.c[3].v.split(", ");
    const formattedTags = postTags.map((tag) =>
      tag.toLowerCase().replaceAll(" ", "-"),
    );
    if (formattedTags.includes(tagName)) {
      filteredPosts.push(post);
    }
  });
  displayAllPosts(filteredPosts);
  return filteredPosts;
}

function isValidHash(currentTag) {
  if (!currentTag || currentTag.trim() === "") {
    return false;
  }
  const isValidTag = [...tagsList].includes(currentTag);
  return isValidTag;
}

function isPostLink(currentHash) {
  if (!currentHash && currentHash.trim() === "") {
    return false;
  }
  if (currentHash.includes("log-")) {
    const postId = Number(currentHash.split("-")[1]);
    if (postId || postId === 0) {
      return postId >= 0 && postId in postsCollection;
    }
  }
  return false;
}

function handleHashChange() {
  const currentHash = window.location.hash.slice(1);
  const currentTag = getHashParms().get("tag");
  if (isValidHash(currentTag)) {
    getPostsByTag(currentTag);
    return;
  } else if (isPostLink(currentHash)) {
    showPost(currentHash);
    return;
  } else {
    redirectToHome();
    return;
  }
}

function showPost(currentHash) {
  const postId = currentHash.split("-")[1];
  const postData = postsCollection.filter((post) => {
    return post.c[4].toString() == postId.toString();
  });
  displaySinglePost(postData[0].c);
}

window.addEventListener("DOMContentLoaded", () => {
  getData().then(() => {
    handleHashChange();
    hideLoadingScreen();
    window.addEventListener("hashchange", () => {
      handleHashChange();
    });
  });
});

function hideLoadingScreen() {
  loadingScreen.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: 100,
    fill: "forwards",
  }).onfinish = () => {
    loadingScreen.style.display = "none";
  };
  document.documentElement.style.setProperty("overflow-y", "scroll");
}

const modalImg = document.getElementById("modal-image");
function showNextOrPrevImg(direction) {
  const postId = modalImg.dataset.post;
  const validImages = Array.from(
    document.querySelectorAll(`img[data-post="${postId}"]:not(#modal-image)`),
  );
  const currentSrc = modalImg.src;
  let currentIndex = validImages.findIndex((img) => img.src === currentSrc);
  let nextIndex = currentIndex + direction;
  if (direction === 1 && nextIndex >= validImages.length) {
    nextIndex = 0;
  } else if (direction === -1 && nextIndex === -1) {
    nextIndex = validImages.length - 1;
  }
  showImage(validImages[nextIndex]);
}

const modalArrows = document.querySelectorAll(".modal-arrow");
function showImage(image) {
  modalImg.style.display = "none";
  modalImg.src = image.src;

  const postId = image.dataset.post;
  modalImg.dataset.post = postId;

  //hide left and right arrows if only one image
  const validImages = Array.from(
    document.querySelectorAll(`img[data-post="${postId}"]:not(#modal-image)`),
  );
  if (validImages.length <= 1) {
    modalArrows.forEach((arrow) => {
      arrow.style.display = "none";
    });
  } else {
    modalArrows.forEach((arrow) => {
      arrow.style.display = "inline-block";
    });
  }

  modalImg.onload = function () {
    modalImg.style.display = "block";
  };
}

app.init();
