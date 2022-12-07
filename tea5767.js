let i2c = require('i2c-bus'),
    i2c1 = i2c.openSync(1);

let TEA5767_ADDR = 0x60

function setAddress(addr = 0x60) {
    TEA5767_ADDR = addr;
}

function getFrequency(){
    let buf = Buffer.alloc(5);
    i2c1.i2cReadSync(TEA5767_ADDR, 5, buf);
    let frequency = ((buf[0] & 0x3F) << 8) + buf[1];
    let freq = (frequency * 32768 / 4 - 225000) / 1000000;
    return parseFloat(freq.toFixed(1));
}

async function setFrequency(freq, mute = false) {
    let data = Buffer.alloc(5);
    let f = freqToByte(freq);
    data[0] = f.freqH & 0x3F;
    data[1] = f.freqL;
    data[2] = 0xD0;
    data[3] = 0x17;
    data[4] = 0x00;
    data[0] = mute ? (data[0] | 0x80) : data[0] & 0x7F;
    await writeBytes(data);
}

function mute(bool = false) {
    let freq = getFrequency();
    setFrequency(freq, bool);
}

async function autoSearch(freq = 87.5, dir = 1) {
    let MAX_KHZ = 108;
    let MIN_KHZ = 87.5;
    let radioRf = 0;
    let radioIf = 0;
    let radioLev = 0;
    let data = Buffer.alloc(5);
    // 极小的概率会出现死循环
    while (radioRf == 0 || radioIf <= 0x31 || radioIf >= 0x3E || radioLev < 15) {
        if (dir == 1) {
            freq += 0.1;
            freq > MAX_KHZ && (freq = MIN_KHZ);
        } else {
            freq -= 0.1;
            freq < MIN_KHZ && (freq = MAX_KHZ);
        }
        freq = parseFloat(freq.toFixed(1));
        let f = freqToByte(freq);
        data[0] = (f.freqH & 0x3F) + 0x80;      // close auto search of system
        data[1] = f.freqL;
        data[2] = 0xD0;
        data[3] = 0x17;
        data[4] = 0x00;
        await writeBytes(data);
        await delay(50);                        // here must delay some seconds, why?
        let buf = Buffer.alloc(5);
        i2c1.i2cReadSync(TEA5767_ADDR, 5, buf);
        radioRf = buf[0] & 0x80;
        radioIf = buf[2] & 0x7F;
        radioLev = buf[3] >> 4;
    }
    return freq;
}
 
function freqToByte(freq) {
    let cof = 32768;
    let freq14bit = Math.round(4 * (freq * 1000000 + 225000) / cof);
    let freqH = freq14bit >> 8;
    let freqL = freq14bit & 0xFF;
    return { freqH: freqH, freqL: freqL};
}

function writeBytes(data) {
    return new Promise((resolve, reject) => {
        let i = false;
        let attempt = 0;
        while (i == false) {
            try {
                i2c1.writeI2cBlockSync(TEA5767_ADDR, data[0], 4, data.slice(1));
                i = true;
                resolve(true);
            } catch (error) {
                if (error.errno != 121) {
                    i = false;
                    attempt += 1;
                    if (attempt > 100000)
                        break;
                } else
                    i = true;
            }
        }
    });
}

function delay() {
    return new Promise((resolve, reject) => setTimeout(resolve, ms));
}

module.exports = {
    setAddress: setAddress,
    getFrequency: getFrequency,
    setFrequency: setFrequency,
    mute: mute,
    autoSearch: autoSearch
};