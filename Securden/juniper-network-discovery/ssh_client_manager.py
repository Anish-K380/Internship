from ssh_connection import ssh_with_username_password
from log import add_to_log

class SSHClientManager:
    def __init__(self, username, password, ip_address, port, timeout):
        self.client = ssh_with_username_password(username, password, ip_address, port, timeout)
        self.user = username
        self.ip = ip_address

    def execute(self, command):
        stdin, stdout, stderr = self.client.exec_command(command)
        return self.convert_bytes_to_text(stdout), self.convert_bytes_to_text(stderr)

    def is_alive(self):
        try:
            transport = self.client.get_transport()
            transport.send_ignore()
            return True
        except EOFError as e:
            return False

    def close_connection(self, message = 'Connection closed successfully.'):
        log_fields = ['source', 'hostname', 'username', 'action', 'verdict', 'message']
        log_values = ['ssh client manager/close connection', self.ip, self.user, 'close ssh connection', 'PASS', message]
        self.client.close()
        add_to_log(log_fields, log_values)

    def convert_bytes_to_text(self, dataObj):
        return dataObj.read().decode()
