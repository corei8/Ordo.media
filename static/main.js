let calendarData = JSON.parse(localStorage.getItem("data"));
let SCRIPT_ROOT = JSON.parse(localStorage.getItem("scriptRoot"));
const CALENDAR = document.getElementById('calendar');
const calendarWindow = document.getElementById('calendarWindow');
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();
const currentDateId = currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).split(' ').join('');
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAY = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];


async function fetchJson(data) {
    fetch(data)
        .then(response => response.json())
        .then(json => {
            calendarData = {...calendarData, ...json};
        });
    return;
};

async function requestDates(month, year) {
    let yearKeys = Object.keys(calendarData).sort();
    let firstYear = new Date(yearKeys[0]).toLocaleString('en-US', {year: 'numeric'});
    let lastYear  = new Date(yearKeys[yearKeys.length - 1]).toLocaleString('en-US', {year: 'numeric'});
    if (year-1 == firstYear && month == "January") { let newData = `${SCRIPT_ROOT}/${year-1}`;
        fetchJson(newData);
    } else if (year == lastYear && month == "December") {
        let newData = `${SCRIPT_ROOT}/${parseInt(year)+1}`;
        fetchJson(newData);
    };
};

function monthBorders(day, month, year) {
    const d = new Date(month + " " + day + ", " + year);
    const weekday = d.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const adjust = 31 - daysInMonth;
    const endStart = 24-adjust
    const endEnd = 31-adjust
    if (day == 1) {
        if (weekday != 0) {
            return ["border-top","border-front"];
        } else {
            return ["border-top"];
        };
    } else if (day == daysInMonth) {
        if (weekday != 6) {
            return ["border-bottom","border-end"];
        } else {
            return ["border-bottom"];
        };
    } else if (day <= 7) {
        return ["border-top"];
    } else if (endStart < day && day < endEnd) {
        return ["border-bottom"];
    } else {
        return ["border-normal"];
    };
};

Date.prototype.getWeeksInMonth = function () {
    const firstDay = new Date(this.setDate(1)).getDay();
    const lastDay = new Date(this.getFullYear(), this.getMonth() + 1, 0)
    const totalDays = lastDay.getDate();
    let adjust = 0;
    if (lastDay.getDay() == 6) {
        adjust = 1;
    };
    return Math.ceil((firstDay + totalDays) / 7 + adjust);
};

function addMonthDiv(month, year) {
    const totalWeeks = new Date(year, month, 1).getWeeksInMonth();
    const monthDiv = document.createElement('div');
    if (+month < 0) {
        month = MONTHS.length + parseInt(month);
    };
    const weeks = (totalWeeks == 6) ? 'six-weeks' : 'five-weeks';
    // if (totalWeeks == 6) {}
    monthDiv.classList.add('month', weeks);
    monthDiv.id = `${MONTHS[month]}-${year}`;
    for (let week = 1; week < totalWeeks+1; week++) {
        const aWeek = document.createElement('div')
        aWeek.classList.add('week_'+week, 'week');
        monthDiv.appendChild(aWeek);
    };
    return monthDiv;
};

function positionOfFirstDay(year, month) {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const gridColumnStart = (firstDayOfMonth) % 7 + 1;
    return gridColumnStart;
};

function addElement(type, classname, content = '') {
    const element = document.createElement(type);
    element.classList.add(classname);
    element.textContent = content;
    this.appendChild(element);
};

