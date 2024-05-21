# from flask import errorhandler
from datetime import datetime
from flask import Flask
from flask import render_template
from flask import send_file
from flask_minify import Minify, decorators as minify_decorators
from printcalendar import PrintCalendar
from werkzeug.exceptions import BadRequest
import ordotools


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
    raw = ()
    for y in range(year-2,year+2):
        raw += ordotools.LiturgicalCalendar(year=y, diocese="roman", language="la").build()
    data = PrintCalendar(month, [year-1, year, year+1], raw).json_year
    return render_template(
        "calendar.html",
        title="Calendar",
        month=month,
        year=year,
        data=data,
        ordotools_version="v0.0.34-alpha"
    )

@app.route("/<int:year>", methods=("GET", "POST"))
def get_year(year):
    # TODO: handle dates that are out of range.
    # TODO: maybe we can have an alert system for bad dates that merely flashes...
    yr = int(year)
    raw = ordotools.LiturgicalCalendar(year=yr, diocese="roman", language="la").build()
    data = PrintCalendar("", [yr], raw).json_year
    return data

@app.errorhandler(BadRequest)
def handle_bad_request(e):
    return render_template(
        "404.html"
    ), 404
