//загрузили специальности врачей
function fetchSpecialties() {
    return fetch('https://mis-api.kreosoft.space/api/dictionary/speciality?page=1&size=25')
    .then((data) => {
        return data.json();
    }).then((info) => {
        return info;
    });
}

fetchSpecialties().then((data) => {
    populateSelect(JSON.stringify(data));
});

function populateSelect(s) {
    
    const selectElement = document.getElementById('inputSpeciality');
        
    selectElement.innerHTML = '';
    
    JSON.parse(s).specialties.forEach(option => {
        const opt = document.createElement('option');
        opt.textContent = option.name;
        selectElement.appendChild(opt);
    });
}
    

document.addEventListener('DOMContentLoaded', populateSelect);





const sign_in_button = document.getElementById("sign-in-button");

sign_in_button.addEventListener('submit', (e) => {
    
})