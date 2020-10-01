from flask import Flask,jsonify
from flask_restful import Api, Resource, reqparse
from flask_cors import CORS
from flask_mysqldb import MySQL
import json

app = Flask(__name__)
api = Api(app)

# MySQL user here
app.config['MYSQL_USER'] = 'db_user'
# password for above user here
app.config['MYSQL_PASSWORD'] = 'user_pass'
app.config['MYSQL_HOST'] = 'localhost'
# database here
app.config['MYSQL_DB'] = 'db_name'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

mysql = MySQL(app)

CORS(app)

class Subscription(Resource):
    
    def get(self, endpoint):
        return "This is not a valid GET method", 403

    def post(self, endpoint):
        # global cursor
        parser = reqparse.RequestParser()
        parser.add_argument("auth")
        parser.add_argument("key")
        args = parser.parse_args()
        cursor = mysql.connection.cursor()
        cursor.execute('''CREATE TABLE if not exists subscription(
            id int(11) NOT NULL,
            urlEndpoint text NOT NULL,
            PRIMARY KEY(id))''')

        qryInsert = cursor.execute('''INSERT INTO subscription (urlEndpoint, auth, p256dh)
            VALUES ('{0}', '{1}', '{2}')'''.format(endpoint,args["auth"],args["key"]))
        if qryInsert:
            # user = {"url": endpoint, "auth": args["auth"], "p256dh": args["key"]}
            mysql.connection.commit()
            # return user
            return 'Insertion Succeeded.'
        else:
            return 'Endpoint insertion failed.', 500

    def put(self, endpoint):
        return "Put method is not supported.", 400

    def delete(self, endpoint):
        cursor = mysql.connection.cursor()
        cursor.execute('''DELETE FROM subscription WHERE urlEndpoint='{}' '''.format(endpoint))
        mysql.connection.commit()
        return "{} is deleted.".format(endpoint), 200

api.add_resource(Subscription, "/api/endpoint/<string:endpoint>")

@app.route("/api/subscriptions/", methods=['GET'])
def index():
    cursor = mysql.connection.cursor()
    cursor.execute('''CREATE TABLE if not exists subscription(
        id int(11) NOT NULL,
        urlEndpoint text NOT NULL,
        PRIMARY KEY(id))''')
    
    cursor.execute('''SELECT * FROM subscription''')
    results = cursor.fetchall()
    # print(results)
    return json.dumps(results)

if __name__ == '__main__':
  app.run(debug=True)
