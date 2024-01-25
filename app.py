from flask import Flask
from flask import render_template
import ordotools
from printcalendar import PrintCalendar
from datetime import datetime
from flask_minify import Minify, decorators as minify_decorators


app = Flask(__name__)
Minify(app=app, passive=True)


@app.route("/")
@minify_decorators.minify(html=True, js=True, cssless=True)
def home():
    year = int(datetime.today().strftime("%Y"))
    month = datetime.today().strftime("%B")
    raw = []
    for y in range(year-1,year+1):
        raw.extend(ordotools.LiturgicalCalendar(year=y, diocese="roman").build())
    data = PrintCalendar(month, raw).json_year
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
