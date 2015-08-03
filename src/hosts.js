var Hosts = new HostsController();

// Hosts
Hosts.add('192.168.1.1', 'DFT', 'DEFAULT HOST');

/** HostsController */
function HostsController(){
    var hosts = [];

    this.add = function(address, callsign, name){
        hosts.push(new Host(address, callsign, name))
    };

    function Host(address, callsign, name){
        this.address = address;
        this.callsign = callsign;
        this.name = name;
        this.flags = {
            isDown: false
        }
    }

    this.getHosts = function(){ return [].concat(hosts); };
}

module.exports = Hosts.getHosts();