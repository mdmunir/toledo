const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

const FILENAME = path.resolve(process.env.APP_DIR, 'storage/config.json');

const {SerialPort} = require('serialport');
const {ByteLengthParser} = require('@serialport/parser-byte-length');

class Serial extends EventEmitter {
    constructor() {
        super();
        this._buffer = '';
        this._value = '';
        this._config = {
            path: 'COM1',
            baudRate: 9600,
            delimiter: '\n',
            begin: null,
            end: null,
        };
        if (fs.existsSync(FILENAME)) {
            let str = fs.readFileSync(FILENAME, 'utf8');
            Object.assign(this._config, JSON.parse(str) || {});
        }
        this.open();
    }

    open() {
        let self = this;
        if (this.port) {
            if (this.port.isOpen) {
                this.port.close(function (err) {
                    self.emit('error', err.toString());
                });
            }
            this.port = undefined;
            this.parser = undefined;
        }

        this.port = new SerialPort({path: this._config.path, baudRate: this._config.baudRate}, false);
        this.port.on('error', function (err) {
            self.emit('error', err.toString());
        });
        this.port.open(function (err) {
            if (err) {
                self.emit('error', err.toString());
            }
            self.parser = self.port.pipe(new ByteLengthParser({length: 8}));
            self.parser.on('data', function (data) {
                self.onData(data + '');
            });
        });
    }

    config(value) {
        if (value) {
            let isChange = (value.path != this._config.path || value.baudRate != this._config.baudRate);
            Object.assign(this._config, value);
            this._config.delimiter = this._config.delimiter ? this._config.delimiter : '\n';
            fs.writeFileSync(FILENAME, JSON.stringify(this._config), 'utf8');
            if (isChange) {
                this.open();
            }
            this.emit('config', this._config);
        }
        return  this._config;
    }

    onData(value) {
        this.emit('raw', value);
        this._buffer += value;
        let buffers = this._buffer.split(this._config.delimiter);
        if (buffers.length > 1) {
            let part = buffers[buffers.length - 2];
            this._buffer = buffers[buffers.length - 1];
            this.emit('segment', part);
            let {begin, end} = this._config;
            let data = end ? part.substring(begin || 0, end) : part.substring(begin || 0);
            data = data.trim();
            if (this._value != data) {
                this._value = data;
                this.emit('value', this._value);
            }
        }
    }

    value() {
        return this._value;
    }

    attach(socket) {
        let serial = this;
        socket.emit('config', serial.config());
        socket.emit('value', serial.value());
        socket.on('config', function (value) {
            serial.config(value);
        });

        const handlers = {};
        const events = ['raw', 'segment', 'value', 'config', 'error'];
        events.forEach(name => {
            handlers[name] = function (data) {
                socket.emit(name, data);
            }

            serial.on(name, handlers[name]);
        });

        socket.on('disconnect', () => {
            events.forEach(name => serial.off(name, handlers[name]));
        });
    }
}

module.exports = new Serial();