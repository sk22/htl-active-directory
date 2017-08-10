"use strict";

const Prompt = require('prompt-password')
const htlActiveDirectory = require("./htl_active_directory");

if (process.argv.length < 2) throw new Error('Username expected')

var username = process.argv[2];

var prompt = new Prompt({
  type: 'password',
  message: `Password for user ${username}? `,
  name: 'password'
});

prompt.run().then(password => {
  htlActiveDirectory(username, password).then(session => {
    console.log("Login OK.");
    /* Hier können auch Gruppenmitgliedschaften anderer User gesucht werden. Das AD schränkt dieses
     * nicht ein. */
    session.getGroupMembership(username,
      /* onSuccess */
      function(groups) {
        console.log("Gruppen des Users: ", groups);
      },
      /* onError */
      function(message) {
        console.log(message);
      });

    console.log("Welche Member hat die Gruppe AlleLehrende?");
    session.getUsersOfGroup("AlleLehrende",
      /* onSuccess von getUsersOfGroup */
      function(userlist) {
        console.log("Members von AlleLehrende", userlist);
      },
      /* onError von getUsersOfGroup */
      function(message) {
        console.log(message);
      });

    /* Mit adInstance können wir alle Funktionen der ActiveDirectory Klasse nutzen.
     * Doku siehe https://www.npmjs.com/package/activedirectory */
    console.log("Detaillierte Infos zum übermittelten User");
    /* Das geht auch bei jedem anderen User */
    session.adInstance.findUser(username, function(err, user) {
      if (user) {
        console.log(user);
      }
    });
  }).catch(err => console.error('An error occured', err))
})