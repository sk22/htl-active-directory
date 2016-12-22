# htlActiveDirectory
Erlaubt über das Paket activedirectory den Zugriff auf das Active Directory von htl-wien5.schule. Der Zugriff erfolgt auf den Domänencontroller htl-wien5.schule. Dieser ist nur innerhalb des Schulnetzwerkes oder über VPN erreichbar.

## Methoden und Properties
```
login (username:string, password:string, onSuccess:function (), onError:function (message:string));

getGroupMembership (username.string, onSuccess:function(groups:string[]), onError:function(message:string));

getUsersOfGroup (groupName:string, onSuccess:function(users:json[]), onError:function(message:string));

adInstance:object Originalinstanz der ActiveDirectory Klasse des Moduls activedirectory;
```
Detaillierte Methodenbeschreibungen sind in den Quellcodekommentaren.


## Beispielcode
Es wird empfohlen, die Ausgabe mit `node testscript.js > ausgabe.txt` umzuleiten, da die Textmenge recht groß ist.

```javascript
var htlAd = require("./htl_active_directory.class");
var sentUsername = "user";
var sentPassword = "***";

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
```
