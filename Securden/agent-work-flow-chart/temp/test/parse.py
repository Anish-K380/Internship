import json

with open('samplelinks.txt', 'r') as file:
    raw = file.read()

data = eval(raw)

with open('samplelinks.json', 'w') as file:
    json.dump(data, file, indent = 2)
