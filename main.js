const listBook = [];
const DISPLAY_LIST_BOOK = "display-book";
const BOOK_CHANGE = "saved-book";
const STORAGE_KEY = "BOOKS-APPS";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("bookForm");
  const searchForm = document.getElementById("searchBook");
  const incompleteListContainer = document.querySelector("#incompleteBookList");
  const completeListContainer = document.querySelector("#completeBookList");

  let editingBookId = null;

  submitForm.addEventListener("submit", function (e) {
    e.preventDefault();

    addBook();
    submitForm.reset();
  });

  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();

    searchBook();
  });

  function addBook() {
    const titleBook = document.getElementById("bookFormTitle");
    const authorBook = document.getElementById("bookFormAuthor");
    const yearBook = document.getElementById("bookFormYear");
    const isCompleted = document.getElementById("bookFormIsComplete");

    const bookObject = {
      id: +new Date(),
      title: titleBook.value,
      author: authorBook.value,
      year: Number(yearBook.value),
      isComplete: isCompleted.checked,
    };

    if (editingBookId === null) {
      listBook.push(bookObject);
    } else {
      const bookTarget = findBook(editingBookId);
      if (bookTarget) {
        bookTarget.title = titleBook.value;
        bookTarget.author = authorBook.value;
        bookTarget.year = Number(yearBook.value);
        bookTarget.isComplete = isCompleted.checked;
      }
      editingBookId = null;
      document.getElementById(
        "bookFormSubmit"
      ).innerHTML = `Masukkan Buku ke rak / <span>Belum selesai dibaca</span>`;
          document.getElementById("titleForm").innerText = "Tambah Buku Baru";

    }

    document.dispatchEvent(new Event(DISPLAY_LIST_BOOK));
    saveData();
  }

  function searchBook() {
    const titleInput = document
      .getElementById("searchBookTitle")
      .value.toLowerCase();

    if (!titleInput) {
      document.dispatchEvent(new Event(DISPLAY_LIST_BOOK));
      return;
    }

    const filterBooks = listBook.filter((book) =>
      book.title.toLowerCase().includes(titleInput)
    );

    completeListContainer.innerHTML = "";
    incompleteListContainer.innerHTML = "";

    for (const book of filterBooks) {
      const bookElement = createListBook(book);
      if (book.isComplete) {
        completeListContainer.append(bookElement);
      } else {
        incompleteListContainer.append(bookElement);
      }
    }
  }

  function createListBook(bookObject) {
    const bookContainer = document.createElement("div");
    bookContainer.classList.add("bookContainer");
    bookContainer.setAttribute("data-bookid", bookObject.id);
    bookContainer.setAttribute("data-testid", "bookItem");

    const title = document.createElement("h3");
    title.setAttribute("data-testid", "bookItemTitle");
    title.innerText = bookObject.title;

    const author = document.createElement("p");
    author.setAttribute("data-testid", "bookItemAuthor");
    author.innerText = "Penulis: " + bookObject.author;

    const year = document.createElement("p");
    year.setAttribute("data-testid", "bookItemYear");
    year.innerText = "Tahun: " + bookObject.year;

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("buttonContainer");

    const completeButton = document.createElement("button");
    completeButton.setAttribute("data-testid", "bookItemIsCompleteButton");
    completeButton.classList.add("green");
    completeButton.innerText = bookObject.isComplete
      ? "Belum Selesai"
      : "Selesai Dibaca";

    const deleteButton = document.createElement("button");
    deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
    deleteButton.classList.add("red");
    deleteButton.innerText = "Hapus Buku";

    const editButton = document.createElement("button");
    editButton.classList.add("blue");
    editButton.setAttribute("data-testid", "bookItemEditButton");
    editButton.innerText = "Edit Buku";

    buttonContainer.appendChild(completeButton);
    buttonContainer.appendChild(deleteButton);
    buttonContainer.appendChild(editButton);

    bookContainer.appendChild(title);
    bookContainer.appendChild(author);
    bookContainer.appendChild(year);
    bookContainer.appendChild(buttonContainer);

    if (bookObject.isComplete) {
      completeButton.style.backgroundColor = "#FFD93D";
      completeListContainer.append(bookContainer);

      completeButton.addEventListener("click", function () {
        removeBookFromComplete(bookObject.id);
      });

      deleteButton.addEventListener("click", function () {
        deleteBook(bookObject.id);
      });

      editButton.addEventListener("click", function () {
        editBook(bookObject.id);
      });
    } else {
      incompleteListContainer.append(bookContainer);

      completeButton.addEventListener("click", function () {
        removeBookFromIncomplete(bookObject.id);
      });

      deleteButton.addEventListener("click", function () {
        deleteBook(bookObject.id);
      });

      editButton.addEventListener("click", function () {
        editBook(bookObject.id);
      });
    }

    return bookContainer;
  }

  function removeBookFromComplete(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(DISPLAY_LIST_BOOK));
    saveData();
  }

  function removeBookFromIncomplete(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(DISPLAY_LIST_BOOK));
    saveData();
  }

  function deleteBook(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    listBook.splice(bookTarget, 1);
    document.dispatchEvent(new Event(DISPLAY_LIST_BOOK));
    saveData();
  }

  function editBook(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;

    document.getElementById("bookFormTitle").value = bookTarget.title;
    document.getElementById("bookFormAuthor").value = bookTarget.author;
    document.getElementById("bookFormYear").value = bookTarget.year;
    document.getElementById("bookFormIsComplete").checked =
      bookTarget.isComplete;

    editingBookId = bookId;

    document.getElementById(
      "bookFormSubmit"
    ).innerHTML = `Simpan Perubahan <span></span>`;
    document.getElementById("titleForm").innerText = "Edit Buku";
  }

  function findBookIndex(bookId) {
    for (const index in listBook) {
      if (listBook[index].id === bookId) {
        return index;
      }
    }

    return -1;
  }

  function findBook(bookId) {
    for (const bookItem of listBook) {
      if (bookItem.id === bookId) {
        return bookItem;
      }
    }

    return null;
  }

  document.addEventListener(DISPLAY_LIST_BOOK, function () {
    incompleteListContainer.innerHTML = "";
    completeListContainer.innerHTML = "";

    for (const book of listBook) {
      createListBook(book);
    }
  });

  function saveData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(listBook);
      localStorage.setItem(STORAGE_KEY, parsed);
      document.dispatchEvent(new Event(BOOK_CHANGE));
    }
  }

  function isStorageExist() {
    if (typeof Storage === undefined) {
      alert("Maaf Browser Anda Tidak Mendukung Local Storage!");
      return false;
    }

    return true;
  }

  function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
      for (const book of data) {
        listBook.push(book);
      }
    }

    document.dispatchEvent(new Event(DISPLAY_LIST_BOOK));
  }

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});
