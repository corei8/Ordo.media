from flask import Flask
from flask import render_template

app = Flask(__name__)


@app.route("/")
def calendar():
    return render_template("base.html", title="Calendar")
