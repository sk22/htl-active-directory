"use strict";
var ActiveDirectory = require('activedirectory');

const methods = connection => ({
  getGroupMembership: username => new Promise(((resolve, reject) => {
    connection.getGroupMembershipForUser(username, function(err, groups) {
      if (err) {
        return reject(err);
      }
      if (groups) {
        const regex = /cn=([^,]+)/i
        /* Die Gruppennamen lauten cn=....,ou=,..,ou=... Wir möchten nur den cn (common name) */
        return resolve(groups
          .map(group => group.dn)
          .filter(dn => dn && dn.match(regex) && dn.match(regex)[1])
          .map(dn => dn.match(regex)[1]))
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
      return resolve(methods(ad))
    }
  });
})


module.exports = htlActiveDirectory;
