const profile_name = document.getElementById("profileName");
const patient_name = document.getElementById("patient-name");
const patient_birthday = document.getElementById("birthdayData");
const patient_gender = document.getElementById("gender-icon");
const leftLabel = document.getElementById('label-left');
const rightLabel = document.getElementById('label-right');
const consultation_button = document.getElementById('add-consultation');
const diagnosis_button = document.getElementById('add-diagnosis');
const consultations_list = document.getElementById("consultations");
const diagnoses_list = document.getElementById("diagnosis");
const select_conclusion = document.getElementById("select-conclusion");
const prev_inspection = document.getElementById("prev-inspection");
const save_button = document.getElementById('save-button');
const cancel_button = document.getElementById('cancel-button');

var diagnoses = [];
var consultations = [];
var profileData = JSON.parse(localStorage.getItem('profileData')); 
var specialties = [];
var icd10roots = [];
var main_count = 0;

window.load = setData();

function setData() {
    console.log(profileData);
    profile_name.textContent = profileData.name;

    fetchSpecialties().then(() => {
        populateSelect(); 
    });
    fetchDiseases().then(() => {
        populateSelectDisease(); 
    });

    fetchInspections()
        .then((inspectionsData) => {
            populateSelectInpections(inspectionsData);
        });

    prev_inspection.style.display = 'none';

    const patientData = JSON.parse(localStorage.getItem('patientData'));
    console.log(patientData);
    patient_name.innerHTML = patientData.name;
    const date = new Date(patientData.birthday);
    patient_birthday.textContent = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;

    if (patientData.gender == 'Male') {
        patient_gender.src = "images/gender-male.svg";
        patient_gender.alt = "Male Icon";
    }
    leftLabel.style.color = 'blue';
    
}

consultation_button.addEventListener('click', (e) => {
    e.preventDefault();
    const speciality_input = document.getElementById('inputSpeciality');
    const comment = document.getElementById('comment'); 

    const data1 = {
        name: profileData.name,
        speciality: findSpecialityName(speciality_input.value)
    }
    makeConsultation(data1);
    const a = {
        content: comment.value
    }

    const data2 = {
        specialityId: speciality_input.value,
        comment: a
    }
    consultations.push(data2);
});


diagnosis_button.addEventListener('click', (e) => {
    e.preventDefault();
    const conclusion = getCheckedRadioValue();
    const comment = document.getElementById('comment1');
    const disease = document.getElementById('inputDisease');
    if (disease.value == "") {
        alert("Нельзя поставить диагноз без болезни");
        return;
    }

    const d = findDiseaseName(disease.value);
    const data1 = {
        name: d.name,
        code: d.code,
        description: comment.value,
        type: conclusion
    }
    makeDiagnosis(data1);

    const data2 = {
        icdDiagnosisId: disease.value,
        description: comment.value,
        type: conclusion
    }
    diagnoses.push(data2);
    if (data2.type == "Main") {
        main_count ++;
    }
});

select_conclusion.addEventListener('change', (e) => {
    const nextVisitLabel = document.getElementById('next-visit');
    const inputDate = document.getElementById('date-block');
    const selectedValue = e.target.value;
    if (selectedValue === 'Recovery') {
        inputDate.style.display = 'none';
    } else if (selectedValue === 'Death') {
        nextVisitLabel.style.display = 'block';
        inputDate.style.display = 'block';
        nextVisitLabel.textContent = 'Дата и время смерти';
    } else {
        nextVisitLabel.style.display = 'block';
        inputDate.style.display = 'block';
        nextVisitLabel.textContent = 'Дата следующего визита';
    }
});


function getCheckedRadioValue() {
    const radios = document.getElementsByName('options'); 
    for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            return radios[i].value; 
        }
    }
    return null; 
}

function findSpecialityName(id) {
    return specialties.find(specialty => specialty.id == id).name;
}

function findDiseaseName(id) {
    return icd10roots.find(disease => disease.id == id);
}

function fetchSpecialties() {
    return fetch('https://mis-api.kreosoft.space/api/dictionary/speciality?page=1&size=25')
    .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); 
      })
      .then(data => {
        specialties = data.specialties.map(specialty => ({
          name: specialty.name,
          id: specialty.id,
          createTime: specialty.createTime
        }));
        return specialties;
      })
      .catch(error => {
        console.error('Error:', error);
      });
}

function populateSelect() {
    
    const selectElement = document.getElementById('inputSpeciality');      
    selectElement.innerHTML = '';

    specialties.forEach(option => {
        const opt = document.createElement('option');
        opt.textContent = option.name;
        opt.value =  option.id;
        selectElement.appendChild(opt);
    });
}

function fetchDiseases() {
    return fetch('https://mis-api.kreosoft.space/api/dictionary/icd10/roots')
    .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); 
      })
      .then(data => { 
        icd10roots = data.map(d => ({
            code: d.code,
            name: d.name,
            id: d.id,
            createTime: d.createTime
        }));
        return icd10roots;
      })
      .catch(error => {
        console.error('Error:', error);
      });
}

function populateSelectDisease() {
    
    const selectElement = document.getElementById('inputDisease');      
  
    icd10roots.forEach(option => {
        const opt = document.createElement('option');
        opt.textContent = `${option.code} - ${option.name}`;
        opt.value = option.id;
        selectElement.appendChild(opt);
    });

}

