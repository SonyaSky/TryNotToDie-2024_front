const profile_name = document.getElementById("profileName");
const patients_list = document.getElementById("patients-list");
const pagination_list = document.getElementById("pages");
const registration_form = document.getElementById('register-patient');
const input_patient_name = document.getElementById('inputPatientName');
const input_patient_gender = document.getElementById("inputGender");
const input_patient_birthday = document.getElementById("inputDate");

const filter_form = document.getElementById('filter-form');
const input_name = document.getElementById('inputName');
const select_conslusion = document.getElementById('select');
const planned_check = document.getElementById('planned-visits');
const my_patients = document.getElementById('my-patients');
const select_sorting = document.getElementById('sorting');
const patients_count = document.getElementById('patientCount');

var requestData = {
    name: "",
    conclusions: "",
    sorting: "",
    scheduled: false, 
    mine: true,
    page: 1,
    size: 5
}
var count;


window.load = setPatients();

function setPatients() {
    var profileData = JSON.parse(localStorage.getItem('profileData')); 
    console.log(profileData);
    profile_name.textContent = profileData.name;

    getPatients()
    .then((patientsData) => {
        console.log(patientsData); 
        count = patientsData.pagination.count;
        setupPagination();
        patientsData.patients.forEach((element) => {
            makePatient(element);
        });
    });
    
}

function setupPagination() {
    while (pagination_list.firstChild) {
        pagination_list.removeChild(pagination_list.firstChild);
    }
    if (count == 0) {
        noPatients();
        return;
    }
    const prev = document.createElement("li");
    prev.className = 'page-item';
    const atr = document.createElement("a");
    atr.className = 'page-link';
    atr.ariaLabel = "Previous";
    atr.innerHTML = "&lt;";
    prev.appendChild(atr);
    if (requestData.page < 6) {
        prev.classList.add('disabled');
    }
    else {
        prev.addEventListener('click', (e) => {
            e.preventDefault();
            requestData.page = (Math.ceil(requestData.page/5) - 1)*5 - 4;
            while (patients_list.firstChild) {
                patients_list.removeChild(patients_list.firstChild);
            }
            getPatients()
            .then((patientsData) => {
                console.log(patientsData); 
                setupPagination();
                patientsData.patients.forEach((element) => {
                    makePatient(element);
                });
            });
        });
    }

    pagination_list.appendChild(prev);

    var i = requestData.page;
    while (i <= count && i-requestData.page < 5) {
        const btn = createButton(i);
        pagination_list.appendChild(btn);
        i++;
    }

    const next = document.createElement("li");
    next.className = 'page-item';
    const atr1 = document.createElement("a");
    atr1.className = 'page-link';
    atr1.ariaLabel = "Next";
    atr1.innerHTML = "&gt;";
    next.appendChild(atr1);
    if (count - requestData.page < 6) {
        next.classList.add('disabled');
    }
    else {
        next.addEventListener('click', (e) => {
            e.preventDefault();
            requestData.page = Math.ceil(requestData.page/5)*5 + 1;
            while (patients_list.firstChild) {
                patients_list.removeChild(patients_list.firstChild);
            }
            getPatients()
            .then((patientsData) => {
                console.log(patientsData); 
                setupPagination();
                patientsData.patients.forEach((element) => {
                    makePatient(element);
                });
            });
        });
    }
    pagination_list.appendChild(next);

}

function createButton(page) {
    const button = document.createElement("li");
    button.className = 'page-item';
    if (page == requestData.page) button.classList.add('active');
    const atr = document.createElement("a");
    atr.className = 'page-link';
    atr.innerHTML = page;
    button.appendChild(atr);

    button.addEventListener('click', (e) => {
        e.preventDefault();
        const current_btn = document.querySelector('li.page-item.active');
		current_btn.classList.remove('active');
        requestData.page = page;
        button.classList.add('active');
        while (patients_list.firstChild) {
            patients_list.removeChild(patients_list.firstChild);
        }

        getPatients()
        .then((patientsData) => {
            console.log(patientsData); 
            patientsData.patients.forEach((element) => {
                makePatient(element);
            });
        });

    })
    return button;
}

