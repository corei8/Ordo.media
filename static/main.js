let calendarData = JSON.parse(localStorage.getItem("data"));
let SCRIPT_ROOT = JSON.parse(localStorage.getItem("scriptRoot"));

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();
const currentDateId = currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).split(' ').join('');
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

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

function createDayElement(day, month, year) {
    const dayDiv = document.createElement('div');
    dayDiv.classList.add('day');
    const dayNumberDiv = document.createElement('div');
    const dayNumberSpan = document.createElement('span');
    dayNumberDiv.classList.add('day-number');
    dayNumberSpan.textContent = day;
    dayNumberDiv.appendChild(dayNumberSpan);
    dayDiv.appendChild(dayNumberDiv);

    const date = new Date(year, month, day);
    const dateFormatted = date.toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'});
    const dateForJson = date.toISOString().split('T')[0];
    if (day === 1) {
        dayDiv.id = `${date.toLocaleDateString('en-US',{month: 'long'})}${date.toLocaleDateString('en-US',{year: 'numeric'})}`;
    };
    if (currentDateId == date.toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'}).split(' ').join('')) {
        dayDiv.id = currentDateId;
        dayNumberSpan.classList.add('today');
        dayDiv.classList.add('today');
    };
    if (7 >= day || day >= 22) {
        dayDiv.classList.add(...monthBorders(day, month, year))
    };

    // TODO: make sure that we ahve a today insert somewhere...


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

    const hiddenInfoDiv = document.createElement('div');
    hiddenInfoDiv.classList.add('hidden-info');
    hiddenInfoDiv.textContent = dateFormatted;
    dayDiv.appendChild(hiddenInfoDiv);

    const feastStatusDiv = document.createElement('div');
    feastStatusDiv.classList.add('feast-status');

    const moonAndColor = document.createElement('div');
    moonAndColor.classList.add('color-container');

    const feastColor = document.createElement('img');
    feastColor.src = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
    feastColor.style.background = calendarData[dateForJson]['color']
    moonAndColor.appendChild(feastColor);

    const moonPhase = document.createElement('div');
    moonPhase.classList.add('moon')
    moonPhase.textContent = calendarData[dateForJson]['moon-phase'];
    moonAndColor.appendChild(moonPhase);

    const isTodayBar = document.createElement('div');
    isTodayBar.classList.add('today-bar');

    feastStatusDiv.appendChild(moonAndColor);
    feastStatusDiv.appendChild(isTodayBar);
    dayDiv.appendChild(feastStatusDiv);

    return dayDiv;
}

function createMonthDays(year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const dayDivs = [];
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = createDayElement(day, month, year);
        const gridColumnStart = (firstDayOfMonth + day - 1) % 7 + 1;
        if (day === 1) {
            dayDiv.style.gridColumnStart = gridColumnStart;
        };
        dayDivs.push(dayDiv);
    };
    return dayDivs;
};

function incrementMonth(month, year, increment) {
    if (increment > 0) {
        if (month == 11) {
            return [0, (year+increment)];
        } else {
            return [(month+increment), year];
        };
    } else {
        if (month == 0) {
            return [11, year+increment];
        } else {
            return [month+increment, year];
        };
    };
};

function removeDaysFromDOM(direction) {
    let calendarDays = [...document.querySelectorAll('.day')];
    if (direction > 0) {
        calendarDays = calendarDays;
    } else {
        calendarDays = calendarDays.reverse();
    };
    i = 0;
    while (document.querySelectorAll('.day').length > (6*7)*12) {
        console.log(calendarDays[i])
        calendarDays[i].remove();
        i++;
    };
};

