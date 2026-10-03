import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


// ============================
// FIREBASE CONFIG
// ============================

const firebaseConfig = {
  apiKey: "AIzaSyCbTAU50HyhJp7gObZ2KEaqtV4pRTpqhDM",
  authDomain: "clandestinediary.firebaseapp.com",
  projectId: "clandestinediary",
  storageBucket: "clandestinediary.firebasestorage.app",
  messagingSenderId: "709540928458",
  appId: "1:709540928458:web:20236dc213ac9235dacd33"
};


// ============================
// INITIALIZE FIREBASE
// ============================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// ============================
// SHOW / HIDE PAGES
// ============================

function showPage(pageName) {

  const pages = [
    "welcome",
    "notes",
    "add",
    "login",
    "dashboard"
  ];

  pages.forEach(function(page) {
    document.getElementById(page).classList.add("hidden");
  });

  document
    .getElementById(pageName)
    .classList.remove("hidden");

  updateOwnerControls();
}


// ============================
// OWNER LOGIN
// ============================

window.ownerLogin = function() {

  if (auth.currentUser) {
    showPage("dashboard");
    return;
  }

  showPage("login");
};


// ============================
// CHECK LOGIN
// ============================

window.checkPassword = async function() {

  const email =
    document.getElementById("email").value.trim();

  const password =
    document.getElementById("password").value;

  const message =
    document.getElementById("login-message");


  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    message.textContent = "";

    document.getElementById("email").value = "";
    document.getElementById("password").value = "";

    showPage("dashboard");

    updateOwnerControls();

    loadNotes();

    loadSubmissions();

  } catch (error) {

    console.log(error);

    message.textContent =
      "Incorrect email or password.";

  }
};


// ============================
// LOG OUT
// ============================

window.logout = async function() {

  await signOut(auth);

  updateOwnerControls();

  showPage("welcome");
};


// ============================
// OWNER CONTROLS
// ============================

function updateOwnerControls() {

  const controls =
    document.getElementById("owner-controls");

  if (!controls) {
    return;
  }

  if (auth.currentUser) {

    controls.classList.remove("hidden");

  } else {

    controls.classList.add("hidden");

  }
}


// ============================
// LOAD OWNER'S NOTES
// ============================

async function loadNotes() {

  const notesContainer =
    document.getElementById("notes-content");

  notesContainer.innerHTML = "";

  const notesSnapshot =
    await getDocs(collection(db, "notes"));


  notesSnapshot.forEach(function(noteDocument) {

    const note =
      noteDocument.data();

    const article =
      document.createElement("article");

    article.className = "note";


    const title =
      document.createElement("h2");

    title.textContent =
      note.title || "Owner's Note";


    const paragraph =
      document.createElement("p");

    paragraph.textContent =
      note.text;


    article.appendChild(title);
    article.appendChild(paragraph);


    if (auth.currentUser) {

      const editButton =
        document.createElement("button");

      editButton.className =
        "enter-button";

      editButton.textContent =
        "EDIT";


      editButton.onclick =
        function() {

          editNote(
            noteDocument.id,
            note.text
          );

        };


      const deleteButton =
        document.createElement("button");

      deleteButton.className =
        "enter-button delete-button";

      deleteButton.textContent =
        "DELETE";


      deleteButton.onclick =
        function() {

          deleteNote(
            noteDocument.id
          );

        };


      article.appendChild(editButton);
      article.appendChild(deleteButton);
    }


    notesContainer.appendChild(article);

  });
}


// ============================
// CREATE / EDIT NOTE
// ============================

window.editNote = async function(id, oldText) {

  if (!auth.currentUser) {
    return;
  }

  const newText =
    prompt(
      "Edit your diary entry:",
      oldText
    );


  if (newText === null) {
    return;
  }


  await setDoc(
    doc(db, "notes", id),
    {
      title: "Owner's Note",
      text: newText
    }
  );


  loadNotes();
};


// ============================
// DELETE NOTE
// ============================

window.deleteNote = async function(id) {

  if (!auth.currentUser) {
    return;
  }


  const confirmed =
    confirm(
      "Delete this diary entry?"
    );


  if (!confirmed) {
    return;
  }


  await deleteDoc(
    doc(db, "notes", id)
  );


  loadNotes();
};


// ============================
// ADD ANONYMOUS SUBMISSION
// ============================

window.addEntry = async function() {

  const textarea =
    document.getElementById("entry");

  const text =
    textarea.value.trim();


  if (text === "") {
    return;
  }


  await addDoc(
    collection(db, "submissions"),
    {
      text: text,
      createdAt: new Date()
    }
  );


  textarea.value = "";

  alert(
    "Your anonymous entry has been added."
  );


  if (auth.currentUser) {
    loadSubmissions();
  }
};


// ============================
// LOAD SUBMISSIONS
// ============================

async function loadSubmissions() {

  if (!auth.currentUser) {
    return;
  }


  const container =
    document.getElementById("entries");

  container.innerHTML = "";


  const submissions =
    await getDocs(
      collection(db, "submissions")
    );


  submissions.forEach(
    function(submissionDocument) {

      const submission =
        submissionDocument.data();


      const entry =
        document.createElement("div");

      entry.className = "note";


      const paragraph =
        document.createElement("p");

      paragraph.textContent =
        submission.text;


      entry.appendChild(paragraph);

      container.appendChild(entry);

    }
  );
}


// ============================
// START WEBSITE
// ============================

showPage("welcome");

loadNotes();
