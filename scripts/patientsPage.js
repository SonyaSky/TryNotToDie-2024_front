const profile_name = document.getElementById("profileName");
const patients_list = document.getElementById("patients-list");
const pagination_controls = document.getElementById('pagination-controls');
const registration_form = document.getElementById('register-patient');
const input_patient_name = document.getElementById('inputPatientName');
const input_patient_gender = document.getElementById("inputGender");
const input_patient_birthday = document.getElementById("inputDate");

window.load = setPatients();

function setPatients() {
    var profileData = JSON.parse(localStorage.getItem('profileData')); 
    console.log(profileData);
    profile_name.textContent = profileData.name;

    getPatients("", "", "", false, true, 1, 5)
    .then((patientsData) => {
        console.log(patientsData.patients); 
        patients = patientsData.patients;
        patientsData.patients.forEach((element) => {
            makePatient(element);
        });
    })
    .catch((error) => {
        console.error('Error:', error.message); 

    });
    
}

//https://mis-api.kreosoft.space/api/patient?name=1&conclusions=Disease&sorting=NameAsc&scheduledVisits=false&onlyMine=false&page=1&size=5
function getPatients(name, conclusions, sorting, scheduled, mine, page, size) {
    var url = "https://mis-api.kreosoft.space/api/patient?";
    if (name != "") {
        url += `name=${name}&`;
    }
    if (conclusions != "") {
        url += `conclusions=${name}&`;
    }
    if (sorting != "") {
        url += `sorting=${name}&`;
    }
    url += `scheduledVisits=${scheduled}&`;
    url += `onlyMine=${mine}&`;
    url += `page=${page}&`;
    url += `size=${size}`;

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
    birthdayData.textContent = data.birthday;
    birthday.appendChild(birthdayData);
    patient.appendChild(birthday);

    col.appendChild(patient);
    patients_list.appendChild(col);

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