import ipaddress

from log import add_to_log

def verify_ip(address):
    try:
        ipaddress.ip_address(address)
        return True
    except ValueError:
        return False

def verify_port(port):
    try:
        return (0 <= int(port)) and (int(port) <= 65535)
    except (ValueError, TypeError):
        return False

def verify_timeout(duration):
    try:
        if float(duration) > 0:return True, 'accepted duration'
        return False, 'negative or 0 value'
    except (ValueError, TypeError):
        return False, 'invalid value'

def verify_user_input(ip_address, port, timeout):
    fields = ('source', 'IP', 'port', 'timeout', 'verdict', 'message')
    values = ['input_verification', ip_address, port, timeout]
    timeout_check, timeout_message = verify_timeout(timeout)
    if not timeout_check:
        message = timeout_message
    elif not verify_ip(ip_address):
        message = 'IP address not valid.'
    elif not verify_port(port):
        message = 'Port is not valid.'
    else:
        values.append('PASS')
        values.append('Input is valid.')
        add_to_log(fields, values)
        return True
    values.append('FAIL')
    values.append(message)
    add_to_log(fields, values)
    return False
