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
        for x in self.data:
            if x.strftime("%B") == self.month:
                if not month[0]:
                    if int(x.strftime("%w")) != 0:
                        pre_blanks = int(x.strftime("%w"))
                        for y in range(pre_blanks):
                            month[row].append([])
                            i += 1
                    else:
                        pass
                month[row].append({int(x.strftime("%d").lstrip("0")): self.data[x]})
                last = 6-int(x.strftime("%w"))
                i += 1
                if i % 7 == 0:
                    month.append([])
                    row += 1
                else:
                    pass
        for x in range(last):
            month[-1].append([])

        return month
