import time
import requests
import json
from flask import Flask, request, render_template, jsonify
from math import cos, asin, sqrt, pi
import numpy as np


from google.cloud import datastore

datastore_client = datastore.Client()

def new_user(userid):
    entity = datastore.Entity(key=datastore_client.key('user', userid))

    datastore_client.put(entity)

def initialize_user(userid):
    key = datastore_client.key('user', userid)
    user = datastore_client.get(key)

    for index in range(4, 10):
        user[str(index)] = user['1']
    user['place_types'] = dict()
    ## Initialize dict for type preferences 
    user['type_preferences'] = {'accounting' : 0, 
    'airport' : 0, 
    'amusement_park' : 0, 
    'aquarium'  : 0, 
    'art_gallery'   : 0, 
    'atm'   : 0, 
    'bakery'    : 0, 
    'bank'  : 0, 
    'bar'   : 0, 
    'beauty_salon'  : 0, 
    'bicycle_store' : 0, 
    'book_store'    : 0, 
    'bowling_alley' : 0, 
    'bus_station'   : 0, 
    'cafe'  : 0, 
    'campground'    : 0, 
    'car_dealer'    : 0, 
    'car_rental'    : 0, 
    'car_repair'    : 0, 
    'car_wash'  : 0, 
    'casino'    : 0, 
    'cemetery'  : 0, 
    'church'    : 0, 
    'city_hall' : 0, 
    'clothing_store'    : 0, 
    'convenience_store' : 0, 
    'courthouse'    : 0, 
    'dentist'   : 0, 
    'department_store'  : 0, 
    'doctor'    : 0, 
    'drugstore' : 0, 
    'electrician'   : 0, 
    'electronics_store' : 0, 
    'establishment' : 0, 
    'embassy'   : 0, 
    'fire_station'  : 0, 
    'food'  : 0, 
    'florist'   : 0, 
    'funeral_home'  : 0, 
    'furniture_store'   : 0, 
    'gas_station'   : 0, 
    'gym'   : 0, 
    'hair_care' : 0, 
    'hardware_store'    : 0, 
    'hindu_temple'  : 0, 
    'home_goods_store'  : 0, 
    'hospital'  : 0, 
    'insurance_agency'  : 0, 
    'jewelry_store' : 0, 
    'laundry'   : 0, 
    'lawyer'    : 0, 
    'library'   : 0, 
    'light_rail_station'    : 0, 
    'liquor_store'  : 0, 
    'local_government_office'   : 0, 
    'locksmith' : 0, 
    'lodging'   : 0, 
    'meal_delivery' : 0, 
    'meal_takeaway' : 0, 
    'mosque'    : 0, 
    'movie_rental'  : 0, 
    'movie_theater' : 0, 
    'moving_company'    : 0, 
    'museum'    : 0, 
    'night_club'    : 0, 
    'painter'   : 0, 
    'park'  : 0, 
    'parking'   : 0, 
    'pet_store' : 0, 
    'pharmacy'  : 0, 
    'physiotherapist'   : 0, 
    'plumber'   : 0, 
    'police'    : 0, 
    'point_of_interest' : 0,
    'post_office'   : 0, 
    'primary_school'    : 0, 
    'real_estate_agency'    : 0, 
    'restaurant'    : 0, 
    'roofing_contractor'    : 0, 
    'rv_park'   : 0, 
    'school'    : 0, 
    'secondary_school'  : 0, 
    'shoe_store'    : 0, 
    'shopping_mall' : 0, 
    'spa'   : 0, 
    'stadium'   : 0, 
    'storage'   : 0, 
    'store' : 0, 
    'subway_station'    : 0, 
    'supermarket'   : 0, 
    'synagogue' : 0, 
    'taxi_stand'    : 0, 
    'tourist_attraction'    : 0, 
    'train_station' : 0, 
    'transit_station'   : 0, 
    'travel_agency' : 0, 
    'university'    : 0, 
    'veterinary_care'   : 0, 
    'zoo'   : 0 }

    datastore_client.put(user)


def store_favorite(userid, favorite_id, favorite_coords):
    key = datastore_client.key('user', userid)
    user = datastore_client.get(key)

    user[favorite_id] = favorite_coords

    datastore_client.put(user)

