from cryptography.hazmat.primitives.serialization import pkcs12, Encoding, PrivateFormat, NoEncryption

def converter_pfx_para_pem(caminho_pfx, senha_pfx, caminho_cert_pem, caminho_chave_pem):
    """Converte arquivo PFX para PEM usando cryptography"""
    with open(caminho_pfx, 'rb') as f:
        pfx_data = f.read()
    private_key, certificate, additional_certs = pkcs12.load_key_and_certificates(pfx_data, senha_pfx.encode())

    # Salvar certificado
    with open(caminho_cert_pem, 'wb') as cert_file:
        cert_file.write(certificate.public_bytes(Encoding.PEM))
        if additional_certs:
            for cert in additional_certs:
                cert_file.write(cert.public_bytes(Encoding.PEM))

    # Salvar chave privada
    with open(caminho_chave_pem, 'wb') as key_file:
        key_file.write(private_key.private_bytes(Encoding.PEM, PrivateFormat.TraditionalOpenSSL, NoEncryption()))
