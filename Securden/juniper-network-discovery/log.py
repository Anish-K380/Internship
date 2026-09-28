from ast import literal_eval

def add_to_log(fields, values): #fields and values are iterables, values have the value of the field.
    line = list()
    no_of_fields = len(fields)
    for i in range(no_of_fields):
        field = fields[i]
        value = values[i]
        line.append(str((len(field), len(value))))
        line.append(field)
        line.append(value)
    row = ''.join(line)

    with open (filename, 'a') as file:
        file.write(f'[{len(row)}]')
        file.write(row)

def view_log():
    file = open(filename, 'r')
    log_text = file.read()
    file.close()
    index = 0

    while index < len(log_text):
        row_start = index
        while log_text[index] != ']':index += 1
        index += 1
        row_length = literal_eval(log_text[row_start:index])[0]
        row_end = index + row_length

        while index < row_end:
            list_start = index
            while log_text[index] != ')':index += 1
            index += 1
            field_length, value_length = literal_eval(log_text[list_start:index])
            print(f'{log_text[index:index + field_length]}: ', end = '')
            index += field_length
            print(log_text[index:index + value_length], end = '')
            index += value_length
            print(' ', end = '')
        print()

filename = 'juniper_discovery.log'
