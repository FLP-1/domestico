import requests
from zeep import Client
from zeep.transports import Transport
from zeep.wsse.signature import Signature
from requests_pkcs12 import Pkcs12Adapter
import os

def criar_cliente(wsdl_url, caminho_pfx, senha_pfx, caminho_cert_pem, caminho_chave_pem):
    """Cria cliente SOAP para eSocial usando PKCS#12 e WSSE"""
    session = requests.Session()
    session.mount("https://", Pkcs12Adapter(pkcs12_filename=caminho_pfx, pkcs12_password=senha_pfx))
    ca_bundle = os.path.join(os.path.dirname(__file__), "certificados", "ca_bundle_icp.pem")
    session.verify = ca_bundle
    transport = Transport(session=session)
    wsse = Signature(caminho_chave_pem, caminho_cert_pem)
    client = Client(wsdl_url, transport=transport, wsse=wsse)
    return client
