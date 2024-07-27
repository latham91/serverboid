export const chatLineRegex =
  /\[(\d{2}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})\]\[\w+\] Got message:ChatMessage\{chat=([^,]+), author='([^']+)', text='([^']+)'\}\./;

export const connectionRegex =
  /\[(\d{2}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})\] \[(\d+)\]\[(\w+)\]\[(\d+,\d+,\d+)\]\[(\w+)\]\[([\w\s]+: \d+)\]\./;

export const perkLineRegex =
  /\[(\d{2}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})\] \[(\d+)\]\[(\w+)\]\[(\d+,\d+,\d+)\]\[(\w+ \w+)\]\[(\w+)\]\[(\d+)\]\[Hours Survived: (\d+)\]\./;
