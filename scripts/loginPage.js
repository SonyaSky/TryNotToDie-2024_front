const sign_up_button = document.getElementById("sign-up-button");

sign_up_button.addEventListener('click', function() {
    window.location.href = "registration.html"
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

    loginDoctor(email, password).then((data) => {
        token = data;
        console.log(token);
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

