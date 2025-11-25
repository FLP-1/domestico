import csv

def enviar_lote(client, xml_evento):
    """Envia lote de eventos para o eSocial"""
    resposta = client.service.EnviarLoteEventos(xml_evento)
    return resposta

def consultar_protocolo(client, protocolo):
    """Consulta protocolo de envio no eSocial"""
    resposta = client.service.ConsultarLoteEventos(protocolo)
    return resposta

def exportar_csv(dados, caminho_csv):
    """Exporta dados para CSV"""
    with open(caminho_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(dados.keys())
        writer.writerow(dados.values())
