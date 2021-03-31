import time
import requests
import json
from flask import Flask, request, render_template, jsonify

from google.cloud import datastore

datastore_client = datastore.Client()

def new_user(userid):
    entity = datastore.Entity(key=datastore_client.key('user', userid))

    datastore_client.put(entity)

def store_favorite(userid, favorite_id, favorite_coords):
    key = datastore_client.key('user', userid)

    user = datastore_client.get(key)

    user[favorite_id] = favorite_coords

    datastore_client.put(user)

# def store_favorite(userid, favorite_id, favorite_coords):
#     entity = datastore.Entity(key=datastore_client.key('user', userid))
#     entity.update({
#         favorite_id: favorite_coords
#     })

#     datastore_client.put(entity)

def fetch_user_favorite(userid, favorite):
    key = datastore_client.key('user', userid)

    user = datastore_client.get(key)

    location = user[favorite]
    return location


app = Flask(__name__)


@app.route('/')
def root():
    loc = fetch_user_favorite('1', '2')
    print(loc)
    # return render_template('index.html', times=dummy_times)
    return render_template('index.html', user=1, location=loc)
    

## Given a user, pickup, and destination return estimates for ride options
@app.route('/estimate', methods=['POST'])
def post_estimate():
    data = request.args
    user = data['bitstring'][0]
    pickup_id = data['bitstring'][1]
    destination_id = data['bitstring'][2]

    pickup = fetch_user_favorite(user, pickup_id)
    destination = fetch_user_favorite(user, destination_id)
    # pickup = '51.4700223,-0.4542955'
    # destination = '51.501737,-0.108588'
    now = time.time()
    request_time = int(now) + 100

    payload = {'pickup': pickup, 'destination': destination, 'date': request_time}
    quotes = requests.post('https://api.taxicode.com/booking/quote', params=payload, verify=False)
    quotes_data = quotes.json()['quotes']

    # build up to best 3 options, starting with just one

    cheapest_price = quotes_data[list(quotes_data.keys())[0]]['price']
    cheapest_quote = list(quotes_data.keys())[0]
    print(cheapest_price)
    print(cheapest_quote)
    for quote in quotes_data:
        if quotes_data[quote]['price'] < cheapest_price:
            cheapest_quote = quote
    print(cheapest_quote)
    return jsonify(quotes_data[cheapest_quote])

@app.route('/new_user', methods=['POST'])
def add_user():
    data = request.args
    user_id = data['userid']
    new_user(user_id)
    for favorite_id in data:
        if favorite_id != 'userid':
            store_favorite(user_id, favorite_id, data[favorite_id])
    return jsonify(data)

@app.route('/update_favorites', methods=['POST'])
def update_favorites():
    data = request.args
    user_id = data['userid']
    for favorite_id in data:
        if favorite_id != 'userid':
            store_favorite(user_id, favorite_id, data[favorite_id])
    return jsonify(data)

@app.route('/fetch_favorite', methods=['POST'])
def return_favorite():
    data = request.args
    user = data['bitstring'][0]
    favorite_id = data['bitstring'][1]
    favorite_loc = fetch_user_favorite(user, favorite_id)
    return jsonify({favorite_id: favorite_loc})
    
if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    # Flask's development server will automatically serve static files in
    # the "static" directory. See:
    # http://flask.pocoo.org/docs/1.0/quickstart/#static-files. Once deployed,
    # App Engine itself will serve those files as configured in app.yaml.
    app.run(host='127.0.0.1', port=8080, debug=True)