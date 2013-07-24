exports.show = function(req, res){
  //console.log(req.session);
  res.render('profile', { title: 'Commons', user: req.session.passport.user.displayName });
};