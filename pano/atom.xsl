<?xml version="1.0"?>

<xsl:stylesheet version="1.0"
                xmlns="http://www.w3.org/2005/Atom"
		xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:param name="host" select="'http://ashimagroup.net'" />
  <xsl:param name="publisher" select="'Ashima Group'" />
  <xsl:param name="email" select="'info@ashimagroup.net'" />
  <xsl:param name="subfeed" select="gallery" />

  <xsl:template name="feed">
    <xsl:param name="self" />
    <feed xmlns="http://www.w3.org/2005/Atom">
      <title><xsl:apply-templates select="title" /></title>
      <author>
        <name><xsl:value-of select="$publisher" /></name>
        <email><xsl:value-of select="$email" /></email>
      </author>
      <link href="{$self}index.atom" rel="self" type="application/atom+xml" />
      <link href="{$self}" rel="alternate" type="text/html" />
      <id><xsl:value-of select="concat($self,'index.atom')" /></id>
      <updated>
        <xsl:for-each select=".//pano">
          <xsl:sort select="pubdate" order="descending" />
          <xsl:if test="position()=1"><xsl:value-of select="pubdate" /></xsl:if>
        </xsl:for-each>
      </updated>
      <xsl:for-each select=".//pano">
        <xsl:sort select="pubdate" order="descending" />
        <xsl:if test="position() &lt; 11">
          <xsl:apply-templates select="." />
        </xsl:if>
      </xsl:for-each>
    </feed>
  </xsl:template>

  <xsl:template name="subpath">
    <xsl:param name="suffix" select="''" />
    <xsl:variable name="name" select="@name" />
    <xsl:choose>
      <xsl:when test="$name">
        <xsl:for-each select="..">
          <xsl:call-template name="subpath">
            <xsl:with-param name="suffix" select="concat($name,'/',$suffix)" />
          </xsl:call-template>
        </xsl:for-each>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$suffix" />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="/">
    <xsl:apply-templates select="$subfeed" />
  </xsl:template>

  <xsl:template match="gallery">
    <xsl:call-template name="feed">
      <xsl:with-param name="self" select="concat($host,@host-base)" />
    </xsl:call-template>
  </xsl:template>

  <xsl:template match="section">
    <xsl:variable name="subpath">
      <xsl:call-template name="subpath" />
    </xsl:variable>
    <xsl:call-template name="feed">
      <xsl:with-param name="self" select="concat($host,/@host-base,$subpath)" />
    </xsl:call-template>
  </xsl:template>

  <xsl:template match="pano">
    <xsl:variable name="subpath">
      <xsl:call-template name="subpath" />
    </xsl:variable>
    <xsl:variable name="self" select="concat($host,/@host-base,$subpath)" />
    <entry>
      <title><xsl:apply-templates select="title" /></title>
      <link rel="alternate" type="text/html" href="{$self}" />
      <id><xsl:value-of select="$self" /></id>
      <updated><xsl:apply-templates select="pubdate" /></updated>
      <content type="xhtml">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <xsl:copy-of select="description/node()" />
        </div>
      </content>
    </entry>
  </xsl:template>
  
</xsl:stylesheet>
