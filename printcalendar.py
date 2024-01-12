import datetime
import ephem

def get_moons_in_year(year: int):
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

def moon_phase(date):
    moons = get_moons_in_year(int(date.strftime('%Y')))
    the_moons = {key.split(" ")[0]: val for key, val in moons.items()}
    if date.strftime("%Y/%-m/%-d") in the_moons.keys():
        return the_moons[date.strftime("%Y/%-m/%-d")]
    else:
        return ''

class PrintCalendar:
    def __init__(self, month, data):
        self.data = data
        self.month = month

    @property
    def build_month(self):
        """
        Build a single month of the calendar.
        """
        month = [[]]
        i = 0
        row = 0
        for feast in self.data:
            if feast.date.strftime("%B") == self.month:
                if not month[0]:
                    if int(feast.date.strftime("%w")) != 0:
                        pre_blanks = int(feast.date.strftime("%w"))
                        for y in range(pre_blanks):
                            month[row].append([])
                            i += 1
                month[row].append({int(feast.date.strftime("%d").lstrip("0")): feast})
                last = 6-int(feast.date.strftime("%w"))
                i += 1
                if i % 7 == 0:
                    month.append([])
                    row += 1
        for x in range(last):
            month[-1].append([])

        return month

    @property
    def json_year(self):
        year = {}
        for feast in self.data:
            year |= {str(feast.date).split(' ')[0]:{
                'name':feast.feast,
                'rank':feast.rank_v,
                'color':feast.color,
                'moon-phase':moon_phase(feast.date),
            }
                     }

        return year
