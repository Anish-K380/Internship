from passlib.hash import sha512_crypt

def sha512(plaintext):
    hash_text = sha512_crypt.hash(plaintext)
    return hash_text
