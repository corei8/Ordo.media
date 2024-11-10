class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.container = document.getElementById("calendar-container");
        this.dateDisplay = document.getElementById("date-display");
        this.dayDetails = document.getElementById("day-details");
        this.scriptRoot = JSON.parse(localStorage.getItem("scriptRoot"));
        this.calendarData = {};
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.fetchingYears = new Set();
        this.setupEventListeners();
        this.setupClickHandlers();
        this.initializeData().then(() => {
            this.render();
        });
    }

    setupClickHandlers() {
        document.addEventListener("click", (e) => {
            const target = e.target;

            // Help modal handling
            if (target.matches(".help-button")) {
                document.getElementById("help-modal").classList.add("active");
                return;
            }

            if (
                target.matches(".modal-close") ||
                target.matches("#help-modal")
            ) {
                document.getElementById("help-modal").classList.remove(
                    "active",
                );
                return;
            }

            // Calendar day handling
            const dayElement = target.closest(".day");
            if (dayElement) {
                document.querySelectorAll(".day.selected").forEach((el) =>
                    el.classList.remove("selected")
                );
                dayElement.classList.add("selected");

                // Get the date from the day's ID
                const [year, month, day] = dayElement.id.split("-").map((num) =>
                    parseInt(num)
                );
                const date = new Date(year, month - 1, day);
                this.updateDayDetails(date);

                if (window.matchMedia("(max-width: 768px)").matches) {
                    document.querySelector("aside").classList.add("active");
                    document.querySelector(".mobile-overlay").classList.add(
                        "active",
                    );
                }
                return;
            }

            // Mobile overlay handling
            if (target.matches(".mobile-overlay")) {
                const aside = document.querySelector("aside");
                aside.style.transition = "transform 0.3s ease";
                aside.style.transform = "translateY(100%)";
                setTimeout(() => {
                    aside.classList.remove("active");
                    target.classList.remove("active");
                    aside.style.transform = "";
                }, 300);
                return;
            }
        });
    }

    loadCalendarData() {
        try {
            return JSON.parse(localStorage.getItem("data")) || {};
        } catch (e) {
            console.error("Error loading calendar data:", e);
            return {};
        }
    }

    formatDateId(date) {
        return `${date.getFullYear()}-${
            String(date.getMonth() + 1).padStart(2, "0")
        }-${String(date.getDate()).padStart(2, "0")}`;
    }

    getPastelColor(color) {
        switch (color.toLowerCase()) {
            case "red":
                return "#ffe6e6";
            case "green":
                return "#e6ffe6";
            case "white":
                return "#f9f9f9";
            case "black":
                return "#e0e0e0";
            case "purple":
                return "#f0e6ff";
            case "pink":
                return "#ffe6f3";
            default:
                return "#ffffff";
        }
    }

    getMoonPhaseIcon(phase) {
        const baseSize = 20;
        switch (phase.toLowerCase()) {
            case "new":
                return `<svg width="${baseSize}" height="${baseSize}" viewBox="0 0 100 100">
                    <defs>
                        <radialGradient id="shadowNew" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:#666666"/>
                            <stop offset="100%" style="stop-color:#333333"/>
                        </radialGradient>
                    </defs>
                    <circle cx="50" cy="50" r="45" fill="url(#shadowNew)" stroke="#666666" stroke-width="2"/>
                </svg>`;
            case "full":
                return `<svg width="${baseSize}" height="${baseSize}" viewBox="0 0 100 100">
                    <defs>
                        <radialGradient id="shadowFull" cx="35%" cy="35%" r="65%">
                            <stop offset="0%" style="stop-color:#ffffff"/>
                            <stop offset="100%" style="stop-color:#dddddd"/>
                        </radialGradient>
                    </defs>
                    <circle cx="50" cy="50" r="45" fill="url(#shadowFull)" stroke="#666666" stroke-width="2"/>
                </svg>`;
            case "first quarter":
                return `<svg width="${baseSize}" height="${baseSize}" viewBox="0 0 100 100">
                    <defs>
                        <radialGradient id="shadowFirst" cx="35%" cy="35%" r="65%">
                            <stop offset="0%" style="stop-color:#ffffff"/>
                            <stop offset="100%" style="stop-color:#dddddd"/>
                        </radialGradient>
                    </defs>
                    <circle cx="50" cy="50" r="45" fill="#444444" stroke="#666666" stroke-width="2"/>
                    <path d="M50 5 A45 45 0 0 1 50 95" fill="url(#shadowFirst)"/>
                </svg>`;
            case "last quarter":
                return `<svg width="${baseSize}" height="${baseSize}" viewBox="0 0 100 100">
                    <defs>
                        <radialGradient id="shadowLast" cx="65%" cy="35%" r="65%">
                            <stop offset="0%" style="stop-color:#ffffff"/>
                            <stop offset="100%" style="stop-color:#dddddd"/>
                        </radialGradient>
                    </defs>
                    <circle cx="50" cy="50" r="45" fill="#444444" stroke="#666666" stroke-width="2"/>
                    <path d="M50 5 A45 45 0 0 0 50 95" fill="url(#shadowLast)"/>
                </svg>`;
            default:
                return "";
        }
    }
    setupEventListeners() {
        this.container.parentElement.addEventListener("wheel", (e) => {
            if (e.deltaY > 0) {
                this.changeMonth(1);
            } else {
                this.changeMonth(-1);
            }
            e.preventDefault();
        });

        document.addEventListener("keydown", (e) => {
            switch (e.key) {
                case "ArrowUp":
                case "k":
                    this.changeMonth(-1);
                    break;
                case "ArrowDown":
                case "j":
                    this.changeMonth(1);
                    break;
                case "ArrowLeft":
                case "h":
                    this.changeYear(-1);
                    break;
                case "ArrowRight":
                case "l":
                    this.changeYear(1);
                    break;
                case "Escape":
                    if (
                        document.getElementById("help-modal").classList
                            .contains("active")
                    ) {
                        document.getElementById("help-modal").classList.remove(
                            "active",
                        );
                    }
                    break;
            }
        });

        this.dateDisplay.innerHTML = this.createDatePicker();
        this.dateDisplay.addEventListener("change", (e) => {
            if (e.target.id === "month-select") {
                this.currentDate.setMonth(parseInt(e.target.value));
                this.render();
            } else if (e.target.id === "year-select") {
                this.currentDate.setFullYear(parseInt(e.target.value));
                this.render();
            }
        });

        if (window.matchMedia("(max-width: 768px)").matches) {
            this.setupMobileEvents();
        }

        this.setupClickHandlers();
    }

    setupMobileEvents() {
        const aside = document.querySelector("aside");
        const overlay = document.querySelector(".mobile-overlay");
        let startY, currentY;
        let isDragging = false;

        aside.addEventListener("touchstart", (e) => {
            startY = e.touches[0].clientY;
            currentY = aside.getBoundingClientRect().top;
            isDragging = false;
            aside.style.transition = "none";
        }, { passive: true });

        aside.addEventListener("touchmove", (e) => {
            isDragging = true;
            const deltaY = e.touches[0].clientY - startY;
            if (deltaY > 0) {
                e.preventDefault();
                const newTransform = deltaY;
                aside.style.transform = `translateY(${newTransform}px)`;
                overlay.style.opacity = 1 -
                    (deltaY / (window.innerHeight * 0.5));
            }
        }, { passive: false });

        aside.addEventListener("touchend", (e) => {
            aside.style.transition = "transform 0.3s ease";
            const deltaY = e.changedTouches[0].clientY - startY;

            if (deltaY > window.innerHeight * 0.2) {
                aside.style.transform = "translateY(100%)";
                setTimeout(() => {
                    aside.classList.remove("active");
                    overlay.classList.remove("active");
                    aside.style.transform = "";
                }, 300);
            } else {
                aside.style.transform = "";
            }

            setTimeout(() => {
                aside.style.transition = "";
            }, 300);
        });
    }

    changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.render();
    }

    changeYear(delta) {
        this.currentDate.setFullYear(this.currentDate.getFullYear() + delta);
        this.render();
    }

    createDatePicker() {
        const currentYear = this.currentDate.getFullYear();
        const currentMonth = this.currentDate.getMonth();
        const yearOptions = Array.from(
            { length: 41 },
            (_, i) => currentYear - 20 + i,
        )
            .map((year) =>
                `<option value="${year}" ${
                    year === currentYear ? "selected" : ""
                }>${year}</option>`
            )
            .join("");

        const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
        const monthOptions = months
            .map((month, i) =>
                `<option value="${i}" ${
                    i === currentMonth ? "selected" : ""
                }>${month}</option>`
            )
            .join("");

        return `
            <select id="month-select" class="date-select">
                ${monthOptions}
            </select>
            <select id="year-select" class="date-select">
                ${yearOptions}
            </select>
        `;
    }

    getMonthData(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const firstDayToShow = new Date(firstDay);
        firstDayToShow.setDate(
            firstDayToShow.getDate() - firstDayToShow.getDay(),
        );
        const days = [];
        const currentDay = new Date(firstDayToShow);

        for (let i = 0; i < 42; i++) {
            days.push({
                date: new Date(currentDay),
                isCurrentMonth: currentDay.getMonth() === month,
            });
            currentDay.setDate(currentDay.getDate() + 1);
        }

        return days;
    }

    formatDate(date) {
        return new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(date);
    }

    createDayContent(dayData, dayNumber, date) {
        const content = document.createElement("div");
        content.style.height = "100%";
        content.style.display = "flex";
        content.style.flexDirection = "column";

        const dayNames = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];
        content.parentElement?.setAttribute(
            "data-day-name",
            dayNames[date.getDay()],
        );

        const numberDiv = document.createElement("div");
        numberDiv.className = "day-number";
        numberDiv.textContent = dayNumber;
        content.appendChild(numberDiv);

        if (dayData) {
            if (dayData.name) {
                const nameDiv = document.createElement("div");
                nameDiv.className = "day-name";
                nameDiv.textContent = dayData.name;
                content.appendChild(nameDiv);
            }

            if (dayData.rank) {
                const rankDiv = document.createElement("div");
                rankDiv.className = "day-rank";
                rankDiv.textContent = dayData.rank;
                content.appendChild(rankDiv);
            }

            const commsDiv = document.createElement("div");
            commsDiv.className = "commemorations";
            ["com_1", "com_2", "com_3"].forEach((com) => {
                if (dayData[com] && dayData[com].name) {
                    const commDiv = document.createElement("div");
                    commDiv.className = "commemoration";
                    commDiv.textContent = dayData[com].name;
                    commsDiv.appendChild(commDiv);
                }
            });
            content.appendChild(commsDiv);

            if (dayData["moon-phase"]) {
                const moonDiv = document.createElement("div");
                moonDiv.className = "moon-phase";
                moonDiv.innerHTML = this.getMoonPhaseIcon(
                    dayData["moon-phase"],
                );
                content.appendChild(moonDiv);
            }
        }

        return content;
    }

    hasYearData(year) {
        const yearPrefix = `${year}-`;
        return Object.keys(this.calendarData).some((key) =>
            key.startsWith(yearPrefix)
        );
    }

    async prefetchYearData(year) {
        if (this.fetchingYears.has(year) || this.hasYearData(year)) {
            return;
        }

        this.fetchingYears.add(year);
        try {
            const response = await fetch(`${this.scriptRoot}/${year}`);
            const json = await response.json();
            this.calendarData = { ...this.calendarData, ...json };
            localStorage.setItem("data", JSON.stringify(this.calendarData));
        } catch (e) {
            console.error(`Error fetching data for year ${year}:`, e);
        } finally {
            this.fetchingYears.delete(year);
        }
    }

    async initializeData() {
        this.calendarData = this.loadCalendarData();
        const currentYear = this.currentDate.getFullYear();
        if (!this.hasYearData(currentYear)) {
            await this.prefetchYearData(currentYear);
        }
    }

    async getDayData(dateId) {
        if (this.calendarData[dateId]) {
            return this.calendarData[dateId];
        }

        const storedData = this.loadCalendarData();
        if (storedData[dateId]) {
            this.calendarData = { ...this.calendarData, ...storedData };
            return storedData[dateId];
        }

        const year = dateId.slice(0, 4);
        await this.prefetchYearData(year);
        return this.calendarData[dateId] || {};
    }

    async render() {
        const currentYear = this.currentDate.getFullYear();
        const monthStart = new Date(this.currentDate);
        monthStart.setDate(1);
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0);

        if (!this.hasYearData(currentYear)) {
            await this.prefetchYearData(currentYear);
        }

        const prevMonth = new Date(monthStart);
        prevMonth.setDate(0);
        const nextMonth = new Date(monthEnd);
        nextMonth.setDate(nextMonth.getDate() + 1);

        const years = new Set([
            currentYear,
            prevMonth.getFullYear(),
            nextMonth.getFullYear(),
        ]);

        await Promise.all(
            Array.from(years).map((year) => {
                if (!this.hasYearData(year)) {
                    return this.prefetchYearData(year);
                }
                return Promise.resolve();
            }),
        );

        this.dateDisplay.textContent = new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
        }).format(this.currentDate);

        while (this.container.children.length > 1) {
            this.container.removeChild(this.container.lastChild);
        }

        const days = this.getMonthData(this.currentDate);
        const fetchPromises = [];

        for (let i = 0; i < 6; i++) {
            const week = document.createElement("div");
            week.className = "week";

            for (let j = 0; j < 7; j++) {
                const dayIndex = i * 7 + j;
                const dayInfo = days[dayIndex];
                const day = document.createElement("div");
                const dateId = this.formatDateId(dayInfo.date);

                day.id = dateId;
                day.className = "day" +
                    (dayInfo.isCurrentMonth ? "" : " other-month") +
                    (this.selectedDate &&
                            dayInfo.date.toDateString() ===
                                this.selectedDate.toDateString()
                        ? " selected"
                        : "");

                if (this.calendarData[dateId]) {
                    const dayData = this.calendarData[dateId];
                    if (dayData.color) {
                        day.style.backgroundColor = this.getPastelColor(
                            dayData.color,
                        );
                    }
                    day.appendChild(
                        this.createDayContent(
                            dayData,
                            dayInfo.date.getDate(),
                            dayInfo.date,
                        ),
                    );
                } else {
                    const fetchPromise = this.getDayData(dateId).then(
                        (dayData) => {
                            if (dayData.color) {
                                day.style.backgroundColor = this.getPastelColor(
                                    dayData.color,
                                );
                            }
                            day.appendChild(
                                this.createDayContent(
                                    dayData,
                                    dayInfo.date.getDate(),
                                    dayInfo.date,
                                ),
                            );
                        },
                    );
                    fetchPromises.push(fetchPromise);
                }

                week.appendChild(day);
            }

            this.container.appendChild(week);
        }

        if (fetchPromises.length > 0) {
            await Promise.all(fetchPromises);
        }

        if (window.matchMedia("(max-width: 768px)").matches) {
            this.container.querySelectorAll(".week").forEach((week) => {
                week.style.display = "block";
            });
        }
    }

    async updateDayDetails(date) {
        this.selectedDate = date;
        const dateId = this.formatDateId(date);
        const dayData = await this.getDayData(dateId);

        this.dayDetails.innerHTML = `
            <h2>Day Details</h2>
            <p>${this.formatDate(date)}</p>
            <div class="json-view">${JSON.stringify(dayData, null, 2)}</div>
        `;

        if (window.matchMedia("(max-width: 768px)").matches) {
            document.querySelector("aside").classList.add("active");
            document.querySelector(".mobile-overlay").classList.add("active");
        }
    }
}

new Calendar();
