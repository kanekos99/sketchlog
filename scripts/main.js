const app = {
  init: function () {
    console.log("Hello world :)");
    getData();
  },
};

const postsContainer = document.getElementById("posts-container");

const s_sheetId = "1G_t1u2Y9VriPwUvXmh8xXmn2QLEYEvDMb_XfeScUGlM";

function getData() {
  // Get the data
  const url = `https://docs.google.com/spreadsheets/d/${s_sheetId}/gviz/tq?`;
  const retrievedSheet = getSheet(url);

  retrievedSheet.then((result) => {
    const json = JSON.parse(
      result
        .split("\n")[1]
        .replace(/google.visualization.Query.setResponse\(|\);/g, ""),
    );
    for (i = 0; i < json.table.rows.length; i++) {
      displayPost(json.table.rows[i].c, i);
    }
  });
}

function displayPost(postData, postCount) {
  const postBox = document.createElement("div");
  postBox.className = "post-box";
  postBox.insertAdjacentHTML("beforeend", displayDate(postData));
  postBox.insertAdjacentHTML("beforeend", displayImages(postData, postCount));
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
  console.log(postDate);
  const dateHTML = `
    <div class="date-row">
      <span class="date-label">${postDate}</span>
    </div>
  `;
  return dateHTML;
}

function displayImages(postData, postCount) {
  const rawImages = postData[1].v;
  const postImages = rawImages.split(", ");
  let combinedImagesHTML = "";
  postImages.forEach((image) => {
    let imageClass = "thumbnail";
    if (postImages.length <= 1) {
      imageClass = "thumbnail thumbnail-solo";
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
          data-post="post_${postCount}"
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
    const tagHTML = `
      <a href="" class="post-tag">
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
