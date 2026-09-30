def reset_password_xml(username, password):
    with open('password_reset.xml', 'r') as file:
        raw_xml = file.read()

    return raw_xml.replace('{{USERNAME}}', username).replace('{{PASSWORD}}', password)