function loadDays(calendarDiv, increment) {
    const referenceDay = increment > 0 ? 'last-child' : 'first-child';
    const referenceInfo = calendarDiv.querySelector(`.day:${referenceDay} .hidden-info`).textContent;
    const [referenceMonth, referenceDayNum, referenceYear] = referenceInfo.split(' ');
    const referenceDate = new Date(`${referenceMonth} ${referenceDayNum}, ${referenceYear}`)
    const newMonth = incrementMonth(referenceDate.getMonth(), referenceDate.getFullYear(), increment);

    requestDates(MONTHS[newMonth[0]], newMonth[1]);

    const newMonthDays = createMonthDays(newMonth[1], newMonth[0]);

    calendarDiv.style["scroll-snap-type"] = "none";
    if (increment > 0) {
        calendarDiv.append(...newMonthDays);
    } else {
        calendarDiv.prepend(...newMonthDays);
    };
    removeDaysFromDOM(increment);
    calendarDiv.style["scroll-snap-type"] = "y mandatory";
};

function visibility(theElement) {
    const rect = theElement.parentElement.getBoundingClientRect();
    if (rect.top >= 0 && rect.top <= (document.getElementById('calendar').offsetHeight)) {
        return true;
    } else {
        return false;
    };
};

function hiddenDates() {
    let hiddenInfoDivs = [];
    const candidateDays = document.querySelectorAll('.hidden-info');
    for (let i = 0; i < candidateDays.length; i++) {
        const candidate = visibility(candidateDays[i]);
        if(candidate == true) {
            hiddenInfoDivs.push(candidateDays[i]);
        } else {
            candidateDays[i].parentElement.classList.add('day');
        };
    };
    return hiddenInfoDivs;
};

function updateHeader() {
    const hiddenInfoDivs = hiddenDates();
    const monthYearCounts = {};
    hiddenInfoDivs.forEach(hiddenInfo => {
        const dateInfo = hiddenInfo.textContent.split(' ');
        const yearMonthKey = dateInfo[2] + '-' + dateInfo[0];
        monthYearCounts[yearMonthKey] = (monthYearCounts[yearMonthKey] || 0) + 1;
    });
    const sortedMonths = Object.keys(monthYearCounts).sort((a, b) => monthYearCounts[b] - monthYearCounts[a]);
    const [mostCommonYear, mostCommonMonth] = sortedMonths[0].split('-');
    const dynamicMonth = document.getElementById('dynamicMonth');
    dynamicMonth.innerHTML = `<b>${mostCommonMonth}</b>&nbsp;${mostCommonYear}`;
    for (let i = 0; i < hiddenInfoDivs.length; i++) {
        if (hiddenInfoDivs[i].textContent.split(' ')[0] === mostCommonMonth) {
            hiddenInfoDivs[i].parentElement.classList.add('current-month');
        } else {
            hiddenInfoDivs[i].parentElement.classList.remove('current-month');
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

function onScroll() {
    const theCalendarDiv = document.getElementById('calendar')
    if (theCalendarDiv.scrollTop < 2*window.innerHeight) {
        loadDays(calendarDiv, -1);
    };
    if (theCalendarDiv.lastChild.getBoundingClientRect().top <= 3*window.innerHeight) {
        loadDays(calendarDiv, 1);
    };
    debounce(updateHeader, 250)();
};

const calendarDiv = document.querySelector('.calendar');
const currentMonthDays = createMonthDays(currentYear, currentMonth);
calendarDiv.append(...currentMonthDays);
addMonthColor(currentMonth)
for (let month = currentMonth + 1; month <= 1; month++) {
    const monthDays = createMonthDays(currentYear, month);
    calendarDiv.append(...monthDays);
};
for (let month = currentMonth - 1; month >= -1; month--) {
    const monthDays = createMonthDays(currentYear, month);
    calendarDiv.prepend(...monthDays);
};

function scrollToCurrentMonth () {
    document.getElementById(`${MONTHS[currentMonth]}${currentYear}`).scrollIntoView();
};

document.getElementById('calendar').addEventListener('scroll', onScroll);
//document.getElementById(currentDateId).scrollIntoView();
scrollToCurrentMonth();
