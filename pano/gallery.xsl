<?xml version="1.0"?>

<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  
  <xsl:variable name="demo-text" select="document('lang/en.xml')" />
  <xsl:include href="demo-lib/demo-page.xsl" />

  <xsl:template match="/">
    <xsl:variable name="start"
                  select="document(manifest/link[@rel='start']/@href)" />
    <xsl:variable name="base"
                  select="$start//nav/@data-base-uri" />
    <xsl:apply-templates select="manifest">
      <xsl:with-param name="reldir" select="$base" />
    </xsl:apply-templates>
  </xsl:template>
</xsl:stylesheet>
