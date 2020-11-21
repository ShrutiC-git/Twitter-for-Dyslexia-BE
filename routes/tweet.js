var express = require('express');
const bodyParser = require('body-parser');
const { request } = require('http');
const multer = require('multer');
var upload = multer({ dest: __dirname + '/public/uploads/' });
var type = upload.single('audio_file.mp3');
const fs = require('fs');


var tweet_route = express.Router();
tweet_route.use(bodyParser.json())
tweet_route.use(bodyParser.urlencoded({ extended: true }));



tweet_route.route("/")

    .post((req, res, next) => {
        console.log(req);
        const fs = require('fs');
        const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1');
        const { IamAuthenticator } = require('ibm-watson/auth');

        const textToSpeech = new TextToSpeechV1({
            authenticator: new IamAuthenticator({ apikey: '' }),
            serviceUrl: ''
        });

        const paramst2s = {
            text: req.body.text,
            voice: 'en-US_AllisonVoice', // Optional voicec
            accept: 'audio/wav'
        };

        // Synthesize speech, correct the wav header, then save to disk
        // (wav header requires a file length, but this is unknown until after the header is already generated and sent)
        // note that `repairWavHeaderStream` will read the whole stream into memory in order to process it.
        // the method returns a Promise that resolves with the repaired buffer
        textToSpeech
            .synthesize(paramst2s)
            .then(response => {
                const audio = response.result;
                return textToSpeech.repairWavHeaderStream(audio);
            })
            .then(repairedFile => {
                fs.writeFileSync('audio.wav', repairedFile);
                console.log('audio.wav written with a corrected wav header');
            })
            .catch(err => {
                console.log(err);
            });

        res.statusCode = 200;
        res.contentType = 'text/plain'
        res.send('This is working');
        console.log('Lets see if we got results')
    })


tweet_route.route('/speechtotext')

    .post(type, (req, res, next) => {
        console.log('okay')
        console.log('The file is ', req.file);

        const { IamAuthenticator } = require('ibm-watson/auth');
        const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');

        const speechToText = new SpeechToTextV1({
            authenticator: new IamAuthenticator({ apikey: 'i0xHingmfg8GUXQpu5uGl1zeWglHzmonnOsro4DqN5r6' }),
            serviceUrl: 'https://api.us-south.speech-to-text.watson.cloud.ibm.com/instances/998ca5f9-e981-4dc5-8faa-6841e8a63dae'
        });
        console.log('the audio file is downlaoded');

        /*   const params = {
              // From file
  
              audio: 'D:/node_projects/twitter-test-server/audio.wav',
              contentType: 'audio/mp3'
          }; */


        /* fs.createReadStream('../twitter-test-server/audio.wav') */
        fs.createReadStream(req.file.path)
            .pipe(speechToText.recognizeUsingWebSocket({ contentType: 'audio/mp3' }))
            .pipe(fs.createWriteStream('./transcription.txt'));

        /*         speechToText.recognize(params)
                    .then(response => {
                        console.log(JSON.stringify(response.result, null, 2));
        
                    })
        
                    .catch(err => {
                        console.log(err);
                    }); */

    })

/* tweet_route.route('/speechtotext')
    .post((req, res, next) => {
        const fs = require('fs');
        const { IamAuthenticator } = require('ibm-watson/auth');
        const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');

        const speechToText = new SpeechToTextV1({
            authenticator: new IamAuthenticator({ apikey: 'i0xHingmfg8GUXQpu5uGl1zeWglHzmonnOsro4DqN5r6' }),
            serviceUrl: 'https://api.us-south.speech-to-text.watson.cloud.ibm.com/instances/998ca5f9-e981-4dc5-8faa-6841e8a63dae'
        });

        const params = {
            // From file
            audio: req.data,
            contentType: 'audio/mp3'
        }; 

               speechToText.recognize(params)
                   .then(response => {
                        console.log(JSON.stringify(response.result, null, 2));
        
                    })
        
                    .catch(err => {
                        console.log(err);
                    });
         
        // or streaming
        console.log(req.body)
        var file = new File([req.body.recording],'audio.mp3')
        fs.createReadStream(file)
            .pipe(speechToText.recognizeUsingWebSocket({ contentType: 'audio/mp3' }))
            .pipe(fs.createWriteStream('./transcription.txt')); 

        res.statusCode = 200;
        res.contentType = 'text/plain'
        res.send('This is working');
        console.log('the request made was ', req.body)
        console.log(' we got results?: ')
    })
 */



/* 
Create a secondary hit from within the bacend to this api end
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');

const nlu = new NaturalLanguageUnderstandingV1({
    authenticator: new IamAuthenticator({ apikey: '' }),
    version: '2018-04-05',
    serviceUrl: ''
});

nlu.analyze(
    {
      text:paramst2s.text, // Buffer or String
      features: {
          entities:{
              sentiment:true
          },
        concepts: {},
        keywords: {
            sentiment:true,
            emotion:true
        }
      }
    })
    .then(response => {
      console.log(JSON.stringify(response.result, null, 2));
    })
    .catch(err => {
      console.log('error: ', err);
    }); */

module.exports = tweet_route