export const chatLineRegex =
  /\[(\d{2}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})\]\[\w+\] Got message:ChatMessage\{chat=([^,]+), author='([^']+)', text='([^']+)'\}\./;

export const connectionRegex = /\[(\d{2}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})\] \[(\d+)\]\[(\w+)\]\[(\d+,\d+,\d+)\]\[(\w+)\]\[([\w\s]+: \d+)\]\./;

export const perkLineRegex =
  /\[(\d{2}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})\] \[(\d+)\]\[(\w+)\]\[(\d+,\d+,\d+)\]\[(\w+ \w+)\]\[(\w+)\]\[(\d+)\]\[Hours Survived: (\d+)\]\./;

export const adminLineRegex = /\[(\d{2}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})\] \[(.+?) Logs\] (\w+) clicked (\w+) in the (.+)/;

export const btseLineRegex = /^\[(\d{2}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})\] \[([^\]]+)\] (\d+) \[([^\]]+)\] (.+)$/;
