from ssh_connection import ssh_with_username_password

class SSHClientManager:
    def __init__(self, username, password, ip_address, port, timeout):
        self.client = ssh_with_username_password(username, password, ip_address, port, timeout)

    def execute(command):
        stdin, stdout, stderr = self.client.exec_command(f'cli -c "{command}"')
        return stdout, stderr
