import socket
import binascii
import select
from time import sleep

def read_buffer():
    buffer = b''
    while True:
        data = conn.recv(1024)
        print(data)
        if b'\r' in data:
            break
        else:
            buffer += data
    return buffer

HOST = '0.0.0.0'  # Standard loopback interface address (localhost)
PORT = 6530        # Port to listen on (non-privileged ports are > 1023)

#SOH MODE ETX LRC

SOH = b'01'
ETX = b'03'
B = b'42'
C = b'43'
BLOCKMODE = SOH + B + ETX + b'20'
CONVMODE = SOH + C + ETX + b'20'

ESC = b'1B'
GS_CTRL = b'1D'


b = b'62'
lessthan = b'3c'
semicolon = b'3b'
pageone = b'21'
pagezero = b'20'
a = b'61'
question = b'3f'
n = b'6e'
d = b'64'
f1 = b'60'
six = b'36'
quote = b'22'
W = b'57'
I = b'49'
q = b'71'
X = b'58'
squarebracket = b'5b'

UNLOCKKEY = ESC + b
READALL = ESC + lessthan
READCUR = ESC + a
READTERM = ESC + question
DISPAGEZERO = ESC + semicolon + pagezero
DISPAGEONE = ESC + semicolon + pageone
SETVIDEO = ESC + six
ENTERPROTECT = ESC + W
EXITPROTECT = ESC + X
ERASEMEM = ESC + I
REINIT = ESC + q
NORMALNOPROTALPHANUM = GS_CTRL + b'20' + b'5F'
INVISIBLENOPROTALPHANUM = GS_CTRL + b'3D' + b'5F'
NORMALPROTALPHANUMFREE = GS_CTRL + b'20' + b'70'
NORMALPROTALPHANUMFREEMDT = GS_CTRL + b'20' + b'71'
SETVIDEOBLINKING = SETVIDEO + quote


with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind((HOST, PORT))
    s.listen()
    conn, addr = s.accept()
    with conn:
        s.setblocking(0)
        print('Connected by', addr)
        data = conn.recv(1024)
        conn.sendall(binascii.unhexlify(CONVMODE))
        conn.sendall(binascii.unhexlify(UNLOCKKEY))
        conn.sendall(b'ENTER YOUR NAME: ')
        print('GETTING NAME')
        name = read_buffer()
        print(name)
        conn.sendall(binascii.unhexlify(ERASEMEM))
        conn.sendall(binascii.unhexlify(BLOCKMODE))
        #conn.sendall(binascii.unhexlify(ENTERPROTECT))
        conn.sendall(binascii.unhexlify(UNLOCKKEY))
        conn.sendall(b'Normal Text  ')
        conn.sendall(binascii.unhexlify(NORMALNOPROTALPHANUM))
        conn.sendall(b'No Special Chars  ')
        conn.sendall(binascii.unhexlify(NORMALPROTALPHANUMFREE))
        conn.sendall(b'Prot Field MDT OFF  ')
        conn.sendall(binascii.unhexlify(NORMALPROTALPHANUMFREEMDT))
        conn.sendall(b'Prot Field MDT ON  ')
        conn.sendall(binascii.unhexlify(INVISIBLENOPROTALPHANUM))
        conn.sendall(b'INVISIBLE Field  ')
        conn.sendall(binascii.unhexlify(NORMALNOPROTALPHANUM))
        print("BLOCKMODE INIT READ")
        data = conn.recv(5024)
        print(data)
        #data_hex = binascii.hexlify(data)
        conn.sendall(binascii.unhexlify(READALL))
        data = conn.recv(5024)
        data_hex = binascii.hexlify(data)
        print(data)
        conn.sendall(binascii.unhexlify(UNLOCKKEY))
        sleep(6)
        conn.sendall(binascii.unhexlify(READALL))
        data = conn.recv(5024)
        data_hex = binascii.hexlify(data)
        print(data)
        conn.sendall(binascii.unhexlify(UNLOCKKEY))
        conn.close()
        s.shutdown(1)
        s.close()        
            
