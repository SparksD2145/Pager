/** @file Configuration file for Ping Tool */

var _ = require('underscore');
var moment = require('moment');
var env = loadEnvironmentVariables();
var environments = {};

// Cellular Recipients
var recipients = require('./recipients');

/** Production environment configuration */
environments['production'] = {
    application: {
        name: 'Pager',
        developmentMode: false
    },
    check: {
        interval: moment.duration(5, 'minutes').asMilliseconds(),
        maxLatencyMS:3000
    },
    cellular: {
        enabled: true,
        api: require('./apiKey'),
        recipients: recipients,
        from: 'pager@domainexample.com'
    }
};
environments['default'] = environments.production;

/** Development environment configuration */
environments['development'] = {
    application: {
        name: 'Pager [development]',
        developmentMode: true
    },
    check: {
        interval: moment.duration(5, 'minutes').asMilliseconds()
    },
    cellular: {
        enabled: false,
        api: require('./apiKey'),
        recipients: recipients,
        from: 'pager@domainexample.com'
    }
};

/**
 * Retrieves and returns environment configuration
 * @returns Object
 */
function retrieveConfiguration(environment) {
    if(!environment && !process.env.DEBUG) {
        return environments.default;
    } else if(typeof process.env.DEBUG !== 'undefined') {
        return environments['development'];
    } else {
        return environments[environment];
    }
}

/**
 * Loads environment variables used to configure application.
 * @returns Object
 */
function loadEnvironmentVariables() {
    var environmentVariables = [
        { "NODE_ENV": { required: false } }
    ];

    var loadedVariables = {};
    _.each(environmentVariables, function(variable){
        var variable = new EnvironmentVariable(variable);
        loadedVariables[variable.name] = variable.value;
    });

    return loadedVariables;
}

/**
 * Environment Variable Container
 * @param config Variable Configuration
 * @constructor
 */
function EnvironmentVariable(config){
    this.name = _.first(_.keys(config));
    this.required = typeof config.required !== 'undefined'? config.required : false;
    this.defaultValue = typeof config.defaultValue !== 'undefined'? config.defaultValue : false;

    // Reject if required and unavailable.
    if(this.required && typeof process.env[this.name] === 'undefined'){
        throw new ReferenceError('Environment variable "' + this.name + '" is not set.');
    }

    if(typeof process.env[this.name] !== 'undefined'){
        this.value = process.env[this.name];
    } else {
        this.value = this.defaultValue;
    }
}

module.exports = retrieveConfiguration;