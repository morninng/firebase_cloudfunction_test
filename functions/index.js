var functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);


var firebase_sample = require('./firebasesample.js');



exports.helloWorld = firebase_sample.helloWorld;
exports.helloWorld2 = firebase_sample.helloWorld2;
exports.set_hello_value = firebase_sample.set_hello_value;
exports.hello_monitor = firebase_sample.hello_monitor;
exports.addMessage = firebase_sample.addMessage;
exports.makeUppercase = firebase_sample.makeUppercase;





