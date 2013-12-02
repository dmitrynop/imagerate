/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Image = mongoose.model('Image');


/**
 * Find image by id
 */

exports.rateImage = function rateImage(req, res) {
    var image = req.image;
    var user = req.user;
    var rateValue = Number(req.params.rateValue.input);

    image.saveNewRateValue(rateValue, user, onRatingReceived);

    function onRatingReceived(err) {
        if (err) {
            return res.render('500');
        }

        var newLike = null;
        if (rateValue) {
            var _user = user.toObject();
            _user.image = res.locals.h.profileLink(user);
            newLike = { user: _user };
        }

        res.send({
            id: image._id,
            rating: image.contest.ratingSum,
            count: image.contest.evaluationsCount,
            newLike: newLike
        });
    }
};

