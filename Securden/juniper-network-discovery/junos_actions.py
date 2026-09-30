from log import add_to_log
from xml_helpers import reset_password_xml

from ncclient.operations.rpc import RPCError

def get_accounts(ssh_client):
    def make_log(command, verdict, message):
        log_values = ['junos actions/get accounts', ssh_client.ip, ssh_client.user, command, verdict, message]
        add_to_log(log_fields, log_values)
    users = list()

    log_fields = ['source', 'hostname', 'username', 'command', 'verdict', 'message']

    command = 'file list /var/home'
    output, error = ssh_client.execute(command)

    if error:
        make_log(command, 'FAIL', error)
        ssh_client.close_connection('Failed at getting accounts')
        return False, users

    raw_split = output.split('\n')
    for i in range(2, len(raw_split) - 1):
        home_directory_name = raw_split[i]
        users.append(home_directory_name[:len(home_directory_name) - 1])

    make_log(command, 'PASS', 'Received accounts')
    return True, users

def reset_password(netconf_client, username, password_hash):
    def make_log(username, verdict, message):
        log_fields = ['source', 'hostname', 'username', 'user getting password change', 'action', 'verdict', 'message']
        log_values = ['junos actions/password reset', netconf_client.ip, netconf_client.user, username, 'Password change', verdict, message]

        add_to_log(log_fields, log_values)
    make_log(username, 'TBD', 'Password reset initiated.')
    try:
        netconf_client.pass_config(reset_password_xml(username, password_hash))
        make_log(username, 'PASS', 'Password reset successful.')
        return True
    except RPCError as e:
        print('nice error')
        print("type:", e.type)
        print("tag:", e.tag)
        print("severity:", e.severity)
        print("message:", e.message)
        print("path:", e.path)
        print("info:", e.info)
        make_log(username, 'FAIL', str(e))
        return False
    except Exception as e:
        make_log(username, 'FAIL', str(e))
        return False
