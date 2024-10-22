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
        getProfile(token.token);
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

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIzZGNiOWRkYS02MTcwLTQwZDItNTgyYi0wOGRiZmZhZDZkNmMiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9hdXRoZW50aWNhdGlvbiI6IjBmNTk2OGQ3LWRhMWUtNDY4ZC04OTViLTExZjQ4ZTQ0OGQyOSIsIm5iZiI6MTcyOTM0NzI5MCwiZXhwIjoxNzI5MzUwODkwLCJpYXQiOjE3MjkzNDcyOTAsImlzcyI6Ik1JUy5CYWNrIiwiYXVkIjoiTUlTLkJhY2sifQ.OzsE70l-Ld86rRL0Ay2WoopmZzjPZDYpOHU6EzFNtzg
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
        console.log(data);
    })
    .catch((error) => {
        console.error('Error fetching data:', error); 
    });
}



