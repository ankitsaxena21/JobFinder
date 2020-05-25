const restaurantDOM = document.querySelector(".jobs-center");
const search = document.querySelector(".typeahead");
let favourites = new Array(15);
let prev = 0;
let next = 6;
const total = 15;

// fetching the data
class Jobs {
    async getData() {
        try {
            let response = await fetch("jobs.json");
            let data = await response.json();
            return data.items;
        }
        catch (err) {
            console.log(err);
        }
    }
}

// display the jobs
class UI {
    displayItems(jobs, prev = 0, next = 6) {
        let output = '';
        jobs = jobs.slice(prev, next);
        jobs.forEach(job => {
            output = output + `
            <div class="job">
            <div class="img-container" id=${job.id}>
                <img src="${job.image}" alt="job" class="job-img" />
                <button class="bag-btn">
                    ${(Storage.getFavourite(job.id - 1) === "true") ? "<i class='fa fa-heart fa-lg'></i>" + "applied" : "apply to thiss job"}
                </button>
            </div>
            <h3>${job.name}</h3>
            <h4>Location - ${job.location}</h4>
            <h4>Ratings - ${job.rating}</h4>
            <h4>Salary - ${job.salary}</h4>
            </div>
            `;
        })
        restaurantDOM.innerHTML = output;
    }

    searchText(text, list) {
        let items = _.filter(list, item => {
            name = item.name.toLowerCase();
            return name.includes(text.toLowerCase());
        });
        this.outputTypeahead(items);
    }

    outputTypeahead(items) {
        if (search.value != "") {
            let output = '';
            items.map(item => {
                output = output + `<p class="autocomplete">${item.name}</p>`;
            })
            document.querySelector("#target").innerHTML = output;
            let options = document.querySelector("#target")
            options.addEventListener('click', (e) => {
                search.value = e.target.textContent;
                options.style.display = "none";
            })
            options.style.display = "block";
        }
    }
    getfavouriteButtons() {
        const btns = [...document.querySelectorAll(".bag-btn")];
        btns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                let btnId = e.target.parentNode.id;
                console.log(e.target.textContent)
                if (e.target.textContent == "applied") {
                    e.target.textContent = "apply to this job";
                    Storage.removeFavourite(btnId);
                } else {
                    e.target.innerHTML = `<i class='fa fa-heart fa-lg'></i>` + "applied";
                    Storage.setFavourite(btnId);
                }
            })
        })
    }
}

//local storage
class Storage {
    static saveData(items) {
        _.map(items, (item, index) => {
            favourites[index + 1] = item.favourite;
        })
        localStorage.setItem("favourite", JSON.stringify(favourites.slice(1)))
    }
    static getFavourite(id) {
        if (localStorage.getItem("favourite")) {
            let items = localStorage.getItem("favourite");
            items = JSON.parse(items);
            return items[id];
        }

    }
    static setFavourite(id) {
        let i = 1;
        let items = localStorage.getItem("favourite");
        items = JSON.parse(items);
        let newFav = new Array(15);
        while (i <= 15) {
            if (i === parseInt(id)) {
                newFav[i] = "true";
            } else {
                newFav[i] = items[i - 1]
            }

            i++;
        }
        localStorage.setItem("favourite", JSON.stringify(newFav.slice(1)));
    }
    static removeFavourite(id) {
        let i = 1;
        let items = localStorage.getItem("favourite");
        items = JSON.parse(items);
        let newFav = new Array(15);
        while (i <= 15) {
            if (i === parseInt(id)) {
                newFav[i] = "false";
            } else {
                newFav[i] = items[i - 1]
            }

            i++;
        }
        localStorage.setItem("favourite", JSON.stringify(newFav.slice(1)));
    }
}

// creating all objects
const ui = new UI();
const jobs = new Jobs();
const storage = new Storage();

//event listeners
document.addEventListener("DOMContentLoaded", () => {
    search.value ='';
    jobs.getData().then(jobs => {
        ui.displayItems(jobs);
        let items = localStorage.getItem("favourite");
        items = JSON.parse(items);
        if (items === null) {
            Storage.saveData(jobs);
        }
        ui.getfavouriteButtons();
    });
});

search.addEventListener("input", () => {
    if (search.value != '')
        jobs.getData().then(jobs => ui.searchText(search.value, jobs));
});

document.querySelector(".myform").addEventListener("submit", (e) => {
    e.preventDefault();
    document.querySelector("#target").style.display = "none";
    jobs.getData().then(jobs => {
        let items = _.filter(jobs, item => {
            name = item.name.toLowerCase();
            return name.includes(search.value.toLowerCase());
        });
        ui.displayItems(items);
        ui.getfavouriteButtons();
    });
});

document.getElementById("sort").addEventListener("change", (e) => {
    jobs.getData().then(jobs => {
        let items = _.sortBy(jobs, e.target.value);
        if (e.target.value == "rating" || e.target.value == "salary") {
            items = items.reverse();
        }
        ui.displayItems(items);
    });
});

document.getElementById("filter").addEventListener("change", (e) => {
    jobs.getData().then(jobs => {
        let items = _.filter(jobs, item => {
            tags = item.tags
            return tags.includes(e.target.value);
        });
        ui.displayItems(items);
    });
});

document.querySelector("#pagination").addEventListener("click", (e) => {
    if (e.target.textContent.includes("next") && next < total) {
        prev = prev + 6;
        next = next + 6;
        jobs.getData().then(jobs => {
            ui.displayItems(jobs, prev, next);
            ui.getfavouriteButtons();
        })
    }
    else if (e.target.textContent.includes("previous") && prev >= 0) {
        prev = prev - 6;
        next = next - 6;
        jobs.getData().then(jobs => {
            ui.displayItems(jobs, prev, next);
            ui.getfavouriteButtons();
        });
    }
});

document.querySelector(".favourites").addEventListener("click", (e) => {
    let items = localStorage.getItem("favourite");
    items = JSON.parse(items);
    jobs.getData().then(jobs => {
        let fav = [];
        jobs.forEach((job, index) => {
            if(items[index] == "true"){
                fav.push(job);
            }
        });
        ui.displayItems(fav);
        ui.getfavouriteButtons();
    });
    
});