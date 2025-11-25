from lxml import etree

def montar_xml_s1000(id_evento, cnpj, razao_social):
    """Monta XML do evento S-1000"""
    xml = f"""<eSocial xmlns='http://www.esocial.gov.br/schema/lote/eventos/envio/v1_1_1'>
    <evtInfoEmpregador Id='{id_evento}'>
        <ideEmpregador>
            <tpInsc>1</tpInsc>
            <nrInsc>{cnpj}</nrInsc>
        </ideEmpregador>
        <infoCadastro>
            <nmRazao>{razao_social}</nmRazao>
        </infoCadastro>
    </evtInfoEmpregador>
</eSocial>"""
    return xml

def validar_xml(xml_str, caminho_xsd):
    """Valida XML contra XSD"""
    xml_doc = etree.fromstring(xml_str.encode('utf-8'))
    with open(caminho_xsd, 'rb') as f:
        schema_doc = etree.XML(f.read())
    schema = etree.XMLSchema(schema_doc)
    return schema.validate(xml_doc)