def store_place(userid, nearby_id, nearby_coords, nearby_types):
    key = datastore_client.key('user', userid)

    user = datastore_client.get(key)

    user[nearby_id] = nearby_coords
    user['place_types'][nearby_id] = nearby_types
    datastore_client.put(user)

def set_current_trip(userid, pickup, destination, pickup_id, destination_id):
    key = datastore_client.key('user', userid)

    user = datastore_client.get(key)

    user['current_pickup'] = pickup
    user['current_destination'] = destination
    user['current_pickup_id'] = pickup_id
    user['current_destination_id'] = destination_id

    
    datastore_client.put(user)

def fetch_current_trip(userid):
    key = datastore_client.key('user', userid)

    user = datastore_client.get(key)

    pickup = user['current_pickup']
    destination = user['current_destination']
    return pickup, destination

def fetch_user_favorite(userid, favorite):
    key = datastore_client.key('user', userid)

    user = datastore_client.get(key)

    location = user[favorite]
    return location

def update_recents(userid):
    key = datastore_client.key('user', userid)
    user = datastore_client.get(key)

    user['6'] = user['5']
    user['5'] = user['4']
    user['4'] = user['current_pickup']
    user['9'] = user['8']
    user['8'] = user['7']
    user['7'] = user['current_destination']
    datastore_client.put(user)

def update_type_preferences(userid):
    key = datastore_client.key('user', userid)
    user = datastore_client.get(key)

    current_pickup_id = user['current_pickup_id']
    current_destination_id = user['current_destination_id']
    
    if current_pickup_id in user['place_types']:
        pickup_types = user['place_types'][current_pickup_id]
        for location_type in pickup_types:
            user['type_preferences'][location_type] += 1
    if current_destination_id in user['place_types']:
        destination_types = user['place_types'][current_destination_id]
        for location_type in destination_types:
            user['type_preferences'][location_type] += 1
    datastore_client.put(user)

    return user['type_preferences']
    ## have a dictionary with index for each type of place, keep a count

def retrieve_type_preferences(userid):
    key = datastore_client.key('user', userid)
    user = datastore_client.get(key)

    most_visited_type = 'below'
    max_type_count = 2

    for type_count in user['type_preferences']:
        if user['type_preferences'][type_count] > max_type_count:
            max_type_count = user['type_preferences'][type_count]
            most_visited_type = type_count

    return most_visited_type


## Returns KM between two points
def distance(lat1, lon1, lat2, lon2):
    p = pi/180
    a = 0.5 - cos((lat2-lat1)*p)/2 + cos(lat1*p) * cos(lat2*p) * (1-cos((lon2-lon1)*p))/2
    return 12742 * asin(sqrt(a)) #2*R*asin...


def displace(lat, lng, theta, distance):
    """
    Displace a LatLng theta degrees counterclockwise and some
    meters in that direction.
    Notes:
        http://www.movable-type.co.uk/scripts/latlong.html
        0 DEGREES IS THE VERTICAL Y AXIS! IMPORTANT!
    Args:
        theta:    A number in degrees.
        distance: A number in meters.
    Returns:
        A new LatLng.
    """

    E_RADIUS = 6371000
    theta = np.float32(theta)

    delta = np.divide(np.float32(distance), np.float32(E_RADIUS))

    def to_radians(theta):
        return np.divide(np.dot(theta, np.pi), np.float32(180.0))

    def to_degrees(theta):
        return np.divide(np.dot(theta, np.float32(180.0)), np.pi)

    theta = to_radians(theta)
    lat1 = to_radians(lat)
    lng1 = to_radians(lng)

    lat2 = np.arcsin( np.sin(lat1) * np.cos(delta) +
                      np.cos(lat1) * np.sin(delta) * np.cos(theta) )

    lng2 = lng1 + np.arctan2( np.sin(theta) * np.sin(delta) * np.cos(lat1),
                              np.cos(delta) - np.sin(lat1) * np.sin(lat2))

    lng2 = (lng2 + 3 * np.pi) % (2 * np.pi) - np.pi

    return str(to_degrees(lat2)) + ", " + str(to_degrees(lng2))

app = Flask(__name__)



def circle_places(API_key, lat, lng, angle, radius, place_type):
    places_results = list()
    while angle < 360:
        location = displace(lat, lng, angle, radius)
        payload = {'key': API_key, 'location': location, 'radius': radius, 'type': place_type}
        places = requests.post('https://maps.googleapis.com/maps/api/place/nearbysearch/json', params=payload, verify=False)
        places_results = places_results + places.json()['results']
        angle = angle + 90
    return places_results

