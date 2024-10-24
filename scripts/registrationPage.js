//загрузили специальности врачей
let specialties;
function fetchSpecialties() {
    return fetch('https://mis-api.kreosoft.space/api/dictionary/speciality?page=1&size=25')
    .then((data) => {
        return data.json();
    }).then((info) => {
        return info;
    });
}

window.onload = fetchSpecialties().then((data) => {
    populateSelect(JSON.stringify(data));
});

function populateSelect(s) {
    
    const selectElement = document.getElementById('inputSpeciality');
        
    selectElement.innerHTML = '';
    specialties = s;
    
    JSON.parse(s).specialties.forEach(option => {
        const opt = document.createElement('option');
        opt.textContent = option.name;
        selectElement.appendChild(opt);
    });
}
    

document.addEventListener('DOMContentLoaded', populateSelect);




const input_name = document.getElementById("inputName");
const input_gender = document.getElementById("inputGender");
const input_date = document.getElementById("inputDate");
const input_phone = document.getElementById("phone");
const input_speciality = document.getElementById("inputSpeciality");
const input_email = document.getElementById("inputEmail");
const input_password = document.getElementById("inputPassword");
const registration_form = document.getElementById("form");

registration_form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!input_email.checkValidity()) {
        return; 
    }

    const email = input_email.value;
    if (!email) {
        alert("Введите email, пожалуйста!");
        return;
    } 

    const name = input_name.value;
    if (!name) {
        alert("Введите имя, пожалуйста!");
        return;
    }

    const password = input_password.value;
    if (!password) {
        alert("Введите пароль, пожалуйста!");
        return;
    } 
    
    const birthday = new Date(input_date.value);
    console.log(birthday.toISOString().slice(0, 19));
    

    const newProfile = {
        name: input_name.value,
        password: input_password.value,
        email: input_email.value,
        birthday: birthday.toISOString().slice(0, 19),
        gender: input_gender.value == "Мужской" ? "Male" : "Female",
        phone: '+' + input_phone.value.replace(/\D+/g, ''),
        speciality: findSpecialityId(input_speciality.value)
    };

})




function formatPhoneNumber(phoneNumberString) {
    const cleanedPhoneNumber = phoneNumberString.replace(/\D+/g, '');
    return `+7 (${cleanedPhoneNumber.slice(1, 4)}) ${cleanedPhoneNumber.slice(4, 7)} ${cleanedPhoneNumber.slice(7, 9)}-${cleanedPhoneNumber.slice(9, 11)}`;
}


findSpecialityId("Психолог");
function findSpecialityId(name) {
    console.log(specialties.specialties);
    JSON.parse(specialties.specialties).forEach((s) => {
        if (s.name == name) {
            return s;
        }
    })
}