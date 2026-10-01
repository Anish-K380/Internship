import getpass

from junos_accounts_discovery import JunosRouterAccounts
from verification import verify_ip, verify_port, verify_timeout

def raise_error(message):
    raise ValueError(f'Invalid {message}.')

username = input('Enter username: ')
password = getpass.getpass('Enter password: ')

ip = input('Enter IP:')
if not verify_ip(ip):
    raise_error('ip address')

ssh_port = input('Enter SSH port (leave empty for 22):')
if ssh_port == '':
    ssh_port = '22'
if not verify_port(ssh_port):
    raise_error('SSH port')
ssh_port = int(ssh_port)

nconf_port = input('Enter NConf port (leave empty for 830):')
if nconf_port == '':
    nconf_port = '830'
if not verify_port(nconf_port):
    raise_error('NConf port')
nconf_port = int(nconf_port)

timeout = input('Enter timeout:')
timeout_valid, timeout_message = verify_timeout(timeout)
if not timeout_valid:
    raise error(f'timeout, {timeout_message}')
timeout = float(timeout)

junos_obj = JunosRouterAccounts(username, password, ip, ssh_port, nconf_port, timeout)
del password

options = {'1', '2', '3', '4', '5'}
while True:
    print('Options:')
    print('\t1. Refresh accounts')
    print('\t2. View existing accounts')
    print('\t3. Reset password')
    print('\t4. View log')
    print('\t5. Quit')

    option = input('Enter option:')
    if option not in options:
        print('Invalid option')
        continue

    option = int(option)
    if option == 1:
        junos_obj.get_accounts()
    elif option == 2:
        junos_obj.view_accounts()
    elif option == 3:
        while True:
            username = input('Enter username: ')
            password = getpass.getpass('Enter new password: ')
            confirm_password = getpass.getpass('Re enter new password: ')
            if password != confirm_password:
                temp = input('Passwords don\'t match, try again? (yes / no): ')
                while True:
                    if temp == 'no' or temp == 'yes':break
                    temp = input('Invalid option, enter (yes / no): ')
                if temp == 'no':
                    break
            else:
                del confirm_password
                junos_obj.reset_password(username, password)
                del password
                break
    elif option == 4:
        junos_obj.display_log()
    elif option == 5:
        junos_obj.quit()
        break
