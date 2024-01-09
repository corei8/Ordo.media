// Build an div that will be a day in the calendar. Load it
// with all the divs that will hold the information.
//

const data = {{ data|tojson }}

function createDayElement(day, month, year) {
    const dayDiv = document.createElement('div');
    dayDiv.classList.add('day');
    const dayNumberDiv = document.createElement('div');
    dayNumberDiv.classList.add('day-number');
    dayNumberDiv.textContent = day;
    dayDiv.appendChild(dayNumberDiv);
    const hiddenInfoDiv = document.createElement('div');
    hiddenInfoDiv.classList.add('hidden-info');
    const date = new Date(year, month, day);
    const dateFormatted = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    hiddenInfoDiv.textContent = dateFormatted'
    dayDiv.appendChild(hiddenInfoDiv);
    const feastInformationDiv = document.createElement('div');
    feastInformationDiv.textContent = data[dateFormatted]['name']
    feastInformationDiv.classList.add('feast');
    dayDiv.appendChild(feastInformationDiv)
    return dayDiv;
}

// dynamically set the height of the days
let calendarHeight = document.getElementById('calendar').offsetHeight

function createMonthDays(year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const dayDivs = [];
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = createDayElement(day, month, year);

        const gridColumnStart = (firstDayOfMonth + day - 1) % 7 + 1;
        if (day === 1) {
            dayDiv.style.gridColumnStart = gridColumnStart;
        }

        dayDivs.push(dayDiv);
    }

    return dayDivs;
}

function incrementMonth(date, increment) {
    const newDate = new Date(date);
    newDate.setMonth(date.getMonth() + increment);
    return newDate;
}

function loadDays(calendarDiv, increment) {
    const referenceDay = increment > 0 ? 'last-child' : 'first-child';
    const referenceInfo = calendarDiv.querySelector(`.day:${referenceDay} .hidden-info`).textContent;
    const [referenceMonth, referenceDayNum, referenceYear] = referenceInfo.split(' ');

    const newMonth = incrementMonth(new Date(`${referenceMonth} ${referenceDayNum}, ${referenceYear}`), increment);

    const newMonthDays = createMonthDays(newMonth.getFullYear(), newMonth.getMonth());
    if (increment > 0) {
        calendarDiv.append(...newMonthDays);
    } else {
        calendarDiv.prepend(...newMonthDays);
        // window.scrollBy(0, newMonthDays.length * (16.66 + 5)); // Adjust scroll position
    }
}

function visibility(theElement) {
    const rect = theElement.parentElement.getBoundingClientRect();
    let elementVisibility = false
    // document.getElementById('calendar').offsetHeight
    if (rect.top >= 0 && rect.top <= (document.getElementById('calendar').offsetHeight)) {
        return true
    } else {
        return false
    }
}

function updateHeader() {
    var hiddenInfoDivs = []
    const candidateDays = document.querySelectorAll('.hidden-info')
    console.log(candidateDays.length)
    for (let i = 0; i < candidateDays.length; i++) {
        let candidate = visibility(candidateDays[i])
        if(candidate == true) {
            hiddenInfoDivs.push(candidateDays[i]);
        } else {
            candidateDays[i].parentElement.className = 'day';
        }
    }

    const monthYearCounts = {};

    hiddenInfoDivs.forEach(hiddenInfo => {
        const dateInfo = hiddenInfo.textContent.split(' ');
        const yearMonthKey = dateInfo[2] + '-' + dateInfo[0];

        monthYearCounts[yearMonthKey] = (monthYearCounts[yearMonthKey] || 0) + 1;
    });

    const sortedMonths = Object.keys(monthYearCounts).sort((a, b) => monthYearCounts[b] - monthYearCounts[a]);
    console.log(sortedMonths)
    const [mostCommonYear, mostCommonMonth] = sortedMonths[0].split('-');

    const calendarTitle = document.getElementById('calendarTitle');
    calendarTitle.innerHTML = `<b>${mostCommonMonth}</b>&nbsp;${mostCommonYear}`;

    for (let i = 0; i < hiddenInfoDivs.length; i++) {
        if (hiddenInfoDivs[i].textContent.split(' ')[0] === mostCommonMonth) {
            hiddenInfoDivs[i].parentElement.className = 'day current-month';
        } else {
            hiddenInfoDivs[i].parentElement.className = 'day';
        }
    }
}

function addColor() {
    var hiddenInfoDivs = []
    const candidateDays = document.querySelectorAll('.hidden-info')
    console.log(candidateDays.length)
    for (let i = 0; i < candidateDays.length; i++) {
        let candidate = visibility(candidateDays[i])
        if(candidate == true) {
            hiddenInfoDivs.push(candidateDays[i]);
        } else {
            candidateDays[i].parentElement.className = 'day';
        }
    }

    const monthYearCounts = {};

    hiddenInfoDivs.forEach(hiddenInfo => {
        const dateInfo = hiddenInfo.textContent.split(' ');
        const yearMonthKey = dateInfo[2] + '-' + dateInfo[0];

        monthYearCounts[yearMonthKey] = (monthYearCounts[yearMonthKey] || 0) + 1;
    });

    const sortedMonths = Object.keys(monthYearCounts).sort((a, b) => monthYearCounts[b] - monthYearCounts[a]);
    const [mostCommonYear, mostCommonMonth] = sortedMonths[0].split('-');

    for (let i = 0; i < hiddenInfoDivs.length; i++) {
        if (hiddenInfoDivs[i].textContent.split(' ')[0] === mostCommonMonth) {
            hiddenInfoDivs[i].parentElement.className = 'day current-month';
        } else {
            hiddenInfoDivs[i].parentElement.className = 'day';
        }
    }
}

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function onScroll() {
    // Check if the user has scrolled to the top
    theCalendarDiv = document.getElementById('calendar')
    if (theCalendarDiv.scrollTop < window.innerHeight) {
        loadDays(calendarDiv, -1);
    }
    if (theCalendarDiv.lastChild.getBoundingClientRect().top <= 2*window.innerHeight) {
        loadDays(calendarDiv, 1);
    }

    // This is the old one, that just works too well...
    // if (document.getElementById('calendar').scrollY <= 250) {
    //     loadDays(calendarDiv, -1);
    // }

    // Check if the user has scrolled to the bottom
    // if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 250) {
    // // if (document.getElementById('calendar').scrollY >= 250) {
    //     loadDays(calendarDiv, 1);
    // }

    // Update the header after scrolling
    debounce(updateHeader, 100)(); // 100ms is basically instantaneous
}

// Initial load of the current month and initial days
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();
const calendarDiv = document.querySelector('.calendar');
const currentMonthDays = createMonthDays(currentYear, currentMonth);
calendarDiv.append(...currentMonthDays);
addColor()

// Load the days after the current month dynamically
for (let month = currentMonth + 1; month <= 12; month++) {
    const monthDays = createMonthDays(currentYear, month);
    calendarDiv.append(...monthDays);
}

// Listen for the scroll event
// window.addEventListener('scroll', onScroll);

document.getElementById('calendar').addEventListener('scroll', onScroll);
