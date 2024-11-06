const profile_name = document.getElementById("profileName");
const inspections_list = document.getElementById("inspections-list");
const pagination_list = document.getElementById("pages");

const filter_form = document.getElementById('filter-form');
const input_icdroot = document.getElementById('icd-10');
const grouped = document.getElementById('grouped');
const patients_count = document.getElementById('patientCount');


var icd10roots = [];
var requestData = {
    grouped: false,
    icdRoots: "",
    page: 1,
    size: 5
}
var count;

window.load = setInspections();


function setInspections() {
    var profileData = JSON.parse(localStorage.getItem('profileData')); 
    console.log(profileData);
    profile_name.textContent = profileData.name;
   
    fetchDiseases().then(() => {
        populateSelect(); 
    });

    getConsultations()
    .then((inspectionsData) => {
        console.log(inspectionsData); 
        count = inspectionsData.pagination.count;
        setupPagination();
        inspectionsData.inspections.forEach((element) => {
            const col = makeInspection(element);
            inspections_list.appendChild(col);
        });
    });
}

function setupPagination() {
    while (pagination_list.firstChild) {
        pagination_list.removeChild(pagination_list.firstChild);
    }
    if (count == 0) {
        noIspections();
        return;
    }
    const prev = document.createElement("li");
    prev.className = 'page-item';
    const atr = document.createElement("a");
    atr.className = 'page-link';
    atr.ariaLabel = "Previous";
    atr.innerHTML = "&lt;";
    prev.appendChild(atr);
    if (requestData.page < 6) {
        prev.classList.add('disabled');
    }
    else {
        prev.addEventListener('click', (e) => {
            e.preventDefault();
            requestData.page = (Math.ceil(requestData.page/5) - 1)*5 - 4;
            while (inspections_list.firstChild) {
                inspections_list.removeChild(inspections_list.firstChild);
            }
            getConsultations()
            .then((inspectionsData) => {
                console.log(inspectionsData);
                inspectionsData.inspections.forEach((element) => {
                    const col = makeInspection(element);
                    inspections_list.appendChild(col);
                });
            });
        });
    }

    pagination_list.appendChild(prev);

    var i = requestData.page;
    while (i <= count && i-requestData.page < 5) {
        const btn = createButton(i);
        pagination_list.appendChild(btn);
        i++;
    }

    const next = document.createElement("li");
    next.className = 'page-item';
    const atr1 = document.createElement("a");
    atr1.className = 'page-link';
    atr1.ariaLabel = "Next";
    atr1.innerHTML = "&gt;";
    next.appendChild(atr1);
    if (count - requestData.page < 6) {
        next.classList.add('disabled');
    }
    else {
        next.addEventListener('click', (e) => {
            e.preventDefault();
            requestData.page = Math.ceil(requestData.page/5)*5 + 1;
            while (inspections_list.firstChild) {
                inspections_list.removeChild(inspections_list.firstChild);
            }
            getConsultations()
            .then((inspectionsData) => {
                console.log(inspectionsData);
                inspectionsData.inspections.forEach((element) => {
                    const col = makeInspection(element);
                    inspections_list.appendChild(col);
                });
            });
        });
    }
    pagination_list.appendChild(next);
}

function createButton(page) {
    const button = document.createElement("li");
    button.className = 'page-item';
    if (page == requestData.page) button.classList.add('active');
    const atr = document.createElement("a");
    atr.className = 'page-link';
    atr.innerHTML = page;
    button.appendChild(atr);

    button.addEventListener('click', (e) => {
        e.preventDefault();
        const current_btn = document.querySelector('li.page-item.active');
		current_btn.classList.remove('active');
        requestData.page = page;
        button.classList.add('active');
        while (inspections_list.firstChild) {
            inspections_list.removeChild(inspections_list.firstChild);
        }

        getConsultations()
        .then((inspectionsData) => {
            console.log(inspectionsData);
            inspectionsData.inspections.forEach((element) => {
                const col = makeInspection(element);
                inspections_list.appendChild(col);
            });
        });

    })
    return button;
}

