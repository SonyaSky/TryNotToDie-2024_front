//загрузили специальности врачей
var specialties = [];

function fetchSpecialties() {
    return fetch('https://mis-api.kreosoft.space/api/dictionary/speciality?page=1&size=25')
    .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); 
      })
      .then(data => {
        console.log(data); 
        specialties = data.specialties.map(specialty => ({
          name: specialty.name,
          id: specialty.id,
          createTime: specialty.createTime
        }));
        console.log(specialties);
        return specialties;
      })
      .catch(error => {
        console.error('Error:', error);
      });
}

window.onload = function() {
    fetchSpecialties().then(() => {
        populateSelect(); 
    });
};

function populateSelect() {
    
    const selectElement = document.getElementById('inputSpeciality');      
    selectElement.innerHTML = '';

  
    specialties.forEach(option => {
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
    const passwordRegex = /^(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
        alert('Пароль должен содержать не менее 6 символов и хотя бы одну цифру');
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
    console.log(newProfile);

    addNewDoctor(newProfile)
    .then((data) => {
        const token = data.token; 
        console.log(token);
        localStorage.setItem('token', JSON.stringify(token));
        return getProfile(token); 
    })
    .then((profileData) => {
        profile = profileData; 
        console.log(profile); 
        localStorage.setItem('profileData', JSON.stringify(profile));
        window.location.href = "profile.html";
        
    })
    .catch((error) => console.error(error));


})




function findSpecialityId(name) {
    return specialties.find(specialty => specialty.name === name).id;
}


function addNewDoctor(profile) {
    return fetch('https://mis-api.kreosoft.space/api/doctor/register', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                console.error('Error response body:', errorData.errors);
                throw new Error(errorData.message || 'Network response was not ok');
            });
        }
        return response.json();
      })
      .catch(error => {
        console.error('Error:', error.message);
        if (error.message.includes('Username') && error.message.includes('is already taken')) {
            alert('Пользователь с таким email уже существует');
        } else {
            alert(error.message); 
        }
      });
}


function getProfile(token) {
    return fetch("https://mis-api.kreosoft.space/api/doctor/profile", {
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
