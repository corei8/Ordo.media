# from flask import errorhandler
from datetime import datetime
from datetime import date
from flask import Flask
from flask import render_template
from flask import send_file
from flask_minify import Minify, decorators as minify_decorators
from printcalendar import PrintCalendar
from werkzeug.exceptions import BadRequest
import ordotools


def ordotools_version():
    with open("./requirements.txt", "r") as f:
        for line in f:
            if "ordotools" in line:
                version = line.split("==")[1].strip()
                return version

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
        raw += ordotools.LiturgicalCalendar(year=y, diocese="roman", language="la").build()
    data = PrintCalendar(month, [year-1, year, year+1], raw).json_year
    return render_template(
        "calendar.html",
        title="Calendar",
        month=month,
        year=year,
        data=data,
        ordotools_version=ordotools_version()
    )


##################################################################################
## APIs -- some super simple implementations
##################################################################################

def api_array_return(feast):
    return [
        feast.name,
        feast.color
    ]

@app.route("/<int:year>-<int:month>-<int:day>/<diocese>_<language>")
def day_api(year, month, day, diocese="roman", language="la"):
    all_dates = ordotools.LiturgicalCalendar(year=year, diocese=diocese, language=language).build()
    day_of_year = date(year, month, day).timetuple().tm_yday
    return api_array_return(all_dates[day_of_year])

@app.route("/today/<diocese>_<language>")
def today_api(diocese="roman", language="la"):
    today = datetime.today()
    day_of_year = today.timetuple().tm_yday
    all_dates = ordotools.LiturgicalCalendar(year=today.year, diocese=diocese, language=language).build()
    return api_array_return(all_dates[day_of_year])

@app.route("/<int:year>")
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
