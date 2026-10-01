# Juniper network devices discovery and accounts

This project uses an ssh connection to connect to the network device.  
It uses commands to verify said device is actually using Junos OS.  
It can then get existing users and list them.  
Resetting the password of existing accounts is also available by using a NetConf connection.  

Note: This is implemented synchronously, if being used for a range of IP's for multiple devices, an async version would be better.

Run test.py to try it interactively.
