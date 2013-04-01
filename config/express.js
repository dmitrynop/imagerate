
/**
* Module dependencies.
*/

var express = require('express'),
    mongoStore = require('connect-mongo')(express),
    flash = require('connect-flash'),
    helpers = require('view-helpers'),
    cloudinary = require('cloudinary'),
    forms = require('../app/forms');

module.exports = function (app, config, passport) {

    app.set('showStackError', true);
    // should be placed before express.static
    app.use(express.compress({
        filter: function (req, res) {
            return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
        },
        level: 9
    }));
    app.use(express.static(config.root + '/public'));
    app.use(express.logger('dev'));

    // set views path, template engine and default layout
    var ectRenderer = require('ect')({ 
        watch: true, 
        cache: false, 
        root: config.root + '/app/views', 
        ext: '.ect' 
    });
    app.engine('.ect', ectRenderer.render);
    app.set('views', config.root + '/app/views');
    app.locals.forms = forms;

    app.configure(function () {
        // dynamic helpers
        app.use(helpers(config.app.name))

        // cookieParser should be above session
        app.use(express.cookieParser())

        // bodyParser should be above methodOverride
        app.use(express.bodyParser())
        app.use(express.methodOverride())

        // express/mongo session storage
        app.use(express.session({
            secret: 'secret_mongo',
            store: new mongoStore({
                url: config.db,
                collection : 'sessions'
            })
        }));

        // connect flash for flash messages
        app.use(flash());

        // use passport session
        app.use(passport.initialize());
        app.use(passport.session());

        app.use(express.favicon());

        //Config cloudinary
        cloudinary.config(config.cloudinary);

        // routes should be at the last
        app.use(app.router);

        // assume "not found" in the error msgs
        // is a 404.
        app.use(function(err, req, res, next){
            // treat as 404
            if (~err.message.indexOf('not found')) return next();

            console.error(err.stack);

            // error page
            res.status(500).render('500.ect', { error: err.stack });
        });

        // assume 404 since no middleware responded
        app.use(function(req, res, next){
            res.status(404).render('404.ect', { url: req.originalUrl });
        });

    });
}
