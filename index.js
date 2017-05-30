// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;

var databaseUri = process.env.DATABASE_URI || process.env.MONGOLAB_URI

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var pushConfig = {};

if (process.env.GCM_SENDER_ID && process.env.GCM_API_KEY) {
    pushConfig['android'] = { senderId: process.env.GCM_SENDER_ID || '',
                              apiKey: process.env.GCM_API_KEY || ''};
}

if (process.env.APNS_ENABLE) {
    pushConfig['ios'] = [
        {
            pfx: __dirname + 'StudyBuddiesCertificates.p12', // P12 file only
            cert: __dirname + 'StudyBuddiesCert.pem', // If not using the .p12 format, the path to the certificate PEM to load from disk
            key: __dirname + 'StudyBuddiesKey.unencrypted.pem', // If not using the .p12 format
            bundleId: 'Connect.Ltd.StudyExchange',  // change to match bundleId
            production: false // dev certificate
        }
    ]
}


var filesAdapter = null;  // enable Gridstore to be the default
if (process.env.S3_ENABLE) {
    var S3Adapter = require('parse-server').S3Adapter;

    filesAdapter = new S3Adapter(
        process.env.AWS_ACCESS_KEY,
        process.env.AWS_SECRET_ACCESS_KEY,
        {bucket: process.env.AWS_BUCKET_NAME, bucketPrefix: "", directAccess: true}
    );
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://heroku_l5ndx25b:7jfk31a6mc7jt97f6sjptunosg@ds149711.mlab.com:49711/heroku_l5ndx25b',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || '5768943567465827355793846',
  masterKey: process.env.MASTER_KEY || 'SaeedBrunelAuc03121993Drenchula', //Add your master key here. Keep it secret!
   push: {
		android: {
			senderId: '704699964050', // The Sender ID of GCM
			apiKey: 'AIzaSyDwyBCBb68adTv0OhtxE9wps5P435KjT_g' // The Server API Key of GCM
		},
    ios: [
      {
        pfx: __dirname + '/StudyBuddiesCertificates.p12', // Dev PFX or P12
        bundleId: 'Connect.Ltd.StudyExchange',
        production: false // Dev
      },
      {
        pfx: __dirname + '/ProductionStudyBuddy.p12',
      bundleId: 'Connect.Ltd.StudyExchange',
      production: true // Dev
      }
    ]
  },
  //filesAdapter: filesAdapter,
  verbose: true,
  serverURL: process.env.SERVER_URL || 'https://studyexchange.herokuapp.com/parse'  // needed for Parse Cloud and push notifications
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a web site.');
});

var port = process.env.PORT || 1337;
app.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});
