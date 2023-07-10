from flask import Flask
from flask import redirect
from flask import url_for
from flask import render_template
from flask import request
import ordotools
from printcalendar import PrintCalendar
from datetime import datetime
from flask_minify import Minify, decorators as minify_decorators

app = Flask(__name__)
Minify(app=app, passive=True)


@app.route("/")
@minify_decorators.minify(html=True, js=True, cssless=True)
def home():
    """
    Eventually, have the home page be a proper landing page.
    """
    year = int(datetime.today().strftime("%Y"))
    month = datetime.today().strftime("%B")
    return redirect(
        url_for("calendar", year=year, month=month)
    )

@app.route("/get_month", methods=("GET", "POST"))
@minify_decorators.minify(html=True, js=True, cssless=True)
def get_month():
    if request.method == 'POST':
        year = request.form['year']
        month = request.form['month']
        if not year:
            year = datetime.today().strftime("%Y")
        return redirect(
            url_for("calendar", year=year, month=month)
        )
    else:
        return redirect(url_for('home'))

@app.route("/<year>/<month>", methods=("GET", "POST"))
@minify_decorators.minify(html=True, js=True, cssless=True)
def calendar(year, month):
    months = [
        "January", "February", "March", "April",
        "May", "June", "July", "August", "September",
        "October", "November", "December"
    ]
    # TODO: add "next" and "previous" buttons to the picker
    raw = ordotools.LiturgicalCalendar(year=int(year), diocese="roman").build()
    data = PrintCalendar(month, raw).build_month
    months.remove(month)
    return render_template(
        "calendar.html",
        title="Calendar",
        month=month,
        year=year,
        data=data,
        months=months,
    )
