const input_name = document.getElementById("inputName");
const input_gender = document.getElementById("inputGender");
const input_date = document.getElementById("inputDate");
const input_phone = document.getElementById("phone");
const input_email = document.getElementById("inputEmail");
const profile_name = document.getElementById("profileName");

const profile_form = document.getElementById("profile-form");



window.load = setProfile();

function setProfile() {
    var profileData = JSON.parse(localStorage.getItem('profileData')); 
    console.log(profileData);
    input_name.value = profileData.name;
    profile_name.textContent = profileData.name;
    input_date.value = profileData.birthday.split('T')[0];
    input_phone.value = formatPhoneNumber(profileData.phone);
    input_email.value = profileData.email;

    if (profileData.gender == "Female") {
        input_gender.value = "Женский";
    }
    else {
        input_gender.value = "Мужской";
    }
    const formState = {
        name: "",
        conclusions: "",
        sorting: "",
        scheduled: false, 
        mine: true,
        page: 1,
        size: 5
    };
    localStorage.setItem('filterPatientsState', JSON.stringify(formState));
}

profile_form.addEventListener('submit', (e) => {
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
    
    const birthday = new Date(input_date.value);
    console.log(birthday.toISOString().slice(0, 19));
    

    const editedProfile = {
        email: input_email.value,
        name: input_name.value,
        birthday: birthday.toISOString().slice(0, 19),
        gender: input_gender.value == "Мужской" ? "Male" : "Female",
        phone: '+' + input_phone.value.replace(/\D+/g, '')
    };

    let token = JSON.parse(localStorage.getItem('token'));
    editProfile(editedProfile, token)
    .then((data) => {
        localStorage.setItem('profileData', JSON.stringify(editProfile)); 
        console.log(token);
        setProfile(); 
    })
    .catch((error) => {
        console.error('Error:', error.message);
        if (error.message.includes('Username') && error.message.includes('is already taken')) {
            alert('Пользователь с таким email уже существует');
        }
    });
    setProfile();

})


function editProfile(newProfile, token) {
    return fetch('https://mis-api.kreosoft.space/api/doctor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProfile),
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
        throw error; 
    });
}

function formatPhoneNumber(phoneNumberString) {
    const cleanedPhoneNumber = phoneNumberString.replace(/\D+/g, '');
    return `+7 (${cleanedPhoneNumber.slice(1, 4)}) ${cleanedPhoneNumber.slice(4, 7)} ${cleanedPhoneNumber.slice(7, 9)}-${cleanedPhoneNumber.slice(9, 11)}`;
}


function loginDoctor() 
{
    let loginData = JSON.parse(localStorage.getItem('login')); 
    const loginDto = {
        "email": loginData.email,
        "password": loginData.password
    }

    return fetch('https://mis-api.kreosoft.space/api/doctor/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
          },
        body: JSON.stringify(loginDto),
      })
    .then((response) => response.json())
    .then((data) => data);
}

