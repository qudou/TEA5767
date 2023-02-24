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

set_freq(freq);