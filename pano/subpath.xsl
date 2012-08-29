<?xml version="1.0"?>

<xsl:stylesheet version="1.0"
		xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

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

</xsl:stylesheet>