def store_select_places(results, nearby_places, nearby_id, cutoff_radius, user_id):
    for place in results:
        lat = place['geometry']['location']['lat']
        lng = place['geometry']['location']['lng']
        is_close = False
        for existing_place in nearby_places:
            if distance(lat, lng, existing_place['lat'], existing_place['lng']) < cutoff_radius:
                is_close = True
                break
        if not is_close:
            nearby_places.append({'key': nearby_id, 'lat': lat, 'lng': lng, 'name': place['name'], 'address': place['vicinity']})
            lat_lng = str(lat) + ',' + str(lng)
            store_place(user_id, str(nearby_id), lat_lng, place['types'])
            nearby_id = nearby_id + 1
    return nearby_places, nearby_id

@app.route('/')
def root():
    loc = fetch_user_favorite('1', '2')
    # return render_template('index.html', times=dummy_times)
    return render_template('index.html', user=1, location=loc)
    

## Given a user, pickup, and destination return estimates for ride options
@app.route('/estimate', methods=['POST'])
def post_estimate():
    data = request.args
    mapping = data['bitstring'][0]
    user = data['bitstring'][1]
    if mapping == '0':
        pickup_id = data['bitstring'][2]
        destination_id = data['bitstring'][3]
    elif mapping == '1':
        pickup_id = data['bitstring'][2:4]
        destination_id = data['bitstring'][4]
    elif mapping == '2':
        pickup_id = data['bitstring'][2]
        destination_id = data['bitstring'][3:5]
    elif mapping == '3':
        pickup_id = data['bitstring'][2:4]
        destination_id = data['bitstring'][4:6]

    pickup = fetch_user_favorite(user, pickup_id)
    destination = fetch_user_favorite(user, destination_id)
    set_current_trip(user, pickup, destination, pickup_id, destination_id)
    # pickup = '52.207524, 0.146521'
    # destination = '52.040747, 0.034666'
    now = time.time()
    request_time = int(now) + 100

    payload = {'pickup': pickup, 'destination': destination, 'date': request_time}
    quotes = requests.post('https://api.taxicode.com/booking/quote', params=payload, verify=False)
    quotes_data = quotes.json()['quotes']

    # build up to best 3 options, starting with just one

    # I would like company_name, company_phone, company_site, rating[score] and for each option price, name, passengers, and class

    cheapest_price = quotes_data[list(quotes_data.keys())[0]]['price']
    cheapest_quote = list(quotes_data.keys())[0]
    for quote in quotes_data:
        if quotes_data[quote]['price'] < cheapest_price:
            cheapest_quote = quote
    quotes_response = dict()

    company = quotes_data[cheapest_quote]
    quotes_response['company_data'] = {'company_name': company['company_name'], 'company_phone': company['company_phone'], 'company_site': company['company_site'], 'score': company['rating']['score']}
    
    quotes_response['options'] = list()
    option_classes = dict()
    for option in company['vehicles']:
        passengers = option['passengers']
        luxury_class = option['class']
        if passengers in option_classes:
            if not luxury_class in option_classes[passengers]:
                option_classes[passengers].append(luxury_class)
                quotes_response['options'].append({'price': option['price'], 'name': option['name'], 'passengers': option['passengers'], 'class': option['class']})
        else:
            option_classes[passengers] = list()
            option_classes[passengers].append(luxury_class)
            quotes_response['options'].append({'price': option['price'], 'name': option['name'], 'passengers': option['passengers'], 'class': option['class']})


    return jsonify(quotes_response)

@app.route('/confirm', methods=['POST'])
def confirm_ride():
    data = request.args
    user = data['bitstring'][0]
    update_recents(user)
    type_preferences = update_type_preferences(user)
    return jsonify(type_preferences)

@app.route('/new_user', methods=['POST'])
def add_user():
    data = request.args
    user_id = data['userid']
    new_user(user_id)
    for favorite_id in data:
        if favorite_id != 'userid':
            store_favorite(user_id, favorite_id, data[favorite_id])

    initialize_user(user_id)
    return jsonify(data)

