from flask import Flask
from flask import render_template
from flask import send_file
import ordotools
from printcalendar import PrintCalendar
from datetime import datetime
from flask_minify import Minify, decorators as minify_decorators


app = Flask(__name__)
Minify(app=app, passive=True)

@app.route("/manifest.json")
def serve_manifest():
    return send_file('manifest.json', mimetype="application/manifest+json")

@app.route("/")
@minify_decorators.minify(html=True, js=True, cssless=True)
def home():

    year = int(datetime.today().strftime("%Y"))
    month = datetime.today().strftime("%B")
    raw = []

    for y in range(year-2,year+2):
        raw.extend(ordotools.LiturgicalCalendar(year=y, diocese="roman").build())
    data = PrintCalendar(month, [year-1, year, year+1], raw).json_year
    return render_template(
        "calendar.html",
        title="Calendar",
        month=month,
        year=year,
        data=data,
        ordotools_version="v0.0.30-alpha"
    )

@app.route("/<int:year>", methods=("GET", "POST"))
def get_year(year):
    yr = int(year)
    raw = ordotools.LiturgicalCalendar(year=yr, diocese="roman").build()
    data = PrintCalendar("", [yr], raw).json_year
    return data
