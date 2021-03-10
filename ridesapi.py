from flask import Flask, json

companies = [{"id": 1, "name": "Company One"}, {"id": 2, "name": "Company Two"}]

estimateResponse = [{
  "fare": {
    "value": 5.73,
    "fare_id": "d30e732b8bba22c9cdc10513ee86380087cb4a6f89e37ad21ba2a39f3a1ba960", # the fare id is key for the request
    "expires_at": 1476953293,
    "display": "$5.73",
    "currency_code": "USD",
    "breakdown": [
     {
       "type": "promotion",
       "value": -2.00,
       "name": "Promotion"
     },
     {
       "type": "base_fare",
       "notice": "Fares are slightly higher due to increased demand",
       "value": 7.73,
       "name": "Base Fare"
     }
   ]
  },
  "trip": {
    "distance_unit": "mile",
    "duration_estimate": 540,
    "distance_estimate": 2.39
  },
  "pickup_estimate": 2
}]

requestsResponse = [{
   "request_id": "852b8fdd-4369-4659-9628-e122662ad257",
   "product_id": "a1111c8c-c720-46c3-8534-2fcdd730040d",
   "status": "processing",
   "vehicle": None,
   "driver": None,
   "location": None,
   "eta": 5,
   "surge_multiplier": None
}]

api = Flask(__name__)

@api.route('/companies', methods=['GET'])
def get_companies():
  return json.dumps(companies)

@api.route('/', methods=['GET'])
def get_comp():
  return json.dumps(companies)

@api.route('/estimate', methods=['POST'])
def post_estimate():
  return json.dumps(estimateResponse)

@api.route('/requests', methods=['POST'])
def post_requests():
  return json.dumps(requestsResponse)

if __name__ == '__main__':
    api.run(debug=True)