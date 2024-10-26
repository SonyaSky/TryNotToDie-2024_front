const logout_button = document.getElementById("logout");

logout_button.addEventListener('click', () => {
    const token = JSON.parse(localStorage.getItem('token'));

    logoutDoctor(token)
    .then((data) => {
        console.log(data);
        window.location.href = "login.html";
    })
    .catch((error) => {
        console.log(error.message);
    });

})


function logoutDoctor(token) {
    return fetch('https://mis-api.kreosoft.space/api/doctor/logout', {
        method: 'POST',
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
        throw error;
    });
}