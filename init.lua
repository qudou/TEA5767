-- lua 环境
id=0
sda=4
scl=3
dev_addr=0x60
freq=99.6
i2c.setup(id,sda,scl,i2c.SLOW)

--calculate parameters and write frequency to tea5767
function set_freq(freq)
  frequency = 4 * (freq * 1000000 + 225000) / 32768;
  frequencyH = frequency / 256;
  frequencyL = bit.band(frequency,0xff);
  i2c.start(id)
  i2c.address(id, dev_addr ,i2c.TRANSMITTER)
  i2c.write(id,frequencyH)
  i2c.write(id,frequencyL)
  i2c.write(id,0xD0)
  i2c.write(id,0x17)
  i2c.write(id,0x00)
  i2c.stop(id)
end

function search_freq(freq, dir)
    local MAX_KHZ = 108;
    local MIN_KHZ = 87.5;
    local radioRf = 0;
    local radioIf = 0;
    local radioLev = 0;
    while (radioRf == 0 or radioIf <= 0x31 or radioIf >= 0x3E or radioLev < 15)
    do
        if (dir == 1) then
            freq = freq + 0.1
            if (freq > MAX_KHZ) then
                freq = MIN_KHZ
            end
        else
            freq = freq - 0.1
            if (freq < MIN_KHZ) then
                freq = MAX_KHZ
            end
        end
        frequency = 4 * (freq * 1000000 + 225000) / 32768
        frequencyH = bit.bor(frequency / 256,0x80)
        frequencyL = bit.band(frequency,0xff)
        i2c.start(id)
        i2c.address(id, dev_addr ,i2c.TRANSMITTER)
        i2c.write(id,frequencyH)
        i2c.write(id,frequencyL)
        i2c.write(id,0xD0)
        i2c.write(id,0x17)
        i2c.write(id,0x00)
        i2c.stop(id)

        tmr.delay(50 * 1000)                        --here must delay some seconds, why?

        i2c.start(id)
        i2c.address(id, dev_addr, i2c.RECEIVER)
        c = i2c.read(id, 5)
        radioRf = bit.band(string.byte(c,1), 0x80);
        radioIf = bit.band(string.byte(c,3), 0x7F);
        radioLev = string.byte(c,4) / 16
        i2c.stop(id)
        print('radioRf: '..radioRf)
        print('radioIf: '..'0x'..string.format("%x",radioIf))
        print('radioLev: '..radioLev)
    end
    return freq;
end

set_freq(freq);