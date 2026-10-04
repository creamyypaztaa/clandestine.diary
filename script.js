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

    const element =
      document.getElementById(page);

    if (element) {
      element.classList.add("hidden");
    }

  });


  const selected =
    document.getElementById(pageName);

  if (selected) {
    selected.classList.remove("hidden");
  }


  updateOwnerControls();


  if (pageName === "notes") {
    loadNotes();
  }

  if (pageName === "add" && auth.currentUser) {
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


    updateOwnerControls();

    window.showPage("dashboard");

  } catch (error) {

    console.error(error);

    message.textContent =
      "Login failed. Check your email and password.";

  }

};


// ==========================
// LOGOUT
// ==========================

window.logout = async function() {

  await signOut(auth);

  updateOwnerControls();

  window.showPage("welcome");

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
// LOAD NOTES
// ==========================

async function loadNotes() {

  const container = document.getElementById("notes-content");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  try {

    const snapshot = await getDocs(
      collection(db, "notes")
    );

    const notes = [];

    snapshot.forEach(function(noteDocument) {

      const note = noteDocument.data();

      notes.push({
        id: noteDocument.id,
        title: note.title || "Owner's Note",
        text: note.text || "",
        createdAt: note.createdAt
      });

    });

    // Newest notes first
    notes.sort(function(a, b) {

      const dateA = a.createdAt?.toDate
        ? a.createdAt.toDate()
        : new Date(a.createdAt);

      const dateB = b.createdAt?.toDate
        ? b.createdAt.toDate()
        : new Date(b.createdAt);

      return dateB - dateA;

    });

    notes.forEach(function(note) {

      const article = document.createElement("article");
      article.className = "note collapsed";

      const header = document.createElement("div");
      header.className = "note-header";

      const title = document.createElement("h2");

      const date = note.createdAt?.toDate
        ? note.createdAt.toDate()
        : new Date(note.createdAt);

      title.textContent = date.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric"
        }
      );

      const preview = document.createElement("p");
      preview.className = "note-preview";

      preview.textContent =
        note.text.length > 45
          ? note.text.substring(0, 45) + "..."
          : note.text;

      header.appendChild(title);
      header.appendChild(preview);

      const fullContent = document.createElement("div");
      fullContent.className = "note-full";

      const paragraph = document.createElement("p");
      paragraph.textContent = note.text;

      fullContent.appendChild(paragraph);

      const minimizeButton = document.createElement("button");
      minimizeButton.className = "enter-button minimize-button";
      minimizeButton.textContent = "MINIMIZE";

      minimizeButton.onclick = function(event) {
        event.stopPropagation();
        article.classList.add("collapsed");
      };

      fullContent.appendChild(minimizeButton);

      article.appendChild(header);
      article.appendChild(fullContent);

      // Open the note when clicked
      header.onclick = function() {
        article.classList.remove("collapsed");
      };

      // Owner controls
      if (auth.currentUser) {

        const editButton = document.createElement("button");
        editButton.className = "enter-button";
        editButton.textContent = "EDIT";

        editButton.onclick = function(event) {

          event.stopPropagation();

          window.editNote(
            note.id,
            note.text
          );

        };

        const deleteButton = document.createElement("button");
        deleteButton.className =
          "enter-button delete-button";

        deleteButton.textContent = "DELETE";

        deleteButton.onclick = function(event) {

          event.stopPropagation();

          window.deleteNote(note.id);

        };

        fullContent.appendChild(editButton);
        fullContent.appendChild(deleteButton);

      }

      container.appendChild(article);

    });

  } catch (error) {

    console.error(error);

  }

}


  container.innerHTML = "";


  try {

    const snapshot =
      await getDocs(
        collection(db, "notes")
      );


    snapshot.forEach(function(noteDocument) {

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


        editButton.onclick = function() {

          window.editNote(
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


        deleteButton.onclick = function() {

          window.deleteNote(
            noteDocument.id
          );

        };


        article.appendChild(editButton);
        article.appendChild(deleteButton);

      }


      container.appendChild(article);

    });


  } catch (error) {

    console.error(error);

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


  await setDoc(
    doc(db, "notes", id),
    {
      title: "Owner's Note",
      text: newText
    }
  );


  loadNotes();

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


  await deleteDoc(
    doc(db, "notes", id)
  );


  loadNotes();

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


  if (text === null || text.trim() === "") {
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


    if (auth.currentUser) {
      loadSubmissions();
    }


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

  if (!auth.currentUser) {
    return;
  }


  const container =
    document.getElementById("entries");


  if (!container) {
    return;
  }


  container.innerHTML = "";


  const snapshot =
    await getDocs(
      collection(db, "submissions")
    );


  snapshot.forEach(function(submissionDocument) {

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

  });

}


// ==========================
// INITIAL PAGE
// ==========================

window.showPage("welcome");
