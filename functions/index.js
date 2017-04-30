var functions = require('firebase-functions');


var client_secret = require('./secret/client_secret_messagingproject.js');

var google = require('googleapis');
var googleAuth = require('google-auth-library');
var SCOPES = ['https://www.googleapis.com/auth/calendar'];

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);


var firebase_sample = require('./firebasesample.js');



exports.helloWorld = firebase_sample.helloWorld;
exports.helloWorld2 = firebase_sample.helloWorld2;
exports.set_hello_value = firebase_sample.set_hello_value;
exports.hello_monitor = firebase_sample.hello_monitor;
exports.addMessage = firebase_sample.addMessage;
exports.makeUppercase = firebase_sample.makeUppercase;
exports.joinroom_que_monitor = firebase_sample.joinroom_que_monitor;

exports.get_auth_url = functions.https.onRequest((req, res) => {

    console.log("client_secret", client_secret);
    console.log("client_secret.installed", client_secret.installed);
    if(!client_secret || !client_secret.installed){
        res.send("client_secret cannot be found");
        return;
    }
    var clientSecret = client_secret.installed.client_secret;
    console.log("clientSecret", clientSecret);
    var clientId = client_secret.installed.client_id;
    console.log("clientId", clientId);
    var redirectUrl = client_secret.installed.redirect_uris[0];
    console.log("redirectUrl", redirectUrl);
    if(!clientId || !clientSecret || !redirectUrl){
        res.send("client_secret is not proper");
        return;
    }
    var auth = new googleAuth();
    const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    res.send("auth url : " + authUrl );

});


exports.store_token = functions.https.onRequest((req, res)=>{


    const token_code = req.query.token;


    var clientSecret = client_secret.installed.client_secret;
    console.log("clientSecret", clientSecret);
    var clientId = client_secret.installed.client_id;
    console.log("clientId", clientId);
    var redirectUrl = client_secret.installed.redirect_uris[0];
    console.log("redirectUrl", redirectUrl);
    if(!clientId || !clientSecret || !redirectUrl){
        res.send("client_secret is not proper");
        return;
    }
    var auth = new googleAuth();
    const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
    oauth2Client.getToken(token_code, function(err, token_store) {
        if (err) {
            console.log('Error while trying to retrieve access token', err);
            return;
        }
        console.log("token", token_store);

        const token_ref = "/admin/google_token/";

        admin.database().ref(token_ref).set(token_store).then(
            () => {
                console.log("token is saved");
                res.send("token is saved");
                return;
            }).catch(()=>{
                console.log("saving token is failed");
                res.send("saving token is failed");
                return;
        });

    });

});



exports.listEvents = functions.https.onRequest((req, res)=>{

    var clientSecret = client_secret.installed.client_secret;
    console.log("clientSecret", clientSecret);
    var clientId = client_secret.installed.client_id;
    console.log("clientId", clientId);
    var redirectUrl = client_secret.installed.redirect_uris[0];
    console.log("redirectUrl", redirectUrl);
    if(!clientId || !clientSecret || !redirectUrl){
        res.send("client_secret is not proper");
        return;
    }
    var auth = new googleAuth();
    const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });

    const token_ref = "/admin/google_token/";
    admin.database().ref(token_ref).once("value", 
        (token_snapshot)=> {
            const token = token_snapshot.val()
            console.log("token", token);
            if(!token){
                res.send("no token exist");
                return;
            }
            console.log("oauth2Client", oauth2Client);
            oauth2Client.credentials = token;
            listEvents_execute(req, res, oauth2Client);
        },
        (error)=>{
            res.send("token retrieve error");
            return;
        });
});


function listEvents_execute(req, res, auth){

  var calendar = google.calendar('v3');
  calendar.events.list({
    auth: auth,
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime'
  }, (err, response) => {
    if (err) {
      console.log('The API returned an error: ' + err);
      res.send('The calendar API returned an error: ')
      return;
    }
    var events = response.items;
    if (events.length == 0) {
      console.log('No upcoming events found.');
      res.send('No upcoming events found.');
      return;
    } else {
      console.log('Upcoming 10 events:');
      for (var i = 0; i < events.length; i++) {
        var event = events[i];
        var start = event.start.dateTime || event.start.date;
        console.log('%s - %s', start, event.summary);
      }
      res.send('Upcoming 10 events:' + JSON.stringify(events));
      return;
    }
  });


}




