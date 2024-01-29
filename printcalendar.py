import datetime
import ephem

def get_moons_in_year(year):
    moons={}
    date=ephem.Date(datetime.date(year,1,1))
    while date.datetime().year==year:
        date=ephem.next_full_moon(date)
        moons |= {str(date):"🌕"}
    date=ephem.Date(datetime.date(year,1,1))
    while date.datetime().year==year:
        date=ephem.previous_first_quarter_moon(date)
        moons |= {str(date):"🌓"}
    date=ephem.Date(datetime.date(year,1,1))
    while date.datetime().year==year:
        date=ephem.previous_last_quarter_moon(date)
        moons |= {str(date):"🌗"}
    date=ephem.Date(datetime.date(year,1,1))
    while date.datetime().year==year:
        date=ephem.next_new_moon(date)
        moons |= {str(date):"🌑"}
    return moons


class PrintCalendar:
    def __init__(self, month: str, years: list, data):
        self.data = data
        self.month = month
        # self.years = years
        self.moons = {}
        for year in years:
            self.moons |= {key: val for key, val in get_moons_in_year(year).items()}

    def moon_phase(self, date):
        the_moons = {key.split(" ")[0]: val for key, val in self.moons.items()}
        if date.strftime("%Y/%-m/%-d") in the_moons.keys():
            return the_moons[date.strftime("%Y/%-m/%-d")]
        else:
            return ''

    @property
    def json_year(self):
        return {
            str(feast.date).split(' ')[0]: {
                'name':feast.feast,
                'rank':feast.rank_v,
                'color':feast.color,
                'moon-phase': self.moon_phase(feast.date),
            } for feast in self.data
        }
