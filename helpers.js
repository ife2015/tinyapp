const findUserByEmail = function(userDatabase, useremail) {
  for (let userId in userDatabase) {
    if (useremail === userDatabase[userId].email) { 
      return userDatabase[userId];
      //userId;
      //userDatabase[userId];
    }
  }
  return false; 
  //return undefined;
};

module.exports = findUserByEmail;