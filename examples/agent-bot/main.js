'use strict';

/*
 * This demo extends MyCoolAgent with the specific reply logic:
 *
 * 1) Echo any new message from the consumer
 * 2) Close the conversation if the consumer message starts with '#close'
 *
 */

const MyCoolAgent = require('./MyCoolAgent');
// Example 1: sets up service wrapper, sends initial message, and
// receives response.

var ConversationV1 = require('watson-developer-cloud/conversation/v1');

// Set up Conversation service wrapper.
var conversation = new ConversationV1({
  username: 'XXXXXX', // replace with username from service key
  password: 'XXXXXX', // replace with password from service key
  path: { workspace_id: 'XXXXXXX' }, // replace with workspace ID
  version_date: '2016-07-11'
});

const echoAgent = new MyCoolAgent({
    accountId: process.env.LP_ACCOUNT,
    username: process.env.LP_USER,
    password: process.env.LP_PASS,
    // For internal lp only use
    //  export LP_CSDS=hc1n.dev.lprnd.net
    csdsDomain: process.env.LP_CSDS
});

var context = {}

function processResponse(err, response) {
  if (err) {
    console.error(err); // something went wrong
    return;
  }

  // If an intent was detected, log it out to the console.
  if (response.intents.length > 0) {
    console.log('Detected intent: #' + response.intents[0].intent);
  }

  // Display the output from dialog, if any.
  if (response.output.text.length != 0) {
      console.log(response.output.text[0]);
      context = response.context;
      echoAgent.publishEvent({
                  dialogId: contentEvent.dialogId,
                  event: {
                      type: 'ContentEvent',
                      contentType: 'text/plain',
                      message: response.output.text[0]
                  }
              });
  }
 }

echoAgent.on('MyCoolAgent.ContentEvnet',(contentEvent)=>{
    if (contentEvent.message.startsWith('#close')) {
        echoAgent.updateConversationField({
            conversationId: contentEvent.dialogId,
            conversationField: [{
                    field: "ConversationStateField",
                    conversationState: "CLOSE"
                }]
        });
    } else {
        conversation.message({
              input: { text: contentEvent.message },
              context : context,
            }, function (err, response) {
                 if (err) {
                   console.error(err); // something went wrong
                   return;
                 }

                 // If an intent was detected, log it out to the console.
                 if (response.intents.length > 0) {
                   console.log('Detected intent: #' + response.intents[0].intent);
                 }

                 // Display the output from dialog, if any.
                 if (response.output.text.length != 0) {
                     console.log(response.output.text[0]);
                     context = response.context;
                     echoAgent.publishEvent({
                                 dialogId: contentEvent.dialogId,
                                 event: {
                                     type: 'ContentEvent',
                                     contentType: 'text/plain',
                                     message: response.output.text[0]
                                 }
                             });
                 }
                })
    }
});
