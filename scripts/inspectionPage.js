const profile_name = document.getElementById("profileName");
const inspection_date = document.getElementById("ins-date");
const patient_name = document.getElementById("nameData");
const patient_gender = document.getElementById("genderData");
const patient_birthday = document.getElementById("birthdayData");
const doctor_name = document.getElementById("doctorData");
const complaints = document.getElementById("complaints");
const anamnesis = document.getElementById("anamnesis");
const treatment = document.getElementById("treatment");
const conclusion = document.getElementById("conclusion");
const diagnosis = document.getElementById("diagnosis");
const consultations_list = document.getElementById("consultations");

window.load = setData();

function setData() {
    var profileData = JSON.parse(localStorage.getItem('profileData')); 
    profile_name.textContent = profileData.name;

    getInspection()
        .then((data) => {
            console.log(data);
            setInspection(data);
            data.consultations.forEach((c) => {
                getConsultation(c.id)
                .then((consultation) =>{
                    makeConsultation(data, consultation);
                })
            })
        });

}

function setInspection(data) {
    inspection_date.innerHTML = formatDate(data.createTime);
    patient_name.innerHTML = data.patient.name;
    patient_gender.innerHTML = data.patient.gender == "Male" ? "мужской" : "женский";
    const date = new Date(data.patient.birthday);
    patient_birthday.textContent = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
    doctor_name.innerHTML = data.doctor.name;
    complaints.innerHTML = data.complaints;
    anamnesis.innerHTML = data.anamnesis;
    treatment.innerHTML = data.treatment;

    data.diagnoses.forEach((d) => {
        makeDiagnosis(d);
    })
    
    const conclusionParagraph = document.createElement('p');
    conclusionParagraph.className = 'fs-6 fw-bold';
    switch (data.conclusion) {
        case "Recovery":
            conclusionParagraph.innerHTML = 'Выздоровление';
            break;
        case "Disease":
            conclusionParagraph.innerHTML = 'Болезнь';
            break;
        case "Death":
            conclusionParagraph.innerHTML = 'Смерть';
            break;
        default:
            conclusionParagraph.innerHTML = 'Заключение: фигня какая-то';
            break;
    }

    const dateParagraph = document.createElement('p');
    dateParagraph.className = 'fs-6 info';
    dateParagraph.innerHTML = `Дата следующего визита: ${formatDate(data.nextVisitDate, "")}`;
    conclusion.appendChild(conclusionParagraph);
    conclusion.appendChild(dateParagraph);
}


function formatDate(dateString, separator = '&ndash;') {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0'); 
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0'); 
    const minutes = String(date.getMinutes()).padStart(2, '0'); 

    const formattedDate = `${day}.${month}.${year} ${separator} ${hours}:${minutes}`;
    return formattedDate;
}

function makeDiagnosis(data) {
    const diagnosisParagraph = document.createElement('p');
    diagnosisParagraph.className = 'fs-6 fw-bold';
    diagnosisParagraph.innerHTML = `(${data.code}) ${data.name}`;
    const div = document.createElement('div');
    div.className = "types";
    const p1 = document.createElement('p');
    p1.className = "lh-1 fs-6 info";
    p1.innerHTML = `Тип в осмотре: ${data.type}`;

    switch (data.type) {
        case "Main":
            p1.innerHTML = 'Тип в осмотре: Основной';
            break;
        case "Concomitant":
            p1.innerHTML = 'Тип в осмотре: Сопутствующий';
            break;
        case "Complication":
            p1.innerHTML = 'Тип в осмотре: Осложнение';
            break;
        default:
            p1.innerHTML = 'Тип в осмотре: фигня какая-то';
            break;
    }

    const p2 = document.createElement('p');
    p2.className = "lh-1 fs-6 info";
    p2.innerHTML = `Расшифровка: ${data.description}`;
    div.appendChild(p1);
    div.appendChild(p2);
    diagnosis.appendChild(diagnosisParagraph);
    diagnosis.appendChild(div);
}


