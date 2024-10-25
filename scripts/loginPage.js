

const sign_up_button = document.getElementById("sign-up-button");

sign_up_button.addEventListener('click', function() {
    window.location.href = "registration.html";
});



const sign_in_button = document.getElementById("sign-in-button");
const input_email = document.getElementById("inputEmail");
const input_password = document.getElementById("inputPassword");
const login_form = document.getElementById("login-form");



login_form.addEventListener('submit', (e) => {
    e.preventDefault(); 

    if (!input_email.checkValidity()) {
        return; 
    }

    const email = input_email.value;
    const password = input_password.value;

    if (!email) {
        alert("Введите email, пожалуйста!");
        return;
    } 
    if (!password) {
        alert("Введите пароль, пожалуйста!");
        return;
    } 


    let profile;

    loginDoctor(email, password)
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

});


function loginDoctor(email, password) 
{
    const loginDto = {
        "email": email,
        "password": password
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




