const profile_name = document.getElementById("profileName");
const inspection_date = document.getElementById("ins-date");
const patient_name = document.getElementById("nameData");
const patient_gender = document.getElementById("genderData");
const patient_birthday = document.getElementById("birthdayData");
const doctor_name = document.getElementById("doctorData");
const complaints = document.getElementById("complaints");
const anamnesis = document.getElementById("anamnesis");
const treatment = document.getElementById("treatment");
const conclusion = document.getElementById("conclusion");
const diagnosis = document.getElementById("diagnosis");
const consultations_list = document.getElementById("consultations");

window.load = setData();

function setData() {
    var profileData = JSON.parse(localStorage.getItem('profileData')); 
    profile_name.textContent = profileData.name;

    getInspection()
        .then((data) => {
            console.log(data);
            setInspection(data);
            data.consultations.forEach((c) => {
                // getConsultation(c.id)
                // .then((cons) => {
                //     console.log(cons);
                //     makeConsultation(data, cons);
                // });
                makeConsultation(data, c);
            })
        });

}

function setInspection(data) {
    inspection_date.innerHTML = formatDate(data.createTime);
    patient_name.innerHTML = data.patient.name;
    patient_gender.innerHTML = data.patient.gender == "Male" ? "мужской" : "женский";
    const date = new Date(data.patient.birthday);
    patient_birthday.textContent = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
    doctor_name.innerHTML = data.doctor.name;
    complaints.innerHTML = data.complaints;
    anamnesis.innerHTML = data.anamnesis;
    treatment.innerHTML = data.treatment;

    data.diagnoses.forEach((d) => {
        makeDiagnosis(d);
    })
    
    const conclusionParagraph = document.createElement('p');
    conclusionParagraph.className = 'fs-6 fw-bold';
    switch (data.conclusion) {
        case "Recovery":
            conclusionParagraph.innerHTML = 'Выздоровление';
            break;
        case "Disease":
            conclusionParagraph.innerHTML = 'Болезнь';
            break;
        case "Death":
            conclusionParagraph.innerHTML = 'Смерть';
            break;
        default:
            conclusionParagraph.innerHTML = 'Заключение: фигня какая-то';
            break;
    }

    const dateParagraph = document.createElement('p');
    dateParagraph.className = 'fs-6 info';
    dateParagraph.innerHTML = `Дата следующего визита: ${formatDate(data.nextVisitDate)}`;
    conclusion.appendChild(conclusionParagraph);
    conclusion.appendChild(dateParagraph);
}


function formatDate(dateString) {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0'); 
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0'); 
    const minutes = String(date.getMinutes()).padStart(2, '0'); 

    const formattedDate = `${day}.${month}.${year} &ndash; ${hours}:${minutes}`;
    return formattedDate;
}

function makeDiagnosis(data) {
    const diagnosisParagraph = document.createElement('p');
    diagnosisParagraph.className = 'fs-6 fw-bold';
    diagnosisParagraph.innerHTML = `(${data.code}) ${data.name}`;
    const div = document.createElement('div');
    div.className = "comments";
    const p1 = document.createElement('p');
    p1.className = "lh-1 fs-6 info";
    p1.innerHTML = `Тип в осмотре: ${data.type}`;

    switch (data.type) {
        case "Main":
            p1.innerHTML = 'Тип в осмотре: Основной';
            break;
        case "Concomitant":
            p1.innerHTML = 'Тип в осмотре: Сопутствующий';
            break;
        case "Complication":
            p1.innerHTML = 'Тип в осмотре: Осложнение';
            break;
        default:
            p1.innerHTML = 'Тип в осмотре: фигня какая-то';
            break;
    }

    const p2 = document.createElement('p');
    p2.className = "lh-1 fs-6 info";
    p2.innerHTML = `Расшифровка: ${data.description}`;
    div.appendChild(p1);
    div.appendChild(p2);
    diagnosis.appendChild(diagnosisParagraph);
    diagnosis.appendChild(div);
}


function getInspection() {
    const token = JSON.parse(localStorage.getItem('token'));
    var inspId = JSON.parse(localStorage.getItem('inspectionId')); 

    return fetch(`https://mis-api.kreosoft.space/api/inspection/${inspId}`, {
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

function makeConsultation(all_data, data) {
    const mainDiv = document.createElement('div');
    mainDiv.className = 'col-12 title';

    const titleParagraph = document.createElement('p');
    titleParagraph.className = 'fs-4 fw-medium';
    titleParagraph.textContent = 'Консультация';

    const consultantParagraph = document.createElement('p');
    consultantParagraph.className = 'fs-6 fw-bold';
    consultantParagraph.innerHTML = `Консультант: ${all_data.doctor.name}`;

    const specializationParagraph = document.createElement('p');
    specializationParagraph.className = 'fs-6 info';
    specializationParagraph.innerHTML = `Специализация консультанта: ${data.speciality.name}`;

    mainDiv.appendChild(titleParagraph);
    mainDiv.appendChild(consultantParagraph);
    mainDiv.appendChild(specializationParagraph);
    consultations_list.appendChild(mainDiv);

}

function getConsultation(id) {
    const token = JSON.parse(localStorage.getItem('token'));
    return fetch(`https://mis-api.kreosoft.space/api/consultation/${id}`, {
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
