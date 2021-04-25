import requests

payload = {'pickup': '51.4700223,-0.4542955', 'destination': '51.501737,-0.108588', 'date': '1617892990'}
quotes = requests.post('https://api.taxicode.com/booking/quote', params=payload, verify=False)
print(quotes.json())