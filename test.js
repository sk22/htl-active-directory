/*jslint node white */
"use strict";

if (typeof process.argv[2] !== "string" || typeof process.argv[3] !== "string") {
    throw "Ungültiger Aufruf. Syntax: node test.js username passwort.";
}

var HtlActiveDirectory = require("./htl_active_directory");
var htlAd = new HtlActiveDirectory();

var sentUsername = process.argv[2];
var sentPassword = process.argv[3];

htlAd.login(sentUsername, sentPassword,
    /* onSuccess bei Login */
    function () {
        console.log("Login OK.");
        /* Hier können auch Gruppenmitgliedschaften anderer User gesucht werden. Das AD schränkt dieses
         * nicht ein. */
        htlAd.getGroupMembership(sentUsername,
            /* onSuccess */
            function (groups) {
                console.log("Gruppen des Users: ", groups);
            },
            /* onError */
            function (message) {
                console.log(message);
            });

        console.log("Welche Member hat die Gruppe AlleLehrende?");
        htlAd.getUsersOfGroup("AlleLehrende",
            /* onSuccess von getUsersOfGroup */
            function (userlist) {
                console.log("Members von AlleLehrende", userlist);
            },
            /* onError von getUsersOfGroup */
            function (message) {
                console.log(message);
            });

        /* Mit adInstance können wir alle Funktionen der ActiveDirectory Klasse nutzen.
         * Doku siehe https://www.npmjs.com/package/activedirectory */
        console.log("Detaillierte Infos zum übermittelten User");
        /* Das geht auch bei jedem anderen User */
        htlAd.adInstance.findUser(sentUsername, function (err, user) {
            if (user) {
                console.log(user);
            }
        });
    },
    /* onError bei Login */
    function (message, innerMessage) {
        console.log(message, innerMessage);
    }
);
