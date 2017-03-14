var functions = require('firebase-functions');

// // Start writing Firebase Functions
// // https://firebase.google.com/functions/write-firebase-functions
//

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

 exports.helloWorld = functions.https.onRequest((request, response) => {
   console.log("helloworld console");
  response.send("Hello from Firebase!");
 })


 exports.helloWorld2 = functions.https.onRequest((request, response) => {
   const aaa = {kkk:"kkk",ddd:"ddd"};
   console.log("helloworld console2", aaa);
  response.send("Hello from Firebase!");
 })


 exports.set_hello_value = functions.https.onRequest((request, response) => {

  const text = request.query.text;
  admin.database().ref('/hello').set(text).then(snapshot => {
    response.send(text + " is added on message");
  });
 })

exports.hello_monitor = functions.database.ref('/hello')
    .onWrite(event => {
      // Only edit data when it is first created.
      const previous_value = event.data.previous;
      console.log("previous value is ", previous_value);

      const next_value = event.data.val();
      console.log('next_value', next_value);
      return;
    });








// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.addMessage = functions.https.onRequest((req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push it into the Realtime Database then send a response
  admin.database().ref('/messages').push({original: original}).then(snapshot => {
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    // res.redirect(303, snapshot.ref);

    response.send(original + " is added on message");
  });
});



// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
exports.makeUppercase = functions.database.ref('/messages/{pushId}/original')
    .onWrite(event => {
      // Grab the current value of what was written to the Realtime Database.
      const original = event.data.val();
      console.log('Uppercasing', event.params.pushId, original);
      const uppercase = original.toUpperCase();
      // You must return a Promise when performing asynchronous tasks inside a Functions such as
      // writing to the Firebase Realtime Database.
      // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
      return event.data.ref.parent.child('uppercase').set(uppercase);
    });

