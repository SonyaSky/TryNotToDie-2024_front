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
const edit_button = document.getElementById("edit-inspections-button");

var insp_data;
window.load = setData();

function setData() {
    var profileData = JSON.parse(localStorage.getItem('profileData')); 
    profile_name.textContent = profileData.name;

    getInspection()
        .then((data) => {
            console.log(data);
            insp_data = data;
            setInspection(data);
            data.consultations.forEach((c) => {
                getConsultation(c.id)
                .then((consultation) =>{
                    makeConsultation(data, consultation);
                })
            })
        });

    edit_button.addEventListener('click', (e) => {
        e.preventDefault();
        setModal(insp_data);
    })

}

function setModal(data) {
    var new_diagnoses = [];
    data.diagnoses.forEach((d) => {
        console.log(d.name);
        findIcdId(d.code).then((data) => {
            console.log(data);
            const new_d = {
                icdDiagnosisId: data.records[0].id,
                description: d.description,
                type: d.type
            }
            new_diagnoses.push(new_d); 
        });
        
    })
    var new_data = {
        anamnesis:data.anamnesis,
        complaints:data.complaints,
        treatment: data.treatment,
        conclusion: data.conclusion,
        nextVisitDate: data.nextVisitDate,
        deathDate: data.deathDate,
        diagnoses: new_diagnoses
    }
    const modal = document.getElementById('editModal');
    const complaints = modal.querySelector('#complaints');
    complaints.textContent = data.complaints;
    const anamnesis = modal.querySelector('#anamnesis');
    anamnesis.textContent = data.anamnesis;
    const treatment = modal.querySelector('#treatment');
    treatment.textContent = data.treatment;
    const conclusion = modal.querySelector('#select-conclusion');
    conclusion.value = data.conclusion;
    const next_visit = modal.querySelector('#next-visit-input');
    next_visit.value = data.nextVisitDate.split('T')[0];
    const save_button = modal.querySelector('#save-button');

    const nextVisitLabel = modal.querySelector('#next-visit');
    const inputDate = modal.querySelector('#date-block');

    conclusion.addEventListener('change', (e) => {
        const selectedValue = e.target.value;
        if (selectedValue === 'Recovery') {
            inputDate.style.display = 'none';
        } else if (selectedValue === 'Death') {
            nextVisitLabel.style.display = 'block';
            inputDate.style.display = 'block';
            nextVisitLabel.textContent = 'Дата и время смерти';
        } else {
            nextVisitLabel.style.display = 'block';
            inputDate.style.display = 'block';
            nextVisitLabel.textContent = 'Дата следующего визита';
        }
    });

    save_button.addEventListener('click', (e) => {
        e.preventDefault();
        const current_date = new Date();
        if (complaints.value == "") {
            alert("Введите жалобы");
            return;
        }
        if (anamnesis.value == "") {
            alert("Введите анамнез");
            return;
        }
        if (treatment.value == "") {
            alert("Введите рекомендации по лечению");
            return;
        }
        if (conclusion.value == "") {
            alert("Добавьте заключение");
            return;
        }
        var next_visit_date;
        if (conclusion.value != "Recovery") {
            if (next_visit.value == "") {
                alert("Добавьте дату в заключение");
                return;
            }
            next_visit_date = new Date(next_visit.value);
        }
        if (conclusion.value == "Death"){
            if (next_visit_date > current_date){
                alert("Дата смерти не может быть в будущем");
                return;
            }
            new_data.deathDate = next_visit_date.toISOString();
            new_data.nextVisitDate = null;
        }
        else if (conclusion.value == "Disease") {
            if (next_visit_date < current_date){
                alert("Дата следующего визита не может быть в прошлом");
                return;
            }
            new_data.nextVisitDate = next_visit_date.toISOString();
        }
        else {
            new_data.nextVisitDate = null;
        }
        new_data.complaints = complaints.value;
        new_data.anamnesis = anamnesis.value;
        new_data.treatment = treatment.value;
        new_data.conclusion = conclusion.value;
        console.log(new_data);
        editInspection(new_data);
    });
}

function editInspection(data) {
    const token = JSON.parse(localStorage.getItem('token')); 
    var inspId = JSON.parse(localStorage.getItem('inspectionId'));
    return fetch(`https://mis-api.kreosoft.space/api/inspection/${inspId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      })
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

    conclusion.appendChild(conclusionParagraph);
    if (data.nextVisitDate != null)
    {
        const dateParagraph = document.createElement('p');
        dateParagraph.className = 'fs-6 info';
        dateParagraph.innerHTML = `Дата следующего визита: ${formatDate(data.nextVisitDate, "")}`;
        conclusion.appendChild(dateParagraph);
    }
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
                const new_comment = makeComments(comment, data.comments, data.id);
                comments_div.appendChild(new_comment);
            }
        })
        mainDiv.appendChild(comments_div);
    }

    consultations_list.appendChild(mainDiv);
}

function makeComments(data, list, consultationId) {
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

    let replyContainer; 

    replyButton.addEventListener('click', function() {
        if (!replyContainer) {
            replyContainer = document.createElement('div');
            replyContainer.className = 'd-flex align-items-center mt-2'; 

            const replyInput = document.createElement('input');
            replyInput.type = 'text';
            replyInput.id = 'replyInput';
            replyInput.className = 'form-control me-2'; 
            replyInput.placeholder = 'Введите ваш ответ...';

            const submitButton = document.createElement('button');
            submitButton.type = 'button';
            submitButton.className = 'btn btn-primary'; 
            submitButton.textContent = 'Отправить';

            replyContainer.appendChild(replyInput);
            replyContainer.appendChild(submitButton);
            commentDiv.appendChild(replyContainer);

            replyButton.textContent = 'Закрыть';

            submitButton.addEventListener('click', function() {
                const replyText = replyInput.value;
                if (replyText) {
                    console.log('Reply submitted:', replyText);
                    const new_reply = {
                        content: replyText,
                        parentId: data.id
                    };
                    sendReply(new_reply, consultationId);
                    replyInput.value = '';
                    replyContainer.remove(); 
                    replyContainer = null; 
                    replyButton.textContent = 'Ответить'; 
                } else {
                    alert('Пожалуйста, введите текст ответа.');
                }
            });
        } else {
            replyContainer.remove();
            replyContainer = null; 
            replyButton.textContent = 'Ответить'; 
        }
    });

    commentDiv.appendChild(headerParagraph);
    commentDiv.appendChild(commentTextParagraph);
    commentDiv.appendChild(footerDiv);

    return commentDiv;
}

function sendReply(data, consultationId) {
    const token = JSON.parse(localStorage.getItem('token')); 
    return fetch(`https://mis-api.kreosoft.space/api/consultation/${consultationId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      })
      .then((response) => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error('An error occurred: ' + (errorData.errors || 'Unknown error')); // Handle other errors
            });
        }
        return response.json();
    })
    .then((data) => {
        return data;
    })
    .catch((error) => {
        console.error('Error:', error.message);
        throw error;
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


function findIcdId(code) {
    return fetch(`https://mis-api.kreosoft.space/api/dictionary/icd10?request=${code}&page=1&size=20`)
    .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); 
      })
      .then(data => { 
        return data;
      })
      .catch(error => {
        console.error('Error:', error);
      });
}