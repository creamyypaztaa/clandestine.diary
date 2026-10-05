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
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyCbTAU50HyhJp7gObZ2KEaqtV4pRTpqhDM",
  authDomain: "clandestinediary.firebaseapp.com",
  projectId: "clandestinediary",
  storageBucket: "clandestinediary.firebasestorage.app",
  messagingSenderId: "709540928458",
  appId: "1:709540928458:web:20236dc213ac9235dacd33"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

console.log("Firebase project:", app.options.projectId);
console.log("Firebase API key:", app.options.apiKey);
console.log("Firebase auth domain:", app.options.authDomain);

const db = getFirestore(app);


// ==========================
// PAGE SWITCHING
// ==========================

window.showPage = function(pageName) {

  const pages = [
    "welcome",
    "notes",
    "add",
    "login",
    "dashboard"
  ];

  pages.forEach(function(page) {

    const element = document.getElementById(page);

    if (element) {
      element.classList.add("hidden");
    }

  });

  const selected = document.getElementById(pageName);

  if (selected) {
    selected.classList.remove("hidden");
  }

  updateOwnerControls();

  if (pageName === "notes") {
    loadNotes();
  }

  if (pageName === "add") {
    loadSubmissions();
  }

};


// ==========================
// OWNER LOGIN PAGE
// ==========================

window.ownerLogin = function() {

  if (auth.currentUser) {
    window.showPage("dashboard");
  } else {
    window.showPage("login");
  }

};


// ==========================
// LOGIN
// ==========================

window.checkPassword = async function() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const response = await fetch(
    "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + app.options.apiKey,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: password,
        returnSecureToken: true
      })
    }
  );

  const result = await response.json();

  console.log("HTTP STATUS:", response.status);
  console.log("FIREBASE RESPONSE:", result);

  document.getElementById("login-message").textContent =
    JSON.stringify(result);
};

// ==========================
// LOGOUT
// ==========================

window.logout = async function() {

  try {

    await signOut(auth);

    updateOwnerControls();

    window.showPage("welcome");

  } catch (error) {

    console.error(error);

  }

};


// ==========================
// OWNER CONTROLS
// ==========================

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


// ==========================
// LOAD OWNER NOTES
// ==========================

async function loadNotes() {

  const container =
    document.getElementById("notes-content");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  try {

    const snapshot =
      await getDocs(
        collection(db, "notes")
      );

    const notes = [];

    snapshot.forEach(function(noteDocument) {

      const note =
        noteDocument.data();

      notes.push({
        id: noteDocument.id,
        text: note.text || "",
        createdAt: note.createdAt
      });

    });


    notes.sort(function(a, b) {

      const dateA =
        a.createdAt?.toDate
          ? a.createdAt.toDate()
          : new Date(a.createdAt);

      const dateB =
        b.createdAt?.toDate
          ? b.createdAt.toDate()
          : new Date(b.createdAt);

      return dateB - dateA;

    });


    notes.forEach(function(note) {

      const article =
        document.createElement("article");

      article.className =
        "note collapsed";


      const header =
        document.createElement("div");

      header.className =
        "note-header";


      const title =
        document.createElement("h2");


      const date =
        note.createdAt?.toDate
          ? note.createdAt.toDate()
          : new Date(note.createdAt);


      title.textContent =
        date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        });


      const text =
        document.createElement("p");

      text.className =
        "note-preview";


      text.textContent =
        note.text.length > 45
          ? note.text.substring(0, 45) + "..."
          : note.text;


      header.appendChild(title);
      header.appendChild(text);

      article.appendChild(header);


      header.onclick =
        function() {

          if (
            article.classList.contains("collapsed")
          ) {

            article.classList.remove(
              "collapsed"
            );

            text.textContent =
              note.text;

          } else {

            article.classList.add(
              "collapsed"
            );

            text.textContent =
              note.text.length > 45
                ? note.text.substring(0, 45) + "..."
                : note.text;

          }

        };


      // OWNER CONTROLS

      if (auth.currentUser) {

        const controls =
          document.createElement("div");

        controls.className =
          "note-controls";


        const editButton =
          document.createElement("button");

        editButton.className =
          "enter-button";

        editButton.textContent =
          "EDIT";


        editButton.onclick =
          function(event) {

            event.stopPropagation();

            window.editNote(
              note.id,
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
          function(event) {

            event.stopPropagation();

            window.deleteNote(
              note.id
            );

          };


        controls.appendChild(
          editButton
        );

        controls.appendChild(
          deleteButton
        );

        article.appendChild(
          controls
        );

      }


      container.appendChild(
        article
      );

    });

  } catch (error) {

    console.error(
      "Error loading notes:",
      error
    );

  }

}