function makeConsultation(data) {
    console.log(data);
    const mainDiv = document.createElement('div');
    mainDiv.className = 'col-12 title';

    const consultantParagraph = document.createElement('p');
    consultantParagraph.className = 'fs-6 fw-bold';
    consultantParagraph.innerHTML = `Консультант: ${profileData.name}`;

    const specializationParagraph = document.createElement('p');
    specializationParagraph.className = 'fs-6 info';
    specializationParagraph.innerHTML = `Специализация консультанта: ${data.speciality}`;

    mainDiv.appendChild(consultantParagraph);
    mainDiv.appendChild(specializationParagraph);

    consultations_list.appendChild(mainDiv);
}

function makeDiagnosis(data) {
    const diagnosisParagraph = document.createElement('p');
    diagnosisParagraph.className = 'fs-6 fw-bold';
    diagnosisParagraph.innerHTML = `(${data.code}) ${data.name}`;
    const div = document.createElement('div');
    div.className = "types";
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
    diagnoses_list.appendChild(diagnosisParagraph);
    diagnoses_list.appendChild(div);
}

function fetchInspections() {
    const id = JSON.parse(localStorage.getItem('patientData')).id;
    const token = JSON.parse(localStorage.getItem('token'));
    return fetch(`https://mis-api.kreosoft.space/api/patient/${id}/inspections/search`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        }
    })
    .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); 
      })
      .then(data => {
        return data;
      })
      .catch(error => {
        console.error('Error:', error);
      });
}

function populateSelectInpections(data) {
         
    const selectElement = document.getElementById('inputPrev');    

    data.forEach((option) => {
        const opt = document.createElement('option');
        opt.textContent = formatInspection(option);
        opt.value =  option.id;
        selectElement.appendChild(opt);
    });
}

function formatInspection(data) {
    const date = new Date(data.date);
    const formattedDate = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    const diagnosisCode = data.diagnosis.code;
    const diagnosisName = data.diagnosis.name;
    const result = `${formattedDate} ${diagnosisCode} - ${diagnosisName}`;
    
    return result;
}

document.getElementById('planned-visits').addEventListener('change', function () {
    if (this.checked) {
        prev_inspection.style.display = 'block';
        leftLabel.style.color = 'black';
        rightLabel.style.color = 'blue';
    } else {
        prev_inspection.style.display = 'none';
        leftLabel.style.color = 'blue';
        rightLabel.style.color = 'black';
    }
});

cancel_button.addEventListener('click', () => {
    location.reload();
});



save_button.addEventListener('click', (e) => {
    e.preventDefault();
    const f_date = document.getElementById('inputDateInsp');
    const current_date = new Date();
    if (f_date.value == "") {
        alert("Введите дату осмотра");
        return;
    }
    const s_date = new Date(f_date.value);
    if (s_date > current_date) {
        if (profileData.name.toLowerCase().includes("доктор кто")) {
            alert("Я, конечно, понимаю - ТАРДИС и все дела, но осмотр не мог проходить в будущем!");
        } else {
            alert("Осмотр не мог проходить в будущем!");
        }
        return;
    }
    const date = new Date(document.getElementById('inputDateInsp').value);
    const complaints = document.getElementById('complaints');
    if (complaints.value == "") {
        alert("Введите жалобы");
        return;
    }
    const anamnesis = document.getElementById('anamnesis');
    if (anamnesis.value == "") {
        alert("Введите анамнез");
        return;
    }
    const treatment = document.getElementById('treatment');
    if (treatment.value == "") {
        alert("Введите рекомендации по лечению");
        return;
    }

    if (select_conclusion.value == "") {
        alert("Добавьте заключение");
        return;
    }
    var next_visit_date;
    if (select_conclusion.value != "Recovery") {
        if (document.getElementById('next-visit-input').value == "") {
            alert("Добавьте дату в заключение");
            return;
        }
        next_visit_date = new Date(document.getElementById('next-visit-input').value);
    }

    data = {
        date: date.toISOString(),
        anamnesis:anamnesis.value,
        complaints:complaints.value,
        treatment: treatment.value,
        conclusion: select_conclusion.value,
        nextVisitDate: null,
        deathDate: null,
        previousInspectionId: null,
        diagnoses: diagnoses,
        consultations:consultations
    }
    if (select_conclusion.value == "Death"){
        if (next_visit_date > current_date){
            alert("Дата смерти не может быть в будущем");
            return;
        }
        data.deathDate = next_visit_date.toISOString();
        data.nextVisitDate = null;
    }
    else if (select_conclusion.value == "Disease") {
        if (next_visit_date < current_date){
            alert("Дата следующего визита не может быть в прошлом");
            return;
        }
        data.nextVisitDate = next_visit_date.toISOString();
    }

    if (main_count != 1) {
        alert("Должен быть поставлен один основной диагноз");
        return;
    }

    if (document.getElementById('planned-visits').checked) {
        const inputPrev = document.getElementById('inputPrev');
        data.previousInspectionId = inputPrev.value;
    }
    console.log(data);
    addInspection(data)
    .then((data) => {
        const token = data.token; 
        console.log(token); 
    })
    .catch((error) => {
        console.error('Error:', error.message); 
    });

})

function addInspection(data) {
    const token = JSON.parse(localStorage.getItem('token')); 
    const id = JSON.parse(localStorage.getItem('patientData')).id;
    return fetch(`https://mis-api.kreosoft.space/api/patient/${id}/inspections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      })
      .then((response) => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error('An error occurred: ' + (errorData.errors || 'Unknown error')); // Handle other errors
            });
        }
        return response.json();
    })
    .then((data) => {
        console.log('Login successful:', data);
        return data;
    })
    .catch((error) => {
        console.error('Error:', error.message);
        throw error;
    });
}

