Pager
=====

A simple, node-powered scriptlet that notifies predefined recipients by SMS when predefined hosts go down. Utilizes Mailgun APIs and email-to-text technologies offered by cellular Carriers[^textbeltCarriers].

Utilization
------------
Pager is rather easy to start working with right away. 

Configure appropriate hosts in src/hosts.js, using an IP Address, Callsign and Description for each.
```
// Hosts
Hosts.add('192.168.1.1', 'MCH', 'My Custom Host');
Hosts.add('192.168.1.1', 'ACH', 'Another Custom Host');
```

Add recipients in src/recipients.js, using a fully-qualified email-to-sms address.
```
// Recipients configuration
module.exports = [
    { number: '5555555555@example.emailtotext.com', name: 'John Doe' },
    { number: '5555551234@example.emailtotext.com', name: 'Jane Doe' }
];
```

Modify src/apiKey.js with the appropriate Mailgun API configuration.
```
module.exports = {
    url: 'mailgunURL',
    user: 'api',
    key: 'your_key_goes_here'
};
```

And then you are off!
```
$ node page where
$ node page who
$ node page hosts
```





[^textbeltCarriers]:  See carriers contained within [Textbelt](https://github.com/typpo/textbelt/blob/master/lib/providers.js) providers.