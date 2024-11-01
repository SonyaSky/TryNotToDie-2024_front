const profile_name = document.getElementById("profileName");
const inspections_list = document.getElementById("inspections-list");
const patient_name = document.getElementById("patient-name");
const patient_birthday = document.getElementById("birthdayData");
const patient_gender = document.getElementById("gender-icon");
const pagination_list = document.getElementById("pages");

//id, grouped, icdRoots, page, size
var icd10roots = [];
var requestData = {
    id: "",
    grouped: false,
    icdRoots: "",
    page: 1,
    size: 5
}
var count;

window.load = setInspections();


function setInspections() {
    var profileData = JSON.parse(localStorage.getItem('profileData')); 
    console.log(profileData);
    profile_name.textContent = profileData.name;

    const patientData = JSON.parse(localStorage.getItem('patientData'));
    console.log(patientData);
    requestData.id = patientData.id;
    patient_name.innerHTML = patientData.name;
    const date = new Date(patientData.birthday);
    patient_birthday.textContent = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;

    if (patientData.gender == 'Male') {
        patient_gender.src = "images/gender-male.svg";
        patient_gender.alt = "Male Icon";
    }
    
    fetchDiseases().then(() => {
        populateSelect(); 
    });

    getInspections()
    .then((inspectionsData) => {
        console.log(inspectionsData); 
        //inspections = inspectionsData.inspections;
        count = inspectionsData.pagination.count;
        setupPagination();
        inspectionsData.inspections.forEach((element) => {
            makeInspection(element);
        });
    });
}

function setupPagination() {
    // while (pagination_list.firstChild) {
    //     pagination_list.removeChild(pagination_list.firstChild);
    // }
    //if (count == 0) NoIspections();
    const prev = document.createElement("li");
    prev.className = 'page-item';
    const atr = document.createElement("a");
    atr.className = 'page-link';
    atr.ariaLabel = "Previous";
    atr.innerHTML = "&lt;";
    prev.appendChild(atr);
    pagination_list.appendChild(prev);


    for (var i = 1; i < count + 1; i++) {
        const btn = createButton(i);
        pagination_list.appendChild(btn);
    }
    const next = document.createElement("li");
    next.className = 'page-item';
    const atr1 = document.createElement("a");
    atr1.className = 'page-link';
    atr1.ariaLabel = "Next";
    atr1.innerHTML = "&gt;";
    next.appendChild(atr1);
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
        while (inspections_list.firstChild) {
            inspections_list.removeChild(inspections_list.firstChild);
        }

        getInspections()
        .then((inspectionsData) => {
            console.log(inspectionsData);
            inspectionsData.inspections.forEach((element) => {
                makeInspection(element);
            });
    });

    })
    return button;
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

function populateSelect() {
    
    const selectElement = document.getElementById('icd-10');      
  
    icd10roots.forEach(option => {
        const opt = document.createElement('option');
        opt.textContent = option.name;
        selectElement.appendChild(opt);
    });

}

function findDiseaseId(name) {
    return icd10roots.find(disease => disease.name == name).id;
}



//https://mis-api.kreosoft.space/api/patient/39abadc7-9656-4d74-bd7e-28e927a1f81b/inspections?grouped=false&icdRoots=bd483a09-e537-4b61-9422-2e290aa2eb5c&page=1&size=5
function getInspections() {
    var url = `https://mis-api.kreosoft.space/api/patient/${requestData.id}/inspections?grouped=${requestData.grouped}&`;
    if (requestData.icdRoots != "") {
        url += `icdRoots=${icdRoots}&`;
    }
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


function makeInspection(data) {
    const col = document.createElement("div");
    col.classList.add("col-12");
    //col.classList.add("col-lg-6");
    const patient = document.createElement("div");
    if (data.conclusion == 'Death') {
        patient.classList.add("dead-patient");
    } 
    else {
        patient.classList.add("patient");
    }

    const title = document.createElement("div");
    title.className = 'd-flex align-items-center';

    const name = document.createElement("p");
    name.className = 'fs-5 fw-bold me-3';
    const badge = document.createElement('span');
    badge.className = 'badge text-bg-secondary fw-medium';
    const date = new Date(data.date);
    badge.textContent = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
    name.appendChild(badge);
    name.appendChild(document.createTextNode(' Амбулаторный осмотр'));
    title.appendChild(name);

    //потом нужно нормальные ссылки поставить!!!
    if (data.conclusion != 'Death') {
        const div1 = document.createElement("div");
        div1.className = 'd-flex align-items-center ms-auto me-3';
        const ref1 = document.createElement("a");
        ref1.className = 'text-decoration-none';
        ref1.href = '#';
        const img1 = document.createElement("img");
        img1.src = "images/edit.svg";
        img1.alt = "Edit Icon";
        img1.className = "me-2";
        ref1.appendChild(img1);
        ref1.appendChild(document.createTextNode('Добавить осмотр'));
        div1.appendChild(ref1);  
        title.appendChild(div1);
    }

    const div2 = document.createElement("div");
    div2.className = 'd-flex align-items-center';
    const ref2 = document.createElement("a");
    ref2.className = 'text-decoration-none';
    ref2.href = '#';
    const img2 = document.createElement("img");
    img2.src = "images/search.svg";
    img2.alt = "Search Icon";
    img2.className = "me-2";
    ref2.appendChild(img2);
    ref2.appendChild(document.createTextNode('Детали осмотра'));
    div2.appendChild(ref2);
    title.appendChild(div2);
    patient.appendChild(title);

    const p1 = document.createElement("p");
    p1.className = "fs-6";
    p1.innerHTML = `Заключение: ${data.conclusion}`;
    patient.appendChild(p1);
    
    const p2 = document.createElement("p");
    p2.className = "fs-6";
    p2.innerHTML = `Основной диагноз: ${data.diagnosis.name} (${data.diagnosis.code})`;
    patient.appendChild(p2);

    const p3 = document.createElement("p");
    p3.className = "fs-6";
    p3.innerHTML = `Медицинский работник: ${data.doctor}`;
    patient.appendChild(p3);


    col.appendChild(patient);
    inspections_list.appendChild(col);

    // patient.addEventListener('click', () => {
    //     console.log(data);
    //     localStorage.setItem('patientData', JSON.stringify(data));
    //     window.location.href = "patient.html";
    // })

}