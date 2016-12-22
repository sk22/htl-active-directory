# htlActiveDirectory
Erlaubt über das Paket activedirectory den Zugriff auf das Active Directory von htl-wien5.schule. Der Zugriff erfolgt auf den Domänencontroller htl-wien5.schule. Dieser ist nur innerhalb des Schulnetzwerkes oder über VPN erreichbar.

## Installation
1. `git clone https://github.com/schletz/htlActiveDirectory`
2. npm Install
3. `node test.js username password`

<a name="HtlActiveDirectory"></a>

## HtlActiveDirectory
**Kind**: global class  

* [HtlActiveDirectory](#HtlActiveDirectory)
    * [new HtlActiveDirectory()](#new_HtlActiveDirectory_new)
    * [.login(username, password, onSuccess, onError)](#HtlActiveDirectory+login)
    * [.getGroupMembership(username, onSuccess, onError)](#HtlActiveDirectory+getGroupMembership)
    * [.getUsersOfGroup(groupName, onSuccess, onError)](#HtlActiveDirectory+getUsersOfGroup)

<a name="new_HtlActiveDirectory_new"></a>

### new HtlActiveDirectory()
Führt Abfragen im Active Directory von htl-wien5.schule durch.

**Example**  
```js
var htlAd = require("./htl_active_directory.class");
```
<a name="HtlActiveDirectory+login"></a>

### htlActiveDirectory.login(username, password, onSuccess, onError)
Prüft, ob der übergebene Benutzernamen und das Passwort korrekt sind, indem eine 
Authentifizierung im AD versucht wird.

**Kind**: instance method of <code>[HtlActiveDirectory](#HtlActiveDirectory)</code>  

| Param | Type | Description |
| --- | --- | --- |
| username | <code>string</code> | Der Username ohne Prefixe wie Domainnamen (einfach in der Form ABC12345  übergeben) |
| password | <code>string</code> | Das Passwort im Klartext. |
| onSuccess | <code>function</code> | Wird aufgerufen, wenn das Login erfolgreich war. |
| onError | <code>function</code> | Wird aufgerufenb, wenn das Login nicht erfolgreich war. message kann "INVALID_ARGUMENTS", "LOGIN_FAILED" oder "SERVER_ERROR" sein. |

**Example**  
```js
htlAd.login(sentUsername, sentPassword,
   // onSuccess bei Login
   function () {
       console.log("Login OK.");
   },
   // onError bei Login 
  function (message, innerMessage) {
      console.log(message, innerMessage);
  }
```
<a name="HtlActiveDirectory+getGroupMembership"></a>

### htlActiveDirectory.getGroupMembership(username, onSuccess, onError)
Liefert alle Gruppen, in der der übergebene User Mitglied ist. Dieser User muss nicht der eigene
User sein. Eine Suche ohne Login (anonym) ist jedoch durch die Rechteeinstellungen im AD nicht
möglich. 
Meistens wird der User seine eigenen Gruppenmitgliedschaften heraussuchen, d. h. ein login wird
mit den übermittelten Userdaten durchgeführt. Danach werden von diesem User die Gruppen 
herausgesucht.

**Kind**: instance method of <code>[HtlActiveDirectory](#HtlActiveDirectory)</code>  

| Param | Type | Description |
| --- | --- | --- |
| username | <code>string</code> |  |
| onSuccess | <code>function</code> | Liefert ein Array mti allen Gruppenmitgliedschaften. |
| onError | <code>function</code> | Liefert "NOT_CONNECTED", "SERVER_ERROR" oder "USER_UNKNOWN" |

**Example**  
```js
htlAd.getUsersOfGroup("AlleLehrende",
           // onSuccess
           function (userlist) {
               console.log("Members von AlleLehrende", userlist);
          },
           // onError
           function (message) {
               console.log(message);
           });
```
<a name="HtlActiveDirectory+getUsersOfGroup"></a>

### htlActiveDirectory.getUsersOfGroup(groupName, onSuccess, onError)
Listet alle User, die Mitglied der angegebenen Gruppe sind.

**Kind**: instance method of <code>[HtlActiveDirectory](#HtlActiveDirectory)</code>  

| Param | Type | Description |
| --- | --- | --- |
| groupName | <code>string</code> | Gruppenname ohne cn und ou. |
| onSuccess | <code>function</code> | JSON Array mit allen Details zu den Userobjekten. Am  interessantesten ist das dn Property, es gibt den eindeutigen Usernamen an. |
| onError | <code>function</code> | Liefert "SERVER_ERROR" oder "GROUP_UNKNOWN" |

