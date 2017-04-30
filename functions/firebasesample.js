var functions = require('firebase-functions');
require('@google-cloud/debug-agent').start();
const admin = require('firebase-admin');


const firebase_sample = {};

 firebase_sample.helloWorld = functions.https.onRequest((request, response) => {
   console.log("helloworld console");
  response.send("Hello from Firebase!");
 })


 firebase_sample.helloWorld2 = functions.https.onRequest((request, response) => {
   const aaa = {kkk:"kkk",ddd:"ddd"};
   console.log("helloworld console2", aaa);
  response.send("Hello from Firebase!");
 })


 firebase_sample.set_hello_value = functions.https.onRequest((request, response) => {

  const text = request.query.text;
  admin.database().ref('/hello').set(text).then(snapshot => {
    response.send(text + " is added on message");
  });
 })

firebase_sample.hello_monitor = functions.database.ref('/hello')
    .onWrite(event => {
      // Only edit data when it is first created.
      const next_value = event.data.val();
      console.log('next_value', next_value);
      
      if(event.data.previous.exists()){
        console.log("previous value is ", event.data.previous.val());
        console.log("event", event);
      }
      return;
    });



firebase_sample.joinroom_que_monitor = functions.database.ref('/event_related/join_room_que/{room_name}/{user_id}')
    .onWrite(event => {
      // Only edit data when it is first created.
      if(!event.data.exists()){
        return;
      }
      setTimeout(()=>{
        const room_que_ref = event.data.ref;
        room_que_ref.set(null);
      },10);
      return;
    });



// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
firebase_sample.addMessage = functions.https.onRequest((req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  if(!original){
    res.send( "no message");
  }
  // Push it into the Realtime Database then send a response
  admin.database().ref('/messages').push({original: original}).then(snapshot => {
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    // res.redirect(303, snapshot.ref);

    res.send(original + " is added on message");
  });
});



// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
firebase_sample.makeUppercase = functions.database.ref('/messages/{pushId}/original')
    .onWrite(event => {
      // Grab the current value of what was written to the Realtime Database.
      if(!event.data.exists()){
        return;
      }
      const original = event.data.val();
      console.log('Uppercasing', event.params.pushId, original);
      const uppercase = original.toUpperCase();
      // You must return a Promise when performing asynchronous tasks inside a Functions such as
      // writing to the Firebase Realtime Database.
      // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
      return event.data.ref.parent.child('uppercase').set(uppercase);
    });




firebase_sample.eventparticipate_monitor = functions.database.ref('/event_related/event/{event_id}/participants/{user_id}')
    .onWrite(event => {
      console.log("user participate event with userid " + event.params.user_id  + " event id " +  event.params.event_id);
      const user_event_ref = "/users/my_event/" + event.params.user_id + "/" + event.params.event_id;
      const participate_value = event.data.val()
      console.log("participate_value is" + participate_value);

      let user_event_data = null;
      if(!event.data.exists()){
        console.log("no data for user participant");
        set_data(user_event_ref, null);
      }else{
        const event_starttime_ref = "/event_related/event/" + event.params.event_id + "/date_time_start";
        return admin.database().ref(event_starttime_ref).once("value", (snapshot)=>{
          const start_time = snapshot.val();
          console.log("start time is", start_time);
          if(participate_value && start_time){
            user_event_data = {
              type:participate_value,
              date_time_start: start_time
            }
          }
          set_data(user_event_ref, user_event_data)
        })
      }
    });

function set_data(ref, data){
    console.log(ref);
    console.log(data);
    return admin.database().ref(ref).set(data).then((snapshot) => {
      console.log("data is set" + ref + " - " + data);
      return;
    }).catch(()=>{
      console.log("saving data fail" + ref + " - " + data);
      return;
    });
}


module.exports = firebase_sample;