#!/usr/bin/env node
var program = require('commander');
var _ = require('underscore');
var s = require('underscore.string');

var Pager = require('./src/Pager.js');

program
    .version('0.1.1');

program
    .command('hosts [interval]')
    .description('Performs ping-testing on hosts within hosts file.')
    .action(function(interval){
        Pager
            .test(interval);
    });

program
    .command('where')
    .description('Retrieves currently configured hosts.')
    .action(function(){
        Pager.start();

        var hosts = Pager.hosts();

        _.each(hosts, function(host){
            console.log(
                s.sprintf(
                    '%s\t%s\t%s',
                    host.address,
                    host.callsign,
                    host.name
                )
            )
        });
    });

program
    .command('who')
    .description('Retrieves currently configured cellular recipients.')
    .action(function(){
        Pager.start();

        var cell = Pager.config().cellular;

        var cellStatus = cell.enabled? 'Enabled.' : 'Disabled.';
        cellStatus = '\nCellular Notifications are currently ' + cellStatus + '\n';

        console.log(cellStatus);

        var phones = cell.recipients;
        _.each(phones, function(phone){
            console.log(
                s.sprintf(
                    '%s\t%s',
                    phone.number,
                    phone.name
                )
            )
        });
    });

program
    .command('appname')
    .description('Retrieves application\'s configured name.')
    .action(function() {
        console.log(Pager.config().application.name);
    });

program.parse(process.argv);