const s_formId = "1FAIpQLSdNOQ-6TkelfPW6dJ90-mVfia-xYxqzrc3P-YwwmlvzE0WmwA";
const s_nameId = "1704959380";
const s_websiteId = "1377102479";
const s_textId = "2146934727";
const s_pageId = "1302929449";
const s_replyId = "1734095012";
const s_sheetId = "10SvAsTYEyhBx3nKYj-qNSN5Jv4FnzESIFphtIIJxvK0";

const s_timezone = +8;
const s_daylightSavings = false;

// Misc - Other random settings
const s_commentsPerPage = 5; // The max amount of comments that can be displayed on one page, any number >= 1 (Replies not counted)
const s_maxLength = 5000; // The max character length of a comment
const s_maxLengthName = 16; // The max character length of a name
const s_commentsOpen = true; // Change to false if you'd like to close your comment section site-wide (Turn it off on Google Forms too!)
const s_collapsedReplies = false; // True for collapsed replies with a button, false for replies to display automatically
const s_longTimestamp = true; // True for a date + time, false for just the date

// Word filter - Censor profanity, etc
const s_wordFilterOn = false; // True for on, false for off
const s_filterReplacement = "****"; // Change what filtered words are censored with (**** is the default)
const s_filteredWords = [
  // Add words to filter by putting them in quotes and separating with commas (ie. 'heck', 'dang')
  "heck",
  "dang",
];

// Text - Change what messages/text appear on the form and in the comments section (Mostly self explanatory)
const s_widgetTitle = "comments";
const s_nameFieldLabel = "Name";
const s_websiteFieldLabel = "Website";
const s_textFieldLabel = "";
const s_submitButtonLabel = "Submit";
const s_loadingText = "Loading comments...";
const s_noCommentsText = "No comments yet!";
const s_closedCommentsText = "Comments are closed temporarily!";
const s_websiteText = "Website"; // The links to websites left by users on their comments
const s_replyButtonText = "Reply"; // The button for replying to someone
const s_replyingText = "Replying to"; // The text that displays while the user is typing a reply
const s_expandRepliesText = "Show Replies";
const s_leftButtonText = "<<";
const s_rightButtonText = ">>";

let v_submitted = false;
let v_pagePath = "";
let v_pageNum = 1;
let v_amountOfPages = 1;
let v_commentMax = 1;
let v_commentMin = 1;

let v_filteredWords;
if (s_wordFilterOn) {
  v_filteredWords = s_filteredWords.join("|");
  v_filteredWords = new RegExp(String.raw`\b(${v_filteredWords})\b`, "ig");
}

const v_mainHtml = `
    <div id="c_widgetTitle">${s_widgetTitle}</div>
    <div id="c_container"><div id="no-comments">${s_loadingText}</div></div>
    <div id="c_inputDiv">
        <form id="c_form" onsubmit="c_submitButton.disabled = true; v_submitted = true;" method="post" target="c_hiddenIframe" action="https://docs.google.com/forms/d/e/${s_formId}/formResponse"></form>
    </div>
`;
const v_formHtml = `
    <div id="c_nameWrapper" class="c-inputWrapper">
        <label class="c-label c-nameLabel" for="entry.${s_nameId}">${s_nameFieldLabel}</label>
        <input class="c-input c-nameInput" placeholder="name" name="entry.${s_nameId}" id="entry.${s_nameId}" type="text" maxlength="${s_maxLengthName}" required>
    </div>

    <div id="c_websiteWrapper" class="c-inputWrapper">
        <label class="c-label c-websiteLabel" for="entry.${s_websiteId}">${s_websiteFieldLabel}</label>
        <input class="c-input c-websiteInput" placeholder="website (optional)" name="entry.${s_websiteId}" id="entry.${s_websiteId}" type="url" pattern="https://.*">
    </div>

    <div id="c_textWrapper" class="c-inputWrapper">
        <textarea class="c-input c-textInput" name="entry.${s_textId}" id="entry.${s_textId}" rows="4" cols="50"  maxlength="${s_maxLength}" required></textarea>
    </div>

    <div class="submit-row" id="submit-row">
        <div id="replying-text-box"></div>
        <input id="c_submitButton" name="c_submitButton" type="submit" value="${s_submitButtonLabel}">
    </div>

`;

