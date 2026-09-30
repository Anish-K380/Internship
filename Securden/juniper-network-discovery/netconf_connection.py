from ncclient import manager

from log import add_to_log

def netconf_with_username_password(username, password, hostname, port, timeout):
    make_log(username, hostname, port, timeout, 'TBD', 'Netconf connection initiated.')
    try:
        netconf_manager = manager.connect(
            username = username,
            password = password,
            host = hostname,
            port = port,
            hostkey_verify = False,
            timeout = timeout,
            device_params = {'name': 'junos'})
        make_log(username, hostname, port, timeout, 'PASS', 'Connection successful.')
        return netconf_manager
    except Exception as e:
        make_log(username, hostname, port, timeout, 'FAIL', e)

    return None

def make_log(username, hostname, given_port, given_timeout, verdict, message):
    log_fields = ['source', 'username', 'hostname', 'port', 'timeout', 'verdict', 'message']
    port = str(given_port)
    timeout = str(given_timeout)

    log_values = ['netconf_connection', username, hostname, port, timeout, verdict, message]

    add_to_log(log_fields, log_values)