// ==========================
// EDIT NOTE
// ==========================

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

  try {

    await setDoc(
      doc(db, "notes", id),
      {
        title: "Owner's Note",
        text: newText
      },
      { merge: true }
    );

    loadNotes();

  } catch (error) {

    console.error(error);

    alert(
      "Something went wrong while editing."
    );

  }

};


// ==========================
// DELETE NOTE
// ==========================

window.deleteNote = async function(id) {

  if (!auth.currentUser) {
    return;
  }

  if (!confirm("Delete this diary entry?")) {
    return;
  }

  try {

    await deleteDoc(
      doc(db, "notes", id)
    );

    loadNotes();

  } catch (error) {

    console.error(error);

    alert(
      "Something went wrong while deleting."
    );

  }

};


// ==========================
// CREATE NEW NOTE
// ==========================

window.createNote = async function() {

  if (!auth.currentUser) {
    return;
  }

  const text =
    prompt("Write your new diary entry:");

  if (
    text === null ||
    text.trim() === ""
  ) {
    return;
  }

  try {

    await addDoc(
      collection(db, "notes"),
      {
        title: "Owner's Note",
        text: text.trim(),
        createdAt: new Date()
      }
    );

    loadNotes();

  } catch (error) {

    console.error(error);

    alert(
      "Something went wrong while saving your note."
    );

  }

};


// ==========================
// ADD ANONYMOUS ENTRY
// ==========================

window.addEntry = async function() {

  const textarea =
    document.getElementById("entry");

  if (!textarea) {
    return;
  }

  const text =
    textarea.value.trim();

  if (text === "") {
    return;
  }

  try {

    await addDoc(
      collection(db, "submissions"),
      {
        text: text,
        createdAt: new Date()
      }
    );

    textarea.value = "";

    alert(
      "Your anonymous entry has been added!"
    );

    loadSubmissions();

  } catch (error) {

    console.error(error);

    alert(
      "Something went wrong while submitting."
    );

  }

};


// ==========================
// LOAD SUBMISSIONS
// ==========================

async function loadSubmissions() {

  const container =
    document.getElementById("entries");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  try {

    const snapshot =
      await getDocs(
        collection(db, "submissions")
      );

    const submissions = [];

    snapshot.forEach(function(submissionDocument) {

      const submission =
        submissionDocument.data();

      submissions.push({
        id: submissionDocument.id,
        text: submission.text || "",
        createdAt: submission.createdAt
      });

    });


    submissions.sort(function(a, b) {

      const dateA =
        a.createdAt?.toDate
          ? a.createdAt.toDate()
          : new Date(a.createdAt);

      const dateB =
        b.createdAt?.toDate
          ? b.createdAt.toDate()
          : new Date(b.createdAt);

      return dateB - dateA;

    });


    submissions.forEach(function(submission) {

      const article =
        document.createElement("article");

      article.className =
        "note collapsed";


      const header =
        document.createElement("div");

      header.className =
        "note-header";


      const title =
        document.createElement("h2");


      const date =
        submission.createdAt?.toDate
          ? submission.createdAt.toDate()
          : new Date(submission.createdAt);


      title.textContent =
        date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        });


      const text =
        document.createElement("p");

      text.className =
        "note-preview";


      text.textContent =
        submission.text.length > 45
          ? submission.text.substring(0, 45) + "..."
          : submission.text;


      header.appendChild(title);
      header.appendChild(text);

      article.appendChild(header);


      // EXPAND / COLLAPSE

      header.onclick =
        function() {

          if (
            article.classList.contains("collapsed")
          ) {

            article.classList.remove(
              "collapsed"
            );

            text.textContent =
              submission.text;

          } else {

            article.classList.add(
              "collapsed"
            );

            text.textContent =
              submission.text.length > 45
                ? submission.text.substring(0, 45) + "..."
                : submission.text;

          }

        };


      // OWNER DELETE BUTTON

      if (auth.currentUser) {

        const deleteButton =
          document.createElement("button");

        deleteButton.className =
          "enter-button delete-button";

        deleteButton.textContent =
          "DELETE";


        deleteButton.onclick =
          function(event) {

            event.stopPropagation();

            window.deleteSubmission(
              submission.id
            );

          };


        article.appendChild(
          deleteButton
        );

      }


      container.appendChild(
        article
      );

    });

  } catch (error) {

    console.error(
      "Error loading submissions:",
      error
    );

  }

}


// ==========================
// DELETE SUBMISSION
// ==========================

window.deleteSubmission = async function(id) {

  if (!auth.currentUser) {
    return;
  }

  if (!confirm("Delete this submission?")) {
    return;
  }

  try {

    await deleteDoc(
      doc(db, "submissions", id)
    );

    loadSubmissions();

  } catch (error) {

    console.error(error);

    alert(
      "Something went wrong while deleting."
    );

  }

};


// ==========================
// INITIAL PAGE
// ==========================

window.showPage("welcome");