function appendCommentBox() {
  document.getElementById("c_widget").innerHTML = v_mainHtml;
  const c_form = document.getElementById("c_form");
  if (s_commentsOpen) {
    c_form.innerHTML = v_formHtml;
  } else {
    c_form.innerHTML = s_closedCommentsText;
  }
  addPageElement();
  addReplyElement();
  addReplyingTo();
  addHiddenIframe();
}

function addPageElement() {
  v_pagePath = window.location.hash;
  const c_pageInput = document.createElement("input");
  c_pageInput.value = v_pagePath;
  c_pageInput.type = "text";
  c_pageInput.style.display = "none";
  c_pageInput.id = "entry." + s_pageId;
  c_pageInput.name = c_pageInput.id;

  const c_form = document.getElementById("c_form");
  c_form.appendChild(c_pageInput);
}

function addReplyElement() {
  let c_replyInput = document.createElement("input");
  c_replyInput.type = "text";
  c_replyInput.style.display = "none";
  c_replyInput.id = "entry." + s_replyId;
  c_replyInput.name = c_replyInput.id;
  const c_form = document.getElementById("c_form");
  c_form.appendChild(c_replyInput);
}

function addReplyingTo() {
  let c_replyingText = document.createElement("span");
  c_replyingText.style.display = "none";
  c_replyingText.id = "c_replyingText";

  const replying_text_box = document.getElementById("replying-text-box");
  replying_text_box.appendChild(c_replyingText);
}

function addHiddenIframe() {
  let c_hiddenIframe = document.createElement("iframe");
  c_hiddenIframe.id = "c_hiddenIframe";
  c_hiddenIframe.name = "c_hiddenIframe";
  c_hiddenIframe.style.display = "none";
  c_hiddenIframe.setAttribute("onload", "if(v_submitted){fixFrame()}");

  const c_form = document.getElementById("c_form");
  c_form.appendChild(c_hiddenIframe);

  fixFrame();
}

function fixFrame() {
  v_submitted = false;
  const c_hiddenIframe = document.getElementById("c_hiddenIframe");
  c_hiddenIframe.srcdoc = "";
  getComments();
}

function getComments() {
  console.log("getting comments");
  const c_submitButton = document.getElementById("c_submitButton");
  c_submitButton.disabled;

  //reset replying stuff to default
  const c_replyingText = document.getElementById("c_replyingText");
  c_replyingText.style.display = "none";

  c_replyInput = document.getElementById("entry." + s_replyId);
  c_replyInput.value = "";

  // Clear input fields too
  if (s_commentsOpen) {
    document.getElementById(`entry.${s_nameId}`).value = "";
    document.getElementById(`entry.${s_websiteId}`).value = "";
    document.getElementById(`entry.${s_textId}`).value = "";
  }

  // Get the data
  const url = `https://docs.google.com/spreadsheets/d/${s_sheetId}/gviz/tq?`;
  const retrievedSheet = getSheet(url);

  retrievedSheet.then((result) => {
    // The data comes with extra stuff at the beginning, get rid of it
    const json = JSON.parse(
      result
        .split("\n")[1]
        .replace(/google.visualization.Query.setResponse\(|\);/g, ""),
    );

    // Need index of page column for checking if comments are for the right page
    const isPage = (col) => col.label == "Page";
    let pageIdx = json.table.cols.findIndex(isPage);

    // Turn that data into usable comment data
    // All of the messy val checks are because Google Sheets can be weird sometimes with comment deletion
    let comments = [];
    if (json.table.parsedNumHeaders > 0) {
      // Check if any comments exist in the sheet at all before continuing
      for (r = 0; r < json.table.rows.length; r++) {
        // Check for null rows
        let val1;
        if (!json.table.rows[r].c[pageIdx]) {
          val1 = "";
        } else {
          val1 = json.table.rows[r].c[pageIdx].v;
        }

        // Check if the page name matches before adding to comment array
        if (val1 == v_pagePath) {
          let comment = {};
          for (c = 0; c < json.table.cols.length; c++) {
            // Check for null values
            let val2;
            if (!json.table.rows[r].c[c]) {
              val2 = "";
            } else {
              val2 = json.table.rows[r].c[c].v;
            }

            // Finally set the value properly
            comment[json.table.cols[c].label] = val2;
          }
          comment.Timestamp2 = json.table.rows[r].c[0].f;
          comments.push(comment);
        }
      }
    }

    // Check for empty comments before displaying to page
    if (comments.length == 0 || Object.keys(comments[0]).length < 2) {
      const no_comment_text = document.getElementById("no-comments");
      no_comment_text.innerHTML = s_noCommentsText;
    } else {
      displayComments(comments);
    }

    c_submitButton.disabled = false; // Now that everything is done, re-enable the submit button
  });
}