function getInspection() {
    const token = JSON.parse(localStorage.getItem('token'));
    var inspId = JSON.parse(localStorage.getItem('inspectionId'));

    return fetch(`https://mis-api.kreosoft.space/api/inspection/${inspId}`, {
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

function getConsultation(id) {
    const token = JSON.parse(localStorage.getItem('token')); 

    return fetch(`https://mis-api.kreosoft.space/api/consultation/${id}`, {
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


function makeConsultation(all_data, data) {
    console.log(data);
    const mainDiv = document.createElement('div');
    mainDiv.className = 'col-12 title';

    const titleParagraph = document.createElement('p');
    titleParagraph.className = 'fs-4 fw-medium';
    titleParagraph.textContent = 'Консультация';

    const consultantParagraph = document.createElement('p');
    consultantParagraph.className = 'fs-6 fw-bold';
    consultantParagraph.innerHTML = `Консультант: ${all_data.doctor.name}`;

    const specializationParagraph = document.createElement('p');
    specializationParagraph.className = 'fs-6 info';
    specializationParagraph.innerHTML = `Специализация консультанта: ${data.speciality.name}`;

    mainDiv.appendChild(titleParagraph);
    mainDiv.appendChild(consultantParagraph);
    mainDiv.appendChild(specializationParagraph);

    if (data.comments){
        const comments_div = document.createElement('div');
        comments_div.className = "comments";
        data.comments.forEach((comment) => {
            if (comment.parentId == null) {
                const new_comment = makeComments(comment, data.comments);
                comments_div.appendChild(new_comment);
            }
        })
        mainDiv.appendChild(comments_div);
    }

    consultations_list.appendChild(mainDiv);
}

function makeComments(data, list) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'border-bottom border-dark-subtle comment';

    const headerParagraph = document.createElement('p');
    headerParagraph.className = 'fs-6 fw-bold';
    headerParagraph.innerHTML = data.author;

    const commentTextParagraph = document.createElement('p');
    commentTextParagraph.className = 'fs-6 comment-text';
    commentTextParagraph.textContent = data.content;

    const footerDiv = document.createElement('div');
    footerDiv.className = 'fs-6 d-flex align-items-center';

    const dateDiv = document.createElement('div');
    dateDiv.className = 'info';
    dateDiv.textContent = formatDate(data.createTime, "");
    footerDiv.appendChild(dateDiv);

    var child_comments = [];
    list.forEach((el) => {
        if (el.parentId == data.id) {
            child_comments.push(el)
        }
    });
    if (child_comments.length > 0) {
        const showRepliesButton = document.createElement('button');
        showRepliesButton.type = 'button';
        showRepliesButton.className = 'comment-btn ms-2';
        showRepliesButton.textContent = `Показать ответы (${child_comments.length})`;
        footerDiv.appendChild(showRepliesButton);

        showRepliesButton.addEventListener('click', (e) => {
            e.preventDefault();
            const ch_coms = commentDiv.querySelector(".child-comments");
            if (ch_coms) {
                ch_coms.remove();
                showRepliesButton.textContent = `Показать ответы (${child_comments.length})`;
            }
            else {
                const child_comment = document.createElement('div');
                child_comment.className = "child-comments";
                child_comments.forEach((c) => {
                    child_comment.appendChild(makeComments(c, list));
                });
                commentDiv.appendChild(child_comment);
                showRepliesButton.textContent = 'Скрыть ответы';
            }
        })
    }

    const replyButton = document.createElement('button');
    replyButton.type = 'button';
    replyButton.className = 'comment-btn ms-2';
    replyButton.textContent = 'Ответить';
    footerDiv.appendChild(replyButton);

    replyButton.addEventListener('click', function() {
        if (!document.getElementById('replyInput')) {
            const replyInput = document.createElement('input');
            replyInput.type = 'text';
            replyInput.id = 'replyInput';
            replyInput.className = 'form-control mt-2'; 
            replyInput.placeholder = 'Введите ваш ответ...';
    
            const submitButton = document.createElement('button');
            submitButton.type = 'button';
            submitButton.className = 'btn btn-primary mt-2'; 
            submitButton.textContent = 'Отправить';
    
            footerDiv.appendChild(replyInput);
            footerDiv.appendChild(submitButton);
    
            submitButton.addEventListener('click', function() {
                const replyText = replyInput.value;
                if (replyText) {

                    console.log('Reply submitted:', replyText);
                    replyInput.value = '';
                } else {
                    alert('Пожалуйста, введите текст ответа.');
                }
            });
        }
    });

    commentDiv.appendChild(headerParagraph);
    commentDiv.appendChild(commentTextParagraph);
    commentDiv.appendChild(footerDiv);

    return commentDiv;
}

function getConsultation(id) {
    const token = JSON.parse(localStorage.getItem('token'));
    return fetch(`https://mis-api.kreosoft.space/api/consultation/${id}`, {
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
