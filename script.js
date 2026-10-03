// Change this later.
// This is ONLY a temporary demo password.
const OWNER_PASSWORD = "Fatigue";

let isOwner = false;


// SHOW A PAGE
function showPage(pageName) {

  document.getElementById("welcome").classList.add("hidden");
  document.getElementById("notes").classList.add("hidden");
  document.getElementById("add").classList.add("hidden");
  document.getElementById("login").classList.add("hidden");
  document.getElementById("dashboard").classList.add("hidden");

  document.getElementById(pageName).classList.remove("hidden");

  updateOwnerControls();
}


// OWNER LOGIN
function ownerLogin() {

  if (isOwner) {
    showPage("dashboard");
    return;
  }

  showPage("login");
}


// CHECK PASSWORD
function checkPassword() {

  const password =
    document.getElementById("password").value;

  const message =
    document.getElementById("login-message");


  if (password === OWNER_PASSWORD) {

    isOwner = true;

    message.textContent = "";

    document.getElementById("password").value = "";

    showPage("dashboard");

  } else {

    message.textContent =
      "Wrong password.";

  }
}


// SHOW/HIDE OWNER CONTROLS
function updateOwnerControls() {

  const controls =
    document.getElementById("owner-controls");

  if (isOwner) {

    controls.classList.remove("hidden");

  } else {

    controls.classList.add("hidden");

  }
}


// EDIT NOTES
function editNotes() {

  if (!isOwner) {
    return;
  }

  const newText =
    prompt("Edit your diary entry:");

  if (newText === null) {
    return;
  }

  const note =
    document.querySelector("#notes-content .note p");

  note.textContent = newText;
}


// DELETE NOTES
function deleteNotes() {

  if (!isOwner) {
    return;
  }

  const confirmDelete =
    confirm("Delete this diary entry?");

  if (!confirmDelete) {
    return;
  }

  document.getElementById("notes-content").innerHTML = "";
}


// LOG OUT
function logout() {

  isOwner = false;

  updateOwnerControls();

  showPage("welcome");
}


// ADD ANONYMOUS ENTRY
function addEntry() {

  const text =
    document.getElementById("entry").value.trim();

  if (text === "") {
    return;
  }


  const newEntry =
    document.createElement("div");

  newEntry.className = "note";


  const paragraph =
    document.createElement("p");

  paragraph.textContent = text;


  newEntry.appendChild(paragraph);


  document
    .getElementById("entries")
    .prepend(newEntry);


  document.getElementById("entry").value = "";
}


// START ON HOME
showPage("welcome");
