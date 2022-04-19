const STATE = {
    config: {
        path: 'COM1',
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        delimiter: '\n',
        begin: null,
        end: null,
    },
    serial: {
        value: '',
        segment: '',
        raw: ''
    }
};
const socket = io();
socket.on('config', function (data) {
    Object.assign(STATE.config, data);
});
socket.on('value', function (data) {
    STATE.serial.value = data;
});
socket.on('segment', function (data) {
    STATE.serial.segment = data;
});
socket.on('error', function (err) {
    console.log(err);
});


var app = new Vue({
    el: '#app',
    data: {
        model: STATE.config,
        serial: STATE.serial,
        synchron: true,
    },
    methods: {
        save() {
            socket.emit('config', this.model);
        },
        clear() {
            this.serial.raw = '';
        }
    },
    mounted() {
        let vm = this;
        socket.on('raw', function (data) {
            if (vm.synchron) {
                vm.serial.raw += data;
            }
        });
    }
});