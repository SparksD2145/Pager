/**
 * @file Pager
 * @author Thomas Ibarra <thomas.ibarra@tddctx.com>
 */

// Require Dependencies
var ping    = require('ping').promise;
var restler = require('restler');
var moment  = require('moment');

var debug = require('debug')('Pager:Main');

// Underscore
var _ = require('underscore');
_.mixin(require('underscore.string').exports());

/**
 * Pager
 * @constructor
 */
function Pager(){
    this._configuration = require('./config')(process.env.NODE_ENV)
}

/**
 * Perform starting routines
 * @returns {Pager}
 */
Pager.prototype.start = function(){
    if(this.config().application.developmentMode){
        process.env.DEBUG = '*';
        debug('[Development Mode Enabled]');
    }

    // Return this for chaining
    return this;
};

/**
 * Retrieves current configuration.
 * @returns {*}
 */
Pager.prototype.config = function(){
    return this._configuration;
};

/**
 * Retrieves Hosts
 * @returns {*|exports|module.exports}
 */
Pager.prototype.hosts = function(){
    this.start();

    if(typeof this._hostsCollection === 'undefined'||  _.isEmpty(this._hostsCollection)){
        debug('Collecting hosts.');
        this._hostsCollection = require('./hosts.js');
    }

    return this._hostsCollection;
};

/**
 * Performs ping testing on hosts
 * @param intervalMS
 * @param hostsToTest
 */
Pager.prototype.test = function test(intervalMS, hostsToTest) {
    this.start();

    var interval = intervalMS? parseInt(intervalMS) : this.config().check.interval;
    var hosts = hostsToTest? hostsToTest : this.hosts();

    _.each(hosts, function (host, key) {
        var scope = this;

        if (host.flags.isDown) {

            ping.probe(host.address).then(function (res) {
                debug(_.sprintf('Retrying %s (%s)', host.address, host.callsign));

                if (!res.alive) {
                    console.log(_.sprintf('Host %s (%s) is STILL DOWN at %s',
                        host.address,
                        host.callsign,
                        moment().toISOString()
                    ));
                } else {
                    console.log(_.sprintf('Host %s (%s) UP at %s', host.address, host.callsign, moment().toISOString()));
                    scope._hostsCollection[key].flags.isDown = false;

                    scope.notify(_.sprintf('Host %s (%s) is UP at %s',
                        host.address,
                        host.callsign,
                        moment().toISOString()
                    ));
                }
            });
        }
        else {

            ping.probe(host.address).then(function (res) {
                debug(_.sprintf('Pinging %s\t(%s)', host.address, host.callsign));

                if (!res.alive) {
                    console.log(_.sprintf('Host %s (%s) is POSSIBLY DOWN at %s, RETRYING',
                        host.address,
                        host.callsign,
                        moment().toISOString()
                    ));

                    ping.probe(host.address).then(function (res) {
                        if(!res.alive){
                            console.log(_.sprintf('Host %s (%s) is DOWN at %s',
                                host.address,
                                host.callsign,
                                moment().toISOString()
                            ));

                            scope._hostsCollection[key].flags.isDown = true;
                            debug(_.sprintf('Set flag .down as %s for %s', scope._hostsCollection[key].flags.isDown,  host.callsign))

                            scope.notify(_.sprintf('Host %s (%s) is DOWN at %s',
                                host.address,
                                host.callsign,
                                moment().toISOString()
                            ));
                        } else {
                            console.log(_.sprintf('Host %s (%s) is OK at %s',
                                host.address,
                                host.callsign,
                                moment().toISOString()
                            ));
                        }
                    });
                }
                else {
                    debug(_.sprintf('Host %s (%s) is UP', host.address, host.callsign))
                }
            });
        }
    }, this);

    setTimeout(arguments.callee.bind(this), interval, interval);
};

/**
 * Notify recipients by cell
 * @param message
 */
Pager.prototype.notify = function(message){
    this.start();

    if(this.config().cellular.enabled){
        var configuration = this.config().cellular;

        console.log('Notifying Recipients.');

        var phones = configuration.recipients;
        _.each(phones, function(phone){
            debug('Notifying phone: ' + phone);

            restler.post(configuration.api.url, {
                username: configuration.api.user,
                password: configuration.api.key,
                data: {
                    to: phone.number,
                    from: 'notifier@tddctx.com',
                    text: message
                }
            }).on('success', function(){
                console.log('Notified phone: ' + phone.number);
            }).on('error', function(error, response){
                console.log('Could not notify: ' + phone.number);
            });
        });
    }
};

module.exports = new Pager();