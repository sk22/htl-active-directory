"use strict";
var ActiveDirectory = require('activedirectory');

const methods = connection => ({
  getGroupMembership: username => new Promise(((resolve, reject) => {
    connection.getGroupMembershipForUser(username, function(err, groups) {
      var groupArray = [];
      if (err) {
        return reject(err);
      }
      if (groups) {
        /* Die Gruppennamen lauten cn=....,ou=,..,ou=... Wir möchten nur den cn (common name) */
        groups.forEach(function(val) {
          try {
            var matches = val.dn.match(/cn=([^,]+)/i);
            if (matches !== null && typeof matches[1] === "string") {
              groupArray.push(matches[1]);
            }
          } catch (e) {
            return;
          }
        });
        return resolve(groupArray);
      } else {
        return reject(new Error("USER_UNKNOWN"));
      }
    });
  })),
  getUsersOfGroup: groupName => new Promise((resolve, reject) => {
    if (typeof groupName !== "string") {
      return reject(new Error("INVALID_ARGUMENTS"));
    }

    connection.getUsersForGroup(groupName, function(err, users) {
      if (err) {
        return reject(err);
      }
      if (users) {
        return resolve(users);
      } else {
        return reject(new Error("GROUP_UNKNOWN"));
      }
    });
  })
})

const htlActiveDirectory = (username, password) => new Promise((resolve, reject) => {
  if (typeof username !== "string" || typeof password !== "string") {
    return reject(new Error("INVALID_ARGUMENTS"))
  }

  const ad = new ActiveDirectory({
    url: 'ldaps://htl-wien5.schule',
    baseDN: 'DC=htl-wien5,DC=schule',
    /* Wichtig für LDAPS, da wir unbekannten Root CAs (der Domäne) vertrauen müssen */
    tlsOptions: {
      requestCert: true,
      rejectUnauthorized: false
    },
    /* Diese Daten werden für getGroupMembership verwendet. Beim Usernamen muss immer 
     * @htl-wien5.schule für ein ldap bind angehängt werden. */
    username: username + "@htl-wien5.schule",
    password: password
  });
  
  /* Wir prüfen die Logindaten schon vorher, somit können wir das Login und das Suchen der
   * Gruppenmitgliedschaft trennen */
  ad.authenticate(username + "@htl-wien5.schule", password, function(err, auth) {
    if (err !== null) {
      if (err.toString().indexOf("InvalidCredentialsError") !== -1) {
        return reject(new Error("LOGIN_FAILED"));
      } else {
        return reject(err);
      }
    }
    if (auth) {
      console.log(auth)
      return resolve(methods(ad))
    }
  });
})

/**
 * Prüft, ob der übergebene Benutzernamen und das Passwort korrekt sind, indem eine 
 * Authentifizierung im AD versucht wird. 
 * 
 * @param {string} username Der Username ohne Prefixe wie Domainnamen (einfach in der Form ABC12345 
 * übergeben)
 * @param {string} password Das Passwort im Klartext.
 * @param {function()} onSuccess Wird aufgerufen, wenn das Login erfolgreich war.
 * @param {function(message:string, innerException:object)} onError Wird aufgerufen, wenn das Login
 * nicht erfolgreich war. message kann "INVALID_ARGUMENTS", "LOGIN_FAILED" oder "SERVER_ERROR" sein.
 * @example
 * htlAd.login(sentUsername, sentPassword,
 *    // onSuccess bei Login
 *    function () {
 *        console.log("Login OK.");
 *    },
 *    // onError bei Login 
 *   function (message, innerMessage) {
 *       console.log(message, innerMessage);
 *   }
 */


/**
 * Liefert alle Gruppen, in der der übergebene User Mitglied ist. Dieser User muss nicht der eigene
 * User sein. Eine Suche ohne Login (anonym) ist jedoch durch die Rechteeinstellungen im AD nicht
 * möglich. 
 * Meistens wird der User seine eigenen Gruppenmitgliedschaften heraussuchen, d. h. ein login wird
 * mit den übermittelten Userdaten durchgeführt. Danach werden von diesem User die Gruppen 
 * herausgesucht.
 * 
 * @param {string} username
 * @param {function(string[])} onSuccess Liefert ein Array mit allen Gruppenmitgliedschaften.
 * @param {function(string)} onError Liefert "NOT_CONNECTED", "SERVER_ERROR" oder "USER_UNKNOWN"
 * @example
 * htlAd.getUsersOfGroup("AlleLehrende",
 *            // onSuccess
 *            function (userlist) {
 *                console.log("Members von AlleLehrende", userlist);
 *           },
 *            // onError
 *            function (message) {
 *                console.log(message);
 *            });
 */

/**
 * Listet alle User, die Mitglied der angegebenen Gruppe sind.
 * 
 * @param {string} groupName Gruppenname ohne cn und ou.
 * @param {function(json[])} onSuccess JSON Array mit allen Details zu den Userobjekten. Am 
 * interessantesten ist das dn Property, es gibt den eindeutigen Usernamen an.
 * @param {function(string)} onError Liefert "SERVER_ERROR" oder "GROUP_UNKNOWN"
 */

module.exports = htlActiveDirectory;