function createDayElement(day, month, year) {
    const date = new Date(year, month, day);
    const dayDiv = document.createElement('div');
    dayDiv.classList.add('day');
    if (day === 1) {
        const dayId = `${MONTHS[date.getMonth()]}${date.getFullYear()}`;
        dayDiv.id = dayId;
        dayDiv.style.gridColumnStart = positionOfFirstDay(year, month);
    };

    const dayNumberDiv = document.createElement('div');
    dayNumberDiv.classList.add('date');

    const dayNumberSpan = document.createElement('div');
    dayNumberSpan.classList.add('day-number');

    const dayWeekdaySpan = document.createElement('div');
    dayWeekdaySpan.classList.add('day-weekday');

    if (day === 1) {
        dayNumberSpan.textContent = `${MONTHS[month]} ${day}`;
    } else {
        dayNumberSpan.textContent = day;
    }

    dayWeekdaySpan.textContent = WEEKDAY[date.getDay()];
    dayNumberDiv.appendChild(dayWeekdaySpan);
    dayNumberDiv.appendChild(dayNumberSpan);
    dayDiv.appendChild(dayNumberDiv);
    const dateFormatted = date.toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'});
    const dateForJson = date.toISOString().split('T')[0];

    dayDiv.addEventListener("click", function() {displayDetails(dateForJson)}, false);

    if (currentDateId == dateFormatted.split(' ').join('')) {
        dayDiv.id = currentDateId;
        dayNumberSpan.classList.add('today');
        dayDiv.classList.add('today');
    };
    if (7 >= day || day >= 22) { dayDiv.classList.add(...monthBorders(day, month, year)) };
    const feastInformationDiv = document.createElement('div');
    feastInformationDiv.classList.add('feast');
    const rankSpan = document.createElement('span');
    rankSpan.classList.add('rank');
    if (calendarData.hasOwnProperty(dateForJson)) {
        feastInformationDiv.textContent = calendarData[dateForJson]['name'];
        rankSpan.textContent = calendarData[dateForJson]['rank'];
    }
    dayDiv.appendChild(feastInformationDiv)

    //-----------------------------------------------------------------------------
    // commemorated feast

    const standardCommemorations = [ 99906, 99907, 99908, 99909, 99910, 99911, 99912, 99913, 99914, ]

    if (standardCommemorations.includes(calendarData[dateForJson]['com_1']['code'])) {
        var commemoratedFeast = '';
    } else {
        var commemoratedFeast = calendarData[dateForJson]['com_1']['name'];
    };

    const commemoratedFeastDiv = document.createElement('div');
    commemoratedFeastDiv.textContent = commemoratedFeast;
    commemoratedFeastDiv.classList.add('commemorated_feast');

    //-----------------------------------------------------------------------------

    // for fetching data for the aside
    // const dataDateKey = document.createElement('span');
    // dataDateKey.classList.add('date-key');
    // dataDateKey.textContent = dateForJson;
    // dayNumberDiv.appendChild(dataDateKey);

    dayDiv.appendChild(commemoratedFeastDiv);
    feastInformationDiv.appendChild(rankSpan)
    const feastStatusDiv = document.createElement('div');
    feastStatusDiv.classList.add('feast-status');
    const moonAndColor = document.createElement('div');
    moonAndColor.classList.add('color-container');
    const color = document.createElement('div');
    color.classList.add(calendarData[dateForJson]['color'],'color');
    moonAndColor.appendChild(color);
    const moonPhase = document.createElement('div');
    moonPhase.classList.add('moon');
    moonPhase.textContent = calendarData[dateForJson]['moon-phase'];
    moonAndColor.appendChild(moonPhase);
    feastStatusDiv.appendChild(moonAndColor);
    dayDiv.appendChild(feastStatusDiv);
    return dayDiv;
}

function getWeek(date) {
    let monthStart = new Date(date);
    monthStart.setDate(0);
    let offset = (monthStart.getDay() + 1) % 7;
    return Math.ceil((date.getDate() + offset) / 7)-1;
}

function buildMonth(year, month, firstMonth=false) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const theMonth = addMonthDiv(month, year);
    for (let day = 1; day <= daysInMonth; day++) {
        let aDay = createDayElement(day, month, year);
        theMonth.children[getWeek(new Date(year, month, day))].appendChild(aDay);
    };
    if (firstMonth == true) {
        theMonth.classList.add('current-month');
    };
    return theMonth;
};

