let calendarData = JSON.parse(localStorage.getItem("data"));
let SCRIPT_ROOT = JSON.parse(localStorage.getItem("scriptRoot"));
const CALENDAR = document.getElementById('calendar');
const calendarWindow = document.getElementById('calendarWindow');
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();
const currentDateId = currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).split(' ').join('');
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];


async function fetchJson(data) {
    fetch(data)
        .then(response => response.json())
        .then(json => {
            calendarData = { ...calendarData, ...json };
        });
    return;
};

async function requestDates(month, year) {
    let yearKeys = Object.keys(calendarData).sort();
    let firstYear = new Date(yearKeys[0]).toLocaleString('en-US', { year: 'numeric' });
    let lastYear = new Date(yearKeys[yearKeys.length - 1]).toLocaleString('en-US', { year: 'numeric' });
    if (year - 1 == firstYear && month == "January") {
        let newData = `${SCRIPT_ROOT}/${year - 1}`;
        fetchJson(newData);
    } else if (year == lastYear && month == "December") {
        let newData = `${SCRIPT_ROOT}/${parseInt(year) + 1}`;
        fetchJson(newData);
    };
};

function formatDate(date) {
    return date.toISOString().slice(0, 10);
};

Date.prototype.backOneWeek = function(i = 1) {
    const theWeek = new Date(this);
    const previousWeek = new Date(this);
    theWeek.setDate(previousWeek.getDate() - 7 * i);
    return theWeek;
};

Date.prototype.forwardOneWeek = function(i = 1) {
    const theWeek = new Date(this);
    const previousWeek = new Date(this);
    theWeek.setDate(previousWeek.getDate() + 7 * i);
    return theWeek;
};

function addWeekDiv(date) {
    const theDate = new Date(date);
    let start = new Date(date);
    if (start.getDay() > 0) {
        start.setDate(theDate.getDate() - start.getDay());
    };
    const weekDiv = document.createElement('div');
    weekDiv.classList.add('week');

    for (let d = 0; d < 7; d++) {

        const aDay = document.createElement('div');
        const dateAsID = new Date(start);
        dateAsID.setDate(start.getDate() + d);
        aDay.id = dateAsID;
        aDay.classList.add('day');

        aDay.addEventListener("click", function() {
            displayDetails(formatDate(dateAsID))
        }, false);
        weekDiv.appendChild(aDay);
    }
    return weekDiv;
}

function addElement(type, classname, content = '') {
    const element = document.createElement(type);
    element.classList.add(classname);
    element.textContent = content;
    this.appendChild(element);
};

function createDayElement(theDate) {
    const date = new Date(theDate);
    const dayDiv = document.createElement('div');
    dayDiv.classList.add('day');

    const dayNumberDiv = document.createElement('div');
    dayNumberDiv.classList.add('date');

    const dayNumberSpan = document.createElement('div');
    dayNumberSpan.classList.add('day-number');

    const dayWeekdaySpan = document.createElement('div');
    dayWeekdaySpan.classList.add('day-weekday');

    const day = date.getDate();
    const month = date.getMonth();

    if (day === 1) {
        dayNumberSpan.textContent = `${MONTHS[month]} ${day}`;
    } else {
        dayNumberSpan.textContent = day;
    }

    dayWeekdaySpan.textContent = WEEKDAY[date.getDay()];
    dayNumberDiv.appendChild(dayWeekdaySpan);
    dayNumberDiv.appendChild(dayNumberSpan);
    dayDiv.appendChild(dayNumberDiv);

    const dateForJson = formatDate(date);

    // if (7 >= day || day >= 22) { dayDiv.classList.add(...monthBorders(day, month, year)) };

    const feastInformationDiv = document.createElement('div');
    feastInformationDiv.classList.add('feast');

    const rankSpan = document.createElement('span');
    rankSpan.classList.add('rank');

    if (calendarData.hasOwnProperty(dateForJson)) {
        feastInformationDiv.textContent = calendarData[dateForJson]['name'];
        rankSpan.textContent = calendarData[dateForJson]['rank'];
    }
    dayDiv.appendChild(feastInformationDiv)

    const standardCommemorations = [99906, 99907, 99908, 99909, 99910, 99911, 99912, 99913, 99914,]

    if (standardCommemorations.includes(calendarData[dateForJson]['com_1']['code'])) {
        var commemoratedFeast = '';
    } else {
        var commemoratedFeast = calendarData[dateForJson]['com_1']['name'];
    };

    const commemoratedFeastDiv = document.createElement('div');
    commemoratedFeastDiv.textContent = commemoratedFeast;
    commemoratedFeastDiv.classList.add('commemorated_feast');
    dayDiv.appendChild(commemoratedFeastDiv);

    feastInformationDiv.appendChild(rankSpan)
    const feastStatusDiv = document.createElement('div');
    feastStatusDiv.classList.add('feast-status');
    const moonAndColor = document.createElement('div');
    moonAndColor.classList.add('color-container');
    const color = document.createElement('div');
    color.classList.add(calendarData[dateForJson]['color'], 'color');
    moonAndColor.appendChild(color);
    const moonPhase = document.createElement('div');
    moonPhase.classList.add('moon');
    moonPhase.textContent = calendarData[dateForJson]['moon-phase'];
    moonAndColor.appendChild(moonPhase);
    feastStatusDiv.appendChild(moonAndColor);
    dayDiv.appendChild(feastStatusDiv);
    return dayDiv;
}

