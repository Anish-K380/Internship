from ssh_client_manager import SSHClientManager
from verification import is_junos_router
from junos_actions import get_accounts, reset_password
from netconf_manager import NetconfManager
from log import view_log
from encrypt import sha512

class JunosRouterAccounts:
    def __init__(self, user, passwd, ip, ssh_port = 22, nc_port = 830, timeout = 30):
        self.ssh_client = SSHClientManager(user, passwd, ip, ssh_port, timeout)
        if self.ssh_client.client is None:
            print('SSH connection failed.')
            raise RuntimeError('SSH connection failed.')

        if not is_junos_router(self.ssh_client):
            print('Junos OS not present or cli mode not active.')
            raise RuntimeError('Junos OS not present or cli mode not active.')

        self.get_accounts()

        self.netconf_client = NetconfManager(user, passwd, ip, nc_port, timeout)
        if self.netconf_client.manager is None:
            print('NetConf did not connect successfully.')
            raise RuntimeError('NetConf did not connect successfully.')

    def get_accounts(self):
        account_fetch_verdict, self.accounts = get_accounts(self.ssh_client)
        if not account_fetch_verdict:
            print('Accounts fetch failed.')
            raise RuntimeError('Accounts fetch failed.')
        self.view_accounts()

    def view_accounts(self):
        print('Accounts:')
        for i in range(len(self.accounts)):
            print(f'\t{i + 1}.', self.accounts[i])

    def reset_password(self, username, password):
        password_hash = sha512(password)
        reset_password(self.netconf_client, username, password_hash)

    def display_log(self):
        view_log()

    def quit(self):
        self.ssh_client.close_connection()
        self.netconf_client.close_connection()
