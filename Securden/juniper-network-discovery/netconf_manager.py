from netconf_connection import netconf_with_username_password
from log import add_to_log

class NetconfManager:
    def __init__(self, username, password, hostname, port, timeout):
        self.manager = netconf_with_username_password(username, password, hostname, port, timeout)
        self.user = username
        self.ip = hostname

    def close_connection(self, message = 'Connection closed successfully.'):
        log_fields = ['source', 'username', 'hostname', 'action', 'verdict', 'message']
        try:
            self.manager.close_session()
            log_values = ['netconf_manager/close', self.user, self.ip, 'close connection', 'PASS', message]
        except Exception as e:
            log_values = ['netconf_manager/close', self.user, self.ip, 'close connection', 'FAIL', str(e)]

        add_to_log(log_fields, log_values)

    def is_alive(self):
        return self.manager.connected

    def pass_config(self, xml_data):
        self.manager.edit_config(target = 'candidate', config = xml_data)
        self.manager.validate(source = 'candidate')
        self.manager.commit()