function noIspections() {
    const div = document.createElement("div");
    div.className = 'col-12';
    const p = document.createElement("p");
    p.className = 'fs-3 text-center';
    p.innerHTML = "Таких осмотров нет :(";
    div.appendChild(p);
    inspections_list.appendChild(div);
}


function fetchDiseases() {
    return fetch('https://mis-api.kreosoft.space/api/dictionary/icd10/roots')
    .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); 
      })
      .then(data => { 
        icd10roots = data.map(d => ({
            code: d.code,
            name: d.name,
            id: d.id,
            createTime: d.createTime
        }));
        return icd10roots;
      })
      .catch(error => {
        console.error('Error:', error);
      });
}

function populateSelect() {
    
    const selectElement = document.getElementById('icd-10');      
  
    icd10roots.forEach(option => {
        const opt = document.createElement('option');
        opt.textContent = option.name;
        opt.value = option.id;
        selectElement.appendChild(opt);
    });

}


function getConsultations() {
    var url = `https://mis-api.kreosoft.space/api/consultation?grouped=${requestData.grouped}&`;
    if (requestData.icdRoots != "") {
        url += `icdRoots=${requestData.icdRoots}&`;
    }
    url += `page=${requestData.page}&`;
    url += `size=${requestData.size}`;

    const token = JSON.parse(localStorage.getItem('token'));

    return fetch(url, {
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

filter_form.addEventListener('submit', (e) => {
    e.preventDefault();
    requestData.icdRoots = input_icdroot.value;
    requestData.page = 1;
    requestData.size = patients_count.value;
    requestData.grouped = grouped.checked;
    console.log(requestData);
    while (inspections_list.firstChild) {
        inspections_list.removeChild(inspections_list.firstChild);
    }

    getConsultations()
    .then((inspectionsData) => {
        console.log(inspectionsData); 
        count = inspectionsData.pagination.count;
        setupPagination();
        inspectionsData.inspections.forEach((element) => {
            const col = makeInspection(element);
            inspections_list.appendChild(col);
        });
    });
    
})



function makeInspection(data) {

    const col = document.createElement("div");
    col.className = "col-md-12 col-xxl-6";
    const patient = document.createElement("div");
    if (data.conclusion == 'Death') {
        patient.classList.add("dead-patient");
    } 
    else {
        patient.classList.add("patient");
    }

    const title = document.createElement("div");
    title.className = 'd-flex align-items-center';

    if (requestData.grouped) {
        const open_button = document.createElement("button");
        open_button.className = "btn btn-primary me-3 open-button align-self-start";
        open_button.type = 'button';
        const button_image = document.createElement("img");
        if (data.hasNested == true) {
            button_image.src = "images/plus.svg";
            button_image.alt = "+";
        }
        else {
            button_image.src = "images/dash.svg";
            button_image.alt = "-";
        }
        open_button.appendChild(button_image);
        title.appendChild(open_button);
        if (data.hasChain ) {
            open_button.addEventListener('click', (e) => {
                e.preventDefault();
                if (button_image.alt == "+") {
                    chainInspections(data, col);
                    button_image.src = "images/dash.svg";
                    button_image.alt = "-";
                }
                else {
                    button_image.src = "images/plus.svg";
                    button_image.alt = "+";
                    const ch_ins = col.querySelector(".child-inspections");
                    if (ch_ins) {
                        ch_ins.remove();
                    }
                }
            })
        }
    }

    const name = document.createElement("p");
    name.className = 'fs-5 fw-bold me-3';
    const badge = document.createElement('span');
    badge.className = 'badge text-bg-secondary fw-medium';
    const date = new Date(data.date);
    badge.textContent = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
    name.appendChild(badge);
    name.appendChild(document.createTextNode(' Амбулаторный осмотр'));
    title.appendChild(name);

    const div2 = document.createElement("div");
    div2.className = 'd-flex align-items-center ms-auto me-3';
    const ref2 = document.createElement("a");
    ref2.className = 'text-decoration-none';
    ref2.href = 'inspection.html';
    const img2 = document.createElement("img");
    img2.src = "images/search.svg";
    img2.alt = "Search Icon";
    img2.className = "me-2";
    ref2.appendChild(img2);
    ref2.appendChild(document.createTextNode('Детали осмотра'));
    div2.appendChild(ref2);

    ref2.addEventListener('click', () => {
        localStorage.setItem('inspectionId', JSON.stringify(data.id));
    });

    //потом нужно нормальные ссылки поставить!!!

    title.appendChild(div2);
    patient.appendChild(title);


    const p1 = document.createElement("p");
    p1.className = "fs-6";
    switch (data.conclusion) {
        case "Recovery":
            p1.innerHTML = 'Заключение: выздоровление';
            break;
        case "Disease":
            p1.innerHTML = 'Заключение: болезнь';
            break;
        case "Death":
            p1.innerHTML = 'Заключение: ';
            const sp = document.createElement("span");
            sp.innerHTML = 'смерть';
            sp.classList.add('fw-medium');
            p1.appendChild(sp);
            break;
        default:
            p1.innerHTML = 'Заключение: фигня какая-то';
            break;
    }
    patient.appendChild(p1);
    
    const p2 = document.createElement("p");
    p2.className = "fs-6";
    p2.innerHTML = 'Основной диагноз: ';
    const sp = document.createElement("span");
    sp.innerHTML = `${data.diagnosis.name} (${data.diagnosis.code})`;
    sp.classList.add('fw-medium');
    p2.appendChild(sp);
    patient.appendChild(p2);

    const p3 = document.createElement("p");
    p3.className = "fs-6";
    p3.innerHTML = `Медицинский работник: ${data.doctor}`;
    patient.appendChild(p3);

    col.appendChild(patient);
 
    return col;
}

function chainInspections(data, col) {
    const child_insp_div = document.createElement("div");
    child_insp_div.className = "child-inspections row gx-3 gy-3";

    var child_inspections = [];
    getChildInspections(data.id)
    .then((inspectionsData) => {
        child_inspections = inspectionsData;
        console.log(child_inspections);
        inspectionsData.forEach((element) => {
            if (element.previousId == data.id) {
                const child_col = makeInspection(element);
                child_insp_div.appendChild(child_col);
                if (element.hasNested) {
                    const child_open_button = child_col.querySelector(".open-button");
                    const child_button_image = child_col.querySelector("img");
                    child_open_button.addEventListener('click', (e) => {
                        e.preventDefault();
                        if (child_button_image.alt == "+") {
                            chainInspectionsRecursively(element, child_col, child_inspections);
                            child_button_image.src = "images/dash.svg";
                            child_button_image.alt = "-";
                        }
                        else {
                            child_button_image.src = "images/plus.svg";
                            child_button_image.alt = "+";
                            const ch_ins = child_col.querySelector(".child-inspections");
                            if (ch_ins) {
                                ch_ins.remove();
                            }
                        }
                    })
                }
            }
        });
        col.appendChild(child_insp_div);
         
    });
}

function chainInspectionsRecursively(parentData, parentCol, list) {
    const child_insp_div = document.createElement("div");
    child_insp_div.className = "child-inspections row gx-3 gy-3";
    list.forEach((el) => {
        if (el.previousId == parentData.id) {
            const child_col = makeInspection(el);
            child_insp_div.appendChild(child_col);
        }
    });
    parentCol.appendChild(child_insp_div);
}

function getChildInspections(id) {
    const token = JSON.parse(localStorage.getItem('token'));

    return fetch(`https://mis-api.kreosoft.space/api/inspection/${id}/chain`, {
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