@app.route('/update_favorites', methods=['POST'])
def update_favorites():
    data = request.args
    user_id = data['userid']
    for favorite_id in data:
        if favorite_id != 'userid':
            store_favorite(user_id, favorite_id, data[favorite_id])
    return jsonify(data)

@app.route('/update_fav', methods=['POST'])
def update_favorite():
    data = request.args
    user_id = data['userid']
    favorite_id = data['favoriteid']
    address = data['address']
    API_key = 'AIzaSyAbbexhr2VEHaP9eJklCx1502RcM5au-3Y'
    payload = {'address': address, 'key': API_key}
    response = requests.post('https://maps.googleapis.com/maps/api/geocode/json', params=payload, verify=False)
    geocode = response.json()
    lat = geocode['results'][0]['geometry']['location']['lat']
    lng = geocode['results'][0]['geometry']['location']['lng']
    lat_lng = str(lat) + ',' + str(lng)
    store_favorite(user_id, favorite_id, lat_lng)
    # return jsonify(geocode)
    return jsonify({'latitude': lat, 'longitude': lng})

@app.route('/fetch_favorite', methods=['POST'])
def return_favorite():
    data = request.args
    user = data['bitstring'][0]
    favorite_id = data['bitstring'][1]
    favorite_loc = fetch_user_favorite(user, favorite_id)
    return jsonify({favorite_id: favorite_loc})

## Get nearby places for user
## Takes in user_id + lat/lng and makes query to google places api
## stores location of places in datastore and returns locations, names, and ids to frontend
@app.route('/fetch_places', methods=['POST'])
def nearby_places():
    data = request.args
    user_id = data['userid']
    location = data['location']
    API_key = 'AIzaSyAbbexhr2VEHaP9eJklCx1502RcM5au-3Y'
    radius = 1690 ## 1 mile
    place_type = 'point_of_interest'

    split_location = location.split(",")
    lat = float(split_location[0])
    lng = float(split_location[1])

    most_visited_type = retrieve_type_preferences(user_id)
    ## Get results for most_visited_type first
    if most_visited_type != 'below':
        most_one_mile = circle_places(API_key, lat, lng, 0, 1690, most_visited_type)
        most_two_miles = circle_places(API_key, lat, lng, 45, 3380, most_visited_type)
        most_four_miles = circle_places(API_key, lat, lng, 0, 6760, most_visited_type)
        most_eight_miles = circle_places(API_key, lat, lng, 45, 13520, most_visited_type)
    one_mile = circle_places(API_key, lat, lng, 0, 1690, place_type)
    two_miles = circle_places(API_key, lat, lng, 45, 3380, place_type)
    four_miles = circle_places(API_key, lat, lng, 0, 6760, place_type)
    eight_miles = circle_places(API_key, lat, lng, 45, 13520, place_type)
    airport_results = circle_places(API_key, lat, lng, 0, 40560, 'airport')

    nearby_id = 10
    nearby_places = list()
    if most_visited_type != 'below':    
        nearby_places, nearby_id = store_select_places(most_one_mile, nearby_places, nearby_id, .5, user_id)
        nearby_places, nearby_id = store_select_places(most_two_miles, nearby_places, nearby_id, 1, user_id)
        nearby_places, nearby_id = store_select_places(most_four_miles, nearby_places, nearby_id, 2, user_id)
        nearby_places, nearby_id = store_select_places(most_eight_miles, nearby_places, nearby_id, 4, user_id)
    nearby_places, nearby_id = store_select_places(one_mile, nearby_places, nearby_id, .5, user_id)
    nearby_places, nearby_id = store_select_places(two_miles, nearby_places, nearby_id, 1, user_id)
    nearby_places, nearby_id = store_select_places(four_miles, nearby_places, nearby_id, 2, user_id)
    nearby_places, nearby_id = store_select_places(eight_miles, nearby_places, nearby_id, 4, user_id)
    nearby_places, nearby_id = store_select_places(airport_results, nearby_places, nearby_id, 2, user_id)
    
    return jsonify(nearby_places)

if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    # Flask's development server will automatically serve static files in
    # the "static" directory. See:
    # http://flask.pocoo.org/docs/1.0/quickstart/#static-files. Once deployed,
    # App Engine itself will serve those files as configured in app.yaml.
    app.run(host='127.0.0.1', port=8080, debug=True)