function buildWeek(date, position = "back") {
    const theWeek = addWeekDiv(date);
    for (let d = 0; d < 7; d++) {
        const dayBuilt = createDayElement(theWeek.children[d].id);
        while (dayBuilt.firstChild) {
            theWeek.children[d].appendChild(dayBuilt.firstChild);
        }
    }

    if (position === "front") {
        CALENDAR.prepend(theWeek);
    } else {
        CALENDAR.appendChild(theWeek);
    }
}

function updateHeader() {
    let allWeeks = document.querySelectorAll('.week');
    // FIX: this is still not working too well...
    centralWeek = allWeeks[Math.floor(allWeeks.length / 2)]
    const centerDay = new Date(centralWeek.children[3].id);
    const theMonth = MONTHS[centerDay.getMonth()];
    const theYear = centerDay.getFullYear();
    const dynamicMonth = document.getElementById('dynamicMonth');
    dynamicMonth.innerHTML = `<b>${theMonth}</b>&nbsp;${theYear}`;
};

function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

function loadDays(increment) {
    const child = increment > 0 ? 'last-child' : 'first-child';
    const lastDate = document.querySelector(`.calendar:${child}`).firstElementChild.firstElementChild.id;
    const week = new Date(lastDate);
    if (increment > 0) {
        buildWeek(week.forwardOneWeek());
    } else {
        buildWeek(week.backOneWeek(), "front");
    };
};

function removeWeeksFromDOM(direction) {
    let allWeeks = [...document.querySelectorAll('.week')];
    let weekArray = Array.from(allWeeks);
    if (allWeeks.length > 11) {
        if (direction > 0) { weekArray = weekArray.reverse() };
        weekArray.slice(0, allWeeks.length - 11).forEach((week) => {
            CALENDAR.removeChild(week);
        });
    };
};

function updateDOM(direction) {
    let refDate;
    if (direction < 0) {
        refDate = document.querySelector(".calendar").firstElementChild.firstElementChild.id;
    } else {
        refDate = document.querySelector(".calendar").lastElementChild.firstElementChild.id;
    }
    const week = new Date(refDate);

    if (direction > 0) {
        buildWeek(week.forwardOneWeek());
    } else {
        buildWeek(week.backOneWeek(), "front");
    };

    let allWeeks = [...document.querySelectorAll('.week')];
    let weekArray = Array.from(allWeeks);
    if (allWeeks.length > 11) {
        if (direction < 0) { weekArray = weekArray.reverse() };
        weekArray.slice(0, allWeeks.length - 11).forEach((week) => {
            CALENDAR.removeChild(week);
        });
    };
};

function virtualizedScrolling() { };

function onScroll() {
    if (Math.abs(CALENDAR.firstChild.getBoundingClientRect().top) < .25 * window.innerHeight) {
        updateDOM(-1);
    };
    if (CALENDAR.lastChild.getBoundingClientRect().top <= 1.25 * window.innerHeight) {
        updateDOM(1);
    };
    debounce(updateHeader, 250)();
};

function scrollToCurrentDay() {
    const today = new Date()
    document.getElementById(today).scrollIntoView();
};

function initialBuild() {
    const today = new Date();
    buildWeek(today);
    let week_added = new Date(today);
    let week_subtracted = new Date(today);
    for (y = 1; y < 5; y++) {

        week_added = week_added.forwardOneWeek();
        buildWeek(week_added);

        week_subtracted = week_subtracted.backOneWeek();
        buildWeek(week_subtracted, "front");

    }
};

//--------------------------------------------------------------------------
//-- executions ------------------------------------------------------------
//--------------------------------------------------------------------------

initialBuild();

scrollToCurrentDay();

calendarWindow.addEventListener('scroll', onScroll);

let isMobile = window.matchMedia("only screen and (max-width: 500px)").matches;

//
// if (isMobile) {
//     scrollToCurrentDay();
// } else {
//     // scrollToCurrentMonth();
// };

function displayDetails(date) {
    const detailsPane = document.getElementById("details");
    detailsPane.querySelector(".details_date").textContent = date;
    detailsPane.querySelector(".details_feast").textContent = calendarData[date]['name'];
    detailsPane.querySelector(".details_rank").textContent = calendarData[date]['rank'];
    detailsPane.querySelector(".details_color").textContent = calendarData[date]['color'];
    detailsPane.querySelector(".details_com_1").textContent = calendarData[date]['com_1']['name'];
    detailsPane.querySelector(".details_com_2").textContent = calendarData[date]['com_2']['name'];
    detailsPane.querySelector(".details_com_3").textContent = calendarData[date]['com_3']['name'];
};
