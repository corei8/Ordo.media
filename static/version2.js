class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.container = document.getElementById("calendar-container");
        this.dateDisplay = document.getElementById("date-display");
        this.dayDetails = document.getElementById("day-details");
        // this.calendarData = this.loadCalendarData();

        // TODO: add error handling
        this.scriptRoot = JSON.parse(localStorage.getItem("scriptRoot"));
        this.calendarData = {};
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.setupEventListeners();
        this.initializeData().then(() => {
            this.render();
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
                return "#ffe6e6"; // Light red/rose
            case "green":
                return "#e6ffe6"; // Light green
            case "white":
                return "#f9f9f9"; // Off-white
            case "black":
                return "#e0e0e0"; // Light gray
            case "purple":
                return "#f0e6ff"; // Light violet/purple
            case "pink":
                return "#ffe6f3"; // Light pink/rose
            default:
                return "#ffffff"; // Pure white as fallback
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
                return ""; // Return empty string for invalid or empty phase
        }
    }

    setupEventListeners() {
        // Wheel event for month navigation
        this.container.parentElement.addEventListener("wheel", (e) => {
            if (e.deltaY > 0) {
                this.changeMonth(1);
            } else {
                this.changeMonth(-1);
            }
            e.preventDefault();
        });

        // Keyboard navigation
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
            }
        });

        // Date picker in status bar
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

        // Help modal functionality
        const modal = document.getElementById("help-modal");
        const helpButton = document.querySelector(".help-button");
        const closeButton = modal.querySelector(".modal-close");

        helpButton.addEventListener("click", () => {
            modal.classList.add("active");
        });

        closeButton.addEventListener("click", () => {
            modal.classList.remove("active");
        });

        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.classList.remove("active");
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("active")) {
                modal.classList.remove("active");
            }
        });

        // Mobile-specific event handlers
        if (window.matchMedia("(max-width: 768px)").matches) {
            this.setupMobileEvents();
        }
    }

    setupMobileEvents() {
        const aside = document.querySelector("aside");
        const overlay = document.querySelector(".mobile-overlay");
        let startY, currentY;
        let isDragging = false;

        // Modify day click handler for mobile
        this.container.addEventListener("click", (e) => {
            const dayElement = e.target.closest(".day");
            if (dayElement && !isDragging) {
                aside.classList.add("active");
                overlay.classList.add("active");
            }
        });

        // Improved touch handling for aside
        aside.addEventListener("touchstart", (e) => {
            startY = e.touches[0].clientY;
            currentY = aside.getBoundingClientRect().top;
            isDragging = false;
            aside.style.transition = "none";
        }, { passive: true });

        aside.addEventListener("touchmove", (e) => {
            isDragging = true;
            const deltaY = e.touches[0].clientY - startY;
            if (deltaY > 0) { // Only allow downward swipe
                e.preventDefault(); // Prevent default only when swiping down
                const newTransform = deltaY;
                aside.style.transform = `translateY(${newTransform}px)`;
                overlay.style.opacity = 1 -
                    (deltaY / (window.innerHeight * 0.5));
            }
        }, { passive: false });

        aside.addEventListener("touchend", (e) => {
            aside.style.transition = "transform 0.3s ease";
            const deltaY = e.changedTouches[0].clientY - startY;

            if (deltaY > window.innerHeight * 0.2) { // 20% threshold for dismiss
                aside.style.transform = "translateY(100%)";
                setTimeout(() => {
                    aside.classList.remove("active");
                    overlay.classList.remove("active");
                    aside.style.transform = "";
                }, 300);
            } else {
                aside.style.transform = "";
            }

            // Reset after animation
            setTimeout(() => {
                aside.style.transition = "";
            }, 300);
        });

        // Close on overlay click
        overlay.addEventListener("click", () => {
            aside.style.transition = "transform 0.3s ease";
            aside.style.transform = "translateY(100%)";
            setTimeout(() => {
                aside.classList.remove("active");
                overlay.classList.remove("active");
                aside.style.transform = "";
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
    // changeMonth(delta) {
    //     this.currentDate.setMonth(this.currentDate.getMonth() + delta);
    //     this.render();
    // }
    //
    // changeYear(delta) {
    //     this.currentDate.setFullYear(this.currentDate.getFullYear() + delta);
    //     this.render();
    // }

    createDatePicker() {
        const currentYear = this.currentDate.getFullYear();
        const currentMonth = this.currentDate.getMonth();

        // Create year options (20 years before and after current year)
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

        // Create month options
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
        const lastDay = new Date(year, month + 1, 0);

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

    createDayContent(dayData, dayNumber) {
        const content = document.createElement("div");
        content.style.height = "100%";
        content.style.display = "flex";
        content.style.flexDirection = "column";

        // Add day name as data attribute for mobile
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

        // Day number
        const numberDiv = document.createElement("div");
        numberDiv.className = "day-number";
        numberDiv.textContent = dayNumber;
        content.appendChild(numberDiv);

        if (dayData) {
            // Name
            if (dayData.name) {
                const nameDiv = document.createElement("div");
                nameDiv.className = "day-name";
                nameDiv.textContent = dayData.name;
                content.appendChild(nameDiv);
            }

            // Rank
            if (dayData.rank) {
                const rankDiv = document.createElement("div");
                rankDiv.className = "day-rank";
                rankDiv.textContent = dayData.rank;
                content.appendChild(rankDiv);
            }

            // Commemorations
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

            // Moon phase
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
    async initializeData() {
        this.calendarData = this.loadCalendarData();
        // Initial render with localStorage data
        this.render();
    }

    async fetchJson(date) {
        try {
            // NOTE: date can either be forwards or backwards...
            const response = await fetch(
                `${this.scriptRoot}/${date.slice(0, 4)}`,
            );
            const json = await response.json();
            // Update both memory and localStorage
            this.calendarData = { ...this.calendarData, ...json };
            localStorage.setItem("data", JSON.stringify(this.calendarData));
            return json;
        } catch (e) {
            console.error("Error fetching calendar data:", e);
            return null;
        }
    }

    async getDayData(dateId) {
        if (!this.calendarData[dateId]) {
            // If data doesn't exist, fetch it
            await this.fetchJson(dateId);
        }
        return this.calendarData[dateId] || {};
    }

    // Update render to handle async data
    async render() {
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

                // Create a promise for this day's data
                const fetchPromise = this.getDayData(dateId).then((dayData) => {
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
                });

                fetchPromises.push(fetchPromise);

                day.addEventListener("click", async () => {
                    document.querySelectorAll(".day.selected").forEach((el) =>
                        el.classList.remove("selected")
                    );
                    day.classList.add("selected");
                    await this.updateDayDetails(dayInfo.date);
                });

                week.appendChild(day);
            }

            this.container.appendChild(week);
        }

        // Wait for all fetches to complete
        await Promise.all(fetchPromises);

        // Handle mobile layout if necessary
        if (window.matchMedia("(max-width: 768px)").matches) {
            this.container.querySelectorAll(".week").forEach((week) => {
                week.style.display = "block";
            });
        }
    }

    // render() {
    //     this.dateDisplay.textContent = new Intl.DateTimeFormat("en-US", {
    //         year: "numeric",
    //         month: "long",
    //     }).format(this.currentDate);
    //
    //     while (this.container.children.length > 1) {
    //         this.container.removeChild(this.container.lastChild);
    //     }
    //
    //     const days = this.getMonthData(this.currentDate);
    //
    //     for (let i = 0; i < 6; i++) {
    //         const week = document.createElement("div");
    //         week.className = "week";
    //
    //         for (let j = 0; j < 7; j++) {
    //             const dayIndex = i * 7 + j;
    //             const dayInfo = days[dayIndex];
    //             const day = document.createElement("div");
    //             const dateId = this.formatDateId(dayInfo.date);
    //             const dayData = this.calendarData[dateId];
    //
    //             day.id = dateId;
    //             day.className = "day" +
    //                 (dayInfo.isCurrentMonth ? "" : " other-month") +
    //                 (this.selectedDate &&
    //                         dayInfo.date.toDateString() ===
    //                             this.selectedDate.toDateString()
    //                     ? " selected"
    //                     : "");
    //
    //             if (dayData && dayData.color) {
    //                 day.style.backgroundColor = this.getPastelColor(
    //                     dayData.color,
    //                 );
    //             }
    //
    //             // Updated to pass the date
    //             day.appendChild(
    //                 this.createDayContent(
    //                     dayData,
    //                     dayInfo.date.getDate(),
    //                     dayInfo.date,
    //                 ),
    //             );
    //
    //             day.addEventListener("click", () => {
    //                 if (
    //                     !window.matchMedia("(max-width: 768px)").matches ||
    //                     !isDragging
    //                 ) {
    //                     document.querySelectorAll(".day.selected").forEach(
    //                         (el) => el.classList.remove("selected"),
    //                     );
    //                     day.classList.add("selected");
    //                     this.updateDayDetails(dayInfo.date);
    //                 }
    //             });
    //
    //             week.appendChild(day);
    //         }
    //
    //         this.container.appendChild(week);
    //     }
    //
    //     // Handle mobile layout if necessary
    //     if (window.matchMedia("(max-width: 768px)").matches) {
    //         this.container.querySelectorAll(".week").forEach((week) => {
    //             week.style.display = "block";
    //         });
    //     }
    // }

    // Update updateDayDetails to handle async data
    async updateDayDetails(date) {
        this.selectedDate = date;
        const dateId = this.formatDateId(date);
        const dayData = await this.getDayData(dateId);

        this.dayDetails.innerHTML = `
            <h2>Day Details</h2>
            <p>${this.formatDate(date)}</p>
            <div class="json-view">${JSON.stringify(dayData, null, 2)}</div>
        `;

        // // Reattach help button event listener
        // const helpButton = this.dayDetails.querySelector(".help-button");
        // helpButton.addEventListener("click", () => {
        //     document.getElementById("help-modal").classList.add("active");
        // });

        // Handle mobile view
        if (window.matchMedia("(max-width: 768px)").matches) {
            document.querySelector("aside").classList.add("active");
            document.querySelector(".mobile-overlay").classList.add("active");
        }
    }
    // updateDayDetails(date) {
    //     this.selectedDate = date;
    //     const dateId = this.formatDateId(date);
    //     const dayData = this.calendarData[dateId] || {};
    //
    //     this.dayDetails.innerHTML = `
    //         <h2>Day Details</h2>
    //         <p>${this.formatDate(date)}</p>
    //         <div class="json-view">${JSON.stringify(dayData, null, 2)}</div>
    //     `;
    //
    //     // Reattach help button event listener
    //     const helpButton = this.dayDetails.querySelector(".help-button");
    //     helpButton.addEventListener("click", () => {
    //         document.getElementById("help-modal").classList.add("active");
    //     });
    //
    //     // Handle mobile view
    //     if (window.matchMedia("(max-width: 768px)").matches) {
    //         document.querySelector("aside").classList.add("active");
    //         document.querySelector(".mobile-overlay").classList.add("active");
    //     }
    // }
}

// Initialize the calendar
new Calendar();