function noPatients() {
    const div = document.createElement("div");
    div.className = 'col-12';
    const p = document.createElement("p");
    p.className = 'fs-3 text-center';
    p.innerHTML = "Таких пациентов нет :(";
    div.appendChild(p);
    patients_list.appendChild(div);
}


filter_form.addEventListener('submit', (e) => {
    e.preventDefault();
    requestData.name = input_name.value;
    requestData.conclusions = select_conslusion.value;
    requestData.scheduled = planned_check.checked;
    requestData.mine = my_patients.checked;
    requestData.sorting = select_sorting.value;
    requestData.page = 1;
    requestData.size = patients_count.value;
    console.log(requestData);
    while (patients_list.firstChild) {
        patients_list.removeChild(patients_list.firstChild);
    }

    getPatients()
    .then((patientsData) => {
        console.log(patientsData); 
        count = patientsData.pagination.count;
        setupPagination();
        patientsData.patients.forEach((element) => {
            makePatient(element);
        });
    });
})





//https://mis-api.kreosoft.space/api/patient?name=1&conclusions=Disease&sorting=NameAsc&scheduledVisits=false&onlyMine=false&page=1&size=5
function getPatients() {
    var url = "https://mis-api.kreosoft.space/api/patient?";
    if (requestData.name != "") {
        url += `name=${requestData.name}&`;
    }
    if (requestData.conclusions != "") {
        url += `conclusions=${requestData.conclusions}&`;
    }
    if (requestData.sorting != "") {
        url += `sorting=${requestData.sorting}&`;
    }
    url += `scheduledVisits=${requestData.scheduled}&`;
    url += `onlyMine=${requestData.mine}&`;
    url += `page=${requestData.page}&`;
    url += `size=${requestData.size}`;

    const token = JSON.parse(localStorage.getItem('token'));

    return fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        }
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json(); 
    })
    .then((data) => {
        return data;
    })
    .catch((error) => {
        console.error('Error fetching data:', error); 
    });
}

function makePatient(data) {
    const col = document.createElement("div");
    col.classList.add("col-12");
    col.classList.add("col-lg-6");
    const patient = document.createElement("div");
    patient.classList.add("patient");

    const name = document.createElement("p");
    name.classList.add("fs-5");
    name.classList.add("fw-bold");
    name.textContent = data.name;
    patient.appendChild(name);

    const gender = document.createElement("p");
    gender.classList.add("fs-6");
    gender.classList.add("info");
    gender.textContent = "Пол \u2013 ";
    const genderData = document.createElement("span");
    genderData.classList.add("patientData");
    if (data.gender == 'Male'){
        genderData.textContent = "Мужчина";
    }
    else {
        genderData.textContent = "Женщина";
    }
    gender.appendChild(genderData);
    patient.appendChild(gender);

    const birthday = document.createElement("p");
    birthday.classList.add("fs-6");
    birthday.classList.add("info");
    birthday.textContent = "Дата рождения \u2013 ";
    const birthdayData = document.createElement("span");
    birthdayData.classList.add("patientData");
    const date = new Date(data.birthday);
    birthdayData.textContent = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
    birthday.appendChild(birthdayData);
    patient.appendChild(birthday);

    col.appendChild(patient);
    patients_list.appendChild(col);

    patient.addEventListener('click', () => {
        console.log(data);
        localStorage.setItem('patientData', JSON.stringify(data));
        window.location.href = "patient.html";
    })

}



registration_form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = input_patient_name.value;
    if (!name) {
        alert("Введите имя, пожалуйста!");
        return;
    }
    if (!input_patient_birthday.value) {
        alert("Введите  дату рождения, пожалуйста!");
        return;
    }
    const birthday = new Date(input_patient_birthday.value);

    const newPatient = {
        name: input_patient_name.value,
        birthday: birthday.toISOString().slice(0, 19),
        gender: input_patient_gender.value == "Мужской" ? "Male" : "Female",
    };
    console.log(newPatient);
    addPatient(newPatient);

})


function addPatient(patient) {
    const token = JSON.parse(localStorage.getItem('token')); 
    return fetch('https://mis-api.kreosoft.space/api/patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(patient),
      })
    .then((response) => response.json())
    .then((data) => data);
}