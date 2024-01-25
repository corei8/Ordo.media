from flask import Flask
from flask import render_template
import ordotools
from printcalendar import PrintCalendar
from datetime import datetime
from flask_minify import Minify, decorators as minify_decorators

import time
import sys


app = Flask(__name__)
Minify(app=app, passive=True)



@app.route("/")
@minify_decorators.minify(html=True, js=True, cssless=True)
def home():
    start = time.time()
    year = int(datetime.today().strftime("%Y"))
    month = datetime.today().strftime("%B")
    raw = []
    algo_start = time.time()
    for y in range(year-1,year+1):
        raw.extend(ordotools.LiturgicalCalendar(year=y, diocese="roman").build())
    algo_end = time.time()
    algo_elapse = algo_end - algo_start
    print(f"Algorithm completed in {algo_elapse:.2f} seconds", file=sys.stderr)
    data_start = time.time()
    data = PrintCalendar(month, raw).json_year
    data_end = time.time()

    data_elapse = data_end - data_start
    print(f"Data formatting completed in {data_elapse:.2f} seconds", file=sys.stderr)
    end = time.time()
    elapse = end-start
    print(f"Request completed in {elapse:.2f} seconds", file=sys.stderr)
    return render_template(
        "calendar.html",
        title="Calendar",
        month=month,
        year=year,
        data=data,
    )

@app.route("/<int:year>", methods=("GET", "POST"))
def get_year(year):
    yr = int(year)
    raw = ordotools.LiturgicalCalendar(year=yr, diocese="roman").build()
    data = PrintCalendar("", raw).json_year
    return data