function incrementMonth(month, year, increment) {
    if (increment > 0) {
        if (month == 11) {
            return [0, +year + +increment];
        } else {
            return [+month + +increment, year];
        };
    } else {
        if (month == 0) {
            return [11, +year + +increment];
        } else {
            return [+month + +increment, year];
        };
    };
};

function loadDays(calendarDiv, increment) {
    const child = increment > 0 ? 'last-child' : 'first-child';
    const ref = CALENDAR.querySelector(`.month:${child}`).id.split("-");
    const newMonth = incrementMonth(MONTHS.indexOf(ref[0]), ref[1], increment);
    requestDates(MONTHS[newMonth[0]], newMonth[1]);
    const newMonthDiv = buildMonth(newMonth[1], newMonth[0]);
    if (increment > 0) {
        calendarDiv.append(newMonthDiv);
    } else {
        calendarDiv.prepend(newMonthDiv);
    };
};


function removeMonthsFromDOM () {
    let theMonths = [...document.querySelectorAll('.month')];
    for (i=0; i<theMonths.length; i++) {
        if (theMonths[i].childNodes.length===0) {CALENDAR.removeChild(theMonths[i])};
    };
};


function removeWeeksFromDOM(direction) {
    let allWeeks = [...document.querySelectorAll('.week')];
    let weekArray = Array.from(allWeeks);
    if (allWeeks.length > 50) {
        if (direction > 0) { } else {
            weekArray = weekArray.reverse();
        };
        weekArray.slice(0, allWeeks.length-50).forEach((week) => {
            week.parentNode.removeChild(week);
        });
    };
};

function removePartialMonth(direction) {
    let allMonths = [...document.querySelectorAll('.month')];
    if (direction > 0) { } else { allMonths = allMonths.reverse(); };
    CALENDAR.removeChild(allMonths[0])
};

function updateHeader() {
    let allMonths = document.querySelectorAll('.month');
    try {
        CALENDAR.querySelector('.current-month').classList.remove('current-month');
    } catch(TypeError) { };
    visibleMonth = allMonths[Math.floor(allMonths.length / 2)]
    visibleMonth.classList.add('current-month');
    const theMonth = visibleMonth.id.split('-')[0];
    const theYear = visibleMonth.id.split('-')[1];
    const dynamicMonth = document.getElementById('dynamicMonth');
    dynamicMonth.innerHTML = `<b>${theMonth}</b>&nbsp;${theYear}`;
};

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

function updateDOM(direction) {
    // TODO: check if there are any months that are not full on scroll up...
    loadDays(CALENDAR, direction);
    removeWeeksFromDOM(direction);
    removeMonthsFromDOM();
    removePartialMonth(direction);
};

function virtualizedScrolling () { };

function onScroll() {
    if (Math.abs(CALENDAR.firstChild.getBoundingClientRect().top) < .25*window.innerHeight) {
        updateDOM(-1);
    };
    if (CALENDAR.lastChild.getBoundingClientRect().top <= .25*window.innerHeight) {
        updateDOM(1);
    };
    debounce(updateHeader, 250)();
};

function scrollToCurrentMonth () {
    document.getElementById(`${MONTHS[currentMonth]}-${currentYear}`).scrollIntoView();
};

function scrollToCurrentDay () {
    document.getElementsByClassName(`today`)[0].scrollIntoView();
};

function flankMonthsToInitial () {
    const monthBefore = incrementMonth(currentMonth, currentYear, -1);
    CALENDAR.prepend(buildMonth(monthBefore[1], monthBefore[0]));
    const monthAfter = incrementMonth(currentMonth, currentYear, 1);
    CALENDAR.append(buildMonth(monthAfter[1], monthAfter[0]));
};

CALENDAR.appendChild(buildMonth(currentYear, currentMonth, true));
flankMonthsToInitial();
calendarWindow.addEventListener('scroll', onScroll);
updateHeader();

let isMobile = window.matchMedia("only screen and (max-width: 500px)").matches;

if (isMobile) {
    scrollToCurrentDay();
} else {
    scrollToCurrentMonth();
};

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
