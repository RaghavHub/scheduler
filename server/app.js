const express = require('express');
const path = require('path');
var cors = require('cors')
var http = require('http')
var moment = require('moment')
const app = express();
// var firebase = require("firebase");
// // Initialize Firebase
// var config = {
//     apiKey: "AIzaSyDbDfC0qYtARyuVwdjZpYgf38oa4pxn86k",
// authDomain: "scheduler-8e978.firebaseapp.com",
// databaseURL: "https://scheduler-8e978.firebaseio.com",
// projectId: "scheduler-8e978",
// storageBucket: "scheduler-8e978.appspot.com",
// messagingSenderId: "631086422217"
// };
// firebase.initializeApp(config);

const port = process.env.PORT || 5000;
var threshold=1;
var connection = require('express-myconnection');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "db",
    port: '/tmp/mysql.sock'
});

app.use(cors()); 
app.use(express.json()); 

app.get('/', function (req, res, next) {
    var query = JSON.parse(req.query.selection)
    var select_query = "SELECT * from schedule " + recordToCondition(query);
    if (query['date'] == null) {
        var today = new Date();
        var threshold = new Date();
        threshold.setDate(today.getDate() - this.threshold)
        select_query = select_query + " AND \`date\`<=" + moment(today).format('YYYYMMDD') + " AND \`date\`>=" + moment(threshold).format('YYYYMMDD')
    }
    execute_query(select_query,res);
});

app.get('/getFields/', function (req, res, next) {
    if (req.body!=null){
        var query = JSON.parse(req.query.selection)
        var select_query = "SELECT DISTINCT"+querytoFieldlist(query) + "from schedule "
        console.log(select_query)
        execute_query(select_query, res);
    }
});

app.post('/', function(req,res){
    if (req.body != null){
    var data = req.body
    var fields = new Array()
    var values = new Array()
    for (var name in data) {
    if(data[name]!= null && data[name]!=''){
        console.log("data" + data[name])
        fields.push("\`" + name + "\`" )
        values.push("\'"+data[name]+"\'")
    }
    }
    var select_query = "INSERT INTO schedule (" + fields.toString() + ") VALUES(" + values.toString() + ")"
    console.log(select_query)
 
    execute_query(select_query,res);
}
});

app.post('/threshold/', function (req, res) {
    if (req.body != null) {
        console.log(req.body);
       this.threshold = parseInt(JSON.parse(req.body));
    }
});

app.post('/update/', function(req,res) {
    if (req.body != null) {
        var data = req.body
        var values=[];
        select_query = 'UPDATE schedule SET'
        for (var name in data){
            values.push(" \`" + name + "\` = \'" + data[name] + "\' ");
        }
        select_query =select_query+values.toString()+' WHERE \`id\` = '+data['id']
        console.log(select_query)
        execute_query(select_query, res);
        }
    })

app.post('/delete/', function (req, res) {
    if (req.body != null) {
        var data = req.body
        var select_query = 'DELETE FROM schedule '+ recordToCondition(data)
        console.log(select_query)
        execute_query(select_query, res);
    }
})

app.get('/id/',function(req,res) {
    select_query = 'SELECT MAX(\`id\`) FROM schedule'
    execute_query(select_query, res); 
})

//goal
app.get('/goal/', function (req, res, next) {
    var query = JSON.parse(req.query.selection)
    var select_query = "SELECT * from goal_schedule " + recordToCondition(query);
    // if (query['date'] == null) {
    //     var today = new Date();
    //     var threshold = new Date();
    //     threshold.setDate(today.getDate() - this.threshold)
    //     select_query = select_query + " AND \`date\`<=" + moment(today).format('YYYYMMDD') + " AND \`date\`>=" + moment(threshold).format('YYYYMMDD')
    // }
    execute_query(select_query, res);
});

app.get('/goal/getFields/', function (req, res, next) {
    if (req.body != null) {
        var query = JSON.parse(req.query.selection)
        var select_query = "SELECT DISTINCT" + querytoFieldlist(query) + "from goal_schedule "
        console.log(select_query)
        execute_query(select_query, res);
    }
});

app.post('/goal/', function (req, res) {
    if (req.body != null) {
        var data = req.body
        var fields = new Array()
        var values = new Array()
        for (var name in data) {
            if (data[name] != null && data[name] != '') {
                console.log("data" + data[name])
                fields.push("\`" + name + "\`")
                values.push("\'" + data[name] + "\'")
            }
        }
        var select_query = "INSERT INTO goal_schedule (" + fields.toString() + ") VALUES(" + values.toString() + ")"
        console.log(select_query)

        execute_query(select_query, res);
    }
});

app.post('/goal/threshold/', function (req, res) {
    if (req.body != null) {
        console.log(req.body);
        this.threshold = parseInt(JSON.parse(req.body));
    }
});

app.post('/goal/update/', function (req, res) {
    if (req.body != null) {
        var data = req.body
        var values = [];
        select_query = 'UPDATE goal_schedule SET'
        for (var name in data) {
            values.push(" \`" + name + "\` = \'" + data[name] + "\' ");
        }
        select_query = select_query + values.toString() + ' WHERE \`id\` = ' + data['id']
        console.log(select_query)
        execute_query(select_query, res);
    }
})

app.post('/goal/delete/', function (req, res) {
    if (req.body != null) {
        var data = req.body
        var select_query = 'DELETE FROM goal_schedule ' + recordToCondition(data)
        console.log(select_query)
        execute_query(select_query, res);
    }
})

app.get('/goal/id/', function (req, res) {
    select_query = 'SELECT MAX(\`id\`) FROM goal_schedule'
    execute_query(select_query, res);
})

function execute_query(st,res){
    connection.query(st, function (error, results, fields) {
        if (error) console.log(error);
        else {
            res.header("Access-Control-Allow-Origin", "*");
            res.send(JSON.stringify(results));
        }
    });
}

function recordToCondition(record){
    var cond_query='';
    var con;
    var i =0;
    for (var name in record) {
        if(record[name]!=null && record[name]!=''){
            if (i > 0) {
                con = 'AND'
            }
            else if (i == 0) {
                con = 'WHERE'
            }
            q = con + " \`" + name + "\` = \'" + record[name] + "\' "
            cond_query = cond_query + q
            i = i + 1;
        }
    }
    return cond_query
}

function querytoFieldlist(query){
    var field_list = ""
    var i = 0
    var cond =""
    for (var name in query){
        if (i >0){
            cond =",";
        }
        field_list = field_list +cond+" \`"+query[name]+"\` "
    }
    return field_list;
}


if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, 'client/build')));

    // Handle React routing, return all requests to React app
    app.get('*', function (req, res) {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}

app.listen(port, () => console.log(`Listening on port ${port}`));