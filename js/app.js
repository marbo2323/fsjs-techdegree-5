const settings = {
  studentUrl: "https://randomuser.me/api",
  results: 12,
  includedFields: [
    "id",
    "name",
    "dob",
    "email",
    "location",
    "phone",
    "picture",
  ],
};

let students = [];
let searchCriteria = "";

const searchContainer = document.querySelector("div.search-container");
const gallery = document.querySelector("#gallery");

/**
 * Fetch data from reomote url
 * @param {string} url
 */
function fetchData(url) {
  return fetch(url)
    .then((response) => {
      if (response.ok) {
        return Promise.resolve(response);
      } else {
        return Promise.reject(new Error(response.statusText));
      }
    })
    .then((response) => response.json())
    .catch((error) => {
      console.error("Something went wrong while fetching data", error);
    });
}

/**
 * Downloads students data and assigns the result to global variable "students"
 */
async function getStudents() {
  const fields = settings.includedFields.join(",");
  const url =
    settings.studentUrl + "?results=" + settings.results + "&inc=" + fields;
  students = (await fetchData(url)).results;
}

/**
 * create searchform HTML
 */
function createSearchForm() {
  const searchFotmHtml = ` 
    <form action="#" method="get">
      <input type="search" id="search-input" class="search-input" placeholder="Search...">
      <input type="submit" value="&#x1F50D;" id="search-submit" class="search-submit">
    </form>`;
  searchContainer.insertAdjacentHTML("beforeend", searchFotmHtml);

  const submitButton = searchContainer.querySelector("#search-submit");

  submitButton.addEventListener("click", (event) => {
    event.preventDefault();
    const searchInput = searchContainer.querySelector("input.search-input");
    searchCriteria = searchInput.value;
    searchInput.value = "";
    showStudentsByName();
  });
}

/**
 * Returns an array of students whose name contains the lowercase value of the name parameter
 * @param {string} name - filter value
 * @returns
 */
function filterStudentsByName(name) {
  if (name.trim() === "") {
    return students;
  }
  return students.filter((student) => {
    const studentName = (
      student.name.first +
      " " +
      student.name.last
    ).toLowerCase();
    return studentName.includes(name.toLowerCase());
  });
}

/**
 * Filter gallery cards by search criteria
 */
function showStudentsByName() {
  gallery.querySelectorAll("div.card").forEach((card) => {
    const studentName = card.querySelector("h3.card-name").textContent;
    card.style.display = "";
    if (
      searchCriteria.trim() &&
      !studentName.toLowerCase().includes(searchCriteria.toLowerCase())
    ) {
      card.style.display = "none";
    }
  });
}

/**
 * creates students gallery HTML
 */
async function createStudentGallery() {
  try {
    await getStudents();
    students.forEach((student) => {
      const studentCard = `
      <div class="card">
        <div class="card-img-container">
            <img class="card-img" src="${student.picture.medium}" alt="profile picture">
        </div>
        <div class="card-info-container">
            <h3 id="name" class="card-name cap">${student.name.first} ${student.name.last}</h3>
            <p class="card-text">${student.email}</p>
            <p class="card-text cap">${student.location.city}, ${student.location.state}</p>
        </div>
    </div>`;
      gallery.insertAdjacentHTML("beforeend", studentCard);
    });
  } catch (error) {
    gallery.insertAdjacentHTML(
      "beforeend",
      `<h3 style="color: red">There was a problem accessing students data</h3>`
    );
  }
}

/**
 * Converts the date value in JavaScript date string format to m/d/yyyy format
 * @param {string} jsDateString  date in JavaScript format
 * @returns {string} date value in m/d/yyyy format
 */
function formatDate(jsDateString) {
  const dateValue = new Date(jsDateString);
  return `${
    dateValue.getMonth() + 1
  }/${dateValue.getDate()}/${dateValue.getFullYear()}`;
}

/**
 * compile student data for modal panel
 * @param {object} student
 * @returns {object}
 */
function getModalData(student) {
  const address =
    student.location.street.number +
    " " +
    student.location.street.name +
    ", " +
    student.location.city +
    ", " +
    student.location.state +
    " " +
    student.location.postcode;

  const birthday = formatDate(student.dob.date);
  const picture = student.picture.large;
  const name = student.name.first + " " + student.name.last;
  const email = student.email;
  const phone = student.phone;
  const city = student.location.city;
  return { address, birthday, city, name, email, phone, picture };
}

/**
 * create event listeners for modal buttons
 * @param {Element} modalContainer
 */
