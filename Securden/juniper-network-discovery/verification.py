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
    values = ['verification/user_input', ip_address, port, timeout]
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

def is_junos_router(ssh_client):
    def make_log(command, verdict, message):
        log_values = ['verification/is_junos_router', ssh_client.ip, ssh_client.user, command, verdict, message]
        add_to_log(log_fields, log_values)
    def verify_with_command(command, match_string, slice_start, slice_end):
        output, error = ssh_client.execute(command)
        if error:
            make_log(command, 'FAIL', error)
            ssh_client.close_connection('Encountered error while executing command.')
            return False
        if output[slice_start:slice_end] == match_string:
            make_log(command, 'PASS', 'Successfully executed.')
            return True
        make_log(command, 'FAIL', 'Unexpected Junos output.')
        ssh_client.close_connection('Unexpected output with given command.')
        return False

    command1 = 'show version | match family'
    command2 = 'show version | match "Junos:"'

    log_fields = ['source', 'hostname', 'username', 'commands', 'verdict', 'message']

    if not verify_with_command(command1, 'junos', -6, -1):
        return False

    if not verify_with_command(command2, 'Junos:', 0, 6):
        return False

    make_log(f'{command1}/{command2}', 'PASS', 'Successfully verified.')
    return True
