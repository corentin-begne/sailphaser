/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    login: function (req, res) {
        if(req.session.user){
            return res.json({error: "user already logged"});
        }

        User.findOrCreate({username: req.query.username}, {username: req.query.username}, logUser);

        function logUser(err, user){
            if(err){
                return res.json({error: err});
            }
            req.session.user = user;
            return res.json({points: user.points});

        }
    }
};

