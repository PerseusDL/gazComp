<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:cc="http://creativecommons.org/ns#" xmlns:dcterms="http://purl.org/dc/terms/"
    xmlns:foaf="http://xmlns.com/foaf/0.1/" xmlns:gn="http://www.geonames.org/ontology#"
    xmlns:owl="http://www.w3.org/2002/07/owl#"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
    xmlns:wgs84_pos="http://www.w3.org/2003/01/geo/wgs84_pos#"
    xmlns:my="my:my"
    xmlns="my:my"
    exclude-result-prefixes="#all"
    version="2.0">
    
    <xsl:output encoding="UTF-8" method="text" indent="no"/>
    
    <xsl:variable name="jdictopen">{</xsl:variable>
    <xsl:variable name="jdictclose">}</xsl:variable>
    <xsl:variable name="jlistopen">[</xsl:variable>
    <xsl:variable name="jlistclose">]</xsl:variable>
    
    <namewalker>
        <xwalk key="alternateName" value="name"/>
        <xwalk key="officialName" value="name"/>
        <xwalk key="name" value="name"/>
        <xwalk key="lang" value="lang"/>
    </namewalker>
    
    <relwalker>
        <xwalk key="isDefinedBy" value="alternate"/>
        <xwalk key="license" value="license"/>
        <xwalk key="attributionName" value="author"/>
    </relwalker>
    
    <citowalker>
        <xwalk key="wikipediaArticle" value="citesForInformation"/>
        <xwalk key="seeAlso" value="citesAsRelated"/>
        <xwalk key="attributionURL" value="citesAsDataSource"/>
    </citowalker>
    
    <xsl:template match="rdf:RDF">
        <xsl:value-of select="$jdictopen"/>
        <xsl:apply-templates />
        <xsl:value-of select="$jdictclose"/>
    </xsl:template>
    
    <xsl:template match="gn:Feature">
        
        <!-- type -->
        <xsl:call-template name="jdictstring">
            <xsl:with-param name="key">type</xsl:with-param>
            <xsl:with-param name="value">Feature</xsl:with-param>
        </xsl:call-template>
        <xsl:text>,</xsl:text>
        
        <!-- title of feature -->
        <xsl:apply-templates select="gn:name" mode="title"/>
        <xsl:text>,</xsl:text>
        
        <!-- identifiers and pointers to external information -->
        <xsl:call-template name="jdictstring">
            <xsl:with-param name="key">uri</xsl:with-param>
            <xsl:with-param name="value" select="ancestor-or-self::gn:Feature/@rdf:about"/>
        </xsl:call-template>
        <xsl:text>,</xsl:text>
        <xsl:variable name="aboutdocid" select="rdfs:isDefinedBy/@rdf:resource"/>
        <xsl:call-template name="jdictdict">
            <xsl:with-param name="key">rel</xsl:with-param>
            <xsl:with-param name="value" select="rdfs:isDefinedBy | ancestor::rdf:RDF/foaf:Document[@rdf:about=$aboutdocid][1]/cc:*"/>
            <xsl:with-param name="xwalker">relwalker</xsl:with-param>
        </xsl:call-template>
        <xsl:text>,</xsl:text>
        
        <xsl:call-template name="jlistdict">
            <xsl:with-param name="key">citations</xsl:with-param>
            <xsl:with-param name="value" select="gn:wikipediaArticle | rdfs:seeAlso | ancestor::rdf:RDF/foaf:Document[@rdf:about=$aboutdocid][1]/cc:*"/>
            <xsl:with-param name="xwalker">citowalker</xsl:with-param>
        </xsl:call-template>
        <xsl:text>,</xsl:text>
        
        <!-- names -->
        <xsl:call-template name="jlistdict">
            <xsl:with-param name="key">names</xsl:with-param>
            <xsl:with-param name="value" select="gn:name | gn:alternateName | gn:officialName"/>
            <xsl:with-param name="xwalker">namewalker</xsl:with-param>
        </xsl:call-template>
        <xsl:text>,</xsl:text>
        
        <!-- geometry -->
        <xsl:call-template name="jlistnum">
            <xsl:with-param name="key">reprPoint</xsl:with-param>
            <xsl:with-param name="value" select="wgs84_pos:long | wgs84_pos:lat"/>
        </xsl:call-template>
        
    </xsl:template>
    
    
    <!-- ************ -->
    
    <xsl:template match="*" mode="title">
        <xsl:call-template name="jdictstring">
            <xsl:with-param name="key">title</xsl:with-param>
        </xsl:call-template>
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
    
    <xsl:template name="jlistnum">
        <xsl:param name="key" select="name()"/>
        <xsl:param name="value" select="./*"/>
        
        <xsl:text>"</xsl:text><xsl:value-of select="$key"/><xsl:text>":</xsl:text>
        <xsl:value-of select="$jlistopen"/>
        <xsl:for-each select="$value">
            <xsl:value-of select="."/>
            <xsl:if test="position() != last()">,</xsl:if>
        </xsl:for-each>
        <xsl:value-of select="$jlistclose"/>
    </xsl:template>
    
    <xsl:template name="jdictdict">
        <xsl:param name="key" select="name()"/>
        <xsl:param name="value" select="./*"/>
        <xsl:param name="xwalker"/>
        <xsl:text>"</xsl:text><xsl:value-of select="$key"/><xsl:text>":</xsl:text>
        <xsl:value-of select="$jdictopen"/>
                <xsl:for-each select="$value/(. | @*)[local-name() = document('')/descendant-or-self::*[local-name() = $xwalker]/my:xwalk/@key]">
                    <xsl:call-template name="jdictstring">
                        <xsl:with-param name="key" select="document('')/descendant-or-self::*[local-name() = $xwalker]/my:xwalk[@key = local-name(current())]/@value"/>
                        <xsl:with-param name="value">
                            <xsl:choose>
                                <xsl:when test="normalize-space(.) != ''">
                                    <xsl:value-of select="normalize-space(.)"/>
                                </xsl:when>
                                <xsl:when test="@*[local-name() != document('')/descendant-or-self::*[local-name() = $xwalker]/my:xwalk/@key]">
                                    <xsl:value-of select="normalize-space(@*[local-name() != document('')/descendant-or-self::*[local-name() = $xwalker]/my:xwalk/@key][1])"/>
                                </xsl:when>
                                <xsl:otherwise/>
                            </xsl:choose>
                        </xsl:with-param>
                    </xsl:call-template>
                    <xsl:if test="position() != last()">,</xsl:if>                    
                </xsl:for-each>
        <xsl:value-of select="$jdictclose"/>
    </xsl:template>
    
    <xsl:template name="jlistdict">
        <xsl:param name="key" select="name()"/>
        <xsl:param name="value" select="./*"/>
        <xsl:param name="xwalker"/>
        <xsl:text>"</xsl:text><xsl:value-of select="$key"/><xsl:text>":</xsl:text>
        <xsl:value-of select="$jlistopen"/>
        <xsl:for-each select="$value[local-name() = document('')/descendant-or-self::*[local-name() = $xwalker]/my:xwalk/@key]">
                <xsl:value-of select="$jdictopen"/>
                <xsl:message><xsl:value-of select="local-name()"/></xsl:message>
                <xsl:for-each select="(. | @*)[local-name() = document('')/descendant-or-self::*[local-name() = $xwalker]/my:xwalk/@key]">
                    <xsl:call-template name="jdictstring">
                        <xsl:with-param name="key" select="document('')/descendant-or-self::*[local-name() = $xwalker]/my:xwalk[@key = local-name(current())]/@value"/>
                        <xsl:with-param name="value">
                            <xsl:choose>
                                <xsl:when test="normalize-space(.) != ''">
                                    <xsl:value-of select="normalize-space(.)"/>
                                </xsl:when>
                                <xsl:when test="@*[local-name() != document('')/descendant-or-self::*[local-name() = $xwalker]/my:xwalk/@key]">
                                    <xsl:value-of select="normalize-space(@*[local-name() != document('')/descendant-or-self::*[local-name() = $xwalker]/my:xwalk/@key][1])"/>
                                </xsl:when>
                                <xsl:otherwise/>
                            </xsl:choose>
                        </xsl:with-param>
                    </xsl:call-template>
                    <xsl:if test="position() != last()">,</xsl:if>
                </xsl:for-each>
                <xsl:value-of select="$jdictclose"/>
                <xsl:if test="position() != last()">,</xsl:if>
            </xsl:for-each>
        <xsl:value-of select="$jlistclose"/>
    </xsl:template>
    
</xsl:stylesheet>