function getSheet(url) {
  return new Promise(function (resolve, reject) {
    fetch(url).then((response) => {
      if (!response.ok) {
        reject("Could not find Google Sheet with that URL");
      } // Checking for a 404
      else {
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

let a_commentDivs = []; // For use in other functions
function displayComments(comments) {
  a_commentDivs = [];
  c_container.innerHTML = "";

  // Get all reply comments by taking them out of the comment array
  let replies = [];
  for (i = 0; i < comments.length; i++) {
    if (comments[i].Reply) {
      replies.push(comments[i]);
      comments.splice(i, 1);
      i--;
    }
  }

  // Values for pagination
  v_amountOfPages = Math.ceil(comments.length / s_commentsPerPage);
  v_commentMax = s_commentsPerPage * v_pageNum;
  v_commentMin = v_commentMax - s_commentsPerPage;

  // Main comments (not replies)
  comments.reverse(); // Newest comments go to top
  for (i = 0; i < comments.length; i++) {
    let comment = createComment(comments[i]);

    // Reply button
    let replyBtnDiv = document.createElement("div");
    replyBtnDiv.className = "c-replyButtonDiv";
    let button = document.createElement("button");
    button.innerHTML = s_replyButtonText;
    button.value = comment.id;
    button.setAttribute("onclick", `openReply(this.value)`);
    button.className = "c-replyButton";
    replyBtnDiv.appendChild(button);
    comment.appendChild(replyBtnDiv);

    // Choose whether to display or not based on page number
    comment.style.display = "none";
    if (i >= v_commentMin && i < v_commentMax) {
      comment.style.display = "block";
    }

    comment.className = "c-comment";
    c_container.appendChild(comment);
    a_commentDivs.push(document.getElementById(comment.id)); // Add to array for use later
  }

  // Replies
  for (i = 0; i < replies.length; i++) {
    let reply = createComment(replies[i]);
    const parentId = replies[i].Reply;
    const parentDiv = document.getElementById(parentId);

    // Check if a container doesn't already exist for this comment, if not, make one
    let container;
    if (!document.getElementById(parentId + "-replies")) {
      container = document.createElement("div");
      container.id = parentId + "-replies";
      if (s_collapsedReplies) {
        container.style.display = "none";
      } // Default to hidden if collapsed
      container.className = "c-replyContainer";
      parentDiv.appendChild(container);
    } else {
      container = document.getElementById(parentId + "-replies");
    }
    reply.className = "c-reply";
    container.appendChild(reply);
  }

  if (v_amountOfPages > 1) {
    let pagination = document.createElement("div");

    leftButton = document.createElement("button");
    leftButton.innerHTML = s_leftButtonText;
    leftButton.id = "c_leftButton";
    leftButton.name = "left";
    leftButton.setAttribute("onclick", `changePage(this.name)`);
    if (v_pageNum == 1) {
      leftButton.disabled = true;
    } // Can't go before page 1
    leftButton.className = "c-paginationButton";
    pagination.appendChild(leftButton);

    rightButton = document.createElement("button");
    rightButton.innerHTML = s_rightButtonText;
    rightButton.id = "c_rightButton";
    rightButton.name = "right";
    rightButton.setAttribute("onclick", `changePage(this.name)`);
    if (v_pageNum == v_amountOfPages) {
      rightButton.disabled = true;
    } // Can't go after the last page
    rightButton.className = "c-paginationButton";
    pagination.appendChild(rightButton);

    pagination.id = "c_pagination";
    c_container.appendChild(pagination);
  }
}

// Create basic HTML comment, reply or not
function createComment(data) {
  let comment = document.createElement("div");

  // Get the right timestamps
  let timestamps = convertCommentTimestamp(data.Timestamp);
  let timestamp;
  if (s_longTimestamp) {
    timestamp = timestamps[0];
  } else {
    timestamp = timestamps[1];
  }

  // Set the ID (uses Name + Full Timestamp format)
  const id = data.Name + "|--|" + data.Timestamp2;
  comment.id = id;

  // Name of user
  let name = document.createElement("h3");
  let filteredName = data.Name;
  if (s_wordFilterOn) {
    filteredName = filteredName.replace(v_filteredWords, s_filterReplacement);
  }
  name.innerText = filteredName;
  name.className = "c-name";
  comment.appendChild(name);

  // Timestamp
  let time = document.createElement("span");
  time.innerText = timestamp;
  time.className = "c-timestamp";
  comment.appendChild(time);

  // Website URL, if one was provided
  if (data.Website) {
    let site = document.createElement("a");
    site.innerText = s_websiteText;
    site.href = data.Website;
    site.className = "c-site";
    comment.appendChild(site);
  }

  // Text content
  let text = document.createElement("p");
  let filteredText = data.Text;
  if (s_wordFilterOn) {
    filteredText = filteredText.replace(v_filteredWords, s_filterReplacement);
  }
  text.innerText = filteredText;
  text.className = "c-text";
  comment.appendChild(text);

  return comment;
}

// Makes the Google Sheet timestamp usable
function convertCommentTimestamp(timestamp) {
  const vals = timestamp.split("(")[1].split(")")[0].split(",");
  const date = new Date(vals[0], vals[1], vals[2], vals[3], vals[4], vals[5]);
  const timezoneDiff = (s_timezone * 60 + date.getTimezoneOffset()) * -1;
  let offsetDate = new Date(date.getTime() + timezoneDiff * 60 * 1000);
  return [offsetDate.toLocaleString(), offsetDate.toLocaleDateString()];
}

// Handle making replies
const link = document.createElement("a");
function openReply(id) {
  const c_replyingText = document.getElementById("c_replyingText");
  const c_replyInput = document.getElementById("entry." + s_replyId);
  if (c_replyingText.style.display == "none") {
    c_replyingText.innerHTML = s_replyingText + ` ${id.split("|--|")[0]}...`;
    c_replyInput.value = id;
    c_replyingText.style.display = "block";
  } else {
    c_replyingText.innerHTML = "";
    c_replyInput.value = "";
    c_replyingText.style.display = "none";
  }
}

function changePage(dir) {
  const leftButton = document.getElementById("c_leftButton");
  const rightButton = document.getElementById("c_rightButton");

  // Find directional number
  let num;
  switch (dir) {
    case "left":
      num = -1;
      break;
    case "right":
      num = 1;
      break;
    default:
      num = 0;
      break;
  }
  let targetPage = v_pageNum + num;

  // Cancel if impossible direction for safety, should never happen though
  if (targetPage > v_amountOfPages || targetPage < 1) {
    return;
  }

  // Enable/disable buttons if needed
  leftButton.disabled = false;
  rightButton.disabled = false;
  if (targetPage == 1) {
    leftButton.disabled = true;
  } // Can't go before page 1
  if (targetPage == v_amountOfPages) {
    rightButton.disabled = true;
  } // Can't go past the last page

  // Hide all comments and then display the correct ones
  v_pageNum = targetPage;
  v_commentMax = s_commentsPerPage * v_pageNum;
  v_commentMin = v_commentMax - s_commentsPerPage;
  for (i = 0; i < a_commentDivs.length; i++) {
    a_commentDivs[i].style.display = "none";
    if (i >= v_commentMin && i < v_commentMax) {
      a_commentDivs[i].style.display = "block";
    }
  }
}
