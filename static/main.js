let calendarData = JSON.parse(localStorage.getItem("data"));
let SCRIPT_ROOT = JSON.parse(localStorage.getItem("scriptRoot"));
const CALENDAR = document.getElementById('calendar');
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();
const currentDateId = currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).split(' ').join('');
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAY = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function fetchJson(data) {
    fetch(data)
        .then(response => response.json())
        .then(json => {
            calendarData = {...calendarData, ...json};
        });
    return;
};

function requestDates(month, year) {
    let yearKeys = Object.keys(calendarData).sort();
    let firstYear = new Date(yearKeys[0]).toLocaleString('en-US', {year: 'numeric'});
    let lastYear  = new Date(yearKeys[yearKeys.length - 1]).toLocaleString('en-US', {year: 'numeric'});
    if (year-1 == firstYear && month == "January") {
        let newData = `${SCRIPT_ROOT}/${year-1}`;
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

Date.prototype.getWeekOfMonth = function () {
    var firstDay = new Date(this.setDate(1)).getDay();
    var totalDays = new Date(this.getFullYear(), this.getMonth() + 1, 0).getDate();
    return Math.ceil((firstDay + totalDays) / 7);
};

// TODO:
// 1. find the last day of the month;
// 2. if that day is a Saturday, we have to subtract one from the number of weeks per month

function addMonthDiv(month, year) {
    const totalWeeks = new Date(year, month, 1).getWeekOfMonth();
    const monthDiv = document.createElement('div');
    if (+month < 0) {
        month = MONTHS.length + parseInt(month);
    };
    const weeks = (totalWeeks == 6) ? 'six-weeks' : 'five-weeks';
    if (totalWeeks == 6) {}
    monthDiv.classList.add('month', weeks);
    monthDiv.id = `${MONTHS[month]}-${year}`;
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
    const dayNumberSpan = document.createElement('div');
    const dayWeekdaySpan = document.createElement('div');
    dayNumberDiv.classList.add('date');
    dayNumberSpan.classList.add('day-number');
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


function buildMonth(year, month) {
    const daysInMonths = new Date(year, month + 1, 0).getDate();
    const theMonth = addMonthDiv(month, year);
    for (let day = 1; day <= daysInMonths; day++) {
        let aDay = createDayElement(day, month, year);
        theMonth.appendChild(aDay);
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

function removeMonthsFromDOM(direction) {
    let theMonths = [...document.querySelectorAll('.month')];
    if (theMonths.length > 10) {
        if (direction > 0) {
            theMonths = theMonths;
        } else {
            theMonths = theMonths.reverse();
        };
        theMonths.splice(0, theMonths.length - 12);
    };
};

function visibility(theElement) {
    const rect = theElement.getBoundingClientRect();
    const height = CALENDAR.offsetHeight;
    if (Math.abs(rect.top) < height/2) {
        return true;
    } else {
        return false;
    };
};

function updateHeader() {
    let allMonths = document.querySelectorAll('.month');
    for (let i = 0; i < allMonths.length; i++) {
        allMonths[i].classList.remove('current-month');
        if (visibility(allMonths[i])) {
            const theMonth = allMonths[i].id.split('-')[0];
            const theYear = allMonths[i].id.split('-')[1];
            const dynamicMonth = document.getElementById('dynamicMonth');
            dynamicMonth.innerHTML = `<b>${theMonth}</b>&nbsp;${theYear}`;
            allMonths[i].classList.add('current-month');
            for  (let y = (i + 1); y < allMonths.length; y++) {
                allMonths[y].classList.remove('current-month');
            };
            return;
        };
    };
};

function addMonthColor(month) {
    const hiddenInfoDivs = hiddenDates();
    for (let i = 0; i < hiddenInfoDivs.length; i++) {
        if (hiddenInfoDivs[i].textContent.split(' ')[0] != month) {
            hiddenInfoDivs[i].parentElement.classList.remove('current-month');
        } else {
            hiddenInfoDivs[i].parentElement.classList.add('current-month');
        };
    };
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

function updateDOM(direction, div) {
    loadDays(div, direction);
    removeMonthsFromDOM(direction);
};

function onScroll() {
    let direction;
    if (Math.abs(CALENDAR.firstChild.getBoundingClientRect().top) < 1*window.innerHeight) {
        direction = -1;
        updateDOM(direction, CALENDAR);
    };
    if (CALENDAR.lastChild.getBoundingClientRect().top <= 1*window.innerHeight) {
        direction = 1;
        updateDOM(direction, CALENDAR);
    };
    debounce(updateHeader, 250)();
};

function scrollToCurrentMonth () {
    document.getElementById(`${MONTHS[currentMonth]}-${currentYear}`).scrollIntoView();
};

function flankMonthsToInitial() {
    // requestDates(MONTHS[currentMonth], currentYear)
    const monthBefore = incrementMonth(currentMonth, currentYear, -1);
    // if (currentMonth == 0) {
    //     requestDates(currentMonth-1, currentYear)
    // } else if (currentMonth == 11) {
    //     requestDates(+currentMonth+1, currentYear)
    // }
    CALENDAR.prepend(buildMonth(monthBefore[1], monthBefore[0]));
    const monthAfter = incrementMonth(currentMonth, currentYear, 1);
    CALENDAR.append(buildMonth(monthAfter[1], monthAfter[0]));
};

const startTime = performance.now()

CALENDAR.appendChild(buildMonth(currentYear, currentMonth));
flankMonthsToInitial();
// onScroll();
CALENDAR.addEventListener('scroll', onScroll);
updateHeader();
scrollToCurrentMonth();

const endTime = performance.now();
console.log(`Performance: ${(endTime - startTime).toFixed(2)} milliseconds`);
