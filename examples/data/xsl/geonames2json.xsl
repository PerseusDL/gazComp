<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:cc="http://creativecommons.org/ns#" xmlns:dcterms="http://purl.org/dc/terms/"
    xmlns:foaf="http://xmlns.com/foaf/0.1/" xmlns:gn="http://www.geonames.org/ontology#"
    xmlns:owl="http://www.w3.org/2002/07/owl#"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
    xmlns:wgs84_pos="http://www.w3.org/2003/01/geo/wgs84_pos#"
    exclude-result-prefixes="#all"
    version="2.0">
    
    <xsl:output encoding="UTF-8" method="text" indent="no"/>
    
    <xsl:variable name="jdictopen">{</xsl:variable>
    <xsl:variable name="jdictclose">}</xsl:variable>
    
    <xsl:template match="rdf:RDF">
        <xsl:value-of select="$jdictopen"/>
        <xsl:apply-templates/>
        <xsl:value-of select="$jdictclose"/>
    </xsl:template>
    
    <xsl:template match="gn:Feature">
        <xsl:apply-templates/>
    </xsl:template>
    
    <xsl:template match="gn:name">
        
    </xsl:template>
    
    <xsl:template match="*">
        <xsl:message>No template to match <xsl:value-of select="name()"/> from <xsl:value-of select="namespace-uri()"/></xsl:message>
    </xsl:template>
    
    <xsl:template name="jdictstring">
        <xsl:param name="key" select="name()"/>
        <xsl:param name="value" select="normalize-space(.)"/>
        <xsl:text>"</xsl:text><xsl:value-of select="$key"/><xsl:text>":</xsl:text>
        <xsl:text>"</xsl:text><xsl:value-of select="$value"/><xsl:text>"</xsl:text>
    </xsl:template>
    
</xsl:stylesheet>