function createModalEventListeners(modalContainer) {
  const modalCloseButton = document.querySelector("#modal-close-btn");
  modalCloseButton.addEventListener("click", () => {
    modalContainer.style.display = "none";
  });

  const prevButton = document.querySelector("#modal-prev");
  prevButton.addEventListener("click", () => {
    const studentName = document.querySelector(
      "div.modal-info-container h3.modal-name"
    ).textContent;
    const student = getStudentByName(studentName);
    showModal(getPrevStudent(student));
  });

  const nextButton = document.querySelector("#modal-next");
  nextButton.addEventListener("click", () => {
    const studentName = document.querySelector(
      "div.modal-info-container h3.modal-name"
    ).textContent;
    const student = getStudentByName(studentName);
    showModal(getNextStudent(student));
  });
}

/**
 * Creates initial modal HTML
 * @param {object} student Student object
 * @returns {Element} Modal container HTML element
 */
function createModalHtml(student) {
  const modalData = getModalData(student);
  const modalHtml = `
    <div class="modal-container">
    <div class="modal">
        <button type="button" id="modal-close-btn" class="modal-close-btn"><strong>X</strong></button>
        <div class="modal-info-container">
            <img class="modal-img" src="${modalData.picture}" alt="profile picture">
            <h3 id="name" class="modal-name cap">${modalData.name}</h3>
            <p class="modal-text js-email">${modalData.email}</p>
            <p class="modal-text cap js-city">${modalData.city}</p>
            <hr>
            <p class="modal-text js-phone">${modalData.phone}</p>
            <p class="modal-text js-address">${modalData.address}</p>
            <p class="modal-text js-birthday">Birthday: <span>${modalData.birthday}</span></p>
        </div>
    </div>

    <div class="modal-btn-container">
        <button type="button" id="modal-prev" class="modal-prev btn">Prev</button>
        <button type="button" id="modal-next" class="modal-next btn">Next</button>
    </div>
    </div>`;

  document.body.insertAdjacentHTML("beforeend", modalHtml);
  const modalContainer = document.querySelector("div.modal-container");
  createModalEventListeners(modalContainer);
  return modalContainer;
}

/**
 * Updates existing modal with another student data
 * @param {object} student Student object
 * @param {Element} container Modal container HTML element
 */
function updateModalData(student, container) {
  const modalData = getModalData(student);
  container.querySelector("img.modal-img").src = modalData.picture;
  container.querySelector("h3.modal-name").textContent = modalData.name;
  container.querySelector("p.js-email").textContent = modalData.email;
  container.querySelector("p.js-city").textContent = modalData.city;
  container.querySelector("p.js-phone").textContent = modalData.phone;
  container.querySelector("p.js-address").textContent = modalData.address;
  container.querySelector("p.js-birthday span").textContent =
    modalData.birthday;
}

/**
 * Creates or updates modal panel
 * @param {object} student Student object
 */
function showModal(student) {
  let modalContainer = document.querySelector("div.modal-container");
  if (!modalContainer) {
    modalContainer = createModalHtml(student);
  } else {
    updateModalData(student, modalContainer);
    if (modalContainer.style.display === "none") {
      modalContainer.style.display = "";
    }
  }
}

/**
 * Get next student by given student
 * @param {object} student Student object
 * @returns {object} Student object at next index
 */
function getNextStudent(student) {
  const students = filterStudentsByName(searchCriteria);
  const studentIndex = students.findIndex(
    (item) => item.email === student.email
  );
  return studentIndex < students.length - 1
    ? students.at(studentIndex + 1)
    : students.at(0);
}

/**
 * Get previous student by given student
 * @param {object} student Student object
 * @returns {object} Student at previous index
 */
function getPrevStudent(student) {
  const students = filterStudentsByName(searchCriteria);
  const studentIndex = students.findIndex(
    (item) => item.email === student.email
  );
  return studentIndex > 0
    ? students.at(studentIndex - 1)
    : students.at(students.length - 1);
}

/**
 * Get one student by name from global students array
 * @param {string} studentName
 * @returns
 */
function getStudentByName(studentName) {
  return students.filter(
    (student) => student.name.first + " " + student.name.last === studentName
  )[0];
}

// add event listener to gallery cards to display modal panel
gallery.addEventListener("click", (event) => {
  const studentCard = event.target.closest(".card");
  if (studentCard) {
    const studentName = studentCard.querySelector("h3.card-name").textContent;
    const student = getStudentByName(studentName);

    showModal(student);
  }
});

createSearchForm();
createStudentGallery();
