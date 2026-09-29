import paramiko
import warnings

from log import add_to_log

def ssh_with_username_password(username, password, ip_address, port, timeout):
    ssh_client = paramiko.SSHClient()
    ssh_client.set_missing_host_key_policy(paramiko.WarningPolicy())

    make_log(username, ip_address, port, timeout, None, 'ssh connection initiated')

    try:
        with warnings.catch_warnings(record = True) as caught:
            warnings.simplefilter('always')
            
            ssh_client.connect(username = username, password = password, hostname = ip_address, port = port, timeout = timeout)

            if caught:
                for i in caught:
                    make_log(username, ip_address, port, timeout, None, 'warning given', ['warning'], [str(i.message)])

                make_log(username, ip_address, port, timeout, True, 'ssh connection successful.')

            return ssh_client
    except KeyboardInterrupt:
        make_log(username, ip_address, port, timeout, False, 'Manual abort with Ctrl+C')
    except Exception as e:
        make_log(username, ip_address, port, timeout, False, str(e))

def make_log(username, hostname, given_port, given_timeout, is_success = None, message = '', additional = None, additional_messages = None):
    port = str(given_port)
    timeout = str(given_timeout)

    log_fields = ['source', 'username', 'hostname', 'port', 'timeout', 'verdict', 'message']
    log_values = ['ssh_connection', username, hostname, port, timeout]
    if is_success is None:
        log_values.append('TBD')
    elif is_success:
        log_values.append('PASS')
    else:
        log_values.append('FAIL')
    log_values.append(message)
    if additional is not None:
        for i in range(len(additional)):
            log_fields.append(additional[i])
            log_values.append(additional_messages[i])
    add_to_log(log_fields, log_values)
