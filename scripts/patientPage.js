const profile_name = document.getElementById("profileName");
const inspections_list = document.getElementById("inspections-list");
const patient_name = document.getElementById("patient-name");
const patient_birthday = document.getElementById("birthdayData");
const patient_gender = document.getElementById("gender-icon");

window.load = setInspections();

function setInspections() {
    var profileData = JSON.parse(localStorage.getItem('profileData')); 
    console.log(profileData);
    profile_name.textContent = profileData.name;

    const patientData = JSON.parse(localStorage.getItem('patientData'));
    console.log(patientData);
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


}


var icd10roots = [];

function fetchDiseases() {
    return fetch('https://mis-api.kreosoft.space/api/dictionary/icd10/roots')
    .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); 
      })
      .then(data => {
        console.log(data); 
        icd10roots = data.map(d => ({
            code: d.code,
            name: d.name,
            id: d.id,
            createTime: d.createTime
        }));
        console.log(icd10roots);
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



// https://mis-api.kreosoft.space/api/patient/39abadc7-9656-4d74-bd7e-28e927a1f81b/inspections?grouped=false&icdRoots=bd483a09-e537-4b61-9422-2e290aa2eb5c&page=1&size=5
// function getPatients(name, conclusions, sorting, scheduled, mine, page, size) {
//     var url = `https://mis-api.kreosoft.space/api/patient/${id}`;
//     if (name != "") {
//         url += `name=${name}&`;
//     }
//     if (conclusions != "") {
//         url += `conclusions=${name}&`;
//     }
//     if (sorting != "") {
//         url += `sorting=${name}&`;
//     }
//     url += `scheduledVisits=${scheduled}&`;
//     url += `onlyMine=${mine}&`;
//     url += `page=${page}&`;
//     url += `size=${size}`;

//     const token = JSON.parse(localStorage.getItem('token'));

//     return fetch(url, {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}` 
//         }
//     })
//     .then((response) => {
//         if (!response.ok) {
//             throw new Error('Network response was not ok ' + response.statusText);
//         }
//         return response.json(); 
//     })
//     .then((data) => {
//         return data;
//     })
//     .catch((error) => {
//         console.error('Error fetching data:', error); 
//     });
// }


